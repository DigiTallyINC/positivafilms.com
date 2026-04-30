const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ error: 'razorpay_not_configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sku } = body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  // timing-safe compare
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(razorpay_signature, 'utf8');
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!ok) {
    console.warn('razorpay_signature_mismatch', { razorpay_order_id, razorpay_payment_id, sku });
    return res.status(400).json({ error: 'invalid_signature' });
  }

  // Payment is verified. Fulfilment (emailing the .cube files) is handled
  // separately — see /api/razorpay-webhook.js for the source of truth.
  return res.status(200).json({ ok: true, sku: sku || null });
};
