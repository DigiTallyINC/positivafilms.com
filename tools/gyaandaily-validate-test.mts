/**
 * Proves validateGyaanOutput accepts a good trilingual post and rejects every bad one.
 * No network, no API key. Run: npx tsx _archive/gyaandaily-validate-test.mts
 */
import { validateGyaanOutput, stripBannedDashes } from "../api/blog-generate.js";
import type { GyaanOutput, VerseRow } from "../api/_lib/gyaandaily.js";

let fails = 0;
function pass(name: string, ok: boolean, detail = "") {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : ` — ${detail}`}`);
  if (!ok) fails++;
}
function mustReject(name: string, mutate: (o: GyaanOutput) => void, needle: string) {
  const o = good();
  mutate(o);
  try {
    validateGyaanOutput(o, VERSE);
    pass(name, false, "was ACCEPTED");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    pass(name, msg.includes(needle), `wrong error: ${msg}`);
  }
}

const VERSE: VerseRow = {
  id: "v1",
  language: "ta",
  text: "பொறிவாயில் ஐந்தவித்தான் பொய்தீர் ஒழுக்க நெறிநின்றார் நீடுவாழ் வார்.",
  transliteration: "poṟivāyil aindhavittān poytīr oḻukka neṟininṟār nīḍuvāḻ vār.",
  translation: "Those who hold to flawless conduct endure.",
  meaning: "The five gates of sense.",
  application: "Shut one door today.",
  author: "திருவள்ளுவர்",
  citation: "திருக்குறள் 6",
};

const body = (extra = "") =>
  `<p>The line is arguing against a common idea.</p><h2>What it means</h2><p>One word carries it.</p>${extra}<h2>What it asks</h2><p>Small and doable.</p><p><a class="chip chip-primary" href="/#getapp">Get the app</a></p>`;

const good = (): GyaanOutput => ({
  slug: "the-hour-decides-it",
  en: { title: "The hour decides it", excerpt: "x".repeat(140), body_html: body() },
  hi: { title: "समय ही तय करता है", excerpt: "य".repeat(140), body_html: body() },
  ta: { title: "நேரமே தீர்மானிக்கிறது", excerpt: "த".repeat(140), body_html: body() },
});

console.log("The happy path");
try {
  validateGyaanOutput(good(), VERSE);
  pass("a well-formed trilingual post is accepted", true);
} catch (e) {
  pass("a well-formed trilingual post is accepted", false, String(e));
}

console.log("\nEvery rejection must actually fire");
mustReject("slug with capitals", (o) => { o.slug = "The-Hour"; }, "lowercase-hyphenated");
mustReject("slug with underscores", (o) => { o.slug = "the_hour"; }, "lowercase-hyphenated");
mustReject("slug over 70 chars", (o) => { o.slug = "a-" + "x".repeat(75); }, "max 70");
mustReject("a whole language missing", (o) => { delete (o as Partial<GyaanOutput>).ta; }, "missing the ta copy");
mustReject("an empty title", (o) => { o.hi.title = "  "; }, "hi.title is empty");
mustReject("an empty body", (o) => { o.en.body_html = ""; }, "en.body_html is empty");

mustReject("the model retyped the verse text", (o) => { o.ta.body_html = body(`<p>${VERSE.text}</p>`); }, "reproduces the verse's text");
mustReject("the model retyped the transliteration", (o) => { o.en.body_html = body(`<p>${VERSE.transliteration}</p>`); }, "reproduces the verse's transliteration");
mustReject("the model retyped the citation", (o) => { o.hi.body_html = body(`<p>${VERSE.citation}</p>`); }, "reproduces the verse's citation");

mustReject("a blockquote the stylesheet cannot render", (o) => { o.en.body_html = body("<blockquote>x</blockquote>"); }, "<blockquote>");
mustReject("an image", (o) => { o.ta.body_html = body('<img src="x.png" alt="x">'); }, "<img>");
mustReject("a table", (o) => { o.hi.body_html = body("<table><tr><td>x</td></tr></table>"); }, "<table>");

mustReject("no link at all", (o) => { o.en.body_html = "<p>only prose</p>"; }, "exactly one link");
mustReject("two links", (o) => { o.hi.body_html = body('<p><a href="/#getapp">a</a></p>'); }, "exactly one link");
mustReject("a link somewhere other than /#getapp", (o) => {
  o.ta.body_html = '<p>x</p><p><a class="chip chip-primary" href="https://example.com">go</a></p>';
}, "exactly one link");

console.log("\nThe dash gate — the one that killed the cron for five days in July");
for (const [name, ch, expect] of [["em-dash", "—", ": "], ["en-dash", "–", " to "], ["arrow", "→", " then "]] as const) {
  const repaired = stripBannedDashes(`<p>a ${ch} b</p>`);
  pass(`${name} is repaired, not shipped`, repaired === `<p>a${expect}b</p>`, JSON.stringify(repaired));
  pass(`${name} is gone after repair`, !/[—–→]/.test(repaired));
}
mustReject("a dash that survived repair is still rejected", (o) => { o.en.body_html = body("<p>a — b</p>"); }, "banned dash");

console.log("\nThe bans apply to Hindi and Tamil too, not just English");
for (const lang of ["hi", "ta"] as const) {
  mustReject(`${lang}: em-dash rejected`, (o) => { o[lang].body_html = body("<p>क — ख</p>"); }, "banned dash");
}

console.log(fails === 0 ? "\nALL VALIDATION CHECKS PASSED" : `\n${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);
