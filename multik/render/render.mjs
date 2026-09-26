// Offline renderer for multik/: headless Chrome draws every frame deterministically,
// the soundtrack is rendered with OfflineAudioContext, ffmpeg assembles the MP4.
// MODE=smoke  - draws the timeline every 0.2 s and fails on any JS error (fast check)
// MODE=full   - renders audio + all frames and encodes out/vspyshka.mp4
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.join(here, 'out');
const framesDir = path.join(outDir, 'frames');
const MODE = process.env.MODE || 'full';
const FPS = Number(process.env.FPS || 30);
const WORKERS = Number(process.env.WORKERS || 4);
const PX = Number(process.env.PX || 2);
const url = pathToFileURL(path.join(root, 'index.html')).href + '?render=1&px=' + PX;
const errors = [];
fs.mkdirSync(framesDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  protocolTimeout: 900000,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--mute-audio'],
});

async function openPage(tag) {
  const page = await browser.newPage();
  page.on('pageerror', (e) => errors.push(`[${tag}] pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${tag}] ${m.text()}`); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });
  return page;
}

async function run(times, drawOnly) {
  let next = 0, done = 0;
  const t0 = Date.now();
  async function worker(w) {
    const page = await openPage('w' + w);
    for (;;) {
      const i = next++;
      if (i >= times.length) break;
      if (drawOnly) await page.evaluate((t) => window.__drawAt(t), times[i]);
      else {
        const data = await page.evaluate((t) => window.__frameAt(t), times[i]);
        fs.writeFileSync(path.join(framesDir, 'f' + String(i).padStart(5, '0') + '.png'), Buffer.from(data.slice(data.indexOf(',') + 1), 'base64'));
      }
      done++;
      if (done % 500 === 0) console.log(`frames ${done}/${times.length} (${Math.round((Date.now() - t0) / 1000)} s)`);
    }
    await page.close();
  }
  await Promise.all(Array.from({ length: WORKERS }, (_, w) => worker(w)));
}

function ffmpeg(args) {
  return new Promise((res, rej) => {
    const p = spawn('ffmpeg', args, { stdio: 'inherit' });
    p.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exited with code ' + c))));
  });
}

let failed = false;
try {
  const probe = await openPage('probe');
  const total = await probe.evaluate(() => window.__total);
  console.log('Duration:', total, 's, mode:', MODE);
  if (MODE === 'smoke') {
    await probe.close();
    const times = [];
    for (let t = 0; t < total; t += 0.2) times.push(Math.round(t * 1000) / 1000);
    await run(times, true);
  } else {
    console.log('Rendering audio...');
    const len = await probe.evaluate(() => window.__prepAudio());
    const CH = 1 << 21, parts = [];
    for (let i = 0; i * CH < len; i++) parts.push(Buffer.from(await probe.evaluate((a, b) => window.__wavChunk(a, b), i, CH), 'base64'));
    fs.writeFileSync(path.join(outDir, 'audio.wav'), Buffer.concat(parts));
    await probe.close();
    console.log('Audio written:', len, 'bytes');
    const n = Math.round(total * FPS), times = [];
    for (let i = 0; i < n; i++) times.push(i / FPS);
    await run(times, false);
    console.log('Encoding MP4...');
    await ffmpeg(['-y', '-hide_banner', '-loglevel', 'warning', '-framerate', String(FPS), '-i', path.join(framesDir, 'f%05d.png'), '-i', path.join(outDir, 'audio.wav'),
      '-vf', 'scale=1920:1080:flags=neighbor', '-c:v', 'libx264', '-preset', 'medium', '-tune', 'animation', '-crf', '19', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', path.join(outDir, 'vspyshka.mp4')]);
    await ffmpeg(['-y', '-hide_banner', '-loglevel', 'warning', '-ss', '100', '-i', path.join(outDir, 'vspyshka.mp4'), '-frames:v', '1', path.join(outDir, 'poster.png')]).catch(() => {});
    console.log('Done:', fs.statSync(path.join(outDir, 'vspyshka.mp4')).size, 'bytes');
  }
} catch (e) {
  errors.push('fatal: ' + (e && e.stack ? e.stack : e));
  failed = true;
} finally {
  await browser.close().catch(() => {});
}
const uniq = [...new Set(errors)];
fs.writeFileSync(path.join(outDir, 'errors.txt'), uniq.length ? uniq.join('\n') + '\n' : '');
if (uniq.length) { console.log('==== ERRORS (' + uniq.length + ') ===='); for (const e of uniq) console.log(e); }
else console.log('No errors.');
if (failed || (MODE === 'smoke' && uniq.length > 0)) process.exit(1);
