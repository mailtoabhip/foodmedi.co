export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    body = body || {};

    const { orderID } = body;
    if (!orderID) return res.status(400).json({ error: 'orderID required' });

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret   = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !secret) return res.status(500).json({ error: 'PayPal credentials not configured' });

    /* ── Get access token ── */
    const auth     = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method:  'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    'grant_type=client_credentials',
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('Failed to get PayPal access token');

    /* ── Capture order ── */
    const captureRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
    });

    const captureData = await captureRes.json();
    return res.status(200).json(captureData);
  } catch (err) {
    console.error('[paypal capture-order]', err);
    return res.status(500).json({ error: err.message });
  }
}
