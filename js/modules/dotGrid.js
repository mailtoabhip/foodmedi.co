/* ── Interactive Dot Grid Background ────────────────────────────────── */
/*
  Canvas is position:fixed so it always covers the viewport.
  Mouse coords come straight from e.clientX / clientY — no scroll
  arithmetic, no zoom conversion — keeping both in the same space.
  As the user scrolls, the fixed canvas repaints over whatever
  section is visible, giving dot coverage across the whole page.
*/
export function initDotGrid() {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '0',
  });
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');

  const SPACING = 22;   // px between dot centres
  const DOT_R   = 1.8;  // dot radius px
  const BASE_A  = 0.08; // resting opacity
  const PEAK_A  = 0.45; // opacity at cursor centre
  const HOV_RAD = 180;  // influence radius px

  let mx = -9999, my = -9999, raf = null;

  /* ── match canvas buffer to viewport ── */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    schedule();
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(render);
  }

  function render() {
    raf = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cols = Math.ceil(canvas.width  / SPACING) + 1;
    const rows = Math.ceil(canvas.height / SPACING) + 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * SPACING;
        const y = r * SPACING;
        const d = Math.hypot(x - mx, y - my);
        const t = d < HOV_RAD ? (1 - d / HOV_RAD) ** 2 : 0;
        const alpha = BASE_A + (PEAK_A - BASE_A) * t;

        ctx.beginPath();
        ctx.arc(x, y, DOT_R, 0, 6.2832);
        ctx.fillStyle = `rgba(0,0,0,${alpha.toFixed(3)})`;
        ctx.fill();
      }
    }
  }

  /* ── mouse: clientX/Y are already in viewport space → exact match ── */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    schedule();
  });

  document.addEventListener('mouseleave', () => {
    mx = -9999; my = -9999;
    schedule();
  });

  window.addEventListener('resize', resize);
  resize();
}
