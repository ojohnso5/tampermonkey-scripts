/**
 * YouTube end screen — 1920 x 1080.
 *
 *   background   black, red atmosphere, blue energy currents, dotted world map
 *   centre       the JSA superhero-and-globe crest, large
 *   left         placeholder for the next video
 *   right        placeholder for a recommended video
 *   bottom centre  subscribe area
 *
 * Built as a template: the placeholders are labelled and framed so the
 * editor knows exactly where to drop footage.
 */
const { C, rgba } = require('./palette');
const { faces } = require('./fonts');
const geo = require('./geo');
const { crest } = require('./crest');

function endScreen(o) {
  o = Object.assign({ width: 1920, height: 1080, idPrefix: 'E' }, o);
  const W = o.width, H = o.height, id = o.idPrefix;
  const defs = [];
  const layers = [];

  // --- layout -----------------------------------------------------------
  const SLOT_W = 560, SLOT_H = 315, SLOT_Y = 300;
  const SLOT_L_X = 70, SLOT_R_X = W - 70 - SLOT_W;
  const CREST_SIZE = 470, CREST_X = W / 2 - CREST_SIZE / 2, CREST_Y = 46;
  const SUB_Y = 872;

  defs.push(`
  <linearGradient id="${id}Bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#07070A"/><stop offset=".45" stop-color="#120A10"/>
    <stop offset="1" stop-color="#05050A"/>
  </linearGradient>
  <radialGradient id="${id}Atmos" cx=".5" cy=".42" r=".62">
    <stop offset="0" stop-color="${C.red}" stop-opacity=".30"/>
    <stop offset=".55" stop-color="${C.redDeep}" stop-opacity=".10"/>
    <stop offset="1" stop-color="${C.red}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="${id}BlueAtmos" cx=".16" cy=".82" r=".55">
    <stop offset="0" stop-color="${C.blue}" stop-opacity=".18"/>
    <stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="${id}SlotFill" cx=".5" cy=".35" r=".8">
    <stop offset="0" stop-color="#191922"/><stop offset="1" stop-color="#0A0A10"/>
  </radialGradient>
  <linearGradient id="${id}Gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.goldLight}"/><stop offset=".4" stop-color="${C.gold}"/>
    <stop offset="1" stop-color="${C.goldDeep}"/>
  </linearGradient>
  <linearGradient id="${id}Scrim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#05050A" stop-opacity="0"/>
    <stop offset="1" stop-color="#05050A" stop-opacity=".85"/>
  </linearGradient>
  <pattern id="${id}Hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="12" stroke="#ffffff" stroke-opacity=".035" stroke-width="4"/>
  </pattern>
  <filter id="${id}Blur" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="30"/>
  </filter>
  <filter id="${id}BlurS" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="7"/>
  </filter>
  <filter id="${id}Glow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="9" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}Grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope=".05"/></feComponentTransfer>
  </filter>`);

  /* ---------------- background ---------------- */
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Bg)"/>`);
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Atmos)"/>`);
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}BlueAtmos)"/>`);

  // subtle dotted world map
  const mapDots = geo.dotWorld(W, H, 15, 2.2, geo.WORLD);
  layers.push(`<g fill="${C.blue}" opacity=".16">${mapDots.join('')}</g>`);
  // a second, warmer pass of the map in gold, offset, for depth
  layers.push(`<g fill="${C.gold}" opacity=".07" transform="translate(6 5)">${mapDots.join('')}</g>`);

  // blue energy currents
  let seed = 4242;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const currents = [];
  for (let i = 0; i < 26; i++) {
    const y0 = rnd() * H, x0 = rnd() * W * 0.9;
    const len = 600 + rnd() * 1100;
    currents.push(`<path d="M ${x0.toFixed(0)} ${y0.toFixed(0)} C ${(x0+len*0.33).toFixed(0)} ${(y0-90).toFixed(0)}, ${(x0+len*0.66).toFixed(0)} ${(y0+80).toFixed(0)}, ${(x0+len).toFixed(0)} ${(y0-20).toFixed(0)}"
      fill="none" stroke="${rnd()>0.4?C.blue:C.gold}" stroke-width="${(1.4+rnd()*3.4).toFixed(1)}"
      opacity="${(0.05+rnd()*0.16).toFixed(2)}" stroke-linecap="round"/>`);
  }
  layers.push(`<g filter="url(#${id}Blur)">${currents.join('')}</g>`);

  /* ---------------- centre crest ---------------- */
  layers.push(`<g transform="translate(${CREST_X} ${CREST_Y}) scale(${CREST_SIZE/1024})">
    ${crest({ size: 1024, idPrefix: id + 'C', transparent: true, withParticles: false, inner: true })}
  </g>`);

  /* ---------------- video placeholders ---------------- */
  function slot(x, label, note) {
    const y = SLOT_Y;
    const bk = 34;
    return `<g>
      <rect x="${x}" y="${y}" width="${SLOT_W}" height="${SLOT_H}" rx="10" fill="url(#${id}SlotFill)"/>
      <rect x="${x}" y="${y}" width="${SLOT_W}" height="${SLOT_H}" rx="10" fill="url(#${id}Hatch)"/>
      <rect x="${x}" y="${y}" width="${SLOT_W}" height="${SLOT_H}" rx="10" fill="none"
        stroke="${C.gold}" stroke-width="2" stroke-opacity=".55"/>
      <!-- film perforations -->
      <g fill="${C.gold}" opacity=".22">
        ${Array.from({length:10}, (_,i)=>`<rect x="${x+14+i*((SLOT_W-28)/9.5)}" y="${y-12}" width="14" height="6" rx="1"/>`).join('')}
        ${Array.from({length:10}, (_,i)=>`<rect x="${x+14+i*((SLOT_W-28)/9.5)}" y="${y+SLOT_H+6}" width="14" height="6" rx="1"/>`).join('')}
      </g>
      <!-- play control -->
      <circle cx="${x+SLOT_W/2}" cy="${y+SLOT_H/2-14}" r="46" fill="${C.red}" opacity=".92"/>
      <path d="M ${x+SLOT_W/2-13} ${y+SLOT_H/2-36} L ${x+SLOT_W/2+24} ${y+SLOT_H/2-14} L ${x+SLOT_W/2-13} ${y+SLOT_H/2+8} Z" fill="#fff"/>
      <text x="${x+SLOT_W/2}" y="${y+SLOT_H/2+66}" text-anchor="middle"
        font-family="'Montserrat', Arial, sans-serif" font-weight="800" font-size="20" letter-spacing="4"
        fill="${C.gold}">${label}</text>
      <text x="${x+SLOT_W/2}" y="${y+SLOT_H/2+96}" text-anchor="middle"
        font-family="'Montserrat', Arial, sans-serif" font-weight="700" font-size="15" letter-spacing="1"
        fill="#8f8f9e">${note}</text>
      <!-- corner brackets -->
      <g fill="none" stroke="${C.gold}" stroke-width="4" stroke-linecap="square">
        <path d="M ${x} ${y+bk} L ${x} ${y} L ${x+bk} ${y}"/>
        <path d="M ${x+SLOT_W-bk} ${y} L ${x+SLOT_W} ${y} L ${x+SLOT_W} ${y+bk}"/>
        <path d="M ${x} ${y+SLOT_H-bk} L ${x} ${y+SLOT_H} L ${x+bk} ${y+SLOT_H}"/>
        <path d="M ${x+SLOT_W-bk} ${y+SLOT_H} L ${x+SLOT_W} ${y+SLOT_H} L ${x+SLOT_W} ${y+SLOT_H-bk}"/>
      </g>
    </g>`;
  }

  layers.push(slot(SLOT_L_X, 'NEXT VIDEO', 'DROP YOUR NEXT UPLOAD HERE'));
  layers.push(slot(SLOT_R_X, 'RECOMMENDED', 'FEATURE A CHANNEL OR VIDEO'));

  /* ---------------- wordmark under the crest ---------------- */
  layers.push(`<g filter="url(#${id}Glow)">
    <text x="${W/2}" y="${CREST_Y + CREST_SIZE + 34}" text-anchor="middle"
      font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif" font-size="60" letter-spacing="4"
      fill="url(#${id}Gold)">JUSTICE SOCIETY OF ACTIVISM</text>
  </g>`);
  layers.push(`<text x="${W/2}" y="${CREST_Y + CREST_SIZE + 74}" text-anchor="middle"
    font-family="'Montserrat', Arial, sans-serif" font-weight="700" font-size="19" letter-spacing="9"
    fill="#b9b9c6">EVIDENCE • AMPLITUDE • ACTION</text>`);

  /* ---------------- subscribe area ---------------- */
  const barW = 560, barX = W / 2 - barW / 2, barY = SUB_Y;
  layers.push(`<g>
    <rect x="${barX}" y="${barY}" width="${barW}" height="104" rx="52" fill="#0E0E14" opacity=".88"
      stroke="${C.line2 || '#3a3a46'}" stroke-width="1.5"/>
    <!-- small crest -->
    <g transform="translate(${barX+20} ${barY+16}) scale(${72/1024})">
      ${crest({ size: 1024, idPrefix: id + 'S', transparent: true, withParticles: false, inner: true })}
    </g>
    <text x="${barX+108}" y="${barY+48}" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="34" letter-spacing="2" fill="#FFFFFF">JUSTICE SOCIETY</text>
    <text x="${barX+108}" y="${barY+80}" font-family="'Montserrat', Arial, sans-serif" font-weight="700"
      font-size="15" letter-spacing="4" fill="${C.gold}">@JusticeSocietyofActivism</text>
    <!-- subscribe button -->
    <g>
      <rect x="${barX+barW-268}" y="${barY+28}" width="176" height="48" rx="24" fill="${C.red}"/>
      <text x="${barX+barW-180}" y="${barY+60}" text-anchor="middle" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
        font-size="30" letter-spacing="2" fill="#FFFFFF">SUBSCRIBE</text>
    </g>
    <!-- bell -->
    <g transform="translate(${barX+barW-64} ${barY+52})">
      <path d="M -11 4 C -11 -8, -6 -14, 0 -14 C 6 -14, 11 -8, 11 4 L 14 8 L -14 8 Z" fill="#f2f2f5"/>
      <path d="M -4 11 a4 4 0 0 0 8 0" fill="none" stroke="#f2f2f5" stroke-width="2.4"/>
    </g>
  </g>`);

  /* ---------------- frame ---------------- */
  layers.push(`<rect x="0" y="0" width="${W}" height="10" fill="${C.red}"/>`);
  layers.push(`<rect x="0" y="${H-10}" width="${W}" height="10" fill="${C.gold}"/>`);
  layers.push(`<rect width="${W}" height="${H}" filter="url(#${id}Grain)" opacity=".55"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Justice Society of Activism end screen">
${faces()}
${defs.join('')}
${layers.join('\n')}
</svg>`;
}

module.exports = { endScreen };
