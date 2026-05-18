import { state } from './state.js';
import { renderServices } from './services.js';
import { rerenderDrawer } from './drawer.js';
import { SERVICES } from '../data/services.js';
import { fmtPrice } from './state.js';

export function setCurrency(code) {
  if (code !== 'INR' && code !== 'USD') return;
  state.currency = code;

  document.querySelectorAll('.currency-toggle').forEach(t => {
    t.classList.toggle('usd', code === 'USD');
    t.querySelectorAll('button').forEach(b => {
      const active = b.dataset.currency === code;
      b.classList.toggle('active', active);
      b.setAttribute('aria-checked', String(active));
    });
  });

  renderServices();
  rerenderDrawer();

  const ctaEl = document.getElementById('ctaBandPrice');
  if (ctaEl) ctaEl.textContent = fmtPrice(SERVICES.initial, code);
}

export function initCurrencyToggle() {
  document.querySelectorAll('.currency-toggle button[data-currency]').forEach(btn => {
    btn.addEventListener('click', () => setCurrency(btn.dataset.currency));
  });
}
