// Light / dark switch. Light is the default (data-theme="light" in the HTML); the choice is kept in localStorage "theme".
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
  // want: the theme the visitor last asked for; every tap flips it once, even mid-transition
  var running = null, want = root.dataset.theme === 'light';

  btn.addEventListener('click', function (ev) {
    var light = want = !want;
    if (running) { running.skipTransition(); return; } // the running one applies `want` when it finishes
    if (reduce || document.hidden) return apply(light);
    // browsers without View Transitions: the content dip (lang.js veilSwap); everyone else, phones too, gets the circle
    if (!document.startViewTransition) {
      if (!window.veilSwap) return apply(light);
      window.veilSwap(light ? '#f2f3f6' : '#0b0c0e', function () { apply(light); });
      return;
    }
    // always from the centre of the sun/moon icon, not where the finger or pointer landed
    var r = (btn.querySelector('svg') || btn).getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    // the transition is drawn on the whole screen, address bar area included (100lvh tall). Chrome on Android keeps its
    // bar at the top, so the page sits below it: move the centre down by the bar. iOS Safari keeps its bar at the bottom.
    var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var screenH = innerHeight;
    if (window.CSS && CSS.supports('height', '100lvh')) {
      var probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;top:0;height:100lvh;width:0;visibility:hidden;pointer-events:none';
      document.body.appendChild(probe);
      screenH = Math.max(innerHeight, probe.getBoundingClientRect().height);
      probe.remove();
      if (!ios) y += screenH - innerHeight;
    }
    // grow 30% past the farthest corner: the corners are covered while the edge still moves fast, and the slow end of
    // the curve happens off screen (ending exactly on the corner made the bottom crawl and then pop)
    var end = 1.3 * Math.hypot(Math.max(x, innerWidth - x), Math.max(y, screenH - y));
    // keep the circle light: the background graph pauses and CSS colour transitions are held (html.swap) while it runs
    var t = document.startViewTransition(function () { root.classList.add('swap'); apply(want); });
    running = t;
    window.dispatchEvent(new Event('themeswitchstart'));
    t.updateCallbackDone.catch(function () {});
    t.finished.catch(function () {}).finally(function () {
      if (running === t) running = null;
      root.classList.remove('swap');
      window.dispatchEvent(new Event('themeswitchend'));
      if ((root.dataset.theme === 'light') !== want) apply(want); // a tap during the circle, or a cancelled transition
    });
    t.ready.then(function () {
      // starts at the icon's own size (instant feedback under the finger) and grows on an even curve:
      // a steep ease-out jumps most of the way in the first frames, which shows as a stutter on phones
      root.animate(
        { clipPath: ['circle(' + Math.round(r.width / 2 + 6) + 'px at ' + x + 'px ' + y + 'px)', 'circle(' + Math.ceil(end) + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 700, easing: 'cubic-bezier(.45, .05, .25, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () {});
  });
})();
