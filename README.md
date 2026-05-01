# Positiva Films — Website

Static marketing site for Positiva Films. Plain HTML / CSS / vanilla JS, no build step. Hosted as static files (Vercel-friendly, but no serverless functions in use).

## Pages

| Page | Purpose |
|---|---|
| [`index.html`](index.html) | Homepage — hero with YouTube ambient video, services, contact |
| [`products.html`](products.html) | Product hub — ClipEngine AI Chrome extension + LUT packs |
| [`luts.html`](luts.html) | LUT pack catalog — Indian Wedding, Indian Travel, Bundle. Buy buttons link out to SuperProfile |
| [`blog.html`](blog.html) | Blog index |

## LUT pack checkout

Checkout, payment, file delivery, and invoicing are handled entirely by **SuperProfile** (`superprofile.bio/positivafilms`). Buy buttons on `luts.html` are plain `<a target="_blank">` links to the SuperProfile product page for each SKU.

| SKU | Slug | Price | Live URL |
|---|---|---|---|
| Indian Wedding LUTs Pack | `indian-wedding-lut-pack` | ₹480 | https://superprofile.bio/vp/indian-wedding-lut-pack |
| Indian Travel LUTs Pack | `indian-travel-lut-pack` | ₹480 | https://superprofile.bio/vp/indian-travel-lut-pack |
| LUT Bundle (both packs) | `lut-bundle` | ₹720 | https://superprofile.bio/vp/lut-bundle |

The site is just a storefront; nothing about the payment flow lives in this repo.

## downloads/

Working directory for the digital products (the .cube files we sell). One subfolder per pack:

```
downloads/
├─ indian-wedding/   # 14 .cube files + README + zip
├─ indian-travel/    # 10 .cube files + README + zip
└─ bundle/           # combined zip with both packs as subfolders + README
```

The `.cube` files and `.zip` files are **gitignored** (they're the product). Only the `README.txt` files are tracked. To rebuild a zip, see the python one-liner in `_archive/README-razorpay-era.md` or just zip the contents manually.

When updating any product zip, **also re-upload it to the corresponding SuperProfile Payment Page** so future buyers get the new version.

## Cover images / assets

| File | Where used |
|---|---|
| `Indian_Wedding_Luts_pack.png` | LUT page card (Indian Wedding); also bundled inside the wedding zip |
| `Indian_Travel_Luts_pack.png` | LUT page card (Travel); bundled inside travel zip |
| `Bundle_Luts_pack.png` | LUT page card (Bundle); bundled inside bundle zip |
| `clipengine-mockup.png` | Products page — ClipEngine AI featured section, dashboard mockup |
| `clipengine-logo.svg` | Products page — replaces the "CLIPENGINE AI" heading |
| `positiva-films-logo.svg` | Footer wordmark across pages |

## Local development

No build, no dev server config required. Either:

- Open the HTML files directly in a browser, or
- Serve with anything: `python -m http.server 8000` then visit `http://localhost:8000/`.

## Deploy

Deploy as static files. Vercel: connect the repo, no settings needed (no build command, no install command, output directory is the repo root).

## `_archive/`

Local-only junk drawer (gitignored). Contains:
- `README-razorpay-era.md` — the previous README documenting the abandoned Razorpay direct-checkout integration. Useful as historical context if anyone wonders why the `api/` folder once existed.
- Old/unused asset experiments (logo render mp4s, AI-generated PNGs, etc.).
