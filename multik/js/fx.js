/* VSPYSHKA - fx.js: deterministic effects. Every effect is a pure function of time, so scrubbing and recording are exact. */
(function () {
  'use strict';
  const M = window.M, R = M.R, F = (M.F = {}), TAU = Math.PI * 2;
  const dp = (p0, v0, k, gr, t) => { const e = (1 - Math.exp(-k * t)) / k; return p0 + (v0 - gr / k) * e + (gr / k) * t; };

  // firework burst. o: {n, sp, cols, seed, drag, grav, life, shape: peony|ring|star|sun|heart|gem4}
  F.burst = function (g, tau, x, y, o) {
    o = o || {}; const life = o.life || 2.2; if (tau < 0 || tau > life) return;
    const n = o.n || 80, sp = o.sp || 70, k = o.drag || 1.6, gr = o.grav === undefined ? 30 : o.grav, seed = o.seed || 1, cols = o.cols || ['#ffd27a'];
    for (let i = 0; i < n; i++) {
      const r1 = M.rnd(i, seed), r2 = M.rnd(i, seed + 1), r3 = M.rnd(i, seed + 2);
      let a = (TAU * i) / n + (r1 - 0.5) * 0.25, v = sp * (0.55 + 0.45 * r2);
      if (o.shape === 'ring') v = sp * (0.95 + 0.05 * r2);
      else if (o.shape === 'star') v = sp * (0.45 + 0.55 * Math.pow(Math.abs(Math.cos(a * 2.5)), 3));
      else if (o.shape === 'sun') v = i % 3 === 0 ? sp : sp * 0.55;
      else if (o.shape === 'gem4') { const c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a)); v = sp * Math.pow(Math.pow(c, 0.68) + Math.pow(s, 0.68), -1 / 0.68); }
      else if (o.shape === 'heart') { const hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); a = Math.atan2(hy, hx); v = (sp * Math.hypot(hx, hy)) / 17; }
      const vx = Math.cos(a) * v, vy = Math.sin(a) * v, lf = life * (0.7 + 0.3 * r3);
      if (tau > lf) continue;
      const u = tau / lf;
      if (u > 0.55 && M.rnd(i, Math.floor(tau * 24) + seed) < (u - 0.55) * 1.6) continue;
      const col = u < 0.08 ? '#ffffff' : cols[i % cols.length], al = u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3;
      g.fillStyle = col;
      if (tau > 0.06) { g.globalAlpha = al * 0.45; g.fillRect(Math.round(dp(x, vx, k, 0, tau - 0.06)), Math.round(dp(y, vy, k, gr, tau - 0.06)), 1, 1); }
      g.globalAlpha = al; const sz = u < 0.35 ? 2 : 1;
      g.fillRect(Math.round(dp(x, vx, k, 0, tau)), Math.round(dp(y, vy, k, gr, tau)), sz, sz);
    }
    g.globalAlpha = 1;
    if (tau < 0.25) M.glow(g, x, y, 40 * (1 - tau / 0.25) + 10, cols[0], 0.6 * (1 - tau / 0.25));
  };
  // particles that fly from the burst centre into letters
  const tp = {};
  F.textBurst = function (g, tau, cx, cy, str, o) {
    if (tau < 0) return; o = o || {};
    const s = o.s || 2, key = str + s, T = tp[key] || (tp[key] = M.textPts(str, s));
    const fly = o.fly || 0.7, hold = o.hold || 2.6, fall = o.fall || 1.3, seed = o.seed || 5, cols = o.cols || ['#ffd27a'];
    if (tau > fly + hold + fall) return;
    const x0 = Math.round(cx - T.w / 2), y0 = Math.round(cy - T.h / 2);
    for (let i = 0; i < T.pts.length; i++) {
      const p = T.pts[i], d = M.rnd(i, seed) * 0.25; if (tau < d) continue;
      const u = M.clamp((tau - d) / fly, 0, 1), e = M.E.outC(u);
      const sx = cx + (M.rnd(i, seed + 1) - 0.5) * 30, sy = cy + (M.rnd(i, seed + 2) - 0.5) * 20;
      let px = M.lerp(sx, x0 + p[0], e), py = M.lerp(sy, y0 + p[1], e), a = 1;
      const tf = tau - fly - hold;
      if (tf > 0) { py += 40 * tf * tf + M.rnd(i, seed + 3) * 12 * tf; px += (M.rnd(i, seed + 4) - 0.5) * 10 * tf; a = 1 - tf / fall; }
      if (M.rnd(i, Math.floor(tau * 14) + seed) < 0.12) a *= 0.4;
      g.globalAlpha = M.clamp(a, 0, 1); g.fillStyle = u < 1 ? '#ffffff' : cols[Math.floor(p[0] / (s * 6)) % cols.length];
      g.fillRect(Math.round(px), Math.round(py), s, s);
    }
    g.globalAlpha = 1;
  };
  F.rocket = function (g, tau, x0, y0, x1, y1, dur, col) {
    if (tau < 0 || tau > dur) return;
    const P = (tt) => { const u = M.E.outQ(M.clamp(tt / dur, 0, 1)); return [M.lerp(x0, x1, u) + Math.sin(tt * 18) * 0.8, M.lerp(y0, y1, u)]; };
    for (let k = 14; k >= 1; k--) {
      const tk = tau - k * 0.025; if (tk < 0) continue; const p = P(tk);
      g.globalAlpha = (1 - k / 15) * 0.9; g.fillStyle = k < 4 ? '#fff4c0' : k < 9 ? '#ffb347' : '#b35a3c';
      g.fillRect(Math.round(p[0] + (M.rnd(k, Math.floor(tau * 30)) - 0.5) * 3), Math.round(p[1] + k * 0.6), 1, 1);
    }
    g.globalAlpha = 1; const p = P(tau);
    R(g, p[0] - 1, p[1] - 2, 2, 4, col || '#ffffff'); R(g, p[0] - 1, p[1] - 3, 2, 1, '#ffffff'); M.glow(g, p[0], p[1] + 2, 8, '#ffcf70', 0.5);
  };
  // rain. o: {n, sp, wind, len, col, a, amt, x, y, w, h, seed, skip(x,y)}
  F.rain = function (g, t, o) {
    const amt = o.amt === undefined ? 1 : o.amt; if (amt <= 0) return;
    const n = Math.floor((o.n || 160) * amt), sp = o.sp || 380, wind = o.wind === undefined ? -0.25 : o.wind, len = o.len || 6, x = o.x || 0, y = o.y || 0, w = o.w || M.W, h = o.h || M.H, seed = o.seed || 3;
    g.globalAlpha = o.a === undefined ? 0.6 : o.a; g.fillStyle = o.col || '#9fb7ff';
    for (let i = 0; i < n; i++) {
      const s2 = sp * (0.8 + 0.4 * M.rnd(i, seed + 2));
      const yy = y + ((M.rnd(i, seed) * h + t * s2) % h);
      let xx = (M.rnd(i, seed + 1) * w + wind * s2 * t) % w; if (xx < 0) xx += w; xx += x;
      if (o.skip && o.skip(xx, yy)) continue;
      for (let j = 0; j < len; j++) g.fillRect(Math.round(xx + wind * j), Math.round(yy + j), 1, 1);
    }
    g.globalAlpha = 1;
  };
  F.splashes = function (g, t, o) {
    const n = o.n || 24, seed = o.seed || 7, x = o.x || 0, w = o.w || M.W, y0 = o.y, h = o.h || 20;
    g.fillStyle = o.col || '#c8d6ff';
    for (let i = 0; i < n; i++) {
      const per = 0.45 + M.rnd(i, seed) * 0.5, tt = t + M.rnd(i, seed + 1) * per, ph = tt % per, u = ph / 0.22; if (u > 1) continue;
      const cyc = Math.floor(tt / per), sx = x + Math.floor(M.rnd(i + cyc * 31, seed + 2) * w), sy = y0 + Math.floor(M.rnd(i + cyc * 17, seed + 3) * h), d = Math.round(u * 3);
      g.globalAlpha = (1 - u) * 0.8; g.fillRect(sx - 1 - d, sy - d, 1, 1); g.fillRect(sx + 1 + d, sy - d, 1, 1); g.fillRect(sx - d, sy, 2 * d + 1, 1);
    }
    g.globalAlpha = 1;
  };
  F.smoke = function (g, tau, x, y, o) {
    if (tau < 0) return; o = o || {};
    const n = o.n || 6, life = o.life || 1.4, seed = o.seed || 11, col = o.col || '#8a8aa0', sp = o.sp || 14, r0 = o.r || 3;
    for (let i = 0; i < n; i++) {
      const tt = tau - M.rnd(i, seed) * 0.3; if (tt < 0 || tt > life) continue;
      const u = tt / life, a = (M.rnd(i, seed + 1) - 0.5) * 2.4 - Math.PI / 2, e = M.E.outQ(u);
      g.globalAlpha = (1 - u) * 0.8; M.circ(g, x + Math.cos(a) * sp * 1.2 * e, y + Math.sin(a) * sp * 1.6 * e - u * 8, r0 + u * 5 * (0.6 + M.rnd(i, seed + 2)), col);
    }
    g.globalAlpha = 1;
  };
  F.dust = (g, tau, x, y, o) => F.smoke(g, tau, x, y, Object.assign({ n: 8, col: '#c9b89a', sp: 10, life: 0.9, r: 2 }, o || {}));
  F.sparkle = function (g, x, y, r, col) { x = Math.round(x); y = Math.round(y); g.fillStyle = col || '#ffffff'; g.fillRect(x - r, y, r * 2 + 1, 1); g.fillRect(x, y - r, 1, r * 2 + 1); g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); };
  F.sparkles = function (g, t, x, y, w, h, n, seed, cols) {
    for (let i = 0; i < n; i++) {
      const per = 0.8 + M.rnd(i, seed) * 1.2, tt = t + M.rnd(i, seed + 1) * per, ph = (tt % per) / per; if (ph > 0.5) continue;
      const cyc = Math.floor(tt / per), k = Math.sin(ph * TAU);
      F.sparkle(g, x + M.rnd(i + cyc * 13, seed + 2) * w, y + M.rnd(i + cyc * 17, seed + 3) * h, k > 0.6 ? 2 : 1, cols ? cols[i % cols.length] : '#fff6c0');
    }
  };
  F.confetti = function (g, tau, o) {
    o = o || {}; const life = o.life || 5; if (tau < 0 || tau > life) return;
    const n = o.n || 80, seed = o.seed || 21, cols = o.cols || ['#ea4335', '#fbbc04', '#34a853', '#4285f4', '#d97757', '#9fd8ff'], x = o.x || 0, w = o.w || M.W, top = o.y === undefined ? -10 : o.y;
    for (let i = 0; i < n; i++) {
      const tt = tau - M.rnd(i, seed) * 1.5; if (tt < 0) continue;
      const px = x + M.rnd(i, seed + 1) * w + Math.sin(tt * (2 + M.rnd(i, seed + 2) * 3) + i) * 6, py = top + tt * (30 + M.rnd(i, seed + 3) * 40);
      if (py > M.H) continue;
      g.globalAlpha = M.clamp(life - tau, 0, 1); R(g, px, py, Math.abs(Math.sin(tt * 6 + i)) > 0.5 ? 2 : 1, 2, cols[i % cols.length]);
    }
    g.globalAlpha = 1;
  };
  F.tears = function (g, t, x, y, o) {
    o = o || {}; const per = o.per || 1.1, s = o.s || 1, ph = ((t + M.rnd(o.seed || 1, 1) * per) % per) / per;
    R(g, x, y, s, s * 3, 'rgba(127,200,255,0.55)');
    if (ph < 0.35) R(g, x, y, s, Math.max(1, Math.round(2 * (ph / 0.35) * s)), '#7fc8ff');
    else { const u = (ph - 0.35) / 0.65, py = y + 2 * s + u * u * 26 * s; g.globalAlpha = 1 - u * 0.6; R(g, x, py, s, 2 * s, '#7fc8ff'); R(g, x, py, s, s, '#e0f4ff'); g.globalAlpha = 1; }
  };
  F.sweat = function (g, t, x, y) { const ph = (t * 1.3) % 1; R(g, x, y + ph * 6, 2, 3, '#9fd8ff'); R(g, x, y + ph * 6, 1, 1, '#ffffff'); };
  F.steam = function (g, t, x, y) { for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; g.globalAlpha = (1 - ph) * 0.6; R(g, x - 2 + i * 2 + Math.round(Math.sin(t * 3 + i + ph * 6) * 1.5), y - ph * 12, 1, 2, '#ffffff'); } g.globalAlpha = 1; };
  F.fireflies = function (g, t, x, y, w, h, n, seed) {
    for (let i = 0; i < n; i++) {
      const fx = x + w * (0.5 + 0.45 * Math.sin(t * (0.3 + M.rnd(i, seed) * 0.4) + i * 1.7)), fy = y + h * (0.5 + 0.45 * Math.sin(t * (0.23 + M.rnd(i, seed + 1) * 0.3) + i * 2.3)), b = 0.5 + 0.5 * Math.sin(t * 3 + i * 5);
      M.glow(g, fx, fy, 6, '#d6ff7a', 0.35 * b); M.px(g, fx, fy, b > 0.3 ? '#f4ffb0' : '#9ac04a');
    }
  };
  F.hearts = function (g, tau, x, y, o) {
    if (tau < 0) return; o = o || {}; const n = o.n || 5, seed = o.seed || 3, life = o.life || 2;
    for (let i = 0; i < n; i++) { const tt = tau - i * 0.25; if (tt < 0 || tt > life) continue; const u = tt / life; g.globalAlpha = 1 - u; M.icon(g, 'heart', x - 3 + (M.rnd(i, seed) - 0.5) * 30 + Math.sin(tt * 4 + i) * 3, y - u * 40); }
    g.globalAlpha = 1;
  };
  F.speed = function (g, t, x, y, w, h, n, seed, col, dir) {
    dir = dir || -1; g.fillStyle = col || '#ffffff';
    for (let i = 0; i < n; i++) {
      const per = 0.25 + M.rnd(i, seed) * 0.2, ph = ((t + M.rnd(i, seed + 1)) % per) / per, len = 8 + M.rnd(i, seed + 2) * 18, ly = y + M.rnd(i, seed + 3) * h;
      const lx = dir < 0 ? x + w - ph * (w + len) : x - len + ph * (w + len);
      g.globalAlpha = 0.5 * Math.sin(ph * Math.PI); g.fillRect(Math.round(lx), Math.round(ly), Math.round(len), 1);
    }
    g.globalAlpha = 1;
  };
  F.bolt = function (g, seed, x0, y0, x1, y1, col) {
    let px = x0, py = y0;
    for (let i = 1; i <= 9; i++) {
      const u = i / 9, nx = M.lerp(x0, x1, u) + (i < 9 ? (M.rnd(i, seed) - 0.5) * 26 : 0), ny = M.lerp(y0, y1, u);
      M.line(g, px, py, nx, ny, col || '#ffffff', 2); if (i === 3 || i === 6) M.line(g, nx, ny, nx + (M.rnd(i, seed + 5) - 0.5) * 40, ny + 18, col || '#ffffff', 1);
      px = nx; py = ny;
    }
  };
  F.spout = function (g, tau, x0, y0, x1, y1, dur, o) {
    if (tau < 0) return; o = o || {}; const n = o.n || 50, seed = o.seed || 9, peak = o.peak || 60, col = o.col || '#9fd8ff';
    for (let i = 0; i < n; i++) {
      const tt = tau - (i / n) * dur * 0.7; if (tt < 0 || tt > dur) continue; const u = tt / dur;
      R(g, M.lerp(x0, x1, u) + (M.rnd(i, seed) - 0.5) * 4, M.lerp(y0, y1, u) - Math.sin(u * Math.PI) * peak + (M.rnd(i, seed + 1) - 0.5) * 4, 2, 2, i % 3 ? col : '#ffffff');
    }
  };
  F.drops = function (g, tau, x, y, o) {
    o = o || {}; const life = o.life || 0.8; if (tau < 0 || tau > life) return;
    const n = o.n || 16, seed = o.seed || 13, sp = o.sp || 60, col = o.col || '#9fd8ff';
    for (let i = 0; i < n; i++) { const a = -Math.PI * (0.1 + 0.8 * M.rnd(i, seed)), v = sp * (0.4 + 0.6 * M.rnd(i, seed + 1)); g.globalAlpha = 1 - tau / life; R(g, x + Math.cos(a) * v * tau, y + Math.sin(a) * v * tau + 160 * tau * tau, 1, 2, col); }
    g.globalAlpha = 1;
  };
  F.camFlash = function (g, tau, x, y, big) {
    if (tau < 0 || tau > 0.5) return; const k = 1 - tau / 0.5, r = (big ? 90 : 34) * (0.4 + tau * 1.5);
    M.glow(g, x, y, r, '#ffffff', 0.9 * k);
    g.globalAlpha = k; R(g, x - r * 0.8, y, r * 1.6, 1, '#ffffff'); R(g, x, y - r * 0.5, 1, r, '#ffffff'); g.globalAlpha = 1;
    if (big) { const cs = ['#ea4335', '#fbbc04', '#34a853', '#4285f4']; g.globalAlpha = k; for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2 + tau * 3; M.line(g, x, y, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6, cs[i], 2); } g.globalAlpha = 1; }
  };
  // fuse spark travelling along a line
  F.fuse = function (g, t, x0, y0, x1, y1, u, dim) {
    const x = M.lerp(x0, x1, u), y = M.lerp(y0, y1, u);
    M.line(g, x, y, x1, y1, '#3a2a20');
    const k = dim === undefined ? 1 : dim;
    if (k > 0.05) { M.glow(g, x, y, 10 * k, '#ffb347', 0.8 * k); for (let i = 0; i < 4; i++) if (M.rnd(i, Math.floor(t * 30)) < k) M.px(g, x + (M.rnd(i, Math.floor(t * 30) + 3) - 0.5) * 6, y - M.rnd(i, Math.floor(t * 30) + 5) * 5, '#fff2a0'); }
  };

  // ---------- Gemini 4: 3D sphere of particles that folds into the star, the "4" and the title ----------
  let GT = null;
  function targets() {
    if (GT) return GT;
    const pts = [], reg = (c, s) => (Math.abs(s) >= Math.abs(c) ? (s < 0 ? '#ea4335' : '#34a853') : c < 0 ? '#fbbc04' : '#4285f4');
    for (let i = 0; i < 300; i++) { const a = (i / 300) * TAU, c = Math.cos(a), s = Math.sin(a), r = 64 * Math.pow(Math.pow(Math.abs(c), 0.68) + Math.pow(Math.abs(s), 0.68), -1 / 0.68); pts.push([c * r, s * r - 14, reg(c, s), 2]); }
    const f = M.textPts('4', 5); for (const p of f.pts) pts.push([p[0] - f.w / 2, p[1] - f.h / 2 - 14, '#ffffff', 5]);
    const tx = M.textPts('GEMINI 4', 2); for (const p of tx.pts) pts.push([p[0] - tx.w / 2, p[1] + 60, '#fff2c0', 2]);
    GT = pts; return pts;
  }
  F.gem3D = function (g, tau, cx, cy) {
    if (tau < 0) return;
    const pts = targets(), n = pts.length, Fz = 220, R0 = 110 * (1 - Math.exp(-3.2 * tau)), rot = tau * 1.3, me = M.E.ioC(M.clamp((tau - 1.1) / 1.2, 0, 1));
    for (let i = 0; i < n; i++) {
      const ph = Math.acos(1 - (2 * (i + 0.5)) / n), th = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = Math.sin(ph) * Math.cos(th) * R0, y = Math.cos(ph) * R0, z = Math.sin(ph) * Math.sin(th) * R0;
      const xr = x * Math.cos(rot) + z * Math.sin(rot), zr = -x * Math.sin(rot) + z * Math.cos(rot), k = Fz / (Fz + zr);
      let px = cx + xr * k, py = cy + y * k * 0.9, sz = zr < 0 ? 2 : 1;
      let col = Math.abs(y) > Math.abs(xr) ? (y < 0 ? '#ea4335' : '#34a853') : xr < 0 ? '#fbbc04' : '#4285f4';
      const p = pts[i];
      if (me > 0) { px = M.lerp(px, cx + p[0], me); py = M.lerp(py, cy + p[1], me); if (me > 0.6) { col = p[2]; sz = me > 0.95 ? p[3] : Math.max(1, Math.round(p[3] * me)); } }
      let a = 0.85 + 0.15 * Math.sin(tau * 9 + i); if (me >= 1 && M.rnd(i, Math.floor(tau * 12)) < 0.08) a = 0.35;
      g.globalAlpha = a; g.fillStyle = tau < 0.12 ? '#ffffff' : col; g.fillRect(Math.round(px), Math.round(py), sz, sz);
    }
    g.globalAlpha = 1;
    if (tau < 0.4) M.glow(g, cx, cy, 120 * (1 - tau / 0.4) + 20, '#ffffff', 0.8 * (1 - tau / 0.4));
    if (me >= 1) F.sparkles(g, tau, cx - 90, cy - 90, 180, 170, 10, 7, ['#ffffff', '#ffd84a', '#9fd8ff']);
  };
  F.gemStatic = function (g, t, cx, cy, sc, a) {
    if (a <= 0) return; const pts = targets(); g.globalAlpha = M.clamp(a, 0, 1);
    for (let i = 0; i < pts.length; i++) { const p = pts[i]; if (M.rnd(i, Math.floor(t * 10)) < 0.1) continue; g.fillStyle = p[2]; const s = Math.max(1, Math.round(p[3] * sc)); g.fillRect(Math.round(cx + p[0] * sc), Math.round(cy + p[1] * sc), s, s); }
    g.globalAlpha = 1;
  };
})();
