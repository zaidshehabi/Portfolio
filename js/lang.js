// Language toggle: Arabic (default, set in the HTML) <-> English. Arabic flips the whole page right-to-left (dir="rtl").
// The switch cross-fades through the View Transitions API on desktop and fades through a veil on phones. Choice kept in localStorage "lang".
(function () {
  var KEY = 'lang';
  var root = document.documentElement;

  function setLang(lang) {
    if (lang !== 'ar') lang = 'en';
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    try { localStorage.setItem(KEY, lang); } catch (e) { /* storage blocked: still works for this visit */ }
    window.dispatchEvent(new Event('langchange'));
  }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var m = /[?&]lang=(ar|en)(?:&|$)/.exec(location.search);
  if (m) saved = m[1];
  if (saved === 'en') setLang('en'); // Arabic is the page's own default

  // Phones: View Transitions snapshot the whole page and the moving address bar cancels them, which looks glitchy,
  // and a full-screen veil reads as a blank flash. There the content dips out (.15s), the change happens, and it
  // rises back (.38s) while the page ground glides to its new colour (CSS: html.dip-out / html.dip-in). Shared with theme.js.
  var small = window.matchMedia('(max-width: 760px), (pointer: coarse)');
  var dipping = false;
  function veil(colour, change) {
    if (dipping) return change();
    dipping = true;
    root.classList.add('dip-out');
    setTimeout(function () {
      root.classList.add('swap'); // all colours switch at once under the dip, none lagging behind
      change();
      root.classList.remove('dip-out');
      root.classList.add('dip-in');
      void getComputedStyle(document.body).color; // apply the new colours now, then let transitions back on
      root.classList.remove('swap');
      setTimeout(function () { root.classList.remove('dip-in'); dipping = false; }, 420);
    }, 150);
  }
  window.veilSwap = veil;

  // keep the reader on the same section: the flip changes heights, so put that section's top back where it was
  function keepPlace(change) {
    var anchor = null, top = 0;
    document.querySelectorAll('main > section').forEach(function (s) { var r = s.getBoundingClientRect(); if (!anchor && r.bottom > 80) { anchor = s; top = r.top; } });
    change();
    if (anchor) window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY - top, behavior: 'instant' });
  }

  // want: the language the visitor last asked for; every tap flips it once, even during a dip or cross-fade
  var want = null;
  function toggle() {
    want = (want || root.lang) === 'ar' ? 'en' : 'ar';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var swap = function () { if (root.lang !== want) keepPlace(function () { setLang(want); }); };
    if (reduce) return swap();
    if (small.matches || !document.startViewTransition) return veil(getComputedStyle(document.body).backgroundColor, swap);
    root.classList.add('lang-switch'); // scopes the cross-fade so the theme switch keeps its own circle
    var t = document.startViewTransition(swap);
    t.updateCallbackDone.catch(function () {}); t.ready.catch(function () {});
    t.finished.catch(function () {}).finally(function () { root.classList.remove('lang-switch'); if (root.lang !== want) setLang(want); }); // still switch if the animation was cancelled
  }

  document.addEventListener('DOMContentLoaded', function () {
    setLang(root.lang);
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', toggle);
  });

  window.setLang = setLang;
})();
