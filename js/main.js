import { initReveal }       from './modules/reveal.js';
import { initAccordion }    from './modules/accordion.js';
import { renderServices }   from './modules/services.js';
import { initDrawer, openDrawer } from './modules/drawer.js';
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
});
