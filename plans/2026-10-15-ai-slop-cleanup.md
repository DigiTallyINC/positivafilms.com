# Site-wide AI-slop clean-up (visible text only)

## Context
Tally wants every page visitors can see on positivafilms.com cleaned of AI slop, using the rules in
petergyang/no-ai-slop (copies in `plans/ai-slop-rules/`; line-by-line findings in `plans/2026-10-15-ai-slop-findings.md`).
**Scope is front-end visible text only.** Cron code, AGENT.md, prompt.ts, comments, JSON-LD,
index.md and llms.txt are out of scope (Tally: "rest everywhere is fine").

Decisions taken (tick-box, 2026-10-15):
- Main pages: **remove every dash + fix clear slop**, minimal edits, keep voice and brand lines
  ("Copy. Paste. Karo.", "EVERY FRAME HAS A STORY" stays unless it is a straight cliché repeat).
- Blog posts: **fix the broken punctuation + worst slop**, each post keeps its shape.
- Extras: tab titles / og / twitter / meta descriptions; number ranges ("5–15%" → "5 to 15%");
  the one `<title>` line in `content/post-template.html`. **Arrows stay.**

## Step 0: backup
Copy repo (excluding `node_modules`, `.vercel`, `_archive`, `downloads/*.zip|*.cube`) to
`E:\_backups\positiva-films-website\2026-10-15-ai-slop-cleanup`.

## Step 1: main pages (hand edits with Edit tool)
Files: `index.html`, `luts.html`, `products.html`, `supergrade.html`, `blog.html`, `apps.html`.
Work from the detect report (line refs in this session's scan). Patterns:
- **Title separators** in `<title>`, og:title, twitter:title: `X — Positiva Films` → `X | Positiva Films`.
  SuperGrade: `SuperGrade: DaVinci Resolve Grade Plugin | Positiva Films`.
- **Prose dashes** (incl. alt, aria-label, button labels, visible JS strings such as the
  supergrade.html caption array ~599–604 and index.html copy-markdown strings ~901–932):
  replace with full stop, comma, colon or parentheses, whichever reads naturally. No double colons.
- **Ranges**: `₹1–2 lakh` → `₹1 to 2 lakh` etc. (blog.html 462/476/490/518).
- **Clear slop** (minimal rewording): binary contrasts ("No Instagram filters, this is…",
  "feel shot, not rendered", "Four catalogues, not one" repeated 3× on apps.html → keep once),
  "actually/exactly/Absolutely" filler, "accelerates your workflow", "built from first principles
  in real colour science" (products + supergrade), "Built by contributors, for contributors",
  "Built with love, for you", decorative mid-sentence `<strong>` on apps.html (5), "beautifully
  simple" on Trace card.
- **Footer tagline** shared by all 6 pages ("We craft cinematic stories that move people… bring
  your vision to life"): replace once with one plain line, same on every page.
- **blog.html cards**: repair the dash-swap leftovers (double colons, `: and`, comma splices,
  ~12 lines) and the worst excerpt slop; card titles must match the post titles after Step 2.
- Do NOT touch CSS/JS/HTML comments or JSON-LD.

## Step 2: blog posts (`posts/*.html`, 50 files)
Python script (no PowerShell text edits) for the mechanical part, hand/agent edits for prose:
1. `<title>` (+ og/twitter title) `&mdash;` → `|` in the 26 newer posts.
2. Numeric en dashes (~288, incl. meta/og descriptions in 4 fuel posts) → " to "; the two
   minus-sign uses in sangeet-tungsten (`–2 to –4°`) → "−2 to −4°"(minus sign) or "-2".
   Skip `<pre>`/`<code>`.
3. **Dash-swap damage** (hand-fixed, read each): 16 double-colon titles (`…FX3: and the Single
   Node…: Positiva Films`), 34 colon pairs in prose (worst: dgca-drone, color-space-transform,
   monsoon-greens, color-grading-mandap), comma splices in newer posts (e.g. logging-fill-up-scan
   264, 296).
4. **Worst slop**: the ~45 "This is not X. It is Y." lines → state Y; the 2 "No X. No Y." runs;
   "seamless" (premiere-vs-resolve 231), "unlock" (color-grading-mandap 231/235), "more robust"
   (fx3-vs-fx6 258, lav-mic 280); fake-profound last lines where they are pure kicker.
   Literal uses (unlocked APK, elevated terraces) stay. Arrows stay.
5. If a post title changes, mirror it in blog.html card, `rss.xml` and the post's own h1/og.
Split posts across up to 3 parallel agents (by file list), each given the no-ai-slop rules and
told: minimal edits, keep shape, no new claims, no dashes introduced.

## Step 3: template for future posts
`content/post-template.html` line 6: `{{TITLE}} &mdash; Positiva Films` → `{{TITLE}} | Positiva Films`.
Nothing else in the cron.

## Not changed, flag to Tally
- "15+ Years" (index 559) vs "over a decade" (index 496): pick one.
- products.html meta description promises stock footage and FPV drone bundles the page doesn't sell.

## Verification
- Python check over the 6 pages + 50 posts that strips `<style>`, `<script>` comments, HTML
  comments and JSON-LD, then counts `—`, `&mdash;`, `&#8212;`, `–`, `&ndash;` in what remains
  (incl. title/meta/alt/aria and visible JS strings). Target: 0. First run it on the backup to see
  it report the known ~100+ (proves the check can fail).
- Grep for `: and `, `::`, and the banned words (seamless, robust, unlock, leverage, delve) → 0 in prose.
- Open index, luts, supergrade (drag caption), blog and 2 posts in a browser; read the edited lines.
- Commit, push to master, wait for the Vercel deploy, fetch the live pages and grep the same
  distinctive new strings (e.g. new footer line, one fixed post title).
- Update memory `project_apps_page_code_look.md` "Still open" line; add a memory for this pass.
