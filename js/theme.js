// PREVIEW: light / dark switch. The sun/moon icon flies to the middle of the screen, the new theme opens as a circle
// from there, then the icon flies back into its button. Browsers without View Transitions get the content dip.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.65, 0, .35, 1)';

  function label() {
    var light = root.dataset.theme === 'light';
    btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    btn.setAttribute('aria-pressed', light ? 'true' : 'false');
  }
  function apply(light) {
    if (light) root.dataset.theme = 'light'; else delete root.dataset.theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = light ? '#f2f3f6' : '#0b0c0e';
    try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch (e) {}
    label();
    window.dispatchEvent(new Event('themechange'));
  }
  label();

  // how tall the transition's screen is (address bar area included) and where the page sits in it
  function screenBox() {
    var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var h = innerHeight, shift = 0;
    if (window.CSS && CSS.supports('height', '100lvh')) {
      var probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;top:0;height:100lvh;width:0;visibility:hidden;pointer-events:none';
      document.body.appendChild(probe);
      h = Math.max(innerHeight, probe.getBoundingClientRect().height);
      probe.remove();
      if (!ios) shift = h - innerHeight;
    }
    return { h: h, shift: shift };
  }

  var busy = false, want = root.dataset.theme === 'light';

  btn.addEventListener('click', function () {
    want = !want;
    if (busy) return; // the running switch applies `want` when it ends
    if (reduce || document.hidden) return apply(want);
    if (!document.startViewTransition) {
      if (!window.veilSwap) return apply(want);
      return window.veilSwap('', function () { apply(want); });
    }
    busy = true;

    var icon = btn.querySelector('svg');
    var r = icon.getBoundingClientRect();
    var SCALE = 3.2;
    var cx = innerWidth / 2, cy = innerHeight / 2;
    var dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);

    // a copy of the icon flies; the button's own icon waits invisible
    var fly = document.createElement('div');
    fly.className = 'tt-fly';
    fly.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
    var copy = icon.cloneNode(true);
    copy.querySelector('mask').id = 'tt-cut-fly';
    copy.querySelector('.tt-core').setAttribute('mask', 'url(#tt-cut-fly)');
    fly.appendChild(copy);
    document.body.appendChild(fly);
    icon.style.opacity = '0';

    var there = 'translate(' + dx + 'px,' + dy + 'px) scale(' + SCALE + ')';
    if (window.netSpeed) netSpeed(0, 480); // the background slows to a stop while the icon flies in
    var go = fly.animate([{ transform: 'none' }, { transform: there }], { duration: 480, easing: EASE, fill: 'forwards' });

    go.finished.then(function () {
      var box = screenBox();
      var x = cx, y = cy + box.shift;
      var end = 1.3 * Math.hypot(innerWidth / 2, box.h / 2);
      var start = r.width * SCALE / 2 + 4;
      var t = document.startViewTransition(function () { root.classList.add('swap'); apply(want); });
      t.updateCallbackDone.catch(function () {});
      t.ready.then(function () {
        root.animate(
          { clipPath: ['circle(' + start + 'px at ' + x + 'px ' + y + 'px)', 'circle(' + Math.ceil(end) + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 750, easing: 'cubic-bezier(.45, .05, .25, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
      return t.finished.catch(function () {});
    }).then(function () {
      root.classList.remove('swap');
      if ((root.dataset.theme === 'light') !== want) apply(want);
      if (window.netSpeed) netSpeed(1, 800); // ...and eases back to its drift as the icon flies home
      // a short beat in the middle, then home
      return fly.animate([{ transform: there }, { transform: 'none' }], { duration: 480, delay: 120, easing: EASE, fill: 'forwards' }).finished;
    }).then(function () {
      icon.style.opacity = '';
      fly.remove();
      busy = false;
    });
  });
})();
