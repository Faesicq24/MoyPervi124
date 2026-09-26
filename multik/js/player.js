/* VSPYSHKA - player.js: timeline, compositing, transitions, controls, WebM recording, offline render hooks (?render=1) */
(function () {
  'use strict';
  const M = window.M, W = M.W, H = M.H;
  const Q = new URLSearchParams(location.search), RENDER = Q.has('render');
  const PX = RENDER ? Math.max(1, Math.min(4, parseInt(Q.get('px') || '4', 10) || 4)) : 4, OW = W * PX, OH = H * PX;
  const scenes = M.SCENES; let total = 0;
  scenes.forEach((s) => { s.start = total; total += s.dur; });
  M.TOTAL = total;
  const out = document.getElementById('screen'); out.width = OW; out.height = OH;
  const og = out.getContext('2d');
  const world = M.canvas(W, H), ui = M.canvas(W, H), small = M.canvas(120, 68), bufA = M.canvas(OW, OH), bufB = M.canvas(OW, OH);
  scenes.forEach((s) => { try { if (s.au) s.au(M.A, s.start); } catch (e) { console.error('audio cues ' + s.name + ': ' + (e && e.stack ? e.stack : e)); } });
  M.A.prepare();
  const sceneAt = (t) => { for (let i = scenes.length - 1; i >= 0; i--) if (t >= scenes[i].start) return i; return 0; };

  function renderScene(sc, lt, tg) {
    const g = world.g, u = ui.g;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = false; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    u.setTransform(1, 0, 0, 1, 0, 0); u.globalAlpha = 1; u.globalCompositeOperation = 'source-over'; u.imageSmoothingEnabled = false; u.clearRect(0, 0, W, H);
    const cam = { zoom: 1, cx: W / 2, cy: H / 2, bloom: 0, flash: 0, shake: 0 };
    try { sc.draw(g, lt, cam, u); } catch (e) { if (!sc._err) { sc._err = 1; console.error('scene ' + sc.name + ' @' + lt.toFixed(2) + ': ' + (e && e.stack ? e.stack : e)); } }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; u.globalAlpha = 1; u.globalCompositeOperation = 'source-over';
    const z = Math.max(1, cam.zoom || 1), sw = W / z, sh = H / z;
    const sx = M.clamp((cam.cx || W / 2) - sw / 2, 0, W - sw), sy = M.clamp((cam.cy || H / 2) - sh / 2, 0, H - sh);
    let dx = 0, dy = 0; if (cam.shake) { const s = M.shake(lt, cam.shake, 5); dx = s[0] * PX; dy = s[1] * PX; }
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalAlpha = 1; tg.globalCompositeOperation = 'source-over'; tg.imageSmoothingEnabled = false;
    if (dx || dy) { tg.fillStyle = '#000'; tg.fillRect(0, 0, OW, OH); }
    tg.drawImage(world, sx, sy, sw, sh, dx, dy, OW, OH);
    if (cam.bloom > 0) {
      small.g.imageSmoothingEnabled = true; small.g.clearRect(0, 0, 120, 68); small.g.drawImage(world, sx, sy, sw, sh, 0, 0, 120, 68);
      tg.imageSmoothingEnabled = true; tg.globalCompositeOperation = 'lighter'; tg.globalAlpha = Math.min(1, cam.bloom); tg.drawImage(small, 0, 0, OW, OH);
      tg.globalAlpha = 1; tg.globalCompositeOperation = 'source-over'; tg.imageSmoothingEnabled = false;
    }
    tg.drawImage(ui, 0, 0, OW, OH);
    if (cam.flash > 0) { tg.globalAlpha = Math.min(1, cam.flash); tg.fillStyle = '#fff'; tg.fillRect(0, 0, OW, OH); tg.globalAlpha = 1; }
  }
  function dither(tg, level) {
    level = Math.max(0, Math.min(16, Math.round(level))); if (level <= 0) return;
    if (level >= 16) { tg.fillStyle = '#000'; tg.fillRect(0, 0, OW, OH); return; }
    tg.fillStyle = tg.createPattern(M.ditherTile(level, PX * 2), 'repeat'); tg.fillRect(0, 0, OW, OH);
  }
  function iris(tg, k, cx, cy) {
    if (k >= 1) return; const r = Math.max(0, k) * 300; tg.fillStyle = '#000';
    for (let y = 0; y < H; y++) {
      const d = y + 0.5 - cy; if (Math.abs(d) >= r) { tg.fillRect(0, y * PX, OW, PX); continue; }
      const hw = Math.sqrt(r * r - d * d), x0 = Math.max(0, Math.round(cx - hw)), x1 = Math.min(W, Math.round(cx + hw));
      if (x0 > 0) tg.fillRect(0, y * PX, x0 * PX, PX); if (x1 < W) tg.fillRect(x1 * PX, y * PX, (W - x1) * PX, PX);
    }
  }
  function frame(t) {
    t = M.clamp(t, 0, total - 0.001);
    const i = sceneAt(t), sc = scenes[i], lt = t - sc.start, nx = scenes[i + 1], td = sc.tdur || 0.8;
    if (sc.tin === 'cross' && i > 0 && lt < td) {
      const pv = scenes[i - 1]; renderScene(pv, pv.dur + lt, bufA.g); renderScene(sc, lt, bufB.g);
      og.globalAlpha = 1; og.globalCompositeOperation = 'source-over'; og.drawImage(bufA, 0, 0);
      const lvl = Math.round((lt / td) * 16);
      if (lvl > 0) { const b = bufB.g; if (lvl < 16) { b.globalCompositeOperation = 'destination-in'; b.fillStyle = b.createPattern(M.ditherTile(lvl, PX * 2), 'repeat'); b.fillRect(0, 0, OW, OH); b.globalCompositeOperation = 'source-over'; } og.drawImage(bufB, 0, 0); }
    } else renderScene(sc, lt, og);
    if (sc.tin === 'fade' && lt < 1) dither(og, (1 - lt) * 16);
    if (sc.tin === 'dither' && lt < 0.5) dither(og, (1 - lt / 0.5) * 16);
    if (nx && nx.tin === 'dither' && sc.dur - lt < 0.5) dither(og, (1 - (sc.dur - lt) / 0.5) * 16);
    if (sc.tin === 'iris' && lt < 0.7) { const p = sc.irisIn || [W / 2, H / 2]; iris(og, lt / 0.7, p[0], p[1]); }
    if (nx && nx.tin === 'iris' && sc.dur - lt < 0.7) { const p = sc.irisOut || [W / 2, H / 2]; iris(og, (sc.dur - lt) / 0.7, p[0], p[1]); }
    if (t > total - 0.8) dither(og, ((t - (total - 0.8)) / 0.8) * 16);
  }

  if (RENDER) { // hooks for multik/render/render.mjs
    window.__total = total;
    window.__drawAt = (t) => { frame(t); return true; };
    window.__frameAt = (t) => { frame(t); return out.toDataURL('image/png'); };
    window.__prepAudio = async () => { const f = await M.A.renderOffline(total, 44100); window.__wav = M.A.wav(f, 44100); return window.__wav.length; };
    window.__wavChunk = (i, size) => { const b = window.__wav.subarray(i * size, (i + 1) * size); let s = ''; for (let k = 0; k < b.length; k += 0x8000) s += String.fromCharCode.apply(null, b.subarray(k, k + 0x8000)); return btoa(s); };
    const st = document.getElementById('start'); if (st) st.style.display = 'none';
    window.__ready = true;
    return;
  }

  // ---------- controls ----------
  const $ = (id) => document.getElementById(id);
  const startEl = $('start'), playBtn = $('play'), timeEl = $('time'), seekEl = $('seek'), fillEl = $('fill'), tipEl = $('tip'), muteBtn = $('mute'), fsBtn = $('fs'), recInd = $('rec-ind');
  const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  scenes.forEach((s, i) => { if (i === 0) return; const d = document.createElement('div'); d.className = 'tick'; d.style.left = (s.start / total) * 100 + '%'; seekEl.appendChild(d); });
  let playing = false, started = false, tNow = 7.4, last = performance.now(), useAudio = false, stuck = 0, recorder = null;
  if (Q.has('t')) { tNow = M.clamp(parseFloat(Q.get('t')) || 0, 0, total); started = true; }
  function play() {
    if (!started) { started = true; tNow = 0; }
    if (tNow >= total - 0.05) tNow = 0;
    useAudio = !!M.A.init(); stuck = 0;
    if (useAudio) M.A.start(tNow);
    playing = true; last = performance.now(); startEl.style.display = 'none'; playBtn.textContent = '\u275a\u275a';
  }
  function pause() { playing = false; M.A.stopAll(); playBtn.textContent = '\u25b6'; }
  function seek(t) { if (!started) started = true; tNow = M.clamp(t, 0, total); if (playing && useAudio) M.A.start(tNow); }
  function ended() {
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    startEl.style.display = 'flex'; $('bigplay').textContent = '\u25b6 \u0421\u041c\u041e\u0422\u0420\u0415\u0422\u042c \u0421\u041d\u041e\u0412\u0410';
  }
  function loop(ts) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.1, Math.max(0, (ts - last) / 1000)); last = ts;
    if (playing) {
      if (useAudio) {
        if (!M.A.running()) { stuck += dt; tNow += dt; if (stuck > 1.0) { useAudio = false; M.A.stopAll(); } }
        else { if (stuck > 0) { stuck = 0; M.A.start(tNow); } const at = M.A.now(); if (at !== null) tNow = Math.max(0, at); M.A.tick(); }
      } else tNow += dt;
      if (tNow >= total) { tNow = total; pause(); ended(); }
    }
    frame(tNow);
    timeEl.textContent = fmt(started ? tNow : 0) + ' / ' + fmt(total); fillEl.style.width = (started ? tNow / total : 0) * 100 + '%';
  }
  function record() {
    if (!window.MediaRecorder || !out.captureStream) { alert('\u042d\u0442\u043e\u0442 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043d\u0435 \u0443\u043c\u0435\u0435\u0442 \u0437\u0430\u043f\u0438\u0441\u044b\u0432\u0430\u0442\u044c \u0432\u0438\u0434\u0435\u043e. \u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u0432 Chrome \u0438\u043b\u0438 Edge.'); return; }
    const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const mime = types.find((t) => MediaRecorder.isTypeSupported(t)); if (!mime) { alert('\u0417\u0430\u043f\u0438\u0441\u044c \u0432\u0438\u0434\u0435\u043e \u043d\u0435 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044f.'); return; }
    if (playing) pause();
    M.A.init();
    const tracks = out.captureStream(60).getVideoTracks(), as = M.A.recStream(); if (as) as.getAudioTracks().forEach((tr) => tracks.push(tr));
    const rec = new MediaRecorder(new MediaStream(tracks), { mimeType: mime, videoBitsPerSecond: 16000000 }), chunks = [];
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => { const blob = new Blob(chunks, { type: mime.split(';')[0] }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vspyshka.' + (mime.indexOf('mp4') >= 0 ? 'mp4' : 'webm'); document.body.appendChild(a); a.click(); a.remove(); recorder = null; recInd.style.display = 'none'; document.body.classList.remove('recording'); };
    recorder = rec; recInd.style.display = 'block'; document.body.classList.add('recording');
    started = true; tNow = 0; rec.start(1000); play();
  }
  $('bigplay').onclick = play; $('recbtn').onclick = record; $('rec').onclick = record;
  playBtn.onclick = () => (playing ? pause() : play());
  muteBtn.onclick = () => { M.A.setMuted(!M.A.muted); muteBtn.textContent = M.A.muted ? '\u0411\u0415\u0417 \u0417\u0412\u0423\u041a\u0410' : '\u0417\u0412\u0423\u041a'; };
  fsBtn.onclick = () => { const st = $('stage'); if (document.fullscreenElement) document.exitFullscreen(); else if (st.requestFullscreen) st.requestFullscreen(); };
  const seekAt = (e) => { const r = seekEl.getBoundingClientRect(); return M.clamp((e.clientX - r.left) / r.width, 0, 1) * total; };
  let dragging = false;
  seekEl.addEventListener('pointerdown', (e) => { dragging = true; seek(seekAt(e)); });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointermove', (e) => { if (dragging) seek(seekAt(e)); });
  seekEl.addEventListener('mousemove', (e) => { const t = seekAt(e); tipEl.style.display = 'block'; tipEl.style.left = (t / total) * 100 + '%'; tipEl.textContent = fmt(t) + '  ' + scenes[sceneAt(t)].name; });
  seekEl.addEventListener('mouseleave', () => { tipEl.style.display = 'none'; });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); if (playing) pause(); else play(); }
    else if (e.code === 'ArrowRight') seek(tNow + 5); else if (e.code === 'ArrowLeft') seek(tNow - 5);
    else if (e.code === 'KeyF') fsBtn.onclick(); else if (e.code === 'KeyM') muteBtn.onclick();
  });
  requestAnimationFrame(loop);
})();
