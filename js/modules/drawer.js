import { SERVICES } from '../data/services.js';
import { COUNTRIES } from '../data/countries.js';
import { ICONS } from './icons.js';
import { state, fmtPrice, fmtINR, fmtUSD, priceMeta, priceLbl, gateway } from './state.js';
import { initiatePayment } from './razorpay.js';

let currentDrawerKey = null;
let drawerPhoneCountry = 'US';
let currentSubPlan = null;

// ── Phone format by country ───────────────────────────────────────────
// Each entry: { mask, min, max, ph }
// mask: '#' = digit, other chars are literals inserted automatically
const PHONE_DATA = {
  IN: { mask:'##### #####',       min:10, max:10, ph:'98765 43210'       },
  US: { mask:'(###) ###-####',    min:10, max:10, ph:'(555) 123-4567'    },
  CA: { mask:'(###) ###-####',    min:10, max:10, ph:'(604) 123-4567'    },
  GB: { mask:'##### ######',      min:10, max:11, ph:'07700 900000'      },
  AU: { mask:'#### ### ###',      min: 9, max:10, ph:'0400 000 000'      },
  NZ: { mask:'### ### ####',      min: 9, max:10, ph:'021 123 4567'      },
  AE: { mask:'### ### ####',      min: 9, max: 9, ph:'050 123 4567'      },
  SA: { mask:'### ### ####',      min: 9, max: 9, ph:'050 123 4567'      },
  QA: { mask:'#### ####',         min: 8, max: 8, ph:'3312 3456'         },
  KW: { mask:'#### ####',         min: 8, max: 8, ph:'5000 0000'         },
  BH: { mask:'#### ####',         min: 8, max: 8, ph:'3600 0000'         },
  OM: { mask:'#### ####',         min: 8, max: 8, ph:'9200 0000'         },
  SG: { mask:'#### ####',         min: 8, max: 8, ph:'8123 4567'         },
  MY: { mask:'###-### ####',      min:10, max:11, ph:'012-345 6789'      },
  HK: { mask:'#### ####',         min: 8, max: 8, ph:'6123 4567'         },
  JP: { mask:'###-####-####',     min:10, max:11, ph:'090-1234-5678'     },
  KR: { mask:'###-####-####',     min:10, max:11, ph:'010-1234-5678'     },
  CN: { mask:'### #### ####',     min:11, max:11, ph:'138 0013 8000'     },
  PK: { mask:'#### #######',      min:10, max:11, ph:'0300 1234567'      },
  BD: { mask:'####-######',       min:10, max:11, ph:'01711-123456'      },
  LK: { mask:'### ### ####',      min: 9, max:10, ph:'071 123 4567'      },
  NP: { mask:'#### ######',       min: 9, max:10, ph:'9841 123456'       },
  DE: { mask:'#### ########',     min:10, max:12, ph:'0151 23456789'     },
  FR: { mask:'## ## ## ## ##',    min: 9, max:10, ph:'06 12 34 56 78'    },
  IT: { mask:'### ### ####',      min: 9, max:10, ph:'320 123 4567'      },
  ES: { mask:'### ### ###',       min: 9, max: 9, ph:'612 345 678'       },
  NL: { mask:'## ### ####',       min: 9, max: 9, ph:'06 12345678'       },
  CH: { mask:'### ### ## ##',     min: 9, max:10, ph:'076 123 45 67'     },
  AT: { mask:'#### ######',       min: 9, max:11, ph:'0664 123456'       },
  SE: { mask:'###-### ## ##',     min: 9, max:10, ph:'070-123 45 67'     },
  NO: { mask:'### ## ###',        min: 8, max: 8, ph:'406 12 345'        },
  DK: { mask:'## ## ## ##',       min: 8, max: 8, ph:'20 12 34 56'       },
  FI: { mask:'### ### ####',      min: 8, max:10, ph:'040 123 4567'      },
  PL: { mask:'### ### ###',       min: 9, max: 9, ph:'512 345 678'       },
  PT: { mask:'### ### ###',       min: 9, max: 9, ph:'912 345 678'       },
  IE: { mask:'### ### ####',      min: 9, max:10, ph:'083 123 4567'      },
  ZA: { mask:'### ### ####',      min: 9, max:10, ph:'071 123 4567'      },
  NG: { mask:'#### ### ####',     min:10, max:11, ph:'0803 123 4567'     },
  KE: { mask:'#### ######',       min: 9, max:10, ph:'0712 345678'       },
  GH: { mask:'### ### ####',      min: 9, max:10, ph:'024 123 4567'      },
  BR: { mask:'(##) #####-####',   min:10, max:11, ph:'(11) 91234-5678'   },
  MX: { mask:'## #### ####',      min:10, max:10, ph:'55 1234 5678'      },
  AR: { mask:'## ####-####',      min:10, max:10, ph:'11 1234-5678'      },
  CO: { mask:'### ### ####',      min:10, max:10, ph:'310 123 4567'      },
  CL: { mask:'# #### ####',       min: 9, max: 9, ph:'9 1234 5678'       },
};

function applyPhoneMask(digits, mask) {
  let out = '', di = 0;
  for (let i = 0; i < mask.length && di < digits.length; i++) {
    out += mask[i] === '#' ? digits[di++] : mask[i];
  }
  return out;
}

function phoneFormat(code) { return PHONE_DATA[code]?.ph || 'Enter phone number'; }

function showPhoneError(inp, msg) {
  inp.style.outline = '2px solid var(--crimson)';
  const field = inp.closest('.field');
  if (!field) return;
  let err = field.querySelector('.phone-err');
  if (!err) { err = document.createElement('p'); err.className = 'phone-err'; field.appendChild(err); }
  err.textContent = msg;
}

function clearPhoneError(inp) {
  inp.style.outline = '';
  inp.closest('.field')?.querySelector('.phone-err')?.remove();
}

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

  // Update phone format when country changes
  const phoneInput = document.querySelector('#drawerBody input[type="tel"]');
  if (phoneInput) {
    const pd = PHONE_DATA[code];
    phoneInput.placeholder = phoneFormat(code);
    if (pd && phoneInput.value) {
      const digits = phoneInput.value.replace(/\D/g, '').slice(0, pd.max);
      phoneInput.value = applyPhoneMask(digits, pd.mask);
    }
    clearPhoneError(phoneInput);
  }

  /* Only auto-switch INR → USD when user picks a non-Indian number.
     Never force back to INR if user is already in international (USD) mode. */
  const targetCurrency = (state.currency === 'INR' && code !== 'IN') ? 'USD' : state.currency;
  if (state.currency !== targetCurrency && currentDrawerKey) {
    /* Save filled-in values so re-render doesn't wipe them */
    const body = document.querySelector('.checkout-body');
    const savedEmail = body?.querySelector('input[type="email"]')?.value || '';
    const savedName  = body?.querySelector('input[type="text"]')?.value  || '';

    /* Update state + global currency toggle buttons */
    state.currency = targetCurrency;
    document.querySelectorAll('.currency-toggle button[data-currency]').forEach(btn => {
      const active = btn.dataset.currency === targetCurrency;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', String(active));
    });

    renderDrawer(currentDrawerKey);

    /* Restore values */
    const nb = document.querySelector('.checkout-body');
    const emailEl = nb?.querySelector('input[type="email"]');
    const nameEl  = nb?.querySelector('input[type="text"]');
    if (emailEl && savedEmail) emailEl.value = savedEmail;
    if (nameEl  && savedName)  nameEl.value  = savedName;
  }
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
    const pd = PHONE_DATA[drawerPhoneCountry];
    if (!pd) return;
    const pos   = inp.selectionStart;
    const digits = inp.value.replace(/\D/g, '').slice(0, pd.max);
    const masked = applyPhoneMask(digits, pd.mask);
    if (inp.value !== masked) {
      inp.value = masked;
      // Keep cursor roughly in place
      const extra = masked.length - inp.value.replace(/\D/g, '').length;
      try { inp.setSelectionRange(pos + extra, pos + extra); } catch (_) {}
    }
    clearPhoneError(inp);
  });

  inp.addEventListener('blur', () => {
    const pd = PHONE_DATA[drawerPhoneCountry];
    if (!pd) return;
    const digits = inp.value.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < pd.min) {
      showPhoneError(inp, `Enter a valid ${pd.min}-digit phone number for the selected country`);
    }
  });

  inp.addEventListener('focus', () => clearPhoneError(inp));
}

// ── Drawer render ─────────────────────────────────────────────────────

function renderDrawer(key) {
  const s = SERVICES[key];
  if (!s) return;
  currentDrawerKey = key;

  const c     = state.currency;
  const gw    = gateway(c);
  const isINR = c === 'INR';
  const isOnc = !!s.oncology;

  // Sub-plan setup (oncology)
  let activeSubPlan = null;
  if (s.subPlans) {
    if (!currentSubPlan || !s.subPlans.find(p => p.key === currentSubPlan)) {
      currentSubPlan = s.defaultSubPlan || s.subPlans[0].key;
    }
    activeSubPlan = s.subPlans.find(p => p.key === currentSubPlan);
  }

  // Price, use sub-plan price for oncology, otherwise service default
  let priceStr, meta, activeRawPrice;
  if (activeSubPlan) {
    activeRawPrice = isINR ? activeSubPlan.inr : activeSubPlan.usd;
    priceStr = isINR ? fmtINR(activeRawPrice) : fmtUSD(activeRawPrice);
    meta = activeSubPlan.label;
  } else {
    priceStr = fmtPrice(s, c);
    meta     = priceMeta(s, c);
    activeRawPrice = isINR ? s.inr.price : s.usd.price;
  }
  const lbl = priceLbl(s, c);

  // Sub-plan cards HTML (oncology only)
  const subPlanSelectorHtml = s.subPlans ? `
    <p class="sub-plan-title">Select your plan</p>
    <div class="sub-plan-cards" id="subPlanCards" role="radiogroup" aria-label="Choose your plan">
      ${s.subPlans.map(sp => {
        const p = isINR ? sp.inr : sp.usd;
        const formatted = isINR ? fmtINR(p) : fmtUSD(p);
        const isActive = sp.key === currentSubPlan;
        return `
          <div class="sub-plan-card${isActive ? ' active' : ''}" data-plan="${sp.key}" role="radio" aria-checked="${isActive}" tabindex="0">
            <div class="spc-top">
              <span class="spc-label">${sp.label}</span>
              <span class="spc-price">${formatted}</span>
            </div>
            <span class="spc-duration">${sp.duration}</span>
            <p class="spc-desc">${sp.desc}</p>
          </div>`;
      }).join('')}
    </div>` : '';

  if (isINR) drawerPhoneCountry = 'IN';

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
    : `<span class="razor"><span class="rzr-mark">R</span> Razorpay · International</span>`;

  const payBtnText = s.payLabel
    ? `${s.payLabel} (Pay ${priceStr})`
    : `Pay ${priceStr} via ${gw}`;

  const payBtnHtml = isINR ? `
    <button class="pay-btn" id="payBtn" data-price="${priceStr}" data-gw="${gw}" data-amount="${activeRawPrice}" data-paylabel="${s.payLabel || ''}">
      <span>${payBtnText}</span>
      <span class="sm">SECURE →</span>
    </button>` : `
    <button class="pay-btn paypal-pay-btn" id="payBtn" data-amount="${activeRawPrice}" data-paylabel="${s.payLabel || ''}">
      <span>${s.payLabel ? `${s.payLabel} (Pay ${priceStr})` : `Pay ${priceStr} via PayPal`}</span>
      <span class="sm">SECURE →</span>
    </button>`;

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
        <input type="tel" placeholder="${phoneFormat(drawerPhoneCountry)}" autocomplete="tel" />
      </div>
    </div>` : `
    <div class="row-2 row-2-equal">
      <div class="field">
        <label>Full name *</label>
        <input type="text" placeholder="Your name" autocomplete="name" />
      </div>
      <div class="field">
        <label>Phone *</label>
        <div class="phone-row">
          ${renderCountryDropdown(drawerPhoneCountry, isINR)}
          <input type="tel" placeholder="${phoneFormat(drawerPhoneCountry)}" autocomplete="tel" />
        </div>
      </div>
    </div>
    <div class="field">
      <label>Email *</label>
      <input type="email" placeholder="you@email.com" autocomplete="email" />
    </div>`;

  const payMethods = isINR
    ? `<div class="pm active" role="radio" aria-checked="true"><span class="dot-r"></span> UPI</div>
       <div class="pm" role="radio" aria-checked="false"><span class="dot-r"></span> Card</div>
       <div class="pm" role="radio" aria-checked="false"><span class="dot-r"></span> Net Banking</div>
       <div class="pm" role="radio" aria-checked="false"><span class="dot-r"></span> Wallet</div>`
    : `<div class="pm active" role="radio" aria-checked="true"><span class="dot-r"></span> International Card</div>
       <div class="pm" role="radio" aria-checked="false"><span class="dot-r"></span> Visa / Mastercard / Amex</div>`;

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
        ${subPlanSelectorHtml}
        <div class="field">
          <label>Amount</label>
          <input type="text" id="amountField" value="${priceStr}" readonly style="background:#F6F8F4;font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;color:var(--ink);font-weight:700;" />
        </div>
        ${formFields}
        ${payBtnHtml}
        ${isINR ? `
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
  bindSubPlanCards(s);
  bindPayBtn();

  // Floating Book Now button — shown when #payBtn is scrolled out of view
  document.getElementById('drawerFloat')?.remove();
  {
    const floatEl = document.createElement('div');
    floatEl.id = 'drawerFloat';
    floatEl.className = 'drawer-float hidden';
    floatEl.innerHTML = `
      <button class="pay-btn float-pay-btn" id="floatPayBtn">
        <span>Book Now</span>
      </button>`;
    document.getElementById('drawer').appendChild(floatEl);

    // Scroll to checkout section, does not trigger payment
    document.getElementById('floatPayBtn')?.addEventListener('click', () => {
      document.getElementById('payBtn')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Show/hide via IntersectionObserver
    const payBtn = document.getElementById('payBtn');
    const drawer = document.getElementById('drawer');
    if (payBtn && drawer) {
      const obs = new IntersectionObserver((entries) => {
        floatEl.classList.toggle('hidden', entries[0].isIntersecting);
      }, { root: drawer, threshold: 0.1 });
      obs.observe(payBtn);
    }
  }
}

function bindSubPlanCards(s) {
  const container = document.getElementById('subPlanCards');
  if (!container || !s.subPlans) return;

  container.querySelectorAll('.sub-plan-card').forEach(card => {
    const activate = () => {
      container.querySelectorAll('.sub-plan-card').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');

      currentSubPlan = card.dataset.plan;
      const sp = s.subPlans.find(p => p.key === currentSubPlan);
      if (!sp) return;

      const isINR = state.currency === 'INR';
      const rawPrice = isINR ? sp.inr : sp.usd;
      const newPriceStr = isINR ? fmtINR(rawPrice) : fmtUSD(rawPrice);

      // Update amount field
      const amountInput = document.getElementById('amountField');
      if (amountInput) amountInput.value = newPriceStr;

      // Update pay button
      const payBtn = document.getElementById('payBtn');
      if (payBtn) {
        payBtn.dataset.amount = String(rawPrice);
        const btnSpan = payBtn.querySelector('span:first-child');
        const payLabel = payBtn.dataset.paylabel;
        if (btnSpan) {
          btnSpan.textContent = payLabel
            ? `${payLabel} (Pay ${newPriceStr})`
            : `Pay ${newPriceStr} via Razorpay`;
        }
      }
    };

    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });
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
    const nameEl  = body?.querySelector('input[type="text"]:not([readonly])');
    const name    = nameEl?.value.trim() ?? '';
    const phone   = body?.querySelector('input[type="tel"]')?.value.trim() ?? '';

    /* ── Basic validation ── */
    const phoneDigits = phone.replace(/\D/g, '');
    const pd = PHONE_DATA[drawerPhoneCountry];
    const phoneValid = phone && (!pd || phoneDigits.length >= pd.min);
    const missing = [];
    if (!email) missing.push('email');
    if (!name)  missing.push('name');
    if (!phoneValid) missing.push('phone');
    if (missing.length) {
      missing.forEach(f => {
        const inp = body?.querySelector(`input[type="${f === 'phone' ? 'tel' : f === 'name' ? 'text' : f}"]${f === 'name' ? ':not([readonly])' : ''}`);
        if (!inp) return;
        if (f === 'phone') {
          showPhoneError(inp, phone ? `Enter a valid ${pd?.min ?? ''}-digit phone number` : 'Phone number is required');
        } else {
          inp.style.outline = '2px solid var(--crimson)';
        }
        inp.focus();
      });
      return;
    }

    /* ── Clear any previous validation errors ── */
    body?.querySelectorAll('input').forEach(i => i.style.outline = '');

    /* ── INR → Razorpay ── */
    if (cur === 'INR') {
      const amount = parseInt(btn.dataset.amount, 10) || s.inr.price;
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
          /* Fire-and-forget confirmation email, don't block the UI */
          fetch('/api/send-confirmation', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id:  resp.razorpay_payment_id,
              razorpay_order_id:    resp.razorpay_order_id,
              razorpay_signature:   resp.razorpay_signature,
              service_key:          currentDrawerKey,
              amount:               amount,
              currency:             'INR',
              customer_name:        name,
              customer_email:       email,
              customer_phone:       phone,
            }),
          })
          .then(async r => {
            const d = await r.json().catch(() => ({}));
            if (d.sent) {
              console.log('[email] ✅ sent OK, count:', d.count);
            } else {
              console.error('[email] ❌ failed:', JSON.stringify(d));
              /* show visible alert on screen so it's never missed */
              alert('⚠️ Payment succeeded but confirmation email failed.\nDetail: ' + (d.detail || d.error || JSON.stringify(d)) + '\n\nPlease check Vercel function logs.');
            }
          })
          .catch(err => {
            console.error('[email] ❌ fetch error:', err);
            alert('⚠️ Payment succeeded but could not reach the email API.\nError: ' + err.message);
          });

          showSuccess(s.name, resp.razorpay_payment_id, s.calendlyUrl || '', name, email);
        },

        onDismiss() {
          /* User closed the modal, restore button */
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
      /* USD → PayPal popup */
      const amount   = parseFloat(btn.dataset.amount) || s.usd.price;
      const origText = btn.innerHTML;

      btn.disabled  = true;
      btn.innerHTML = '<span>Opening PayPal…</span>';

      const dialCode  = document.getElementById('ccActiveDial')?.textContent?.trim() || '';
      const fullPhone = dialCode ? `${dialCode} ${phone}` : phone;

      const pending = {
        name, email, phone: fullPhone,
        service_key: currentDrawerKey,
        amount, currency: 'USD',
        calendlyUrl: s.calendlyUrl || '',
        serviceName: s.name,
      };
      sessionStorage.setItem('paypal_pending', JSON.stringify(pending));

      /* Open blank popup SYNCHRONOUSLY (before any await) so browser allows it */
      const pw = 560, ph = 720;
      const pl = Math.round((screen.width  - pw) / 2);
      const pt = Math.round((screen.height - ph) / 2);
      const popup = window.open(
        'about:blank',
        'paypal_checkout',
        `width=${pw},height=${ph},top=${pt},left=${pl},toolbar=no,menubar=no,scrollbars=yes`
      );

      try {
        const res = await fetch('/api/create-paypal-order', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ amount, currency: 'USD' }),
        });
        const data = await res.json();
        if (!data.approvalUrl) throw new Error(data.error || 'No PayPal approval URL received');

        btn.disabled  = false;
        btn.innerHTML = origText;

        if (!popup || popup.closed) {
          /* Popup was blocked — fall back to full redirect */
          window.location.href = data.approvalUrl;
          return;
        }

        /* Navigate the already-open popup to PayPal */
        popup.location.href = data.approvalUrl;
        showPayPalWaiting(pending, popup);
      } catch (err) {
        popup?.close();
        btn.disabled  = false;
        btn.innerHTML = origText;
        sessionStorage.removeItem('paypal_pending');
        showError('Could not connect to PayPal. Please try again.\n' + err.message);
      }
      return;
    }
  });
}

/* ── PayPal popup overlays ───────────────────────────────────────────── */

function showPayPalWaiting(stored, popup) {
  document.getElementById('paypalStatusOverlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'paypalStatusOverlay';
  overlay.className = 'paypal-status-overlay';
  overlay.innerHTML = `
    <div class="paypal-status-card">
      <div class="paypal-spinner"></div>
      <h3>Complete Your Payment</h3>
      <p>Please complete your payment in the PayPal window. This page will update automatically once your payment is confirmed.</p>
      <div class="paypal-status-tag">Waiting for payment…</div>
    </div>`;
  document.body.appendChild(overlay);

  function onMessage(e) {
    if (e.data?.type === 'PAYPAL_SUCCESS') {
      cleanup(); overlay.remove();
      handlePayPalCapture(e.data.token, stored);
    } else if (e.data?.type === 'PAYPAL_CANCEL') {
      cleanup(); overlay.remove();
      showPayPalFailed(stored);
    }
  }

  const poll = setInterval(() => {
    if (popup.closed) { cleanup(); overlay.remove(); showPayPalFailed(stored); }
  }, 800);

  function cleanup() { clearInterval(poll); window.removeEventListener('message', onMessage); }
  window.addEventListener('message', onMessage);
}

export function showPayPalFailed(stored) {
  document.getElementById('paypalStatusOverlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'paypalStatusOverlay';
  overlay.className = 'paypal-status-overlay';
  overlay.innerHTML = `
    <div class="paypal-status-card failed">
      <div class="paypal-fail-icon">
        <svg viewBox="0 0 88 88" fill="none">
          <circle cx="44" cy="44" r="39" stroke="#e53e3e" stroke-width="3"/>
          <path d="M29 29l30 30M59 29L29 59" stroke="#e53e3e" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
      <h3>Transaction Could Not Be Completed</h3>
      <p>Your transaction could not be completed. This may be due to a PayPal issue, a payment decline, or the process was cancelled.</p>
      <div class="paypal-fail-actions">
        <button class="btn" id="paypalTryAgain">Try Again</button>
        <a href="/" class="btn btn-ghost">Back to Homepage</a>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('paypalTryAgain')?.addEventListener('click', () => {
    overlay.remove();
    sessionStorage.removeItem('paypal_pending');
    if (stored?.service_key) openDrawer(stored.service_key);
  });
}

export async function handlePayPalCapture(orderID, stored) {
  try {
    const captureRes = await fetch('/api/capture-paypal-order', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ orderID }),
    });
    const captureData = await captureRes.json();
    if (captureData.status !== 'COMPLETED') throw new Error('Status: ' + captureData.status);

    const paymentId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderID;

    fetch('/api/send-confirmation', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_order_id:   orderID,
        razorpay_signature:  '',
        service_key:         stored.service_key,
        amount:              stored.amount,
        currency:            'USD',
        customer_name:       stored.name,
        customer_email:      stored.email,
        customer_phone:      stored.phone,
      }),
    }).catch(err => console.error('[paypal email]', err));

    sessionStorage.removeItem('paypal_pending');
    showSuccess(stored.serviceName, paymentId, stored.calendlyUrl, stored.name, stored.email);
  } catch (err) {
    console.error('[paypal capture]', err);
    showPayPalFailed(stored);
  }
}

function openCalendly(url, name, email) {
  if (window.Calendly) {
    window.Calendly.initPopupWidget({
      url,
      prefill: { name, email },
    });
  } else {
    /* Fallback: open in new tab if widget hasn't loaded */
    window.open(url, '_blank');
  }
}

export function showSuccess(serviceName, paymentId, calendlyUrl, customerName, customerEmail) {
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
        A confirmation will be sent to your email shortly. Please schedule a suitable slot now, don't worry if you can't right now, we'll also send you a scheduling link by email. If you have completed consultations in the past, please ignore this scheduling link.
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
    requestAnimationFrame(() => {
      overlay.classList.add('show');

      /* Auto-open Calendly 1.5s after success card appears */
      if (calendlyUrl) {
        setTimeout(() => openCalendly(calendlyUrl, customerName, customerEmail), 1500);
      }
    });
  });

  /* Schedule button, manual trigger */
  document.getElementById('payCalendlyBtn')?.addEventListener('click', () => {
    openCalendly(calendlyUrl, customerName, customerEmail);
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
  currentSubPlan = null;
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
