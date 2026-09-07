/** Proves the new queue grammar parses and round-trips. Run: npx tsx _archive/queue-parse-test.mts */
import { readFileSync } from "node:fs";
import { parseQueue, markPublished } from "../api/_lib/queue.js";

let fails = 0;
const ok = (n: string, c: boolean, d = "") => {
  console.log(`  ${c ? "PASS" : "FAIL"}  ${n}${c ? "" : ` -- ${d}`}`);
  if (!c) fails++;
};

const NL = String.fromCharCode(10);
const file = readFileSync("content/queue.md", "utf-8");

const first = parseQueue(file);
ok("queue still parses", !!first.next, "next was null");
ok("first topic is still Bharometer (order preserved)", first.next!.product === "bharometer", String(first.next?.product));
ok("total queued is 143", first.totalQueued === 143, String(first.totalQueued));

// Walk the queue as the cron would: publish, re-parse, publish.
let md = file;
const seen: string[] = [];
for (let i = 0; i < 3; i++) {
  const { next } = parseQueue(md);
  if (!next) break;
  seen.push(next.product || "(none)");
  md = markPublished({
    md,
    topic: next,
    slug: `slug-${i}`,
    isoDate: "2026-09-0" + (9 + i * 2),
    verseId: next.product === "gyaandaily" ? "verse-abc" : undefined,
  });
}
ok("the third run is the Gyaan Daily one (Mon 14 Sep)", seen[2] === "gyaandaily", seen.join(" -> "));

// Parse one Gyaan Daily line in isolation.
const gLine = file.split(NL).find((l) => l.startsWith("- [ ]") && l.includes("product: gyaandaily"))!;
const bare = ["## Queued", gLine, "", "## Published", ""].join(NL);
const parsed = parseQueue(bare).next!;
ok("verse: auto parses", parsed.verse === "auto", String(parsed.verse));
ok("product parses as gyaandaily", parsed.product === "gyaandaily", String(parsed.product));
ok("title parses", parsed.title.length > 10, parsed.title);
ok("intent parses", parsed.intent.length > 5, parsed.intent);

// The published line must carry product AND verse, or the past is unmeasurable.
const after = markPublished({ md: bare, topic: parsed, slug: "a-slug", isoDate: "2026-09-14", verseId: "verse-xyz" });
const pubLine = after.split(NL).find((l) => l.startsWith("- [x]"))!;
ok("published line records product", pubLine.includes("product: gyaandaily"), pubLine);
ok("published line records the verse id", pubLine.includes("verse: verse-xyz"), pubLine);
const back = parseQueue(after).published[0];
ok("and both read back out", back.product === "gyaandaily" && back.verse === "verse-xyz", JSON.stringify(back));

// A verse must never be reused: the id recorded above is what excludes it.
ok("a published verse id is visible to the next run", parseQueue(after).published.some((p) => p.verse === "verse-xyz"));

// A LUT line must keep its old shape exactly — no new fields leaking in.
const lut = '- [ ] category: gear | type: LUT | title: **A Title** | intent: "x"';
const lutMd = ["## Queued", lut, "", "## Published", ""].join(NL);
const lutTopic = parseQueue(lutMd).next!;
const lutPub = markPublished({ md: lutMd, topic: lutTopic, slug: "s", isoDate: "2026-09-14" });
const lutLine = lutPub.split(NL).find((l) => l.startsWith("- [x]"))!;
ok("a non-product line gains no product/verse fields", !lutLine.includes("product:") && !lutLine.includes("verse:"), lutLine);

console.log(fails === 0 ? `${NL}ALL QUEUE CHECKS PASSED` : `${NL}${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);
