// Page background: a network graph behind the whole site. Nodes drift, nearby nodes link, packets travel the links.
// The pointer is a node too: it links to what is near, nudges nodes aside, and a click sends a ripple and a burst of packets.
// Scrolling moves the nodes at different depths. Vanilla canvas; pauses when the tab is hidden; one still frame under reduced motion.
(function () {
  var canvas = document.querySelector('canvas.net');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, nodes = [], packets = [], ripples = [], link = 150, raf = 0, running = false;
  var ptr = { x: -9999, y: -9999, on: false, glow: 0 }, lastY = window.scrollY;
  var R = 170; // pointer reach
  // touch screens: the finger drives it, also while scrolling
  // phones get a calmer graph: fewer nodes and packets, a gentle touch, no wandering ghost
  var coarse = window.matchMedia('(pointer: coarse)').matches, touching = false, touchTimer = 0, calm = false;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function setup() {
    W = innerWidth; H = innerHeight; calm = coarse || W < 760;
    dpr = Math.min(window.devicePixelRatio || 1, calm ? 1.5 : 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = calm ? Math.round(Math.min(30, Math.max(18, (W * H) / 14000))) : Math.round(Math.min(110, Math.max(34, (W * H) / 15000)));
    link = calm ? 105 : 150; R = calm ? 90 : 170;
    nodes = [];
    for (var i = 0; i < count; i++) {
      var bvx = rand(-.18, .18), bvy = rand(-.18, .18);
      nodes.push({ x: rand(0, W), y: rand(0, H), vx: bvx, vy: bvy, bvx: bvx, bvy: bvy, depth: rand(.08, .35), hub: Math.random() < .12, heat: 0 });
    }
    packets = []; ripples = [];
  }

  function nearest(x, y, skip) {
    var best = null, bd = Infinity;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i]; if (n === skip) continue;
      var d = Math.hypot(n.x - x, n.y - y);
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }
  function spawnFrom(a) {
    var best = null, bd = Infinity;
    for (var i = 0; i < nodes.length; i++) {
      var b = nodes[i]; if (b === a) continue;
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < link && d < bd && Math.random() < .7) { bd = d; best = b; }
    }
    if (best) packets.push({ a: a, b: best, t: 0, speed: rand(.01, .02) });
  }

  function colours() {
    var light = document.documentElement.dataset.theme === 'light';
    return light
      // light: softer than dark, so hubs and packets never read as blots on top of the text
      ? { link: '31,45,230', lk: .13, node: 'rgba(60,66,80,.22)', hub: 'rgba(31,45,230,.32)', ring: 'rgba(31,45,230,', pk: 'rgba(31,45,230,.38)' }
      : { link: '120,135,255', lk: .2, node: 'rgba(180,186,200,.5)', hub: 'rgba(140,152,255,.95)', ring: 'rgba(120,135,255,', pk: 'rgba(170,180,255,.95)' };
  }

  function step() {
    var dy = window.scrollY - lastY; lastY = window.scrollY;
    var pull = calm ? .35 : 1;
    ptr.glow += ((ptr.on ? (calm ? .45 : 1) : 0) - ptr.glow) * .08;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.y -= dy * n.depth; // parallax: deeper nodes move less
      if (ptr.on) {
        var dx = n.x - ptr.x, dyy = n.y - ptr.y, d = Math.hypot(dx, dyy);
        if (d < R && d > .1) { var f = (1 - d / R) * .55 * pull; n.vx += dx / d * f; n.vy += dyy / d * f; n.heat = Math.min(1, n.heat + .12); }
      }
      for (var k = 0; k < ripples.length; k++) {
        var rp = ripples[k], ex = n.x - rp.x, ey = n.y - rp.y, ed = Math.hypot(ex, ey);
        if (ed > .1 && Math.abs(ed - rp.r) < 26) { var g = (calm ? 1 : 2.2) * (1 - rp.r / rp.max); n.vx += ex / ed * g; n.vy += ey / ed * g; n.heat = 1; }
      }
      n.vx = n.vx * .93 + n.bvx * .07; n.vy = n.vy * .93 + n.bvy * .07; // ease back to the slow drift
      n.x += n.vx; n.y += n.vy; n.heat *= .965;
      if (n.x < -30) n.x = W + 30; else if (n.x > W + 30) n.x = -30;
      if (n.y < -30) n.y = H + 30; else if (n.y > H + 30) n.y = -30;
    }
    for (var r = ripples.length - 1; r >= 0; r--) { ripples[r].r += 7; if (ripples[r].r > ripples[r].max) ripples.splice(r, 1); }
    if (packets.length < (calm ? 5 : 16) && Math.random() < (calm ? .04 : .08)) spawnFrom(nodes[(Math.random() * nodes.length) | 0]);
  }

  function draw() {
    var c = colours();
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          var al = c.lk * (1 - d / link) * (1 + (a.heat + b.heat) * 1.6);
          ctx.strokeStyle = 'rgba(' + c.link + ',' + al.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    if (ptr.glow > .02) { // the pointer's own links
      for (var p = 0; p < nodes.length; p++) {
        var n = nodes[p], pd = Math.hypot(n.x - ptr.x, n.y - ptr.y);
        if (pd < R * 1.25) {
          ctx.strokeStyle = 'rgba(' + c.link + ',' + (.55 * (1 - pd / (R * 1.25)) * ptr.glow).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(ptr.x, ptr.y); ctx.lineTo(n.x, n.y); ctx.stroke();
        }
      }
      ctx.fillStyle = c.ring + (.5 * ptr.glow).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(ptr.x, ptr.y, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    for (var q = 0; q < nodes.length; q++) {
      var m = nodes[q], rr = (m.hub ? 2.6 : 1.4) + m.heat * 1.6;
      ctx.fillStyle = m.hub || m.heat > .5 ? c.hub : c.node;
      ctx.beginPath(); ctx.arc(m.x, m.y, rr, 0, Math.PI * 2); ctx.fill();
      if (m.hub) { ctx.strokeStyle = c.ring + '.35)'; ctx.beginPath(); ctx.arc(m.x, m.y, 7 + m.heat * 3, 0, Math.PI * 2); ctx.stroke(); }
    }
    for (var s = 0; s < ripples.length; s++) {
      var rp = ripples[s];
      ctx.strokeStyle = c.ring + (.45 * (1 - rp.r / rp.max)).toFixed(3) + ')'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1;
    }
    for (var k = packets.length - 1; k >= 0; k--) {
      var pk = packets[k];
      pk.t += running ? pk.speed : 0;
      if (pk.t >= 1 || Math.hypot(pk.a.x - pk.b.x, pk.a.y - pk.b.y) > link * 1.2) {
        if (pk.t >= 1 && pk.burst > 0) { var len = packets.length; spawnFrom(pk.b); if (packets.length > len) packets[len].burst = pk.burst - 1; } // a click's packets hop on
        packets.splice(k, 1); continue;
      }
      var x = pk.a.x + (pk.b.x - pk.a.x) * pk.t, y = pk.a.y + (pk.b.y - pk.a.y) * pk.t;
      var gr = ctx.createRadialGradient(x, y, 0, x, y, 9);
      gr.addColorStop(0, c.pk); gr.addColorStop(1, c.ring + '0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
    }
  }

  function loop() { step(); draw(); raf = requestAnimationFrame(loop); }
  function start() { if (!running && !reduce && !document.hidden) { running = true; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  setup();
  if (reduce) { for (var i = 0; i < 4; i++) spawnFrom(nodes[i]); packets.forEach(function (p) { p.t = Math.random(); }); draw(); }
  else start();

  if (!reduce) {
    window.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true; }, { passive: true });
    document.addEventListener('pointerleave', function () { ptr.on = false; });
    window.addEventListener('blur', function () { ptr.on = false; });
    window.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse' && !touching) ptr.on = false; });
    function touch(e) { var t = e.touches[0]; if (!t) return; touching = true; ptr.on = true; ptr.x = t.clientX; ptr.y = t.clientY; clearTimeout(touchTimer); }
    window.addEventListener('touchstart', touch, { passive: true });
    window.addEventListener('touchmove', touch, { passive: true }); // keeps coming while the page scrolls under the finger
    window.addEventListener('touchend', function () { clearTimeout(touchTimer); touchTimer = setTimeout(function () { touching = false; ptr.on = false; }, 600); }, { passive: true });
    window.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a, button, input, textarea, select, [role="group"]')) return; // controls keep their own click
      ripples.push({ x: e.clientX, y: e.clientY, r: 0, max: Math.max(W, H) * (calm ? .28 : .45) });
      var n = nearest(e.clientX, e.clientY);
      for (var b = 0; b < (calm ? 2 : 5) && n; b++) { var len = packets.length; spawnFrom(n); if (packets.length > len) packets[len].burst = 3; }
    });
  }
  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      // a phone's address bar changes only the height while scrolling: keep the nodes, just resize the canvas
      if (innerWidth === W) { H = innerHeight; canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      else setup();
      if (reduce) draw();
    }, 150);
  });
  window.addEventListener('themechange', function () { draw(); }); // the new colours show at once, also inside the paused circle
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  // hold still during the light/dark circle, so the browser only has to grow the circle (theme.js)
  window.addEventListener('themeswitchstart', stop);
  window.addEventListener('themeswitchend', function () { draw(); start(); });
})();
