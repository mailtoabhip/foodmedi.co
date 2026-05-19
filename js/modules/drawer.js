import { SERVICES } from '../data/services.js';
import { COUNTRIES } from '../data/countries.js';
import { ICONS } from './icons.js';
import { state, fmtPrice, priceMeta, priceLbl, gateway } from './state.js';
import { initiatePayment } from './razorpay.js';

let currentDrawerKey = null;
let drawerPhoneCountry = 'US';

// ── Country dropdown ──────────────────────────────────────────────────

function renderCountryDropdown(activeCode, locked) {
  const active = COUNTRIES.find(c => c[0] === activeCode) || COUNTRIES[1];
  if (locked) {
    return `
      <div class="cc-dropdown" data-locked="1">
        <button type="button" class="cc-trigger locked" tabindex="-1" aria-disabled="true">
          <span class="emoji">${active[2]}</span>
          <span class="dial mono" style="font-family:'JetBrains Mono',monospace;font-size:12.5px;">${active[3]}</span>
        </button>
      </div>`;
  }
  return `
    <div class="cc-dropdown" id="ccDropdown">
      <button type="button" class="cc-trigger" id="ccTrigger">
        <span class="emoji" id="ccActiveFlag">${active[2]}</span>
        <span class="dial mono" id="ccActiveDial" style="font-family:'JetBrains Mono',monospace;font-size:12.5px;">${active[3]}</span>
        <svg class="chev" width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="cc-panel" role="listbox">
        <div class="cc-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="M16 16l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input type="text" id="ccSearch" placeholder="Search country…" autocomplete="off" />
        </div>
        <div class="cc-list" id="ccList">
          ${COUNTRIES.map(c => `
            <div class="cc-item${c[0] === activeCode ? ' active' : ''}" data-code="${c[0]}" data-name="${c[1].toLowerCase()}" data-dial="${c[3]}">
              <span class="emoji">${c[2]}</span>
              <span class="name">${c[1]}</span>
              <span class="dial">${c[3]}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function bindCountryDropdown() {
  const dd = document.getElementById('ccDropdown');
  if (!dd) return;

  document.getElementById('ccTrigger')?.addEventListener('click', (e) => {
    e.stopPropagation();
    dd.classList.toggle('open');
    if (dd.classList.contains('open')) {
      const s = document.getElementById('ccSearch');
      if (s) { s.value = ''; filterCountries(''); s.focus(); }
    }
  });

  document.getElementById('ccSearch')?.addEventListener('input', (e) => filterCountries(e.target.value));
  document.getElementById('ccSearch')?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dd.classList.remove('open');
  });

  document.getElementById('ccList')?.addEventListener('click', (e) => {
    const item = e.target.closest('.cc-item');
    if (!item) return;
    pickCountry(item.dataset.code, item.querySelector('.emoji').textContent, item.dataset.dial);
  });
}

function pickCountry(code, flag, dial) {
  drawerPhoneCountry = code;
  const f = document.getElementById('ccActiveFlag');
  const d = document.getElementById('ccActiveDial');
  if (f) f.textContent = flag;
  if (d) d.textContent = dial;
  document.querySelectorAll('#ccList .cc-item').forEach(it => {
    it.classList.toggle('active', it.dataset.code === code);
  });
  document.getElementById('ccDropdown')?.classList.remove('open');
}

function filterCountries(q) {
  q = (q || '').trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('#ccList .cc-item').forEach(it => {
    const match = !q || it.dataset.name.includes(q) || it.dataset.dial.includes(q);
    it.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  const list = document.getElementById('ccList');
  let empty = list?.querySelector('.cc-empty');
  if (visible === 0) {
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'cc-empty';
      empty.textContent = 'No country matches your search.';
      list?.appendChild(empty);
    }
  } else { empty?.remove(); }
}

// ── Phone validation ──────────────────────────────────────────────────

function bindPhoneValidation() {
  const inp = document.querySelector('#drawerBody input[type="tel"]');
  if (!inp) return;
  inp.addEventListener('input', () => {
    if (state.currency === 'INR') {
      const cleaned = inp.value.replace(/\D/g, '').slice(0, 10);
      if (cleaned !== inp.value) inp.value = cleaned;
    } else {
      const cleaned = inp.value.replace(/[^\d\s\-()]/g, '');
      if (cleaned !== inp.value) inp.value = cleaned;
    }
  });
}

// ── Drawer render ─────────────────────────────────────────────────────

function renderDrawer(key) {
  const s = SERVICES[key];
  if (!s) return;
  currentDrawerKey = key;

  const c = state.currency;
  const priceStr = fmtPrice(s, c);
  const meta     = priceMeta(s, c);
  const lbl      = priceLbl(s, c);
  const gw       = gateway(c);
  const isINR    = c === 'INR';
  const isOnc    = !!s.oncology;

  if (isINR) drawerPhoneCountry = 'IN';
  else if (drawerPhoneCountry === 'IN') drawerPhoneCountry = 'US';

  document.getElementById('drawerCrumb').textContent = s.crumb;
  document.getElementById('drawer').classList.toggle('oncology-mode', isOnc);

  const sectionsHtml = s.sections.map(sec => `
    <div class="what-included${sec.highlight ? ' highlight' : ''}">
      <h4>${sec.title}</h4>
      ${sec.rows.map(r => `
        <div class="include-row">
          <div class="ic">${ICONS[r.ico] || ICONS.star}</div>
          <div>
            <b>${r.b}</b>
            <span>${r.t}</span>
          </div>
        </div>`).join('')}
    </div>`).join('');

  const checkoutHead = isINR
    ? `<span class="razor"><span class="rzr-mark">R</span> Razorpay Checkout</span>`
    : `<span class="razor"><span class="rzr-mark" style="background:#003087;">P</span> PayPal · Wise</span>`;

  const payBtnText = s.payLabel
    ? `${s.payLabel} (Pay ${priceStr})`
    : `Pay ${priceStr} via ${gw}`;

  const formFields = isOnc ? `
    <div class="row-2">
      <div class="field">
        <label>Patient Name *</label>
        <input type="text" placeholder="Patient's full name" autocomplete="off" />
      </div>
      <div class="field">
        <label>Caregiver Name <span style="color:var(--ink-3);font-weight:400;">(optional)</span></label>
        <input type="text" placeholder="If caring on their behalf" autocomplete="off" />
      </div>
    </div>
    <div class="field">
      <label>Email *</label>
      <input type="email" placeholder="you@email.com" autocomplete="email" />
    </div>
    <div class="field">
      <label>Phone *</label>
      <div class="phone-row">
        ${renderCountryDropdown(drawerPhoneCountry, isINR)}
        <input type="tel" placeholder="${isINR ? '98xxx xxxxx' : '(555) 123-4567'}" autocomplete="tel" />
      </div>
    </div>` : `
    <div class="field">
      <label>Email *</label>
      <input type="email" placeholder="you@email.com" autocomplete="email" />
    </div>
    <div class="row-2">
      <div class="field">
        <label>Full name *</label>
        <input type="text" placeholder="Your name" autocomplete="name" />
      </div>
      <div class="field">
        <label>Phone *</label>
        <div class="phone-row">
          ${renderCountryDropdown(drawerPhoneCountry, isINR)}
          <input type="tel" placeholder="${isINR ? '98xxx xxxxx' : '(555) 123-4567'}" autocomplete="tel" />
        </div>
      </div>
    </div>`;

  const payMethods = isINR
    ? `<div class="pm active" role="radio" aria-checked="true"><span class="dot-r"></span> UPI</div>
       <div class="pm" role="radio" aria-checked="false"><span class="dot-r"></span> Card</div>
       <div class="pm" role="radio" aria-checked="false"><span class="dot-r"></span> Net Banking</div>
       <div class="pm" role="radio" aria-checked="false"><span class="dot-r"></span> Wallet</div>`
    : `<div class="pm active" role="radio" aria-checked="true"><span class="dot-r"></span> PayPal</div>
       <div class="pm" role="radio" aria-checked="false"><span class="dot-r"></span> Wise</div>
       <div class="pm" role="radio" aria-checked="false"><span class="dot-r"></span> Card</div>`;

  document.getElementById('drawerBody').innerHTML = `
    <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:8px;">
      <div style="width:52px;height:52px;border-radius:14px;background:var(--emerald-soft);color:var(--emerald-deep);display:grid;place-items:center;flex-shrink:0;">
        ${ICONS[s.icon] || ICONS.star}
      </div>
      <div style="flex:1;">
        <div class="duration" style="margin:0 0 8px;color:var(--ink-3);">${ICONS.clock} ${s.duration}</div>
        <h2 id="drawerTitle" style="font-size:${isOnc ? '36px' : '32px'};line-height:1.1;">${s.titleHtml}</h2>
      </div>
    </div>
    <p class="lede" style="margin-top:18px;${isOnc ? 'font-size:17px;line-height:1.65;' : ''}">${s.lede}</p>

    <div class="price-card">
      <div>
        <div class="big">${priceStr}<span style="font-size:14px;color:var(--ink-3);font-family:'Plus Jakarta Sans',sans-serif;"> · ${meta}</span></div>
        <div class="lbl">${lbl}</div>
      </div>
      <span class="pill">${s.pill}</span>
    </div>

    <p style="margin-top:28px;color:var(--ink-2);font-size:${isOnc ? '16px' : '15px'};line-height:1.7;">${s.intro}</p>

    ${sectionsHtml}

    <div class="checkout">
      <div class="checkout-head">
        ${checkoutHead}
        <span class="secure">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          256-bit SSL
        </span>
      </div>
      <div class="checkout-body">
        <div class="field">
          <label>Amount *</label>
          <input type="text" value="${priceStr}" readonly style="background:#F6F8F4;font-family:'Playfair Display',Georgia,serif;font-size:20px;color:var(--ink);font-weight:500;" />
        </div>
        ${formFields}
        <div class="pay-methods" role="radiogroup" aria-label="Payment method">
          ${payMethods}
        </div>
        <button class="pay-btn" id="payBtn" data-price="${priceStr}" data-gw="${gw}" data-paylabel="${s.payLabel || ''}">
          <span>${payBtnText}</span>
          <span class="sm">SECURE →</span>
        </button>
        ${!isINR ? `
          <div class="gst-note">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4M12 3l8.5 4v6c0 5-3.6 9.4-8.5 10.5C7.1 22.4 3.5 18 3.5 13V7L12 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            GST-compliant invoices provided for all sessions.
          </div>` : ''}
        ${isOnc ? `
          <div class="trust-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l8 3v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            </svg>
            All medical information shared is strictly confidential.
          </div>` : ''}
        <div class="legal">
          <svg class="ic" width="11" height="11" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Your payment is securely processed by ${gw}. We never store card details.
        </div>
      </div>
    </div>`;

  // Bind interactions
  bindCountryDropdown();
  bindPhoneValidation();
  bindPayMethods();
  bindPayBtn();
}

function bindPayMethods() {
  document.querySelectorAll('.pay-methods .pm').forEach(pm => {
    pm.addEventListener('click', () => {
      pm.parentElement.querySelectorAll('.pm').forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-checked', 'false');
      });
      pm.classList.add('active');
      pm.setAttribute('aria-checked', 'true');
    });
  });
}

function bindPayBtn() {
  const btn = document.getElementById('payBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const s   = SERVICES[currentDrawerKey];
    const cur = state.currency;

    /* ── Collect form values ── */
    const body    = document.querySelector('.checkout-body');
    const email   = body?.querySelector('input[type="email"]')?.value.trim() ?? '';
    const nameEl  = body?.querySelector('input[type="text"]');
    const name    = nameEl?.value.trim() ?? '';
    const phone   = body?.querySelector('input[type="tel"]')?.value.trim() ?? '';

    /* ── Basic validation ── */
    const missing = [];
    if (!email) missing.push('email');
    if (!name)  missing.push('name');
    if (!phone) missing.push('phone');
    if (missing.length) {
      missing.forEach(f => {
        const inp = body?.querySelector(`input[type="${f === 'phone' ? 'tel' : f === 'name' ? 'text' : f}"]`);
        if (inp) { inp.style.outline = '2px solid var(--crimson)'; inp.focus(); }
      });
      return;
    }

    /* ── Clear any previous validation errors ── */
    body?.querySelectorAll('input').forEach(i => i.style.outline = '');

    /* ── INR → Razorpay ── */
    if (cur === 'INR') {
      const amount = s.inr.price;
      const origText = btn.innerHTML;

      btn.disabled = true;
      btn.innerHTML = '<span>Opening secure checkout…</span>';

      await initiatePayment({
        amount,
        currency: 'INR',
        serviceName: s.name,
        name,
        email,
        phone,

        async onSuccess(resp) {
          /* Fire-and-forget confirmation email — don't block the UI */
          fetch('/api/send-confirmation', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id:  resp.razorpay_payment_id,
              razorpay_order_id:    resp.razorpay_order_id,
              razorpay_signature:   resp.razorpay_signature,
              service_key:          currentDrawerKey,
              amount:               s.inr.price,
              currency:             'INR',
              customer_name:        name,
              customer_email:       email,
            }),
          }).catch(err => console.warn('Confirmation email error:', err));

          showSuccess(s.name, resp.razorpay_payment_id, s.calendlyUrl || '', name, email);
        },

        onDismiss() {
          /* User closed the modal — restore button */
          btn.disabled = false;
          btn.innerHTML = origText;
        },

        onError(msg) {
          btn.disabled = false;
          btn.innerHTML = origText;
          showError(msg);
        },
      });

    } else {
      /* USD — international payments (PayPal/Wise) handled manually for now */
      showError('International payments via PayPal / Wise — please email us directly to book.');
    }
  });
}

function showSuccess(serviceName, paymentId, calendlyUrl, customerName, customerEmail) {
  /* Remove any existing overlay */
  document.getElementById('paySuccessOverlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'pay-success-overlay';
  overlay.id = 'paySuccessOverlay';
  overlay.innerHTML = `
    <div class="pay-success-card">
      <div class="pay-check-wrap">
        <svg viewBox="0 0 88 88">
          <!-- Background ring -->
          <circle class="ring-track" cx="44" cy="44" r="39"/>
          <!-- Animated fill ring -->
          <circle class="ring-fill" cx="44" cy="44" r="39"
                  transform="rotate(-90 44 44)"/>
          <!-- Animated checkmark -->
          <path class="check-mark" d="M27 44l11 11 23-22"/>
        </svg>
      </div>

      <h2>Payment Confirmed!</h2>

      <p class="sub">
        Your <strong>${serviceName}</strong> is booked.<br/>
        A confirmation &amp; Google Meet link will be sent to your email shortly.
      </p>

      <div class="pay-id-chip">
        <span class="dot"></span>
        ${paymentId}
      </div>

      ${calendlyUrl ? `
      <button class="pay-success-cta" id="payCalendlyBtn" style="margin-bottom:12px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Schedule Your Session
      </button>` : ''}
      <button class="pay-success-cta" id="paySuccessClose"
              style="${calendlyUrl ? 'background:transparent;color:var(--emerald);box-shadow:none;border:1.5px solid var(--line-2);' : ''}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to Home
      </button>
    </div>`;

  document.body.appendChild(overlay);

  /* Trigger animation on next frame */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('show'));
  });

  /* Schedule button — opens Calendly popup with prefilled name & email */
  document.getElementById('payCalendlyBtn')?.addEventListener('click', () => {
    if (!window.Calendly) {
      window.open(calendlyUrl, '_blank');
      return;
    }
    window.Calendly.initPopupWidget({
      url: calendlyUrl,
      prefill: { name: customerName, email: customerEmail },
    });
  });

  document.getElementById('paySuccessClose').addEventListener('click', () => {
    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.remove();
      closeDrawer();
    }, 380);
  });
}

function showError(msg) {
  const existing = document.querySelector('.pay-error');
  if (existing) existing.remove();
  const el = document.createElement('p');
  el.className = 'pay-error';
  el.style.cssText = 'color:var(--crimson);font-size:13.5px;margin:10px 0 0;text-align:center;';
  el.textContent = msg;
  document.getElementById('payBtn')?.insertAdjacentElement('afterend', el);
  setTimeout(() => el.remove(), 6000);
}

// ── Open / close ──────────────────────────────────────────────────────

export function openDrawer(key = 'initial') {
  renderDrawer(key);
  document.getElementById('scrim').classList.add('open');
  const drawer = document.getElementById('drawer');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
  drawer.scrollTop = 0;
}

export function closeDrawer() {
  document.getElementById('scrim').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  document.body.style.overflow = '';
  currentDrawerKey = null;
}

export function rerenderDrawer() {
  if (currentDrawerKey) renderDrawer(currentDrawerKey);
}

export function initDrawer() {
  document.getElementById('scrim')?.addEventListener('click', closeDrawer);
  document.getElementById('drawerCloseBtn')?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  // Close country dropdown on outside click
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('ccDropdown');
    if (dd && !dd.contains(e.target)) dd.classList.remove('open');
  });
}
