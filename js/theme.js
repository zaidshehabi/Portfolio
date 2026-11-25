// Light / dark switch. Dark is the default; the choice is kept in localStorage "theme".
// On desktop a circle opens from the button (View Transitions API); phones fade through a veil in the new colour.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function label() {
    var light = root.dataset.theme === 'light';
    btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    btn.setAttribute('aria-pressed', light ? 'true' : 'false');
  }
  function apply(light) {
    if (light) root.dataset.theme = 'light'; else delete root.dataset.theme;
    try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch (e) {}
    label();
    window.dispatchEvent(new Event('themechange'));
  }
  label();
  var running = null;

  btn.addEventListener('click', function (ev) {
    var light = root.dataset.theme !== 'light';
    if (reduce || document.hidden || running) { if (running) running.skipTransition(); apply(light); return; }
    // phones (and browsers without View Transitions): fade through a veil in the new page colour (lang.js veilSwap)
    if (window.veilSwap && (!document.startViewTransition || window.matchMedia('(max-width: 760px), (pointer: coarse)').matches)) {
      window.veilSwap(light ? '#f2f3f6' : '#0b0c0e', function () { apply(light); });
      return;
    }
    var r = btn.getBoundingClientRect();
    var x = ev.clientX || r.left + r.width / 2, y = ev.clientY || r.top + r.height / 2;
    var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    running = document.startViewTransition(function () { apply(light); });
    // a cancelled transition (a phone's address bar moving resizes the viewport) must still switch the theme
    running.updateCallbackDone.catch(function () {});
    running.finished.catch(function () {}).finally(function () { running = null; if ((root.dataset.theme === 'light') !== light) apply(light); });
    running.ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () {});
  });
})();
