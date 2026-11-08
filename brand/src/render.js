/**
 * SVG -> PNG renderer using headless Chromium.
 * Kept dependency-light: it drives whatever puppeteer-core is resolvable.
 */
const fs = require('fs');
const path = require('path');

function loadPuppeteer() {
  const candidates = [
    'puppeteer-core', 'puppeteer',
    '/tmp/t/node_modules/puppeteer-core',
    '/tmp/node_modules/puppeteer-core'
  ];
  for (const c of candidates) {
    try { return require(c); } catch (e) { /* keep looking */ }
  }
  return null;
}

function findChrome() {
  const env = process.env.CHROME_PATH;
  if (env && fs.existsSync(env)) return env;
  const paths = [
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable', '/snap/bin/chromium'
  ];
  for (const p of paths) if (fs.existsSync(p)) return p;
  return null;
}

/**
 * Render an SVG string to PNG.
 * @param {string} svg
 * @param {string} outPath
 * @param {object} opts { width, height, scale, transparent, background }
 */
async function render(svg, outPath, opts) {
  opts = Object.assign({ width: 1024, height: 1024, scale: 1, transparent: false, background: '#0B0B0F' }, opts);
  const puppeteer = loadPuppeteer();
  if (!puppeteer) throw new Error('puppeteer-core not available for PNG rendering');
  const chrome = findChrome();
  if (!chrome) throw new Error('no Chromium binary found');

  const browser = await puppeteer.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--force-device-scale-factor=1']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: opts.width, height: opts.height, deviceScaleFactor: opts.scale });
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;background:${opts.transparent ? 'transparent' : opts.background};}
      svg{display:block;width:${opts.width}px;height:${opts.height}px;}
      @media print { body{-webkit-print-color-adjust:exact;} }
    </style></head><body>${svg}</body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 260));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await page.screenshot({ path: outPath, omitBackground: !!opts.transparent });
    return outPath;
  } finally {
    await browser.close();
  }
}

/** Render several SVGs in one browser session (much faster). */
async function renderBatch(items) {
  const puppeteer = loadPuppeteer();
  if (!puppeteer) throw new Error('puppeteer-core not available for PNG rendering');
  const chrome = findChrome();
  if (!chrome) throw new Error('no Chromium binary found');
  const browser = await puppeteer.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--force-device-scale-factor=1']
  });
  const done = [];
  try {
    for (const it of items) {
      const opts = it.opts || {};
      const width = opts.width || 1024, height = opts.height || 1024, scale = opts.scale || 1;
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: scale });
      const html = `<!doctype html><html><head><meta charset="utf-8"><style>
        html,body{margin:0;padding:0;background:${opts.transparent ? 'transparent' : (opts.background || '#0B0B0F')};}
        svg{display:block;width:${width}px;height:${height}px;}
      </style></head><body>${it.svg}</body></html>`;
      await page.setContent(html, { waitUntil: 'load' });
      await new Promise(r => setTimeout(r, it.wait || 240));
      fs.mkdirSync(path.dirname(it.out), { recursive: true });
      await page.screenshot({ path: it.out, omitBackground: !!opts.transparent });
      await page.close();
      done.push(it.out);
    }
  } finally {
    await browser.close();
  }
  return done;
}

/**
 * Measure the rendered width of every <text> element in an SVG.
 * Returns [{ text, width, x, y, fontSize }].
 */
async function measureText(svg) {
  const puppeteer = loadPuppeteer();
  if (!puppeteer) throw new Error('puppeteer-core not available');
  const chrome = findChrome();
  if (!chrome) throw new Error('no Chromium binary found');
  const browser = await puppeteer.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 2600, height: 1500 });
    // Load the SVG as a real SVG document rather than inlining it into HTML.
    // In HTML the SVG parser treats <style> content as raw text, which breaks
    // the CDATA-wrapped @font-face block and silently changes text metrics.
    const tmp = path.join(require('os').tmpdir(), 'jsa-measure-' + Date.now() + '.svg');
    fs.writeFileSync(tmp, svg);
    await page.goto('file://' + tmp, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 420));
    const cleanup = () => { try { fs.unlinkSync(tmp); } catch (e) { /* ignore */ } };
    return await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('text').forEach(t => {
        let len = 0;
        try { len = t.getComputedTextLength(); } catch (e) { len = 0; }
        out.push({
          text: (t.textContent || '').trim(),
          width: Math.round(len),
          x: parseFloat(t.getAttribute('x') || '0'),
          y: parseFloat(t.getAttribute('y') || '0'),
          fontSize: parseFloat(t.getAttribute('font-size') || '0')
        });
      });
      return out;
    }).finally(cleanup);
  } finally {
    await browser.close();
  }
}

module.exports = { render, renderBatch, measureText, findChrome, loadPuppeteer };
