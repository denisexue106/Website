/* ── PAGE LOAD ── */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// The head script sets html.motion unless reduced motion is on. Every new hidden state in
// MOTION (site.css) waits on it, so without it nothing is hidden.
const motion = document.documentElement.classList.contains('motion');

/* ── MOTION SETUP ──
   Titles below the first screen are split into words here, a mask per word. Titles on the
   first screen ship split in the HTML, so they never show whole first. */
function splitWords(el) {
  if (!el) return;
  let i = 0;
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      if (!n.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
        const w = document.createElement('span'), s = document.createElement('span');
        w.className = 'w'; s.textContent = part; s.style.setProperty('--wi', i++);
        w.appendChild(s); frag.appendChild(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && !n.matches('br, svg, img, .w')) walk(n);
  });
  walk(el);
}
if (motion) {
  document.querySelectorAll('.section-header.fade-up h2').forEach(h => { splitWords(h); h.closest('.section-header').classList.add('has-words'); });
  const contact = document.querySelector('#contact .container');
  if (contact) { splitWords(contact.querySelector('h2')); contact.classList.add('reveal'); }
  document.querySelectorAll('.about-lead').forEach(splitWords);
  document.querySelectorAll('.skill-tag').forEach((t, i) => t.style.setProperty('--ti', i));
  // Case cards play out as you scroll down them: each part has its own reveal (MOTION, case cards).
  document.querySelectorAll('.case-card').forEach(card => {
    splitWords(card.querySelector('h3'));
    card.querySelectorAll('.case-meta, h3, .case-desc, .case-arrow, .band, .callouts, .statcards').forEach(el => el.classList.add('reveal'));
  });
}

// Every hero element that ships hidden belongs in this list. Anything missing from it stays
// invisible forever, which is how the eyebrow removal broke the hero once. The four numbers
// are not here: they arrive when they scroll into view (HERO NUMBERS).
const HERO_PARTS = ['.hero-eyebrow', '#hero h1', '.hero-desc', '.hero-body', '.hero-actions', '.hero-mosaic', '.page-hero'];

function revealHero() {
  HERO_PARTS.forEach(sel => document.querySelector(sel)?.classList.add('in'));
}
function revealAll() {
  document.querySelectorAll('.fade-up, .reveal').forEach(el => el.classList.add('visible'));
  document.querySelector('.hero-facts')?.classList.add('in');
  revealHero();
}

// A deep link has to land on a section that is already visible. Otherwise the intro waits two
// frames, so its hidden first state has painted and the arrival animates.
const deepLink = !!location.hash;
if (deepLink || reduceMotion) revealAll(); else requestAnimationFrame(() => requestAnimationFrame(revealHero));
if (deepLink) {
  // scroll-behavior:smooth would animate this arrival from the top of the page, so force the jump to be instant.
  const jump = () => {
    const t = document.getElementById(location.hash.slice(1));
    if (!t) return;
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(t).scrollMarginTop) || 0));
    root.style.scrollBehavior = prev;
  };
  jump();
  requestAnimationFrame(jump);
  // Fonts and images settle after load and shift the target, so land it again.
  window.addEventListener('load', jump, { once: true });
}
window.addEventListener('pageshow', e => { if (e.persisted) revealAll(); });

/* ── BACK TO TOP ── */
const toTop = document.getElementById('to-top');
window.addEventListener('scroll', () => { toTop.hidden = window.scrollY < 600; }, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

/* ── NAV THEME ── */
// The nav sits white-on-black over the hero and flips to the light treatment the
// moment the dark hero clears it. Measured off the live rect so late-loading images
// that change the hero's height cannot strand it on the wrong theme.
const nav = document.getElementById('nav');
function updateNav() {
  // Transparent only while the page is at rest at the top, where the nav reads as
  // part of the full-bleed hero. The moment anything scrolls it takes the solid
  // light treatment, otherwise hero text runs underneath it and collides.
  nav.classList.toggle('scrolled', window.scrollY > 24);
}
window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('resize', updateNav);
window.addEventListener('load', updateNav);
updateNav();

/* ── PHONE MENU ──
   The Menu button shows the links on a phone. Choosing any link, tapping outside,
   pressing Escape, tabbing out of the panel or widening past 700px closes it. */
(() => {
  const btn = nav.querySelector('.nav-toggle'), menu = document.getElementById('nav-menu');
  const phone = window.matchMedia('(max-width: 700px)');
  const isOpen = () => nav.classList.contains('menu-open');
  const setOpen = open => { nav.classList.toggle('menu-open', open); btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => setOpen(!isOpen()));
  nav.addEventListener('click', e => { if (isOpen() && e.target.closest('a')) setOpen(false); });
  menu.addEventListener('focusout', e => { if (isOpen() && e.relatedTarget && !nav.contains(e.relatedTarget)) setOpen(false); });
  document.addEventListener('click', e => { if (isOpen() && !nav.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) { setOpen(false); btn.focus(); } });
  phone.addEventListener('change', () => { if (!phone.matches) setOpen(false); });
})();

/* ── FADE-UP OBSERVER ──
   Blocks that come into view together arrive one after another, and so do the rows, cards and
   panels inside each one. The delays come off afterwards, so hovers stay instant. */
const observer = new IntersectionObserver((entries) => {
  let k = 0;
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const t = entry.target;
    if (k) { t.style.setProperty('--stagger', `${k * 90}ms`); setTimeout(() => t.style.removeProperty('--stagger'), k * 90 + 1400); }
    k++;
    const kids = t.querySelectorAll('.iconrow, .statcard, .callout, .panel');
    kids.forEach((c, j) => c.style.setProperty('--ri', j));
    if (kids.length) setTimeout(() => kids.forEach(c => c.style.removeProperty('--ri')), kids.length * 90 + 1600);
    t.classList.add('visible');
    // Numbers inside a part with its own reveal (a case card's row of numbers) wait for that part,
    // then each counts up as its own card appears.
    if (motion) t.querySelectorAll('.sc-value').forEach(v => {
      const part = v.closest('.reveal');
      if (part && part !== t && t.contains(part)) return;
      const ri = parseFloat(v.closest('.statcard')?.style.getPropertyValue('--ri')) || 0;
      countUp(v, (parseFloat(t.style.getPropertyValue('--stagger')) || 0) + (part === t ? ri * 110 : 0));
    });
    observer.unobserve(t);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
if (!reduceMotion) document.querySelectorAll('.fade-up, .reveal').forEach(el => observer.observe(el));

/* ── COUNT UP ── a number counts up from zero the first time it arrives, then reads exactly as written */
function countUp(el, delay = 0) {
  const m = el.textContent.trim().match(/^([+]?)(\d+)([%+KM]?)$/);
  if (!m || el.dataset.counted) return;
  el.dataset.counted = '1';
  const final = el.textContent, to = +m[2], dur = 1200, start = performance.now() + 150 + delay;
  el.classList.add('counting');
  el.textContent = m[1] + '0' + m[3];
  const tick = now => {
    const p = Math.min(1, Math.max(0, (now - start) / dur)), e = 1 - Math.pow(1 - p, 3);
    if (p < 1) { el.textContent = m[1] + Math.round(to * e) + m[3]; requestAnimationFrame(tick); }
    else { el.textContent = final; el.classList.remove('counting'); }
  };
  requestAnimationFrame(tick);
}

/* ── HERO NUMBERS ── the four cards rise in turn when the row comes into view, counting up */
(() => {
  const facts = document.querySelector('.hero-facts');
  if (!facts || facts.classList.contains('in')) return;
  const go = () => { facts.classList.add('in'); if (motion) facts.querySelectorAll('.stat-num').forEach((n, i) => countUp(n, i * 90)); };
  if (reduceMotion || !('IntersectionObserver' in window)) { go(); return; }
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); go(); } }, { threshold: 0.2 });
  io.observe(facts);
})();


/* ── HERO MOSAIC VIDEOS: a still first frame at rest, the recording only while hovered or focused ── */
(() => {
  const imgs = [...document.querySelectorAll('.mosaic-card img[data-video]')];
  if (!imgs.length || reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
  imgs.forEach(img => {
    const card = img.closest('.mosaic-card');
    const v = document.createElement('video');
    v.className = 'mosaic-video'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
    v.setAttribute('aria-hidden', 'true');
    img.after(v);
    const play = () => { if (!v.src) v.src = img.dataset.video; v.currentTime = 0; v.play().catch(() => {}); };
    const stop = () => { v.pause(); card.classList.remove('playing'); };
    v.addEventListener('playing', () => card.classList.add('playing'));
    card.addEventListener('mouseenter', play);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('focus', play);
    card.addEventListener('blur', stop);
  });
  // Fetch the recordings once the page has settled, so a hover starts playing straight away.
  window.addEventListener('load', () => imgs.forEach(img => {
    const v = img.nextElementSibling;
    if (v && !v.src) { v.preload = 'auto'; v.src = img.dataset.video; }
  }), { once: true });
})();

/* ── CARD VIDEOS: loaded when near the screen and played only while on it. With reduced
   motion they keep the still poster. ── */
(() => {
  const vids = [...document.querySelectorAll('video.case-cover[data-src]')];
  if (!vids.length || reduceMotion || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); }
    else if (v.src) v.pause();
  }), { rootMargin: '200px 0px' });
  vids.forEach(v => io.observe(v));
})();

/* ── HERO MOSAIC: the stack leans toward the pointer ── */
(() => {
  const mosaic = document.querySelector('.hero-mosaic');
  const hero = document.getElementById('hero');
  if (!mosaic || !hero || reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let raf = 0, px = 0, py = 0;
  const clamp = v => Math.max(-1, Math.min(1, v));
  const apply = () => { raf = 0; mosaic.style.setProperty('--tx', px.toFixed(3)); mosaic.style.setProperty('--ty', py.toFixed(3)); };
  hero.addEventListener('pointermove', e => {
    const r = mosaic.getBoundingClientRect();
    px = clamp((e.clientX - (r.left + r.width / 2)) / r.width);
    py = clamp((e.clientY - (r.top + r.height / 2)) / r.height);
    if (!raf) raf = requestAnimationFrame(apply);
  });
  hero.addEventListener('pointerleave', () => { px = 0; py = 0; if (!raf) raf = requestAnimationFrame(apply); });
})();
