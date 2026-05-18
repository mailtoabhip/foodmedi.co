const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

export function observeReveals(root = document) {
  root.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
}

export function initReveal() {
  document.documentElement.classList.add('js-ready');
  observeReveals();
  // Safety: force-show anything still hidden after 1.6s (covers throttled/headless contexts)
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
  }, 1600);
}
