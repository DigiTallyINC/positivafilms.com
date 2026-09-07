/**
 * Offline proof of the Gyaan Daily renderer. No network, no API key, no commits.
 *
 * Reads the REAL templates from content/, and the REAL indexes, sitemap, llms.txt
 * and verse pool from a local Gyaan Daily checkout, renders a fake post through
 * them, and asserts the things that would be expensive to discover in production.
 *
 * Run:  npx tsx _archive/gyaandaily-render-test.mts
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  renderGyaanDailyPosts,
  pickVerse,
  postUrl,
  LANGS,
  type LangCode,
  type VerseRow,
  type GyaanOutput,
} from "../api/_lib/gyaandaily.js";

const GYAAN = process.env.GYAAN_REPO || "E:\\26-07-27 - GYAANDAILY APP";
const WEB = join(GYAAN, "web");
const OUT = process.env.OUT_DIR || join(process.cwd(), "_archive", "gyaan-dryrun");

const read = (p: string) => readFileSync(p, "utf-8");
let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail && !ok ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

// ---- inputs, all real ------------------------------------------------------
const templates = {
  en: read(join(process.cwd(), "content", "gyaandaily-post-en.html")),
  hi: read(join(process.cwd(), "content", "gyaandaily-post-hi.html")),
  ta: read(join(process.cwd(), "content", "gyaandaily-post-ta.html")),
} as Record<LangCode, string>;

const indexes = {
  en: read(join(WEB, "blog", "index.html")),
  hi: read(join(WEB, "hindi", "blog", "index.html")),
  ta: read(join(WEB, "tamil", "blog", "index.html")),
} as Record<LangCode, string>;

const sitemap = read(join(WEB, "sitemap.xml"));
const llms = read(join(WEB, "llms.txt"));
const pool = JSON.parse(read(join(WEB, "assets", "blog-verses-ta.json"))).quotes as VerseRow[];

// The css hash is read off the live index, never hardcoded.
const cssV = /site\.css\?v=([a-f0-9]+)/.exec(indexes.en)?.[1] || "";

// ---- a fake post -----------------------------------------------------------
const verse = pickVerse(pool, []);
const out: GyaanOutput = {
  slug: "the-hour-decides-it",
  en: {
    title: "The hour decides it",
    excerpt: "Strength is not the whole of a contest. The time it happens in does much of the work.",
    body_html: "<p>An owl beats a crow on any night. The couplet is not about birds.</p><h2>What it asks</h2><p>Pick the hour before you pick the fight.</p>",
  },
  hi: {
    title: "समय ही तय करता है",
    excerpt: "बल ही सब कुछ नहीं है। जिस समय कुछ होता है, वह भी बहुत कुछ तय करता है।",
    body_html: "<p>रात में उल्लू कौवे से जीतता है। यह दोहा पक्षियों के बारे में नहीं है।</p>",
  },
  ta: {
    title: "நேரமே தீர்மானிக்கிறது",
    excerpt: "வலிமை மட்டுமே போட்டியல்ல. எந்த நேரத்தில் நடக்கிறது என்பதும் முக்கியம்.",
    body_html: "<p>இரவில் ஆந்தை காக்கையை வெல்லும். இக்குறள் பறவைகளைப் பற்றியது அல்ல.</p>",
  },
};

const result = renderGyaanDailyPosts({
  templates,
  indexes,
  sitemap,
  llms,
  out,
  verse,
  prettyDate: { en: "14 September 2026", hi: "14 सितंबर 2026", ta: "14 செப்டம்பர் 2026" },
  isoDate: "2026-09-14",
  cssV,
});

// ---- the assertions that matter -------------------------------------------
console.log("\nVerse fidelity (the one that matters most)");
const decode = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
for (const p of result.posts) {
  for (const field of ["text", "transliteration", "author", "citation"] as const) {
    const want = verse[field];
    const present = decode(p.html).includes(want);
    check(`${p.lang}: ${field} byte-identical to the pool row`, present, `missing ${JSON.stringify(want.slice(0, 30))}`);
  }
}

console.log("\nStructure");
for (const p of result.posts) {
  check(`${p.lang}: no unresolved {{PLACEHOLDER}}`, !/\{\{[A-Z_]+\}\}/.test(p.html));
  check(`${p.lang}: css hash resolved`, p.html.includes(`site.css?v=${cssV}`));
  check(`${p.lang}: canonical is its own URL`, p.html.includes(`<link rel="canonical" href="${postUrl(p.lang, out.slug)}">`));
  for (const other of LANGS) {
    check(`${p.lang}: hreflang ${other} points at the ${other} post`, p.html.includes(`hreflang="${other}" href="${postUrl(other, out.slug)}"`));
  }
  check(`${p.lang}: path is web/-prefixed`, p.path.startsWith("web/"));
}

console.log("\nEm-dash gate (the one that killed the cron for five days in July)");
for (const p of result.posts) {
  check(`${p.lang}: no em/en dash or arrow`, !/[\u2014\u2013\u2192]/.test(p.html));
}

console.log("\nIndex cards, sitemap, llms.txt");
for (const lang of LANGS) {
  const before = (indexes[lang].match(/<article class="box">/g) || []).length;
  const after = (result.indexes[lang].match(/<article class="box">/g) || []).length;
  check(`${lang}: index gained exactly one card`, after === before + 1, `${before} -> ${after}`);
  check(`${lang}: BLOG_CARDS marker survived`, result.indexes[lang].includes("<!-- BLOG_CARDS -->"));
  check(`${lang}: card links to its own language tree`, result.indexes[lang].includes(`href="/${lang === "en" ? "blog" : lang === "hi" ? "hindi/blog" : "tamil/blog"}/${out.slug}/"`));
}
const urlsAdded = (result.sitemap.match(new RegExp(out.slug, "g")) || []).length;
check("sitemap: three <loc> entries plus alternates", urlsAdded >= 3, `found ${urlsAdded}`);
check("sitemap: still closes with </urlset>", result.sitemap.trimEnd().endsWith("</urlset>"));
check("llms.txt: gained the post line", result.llms.includes(`- [${out.en.title}](${postUrl("en", out.slug)})`));
check("llms.txt: gained exactly one line", result.llms.split("\n").length === llms.split("\n").length + 1,
  `${llms.split("\n").length} -> ${result.llms.split("\n").length}`);
check("llms.txt: existing entries intact", result.llms.includes("the-note-under-the-verse"));

console.log("\nVerse pool hygiene");
check("pool row carries no `note` field (the app's paid tier)", !("note" in (verse as Record<string, unknown>)));

// ---- write the output so it can be eyeballed and swept ---------------------
mkdirSync(OUT, { recursive: true });
for (const p of result.posts) {
  const f = join(OUT, `${p.lang}.html`);
  writeFileSync(f, p.html, "utf-8");
}
writeFileSync(join(OUT, "sitemap.xml"), result.sitemap, "utf-8");
writeFileSync(join(OUT, "llms.txt"), result.llms, "utf-8");
for (const lang of LANGS) writeFileSync(join(OUT, `index-${lang}.html`), result.indexes[lang], "utf-8");

console.log(`\nOutput written to ${OUT}`);
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
