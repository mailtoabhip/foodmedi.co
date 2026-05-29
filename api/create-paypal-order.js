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

    const { amount, currency = 'USD' } = body;
    if (!amount) return res.status(400).json({ error: 'Amount required' });

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
    if (!tokenData.access_token) throw new Error('Failed to get PayPal access token: ' + JSON.stringify(tokenData));

    /* ── Build return URLs ── */
    const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://foodmedi.co';

    /* ── Create order ── */
    const orderRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: currency, value: parseFloat(amount).toFixed(2) },
          description: 'FoodMedi.Co - Clinical Nutrition Consultation',
        }],
        application_context: {
          brand_name:   'FoodMedi.Co',
          user_action:  'PAY_NOW',
          return_url:   `${siteUrl}/?paypal=success`,
          cancel_url:   `${siteUrl}/?paypal=cancel`,
        },
      }),
    });

    const orderData = await orderRes.json();
    if (orderData.name === 'UNPROCESSABLE_ENTITY' || orderData.error)
      throw new Error(orderData.message || orderData.error_description || 'PayPal order creation failed');

    const approvalUrl = orderData.links?.find(l => l.rel === 'approve')?.href;
    if (!approvalUrl) throw new Error('No approval URL in PayPal response');

    return res.status(200).json({ id: orderData.id, approvalUrl });
  } catch (err) {
    console.error('[paypal create-order]', err);
    return res.status(500).json({ error: err.message });
  }
}
