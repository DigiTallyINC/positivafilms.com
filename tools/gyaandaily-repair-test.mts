/**
 * Offline checks for the Gyaan Daily repair path (15 Oct 2026): the local fixes
 * (dashes, slug) and the language read off a validation error, which decides
 * which ONE language the repair call rewrites. Run: npx tsx tools/gyaandaily-repair-test.mts
 */
import { repairGyaanOutput, failingLanguage } from "../api/blog-generate.js";

let failed = 0;
function ok(name: string, cond: boolean, detail = "") {
  console.log((cond ? "  PASS  " : "  FAIL  ") + name + (cond ? "" : " -- " + detail));
  if (!cond) failed++;
}

const copy = (title: string) => ({ title, excerpt: "x", body_html: "<p>a — b</p>" });

ok("en error -> en", failingLanguage("en.title is empty") === "en");
ok("hi body error -> hi", failingLanguage('hi.body_html contains the banned phrase "x"') === "hi");
ok("missing ta copy -> ta", failingLanguage("missing the ta copy entirely") === "ta");
ok("slug error -> null", failingLanguage('slug must be lowercase-hyphenated, got "X"') === null);
ok("text that merely mentions en. mid-line -> null", failingLanguage("the en.title thing") === null);

const bad: any = { slug: "Not A Slug!", en: copy("What One Word Does, to a Line"), hi: copy("h"), ta: copy("t") };
repairGyaanOutput(bad);
ok("bad slug rebuilt from English title", bad.slug === "what-one-word-does-to-a-line", bad.slug);
ok("em-dash repaired in every language", ["en", "hi", "ta"].every((l) => !bad[l].body_html.includes("—")));

const good: any = { slug: "keep-me", en: copy("Something Else"), hi: copy("h"), ta: copy("t") };
repairGyaanOutput(good);
ok("valid slug left alone", good.slug === "keep-me", good.slug);

const long: any = { slug: "", en: copy("a ".repeat(50) + "end"), hi: copy("h"), ta: copy("t") };
repairGyaanOutput(long);
ok("rebuilt slug <= 60 chars and no trailing hyphen", long.slug.length <= 60 && !long.slug.endsWith("-"), long.slug);

console.log(failed ? `\n${failed} CHECK(S) FAILED` : "\nALL REPAIR CHECKS PASSED");
process.exit(failed ? 1 : 0);
