/**
 * Render the animated logo sequence to a PNG frame sequence, so it can be
 * assembled into an MP4 in any editor.
 *
 * Usage: node brand/src/intro-frames.js [fps] [scale]
 */
const fs = require('fs');
const path = require('path');
const { intro, DUR } = require('./intro');

async function main() {
  const fps = parseInt(process.argv[2] || '25', 10);
  const scale = parseFloat(process.argv[3] || '0.5');
  const puppeteer = require('./render').loadPuppeteer();
  const chrome = require('./render').findChrome();
  if (!puppeteer || !chrome) { console.error('need Chromium to render frames'); process.exit(1); }

  const W = Math.round(1920 * scale), H = Math.round(1080 * scale);
  const outDir = path.join(__dirname, '..', 'out', 'frames');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const svg = intro({ width: 1920, height: 1080 });
  const tmp = path.join(require('os').tmpdir(), 'jsa-intro-frames.svg');
  fs.writeFileSync(tmp, svg);

  const browser = await puppeteer.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files']
  });
  const total = Math.round(DUR * fps);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    await page.goto('file://' + tmp, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => document.documentElement.pauseAnimations());
    for (let i = 0; i < total; i++) {
      const t = i / fps;
      await page.evaluate(tt => document.documentElement.setCurrentTime(tt), t);
      await new Promise(r => setTimeout(r, 45));
      const name = 'frame-' + String(i).padStart(4, '0') + '.png';
      await page.screenshot({ path: path.join(outDir, name) });
      if (i % 10 === 0) process.stdout.write('  ' + name + '\n');
    }
  } finally {
    await browser.close();
    try { fs.unlinkSync(tmp); } catch (e) { /* ignore */ }
  }
  console.log('Wrote ' + total + ' frames (' + W + 'x' + H + ') to brand/out/frames');
}

main().catch(e => { console.error(e.message); process.exit(1); });
