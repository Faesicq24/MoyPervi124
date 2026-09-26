/* VSPYSHKA - scenes3.js: scenes 9-12 */
(function () {
  'use strict';
  const M = window.M, S = M.S, P = M.P, F = M.F, B = M.B, R = M.R, W = M.W, H = M.H, kf = M.kf, clamp = M.clamp, E = M.E, SH = M.SH, C = SH.C, bl = SH.bl, cur = SH.cur, SC = M.SCENES, RW = SH.RW, SY = B.STAGE_Y;

  // =============== 9. LAUNCH ===============
  const ROWS_FINAL = [Object.assign({}, RW.gem4, { hl: '#4285f4' }), RW.opus, RW.astra, RW.sol, RW.ds, RW.kimi, RW.glm, RW.qwen];
  SC.push({
    name: 'Запуск', dur: 20, tin: 'dither',
    draw(g, lt, cam) {
      if (lt >= 6 && lt < 15.5) { // ascent + burst in space
        const k = kf(lt, [[6, 0], [10, 1]]), camY = kf(lt, [[6, 0], [11.4, 5200, 'inQ']]), speed = kf(lt, [[6, 200], [9, 2600], [11.4, 3000], [12, 0]]);
        B.ascent(g, lt, { k: k, camY: camY, speed: speed });
        if (lt < 12) {
          const up = kf(lt, [[11.4, 0], [12, 1, 'inQ']]), ry = M.lerp(175, 40, up), sh = lt < 11.4 ? Math.round(Math.sin(lt * 60)) : 0;
          for (let i = 0; i < 10; i++) { const tt = (lt * 3 + i / 10) % 1; g.globalAlpha = 1 - tt; M.circ(g, 240 + (M.rnd(i, 3) - 0.5) * 10 * tt, ry + 10 + tt * 80, 3 + tt * 8, '#8a86a0'); } g.globalAlpha = 1;
          const fl = 10 + Math.abs(Math.sin(lt * 30)) * 10;
          M.poly(g, [[233, ry], [247, ry], [240, ry + fl + 8]], '#ff9a3c'); M.poly(g, [[236, ry], [244, ry], [240, ry + fl]], '#fff2a0'); M.glow(g, 240, ry + 6, 30, '#ffb347', 0.6);
          P.bigRocket(g, 240 + sh, ry, { four: true });
          if (lt > 11.6) M.glow(g, 240, ry - 25, 40 * (lt - 11.6) * 3, '#ffffff', 0.9);
        } else {
          F.gem3D(g, lt - 12, 240, 118);
          if (lt < 12.5) cam.flash = 0.9 * (1 - (lt - 12) / 0.5);
        }
        cam.bloom = 0.45; cam.shake = lt < 11.4 ? 1 : lt > 12 && lt < 12.4 ? 3 : 0;
        return;
      }
      const after = lt >= 15.5;
      const scr = after && lt < 16.8 && lt > 16.0 ? 1 - (lt - 16.0) / 0.8 : 0;
      const rows = (after && lt >= 16.0 ? ROWS_FINAL : SH.ROWS_NEW.slice(0, 3).concat([RW.ds, RW.kimi, RW.glm, RW.qwen, RW.gemf])).map((r) => Object.assign({}, r, { s: scr }));
      cam.zoom = after ? kf(lt, [[16.8, 1], [19.5, 1.45]]) : 1; cam.cx = after ? kf(lt, [[16.8, 240], [19.5, 280]]) : 240; cam.cy = after ? kf(lt, [[16.8, 135], [19.5, 150]]) : 135;
      B.festBack(g, lt, { rows: rows, moon: (g2) => C(g2, 'moon', 440, 46, after ? { eyes: 'wide', mouth: 'o' } : { eyes: 'sly', mouth: 'smirk' }), sky: (g2) => { if (after) { F.gemStatic(g2, lt, 240, 66 + (lt - 15.5) * 2, 0.5, clamp(1 - (lt - 18) / 2, 0, 1)); F.sparkles(g2, lt, 170, 20, 140, 90, 8, 5); } } });
      const wi = C(g, 'whale', 85, 222, after ? { eyes: 'wide', mouth: 'o' } : { eyes: 'sly', mouth: 'smile' });
      const wt = S.feat(wi, 'top'); M.say(g, lt, 1.2, 2.6, wt[0], wt[1], 'ОПЯТЬ?', { dx: 12 });
      B.fountainFront(g, lt);
      // rocket + fuse
      const gx = kf(lt, [[0, 352], [2, 280, 'lin']]), rx = gx - 40;
      if (!after) {
        const lift = kf(lt, [[5.7, 0], [6, 30, 'inQ']]);
        P.cart(g, rx, SY); P.bigRocket(g, rx, SY - 7 - lift, { four: true });
        if (lt > 5.7) { F.smoke(g, lt - 5.7, rx, SY - 6, { n: 10, col: '#a0a0b8', life: 1, r: 5, sp: 30 }); M.glow(g, rx, SY - 8, 40, '#ffb347', 0.8); }
        if (lt > 3.6 && lt < 5.7) { const u = kf(lt, [[3.6, 0], [5.0, 0.8, 'lin'], [5.6, 0.85, 'lin'], [5.7, 1]]), dim = lt > 5.0 && lt < 5.55 ? 0.15 + 0.1 * Math.sin(lt * 40) : lt >= 5.55 ? 1.6 : 1; F.fuse(g, lt, gx - 10, SY - 1, rx + 10, SY - 6, u, dim); }
      }
      // friends
      const lean = lt > 4.9 && lt < 5.7, hug = after && lt > 17.2;
      const cx = hug ? kf(lt, [[17.2, 192], [17.6, 258]]) : lean ? kf(lt, [[4.9, 192], [5.2, 238]]) : kf(lt, [[5.7, 238], [6, 192]]);
      const ci = C(g, 'clawd', cx, SY + (after && !hug ? M.hop(lt, 0.3, 5) : 0), { eyes: lean ? 'closed' : after ? 'happy' : lt > 2 && lt < 3 ? 'happy' : bl(lt, 1), mouth: lean ? 'blow' : after ? 'grin' : 'smile', arms: after || (lt > 2 && lt < 2.6) ? 'up' : 'n' });
      const kx = hug ? kf(lt, [[17.2, 322], [17.6, 312]]) : lean ? kf(lt, [[4.9, 320], [5.2, 296]]) : kf(lt, [[5.7, 296], [6, 320]]);
      C(g, 'codex', kx, SY + (after && !hug ? M.hop(lt + 0.2, 0.3, 5) : 0), { face: lean ? 'dots' : after ? 'love' : lt > 2 && lt < 3 ? 'happy' : 'prompt', cursor: cur(lt), hands: hug ? 'hug' : after ? 'up' : lt > 2 && lt < 2.6 ? 'wave' : 'n' });
      if (lean && lt > 5.3) for (let i = 0; i < 3; i++) { M.line(g, cx + 14, SY - 22 + i * 3, cx + 22 + ((lt * 60) % 8), SY - 16 + i * 3, '#e6f2ff'); M.line(g, kx - 18, SY - 22 + i * 3, kx - 26 - ((lt * 60) % 8), SY - 16 + i * 3, '#e6f2ff'); }
      // Gemini
      let ge = bl(lt, 3), gm = 'smile', gh = 'n';
      if (lt > 2 && lt < 3) ge = 'lookL';
      if (lt > 3 && lt < 3.6) gh = 'mid';
      if (lt > 4.9 && lt < 5.7) { ge = 'wide'; gm = 'o'; }
      if (after) { ge = 'happy'; gm = 'grin'; gh = hug ? 'hug' : 'up'; }
      const gi = C(g, 'gemini', hug ? 286 : gx, SY + (lt < 2 ? M.hop(lt, 0.4, 3) : after && !hug ? M.hop(lt + 0.1, 0.3, 6) : 0), { eyes: ge, mouth: gm, hands: gh });
      if (lt > 3 && lt < 3.6) { const hl = S.hand(gi, 0); F.sparkle(g, hl[0], hl[1] - 3, 2, '#ffd27a'); }
      if (hug) { F.hearts(g, lt - 17.6, 286, 130, { n: 7, life: 2.4 }); for (let i = 0; i < 2; i++) { const ep = S.feat(gi, 'eyes', i); F.tears(g, lt + i * 0.3, ep[0], ep[1], { per: 0.9, seed: i + 7 }); } }
      void ci;
      B.curtains(g, lt);
      const mood = after ? 'cheer' : 'idle';
      B.sideCrowd(g, lt, mood); if (!after) { M.say(g, lt, 0.4, 1.8, 146, 212, 'quest'); M.say(g, lt, 0.7, 2.0, 352, 214, 'quest'); }
      B.crowd(g, lt, mood);
      if (after) F.confetti(g, lt - 15.6, { n: 110, life: 4.4 });
      if (after && lt < 15.9) cam.flash = 0.7 * (1 - (lt - 15.5) / 0.4);
      cam.bloom = after ? 0.35 : 0.25; if (lt > 5.7 && lt < 6) cam.shake = 2;
    },
    au(A, t0) {
      A.sfx(t0 + 0.2, 'crowd', { d: 2.4 }); A.sfx(t0 + 0.5, 'squeak'); A.sfx(t0 + 1.5, 'squeak'); A.sfx(t0 + 1.2, 'laugh', { who: 'whale', n: 3, v: 0.6 });
      A.voice(t0 + 2.2, 'clawd', 3, { up: 1 }); A.voice(t0 + 2.4, 'codex', 3, { up: 1 });
      A.chords(t0 + 0.5, 70, [5], 6, 57, true, 'pad', 0.5); [3.0, 3.7, 4.4].forEach((t) => A.sfx(t0 + t, 'heart'));
      A.sfx(t0 + 3.0, 'match'); A.sfx(t0 + 3.6, 'fuse', { d: 1.4 }); A.sfx(t0 + 5.25, 'blow', { d: 0.4 }); A.sfx(t0 + 5.55, 'swell', { d: 0.2 });
      A.sfx(t0 + 5.7, 'launch', { d: 3.2 }); A.sfx(t0 + 5.7, 'boom', { v: 0.5 }); A.note(t0 + 6, 49, 1.5, 'crash', 0.7);
      const bpm = 116, ts = t0 + 6;
      A.melDeg(ts, bpm, A.bars(A.THEME_A, 1, 6), 74, false, 'saw', 0.6); A.melDeg(ts, bpm, A.bars(A.THEME_A, 1, 6).map((n) => [n[0] - 2, n[1]]), 74, false, 'lead', 0.35);
      A.chords(ts, bpm, [0, 5, 3, 4, 2, 5], 4, 62, false, 'pad', 0.6); A.bass(ts, bpm, [0, 5, 3, 4, 2, 5], 4, 50, false, 0.7, true);
      A.drums(ts, bpm, 6, { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, 0.6);
      A.chords(t0 + 18.4, 116, [0], 3, 62, false, 'pad', 0.7); A.note(t0 + 18.4, 49, 1.5, 'crash', 0.5);
      A.sfx(t0 + 11.6, 'swell', { d: 0.4 }); A.sfx(t0 + 12, 'boom', { v: 1 }); A.sfx(t0 + 12.1, 'sparkle'); A.sfx(t0 + 13.2, 'shimmer', { d: 1.4 });
      A.sfx(t0 + 15.5, 'cheer', { d: 3.6, v: 0.7 }); A.sfx(t0 + 16.0, 'flap', { d: 0.8 }); [17.6, 17.9, 18.2].forEach((t) => A.sfx(t0 + t, 'pop', { f: 900 }));
      A.voice(t0 + 17.4, 'clawd', 4, { up: 1 }); A.voice(t0 + 17.5, 'gemini', 4, { up: 1 }); A.voice(t0 + 17.6, 'codex', 4, { up: 1 });
    },
  });

  // =============== 10. TOGETHER ===============
  SC.push({
    name: 'Вместе', dur: 13, tin: 'dither',
    draw(g, lt, cam) {
      const camX = kf(lt, [[0, 0], [5.0, 190, 'lin'], [5.4, 200, 'outQ'], [9.2, 200], [13, 340, 'inQ']]), walking = lt < 5.2 || lt > 9.6;
      const moonHide = kf(lt, [[8.2, 0], [9.0, 1]]);
      B.park(g, lt, camX, {
        sky: (g2) => { C(g2, 'moon', 400, 52, { eyes: lt > 8 ? 'wide' : 'sly', mouth: lt > 8 ? 'o' : 'smirk', desat: 0.3, alpha: 0.75 }); if (moonHide > 0) B.cloud(g2, M.lerp(470, 392, moonHide), 36, 1.5); },
        mid: (g2) => { const tx = 330 - camX; if (lt > 1.8 && lt < 4.4) { const peek = kf(lt, [[1.8, 0], [2.2, 14, 'outQ'], [3.9, 14], [4.3, 0, 'inQ']]); const qi = S.draw(g2, 'qwen', tx + 22 + peek - 14, 198, { eyes: 'sly', mouth: 'evil', handL: 'hold' }); const hl = S.hand(qi, 0); P.flask(g2, hl[0], hl[1] + 6, 0.5); } g2.drawImage(B.tree(), Math.round(tx), 142, 40, 56); },
      });
      const pondX = 575 - camX;
      M.ell(g, pondX, 258, 60, 13, '#15122a'); M.ell(g, pondX, 257, 58, 11, '#3a78c8'); M.ell(g, pondX - 10, 255, 30, 4, '#7fb0ff');
      if (lt > 5.2 && lt < 9.6) {
        const wy = kf(lt, [[5.2, 300], [6.0, 262, 'outBack'], [8.4, 262], [9.4, 300, 'inQ']]), dz = lt > 7.9;
        g.save(); g.beginPath(); g.rect(0, 0, W, 256); g.clip();
        const wi = C(g, 'whale', pondX, wy + (dz ? Math.round(Math.sin(lt * 18) * 2) : 0), { eyes: dz ? 'spiral' : 'sly', mouth: dz ? 'o' : 'smile', flip: true });
        g.restore();
        const hole = S.feat(wi, 'hole'), wt = S.feat(wi, 'top');
        M.say(g, lt, 5.7, 6.5, wt[0], wt[1], 'ХЕ-ХЕ', { dx: 10 }); M.say(g, lt, 8.5, 9.2, wt[0], wt[1], 'БУЛЬ!');
        F.spout(g, lt - 6.2, hole[0], hole[1], 238, 176, 0.7, { peak: 40 });
        if (lt > 8.4) for (let i = 0; i < 4; i++) M.ring(g, pondX - 10 + i * 7, 250 - ((lt * 30 + i * 5) % 12), 1.5, '#e0f4ff');
      }
      F.drops(g, lt - 6.9, 238, 172, { n: 24, sp: 70 });
      // trio
      const hi = lt > 9.7 && lt < 10.3, laugh = lt > 9.2;
      const cx = kf(lt, [[6.2, 170], [6.5, 212, 'outQ'], [9.3, 212], [9.6, 170]]), umbK = kf(lt, [[6.4, 0], [6.7, 1, 'outBack'], [9.3, 1], [9.6, 0]]);
      const ci = C(g, 'clawd', cx, 226 + (walking && Math.floor(lt * 8) % 2 ? -1 : 0), { eyes: laugh ? 'happy' : lt > 6.2 && lt < 7.4 ? 'angry' : bl(lt, 1, 'lookR'), mouth: laugh ? 'grin' : 'smile', armR: umbK > 0.05 || hi ? 'up' : 'n', legs: walking ? M.walk(lt, 7) : 'stand' });
      if (umbK > 0.05) { const h = S.hand(ci, 1); P.umbrella(g, h[0], h[1] + 6, umbK); }
      const gx = kf(lt, [[7.4, 238], [7.7, 262, 'outQ'], [9.2, 262], [9.6, 238]]), flashing = lt > 7.6 && lt < 8.4;
      const gi = C(g, 'gemini', gx, 226 + (walking ? M.hop(lt, 0.3, 3) : 0), { eyes: laugh ? 'happy' : flashing ? 'angry' : lt > 6.2 && lt < 7.4 ? 'wide' : bl(lt, 3, 'open'), mouth: laugh || flashing ? 'grin' : 'smile', handR: flashing || hi ? 'up' : 'n' });
      if (flashing) { const hr = S.hand(gi, 1); P.camera(g, hr[0] + 4, hr[1] - 2, lt > 7.9); F.camFlash(g, lt - 7.9, hr[0] + 6, hr[1] - 8, true); }
      C(g, 'codex', 300, 226 + (walking && Math.floor(lt * 8 + 1) % 2 ? -1 : 0), { face: laugh ? 'grin' : lt > 6.2 && lt < 8 ? 'wow' : 'happy', hands: hi ? 'up' : 'n', feet: walking ? M.walk(lt + 0.07, 7) : 'stand', cursor: cur(lt) });
      if (hi) F.burst(g, lt - 9.7, 250, 150, { n: 36, sp: 45, cols: ['#ea4335', '#fbbc04', '#34a853', '#4285f4', '#d97757', '#9fd8ff'], grav: 20, life: 1, seed: 9 });
      if (lt > 7.9 && lt < 8.3) cam.flash = 0.8 * (1 - (lt - 7.9) / 0.4);
      F.sparkles(g, lt, 0, 150, W, 60, 3, 71, ['#ffffff']);
      cam.bloom = 0.12;
    },
    au(A, t0) {
      A.melDeg(t0 + 0.2, 108, A.bars(A.THEME_B, 1, 2), 67, false, 'pluck', 0.6); A.bass(t0 + 0.2, 108, [0, 3], 4, 43, false, 0.55, true); A.drums(t0 + 0.2, 108, 2, { k: 'x.......x.......', h: '..x...x...x...x.' }, 0.5);
      for (let t = 0; t < 5.2; t += 0.28) A.sfx(t0 + t, 'step', { f: 300, v: 0.3 });
      A.sfx(t0 + 2.0, 'swish', { v: 0.3 }); A.sfx(t0 + 5.2, 'splash', { v: 0.7 }); A.sfx(t0 + 5.7, 'laugh', { who: 'whale', n: 3 }); A.sfx(t0 + 6.2, 'spout', { d: 0.8 });
      A.sfx(t0 + 6.5, 'fwump'); A.sfx(t0 + 6.9, 'splash', { v: 0.5 }); A.voice(t0 + 7.3, 'gemini', 3, { up: 1 }); A.sfx(t0 + 7.65, 'flash', { big: 1 });
      A.voice(t0 + 8.2, 'whale', 4, { pitch: 0.6 }); A.sfx(t0 + 8.4, 'bubbles', { d: 1 }); A.sfx(t0 + 8.9, 'sink');
      A.sfx(t0 + 9.3, 'laugh', { who: 'clawd', n: 4 }); A.sfx(t0 + 9.4, 'laugh', { who: 'gemini', n: 4 }); A.sfx(t0 + 9.5, 'laugh', { who: 'codex', n: 4 }); A.note(t0 + 9.7, 39, 0.1, 'clap', 0.9); A.sfx(t0 + 9.75, 'sparkle');
      A.melDeg(t0 + 9.4, 116, A.bars(A.THEME_B, 3, 4), 67, false, 'pluck', 0.6); A.bass(t0 + 9.4, 116, [4, 0], 4, 43, false, 0.55, true);
    },
  });

  // =============== 11. AMBUSH ===============
  function fmt(n) { const s = String(Math.floor(n)); let o = ''; for (let i = 0; i < s.length; i++) { if (i > 0 && (s.length - i) % 3 === 0) o += ' '; o += s[i]; } return o; }
  SC.push({
    name: 'Засада', dur: 16, tin: 'dither',
    draw(g, lt, cam) {
      B.forest(g, lt);
      // hammock and the decoy
      let prev = null; for (let i = 0; i <= 20; i++) { const u = i / 20, x = M.lerp(268, 396, u), y = 150 + Math.sin(u * Math.PI) * 28; if (prev) M.line(g, prev[0], prev[1], x, y, '#caa76a'); prev = [x, y]; }
      const flip = kf(lt, [[7, 1], [7.25, 0.05, 'inQ'], [7.5, 1, 'outQ']]), card = lt > 7.25;
      if (!card) C(g, 'clawd', 332, 188, { eyes: 'closed', mouth: 'smile', legs: 'tuck', sx: flip, desat: 0.15 });
      else { const w = Math.round(64 * flip); R(g, 332 - w / 2 - 1, 146, w + 2, 44, '#15122a'); R(g, 332 - w / 2, 147, w, 42, '#b08a5a'); for (let i = 0; i < 4; i++) R(g, 332 - w / 2, 152 + i * 9, w, 1, '#9a7448'); if (flip > 0.8) M.text(g, 'ПОПАЛСЯ!', 332, 162, { c: '#c23b5a', align: 'center' }); }
      for (let i = 0; i < 6; i++) { const u = i / 6; M.line(g, M.lerp(292, 372, u), 174 + Math.sin(u * Math.PI) * 6, M.lerp(292, 372, u) + 6, 190, '#9a8050'); }
      if (lt < 7) for (let i = 0; i < 3; i++) { const ph = (lt * 0.5 + i / 3) % 1; M.text(g, 'Z', 346 + ph * 16, 140 - ph * 30, { c: '#8fa0ff', a: 1 - ph, s: 1 + (i % 2) }); }
      // dream sparks and the distillery
      const stage = lt > 4.5 && lt < 7.2;
      for (let i = 0; i < 12; i++) { const ph = (lt * 0.6 + i / 12) % 1; if (lt > 7.2) break; let x = 332 + Math.sin(i * 2 + lt) * 10, y = 150 - ph * 40;
        if (stage) { const u = E.inQ(ph); x = M.lerp(332, 318, u); y = M.lerp(160, 132, u); } R(g, x, y, 2, 2, i % 2 ? '#ffd27a' : '#ff9a5a'); M.glow(g, x, y, 5, '#ff9a3c', 0.3); }
      const placed = lt > 3.6 && lt < 8.35;
      const lvl = kf(lt, [[4.8, 0], [7, 0.85]]);
      if (placed) {
        P.funnel(g, 318, 134); M.line(g, 318, 140, 300, 160, '#c9d6e6'); M.line(g, 300, 160, 246, 202, '#c9d6e6');
        if (stage) for (let i = 0; i < 4; i++) { const u = (lt * 1.2 + i / 4) % 1; R(g, M.lerp(318, 246, u), M.lerp(140, 202, u), 2, 2, '#b08aff'); }
        P.flask(g, 244, 226, lvl);
        const n = kf(lt, [[4.6, 0], [7, 151000000, 'inQ']]), txt = fmt(n);
        R(g, 244 - 36, 178, 72, 11, '#15122a'); M.text(g, txt, 244, 180, { c: '#b08aff', align: 'center' });
      }
      if (lt > 8.35 && lt < 11.5) { F.drops(g, lt - 8.35, 244, 214, { n: 18, col: '#ffffff', sp: 70 }); F.drops(g, lt - 8.35, 244, 218, { n: 22, col: '#8b5cff', sp: 50, seed: 3, life: 1 }); R(g, 244 - 36, 178, 72, 11, '#15122a'); if (Math.floor(lt * 5) % 2) M.text(g, 'ERROR', 244, 180, { c: '#ff5a5a', align: 'center' }); }
      // notebook on the ground
      if (lt > 9.8) { const ny = kf(lt, [[9.8, 200], [10.2, 232, 'outBounce']]); P.notebook(g, 150, ny, lt > 10.2); }
      // Qwen
      let qx = kf(lt, [[0, -40], [1.2, 90, 'lin'], [1.6, 90], [3.0, 206, 'lin']]), qy = 226 + (lt < 3 ? M.hop(lt, 0.45, 5) : 0), qo = { eyes: 'sly', mouth: 'evil', handR: 'hold' };
      if (lt > 1.2 && lt < 1.6) qo.eyes = Math.floor(lt * 5) % 2 ? 'lookL' : 'lookR';
      if (lt > 3.6 && lt < 4.6) { qo = { eyes: 'sly', mouth: 'evil', hands: 'rub' }; }
      if (lt >= 4.6 && lt < 7) { qo = { eyes: 'happy', mouth: 'grin', hands: 'up' }; qy += M.hop(lt, 0.3, 4); }
      if (lt >= 7 && lt < 8.2) qo = { eyes: 'wide', mouth: 'o' };
      if (lt >= 8.2 && lt < 9.6) { qo = { eyes: 'wide', mouth: 'yell', hands: 'up', sy: kf(lt, [[8.2, 1], [8.4, 1.25], [9.3, 1]]) }; qy = 226 + kf(lt, [[8.2, 0], [8.5, -58, 'outQ'], [9.0, -58], [9.4, 0, 'inQ']]); }
      if (lt >= 9.6) { qx = kf(lt, [[9.6, 206], [10.6, -90, 'inQ']]); qo = { eyes: 'wide', mouth: 'yell', hands: 'up', flip: true, sx: 1.2, sy: 0.85 }; }
      if (lt > 7.6 && lt < 9.6) { const k = 0.6; g.fillStyle = 'rgba(0,0,0,' + k + ')'; for (let y = 0; y < H; y++) { const dy = y + 0.5 - 196; if (Math.abs(dy) >= 56) { g.fillRect(0, y, W, 1); continue; } const hw = Math.sqrt(56 * 56 - dy * dy); g.fillRect(0, y, Math.max(0, qx - hw), 1); g.fillRect(qx + hw, y, W, 1); } M.glow(g, qx, 196, 60, '#fff6c0', 0.3); }
      if (qx > -80) { const qi = C(g, 'qwen', qx, qy, qo); if (lt < 3.6) { const hr = S.hand(qi, 1); P.flask(g, hr[0] + 2, hr[1] + 8, 0); } if (lt >= 9.6) F.dust(g, (lt - 9.6) % 0.5, qx + 20, 228); const qt = S.feat(qi, 'top'); M.say(g, lt, 8.3, 9.3, qt[0], qt[1], '!!!', { s: 2 }); if (lt >= 9.6 && lt < 10.6) F.speed(g, lt, qx, 180, 160, 50, 10, 4, '#ffffff', 1); }
      // the ambush
      const out = lt > 7.6;
      if (out) {
        const kxp = kf(lt, [[7.6, 430], [8.0, 296, 'outQ'], [11.4, 296], [12.2, 330], [13.6, 322], [14, 312]]), gxp = kf(lt, [[7.6, 455], [8.0, 356, 'outQ'], [11.4, 356], [12.2, 280], [13.6, 280], [14, 272]]);
        const kyp = 226 + kf(lt, [[7.6, 40], [7.9, -14, 'outQ'], [8.1, 0]]), gyp = 226 + kf(lt, [[7.6, 40], [7.95, -18, 'outQ'], [8.15, 0]]), laugh = lt > 11.4 && lt < 13.5;
        const cxp = kf(lt, [[7.9, 110], [8.2, 150], [11.4, 150], [12.2, 232], [13.6, 232], [14, 240]]);
        if (lt > 7.9) C(g, 'clawd', cxp, 226 + (laugh ? M.hop(lt, 0.25, 3) : 0), { eyes: laugh || lt > 13.6 ? 'happy' : 'sly', mouth: laugh || lt > 13.6 ? 'grin' : 'smile', armR: lt > 8.1 && lt < 8.6 ? 'hold' : lt > 13.6 ? 'up' : 'n' });
        C(g, 'codex', kxp, kyp + (laugh ? M.hop(lt + 0.1, 0.25, 3) : 0), { face: laugh || lt > 13.6 ? 'grin' : 'sly', hands: lt < 9 || lt > 13.6 ? 'up' : 'n', flip: lt < 11.4, cursor: cur(lt) });
        const selfie = lt > 13.5 && lt < 14.4;
        const gi = C(g, 'gemini', gxp, gyp + (laugh ? M.hop(lt + 0.2, 0.25, 3) : 0), { eyes: laugh || lt > 13.6 ? 'happy' : 'angry', mouth: 'grin', handR: (lt > 7.8 && lt < 8.3) || selfie ? 'up' : 'n' });
        if ((lt > 7.8 && lt < 8.3) || selfie) { const hr = S.hand(gi, 1); P.camera(g, hr[0] + 4, hr[1] - 2, true); F.camFlash(g, lt - (selfie ? 14.2 : 7.95), hr[0] + 6, hr[1] - 8, selfie); }
      }
      B.bushes(g, lt, lt < 7.6);
      if (lt > 7.6 && lt < 7.75) cam.flash = 0.5;
      if (lt > 7.95 && lt < 8.3) cam.flash = 0.7 * (1 - (lt - 7.95) / 0.35);
      if (lt > 14.2) { // polaroid
        const w = kf(lt, [[14.2, 0], [14.5, 1, 'outBack']]), dev = clamp((lt - 14.5) / 1.2, 0, 1);
        cam.flash = lt < 14.5 ? 1 - (lt - 14.2) / 0.3 : 0;
        M.tint(g, '#000000', 0.55);
        const pw = 180 * w, ph = 150 * w, px = 240 - pw / 2, py = 135 - ph / 2 - 6;
        R(g, px - 1, py - 1, pw + 2, ph + 2, '#15122a'); R(g, px, py, pw, ph, '#fbfaf5');
        if (w > 0.9) {
          R(g, px + 8, py + 8, 164, 112, '#2a3a6a'); M.stars(g, lt, { n: 20, x: px + 8, y: py + 8, w: 164, h: 60, seed: 3 }); R(g, px + 8, py + 90, 164, 30, '#1f3a2a');
          g.save(); g.beginPath(); g.rect(px + 8, py + 8, 164, 112); g.clip();
          C(g, 'clawd', px + 50, py + 116, { eyes: 'happy', mouth: 'grin', armR: 'up' }); C(g, 'codex', px + 132, py + 116, { face: 'love', hands: 'up' }); C(g, 'gemini', px + 90, py + 112, { eyes: 'happy', mouth: 'grin', hands: 'up' });
          g.restore();
          g.globalAlpha = 1 - dev; R(g, px + 8, py + 8, 164, 112, '#f4f1e8'); g.globalAlpha = 1;
          M.text(g, 'МЫ', px + 90, py + 128, { c: '#3a3a4a', align: 'center', a: dev });
        }
      }
      cam.bloom = 0.25;
    },
    au(A, t0) {
      const b = 60 / 100, sneak = [[62, 0.5], [null, 0.5], [65, 0.5], [null, 0.5], [69, 0.5], [68, 0.5], [67, 0.5], [null, 0.5], [62, 0.5], [null, 0.5], [65, 0.5], [null, 0.5], [70, 0.5], [69, 0.5], [65, 1]];
      A.mel(t0 + 0.2, 100, sneak, 'pluck', 0.6); for (let i = 0; i < 8; i++) A.note(t0 + 0.2 + i * b, i % 2 ? 45 : 38, 0.2, 'bass', 0.5);
      A.mel(t0 + 4.8, 100, [[74, 0.25], [72, 0.25], [74, 0.25], [77, 0.25], [74, 0.25], [72, 0.25], [70, 0.25], [69, 0.25], [74, 0.25], [72, 0.25], [74, 0.25], [77, 0.25], [81, 0.5], [79, 0.5]], 'pluck', 0.55);
      for (let t = 0.2; t < 3; t += 0.45) A.sfx(t0 + t, 'step', { f: 900, v: 0.2 });
      A.sfx(t0 + 3.7, 'tick', { v: 2 }); A.sfx(t0 + 4.6, 'bubbles', { d: 2.4, v: 0.6 }); for (let t = 4.6; t < 7; t += 0.08) A.sfx(t0 + t, 'tick', { v: 0.8 }); A.sfx(t0 + 5.2, 'laugh', { who: 'qwen', n: 5, v: 0.7 });
      A.sfx(t0 + 7.0, 'swish'); A.sfx(t0 + 7.6, 'hit'); A.sfx(t0 + 7.6, 'spot'); A.sfx(t0 + 7.7, 'flash'); A.voice(t0 + 8.0, 'codex', 3, { up: 1 });
      A.sfx(t0 + 8.2, 'boing'); A.sfx(t0 + 8.25, 'scream'); A.sfx(t0 + 8.35, 'glass');
      A.sfx(t0 + 9.6, 'scurry', { d: 1.1 }); A.sfx(t0 + 9.7, 'whoosh', { d: 0.6, f0: 2500, f1: 500, v: 0.5 }); A.sfx(t0 + 9.8, 'pop', { f: 400 }); A.sfx(t0 + 10.4, 'rustle');
      A.sfx(t0 + 11.4, 'laugh', { who: 'clawd', n: 5 }); A.sfx(t0 + 11.5, 'laugh', { who: 'gemini', n: 5 }); A.sfx(t0 + 11.6, 'laugh', { who: 'codex', n: 5 });
      A.melDeg(t0 + 11.6, 120, [[7, 0.5], [9, 0.5], [11, 0.5], [14, 1.5]], 62, false, 'bell', 0.5); A.chords(t0 + 11.6, 120, [0], 4, 62, false, 'pad', 0.5);
      A.sfx(t0 + 13.9, 'flash', { big: 1 }); A.sfx(t0 + 14.4, 'whir', { d: 1.2 });
    },
  });

  // =============== 12. FINALE ===============
  SC.push({
    name: 'Звёзды', dur: 10, tin: 'dither',
    draw(g, lt, cam, ui) {
      B.hill(g, lt);
      if (lt > 1.5 && lt < 2.4) { const u = (lt - 1.5) / 0.9; for (let k = 0; k < 10; k++) { const v = u - k * 0.02; if (v < 0) continue; g.globalAlpha = 1 - k / 10; R(g, M.lerp(390, 290, v), M.lerp(30, 80, v), 1, 1, '#ffffff'); } g.globalAlpha = 1; }
      F.burst(g, lt - 2.6, 110, 124, { n: 50, sp: 30, cols: ['#ff9a5a', '#ffd27a'], grav: 10, seed: 2 });
      F.burst(g, lt - 3.3, 372, 114, { n: 50, sp: 30, shape: 'star', cols: ['#8fb0ff', '#ffffff'], grav: 10, seed: 6 });
      F.burst(g, lt - 4.0, 240, 92, { n: 70, sp: 38, shape: 'gem4', cols: ['#ea4335', '#fbbc04', '#34a853', '#4285f4'], grav: 10, seed: 9, life: 2.6 });
      const sway = Math.round(Math.sin(lt * 1.6) * 2), lean = lt > 3 ? -3 : 0;
      C(g, 'clawd', 194 + sway, 214, { back: true, legs: 'sit' }); C(g, 'codex', 288 + sway, 216, { back: true }); C(g, 'gemini', 242 + sway + lean, 212, { back: true, hands: lt > 3 ? 'hug' : 'n' });
      if (lt > 5.2 && lt < 6.2) F.hearts(g, lt - 5.2, 240, 150, { n: 3 });
      cam.bloom = 0.35;
      const d = clamp((lt - 5.8) / 0.8, 0, 1);
      if (d > 0) {
        ui.globalAlpha = d * 0.65; R(ui, 0, 0, W, H, '#05040c'); ui.globalAlpha = 1;
        M.text(ui, 'ВСПЫШКА', 240, 58, { c: '#efe6ff', s: 2, align: 'center', a: d });
        const k = M.pop(lt, 6.2, 20); if (k > 0) M.text(ui, 'КОНЕЦ', 240, 88 + (1 - k) * 8, { c: '#ffd27a', s: 4, align: 'center', ol: '#15122a' });
        const a2 = clamp((lt - 7) / 0.6, 0, 1);
        M.text(ui, 'В РОЛЯХ:  CLAWD · CODEX · GEMINI', 240, 140, { c: '#c9c4e8', align: 'center', a: a2 });
        M.text(ui, 'И QWEN (НЕМНОГО)', 240, 152, { c: '#b08aff', align: 'center', a: a2 });
        M.text(ui, 'ДРУЗЬЯ СИЯЮТ ЯРЧЕ ВМЕСТЕ', 240, 176, { c: '#8a86a0', align: 'center', a: clamp((lt - 7.6) / 0.6, 0, 1) });
        if (lt > 8.4) { const qy = kf(lt, [[8.4, 300], [8.7, 262, 'outQ'], [9.0, 262], [9.2, 320, 'inQ']]), spot = lt > 8.9 && lt < 9.2; if (spot) M.glow(ui, 444, 238, 40, '#fff6c0', 0.7); const qi = S.draw(ui, 'qwen', 444, qy, { eyes: spot ? 'wide' : 'sly', mouth: spot ? 'o' : 'evil' }); const e0 = S.feat(qi, 'eyes', 0); if (!spot) P.binoc(ui, e0[0] + 4, e0[1] - 4); }
      }
    },
    au(A, t0) {
      A.melDeg(t0 + 0.3, 80, A.bars(A.THEME_A, 7, 8), 72, false, 'bell', 0.55); A.chords(t0 + 0.3, 80, [3, 4], 4, 60, false, 'pad', 0.6);
      A.sfx(t0 + 1.5, 'whoosh', { d: 0.8, f0: 3000, f1: 1500, v: 0.15 }); A.sfx(t0 + 1.6, 'sparkle', { v: 0.5 });
      [2.6, 3.3, 4.0].forEach((t) => A.sfx(t0 + t, 'boom', { v: 0.2 }));
      A.chords(t0 + 6.2, 80, [0], 4, 60, false, 'pad', 0.7); A.arp(t0 + 6.2, 80, [0], 4, 72, false, 'bell', 0.35); A.sfx(t0 + 6.2, 'chime');
      A.sfx(t0 + 8.9, 'spot'); A.sfx(t0 + 9.1, 'pop', { f: 400 });
    },
  });
})();
