// Page motion: parts unveil as they scroll in, the nav pill follows the section in view, a progress line fills the bar,
// the timeline rail fills and lights its dots, the course deck flips, and the hero drifts with the pointer and eases away on scroll.
// Without JS or with reduced motion everything is simply shown (see the html.js rules in style.css).
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. unveil on scroll (once). A position check, not IntersectionObserver: it also unveils what a jump scrolled past,
  // and a fully clipped wipe heading still has a box to measure.
  var pending = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduce) { pending.forEach(function (el) { el.classList.add('in'); }); pending = []; }
  function unveil(vh) {
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < vh * .88) { el.classList.add('in'); return false; }
      return true;
    });
  }

  // 2. nav pill + aria-current follow the section in view
  var nav = document.querySelector('.nav'), pill = nav && nav.querySelector('.nav-pill');
  var links = nav ? [].slice.call(nav.querySelectorAll('a[href^="#"]:not(.nav-home)')) : [];
  var current = null;
  function placePill() {
    if (!pill) return;
    if (!current) { pill.style.setProperty('--o', 0); return; }
    pill.style.setProperty('--x', current.offsetLeft + 'px');
    pill.style.setProperty('--w', current.offsetWidth + 'px');
    pill.style.setProperty('--o', 1);
  }
  function setCurrent(id) {
    var next = null;
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) { next = a; a.setAttribute('aria-current', 'true'); } else a.removeAttribute('aria-current');
    });
    if (next !== current) { current = next; placePill(); if (current && nav.scrollWidth > nav.clientWidth) current.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);

  // 3. per-frame scroll work: progress line, active section, timeline rail, hero fade
  var bar = document.querySelector('.progress'), tl = document.querySelector('.timeline'), heroGrid = document.querySelector('.hero-grid');
  var tlItems = tl ? [].slice.call(tl.children) : [];
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = innerHeight, max = document.documentElement.scrollHeight - vh;
    if (pending.length) unveil(vh);
    if (bar) bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    var id = null;
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < vh * .45) id = s.id; });
    if (max > 0 && y >= max - 4 && sections.length) id = sections[sections.length - 1].id; // the short last section, at the very bottom
    setCurrent(id);
    if (tl) {
      var r = tl.getBoundingClientRect(), mark = vh * .6;
      var p = Math.min(1, Math.max(0, (mark - r.top) / r.height));
      tl.style.setProperty('--tp', p.toFixed(4));
      tlItems.forEach(function (li) { li.classList.toggle('lit', li.getBoundingClientRect().top + 22 < mark); });
    }
    if (heroGrid && !reduce) heroGrid.style.setProperty('--hp', Math.min(1, y / vh).toFixed(4));
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { placePill(); onScroll(); });
  window.addEventListener('load', onScroll); // lazy pictures change the page height
  window.addEventListener('langchange', function () { requestAnimationFrame(function () { placePill(); onScroll(); }); });
  onScroll();

  // 4. course deck: a dot or a back slide comes to the front
  var deck = document.querySelector('.deck');
  if (deck) {
    var slides = [].slice.call(deck.querySelectorAll('.slide')), dots = [].slice.call(deck.querySelectorAll('.deck-dots button'));
    function show(n) {
      slides.forEach(function (s, i) { s.dataset.pos = (i - n + slides.length) % slides.length; });
      dots.forEach(function (d, i) { d.setAttribute('aria-pressed', i === n ? 'true' : 'false'); });
    }
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); }); });
    slides.forEach(function (s, i) { s.addEventListener('click', function () { show(s.dataset.pos === '0' ? (i + 1) % slides.length : i); }); });
    show(0);
  }

  // 5. cards: a soft light follows the pointer inside the card it is over
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    var lit = null;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.panel, .project, .scout, .t-body');
      if (lit && lit !== card) { lit.style.removeProperty('--cx'); lit.style.removeProperty('--cy'); }
      lit = card;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--cx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--cy', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // 6. languages: pick one and it types a hello in that language
  var say = document.querySelector('.lang-say'), sayText = say && say.querySelector('.say-text'), typing = 0;
  document.querySelectorAll('.lang-row').forEach(function (row, i, rows) {
    row.setAttribute('aria-pressed', 'false');
    function pick() {
      if (row.getAttribute('aria-pressed') === 'true') return;
      rows.forEach(function (r) { r.setAttribute('aria-pressed', r === row ? 'true' : 'false'); });
      var text = row.dataset.say, run = ++typing, n = 0;
      say.classList.add('on'); sayText.lang = row.dataset.sayLang; sayText.dir = row.dataset.sayLang === 'ar' ? 'rtl' : 'ltr';
      if (reduce) { sayText.textContent = text; return; }
      sayText.textContent = '';
      (function next() { if (run !== typing) return; sayText.textContent = text.slice(0, ++n); if (n < text.length) setTimeout(next, 28 + Math.random() * 40); })();
    }
    row.addEventListener('click', pick);
    row.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') pick(); });
  });

  // 7. hero: the windows lean towards the pointer a little
  var hero = document.getElementById('hero'), stack = hero && hero.querySelector('.stack');
  if (stack && !reduce && matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      stack.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      stack.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    });
    hero.addEventListener('pointerleave', function () { stack.style.setProperty('--mx', 0); stack.style.setProperty('--my', 0); });
  }
})();
