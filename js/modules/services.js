import { SERVICES, SERVICE_ORDER } from '../data/services.js';
import { ICONS } from './icons.js';
import { state, fmtPrice, priceMeta } from './state.js';
import { observeReveals } from './reveal.js';
import { openDrawer } from './drawer.js';

export function renderServiceCard(s) {
  const c = state.currency;
  const priceStr = fmtPrice(s, c);
  const meta = priceMeta(s, c);
  const isFlag = !!s.flagship;
  const isOnc  = !!s.oncology;
  const tagLine = (s.tag && !isOnc)
    ? `<span class="tag"><span class="pulse"></span> ${s.tag}</span>`
    : '';

  const checkStroke = isFlag ? '#7BD49E' : '#137A48';
  const ulItems = s.shortBullets.map(b => `
    <li>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M5 12l5 5L20 7" stroke="${checkStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      ${b}
    </li>`).join('');

  const btnClass = isOnc  ? 'btn btn-soft'
                 : isFlag ? 'btn'
                 : 'btn btn-ghost-svc';
  const ctaLabel = s.ctaLabel || 'Know More &amp; Book';

  return `
    <article class="svc ${isFlag ? 'flagship' : ''} ${isOnc ? 'oncology' : ''} reveal">
      ${tagLine}
      <div class="svc-ico" ${isFlag ? 'style="background: rgba(255,255,255,.14);"' : ''}>
        ${ICONS[s.icon] || ICONS.star}
      </div>
      <div class="duration">
        ${ICONS.clock}
        ${s.duration}
      </div>
      <h3>${s.shortTitle}</h3>
      <p class="lede">${s.lede}</p>
      <ul>${ulItems}</ul>
      <div class="foot">
        <div class="price">
          <span data-price-svc="${s.key}">${priceStr}</span>
          <small>${meta}</small>
        </div>
        <button class="${btnClass}" data-service="${s.key}">
          ${ctaLabel}
          <svg class="arr" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </article>
  `;
}

export function renderServices() {
  const grid = document.getElementById('svcGrid');
  if (!grid) return;

  grid.innerHTML = SERVICE_ORDER.map(k => renderServiceCard(SERVICES[k])).join('');

  // Wire up CTA buttons via event delegation on the grid
  grid.querySelectorAll('button[data-service]').forEach(btn => {
    btn.addEventListener('click', () => openDrawer(btn.dataset.service));
  });

  observeReveals(grid);
  requestAnimationFrame(() => {
    grid.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  });
}
