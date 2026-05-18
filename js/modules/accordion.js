export function toggleAcc(btn) {
  btn.closest('.acc-item').classList.toggle('open');
}

export function initAccordion() {
  document.querySelectorAll('.acc-q').forEach(btn => {
    btn.addEventListener('click', () => toggleAcc(btn));
  });
}
