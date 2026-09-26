/* VSPYSHKA - audio.js: procedural score + sfx, scheduled against the timeline (seekable, recordable, offline-renderable) */
(function () {
  'use strict';
  const M = window.M, A = (M.A = { ev: [] });
  // ---------- authoring ----------
  A.note = (t, m, d, i, v) => A.ev.push({ t: t, k: 'n', m: m, d: d, i: i, v: v === undefined ? 0.5 : v });
  A.sfx = (t, n, p) => A.ev.push({ t: t, k: 's', n: n, p: p || {}, d: (p && p.d) || 0.5 });
  A.voice = (t, who, n, p) => A.sfx(t, 'voice', Object.assign({ who: who, n: n || 4 }, p || {}));
  A.deg = (d, key, minor) => { const sc = minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11], o = Math.floor(d / 7), i = ((d % 7) + 7) % 7; return key + 12 * o + sc[i]; };
  // Gemini's leitmotif (scale degrees, beats) - 8 bars
  A.THEME_A = [[2, 1], [4, 1], [7, 1.5], [6, 0.5], [5, 1], [4, 1], [2, 2], [3, 1], [5, 1], [8, 1.5], [7, 0.5], [6, 1], [7, 1], [8, 2], [9, 1], [8, 0.5], [7, 0.5], [6, 1], [7, 1], [5, 1], [4, 1], [2, 2], [3, 1], [5, 1], [4, 1], [6, 1], [7, 4]];
  A.CH_A = [0, 5, 3, 4, 2, 5, 3, 0];
  A.THEME_B = [[4, 0.5], [4, 0.5], [7, 0.5], [4, 0.5], [9, 0.5], [7, 0.5], [4, 1], [5, 0.5], [5, 0.5], [8, 0.5], [5, 0.5], [10, 0.5], [8, 0.5], [5, 1], [6, 0.5], [7, 0.5], [8, 0.5], [9, 0.5], [10, 1], [8, 1], [9, 0.5], [8, 0.5], [7, 0.5], [6, 0.5], [7, 2]];
  A.bars = function (th, a, b) { const out = []; let beat = 0; for (const n of th) { const bar = Math.floor(beat / 4 + 1e-6) + 1; if (bar >= a && bar <= b) out.push(n); beat += n[1]; } return out; };
  A.mel = function (t0, bpm, notes, inst, v) { const b = 60 / bpm; let t = t0; for (const n of notes) { if (n[0] !== null) A.note(t, n[0], n[1] * b * 0.92, inst, v); t += n[1] * b; } return t; };
  A.melDeg = (t0, bpm, notes, key, minor, inst, v) => A.mel(t0, bpm, notes.map((n) => [n[0] === null ? null : A.deg(n[0], key, minor), n[1]]), inst, v);
  A.chords = function (t0, bpm, roots, beats, key, minor, inst, v) { const b = 60 / bpm; roots.forEach((r, i) => { for (const k of [0, 2, 4]) A.note(t0 + i * beats * b, A.deg(r + k, key, minor), beats * b * 0.98, inst, v); }); };
  A.arp = function (t0, bpm, roots, beats, key, minor, inst, v) { const b = 60 / bpm; roots.forEach((r, i) => { for (let q = 0; q < beats * 2; q++) A.note(t0 + i * beats * b + (q * b) / 2, A.deg(r + [0, 2, 4, 7][q % 4], key, minor), b * 0.45, inst, v); }); };
  A.bass = function (t0, bpm, roots, beats, key, minor, v, oct) { const b = 60 / bpm; roots.forEach((r, i) => { const m = A.deg(r, key, minor); for (let q = 0; q < beats * 2; q++) { if (oct) A.note(t0 + i * beats * b + (q * b) / 2, m + (q % 2 ? 12 : 0), b * 0.4, 'bass', v); else if (q % 2 === 0) A.note(t0 + i * beats * b + (q * b) / 2, m, b * 0.8, 'bass', v); } }); };
  A.drums = function (t0, bpm, bars, pat, v) { const s = 60 / bpm / 4; for (let bar = 0; bar < bars; bar++) for (let i = 0; i < 16; i++) { const t = t0 + (bar * 16 + i) * s; if (pat.k && pat.k[i] === 'x') A.note(t, 36, 0.2, 'kick', v); if (pat.s && pat.s[i] === 'x') A.note(t, 38, 0.2, 'snare', v); if (pat.h && pat.h[i] === 'x') A.note(t, 42, 0.05, 'hat', v); if (pat.c && pat.c[i] === 'x') A.note(t, 39, 0.1, 'clap', v); } };

  // ---------- engine ----------
  let ctx = null, master = null, comp = null, mus = null, fxb = null, noiseBuf = null, pulse = null, recDest = null;
  const live = [];
  let rs = 1; // seeded random: the same event always sounds the same (needed for chunked offline rendering)
  const rand = () => { rs = (rs + 0x6d2b79f5) | 0; let t = Math.imul(rs ^ (rs >>> 15), 1 | rs); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  A.muted = false;
  function buildGraph(c, dest, gv) {
    master = c.createGain(); master.gain.value = gv;
    comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    master.connect(comp); comp.connect(dest);
    mus = c.createGain(); mus.gain.value = 0.55; mus.connect(master);
    fxb = c.createGain(); fxb.gain.value = 0.8; fxb.connect(master);
    const dl = c.createDelay(1), fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain();
    dl.delayTime.value = 0.23; fb.gain.value = 0.28; lp.type = 'lowpass'; lp.frequency.value = 2500; wet.gain.value = 0.22;
    mus.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(master);
    rs = 12345; noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rand() * 2 - 1;
    const n = 32, re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25); pulse = c.createPeriodicWave(re, im);
  }
  A.init = function () {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { ctx = A.ctx = new AC(); } catch (e) { return null; }
    buildGraph(ctx, ctx.destination, A.muted ? 0 : 0.9);
    return ctx;
  };
  A.setMuted = function (m) { A.muted = m; if (master && ctx) master.gain.setValueAtTime(m ? 0 : 0.9, ctx.currentTime); };
  A.recStream = function () { if (!ctx) return null; if (!recDest) { recDest = ctx.createMediaStreamDestination(); comp.connect(recDest); } return recDest.stream; };
  const track = (node, end) => live.push({ n: node, e: end });
  const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function gain(dest, v) { const g = ctx.createGain(); g.gain.value = v === undefined ? 1 : v; g.connect(dest); return g; }
  function filt(type, f, q, dest) { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q) b.Q.value = q; b.connect(dest); return b; }
  function osc(type, f, t, end, dest, det) { const o = ctx.createOscillator(); if (type === 'pulse') o.setPeriodicWave(pulse); else o.type = type; o.frequency.setValueAtTime(f, t); if (det) o.detune.value = det; o.connect(dest); o.start(t); o.stop(end + 0.05); track(o, end + 0.05); return o; }
  function noise(t, end, dest) { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.connect(dest); s.start(t, rand() * 1.5); s.stop(end + 0.05); track(s, end + 0.05); return s; }
  function env(g, t, a, peak, dcy, sus, rel, end) { const p = g.gain, e1 = t + a + dcy, e2 = Math.max(e1, end); p.setValueAtTime(0.0001, t); p.linearRampToValueAtTime(peak, t + a); p.linearRampToValueAtTime(peak * sus, e1); p.setValueAtTime(peak * sus, e2); p.linearRampToValueAtTime(0.0001, e2 + rel); }
  function perc(dest, t, v, dur) { const g = gain(dest, 0); g.gain.setValueAtTime(Math.max(0.0002, v), t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); return g; }
  function vib(o, t, end, rate, depth) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = rate; lg.gain.value = depth; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(end); track(l, end); }

  function playNote(e, t) {
    const f = mf(e.m), v = e.v, end = t + e.d;
    switch (e.i) {
      case 'lead': { const g = gain(mus, 0); env(g, t, 0.01, v * 0.22, 0.08, 0.7, 0.08, end); const o = osc('pulse', f, t, end + 0.1, g); vib(o, t + 0.15, end + 0.1, 5.5, f * 0.006); break; }
      case 'bass': { const g = gain(mus, 0); env(g, t, 0.005, v * 0.38, 0.05, 0.8, 0.04, end); osc('triangle', f, t, end + 0.05, g); break; }
      case 'pad': { const lp = filt('lowpass', 1400, 0.5, mus), g = gain(lp, 0); env(g, t, 0.35, v * 0.09, 0.2, 0.85, 0.6, end); osc('sawtooth', f, t, end + 0.7, g, -7); osc('sawtooth', f, t, end + 0.7, g, 7); break; }
      case 'bell': { osc('sine', f, t, t + 1.4, perc(mus, t, v * 0.2, 1.4)); osc('sine', f * 3.01, t, t + 0.5, perc(mus, t, v * 0.06, 0.5)); break; }
      case 'piano': { const g = gain(mus, 0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.26, t + 0.008); g.gain.exponentialRampToValueAtTime(v * 0.08, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, Math.max(t + 0.6, end + 0.6)); osc('triangle', f, t, Math.max(t + 0.6, end + 0.6), g); osc('sine', f * 2, t, t + 0.3, perc(mus, t, v * 0.05, 0.3)); break; }
      case 'pluck': osc('triangle', f, t, t + 0.3, perc(mus, t, v * 0.3, 0.28)); break;
      case 'saw': { const lp = filt('lowpass', 900, 2, mus); lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(900, t + 0.25); const g = gain(lp, 0); env(g, t, 0.01, v * 0.16, 0.1, 0.75, 0.1, end); osc('sawtooth', f, t, end + 0.12, g, -5); osc('sawtooth', f, t, end + 0.12, g, 5); break; }
      case 'bone': { const lp = filt('lowpass', 800, 3, mus), g = gain(lp, 0); env(g, t, 0.04, v * 0.32, 0.1, 0.8, 0.1, end); const o = osc('sawtooth', f, t, end + 0.12, g); if (e.d > 0.6) vib(o, t + 0.2, end, 6, f * 0.03); break; }
      case 'kick': { const o = osc('sine', 150, t, t + 0.36, perc(mus, t, v * 0.9, 0.35)); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); break; }
      case 'snare': noise(t, t + 0.17, perc(filt('bandpass', 1900, 0.8, mus), t, v * 0.6, 0.16)); osc('triangle', 190, t, t + 0.09, perc(mus, t, v * 0.3, 0.08)); break;
      case 'hat': noise(t, t + 0.05, perc(filt('highpass', 7000, 0, mus), t, v * 0.25, 0.045)); break;
      case 'clap': for (let i = 0; i < 3; i++) noise(t + i * 0.012, t + i * 0.012 + 0.08, perc(filt('bandpass', 1200, 1, mus), t + i * 0.012, v * 0.4, 0.08)); break;
      case 'crash': noise(t, t + 1.45, perc(filt('highpass', 4000, 0, mus), t, v * 0.35, 1.4)); break;
    }
  }
  const VO = { clawd: [300, 'triangle'], codex: [420, 'square'], gemini: [620, 'sine'], qwen: [520, 'sawtooth'], whale: [150, 'sine'], moon: [760, 'triangle'], crowd: [360, 'triangle'] };
  function playSfx(e, t) {
    const p = e.p || {}, v = p.v === undefined ? 1 : p.v, d = p.d || 0.5;
    switch (e.n) {
      case 'whoosh': { const bp = filt('bandpass', 400, 1.2, fxb); bp.frequency.setValueAtTime(p.f0 || 300, t); bp.frequency.exponentialRampToValueAtTime(p.f1 || 3000, t + d); const g = gain(bp, 0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5 * v, t + d * 0.6); g.gain.linearRampToValueAtTime(0.0001, t + d); noise(t, t + d, g); break; }
      case 'boom': { const lp = filt('lowpass', 1200, 0, fxb); lp.frequency.setValueAtTime(1200, t); lp.frequency.exponentialRampToValueAtTime(200, t + 1.2); noise(t, t + 1.6, perc(lp, t, 0.8 * v, 1.6)); const o = osc('sine', 90, t, t + 0.5, perc(fxb, t, 0.9 * v, 0.5)); o.frequency.exponentialRampToValueAtTime(35, t + 0.4);
        for (let i = 0; i < 16; i++) { const tt = t + 0.25 + rand() * 1.1; noise(tt, tt + 0.04, perc(filt('highpass', 3000, 0, fxb), tt, 0.25 * v * rand() + 0.01, 0.03)); } break; }
      case 'pop': { const o = osc('sine', p.f || 800, t, t + 0.1, perc(fxb, t, 0.5 * v, 0.1)); o.frequency.exponentialRampToValueAtTime((p.f || 800) * 2, t + 0.06); break; }
      case 'chime': [0, 4, 7, 12].forEach((k, i) => osc('sine', mf(84 + k), t + i * 0.06, t + 1.2, perc(fxb, t + i * 0.06, 0.18 * v, 1.1))); break;
      case 'sparkle': for (let i = 0; i < 6; i++) { const tt = t + i * 0.05; osc('sine', 2000 + rand() * 2500, tt, tt + 0.2, perc(fxb, tt, 0.1 * v, 0.18)); } break;
      case 'shimmer': for (let i = 0; i < 14; i++) { const tt = t + i * (d / 14); osc('sine', mf(84 + [0, 4, 7, 11, 12, 16][i % 6]), tt, tt + 0.5, perc(fxb, tt, 0.09 * v, 0.5)); } break;
      case 'swell': { const bp = filt('bandpass', 800, 0.7, fxb); bp.frequency.setValueAtTime(800, t); bp.frequency.exponentialRampToValueAtTime(4000, t + d); const g = gain(bp, 0); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35 * v, t + d); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.05); noise(t, t + d + 0.06, g); break; }
      case 'step': osc('sine', p.f || 220, t, t + 0.06, perc(fxb, t, 0.25 * v, 0.06)); break;
      case 'match': noise(t, t + 0.4, perc(filt('highpass', 2500, 0, fxb), t, 0.4 * v, 0.35)); break;
      case 'fuse': { const g = gain(filt('highpass', 3000, 0, fxb), 0); g.gain.setValueAtTime(0.0001, t); for (let i = 0; i < d * 20; i++) g.gain.setValueAtTime(0.03 + rand() * 0.12 * v, t + i * 0.05); g.gain.setValueAtTime(0.0001, t + d); noise(t, t + d, g); break; }
      case 'fizzle': { const g = gain(filt('highpass', 1500, 0, fxb), 0); g.gain.setValueAtTime(0.0001, t); for (let i = 0; i < 16; i++) g.gain.setValueAtTime(rand() * 0.3 * v * (1 - i / 16) + 0.001, t + i * 0.05); g.gain.setValueAtTime(0.0001, t + 0.8); noise(t, t + 0.8, g); break; }
      case 'boing': { const o = osc('sine', 260, t, t + 0.5, perc(fxb, t, 0.4 * v, 0.5)); o.frequency.exponentialRampToValueAtTime(620, t + 0.3); vib(o, t, t + 0.5, 28, 90); break; }
      case 'cricket': for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) { const tt = t + r * 0.45 + i * 0.05; osc('sine', 4300, tt, tt + 0.03, perc(fxb, tt, 0.12 * v, 0.03)); } break;
      case 'flash': { const o = osc('sine', 1200, t, t + 0.25, perc(fxb, t, 0.06 * v, 0.25)); o.frequency.exponentialRampToValueAtTime(5200, t + 0.22); noise(t + 0.24, t + 0.28, perc(filt('highpass', 2000, 0, fxb), t + 0.24, 0.5 * v, 0.03)); const o2 = osc('sine', 2400, t + 0.24, t + 0.3, perc(fxb, t + 0.24, 0.25 * v, 0.06)); o2.frequency.exponentialRampToValueAtTime(300, t + 0.3); if (p.big) { A.sfxNow('sparkle', t + 0.26); noise(t + 0.24, t + 1.2, perc(filt('highpass', 5000, 0, fxb), t + 0.24, 0.2, 0.9)); } break; }
      case 'zip': { const o = osc('square', 600, t, t + 0.12, perc(filt('lowpass', 2500, 0, fxb), t, 0.12 * v, 0.12)); o.frequency.exponentialRampToValueAtTime(1800, t + 0.1); break; }
      case 'bubbles': for (let i = 0; i < d * 12; i++) { const tt = t + rand() * d, o = osc('sine', 400 + rand() * 400, tt, tt + 0.07, perc(fxb, tt, 0.15 * v, 0.07)); o.frequency.exponentialRampToValueAtTime(1100, tt + 0.06); } break;
      case 'splash': { noise(t, t + 0.6, perc(filt('bandpass', 1000, 0.6, fxb), t, 0.6 * v, 0.55)); for (let i = 0; i < 4; i++) { const tt = t + 0.05 + rand() * 0.3, o = osc('sine', 500, tt, tt + 0.08, perc(fxb, tt, 0.12 * v, 0.08)); o.frequency.exponentialRampToValueAtTime(1000, tt + 0.07); } break; }
      case 'spout': { const bp = filt('bandpass', 700, 0.8, fxb); bp.frequency.setValueAtTime(700, t); bp.frequency.exponentialRampToValueAtTime(2500, t + d); const g = gain(bp, 0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.4 * v, t + 0.1); g.gain.linearRampToValueAtTime(0.0001, t + d); noise(t, t + d, g); break; }
      case 'laugh': { const V = VO[p.who] || VO.crowd, n = p.n || 5; for (let i = 0; i < n; i++) { const tt = t + i * 0.14, f = V[0] * (1.25 - i * 0.05) * (p.pitch || 1), o = osc(V[1], f, tt, tt + 0.1, perc(filt('bandpass', 1100, 1.2, fxb), tt, 0.35 * v, 0.1)); o.frequency.exponentialRampToValueAtTime(f * 0.8, tt + 0.09); } break; }
      case 'voice': { const V = VO[p.who] || [400, 'sine']; let tt = t; for (let i = 0; i < (p.n || 4); i++) { const dd = 0.055 + rand() * 0.04, f = V[0] * (0.85 + rand() * 0.35) * (p.pitch || 1), g = gain(filt('bandpass', 900 + rand() * 1400, 1.5, fxb), 0); g.gain.setValueAtTime(0.0001, tt); g.gain.linearRampToValueAtTime(0.5 * v, tt + 0.01); g.gain.linearRampToValueAtTime(0.0001, tt + dd); const o = osc(V[1], f, tt, tt + dd, g); o.frequency.linearRampToValueAtTime(f * (p.up ? 1.25 : 0.92), tt + dd); tt += dd + 0.035 + rand() * 0.03; } break; }
      case 'cheer': { const g = gain(filt('bandpass', 1300, 0.5, fxb), 0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.35 * v, t + 0.3); g.gain.linearRampToValueAtTime(0.0001, t + d); noise(t, t + d, g); for (let i = 0; i < 10; i++) { const tt = t + rand() * d * 0.7, o = osc('triangle', 420 + rand() * 300, tt, tt + 0.25, perc(fxb, tt, 0.08 * v, 0.25)); o.frequency.linearRampToValueAtTime(700 + rand() * 300, tt + 0.2); } break; }
      case 'crowd': { const g = gain(filt('bandpass', 600, 0.6, fxb), 0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.18 * v, t + 0.4); g.gain.linearRampToValueAtTime(0.0001, t + d); noise(t, t + d, g); break; }
      case 'flap': for (let i = 0; i < d * 30; i++) { const tt = t + i / 30; noise(tt, tt + 0.02, perc(filt('highpass', 3000, 0, fxb), tt, 0.25 * v, 0.015)); } break;
      case 'type': for (let i = 0; i < d * 16; i++) { const tt = t + i / 16 + rand() * 0.02; noise(tt, tt + 0.02, perc(filt('highpass', 4000, 0, fxb), tt, 0.2 * v, 0.012)); } break;
      case 'clank': { osc('square', 900, t, t + 0.25, perc(filt('bandpass', 1800, 2, fxb), t, 0.18 * v, 0.25)); osc('square', 1370, t, t + 0.2, perc(filt('bandpass', 2600, 2, fxb), t, 0.12 * v, 0.2)); break; }
      case 'squeak': { const o = osc('sine', 1400, t, t + 0.12, perc(fxb, t, 0.05 * v, 0.12)); o.frequency.linearRampToValueAtTime(1800, t + 0.1); break; }
      case 'swish': { const bp = filt('bandpass', 2000, 1, fxb); bp.frequency.setValueAtTime(2000, t); bp.frequency.exponentialRampToValueAtTime(600, t + 0.2); noise(t, t + 0.22, perc(bp, t, 0.35 * v, 0.2)); break; }
      case 'beep': osc('square', p.f || 440, t, t + d, perc(filt('lowpass', 3000, 0, fxb), t, 0.18 * v, d)); break;
      case 'powerdown': { const o = osc('sawtooth', 400, t, t + d, perc(filt('lowpass', 1500, 0, fxb), t, 0.2 * v, d)); o.frequency.exponentialRampToValueAtTime(40, t + d); break; }
      case 'wind': case 'rain': {
        const f0 = e.n === 'rain' ? 2600 : 420, bp = filt('bandpass', f0, e.n === 'rain' ? 0.6 : 0.9, fxb), g = gain(bp, 0), fi = p.fadeIn || 1.5, vol = (e.n === 'rain' ? 0.5 : 0.25) * v;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + fi); g.gain.setValueAtTime(vol, Math.max(t + fi, t + d - 1.5)); g.gain.linearRampToValueAtTime(0.0001, t + d); noise(t, t + d, g);
        if (e.n === 'rain') { const g2 = gain(filt('lowpass', 500, 0, fxb), 0); g2.gain.setValueAtTime(0.0001, t); g2.gain.linearRampToValueAtTime(0.25 * v, t + fi); g2.gain.setValueAtTime(0.25 * v, Math.max(t + fi, t + d - 1.5)); g2.gain.linearRampToValueAtTime(0.0001, t + d); noise(t, t + d, g2); }
        break; }
      case 'thunder': { noise(t, t + 0.2, perc(filt('highpass', 1000, 0, fxb), t, 0.5 * v, 0.2)); const g = gain(filt('lowpass', 260, 0, fxb), 0); g.gain.setValueAtTime(0.0001, t); for (let i = 0; i < 12; i++) g.gain.linearRampToValueAtTime((0.3 + rand() * 0.5) * v * (1 - i / 12) + 0.0001, t + 0.1 + i * 0.22); g.gain.linearRampToValueAtTime(0.0001, t + 3); noise(t, t + 3, g); break; }
      case 'crack': for (let i = 0; i < 8; i++) { const tt = t + i * 0.04; noise(tt, tt + 0.03, perc(filt('highpass', 2500, 0, fxb), tt, 0.3 * v, 0.025)); } break;
      case 'glass': for (let i = 0; i < 10; i++) { const tt = t + rand() * 0.25; osc('sine', 2500 + rand() * 3500, tt, tt + 0.25, perc(fxb, tt, 0.12 * v, 0.25)); } noise(t, t + 0.3, perc(filt('highpass', 3000, 0, fxb), t, 0.4 * v, 0.3)); break;
      case 'fwump': { const o = osc('sine', 120, t, t + 0.25, perc(fxb, t, 0.5 * v, 0.25)); o.frequency.exponentialRampToValueAtTime(60, t + 0.2); noise(t, t + 0.15, perc(filt('lowpass', 800, 0, fxb), t, 0.3 * v, 0.15)); break; }
      case 'tick': osc('square', 2000, t, t + 0.02, perc(filt('highpass', 1500, 0, fxb), t, 0.08 * v, 0.02)); break;
      case 'heart': [0, 0.14].forEach((dt) => { const o = osc('sine', 70, t + dt, t + dt + 0.2, perc(fxb, t + dt, 0.6 * v, 0.2)); o.frequency.exponentialRampToValueAtTime(40, t + dt + 0.15); }); break;
      case 'blow': noise(t, t + d, perc(filt('bandpass', 900, 0.5, fxb), t, 0.35 * v, d)); break;
      case 'launch': { const lp = filt('lowpass', 300, 0, fxb); lp.frequency.setValueAtTime(300, t); lp.frequency.exponentialRampToValueAtTime(1800, t + d * 0.6); const g = gain(lp, 0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.7 * v, t + 0.3); g.gain.linearRampToValueAtTime(0.0001, t + d); noise(t, t + d, g); break; }
      case 'sink': { const o = osc('sine', 900, t, t + 0.8, perc(fxb, t, 0.2 * v, 0.8)); o.frequency.exponentialRampToValueAtTime(200, t + 0.75); break; }
      case 'hit': { [48, 51, 55, 60].forEach((m) => { const g = gain(filt('lowpass', 2400, 0, fxb), 0); g.gain.setValueAtTime(0.16 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6); osc('sawtooth', mf(m), t, t + 0.6, g); }); const o = osc('sine', 120, t, t + 0.3, perc(fxb, t, 0.8 * v, 0.3)); o.frequency.exponentialRampToValueAtTime(40, t + 0.2); noise(t, t + 0.3, perc(filt('highpass', 2000, 0, fxb), t, 0.3 * v, 0.3)); break; }
      case 'spot': { osc('square', 180, t, t + 0.05, perc(filt('lowpass', 1200, 0, fxb), t, 0.4 * v, 0.05)); noise(t, t + 0.06, perc(filt('highpass', 1500, 0, fxb), t, 0.4 * v, 0.05)); break; }
      case 'scream': { const g = gain(filt('bandpass', 1400, 1.2, fxb), 0); env(g, t, 0.02, 0.35 * v, 0.1, 0.8, 0.1, t + 0.5); const o = osc('square', 700, t, t + 0.65, g); o.frequency.linearRampToValueAtTime(1150, t + 0.5); vib(o, t, t + 0.6, 18, 60); break; }
      case 'scurry': for (let i = 0; i < d * 18; i++) { const tt = t + i / 18; osc('sine', 500 + (i % 2) * 150, tt, tt + 0.03, perc(fxb, tt, 0.2 * v, 0.03)); } break;
      case 'rustle': noise(t, t + 0.5, perc(filt('bandpass', 3000, 0.5, fxb), t, 0.45 * v, 0.5)); break;
      case 'whir': { const o = osc('sawtooth', 110, t, t + d, perc(filt('lowpass', 900, 0, fxb), t, 0.1 * v, d)); vib(o, t, t + d, 30, 20); break; }
    }
  }
  A.sfxNow = (n, t, p) => playSfx({ n: n, p: p || {} }, t);

  // ---------- scheduler ----------
  let sorted = [], idx = 0, playing = false, t0 = 0, a0 = 0, upTo = 0;
  A.prepare = function () { A.ev.sort((a, b) => a.t - b.t); sorted = A.ev; };
  function fire(e, when) {
    try {
      rs = (Math.round(e.t * 1000) * 7919 + (e.m || 0) * 131 + (e.n ? e.n.charCodeAt(0) * 17 + e.n.length : 0) + 1) | 0;
      const w = Math.max(when, ctx.currentTime + 0.005);
      if (e.k === 'n') playNote(e, w); else playSfx(e, w);
    } catch (err) { if (!A._warned) { A._warned = 1; console.warn('audio ' + err); } }
  }
  const isLong = (e) => (e.k === 's' && (e.n === 'rain' || e.n === 'wind')) || (e.k === 'n' && e.i === 'pad');
  A.stopAll = function () { playing = false; for (const l of live) { try { l.n.stop(); } catch (e) { /* already stopped */ } } live.length = 0; };
  A.start = function (tl) {
    if (!ctx) return; A.stopAll(); if (ctx.state === 'suspended') ctx.resume();
    playing = true; t0 = tl; a0 = ctx.currentTime + 0.05; upTo = tl; idx = 0;
    while (idx < sorted.length && sorted[idx].t < tl) {
      const e = sorted[idx++];
      if (isLong(e) && e.t + e.d > tl + 0.2) { const rem = e.t + e.d - tl, c = Object.assign({}, e, { d: rem }); c.p = Object.assign({}, e.p, { d: rem, fadeIn: 0.4 }); fire(c, a0); }
    }
  };
  A.now = () => (playing && ctx ? t0 + (ctx.currentTime - a0) : null);
  A.running = () => !!(ctx && ctx.state === 'running');
  A.tick = function () {
    if (!playing || !ctx) return;
    const tl = A.now(), hor = tl + 0.3;
    while (idx < sorted.length && sorted[idx].t < hor) { const e = sorted[idx++]; if (e.t >= upTo - 0.001) fire(e, a0 + (e.t - t0)); }
    upTo = hor;
    if (live.length > 400) { const now = ctx.currentTime; for (let i = live.length - 1; i >= 0; i--) if (live[i].e < now) live.splice(i, 1); }
  };

  // ---------- offline render (for the video file) ----------
  // Renders in 15 s chunks with a 7 s pre-roll, so each OfflineAudioContext stays small.
  A.renderOffline = async function (dur, sr) {
    sr = sr || 44100; const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OAC) throw new Error('OfflineAudioContext is not available');
    const CH = 15, PRE = 7, total = Math.ceil(dur * sr), out = new Float32Array(total);
    const saved = [ctx, master, comp, mus, fxb, noiseBuf, pulse];
    try {
      for (let a = 0; a < dur; a += CH) {
        const b = Math.min(dur, a + CH), s0 = Math.max(0, a - PRE), off = new OAC(1, Math.ceil((b - s0) * sr), sr);
        ctx = off; buildGraph(off, off.destination, 0.9);
        for (const e of sorted) {
          if (e.t >= b) break;
          if (e.t >= s0) fire(e, e.t - s0);
          else if (isLong(e) && e.t + e.d > s0 + 0.2) { const rem = e.t + e.d - s0, c = Object.assign({}, e, { d: rem }); c.p = Object.assign({}, e.p, { d: rem, fadeIn: 0.01 }); fire(c, 0); }
        }
        live.length = 0;
        const buf = await off.startRendering(), data = buf.getChannelData(0), from = Math.round((a - s0) * sr), at = Math.round(a * sr), n = Math.min(Math.round((b - a) * sr), total - at, data.length - from);
        out.set(data.subarray(from, from + n), at);
      }
    } finally { [ctx, master, comp, mus, fxb, noiseBuf, pulse] = saved; }
    return out;
  };
  A.wav = function (f32, sr) {
    const n = f32.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf), ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const s = Math.max(-1, Math.min(1, f32[i] || 0)); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    return new Uint8Array(buf);
  };
})();
