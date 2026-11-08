/**
 * YouTube thumbnail template system — 1280 x 720.
 *
 * "Breaking news meets superhero media network."
 *
 * Layout:
 *   right      large subject image area (the dropzone — a portrait subject
 *              reading left into the headline)
 *   left       bold title area — kicker, headline, accent rule
 *   lower left the JSA crest and wordmark
 *   frame      red border with gold corner accents
 *   energy     electric-blue arc separating the subject from the title
 *
 * The subject area accepts a real image (data URI or path). With no image
 * supplied it renders as a labelled placeholder with corner brackets and a
 * figure silhouette, so the template is self-documenting.
 */
const { C, rgba } = require('./palette');
const { faces } = require('./fonts');
const { crest } = require('./crest');
const { fitSize } = require('./font-metrics');

/** The six headlines the system is designed around. */
const HEADLINES = [
  'EXPOSED',
  'WHO PROFITS',
  'FOLLOW THE MONEY',
  'THEY LIED',
  'WATCH THIS',
  'ACCOUNTABILITY NOW'
];

/**
 * Split a headline for maximum impact.
 * One word gets one huge line; two words stack one per line; three or more
 * split into two balanced lines.
 */
function splitHeadline(text) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return [words[0]];
  if (words.length === 2) return [words[0], words[1]];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

/** Human bust silhouette used as the subject placeholder. */
function silhouette(cx, cy, scale) {
  const s = scale || 1;
  return `<g transform="translate(${cx} ${cy}) scale(${s})" opacity=".9">
    <circle cx="0" cy="-168" r="74"/>
    <path d="M -150 210 C -150 92, -104 12, -50 -18 L 50 -18 C 104 12, 150 92, 150 210 Z"/>
  </g>`;
}

function thumbnail(o) {
  o = Object.assign({
    width: 1280, height: 720, headline: 'FOLLOW THE MONEY',
    kicker: 'JSA INVESTIGATION', idPrefix: 'T', showLogo: true,
    variant: 'default', subject: null, template: false,
    sub: '', badge: ''
  }, o);
  const W = o.width, H = o.height, id = o.idPrefix;
  const defs = [];
  const layers = [];

  const palette = {
    default:       { glow: C.blue, accent: C.gold, kicker: C.gold },
    alert:         { glow: C.red,  accent: C.red,  kicker: C.red },
    investigation: { glow: C.gold, accent: C.gold, kicker: C.gold },
    breaking:      { glow: C.red,  accent: C.gold, kicker: C.red }
  }[o.variant] || { glow: C.blue, accent: C.gold, kicker: C.gold };

  /* ---- geometry ---- */
  const SUB_X = 700, SUB_Y = 44, SUB_W = 552, SUB_H = 632;   // subject dropzone
  const TITLE_X = 58;
  const TITLE_MAX = 700;          // headline may run this far right
  const LS = 1;
  const lines = splitHeadline(o.headline);
  const twoLine = lines.length > 1;

  // Auto-fit the headline to the title column using real font metrics, so
  // a 14-character word like ACCOUNTABILITY never spills over the subject.
  const maxFs = twoLine ? 140 : 150;
  const fs = Math.min(...lines.map(l => fitSize(l, TITLE_MAX, LS, maxFs, 72)));

  defs.push(`
  <linearGradient id="${id}Bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#07070A"/><stop offset=".45" stop-color="#130A10"/>
    <stop offset="1" stop-color="#05050A"/>
  </linearGradient>
  <radialGradient id="${id}Atmos" cx=".72" cy=".42" r=".58">
    <stop offset="0" stop-color="${palette.glow}" stop-opacity=".26"/>
    <stop offset="1" stop-color="${palette.glow}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="${id}Scrim" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#05050A" stop-opacity=".96"/>
    <stop offset=".62" stop-color="#05050A" stop-opacity=".88"/>
    <stop offset="1" stop-color="#05050A" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="${id}Type" x1="0" y1="0" x2=".15" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F2F2F6"/>
    <stop offset="1" stop-color="#C6C6D2"/>
  </linearGradient>
  <linearGradient id="${id}SubjectFill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#15151E"/><stop offset="1" stop-color="#0C0C12"/>
  </linearGradient>
  <linearGradient id="${id}Accent" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${palette.accent}"/>
    <stop offset="1" stop-color="${palette.accent}" stop-opacity="0"/>
  </linearGradient>
  <pattern id="${id}Hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="14" height="14" fill="none"/>
    <line x1="0" y1="0" x2="0" y2="14" stroke="#ffffff" stroke-opacity=".035" stroke-width="5"/>
  </pattern>
  <clipPath id="${id}SubjectClip">
    <rect x="${SUB_X}" y="${SUB_Y}" width="${SUB_W}" height="${SUB_H}"/>
  </clipPath>
  <filter id="${id}Blur" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="22"/>
  </filter>
  <filter id="${id}BlurS" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="7"/>
  </filter>
  <filter id="${id}TextGlow" x="-15%" y="-35%" width="130%" height="170%">
    <feGaussianBlur stdDeviation="10" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}SubjectEdge" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="-10" dy="0" stdDeviation="14" flood-color="${palette.glow}" flood-opacity=".55"/>
  </filter>
  <filter id="${id}Grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="3" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope=".07"/></feComponentTransfer>
  </filter>`);

  /* ---- background ---- */
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Bg)"/>`);
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Atmos)"/>`);

  // energy streaks
  let seed = 7717;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const streaks = [];
  for (let i = 0; i < 14; i++) {
    const y0 = rnd() * H, x0 = 40 + rnd() * 420;
    const len = 380 + rnd() * 720;
    streaks.push(`<path d="M ${x0} ${y0} C ${x0+len*0.35} ${y0-70-rnd()*80}, ${x0+len*0.7} ${y0+60+rnd()*80}, ${x0+len} ${y0-30+rnd()*50}"
      fill="none" stroke="${rnd()>0.5?palette.glow:C.gold}" stroke-width="${(1.6+rnd()*3.6).toFixed(1)}"
      opacity="${(0.06+rnd()*0.18).toFixed(2)}" stroke-linecap="round"/>`);
  }
  layers.push(`<g filter="url(#${id}Blur)">${streaks.join('')}</g>`);

  // particles
  const parts = [];
  for (let i = 0; i < 110; i++) {
    parts.push(`<circle cx="${(rnd()*W).toFixed(0)}" cy="${(rnd()*H).toFixed(0)}" r="${(0.9+rnd()*2.8).toFixed(1)}"
      fill="${rnd()>0.4?palette.glow:C.gold}" opacity="${(0.05+rnd()*0.32).toFixed(2)}"/>`);
  }
  layers.push(`<g>${parts.join('')}</g>`);

  /* ---- SUBJECT IMAGE AREA ---- */
  layers.push(`<g filter="url(#${id}SubjectEdge)">`);
  layers.push(`<g clip-path="url(#${id}SubjectClip)">`);
  if (o.subject) {
    layers.push(`<image href="${o.subject}" x="${SUB_X}" y="${SUB_Y}" width="${SUB_W}" height="${SUB_H}"
      preserveAspectRatio="xMidYMid slice"/>`);
    // darken the lower part so the crest and any lower text stay legible
    layers.push(`<rect x="${SUB_X}" y="${SUB_Y}" width="${SUB_W}" height="${SUB_H}" fill="url(#${id}Scrim)" opacity=".35"/>`);
  } else {
    layers.push(`<rect x="${SUB_X}" y="${SUB_Y}" width="${SUB_W}" height="${SUB_H}" fill="url(#${id}SubjectFill)"/>`);
    layers.push(`<rect x="${SUB_X}" y="${SUB_Y}" width="${SUB_W}" height="${SUB_H}" fill="url(#${id}Hatch)"/>`);
    layers.push(`<g fill="#3A3A4E" stroke="${palette.glow}" stroke-width="2.5" opacity=".95">
      ${silhouette(SUB_X + SUB_W * 0.5, SUB_Y + SUB_H * 0.56, 1.35)}</g>`);
    layers.push(`<text x="${SUB_X + SUB_W / 2}" y="${SUB_Y + SUB_H - 34}" text-anchor="middle"
      font-family="'Montserrat', Arial, sans-serif" font-weight="700" font-size="19" letter-spacing="5"
      fill="${palette.glow}" opacity=".75">SUBJECT IMAGE</text>`);
  }
  layers.push(`</g></g>`);

  // subject edge: electric-blue rim on the leading side
  layers.push(`<rect x="${SUB_X}" y="${SUB_Y}" width="${SUB_W}" height="${SUB_H}" fill="none"
    stroke="${palette.glow}" stroke-width="3" opacity=".55"/>`);

  // gold corner brackets on the subject area
  const bk = 44;
  layers.push(`<g fill="none" stroke="${C.gold}" stroke-width="6" stroke-linecap="square" opacity=".95">
    <path d="M ${SUB_X} ${SUB_Y+ bk} L ${SUB_X} ${SUB_Y} L ${SUB_X+bk} ${SUB_Y}"/>
    <path d="M ${SUB_X+SUB_W-bk} ${SUB_Y} L ${SUB_X+SUB_W} ${SUB_Y} L ${SUB_X+SUB_W} ${SUB_Y+bk}"/>
    <path d="M ${SUB_X} ${SUB_Y+SUB_H-bk} L ${SUB_X} ${SUB_Y+SUB_H} L ${SUB_X+bk} ${SUB_Y+SUB_H}"/>
    <path d="M ${SUB_X+SUB_W-bk} ${SUB_Y+SUB_H} L ${SUB_X+SUB_W} ${SUB_Y+SUB_H} L ${SUB_X+SUB_W} ${SUB_Y+SUB_H-bk}"/>
  </g>`);

  /* ---- electric blue energy arc separating subject from title ---- */
  const arc = `M 250 ${H + 40} C 470 ${H - 40}, 610 ${H - 300}, 664 ${SUB_Y - 30}`;
  layers.push(`<g filter="url(#${id}BlurS)">
    <path d="${arc}" fill="none" stroke="${palette.glow}" stroke-width="26" stroke-linecap="round" opacity=".55"/>
  </g>`);
  layers.push(`<path d="${arc}" fill="none" stroke="${palette.glow}" stroke-width="5" stroke-linecap="round" opacity=".95"/>`);
  layers.push(`<path d="${arc}" fill="none" stroke="#BDEBFF" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`);

  /* ---- TITLE AREA ---- */
  layers.push(`<rect x="0" y="0" width="${SUB_X + 78}" height="${H}" fill="url(#${id}Scrim)"/>`);

  const kickerY = 152;
  if (o.kicker) {
    layers.push(`<rect x="${TITLE_X}" y="${kickerY - 26}" width="10" height="30" fill="${palette.kicker}"/>`);
    layers.push(`<text x="${TITLE_X + 24}" y="${kickerY}" font-family="'Montserrat', Arial, sans-serif" font-weight="800"
      font-size="26" letter-spacing="6" fill="${palette.kicker}">${o.kicker.toUpperCase()}</text>`);
  }

  const baseY = twoLine ? 330 : 350;
  const lh = Math.round(fs * 1.02);
  const textSvg = lines.map((ln, i) =>
    `<text x="${TITLE_X}" y="${baseY + i*lh}" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="${fs}" letter-spacing="1" fill="url(#${id}Type)">${ln.toUpperCase()}</text>`
  ).join('\n');
  layers.push(`<g filter="url(#${id}TextGlow)">${textSvg}</g>`);

  // accent rule under the headline
  const ruleY = baseY + (twoLine ? lh : 0) + 30;
  const ruleW = Math.min(600, 90 + Math.max(...lines.map(l => l.length)) * 30);
  layers.push(`<rect x="${TITLE_X}" y="${ruleY}" width="${ruleW}" height="12" fill="${palette.accent}"/>`);
  layers.push(`<rect x="${TITLE_X}" y="${ruleY}" width="${ruleW}" height="12" fill="url(#${id}Accent)"/>`);

  // optional sub-line
  if (o.sub) {
    layers.push(`<text x="${TITLE_X}" y="${ruleY + 54}" font-family="'Montserrat', Arial, sans-serif" font-weight="700"
      font-size="25" letter-spacing="1" fill="#C9C9D6">${o.sub}</text>`);
  }

  // optional corner badge on the subject area
  if (o.badge) {
    layers.push(`<g>
      <rect x="${SUB_X + 18}" y="${SUB_Y + 18}" width="${o.badge.length * 15 + 44}" height="46" rx="6"
        fill="${C.red}"/>
      <text x="${SUB_X + 40}" y="${SUB_Y + 49}" font-family="'Montserrat', Arial, sans-serif" font-weight="800"
        font-size="23" letter-spacing="3" fill="#FFFFFF">${o.badge.toUpperCase()}</text>
    </g>`);
  }

  /* ---- LOGO, bottom left ---- */
  if (o.showLogo) {
    const cs = 136;
    layers.push(`<g transform="translate(46 ${H - cs - 30}) scale(${cs/1024})">
      ${crest({ size: 1024, idPrefix: id + 'C', transparent: true, withParticles: false, inner: true })}
    </g>`);
    layers.push(`<text x="${46 + cs + 14}" y="${H - 78}" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="40" letter-spacing="2" fill="#FFFFFF" opacity=".96">JUSTICE SOCIETY</text>`);
    layers.push(`<text x="${46 + cs + 14}" y="${H - 42}" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="40" letter-spacing="2" fill="${C.gold}">OF ACTIVISM</text>`);
  }

  /* ---- FRAME ---- */
  layers.push(`<rect x="7" y="7" width="${W-14}" height="${H-14}" fill="none" stroke="${C.red}" stroke-width="14"/>`);
  const cs2 = 92;
  const corners = [
    `M 14 ${14+cs2} L 14 14 L ${14+cs2} 14`,
    `M ${W-14-cs2} 14 L ${W-14} 14 L ${W-14} ${14+cs2}`,
    `M 14 ${H-14-cs2} L 14 ${H-14} L ${14+cs2} ${H-14}`,
    `M ${W-14-cs2} ${H-14} L ${W-14} ${H-14} L ${W-14} ${H-14-cs2}`
  ];
  layers.push(`<g fill="none" stroke="${C.gold}" stroke-width="10" stroke-linecap="square">` +
    corners.map(d => `<path d="${d}"/>`).join('') + `</g>`);

  // electric blue accent along the bottom edge
  layers.push(`<g filter="url(#${id}BlurS)">
    <path d="M ${W*0.44} ${H-20} C ${W*0.62} ${H-64}, ${W*0.80} ${H+16}, ${W+40} ${H-46}"
      fill="none" stroke="${palette.glow}" stroke-width="12" stroke-linecap="round" opacity=".8"/>
  </g>`);
  layers.push(`<path d="M ${W*0.44} ${H-20} C ${W*0.62} ${H-64}, ${W*0.80} ${H+16}, ${W+40} ${H-46}"
    fill="none" stroke="${palette.glow}" stroke-width="3.5" stroke-linecap="round" opacity=".9"/>`);

  layers.push(`<rect width="${W}" height="${H}" filter="url(#${id}Grain)" opacity=".5"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.headline}">
${faces()}
${defs.join('')}
${layers.join('\n')}
</svg>`;
}

module.exports = { thumbnail, splitHeadline, HEADLINES, silhouette };
