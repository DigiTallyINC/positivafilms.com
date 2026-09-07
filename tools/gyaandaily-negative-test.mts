/** Proves the renderer's guards FIRE on known-bad input. A gate never seen to fail is not a gate. */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderGyaanDailyPosts, assertChromeSafe, pickVerse, type LangCode, type VerseRow, type GyaanOutput } from "../api/_lib/gyaandaily.js";

const GYAAN = process.env.GYAAN_REPO || "E:/26-07-27 - GYAANDAILY APP";
const WEB = join(GYAAN, "web");
const read = (p: string) => readFileSync(p, "utf-8");
let fails = 0;
function mustThrow(name: string, fn: () => unknown, needle: string) {
  try { fn(); console.log(`  FAIL  ${name} — did NOT throw`); fails++; }
  catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const ok = msg.includes(needle);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : ` — threw the wrong error: ${msg}`}`);
    if (!ok) fails++;
  }
}

const templates = { en: read("content/gyaandaily-post-en.html"), hi: read("content/gyaandaily-post-hi.html"), ta: read("content/gyaandaily-post-ta.html") } as Record<LangCode,string>;
const indexes = { en: read(join(WEB,"blog","index.html")), hi: read(join(WEB,"hindi","blog","index.html")), ta: read(join(WEB,"tamil","blog","index.html")) } as Record<LangCode,string>;
const sitemap = read(join(WEB,"sitemap.xml"));
const llms = read(join(WEB,"llms.txt"));
const pool = JSON.parse(read(join(WEB,"assets","blog-verses-ta.json"))).quotes as VerseRow[];
const verse = pickVerse(pool, []);
const copy = { title: "t", excerpt: "e", body_html: "<p>ok</p>" };
const base: GyaanOutput = { slug: "neg", en: copy, hi: copy, ta: copy };
const args = { templates, indexes, sitemap, llms, out: base, verse,
  prettyDate: { en: "d", hi: "d", ta: "d" } as Record<LangCode,string>, isoDate: "2026-09-14", cssV: "abc" };

console.log("Guards must fire on known-bad input");

mustThrow("chrome stamper trap: </head> inside <main>",
  () => assertChromeSafe('<main id="main"> </head> </main>', "en"), "chrome stamper");

mustThrow("chrome stamper trap: <footer class=\"footer\"> inside <main>",
  () => assertChromeSafe('<main id="main"> <footer class="footer"> </main>', "en"), "chrome stamper");

mustThrow("a post with no <main> at all",
  () => assertChromeSafe("<html></html>", "en"), "no <main>");

mustThrow("missing BLOG_CARDS marker in an index",
  () => renderGyaanDailyPosts({ ...args, indexes: { ...indexes, hi: indexes.hi.replace("<!-- BLOG_CARDS -->", "") } }),
  "BLOG_CARDS");

mustThrow("a template with an unfilled placeholder",
  () => renderGyaanDailyPosts({ ...args, templates: { ...templates, ta: templates.ta + "{{UNKNOWN}}" } }),
  "{{UNKNOWN}}");

mustThrow("sitemap with no </urlset>",
  () => renderGyaanDailyPosts({ ...args, sitemap: sitemap.replace("</urlset>", "") }), "</urlset>");

mustThrow("pool exhausted (every verse already used)",
  () => pickVerse(pool, pool.map(q => q.id)), "every verse in the pool");

// The guard above is defence in depth: sanitizeBody already strips these before they
// could reach <main>. Proven here rather than assumed, because "it cannot happen" is
// the claim that stops people testing it.
{
  const r = renderGyaanDailyPosts({ ...args, out: { ...base, en: { ...copy,
    body_html: '<p>x</p></head><footer class="footer">boo</footer><script>alert(1)</script>' } } });
  const en = r.posts.find(p => p.lang === "en")!;
  const main = en.html.slice(en.html.indexOf('<main id="main"'), en.html.indexOf("</main>"));
  for (const needle of ["</head>", "<footer", "<script"]) {
    const ok = !main.includes(needle);
    console.log(`  ${ok ? "PASS" : "FAIL"}  sanitiser strips ${needle} before it can reach <main>`);
    if (!ok) fails++;
  }
}

console.log(fails === 0 ? "\nALL GUARDS FIRED CORRECTLY" : `\n${fails} GUARD(S) DID NOT FIRE`);
process.exit(fails === 0 ? 0 : 1);
