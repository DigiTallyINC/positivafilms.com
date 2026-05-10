# Positiva Films — agent briefing

Static marketing site at the repo root (`index.html`, `luts.html`, `products.html`, `blog.html`, `posts/*.html`). Plain HTML, vanilla CSS in `<style>` blocks, vanilla JS in `<script>` blocks. Edit a file, refresh a browser.

The repo also contains an **autonomous blog cron** under `/api/` (Vercel serverless TypeScript) that publishes new `posts/*.html` files three times a week. The cron has its own `package.json` and `tsconfig.json` — but **none of it runs at page-serve time**. Visitors only ever see static HTML. Treat the two layers as separate concerns.

## Don't do

- **Don't add a build step or framework to the static site.** No Next.js, no Vite, no React. The HTML files render as-is. Adding TS/CSS preprocessing breaks the "edit a file, refresh a browser" workflow.
- **Don't import `/api/` code from any HTML file.** The serverless layer is publish-time, not serve-time.
- **Don't reintroduce checkout serverless functions.** Checkout is offsite (SuperProfile). The repo had Razorpay serverless functions once; they're gone — see `_archive/README-razorpay-era.md`. The blog cron is a different beast.
- **Don't commit `.cube` or `.zip` files in `downloads/`** — they're the product, gitignored.
- **Don't put support emails, license prose, or platform names in product READMEs** (the `README.txt` files inside `downloads/*/`). Keep them install + usage only — see `~/.claude/projects/.../memory/feedback_readme_minimalism.md`.

## LUT pack checkout — how it works

`luts.html` has three Buy buttons. Each is a plain `<a href target="_blank">` linking to a SuperProfile product page. SuperProfile handles payment, file delivery, invoicing.

To rewire a product after re-uploading a zip on SuperProfile: nothing needed in this repo (the URL doesn't change). Just push the new zip on the dashboard.

To launch a new pack: zip the .cubes → SuperProfile → new Payment Page → publish → paste the URL into a new `<a>` button on `luts.html`.

## Aesthetic conventions (already established)

- **Colors** are CSS custom properties at the top of each HTML file: `--ink`, `--ink-soft`, `--soil`, `--linen`, `--linen-dim`, `--linen-faint`, `--gold`, `--gold-dim`, `--gold-faint`. Use these, don't introduce new ones.
- **Cream-section pattern**: the LUT packs section on `luts.html` and the Pick Your Tool section on `products.html` use a cream `--linen` background with gold rules at top and bottom, dark cards on top, deep shadows. This is the "showroom" treatment for sales-focused sections. If adding another sales-focused section, mirror this.
- **Hover lifts** on product cards use a strong translateY (-22px to -40px) + scale + layered shadow. See `.hub-card:hover` in `products.html` for the canonical recipe.

## When the user asks you to copy-paste content

Any text the user will paste into a form/dashboard (page titles, descriptions, slugs, button labels) goes inside a fenced code block — one block per field. The user's UI renders code blocks with a copy button. See `feedback_copy_paste_boxes.md` in memory.

## Working directories

- Repo root — HTML pages, top-level images, SVGs, this file, README, .gitignore.
- `posts/` — generated blog post HTML files (one per post, written by the cron).
- `content/` — source material the cron reads: `queue.md` (topic backlog), `AGENT.md` (voice runbook), `post-template.html` (HTML template).
- `api/` — Vercel serverless functions (`blog-generate.ts` + `_lib/*.ts`). Only the cron uses these.
- `downloads/` — working dir for product zips (gitignored zips, gitignored cubes, tracked READMEs).
- `_archive/` — gitignored junk drawer for stale stuff. Don't put live assets here.

**Shoot Bazaar** is a separate project in its own folder/repo (`studios.positivafilms.com`). It is not part of this repo. Do not add Shoot Bazaar code, pages, or assets here.

## Blog cron architecture

```
Vercel cron (Mon/Wed/Fri 04:07 UTC) → api/blog-generate.ts
  → reads content/queue.md, content/AGENT.md, content/post-template.html, blog.html, sitemap.xml, rss.xml from GitHub
  → calls Anthropic API (sk-ant-...) with structured tool_use to generate the post
  → renders posts/<slug>.html, updates blog.html (promote featured + add card), sitemap, rss, queue
  → commits all 5 files in one commit via GitHub Trees API → pushes to master
  → Vercel auto-redeploys the static site with the new post
```

### Required Vercel env vars

Set in Vercel project → Settings → Environment Variables (see `.env.example`):

- `ANTHROPIC_API_KEY` — Anthropic API key (pay-as-you-go, NOT subscription-billed).
- `GITHUB_TOKEN` — fine-grained PAT with `contents:write` on this repo.
- `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` — repo coordinates (defaults: `DigiTallyINC`/`positivafilms.com`/`master`).
- `CRON_SECRET` — random hex string; must match the `Bearer` token Vercel cron sends.

### Editing the cron's behaviour

- Topics + cadence: `content/queue.md` (file order = publish order; cron picks first `[ ]`).
- Voice + structure rules: `content/AGENT.md` (the function injects this verbatim into the system prompt).
- Visual layout: `content/post-template.html`.
- Validation rules + tool schema: `api/_lib/prompt.ts` and `api/blog-generate.ts`.

## Recent significant changes

See `git log` for full history. As of this writing the site:

1. Was originally wired for Razorpay direct-checkout (Vercel serverless functions). That entire path was removed.
2. Migrated to SuperProfile for all 3 LUT packs.
3. Added "Indian Travel" pack (replaced what was originally "Creative" pack).
4. Bundle is generic — the description on SuperProfile says "every Positiva LUT pack" rather than naming specific packs, since a "Drone" pack is planned.
5. Added autonomous 3×/week blog system: text-only editorial design, Vercel cron + Anthropic API, queue-driven topic selection, 152 topics queued at launch.
