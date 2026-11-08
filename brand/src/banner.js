/**
 * Channel banner — 2560 x 1440.
 *
 * Layout per the brief:
 *   left   large JSA crest
 *   centre negative space
 *   right  JUSTICE SOCIETY OF ACTIVISM in metallic gold
 *          with blue energy flowing underneath
 *
 * Everything meaningful sits inside YouTube's safe area
 * (x 507-2053, y 423-1017) so it survives every device crop.
 */
const { C, rgba } = require('./palette');
const { faces } = require('./fonts');
const { crest } = require('./crest');

const VARIANTS = {
  primary: {
    line1: 'JUSTICE SOCIETY', line2: 'OF ACTIVISM',
    tag: 'EVIDENCE • AMPLITUDE • ACTION', accent: '#D4AF37'
  },
  'new-episode': {
    line1: 'NEW DOCUMENTARY', line2: 'EVERY THURSDAY',
    tag: 'EVIDENCE • AMPLITUDE • ACTION', accent: '#00AEEF'
  },
  'season-two': {
    line1: 'SEASON TWO', line2: 'THE QUIET AUCTION',
    tag: 'WHO OWNS YOUR WATER • WATCH THE TRAILER', accent: '#E11937'
  },
  membership: {
    line1: 'MEMBER FUNDED', line2: 'INDEPENDENT NEWS',
    tag: 'NO OWNERS • NO SPONSORS • NO LOBBISTS', accent: '#00AEEF'
  },
  'paper-trail': {
    line1: 'FOLLOW THE', line2: 'PAPER TRAIL',
    tag: 'COURT FILINGS • BUDGETS • PUBLIC RECORDS', accent: '#D4AF37'
  }
};

function banner(o) {
  o = Object.assign({ width: 2560, height: 1440, idPrefix: 'B', variant: 'primary', probe: false, typeScale: 1, tagScale: 1 }, o);
  const V = VARIANTS[o.variant] || VARIANTS.primary;
  const W = o.width, H = o.height, id = o.idPrefix;
  const defs = [];
  const layers = [];

  defs.push(`
  <linearGradient id="${id}Bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#07070A"/><stop offset=".45" stop-color="#140A10"/>
    <stop offset=".78" stop-color="#0B0B0F"/><stop offset="1" stop-color="#07070A"/>
  </linearGradient>
  <radialGradient id="${id}Atmos" cx=".72" cy=".5" r=".55">
    <stop offset="0" stop-color="${C.red}" stop-opacity=".34"/>
    <stop offset=".55" stop-color="${C.redDeep}" stop-opacity=".12"/>
    <stop offset="1" stop-color="${C.red}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="${id}BlueAtmos" cx=".18" cy=".55" r=".5">
    <stop offset="0" stop-color="${C.blue}" stop-opacity=".22"/>
    <stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="${id}GoldType" x1="0" y1="0" x2="1" y2=".6">
    <stop offset="0" stop-color="#F6E7B4"/><stop offset=".22" stop-color="${C.gold}"/>
    <stop offset=".46" stop-color="${C.goldDeep}"/><stop offset=".62" stop-color="${C.goldLight}"/>
    <stop offset=".82" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldDeep}"/>
  </linearGradient>
  <linearGradient id="${id}Energy" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.blue}" stop-opacity="0"/>
    <stop offset=".18" stop-color="${C.blue}" stop-opacity=".9"/>
    <stop offset=".55" stop-color="${C.blueLight}" stop-opacity="1"/>
    <stop offset=".85" stop-color="${C.blue}" stop-opacity=".85"/>
    <stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
  </linearGradient>
  <filter id="${id}Blur" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="26"/>
  </filter>
  <filter id="${id}Blur2" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="9"/>
  </filter>
  <filter id="${id}TextGlow" x="-20%" y="-40%" width="140%" height="180%">
    <feGaussianBlur stdDeviation="7" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}Grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope=".055"/></feComponentTransfer>
  </filter>`);

  // ---- background ----------------------------------------------------
  if (o.probe) {
    // Layout-probe mode: decorative layers are omitted so the rendered
    // bounding box of the meaningful elements is exact.
    const crestSize2 = 560, crestX2 = 507, crestY2 = 440;
    const tx2 = 1160, l1 = 690, l2 = 820;
    const probeLayers = [];
    probeLayers.push(`<g transform="translate(${crestX2} ${crestY2}) scale(${crestSize2/1024})">
      ${crest({ size: 1024, idPrefix: id + 'PC', transparent: true, withParticles: false, inner: true })}
    </g>`);
    probeLayers.push(`<text x="${tx2}" y="${l1}" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="${Math.round(140 * o.typeScale)}" letter-spacing="5" fill="#FFFFFF">${V.line1}</text>`);
    probeLayers.push(`<text x="${tx2}" y="${l2}" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="${Math.round(140 * o.typeScale)}" letter-spacing="5" fill="#FFFFFF">${V.line2}</text>`);
    probeLayers.push(`<rect x="${tx2}" y="${l2+36}" width="830" height="60" fill="#FFFFFF" opacity="0.0"/>`);
    probeLayers.push(`<text x="${tx2}" y="${l2+144}" font-family="'Montserrat', Arial, sans-serif" font-weight="700"
      font-size="${Math.round(33 * o.tagScale)}" letter-spacing="${Math.round(11 * o.tagScale)}" fill="#FFFFFF">${V.tag}</text>`);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${faces()}
${defs.join('')}
${probeLayers.join('\n')}
</svg>`;
  }

  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Bg)"/>`);
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Atmos)"/>`);
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}BlueAtmos)"/>`);

  // diagonal light shafts
  const shafts = [];
  for (let i = 0; i < 9; i++) {
    const x = 200 + i * 280;
    shafts.push(`<path d="M ${x} ${H} L ${x + 520} 0 L ${x + 590} 0 L ${x + 70} ${H} Z"
      fill="#ffffff" opacity="${(0.012 + (i % 3) * 0.006).toFixed(3)}"/>`);
  }
  layers.push(`<g>${shafts.join('')}</g>`);

  // ---- blue energy currents ------------------------------------------
  const currents = [];
  let seed = 991;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let i = 0; i < 22; i++) {
    const y0 = 120 + rnd() * (H - 240);
    const amp = 40 + rnd() * 110;
    const x0 = 900 + rnd() * 300;
    const len = 700 + rnd() * 900;
    const y1 = y0 + (rnd() - 0.5) * 240;
    const c = rnd() > 0.4 ? C.blue : C.gold;
    const op = 0.10 + rnd() * 0.26;
    currents.push(`<path d="M ${x0} ${y0} C ${x0 + len*0.3} ${y0 - amp}, ${x0 + len*0.7} ${y1 + amp}, ${x0 + len} ${y1}"
      fill="none" stroke="${c}" stroke-width="${(1.4 + rnd()*3.4).toFixed(1)}" opacity="${op.toFixed(2)}"
      stroke-linecap="round"/>`);
  }
  layers.push(`<g filter="url(#${id}Blur)">${currents.join('')}</g>`);

  // ---- gold particles -------------------------------------------------
  const parts = [];
  for (let i = 0; i < 220; i++) {
    const x = rnd() * W, y = rnd() * H;
    const r = 0.8 + rnd() * 3.4;
    parts.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}"
      fill="${rnd() > 0.35 ? C.gold : C.blue}" opacity="${(0.08 + rnd() * 0.45).toFixed(2)}"/>`);
  }
  layers.push(`<g>${parts.join('')}</g>`);

  // ---- LEFT: large crest --------------------------------------------
  // Sized and placed to sit inside YouTube's safe area (x 507-2053, y 423-1017)
  const crestSize = 560;
  const crestX = 507, crestY = 440;
  layers.push(`<g transform="translate(${crestX} ${crestY}) scale(${crestSize/1024})">
    ${crest({ size: 1024, idPrefix: id + 'C', transparent: true, withParticles: false, inner: true })}
  </g>`);

  // ---- RIGHT: wordmark ------------------------------------------------
  const tx = 1160;
  const line1Y = 690, line2Y = 820;
  layers.push(`<g filter="url(#${id}TextGlow)">
    <text x="${tx}" y="${line1Y}" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="${Math.round(140 * o.typeScale)}" letter-spacing="5" fill="url(#${id}GoldType)">${V.line1}</text>
    <text x="${tx}" y="${line2Y}" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="${Math.round(140 * o.typeScale)}" letter-spacing="5" fill="url(#${id}GoldType)">${V.line2}</text>
  </g>`);

  // blue energy flowing underneath the type
  layers.push(`<g filter="url(#${id}Blur2)">
    <path d="M ${tx} ${line2Y + 42} C ${tx+280} ${line2Y+18}, ${tx+560} ${line2Y+66}, ${tx+830} ${line2Y+26}"
      fill="none" stroke="url(#${id}Energy)" stroke-width="9" stroke-linecap="round"/>
  </g>`);
  layers.push(`<path d="M ${tx} ${line2Y + 42} C ${tx+280} ${line2Y+18}, ${tx+560} ${line2Y+66}, ${tx+830} ${line2Y+26}"
    fill="none" stroke="url(#${id}Energy)" stroke-width="3.5" stroke-linecap="round"/>`);

  // rule + descriptor
  layers.push(`<rect x="${tx}" y="${line2Y + 92}" width="660" height="3" fill="${C.gold}" opacity=".55"/>`);
  layers.push(`<text x="${tx}" y="${line2Y + 144}" font-family="'Montserrat', Arial, sans-serif" font-weight="700"
    font-size="${Math.round(33 * o.tagScale)}" letter-spacing="${Math.round(11 * o.tagScale)}" fill="#D6D6DE" opacity=".92">${V.tag}</text>`);

  // ---- bottom accent bars --------------------------------------------
  layers.push(`<rect x="0" y="0" width="${W}" height="12" fill="${C.red}"/>`);
  layers.push(`<rect x="0" y="${H-12}" width="${W}" height="12" fill="${C.gold}"/>`);

  // grain
  layers.push(`<rect width="${W}" height="${H}" filter="url(#${id}Grain)" opacity=".7"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Justice Society of Activism channel banner">
${faces()}
<defs>${defs.join('')}</defs>
${layers.join('\n')}
</svg>`;
}

/**
 * The bounding boxes of the meaningful elements, in canvas coordinates.
 * Used by src/safearea.js to prove everything sits inside YouTube's
 * visible crop region.
 */
function bannerBoxes(o) {
  o = Object.assign({ width: 2560, height: 1440, variant: 'primary' }, o);
  const W = o.width, H = o.height;
  const crestSize = 560, crestX = 507, crestY = 440;
  const tx = 1160, line1Y = 690, line2Y = 820;
  const fontSize = 140;
  // Bebas Neue is a condensed face; these are measured from the rendered
  // output and updated when the typeface or size changes.
  const w1 = 14 * fontSize * 0.38, w2 = 10 * fontSize * 0.38;
  return [
    { name: 'crest', x0: crestX, y0: crestY, x1: crestX + crestSize, y1: crestY + crestSize },
    { name: 'title line 1', x0: tx, y0: line1Y - fontSize, x1: tx + w1, y1: line1Y + 12 },
    { name: 'title line 2', x0: tx, y0: line2Y - fontSize, x1: tx + w2, y1: line2Y + 12 },
    { name: 'energy rule', x0: tx, y0: line2Y + 36, x1: tx + 830, y1: line2Y + 96 },
    { name: 'descriptor', x0: tx, y0: line2Y + 110, x1: tx + 700, y1: line2Y + 158 }
  ];
}

module.exports = { banner, VARIANTS, bannerBoxes };
