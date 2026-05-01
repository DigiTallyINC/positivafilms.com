/**
 * Renders a post into HTML and patches blog.html, sitemap.xml, rss.xml.
 * Pure string operations — no I/O, no GitHub.
 */

import type { QueuedTopic } from "./queue.js";
import { sanitizeBody, sanitizeLede, assertNoDangerousMarkup } from "./sanitize.js";

export type ToolOutput = {
  slug: string;
  excerpt: string;
  lede: string;
  body_html: string;
  keywords: string;
  data_search: string;
  category_label:
    | "Indian Wedding"
    | "Travel & Place"
    | "Craft & Color"
    | "Gear"
    | "Aerial & FPV"
    | "Field Notes";
  cta: {
    pack: "wedding" | "travel" | "bundle";
    headline: string;
    sub: string;
    body: string;
    button: string;
  };
};

const PACK_IMAGE: Record<ToolOutput["cta"]["pack"], string> = {
  wedding: "Indian_Wedding_Luts_pack.png",
  travel: "Indian_Travel_Luts_pack.png",
  bundle: "Bundle_Luts_pack.png",
};

const HERO_IMAGE: Record<ToolOutput["cta"]["pack"], string> = {
  wedding: "https://positivafilms.com/Indian_Wedding_Luts_pack.png",
  travel: "https://positivafilms.com/Indian_Travel_Luts_pack.png",
  bundle: "https://positivafilms.com/Bundle_Luts_pack.png",
};

export function renderPost(opts: {
  template: string;
  topic: QueuedTopic;
  out: ToolOutput;
  prettyDate: string;
  isoDate: string;
  readTime: number;
}): string {
  const { template, topic, out, prettyDate, isoDate, readTime } = opts;

  // Defense-in-depth: abort BEFORE sanitization if the model output is overtly hostile.
  assertNoDangerousMarkup(out.body_html, "");

  // Sanitize model output against an allowlist of safe tags/attrs/schemes.
  const safeBody = sanitizeBody(out.body_html);
  const safeLede = sanitizeLede(out.lede);

  // Confirm the inline-cta block survived sanitization (the model is required to include one).
  if (!safeBody.includes('class="inline-cta"')) {
    throw new Error("Sanitization stripped the inline-cta block — model output was malformed");
  }

  const ctaImageClass = out.cta.pack === "bundle" ? " bundle" : "";

  const replacements: Record<string, string> = {
    "{{TITLE}}": escapeText(topic.title),
    "{{EXCERPT}}": escapeAttr(out.excerpt),
    "{{KEYWORDS}}": escapeAttr(out.keywords),
    "{{AUTHOR}}": "Positiva Films",
    "{{SLUG}}": out.slug,
    "{{DATE}}": prettyDate,
    "{{DATE_ISO}}": isoDate,
    "{{READ_TIME}}": String(readTime),
    "{{HERO_IMAGE}}": HERO_IMAGE[out.cta.pack],
    "{{CATEGORY_LABEL}}": escapeText(out.category_label),
    "{{LEDE}}": safeLede,
    "{{BODY_HTML}}": safeBody,
    "{{CTA_EYEBROW}}": escapeText(out.cta.headline),
    "{{CTA_HEADLINE}}": escapeText(out.cta.headline),
    "{{CTA_SUB}}": escapeText(out.cta.sub),
    "{{CTA_BODY}}": escapeText(out.cta.body),
    "{{CTA_BUTTON}}": escapeText(out.cta.button),
    "{{CTA_LINK}}": `luts.html#${out.cta.pack}`,
    "{{CTA_IMAGE}}": PACK_IMAGE[out.cta.pack],
    "{{CTA_IMAGE_CLASS}}": ctaImageClass,
    // Author block was removed from the template; leftover refs get a no-op:
    "{{AUTHOR_INITIALS}}": "",
    "{{AUTHOR_BIO}}": "",
  };

  let html = template;
  for (const [k, v] of Object.entries(replacements)) {
    html = html.replaceAll(k, v);
  }
  return html;
}

/**
 * Update blog.html: promote previous featured to top of grid, replace featured with new post.
 * Returns the new blog.html content.
 */
export function updateBlogHtml(opts: {
  blogHtml: string;
  topic: QueuedTopic;
  out: ToolOutput;
  prettyDate: string;
  readTime: number;
}): string {
  const { blogHtml, topic, out, prettyDate, readTime } = opts;

  // Extract the current featured card to promote it to the grid
  const fpRegex = /<a href="posts\/[^"]+" class="fp-card reveal"[\s\S]*?<\/a>/;
  const fpMatch = fpRegex.exec(blogHtml);

  let promoted = "";
  if (fpMatch) {
    const fp = fpMatch[0];
    const href = /href="(posts\/[^"]+)"/.exec(fp)?.[1] || "";
    const dataCat = /data-cat="([^"]+)"/.exec(fp)?.[1] || "field";
    const dataSearch = /data-search="([^"]+)"/.exec(fp)?.[1] || "";
    const cat = /<span class="cat">[^<]*?([A-Za-z &]+)<\/span>/.exec(fp)?.[1]?.trim() || "Field Notes";
    const date = /<span>([A-Z][a-z]{2} \d{2}, \d{4})<\/span>/.exec(fp)?.[1] || "";
    const readTimeMatch = /<span>(\d+ Min Read)<\/span>/.exec(fp)?.[1] || "6 Min Read";
    const title = /<h3 class="fp-title">([\s\S]*?)<\/h3>/.exec(fp)?.[1]?.trim() || "";
    const excerpt = /<p class="fp-excerpt">([\s\S]*?)<\/p>/.exec(fp)?.[1]?.trim() || "";

    promoted = buildGridCard({
      href,
      dataCat,
      dataSearch,
      cat,
      date,
      readTime: readTimeMatch.replace(" Min Read", ""),
      title,
      excerpt,
    });
  }

  // Insert promoted card at top of #postsGrid (right after the opening div)
  let newHtml = blogHtml;
  if (promoted) {
    newHtml = newHtml.replace(
      /(<div class="posts-grid" id="postsGrid">\s*\n)/,
      `$1\n    ${promoted}\n`,
    );
  }

  // Replace the featured card with the new post
  const newFeatured = buildFeaturedCard({
    slug: out.slug,
    dataCat: topic.category,
    dataSearch: out.data_search,
    categoryLabel: out.category_label,
    date: prettyDate,
    readTime,
    title: topic.title,
    excerpt: out.excerpt,
  });

  newHtml = newHtml.replace(fpRegex, newFeatured);

  return newHtml;
}

function buildFeaturedCard(opts: {
  slug: string;
  dataCat: string;
  dataSearch: string;
  categoryLabel: string;
  date: string;
  readTime: number;
  title: string;
  excerpt: string;
}): string {
  return `<a href="posts/${opts.slug}.html" class="fp-card reveal" data-cat="${opts.dataCat}" data-search="${escapeAttr(opts.dataSearch)}">
    <div class="fp-card-inner">
      <div class="fp-meta">
        <span class="cat">&#10022; ${opts.categoryLabel}</span>
        <span class="dot"></span>
        <span>${opts.date}</span>
        <span class="dot"></span>
        <span>${opts.readTime} Min Read</span>
      </div>
      <h3 class="fp-title">${opts.title}</h3>
      <p class="fp-excerpt">${escapeText(opts.excerpt)}</p>
      <span class="fp-cta">Read the full piece</span>
    </div>
  </a>`;
}

function buildGridCard(opts: {
  href: string;
  dataCat: string;
  dataSearch: string;
  cat: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
}): string {
  return `<a href="${opts.href}" class="post-card reveal" data-cat="${opts.dataCat}" data-search="${opts.dataSearch}">
      <span class="post-cat">${opts.cat}</span>
      <div class="post-meta"><span>${opts.date}</span><span class="dot"></span><span>${opts.readTime} Min Read</span></div>
      <h3 class="post-title">${opts.title}</h3>
      <p class="post-excerpt">${opts.excerpt}</p>
      <div class="post-foot"><div class="post-arrow">&#8594;</div></div>
    </a>`;
}

/** Append a <url> entry to sitemap.xml above </urlset>. */
export function updateSitemap(opts: {
  sitemap: string;
  slug: string;
  isoDate: string;
}): string {
  const entry = `  <url>
    <loc>https://positivafilms.com/posts/${opts.slug}.html</loc>
    <lastmod>${opts.isoDate}</lastmod>
    <priority>0.7</priority>
  </url>
`;
  return opts.sitemap.replace(/<\/urlset>/, `${entry}</urlset>`);
}

/** Prepend an <item> at the top of <channel> in rss.xml. Trim to last 30 items. */
export function updateRss(opts: {
  rss: string;
  topic: QueuedTopic;
  out: ToolOutput;
  rfc822Date: string;
  categoryLabel: string;
}): string {
  const url = `https://positivafilms.com/posts/${opts.out.slug}.html`;
  const item = `    <item>
      <title>${escapeText(opts.topic.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${escapeText(opts.out.excerpt)}</description>
      <pubDate>${opts.rfc822Date}</pubDate>
      <category>${opts.categoryLabel}</category>
    </item>
`;
  // Insert after the comment marker
  let rss = opts.rss.replace(
    /(<!-- ITEMS_BELOW[^>]*-->\n?)/,
    `$1${item}`,
  );

  // Trim to 30 items
  const items = [...rss.matchAll(/<item>[\s\S]*?<\/item>/g)];
  if (items.length > 30) {
    const toRemove = items.slice(30);
    for (const m of toRemove) {
      rss = rss.replace(m[0] + "\n", "");
    }
  }

  return rss;
}

function escapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeText(s).replace(/"/g, "&quot;");
}

/** "May 04, 2026" */
export function formatPrettyDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/** "Mon, 04 May 2026 09:30:00 +0530" — Indian timezone */
export function formatRfc822(d: Date): string {
  // Convert to IST (UTC+5:30) for the rss pubDate
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(d.getTime() + istOffsetMs);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${days[ist.getUTCDay()]}, ${pad(ist.getUTCDate())} ${months[ist.getUTCMonth()]} ${ist.getUTCFullYear()} ${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())} +0530`;
}
