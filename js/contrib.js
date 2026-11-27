// Course slide 1: the green activity grid comes alive. The squares are laid exactly over the ones in the picture
// (each found in the 1440x810 slide) and start with the picture's own colours, so nothing jumps when it begins.
// Then squares light up and dim at random, and every few seconds a wave of activity runs across towards the title.
// Only background colours change (a few squares at a time); it runs only while the slide is on screen and in front,
// and stays still under reduced motion.
(function () {
  var slide = document.querySelector('.slide-live'), box = slide && slide.querySelector('.contrib');
  if (!box) return;
  var W = 1440, H = 810;
  // every square of the picture's grid: x, y, width, height, level (0 empty, 1 to 4 darker to brighter green) and
  // opacity in percent (the picture fades the grid out at both ends). The squares vary a little in size and place,
  // so each has its own rectangle.
  var BOXES = '527,356,19,19,1,100;502,357,20,19,2,92;390,360,19,18,1,77;282,362,18,18,0,100;325,362,18,16,0,82;346,362,18,17,0,100;368,362,18,16,0,71;263,363,17,16,1,88;304,363,18,16,0,100;183,364,17,18,2,100;203,364,16,17,2,95;221,364,18,17,0,93;243,364,17,17,0,93;164,365,16,16,1,88;126,366,17,16,0,100;146,366,16,17,0,100;88,367,19,16,0,100;108,367,16,15,0,100;36,368,15,16,0,93;19,369,15,15,1,88;526,380,19,18,0,100;550,380,10,18,1,100;389,381,19,20,2,100;262,382,17,19,1,100;302,382,19,19,0,100;345,382,18,18,0,93;367,382,18,18,1,88;282,383,18,18,2,100;324,383,18,17,1,100;202,384,17,18,2,100;222,384,16,18,1,100;242,384,17,17,1,88;164,385,16,17,1,100;183,385,16,17,0,93;89,386,15,18,1,100;107,386,16,17,2,100;126,386,15,16,1,100;144,386,17,17,0,100;34,387,16,17,0,100;52,387,15,16,1,100;71,387,14,17,1,100;18,388,14,16,0,93;526,402,20,19,1,100;550,403,10,18,0,100;302,404,19,19,0,100;322,404,19,18,0,93;345,404,17,18,3,85;409,404,20,18,2,100;432,404,21,18,1,77;162,405,16,18,2,100;201,405,17,18,1,100;221,405,16,18,2,100;240,405,17,18,1,100;281,405,18,17,2,95;68,406,16,18,1,100;87,406,15,18,0,100;106,406,15,17,0,93;124,406,16,17,1,100;142,406,16,17,1,100;182,406,16,19,0,100;261,406,17,16,0,100;0,407,13,17,0,100;15,407,15,16,0,93;34,407,14,16,1,100;51,407,15,16,2,97;0,426,12,17,0,100;14,426,15,17,0,100;49,426,15,17,0,100;68,426,15,17,0,100;85,426,17,17,0,100;104,426,16,18,2,100;122,426,17,18,0,100;180,426,16,18,2,100;200,426,16,18,1,100;220,426,16,18,2,100;237,426,22,18,0,100;260,426,17,18,2,100;280,426,18,18,2,97;300,426,19,19,0,100;322,426,18,19,0,93;343,426,19,19,0,82;387,426,19,18,3,100;410,426,17,19,0,71;432,426,19,19,1,65;502,426,19,19,1,100;31,427,15,16,0,100;142,427,16,16,1,88;160,427,16,17,1,100;0,446,11,17,0,82;13,446,15,17,1,88;30,446,16,17,1,88;48,446,15,18,0,100;66,446,16,19,0,100;219,446,17,19,0,100;84,447,16,17,1,100;102,447,17,16,1,100;121,447,16,19,0,100;140,447,16,17,2,100;160,447,16,17,1,100;179,447,16,18,2,100;299,447,20,18,1,88;198,448,16,17,0,100;238,448,17,18,3,100;258,448,18,17,3,97;280,448,17,18,3,100;386,448,19,18,2,71;409,448,18,20,0,71;432,448,19,19,1,100;478,448,19,20,1,100;365,449,18,18,1,77;502,449,19,19,2,92;525,449,19,19,1,100;11,466,15,17,1,100;29,466,16,17,0,100;46,466,16,18,2,100;65,467,15,17,2,97;102,467,15,18,0,100;83,468,15,17,0,93;120,468,16,17,1,88;138,468,17,17,0,100;158,468,17,18,0,100;178,468,17,18,2,100;196,468,19,18,0,93;237,468,17,19,1,88;319,468,19,20,0,100;217,469,17,18,3,100;257,470,18,18,0,93;300,470,17,18,3,100;342,470,19,19,0,93;364,470,18,19,0,71;408,470,17,19,0,61;386,471,18,19,2,73;431,471,19,19,2,100;477,472,20,18,2,71;525,472,20,19,1,100;550,474,10,17,0,82;10,486,15,16,0,93;27,487,15,16,0,100;81,487,17,18,0,93;100,487,17,18,1,100;118,488,17,18,0,93;138,489,16,16,1,100;157,489,17,17,0,100;176,490,17,17,2,100;196,490,17,17,0,100;216,490,17,18,0,100;236,490,18,18,2,100;256,491,20,18,0,100;299,492,17,18,3,99;320,492,17,18,1,100;342,492,18,19,2,81;363,493,19,18,2,79;408,493,19,18,1,65;386,494,18,17,0,71;430,494,20,19,1,100;477,494,19,21,2,76;525,496,19,19,0,100;549,496,11,19,1,100';
  var cells = [];
  BOXES.split(';').forEach(function (b) {
    var v = b.split(',').map(Number), i = document.createElement('i');
    i.style.cssText = 'left:' + (v[0] / W * 100) + '%;top:' + (v[1] / H * 100) + '%;width:' + (v[2] / W * 100) + '%;height:' + (v[3] / H * 100) + '%;opacity:' + v[5] / 100;
    var cell = { el: i, lvl: v[4], c: Math.round(v[0] / 21) };
    i.className = 'l' + cell.lvl;
    box.appendChild(i); cells.push(cell);
  });
  var COLS = 1 + Math.max.apply(null, cells.map(function (c) { return c.c; }));
  function set(cell, lvl) { lvl = Math.max(0, Math.min(4, lvl)); if (lvl !== cell.lvl) { cell.lvl = lvl; cell.el.className = 'l' + lvl; } }
  // most squares are empty or dark, a few bright: like a real contribution graph
  function pick() { var x = Math.random(); return x < .42 ? 0 : x < .68 ? 1 : x < .86 ? 2 : x < .96 ? 3 : 4; }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var on = false, seen = false, twinkle = 0, waveTimer = 0, waveCol = -1;
  function tick() { for (var k = 0; k < 3; k++) set(cells[(Math.random() * cells.length) | 0], pick()); } // a few squares each beat
  function waveStep() {
    // a band of activity sweeps left to right: each column brightens, then settles on a new level or its old one
    if (waveCol >= 0) cells.forEach(function (cell) { if (cell.c === waveCol && cell.boost != null) { set(cell, cell.boost); cell.boost = null; } });
    waveCol++;
    if (waveCol >= COLS) { waveCol = -1; return; }
    cells.forEach(function (cell) { if (cell.c === waveCol) { cell.boost = Math.random() < .5 ? pick() : cell.lvl; set(cell, cell.lvl + 2); } });
    setTimeout(waveStep, 55);
  }
  function wave() { if (on && waveCol < 0) waveStep(); }
  function update() {
    var go = seen && slide.dataset.pos === '0' && !document.hidden;
    if (go === on) return;
    on = go;
    clearInterval(twinkle); clearInterval(waveTimer);
    if (on) { twinkle = setInterval(tick, 160); waveTimer = setInterval(wave, 4200); setTimeout(wave, 600); }
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { seen = e[0].isIntersecting; update(); }, { threshold: .2 }).observe(slide);
  else seen = true;
  document.addEventListener('visibilitychange', update);
  new MutationObserver(update).observe(slide, { attributes: true, attributeFilter: ['data-pos'] });
  update();
})();
