/**
 * Rendering for Gyaan Daily posts (gyaandaily.positivafilms.com).
 * Pure string operations — no I/O. The cron reads/commits via github.ts.
 *
 * ⛔ THIS IS ROUTING, NOT MIRRORING. Unlike Bharometer, positivafilms.com never
 * gains a copy of a Gyaan Daily post. If the commit to gyaan-daily fails, the post
 * exists nowhere — which is why blog-generate.ts commits HERE FIRST and only marks
 * the queue afterwards.
 *
 * Each post publishes three times, once per language, as an hreflang cluster
 * sharing one slug:
 *   /blog/<slug>/          (en)
 *   /hindi/blog/<slug>/    (hi)
 *   /tamil/blog/<slug>/    (ta)
 *
 * ⛔ THE VERSE IS SPLICED, NEVER GENERATED. `text`, `transliteration`, `author`
 * and `citation` are copied out of the pool row into the HTML by code here. The
 * model receives them as immutable context and must never reproduce them.
 * web/CLAUDE.md in the Gyaan Daily repo: "Nobody retypes Indic. Eighteen Tamil
 * rows in this project were once damaged by transcribing them by eye."
 */

import { sanitizeBody } from "./sanitize.js";

export const SITE = "https://gyaandaily.positivafilms.com";

export type LangCode = "en" | "hi" | "ta";
export const LANGS: readonly LangCode[] = ["en", "hi", "ta"] as const;

/** Where each language's tree lives, relative to the repo's web/ root. */
const TREE: Record<LangCode, string> = { en: "blog", hi: "hindi/blog", ta: "tamil/blog" };

/** One pool row from web/assets/blog-verses-<lang>.json. */
export type VerseRow = {
  id: string;
  language: string;
  text: string;
  transliteration: string;
  translation: string;
  meaning: string;
  application: string;
  author: string;
  citation: string;
  tags?: string[];
};

/** The model's prose for one language. Everything here is written, not spliced. */
export type LangCopy = {
  title: string;
  /** Meta description / index card / llms.txt one-liner. */
  excerpt: string;
  body_html: string;
};

export type GyaanOutput = {
  slug: string;
  en: LangCopy;
  hi: LangCopy;
  ta: LangCopy;
};

export type RenderedPost = { path: string; html: string; lang: LangCode };

/** Public URL of a post in one language. Trailing slash: the site sets trailingSlash. */
export function postUrl(lang: LangCode, slug: string): string {
  return `${SITE}/${TREE[lang]}/${slug}/`;
}

/** Repo path of a post in one language. `web/` prefix: the site is the repo's subfolder. */
export function postPath(lang: LangCode, slug: string): string {
  return `web/${TREE[lang]}/${slug}/index.html`;
}

export function indexPath(lang: LangCode): string {
  return `web/${TREE[lang]}/index.html`;
}

/**
 * Pick the first pool row this blog has not used yet.
 *
 * The pool is already an even stride across the whole catalogue (see
 * tools/build_blog_verses.py in the Gyaan Daily repo), so taking it in order does
 * not bunch the picks at one end of a text.
 */
export function pickVerse(pool: VerseRow[], usedIds: Iterable<string>): VerseRow {
  const used = new Set(usedIds);
  const row = pool.find((q) => !used.has(q.id));
  if (!row) {
    throw new Error(
      `every verse in the pool (${pool.length} rows) has been published; rebuild the pool with a larger cap`,
    );
  }
  return row;
}

/**
 * The verse block, spliced from the pool row.
 *
 * Markup copied from web/blog/the-note-under-the-verse/index.html:45-48 — the site's
 * stylesheet has no blockquote rule, no pull-quote class and no <figure>, so an
 * inline-styled <p> is the only thing that renders correctly.
 */
export function verseBlock(v: VerseRow): string {
  return `  <p style="border-left:2px solid var(--primary);padding-left:20px;font-family:var(--serif);
  font-size:1.15rem;color:var(--text)">${escapeText(v.text)}<br>
  <span style="font-size:0.95rem;color:var(--text-muted);font-family:var(--sans)">${escapeText(v.transliteration)}</span><br>
  <span style="font-size:0.9rem;color:var(--text-muted);font-family:var(--sans)">${escapeText(v.author)} · ${escapeText(v.citation)}</span></p>`;
}

export function renderGyaanDailyPosts(opts: {
  /** template per language, from content/gyaandaily-post-<lang>.html */
  templates: Record<LangCode, string>;
  /** blog/index.html per language, as fetched from the repo */
  indexes: Record<LangCode, string>;
  sitemap: string;
  llms: string;
  out: GyaanOutput;
  verse: VerseRow;
  /** Human date, already formatted per language by the caller. */
  prettyDate: Record<LangCode, string>;
  isoDate: string;
  /** The site.css content hash, read off the live index — never hardcoded. */
  cssV: string;
}): {
  posts: RenderedPost[];
  indexes: Record<LangCode, string>;
  sitemap: string;
  llms: string;
} {
  const { templates, out, verse, prettyDate, isoDate, cssV } = opts;
  const slug = out.slug;

  const urls: Record<LangCode, string> = {
    en: postUrl("en", slug),
    hi: postUrl("hi", slug),
    ta: postUrl("ta", slug),
  };

  const block = verseBlock(verse);
  const posts: RenderedPost[] = [];
  const indexes = { ...opts.indexes };

  for (const lang of LANGS) {
    const copy = out[lang];
    // The verse leads. Everything the model wrote follows it.
    const body = `${block}\n\n${sanitizeBody(copy.body_html)}`;

    const replacements: Record<string, string> = {
      "{{TITLE}}": escapeText(copy.title),
      "{{DESCRIPTION}}": escapeAttr(copy.excerpt),
      "{{CANONICAL}}": urls[lang],
      "{{URL_EN}}": urls.en,
      "{{URL_HI}}": urls.hi,
      "{{URL_TA}}": urls.ta,
      "{{DATE}}": escapeText(prettyDate[lang]),
      "{{CSS_V}}": cssV,
      "{{BODY}}": body,
    };

    let html = templates[lang];
    for (const [k, v] of Object.entries(replacements)) html = html.replaceAll(k, v);

    const leftover = html.match(/\{\{[A-Z_]+\}\}/);
    if (leftover) {
      throw new Error(`gyaandaily ${lang} template still holds ${leftover[0]} after substitution`);
    }
    assertChromeSafe(html, lang);

    posts.push({ lang, path: postPath(lang, slug), html });
    indexes[lang] = insertIndexCard(indexes[lang], lang, copy.title, copy.excerpt, slug, prettyDate[lang]);
  }

  return {
    posts,
    indexes,
    sitemap: insertSitemapEntries(opts.sitemap, slug, isoDate),
    llms: insertLlmsLine(opts.llms, out.en.title, slug),
  };
}

/**
 * The chrome stamper (tools/build_blog_chrome.py) runs file-wide regexes with re.S:
 * `<meta name="theme-color".*?</head>` and `<footer class="footer">.*?</body>`.
 * If any of those strings appears INSIDE <main>, the stamper silently deletes
 * everything from there to the end of the document. Catch it here, where the error
 * is loud, rather than after a post has shipped with half its article missing.
 */
export function assertChromeSafe(html: string, lang: string): void {
  const start = html.indexOf('<main id="main"');
  const end = html.indexOf("</main>");
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`gyaandaily ${lang}: rendered post has no <main> region`);
  }
  const main = html.slice(start, end);
  for (const needle of ['<meta name="theme-color"', "</head>", '<footer class="footer"', "</body>"]) {
    if (main.includes(needle)) {
      throw new Error(
        `gyaandaily ${lang}: '${needle}' appears inside <main>; the chrome stamper would delete the rest of the post`,
      );
    }
  }
}

/**
 * Insert a card directly below the <!-- BLOG_CARDS --> marker (newest first).
 * The marker sits at column 0 and must survive: build_blog_indexes.py refuses to
 * regenerate the page without it, and everything below it belongs to this cron.
 */
function insertIndexCard(
  indexHtml: string,
  lang: LangCode,
  title: string,
  excerpt: string,
  slug: string,
  prettyDate: string,
): string {
  if (!indexHtml.includes("<!-- BLOG_CARDS -->")) {
    throw new Error(`${indexPath(lang)} is missing the <!-- BLOG_CARDS --> marker`);
  }
  const href = `/${TREE[lang]}/${slug}/`;
  const card = `    <article class="box">
      <p class="eyebrow">${escapeText(prettyDate)}</p>
      <h3><a href="${href}">${escapeText(title)}</a></h3>
      <p>${escapeText(excerpt)}</p>
    </article>`;
  return indexHtml.replace("<!-- BLOG_CARDS -->", `<!-- BLOG_CARDS -->\n${card}`);
}

/**
 * Three <url> entries, one per language, each naming the other two as alternates.
 * Format copied from the site's own sitemap: one line per entry, xhtml:link
 * alternates inline, inserted before </urlset> (and therefore below the
 * <!-- /SITE_URLS --> marker that separates generated pages from the cron's).
 */
function insertSitemapEntries(sitemap: string, slug: string, isoDate: string): string {
  const alts = LANGS.map(
    (l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${postUrl(l, slug)}"/>`,
  ).join("");
  const xdefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${postUrl("en", slug)}"/>`;
  const entries = LANGS.map(
    (l) =>
      `  <url><loc>${postUrl(l, slug)}</loc><lastmod>${isoDate}</lastmod><priority>0.5</priority>${alts}${xdefault}</url>\n`,
  ).join("");
  if (!sitemap.includes("</urlset>")) throw new Error("web/sitemap.xml has no </urlset>");
  return sitemap.replace("</urlset>", `${entries}</urlset>`);
}

/**
 * One line under "## Blog", matching the two entries already there: English URL only.
 * The section's own intro already explains that a post exists in three languages and
 * that the copies point at each other with hreflang, so listing all three would repeat
 * what the prose says. Appended after the last existing entry, so the list reads oldest
 * first exactly as it does today.
 */
function insertLlmsLine(llms: string, title: string, slug: string): string {
  const line = `- [${title}](${postUrl("en", slug)})`;
  if (llms.includes(line)) return llms;
  const re = /(\n- \[[^\]]*\]\([^)]*\/blog\/[^)]*\)\n)(?![\s\S]*\n- \[[^\]]*\]\([^)]*\/blog\/)/;
  if (!re.test(llms)) return llms; // section shape changed — skip rather than corrupt
  return llms.replace(re, `$1${line}\n`);
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeText(s).replace(/"/g, "&quot;");
}
