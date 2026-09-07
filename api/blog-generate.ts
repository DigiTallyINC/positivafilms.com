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
import { readFile, commitFiles, fileExists, BHAROMETER_REPO, GYAANDAILY_REPO } from "./_lib/github.js";
import { renderBharometerPost } from "./_lib/bharometer.js";
import { parseQueue, markPublished, type QueuedTopic, type PublishedEntry } from "./_lib/queue.js";
import {
  systemPrompt,
  userPrompt,
  gyaanUserPrompt,
  PUBLISH_TOOL,
  GYAAN_PUBLISH_TOOL,
  SLOP_PHRASES,
} from "./_lib/prompt.js";
import {
  renderGyaanDailyPosts,
  pickVerse,
  postUrl,
  postPath,
  indexPath,
  LANGS,
  type LangCode,
  type VerseRow,
  type GyaanOutput,
} from "./_lib/gyaandaily.js";
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

  // 3. Call Anthropic with structured tool output.
  // Up to 2 attempts: if validation fails (usually a stray em-dash or slop
  // phrase deep in a long technical post), retry once with the error fed back.
  // Failing hard here used to strand the queue for days (Jul 10-15, 2026).
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Gyaan Daily posts are ROUTED, not mirrored: they publish to gyaandaily.positivafilms.com
  // and positivafilms.com never gains a copy. Different tool, different repo, different
  // commit order — so it forks here rather than threading conditionals through the rest.
  if (next.product === "gyaandaily") {
    return await runGyaanDaily({ anthropic, agentMd, queueMd, topic: next, published, isoDate, istNow });
  }

  const baseUserPrompt = userPrompt({
    topic: next,
    publishedDescending: published,
    isoDate,
    prettyDate,
  });

  let out: ToolOutput | null = null;
  let lastError = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    const content = attempt === 1
      ? baseUserPrompt
      : `${baseUserPrompt}\n\nIMPORTANT: your previous attempt was REJECTED by automated validation with this error:\n"${lastError}"\nRegenerate the complete post and fix the problem. Re-read the style bans carefully.`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: systemPrompt(agentMd),
      tools: [PUBLISH_TOOL as unknown as Anthropic.Tool],
      tool_choice: { type: "tool", name: "publish_post" },
      messages: [{ role: "user", content }],
    });

    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      lastError = `Model did not call publish_post tool. Stop reason: ${response.stop_reason}`;
      continue;
    }

    const candidate = toolUse.input as ToolOutput;
    // Deterministic style repair BEFORE validation: em-dashes are a hard site-wide
    // ban but the model occasionally slips one in a long post; replace rather than fail.
    sanitizeEmDashes(candidate);

    try {
      validateOutput(candidate);
      // Product topics must sell their own product, not a LUT pack.
      if (next.product && candidate.cta.pack !== next.product) {
        throw new Error(`Topic features product "${next.product}" but cta.pack is "${candidate.cta.pack}"`);
      }
      out = candidate;
      break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(`[blog-generate] attempt ${attempt} failed validation: ${lastError}`);
    }
  }
  if (!out) {
    throw new Error(`Both generation attempts failed validation. Last error: ${lastError}`);
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
  let postHtml = renderPost({
    template,
    topic: next,
    out,
    prettyDate,
    isoDate,
    readTime,
  });

  // Bharometer posts are dual-published; bharometer.com owns the canonical.
  const isBharometer = next.product === "bharometer";
  if (isBharometer) {
    postHtml = postHtml.replace(
      `<link rel="canonical" href="https://positivafilms.com/posts/${out.slug}.html" />`,
      `<link rel="canonical" href="https://bharometer.com/blog/${out.slug}.html" />`,
    );
  }

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

  // 5. Commit all changes atomically (positivafilms.com is the primary publish)
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

  // 6. Dual-publish Bharometer posts to bharometer.com (canonical copy).
  // A failure here must not undo the primary publish — report it instead.
  let bharometer: { ok: boolean; commit?: string; error?: string } | undefined;
  if (isBharometer) {
    try {
      const [bhTemplate, bhIndex, bhSitemap, bhLlms] = await Promise.all([
        readFile("content/bharometer-post-template.html"),
        readFile("landing/blog/index.html", BHAROMETER_REPO),
        readFile("landing/sitemap.xml", BHAROMETER_REPO),
        readFile("landing/llms.txt", BHAROMETER_REPO),
      ]);
      const bh = renderBharometerPost({
        template: bhTemplate,
        indexHtml: bhIndex,
        sitemap: bhSitemap,
        llms: bhLlms,
        topic: next,
        out,
        prettyDate,
        isoDate,
        readTime,
      });
      const bhCommit = await commitFiles({
        target: BHAROMETER_REPO,
        message: `blog: ${next.title}`,
        files: [
          { path: `landing/blog/${out.slug}.html`, content: bh.postHtml },
          { path: `landing/blog/${out.slug}.md`, content: bh.postMd },
          { path: "landing/blog/index.html", content: bh.indexHtml },
          { path: "landing/sitemap.xml", content: bh.sitemap },
          { path: "landing/llms.txt", content: bh.llms },
        ],
      });
      bharometer = { ok: true, commit: bhCommit.commitUrl };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[blog-generate] bharometer dual-publish failed", message);
      bharometer = { ok: false, error: message };
    }
  }

  return {
    ok: true,
    slug: out.slug,
    title: next.title,
    category: next.category,
    wordCount,
    readTime,
    commit: commitResult.commitUrl,
    bharometer,
    remainingQueued: totalQueued - 1,
    strippedLinks: stripped,
  };
}

/**
 * Deterministic style repair: replace any em-dash the model slipped in with
 * ", " (site-wide style ban). Mutates the tool output in place. "--" inside
 * code samples is legitimate and handled separately in validateOutput.
 */
function sanitizeEmDashes(out: ToolOutput): void {
  const fix = (s: string) => s
    .replace(/\s*(?:—|&mdash;|&#8212;|&#x2014;)\s*/g, ", ")
    .replace(/,\s*,/g, ",");
  out.excerpt = fix(out.excerpt ?? "");
  out.lede = fix(out.lede ?? "");
  out.body_html = fix(out.body_html ?? "");
  if (out.cta) {
    out.cta.headline = fix(out.cta.headline ?? "");
    out.cta.sub = fix(out.cta.sub ?? "");
    out.cta.body = fix(out.cta.body ?? "");
  }
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
  if (!out.cta || !["wedding", "travel", "bundle", "pastekaro", "bharometer", "gyaandaily", "supergrade", "clipengine"].includes(out.cta.pack)) {
    throw new Error("CTA pack must be wedding|travel|bundle|pastekaro|bharometer|gyaandaily|supergrade|clipengine");
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
    if (!value) continue;
    // "--" is legitimate inside code samples (CLI flags, CSS custom properties,
    // DCTL) — check prose only. Real em-dashes are auto-repaired upstream.
    const prose = value.replace(/<pre\b[\s\S]*?<\/pre>/gi, "").replace(/<code\b[\s\S]*?<\/code>/gi, "");
    if (emDashRe.test(prose)) {
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


/* ────────────────────────────────────────────────────────────────────────────
 * Gyaan Daily: one verse, three languages, and a repo that is not this one.
 *
 * ⭐ THE COMMIT ORDER IS THE REVERSE OF THE BHAROMETER FLOW, DELIBERATELY.
 * Bharometer marks the queue published in the same commit as the positiva post
 * and mirrors afterwards. That is safe because positiva already holds the
 * article if the mirror fails. Here there is no positiva copy: if the gyaan
 * commit fails, the post exists nowhere. So:
 *
 *   1. commit the post to gyaan-daily FIRST
 *   2. only on success, commit content/queue.md to positiva, alone
 *   3. on failure, leave the queue untouched and return the error
 *
 * Backwards, a failed run silently eats the topic. The cost of this order is the
 * opposite hazard: a run that commits the post and then fails to mark the queue
 * would republish the same topic on the next fire. That is what the slug guard
 * in step 3 is for.
 * ──────────────────────────────────────────────────────────────────────────── */

const VERSE_LANGUAGE_ROTATION = ["ta", "hi", "sa"] as const;

async function runGyaanDaily(opts: {
  anthropic: Anthropic;
  agentMd: string;
  queueMd: string;
  topic: QueuedTopic;
  published: PublishedEntry[];
  isoDate: string;
  istNow: Date;
}) {
  const { anthropic, agentMd, queueMd, topic, published, isoDate, istNow } = opts;

  // Which language the VERSE is drawn from. The prose is always all three; this
  // only decides which catalogue the line itself comes from. An explicit
  // `language:` on the queue line wins; otherwise it rotates ta -> hi -> sa so that
  // no single tradition dominates the blog.
  const gyaanPublished = published.filter((p) => p.product === "gyaandaily");
  const verseLang =
    topic.language && (VERSE_LANGUAGE_ROTATION as readonly string[]).includes(topic.language)
      ? topic.language
      : VERSE_LANGUAGE_ROTATION[gyaanPublished.length % VERSE_LANGUAGE_ROTATION.length];

  // 1. Live state. Templates come from THIS repo; everything else from the site's repo.
  const [tplEn, tplHi, tplTa, idxEn, idxHi, idxTa, sitemap, llms, poolJson] = await Promise.all([
    readFile("content/gyaandaily-post-en.html"),
    readFile("content/gyaandaily-post-hi.html"),
    readFile("content/gyaandaily-post-ta.html"),
    readFile(indexPath("en"), GYAANDAILY_REPO),
    readFile(indexPath("hi"), GYAANDAILY_REPO),
    readFile(indexPath("ta"), GYAANDAILY_REPO),
    readFile("web/sitemap.xml", GYAANDAILY_REPO),
    readFile("web/llms.txt", GYAANDAILY_REPO),
    readFile("web/assets/blog-verses-" + verseLang + ".json", GYAANDAILY_REPO),
  ]);

  const templates = { en: tplEn, hi: tplHi, ta: tplTa } as Record<LangCode, string>;
  const indexes = { en: idxEn, hi: idxHi, ta: idxTa } as Record<LangCode, string>;

  const pool = JSON.parse(poolJson).quotes as VerseRow[];
  const verse = pickVerse(
    pool,
    gyaanPublished.map((p) => p.verse).filter((v): v is string => !!v),
  );

  // The stylesheet href carries a content hash. Read it off the live index; a post
  // shipped with a stale hash renders half-built.
  const cssV = /site\.css\?v=([a-f0-9]+)/.exec(idxEn)?.[1];
  if (!cssV) throw new Error("could not read the site.css content hash from the live blog index");

  // Dates, localised by ICU rather than by anyone typing a month name in Devanagari.
  const prettyDate = {
    en: formatPrettyDate(istNow),
    hi: formatLocalDate(istNow, "hi-IN"),
    ta: formatLocalDate(istNow, "ta-IN"),
  } as Record<LangCode, string>;

  // 2. Generate. Two attempts, same as the positiva path.
  const base = gyaanUserPrompt({ topic, verse, prettyDate: prettyDate.en, isoDate });
  let out: GyaanOutput | null = null;
  let lastError = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    const content =
      attempt === 1
        ? base
        : base +
          "\n\nIMPORTANT: your previous attempt was REJECTED by automated validation with this error:\n\"" +
          lastError +
          "\"\nRegenerate all three languages and fix the problem.";

    const response = await anthropic.messages.create({
      model: MODEL,
      // Three languages of prose, not one. Sized up from the positiva path's 8K.
      max_tokens: 24000,
      system: systemPrompt(agentMd),
      tools: [GYAAN_PUBLISH_TOOL as unknown as Anthropic.Tool],
      tool_choice: { type: "tool", name: "publish_gyaandaily_post" },
      messages: [{ role: "user", content }],
    });

    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      lastError = "Model did not call publish_gyaandaily_post. Stop reason: " + response.stop_reason;
      continue;
    }

    const candidate = toolUse.input as GyaanOutput;
    for (const lang of LANGS) {
      const copy = candidate[lang];
      if (copy && typeof copy.body_html === "string") copy.body_html = stripBannedDashes(copy.body_html);
    }

    try {
      validateGyaanOutput(candidate, verse);
      out = candidate;
      break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn("[blog-generate] gyaandaily attempt " + attempt + " failed validation: " + lastError);
    }
  }
  if (!out) throw new Error("Both Gyaan Daily attempts failed validation. Last error: " + lastError);
  const result: GyaanOutput = out;

  // 3. Idempotency guard. If the English post already exists, a previous run got as
  // far as committing and then failed before marking the queue. Publishing again
  // would overwrite a live post and add a second index card. Advance the queue and stop.
  if (await fileExists(postPath("en", result.slug), GYAANDAILY_REPO)) {
    const repaired = markPublished({ md: queueMd, topic, slug: result.slug, isoDate, verseId: verse.id });
    const fix = await commitFiles({
      message: "blog: queue catch-up for " + result.slug + " (post was already live)",
      files: [{ path: "content/queue.md", content: repaired }],
    });
    return {
      ok: true,
      site: "gyaandaily",
      alreadyPublished: true,
      slug: result.slug,
      queueCommit: fix.commitUrl,
      note: "the post already existed in gyaan-daily; only the queue was advanced",
    };
  }

  // 4. Render all three languages.
  const rendered = renderGyaanDailyPosts({
    templates,
    indexes,
    sitemap,
    llms,
    out: result,
    verse,
    prettyDate,
    isoDate,
    cssV,
  });

  // 5. Commit to gyaan-daily FIRST. Eight files, one commit.
  const gyaanCommit = await commitFiles({
    target: GYAANDAILY_REPO,
    message: "blog: " + result.en.title,
    files: [
      ...rendered.posts.map((p) => ({ path: p.path, content: p.html })),
      ...LANGS.map((l) => ({ path: indexPath(l), content: rendered.indexes[l] })),
      { path: "web/sitemap.xml", content: rendered.sitemap },
      { path: "web/llms.txt", content: rendered.llms },
    ],
  });

  // 6. Only now advance the queue, in its own commit to this repo.
  const newQueue = markPublished({ md: queueMd, topic, slug: result.slug, isoDate, verseId: verse.id });
  const queueCommit = await commitFiles({
    message: "blog: " + result.en.title + " (queue)",
    files: [{ path: "content/queue.md", content: newQueue }],
  });

  return {
    ok: true,
    site: "gyaandaily",
    slug: result.slug,
    verse: { id: verse.id, language: verseLang, citation: verse.citation },
    urls: LANGS.map((l) => postUrl(l, result.slug)),
    gyaanCommit: gyaanCommit.commitUrl,
    queueCommit: queueCommit.commitUrl,
  };
}

/** Month names in Hindi and Tamil come from ICU, never from anyone typing them. */
function formatLocalDate(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(d);
}

/**
 * The character bans are language-agnostic, so unlike copy-sweep.py's word bans
 * these run over all three bodies. This is the gate that killed the cron for five
 * days in July, so it repairs rather than rejects, and validation re-checks after.
 */
export function stripBannedDashes(html: string): string {
  return html
    .replace(/\s*(?:—|&mdash;)\s*/g, ": ")
    .replace(/\s*(?:–|&ndash;)\s*/g, " to ")
    .replace(/\s*(?:→|&rarr;)\s*/g, " then ");
}

export function validateGyaanOutput(out: GyaanOutput, verse: VerseRow): void {
  if (!out || !out.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(out.slug)) {
    throw new Error('slug must be lowercase-hyphenated, got "' + (out && out.slug) + '"');
  }
  if (out.slug.length > 70) throw new Error("slug is " + out.slug.length + " chars, max 70");

  for (const lang of LANGS) {
    const copy = out[lang];
    if (!copy) throw new Error("missing the " + lang + " copy entirely");
    for (const field of ["title", "excerpt", "body_html"] as const) {
      if (!copy[field] || !String(copy[field]).trim()) throw new Error(lang + "." + field + " is empty");
    }

    // ⛔ The verse is spliced by the renderer. A second copy in the prose means the
    // model retyped Indic text, which is exactly how rows get silently damaged.
    for (const field of ["text", "transliteration", "citation"] as const) {
      const needle = verse[field].trim();
      if (needle.length > 12 && copy.body_html.includes(needle)) {
        throw new Error(
          lang + ".body_html reproduces the verse's " + field + "; it is spliced in automatically, do not restate it",
        );
      }
    }

    if (/[—–→]/.test(copy.body_html)) {
      throw new Error(lang + ".body_html still contains a banned dash or arrow after repair");
    }

    // The stylesheet has no rule for any of these, so they render as unstyled debris.
    const forbidden = copy.body_html.match(/<(blockquote|pre|figure|img|table)\b/i);
    if (forbidden) {
      throw new Error(lang + ".body_html uses <" + forbidden[1] + ">, which this site has no stylesheet rule for");
    }

    const links = copy.body_html.match(/href="([^"]*)"/g) || [];
    if (links.length !== 1 || !links[0].includes("/#getapp")) {
      throw new Error(lang + ".body_html must contain exactly one link, to /#getapp; found " + links.length);
    }

    const lower = copy.body_html.toLowerCase();
    for (const phrase of SLOP_PHRASES) {
      if (lower.includes(phrase.toLowerCase())) {
        throw new Error(lang + '.body_html contains the banned phrase "' + phrase + '"');
      }
    }
  }
}
