/**
 * Video watermark — transparent background, minimal.
 *
 * Globe + JSA emblem only. No hero, no text. Sized so it stays legible
 * over busy footage at around 6-10% of frame width.
 */
const { C, rgba } = require('./palette');
const geo = require('./geo');
const { emblem, emblemDefs } = require('./emblem');

function watermark(o) {
  o = Object.assign({ size: 512, idPrefix: 'W' }, o);
  const S = o.size, id = o.idPrefix;
  const cx = S / 2, cy = S / 2;
  const defs = [];
  const layers = [];

  defs.push(`
  <radialGradient id="${id}Core" cx=".42" cy=".36" r=".74">
    <stop offset="0" stop-color="#5FD4FF"/><stop offset=".35" stop-color="#128FC4"/>
    <stop offset="1" stop-color="#05304A"/>
  </radialGradient>
  <linearGradient id="${id}Gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.goldLight}"/><stop offset=".35" stop-color="${C.gold}"/>
    <stop offset=".7" stop-color="${C.goldDeep}"/><stop offset="1" stop-color="${C.goldLight}"/>
  </linearGradient>
  <filter id="${id}Glow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="6" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}Soft" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="10"/>
  </filter>`);
  defs.push(emblemDefs(id + 'E'));

  const R = S * 0.40;
  const gx = cx, gy = cy - S * 0.055;

  // soft glow so it reads over bright footage
  layers.push(`<circle cx="${gx}" cy="${gy}" r="${R*1.35}" fill="${C.blue}" opacity=".28" filter="url(#${id}Soft)"/>`);

  // globe
  layers.push(`<circle cx="${gx}" cy="${gy}" r="${R}" fill="url(#${id}Core)"/>`);
  const grid = geo.graticule(R, gx, gy, 20);
  layers.push(`<g fill="none" stroke="${C.blue}" stroke-width="${S*0.004}" opacity=".4">` +
    grid.map(d => `<path d="${d}"/>`).join('') + `</g>`);
  const lands = [geo.NORTH_AMERICA, geo.SOUTH_AMERICA, geo.GREENLAND, geo.CENTRAL_AMERICA, geo.CARIBBEAN];
  layers.push(`<g fill="url(#${id}Gold)">` +
    lands.map(poly => `<path d="${geo.polyPath(poly, R, gx, gy)}"/>`).join('') + `</g>`);
  layers.push(`<circle cx="${gx}" cy="${gy}" r="${R}" fill="none" stroke="url(#${id}Gold)" stroke-width="${S*0.018}"/>`);

  // emblem below the globe
  const es = S * 0.44;
  const ex = cx, ey = cy + S * 0.245;
  layers.push(`<g transform="translate(${ex - es/2} ${ey - es/2}) scale(${es/200})" filter="url(#${id}Glow)">
    ${emblem({ idPrefix: id + 'E', gold: C.gold, blue: C.blue })}
  </g>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" role="img" aria-label="Justice Society of Activism watermark">
${defs.join('')}
${layers.join('\n')}
</svg>`;
}

module.exports = { watermark };
