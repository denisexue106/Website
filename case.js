/* Case studies: a reading progress bar under the menu, and the On this page link for the
   section on screen lights up and scrolls into view in its bar. */
(() => {
  const nav = document.querySelector('nav:not(.jump)');
  const jump = document.querySelector('.jump');
  if (nav) {
    const bar = document.createElement('span');
    bar.className = 'read-progress'; bar.setAttribute('aria-hidden', 'true');
    nav.appendChild(bar);
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
      document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    addEventListener('resize', update);
    update();
  }
  if (!jump || !('IntersectionObserver' in window)) return;
  const links = [...jump.querySelectorAll('a[href^="#"]')];
  const map = new Map(links.map(a => [document.getElementById(a.hash.slice(1)), a]).filter(([s]) => s));
  const row = jump.querySelector('.container');
  let current = null;
  const setOn = a => {
    if (a === current) return;
    if (current) { current.classList.remove('on'); current.removeAttribute('aria-current'); }
    current = a;
    if (!a) return;
    a.classList.add('on'); a.setAttribute('aria-current', 'location');
    const left = a.offsetLeft - row.offsetLeft - (row.clientWidth - a.offsetWidth) / 2;
    row.scrollTo({ left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  const visible = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
    const first = [...map.keys()].find(s => visible.has(s));
    setOn(first ? map.get(first) : null);
  }, { rootMargin: '-35% 0px -60% 0px' });
  map.forEach((a, s) => io.observe(s));
})();
