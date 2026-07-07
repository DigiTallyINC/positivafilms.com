# Blog: app-forward era (2026-07-07)

Tally's direction: the blog must cover ALL products including the apps, with apps
pushed harder than everything else.

## Decisions (Tally)
- Apps covered now: PasteKaro (live) + Bharometer (App Store submission 2026-07-07);
  other apps join the queue when they have a live destination.
- Weekly pattern: **APP · TOOL · BROADER** (apps lead every week; TOOL slot rotates
  SuperGrade / ClipEngine AI / existing LUT topics; BROADER keeps the craft audience).

## What changed
- **queue.ts** — parses `type: APP|TOOL` and a new `product:` field.
- **prompt.ts** — practitioner-persona extension for product posts, PRODUCT HONESTY
  RULE (claims only from fact sheets), schema enums: `category_label` + `cta.pack`
  extended; inline-cta spec now has APP ("From Positiva Studios") and TOOL ("From the
  Positiva Workbench") variants with a fixed href allowlist.
- **render.ts** — CTA link/image/og maps per product (PasteKaro/Bharometer/SuperGrade/
  ClipEngine); external CTAs get target=_blank rel=noopener via `{{CTA_LINK_EXTRA}}`;
  product CTA images render 16:9.
- **blog-generate.ts** — validates extended packs + enforces `cta.pack === topic.product`.
- **post-template.html** — CTA href placeholder now absolute-capable.
- **blog.html** — new filter chips: Apps, Tools & Plugins (right after All Stories).
- **content/AGENT.md** — "App & tool posts" section: voice rules + per-product fact
  sheets (the ONLY permitted claims). Bharometer must NOT be claimed as on the App
  Store until launch is confirmed (CTA = bharometer.com).
- **content/queue.md** — new "App-forward era" section: 8 weeks (Jul 8 – Aug 24) of
  APP·TOOL·BROADER; 8 new app topics (4 PasteKaro, 4 Bharometer), 4 new tool topics
  (2 SuperGrade, 2 ClipEngine), 12 existing topics moved into TOOL/BROADER slots.
  Older queue sections continue after it drains.
- **images/cta/** — pastekaro/bharometer/clipengine hero screenshots + supergrade
  graded still, used as post CTA backgrounds and og:images.

## Verification
- `tsc --noEmit` clean; tsx smoke test: parseQueue picks the PasteKaro APP topic
  (product parsed), renderPost output has product CTA href/image/og, no unresolved
  placeholders, blog card gets data-cat="apps".

## Follow-ups
- When Bharometer clears App Review: update its fact sheet (App Store availability)
  and consider App Store badge in CTAs.
- When SehatVault / Remind Karo / Trace / English Seekho get live pages: add fact
  sheets + queue topics.
