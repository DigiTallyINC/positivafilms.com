# Gyaan Daily: a verse-led trilingual blog, on the existing cron

## Context

The blog cron on positivafilms.com publishes three posts a week (Mon/Wed/Fri 04:07 UTC) by
taking the next `[ ]` line from `content/queue.md`. Gyaan Daily shipped on the App Store and
needs a content push, but nothing in the rotation features it.

Decided in discussion, 2026-09-07:

1. **Every Gyaan Daily post is built around a real verse from the app's own catalogue** — the
   verse, how to say it, what it means, what it asks of you today, and then how the app gives
   you that every day. This *replaces* the idea of generic app-marketing posts.
2. **Each post publishes in all three languages** — English, Hindi and Tamil — as an `hreflang`
   cluster. The verse stays in its original script in all three; the explanation is translated.
   Three runs a week therefore produce nine pages a week.
3. **Gyaan Daily posts publish to `gyaandaily.positivafilms.com` ONLY** — routed there, not
   mirrored. Everything else keeps publishing to positivafilms.com as now.
4. **Hindi and Tamil prose auto-publishes without review.** Raised as a quality risk (the app's
   own written layer was written by people, and `copy-sweep.py`'s banned-word list is
   English-only); Tally's call is to publish automatically. Proceeding on that basis.
5. **The gyaan-daily branch is fast-forwarded and the cron targets `main`.**

Outcome: Gyaan Daily gets a publishing stream on its own subdomain in three languages, built
from material the app already owns, and the schedule for the whole rotation becomes visible in
one place.

### ⛔ NO NEW CRON. One honest note on cost.

- **Same cron job** — the single `crons` entry in `vercel.json` (`/api/blog-generate`,
  `7 4 * * 1,3,5`). No second entry, no second Vercel project, no second function.
- **Same schedule, same number of runs** — still three a week. Gyaan Daily topics are lines in
  the *same* `content/queue.md`, taken by the *same* handler.
- ⚠️ **Output tokens roughly triple**, because one run now writes the article in three
  languages. That moves the blog from about $1.30/month to roughly $3–4/month. Real, but small.
  There is no new infrastructure and no new cron — only a longer response per run.

## Already done this session (uncommitted, on disk)

- `api/blog-generate.ts:325-326` — `gyaandaily` added to the `cta.pack` whitelist + error text.
- `content/AGENT.md:173, 191` — Gyaan Daily fact sheet in the "ONLY permitted claims" block.
  ⚠️ This sheet was written for generic app posts and **needs rewriting** for the verse-led
  format in Part 3. `npx tsc --noEmit` passes.

---

## Part 1 — ATLAS OS: a `#/blog` schedule route

Do this FIRST. The cadence decision depends on seeing the schedule, and it touches no
publishing code.

**Where the schedule comes from.** `content/queue.md` encodes it: file order is publish order,
the cron takes the first `[ ]`, it fires Mon/Wed/Fri 04:07 UTC, and published lines carry
`[x] YYYY-MM-DD | slug: <slug> | …`. Past dates are *recorded*; future dates are *projected* by
walking the next Mon/Wed/Fri down the remaining `[ ]` lines.

⚠️ Projections assume no skipped runs — a failed run shifts everything after it. The route
labels them as projections rather than printing them as fact.

**New file `scan/blog.mjs`** — contract `export async function scan({ config, HERE })`.
- **Discover, never hardcode** (ATLAS rule 1): walk `config.roots` and treat any top-level
  folder containing `content/queue.md` as a blog queue, mirroring `scan/projects.mjs:298-311`.
  Do not name the Positiva folder in code.
- **Read-only** (ATLAS rule 3, project sovereignty).
- Parse with the cron's own field grammar (`api/_lib/queue.ts:34`), plus the new `verse:` /
  `language:` fields from Part 3.
- Return `{ queues, posts, counts, errors }`; on total failure `{ unavailable: '<plain
  English>', posts: [] }` — never an empty list (`scan/registry.mjs:38-41`). Unmeasured values
  are `null`, rendered as an em dash, never `0`.
- **Not** in `tools/nightly.mjs` or `tools/build-scans.mjs`: it writes nothing and is fast, so
  it is `registry`-shaped. Following `tools/build-scans.mjs:44-49`, name the exclusion in a
  comment rather than omitting it silently.

**Wiring:**

| File | Where | Edit |
|---|---|---|
| `server.js` | after 630 | `if (p2 === '/api/atlas-blog') return sendJson(res, await cached('a-blog', 120000, atlasScan('blog')));` |
| `server.js` | 1084 / 1086 | `'a-blog': 120000` in `budgets`, `'a-blog':'blog'` in `names` |
| `shell/src/atlas-data.js` | `FEEDS` 84-133 | `blog: '/api/atlas-blog',` |
| `shell/src/atlas-data.js` | `SOURCES` 1121-1299 | a `blog` **source**, not a PANEL — no 15th board tile |
| `shell/src/atlas-data.js` | `READERS`, append after 987 | `{ route:'/blog', dataset:'Blog', … }`; group by week, `detail:'plain'` |
| `shell/src/shell.html` | after 6192 | an **empty** `<section … data-atlas-reader="/blog">` |
| `shell/src/shell.html` | ~4603 | menu item `href="#/blog" data-route-link` |
| `shell/build/build_nav.py` | `MENUS` 68-86, `FOLDER` 99-113 | add `"/blog"` to both — **mandatory**, the build FATALs otherwise (`build_nav.py:183-191`) |
| `shell/build/build_nav.py` | `LABELS` 126-142 | `"/blog": "Blog schedule",` |
| `shell/verify/checks_data_spine.py` | 437-438 | add `"/blog"` to the reader sweep |
| `shell/verify/checks_p5_p7.py` | 186-187 | add `"/blog"` to the tab-strip sweep |

No new render code — `paintReader()` and `listHtml`/`articleHtml`/`factsHtml` are generic. The
`<section>` stays empty on purpose (`shell.html:6127-6132`). `atlas-data.js` / `atlas-view.js`
are served off disk; only `shell.html` edits need `python build/build_v2.py` from `shell/`.

**Tabs:** *Upcoming* (projected dates, product-tagged), *Published* (recorded), *By product*
(runs queued per product — the number needed to choose the cadence).

---

## Part 2 — Gyaan Daily repo: prepare it to receive posts

**2a. Fast-forward the branch.** There is **no `master`**. The default is `main`, and
`origin/main` is **630 commits behind** `build-22-teardown` and contains no `web/` at all.
`build-22-teardown` is a strict superset (`build-22-teardown..main` = 0), so:

```
git push origin build-22-teardown:main
```

**2b. ⛔ Confirm Vercel's production branch — a hard gate.** `web/.vercel/project.json` is
gitignored and does not record it. If Vercel deploys a different branch, the cron's commits
succeed and the posts **never appear, with no error anywhere**. Set the `gyaandaily` project
(`prj_Uc5wCjv4m5bLJIzS7QQTuL1Lsy27`) to `main` before any live run.

**2c. ⭐ Build a committed verse pool — this is the load-bearing new piece.**

The cron cannot read the catalogues: **`content/ship/` is not tracked in git (0 files)**, and
the files are 27 MB (en) and 16 MB (hi) against the GitHub contents API's 1 MB ceiling.

New local script `tools/build_blog_verses.py` reads `content/ship/catalogue-*.json` and emits
one small committed file per language at **`web/assets/blog-verses-<lang>.json`**:

- Only rows that are **fully written** — `text` + `transliteration` + `translation` +
  `meaning` + `application`. Available today: **Tamil 2,179 · Hindi 9,733 · Sanskrit 695 ·
  English 11,163**.
- Cap at ~200 rows per language so each file stays well under 1 MB.
- ⛔ **Exclude `note`.** Per `content/CATALOGUE-SCHEMA.md` it is *"THE ONE PAID TIER, from
  build 19"*. The blog must not give away the app's only lock. Posts reference that a Worth
  Knowing fact exists under the verse in the app, and never print it.
- Carry `id`, `text`, `transliteration`, `translation`, `meaning`, `application`, `author`,
  `citation`, `tags`.

⭐ **Putting the pool under `web/assets/` is deliberate.** `tools/subset_fonts.py` builds its
glyph inventory by globbing `web/**/*.json` as well as `**/*.html`, so every character in every
publishable verse is automatically covered by the font subset. The pool being in `web/` is what
makes the font problem tractable rather than a permanent hazard.

**2d. Give the blog a Hindi and Tamil home.** `/hindi/` and `/tamil/` exist but neither has a
`blog/`. Needed:
- `web/hindi/blog/index.html` and `web/tamil/blog/index.html`, each with its own
  `<!-- BLOG_CARDS -->` marker.
- Blog links in the Hindi and Tamil nav.
- `tools/build_blog_chrome.py` currently globs `web/blog/**/*.html` only — extend to the two
  new trees.
- `tools/verify_site.py:61` hardcodes `BLOG = [...]`; make it discover `web/**/blog/*/` instead,
  so new posts are actually verified.

**2e. Widen the font floor.** `subset_fonts.py`'s `FLOOR_LATIN` (lines 55-58) does not cover
transliteration diacritics. Raise the floor to include `ā ī ū ṛ ṣ ṭ ḍ ṇ ṅ ñ ṃ ḥ ē ō ṟ ḻ ḷ ṉ`
plus the full Devanagari and Tamil blocks, re-run `python tools/subset_fonts.py`, commit the six
`.woff2` files. ⚠️ `web/CLAUDE.md:73` — Source Serif 4 has no `ṁ`; report any character no face
can draw rather than shipping a silent fallback.

---

## Part 3 — Positiva cron: verse-led trilingual generation, routed to the subdomain

### Queue grammar

A Gyaan Daily line names a **language and an angle, not a hand-picked verse id** — curating
2,179 ids by hand is not sensible:

```
- [ ] category: apps | type: APP | product: gyaandaily | verse: auto | language: ta | title: <angle> | intent: <search intent>
```

The cron picks the first fully-written pool row in that language that no published line has used
yet, and **records the chosen id** when it marks the line published (alongside `slug:`), exactly
as it records the slug today. That guarantees no repeats without hand-curation.

### ⛔ The verse is spliced, never generated

`web/CLAUDE.md`: *"Nobody retypes Indic. Eighteen Tamil rows in this project were once damaged
by transcribing them by eye."*

So `text`, `transliteration`, `author` and `citation` are **copied byte-for-byte from the pool
JSON into the rendered HTML by code**. The model receives them as immutable context, is
instructed never to reproduce them, and its output is validated to confirm it did not. The model
writes only the surrounding prose, in three languages.

### Generation

One Anthropic call per run, returning three language bodies through the tool schema. ⚠️ The
current `max_tokens` (8K) is sized for one article; three will need it raised — measure the
first dry run and set it with headroom.

The post structure, in each language: the verse (original script) → transliteration →
translation → what it actually says (from `meaning`) → what it asks of you today (from
`application`) → the app as the way to get this daily, with a nod to the Worth Knowing layer.

### Files per run

**In `gyaan-daily` (8 files, one commit):**

1. `web/blog/<slug>/index.html`, `web/hindi/blog/<slug>/index.html`,
   `web/tamil/blog/<slug>/index.html` — each with `hreflang` alternates for the other two plus
   `x-default`, matching the pattern `build_site.py` already emits for the 12 static pages.
2. The three `blog/index.html` files — card inserted **immediately after** `<!-- BLOG_CARDS -->`
   (column 0, must survive).
3. `web/sitemap.xml` — three `<url>` entries with `xhtml:link` alternates, inserted before
   `</urlset>`, i.e. *below* `<!-- /SITE_URLS -->`. `build_site.py` rewrites only between the
   `SITE_URLS` markers precisely so cron entries survive.
4. `web/llms.txt` — a line under `## Blog`. Nothing generates this file.

**In `positivafilms.com` (1 file):** `content/queue.md` only. No post, no blog card, no sitemap
or RSS entry — that is what "routed, not mirrored" means.

### ⭐ Commit order must be the reverse of the Bharometer flow

Today the queue is marked published in the same commit as the positiva post, and the Bharometer
mirror runs after (`api/blog-generate.ts:218-256`) — safe, because positiva already has the
article if the mirror fails. With routing there is no positiva copy, so:

1. Commit to gyaan-daily **first**.
2. Only on success, commit `content/queue.md` alone to positiva.
3. On failure, leave the queue untouched and return the error — the next run retries the topic.

### Files to change in this repo

| File | Change |
|---|---|
| `api/_lib/github.ts` (after 29) | `GYAANDAILY_REPO: RepoTarget` — `repo: "gyaan-daily"`, `branch: "main"`, env-overridable. Mirrors `BHAROMETER_REPO`. |
| `api/_lib/queue.ts` | parse `verse:` and `language:`; record the used verse id in `markPublished`. |
| `api/_lib/render.ts:26` | add `"gyaandaily"` to the `pack` union — the compiler then **forces** `PACK_IMAGE`/`HERO_IMAGE`/`PACK_LINK` entries, a useful guarantee nothing is half-done. |
| `api/_lib/prompt.ts:190` | add `"gyaandaily"` to the tool-schema `enum`. **The real blocker** — without it the model cannot emit the value at all. |
| `api/_lib/prompt.ts:167, 192` | inline-CTA hrefs and pack-selection guidance. |
| `api/_lib/gyaandaily.ts` (new) | Pure string rendering for all three languages + index cards + sitemap + llms lines. Mirrors `api/_lib/bharometer.ts`. |
| `content/gyaandaily-post-template.html` (new) | Gyaan Daily chrome with `{{…}}` placeholders and an `hreflang` block. |
| `api/blog-generate.ts:167-256` | Branch on `product === "gyaandaily"`: fetch the verse pool, pick a verse, skip the positiva render, commit gyaan first, then the queue-only commit. |
| `content/AGENT.md` | **Rewrite** the Gyaan Daily sheet for the verse-led format: the app facts, the verse-splicing ban, the paid-tier `note` rule, the character restrictions, and the three-language structure. |
| `content/queue.md` | The new section — written after the cadence is chosen from Part 1. |

### Four gates every generated post must pass

- **Chrome-stamper regexes** (`tools/build_blog_chrome.py`) are file-wide with `re.S`. If
  `<meta name="theme-color"`, `<footer class="footer"`, `</head>` or `</body>` appear **inside
  `<main>`**, the stamper silently deletes the rest of the article. Ban them in the body. The
  stamper only re-normalises chrome and never builds it, so the generated file must ship the
  complete chrome already — copy an existing post and replace only the `<title>` /
  `<meta description>` / `<link canonical>` lines and the `<main>` block.
- **Copy sweep** (`tools/copy-sweep.py`, exits 1 on any hit): bans `—`, `–`, `→`, fourteen
  buzzwords and eight reverse-engineering terms, all as case-insensitive **substrings** — so
  "teardown", "unlocked", "elevated" and "delightful" all fail. ⚠️ It is **English-only**, so
  the Hindi and Tamil bodies pass unchecked. Accepted risk per the decision above.
- **CSP** (`web/vercel.json`): `script-src 'self'`, `font-src 'self'`, `img-src 'self' data:`.
  No external asset of any kind.
- **Font subset** — handled by 2c and 2e. Prose outside the verse stays ASCII plus
  `' ' " " … · •` in the English version.

**Markup is narrow:** bare `<p>`, `<h2>`, `<em>`, `<strong>`, `<ul>/<li>`, inside `.doc`. There
is **no `blockquote` rule, no pull-quote class, no `<pre>`/`<code>`, no `figure`** in
`site.css`. For the verse block, copy the inline-styled `<p>` pattern at
`web/blog/the-note-under-the-verse/index.html:45-48` literally. Posts carry no JSON-LD, no
OpenGraph, no byline, no read time — matching the two existing posts.

⚠️ **The stylesheet href carries a content hash** (`/assets/site.css?v=<sha1[:10]>`). Read it
from the live `web/blog/index.html` rather than hardcoding, or a CSS change leaves new posts
pointing at a stale URL.

---

## Part 4 — GitHub token scope

The fine-grained `GITHUB_TOKEN` needs `contents:write` on **`DigiTallyINC/gyaan-daily`**, or
every run fails at the commit step. Manual change in GitHub token settings, not code.

---

## Order of work

1. **Part 1** (ATLAS route) — standalone; unblocks the cadence decision.
2. **Choose the cadence** from the route, then write the queue lines.
3. **Part 2** (branch, Vercel, verse pool, trilingual blog structure, fonts).
4. **Part 4** (token scope).
5. **Part 3** (cron) — last, because it is the only part that can publish wrongly.

Back up before Parts 2 and 3: snapshot to
`E:\_backups\<project>\<date>-gyaandaily-blog-routing` before editing either repo.

## Verification

- **ATLAS:** the route paints real rows; a corrupted queue path yields the honest sentence, never
  a bare `0`; `verify_v2.py`, `checks_data_spine.py`, `checks_p5_p7.py` pass.
- **Verse pool:** every row in each `blog-verses-*.json` has all five written fields and **no
  `note` key**; assert that explicitly, since a leaked paid field is invisible on the page.
- **Verse fidelity — the one that matters most:** for a generated post, assert the rendered
  `text`, `transliteration`, `author` and `citation` are **byte-identical** to the pool row.
  Not "looks right" — a byte comparison. This is the check that would have caught the 18
  damaged Tamil rows.
- **Cron, before any live run:** `npx tsc --noEmit` clean, then exercise the pipeline offline
  with `_archive/cron-dryrun.mts` against a `gyaandaily` topic. Run `copy-sweep.py`,
  `build_blog_chrome.py` and `subset_fonts.py` over the output in a scratch checkout and confirm
  all three pass, including no `tofu` failure.
- **First live run:** trigger manually rather than waiting for the cron. Confirm all three URLs
  return 200, each carries `hreflang` pointing at the other two, cards appear on all three blog
  indexes, sitemap and llms.txt updated, **and positivafilms.com did NOT gain a post** — that
  last one is the actual test of the routing.
- **Queue integrity:** `content/queue.md` advanced by exactly one and recorded the verse id; a
  deliberately failed gyaan commit leaves the queue untouched.
