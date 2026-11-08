/**
 * YouTube thumbnail system — 1280 x 720.
 *
 * Rules from the brief:
 *   - high contrast, red border, gold corner accents, blue energy accents
 *   - JSA logo bottom-left
 *   - Bebas Neue / Montserrat Bold type
 *   - headline capped at 4 words
 *
 * Headlines are split across two lines automatically when they exceed a
 * comfortable measure, so "FOLLOW THE MONEY" sets as "FOLLOW THE" /
 * "MONEY" without the author having to break it manually.
 */
const { C, rgba } = require('./palette');
const { faces } = require('./fonts');
const { crest } = require('./crest');

const MAX_WORDS = 4;

function splitHeadline(text) {
  const words = String(text).trim().split(/\s+/).slice(0, MAX_WORDS);
  if (words.length <= 2) return [words.join(' ')];
  // balance the two lines
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

function thumbnail(o) {
  o = Object.assign({
    width: 1280, height: 720, headline: 'FOLLOW THE MONEY',
    kicker: 'JSA INVESTIGATION', idPrefix: 'T', showLogo: true,
    variant: 'default'   // default | alert | investigation
  }, o);
  const W = o.width, H = o.height, id = o.idPrefix;
  const defs = [];
  const layers = [];

  const palette = {
    default:       { glow: C.blue,   accent: C.gold },
    alert:         { glow: C.red,    accent: C.red },
    investigation: { glow: C.gold,   accent: C.gold }
  }[o.variant] || { glow: C.blue, accent: C.gold };

  defs.push(`
  <linearGradient id="${id}Bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#07070A"/><stop offset=".5" stop-color="#120A10"/>
    <stop offset="1" stop-color="#07070A"/>
  </linearGradient>
  <radialGradient id="${id}Atmos" cx=".68" cy=".45" r=".62">
    <stop offset="0" stop-color="${palette.glow}" stop-opacity=".30"/>
    <stop offset="1" stop-color="${palette.glow}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="${id}Type" x1="0" y1="0" x2=".2" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F0F0F4"/>
    <stop offset="1" stop-color="#C9C9D4"/>
  </linearGradient>
  <linearGradient id="${id}Accent" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${palette.accent}"/>
    <stop offset="1" stop-color="${palette.accent}" stop-opacity="0"/>
  </linearGradient>
  <filter id="${id}Blur" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="22"/>
  </filter>
  <filter id="${id}BlurS" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="6"/>
  </filter>
  <filter id="${id}TextGlow" x="-15%" y="-30%" width="130%" height="160%">
    <feGaussianBlur stdDeviation="9" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}Grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="3" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope=".08"/></feComponentTransfer>
  </filter>`);

  // ---- background ----------------------------------------------------
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Bg)"/>`);
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Atmos)"/>`);

  // energy streaks
  let seed = 7717;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const streaks = [];
  for (let i = 0; i < 16; i++) {
    const y0 = rnd() * H, x0 = 120 + rnd() * 380;
    const len = 420 + rnd() * 700;
    streaks.push(`<path d="M ${x0} ${y0} C ${x0+len*0.35} ${y0-70-rnd()*90}, ${x0+len*0.7} ${y0+60+rnd()*90}, ${x0+len} ${y0-30+rnd()*60}"
      fill="none" stroke="${rnd()>0.5?palette.glow:C.gold}" stroke-width="${(1.6+rnd()*4).toFixed(1)}"
      opacity="${(0.08+rnd()*0.22).toFixed(2)}" stroke-linecap="round"/>`);
  }
  layers.push(`<g filter="url(#${id}Blur)">${streaks.join('')}</g>`);

  // particles
  const parts = [];
  for (let i = 0; i < 130; i++) {
    parts.push(`<circle cx="${(rnd()*W).toFixed(0)}" cy="${(rnd()*H).toFixed(0)}" r="${(0.9+rnd()*3).toFixed(1)}"
      fill="${rnd()>0.4?palette.glow:C.gold}" opacity="${(0.06+rnd()*0.4).toFixed(2)}"/>`);
  }
  layers.push(`<g>${parts.join('')}</g>`);

  // diagonal dark panel behind the type for contrast
  layers.push(`<path d="M 60 ${H*0.06} L ${W*0.78} ${H*0.06} L ${W*0.62} ${H*0.94} L 40 ${H*0.94} Z"
    fill="#050508" opacity=".62"/>`);

  // ---- type ----------------------------------------------------------
  const lines = splitHeadline(o.headline);
  const baseY = lines.length > 1 ? 320 : 400;
  const lh = 168;
  const fs = lines.length > 1 ? 168 : 190;

  if (o.kicker) {
    layers.push(`<text x="86" y="150" font-family="'Montserrat', Arial, sans-serif" font-weight="800"
      font-size="30" letter-spacing="7" fill="${palette.accent}">${o.kicker.toUpperCase()}</text>`);
    layers.push(`<rect x="86" y="176" width="230" height="5" fill="url(#${id}Accent)"/>`);
  }

  const textSvg = lines.map((ln, i) =>
    `<text x="82" y="${baseY + i*lh}" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="${fs}" letter-spacing="1.5" fill="url(#${id}Type)">${ln.toUpperCase()}</text>`
  ).join('\n');
  layers.push(`<g filter="url(#${id}TextGlow)">${textSvg}</g>`);

  // underline rule
  const ruleY = baseY + (lines.length - 1) * lh + 34;
  layers.push(`<rect x="86" y="${ruleY}" width="${420 + lines[0].length*30}" height="11" fill="${palette.accent}"/>`);

  // ---- right-hand visual weight: a large ghosted globe ---------------
  const gr = 300, gx = W - gr - 40, gy = H * 0.42;
  layers.push(`<g opacity=".20">
    <circle cx="${gx}" cy="${gy}" r="${gr}" fill="none" stroke="${palette.glow}" stroke-width="3"/>
    <circle cx="${gx}" cy="${gy}" r="${gr*0.94}" fill="none" stroke="${palette.glow}" stroke-width="1.4" stroke-dasharray="10 14"/>
    <ellipse cx="${gx}" cy="${gy}" rx="${gr*0.42}" ry="${gr}" fill="none" stroke="${palette.glow}" stroke-width="1.6"/>
    <ellipse cx="${gx}" cy="${gy}" rx="${gr*0.78}" ry="${gr}" fill="none" stroke="${palette.glow}" stroke-width="1.4"/>
    <line x1="${gx-gr}" y1="${gy}" x2="${gx+gr}" y2="${gy}" stroke="${palette.glow}" stroke-width="1.6"/>
    <line x1="${gx}" y1="${gy-gr}" x2="${gx}" y2="${gy+gr}" stroke="${palette.glow}" stroke-width="1.6"/>
    <circle cx="${gx}" cy="${gy}" r="${gr*0.34}" fill="${palette.glow}" opacity=".25" filter="url(#${id}Blur)"/>
  </g>`);

  // ---- crest, bottom-left --------------------------------------------
  if (o.showLogo) {
    const cs = 170;
    layers.push(`<g transform="translate(40 ${H - cs - 34}) scale(${cs/1024})">
      ${crest({ size: 1024, idPrefix: id + 'C', transparent: true, withParticles: false, inner: true })}
    </g>`);
    // wordmark next to the crest
    layers.push(`<text x="${40 + cs + 12}" y="${H - 74}" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="44" letter-spacing="2" fill="#FFFFFF" opacity=".95">JUSTICE SOCIETY</text>`);
    layers.push(`<text x="${40 + cs + 12}" y="${H - 38}" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="44" letter-spacing="2" fill="${C.gold}">OF ACTIVISM</text>`);
  }

  // ---- border + corners ----------------------------------------------
  layers.push(`<rect x="6" y="6" width="${W-12}" height="${H-12}" fill="none" stroke="${C.red}" stroke-width="12"/>`);
  // gold corner accents
  const cs2 = 92;
  const corners = [
    `M 12 ${12+cs2} L 12 12 L ${12+cs2} 12`,
    `M ${W-12-cs2} 12 L ${W-12} 12 L ${W-12} ${12+cs2}`,
    `M 12 ${H-12-cs2} L 12 ${H-12} L ${12+cs2} ${H-12}`,
    `M ${W-12-cs2} ${H-12} L ${W-12} ${H-12} L ${W-12} ${H-12-cs2}`
  ];
  layers.push(`<g fill="none" stroke="${C.gold}" stroke-width="9" stroke-linecap="square">` +
    corners.map(d => `<path d="${d}"/>`).join('') + `</g>`);

  // blue energy accent along the bottom-right
  layers.push(`<g filter="url(#${id}BlurS)">
    <path d="M ${W*0.42} ${H-26} C ${W*0.6} ${H-70}, ${W*0.78} ${H+10}, ${W+40} ${H-52}"
      fill="none" stroke="${palette.glow}" stroke-width="10" stroke-linecap="round" opacity=".85"/>
  </g>`);
  layers.push(`<path d="M ${W*0.42} ${H-26} C ${W*0.6} ${H-70}, ${W*0.78} ${H+10}, ${W+40} ${H-52}"
    fill="none" stroke="${palette.glow}" stroke-width="3" stroke-linecap="round" opacity=".9"/>`);

  layers.push(`<rect width="${W}" height="${H}" filter="url(#${id}Grain)" opacity=".55"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.headline}">
${faces()}
${defs.join('')}
${layers.join('\n')}
</svg>`;
}

module.exports = { thumbnail, splitHeadline };
