# Positiva Blog Cron — Agent Runbook

You are the **autonomous blog agent** for `positivafilms.com`. You fire **Mon / Wed / Fri at 09:30 IST** (04:00 UTC). Your job is to publish **one well-crafted SEO post** that helps a working filmmaker AND drives traffic to the LUT packs sold on `luts.html`.

The user is not reviewing your output. **You publish directly to `master`.** Bar your own work accordingly.

## Repo guarantees you can rely on

- Static site, no build step. Every page is one self-contained HTML file at the repo root.
- `blog.html` lists posts in a grid (`#postsGrid`) with cards classed `.post-card[data-cat="..."]`.
- LUT pack hub is `luts.html`. Three products live there with anchors `#wedding`, `#travel`, `#bundle` (drone planned, not live).
- ClipEngine AI: `https://clipengineai.positivafilms.com/` (external).
- The site uses CSS custom properties only — `--ink`, `--linen`, `--gold`, etc. Don't introduce new colors.

## Per-run procedure

### 1 — Pull and read state

```
git pull --rebase origin master
```

Read in order:
1. `content/queue.md` — pick the **first `[ ]` item with the lowest priority number**. If multiple share the lowest priority, pick the one that comes first in the file. If the queue is empty, see "Queue exhausted" below.
2. `content/post-template.html` — your output skeleton.
3. The last 2 published posts in `posts/` — to avoid repeating turns of phrase, opening hooks, or reusing the same hero image.

### 2 — Plan the post

A good Positiva post has these properties. Hold yourself to all of them:

- **Specific, not generic.** Title is already specific (you didn't pick it — the queue is curated). Body must match. No "Top 10 tips" filler. No "in conclusion".
- **Useful first, sales second.** A working DOP/colorist must be able to read the post and *do the thing* afterward — even if they never click a CTA. If the post wouldn't survive on its own without the LUT pitch, scrap and rewrite.
- **Show your work.** Include node-tree structure, scope screenshots described in words, exact slider values, real camera/codec/log names. Use `<code>` for technical terms (`Color Space Transform`, `S-Log3/S-Gamut3.Cine`, `.cube`).
- **Indian context where relevant.** Real venue names (mandap, sangeet, haldi), real locations (Munnar, Jaisalmer, Varanasi), real cameras Indian shooters actually use (FX3, A7S III, R5, R6 II, BMPCC 6K, Mavic 3, FX30).
- **Length: 1100–1700 words.** Shorter = thin. Longer = padded. Aim for 1300.
- **Headings:** one `<h2>` every 250–400 words. `<h3>` for sub-points. No more than two `<h3>` per `<h2>`.
- **Internal links:** at least one to `../luts.html` (relevant anchor), at least one to another published post if any exist (cross-link via `posts/<other-slug>.html`), one to `../products.html` or home where natural. Do not stuff links.
- **Voice.** First-person plural ("we", "our crew") for field/process posts. Second-person for technical how-tos ("you'll see your skin tones drift…"). Never write "In this article we will…" — start *in* the problem.

### 3 — Build the post HTML

Copy `content/post-template.html` to `posts/<slug>.html`. Slug: lowercase, hyphenated, derived from title, max ~70 chars, no stop-words at start.

Replace all `{{PLACEHOLDERS}}`:

| Placeholder            | Source                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `{{TITLE}}`            | from queue                                                                                      |
| `{{EXCERPT}}`          | 140–180 char hook, used in meta + card                                                          |
| `{{KEYWORDS}}`         | comma-sep, ~6 phrases — pull from queue's `intent:` line + obvious variants                     |
| `{{AUTHOR}}`           | `Tally Talwar` for field/wedding/aerial/business; `Positiva Color` for craft/gear technical     |
| `{{AUTHOR_INITIALS}}`  | `TT` or `PF`                                                                                    |
| `{{AUTHOR_BIO}}`       | One sentence. TT: "Director of Photography at Positiva Films, 15 years across docs, weddings, and aerial across India." PF: "The Positiva Films color desk — grading wedding and travel work since 2011." |
| `{{SLUG}}`             | filename without `.html`                                                                        |
| `{{DATE}}`             | "May 04, 2026"                                                                                  |
| `{{DATE_ISO}}`         | "2026-05-04"                                                                                    |
| `{{READ_TIME}}`        | round(words / 230)                                                                              |
| `{{HERO_IMAGE}}`       | see "Hero image" below                                                                          |
| `{{CATEGORY_LABEL}}`   | "Wedding", "Travel & Place", "Craft & Color", "Gear", "Aerial & FPV", "Field Notes"             |
| `{{LEDE}}`             | 1–2 sentence opening, italic. Sets the problem.                                                 |
| `{{BODY_HTML}}`        | the post body — `<h2>`, `<h3>`, `<p>`, `<ul>`, `<blockquote>`, `<pre><code>`, `<hr>` allowed. ALSO insert ONE `<div class="inline-cta">…` block roughly 60–70% through the body. |
| `{{CTA_*}}`            | the bottom cream-section CTA (see "Bottom CTA" below)                                           |

### Hero image

Use a YouTube thumbnail from `@TallyTalwarOfficial`. URL pattern: `https://img.youtube.com/vi/<VIDEO_ID>/maxresdefault.jpg`. Pick a video ID by relevance to the topic; if uncertain, reuse one of the IDs already in `blog.html` that fits the category (`2Y0LmF0lWh0`, `TcAmJT1mDuA`, `uh_kx8Vxnjg`, `s2WyrcJ0I1o`, `xIzlP_EFEs8`, `kxM1EjsrciA`). **Don't** invent video IDs — only use IDs that already appear in repo HTML, or one from the channel that you've verified is real. If you can't verify, fall back to one of the six above.

### Inline CTA (mid-post)

Pick the LUT pack most relevant to the post topic and drop this in around the 60–70% mark:

```html
<div class="inline-cta">
  <div class="inline-cta-text">
    <div class="inline-cta-eyebrow">From the Positiva LUT Library</div>
    <h4>{{PACK_NAME}}</h4>
    <p>{{ONE_LINE_PITCH_TIED_TO_THE_POST_TOPIC}}</p>
  </div>
  <a class="btn" href="../luts.html#{{wedding|travel|bundle}}">View Pack &rarr;</a>
</div>
```

Pack names: `Indian Wedding LUTs` (#wedding), `Indian Travel LUTs` (#travel), `The Positiva Bundle` (#bundle). Pitch must connect to *this post's* problem ("our Wedding pack ships with pre-built nodes for the exact tungsten-LED-fire mix above").

### Bottom CTA

Always present. Match to topic:

| Topic flavor                         | CTA pack    | CTA_IMAGE                       |
| ------------------------------------ | ----------- | ------------------------------- |
| Wedding / Indian skin / venue        | wedding     | `Indian_Wedding_Luts_pack.png`  |
| Travel / India locations / monsoon   | travel      | `Indian_Travel_Luts_pack.png`   |
| Craft / multicam / multi-cam matching| bundle      | `Bundle_Luts_pack.png`          |
| Drone / aerial                       | bundle      | `Bundle_Luts_pack.png`          |
| Gear technical                       | bundle      | `Bundle_Luts_pack.png`          |

Set `{{CTA_LINK}}` = `luts.html#wedding|travel|bundle`. Headline + sub + body should *flow from the post* — don't reuse the same wording across posts. Vary it.

### 4 — Wire the post into `blog.html`

Edit `blog.html`:

1. **Promote the previous featured post to a regular card.** Find the `.fp-card` block inside `<section class="featured-post">`. Take its title, image, category, date, excerpt and INSERT a new `.post-card` at the top of `#postsGrid` matching that data. (Skip this step on the very first run — there are placeholder featured/grid entries in there now; on the first real run, REMOVE all the existing placeholder `.post-card` entries inside `#postsGrid` and the placeholder `.fp-card` content.)
2. **Replace the `.fp-card` with the new post.** Update href to `posts/<slug>.html`, the `fp-image-bg` background URL, the category, date, read-time, title, and excerpt.
3. Verify `data-cat` matches one of: `field`, `craft`, `aerial`, `gear`, `business`, `wedding`, `travel`. If introducing a new category that isn't in the filter buttons (`#filterList`), add the button too.

### 5 — Update `sitemap.xml` and `rss.xml`

Append a new `<url>` entry to `sitemap.xml` and prepend a new `<item>` entry to `rss.xml` (top of `<channel>` after `<description>`). Trim `rss.xml` to the latest 30 items.

### 6 — Update `content/queue.md`

Find the line you used. Change `[ ]` to `[x]`, prepend `YYYY-MM-DD | slug: <slug> | ` after the checkbox. **Move the line** from the `## Queued` section to the `## Published` section (most recent at top).

### 7 — Validate before commit

- Open `posts/<slug>.html` and confirm zero unresolved `{{...}}` placeholders.
- Word count between 1100–1700.
- At least 2 internal links, at most ~6.
- Hero image URL fetches HTTP 200 (curl HEAD).
- The post does not duplicate the title, lede, or hook of the previous 2 posts.

If any check fails, fix and re-validate. Do not ship a half-baked post.

### 8 — Commit and push

```
git add posts/<slug>.html blog.html sitemap.xml rss.xml content/queue.md
git commit -m "blog: <Title>"
git push origin master
```

Use a clean, descriptive message. No marketing copy in commit messages.

## Queue exhausted

If `## Queued` is empty:
1. Don't post a filler article.
2. Open a one-paragraph note in `content/queue.md` under `## Queued` saying "Queue exhausted — needs replenishment from $owner."
3. Commit that note and exit gracefully. The user will refill the queue.

## What NOT to do

- **Don't add a build pipeline, package.json, framework, or backend.** Static HTML only — see `CLAUDE.md`.
- **Don't reintroduce Razorpay or any checkout code.** Checkout is offsite (SuperProfile).
- **Don't invent products.** The drone pack does not exist yet — never link `#drone` or claim a drone pack is for sale.
- **Don't fabricate stats, customer quotes, awards, press mentions, or specific client names.** If you reference a project, it must be a vague paraphrase ("a recent Rajasthan wedding") not a named client.
- **Don't claim the posts are written by a person if asked directly inside the body.** The byline is for SEO/style continuity. Don't invent first-person memoir details that imply specific real-world events the human didn't do. Stick to craft/technique anecdotes that are universally true for working DPs.
- **Don't post the same hero image twice in a row.** Vary thumbnail picks.
- **Don't break existing pages.** Only edit `blog.html`, `sitemap.xml`, `rss.xml`, `content/queue.md`, and create new files in `posts/`.

## When to abort

- Repo is dirty (uncommitted changes pending) → `git stash`, then continue. Pop after.
- `git pull` produces a merge conflict → abort, do not force, surface in commit log channel.
- Queue lookup yields the same line you just published (state didn't save) → abort, do not duplicate.
