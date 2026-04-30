const Razorpay = require('razorpay');

// Server-authoritative price book — never trust amounts from the client.
// Values are in the smallest currency unit (paise for INR).
const CATALOG = {
  'luts-indian-wedding': { amount: 48000, currency: 'INR', name: 'Indian Wedding LUTs Pack' },
  'luts-creative':       { amount: 48000, currency: 'INR', name: 'Creative LUTs Pack' },
  'luts-bundle':         { amount: 72000, currency: 'INR', name: 'LUT Bundle (Both Packs)' },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'razorpay_not_configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const sku = body && body.sku;
  const item = sku && CATALOG[sku];
  if (!item) {
    return res.status(400).json({ error: 'unknown_sku' });
  }

  const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

  try {
    const order = await rzp.orders.create({
      amount: item.amount,
      currency: item.currency,
      receipt: `pf_${sku}_${Date.now()}`,
      notes: { sku, product: item.name },
    });
    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('razorpay_order_create_failed', err && err.error ? err.error : err);
    return res.status(502).json({ error: 'order_create_failed' });
  }
};
