module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  return res.status(200).json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  });
};
