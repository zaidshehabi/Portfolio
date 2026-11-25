// Language toggle: English (default) <-> Arabic. Arabic flips the whole page right-to-left (dir="rtl").
// The switch cross-fades through the View Transitions API; older browsers switch at once. Choice kept in localStorage "lang".
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

  function toggle() {
    var next = root.lang === 'ar' ? 'en' : 'ar';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) return setLang(next);
    root.classList.add('lang-switch'); // scopes the cross-fade so the theme switch keeps its own circle
    var t = document.startViewTransition(function () { setLang(next); });
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
