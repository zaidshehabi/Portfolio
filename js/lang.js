// PREVIEW: language toggle Arabic <-> English.
// Below desktop (<1024px): the layout never flips (dir stays ltr, text is centred, Arabic runs rtl inside its own spans).
// Desktop: the page still flips to rtl for Arabic.
// The switch: the visible words dissolve into "galactic" glyphs, the language changes under them, then the glyphs resolve into the new words.
(function () {
  var KEY = 'lang';
  var root = document.documentElement;
  var small = window.matchMedia('(width < 1024px)');

  function setLang(lang) {
    if (lang !== 'ar') lang = 'en';
    root.lang = lang;
    root.dir = lang === 'ar' && !small.matches ? 'rtl' : 'ltr'; // below desktop: no flip
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    window.dispatchEvent(new Event('langchange'));
  }
  if (small.addEventListener) small.addEventListener('change', function () { setLang(root.lang); });

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var m = /[?&]lang=(ar|en)(?:&|$)/.exec(location.search);
  if (m) saved = m[1];
  if (saved === 'en') setLang('en');

  // the dip, still used by theme.js on browsers without View Transitions
  var dipping = false;
  function veil(colour, change) {
    if (dipping) return change();
    dipping = true;
    root.classList.add('dip-out');
    setTimeout(function () {
      root.classList.add('swap'); change();
      root.classList.remove('dip-out'); root.classList.add('dip-in');
      void getComputedStyle(document.body).color;
      root.classList.remove('swap');
      setTimeout(function () { root.classList.remove('dip-in'); dipping = false; }, 420);
    }, 150);
  }
  window.veilSwap = veil;

  function keepPlace(change) {
    var anchor = null, top = 0;
    document.querySelectorAll('main > section').forEach(function (s) { var r = s.getBoundingClientRect(); if (!anchor && r.bottom > 80) { anchor = s; top = r.top; } });
    change();
    if (anchor) window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY - top, behavior: 'instant' });
  }

  // ---------- galactic scramble ----------
  var GLYPHS = 'ᔑʖᓵ↸ᒷ⎓⊣⍑╎⋮ꖌꖎᒲリᑑ∷ᓭℸ⚍⍊∴⨅¡⊓⟒⏃⌰⋏'.split('');
  function glyph() { return GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
  var skip = /\s/;

  // text nodes inside the given language's spans that are on screen right now
  function visibleNodes(lang) {
    var out = [], vh = innerHeight;
    document.querySelectorAll('[data-lang="' + lang + '"]').forEach(function (el) {
      if (el.parentElement && el.parentElement.closest('[data-lang]')) return; // nested: the outer one covers it
      var r = el.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40 || (!r.width && !r.height)) return;
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) if (n.nodeValue.trim()) out.push(n);
    });
    return out;
  }
  // Smooth but no heavier than a plain per-frame scramble:
  // - each character gets its own moment to change, leaning a little on reading order, so it flows along the line
  // - each character keeps one glyph (re-rolled only now and then), so the marks shimmer instead of flickering
  // - progress is eased, and a text node is only rewritten on frames where it actually changed
  function prep(nodes) {
    return nodes.map(function (n) {
      var src = n.nodeValue, at = [], g = [], len = src.length || 1;
      for (var i = 0; i < src.length; i++) { at.push(.7 * Math.random() + .3 * (i / len)); g.push(skip.test(src[i]) ? '' : glyph()); }
      return { n: n, src: src, at: at, g: g, last: src };
    });
  }
  function render(items, p, toGlyph, shimmer) {
    if (shimmer == null) shimmer = .04;
    items.forEach(function (it) {
      var s = '';
      for (var i = 0; i < it.src.length; i++) {
        if (!it.g[i]) { s += it.src[i]; continue; }
        if (Math.random() < shimmer) it.g[i] = glyph();
        var changed = it.at[i] < p;
        s += (toGlyph ? changed : !changed) ? it.g[i] : it.src[i];
      }
      if (s !== it.last) { it.n.nodeValue = s; it.last = s; }
    });
  }
  // the glitch speeds up into the swap (ease-in) and the new words come out fast and settle (ease-out), so the
  // motion never stalls in the middle
  function easeIn(p) { return p * p; }
  function easeOut(p) { return 1 - (1 - p) * (1 - p); }
  function run(ms, step, done, curve) {
    var t0 = performance.now();
    (function f(now) {
      var p = Math.min(1, (now - t0) / ms);
      step(curve(p));
      if (p < 1) requestAnimationFrame(f); else done();
    })(t0);
  }

  // Changing language re-lays-out the whole page in one frame, though only one screen of it is visible. For the
  // length of the switch, sections well off screen are frozen at their exact current height (content-visibility:
  // hidden, measured: the language re-layout drops from ~10ms to ~3ms), so the browser skips them. They are released
  // once the switch has finished and nothing is moving, or at once if the visitor scrolls meanwhile.
  function freezeOffscreen() {
    var vh = innerHeight, list = [];
    document.querySelectorAll('main > section, body > footer').forEach(function (sec) {
      var r = sec.getBoundingClientRect();
      if (r.bottom > -vh * .5 && r.top < vh * 1.5) return;
      var cs = getComputedStyle(sec), px = function (v) { return parseFloat(v) || 0; };
      // the intrinsic size is the content box: leave out padding and borders, so the page height stays exactly the same
      var h = r.height - px(cs.paddingTop) - px(cs.paddingBottom) - px(cs.borderTopWidth) - px(cs.borderBottomWidth);
      var w = r.width - px(cs.paddingLeft) - px(cs.paddingRight) - px(cs.borderLeftWidth) - px(cs.borderRightWidth);
      sec.style.containIntrinsicSize = 'auto ' + w + 'px auto ' + h + 'px';
      sec.style.contentVisibility = 'hidden';
      list.push(sec);
    });
    var freed = false, y0 = scrollY;
    function free() {
      if (freed) return; freed = true;
      removeEventListener('scroll', onScroll);
      // sections above the screen may change height in the new language: keep the reader where they are
      keepPlace(function () { list.forEach(function (sec) { sec.style.contentVisibility = ''; sec.style.containIntrinsicSize = ''; }); });
    }
    function onScroll() { if (Math.abs(scrollY - y0) > 2) free(); } // a real scroll, not the switch's own correction
    if (list.length) addEventListener('scroll', onScroll, { passive: true });
    return function release() {
      if (window.requestIdleCallback) requestIdleCallback(free, { timeout: 400 }); else setTimeout(free, 60);
    };
  }

  // ---------- desktop: hide the mirror inside the glitch ----------
  // The page has to flip for Arabic, but a big slide across the screen draws the eye to it. Instead each on-screen
  // block fades out at the end of the glitch, the page flips while they are invisible, and they fade back in at
  // their new places with only a short drift from the old side and a slight cascade, so it reads as part of the
  // glitch, not as a layout flip. Only opacity and transform change (GPU work); the drift uses composite 'add' so
  // it sits on top of transforms the blocks already have (tilted devices).
  var BLOCKS = '.nav > a, .head-actions, .hero-text > *, .stack > *, .section-head > *, .about-text > *, .panel, ' +
    '.project-body > *, .project-media, .scout-intro > *, .scout-phone, .features > *, .course-text > *, .deck, ' +
    '.timeline > *, #contact .wrap > *, footer .wrap > *';
  function clamp(v, m) { return Math.max(-m, Math.min(m, v)); }
  function mirrorPrep() {
    if (small.matches || !Element.prototype.animate) return null; // below desktop nothing mirrors
    var vh = innerHeight, items = [];
    document.querySelectorAll(BLOCKS).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100 || !r.width) return;
      if (el.parentElement.closest(BLOCKS)) return; // inside another block: it goes with that one
      items.push({ el: el, r: r });
    });
    return {
      fade: function () {
        items.forEach(function (it) {
          it.out = it.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T.fade, easing: 'ease-in', fill: 'forwards' });
        });
      },
      settle: function () {
        items.forEach(function (it, i) {
          var n = it.el.getBoundingClientRect();
          var dx = clamp((it.r.left + it.r.width / 2 - (n.left + n.width / 2)) * .08, 28), dy = clamp((it.r.top - n.top) * .08, 12);
          var timing = { duration: T.settle, delay: Math.min(i * 22, 220), easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'backwards' };
          it.el.animate([{ opacity: 0 }, { opacity: 1 }], timing);
          it.el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'translate(0,0)' }],
            Object.assign({ composite: 'add' }, timing));
          if (it.out) it.out.cancel();
        });
      }
    };
  }

  // the switch: the words glitch into glyphs, speeding up into the swap; the language changes at the peak (desktop:
  // blocks have faded out, flip unseen and fade back in at their new places); the new words come straight out of the
  // glyphs, fast at first and settling, with no pause in between
  var T = { out: 380, fade: 160, settle: 480, resolve: 650 };
  var busy = false, want = null;
  function toggle() {
    want = (want || root.lang) === 'ar' ? 'en' : 'ar';
    if (busy) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return keepPlace(function () { setLang(want); });
    busy = true;
    var target = want;
    var release = freezeOffscreen(); // early, so the browser has already set those sections aside by the swap
    var out = prep(visibleNodes(root.lang));
    var mirror = mirrorPrep();
    root.classList.add('scrambling');
    var t0 = performance.now(), faded = !mirror;
    run(T.out, function (p) {
      render(out, p, true);
      // the blocks start going out as the glitch peaks, on the same clock as the glyphs
      if (!faded && performance.now() - t0 >= T.out - T.fade) { faded = true; mirror.fade(); }
    }, function () {
      if (!faded) mirror.fade();
      keepPlace(function () { setLang(target); });
      out.forEach(function (it) { it.n.nodeValue = it.src; }); // the old words are hidden now: put them back unseen
      if (mirror) mirror.settle();
      var inn = prep(visibleNodes(target));
      render(inn, 0, false);
      run(T.resolve, function (p) { render(inn, p, false); }, function () {
        inn.forEach(function (it) { it.n.nodeValue = it.src; });
        root.classList.remove('scrambling');
        release();
        busy = false;
        if (root.lang !== want) toggle.again();
      }, easeOut);
    }, easeIn);
  }
  toggle.again = function () { want = root.lang; toggle(); };

  document.addEventListener('DOMContentLoaded', function () {
    setLang(root.lang);
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', toggle);
  });

  window.setLang = setLang;
})();
