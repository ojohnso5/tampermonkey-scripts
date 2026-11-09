/**
 * Auto-fits banner type to YouTube's safe area.
 *
 * The wordmark and descriptor are measured in the browser (real font
 * metrics, not guesses), then scaled down until the widest line sits inside
 * the safe area. Different banner variants carry different amounts of copy,
 * so each one gets its own fit.
 */
const fs = require('fs');
const path = require('path');
const { banner, VARIANTS } = require('./banner');
const { measureText } = require('./render');

const FITS_FILE = path.join(__dirname, '..', 'src', 'fits.json');

const { AREA } = require('./safearea-spec');
const TYPE_X = 1300;
const MIN_TYPE = 72;      // never shrink the display type below this
const MIN_TAG = 13;

async function fitVariant(variant) {
  let typeScale = 1, tagScale = 1;

  for (let attempt = 0; attempt < 14; attempt++) {
    const svg = banner({
      width: 2560, height: 1440, variant,
      idPrefix: 'FIT' + attempt, probe: true, typeScale, tagScale
    });
    const texts = await measureText(svg);
    if (!texts.length) break;

    let typeOverflow = 0, tagOverflow = 0;
    texts.forEach(t => {
      const right = t.x + t.width;
      if (right > AREA.x1) {
        if (t.fontSize > 50) typeOverflow = Math.max(typeOverflow, right - AREA.x1);
        else tagOverflow = Math.max(tagOverflow, right - AREA.x1);
      }
    });

    if (!typeOverflow && !tagOverflow) break;

    if (typeOverflow) {
      const widest = Math.max(...texts.filter(t => t.fontSize > 50).map(t => t.x + t.width));
      const avail = AREA.x1 - TYPE_X;
      typeScale = Math.max(MIN_TYPE / 124, typeScale * (avail / (widest - TYPE_X)) * 0.995);
    }
    if (tagOverflow) {
      const widest = Math.max(...texts.filter(t => t.fontSize <= 50).map(t => t.x + t.width));
      const avail = AREA.x1 - TYPE_X;
      tagScale = Math.max(MIN_TAG / 27, tagScale * (avail / (widest - TYPE_X)) * 0.995);
    }
  }

  return {
    variant,
    typeScale: Math.round(typeScale * 1000) / 1000,
    tagScale: Math.round(tagScale * 1000) / 1000
  };
}

async function fitAll() {
  const out = {};
  for (const v of Object.keys(VARIANTS)) {
    out[v] = await fitVariant(v);
    console.log('  ' + v.padEnd(16) + ' type x' + out[v].typeScale.toFixed(3) +
      '  tag x' + out[v].tagScale.toFixed(3));
  }
  return out;
}

/** Load the saved fit table, or an identity fit if none exists yet. */
function loadFits() {
  if (!fs.existsSync(FITS_FILE)) {
    const out = {};
    Object.keys(VARIANTS).forEach(v => { out[v] = { variant: v, typeScale: 1, tagScale: 1 }; });
    return out;
  }
  return JSON.parse(fs.readFileSync(FITS_FILE, 'utf8'));
}

module.exports = { fitAll, fitVariant, loadFits, FITS_FILE, AREA };

if (require.main === module) {
  console.log('Fitting banner type to the safe area:');
  fitAll().then(r => {
    fs.writeFileSync(FITS_FILE, JSON.stringify(r, null, 2));
    console.log('\nSaved to ' + path.relative(process.cwd(), FITS_FILE));
  }).catch(e => { console.error(e.message); process.exit(1); });
}
