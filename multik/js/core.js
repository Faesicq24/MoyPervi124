/* VSPYSHKA - core.js: math, color, pixel primitives, 5x7 font (Latin + Cyrillic), icons, speech bubbles */
(function () {
  'use strict';
  const M = (window.M = window.M || {});
  const W = (M.W = 480), H = (M.H = 270);

  const clamp = (M.clamp = (v, a, b) => (v < a ? a : v > b ? b : v));
  const lerp = (M.lerp = (a, b, t) => a + (b - a) * t);
  M.inv = (a, b, v) => clamp((v - a) / (b - a), 0, 1);

  const E = (M.E = {
    lin: (t) => t,
    inQ: (t) => t * t,
    outQ: (t) => 1 - (1 - t) * (1 - t),
    ioQ: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    inC: (t) => t * t * t,
    outC: (t) => 1 - Math.pow(1 - t, 3),
    ioC: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outBack: (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
    inBack: (t) => 2.70158 * t * t * t - 1.70158 * t * t,
    outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * 2.0944) + 1),
    outBounce: (t) => {
      const n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) { t -= 1.5 / d; return n * t * t + 0.75; }
      if (t < 2.5 / d) { t -= 2.25 / d; return n * t * t + 0.9375; }
      t -= 2.625 / d; return n * t * t + 0.984375;
    },
    sine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  });

  // keyframes [[time, value, ease], ...]; value = number or array
  M.kf = function (t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const k = keys[i];
      if (t < k[0]) {
        const p = keys[i - 1], d = k[0] - p[0];
        const u = d > 0 ? E[k[2] || 'ioQ']((t - p[0]) / d) : 1;
        const a = p[1], b = k[1];
        if (typeof a === 'number') return a + (b - a) * u;
        const o = [];
        for (let j = 0; j < a.length; j++) o.push(a[j] + (b[j] - a[j]) * u);
        return o;
      }
    }
    return keys[keys.length - 1][1];
  };
  M.pick = function (t, keys) { let v = keys[0][1]; for (let i = 0; i < keys.length; i++) { if (t >= keys[i][0]) v = keys[i][1]; else break; } return v; };

  const hash = (M.hash = function (n) {
    n = (n | 0) + 0x6d2b79f5;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  });
  M.rnd = (i, s) => hash(Math.imul(i | 0, 374761393) + Math.imul((s || 0) | 0, 668265263) + 1013904223);
  M.blink = (t, seed) => { const p = 2.4 + M.rnd(seed, 3) * 2.2; const ph = (t + M.rnd(seed, 7) * p) % p; return ph >= 0 && ph < 0.13; };
  M.hop = (t, period, h) => -Math.abs(Math.sin((t * Math.PI) / period)) * h;
  M.walk = (t, rate) => (Math.floor(t * rate) % 2 === 0 ? 'a' : 'b');
  M.shake = (t, amp, seed) => [Math.round((M.rnd(Math.floor(t * 40), seed || 1) - 0.5) * 2 * amp), Math.round((M.rnd(Math.floor(t * 40), (seed || 1) + 9) - 0.5) * 2 * amp)];

  // ---------- color ----------
  const hc = {};
  const hex2rgb = (M.hex2rgb = function (h) { let v = hc[h]; if (v) return v; const n = parseInt(h.slice(1), 16); v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; hc[h] = v; return v; });
  const rgb2hex = (M.rgb2hex = (r, g, b) => '#' + ((1 << 24) | (clamp(Math.round(r), 0, 255) << 16) | (clamp(Math.round(g), 0, 255) << 8) | clamp(Math.round(b), 0, 255)).toString(16).slice(1));
  M.mix = (c1, c2, t) => { const a = hex2rgb(c1), b = hex2rgb(c2); return rgb2hex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)); };
  M.desat = (c, t) => { const a = hex2rgb(c); const l = a[0] * 0.3 + a[1] * 0.59 + a[2] * 0.11; return rgb2hex(lerp(a[0], l, t), lerp(a[1], l, t), lerp(a[2], l, t)); };
  M.bright = (c, f) => { const a = hex2rgb(c); return rgb2hex(a[0] * f, a[1] * f, a[2] * f); };
  M.rgba = (c, a) => { const x = hex2rgb(c); return 'rgba(' + x[0] + ',' + x[1] + ',' + x[2] + ',' + clamp(a, 0, 1) + ')'; };

  M.canvas = function (w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.g = c.getContext('2d'); c.g.imageSmoothingEnabled = false; return c; };

  // ---------- primitives ----------
  const R = (M.R = function (g, x, y, w, h, c) { if (c) g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); });
  M.px = function (g, x, y, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  M.circ = function (g, cx, cy, r, c) {
    if (r <= 0) return; g.fillStyle = c;
    const y0 = Math.floor(cy - r), y1 = Math.ceil(cy + r);
    for (let y = y0; y <= y1; y++) {
      const dy = y + 0.5 - cy; if (dy * dy > r * r) continue;
      const hw = Math.sqrt(r * r - dy * dy), x0 = Math.ceil(cx - hw - 0.5), x1 = Math.floor(cx + hw - 0.5);
      if (x1 >= x0) g.fillRect(x0, y, x1 - x0 + 1, 1);
    }
  };
  M.ell = function (g, cx, cy, rx, ry, c) {
    if (rx <= 0 || ry <= 0) return; g.fillStyle = c;
    const y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    for (let y = y0; y <= y1; y++) {
      const dy = (y + 0.5 - cy) / ry; if (dy * dy > 1) continue;
      const hw = rx * Math.sqrt(1 - dy * dy), x0 = Math.ceil(cx - hw - 0.5), x1 = Math.floor(cx + hw - 0.5);
      if (x1 >= x0) g.fillRect(x0, y, x1 - x0 + 1, 1);
    }
  };
  M.ring = function (g, cx, cy, r, c, th) {
    th = th || 1; g.fillStyle = c; const r2 = r * r, ri = Math.max(0, r - th), ri2 = ri * ri;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = dx * dx + dy * dy; if (d <= r2 && d >= ri2) g.fillRect(x, y, 1, 1);
    }
  };
  M.line = function (g, x0, y0, x1, y1, c, w) {
    g.fillStyle = c; w = w || 1; const o = Math.floor(w / 2);
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1; let err = dx + dy;
    for (let i = 0; i < 3000; i++) {
      g.fillRect(x0 - o, y0 - o, w, w);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  M.poly = function (g, pts, c) {
    g.fillStyle = c; let minY = Infinity, maxY = -Infinity;
    for (const p of pts) { if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]; }
    minY = Math.max(Math.floor(minY), -60); maxY = Math.min(Math.ceil(maxY), H + 60);
    for (let y = minY; y <= maxY; y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const a = pts[i], b = pts[j];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) { const x0 = Math.ceil(xs[k] - 0.5), x1 = Math.floor(xs[k + 1] - 0.5); if (x1 >= x0) g.fillRect(x0, y, x1 - x0 + 1, 1); }
    }
  };
  M.glow = function (g, x, y, r, c, a) {
    if (a <= 0 || r <= 0) return;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, M.rgba(c, a)); gr.addColorStop(1, M.rgba(c, 0));
    const op = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalCompositeOperation = op;
  };
  M.cone = function (g, x, y, topW, botW, h, col, a) {
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, M.rgba(col, a)); gr.addColorStop(1, M.rgba(col, 0));
    const op = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; g.fillStyle = gr;
    g.beginPath(); g.moveTo(x - topW / 2, y); g.lineTo(x + topW / 2, y); g.lineTo(x + botW / 2, y + h); g.lineTo(x - botW / 2, y + h); g.closePath(); g.fill();
    g.globalCompositeOperation = op;
  };
  M.tint = function (g, col, a, op) {
    if (a <= 0) return; const po = g.globalCompositeOperation, pa = g.globalAlpha;
    g.globalCompositeOperation = op || 'source-over'; g.globalAlpha = clamp(a, 0, 1); g.fillStyle = col; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = po; g.globalAlpha = pa;
  };
  M.desatAll = (g, a) => M.tint(g, '#808080', a, 'saturation');
  M.vignette = function (g, a) { const gr = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,' + a + ')'); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
  M.letterbox = function (g, k) { if (k <= 0) return; const h = Math.round(24 * clamp(k, 0, 1)); R(g, 0, 0, W, h, '#000000'); R(g, 0, H - h, W, h, '#000000'); };

  // ---------- dithered gradients ----------
  const BAYER = (M.BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]);
  M.bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)] / 16 + 1 / 32;
  M.gradCanvas = function (w, h, stops) {
    const c = M.canvas(w, h), g = c.g, img = g.createImageData(w, h), d = img.data, cols = stops.map((s) => hex2rgb(s[1]));
    for (let y = 0; y < h; y++) {
      const t = h > 1 ? y / (h - 1) : 0; let i = 0; while (i < stops.length - 2 && t > stops[i + 1][0]) i++;
      const t0 = stops[i][0], t1 = stops[i + 1][0], f = t1 > t0 ? clamp((t - t0) / (t1 - t0), 0, 1) : 0;
      const L = 6, lf = f * L, li = Math.floor(lf), fr = lf - li, a = cols[i], b = cols[i + 1];
      for (let x = 0; x < w; x++) {
        const lv = (fr > M.bayer(x >> 1, y >> 1) ? li + 1 : li) / L, o = (y * w + x) * 4;
        d[o] = a[0] + (b[0] - a[0]) * lv; d[o + 1] = a[1] + (b[1] - a[1]) * lv; d[o + 2] = a[2] + (b[2] - a[2]) * lv; d[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0); return c;
  };
  const tiles = {};
  M.ditherTile = function (level, px) {
    const key = level + ':' + px; let c = tiles[key]; if (c) return c;
    c = M.canvas(4 * px, 4 * px); c.g.fillStyle = '#000000';
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (BAYER[y * 4 + x] < level) c.g.fillRect(x * px, y * px, px, px);
    tiles[key] = c; return c;
  };

  // ---------- 5x7 font ----------
  const G = {
    A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.', C: '.###.|#...#|#....|#....|#....|#...#|.###.',
    D: '####.|#...#|#...#|#...#|#...#|#...#|####.', E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
    G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#', I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
    J: '..###|...#.|...#.|...#.|#..#.|#..#.|.##..', K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
    M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#', O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
    P: '####.|#...#|#...#|####.|#....|#....|#....', Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
    S: '.###.|#...#|#....|.###.|....#|#...#|.###.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..', U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
    V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..', W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
    Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
    0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.', 2: '.###.|#...#|....#|...#.|..#..|.#...|#####',
    3: '####.|....#|....#|.###.|....#|....#|####.', 4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
    6: '.###.|#....|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...', 8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
    9: '.###.|#...#|#...#|.####|....#|....#|.###.',
    'Б': '#####|#....|#....|####.|#...#|#...#|####.', 'Г': '#####|#....|#....|#....|#....|#....|#....', 'Д': '..##.|.#.#.|.#.#.|.#.#.|#...#|#####|#...#',
    'Ё': '.#.#.|#####|#....|####.|#....|#....|#####', 'Ж': '#.#.#|#.#.#|.###.|..#..|.###.|#.#.#|#.#.#', 'З': '.###.|#...#|....#|..##.|....#|#...#|.###.',
    'И': '#...#|#...#|#..##|#.#.#|##..#|#...#|#...#', 'Й': '.#.#.|..#..|#...#|#..##|#.#.#|##..#|#...#', 'Л': '..###|.#..#|.#..#|.#..#|.#..#|.#..#|#...#',
    'П': '#####|#...#|#...#|#...#|#...#|#...#|#...#', 'У': '#...#|#...#|#...#|.####|....#|#...#|.###.', 'Ф': '..#..|.###.|#.#.#|#.#.#|#.#.#|.###.|..#..',
    'Ц': '#..#.|#..#.|#..#.|#..#.|#..#.|#####|....#', 'Ч': '#...#|#...#|#...#|.####|....#|....#|....#', 'Ш': '#.#.#|#.#.#|#.#.#|#.#.#|#.#.#|#.#.#|#####',
    'Щ': '#.#.#|#.#.#|#.#.#|#.#.#|#.#.#|#####|....#', 'Ъ': '##...|.#...|.#...|.###.|.#..#|.#..#|.###.', 'Ы': '#...#|#...#|#...#|###.#|#.#.#|#.#.#|###.#',
    'Ь': '#....|#....|#....|####.|#...#|#...#|####.', 'Э': '.###.|#...#|....#|..###|....#|#...#|.###.', 'Ю': '#..#.|#.#.#|#.#.#|###.#|#.#.#|#.#.#|#..#.',
    'Я': '.####|#...#|#...#|.####|..#.#|.#..#|#...#',
    '.': '.|.|.|.|.|.|#', ',': '..|..|..|..|..|.#|#.', '!': '#|#|#|#|#|.|#', '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
    ':': '.|#|.|.|.|#|.', '-': '....|....|....|####|....|....|....', '+': '.....|..#..|..#..|#####|..#..|..#..|.....', '/': '....#|....#|...#.|..#..|.#...|#....|#....',
    '(': '..#|.#.|#..|#..|#..|.#.|..#', ')': '#..|.#.|..#|..#|..#|.#.|#..', '"': '#.#|#.#|...|...|...|...|...', "'": '#|#|.|.|.|.|.',
    '<': '...#|..#.|.#..|#...|.#..|..#.|...#', '>': '#...|.#..|..#.|...#|..#.|.#..|#...', '_': '.....|.....|.....|.....|.....|.....|#####',
    '%': '##..#|##..#|...#.|..#..|.#...|#..##|#..##', '*': '.....|#.#.#|.###.|#####|.###.|#.#.#|.....', '#': '.#.#.|#####|.#.#.|.#.#.|.#.#.|#####|.#.#.',
    '=': '.....|.....|#####|.....|#####|.....|.....', '@': '.....|.#.#.|#####|#####|.###.|..#..|.....', '·': '.|.|.|#|.|.|.', ' ': '...|...|...|...|...|...|...',
  };
  const ALIAS = { 'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', '—': '-', '–': '-', '«': '"', '»': '"', '…': '.' };
  const FONT = {};
  for (const k in G) { const rows = G[k].split('|'); FONT[k] = { w: rows[0].length, rows: rows }; }
  const glyph = (ch) => FONT[ALIAS[ch] || ch] || FONT['?'];
  M.textW = function (str, s) { s = s || 1; str = String(str).toUpperCase(); let w = 0; for (let i = 0; i < str.length; i++) w += glyph(str[i]).w + 1; return Math.max(0, w - 1) * s; };
  const tcache = new Map();
  function textCanvas(str, col, s, ol, sh) {
    const key = str + '|' + col + '|' + s + '|' + (ol || '') + '|' + (sh || '');
    let c = tcache.get(key); if (c) return c;
    const up = str.toUpperCase(), tw = M.textW(up, 1), pad = ol ? 1 : 0, sd = sh ? 1 : 0;
    c = M.canvas(Math.max(1, (tw + pad * 2 + sd) * s), (7 + pad * 2 + sd) * s);
    const g = c.g;
    const pass = (dx, dy, color) => {
      g.fillStyle = color; let x = pad + dx;
      for (let i = 0; i < up.length; i++) {
        const gl = glyph(up[i]);
        for (let ry = 0; ry < 7; ry++) { const row = gl.rows[ry]; if (!row) continue; for (let rx = 0; rx < gl.w; rx++) if (row[rx] === '#') g.fillRect((x + rx) * s, (pad + dy + ry) * s, s, s); }
        x += gl.w + 1;
      }
    };
    if (sh) pass(1, 1, sh);
    if (ol) for (const d of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) pass(d[0], d[1], ol);
    pass(0, 0, col);
    if (tcache.size > 700) tcache.clear();
    tcache.set(key, c); return c;
  }
  // o: {c, s, align:'left'|'center'|'right', ol, sh, a}
  M.text = function (g, str, x, y, o) {
    o = o || {}; str = String(str); if (!str.length) return 0;
    const s = o.s || 1, c = textCanvas(str, o.c || '#ffffff', s, o.ol, o.sh), pad = (o.ol ? 1 : 0) * s;
    let dx = Math.round(x) - pad; if (o.align === 'center') dx = Math.round(x - c.width / 2); else if (o.align === 'right') dx = Math.round(x - c.width + pad);
    const a = o.a === undefined ? 1 : clamp(o.a, 0, 1); if (a <= 0) return c.width;
    const pa = g.globalAlpha; g.globalAlpha = pa * a; g.drawImage(c, dx, Math.round(y) - pad); g.globalAlpha = pa;
    return c.width;
  };
  M.textPts = function (str, s) {
    s = s || 1; const up = String(str).toUpperCase(), pts = []; let x = 0;
    for (let i = 0; i < up.length; i++) { const gl = glyph(up[i]); for (let ry = 0; ry < 7; ry++) for (let rx = 0; rx < gl.w; rx++) if (gl.rows[ry][rx] === '#') pts.push([(x + rx) * s, ry * s]); x += gl.w + 1; }
    return { pts: pts, w: Math.max(0, x - 1) * s, h: 7 * s };
  };

  // ---------- icons ----------
  const ICONS = (M.ICONS = {
    heart: { p: { r: '#ff4d6d', w: '#ffd1dc', d: '#c2185b' }, d: ['.rr.rr.', 'rwrrrrr', 'rrrrrrr', '.rrrrd.', '..rrd..', '...d...'] },
    excl: { p: { r: '#ff3b3b' }, d: ['rr', 'rr', 'rr', 'rr', '..', 'rr'] },
    quest: { p: { r: '#3b6bff' }, d: ['.rrr.', 'r...r', '...r.', '..r..', '.....', '..r..'] },
    note: { p: { r: '#6a4cff' }, d: ['..rrr', '..r.r', '..r.r', 'rrr..', 'rrr..'] },
    rocket: { p: { w: '#ffffff', r: '#ea4335', b: '#4285f4', o: '#ff9a3c', y: '#fbbc04' }, d: ['..w..', '.www.', '.wbw.', '.www.', 'rwwwr', 'r.o.r', '..y..'] },
    crystal: { p: { r: '#ea4335', y: '#fbbc04', g: '#34a853', b: '#4285f4', w: '#ffffff' }, d: ['..rw..', '.yrrb.', 'yyrbbb', 'yygbbb', '.ygbb.', '..gg..'] },
    spark: { p: { y: '#ffd84a', w: '#ffffff' }, d: ['..y..', '..y..', 'yywyy', '..y..', '..y..'] },
    arrow: { p: { k: '#1b1b2f' }, d: ['..k..', '...k.', 'kkkkk', '...k.', '..k..'] },
    clawd: { p: { o: '#d97757', k: '#1a1113' }, d: ['.ooooo.', 'ookooko', 'ooooooo', 'o.o.o.o'] },
    codex: { p: { o: '#5a7cff', k: '#121838', e: '#9fd8ff' }, d: ['ooooooo', 'okkkkko', 'oekeeko', 'okkkkko', '.oo.oo.'] },
    gem: { p: { r: '#ea4335', y: '#fbbc04', g: '#34a853', b: '#4285f4' }, d: ['...r...', '..rrr..', 'yyybbbb', '.yybbb.', '..ggg..', '...g...'] },
    whale: { p: { b: '#4d6bfe', w: '#ffffff', k: '#0b1033' }, d: ['......b', 'bbbbb.b', 'bkbbbbb', 'bbbbbb.', '.wwww..'] },
    moon: { p: { y: '#f5e6a3' }, d: ['..yyy', '.yy..', 'yy...', 'yy...', '.yy..', '..yyy'] },
    qwen: { p: { o: '#6339e6', w: '#fdfcff' }, d: ['.ooo.', 'owwwo', 'ow.wo', 'owwwo', '.ooo.'] },
    glm: { p: { b: '#2a6df4', w: '#ffffff' }, d: ['bbbbb', 'bwwwb', 'b.w.b', 'bwwwb', 'bbbbb'] },
    wrench: { p: { g: '#aab3c5', d: '#6b7489' }, d: ['g...g', 'gg.gg', '.ggg.', '..gd.', '..gd.', '..gd.'] },
    bolt: { p: { y: '#ffe14a' }, d: ['..yy', '.yy.', 'yyyy', '.yy.', 'yy..', 'y...'] },
    drop: { p: { b: '#7fc8ff', w: '#e0f4ff' }, d: ['..b..', '.bbb.', 'bwbbb', 'bbbbb', '.bbb.'] },
  });
  const icache = {};
  M.icon = function (g, name, x, y, s) {
    s = s || 1; const key = name + s; let c = icache[key];
    if (!c) {
      const I = ICONS[name]; const w = I.d[0].length, h = I.d.length; c = M.canvas(w * s, h * s);
      for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) { const col = I.p[I.d[yy][xx]]; if (col) { c.g.fillStyle = col; c.g.fillRect(xx * s, yy * s, s, s); } }
      icache[key] = c;
    }
    g.drawImage(c, Math.round(x), Math.round(y));
  };

  // ---------- speech bubbles ----------
  M.bubble = function (g, cx, by, w, h, o) {
    o = o || {}; const fill = o.fill || '#ffffff', ol = o.ol || '#1b1b2f';
    w = Math.max(4, Math.round(w)); h = Math.max(3, Math.round(h));
    const x = Math.round(cx - w / 2), y = Math.round(by - h);
    let bx = 0;
    if (o.tx !== undefined) { bx = clamp(Math.round(o.tx) - 2, x + 2, x + w - 6); M.poly(g, [[bx - 1, y + h - 1], [bx + 5, y + h - 1], [o.tx, o.ty + 1]], ol); }
    R(g, x + 1, y - 1, w - 2, 1, ol); R(g, x + 1, y + h, w - 2, 1, ol); R(g, x - 1, y + 1, 1, h - 2, ol); R(g, x + w, y + 1, 1, h - 2, ol);
    R(g, x, y, 1, 1, ol); R(g, x + w - 1, y, 1, 1, ol); R(g, x, y + h - 1, 1, 1, ol); R(g, x + w - 1, y + h - 1, 1, 1, ol);
    R(g, x + 1, y, w - 2, h, fill); R(g, x, y + 1, w, h - 2, fill);
    if (o.tx !== undefined) M.poly(g, [[bx, y + h - 2], [bx + 4, y + h - 2], [o.tx, o.ty]], fill);
    return { x: x, y: y, w: w, h: h };
  };
  M.pop = function (lt, t0, t1) { if (lt < t0 || lt > t1) return 0; return Math.min(E.outBack(clamp((lt - t0) / 0.18, 0, 1)), clamp((t1 - lt) / 0.12, 0, 1)); };
  // content: string or icon name or array of icon names; (x,y) = where the tail points
  M.say = function (g, lt, t0, t1, x, y, content, o) {
    const k = M.pop(lt, t0, t1); if (k <= 0) return; o = o || {}; const s = o.s || 1;
    let cw = 0, ch = 0; const isText = typeof content === 'string' && !ICONS[content];
    const icons = isText ? null : Array.isArray(content) ? content : [content];
    if (isText) { cw = M.textW(content, s) + 8; ch = 7 * s + 6; }
    else { for (const ic of icons) { const I = ICONS[ic]; cw += I.d[0].length * s + 2; ch = Math.max(ch, I.d.length * s); } cw += 6; ch += 6; }
    const cx = x + (o.dx || 0), by = y - 5 - (o.lift || 0);
    const b = M.bubble(g, cx, by, Math.max(6, cw * k), Math.max(4, ch * k), { tx: x, ty: y, fill: o.fill, ol: o.ol });
    if (k < 0.85) return;
    if (isText) M.text(g, content, cx, b.y + 3, { c: o.c || '#1b1b2f', s: s, align: 'center' });
    else { let ix = b.x + 4; for (const ic of icons) { const I = ICONS[ic]; M.icon(g, ic, ix, b.y + 3 + Math.floor((ch - 6 - I.d.length * s) / 2), s); ix += I.d[0].length * s + 2; } }
  };

  M.stars = function (g, t, o) {
    o = o || {}; const n = o.n || 120, seed = o.seed || 1, x0 = o.x || 0, y0 = o.y || 0, w = o.w || W, h = o.h || H, base = o.a === undefined ? 1 : o.a;
    if (base <= 0) return;
    for (let i = 0; i < n; i++) {
      const sx = x0 + Math.floor(M.rnd(i, seed) * w), sy = y0 + Math.floor(M.rnd(i, seed + 1) * h), b = M.rnd(i, seed + 2);
      g.globalAlpha = clamp(base * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1 + b * 3) + i))), 0, 1);
      if (b > 0.94) { g.fillStyle = '#ffffff'; g.fillRect(sx - 1, sy, 3, 1); g.fillRect(sx, sy - 1, 1, 3); }
      else { g.fillStyle = b > 0.6 ? '#ffffff' : b > 0.3 ? '#cfd8ff' : '#ffe9c9'; g.fillRect(sx, sy, 1, 1); }
    }
    g.globalAlpha = 1;
  };
})();
