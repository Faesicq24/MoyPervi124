/* VSPYSHKA - scenes1.js: shared helpers + scenes 1-4 */
(function () {
  'use strict';
  const M = window.M, S = M.S, P = M.P, F = M.F, B = M.B, R = M.R, W = M.W, H = M.H, kf = M.kf, clamp = M.clamp, E = M.E;
  const SC = (M.SCENES = []);
  const SH = (M.SH = {});
  const C = (SH.C = (g, who, x, y, o) => S.draw(g, who, x, y, o || {}));
  const bl = (SH.bl = (t, seed, e) => { e = e || 'open'; return (e === 'open' || e === 'lookL' || e === 'lookR' || e === 'lookUp' || e === 'sad') && M.blink(t, seed) ? 'blink' : e; });
  const cur = (SH.cur = (t) => Math.floor(t * 2.4) % 2 === 0);
  const SY = B.STAGE_Y;
  const row = (n, i, c) => ({ n: n, i: i, c: c });
  const RW = (SH.RW = { opus: row('OPUS 5.5', 'clawd', '#ffb38a'), astra: row('GPT-6 ASTRA', 'codex', '#9fd8ff'), sol: row('GPT-6 SOL', 'codex', '#ffd27a'), ds: row('DEEPSEEK V4', 'whale', '#8fa6ff'), kimi: row('KIMI K3', 'moon', '#f5e6a3'), glm: row('GLM 5.3', 'glm', '#9fc4ff'), qwen: row('QWEN', 'qwen', '#c7a4ff'), gemf: row('GEMINI FLASH', 'gem', '#cfd3e6'), gem4: row('GEMINI 4', 'gem', '#ffffff') });
  const ROWS_OLD = [row('OPUS 5', 'clawd', '#ffb38a'), row('GPT-5.6 SOL', 'codex', '#9fd8ff'), RW.gemf, RW.ds, RW.kimi, RW.glm, RW.qwen];
  const ROWS_NEW = (SH.ROWS_NEW = [RW.opus, RW.astra, RW.sol, RW.gemf, RW.ds, RW.kimi, RW.glm, RW.qwen]);
  SH.rowsAt = function (lt, states, times) {
    let k = 0; for (let i = 0; i < times.length; i++) if (lt >= times[i]) k = i + 1;
    const rows = states[k].map((r) => Object.assign({}, r));
    if (k > 0 && lt - times[k - 1] < 0.45) { const u = (lt - times[k - 1]) / 0.45, prev = states[k - 1]; rows.forEach((r, i) => { if (prev[i] !== states[k][i]) { r.s = 1 - u; r.hl = '#ffffff'; } }); }
    return rows;
  };
  SH.toast = function (g, lt, t0, x, y, txt) { // achievement-like label
    const k = M.pop(lt, t0, t0 + 0.9); if (k <= 0) return;
    const w = (M.textW(txt) + 18) * k, yy = y - (lt - t0) * 6;
    R(g, x - w / 2 - 1, yy - 1, w + 2, 13, '#15122a'); R(g, x - w / 2, yy, w, 11, '#2a2238');
    if (k > 0.85) { M.icon(g, 'bolt', x - w / 2 + 3, yy + 3); M.text(g, txt, x - w / 2 + 11, yy + 2, { c: '#ffe14a' }); }
  };
  SH.clip = function (g, x0, x1, fn) { g.save(); g.beginPath(); g.rect(x0, 0, x1 - x0, H); g.clip(); fn(); g.restore(); };

  // =============== 1. PROLOGUE ===============
  function titleCard(g, t, a) {
    if (a <= 0) return;
    const str = 'ВСПЫШКА', s = 4, w = M.textW(str, s), x0 = Math.round(240 - w / 2), y0 = 38;
    const cs = ['#ff6b5a', '#ffc94a', '#5ad07a', '#5a9bff', '#ff9a5a', '#9fd8ff', '#ffc94a'];
    let x = x0;
    for (let i = 0; i < str.length; i++) {
      const lt = t - i * 0.12, gw = M.textW(str[i], s);
      if (lt > 0) {
        const yy = y0 + Math.round((1 - E.outBack(clamp(lt / 0.3, 0, 1))) * 10);
        g.globalAlpha = a * clamp(lt / 0.15, 0, 1);
        M.text(g, str[i], x + 3, yy + 3, { c: '#120a24', s: s });
        M.text(g, str[i], x, yy, { c: lt < 0.12 ? '#ffffff' : cs[i], s: s, ol: '#120a24' });
        g.globalAlpha = 1;
        if (lt < 0.3) M.glow(g, x + gw / 2, yy + 14, 34, '#ffffff', 0.7 * (1 - lt / 0.3) * a);
      }
      x += gw + s;
    }
    M.text(g, 'история одной звезды', 240, y0 + 40, { c: '#efe6ff', align: 'center', a: a * clamp((t - 1.2) / 0.6, 0, 1), ol: '#120a24' });
    if (t > 1) F.sparkles(g, t, x0, y0 - 8, w, 44, 7, 3);
  }
  SC.push({
    name: 'Пролог', dur: 11, tin: 'fade',
    draw(g, lt, cam) {
      if (lt < 2.6) {
        R(g, 0, 0, W, H, '#07070c');
        if (lt < 1.2) {
          const y = M.lerp(-12, 126, E.outBounce(clamp(lt / 0.9, 0, 1))), sq = lt > 0.9 ? clamp((lt - 0.9) / 0.3, 0, 1) : 0, w = 6 + sq * 30, h = Math.max(2, 6 - sq * 4);
          R(g, 240 - w / 2, y + 6 - h, w, h, '#ffffff');
          if (sq < 0.4 && !M.blink(lt + 0.5, 3)) { R(g, 238, y + 1, 1, 2, '#07070c'); R(g, 242, y + 1, 1, 2, '#07070c'); }
        } else {
          const str = 'TOKEN PICTURES', n = Math.ceil(str.length * clamp((lt - 1.2) / 0.45, 0, 1)), tw = M.textW(str, 2);
          M.text(g, str.slice(0, n), 240 - tw / 2, 120, { c: '#ffffff', s: 2 });
          if (lt > 1.7 && lt < 2.2) M.glow(g, M.lerp(160, 330, (lt - 1.7) / 0.5), 127, 18, '#9fd8ff', 0.8);
          M.text(g, 'представляет', 240, 142, { c: '#8a86a0', align: 'center', a: clamp((lt - 1.75) / 0.3, 0, 1) });
          M.tint(g, '#07070c', clamp((lt - 2.25) / 0.35, 0, 1));
        }
        return;
      }
      const ft = lt - 2.6, u = ft / 8.4, e = E.ioQ(clamp(u, 0, 1));
      B.voxel(g, lt, { x: 128 + Math.sin(ft * 0.35) * 8, y: M.lerp(430, 262, u), h: M.lerp(150, 104, e), a: M.lerp(0.18, -0.04, e), hz: 72 });
      C(g, 'moon', 402, 62, { eyes: 'closed' });
      for (let i = 0; i < 12; i++) { const ph = (ft * 0.1 + i / 12) % 1, x = 170 + M.rnd(i, 5) * 150 + Math.sin(ft + i) * 4, y = 200 - ph * 150, a = Math.sin(ph * Math.PI); g.globalAlpha = a * 0.9; R(g, x, y, 2, 3, '#ffcf70'); g.globalAlpha = 1; M.glow(g, x + 1, y + 1, 6, '#ffb347', 0.35 * a); }
      if (ft > 1.8) titleCard(g, ft - 1.8, clamp(1 - (ft - 7.6) / 0.9, 0, 1));
      cam.bloom = 0.3;
    },
    au(A, t0) {
      A.mel(t0 + 0.05, 160, [[72, 0.5], [76, 0.5], [79, 0.5], [84, 2]], 'bell', 0.55);
      A.sfx(t0 + 0.9, 'pop', { f: 700 }); A.sfx(t0 + 1.2, 'chime');
      [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]].forEach((ch, i) => ch.forEach((m) => A.note(t0 + 2.6 + i * 2.1, m, 2.25, 'pad', 0.8)));
      A.sfx(t0 + 3.3, 'swell', { d: 1.1 }); A.note(t0 + 4.4, 36, 0.3, 'kick', 0.8); A.note(t0 + 4.4, 49, 1.5, 'crash', 0.6);
      A.melDeg(t0 + 4.4, 100, A.bars(A.THEME_A, 1, 2), 72, false, 'bell', 0.5);
      A.melDeg(t0 + 9.2, 100, [[7, 1], [9, 1], [11, 2]], 72, false, 'bell', 0.35);
      A.sfx(t0 + 9.9, 'whoosh', { d: 1.1, f0: 2000, f1: 300, v: 0.3 });
    },
  });

  // =============== 2. FESTIVAL OF RELEASES ===============
  function qwenSpy(g, lt, t0, t1, glow) {
    if (lt < t0 || lt > t1) return;
    const y = kf(lt, [[t0, 262], [t0 + 0.6, 226, 'outBack'], [t1 - 0.4, 226], [t1, 262, 'inQ']]);
    const happy = glow > 0.3;
    const info = C(g, 'qwen', 124, y, { eyes: happy ? 'happy' : 'sly', mouth: happy ? 'evil' : 'smile', handR: 'hold', blush: 'none' });
    const hr = S.hand(info, 1), hl = S.hand(info, 0);
    P.net(g, hr[0], hr[1], -0.9);
    P.jar(g, hl[0] - 2, hl[1] + 8, glow, lt);
  }
  SC.push({
    name: 'Праздник релизов', dur: 17, tin: 'cross', tdur: 0.8,
    draw(g, lt, cam) {
      const scr = lt > 12.6 && lt < 13.4 ? 1 - (lt - 12.6) / 0.8 : 0;
      const rows = (lt < 12.6 ? ROWS_OLD : ROWS_NEW).map((r) => Object.assign({}, r, { s: scr }));
      B.festBack(g, lt, {
        rows: rows,
        moon: (g2) => C(g2, 'moon', 440, 46, { eyes: 'closed' }),
        sky: (g2) => {
          F.rocket(g2, lt - 4.8, 226, 180, 232, 58, 1.4, '#ff9a5a');
          F.burst(g2, lt - 6.2, 232, 58, { n: 110, sp: 95, cols: ['#ff9a5a', '#ffd27a', '#d97757'], seed: 3, life: 2.4 });
          F.textBurst(g2, lt - 6.35, 240, 66, 'OPUS 5.5', { s: 3, cols: ['#ff9a5a', '#ffd27a'], hold: 2.4 });
          F.rocket(g2, lt - 10.0, 250, 182, 160, 52, 1.2, '#8fb0ff');
          F.burst(g2, lt - 11.2, 160, 52, { n: 90, sp: 80, shape: 'star', cols: ['#8fb0ff', '#ffffff', '#5a7cff'], seed: 8 });
          F.textBurst(g2, lt - 11.35, 150, 62, 'GPT-6 ASTRA', { s: 2, cols: ['#9fd8ff', '#ffffff'], hold: 2.6 });
          F.rocket(g2, lt - 10.4, 292, 182, 340, 46, 1.2, '#ffd27a');
          F.burst(g2, lt - 11.6, 340, 46, { n: 96, sp: 70, shape: 'sun', cols: ['#ffd27a', '#ffb347', '#fff2c0'], seed: 12 });
          F.textBurst(g2, lt - 11.75, 340, 54, 'SOL', { s: 3, cols: ['#ffd27a', '#fff2c0'], hold: 2.4 });
        },
      });
      // sparks drifting down into Qwen's net
      for (let i = 0; i < 9; i++) { const tt = lt - 6.8 - i * 0.25; if (tt < 0 || tt > 1.4) continue; const u = tt / 1.4; R(g, M.lerp(210 + i * 6, 146, u) + Math.sin(tt * 6 + i) * 4, M.lerp(80, 172, E.inQ(u)), 2, 2, i % 2 ? '#ffd27a' : '#ff9a5a'); }
      qwenSpy(g, lt, 3.0, 12.6, kf(lt, [[7.2, 0], [9.6, 1]]));
      B.fountainFront(g, lt);
      if (lt < 4.8) P.rocket(g, 226, SY, '#ff9a5a');
      if (lt < 10.0) P.rocket(g, 250, SY, '#8fb0ff');
      if (lt < 10.4) P.rocket(g, 292, SY, '#ffd27a');
      // Claude
      const cx = kf(lt, [[0, 132], [2, 132], [4, 200, 'lin'], [8, 200], [9, 182, 'lin']]), walking = (lt > 2 && lt < 4) || (lt > 8 && lt < 9);
      let ce = bl(lt, 1), cm = 'smile', ca = 'n', cyo = 0;
      if (lt > 4.3 && lt < 4.8) { ce = 'lookR'; ca = undefined; }
      else if (lt >= 4.8 && lt < 6.2) ce = 'lookUp';
      else if (lt >= 6.2 && lt < 8) { ce = 'happy'; cm = 'grin'; ca = 'up'; cyo = M.hop(lt, 0.3, 5); }
      else if (lt >= 11.3 && lt < 13.5) { ce = 'happy'; cm = 'grin'; ca = Math.floor(lt / 0.15) % 2 ? 'up' : 'n'; }
      else if (lt >= 14) ce = bl(lt, 1, 'lookR');
      SH.clip(g, 158, W, () => C(g, 'clawd', cx, SY + cyo + (walking && Math.floor(lt * 8) % 2 ? -1 : 0), { eyes: ce, mouth: cm, arms: ca, armR: lt > 4.3 && lt < 4.8 ? 'hold' : undefined, legs: walking ? M.walk(lt, 8) : 'stand' }));
      if (lt > 4.3 && lt < 4.8) F.sparkle(g, 226, SY - 2, 2, '#ffd27a');
      // Codex
      if (lt > 8) {
        const xx = kf(lt, [[8, 338], [9.4, 268, 'lin']]), wk = lt < 9.4;
        let face = 'prompt', hands = 'n', yo = 0;
        if (lt > 9.4 && lt < 9.5) face = 'happy';
        else if (lt >= 9.5 && lt < 10.2) hands = 'type';
        else if (lt >= 10.2 && lt < 11.2) face = 'wow';
        else if (lt >= 11.2 && lt < 14) { face = lt < 12.6 ? 'grin' : 'love'; hands = Math.floor(lt / 0.2) % 2 ? 'up' : 'wave'; yo = M.hop(lt, 0.35, 4); }
        else if (lt >= 14) face = 'dots';
        let info = null;
        SH.clip(g, 0, 322, () => { info = C(g, 'codex', xx, SY + yo, { face: face, cursor: cur(lt), hands: hands, feet: wk ? M.walk(lt, 8) : 'stand' }); });
        const top = S.feat(info, 'top');
        M.say(g, lt, 9.5, 10.6, top[0], top[1] - 2, '>_ RUN', { fill: '#121838', c: '#9fd8ff', ol: '#0d1444' });
      }
      // Gemini arrives with the covered rocket
      if (lt > 14) {
        const gx = kf(lt, [[14, 352], [17, 316, 'lin']]);
        SH.clip(g, 0, 322, () => {
          P.cart(g, gx - 38, SY); P.tarp(g, gx - 38, SY - 7, 0, '3.5 PRO');
          C(g, 'gemini', gx, SY + M.hop(lt, 0.4, 3), { eyes: bl(lt, 3, 'lookL'), mouth: 'flat', blush: 'strong' });
        });
        F.sweat(g, lt, gx + 16, SY - 48);
      }
      B.curtains(g, lt);
      const mood = (lt > 6.3 && lt < 8.5) || (lt > 11.3 && lt < 14) ? 'cheer' : 'idle';
      B.sideCrowd(g, lt, mood); B.crowd(g, lt, mood);
      cam.bloom = 0.35;
    },
    au(A, t0) {
      const bpm = 120;
      A.drums(t0, bpm, 1, { h: 'x.x.x.x.x.x.x.x.' }, 0.5); A.bass(t0, bpm, [0], 4, 48, false, 0.6, true);
      A.melDeg(t0 + 2, bpm, A.THEME_B, 72, false, 'lead', 0.55); A.chords(t0 + 2, bpm, [0, 3, 4, 0], 4, 60, false, 'pad', 0.5);
      A.bass(t0 + 2, bpm, [0, 3, 4, 0], 4, 48, false, 0.7, true); A.drums(t0 + 2, bpm, 4, { k: 'x.......x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, 0.6);
      A.melDeg(t0 + 10, bpm, A.bars(A.THEME_B, 1, 2), 72, false, 'lead', 0.55); A.chords(t0 + 10, bpm, [0, 3], 4, 60, false, 'pad', 0.5);
      A.bass(t0 + 10, bpm, [0, 3], 4, 48, false, 0.7, true); A.drums(t0 + 10, bpm, 2, { k: 'x.......x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, 0.6);
      A.melDeg(t0 + 14.1, 96, A.bars(A.THEME_A, 1, 1), 72, false, 'pluck', 0.45);
      for (let t = 2; t < 4; t += 0.25) A.sfx(t0 + t, 'step', { f: 320, v: 0.6 });
      A.sfx(t0 + 4.3, 'match'); A.sfx(t0 + 4.8, 'whoosh', { d: 1.4, f0: 400, f1: 3500, v: 0.45 }); A.sfx(t0 + 6.2, 'boom', { v: 0.8 }); A.sfx(t0 + 6.4, 'sparkle'); A.sfx(t0 + 6.4, 'cheer', { d: 2 }); A.voice(t0 + 6.5, 'clawd', 4, { up: 1 });
      A.sfx(t0 + 7.3, 'sparkle', { v: 0.4 }); for (let t = 8; t < 9.4; t += 0.2) A.sfx(t0 + t, 'step', { f: 420, v: 0.5 });
      A.sfx(t0 + 9.5, 'type', { d: 0.6 }); A.voice(t0 + 9.6, 'codex', 3); A.sfx(t0 + 10, 'whoosh', { d: 1.2, f0: 400, f1: 3500, v: 0.4 }); A.sfx(t0 + 10.4, 'whoosh', { d: 1.2, f0: 400, f1: 3500, v: 0.4 });
      A.sfx(t0 + 11.2, 'boom', { v: 0.7 }); A.sfx(t0 + 11.6, 'boom', { v: 0.7 }); A.sfx(t0 + 11.4, 'cheer', { d: 2.4 }); A.sfx(t0 + 12.6, 'flap', { d: 0.8 }); A.sfx(t0 + 12.3, 'swish', { v: 0.4 });
      for (let t = 14.5; t < 17; t += 1) A.sfx(t0 + t, 'squeak');
    },
  });

  // =============== 3. COMING SOON ===============
  function gemFail(lt) {
    let e = bl(lt, 3, 'lookL'), m = 'flat', b = 'strong';
    if (lt > 2.5 && lt < 5.3) { e = bl(lt, 3, 'open'); m = 'smile'; b = undefined; }
    else if (lt >= 5.3 && lt < 6.0) { e = 'wide'; m = 'o'; }
    else if (lt >= 6.0 && lt < 8.2) { e = 'wide'; m = 'wobble'; }
    else if (lt >= 8.2 && lt < 11.3) { e = 'happy'; m = 'grin'; }
    else if (lt >= 11.3) { e = 'sad'; m = 'frown'; }
    return { e: e, m: m, b: b };
  }
  SC.push({
    name: 'Coming soon', dur: 15, tin: 'cut',
    draw(g, lt, cam) {
      const z = kf(lt, [[0, 1.7], [11.3, 1.7], [12.5, 1.0]]), c = kf(lt, [[0, [262, 150]], [11.3, [262, 150]], [12.5, [240, 135]]]);
      cam.zoom = z; cam.cx = c[0]; cam.cy = c[1]; cam.bloom = 0.25;
      B.festBack(g, lt, { rows: ROWS_NEW, moon: (g2) => C(g2, 'moon', 440, 46, lt > 12.6 ? { eyes: 'sly', mouth: 'smirk' } : { eyes: 'closed' }) });
      // whale rises from the fountain
      if (lt > 11.3) {
        const wy = kf(lt, [[11.4, 262], [12.2, 222, 'outBack']]), laugh = lt > 12.4, jig = laugh ? Math.round(Math.sin(lt * 20)) : 0;
        const info = C(g, 'whale', 85, wy + jig, { eyes: laugh ? 'happy' : 'open', mouth: laugh ? 'laugh' : 'smile' });
        const tp = S.feat(info, 'top'); M.say(g, lt, 12.5, 14.6, tp[0], tp[1], 'ХА-ХА!', { dx: 10 });
      }
      if (lt > 11.2 && lt < 12.3) for (let i = 0; i < 5; i++) M.ring(g, 70 + i * 8, 211 - ((lt * 20 + i * 3) % 6), 1.5, '#bfe0ff');
      B.fountainFront(g, lt);
      const rx = kf(lt, [[0, 278], [2.5, 258]]), puff = kf(lt, [[5.3, 0], [5.45, 1], [5.8, 0]]);
      P.cart(g, rx, SY);
      if (lt > 5.8) { const u = lt - 5.8, lift = E.outBack(clamp(u / 0.3, 0, 1)); P.soonSign(g, rx + Math.sin(u * 14) * 3 * Math.exp(-u * 2), SY - 66, lift); }
      P.tarp(g, rx, SY - 7, puff, '3.5 PRO');
      if (lt > 3.3 && lt < 5.3) F.fuse(g, lt, 284, SY - 1, rx + 10, SY - 6, (lt - 3.3) / 2);
      if (lt > 5.3) F.smoke(g, lt - 5.3, rx, SY - 20, { n: 5, col: '#7a7a8a', life: 1.6 });
      // Claude and Codex watch
      const flashT = [8.7, 9.6, 10.5], nearFlash = flashT.some((f) => lt > f - 0.05 && lt < f + 0.35);
      C(g, 'clawd', 180, SY, { eyes: nearFlash ? 'blink' : lt > 12.5 ? 'sad' : bl(lt, 1, 'lookR'), mouth: lt > 12.5 ? 'frown' : lt > 5.3 && lt < 8 ? 'o' : 'smile' });
      C(g, 'codex', 226, SY, { face: nearFlash ? 'squint' : lt > 5.3 && lt < 8 ? 'wow' : 'dots', cursor: cur(lt) });
      // Gemini
      const gx = kf(lt, [[0, 316], [2.5, 298], [9.55, 298], [9.65, 322], [10.45, 322], [10.55, 292]]), st = gemFail(lt);
      const info = C(g, 'gemini', gx, SY + (lt < 2.5 ? M.hop(lt, 0.4, 3) : 0), { eyes: st.e, mouth: st.m, blush: st.b, handL: lt > 2.5 && lt < 3.4 ? 'mid' : undefined, handR: lt > 8.2 && lt < 11.3 ? 'mid' : undefined });
      if (lt < 2.5 || (lt > 8.2 && lt < 11.3)) F.sweat(g, lt, gx + 16, SY - 48);
      if (lt > 2.5 && lt < 3.3) { const hl = S.hand(info, 0); F.sparkle(g, hl[0], hl[1] - 3, 2, '#ffd27a'); }
      if (lt > 8.2 && lt < 11.3) { const hr = S.hand(info, 1); P.camera(g, hr[0] + 4, hr[1] - 2, nearFlash); flashT.forEach((f) => F.camFlash(g, lt - f, hr[0] + 6, hr[1] - 8)); }
      if ((lt > 9.55 && lt < 9.7) || (lt > 10.45 && lt < 10.6)) F.speed(g, lt, gx - 40, SY - 50, 80, 50, 8, 5, '#ffffff', lt < 10 ? 1 : -1);
      SH.toast(g, lt, 8.7, 300, 104, '3.5 FLASH-LITE'); SH.toast(g, lt, 9.6, 320, 104, '3.6 FLASH'); SH.toast(g, lt, 10.5, 292, 104, '3.8 FLASH');
      cam.flash = Math.max(0, ...flashT.map((f) => (lt > f && lt < f + 0.3 ? (1 - (lt - f) / 0.3) * 0.65 : 0)));
      // cricket on the stage edge
      if (lt > 6.4 && lt < 8.4) { const hop = Math.floor(lt * 6) % 2; R(g, 205, SY - 3 - hop, 6, 3, '#15122a'); R(g, 206, SY - 3 - hop, 4, 2, '#5ad07a'); R(g, 209, SY - 6 - hop, 1, 3, '#15122a'); M.say(g, lt, 6.6, 8.2, 208, SY - 8 - hop, 'СРИ-СРИ', { dx: -10 }); }
      B.curtains(g, lt);
      B.sideCrowd(g, lt, lt > 13.2 ? 'laugh' : 'idle');
      M.say(g, lt, 0.3, 2.0, 146, 212, 'quest'); M.say(g, lt, 0.6, 2.2, 352, 214, 'quest');
      if (lt > 10.6 && lt < 12.5) M.say(g, lt, 10.8, 12.4, 462, 218, 'ZZZ');
      B.crowd(g, lt, lt > 13.2 ? 'laugh' : 'idle');
    },
    au(A, t0) {
      A.sfx(t0 + 0.2, 'crowd', { d: 2.3 }); A.sfx(t0 + 0.4, 'squeak'); A.sfx(t0 + 1.4, 'squeak'); A.sfx(t0 + 2.5, 'match'); A.sfx(t0 + 3.3, 'fuse', { d: 2 });
      for (let i = 0; i < 16; i++) A.note(t0 + 3.3 + 2 * (1 - Math.pow(1 - i / 16, 1.6)), 38, 0.08, 'snare', 0.25 + i * 0.02);
      A.sfx(t0 + 5.3, 'fizzle'); A.sfx(t0 + 5.8, 'boing'); A.mel(t0 + 6.1, 90, [[55, 0.75], [54, 0.75], [53, 0.75], [52, 2.2]], 'bone', 0.7);
      A.sfx(t0 + 6.7, 'cricket'); A.sfx(t0 + 7.5, 'cricket');
      A.sfx(t0 + 8.2, 'pop', { f: 500 }); [8.45, 9.35, 10.25].forEach((t, i) => { A.sfx(t0 + t, 'flash'); A.note(t0 + t + 0.3, 84 - i * 3, 0.15, 'bell', 0.35); });
      A.sfx(t0 + 9.6, 'zip'); A.sfx(t0 + 10.5, 'zip'); A.sfx(t0 + 11.3, 'bubbles', { d: 1 }); A.sfx(t0 + 12.0, 'splash', { v: 0.7 });
      A.sfx(t0 + 12.4, 'laugh', { who: 'whale', n: 6 }); A.sfx(t0 + 13.0, 'laugh', { who: 'moon', n: 5 }); A.sfx(t0 + 13.3, 'laugh', { who: 'crowd', n: 7, v: 0.6 }); A.sfx(t0 + 13.6, 'laugh', { who: 'crowd', n: 6, pitch: 1.3, v: 0.5 });
    },
  });

  // =============== 4. MOCKERY + SCOREBOARD ===============
  const S4 = [
    [RW.opus, RW.astra, RW.sol, RW.gemf, RW.ds, RW.kimi, RW.glm, RW.qwen], [RW.opus, RW.astra, RW.sol, RW.ds, RW.gemf, RW.kimi, RW.glm, RW.qwen],
    [RW.opus, RW.astra, RW.sol, RW.ds, RW.kimi, RW.gemf, RW.glm, RW.qwen], [RW.opus, RW.astra, RW.sol, RW.ds, RW.kimi, RW.glm, RW.gemf, RW.qwen],
    [RW.opus, RW.astra, RW.sol, RW.ds, RW.kimi, RW.glm, RW.qwen, RW.gemf],
  ];
  const S4T = [5.2, 6.1, 7.0, 7.9];
  SC.push({
    name: 'Табло', dur: 12, tin: 'cut', irisOut: [240, 135],
    draw(g, lt, cam) {
      if (lt >= 4.5 && lt < 10.5) { // scoreboard close-up
        R(g, 0, 0, W, H, '#07060e');
        R(g, 88, 14, 304, 244, '#15122a'); R(g, 91, 17, 298, 238, '#2a2238'); R(g, 97, 50, 286, 200, '#0c0a14');
        M.text(g, 'АРЕНА', 240, 24, { c: '#ffd27a', s: 3, align: 'center' });
        for (let i = 0; i < 36; i++) R(g, 94 + i * 8, 18, 3, 3, Math.sin(lt * 5 + i) > 0 ? '#ffe7a0' : '#6a5a3a');
        const rows = SH.rowsAt(lt, S4, S4T);
        if (lt > 8.4) rows.forEach((r) => { if (r.n === RW.gemf.n) { r.hl = '#ea4335'; r.c = Math.floor(lt * 4) % 2 ? '#ff8a8a' : '#cfd3e6'; } });
        B.boardRows(g, lt, 104, 58, rows, 2, 24);
        M.vignette(g, 0.5); return;
      }
      const partC = lt >= 10.5;
      cam.zoom = partC ? 2.2 : 1.15; cam.cx = partC ? 296 : 220; cam.cy = partC ? 150 : 150; cam.bloom = 0.2;
      const laugh = !partC && lt > 1.8;
      B.festBack(g, lt, { rows: ROWS_NEW, moon: (g2) => { const j = laugh ? Math.round(Math.sin(lt * 25)) : 0; C(g2, 'moon', 440 + j, 46, laugh ? { eyes: 'happy', mouth: 'laugh' } : { eyes: 'sly', mouth: 'smirk' }); } });
      const winfo = C(g, 'whale', 85, 222 + (laugh ? Math.round(Math.sin(lt * 20)) : 0), { eyes: lt > 1.6 ? 'happy' : 'sly', mouth: lt > 1.6 ? 'laugh' : 'smile' });
      const hole = S.feat(winfo, 'hole');
      B.fountainFront(g, lt);
      P.cart(g, 258, SY); P.tarp(g, 258, SY - 7, 0, '3.5 PRO'); P.soonSign(g, 258, SY - 66, 1);
      C(g, 'clawd', 180, SY, { eyes: partC ? 'sad' : bl(lt, 1, 'sad'), mouth: 'frown' });
      C(g, 'codex', 226, SY, { face: 'dots', cursor: cur(lt) });
      let gx = 296, ge = lt < 1.6 ? bl(lt, 3) : lt < 1.9 ? 'blink' : 'sad', gm = lt < 1.6 ? 'flat' : 'wobble', gh;
      if (partC) { ge = lt > 11.2 ? 'angry' : 'sad'; gm = lt > 11.2 ? 'flat' : 'frown'; gh = lt > 11.4 ? 'up' : 'low'; gx = kf(lt, [[11.6, 296], [11.95, 440, 'inQ']]); }
      const gi = C(g, 'gemini', gx, SY, { eyes: ge, mouth: gm, hands: gh, desat: kf(lt, [[1.6, 0], [2.4, 0.45]]) });
      if (lt > 1.6 && !partC) for (let i = 0; i < 3; i++) F.tears(g, lt + i * 0.3, gx - 14 + i * 14, SY - 30 + (i % 2) * 8, { per: 0.7, seed: i + 4 });
      if (partC) { const tp = S.feat(gi, 'top'); M.say(g, lt, 11.2, 11.8, tp[0], tp[1], 'excl'); if (lt > 11.6) F.speed(g, lt, 200, 110, 200, 80, 14, 3, '#ffffff', 1); }
      F.spout(g, lt - 0.3, hole[0], hole[1], 296, 140, 1.3, { peak: 70 });
      F.drops(g, lt - 1.6, 296, 140, { n: 26, sp: 80 });
      const tp2 = S.feat(winfo, 'top'); M.say(g, lt, 1.8, 3.4, tp2[0], tp2[1], 'ХА!', { dx: 8 });
      M.say(g, lt, 2.2, 4.0, 432, 58, 'ХИ-ХИ', { dx: -14 });
      B.curtains(g, lt);
      B.sideCrowd(g, lt, laugh ? 'laugh' : 'idle'); B.crowd(g, lt, laugh ? 'laugh' : 'idle');
    },
    au(A, t0) {
      A.sfx(t0 + 0.3, 'spout', { d: 1.3 }); A.sfx(t0 + 1.6, 'splash'); A.sfx(t0 + 1.8, 'laugh', { who: 'whale', n: 5 }); A.sfx(t0 + 2.2, 'laugh', { who: 'moon', n: 6 }); A.sfx(t0 + 2.6, 'laugh', { who: 'crowd', n: 8, v: 0.5 });
      A.mel(t0 + 1.9, 130, [[67, 0.5], [64, 0.5], [69, 0.5], [67, 0.5], [64, 1], [null, 1], [67, 0.5], [64, 0.5], [69, 0.5], [67, 0.5], [64, 1]], 'pluck', 0.6);
      A.sfx(t0 + 4.5, 'swish');
      [5.2, 6.1, 7.0, 7.9].forEach((t, i) => { A.sfx(t0 + t, 'flap', { d: 0.45 }); A.note(t0 + t + 0.3, [64, 62, 60, 57][i], 0.6, 'piano', 0.6); });
      A.note(t0 + 8.6, 45, 0.9, 'bone', 0.5); A.note(t0 + 8.6, 40, 0.9, 'bone', 0.4);
      A.sfx(t0 + 11.2, 'pop', { f: 1200 }); A.voice(t0 + 11.25, 'gemini', 2, { up: 1 }); A.sfx(t0 + 11.6, 'zip'); A.sfx(t0 + 11.65, 'whoosh', { d: 0.4, f0: 800, f1: 3000, v: 0.4 });
    },
  });
})();
