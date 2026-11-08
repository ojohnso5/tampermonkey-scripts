#!/usr/bin/env node
/**
 * Proves the banner artwork sits inside YouTube's visible safe area.
 *
 * YouTube crops banners differently per device; the worst case keeps only
 * x 507-2053, y 423-1017 of a 2560x1440 image. Anything outside that region
 * can be cut off on phones, TVs or in the mobile app.
 *
 * The check renders a "layout probe" version of the banner (decorative
 * layers removed) and measures the actual pixel bounding box of the crest,
 * the wordmark and the descriptor. It measures reality rather than trusting
 * a hand-maintained table of coordinates.
 *
 * Usage: node brand/src/safearea.js [variant]
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { banner, VARIANTS } = require('./banner');
const { loadFits } = require('./fit');

const AREA = { x0: 507, x1: 2053, y0: 423, y1: 1017 };

async function measure(variant) {
  const fit = loadFits()[variant] || { typeScale: 1, tagScale: 1 };
  const svg = banner({
    width: 2560, height: 1440, variant, probe: true,
    typeScale: fit.typeScale, tagScale: fit.tagScale
  });
  const { render } = require('./render');
  const tmp = path.join(os.tmpdir(), 'jsa-safearea-' + variant + '.png');
  await render(svg, tmp, { width: 2560, height: 1440, transparent: true });
  const { contentBox } = require('./raster');
  const box = await contentBox(tmp);
  fs.unlinkSync(tmp);
  return box;
}

async function main() {
  const only = process.argv[2];
  const variants = only ? [only] : Object.keys(VARIANTS);
  let failed = 0;

  console.log('YouTube banner safe area: x ' + AREA.x0 + '-' + AREA.x1 + ', y ' + AREA.y0 + '-' + AREA.y1);
  console.log('');

  for (const v of variants) {
    const b = await measure(v);
    const problems = [];
    if (b.maxx < 0) {
      problems.push('no content was rendered — the probe came back empty');
    } else {
      if (b.minx < AREA.x0) problems.push('left edge ' + b.minx + ' < ' + AREA.x0);
      if (b.maxx > AREA.x1) problems.push('right edge ' + b.maxx + ' > ' + AREA.x1);
      if (b.miny < AREA.y0) problems.push('top edge ' + b.miny + ' < ' + AREA.y0);
      if (b.maxy > AREA.y1) problems.push('bottom edge ' + b.maxy + ' > ' + AREA.y1);
    }

    console.log((v === 'primary' ? 'banner' : 'banner-' + v) +
      '  measured content  x ' + b.minx + '-' + b.maxx + '  y ' + b.miny + '-' + b.maxy);
    if (!problems.length) {
      console.log('  PASS');
    } else {
      failed++;
      problems.forEach(p => console.log('  FAIL — ' + p));
    }
  }
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
