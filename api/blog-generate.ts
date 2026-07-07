/**
 * Vercel Cron — autonomous blog publisher.
 *
 * Fires Mon/Wed/Fri at 04:07 UTC (vercel.json). Each fire:
 *   1. Reads content/queue.md, content/AGENT.md, content/post-template.html from GitHub
 *   2. Picks the first `[ ]` topic in the queue
 *   3. Calls Anthropic API with tool_use to get a structured post
 *   4. Renders the post HTML, updates blog.html / sitemap.xml / rss.xml / queue.md
 *   5. Commits all changes via the GitHub Trees API in one commit
 *   6. Returns JSON with the commit URL and slug
 *
 * Env: ANTHROPIC_API_KEY, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH, CRON_SECRET
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { readFile, commitFiles } from "./_lib/github.js";
import { parseQueue, markPublished } from "./_lib/queue.js";
import {
  systemPrompt,
  userPrompt,
  PUBLISH_TOOL,
  SLOP_PHRASES,
} from "./_lib/prompt.js";
import {
  renderPost,
  updateBlogHtml,
  updateSitemap,
  updateRss,
  formatPrettyDate,
  formatRfc822,
  type ToolOutput,
} from "./_lib/render.js";

export const config = { maxDuration: 300 };

const MODEL = "claude-sonnet-4-6";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth — Vercel cron sends "Authorization: Bearer ${CRON_SECRET}"
  const auth = req.headers.authorization;
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const result = await runOnce();
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[blog-generate]", message, err);
    res.status(500).json({ error: message });
  }
}

async function runOnce() {
  // 1. Pull live state from GitHub
  const [queueMd, agentMd, template, blogHtml, sitemap, rss] = await Promise.all([
    readFile("content/queue.md"),
    readFile("content/AGENT.md"),
    readFile("content/post-template.html"),
    readFile("blog.html"),
    readFile("sitemap.xml"),
    readFile("rss.xml"),
  ]);

  const { next, published, totalQueued } = parseQueue(queueMd);
  if (!next) {
    return { ok: false, reason: "queue_empty", totalQueued };
  }

  // Queue titles are human-edited: defensively strip em-dashes (site-wide style ban).
  next.title = next.title.replace(/\s*(?:—|&mdash;)\s*/g, ": ");

  // 2. Date math (IST publication day)
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);
  const isoDate = istNow.toISOString().slice(0, 10);
  const prettyDate = formatPrettyDate(istNow);
  const rfc822Date = formatRfc822(now);

  // 3. Call Anthropic with structured tool output
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: systemPrompt(agentMd),
    tools: [PUBLISH_TOOL as unknown as Anthropic.Tool],
    tool_choice: { type: "tool", name: "publish_post" },
    messages: [
      {
        role: "user",
        content: userPrompt({
          topic: next,
          publishedDescending: published,
          isoDate,
          prettyDate,
        }),
      },
    ],
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error(`Model did not call publish_post tool. Stop reason: ${response.stop_reason}`);
  }

  const out = toolUse.input as ToolOutput;
  validateOutput(out);

  // Product topics must sell their own product, not a LUT pack.
  if (next.product && out.cta.pack !== next.product) {
    throw new Error(`Topic features product "${next.product}" but cta.pack is "${out.cta.pack}"`);
  }

  // Guard: remove any internal post link the model invented (slug that isn't a real
  // published post). Prevents the cron from ever shipping a broken "related post" link.
  const knownSlugs = new Set<string>(published.map((p) => p.slug));
  knownSlugs.add(out.slug);
  const { html: cleanedBody, stripped } = sanitizeInternalPostLinks(out.body_html, knownSlugs);
  if (stripped.length) {
    console.warn(`[blog-generate] stripped ${stripped.length} link(s) to non-existent posts: ${stripped.join(", ")}`);
    out.body_html = cleanedBody;
  }

  // Compute read time from rendered word count
  const wordCount = out.body_html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(3, Math.round(wordCount / 230));

  // 4. Render
  const postHtml = renderPost({
    template,
    topic: next,
    out,
    prettyDate,
    isoDate,
    readTime,
  });

  // Sanity: no unresolved placeholders
  const unresolved = postHtml.match(/\{\{[A-Z_]+\}\}/g);
  if (unresolved) {
    throw new Error(`Unresolved placeholders in post: ${unresolved.join(", ")}`);
  }

  const newBlogHtml = updateBlogHtml({
    blogHtml,
    topic: next,
    out,
    prettyDate,
    readTime,
  });

  const newSitemap = updateSitemap({ sitemap, slug: out.slug, isoDate });
  const newRss = updateRss({
    rss,
    topic: next,
    out,
    rfc822Date,
    categoryLabel: out.category_label,
  });

  const newQueue = markPublished({
    md: queueMd,
    topic: next,
    slug: out.slug,
    isoDate,
  });

  // 5. Commit all changes atomically
  const commitResult = await commitFiles({
    message: `blog: ${next.title}`,
    files: [
      { path: `posts/${out.slug}.html`, content: postHtml },
      { path: "blog.html", content: newBlogHtml },
      { path: "sitemap.xml", content: newSitemap },
      { path: "rss.xml", content: newRss },
      { path: "content/queue.md", content: newQueue },
    ],
  });

  return {
    ok: true,
    slug: out.slug,
    title: next.title,
    category: next.category,
    wordCount,
    readTime,
    commit: commitResult.commitUrl,
    remainingQueued: totalQueued - 1,
    strippedLinks: stripped,
  };
}

/**
 * Remove internal post links whose target slug is not a real published post.
 * The model occasionally invents a "related post" filename; rather than ship a 404,
 * we unwrap the link to its visible text (the sentence stays, the bad link goes).
 * Matches both `posts/slug.html` and `../posts/slug.html`, with optional #anchor.
 */
function sanitizeInternalPostLinks(
  html: string,
  knownSlugs: Set<string>
): { html: string; stripped: string[] } {
  const stripped: string[] = [];
  const re = /<a\b[^>]*?href="(?:\.\.\/)?posts\/([a-z0-9-]+)\.html(?:#[^"]*)?"[^>]*>([\s\S]*?)<\/a>/gi;
  const cleaned = html.replace(re, (match, slug: string, inner: string) => {
    if (knownSlugs.has(slug)) return match;
    stripped.push(slug);
    return inner;
  });
  return { html: cleaned, stripped };
}

function validateOutput(out: ToolOutput): void {
  if (!out.slug || !/^[a-z0-9][a-z0-9-]+$/.test(out.slug)) {
    throw new Error(`Invalid slug: ${out.slug}`);
  }
  if (!out.body_html || out.body_html.length < 2000) {
    throw new Error(`Body too short: ${out.body_html?.length || 0} chars`);
  }
  if (!out.body_html.includes('class="inline-cta"')) {
    throw new Error("Body missing required inline-cta block");
  }
  if (out.body_html.toLowerCase().includes("positiva films") || out.body_html.toLowerCase().includes("at positiva")) {
    throw new Error("Body must not contain brand mascot framing ('Positiva Films', 'at Positiva')");
  }
  if (!out.cta || !["wedding", "travel", "bundle", "pastekaro", "bharometer", "supergrade", "clipengine"].includes(out.cta.pack)) {
    throw new Error("CTA pack must be wedding|travel|bundle|pastekaro|bharometer|supergrade|clipengine");
  }

  const emDashRe = /—|&mdash;|--/;
  const checkFields: Array<[string, string | undefined]> = [
    ["excerpt", out.excerpt],
    ["lede", out.lede],
    ["body_html", out.body_html],
    ["cta.headline", out.cta?.headline],
    ["cta.sub", out.cta?.sub],
    ["cta.body", out.cta?.body],
  ];
  for (const [name, value] of checkFields) {
    if (value && emDashRe.test(value)) {
      throw new Error(`Em-dash detected in ${name}: replace with comma, colon, semicolon, period, or parentheses.`);
    }
  }

  // AI-slop gate: fail loudly rather than publish machine-sounding copy.
  for (const [name, value] of checkFields) {
    if (!value) continue;
    const lower = value.toLowerCase();
    for (const phrase of SLOP_PHRASES) {
      if (lower.includes(phrase.toLowerCase())) {
        throw new Error(`Banned slop phrase "${phrase}" detected in ${name}. Rewrite without it.`);
      }
    }
  }

  const imgRe = /<img\b[^>]*>/gi;
  for (const tag of out.body_html.match(imgRe) || []) {
    if (!/\balt\s*=/.test(tag)) {
      throw new Error(`Image tag missing alt attribute: ${tag.slice(0, 120)}`);
    }
    if (!/\bloading\s*=\s*["']?lazy/i.test(tag)) {
      throw new Error(`Image tag missing loading="lazy": ${tag.slice(0, 120)}`);
    }
  }
}
