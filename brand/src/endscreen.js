/**
 * End screen — 1920 x 1080.
 *
 *   centre  large crest
 *   left    video placeholder
 *   right   video placeholder
 *   bottom  subscribe area
 *
 * Professional news-desk feel: dark, restrained, one accent colour.
 */
const { C, rgba } = require('./palette');
const { faces } = require('./fonts');
const { crest } = require('./crest');

function endScreen(o) {
  o = Object.assign({ width: 1920, height: 1080, idPrefix: 'E' }, o);
  const W = o.width, H = o.height, id = o.idPrefix;
  const defs = [];
  const layers = [];

  defs.push(`
  <linearGradient id="${id}Bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#07070A"/><stop offset=".5" stop-color="#110A0F"/>
    <stop offset="1" stop-color="#06060A"/>
  </linearGradient>
  <radialGradient id="${id}Atmos" cx=".5" cy=".42" r=".62">
    <stop offset="0" stop-color="${C.red}" stop-opacity=".26"/>
    <stop offset="1" stop-color="${C.red}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="${id}BlueAtmos" cx=".15" cy=".8" r=".55">
    <stop offset="0" stop-color="${C.blue}" stop-opacity=".18"/>
    <stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="${id}Gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.goldLight}"/><stop offset=".4" stop-color="${C.gold}"/>
    <stop offset="1" stop-color="${C.goldDeep}"/>
  </linearGradient>
  <filter id="${id}Blur" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="30"/>
  </filter>
  <filter id="${id}TextGlow" x="-20%" y="-40%" width="140%" height="180%">
    <feGaussianBlur stdDeviation="8" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}Grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope=".05"/></feComponentTransfer>
  </filter>`);

  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Bg)"/>`);
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Atmos)"/>`);
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}BlueAtmos)"/>`);

  // subtle world-map texture: dot matrix suggestive of a globe
  let seed = 4242;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const dots = [];
  for (let i = 0; i < 420; i++) {
    const x = rnd() * W, y = rnd() * H;
    dots.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1+rnd()*2.6).toFixed(1)}"
      fill="${rnd()>0.5?C.blue:C.gold}" opacity="${(0.03+rnd()*0.13).toFixed(2)}"/>`);
  }
  layers.push(`<g>${dots.join('')}</g>`);

  // energy currents
  const currents = [];
  for (let i = 0; i < 16; i++) {
    const y0 = rnd() * H, x0 = rnd() * W * 0.5;
    const len = 600 + rnd() * 900;
    currents.push(`<path d="M ${x0} ${y0} C ${x0+len*0.33} ${y0-90}, ${x0+len*0.66} ${y0+80}, ${x0+len} ${y0-20}"
      fill="none" stroke="${rnd()>0.4?C.blue:C.gold}" stroke-width="${(1.4+rnd()*3.6).toFixed(1)}"
      opacity="${(0.06+rnd()*0.2).toFixed(2)}" stroke-linecap="round"/>`);
  }
  layers.push(`<g filter="url(#${id}Blur)">${currents.join('')}</g>`);

  // ---- centre crest ---------------------------------------------------
  const cs = 400;
  layers.push(`<g transform="translate(${W/2 - cs/2} 150) scale(${cs/1024})">
    ${crest({ size: 1024, idPrefix: id + 'C', transparent: true, withParticles: false, inner: true })}
  </g>`);

  layers.push(`<g filter="url(#${id}TextGlow)">
    <text x="${W/2}" y="640" text-anchor="middle" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="86" letter-spacing="5" fill="url(#${id}Gold)">JUSTICE SOCIETY OF ACTIVISM</text>
  </g>`);
  layers.push(`<text x="${W/2}" y="700" text-anchor="middle" font-family="'Montserrat', Arial, sans-serif"
    font-weight="700" font-size="26" letter-spacing="12" fill="#C9C9D4">EVIDENCE • AMPLITUDE • ACTION</text>`);

  // ---- video placeholders --------------------------------------------
  const ph = [
    { x: 90, label: 'NEXT INVESTIGATION' },
    { x: W - 90 - 620, label: 'MOST WATCHED' }
  ];
  ph.forEach(p => {
    layers.push(`<g>
      <rect x="${p.x}" y="250" width="620" height="349" rx="18" fill="#0B0B10" opacity=".82"
        stroke="${C.gold}" stroke-width="3" stroke-opacity=".65"/>
      <rect x="${p.x}" y="250" width="620" height="349" rx="18" fill="none" stroke="${C.blue}" stroke-width="1.5" stroke-opacity=".3"/>
      <circle cx="${p.x + 310}" cy="${250 + 174}" r="52" fill="${C.red}" opacity=".92"/>
      <path d="M ${p.x+296} ${250+148} L ${p.x+340} ${250+174} L ${p.x+296} ${250+200} Z" fill="#fff"/>
      <text x="${p.x + 310}" y="${250 + 392}" text-anchor="middle" font-family="'Montserrat', Arial, sans-serif"
        font-weight="700" font-size="24" letter-spacing="5" fill="#D6D6DE">${p.label}</text>
    </g>`);
  });

  // ---- subscribe area -------------------------------------------------
  layers.push(`<g>
    <rect x="${W/2 - 300}" y="800" width="600" height="104" rx="52" fill="${C.red}"/>
    <text x="${W/2 - 22}" y="868" text-anchor="middle" font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
      font-size="54" letter-spacing="4" fill="#FFFFFF">SUBSCRIBE</text>
    <circle cx="${W/2 + 258}" cy="852" r="34" fill="#fff"/>
    <path d="M ${W/2 + 246} ${836} L ${W/2 + 272} ${852} L ${W/2 + 246} ${868} Z" fill="${C.red}"/>
  </g>`);
  layers.push(`<text x="${W/2}" y="960" text-anchor="middle" font-family="'Montserrat', Arial, sans-serif"
    font-weight="700" font-size="27" letter-spacing="4" fill="#B9B9C6">@JusticeSocietyofActivism</text>`);

  layers.push(`<rect x="0" y="0" width="${W}" height="10" fill="${C.red}"/>`);
  layers.push(`<rect x="0" y="${H-10}" width="${W}" height="10" fill="${C.gold}"/>`);
  layers.push(`<rect width="${W}" height="${H}" filter="url(#${id}Grain)" opacity=".6"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Justice Society of Activism end screen">
${faces()}
${defs.join('')}
${layers.join('\n')}
</svg>`;
}

module.exports = { endScreen };
