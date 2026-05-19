/* ── Vercel serverless function: create Razorpay order ───────────────── */
/*
  POST /api/create-order
  Body: { amount: Number (in currency units, e.g. 4500 for ₹4500), currency: 'INR'|'USD' }
  Returns: { order_id, amount, currency, key_id }

  Env vars required (set in Vercel dashboard):
    RAZORPAY_KEY_ID     – rzp_test_… (test) or rzp_live_… (live)
    RAZORPAY_KEY_SECRET – your Razorpay secret key (NEVER in client code)
*/

export default async function handler(req, res) {
  /* ── CORS preflight ── */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency = 'INR' } = req.body || {};

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Razorpay env vars not set');
    return res.status(500).json({ error: 'Payment gateway not configured' });
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  /* Razorpay expects amount in smallest currency unit (paise for INR, cents for USD) */
  const amountInSmallestUnit = Math.round(Number(amount) * 100);

  let razorpayRes, orderData;
  try {
    razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInSmallestUnit,
        currency,
        receipt: `rcpt_${Date.now()}`,
      }),
    });
    orderData = await razorpayRes.json();
  } catch (err) {
    console.error('Razorpay fetch error:', err);
    return res.status(502).json({ error: 'Could not reach payment gateway' });
  }

  if (!razorpayRes.ok) {
    console.error('Razorpay order error:', orderData);
    return res.status(400).json({
      error: orderData?.error?.description || 'Order creation failed',
    });
  }

  return res.status(200).json({
    order_id: orderData.id,
    amount:   orderData.amount,
    currency: orderData.currency,
    key_id:   keyId,           /* safe to return — key_id is public */
  });
}
