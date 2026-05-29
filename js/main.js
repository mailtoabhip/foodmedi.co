import { initReveal }       from './modules/reveal.js';
import { initAccordion }    from './modules/accordion.js';
import { renderServices }   from './modules/services.js';
import { initDrawer, openDrawer, showSuccess } from './modules/drawer.js';
import { initCurrencyToggle }     from './modules/currency.js';
import { initTestimonials } from './modules/testimonials.js';
import { initDotGrid }      from './modules/dotGrid.js';

document.addEventListener('DOMContentLoaded', () => {
  initDotGrid();
  initReveal();
  initDrawer();
  initAccordion();
  initCurrencyToggle();
  renderServices();
  initTestimonials();

  // Wire up any static "Book Now" / "openDrawer" buttons declared in HTML
  document.querySelectorAll('[data-open-drawer]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer(el.dataset.openDrawer || 'initial');
    });
  });

  // ── Handle PayPal return ──────────────────────────────────────────────
  const params = new URLSearchParams(window.location.search);
  const paypalStatus = params.get('paypal');

  if (paypalStatus === 'cancel') {
    window.history.replaceState({}, '', window.location.pathname);
    const stored = JSON.parse(sessionStorage.getItem('paypal_pending') || '{}');
    sessionStorage.removeItem('paypal_pending');
    if (stored.service_key) openDrawer(stored.service_key);
    return;
  }

  if (paypalStatus === 'success') {
    const token  = params.get('token'); // PayPal order ID
    window.history.replaceState({}, '', window.location.pathname);
    const stored = JSON.parse(sessionStorage.getItem('paypal_pending') || '{}');

    if (token && stored.service_key) {
      handlePayPalReturn(token, stored);
    }
  }
});

async function handlePayPalReturn(orderID, stored) {
  try {
    /* Open the drawer so the success overlay has somewhere to attach */
    openDrawer(stored.service_key);

    /* Capture the payment server-side */
    const captureRes = await fetch('/api/capture-paypal-order', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ orderID }),
    });
    const captureData = await captureRes.json();

    if (captureData.status !== 'COMPLETED') {
      throw new Error('Payment not completed. Status: ' + (captureData.status || JSON.stringify(captureData)));
    }

    const paymentId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderID;

    /* Send confirmation emails (fire and forget) */
    fetch('/api/send-confirmation', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_order_id:   orderID,
        razorpay_signature:  '',
        service_key:         stored.service_key,
        amount:              stored.amount,
        currency:            'USD',
        customer_name:       stored.name,
        customer_email:      stored.email,
        customer_phone:      stored.phone,
      }),
    })
    .then(async r => {
      const d = await r.json().catch(() => ({}));
      if (!d.sent) console.error('[paypal email] failed:', d);
    })
    .catch(err => console.error('[paypal email] fetch error:', err));

    sessionStorage.removeItem('paypal_pending');

    /* Show success overlay */
    showSuccess(stored.serviceName, paymentId, stored.calendlyUrl, stored.name, stored.email);

  } catch (err) {
    console.error('[PayPal return error]', err);
    alert(
      'Your payment was received by PayPal, but we encountered an error on our end.\n' +
      'Please contact us at mail.foodmedico@gmail.com with your PayPal transaction ID: ' + orderID +
      '\nError: ' + err.message
    );
    sessionStorage.removeItem('paypal_pending');
  }
}
