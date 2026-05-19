/* ── Interactive Dot Grid Background ────────────────────────────────── */
export function initDotGrid() {
  /* Canvas covers the full document height so every section gets dots */
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '0',
  });

  /* Wrapper must be position:absolute over the whole page */
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: '0',
  });
  wrap.setAttribute('aria-hidden', 'true');
  wrap.appendChild(canvas);
  document.body.prepend(wrap);

  const ctx = canvas.getContext('2d');

  const SPACING  = 22;   // px between dot centres — tighter grid
  const DOT_R    = 1.8;  // dot radius in px
  const BASE_A   = 0.08; // resting opacity — clearly visible
  const PEAK_A   = 0.45; // opacity at cursor centre — strong hover
  const HOV_RAD  = 180;  // pixel radius of hover influence

  /* Mouse position relative to the document (not viewport) */
  let mx = -9999, my = -9999;
  let raf = null;

  /* ── resize: match full document dimensions ── */
  function resize() {
    canvas.width  = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;
    schedule();
  }

  /* ── rAF-gated draw ── */
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

  /* ── events: track position relative to document ── */
  document.addEventListener('mousemove', e => {
    mx = e.clientX + window.scrollX;
    my = e.clientY + window.scrollY;
    schedule();
  });

  document.addEventListener('mouseleave', () => {
    mx = -9999; my = -9999;
    schedule();
  });

  /* Re-measure on resize or after any layout shift */
  const ro = new ResizeObserver(resize);
  ro.observe(document.body);
  window.addEventListener('resize', resize);
  resize();
}
