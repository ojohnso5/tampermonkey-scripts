#!/usr/bin/env node
/**
 * JSA brand package builder.
 *
 * Regenerates every asset from the single source of truth in src/.
 *
 *   node brand/build.js            # SVGs only (no browser needed)
 *   node brand/build.js --png      # SVGs + PNG renders (needs Chromium)
 */
const fs = require('fs');
const path = require('path');

const { crest } = require('./src/crest');
const { banner } = require('./src/banner');
const { watermark } = require('./src/watermark');
const { thumbnail } = require('./src/thumbnail');
const { endScreen } = require('./src/endscreen');
const { intro } = require('./src/intro');

const OUT = path.join(__dirname, 'out');
const WANT_PNG = process.argv.includes('--png');

function write(name, content) {
  fs.mkdirSync(OUT, { recursive: true });
  const p = path.join(OUT, name);
  fs.writeFileSync(p, content);
  console.log('  svg  ' + path.relative(process.cwd(), p));
  return p;
}

/* ------------------------------------------------------------------ */
const assets = [];
const pngJobs = [];

function add(name, svg, png) {
  write(name, svg);
  if (png) assets.push({ name, svg, png });
}

/* ---- 1. Primary crest ------------------------------------------- */
add('logo-crest.svg', crest({ size: 1024 }),
  { file: 'logo-crest-1024.png', width: 1024, height: 1024 });

/* ---- 2. Crest variants ------------------------------------------- */
add('logo-crest-transparent.svg', crest({ size: 1024, transparent: true }),
  { file: 'logo-crest-transparent-1024.png', width: 1024, height: 1024, transparent: true });

add('logo-crest-dark.svg', crest({ size: 1024, idPrefix: 'D' }),
  { file: 'logo-crest-dark-1024.png', width: 1024, height: 1024, background: '#0B0B0F' });

/* ---- 3. Channel banner + variants -------------------------------- */
// Each variant carries different copy, so the type is auto-fitted to
// YouTube's safe area (see src/fit.js). Fits are cached in src/fits.json.
const FITS = require('./src/fit').loadFits();
Object.keys(require('./src/banner').VARIANTS).forEach(v => {
  const isPrimary = v === 'primary';
  const fit = FITS[v] || { typeScale: 1, tagScale: 1 };
  add((isPrimary ? 'banner' : 'banner-' + v) + '.svg',
    banner({
      width: 2560, height: 1440,
      idPrefix: 'B' + v.charAt(0).toUpperCase(),
      variant: v, typeScale: fit.typeScale, tagScale: fit.tagScale
    }),
    { file: (isPrimary ? 'banner' : 'banner-' + v) + '-2560x1440.png', width: 2560, height: 1440 });
});

/* ---- 4. Video watermark ------------------------------------------ */
add('watermark.svg', watermark({ size: 512 }),
  { file: 'watermark-512.png', width: 512, height: 512, transparent: true });

/* ---- 5. End screen ----------------------------------------------- */
add('end-screen.svg', endScreen({ width: 1920, height: 1080 }),
  { file: 'end-screen-1920x1080.png', width: 1920, height: 1080 });

/* ---- 6. Intro animation ------------------------------------------ */
add('intro.svg', intro({ width: 1920, height: 1080 }));

/* ---- 7. Thumbnail system ----------------------------------------- */
const THUMBS = [
  { file: 'thumb-exposed', headline: 'EXPOSED', kicker: 'JSA INVESTIGATION', variant: 'alert' },
  { file: 'thumb-who-profits', headline: 'WHO PROFITS?', kicker: 'FOLLOW THE PAPER TRAIL', variant: 'default' },
  { file: 'thumb-they-lied', headline: 'THEY LIED', kicker: 'DOCUMENTED', variant: 'alert' },
  { file: 'thumb-accountability', headline: 'ACCOUNTABILITY NOW', kicker: 'THE WEEK IN REVIEW', variant: 'investigation' },
  { file: 'thumb-follow-money', headline: 'FOLLOW THE MONEY', kicker: 'JSA INVESTIGATION', variant: 'default' }
];
THUMBS.forEach(t => {
  add(t.file + '.svg', thumbnail({ headline: t.headline, kicker: t.kicker, variant: t.variant }),
    { file: t.file + '-1280x720.png', width: 1280, height: 720 });
});

/* ---- 8. Avatar sizes (YouTube wants 800x800) --------------------- */
[800, 400, 256, 128, 64].forEach(sz => {
  pngJobs.push({
    svg: crest({ size: sz }),
    out: path.join(OUT, 'avatar-' + sz + '.png'),
    opts: { width: sz, height: sz }
  });
});

/* ---- 9. Favicon / app icon --------------------------------------- */
add('icon-192.svg', crest({ size: 512, idPrefix: 'I' }),
  { file: 'icon-192.png', width: 192, height: 192 });
add('icon-512.svg', crest({ size: 512, idPrefix: 'I5' }),
  { file: 'icon-512.png', width: 512, height: 512 });

/* ---- 10. Manifest ----------------------------------------------- */
const manifest = {
  brand: 'Justice Society of Activism',
  generated: new Date().toISOString(),
  palette: {
    midnight: '#0B0B0F', red: '#E11937', gold: '#D4AF37', blue: '#00AEEF'
  },
  assets: assets.map(a => ({
    svg: a.name,
    png: a.png ? a.png.file : null,
    size: a.png ? a.png.width + 'x' + a.png.height : null
  }))
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('  json out/manifest.json');

/* ---- PNG rendering ---------------------------------------------- */
if (WANT_PNG) {
  const { renderBatch } = require('./src/render');
  const jobs = [];

  assets.forEach(a => {
    if (!a.png) return;
    jobs.push({
      svg: a.svg,
      out: path.join(OUT, a.png.file),
      opts: Object.assign({ width: a.png.width, height: a.png.height }, a.png)
    });
  });
  pngJobs.forEach(j => jobs.push(j));

  console.log('\nRendering ' + jobs.length + ' PNG files...');
  renderBatch(jobs)
    .then(files => {
      files.forEach(f => console.log('  png  ' + path.relative(process.cwd(), f)));
      console.log('\nDone.');
    })
    .catch(e => { console.error('PNG rendering failed:', e.message); process.exit(1); });
} else {
  console.log('\nDone (SVG only). Re-run with --png to render PNGs.');
}
