/* VSPYSHKA - sets2.js: pseudo-3D race road, voxel flyover, workshop, park, forest, hill, 3D ascent */
(function () {
  'use strict';
  const M = window.M, R = M.R, W = M.W, H = M.H, B = M.B, once = B.once;

  // ---------- race road (per-scanline projection) ----------
  const roadX = (B.roadX = (z) => 140 * Math.sin(z / 1100) + 70 * Math.sin(z / 430 + 1));
  function mountains(g, off, hz, col, amp, seed) { g.fillStyle = col; for (let x = 0; x < W; x++) { const u = x + off, h = amp * (0.55 + 0.3 * Math.sin(u * 0.021 + seed) + 0.15 * Math.sin(u * 0.063 + seed * 2)); g.fillRect(x, Math.round(hz - h), 1, Math.round(h) + 1); } }
  B.tree = () => once('tree', () => { const c = M.canvas(40, 56), g = c.g; R(g, 17, 36, 6, 20, '#15122a'); R(g, 18, 36, 4, 20, '#6b4a33'); M.circ(g, 20, 22, 17, '#15122a'); M.circ(g, 20, 22, 16, '#2f7a3a'); M.circ(g, 15, 17, 9, '#3f9a4a'); M.circ(g, 13, 14, 4, '#6fd08a'); return c; });
  B.sign = (txt) => once('sign_' + txt, () => { const w = M.textW(txt) + 10, c = M.canvas(w, 34), g = c.g; R(g, 3, 14, 2, 20, '#3a3a4a'); R(g, w - 5, 14, 2, 20, '#3a3a4a'); R(g, 0, 0, w, 15, '#15122a'); R(g, 1, 1, w - 2, 13, '#2a7a4a'); R(g, 2, 2, w - 4, 11, '#3a9a5a'); M.text(g, txt, 5, 4, { c: '#ffffff' }); return c; });
  // st: {camZ, camX, objs:[{x,z,draw(g,sx,sy,s)}], dark}
  B.road = function (g, t, st) {
    const hz = 128, camH = 60, F = 100, camZ = st.camZ, camX = st.camX;
    B.sky(g, t, { kind: 'sunset' });
    const sx0 = 240 - camX * 0.08, sy0 = hz - 24;
    M.circ(g, sx0, sy0, 26, '#ffe08a'); M.circ(g, sx0, sy0, 22, '#fff2c0');
    for (let i = 0; i < 5; i++) R(g, sx0 - 30, sy0 + 4 + i * 5, 60, 1 + (i >> 1), '#ff9a6a');
    mountains(g, camX * 0.12, hz, '#5a2a6a', 38, 11); mountains(g, camX * 0.25, hz, '#3a1d4f', 24, 23);
    for (let y = hz + 1; y < H; y++) {
      const dz = (camH * F) / (y - hz), z = camZ + dz, s = F / dz, cx = W / 2 + (roadX(z) - camX) * s, hw = 90 * s, rw = 10 * s;
      const band = Math.floor(z / 60) % 2, rb = Math.floor(z / 30) % 2;
      R(g, 0, y, W, 1, band ? '#3f8a3a' : '#4a9a42');
      R(g, cx - hw - rw, y, (hw + rw) * 2, 1, rb ? '#e84a4a' : '#f4f4f4');
      R(g, cx - hw, y, hw * 2, 1, band ? '#5a5a6a' : '#626274');
      if (Math.floor(z / 45) % 2 === 0) R(g, cx - 1.5 * s, y, Math.max(1, 3 * s), 1, '#f4f4f4');
    }
    const objs = (st.objs || []).filter((o) => o.z - camZ > 18 && o.z - camZ < 6000).sort((a, b) => b.z - a.z);
    for (const ob of objs) { const dz = ob.z - camZ, s = F / dz; ob.draw(g, W / 2 + (roadX(ob.z) + ob.x - camX) * s, hz + camH * s, s); }
    if (st.dark > 0) M.tint(g, '#2a1a50', st.dark, 'multiply');
  };

  // ---------- voxel space flyover ----------
  let V = null;
  function voxInit() {
    const N = 256, hm = new Float32Array(N * N), cm = new Uint32Array(N * N);
    const vn = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, hh = (a, b) => M.rnd((((a % s) + s) % s) * 131 + (((b % s) + s) % s) * 7919, 77), u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      return M.lerp(M.lerp(hh(xi, yi), hh(xi + 1, yi), u), M.lerp(hh(xi, yi + 1), hh(xi + 1, yi + 1), u), v); };
    const town = new Uint8Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let a = 0, amp = 1, f = 1 / 64, tot = 0;
      for (let o = 0; o < 5; o++) { a += vn(x * f, y * f, Math.round(N * f)) * amp; tot += amp; amp *= 0.5; f *= 2; }
      a /= tot;
      const dx = (x - 128) / 110, dy = (y - 100) / 90, d = Math.sqrt(dx * dx + dy * dy);
      let h = a * 1.4 - 0.35 - d * 0.75 + 0.25;
      const tdx = (x - 128) / 26, tdy = (y - 118) / 18, td = tdx * tdx + tdy * tdy;
      if (td < 1) { h = M.lerp(h, 0.42, (1 - td) * 0.95); town[y * N + x] = 1; }
      hm[y * N + x] = Math.max(0, h) * 120;
    }
    const pack = (r, g, b) => (255 << 24) | (Math.min(255, b | 0) << 16) | (Math.min(255, g | 0) << 8) | Math.min(255, r | 0);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const k = y * N + x, h = hm[k], sl = (hm[y * N + Math.max(0, x - 1)] - hm[y * N + Math.min(N - 1, x + 1)]) * 0.06, n = M.rnd(k, 5);
      let c;
      if (h < 1.5) c = [40, 50, 110];
      else if (h < 6) c = [200, 170, 120];
      else if (h < 38) c = n > 0.5 ? [60, 130, 80] : [52, 118, 72];
      else if (h < 58) c = [40, 95, 60];
      else if (h < 80) c = [110, 110, 125];
      else c = [230, 230, 245];
      let l = M.clamp(0.85 + sl, 0.45, 1.3);
      c = [c[0] * l * 0.62, c[1] * l * 0.52, c[2] * l * 0.82];
      if (town[k] && h > 5) { c = n > 0.86 ? [255, 210, 120] : n > 0.8 ? [150, 220, 255] : n > 0.45 ? [120, 60, 70] : [70, 50, 80]; }
      cm[k] = pack(c[0], c[1], c[2]);
    }
    const sky = M.gradCanvas(W, H, [[0, '#120c33'], [0.25, '#3a2266'], [0.42, '#a8487a'], [0.55, '#ff9a6a'], [1, '#ff9a6a']]);
    const img = new ImageData(W, H);
    V = { N: N, hm: hm, cm: cm, sky: new Uint32Array(sky.g.getImageData(0, 0, W, H).data.buffer), img: img, buf: new Uint32Array(img.data.buffer), yb: new Int32Array(W), fog: [255, 150, 120], water: pack(30, 36, 90) };
  }
  // cam: {x, y, h, a (heading), hz}
  B.voxel = function (g, t, cam) {
    if (!V) voxInit();
    const buf = V.buf, N = V.N, hm = V.hm, cm = V.cm, yb = V.yb, fog = V.fog;
    buf.set(V.sky);
    for (let i = 0; i < 90; i++) { const sx = Math.floor(M.rnd(i, 81) * W), sy = Math.floor(M.rnd(i, 82) * 90); if (Math.sin(t * 2 + i) > -0.3) buf[sy * W + sx] = M.rnd(i, 83) > 0.5 ? 0xffffffff : 0xffffe0d0; }
    yb.fill(H);
    const sa = Math.sin(cam.a), ca = Math.cos(cam.a), zmax = 420, hz = cam.hz, sc = 120;
    let z = 1, dz = 1;
    while (z < zmax) {
      let plx = -ca * z - sa * z + cam.x, ply = sa * z - ca * z + cam.y;
      const prx = ca * z - sa * z + cam.x, pry = -sa * z - ca * z + cam.y, ddx = (prx - plx) / W, ddy = (pry - ply) / W;
      const fk = Math.pow(z / zmax, 1.6), fr = fog[0] * fk, fg = fog[1] * fk, fb = fog[2] * fk, ik = 1 - fk;
      for (let i = 0; i < W; i++) {
        const mx = Math.floor(plx), my = Math.floor(ply);
        let hh = 0, col = V.water;
        if (mx >= 0 && mx < N && my >= 0 && my < N) { const k = my * N + mx; hh = hm[k]; col = cm[k]; }
        let hs = (((cam.h - hh) / z) * sc + hz) | 0; if (hs < 0) hs = 0;
        if (hs < yb[i]) {
          const r = (col & 255) * ik + fr, gg = ((col >> 8) & 255) * ik + fg, b = ((col >> 16) & 255) * ik + fb;
          const c = (255 << 24) | ((b | 0) << 16) | ((gg | 0) << 8) | (r | 0);
          for (let y = hs; y < yb[i]; y++) buf[y * W + i] = c;
          yb[i] = hs;
        }
        plx += ddx; ply += ddy;
      }
      z += dz; dz += 0.012;
    }
    g.putImageData(V.img, 0, 0);
  };

  // ---------- workshop ----------
  B.workshop = function (g, t, o) {
    o = o || {}; const day = M.clamp(o.day || 0, 0, 1), eve = M.clamp(o.eve || 0, 0, 1);
    for (let x = 0; x < W; x += 24) { R(g, x, 0, 23, 230, (x / 24) % 2 ? '#6a4630' : '#63412d'); R(g, x + 23, 0, 1, 230, '#3a2418'); for (let y = 20 + (x % 48); y < 230; y += 60) R(g, x + 4, y, 2, 2, '#3a2418'); }
    const skyc = M.mix(M.mix('#1a2a5a', '#8fd3ff', day), '#ff8a6a', eve);
    R(g, 58, 50, 64, 54, '#2a1a10'); R(g, 62, 54, 56, 46, skyc);
    if (day < 0.5) M.stars(g, t, { n: 10, seed: 9, x: 62, y: 54, w: 56, h: 46 }); else M.circ(g, 102, 66, 6, eve > 0.5 ? '#ffb070' : '#fff2a0');
    if (o.window) o.window(g);
    R(g, 89, 54, 2, 46, '#2a1a10'); R(g, 62, 76, 56, 2, '#2a1a10');
    R(g, 330, 70, 110, 4, '#3a2418'); R(g, 330, 120, 110, 4, '#3a2418');
    const cs = ['#8fd3ff', '#ffcf70', '#9be89b', '#ff9ec7'];
    for (let i = 0; i < 6; i++) { R(g, 336 + i * 17, 56, 10, 14, '#15122a'); R(g, 337 + i * 17, 58, 8, 11, cs[i % 4]); }
    for (let i = 0; i < 5; i++) { R(g, 338 + i * 20, 104, 14, 16, '#15122a'); R(g, 339 + i * 20, 105, 12, 14, i % 2 ? '#7a8aa0' : '#aa6a4a'); }
    M.circ(g, 440, 40, 15, '#15122a'); M.circ(g, 440, 40, 13, '#f2efe6');
    const sp = o.spin || 0, ah = t * 0.1 + sp * 2, am = t * 1.2 + sp * 24;
    M.line(g, 440, 40, 440 + Math.sin(ah) * 7, 40 - Math.cos(ah) * 7, '#15122a', 2); M.line(g, 440, 40, 440 + Math.sin(am) * 11, 40 - Math.cos(am) * 11, '#c23b5a');
    R(g, 0, 222, W, 48, '#3a2a22'); for (let x = 0; x < W; x += 30) R(g, x, 222, 1, 48, '#2a1c16'); R(g, 0, 222, W, 2, '#2a1c16');
    R(g, 14, 180, 110, 8, '#15122a'); R(g, 15, 181, 108, 6, '#8a5a3b'); R(g, 20, 188, 5, 34, '#4a3020'); R(g, 112, 188, 5, 34, '#4a3020');
    R(g, 239, 0, 2, 28, '#15122a'); M.poly(g, [[228, 36], [252, 36], [246, 28], [234, 28]], '#2a2a3a'); R(g, 236, 36, 8, 3, '#fff2c0');
    M.cone(g, 240, 38, 20, 240, 190, '#ffd27a', 0.22);
  };
  B.blueprint = function (g, x, y, k) { // pinned paper with rocket sketch drawn progressively (k 0..1)
    R(g, x - 1, y - 1, 58, 46, '#15122a'); R(g, x, y, 56, 44, '#2a5aa8'); for (let i = 6; i < 56; i += 8) R(g, x + i, y, 1, 44, '#3a6ab8'); for (let i = 6; i < 44; i += 8) R(g, x, y + i, 56, 1, '#3a6ab8');
    const segs = [[28, 6, 22, 16], [28, 6, 34, 16], [22, 16, 22, 34], [34, 16, 34, 34], [22, 34, 34, 34], [22, 28, 16, 38], [34, 28, 40, 38], [26, 22, 30, 22]];
    const n = segs.length * M.clamp(k, 0, 1);
    for (let i = 0; i < segs.length; i++) { if (i >= n) break; const s = segs[i], u = M.clamp(n - i, 0, 1); M.line(g, x + s[0], y + s[1], x + M.lerp(s[0], s[2], u), y + M.lerp(s[1], s[3], u), '#e6f2ff'); }
    if (k >= 1) M.text(g, '4', x + 47, y + 34, { c: '#ffd84a' });
  };
  B.terminal = function (g, t, x, y, w, h, lines, k) {
    g.globalAlpha = 0.85; R(g, x, y, w, h, '#0a1a3a'); g.globalAlpha = 1; R(g, x, y, w, 1, '#9fd8ff'); R(g, x, y + h - 1, w, 1, '#3a6ab8'); R(g, x, y, 1, h, '#3a6ab8'); R(g, x + w - 1, y, 1, h, '#3a6ab8');
    M.glow(g, x + w / 2, y + h / 2, w * 0.7, '#4a8aff', 0.18);
    const total = lines.join('').length, shown = Math.floor(total * M.clamp(k, 0, 1)); let used = 0;
    lines.forEach((ln, i) => { const n = M.clamp(shown - used, 0, ln.length); used += ln.length; if (n > 0) M.text(g, ln.slice(0, n), x + 4, y + 4 + i * 10, { c: i === lines.length - 1 ? '#9be89b' : '#9fd8ff' }); });
    if (Math.floor(t * 3) % 2) R(g, x + 4 + M.textW(lines[Math.min(lines.length - 1, Math.floor((lines.length * shown) / Math.max(1, total)))] || '') + 2, y + 4 + Math.min(lines.length - 1, Math.floor((lines.length * shown) / Math.max(1, total))) * 10, 4, 7, '#9fd8ff');
  };

  // ---------- park (camX scroll) ----------
  function cloud(g, x, y, s) { M.ell(g, x, y, 22 * s, 7 * s, '#ffffff'); M.ell(g, x - 10 * s, y - 4 * s, 10 * s, 7 * s, '#ffffff'); M.ell(g, x + 8 * s, y - 6 * s, 12 * s, 8 * s, '#ffffff'); M.ell(g, x, y + 3 * s, 20 * s, 3 * s, '#e0ecff'); }
  B.cloud = cloud;
  function hills(g, off, base, col, amp, seed) { g.fillStyle = col; for (let x = 0; x < W; x++) { const u = x + off, h = amp * (0.6 + 0.4 * Math.sin(u * 0.013 + seed)) + 6 * Math.sin(u * 0.05 + seed); g.fillRect(x, Math.round(base - h), 1, H); } }
  B.park = function (g, t, camX, o) {
    o = o || {};
    B.sky(g, t, { kind: 'day' });
    if (o.sky) o.sky(g);
    for (let i = 0; i < 6; i++) cloud(g, ((((i * 97 - camX * 0.05 + t * 6) % 600) + 600) % 600) - 60, 26 + (i % 3) * 14, 1 + (i % 2) * 0.4);
    hills(g, camX * 0.2, 170, '#8fcf8a', 22, 3); hills(g, camX * 0.4, 186, '#6fb86f', 18, 7);
    const tc = B.tree(); for (let i = -1; i < 12; i++) g.drawImage(tc, Math.round(i * 60 - ((camX * 0.7) % 60)), 138);
    if (o.mid) o.mid(g);
    R(g, 0, 196, W, 74, '#7ac06a'); R(g, 0, 212, W, 30, '#e6cf9a'); R(g, 0, 212, W, 2, '#c9ae7a'); R(g, 0, 240, W, 2, '#c9ae7a');
    for (let x = -(camX % 34); x < W; x += 34) R(g, Math.round(x), 226, 8, 2, '#d2b884');
    const fl = ['#ff6b8a', '#ffd84a', '#ffffff', '#c7a4ff'];
    for (let i = 0; i < 40; i++) R(g, ((((i * 53 - camX) % 520) + 520) % 520) - 20, 200 + (i % 4) * 3, 2, 2, fl[i % 4]);
    for (let i = 0; i < 30; i++) R(g, ((((i * 71 - camX * 1.2) % 520) + 520) % 520) - 20, 248 + (i % 5) * 4, 2, 2, fl[i % 3]);
  };

  // ---------- forest night ----------
  function treeLine(g, base, col, amp, seed, step) { for (let x = -20; x < W + 20; x += step) { const h = amp * (0.6 + 0.4 * M.rnd(x, seed)); M.poly(g, [[x - step * 0.7, base], [x + step * 0.7, base], [x, base - h]], col); R(g, x - 2, base - 4, 4, 60, col); } }
  B.forest = function (g, t, o) {
    o = o || {};
    B.sky(g, t, { kind: 'night', sh: 120, seed: 8 });
    treeLine(g, 150, '#101634', 50, 3, 26); treeLine(g, 172, '#0b1028', 70, 9, 34);
    R(g, 0, 200, W, 70, '#14231e'); R(g, 0, 200, W, 2, '#1d3328'); for (let i = 0; i < 60; i++) R(g, (i * 37) % W, 205 + ((i * 13) % 60), 2, 1, '#23402f');
    M.poly(g, [[30, 222], [120, 222], [75, 160]], '#15122a'); M.poly(g, [[33, 221], [117, 221], [75, 164]], '#c2703a'); M.poly(g, [[62, 221], [88, 221], [75, 190]], '#3a2418'); M.line(g, 75, 164, 75, 221, '#8a4a2a');
    R(g, 138, 222, 26, 3, '#4a3020'); R(g, 142, 219, 18, 3, '#5a3a26');
    for (let i = 0; i < 6; i++) { const f = Math.sin(t * 9 + i * 2), h = 6 + f * 3 + (i % 3) * 2; M.poly(g, [[141 + i * 4, 220], [147 + i * 4, 220], [144 + i * 4, 220 - h]], i % 2 ? '#ff9a3c' : '#ffd27a'); }
    M.glow(g, 151, 214, 60 + Math.sin(t * 7) * 4, '#ff8a3c', 0.3);
    for (const x of [262, 402]) { R(g, x - 7, 40, 14, 186, '#15122a'); R(g, x - 6, 40, 12, 186, '#3a2a26'); R(g, x - 6, 40, 3, 186, '#4a3a32'); M.circ(g, x, 40, 36, '#0d1a1a'); M.circ(g, x - 8, 34, 20, '#132626'); }
    F2(g, t);
  };
  function F2(g, t) { M.F.fireflies(g, t, 20, 90, 440, 120, 10, 17); }
  B.bushes = function (g, t, eyesOn) {
    const bl = [[420, 238, 34, 22], [460, 232, 30, 26], [392, 252, 30, 18], [470, 258, 26, 16]];
    for (const b of bl) M.ell(g, b[0], b[1], b[2] + 1, b[3] + 1, '#081210');
    for (const b of bl) { M.ell(g, b[0], b[1], b[2], b[3], '#16331f'); M.ell(g, b[0] - 6, b[1] - 6, b[2] * 0.5, b[3] * 0.4, '#1f4a2b'); }
    if (eyesOn) { if (!M.blink(t, 41)) { R(g, 424, 230, 6, 3, '#9fd8ff'); M.glow(g, 427, 231, 8, '#9fd8ff', 0.4); } if (!M.blink(t, 42)) { R(g, 452, 236, 1, 2, '#ffffff'); R(g, 458, 236, 1, 2, '#ffffff'); } }
  };

  // ---------- hill (finale) ----------
  B.hill = function (g, t) {
    B.sky(g, t, { kind: 'night', n: 220, sh: 200, seed: 12 });
    g.globalAlpha = 0.2; for (let i = 0; i < 260; i++) { const u = M.rnd(i, 91); R(g, u * W, 30 + u * 70 + (M.rnd(i, 92) - 0.5) * 36, 1 + (i % 3 === 0 ? 1 : 0), 1, i % 2 ? '#c9b8ff' : '#ffffff'); } g.globalAlpha = 1;
    R(g, 0, 186, W, 84, '#0e0b22');
    for (let i = 0; i < 90; i++) if (Math.sin(t * 2 + i) > -0.7) R(g, M.rnd(i, 93) * W, 190 + M.rnd(i, 94) * 18, 1, 1, i % 4 ? '#ffcf70' : '#8fd3ff');
    g.fillStyle = '#07061a'; for (let x = 0; x < W; x++) { const y = Math.round(222 - 12 * Math.cos((x - 240) / 120)); g.fillRect(x, y, 1, H - y); }
  };

  // ---------- 3D ascent: clouds and stars rush past a rising camera ----------
  B.ascent = function (g, t, st) {
    const k = M.clamp(st.k, 0, 1), gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, M.mix('#0a1030', '#02030a', k)); gr.addColorStop(1, M.mix('#3a2a6e', '#0a0c24', k)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const cy = st.camY, sp = st.speed || 0;
    for (let i = 0; i < 170; i++) {
      const sx = (M.rnd(i, 31) - 0.5) * 900, sz = 60 + M.rnd(i, 32) * 400, wy = M.rnd(i, 33) * 3000, rel = ((((wy - cy * 0.6) % 3000) + 3000) % 3000) - 1500;
      const px = W / 2 + (sx / sz) * 120, py = H / 2 - (rel / sz) * 48; if (px < 0 || px >= W || py < 0 || py >= H) continue;
      g.globalAlpha = (0.25 + 0.75 * k) * (0.5 + 0.5 * M.rnd(i, 34)); R(g, px, py, 1, 1 + Math.min(18, sp * 0.02 * (120 / sz)), '#ffffff');
    }
    g.globalAlpha = 1;
    const gy = H - 40 + cy * 0.12; if (gy < H) { R(g, 0, gy, W, H - gy, '#0e0b22'); for (let i = 0; i < 70; i++) R(g, M.rnd(i, 35) * W, gy + 3 + M.rnd(i, 36) * 30, 1, 1, i % 3 ? '#ffcf70' : '#8fd3ff'); }
    for (let i = 0; i < 26; i++) {
      const cx = (M.rnd(i, 41) - 0.5) * 700, cz = 40 + M.rnd(i, 42) * 260, wy = 500 + M.rnd(i, 43) * 1800, rel = wy - cy, py = H / 2 - (rel / cz) * 120, px = W / 2 + (cx / cz) * 120, sc = 120 / cz;
      if (py < -90 || py > H + 90) continue;
      g.globalAlpha = Math.min(1, 0.45 + sc * 0.3) * (1 - k * 0.85);
      M.ell(g, px, py, 30 * sc, 9 * sc, '#c9c4e8'); M.ell(g, px - 12 * sc, py - 5 * sc, 14 * sc, 8 * sc, '#e6e2ff'); M.ell(g, px + 10 * sc, py - 6 * sc, 16 * sc, 9 * sc, '#ffffff');
    }
    g.globalAlpha = 1;
  };
})();
