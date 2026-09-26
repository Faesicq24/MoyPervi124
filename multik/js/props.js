/* VSPYSHKA - props.js: pixel props drawn with primitives */
(function () {
  'use strict';
  const M = window.M, R = M.R, OL = '#15122a';
  const P = (M.P = {});
  const outlined = (g, pts, col) => { for (const d of [[-1, 0], [1, 0], [0, -1], [0, 1]]) M.poly(g, pts.map((p) => [p[0] + d[0], p[1] + d[1]]), OL); M.poly(g, pts, col); };

  P.rocket = function (g, x, y, col) { // small firework rocket, bottom at (x,y)
    x = Math.round(x); y = Math.round(y);
    R(g, x - 6, y - 2, 12, 2, '#6b4a33');
    R(g, x - 3, y - 17, 6, 14, OL); R(g, x - 2, y - 16, 4, 12, col); R(g, x - 2, y - 16, 1, 12, M.bright(col, 1.3)); R(g, x - 2, y - 12, 4, 2, '#ffffff');
    M.poly(g, [[x - 3, y - 16], [x + 3, y - 16], [x, y - 23]], OL); M.poly(g, [[x - 2, y - 16], [x + 2, y - 16], [x, y - 21]], '#ffffff');
    R(g, x - 5, y - 7, 3, 5, OL); R(g, x + 2, y - 7, 3, 5, OL); R(g, x - 4, y - 6, 2, 3, M.bright(col, 0.7)); R(g, x + 2, y - 6, 2, 3, M.bright(col, 0.7));
    R(g, x, y - 3, 1, 3, '#caa76a');
  };
  // Gemini's big rocket. o: {four, label, paint (0..1 reveal of new paint), cross (0..1)}
  P.bigRocket = function (g, x, y, o) {
    o = o || {}; x = Math.round(x); y = Math.round(y);
    const draw = (four) => {
      const body = four ? '#f4f6ff' : '#b9bccb', sh = four ? '#c9cfe6' : '#8e91a3';
      outlined(g, [[x - 8, y - 15], [x - 14, y], [x - 7, y]], four ? '#ea4335' : '#8a6e6e');
      outlined(g, [[x + 8, y - 15], [x + 14, y], [x + 7, y]], four ? '#4285f4' : '#6e768a');
      R(g, x - 9, y - 41, 18, 39, OL); R(g, x - 8, y - 40, 16, 37, body); R(g, x + 3, y - 40, 5, 37, sh); R(g, x - 8, y - 40, 2, 37, '#ffffff');
      outlined(g, [[x - 8, y - 40], [x + 8, y - 40], [x, y - 55]], four ? '#ea4335' : '#9a9aa8');
      if (four) { const cs = ['#4285f4', '#34a853', '#fbbc04', '#ea4335']; for (let i = 0; i < 4; i++) R(g, x - 8, y - 9 - i * 3, 16, 2, cs[i]); }
      else { R(g, x - 8, y - 11, 16, 2, '#7d8094'); R(g, x - 8, y - 17, 16, 1, '#7d8094'); }
      M.circ(g, x, y - 31, 4, OL); M.circ(g, x, y - 31, 3, four ? '#8fd3ff' : '#6d7ea0'); R(g, x - 2, y - 33, 1, 1, '#ffffff');
      R(g, x - 5, y - 3, 10, 3, OL); R(g, x - 4, y - 3, 8, 2, '#5a5a6e');
      if (four) M.text(g, '4', x, y - 26, { c: '#4285f4', s: 2, align: 'center', ol: OL }); else M.text(g, '3.5', x, y - 24, { c: '#3a3a4a', align: 'center' });
    };
    const pk = o.paint === undefined ? (o.four ? 1 : 0) : o.paint;
    if (pk <= 0) draw(false);
    else if (pk >= 1) draw(true);
    else { draw(false); g.save(); g.beginPath(); g.rect(x - 20, y - 60 + 60 * (1 - pk), 40, 62); g.clip(); draw(true); g.restore(); }
    if (o.cross > 0 && pk < 1) { const k = M.clamp(o.cross, 0, 1); M.line(g, x - 7, y - 27, x - 7 + 14 * k, y - 27 + 8 * k, '#ea4335', 2); if (k > 0.5) M.line(g, x + 7, y - 27, x + 7 - 14 * (k - 0.5) * 2, y - 27 + 8 * (k - 0.5) * 2, '#ea4335', 2); }
  };
  P.tarp = function (g, x, y, puff, tag) {
    x = Math.round(x); y = Math.round(y); const k = 1 + (puff || 0) * 0.12;
    outlined(g, [[x - 3 * k, y - 60 * k], [x + 3 * k, y - 60 * k], [x + 12 * k, y - 34], [x + 16 * k, y], [x - 16 * k, y], [x - 12 * k, y - 34]], '#8a7a6a');
    M.poly(g, [[x - 2, y - 58 * k], [x + 1, y - 58 * k], [x - 6, y - 2], [x - 11, y - 2]], '#a8988a');
    M.line(g, x + 4, y - 50 * k, x + 8, y - 2, '#6a5a4a'); M.line(g, x - 1, y - 40 * k, x - 3, y - 2, '#6a5a4a');
    R(g, x - 13, y - 24, 26, 2, '#caa76a');
    if (tag) { const tw = M.textW(tag); M.line(g, x + 12, y - 23, x + 18, y - 17, '#e6d6b0'); R(g, x + 16, y - 18, tw + 6, 11, OL); R(g, x + 17, y - 17, tw + 4, 9, '#fff6de'); M.text(g, tag, x + 19, y - 16, { c: '#6a3a2a' }); }
  };
  P.soonSign = function (g, x, y, lift) { // spring base at (x,y)
    const w = M.textW('COMING SOON') + 10, top = y - 6 - 26 * lift;
    for (let i = 0; i < 6; i++) { const a = y - (i * (y - top - 10)) / 6, b = y - ((i + 1) * (y - top - 10)) / 6; M.line(g, x + (i % 2 ? 3 : -3), a, x + (i % 2 ? -3 : 3), b, '#c9c9d9'); }
    const sx = Math.round(x - w / 2), sy = Math.round(top - 13);
    R(g, sx - 1, sy - 1, w + 2, 15, OL); R(g, sx, sy, w, 13, '#ffd84a'); R(g, sx, sy, w, 2, '#fff2a0');
    M.text(g, 'COMING SOON', sx + 5, sy + 3, { c: '#3a2a10' });
  };
  P.camera = function (g, x, y, lit) {
    x = Math.round(x); y = Math.round(y);
    R(g, x - 7, y - 5, 14, 10, OL); R(g, x - 6, y - 4, 12, 8, '#3d4152'); R(g, x - 6, y - 4, 12, 2, '#5a6075');
    R(g, x + 1, y - 7, 5, 3, OL); R(g, x + 2, y - 6, 3, 2, lit ? '#ffffff' : '#c9d6ff');
    M.circ(g, x - 1, y + 0.5, 3.5, OL); M.circ(g, x - 1, y + 0.5, 2.5, '#6f8cff'); R(g, x - 2, y - 1, 1, 1, '#ffffff');
  };
  P.umbrella = function (g, x, y, k, col) { // handle bottom at (x,y); k: 0 closed .. 1 open
    col = col || '#e8743f'; x = Math.round(x); y = Math.round(y); const top = y - 46;
    R(g, x, top, 1, 46, '#3a2a20'); R(g, x - 3, y + 1, 4, 1, '#3a2a20'); R(g, x - 3, y - 1, 1, 2, '#3a2a20');
    if (k <= 0.05) { outlined(g, [[x - 2, top + 5], [x + 3, top + 5], [x + 1, top + 30]], col); return; }
    const rx = 8 + 24 * k, ry = 4 + 10 * k, cy = top + ry + 2, pts = [];
    for (let i = 0; i <= 16; i++) { const a = Math.PI + (Math.PI * i) / 16; pts.push([x + 0.5 + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    for (let i = 0; i <= 8; i++) pts.push([x + 0.5 + rx - (i / 8) * 2 * rx, cy + (i % 2 ? 3 : 0)]);
    outlined(g, pts, col);
    M.line(g, x, top + 2, x - rx * 0.5, cy + 1, M.bright(col, 0.75)); M.line(g, x, top + 2, x + rx * 0.5, cy + 1, M.bright(col, 0.75));
    M.line(g, x - rx * 0.62, cy - ry * 0.5, x - rx * 0.3, cy - ry * 0.85, M.bright(col, 1.3));
  };
  P.cup = function (g, x, y, t) {
    x = Math.round(x); y = Math.round(y);
    R(g, x - 4, y - 7, 8, 8, OL); R(g, x - 3, y - 6, 6, 6, '#f2efe6'); R(g, x - 3, y - 6, 6, 2, '#7a4a2a');
    R(g, x + 4, y - 5, 2, 1, OL); R(g, x + 5, y - 5, 1, 3, OL); R(g, x + 4, y - 3, 2, 1, OL);
    if (t !== undefined) M.F.steam(g, t, x, y - 8);
  };
  P.crystal = function (g, x, y, t, s, glow) {
    s = s || 1; x = Math.round(x); y = Math.round(y); const pu = (0.6 + 0.4 * Math.sin(t * 5)) * (glow === undefined ? 1 : glow);
    M.glow(g, x, y, 24 * s, '#ffffff', 0.25 * pu); M.glow(g, x - 5, y, 18 * s, '#4285f4', 0.25 * pu); M.glow(g, x + 5, y, 18 * s, '#ea4335', 0.2 * pu);
    const h = 9 * s, w = 6 * s;
    M.poly(g, [[x, y - h - 1], [x + w + 1, y], [x, y + h + 1], [x - w - 1, y]], OL);
    M.poly(g, [[x, y - h], [x, y], [x - w, y]], '#fbbc04'); M.poly(g, [[x, y - h], [x + w, y], [x, y]], '#ea4335');
    M.poly(g, [[x - w, y], [x, y], [x, y + h]], '#34a853'); M.poly(g, [[x, y], [x + w, y], [x, y + h]], '#4285f4');
    R(g, x - 2 * s, y - h + 3 * s, s, 2 * s, '#ffffff');
    if (Math.sin(t * 3) > 0.6) M.F.sparkle(g, x + 5 * s, y - h + 2, 2, '#ffffff');
  };
  P.toolbox = function (g, x, y) { x = Math.round(x); y = Math.round(y); R(g, x - 9, y - 9, 18, 9, OL); R(g, x - 8, y - 8, 16, 7, '#d64545'); R(g, x - 8, y - 8, 16, 2, '#ff7070'); R(g, x - 3, y - 12, 6, 1, OL); R(g, x - 3, y - 12, 1, 4, OL); R(g, x + 2, y - 12, 1, 4, OL); R(g, x - 1, y - 6, 2, 2, '#ffd27a'); };
  P.jar = function (g, x, y, k, t) {
    x = Math.round(x); y = Math.round(y);
    R(g, x - 5, y - 12, 10, 12, OL); R(g, x - 4, y - 11, 8, 10, '#bfe6ff'); R(g, x - 4, y - 14, 8, 3, '#8a6a4a'); R(g, x - 5, y - 15, 10, 1, OL);
    if (k > 0) { const hh = Math.round(9 * M.clamp(k, 0, 1)); R(g, x - 4, y - 1 - hh, 8, hh, '#ffb070'); M.glow(g, x, y - 5, 16, '#ff9a3c', 0.5 * k); for (let i = 0; i < 3; i++) if (Math.sin(t * 7 + i * 2) > 0) M.px(g, x - 2 + i * 2, y - 3 - i * 2, '#fff2c0'); }
    R(g, x - 3, y - 10, 1, 7, '#ffffff');
  };
  P.net = function (g, x, y, ang) {
    const hx = x + Math.cos(ang) * 16, hy = y + Math.sin(ang) * 16, cx = hx + Math.cos(ang) * 6, cy = hy + Math.sin(ang) * 6;
    M.line(g, x, y, hx, hy, '#8a6a4a');
    g.globalAlpha = 0.45; M.circ(g, cx, cy, 5, '#ffffff'); g.globalAlpha = 1; M.ring(g, cx, cy, 6, '#e6e6f0');
  };
  P.notebook = function (g, x, y, open) {
    x = Math.round(x); y = Math.round(y);
    if (!open) { R(g, x - 5, y - 7, 10, 8, OL); R(g, x - 4, y - 6, 8, 6, '#ffe07a'); R(g, x - 4, y - 6, 1, 6, '#c9a93a'); return; }
    R(g, x - 45, y - 26, 90, 28, OL); R(g, x - 44, y - 25, 43, 26, '#fffbef'); R(g, x + 1, y - 25, 43, 26, '#fffbef'); R(g, x, y - 25, 1, 26, '#c9b9a0');
    M.text(g, 'КАК СТАТЬ', x - 22, y - 22, { c: '#6339e6', align: 'center' }); M.text(g, 'КЛОДОМ', x - 22, y - 12, { c: '#6339e6', align: 'center' });
    M.S.draw(g, 'clawd', x + 22, y - 2, { s: 0.33, eyes: 'happy' }); M.icon(g, 'heart', x + 33, y - 23);
  };
  P.flask = function (g, x, y, lvl) {
    x = Math.round(x); y = Math.round(y);
    R(g, x - 7, y - 2, 14, 2, '#5b4636');
    M.circ(g, x, y - 10, 8.5, OL); M.circ(g, x, y - 10, 7.5, '#d8f0ff');
    if (lvl > 0) { g.save(); g.beginPath(); g.rect(x - 9, y - 3 - 15 * M.clamp(lvl, 0, 1), 18, 20); g.clip(); M.circ(g, x, y - 10, 7.5, '#8b5cff'); g.restore(); M.glow(g, x, y - 8, 18, '#8b5cff', 0.35 * lvl); }
    R(g, x - 2, y - 25, 4, 8, OL); R(g, x - 1, y - 25, 2, 8, '#d8f0ff'); R(g, x - 4, y - 14, 1, 3, '#ffffff');
  };
  P.funnel = function (g, x, y) { outlined(g, [[x - 8, y - 6], [x + 8, y - 6], [x + 2, y + 2], [x - 2, y + 2]], '#c9d6e6'); R(g, x - 1, y + 2, 2, 4, '#9aa8c0'); };
  P.bench = function (g, x, y, w) {
    w = w || 100; x = Math.round(x); y = Math.round(y);
    R(g, x + 6, y - 14, 3, 14, '#2a2430'); R(g, x + w - 9, y - 14, 3, 14, '#2a2430');
    R(g, x, y - 16, w, 4, OL); R(g, x + 1, y - 15, w - 2, 2, '#9a6a44');
    R(g, x, y - 31, w, 3, OL); R(g, x + 1, y - 30, w - 2, 1, '#9a6a44'); R(g, x, y - 25, w, 3, OL); R(g, x + 1, y - 24, w - 2, 1, '#9a6a44');
    R(g, x + 8, y - 31, 2, 16, '#2a2430'); R(g, x + w - 10, y - 31, 2, 16, '#2a2430');
  };
  P.lamp = function (g, x, y, h, on) {
    x = Math.round(x); y = Math.round(y);
    R(g, x - 1, y - h, 3, h, '#1d1a2a'); R(g, x - 3, y - 4, 7, 4, '#1d1a2a');
    R(g, x - 5, y - h - 8, 11, 3, '#1d1a2a'); R(g, x - 3, y - h - 5, 7, 5, on > 0 ? '#ffe7a0' : '#5a5a6a'); R(g, x - 1, y - h - 11, 3, 3, '#1d1a2a');
    if (on > 0) M.glow(g, x, y - h - 2, 36, '#ffd27a', 0.35 * on);
  };
  P.cart = function (g, x, y) { x = Math.round(x); y = Math.round(y); R(g, x - 18, y - 7, 36, 4, OL); R(g, x - 17, y - 6, 34, 2, '#8a5a3b'); M.circ(g, x - 11, y - 3, 3, OL); M.circ(g, x + 11, y - 3, 3, OL); R(g, x - 12, y - 4, 2, 2, '#9aa4b8'); R(g, x + 10, y - 4, 2, 2, '#9aa4b8'); };
  P.binoc = function (g, x, y) { x = Math.round(x); y = Math.round(y); R(g, x - 7, y - 3, 14, 6, OL); M.circ(g, x - 4, y, 3, '#2a2a3a'); M.circ(g, x + 4, y, 3, '#2a2a3a'); R(g, x - 5, y - 1, 1, 1, '#9fd8ff'); R(g, x + 3, y - 1, 1, 1, '#9fd8ff'); };
  P.brush = function (g, x, y, col) { M.line(g, x, y, x + 6, y - 10, '#8a6a4a', 2); R(g, x + 5, y - 15, 4, 6, OL); R(g, x + 6, y - 14, 2, 4, col); };
  P.wrench = function (g, x, y) { M.line(g, x, y, x + 9, y - 9, '#aab3c5', 2); M.ring(g, x + 10, y - 10, 3, '#aab3c5'); };
})();
