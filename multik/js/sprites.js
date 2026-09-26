/* VSPYSHKA - sprites.js: characters are built on grids exactly like clawd-codex.html
   (shade + outline + stampHand), with variants for eyes, mouth, arms, legs and palettes. */
(function () {
  'use strict';
  const M = window.M;
  const EMPTY = '.';
  const createGrid = (w, h) => Array.from({ length: h }, () => Array(w).fill(EMPTY));
  const inB = (g, x, y) => y >= 0 && y < g.length && x >= 0 && x < g[0].length;
  const set = (g, x, y, ch) => { if (inB(g, x, y)) g[y][x] = ch; };
  const fill = (g, x, y, w, h, ch) => { ch = ch || 'o'; for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(g, xx, yy, ch); };
  const solid = (g, x, y) => inB(g, x, y) && g[y][x] !== EMPTY;
  const run = (g, x, y, dx, dy) => { let n = 0; while (solid(g, x + dx * (n + 1), y + dy * (n + 1))) n++; return n + 1; };
  function shade(g) {
    const out = g.map((r) => r.slice());
    for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
      if (g[y][x] !== 'o') continue;
      const top = run(g, x, y, 0, -1), left = run(g, x, y, -1, 0), right = run(g, x, y, 1, 0), bottom = run(g, x, y, 0, 1), ck = (x + y) % 2 === 0;
      if (top === 1 || left === 1) out[y][x] = 'h';
      else if (right <= 2 || bottom <= 2) out[y][x] = 's';
      else if (top === 2 && ck) out[y][x] = 'h';
      else if ((right === 3 || bottom === 3) && ck) out[y][x] = 's';
    }
    for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) g[y][x] = out[y][x];
  }
  function outline(g) {
    const t = [];
    for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
      if (g[y][x] !== EMPTY) continue; let hit = false;
      for (let dy = -1; dy <= 1 && !hit; dy++) for (let dx = -1; dx <= 1 && !hit; dx++) if (solid(g, x + dx, y + dy) && g[y + dy][x + dx] !== 'O') hit = true;
      if (hit) t.push([x, y]);
    }
    for (const p of t) g[p[1]][p[0]] = 'O';
  }
  function stamp(g, x, y, size, dir, tones, push) {
    const cells = [];
    for (let yy = 0; yy < size; yy++) for (let xx = 0; xx < size; xx++) if (!((xx === 0 || xx === size - 1) && (yy === 0 || yy === size - 1))) cells.push([xx, yy]);
    const has = new Set(cells.map((c) => c[0] + ',' + c[1])), inH = (cx, cy) => has.has(cx + ',' + cy);
    let ox = x;
    if (push !== false) { const ov = (o) => cells.filter((c) => solid(g, o + c[0], y + c[1])).length; while (ov(ox) > cells.length / 2 && ox > -size && ox < g[0].length) ox += dir; }
    for (const c of cells) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = c[0] + dx, ny = c[1] + dy; if (!inH(nx, ny) && solid(g, ox + nx, y + ny)) set(g, ox + nx, y + ny, 'O'); }
    for (const c of cells) { const cx = c[0], cy = c[1]; set(g, ox + cx, y + cy, !inH(cx, cy - 1) || !inH(cx - 1, cy) ? tones.h : !inH(cx, cy + 1) || !inH(cx + 1, cy) ? tones.s : tones.o); }
    return ox;
  }
  function bmp(g, x, y, rows, mirror) {
    for (let r = 0; r < rows.length; r++) { const row = mirror ? rows[r].split('').reverse().join('') : rows[r]; for (let c = 0; c < row.length; c++) if (row[c] !== '.') set(g, x + c, y + r, row[c]); }
  }
  function toCanvas(g, pal) {
    const h = g.length, w = g[0].length, c = M.canvas(w, h), x = c.g;
    for (let y = 0; y < h; y++) { const row = g[y]; let i = 0; while (i < w) { const ch = row[i]; if (ch === EMPTY) { i++; continue; } let e = i + 1; while (e < w && row[e] === ch) e++; const col = pal[ch]; if (col) { x.fillStyle = col; x.fillRect(i, y, e - i, 1); } i = e; } }
    return c;
  }
  const palMap = (pal, fn) => { const o = {}; for (const k in pal) o[k] = fn(pal[k]); return o; };
  const P = 8;

  const EYE6 = {
    open: { r: ['kkkkkk', 'kwwkkk', 'kwwkkk', 'kkkkkk', 'kkkkkk', 'kkkkwk', 'kkkkkk', 'kkkkkk'] },
    blink: { r: ['kkkkkk', 'kkkkkk'], dy: 5 },
    happy: { r: ['.kkkk.', 'kkkkkk', 'kk..kk', 'k....k'], dy: 2 },
    closed: { r: ['k....k', 'kk..kk', '.kkkk.'], dy: 4 },
    sad: { r: ['...kkk', '.kkkkk', 'kkwwkk', 'kkwwkk', 'kkkkkk', 'kkkkkk', 'kkkkwk', 'kkkkkk'], m: 1 },
    angry: { r: ['kkk...', 'kkkkk.', 'kwwkkk', 'kwwkkk', 'kkkkkk', 'kkkkwk', 'kkkkkk', 'kkkkkk'], m: 1 },
    wide: { r: ['.kkkkkk.', 'kwwwwwwk', 'kwwwwwwk', 'kwwkkwwk', 'kwwkkwwk', 'kwwkkwwk', 'kwwwwwwk', 'kwwwwwwk', 'kwwwwwwk', '.kkkkkk.'], dx: -1, dy: -1 },
    lookL: { r: ['kkkkkk', 'wwkkkk', 'wwkkkk', 'kkkkkk', 'kkkkkk', 'kkwkkk', 'kkkkkk', 'kkkkkk'] },
    lookR: { r: ['kkkkkk', 'kkkkww', 'kkkkww', 'kkkkkk', 'kkkkkk', 'kkkkkw', 'kkkkkk', 'kkkkkk'] },
    lookUp: { r: ['kwwkkk', 'kwwkkk', 'kkkkkk', 'kkkkkk', 'kkkkwk', 'kkkkkk', 'kkkkkk'], dy: -1 },
    sly: { r: ['kkkkkk', 'kwwkkk', 'kkkkkk', 'kkkkwk', 'kkkkkk'], dy: 3 },
    star: { r: ['..w...', '.www..', 'wwwww.', '.www..', '..w...'], dy: 2 },
  };
  const EYE4 = {
    open: { r: ['wwkk', 'wwkk', 'kkkk', 'kkkk', 'kkkw', 'kkkk'] },
    blink: { r: ['kkkk', 'kkkk'], dy: 3 },
    happy: { r: ['.kk.', 'kkkk', 'k..k'], dy: 1 },
    closed: { r: ['k..k', 'kkkk', '.kk.'], dy: 2 },
    sad: { r: ['..kk', '.kkk', 'kwwk', 'kwwk', 'kkkk', 'kkkk'], m: 1 },
    angry: { r: ['kk..', 'kkk.', 'kwwk', 'kwwk', 'kkkk', 'kkkw'], m: 1 },
    wide: { r: ['.kkkk.', 'kwwwwk', 'kwkkwk', 'kwkkwk', 'kwwwwk', 'kwwwwk', '.kkkk.'], dx: -1, dy: -1 },
    lookL: { r: ['wkkk', 'wkkk', 'kkkk', 'kkkk', 'kwkk', 'kkkk'] },
    lookR: { r: ['kkkw', 'kkkw', 'kkkk', 'kkkk', 'kkkw', 'kkkk'] },
    lookUp: { r: ['wwkk', 'wwkk', 'kkkk', 'kkkw', 'kkkk'], dy: -1 },
    sly: { r: ['kkkk', 'kwwk', 'kkkk'], dy: 3 },
    spiral: { r: ['kkkk', 'k..k', 'k.kk', 'k...', 'kkkk'], dy: 1 },
    star: { r: ['.w..', 'www.', '.w..'], dy: 1 },
  };
  const MOUTH6 = {
    smile: { r: ['m....m', '.mmmm.'] }, grin: { r: ['mmmmmm', 'mmmmmm', '.mppm.'] }, open: { r: ['mmmmmm', '.mppm.'] },
    o: { r: ['.mm.', 'mmmm', 'mmmm', '.mm.'], dx: 1 }, frown: { r: ['.mmmm.', 'm....m'] }, flat: { r: ['.mmmm.'], dy: 1 },
    wobble: { r: ['..mm..', 'mm..mm'] }, yell: { r: ['.mmmm.', 'mmmmmm', 'mmppmm', '.mmmm.'] }, blow: { r: ['.m.', 'm.m', '.m.'], dx: 2 },
  };
  const MOUTH4 = {
    smile: { r: ['m..m', '.mm.'] }, grin: { r: ['mmmm', 'mppm', '.mm.'] }, open: { r: ['mmmm', '.pp.'] }, o: { r: ['.mm.', 'mmmm', '.mm.'] },
    frown: { r: ['.mm.', 'm..m'] }, flat: { r: ['.mm.'], dy: 1 }, wobble: { r: ['.m.m', 'm.m.'] }, yell: { r: ['.mm.', 'mmmm', 'mppm', '.mm.'] },
    evil: { r: ['m....m', '.mmmm.'], dx: -1 }, blow: { r: ['.m.', 'm.m', '.m.'] },
  };
  const eyes = (g, set6, key, xs, y) => { const e = set6[key] || set6.open; xs.forEach((x, i) => bmp(g, x + (e.dx || 0), y + (e.dy || 0), e.r, e.m && i === 1)); };
  const mouth = (g, set, key, x, y) => { const m = set[key] || set.smile; bmp(g, x + (m.dx || 0), y + (m.dy || 0), m.r); };

  // ---------------- CLAWD ----------------
  const CLAWD_PAL = { O: '#6b2e1c', o: '#d97757', h: '#ee9b78', s: '#b35a3c', k: '#1a1113', w: '#fff6ee', p: '#f4a08c', m: '#5a2416' };
  const AY = { n: 9, up: -4, down: 14, hold: 11 };
  const LEGS = { stand: [10, 10, 10, 10], a: [8, 10, 8, 10], b: [10, 8, 10, 8], tuck: [6, 6, 6, 6], sit: [10, 9, 9, 10] };
  function buildClawd(v) {
    const g = createGrid(56 + 2 * P, 39 + 2 * P), r = (x, y, w, h, ch) => fill(g, x + P, y + P, w, h, ch), s1 = (x, y, ch) => set(g, x + P, y + P, ch);
    r(7, 1, 42, 27);
    const al = AY[v.armL || v.arms || 'n'] !== undefined ? AY[v.armL || v.arms || 'n'] : 9, ar = AY[v.armR || v.arms || 'n'] !== undefined ? AY[v.armR || v.arms || 'n'] : 9;
    r(1, al, 6, 9); r(49, ar, 6, 9);
    const lh = LEGS[v.legs || 'stand'] || LEGS.stand, LX = [9, 17, 34, 42];
    LX.forEach((x, i) => r(x, 28, 5, lh[i]));
    shade(g);
    LX.forEach((x) => r(x, 28, 5, 1, 's'));
    r(10, 3, 4, 1, 'w'); s1(10, 4, 'w');
    if (!v.back) {
      eyes(g, EYE6, v.eyes || 'open', [14 + P, 36 + P], 6 + P);
      if (v.blush !== 'none') for (const x of [9, 43]) { r(x, 15, 4, 2, 'p'); s1(x - 1, 16, 'p'); s1(x + 4, 15, 'p'); if (v.blush === 'strong') { r(x - 1, 14, 6, 1, 'p'); r(x, 17, 4, 1, 'p'); } }
      mouth(g, MOUTH6, v.mouth || 'smile', 25 + P, 15 + P);
    }
    outline(g);
    return { g: g, hands: [[3.5 + P, al + 4.5 + P], [51.5 + P, ar + 4.5 + P]] };
  }

  // ---------------- CODEX ----------------
  const CODEX_PAL = { O: '#0d1444', o: '#5a7cff', h: '#8fa9ff', s: '#3f5ae0', k: '#121838', g: '#2a3468', e: '#9fd8ff' };
  const HC = { n: [[11, 37], [39, 37]], up: [[-1, 18], [51, 18]], wave: [[11, 37], [51, 14]], hold: [[11, 37], [41, 33]], fwd: [[11, 37], [47, 29]], type: [[14, 36], [36, 36]], clap: [[20, 35], [30, 35]], low: [[10, 40], [40, 40]], hug: [[2, 30], [48, 30]] };
  const CF = {
    hap: ['..eeee..', '.ee..ee.', 'ee....ee', 'e......e'], smile: ['e....e', '.eeee.'],
    T: ['eeeeeeee', 'eeeeeeee', '...ee...', '...ee...', '...ee...', '...ee...', '...ee...'],
    ring: ['.eeeee.', 'ee...ee', 'e.....e', 'e.....e', 'e.....e', 'ee...ee', '.eeeee.'], so: ['.e.', 'e.e', '.e.'],
    heart: ['.ee.ee.', 'eeeeeee', 'eeeeeee', '.eeeee.', '..eee..', '...e...'], gt: ['e....', 'ee...', '.ee..', '..ee.', '.ee..', 'ee...', 'e....'],
    D: ['eeeeeeee', '.eeeeee.', '..eeee..'], lid: ['eeeeeee', 'eeeeeee', '..eee..'], smirk: ['....ee', 'eeee..'], flat: ['eeeeee'], wave: ['.ee..ee.', 'ee.ee.ee'],
  };
  function codexFace(g, face, cursor) {
    const X = 12 + P, Y = 12 + P, put = (rows, rx, ry, m) => bmp(g, X + rx, Y + ry, rows, m);
    switch (face) {
      case 'happy': put(CF.hap, 3, 4); put(CF.hap, 20, 4); put(CF.smile, 13, 10); break;
      case 'grin': put(CF.hap, 3, 3); put(CF.hap, 20, 3); put(CF.D, 12, 9); break;
      case 'cry': put(CF.T, 3, 3); put(CF.T, 21, 3); put(CF.wave, 12, 11); break;
      case 'wow': put(CF.ring, 3, 2); put(CF.ring, 22, 2); put(CF.so, 14, 11); break;
      case 'love': put(CF.heart, 4, 3); put(CF.heart, 21, 3); put(CF.smile, 13, 11); break;
      case 'squint': put(CF.gt, 5, 3); put(CF.gt, 22, 3, true); put(CF.flat, 13, 12); break;
      case 'sly': put(CF.lid, 3, 5); put(CF.lid, 22, 5); put(CF.smirk, 14, 11); break;
      case 'dots': fill(g, X + 9, Y + 7, 2, 2, 'e'); fill(g, X + 15, Y + 7, 2, 2, 'e'); fill(g, X + 21, Y + 7, 2, 2, 'e'); break;
      case 'blank': break;
      default: [0, 1, 2, 3, 4, 4, 3, 2, 1, 0].forEach((o, i) => fill(g, X + 6 + o, Y + 4 + i, 2, 1, 'e')); if (cursor) fill(g, X + 18, Y + 8, 8, 2, 'e');
    }
  }
  function buildCodex(v) {
    const g = createGrid(56 + 2 * P, 53 + 2 * P), r = (x, y, w, h, ch) => fill(g, x + P, y + P, w, h, ch), s1 = (x, y, ch) => set(g, x + P, y + P, ch);
    r(22, 1, 12, 2); r(18, 3, 20, 4); r(8, 5, 8, 2); r(40, 5, 8, 2); r(6, 7, 44, 26); r(18, 34, 20, 12);
    const fh = { stand: [6, 6], a: [4, 6], b: [6, 4] }[v.feet || 'stand'] || [6, 6];
    r(19, 46, 6, fh[0]); r(31, 46, 6, fh[1]);
    shade(g);
    r(16, 7, 2, 2, 's'); r(38, 7, 2, 2, 's'); r(18, 45, 20, 1, 's');
    const hp = HC[v.hands || 'n'] || HC.n, tones = { o: 'o', h: 'h', s: 's' };
    stamp(g, hp[0][0] + P, hp[0][1] + P, 6, -1, tones, false); stamp(g, hp[1][0] + P, hp[1][1] + P, 6, 1, tones, false);
    if (v.back) { r(20, 13, 16, 10, 's'); r(21, 14, 14, 8, 'g'); r(22, 15, 3, 1, 'h'); }
    else {
      r(12, 12, 32, 16, 'k'); for (const c of [[12, 12], [42, 12], [12, 26], [42, 26]]) r(c[0], c[1], 2, 2, 'o');
      r(14, 14, 4, 1, 'g'); r(14, 15, 1, 2, 'g'); s1(41, 25, 'g');
      codexFace(g, v.face || 'prompt', v.cursor !== false);
    }
    outline(g);
    return { g: g, hands: [[hp[0][0] + 3 + P, hp[0][1] + 3 + P], [hp[1][0] + 3 + P, hp[1][1] + 3 + P]] };
  }

  // ---------------- GEMINI ----------------
  const GEM_PAL = { O: '#1a1f4d', ro: '#ea4335', rh: '#ff7a6b', rs: '#b3261e', yo: '#fbbc04', yh: '#ffd95a', ys: '#d08d00', go: '#34a853', gh: '#6fd08a', gs: '#1e7a3a', bo: '#4285f4', bh: '#7fb0ff', bs: '#2c5fc7', k: '#151a3d', w: '#fdfcff', p: '#f7a8c4', m: '#151a3d' };
  const HY = { n: 33, up: 16, low: 38, hug: 29, mid: 26 };
  let gemBase = null;
  function gemRegion(x, y) {
    const dx = x + 0.5 - 28, dy = y + 0.5 - 28, ck = (x + y) % 2 === 0, dist = Math.hypot(dx, dy);
    if (dist < 8 || (dist < 10 && ck)) return 'b';
    const vert = Math.abs(dy) >= Math.abs(dx), nd = Math.abs(Math.abs(dx) - Math.abs(dy)) < 2 && ck, uv = nd ? !vert : vert;
    if (uv) return dy < 0 ? 'r' : 'g';
    return dx < 0 ? 'y' : 'b';
  }
  function gemBody() {
    if (gemBase) return gemBase;
    const SZ = 56, PW = 0.68, lim = Math.pow(26.5, PW), g = createGrid(SZ + 2 * P, SZ + 2 * P);
    for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) { const dx = Math.abs(x + 0.5 - 28), dy = Math.abs(y + 0.5 - 28); if (Math.pow(dx, PW) + Math.pow(dy, PW) <= lim) set(g, x + P, y + P, 'o'); }
    shade(g);
    for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) { const t = g[y + P][x + P]; if (t === 'o' || t === 'h' || t === 's') g[y + P][x + P] = gemRegion(x, y) + t; }
    gemBase = g; return g;
  }
  function buildGemini(v) {
    const g = gemBody().map((r) => r.slice());
    const yl = HY[v.handL || v.hands || 'n'] !== undefined ? HY[v.handL || v.hands || 'n'] : 33, yr = HY[v.handR || v.hands || 'n'] !== undefined ? HY[v.handR || v.hands || 'n'] : 33;
    const lx = stamp(g, 20 + P, yl + P, 6, -1, { o: 'yo', h: 'yh', s: 'ys' }), rx = stamp(g, 30 + P, yr + P, 6, 1, { o: 'bo', h: 'bh', s: 'bs' });
    if (!v.back) {
      eyes(g, EYE4, v.eyes || 'open', [20 + P, 32 + P], 23 + P);
      if (v.blush !== 'none') { fill(g, 17 + P, 30 + P, 3, 2, 'p'); fill(g, 36 + P, 30 + P, 3, 2, 'p'); if (v.blush === 'strong') { fill(g, 16 + P, 29 + P, 5, 1, 'p'); fill(g, 35 + P, 29 + P, 5, 1, 'p'); } }
      mouth(g, MOUTH4, v.mouth || 'smile', 26 + P, 30 + P);
    }
    outline(g);
    return { g: g, hands: [[lx + 3, yl + P + 3], [rx + 3, yr + P + 3]] };
  }

  // ---------------- QWEN ----------------
  const QWEN_SHAPE = [
    '..................ooooooooo.........................', '..................oooooooooo........................', '.................ooWooooooooo.......................',
    '.................oWWWoooooooo.......................', '................oWWWWooooooooo......................', '...............ooWWWWWoooooooo......................',
    '...............oWWWWWWooooooooooooooooooooooo.......', '..............ooWWWWWWWooooooooooooooooooooooo......', '..............oWWWWWWWoooooooooooooooooooooooo......',
    '.............oWWWWWWWWooooooooooooooooooooooooo.....', '.............oWWWWWWWoooooooooooooooooooooooooo.....', '............oWWWWWWWoooooooooooooooooooooooooooo....',
    '....oooooooooWWWWWWWoooooooooooooooooooooooooooo....', '...oooooooooWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWoo...', '...ooWWWWWWWoWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWo....',
    '..ooooWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWoo....', '..ooooWWWWWWWoWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWo.....', '.ooooooWWWWWWWoWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWo......',
    'ooooooooWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWoo......', 'ooooooooWWWWWWWooooooooooooooooooooooWWWWWWWo.......', 'oooooooooWWWWWWWooooooooooooooooooooWWWWWWWWoo......',
    '.ooooooooWWWWWWWooooooooooooooooooooWWWWWWWWWo......', '.oooooooooWWWWWWWooooooooooooooooooWWWWWWWWWWWo.....', '..oooooooooWWWWWWWoooooooooooooooooWWWWWWWWWWWo.....',
    '...ooooooooWWWWWWWooooooooooooooooWWWWWWWWWWWWWo....', '...oooooooooWWWWWWWooooooooooooooWWWWWWWWWWWWWWoo...', '....ooooooooWWWWWWWooooooooooooooWWWWWWWoWWWWWWWo...',
    '....oooooooooWWWWWWWooooooooooooWWWWWWWooWWWWWWWoo..', '.....ooooooooWWWWWWWooooooooooooWWWWWWWoooWWWWWWWo..', '......ooooooooWWWWWWWooooooooooWWWWWWWooooWWWWWWWWo.',
    '......oooooooooWWWWWWWoooooooooWWWWWWWoooooWWWWWWWoo', '.......ooooooooWWWWWWWooooooooWWWWWWWoooooooWWWWWWoo', '.......oooooooooWWWWWWWooooooWWWWWWWoooooooooooooooo',
    '......ooooooooooWWWWWWWooooooWWWWWWWooooooooooooooo.', '.....ooooooooooooWWWWWWWooooWWWWWWWoooooooooooooooo.', '.....oooooooooooooWWWWWWooooWWWWWWWooooooooooooooo..',
    '....ooooooooooooooWWWWWWWooWWWWWWWooooooooooooooo...', '....oooooooooooooooWWWWWWWoWWWWWWWooooooooooooooo...', '....oooooooWWWWWWWWWWWWWWoWWWWWWWooooooooooooooo....',
    '....oooooooWWWWWWWWWWWWWWWWWWWWWooooooooo...........', '.....oooooWWWWWWWWWWWWWWoWWWWWWWoooooooo............', '......ooooWWWWWWWWWWWWWWWWWWWWWooooooooo............',
    '......oooWWWWWWWWWWWWWWoWWWWWWWoooooooo.............', '.......ooWWWWWWWWWWWWWoWWWWWWWoooooooo..............', '.......ooooooooooooooooWWWWWWooooooooo..............',
    '......................ooWWWWWoooooooo...............', '.......................oWWWWooooooooo...............', '........................oWWWoooooooo................',
    '........................oWWooooooooo................', '.........................oWoooooooo.................', '.........................oooooooooo.................',
  ];
  const QWEN_PAL = { O: '#1f0d5c', o: '#6339e6', h: '#8b6dff', s: '#4521c2', W: '#fdfcff', L: '#d6caff', k: '#1a0f45', w: '#fdfcff', p: '#f7a8c4', m: '#1a0f45' };
  const QHY = { n: 30, up: 8, hold: 18, low: 36 };
  let qwenBase = null;
  function qwenBody() {
    if (qwenBase) return qwenBase;
    const rows = QWEN_SHAPE.length, cols = QWEN_SHAPE[0].length, OX = 5 + P, OY = 2 + P, g = createGrid(cols + 10 + 2 * P, rows + 4 + 2 * P);
    const at = (x, y) => (QWEN_SHAPE[y] && QWEN_SHAPE[y][x]) || '.';
    for (let y = 0; y < rows; y++) for (let x = 0; x < QWEN_SHAPE[y].length; x++) { const ch = QWEN_SHAPE[y][x]; if (ch !== '.') set(g, x + OX, y + OY, ch); }
    shade(g);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const ch = at(x, y);
      if (ch === 'o') { if ((at(x - 1, y) === 'W' && at(x + 1, y) === 'W') || (at(x, y - 1) === 'W' && at(x, y + 1) === 'W')) set(g, x + OX, y + OY, 'L'); }
      else if (ch === 'W' && (at(x + 1, y) === 'o' || at(x, y + 1) === 'o')) set(g, x + OX, y + OY, 'L');
    }
    qwenBase = g; return g;
  }
  function buildQwen(v) {
    const g = qwenBody().map((r) => r.slice()), OX = 5 + P, OY = 2 + P, tn = { o: 'o', h: 'h', s: 's' };
    let lx, rx, ly, ry;
    if ((v.hands || 'n') === 'rub') { ly = ry = 31; lx = stamp(g, 21 + OX, 31 + OY, 6, -1, tn, false); rx = stamp(g, 26 + OX, 31 + OY, 6, 1, tn, false); }
    else {
      const hl = v.handL || v.hands || 'n', hr = v.handR || v.hands || 'n';
      ly = QHY[hl] !== undefined ? QHY[hl] : 30; ry = QHY[hr] !== undefined ? QHY[hr] : 30;
      lx = stamp(g, 8 + OX, ly + OY, 6, -1, tn); rx = stamp(g, 42 + OX, ry + OY, 6, 1, tn);
    }
    if (!v.back) {
      eyes(g, EYE4, v.eyes || 'open', [20 + OX, 28 + OX], 20 + OY);
      if (v.blush !== 'none') { fill(g, 19 + OX, 26 + OY, 2, 1, 'p'); fill(g, 31 + OX, 26 + OY, 2, 1, 'p'); }
      mouth(g, MOUTH4, v.mouth || 'smile', 24 + OX, 27 + OY);
    }
    outline(g);
    return { g: g, hands: [[lx + 3, ly + OY + 3], [rx + 3, ry + OY + 3]] };
  }

  // ---------------- WHALE (DeepSeek) ----------------
  const WHALE_PAL = { O: '#0b1d51', o: '#4d6bfe', h: '#86a0ff', s: '#3149c9', b: '#dce6ff', c: '#a9bdf5', k: '#0b1033', w: '#ffffff', p: '#ff9ab8', m: '#1a1f5a' };
  const WEYE = { open: { r: ['.kk.', 'kwkk', 'kkkk', '.kk.'] }, happy: { r: ['.kk.', 'k..k'], dy: 1 }, wide: { r: ['.kkkk.', 'kwwwwk', 'kwkkwk', 'kwwwwk', '.kkkk.'], dx: -1, dy: -1 }, sly: { r: ['kkkk', 'kwkk', '.kk.'], dy: 1 }, spiral: { r: ['kkkkk', '....k', 'kkk.k', 'k...k', 'kkkkk'], dx: -1, dy: -1 } };
  const WMOUTH = {
    smile: ['m.................', '.mm.............mm', '...mmmmmmmmmmmmm..'],
    laugh: ['m.................', 'mmmmmmmmmmmmmmmmmm', '.mmmmmmmmmmmmmmmm.', '..mmpppppppppmm...', '....mmmmmmmmm.....'],
    o: ['......mmm', '.....mmmmm', '.....mmmmm', '......mmm'], frown: ['...mmmmmmmmmmmmm..', '.mm.............mm', 'm.................'],
  };
  function buildWhale(v) {
    const Wd = 64, Hd = 40, g = createGrid(Wd + 2 * P, Hd + 2 * P);
    const sd = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, wx = px - ax, wy = py - ay, t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy))); return Math.hypot(wx - vx * t, wy - vy * t); };
    for (let y = 0; y < Hd; y++) for (let x = 0; x < Wd; x++) {
      const cx = x + 0.5, cy = y + 0.5, ex = (cx - 27) / 24, ey = (cy - 22) / 14;
      let on = ex * ex + ey * ey <= 1;
      if (!on && cx > 40 && sd(cx, cy, 46, 22, 55, 12) < 4.2 - Math.max(0, cx - 46) * 0.2) on = true;
      if (!on && (sd(cx, cy, 55, 12, 50, 5) < 2.6 || sd(cx, cy, 55, 12, 62, 7) < 2.6)) on = true;
      if (on) set(g, x + P, y + P, 'o');
    }
    shade(g);
    for (let y = 24; y < Hd; y++) for (let x = 0; x < Wd; x++) { const t = g[y + P][x + P]; if (t !== 'o' && t !== 'h' && t !== 's') continue; const dx = (x + 0.5 - 24) / 21, dy = (y + 0.5 - 33) / 9; if (dx * dx + dy * dy <= 1) g[y + P][x + P] = y % 3 === 0 || t === 's' ? 'c' : 'b'; }
    if (!v.back) {
      const e = WEYE[v.eyes || 'open'] || WEYE.open; bmp(g, 11 + P + (e.dx || 0), 16 + P + (e.dy || 0), e.r);
      bmp(g, 3 + P, 24 + P, WMOUTH[v.mouth || 'smile'] || WMOUTH.smile);
      if (v.blush !== 'none') fill(g, 17 + P, 21 + P, 3, 2, 'p');
      fill(g, 21 + P, 9 + P, 3, 1, 's');
    }
    outline(g);
    return { g: g, hands: [[22 + P, 30 + P], [22 + P, 30 + P]] };
  }

  // ---------------- MOON (Kimi) ----------------
  const MOON_PAL = { O: '#4a3b12', o: '#f5e6a3', h: '#fffadc', s: '#d8c373', k: '#3a2f10', w: '#ffffff', p: '#ffb8a0', m: '#7a3b2a' };
  const MEYE = { closed: ['k..k', '.kk.'], happy: ['.kk.', 'k..k'], open: ['.kk.', 'kwkk', 'kkkk', '.kk.'], wide: ['kkkk', 'kwwk', 'kwkk', 'kkkk'], sly: ['kkkk', 'kwkk', '.kk.'] };
  const MMOUTH = { smile: ['m...m', '.mmm.'], smirk: ['....m', 'mmmm.'], laugh: ['mmmmm', 'mpppm', '.mmm.'], o: ['.mm.', 'mmmm', '.mm.'] };
  function buildMoon(v) {
    const S = 40, g = createGrid(S + 2 * P, S + 2 * P);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dx = x + 0.5 - 20, dy = y + 0.5 - 20, ex = x + 0.5 - 28, ey = y + 0.5 - 13; if (dx * dx + dy * dy <= 324 && ex * ex + ey * ey > 196) set(g, x + P, y + P, 'o'); }
    shade(g);
    [[6, 31, 2], [15, 35, 1.5], [5, 15, 1.4]].forEach((c) => { for (let yy = -3; yy <= 3; yy++) for (let xx = -3; xx <= 3; xx++) if (xx * xx + yy * yy <= c[2] * c[2]) { const X = Math.round(c[0] + xx) + P, Y = Math.round(c[1] + yy) + P; if (solid(g, X, Y)) g[Y][X] = 's'; } });
    if (!v.back) { bmp(g, 8 + P, 21 + P, MEYE[v.eyes || 'closed'] || MEYE.closed); bmp(g, 10 + P, 29 + P, MMOUTH[v.mouth || 'smile'] || MMOUTH.smile); if (v.blush !== 'none') fill(g, 14 + P, 26 + P, 2, 1, 'p'); }
    outline(g);
    return { g: g, hands: [[P, P], [P, P]] };
  }

  const BUILD = { clawd: buildClawd, codex: buildCodex, gemini: buildGemini, qwen: buildQwen, whale: buildWhale, moon: buildMoon };
  const PAL = { clawd: CLAWD_PAL, codex: CODEX_PAL, gemini: GEM_PAL, qwen: QWEN_PAL, whale: WHALE_PAL, moon: MOON_PAL };
  const META = {
    clawd: { ax: 28 + P, ay: 39 + P, eyes: [[17 + P, 14 + P], [39 + P, 14 + P]], face: [28 + P, 12 + P], top: [28 + P, P] },
    codex: { ax: 28 + P, ay: 53 + P, eyes: [[19 + P, 23 + P], [36 + P, 23 + P]], face: [28 + P, 20 + P], top: [28 + P, P] },
    gemini: { ax: 28 + P, ay: 53 + P, eyes: [[21 + P, 29 + P], [33 + P, 29 + P]], face: [28 + P, 27 + P], top: [28 + P, 3 + P] },
    qwen: { ax: 31 + P, ay: 54 + P, eyes: [[26 + P, 28 + P], [34 + P, 28 + P]], face: [31 + P, 26 + P], top: [30 + P, 2 + P] },
    whale: { ax: 27 + P, ay: 38 + P, eyes: [[12 + P, 20 + P], [12 + P, 20 + P]], face: [14 + P, 22 + P], top: [20 + P, 7 + P], hole: [22 + P, 9 + P] },
    moon: { ax: 20 + P, ay: 39 + P, eyes: [[10 + P, 24 + P], [10 + P, 24 + P]], face: [12 + P, 26 + P], top: [16 + P, 2 + P] },
  };
  const KEYS = ['eyes', 'mouth', 'arms', 'armL', 'armR', 'legs', 'feet', 'hands', 'handL', 'handR', 'face', 'cursor', 'blush', 'back', 'tint'];
  const cache = new Map();
  function sprite(who, o) {
    let key = who; for (let i = 0; i < KEYS.length; i++) { const v = o[KEYS[i]]; if (v !== undefined) key += '|' + KEYS[i] + '=' + v; }
    const ds = o.desat ? Math.round(o.desat * 10) / 10 : 0; if (ds) key += '|d=' + ds;
    let sp = cache.get(key); if (sp) return sp;
    const res = BUILD[who](o);
    let pal = PAL[who];
    if (ds) pal = palMap(pal, (c) => M.desat(c, ds));
    if (o.tint) pal = palMap(pal, (c) => M.mix(c, o.tint[0], o.tint[1]));
    sp = { c: toCanvas(res.g, pal), hands: res.hands };
    if (cache.size > 1200) cache.clear();
    cache.set(key, sp); return sp;
  }

  const S = (M.S = {});
  // draw a character with its ground anchor at (x, y). o: variant fields + {s, sx, sy, alpha, flip}
  S.draw = function (g, who, x, y, o) {
    o = o || {};
    const sp = sprite(who, o), mt = META[who], s = o.s || 1, sx = (o.sx || 1) * s, sy = (o.sy || 1) * s;
    const w = Math.max(1, Math.round(sp.c.width * sx)), h = Math.max(1, Math.round(sp.c.height * sy));
    const x0 = Math.round(x - mt.ax * sx), y0 = Math.round(y - mt.ay * sy);
    const info = { x0: x0, y0: y0, sx: sx, sy: sy, sp: sp, mt: mt, flip: !!o.flip, w: w, h: h };
    const a = o.alpha === undefined ? 1 : M.clamp(o.alpha, 0, 1);
    if (a <= 0) return info;
    const pa = g.globalAlpha; g.globalAlpha = pa * a;
    if (o.flip) { g.save(); g.translate(x0 + w, y0); g.scale(-1, 1); g.drawImage(sp.c, 0, 0, w, h); g.restore(); }
    else g.drawImage(sp.c, x0, y0, w, h);
    g.globalAlpha = pa;
    return info;
  };
  S.pt = (info, px, py) => { const lx = info.flip ? info.sp.c.width - px : px; return [info.x0 + lx * info.sx, info.y0 + py * info.sy]; };
  S.hand = (info, i) => S.pt(info, info.sp.hands[i][0], info.sp.hands[i][1]);
  S.feat = (info, name, i) => { const f = info.mt[name], p = i === undefined ? f : f[i]; return S.pt(info, p[0], p[1]); };

  // ---------------- citizens (crowd) ----------------
  const CIT = [['#ff9ec7', '#ffc4de', '#d9709f'], ['#8fd3ff', '#c2e8ff', '#5aa8d9'], ['#ffd27a', '#ffe7ad', '#d9a441'], ['#9be89b', '#c9f5c9', '#62b862'], ['#c7a4ff', '#e0ccff', '#9a74d9'], ['#ffb38a', '#ffd3b8', '#d9845a'], ['#7ee0d2', '#b8f2ea', '#4bb3a5'], ['#f5f5f5', '#ffffff', '#c8c8d0']];
  function buildCitizen(i, pose) {
    const w = 12 + (i % 3) * 2, h = 11 + ((i >> 1) % 3), g = createGrid(w + 8, h + 10), ox = 4, oy = 6, shape = i % 4;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (x + 0.5 - w / 2) / (w / 2), dy = (y + 0.5 - h / 2) / (h / 2);
      const inside = shape === 1 ? Math.abs(dx) < 0.95 && Math.abs(dy) < 0.95 && !(Math.abs(dx) > 0.75 && Math.abs(dy) > 0.75) : dx * dx + dy * dy <= 1.05;
      if (inside) set(g, x + ox, y + oy, 'o');
    }
    fill(g, ox + 2, oy + h, 3, 2); fill(g, ox + w - 5, oy + h, 3, 2);
    if (shape === 2) { fill(g, ox + (w >> 1), oy - 3, 1, 3); fill(g, ox + (w >> 1) - 1, oy - 5, 3, 2); }
    if (shape === 3) { fill(g, ox + 1, oy - 2, 3, 3); fill(g, ox + w - 4, oy - 2, 3, 3); }
    const cheer = pose === 'cheer' || pose === 'backCheer';
    if (cheer) { fill(g, ox - 3, oy - 3, 3, 4); fill(g, ox + w, oy - 3, 3, 4); }
    shade(g);
    if (pose !== 'back' && pose !== 'backCheer') {
      const ey = oy + Math.floor(h * 0.38), el = ox + Math.floor(w * 0.3), er = ox + Math.ceil(w * 0.7) - 1;
      if (pose === 'laugh') { for (const ex of [el, er]) { set(g, ex - 1, ey + 1, 'k'); set(g, ex, ey, 'k'); set(g, ex + 1, ey + 1, 'k'); } fill(g, ox + (w >> 1) - 1, ey + 3, 3, 2, 'k'); }
      else { fill(g, el, ey, 1, 2, 'k'); fill(g, er, ey, 1, 2, 'k'); set(g, ox + (w >> 1), ey + 3, 'k'); }
      set(g, el - 1, ey + 2, 'p'); set(g, er + 1, ey + 2, 'p');
    }
    outline(g);
    const c = CIT[i % CIT.length];
    return { g: g, pal: { O: '#1b1530', o: c[0], h: c[1], s: c[2], k: '#1b1530', p: '#ff8fb0' }, ax: ox + w / 2, ay: oy + h + 3 };
  }
  const ccache = new Map();
  S.cit = function (g, i, x, y, pose, o) {
    o = o || {}; const key = i + '|' + pose + '|' + (o.dim || 0);
    let c = ccache.get(key);
    if (!c) { const r = buildCitizen(i, pose); let pal = r.pal; if (o.dim) pal = palMap(pal, (col) => M.mix(col, '#0b0820', o.dim)); c = { c: toCanvas(r.g, pal), ax: r.ax, ay: r.ay }; ccache.set(key, c); }
    g.drawImage(c.c, Math.round(x - c.ax), Math.round(y - c.ay));
  };
})();
