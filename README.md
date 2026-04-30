# Positiva Films — Website

Static marketing site for Positiva Films, deployed on **Vercel**, with Razorpay-powered checkout for the LUT packs on `luts.html`.

```
.
├─ api/
│  ├─ create-order.js     # POST — creates a Razorpay Order (server-authoritative pricing)
│  ├─ verify-payment.js   # POST — HMAC-verifies the checkout signature
│  └─ config.js           # GET  — exposes the public Razorpay Key ID to the frontend
├─ luts.html              # Product page with Razorpay Standard Checkout integration
├─ thank-you.html         # Post-payment confirmation page
├─ index.html, blog.html, products.html
└─ package.json           # razorpay SDK dependency
```

---

## 1. Razorpay account setup

1. Sign in at **https://dashboard.razorpay.com**.
2. Complete **KYC / Account Activation** — your business needs to be activated to accept live payments. Until KYC is approved, you can only operate in **Test Mode** (toggle bottom-left of the dashboard).
3. Go to **Account & Settings → Website and app details** and add `https://www.positivafilms.com` (or your live domain) as an authorized website. Razorpay enforces this for live mode.

## 2. Get your API keys

1. Dashboard → left sidebar → **Account & Settings → API Keys** (under the **Developers** section, or directly: *Account & Settings* page).
2. Click **Generate Test Key** (and later **Generate Live Key** after activation).
3. Razorpay shows the **Key ID** and **Key Secret** *once*. Copy both immediately.
   - `Key ID` looks like `rzp_test_XXXXXXXXXXXX` (test) or `rzp_live_XXXXXXXXXXXX` (live).
   - `Key Secret` is shown only at creation time — store it in a password manager.

## 3. Add the keys to Vercel

In your Vercel project: **Settings → Environment Variables**, add the two keys for the **Production**, **Preview**, and **Development** environments:

| Name                  | Value                                  | Environments                  |
|-----------------------|----------------------------------------|-------------------------------|
| `RAZORPAY_KEY_ID`     | `rzp_test_…` or `rzp_live_…`           | Production, Preview, Dev      |
| `RAZORPAY_KEY_SECRET` | the secret shown when you generated it | Production, Preview, Dev      |

After saving, **redeploy** (Deployments → … → Redeploy) so the functions pick up the new env vars.

> The `Key ID` is also exposed publicly through `/api/config` so the frontend can initialise Razorpay Checkout — that's safe and expected. The `Key Secret` *never* leaves the server.

## 4. Local development

```bash
npm install
npx vercel dev          # serves the site + /api/* functions on http://localhost:3000
```

Create a `.env.local` (Vercel CLI reads it automatically; never commit it):

```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

## 5. Test the flow

1. Open `/luts.html` and click **Buy Now**.
2. Razorpay's hosted modal opens. Use a **test card**:
   - Card number: `4111 1111 1111 1111`
   - Expiry: any future date · CVV: any 3 digits · OTP: `1234`
3. On success the browser hits `/api/verify-payment`, which HMAC-verifies the signature, then redirects to `/thank-you.html?sku=…`.
4. In the Razorpay dashboard, **Transactions → Payments** should show the captured payment.

## 6. Going live

1. Complete KYC and switch the dashboard to **Live Mode**.
2. Generate **Live API keys** and replace the test values in Vercel.
3. Redeploy.
4. Run a real ₹1 transaction end-to-end to confirm.

## 7. Pricing source-of-truth

Prices live in [`api/create-order.js`](api/create-order.js) — the catalog dictionary is the only place server-side code trusts. The `data-amount` on the buttons is for display only; the API never reads it.

| SKU                    | Amount  | Currency |
|------------------------|---------|----------|
| `luts-indian-wedding`  | ₹480    | INR      |
| `luts-creative`        | ₹480    | INR      |
| `luts-bundle`          | ₹720    | INR      |

To change a price, edit the `CATALOG` in `create-order.js` *and* the matching `data-amount` / display copy in `luts.html`.

## 8. Digital file delivery

Razorpay does **not** deliver digital files automatically with Standard Checkout — it only handles payment. For the `.cube` files we currently rely on a manual email after each successful payment. To automate this, see the "Automated fulfillment" section below (TODO: pick a delivery option).
