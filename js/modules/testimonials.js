import { TESTIMONIALS } from '../data/testimonials.js';

function quoteCard(t) {
  return `
    <article class="quote">
      <div class="mark">"</div>
      <p>${t.quote}</p>
      <div class="who">
        <div class="av img-ph sage" aria-hidden="true"></div>
        <div>
          <b>${t.name}</b>
          <small>${t.role}</small>
        </div>
        <span class="heart" title="Verified client">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21s-7-4.5-7-11a4 4 0 017-2.6A4 4 0 0119 10c0 6.5-7 11-7 11z"/>
          </svg>
        </span>
      </div>
    </article>`;
}

export function initTestimonials() {
  const track = document.getElementById('track');
  if (!track) return;
  const cards = TESTIMONIALS.map(quoteCard).join('');
  track.innerHTML = cards + cards; // duplicate for seamless loop
}
