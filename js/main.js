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

    const token  = params.get('token');
    const stored = JSON.parse(localStorage.getItem('paypal_pending') || '{}');

    if (window.opener && !window.opener.closed) {
      /* Desktop popup path — notify parent tab and close this popup */
      try {
        window.opener.postMessage(
          paypalStatus === 'success'
            ? { type: 'PAYPAL_SUCCESS', token }
            : { type: 'PAYPAL_CANCEL' },
          window.location.origin
        );
      } catch (_) {}
      window.close();
      return;
    }

    /* Mobile / new-tab path — window.opener is null.
       Write result to localStorage so the original tab picks it up
       via a 'storage' event, then close this tab. */
    if (paypalStatus === 'success' && token) {
      localStorage.setItem('paypal_result', JSON.stringify({ status: 'success', token }));
    } else {
      localStorage.setItem('paypal_result', JSON.stringify({ status: 'cancel' }));
    }
    window.close(); /* works if this tab was opened by window.open() */

    /* Safety fallback: if window.close() didn't work (e.g. direct navigation),
       handle capture right here in this tab.
       BUT only if paypal_result is still in localStorage — if the original tab
       already consumed it via the storage event, skip to avoid double-capture. */
    setTimeout(() => {
      const resultStillUnclaimed = !!localStorage.getItem('paypal_result');
      if (!resultStillUnclaimed) return; /* original tab already handled it */
      localStorage.removeItem('paypal_result');
      initAll();
      if (paypalStatus === 'success' && token && stored.service_key) {
        handlePayPalCapture(token, stored);
      } else if (stored.service_key) {
        openDrawer(stored.service_key);
      }
    }, 800);
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
