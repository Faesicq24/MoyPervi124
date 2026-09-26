/* VSPYSHKA - scenes2.js: scenes 5-8 */
(function () {
  'use strict';
  const M = window.M, S = M.S, P = M.P, F = M.F, B = M.B, R = M.R, W = M.W, H = M.H, kf = M.kf, clamp = M.clamp, E = M.E, SH = M.SH, C = SH.C, bl = SH.bl, cur = SH.cur, SC = M.SCENES;

  // =============== 5. THE RACE ===============
  const RACE = (function () {
    const n = 15 * 200 + 2, dt = 1 / 200, dG = new Float32Array(n), dC = new Float32Array(n), dX = new Float32Array(n);
    let gg = 0, cc = 0, xx = 0;
    for (let i = 0; i < n; i++) {
      const tau = i * dt - 2; dG[i] = gg; dC[i] = cc; dX[i] = xx;
      let vg = 0, vc = 0, vx = 0;
      if (tau > 0) { vg = tau < 1 ? 900 * E.outQ(tau) : tau < 3 ? 900 : tau < 9.5 ? 900 * (1 - E.inQ((tau - 3) / 6.5)) : 0; vc = tau < 4 ? 1380 * E.ioQ(tau / 4) : 1380; vx = tau < 4.4 ? 1300 * E.ioQ(tau / 4.4) : 1300; }
      gg += vg * dt; cc += vc * dt; xx += vx * dt;
    }
    const at = (a, t) => { const f = clamp(t, 0, 15) * 200, i = Math.min(Math.floor(f), n - 2), u = f - i; return a[i] * (1 - u) + a[i + 1] * u; };
    return { g: (t) => at(dG, t), c: (t) => at(dC, t), x: (t) => at(dX, t) };
  })();
  const SIGNS = [[900, 'SWE-BENCH'], [2100, 'ARC-AGI'], [3300, 'HLE'], [4700, 'GPQA'], [6200, 'T-BENCH'], [7600, 'LMARENA']];
  const ROADOBJ = [];
  for (let i = 0; i < 80; i++) for (const side of [-1, 1]) ROADOBJ.push({ x: side * (130 + M.rnd(i * 2 + side, 5) * 80), z: 120 + i * 160 + M.rnd(i, 6) * 60, k: 'tree' });
  SIGNS.forEach((s, i) => ROADOBJ.push({ x: (i % 2 ? 1 : -1) * 128, z: s[0], k: 'sign', txt: s[1] }));
  function drawObj(o) {
    return function (g, sx, sy, s) {
      const c = o.k === 'tree' ? B.tree() : B.sign(o.txt), k = o.k === 'tree' ? 1.8 : 1.4, w = c.width * s * k, h = c.height * s * k;
      if (w < 1) return; g.drawImage(c, Math.round(sx - w / 2), Math.round(sy - h), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
    };
  }
  SC.push({
    name: 'Гонка', dur: 15, tin: 'iris', irisIn: [240, 170],
    draw(g, lt, cam, ui) {
      const dG = RACE.g(lt), dC = RACE.c(lt), dX = RACE.x(lt), camZ = 200 + dG - 100, gz = 200 + dG, camX = B.roadX(gz);
      const tau = lt - 2, vG = (RACE.g(lt + 0.05) - RACE.g(lt - 0.05)) * 10, moving = vG > 40;
      const objs = ROADOBJ.map((o) => ({ x: o.x, z: o.z, draw: drawObj(o) }));
      objs.push({ x: 0, z: 262, draw: (g2, sx, sy, s) => { const hw = 110 * s, top = sy - 70 * s; R(g2, sx - hw, top, 4 * s, 70 * s, '#2a2238'); R(g2, sx + hw - 4 * s, top, 4 * s, 70 * s, '#2a2238'); R(g2, sx - hw, top, hw * 2, 16 * s, '#15122a'); R(g2, sx - hw + s, top + s, hw * 2 - 2 * s, 14 * s, '#c23b5a');
        const lamps = [lt > 0.3 && lt < 2, lt > 0.9 && lt < 2, lt > 1.5 && lt < 2, lt >= 2]; for (let i = 0; i < 4; i++) { const on = lamps[i]; M.circ(g2, sx - 30 * s + i * 20 * s, top + 8 * s, 5 * s, '#15122a'); M.circ(g2, sx - 30 * s + i * 20 * s, top + 8 * s, 4 * s, on ? (i === 3 ? '#5ad07a' : '#ff4a4a') : '#4a3a4a'); } } });
      const wobble = moving ? M.hop(lt, 0.16, 3) : 0;
      objs.push({ x: -38, z: 200 + dC, draw: (g2, sx, sy, s) => { S.draw(g2, 'clawd', sx, sy, { s: s, back: true, legs: dC > 1 ? M.walk(lt, 14) : 'stand' }); } });
      objs.push({ x: 38, z: 200 + dX, draw: (g2, sx, sy, s) => { S.draw(g2, 'codex', sx, sy, { s: s, back: true, feet: dX > 1 ? M.walk(lt, 14) : 'stand' }); } });
      objs.push({ x: 0, z: gz, draw: (g2, sx, sy, s) => { S.draw(g2, 'gemini', sx, sy + wobble, { s: s, back: true, hands: lt > 11.5 ? 'low' : moving && Math.floor(lt * 7) % 2 ? 'up' : 'n', sy: moving ? 1 + Math.abs(wobble) * 0.02 : 1 }); } });
      B.road(g, lt, { camZ: camZ, camX: camX, objs: objs, dark: kf(lt, [[10, 0], [14.5, 0.55]]) });
      F.rain(g, lt, { amt: kf(lt, [[12.4, 0], [15, 0.7]]), n: 140, sp: 360, wind: -0.2, a: 0.5 });
      if (vG > 600) { F.speed(g, lt, 0, 130, 80, 140, 10, 3, '#ffffff', -1); F.speed(g, lt, 400, 130, 80, 140, 10, 9, '#ffffff', 1); }
      // HUD
      const place = 1 + (dC > dG ? 1 : 0) + (dX > dG ? 1 : 0);
      R(ui, 8, 8, 46, 46, '#15122a'); R(ui, 9, 9, 44, 44, '#2a2238'); R(ui, 10, 10, 42, 42, '#0f0c1c');
      let pe = 'angry', pm = 'flat';
      if (lt > 2 && lt < 5.6) { pe = 'happy'; pm = 'grin'; } else if (lt >= 5.6 && lt < 7.2) { pe = 'wide'; pm = 'o'; } else if (lt >= 7.2 && lt < 10) { pe = 'sad'; pm = 'wobble'; } else if (lt >= 10) { pe = lt > 12 ? 'sad' : 'blink'; pm = 'frown'; }
      ui.save(); ui.beginPath(); ui.rect(10, 10, 42, 42); ui.clip(); const pi = S.draw(ui, 'gemini', 31, 58, { eyes: pe, mouth: pm }); if (lt > 7.2 && lt < 10) F.sweat(ui, lt, 44, 16); if (lt > 12) { const e = S.feat(pi, 'eyes', 0); F.tears(ui, lt, e[0], e[1], { per: 1 }); } ui.restore();
      M.text(ui, 'ПОЗ.', 404, 12, { c: '#ffffff', ol: '#15122a' }); M.text(ui, place + '/3', 430, 10, { c: place === 1 ? '#ffd84a' : place === 2 ? '#e6e6f0' : Math.floor(lt * 4) % 2 ? '#ff6b6b' : '#ffffff', s: 2, ol: '#15122a' });
      const energy = lt < 5 ? 1 : clamp(1 - (lt - 5) / 6.5, 0, 1);
      M.icon(ui, 'bolt', 10, 250); M.text(ui, 'FLASH', 17, 250, { c: '#ffe14a', ol: '#15122a' });
      for (let i = 0; i < 10; i++) { R(ui, 50 + i * 7, 249, 6, 9, '#15122a'); if (i < Math.ceil(energy * 10)) R(ui, 51 + i * 7, 250, 4, 7, energy < 0.3 ? '#ff6b6b' : '#ffe14a'); }
      [[0.3, '3'], [0.9, '2'], [1.5, '1'], [2.0, 'СТАРТ!']].forEach((c) => { const k = M.pop(lt, c[0], c[0] + (c[1].length > 1 ? 0.8 : 0.55)); if (k > 0) M.text(ui, c[1], 240, 90 - 10 * (1 - k), { c: c[1].length > 1 ? '#5ad07a' : '#ffffff', s: 5, align: 'center', ol: '#15122a' }); });
      cam.bloom = 0.2;
    },
    au(A, t0) {
      [0.3, 0.9, 1.5].forEach((t) => A.sfx(t0 + t, 'beep', { f: 440, d: 0.15 })); A.sfx(t0 + 2.0, 'beep', { f: 880, d: 0.4 });
      const bpm = 150, s = 2.0;
      A.mel(s + t0, bpm, [[76, 0.5], [74, 0.5], [71, 0.5], [74, 0.5], [76, 1], [79, 1], [76, 0.5], [74, 0.5], [72, 0.5], [71, 0.5], [72, 2], [74, 0.5], [72, 0.5], [69, 0.5], [72, 0.5], [74, 1], [78, 1], [79, 0.5], [78, 0.5], [76, 0.5], [74, 0.5], [75, 2]], 'lead', 0.55);
      [[40, 47], [36, 43], [38, 45], [35, 42]].forEach((p, i) => { for (let q = 0; q < 16; q++) A.note(t0 + s + i * 1.6 + q * 0.1, [p[0], p[1], p[0] + 12, p[1]][q % 4], 0.09, 'bass', 0.6); });
      A.drums(t0 + s, bpm, 4, { k: 'x...x...x...x...', s: '....x.......x...', h: 'xxxxxxxxxxxxxxxx' }, 0.55);
      for (let q = 0; q < 12; q++) A.note(t0 + 8.4 + q * 0.12, 40, 0.1, 'bass', 0.5 - q * 0.03);
      A.sfx(t0 + 5.8, 'whoosh', { d: 0.6, f0: 600, f1: 2500, v: 0.5 }); A.sfx(t0 + 6.5, 'whoosh', { d: 0.6, f0: 600, f1: 2500, v: 0.5 });
      A.sfx(t0 + 9.6, 'powerdown', { d: 1.3 }); A.sfx(t0 + 10.2, 'wind', { d: 5 });
      A.sfx(t0 + 12.6, 'rain', { d: 2.4 + 21 + 14.5, v: 0.9 }); A.sfx(t0 + 13.6, 'thunder', { v: 0.4 });
    },
  });

  // =============== 6. RAIN ===============
  const BENCH_X = 216, BENCH_W = 100, GROUND = 222;
  function flashback(g, lt) { // memory rendered into its own buffer, then sepia and a cloud mask
    const fb = SH.fb || (SH.fb = M.canvas(200, 100)), f = fb.g, t = lt - 10;
    f.globalCompositeOperation = 'source-over'; f.globalAlpha = 1; R(f, 0, 0, 200, 100, '#f2e3c0');
    R(f, 80, 60, 40, 40, '#b08a5a'); R(f, 40, 72, 40, 28, '#9a7a4a'); R(f, 120, 80, 40, 20, '#9a7a4a');
    M.text(f, '1', 100, 66, { c: '#fff2c0', align: 'center', s: 2 }); M.text(f, '2', 60, 78, { c: '#e6d6b0', align: 'center' }); M.text(f, '3', 140, 84, { c: '#e6d6b0', align: 'center' });
    S.draw(f, 'gemini', 100, 60, { eyes: 'happy', mouth: 'grin', hands: 'up' });
    M.circ(f, 100, 44, 4, '#ffd84a'); M.line(f, 96, 36, 100, 42, '#ea4335'); M.line(f, 104, 36, 100, 42, '#4285f4');
    M.text(f, 'GEMINI 3 #1', 100, 4, { c: '#7a4a2a', align: 'center' }); M.text(f, 'НОЯБРЬ 2025', 4, 90, { c: '#7a5a3a' });
    for (let i = 0; i < 9; i++) { const leave = clamp((t - 2.5 - i * 0.22) / 0.6, 0, 1), x = 12 + i * 20 + (i < 4 ? -1 : 1) * leave * 90; if (leave < 1) S.cit(f, i + 2, x, 100 + M.hop(t + i * 0.1, 0.35, 3) * (1 - leave), leave > 0 ? 'back' : 'cheer'); }
    if (t < 2.6) F.confetti(f, t, { n: 40, w: 200, seed: 5 });
    f.globalCompositeOperation = 'color'; R(f, 0, 0, 200, 100, '#a0784a'); f.globalCompositeOperation = 'source-over';
    const ck = clamp((t - 4.5) / 0.8, 0, 1); if (ck > 0) { M.line(f, 100, 0, 100 + 20 * ck, 50 * ck, '#3a2a1a'); M.line(f, 100 + 20 * ck, 50 * ck, 80 + 30 * ck, 100 * ck, '#3a2a1a'); M.line(f, 110, 30, 110 + 60 * ck, 30 + 20 * ck, '#3a2a1a'); }
    const k = t < 0.4 ? E.outBack(t / 0.4) : t > 5.6 ? clamp(1 - (t - 5.6) / 0.3, 0, 1) : 1; if (k <= 0) return;
    const cx = 124, cy = 64, rx = 104 * k, ry = 54 * k;
    [[238, 146, 3], [224, 132, 5], [206, 118, 7]].forEach((b) => { M.circ(g, b[0], b[1], b[2] + 1, '#15122a'); M.circ(g, b[0], b[1], b[2], '#f2e3c0'); });
    M.ell(g, cx, cy, rx + 2, ry + 2, '#15122a'); M.ell(g, cx, cy, rx, ry, '#f2e3c0');
    g.save(); g.beginPath(); g.ellipse(cx, cy, Math.max(1, rx - 3), Math.max(1, ry - 3), 0, 0, Math.PI * 2); g.clip();
    for (let y = 0; y < 100; y++) g.drawImage(fb, 0, y, 200, 1, cx - 100 + Math.round(Math.sin(y * 0.2 + t * 3)), cy - 50 + y, 200, 1);
    g.restore();
  }
  SC.push({
    name: 'Дождь', dur: 21, tin: 'dither',
    draw(g, lt, cam, ui) {
      const gx = kf(lt, [[0, 800], [7, 285, 'lin']]), camX = clamp(gx - 285, 0, 520), sit = lt > 7.4;
      cam.zoom = kf(lt, [[16, 1], [21, 1.5]]); cam.cx = 285 - camX; cam.cy = 175;
      B.streetBack(g, lt, camX, { gone: kf(lt, [[4, 0], [5.6, 1, 'lin']]), sky: (g2) => { if (lt > 7.8 && lt < 8.1) F.bolt(g2, 7, 330, 0, 300, 100, '#ffffff'); } });
      const sx = (wx) => wx - camX;
      P.lamp(g, sx(BENCH_X - 12), GROUND - 16, 100, Math.sin(lt * 23) > -0.85 ? 1 : 0.2);
      M.cone(g, sx(BENCH_X - 12), GROUND - 118, 10, 120, 110, '#ffd27a', 0.18);
      P.bench(g, sx(BENCH_X), GROUND, BENCH_W);
      const cartX = sit ? BENCH_X + BENCH_W + 34 : gx + 50;
      P.cart(g, sx(cartX), GROUND); P.tarp(g, sx(cartX), GROUND - 7, 0, null);
      const ds = kf(lt, [[0, 0.5], [16, 0.55], [21, 0.65]]);
      let e = bl(lt, 3, 'sad'), m = 'frown', h = 'low';
      if (lt > 2.6 && lt < 3.6) e = 'lookUp';
      if (lt > 10 && lt < 12.5) { e = 'closed'; m = 'smile'; }
      if (lt > 16) { m = 'wobble'; h = 'hug'; }
      const gy = sit ? kf(lt, [[7.4, GROUND], [7.7, GROUND - 15, 'outBack']]) : GROUND + M.hop(lt, 0.5, 3);
      const gi = C(g, 'gemini', sx(gx), gy, { eyes: e, mouth: m, hands: h, desat: ds });
      if (!sit) { const hr = S.hand(gi, 1); M.line(g, hr[0], hr[1], sx(cartX) - 18, GROUND - 6, '#caa76a'); }
      if (lt > 16.2) for (let i = 0; i < 2; i++) { const ep = S.feat(gi, 'eyes', i); F.tears(g, lt + i * 0.4, ep[0], ep[1], { per: 1.2, seed: i + 1 }); }
      const tp = S.feat(gi, 'top'); M.say(g, lt, 8.4, 9.8, tp[0], tp[1], '...');
      if (lt > 10 && lt < 16.2) flashback(g, lt);
      B.reflect(g, lt, 236, 17, 0.3);
      const umb = lt > 19.6;
      if (umb) P.umbrella(g, sx(gx) - 18, kf(lt, [[19.6, 120], [21, 194, 'outQ']]), 1);
      F.rain(g, lt, { n: 190, sp: 400, a: 0.55, amt: kf(lt, [[0, 1], [16, 1.2]]), skip: umb ? (x, y) => Math.abs(x - sx(gx)) < 30 && y > 150 : null });
      F.splashes(g, lt, { y: 208, h: 26, n: 30 });
      M.desatAll(g, 0.3); M.tint(g, '#1a2a5a', 0.18, 'multiply');
      if (lt > 7.8 && lt < 8.3) cam.flash = (1 - (lt - 7.8) / 0.5) * 0.6;
      M.letterbox(ui, clamp(lt / 1.0, 0, 1));
    },
    au(A, t0) {
      A.melDeg(t0 + 0.8, 72, A.bars(A.THEME_A, 1, 3), 69, true, 'piano', 0.6); A.chords(t0 + 0.8, 72, [0, 5, 3], 4, 57, true, 'pad', 0.55);
      for (let t = 0.3; t < 7; t += 0.5) A.sfx(t0 + t, 'step', { f: 160, v: 0.4 });
      A.sfx(t0 + 7.5, 'squeak', { v: 0.6 }); A.sfx(t0 + 8.0, 'thunder', { v: 0.9 }); A.voice(t0 + 8.6, 'gemini', 3, { pitch: 0.75, v: 0.6 });
      A.melDeg(t0 + 10.2, 90, A.bars(A.THEME_A, 1, 2), 84, false, 'bell', 0.45); A.sfx(t0 + 10.1, 'cheer', { d: 2.5, v: 0.25 });
      A.sfx(t0 + 14.5, 'crack'); A.sfx(t0 + 15.7, 'glass', { v: 0.5 });
      A.melDeg(t0 + 16.2, 72, A.bars(A.THEME_A, 6, 7), 69, true, 'piano', 0.55); A.chords(t0 + 16.2, 72, [5, 3], 4, 57, true, 'pad', 0.5);
      A.sfx(t0 + 20.3, 'fwump', { v: 0.5 });
    },
  });

  // =============== 7. UMBRELLA ===============
  SC.push({
    name: 'Зонтик', dur: 17, tin: 'cut',
    draw(g, lt, cam, ui) {
      cam.zoom = kf(lt, [[0, 1.6], [14, 1.6], [16.5, 1.25]]); cam.cx = kf(lt, [[0, 280], [12, 280], [14, 300]]); cam.cy = kf(lt, [[0, 160], [2, 150], [14, 160]]);
      const clear = kf(lt, [[14, 0], [16.5, 1]]);
      B.streetBack(g, lt, 0, { gone: 1, clear: clear });
      P.lamp(g, BENCH_X - 12, GROUND - 16, 100, 1); M.cone(g, BENCH_X - 12, GROUND - 118, 10, 120, 110, '#ffd27a', 0.18);
      P.bench(g, BENCH_X, GROUND, BENCH_W); P.cart(g, BENCH_X + BENCH_W + 34, GROUND); P.tarp(g, BENCH_X + BENCH_W + 34, GROUND - 7, 0, null);
      const hooked = lt > 3.9;
      if (hooked) P.umbrella(g, 266, GROUND - 17, clear > 0.5 ? 1 - (clear - 0.5) * 2 : 1);
      // Claude
      const cx = kf(lt, [[0, 238], [2.6, 238], [3.3, 246]]), cy = kf(lt, [[0, GROUND], [2.6, GROUND], [3.1, GROUND - 15, 'outBack']]);
      let ce = bl(lt, 1, 'closed'), cm = 'smile', car = lt < 3.9 ? 'up' : 'n';
      if (lt > 4.5 && lt < 6.5) car = 'hold';
      if (lt > 7.4 && lt < 11) car = 'hold';
      if (lt > 7.8 && lt < 10.3) ce = 'happy';
      if (lt > 15 && lt < 16) ce = 'closed';
      const ci = C(g, 'clawd', cx, cy + (lt > 15 && lt < 15.5 ? 2 : 0), { eyes: ce, mouth: cm, armR: car });
      const ch = S.hand(ci, 1);
      if (!hooked) P.umbrella(g, ch[0], ch[1] + 4, 1);
      // Gemini
      const ds = kf(lt, [[7.5, 0.6], [11.5, 0.2], [16.5, 0]]);
      let ge = bl(lt, 3, 'sad'), gm = 'frown', gh = 'hug';
      if (lt < 2.2) ge = lt > 0.8 ? 'lookUp' : 'sad';
      if (lt > 4.5 && lt < 7.4) { ge = bl(lt, 3, 'lookL'); gh = lt > 6.3 ? 'mid' : 'hug'; }
      if (lt > 7.4 && lt < 9.6) { ge = 'wide'; gm = 'o'; } else if (lt >= 9.6 && lt < 11.5) { ge = 'star'; gm = 'smile'; gh = 'mid'; } else if (lt >= 11.5 && lt < 15) { ge = 'happy'; gm = 'smile'; gh = 'mid'; }
      if (lt >= 15 && lt < 16) ge = 'lookL';
      if (lt >= 16) { ge = 'angry'; gm = 'grin'; gh = 'up'; }
      const gi = C(g, 'gemini', 290, GROUND - 15 + (lt > 16 && lt < 16.4 ? -3 : 0), { eyes: ge, mouth: gm, hands: gh, desat: ds });
      if (lt < 4) for (let i = 0; i < 2; i++) { const ep = S.feat(gi, 'eyes', i); F.tears(g, lt + i * 0.4, ep[0], ep[1], { per: 1.3, seed: i + 1 }); }
      // cocoa cup moves from Claude to Gemini
      if (lt > 4.6) { const gl = S.hand(gi, 0), u = E.ioQ(clamp((lt - 5.8) / 0.6, 0, 1)); P.cup(g, M.lerp(ch[0] + 3, gl[0] + 2, u), M.lerp(ch[1] + 3, gl[1] + 3, u), lt); }
      // the TPU crystal
      if (lt > 7.5 && lt < 13.5) { const mid = [(ch[0] + S.hand(gi, 0)[0]) / 2 + 4, ch[1] - 6], u = E.ioQ(clamp((lt - 10.5) / 0.6, 0, 1)), k = lt > 12.8 ? clamp((13.5 - lt) / 0.7, 0, 1) : 1; P.crystal(g, M.lerp(ch[0] + 2, mid[0], u), M.lerp(ch[1] - 6, mid[1], u), lt, 1, (0.8 + u * 0.8) * k); }
      const ct = S.feat(ci, 'top'); M.say(g, lt, 5.0, 6.2, ct[0], ct[1], 'heart');
      M.say(g, lt, 7.9, 10.3, ct[0], ct[1], ['crystal', 'arrow', 'clawd', 'arrow', 'spark'], { dx: 12 });
      M.say(g, lt, 11.1, 12.3, ct[0], ct[1], 'heart'); F.hearts(g, lt - 11.2, 268, 170, { n: 4 });
      // Codex arrives
      if (lt > 12.5) {
        const kx = kf(lt, [[12.5, 470], [13.5, 380, 'outQ']]), run = lt < 13.5;
        const ki = C(g, 'codex', kx, GROUND + (run ? M.hop(lt, 0.14, 3) : 0), { face: lt < 13.6 ? 'prompt' : lt > 15.2 ? 'grin' : 'happy', cursor: cur(lt), hands: lt > 13.8 && lt < 15.2 ? 'fwd' : 'hold', feet: run ? M.walk(lt, 12) : 'stand', flip: lt > 13.8 && lt < 15.2 });
        if (!(lt > 13.8 && lt < 15.2)) { const kh = S.hand(ki, 1); P.toolbox(g, kh[0], kh[1] + 10); }
        const kt = S.feat(ki, 'top'); M.say(g, lt, 13.7, 15.2, kt[0], kt[1], '>_ ПОЧИНИМ?', { fill: '#121838', c: '#9fd8ff', ol: '#0d1444', dx: -20 });
      }
      const rainAmt = kf(lt, [[0, 1.1], [13.5, 1.1], [14.5, 0]]);
      F.rain(g, lt, { n: 190, sp: 400, a: 0.55, amt: rainAmt, skip: (x, y) => x > 228 && x < 306 && y > 150 && y < 226 });
      if (rainAmt > 0.1) F.splashes(g, lt, { y: 208, h: 26, n: Math.round(30 * rainAmt) });
      B.reflect(g, lt, 236, 17, 0.3);
      if (lt > 7.5 && lt < 13.5) M.glow(g, 268, 180, 50, '#ffffff', 0.12);
      M.desatAll(g, 0.3 * (1 - clear)); M.tint(g, '#1a2a5a', 0.18 * (1 - clear), 'multiply');
      M.letterbox(ui, kf(lt, [[15.5, 1], [16.5, 0]]));
      cam.bloom = 0.15 + clear * 0.1;
    },
    au(A, t0) {
      A.voice(t0 + 0.6, 'clawd', 3, { v: 0.6 });
      A.melDeg(t0 + 1.5, 84, A.bars(A.THEME_A, 1, 4), 72, false, 'bell', 0.5); A.chords(t0 + 1.5, 84, [0, 5, 3, 4], 4, 60, false, 'pad', 0.55);
      A.sfx(t0 + 3.0, 'squeak', { v: 0.6 }); A.sfx(t0 + 3.9, 'tick', { v: 2 }); A.sfx(t0 + 5.0, 'pop', { f: 900 }); A.voice(t0 + 5.05, 'clawd', 3); A.sfx(t0 + 6.3, 'tick', { v: 2 });
      A.sfx(t0 + 7.5, 'shimmer', { d: 2 }); A.voice(t0 + 8.0, 'clawd', 6, { v: 0.7 }); A.sfx(t0 + 10.5, 'shimmer', { d: 1.5 }); A.sfx(t0 + 11.2, 'pop', { f: 1000 }); A.voice(t0 + 11.6, 'gemini', 3, { up: 1 });
      for (let t = 12.5; t < 13.5; t += 0.12) A.sfx(t0 + t, 'step', { f: 480, v: 0.5 });
      A.voice(t0 + 13.8, 'codex', 5, { up: 1 }); A.sfx(t0 + 13.8, 'type', { d: 0.4 });
      A.chords(t0 + 13.5, 84, [4], 4, 60, false, 'pad', 0.6); A.chords(t0 + 16.2, 84, [0], 4, 60, false, 'pad', 0.6); A.arp(t0 + 14.2, 168, [0, 4], 4, 72, false, 'bell', 0.35);
      A.voice(t0 + 16.0, 'gemini', 3, { up: 1 });
    },
  });

  // =============== 8. WORKSHOP MONTAGE ===============
  const CODE = ['> build rocket --pro', 'fuel = tpu(4)', 'friends.help()', 'tests: 100% OK'];
  SC.push({
    name: 'Мастерская', dur: 13, tin: 'dither',
    draw(g, lt, cam) {
      const beat = lt < 3.2 ? 0 : lt < 6.4 ? 1 : lt < 9.6 ? 2 : 3, bt = lt - beat * 3.2;
      const qwenOn = beat === 2 && bt > 0.4 && bt < 2.4;
      B.workshop(g, lt, { day: kf(lt, [[3.2, 0], [6.4, 1]]), eve: kf(lt, [[9.6, 0], [12.5, 1]]), spin: beat === 1 ? bt * 3 : 0,
        window: (g2) => { if (!qwenOn) return; const qy = kf(bt, [[0.4, 150], [0.8, 124, 'outBack'], [2.1, 124], [2.3, 160, 'inQ']]); g2.save(); g2.beginPath(); g2.rect(62, 54, 56, 46); g2.clip(); const qi = S.draw(g2, 'qwen', 92, qy, { eyes: 'sly', mouth: 'evil' }); const e0 = S.feat(qi, 'eyes', 0); P.binoc(g2, e0[0] + 4, e0[1] - 4); g2.restore(); } });
      B.blueprint(g, 30, 110, beat === 0 ? bt / 3 : 1);
      B.terminal(g, lt, 350, 128, 112, 48, CODE, beat === 0 ? bt / 3 : 1);
      const four = beat === 3 ? clamp((bt - 0.8) / 1.0, 0, 1) : 0;
      R(g, 226, 214, 28, 8, '#4a3020');
      if (!(beat === 3 && bt > 1.9)) { if (four < 1) P.soonSign(g, 240, 160, beat === 3 && bt > 1.8 ? 0 : 1); }
      if (beat === 3 && bt > 1.8 && bt < 2.6) { const u = (bt - 1.8) / 0.8; g.save(); g.translate(240 + u * 160, 120 - u * 100); P.soonSign(g, 0, 0, 1); g.restore(); }
      P.bigRocket(g, 240, 214, { paint: four, cross: beat === 3 ? clamp((bt - 0.1) / 0.6, 0, 1) : 0 });
      if (beat === 1) { for (let i = 0; i < 4; i++) if (Math.sin(lt * 20 + i) > 0.4) F.sparkle(g, 252 + i * 2, 170 + (i % 2) * 6, 1, '#ffd27a'); }
      if (beat === 2) F.smoke(g, bt - 0.6, 240, 196, { n: 7, col: '#5a5a6a', life: 1.2, r: 4 });
      if (beat === 3 && bt > 0.8 && bt < 1.8) F.drops(g, bt - 0.8, 240, 180, { n: 20, col: ['#ea4335', '#fbbc04', '#34a853', '#4285f4'][Math.floor(bt * 8) % 4] });
      // characters per beat
      if (beat === 0) {
        C(g, 'clawd', 70, 222, { eyes: 'lookL', mouth: 'smile', armL: Math.floor(lt * 6) % 2 ? 'up' : 'hold' });
        C(g, 'codex', 404, 222, { face: 'blank', hands: 'type', flip: true });
        for (let i = 0; i < 4; i++) R(g, 400 - 16 + ((i * 7 + Math.floor(lt * 8) * 3) % 26), 198 - 30 + i * 3, 6 - (i % 3), 1, '#9fd8ff');
        C(g, 'gemini', 180, 222 + M.hop(lt, 0.3, 4), { eyes: Math.floor(lt / 0.8) % 2 ? 'lookL' : 'lookR', mouth: 'grin', hands: 'mid' });
      } else if (beat === 1) {
        C(g, 'clawd', 150, 222, { eyes: 'happy', mouth: 'smile', armR: 'hold' });
        const ki = C(g, 'codex', 300, 222, { face: 'squint', hands: 'fwd', flip: true }); const kh = S.hand(ki, 1); P.wrench(g, kh[0] - 12, kh[1] + 4);
        const gx = kf(bt, [[0, 110], [2.6, 196, 'lin']]);
        const gi = C(g, 'gemini', gx, 222 + M.hop(bt, 0.35, 3), { eyes: 'angry', mouth: 'flat', hands: 'up' });
        const hh = S.hand(gi, 1); M.poly(g, [[hh[0] - 20, hh[1] - 4], [hh[0] + 4, hh[1] - 4], [hh[0] - 8, hh[1] - 16]], '#ea4335'); F.sweat(g, lt, gx + 16, 176);
      } else if (beat === 2) {
        const soot = bt > 0.6 ? clamp(1 - (bt - 1.8) / 1.0, 0, 0.6) : 0, laugh = bt > 1.2;
        C(g, 'clawd', 184, 222 + (laugh ? M.hop(bt, 0.25, 3) : 0), { eyes: laugh ? 'happy' : 'wide', mouth: laugh ? 'grin' : 'o', armR: bt > 2.0 && bt < 2.8 ? (Math.floor(bt * 10) % 2 ? 'hold' : 'n') : 'n' });
        const gi = C(g, 'gemini', 238, 222 + (laugh ? M.hop(bt, 0.25, 3) : 0), { eyes: bt > 0.6 && bt < 1.2 ? 'blink' : laugh ? 'happy' : 'open', mouth: laugh ? 'grin' : 'flat', hands: bt < 0.6 ? 'mid' : 'n', tint: soot > 0.05 ? ['#2a2a2a', Math.round(soot * 10) / 10] : undefined });
        if (bt > 2.0 && bt < 2.8) F.dust(g, bt - 2.0, 220, 196);
        const ki = C(g, 'codex', 304, 222 + (laugh ? M.hop(bt, 0.25, 3) : 0), { face: bt > 2.2 ? 'wow' : laugh ? 'grin' : 'wow', cursor: cur(lt) });
        const kt = S.feat(ki, 'top'); M.say(g, lt, 8.7, 9.4, kt[0], kt[1], 'quest');
        void gi;
      } else {
        const hi = bt > 2.6 && bt < 3.3;
        C(g, 'clawd', 184, 222 + (hi ? -4 : 0), { eyes: 'happy', mouth: 'grin', arms: hi ? 'up' : 'n' });
        const gi = C(g, 'gemini', 268, 222 + (hi ? -4 : 0), { eyes: 'happy', mouth: 'grin', hands: bt < 1.8 || hi ? 'up' : 'n' });
        if (bt < 1.8) { const hh = S.hand(gi, 0); P.brush(g, hh[0] - 6, hh[1] + 6, ['#ea4335', '#fbbc04', '#34a853', '#4285f4'][Math.floor(bt * 6) % 4]); }
        C(g, 'codex', 320, 222 + (hi ? -4 : 0), { face: 'grin', hands: hi ? 'up' : 'n' });
        if (hi) { F.burst(g, bt - 2.6, 240, 150, { n: 40, sp: 50, cols: ['#ea4335', '#fbbc04', '#34a853', '#4285f4'], grav: 20, life: 1, seed: 4 }); F.hearts(g, bt - 2.6, 240, 140, { n: 3 }); }
      }
      if ([3.2, 6.4, 9.6].some((c) => lt > c && lt < c + 0.08)) cam.flash = 0.6;
      cam.bloom = 0.2;
    },
    au(A, t0) {
      A.melDeg(t0 + 0.2, 120, A.bars(A.THEME_A, 1, 6), 72, false, 'pluck', 0.6); A.bass(t0 + 0.2, 120, [0, 5, 3, 4, 2, 5], 4, 48, false, 0.55, true);
      A.drums(t0 + 0.2, 120, 6, { k: 'x.......x.......', c: '....x.......x...', h: '..x...x...x...x.' }, 0.5);
      A.sfx(t0 + 0.3, 'type', { d: 2.6, v: 0.6 }); [3.2, 6.4, 9.6].forEach((t) => A.sfx(t0 + t, 'swish'));
      [3.6, 4.2, 4.8, 5.4].forEach((t) => A.sfx(t0 + t, 'clank')); for (let t = 3.3; t < 6.3; t += 0.15) A.sfx(t0 + t, 'tick');
      A.sfx(t0 + 7.0, 'boom', { v: 0.3 }); A.voice(t0 + 7.6, 'clawd', 4, { up: 1 }); A.sfx(t0 + 7.7, 'laugh', { who: 'gemini', n: 4 }); A.sfx(t0 + 7.8, 'laugh', { who: 'codex', n: 4 });
      A.sfx(t0 + 8.6, 'pop', { f: 500 }); A.voice(t0 + 8.8, 'codex', 2, { up: 1 });
      A.sfx(t0 + 9.8, 'crack', { v: 0.4 }); A.sfx(t0 + 10.4, 'swell', { d: 1 }); A.sfx(t0 + 11.4, 'swish'); A.sfx(t0 + 12.2, 'sparkle'); A.note(t0 + 12.2, 39, 0.1, 'clap', 0.8);
    },
  });
})();
