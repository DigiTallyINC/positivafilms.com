# Positiva Films — agent briefing

Static marketing site. No build step, no framework, no package.json. Plain HTML files at the repo root, vanilla CSS in `<style>` blocks, vanilla JS in `<script>` blocks. Edit a file, refresh a browser.

## Don't do

- **Don't add a build pipeline, framework, bundler, or `package.json`.** The site is intentionally zero-dependency.
- **Don't add backend code or serverless functions.** Checkout is offsite (SuperProfile). The repo had Razorpay serverless functions once; they're gone — see `_archive/README-razorpay-era.md` for context. Don't reintroduce them unless explicitly asked.
- **Don't commit `.cube` or `.zip` files in `downloads/`** — they're the product, gitignored.
- **Don't put support emails, license prose, or platform names in product READMEs** (the `README.txt` files inside `downloads/*/`). Keep them install + usage only — see `~/.claude/projects/.../memory/feedback_readme_minimalism.md` for the rule.

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

- Repo root has the HTML pages, top-level images, SVGs, this file, README, .gitignore.
- `downloads/` — working dir for product zips (gitignored zips, gitignored cubes, tracked READMEs).
- `_archive/` — gitignored junk drawer for stale stuff. Don't put live assets here.

## Recent significant changes

See `git log` for full history. As of this writing the site:

1. Was originally wired for Razorpay direct-checkout (Vercel serverless functions). That entire path was removed.
2. Migrated to SuperProfile for all 3 LUT packs.
3. Added "Indian Travel" pack (replaced what was originally "Creative" pack).
4. Bundle is generic — the description on SuperProfile says "every Positiva LUT pack" rather than naming specific packs, since a "Drone" pack is planned.
