/**
 * Embeds the built brand assets into the Tampermonkey userscript.
 *
 * The userscript runs on youtube.com, whose Content-Security-Policy blocks
 * images from raw.githubusercontent.com. Rather than fight that, the art is
 * inlined as data URIs — so the script also works offline and before the
 * repo is published.
 *
 * Run: node brand/build.js --embed
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'brand', 'out');
const TARGET = path.join(ROOT, 'scripts', 'justice-society-studio.user.js');

/** file name in brand/out  ->  key in the userscript's BRAND_ASSETS map */
const MAP = {
  'logo-crest-transparent.svg': 'crest.svg',
  'watermark.svg': 'watermark.svg',
  'banner.svg': 'banner.svg',
  'banner-new-episode.svg': 'banner-new-episode.svg',
  'banner-season-two.svg': 'banner-season-two.svg',
  'banner-membership.svg': 'banner-membership.svg',
  'banner-paper-trail.svg': 'banner-paper-trail.svg',
  'icon-512.svg': 'icon-512.svg'
};

/** The banner list shown in the userscript's Channel setup panel. */
const BANNER_LIST = [
  { f: 'banner.svg', n: 'Primary', d: 'Justice Society of Activism' },
  { f: 'banner-new-episode.svg', n: 'New episode', d: 'Every Thursday drop' },
  { f: 'banner-season-two.svg', n: 'Season two', d: 'The Quiet Auction' },
  { f: 'banner-membership.svg', n: 'Membership', d: 'Member-funded news' },
  { f: 'banner-paper-trail.svg', n: 'Paper trail', d: 'Records reporting' }
];

function dataUri(file) {
  const raw = fs.readFileSync(file).toString('base64');
  return 'data:image/svg+xml;charset=utf-8,' + raw;
}

function build() {
  if (!fs.existsSync(OUT)) {
    console.error('brand/out not found — run `node brand/build.js` first.');
    process.exit(1);
  }
  let src = fs.readFileSync(TARGET, 'utf8');

  const entries = [];
  for (const [file, key] of Object.entries(MAP)) {
    const p = path.join(OUT, file);
    if (!fs.existsSync(p)) {
      console.error('missing asset: ' + file);
      process.exit(1);
    }
    entries.push({ key, uri: dataUri(p) });
  }

  const block =
    "  const BRAND_ASSETS = {\n" +
    entries.map(e => "    '" + e.key + "': '" + e.uri + "'").join(',\n') +
    "\n  };\n";

  const start = src.indexOf('  const BRAND_ASSETS = {');
  const endMarker = '\n  };\n';
  const end = src.indexOf(endMarker, start);
  if (start === -1 || end === -1) {
    console.error('could not locate BRAND_ASSETS in the userscript');
    process.exit(1);
  }
  src = src.slice(0, start) + block + src.slice(end + endMarker.length);

  // the banner-variant list must match the files we actually ship
  src = src.replace(
    /const BANNERS = \[[\s\S]*?\];/,
    "const BANNERS = [\n" +
    BANNER_LIST.map(b => "    { f: '" + b.f + "', n: '" + b.n + "', d: '" + b.d + "' }").join(',\n') +
    "\n  ];"
  );

  fs.writeFileSync(TARGET, src);
  console.log('Embedded ' + entries.length + ' brand assets into ' + path.relative(ROOT, TARGET));
  console.log('  ' + entries.map(e => e.key + ' (' + Math.round(e.uri.length / 1024) + ' KB)').join('\n  '));
}

build();
