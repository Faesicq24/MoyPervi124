/* VSPYSHKA - sets1.js: skies, festival square, ARENA scoreboard, fountain, crowd, rainy street */
(function () {
  'use strict';
  const M = window.M, R = M.R, W = M.W, H = M.H, B = (M.B = M.B || {});
  const cache = {};
  const once = (B.once = (k, fn) => cache[k] || (cache[k] = fn()));
  const SKIES = {
    night: [[0, '#050818'], [0.5, '#101a45'], [0.8, '#2a1f5e'], [1, '#4a2a6e']],
    dusk: [[0, '#1b1242'], [0.45, '#4a2466'], [0.72, '#b0487a'], [1, '#ffb070']],
    storm: [[0, '#0a0d1c'], [0.6, '#1c2238'], [1, '#2c3450']],
    space: [[0, '#02030a'], [0.6, '#0a0c24'], [1, '#1a1446']],
    day: [[0, '#5aa8ff'], [0.6, '#9fd0ff'], [1, '#ffe2b8']],
    sunset: [[0, '#2a1b5c'], [0.35, '#7a3a8a'], [0.62, '#ff7a6a'], [0.8, '#ffb35a'], [1, '#ffe08a']],
  };
  B.sky = function (g, t, o) {
    o = o || {}; const kind = o.kind || 'night';
    g.drawImage(once('sky_' + kind, () => M.gradCanvas(W, H, SKIES[kind])), 0, o.y || 0);
    if (o.stars !== false && kind !== 'day' && kind !== 'sunset') M.stars(g, t, { n: o.n || 140, seed: o.seed || 4, h: o.sh || 170, a: o.sa === undefined ? 1 : o.sa });
  };
  function town() {
    const c = M.canvas(W + 80, 90), g = c.g; let x = 0, i = 0;
    while (x < W + 80) {
      const w = 18 + Math.floor(M.rnd(i, 51) * 26), h = 22 + Math.floor(M.rnd(i, 52) * 50), top = 90 - h;
      R(g, x, top, w, h, '#140f30'); if (M.rnd(i, 53) > 0.5) M.poly(g, [[x - 2, top], [x + w + 2, top], [x + w / 2, top - 10]], '#140f30');
      for (let wy = top + 5; wy < 86; wy += 7) for (let wx = x + 3; wx < x + w - 4; wx += 6) if (M.rnd(wx * 7 + wy, 54) > 0.55) R(g, wx, wy, 2, 3, M.rnd(wx + wy, 55) > 0.3 ? '#ffcf70' : '#8fd3ff');
      x += w + 2 + Math.floor(M.rnd(i, 56) * 6); i++;
    }
    return c;
  }
  function cobble() {
    const c = M.canvas(W, 100), g = c.g; R(g, 0, 0, W, 100, '#2b2140');
    for (let y = 0, row = 0; y < 100; y += 5 + Math.floor(row / 4), row++) {
      const off = (row % 2) * 5, sw = 10 + Math.floor(row / 3);
      for (let x = -10 + off; x < W; x += sw) { R(g, x + 1, y + 1, sw - 2, 3 + Math.floor(row / 4), M.rnd(x * 3 + y, 61) > 0.5 ? '#3a2d52' : '#34284a'); R(g, x + 2, y + 1, 3, 1, '#4a3c63'); }
    }
    return c;
  }
  function garland(g, t) {
    const cols = ['#ff7a5a', '#ffd84a', '#6fd08a', '#7fb0ff', '#ff9ec7', '#c7a4ff']; let prev = null;
    for (let i = 0; i <= 60; i++) {
      const u = i / 60, x = u * W, y = M.lerp(20, 30, u) + Math.sin(u * Math.PI) * 30 + Math.sin(t * 1.5 + u * 6) * 0.8;
      if (prev) M.line(g, prev[0], prev[1], x, y, '#2a2238'); prev = [x, y];
      if (i % 3 === 0) { const on = Math.sin(t * 3 + i) > -0.6, c = cols[(i / 3) % cols.length]; R(g, x - 1, y + 1, 3, 3, on ? c : M.bright(c, 0.5)); if (on) M.glow(g, x, y + 2, 7, c, 0.35); }
    }
  }
  function stage(g) {
    R(g, 158, 186, 164, 28, '#15122a'); R(g, 160, 187, 160, 8, '#b07a4f');
    for (let x = 160; x < 320; x += 12) R(g, x, 187, 1, 8, '#8a5a3b');
    R(g, 160, 195, 160, 18, '#7a4a30'); for (let y = 198; y < 213; y += 5) R(g, 160, y, 160, 1, '#5a3422');
    const cs = ['#ea4335', '#fbbc04', '#34a853', '#4285f4']; for (let i = 0; i < 16; i++) { const x = 161 + i * 10; M.poly(g, [[x, 196], [x + 8, 196], [x + 4, 202]], cs[i % 4]); }
  }
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  // rows: [{n, i (icon), c, s (scramble 0..1), hl (highlight color)}]
  B.boardRows = function (g, t, x, y, rows, s, lh) {
    s = s || 1; lh = lh || 15 * s;
    for (let i = 0; i < rows.length && i < 8; i++) {
      const r = rows[i]; if (!r) continue; const yy = y + i * lh;
      if (r.hl) { g.globalAlpha = 0.3 + 0.2 * Math.sin(t * 10); R(g, x - 2, yy - 2 * s, 94 * s, 11 * s, r.hl); g.globalAlpha = 1; }
      let name = r.n;
      if (r.s > 0) { let out = ''; for (let k = 0; k < name.length; k++) out += name[k] !== ' ' && M.rnd(k + i * 31, Math.floor(t * 20)) < r.s ? CH[Math.floor(M.rnd(k, Math.floor(t * 20) + 7) * CH.length)] : name[k]; name = out; }
      M.text(g, String(i + 1), x + s, yy, { c: '#8a86a0', s: s });
      if (r.i) M.icon(g, r.i, x + 8 * s, yy, s);
      M.text(g, name, x + 17 * s, yy, { c: r.c || '#ffffff', s: s });
    }
  };
  function tower(g, t, rows) {
    R(g, 380, 196, 3, 14, '#15122a'); R(g, 466, 196, 3, 14, '#15122a');
    R(g, 372, 50, 104, 150, '#15122a'); R(g, 374, 52, 100, 146, '#2a2238'); R(g, 377, 72, 94, 122, '#0c0a14');
    M.text(g, 'АРЕНА', 424, 57, { c: '#ffd27a', align: 'center', s: 2 });
    for (let i = 0; i < 12; i++) R(g, 378 + i * 8, 53, 2, 2, Math.sin(t * 4 + i * 1.3) > 0 ? '#ffe7a0' : '#6a5a3a');
    B.boardRows(g, t, 379, 76, rows, 1, 15);
  }
  function fountainBack(g, t) {
    M.ell(g, 85, 214, 47, 10, '#15122a'); M.ell(g, 85, 213, 45, 8, '#3b4a7a'); M.ell(g, 85, 212, 41, 6, '#2f5fa8');
    for (let i = 0; i < 6; i++) R(g, 55 + ((i * 13 + t * 12) % 60), 210 + (i % 3), 4, 1, '#7fb0ff');
    R(g, 81, 176, 9, 36, '#15122a'); R(g, 82, 177, 7, 35, '#6a6a8a'); R(g, 82, 177, 2, 35, '#8a8aaa');
    M.ell(g, 85.5, 176, 11, 3, '#15122a'); M.ell(g, 85.5, 175.5, 10, 2, '#6a6a8a');
  }
  B.fountainFront = function (g, t) {
    R(g, 38, 214, 94, 12, '#15122a'); R(g, 40, 214, 90, 10, '#58587a'); R(g, 40, 214, 90, 2, '#7a7a9a');
    for (let x = 44; x < 128; x += 11) R(g, x, 217, 1, 6, '#45456a');
    for (let i = 0; i < 14; i++) { const ph = (t * 1.2 + i / 14) % 1, a = (i / 14) * Math.PI * 2; R(g, 85.5 + Math.cos(a) * 14 * ph, 172 - Math.sin(ph * Math.PI) * 8 + ph * 34, 1, 2, '#bfe0ff'); }
  };
  B.curtains = function (g, t) {
    for (const x of [158, 308]) { R(g, x, 118, 14, 76, '#15122a'); R(g, x + 1, 119, 12, 74, '#8a1f3a'); for (let k = 0; k < 3; k++) R(g, x + 3 + k * 4, 119, 1, 74, '#6a1028'); R(g, x + 1, 119, 12, 3, '#c9a13a'); }
  };
  // festival background (everything behind the characters). o: {rows, sky(g), moon(g)}
  B.festBack = function (g, t, o) {
    o = o || {};
    B.sky(g, t, { kind: 'night', sh: 150 });
    if (o.moon) o.moon(g);
    if (o.sky) o.sky(g);
    g.drawImage(once('town', town), -40, 92);
    g.drawImage(once('cobble', cobble), 0, 176);
    M.glow(g, 145, 205, 70, '#ffcf70', 0.16); M.glow(g, 340, 205, 70, '#ffcf70', 0.16);
    tower(g, t, o.rows || []);
    fountainBack(g, t);
    stage(g);
    const wv = Math.round(Math.sin(t * 2));
    R(g, 166, 96, 2, 92, '#3a2a20'); R(g, 312, 96, 2, 92, '#3a2a20');
    R(g, 168, 100 + wv, 144, 13, '#15122a'); R(g, 169, 101 + wv, 142, 11, '#c23b5a'); R(g, 169, 101 + wv, 142, 2, '#e8607a');
    M.text(g, 'ПРАЗДНИК РЕЛИЗОВ', 240, 103 + wv, { c: '#fff2d0', align: 'center' });
    M.P.lamp(g, 145, 200, 62, 1); M.P.lamp(g, 340, 200, 62, 1);
    garland(g, t);
  };
  B.STAGE_Y = 192;
  // crowd seen from behind (foreground) and a few side citizens facing the stage
  B.crowd = function (g, t, mood) {
    for (let i = 0; i < 24; i++) {
      const x = -6 + i * 21 + (i % 2) * 6, y = 272 + (i % 3) * 2, cheer = mood === 'cheer';
      const hop = cheer ? M.hop(t + i * 0.13, 0.42, 5) : mood === 'laugh' ? M.hop(t + i * 0.1, 0.22, 2) : Math.round(Math.sin(t * 2 + i) * 0.8);
      M.S.cit(g, i + 3, x, y + hop, cheer && i % 2 ? 'backCheer' : 'back', { dim: 0.45 });
    }
  };
  B.sideCrowd = function (g, t, mood) {
    [[18, 238], [146, 232], [352, 234], [462, 238], [206, 242], [292, 243]].forEach((p, i) => {
      const pose = mood === 'laugh' ? 'laugh' : mood === 'cheer' ? 'cheer' : 'idle';
      const hop = mood === 'cheer' ? M.hop(t + i * 0.2, 0.4, 4) : mood === 'laugh' ? M.hop(t + i * 0.1, 0.25, 2) : 0;
      M.S.cit(g, i + 11, p[0], p[1] + hop, pose, {});
    });
  };

  // ---------- rainy street (world is 1000 px wide, camX = left edge) ----------
  function streetFar() {
    const c = M.canvas(760, 150), g = c.g; let x = 0, i = 0;
    while (x < 760) {
      const w = 40 + Math.floor(M.rnd(i, 71) * 50), h = 60 + Math.floor(M.rnd(i, 72) * 80);
      R(g, x, 150 - h, w, h, '#161a2e'); R(g, x, 150 - h, w, 2, '#20264a');
      for (let wy = 150 - h + 6; wy < 146; wy += 8) for (let wx = x + 4; wx < x + w - 4; wx += 7) if (M.rnd(wx * 5 + wy, 73) > 0.7) R(g, wx, wy, 3, 4, '#3a4a7a');
      x += w + 4; i++;
    }
    return c;
  }
  function neon(g, t, x, y, str, col) {
    const on = M.rnd(Math.floor(t * 10), str.length) > 0.08, w = M.textW(str);
    R(g, x - 3, y - 3, w + 6, 13, '#0e0f1c'); M.glow(g, x + w / 2, y + 3, w * 0.8, col, on ? 0.35 : 0.1);
    M.text(g, str, x, y, { c: on ? col : M.bright(col, 0.5) });
  }
  const POSTERS = [
    { x: 140, t: 'OPUS 5.5', c: '#d97757', ch: 'clawd' }, { x: 280, t: 'GPT-6 ASTRA', c: '#5a7cff', ch: 'codex' }, { x: 420, t: 'GPT-6 SOL', c: '#f2b33d', ch: 'sol' },
    { x: 560, t: 'COMING SOON', c: '#9a9aa8', ch: 'gemini', sad: 1 }, { x: 700, t: 'DEEPSEEK V4', c: '#4d6bfe', ch: 'whale' }, { x: 840, t: 'KIMI K3', c: '#c9b45a', ch: 'moon' },
  ];
  function poster(g, t, p, x, y, gone) {
    if (x < -80 || x > W + 10) return;
    let px = x, py = y;
    if (p.sad) {
      R(g, x, y, 70, 70, '#2e232e'); M.text(g, '?', x + 35, y + 30, { c: '#4a3a48', align: 'center' });
      if (gone >= 1) return;
      px += gone * -170; py += -gone * 130 + Math.sin(gone * 12) * 6;
    }
    R(g, px - 1, py - 1, 72, 72, '#15122a'); R(g, px, py, 70, 70, p.c); R(g, px + 3, py + 3, 64, 50, M.bright(p.c, 0.78));
    if (p.ch === 'sol') { M.circ(g, px + 35, py + 28, 12, '#ffe08a'); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; M.line(g, px + 35 + Math.cos(a) * 15, py + 28 + Math.sin(a) * 15, px + 35 + Math.cos(a) * 20, py + 28 + Math.sin(a) * 20, '#fff2c0'); } }
    else M.S.draw(g, p.ch, px + 35, py + 50, { s: 0.75, eyes: p.sad ? 'sad' : p.ch === 'moon' ? 'sly' : 'happy', mouth: p.sad ? 'frown' : p.ch === 'moon' ? 'smirk' : p.ch === 'whale' ? 'smile' : 'grin', face: 'grin', desat: p.sad ? 0.8 : 0 });
    if (p.sad) { M.text(g, 'GEMINI 3.5', px + 35, py + 55, { c: '#e6e6f0', align: 'center' }); M.text(g, p.t, px + 35, py + 62, { c: '#ffd84a', align: 'center' }); const fl = Math.round(Math.sin(t * 9) * 2); M.poly(g, [[px + 70, py + 56], [px + 70, py + 70], [px + 56 + fl, py + 70]], '#6a6a78'); }
    else M.text(g, p.t, px + 35, py + 59, { c: '#ffffff', align: 'center' });
  }
  B.streetBack = function (g, t, camX, o) {
    o = o || {}; const cl = o.clear || 0;
    B.sky(g, t, { kind: 'storm', sa: cl, sh: 110 });
    for (let i = 0; i < 9; i++) { const cx = ((((i * 83 - camX * 0.1 + t * 4) % 620) + 620) % 620) - 70 + (i % 2 ? -1 : 1) * cl * 300, cy = 18 + (i % 3) * 16; M.ell(g, cx, cy, 58, 16, '#232a44'); M.ell(g, cx + 20, cy - 6, 36, 12, '#2a3252'); }
    if (o.sky) o.sky(g);
    g.drawImage(once('streetFar', streetFar), Math.round(-camX * 0.35) - 20, 40);
    neon(g, t, 60 - camX * 0.35, 62, 'OPUS 5.5', '#ff9a5a'); neon(g, t, 330 - camX * 0.35, 58, 'ASTRA', '#8fb0ff'); neon(g, t, 520 - camX * 0.35, 70, 'SOL', '#ffd27a');
    const wx = -Math.round(camX);
    R(g, 0, 118, W, 90, '#3a2c3a');
    for (let y = 121, row = 0; y < 206; y += 6, row++) { const off = (row % 2) * 8; for (let x = (((wx + off) % 16) + 16) % 16 - 16; x < W; x += 16) R(g, x, y, 15, 5, (Math.floor((x - wx) / 16) + row) % 3 ? '#43323f' : '#4a3845'); }
    R(g, 0, 118, W, 3, '#2a1f2c');
    for (const p of POSTERS) poster(g, t, p, wx + p.x, 128, o.gone || 0);
    R(g, 0, 206, W, 26, '#4a4658'); R(g, 0, 206, W, 2, '#6a667a');
    for (let x = (((wx % 40) + 40) % 40) - 40; x < W; x += 40) R(g, x, 206, 1, 26, '#3a3648');
    R(g, 0, 232, W, 4, '#2a2838'); R(g, 0, 236, W, 34, '#1a1a26');
  };
  // mirror rows above yLine into the wet street below it
  B.reflect = function (g, t, yLine, h, a) {
    const c = g.canvas; g.globalAlpha = a;
    for (let i = 0; i < h; i++) { const dx = Math.round(Math.sin(i * 0.9 + t * 5) * (i * 0.08 + 0.5)); g.drawImage(c, 0, yLine - 1 - i * 2, W, 1, dx, yLine + i, W, 1); }
    g.globalAlpha = 1;
  };
})();
