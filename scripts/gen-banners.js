#!/usr/bin/env node
/**
 * Generates Justice Society of Activism channel banners (2560x1440).
 *
 * YouTube crops banner art differently on every device. The visible "safe area"
 * is x 507-2053, y 423-1017. All variants place the seal and wordmark inside it.
 *
 * Usage: node scripts/gen-banners.js
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'brand');
const W = 2560, H = 1440;

// layout, all inside the safe area
const SEAL_SCALE = 0.68;
const SEAL_X = 560, SEAL_Y = 520;
const TEXT_X = 380;          // relative to group
const LINE1_Y = 150, LINE2_Y = 270, TAG_Y = 336;
const WORD_FONT = 112, TAG_FONT = 34;

const seal = (scale) => `
    <g transform="scale(${scale})">
      <path d="M256 96 396 158v116c0 84-58 128-140 158-82-30-140-74-140-158V158z" fill="#ffb703"/>
      <path d="M256 132 366 182v92c0 66-45 100-110 126-65-26-110-60-110-126v-92z" fill="#0a0a0c"/>
      <path d="M196 236h120l-16-58h-24l-8 28h-24l-8-28h-24z" fill="#ffb703"/>
      <path d="M206 250h100v14H206zm0 30h100v14H206z" fill="#f5f5f7"/>
      <path d="M256 262v66" stroke="#f5f5f7" stroke-width="12" stroke-linecap="round"/>
      <circle cx="256" cy="336" r="16" fill="#ef233c"/>
    </g>`;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function banner({ file, line1, line2, tag, accent = '#ef233c', topBar = '#ef233c', bottomBar = '#ffb703' }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(line1 + ' ' + line2)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a0a0c"/><stop offset=".55" stop-color="#171320"/><stop offset="1" stop-color="#0a0a0c"/></linearGradient>
    <radialGradient id="glow" cx=".74" cy=".45" r=".5"><stop offset="0" stop-color="${accent}" stop-opacity=".38"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glow2" cx=".12" cy=".75" r=".5"><stop offset="0" stop-color="#ffb703" stop-opacity=".28"/><stop offset="1" stop-color="#ffb703" stop-opacity="0"/></radialGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2" fill="#ffffff" opacity=".06"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>
  <g opacity=".12" stroke="#ffffff" stroke-width="3">
    <path d="M0 1120 L2560 340"/><path d="M0 1300 L2560 520"/><path d="M0 940 L2560 160"/>
  </g>

  <g transform="translate(${SEAL_X} ${SEAL_Y})">
    ${seal(SEAL_SCALE)}
    <g font-family="Archivo, Helvetica, Arial, sans-serif" font-weight="900" letter-spacing="-2">
      <text x="${TEXT_X}" y="${LINE1_Y}" fill="#f5f5f7" font-size="${WORD_FONT}">${esc(line1)}</text>
      <text x="${TEXT_X}" y="${LINE2_Y}" fill="${accent}" font-size="${WORD_FONT}">${esc(line2)}</text>
    </g>
    <text x="${TEXT_X + 6}" y="${TAG_Y}" fill="#cfcfd8" font-family="Helvetica, Arial, sans-serif" font-size="${TAG_FONT}" letter-spacing="9">${esc(tag)}</text>
  </g>

  <g transform="translate(1810 640)" fill="none" stroke="#ffb703" stroke-width="8" opacity=".7">
    <circle cx="160" cy="160" r="150"/><circle cx="160" cy="160" r="120"/>
    <path d="M160 60v200M60 160h200" opacity=".3"/>
  </g>

  <rect x="0" y="0" width="${W}" height="10" fill="${topBar}"/>
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="${bottomBar}"/>
</svg>
`;
  fs.writeFileSync(path.join(OUT, file), svg);
  console.log('wrote', path.join('brand', file));
}

const VARIANTS = [
  { file: 'banner.svg', line1: 'JUSTICE SOCIETY', line2: 'OF ACTIVISM', tag: 'EVIDENCE • AMPLITUDE • ACTION' },
  { file: 'banner-new-episode.svg', line1: 'NEW DOCUMENTARY', line2: 'EVERY THURSDAY', tag: 'EVIDENCE • AMPLITUDE • ACTION', accent: '#ffb703', topBar: '#ffb703' },
  { file: 'banner-membership.svg', line1: 'MEMBER FUNDED', line2: 'INDEPENDENT NEWS', tag: 'NO OWNERS • NO SPONSORS • NO LOBBISTS', accent: '#00b4d8', topBar: '#00b4d8', bottomBar: '#00c07f' },
  { file: 'banner-season.svg', line1: 'SEASON TWO', line2: 'THE QUIET AUCTION', tag: 'WHO OWNS YOUR WATER • WATCH THE TRAILER', accent: '#ef233c' },
  { file: 'banner-report.svg', line1: 'FOLLOW THE', line2: 'PAPER TRAIL', tag: 'COURT FILINGS • BUDGETS • PUBLIC RECORDS', accent: '#7c3aed', topBar: '#7c3aed' }
];

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
VARIANTS.forEach(banner);
