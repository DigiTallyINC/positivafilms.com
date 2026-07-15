# Bharometer Blog Push — dual-publish plan (2026-07-15)

Approved by Tally in chat 2026-07-15. Backup: `E:\_backups\positivafilms\2026-07-15-bharometer-blog-push` + `E:\_backups\bharometer\2026-07-15-blog-section`.

## Goal

Push Bharometer aggressively via the blog: **3 Bharometer posts per week for ~8 weeks (Jul 17 → Sep 11, ~24 posts)**, India-region-specific SEO, each post published to BOTH positivafilms.com/blog AND a new bharometer.com/blog — same article, two themes, canonical → bharometer.com.

## Root cause of stalled cron (fixed as part of this)

Cron published nothing after Jul 8: the Jul 7 anti-em-dash validation gate (`—|&mdash;|--` → throw) kills the run whenever the model slips one em-dash. The stuck first-queue topic (SuperGrade, code-heavy) fails this way with high probability; a failed run never advances the queue, so Jul 10/13/15 all died on it. Reproduced locally via `_archive/cron-dryrun.mts` (gitignored).

**Fix:** auto-sanitize `—`/`&mdash;` in all text fields after generation (title already did this); run the `--` check only outside `<code>`/`<pre>`; one retry with error feedback for remaining validation failures (slop phrases etc).

## Changes

### 1. positivafilms.com repo (`api/`)
- `blog-generate.ts` / `_lib`: sanitize + retry (above).
- Dual-publish: when queue line has `product: bharometer`, additionally render the article into the Bharometer post template and commit to `DigiTallyINC/bharometer` repo: `landing/blog/<slug>.html` + `.md` twin + `blog/index.html` card + `sitemap.xml` — via the same GitHub Trees API (new `commitFiles` target repo param).
- Positiva copy of a bharometer post carries `<link rel="canonical" href="https://bharometer.com/blog/<slug>.html">`.

### 2. bharometer repo (`landing/blog/`)
- New `blog/index.html` hub (navy/yellow theme, mirrors `guides/` pattern: shared `assets/style.css`, JSON-LD CollectionPage/Blog, PostHog snippet, .md twin, llms.txt + sitemap entries).
- `blog/post-template.html` with `{{PLACEHOLDERS}}` consumed by the cron.

### 3. Content (`content/`)
- `queue.md`: new "Bharometer push era" section — 8 weeks × 3 topics (Mon/Wed/Fri), 4 pillars: mileage truth (kitna deti hai), money (₹/km, price resets), ownership decisions (CNG/EV math), app workflow. Existing queued items pushed below (resume ~Sep 14).
- `AGENT.md`: Bharometer-post rules — India-specific, NO petrol-company/car-brand names (global brand-scrub rule), dual-publish fields, claims only from fact sheet.

### 4. Ops (Tally, web UI)
- Widen cron `GITHUB_TOKEN` (fine-grained PAT) to also cover `DigiTallyINC/bharometer`.
- Git-connect Vercel project `bharometer` to the GitHub repo, root directory `landing`, prod branch `master` → cron commits auto-deploy. (Replaces manual `vercel deploy --prod`.)

### 5. Verify
- Local dry-run of a bharometer topic (no commit) → validates generation + both renders.
- Manual authorized cron trigger (Tally) or next scheduled run → confirm posts live on both domains.

## SEO notes
- Canonical for bharometer posts → bharometer.com (domain push). Positiva keeps the reader-facing copy.
- Post-push (from ~Sep 14): queue reverts to APP·TOOL·BROADER with Bharometer holding the weekly APP slot.
