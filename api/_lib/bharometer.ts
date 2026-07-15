/**
 * Dual-publish rendering for Bharometer posts (bharometer.com/blog/).
 * Pure string operations — no I/O. The cron reads/commits via github.ts.
 *
 * The article body is the SAME model output used for the positivafilms.com
 * copy; here it is re-sanitized, its relative internal links rewritten to
 * absolute positivafilms.com URLs, and poured into the Bharometer theme.
 * The bharometer.com copy is the canonical one (the positiva copy points here).
 */

import type { QueuedTopic } from "./queue.js";
import type { ToolOutput } from "./render.js";
import { sanitizeBody, sanitizeLede } from "./sanitize.js";

const SITE = "https://bharometer.com";

export function renderBharometerPost(opts: {
  template: string;
  indexHtml: string;
  sitemap: string;
  llms: string;
  topic: QueuedTopic;
  out: ToolOutput;
  prettyDate: string;
  isoDate: string;
  readTime: number;
}): { postHtml: string; postMd: string; indexHtml: string; sitemap: string; llms: string } {
  const { template, topic, out, prettyDate, isoDate, readTime } = opts;

  const safeBody = rewriteLinksAbsolute(sanitizeBody(out.body_html));
  const safeLede = sanitizeLede(out.lede);

  const replacements: Record<string, string> = {
    "{{TITLE}}": escapeText(topic.title),
    "{{TITLE_JSON}}": escapeAttr(topic.title),
    "{{EXCERPT}}": escapeAttr(out.excerpt),
    "{{KEYWORDS}}": escapeAttr(out.keywords),
    "{{SLUG}}": out.slug,
    "{{DATE}}": prettyDate,
    "{{DATE_ISO}}": isoDate,
    "{{READ_TIME}}": String(readTime),
    "{{LEDE}}": safeLede,
    "{{BODY_HTML}}": safeBody,
    "{{CTA_HEADLINE}}": escapeText(out.cta.headline),
    "{{CTA_BODY}}": escapeText(out.cta.body),
  };

  let postHtml = template;
  for (const [k, v] of Object.entries(replacements)) {
    postHtml = postHtml.replaceAll(k, v);
  }

  const postMd = buildMarkdownTwin({ topic, out, isoDate, bodyHtml: safeBody });
  const indexHtml = insertIndexCard(opts.indexHtml, topic.title, out.slug, out.excerpt);
  const sitemap = insertSitemapEntry(opts.sitemap, out.slug, isoDate);
  const llms = insertLlmsLine(opts.llms, topic.title, out.slug, out.excerpt);

  return { postHtml, postMd, indexHtml, sitemap, llms };
}

/**
 * The body was written for positivafilms.com, where posts live in /posts/.
 * Rewrite its relative internal links so they resolve from bharometer.com:
 *   ../luts.html        -> https://positivafilms.com/luts.html
 *   ../posts/x.html     -> https://positivafilms.com/posts/x.html
 *   posts/x.html        -> https://positivafilms.com/posts/x.html
 * Absolute http(s) links and pure #anchors are left alone.
 */
export function rewriteLinksAbsolute(html: string): string {
  return html
    .replace(/href="\.\.\/([^"]+)"/g, 'href="https://positivafilms.com/$1"')
    .replace(/href="posts\/([^"]+)"/g, 'href="https://positivafilms.com/posts/$1"');
}

/** Insert a card for the new post right below the <!-- BLOG_CARDS --> marker (newest first). */
function insertIndexCard(indexHtml: string, title: string, slug: string, excerpt: string): string {
  const card = `<div class="card">
      <h3><a href="${slug}.html">${escapeText(title)}</a></h3>
      <p>${escapeText(excerpt)}</p>
    </div>`;
  if (!indexHtml.includes("<!-- BLOG_CARDS -->")) {
    throw new Error("blog/index.html is missing the <!-- BLOG_CARDS --> marker");
  }
  return indexHtml.replace("<!-- BLOG_CARDS -->", `<!-- BLOG_CARDS -->\n\n    ${card}`);
}

function insertSitemapEntry(sitemap: string, slug: string, isoDate: string): string {
  const entry = `  <url>
    <loc>${SITE}/blog/${slug}.html</loc>
    <lastmod>${isoDate}</lastmod>
    <priority>0.7</priority>
  </url>
`;
  return sitemap.replace(/<\/urlset>/, `${entry}</urlset>`);
}

/** Add the post under the "## Blog" section of llms.txt (newest first, after the intro paragraph). */
function insertLlmsLine(llms: string, title: string, slug: string, excerpt: string): string {
  const line = `- [${title}](${SITE}/blog/${slug}.html): ${excerpt}`;
  const re = /(## Blog\n\n[^\n]+\n\n)/;
  if (!re.test(llms)) return llms; // section missing — skip rather than corrupt
  return llms.replace(re, `$1${line}\n`);
}

/** Machine-readable markdown twin of the post (same pattern as the guides' .md files). */
function buildMarkdownTwin(opts: {
  topic: QueuedTopic;
  out: ToolOutput;
  isoDate: string;
  bodyHtml: string;
}): string {
  const { topic, out, isoDate, bodyHtml } = opts;
  const bodyMd = htmlToMarkdown(bodyHtml);
  return `# ${topic.title}

> ${out.excerpt}

Published: ${isoDate} · Bharometer Blog · ${SITE}/blog/${out.slug}.html

${decodeEntities(stripTags(out.lede))}

${bodyMd}

---

Bharometer is a free fuel, mileage and running-cost tracker for India (iPhone). ${SITE}
`;
}

/** Small, dependency-free HTML → markdown conversion good enough for LLM/agent consumption. */
export function htmlToMarkdown(html: string): string {
  let s = html;

  // Promo blocks don't belong in the machine-readable twin.
  s = s.replace(/<div class="inline-cta">[\s\S]*?<\/div>\s*<\/div>/g, "");
  s = s.replace(/<div class="inline-cta">[\s\S]*?<\/div>/g, "");

  s = s.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, (_, c) => "\n```\n" + decodeEntities(c) + "\n```\n");
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, (_, c) => `\n## ${clean(c)}\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, (_, c) => `\n### ${clean(c)}\n`);
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/g, (_, c) => `\n#### ${clean(c)}\n`);
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_, c) => `- ${clean(c)}\n`);
  s = s.replace(/<\/?(ul|ol)[^>]*>/g, "\n");
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g, (_, c) => `\n> ${clean(c)}\n`);
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/g, (_, c) => `\n${clean(c)}\n`);
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/g, "**$2**");
  s = s.replace(/<(em|i)>([\s\S]*?)<\/\1>/g, "*$2*");
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/g, (_, c) => "`" + decodeEntities(c) + "`");
  s = s.replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, text) => `[${clean(text)}](${href})`);
  s = s.replace(/<hr\s*\/?>/g, "\n---\n");
  s = stripTags(s);
  s = decodeEntities(s);
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

function clean(s: string): string {
  return decodeEntities(stripTags(s)).replace(/\s+/g, " ").trim();
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeText(s).replace(/"/g, "&quot;");
}
