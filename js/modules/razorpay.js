/* ── Razorpay client integration ─────────────────────────────────────── */

/* Load checkout.js once, reuse on subsequent calls */
function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = resolve;
    s.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(s);
  });
}

/*
  initiatePayment({ amount, currency, serviceName, name, email, phone, onSuccess, onDismiss, onError })
    amount      – numeric, in currency units (e.g. 4500 for ₹4,500)
    currency    – 'INR' | 'USD'
    serviceName – shown as the payment description
    name/email/phone – prefill in the Razorpay modal
    onSuccess(response) – called with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
    onDismiss() – called when user closes without paying
    onError(msg) – called on failure
*/
export async function initiatePayment({
  amount, currency, serviceName,
  name, email, phone,
  onSuccess, onDismiss, onError,
}) {
  try {
    await loadScript();

    /* Create order on our serverless function */
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${res.status}`);
    }

    const { order_id, key_id } = await res.json();

    const isInternational = currency !== 'INR';

    const rzp = new window.Razorpay({
      key:         key_id,
      amount:      Math.round(Number(amount) * 100),
      currency,
      order_id,
      name:        'FoodMedi.Co',
      description: serviceName,
      image:       '/assets/logo.png',
      prefill:     { name, email, contact: phone },
      theme:       { color: '#137A48' },

      /* Show PayPal as first option for international (USD) payments */
      ...(isInternational && {
        config: {
          display: {
            blocks: {
              paypal: {
                name: 'Pay using PayPal',
                instruments: [{ method: 'wallet', wallets: ['paypal'] }],
              },
            },
            sequence: ['block.paypal', 'block.default'],
            preferences: { show_default_blocks: true },
          },
        },
      }),

      handler(response) {
        onSuccess?.(response);
      },
      modal: {
        ondismiss() { onDismiss?.(); },
      },
    });

    rzp.on('payment.failed', resp => {
      onError?.(resp.error?.description || 'Payment failed');
    });

    rzp.open();

  } catch (err) {
    onError?.(err.message || 'Something went wrong');
  }
}
