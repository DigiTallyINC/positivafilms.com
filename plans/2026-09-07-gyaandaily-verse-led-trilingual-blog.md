# Gyaan Daily: a verse-led trilingual blog, on the existing cron

**Status: 5 of 8 pieces done. The cron itself is not started.**
Written 2026-09-07. Session ended here deliberately; the cron is the riskiest
piece and was left for fresh context.

---

## Read this first: what the next session actually needs to do

**Part 3, the cron, is the only build work left.** Everything it depends on is
built, committed, pushed and verified. Two things are blocked on Tally and are
listed at the bottom.

⏰ **Deadline: Monday 14 September.** The queue's next runs are Wed 9 and Fri 11
(both Bharometer). The 14th is the first slot a Gyaan Daily line could take.

⛔ **Do NOT put a `product: gyaandaily` line in `content/queue.md` until the
cron supports it.** The tool schema in `prompt.ts` does not offer the value, so
the model cannot emit it, validation fails both attempts and the run publishes
nothing. It fails safe, but the blog misses a day.

---

## Context

The blog cron on positivafilms.com publishes three posts a week (Mon/Wed/Fri
04:07 UTC) by taking the next `[ ]` line from `content/queue.md`. Gyaan Daily
shipped on the App Store and was not in the rotation.

Decided with Tally on 2026-09-07:

1. **Every Gyaan Daily post is built around a real verse from the app's own
   catalogue** — the verse, how to say it, what it means, what it asks of you,
   then the app as the way to get that daily. This *replaced* the original idea
   of generic app-marketing posts.
2. **Each post publishes in all three languages** — English, Hindi, Tamil — as
   an `hreflang` cluster. The verse stays in its original script in all three;
   the explanation is translated. Three runs a week produce nine pages a week.
3. **Gyaan Daily posts publish to `gyaandaily.positivafilms.com` ONLY** — routed
   there, not mirrored. This is deliberately NOT the Bharometer arrangement.
4. **Hindi and Tamil prose auto-publishes without review.** Raised as a quality
   risk (`copy-sweep.py` is English-only); Tally's call is to publish.
5. **Mix all the blogs together.** SuperGrade drops out, Gyaan Daily joins, the
   existing 140 queued posts keep their order. Not a queue rewrite.
6. **The verse language rotates** Tamil → Hindi → Sanskrit.

### ⛔ NO NEW CRON. One honest note on cost.

Same single `crons` entry in `vercel.json`, same three runs a week, same one
Anthropic call per run. ⚠️ Output tokens roughly triple because one run writes
three languages: about $1.30/month becomes $3–4/month. No new infrastructure.

---

## DONE (committed, pushed, verified)

### Part 1 — ATLAS `#/blog` schedule route ✅
`E:\26-09-01 - ATLAS OS`, commits `f81946f`, `bac33c9`, `a5453a4`.

- `scan/blog.mjs` — walks `config.roots` for any folder with a
  `content/queue.md`; no project is named in code. Read-only.
- `/api/atlas-blog` in `server.js` (120s TTL, `a-blog`), plus budgets/names at
  ~1091/1095 so `/api/status` reports freshness.
- `shell/src/atlas-data.js`: `FEEDS.blog`, three SOURCES (`blogNext`,
  `blogDone`, `blogProduct`), a `/blog` READERS entry, `monthOf()`, and a new
  `post` detail kind.
- `shell/src/shell.html`: an empty `data-atlas-reader="/blog"` section, a
  Knowledge menu item, `.post-prose` CSS, and a `data-groups-toggle` button in
  the reader's action bar.
- `build_nav.py` MENUS/FOLDER/LABELS; `/blog` added to both verify sweeps.

Two things added after Tally used it:
- **Posts render as prose, not in an iframe.** A whitelist extractor rebuilds
  the article from allowed tags only — no script, style, attribute or handler
  survives, which is what made dropping the sandbox safe.
- **Group collapse now survives a repaint.** The state lived in the DOM and
  `listHtml` rewrote every group as open on every repaint, so closing a month
  and clicking a post reopened it. State moved into `SEL`, per route.

⚠️ `shell/verify/checks_data_spine.py` times out at line 39 on
`wait_until="networkidle"` — the board polls continuously so the network never
idles. **Pre-existing, not caused by this work.** Use `domcontentloaded`.

### Part 2a — gyaan-daily branch ✅
There is **no `master`** in `DigiTallyINC/gyaan-daily`. The default is `main`,
which was 630 commits behind and had no `web/` folder at all. Fast-forwarded
`build-22-teardown` → `main`; they are now identical and **both are pushed on
every commit**. Keep doing that until Tally moves work onto `main`.

### Part 2c — the verse pool ✅
`tools/build_blog_verses.py` → `web/assets/blog-verses-{en,hi,ta,sa}.json`.
800 verses, 200 per language, 121–226 KB each. Commit `3fd9522`.

- The cron **cannot** read the catalogues: `content/ship/` is not tracked in git
  at all, and the files are 27 MB / 16 MB against a 1 MB contents-API ceiling.
- ⛔ **`note` is never included** — it is the app's one paid tier. Guard tested
  by putting `note` back on the allow-list; the build refuses and names rows.
- A **citation is required, an author is not** (Tally's 29 July ruling).
  Requiring a name would cut Sanskrit from 585 usable rows to 3.
- Picks are an **even stride**, not the first N. Measured: spans 80–100% of
  each catalogue.

### Part 2e — fonts ✅ (done differently from the original plan)
⛔ **The original plan said "widen `FLOOR_LATIN` by hand". Do not.** That file
already carries the scar: a draft added Ṱ and ṱ because they sat near other
retroflex letters in a chart, no face had either, and the check failed on
characters the site never contained.

Instead the pool lives under `web/`, where `subset_fonts.py` globs
`web/**/*.json`, so the glyphs are **measured**. Re-running added 33 characters
the site had never contained (ऋ ङ ऽ ॄ ॠ, Devanagari digits, ஊ, ṝ). A direct
cmap read confirms **113 Devanagari/Tamil characters and 134 diacritics all
covered**. The only uncovered character is U+200C ZWNJ, a formatting control
with no glyph by design.

### Part 2d — the trilingual blog ✅ (done differently from the original plan)
Commit `568554c`. `/hindi/blog/` and `/tamil/blog/` now exist.

- `tools/build_blog_indexes.py` generates all **three** index pages from the
  same `shell.template.html` and `tools/site/strings/*.json` as the other twelve
  pages, so they carry the language picker, hreflang and OG tags.
- ⛔ **Nothing Indic is typed.** Even the `· ज्ञान डेली` title suffix is derived
  from each language's own existing page title.
- ⛔ **The card region is preserved, never regenerated.** Everything below
  `<!-- BLOG_CARDS -->` is the cron's. The generator refuses if the marker is
  gone. It is idempotent — that took two attempts; the end anchor captured the
  closing tag's indentation and the file grew two spaces and a blank line every
  run.
- ⛔ **`build_blog_chrome.py` no longer stamps the index**, only the posts. Two
  generators owning one region strips whichever ran first — it would have
  removed the hreflang, OG tags and language picker on the next run.
  ⚠️ The original plan said "extend the chrome stamper to the new trees". That
  would have stamped **English footers onto Hindi and Tamil pages** — the
  footers are genuinely translated.
- **A real bug fixed:** every page in every language linked to `/blog/`, the
  English one, in both nav and footer. The label was translated; the
  destination was not. Now `base + "blog/"` in `build_site.py:nav_links` and in
  the template footer.
- `verify_site.py` now **discovers** blog pages instead of holding a list of
  three; it finds 5.

### Queue ✅
SuperGrade removed and **live on `origin/master`** (commit `562302b`). 140
queued. `gyaandaily` added to the `cta.pack` allow-list in
`blog-generate.ts` — inert, because `prompt.ts` does not offer the value.

---

## NOT DONE — Part 3, the cron

All of this is in `E:\26-03-06 - POSTIVA FILMS WEBSITE`.

### Queue grammar
A Gyaan Daily line names a language and an angle, not a hand-picked verse id:

```
- [ ] category: apps | type: APP | product: gyaandaily | verse: auto | language: ta | title: <angle> | intent: <search intent>
```

The cron picks the first pool row in that language no published line has used,
and **records the chosen id** when marking the line published.
`scan/blog.mjs` already parses `verse:` and `language:`.

### ⛔ The verse is spliced, never generated
`web/CLAUDE.md`: *"Nobody retypes Indic. Eighteen Tamil rows in this project
were once damaged by transcribing them by eye."* `text`, `transliteration`,
`author` and `citation` are copied byte-for-byte from the pool into the HTML by
code. The model gets them as immutable context and must never reproduce them.
**Test with a byte comparison, not a visual check.**

### ⭐ Commit ORDER must be the reverse of the Bharometer flow
Bharometer marks the queue published in the same commit as the positiva post,
then mirrors (`api/blog-generate.ts:218-256`) — safe, because positiva already
has the article if the mirror fails. With routing there is no positiva copy:

1. Commit to **gyaan-daily first**.
2. Only on success, commit `content/queue.md` alone to positiva.
3. On failure, leave the queue untouched and return the error.

Get this backwards and a failed run **silently eats the topic**.

### Files to change

| File | Change |
|---|---|
| `api/_lib/github.ts` (after :29) | `GYAANDAILY_REPO` — `repo: "gyaan-daily"`, `branch: "main"`, env-overridable. Mirrors `BHAROMETER_REPO`. |
| `api/_lib/queue.ts` | parse `verse:` / `language:`; record the verse id in `markPublished`. **Also add `product:` to the published line** — the ATLAS route's "By product" tab cannot measure the past without it. |
| `api/_lib/render.ts:26` | add `"gyaandaily"` to the `pack` literal union. The compiler then **forces** entries in `PACK_IMAGE` (:34), `HERO_IMAGE` (:44), `PACK_LINK` (:55) — a useful guarantee nothing is half-done. |
| `api/_lib/prompt.ts:190` | add `"gyaandaily"` to the tool-schema `enum`. **THE REAL BLOCKER** — without it the model cannot emit the value. |
| `api/_lib/prompt.ts:167, 192` | inline-CTA hrefs and pack-selection guidance. |
| `api/_lib/gyaandaily.ts` (new) | Pure string rendering for three languages + index cards + sitemap + llms lines. Mirrors `api/_lib/bharometer.ts`. |
| `content/gyaandaily-post-template.html` (new) | Chrome + `{{…}}` placeholders + hreflang. **Copy an existing post's chrome; the stamper only re-normalises, it never builds chrome from nothing.** |
| `api/blog-generate.ts:167-256` | Branch on `product === "gyaandaily"`: fetch the pool, pick a verse, skip the positiva render, commit gyaan first, queue second. |
| `content/AGENT.md:191` | **Rewrite** the Gyaan Daily sheet for the verse-led format (it is currently written for a generic app post). |
| `content/queue.md` | The new lines — LAST, after the cron works. |

### Files per run

**gyaan-daily, 8 files, one commit** (`web/CLAUDE.md:79-82` names all three
markers as the cron's contract):

1. `web/blog/<slug>/index.html`, `web/hindi/blog/<slug>/index.html`,
   `web/tamil/blog/<slug>/index.html` — directories, `cleanUrls` +
   `trailingSlash`, each with hreflang for the other two plus `x-default`.
2. The three `blog/index.html` files — card inserted **immediately after**
   `<!-- BLOG_CARDS -->` (column 0, must survive).
3. `web/sitemap.xml` — three `<url>` entries with `xhtml:link` alternates,
   before `</urlset>` and **below** `<!-- /SITE_URLS -->`.
4. `web/llms.txt` — a line under `## Blog`.

**positivafilms.com, 1 file:** `content/queue.md` only.

### Four gates every generated post must pass

- **Chrome-stamper regexes** (`tools/build_blog_chrome.py`) are file-wide with
  `re.S`. If `<meta name="theme-color"`, `<footer class="footer"`, `</head>` or
  `</body>` appear **inside `<main>`**, the stamper silently deletes the rest of
  the article.
- **Copy sweep** (`tools/copy-sweep.py`, exits 1): bans `—`, `–`, `→`, fourteen
  buzzwords and eight RE terms, all as case-insensitive **substrings** — so
  "teardown", "unlocked", "elevated", "delightful" all fail. ⚠️ English-only, so
  Hindi/Tamil bodies pass unchecked. Accepted risk.
- **CSP** (`web/vercel.json`): `script-src 'self'`, `font-src 'self'`,
  `img-src 'self' data:`. No external asset of any kind.
- **Font subset** — handled by the pool, provided verses come **from the pool**.
  A verse from anywhere else is not covered.

**Markup is narrow:** bare `<p>`, `<h2>`, `<em>`, `<strong>`, `<ul>/<li>` inside
`.doc`. There is **no `blockquote` rule, no pull-quote class, no `<pre>`, no
`figure`** in `site.css`. For the verse block copy the inline-styled `<p>` at
`web/blog/the-note-under-the-verse/index.html:45-48`. Posts carry no JSON-LD, no
OG, no byline, no read time.

⚠️ **The stylesheet href carries a content hash** (`/assets/site.css?v=<sha1>`).
Read it from the live `web/blog/index.html`, never hardcode.

⚠️ `max_tokens` is 8K, sized for one article. Three languages will need more —
measure the first dry run.

---

## Blocked on Tally

1. **Vercel** → `gyaandaily` project (`prj_Uc5wCjv4m5bLJIzS7QQTuL1Lsy27`) →
   production branch to **`main`**. It is almost certainly still on
   `build-22-teardown`. If the cron commits to a branch Vercel ignores, the
   posts never appear **and nothing errors**.
2. **GitHub token** → `contents:write` on **`DigiTallyINC/gyaan-daily`** for the
   fine-grained PAT the cron uses, or every run fails at the commit step.

---

## Verification for Part 3

- **Verse fidelity, the one that matters most:** assert the rendered `text`,
  `transliteration`, `author` and `citation` are **byte-identical** to the pool
  row. Not "looks right".
- **Before any live run:** `npx tsc --noEmit`, then `_archive/cron-dryrun.mts`
  against a `gyaandaily` topic. Run `copy-sweep.py`, `build_blog_chrome.py` and
  `subset_fonts.py` over the output in a scratch checkout.
- **First live run:** trigger manually. Confirm all three URLs return 200, each
  carries hreflang for the other two, cards appear on all three indexes, sitemap
  and llms.txt updated, **and positivafilms.com did NOT gain a post** — that is
  the actual test of the routing.
- **Queue integrity:** advanced by exactly one, verse id recorded, and a
  deliberately failed gyaan commit leaves the queue untouched.

## Useful commands

```
node "E:/26-09-01 - ATLAS OS/scan/blog.mjs"          # (import it; see scan/)
python tools/build_blog_verses.py --check            # gyaan repo
python tools/build_blog_indexes.py --check
python tools/copy-sweep.py
python tools/verify_site.py
git push origin build-22-teardown:build-22-teardown build-22-teardown:main
```
