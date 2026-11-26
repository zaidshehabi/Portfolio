// Light / dark switch. Dark is the default; the choice is kept in localStorage "theme".
// A circle opens from the button (View Transitions API), on desktop and phones alike; older browsers get the content dip.
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
    var meta = document.querySelector('meta[name="theme-color"]'); // the phone's browser bar follows the theme
    if (meta) meta.content = light ? '#f2f3f6' : '#0b0c0e';
    try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch (e) {}
    label();
    window.dispatchEvent(new Event('themechange'));
  }
  label();
  var running = null;

  btn.addEventListener('click', function (ev) {
    var light = root.dataset.theme !== 'light';
    if (reduce || document.hidden || running) { if (running) running.skipTransition(); apply(light); return; }
    // browsers without View Transitions: the content dip (lang.js veilSwap); everyone else, phones too, gets the circle
    if (!document.startViewTransition) {
      if (!window.veilSwap) return apply(light);
      window.veilSwap(light ? '#f2f3f6' : '#0b0c0e', function () { apply(light); });
      return;
    }
    // always from the centre of the sun/moon icon, not where the finger or pointer landed
    var r = (btn.querySelector('svg') || btn).getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    // phones with the address bar at the top (Chrome on Android): the transition is drawn from the top of the screen,
    // the page from below the bar, so move the centre down by the bar's height. iOS Safari keeps its bar at the bottom.
    var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!ios && window.CSS && CSS.supports('height', '100lvh')) {
      var probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;top:0;height:100lvh;width:0;visibility:hidden;pointer-events:none';
      document.body.appendChild(probe);
      y += Math.max(0, probe.getBoundingClientRect().height - innerHeight);
      probe.remove();
    }
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
