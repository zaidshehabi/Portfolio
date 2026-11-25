// Language toggle: English (default) <-> Arabic. Arabic flips the whole page right-to-left (dir="rtl").
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
  if (saved === 'ar') setLang('ar'); else if (m) setLang('en');

  // Phones: View Transitions snapshot the whole page and the moving address bar cancels them, which looks glitchy.
  // There, a plain veil in the page colour fades in, the change happens under it, and it fades out. Shared with theme.js.
  var small = window.matchMedia('(max-width: 760px), (pointer: coarse)');
  function veil(colour, change) {
    var v = document.createElement('div');
    v.className = 'veil'; v.style.background = colour;
    document.body.appendChild(v);
    v.getBoundingClientRect(); // start from opacity 0
    v.classList.add('on');
    setTimeout(function () {
      change();
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        v.classList.add('out'); v.classList.remove('on');
        setTimeout(function () { v.remove(); }, 380);
      }); });
    }, 170);
  }
  window.veilSwap = veil;

  // keep the reader on the same section: the flip changes heights, so put that section's top back where it was
  function keepPlace(change) {
    var anchor = null, top = 0;
    document.querySelectorAll('main > section').forEach(function (s) { var r = s.getBoundingClientRect(); if (!anchor && r.bottom > 80) { anchor = s; top = r.top; } });
    change();
    if (anchor) window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY - top, behavior: 'instant' });
  }

  function toggle() {
    var next = root.lang === 'ar' ? 'en' : 'ar';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var swap = function () { keepPlace(function () { setLang(next); }); };
    if (reduce) return swap();
    if (small.matches || !document.startViewTransition) return veil(getComputedStyle(document.body).backgroundColor, swap);
    root.classList.add('lang-switch'); // scopes the cross-fade so the theme switch keeps its own circle
    var t = document.startViewTransition(swap);
    t.updateCallbackDone.catch(function () {}); t.ready.catch(function () {});
    t.finished.catch(function () {}).finally(function () { root.classList.remove('lang-switch'); if (root.lang !== next) setLang(next); }); // still switch if the animation was cancelled
  }

  document.addEventListener('DOMContentLoaded', function () {
    setLang(root.lang);
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', toggle);
  });

  window.setLang = setLang;
})();
