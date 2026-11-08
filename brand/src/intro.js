/**
 * Intro animation — a 4.6 second cinematic sequence, delivered as a
 * self-contained SVG with SMIL animation (opens in any browser, no JS).
 *
 * The beats, per the brief:
 *   0.0s  black
 *   0.3s  blue globe energy forms
 *   0.9s  global network lights activate
 *   1.5s  blue energy rises into the JSA emblem
 *   2.1s  hero emerges
 *   2.8s  gold ring forms
 *   3.4s  red energy halo ignites
 *   4.0s  final logo lockup
 */
const { C, rgba } = require('./palette');
const { faces } = require('./fonts');
const geo = require('./geo');
const { crest } = require('./crest');
const { emblem, emblemDefs } = require('./emblem');

function intro(o) {
  o = Object.assign({ width: 1920, height: 1080, idPrefix: 'I' }, o);
  const W = o.width, H = o.height, id = o.idPrefix;
  const cx = W / 2, cy = H / 2 - 30;
  const S = 520;                       // crest size in the lockup
  const defs = [];
  const layers = [];

  defs.push(`
  <radialGradient id="${id}Core" cx=".42" cy=".36" r=".74">
    <stop offset="0" stop-color="#7FE0FF"/><stop offset=".3" stop-color="${C.blue}"/>
    <stop offset="1" stop-color="#052E48"/>
  </radialGradient>
  <linearGradient id="${id}Gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.goldLight}"/><stop offset=".35" stop-color="${C.gold}"/>
    <stop offset=".7" stop-color="${C.goldDeep}"/><stop offset="1" stop-color="${C.goldLight}"/>
  </linearGradient>
  <radialGradient id="${id}Halo" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="${C.red}" stop-opacity="0"/>
    <stop offset=".78" stop-color="${C.red}" stop-opacity="0"/>
    <stop offset=".9" stop-color="${C.red}" stop-opacity=".42"/>
    <stop offset="1" stop-color="${C.red}" stop-opacity="0"/>
  </radialGradient>
  <filter id="${id}BlueGlow" x="-70%" y="-70%" width="240%" height="240%">
    <feGaussianBlur stdDeviation="14" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}GoldGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="9" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}Soft" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="26"/>
  </filter>`);
  defs.push(emblemDefs(id + 'E'));

  const R = S * 0.30;

  // ================= 1. black =================
  layers.push(`<rect width="${W}" height="${H}" fill="#000000">
    <animate attributeName="fill" values="#000000;#000000;#05050A" keyTimes="0;0.2;1" dur="4.6s" fill="freeze"/></rect>`);

  // ================= 2. globe energy forms =================
  const globeGroup = `
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.06;0.12;1" dur="4.6s" fill="freeze"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${id}Core)" opacity="0">
      <animate attributeName="r" values="0;0;${R}" keyTimes="0;0.06;0.16" dur="4.6s" fill="freeze"/>
      <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.06;0.14" dur="4.6s" fill="freeze"/>
    </circle>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.blueLight}" stroke-width="4"
      opacity="0" filter="url(#${id}BlueGlow)">
      <animate attributeName="r" values="0;0;${R}" keyTimes="0;0.07;0.18" dur="4.6s" fill="freeze"/>
      <animate attributeName="opacity" values="0;0;0.9" keyTimes="0;0.07;0.16" dur="4.6s" fill="freeze"/>
    </circle>
    <g fill="none" stroke="${C.blue}" stroke-width="2" opacity="0">
      <animate attributeName="opacity" values="0;0;0.45" keyTimes="0;0.12;0.22" dur="4.6s" fill="freeze"/>
      ${geo.graticule(R, cx, cy, 20).map(d => `<path d="${d}"/>`).join('')}
    </g>
    <g fill="${C.gold}" opacity="0">
      <animate attributeName="opacity" values="0;0;0.9" keyTimes="0;0.14;0.24" dur="4.6s" fill="freeze"/>
      ${[geo.NORTH_AMERICA, geo.SOUTH_AMERICA, geo.GREENLAND, geo.CENTRAL_AMERICA]
        .map(poly => `<path d="${geo.polyPath(poly, R, cx, cy)}"/>`).join('')}
    </g>
  </g>`;
  layers.push(globeGroup);

  // ================= 3. global network lights =================
  const nodes = [];
  let seed = 31337;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const links = [];
  for (let i = 0; i < 46; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = R * (1.1 + rnd() * 0.85);
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.82;
    nodes.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1.8+rnd()*3.6).toFixed(1)}"
      fill="${rnd()>0.5?C.blue:C.gold}" opacity="0">
      <animate attributeName="opacity" values="0;0;1;0.35" keyTimes="0;${(0.16+ (i%9)*0.012).toFixed(3)};${(0.30+(i%9)*0.012).toFixed(3)};1" dur="4.6s" fill="freeze"/></circle>`);
  }
  for (let i = 0; i < 26; i++) {
    const a1 = rnd() * Math.PI * 2, a2 = a1 + (rnd() - 0.5) * 1.6;
    const r1 = R * (1.1 + rnd() * 0.7), r2 = R * (1.1 + rnd() * 0.7);
    links.push(`<path d="M ${(cx+Math.cos(a1)*r1).toFixed(0)} ${(cy+Math.sin(a1)*r1*0.82).toFixed(0)}
      L ${(cx+Math.cos(a2)*r2).toFixed(0)} ${(cy+Math.sin(a2)*r2*0.82).toFixed(0)}"
      stroke="${C.blue}" stroke-width="1.4" opacity="0" fill="none">
      <animate attributeName="opacity" values="0;0;0.45" keyTimes="0;0.17;0.26" dur="4.6s" fill="freeze"/></path>`);
  }
  layers.push(`<g>${links.join('')}${nodes.join('')}</g>`);

  // ================= 4. energy rises into the emblem =================
  const emSize = S * 0.26;
  layers.push(`
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.30;0.36" dur="4.6s" fill="freeze"/>
    <g filter="url(#${id}BlueGlow)">
      <path d="M ${cx} ${cy + R*0.55} C ${cx - 40} ${cy + R*0.30}, ${cx + 34} ${cy + R*0.12}, ${cx} ${cy + R*0.12}"
        fill="none" stroke="${C.blue}" stroke-width="7" stroke-linecap="round">
        <animate attributeName="stroke-dasharray" values="0 400;0 400;400 0" keyTimes="0;0.30;0.40" dur="4.6s" fill="freeze"/>
        <animate attributeName="stroke-dashoffset" values="0;-400" keyTimes="0;0.30;0.40" dur="4.6s" fill="freeze"/>
      </path>
    </g>
    <g transform="translate(${cx - emSize/2} ${cy - emSize/2 - 6}) scale(${emSize/200})"
       filter="url(#${id}GoldGlow)" opacity="0">
      <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.33;0.40" dur="4.6s" fill="freeze"/>
      <animateTransform attributeName="transform" type="scale" additive="sum"
        values="0.6 0.6;0.6 0.6;1 1" keyTimes="0;0.33;0.42" dur="4.6s" fill="freeze"/>
      ${emblem({ idPrefix: id + 'E', gold: C.gold, blue: C.blue })}
    </g>
  </g>`);

  // ================= 5. hero emerges =================
  const crestInner = crest({ size: 1024, idPrefix: id + 'C', transparent: true, withParticles: false, inner: true });
  layers.push(`<g transform="translate(${cx - S/2} ${cy - S/2}) scale(${S/1024})" opacity="0">
    <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.42;0.50" dur="4.6s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" additive="sum"
      values="0 90;0 90;0 0" keyTimes="0;0.42;0.56" dur="4.6s" fill="freeze"/>
    ${crestInner}
  </g>`);

  // ================= 6 + 7. gold ring, red halo =================
  layers.push(`<circle cx="${cx}" cy="${cy}" r="${S*0.47}" fill="none" stroke="url(#${id}Gold)"
    stroke-width="16" opacity="0" filter="url(#${id}GoldGlow)">
    <animate attributeName="r" values="${S*0.30};${S*0.30};${S*0.47}" keyTimes="0;0.52;0.62" dur="4.6s" fill="freeze"/>
    <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.52;0.60" dur="4.6s" fill="freeze"/>
    <animate attributeName="stroke-width" values="26;26;16" keyTimes="0;0.52;0.64" dur="4.6s" fill="freeze"/>
  </circle>`);

  layers.push(`<circle cx="${cx}" cy="${cy}" r="${S*0.50}" fill="url(#${id}Halo)" opacity="0">
    <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.60;0.70" dur="4.6s" fill="freeze"/>
  </circle>`);

  // ================= 8. final lockup =================
  layers.push(`<g opacity="0">
    <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.68;0.76" dur="4.6s" fill="freeze"/>
    <text x="${cx}" y="${cy + S*0.60}" text-anchor="middle"
      font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif" font-size="86" letter-spacing="6"
      fill="url(#${id}Gold)" filter="url(#${id}GoldGlow)">JUSTICE SOCIETY OF ACTIVISM</text>
    <text x="${cx}" y="${cy + S*0.60 + 52}" text-anchor="middle"
      font-family="'Montserrat', Arial, sans-serif" font-weight="700" font-size="24" letter-spacing="12"
      fill="#C9C9D4">EVIDENCE • AMPLITUDE • ACTION</text>
  </g>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
  role="img" aria-label="Justice Society of Activism intro animation">
${faces()}
${defs.join('')}
${layers.join('\n')}
</svg>`;
}

module.exports = { intro };
