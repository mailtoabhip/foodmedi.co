import { initReveal }       from './modules/reveal.js';
import { initAccordion }    from './modules/accordion.js';
import { renderServices }   from './modules/services.js';
import { initDrawer, openDrawer, showSuccess, showPayPalFailed, handlePayPalCapture } from './modules/drawer.js';
import { initCurrencyToggle }     from './modules/currency.js';
import { initTestimonials } from './modules/testimonials.js';
import { initDotGrid }      from './modules/dotGrid.js';

document.addEventListener('DOMContentLoaded', () => {
  // ── Handle PayPal popup return FIRST (before initialising anything else)
  const params = new URLSearchParams(window.location.search);
  const paypalStatus = params.get('paypal');

  if (paypalStatus === 'success' || paypalStatus === 'cancel') {
    window.history.replaceState({}, '', window.location.pathname);

    if (window.opener && !window.opener.closed) {
      /* We are inside the PayPal popup — notify parent and close */
      try {
        window.opener.postMessage(
          paypalStatus === 'success'
            ? { type: 'PAYPAL_SUCCESS', token: params.get('token') }
            : { type: 'PAYPAL_CANCEL' },
          window.location.origin
        );
      } catch (_) {}
      window.close();
      return; /* Stop — don't init the full page in the popup */
    }

    /* Fallback: popup was blocked, user landed here via full redirect */
    const stored = JSON.parse(sessionStorage.getItem('paypal_pending') || '{}');
    if (paypalStatus === 'success') {
      const token = params.get('token');
      if (token && stored.service_key) {
        initAll();
        handlePayPalCapture(token, stored);
        return;
      }
    } else {
      sessionStorage.removeItem('paypal_pending');
      initAll();
      if (stored.service_key) openDrawer(stored.service_key);
      return;
    }
  }

  initAll();
});

function initAll() {
  initDotGrid();
  initReveal();
  initDrawer();
  initAccordion();
  initCurrencyToggle();
  renderServices();
  initTestimonials();

  document.querySelectorAll('[data-open-drawer]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer(el.dataset.openDrawer || 'initial');
    });
  });
}
