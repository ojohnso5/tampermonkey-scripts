/**
 * Video watermark — minimalist, transparent.
 *
 * Elements, and nothing else:
 *   - the JSA chest emblem, dominant
 *   - a small globe tucked behind it, electric-blue core
 *   - a soft red energy glow
 *
 * No hero. No text. No border or ring of any kind.
 *
 * Designed for the lower-right corner of a YouTube video, so the unit has to
 * read as ONE compact mark at 32-48 px rather than as two separate objects.
 * The globe therefore sits behind the emblem, overlapping it, and the gold
 * monogram does the identifying.
 */
const { C, rgba } = require('./palette');
const geo = require('./geo');
const { emblem, emblemDefs } = require('./emblem');

// The monogram is drawn in a 0..200 box but its ink actually spans
// x 18-200, y 30-152. These are the true bounds, used to centre it.
const MONO_BOUNDS = { x0: 18, y0: 30, x1: 200, y1: 152 };

function watermark(o) {
  o = Object.assign({ size: 512, idPrefix: 'W' }, o);
  const S = o.size, id = o.idPrefix;
  const defs = [];
  const layers = [];

  defs.push(`
  <radialGradient id="${id}Core" cx=".38" cy=".30" r=".82">
    <stop offset="0" stop-color="#DFF6FF"/>
    <stop offset=".14" stop-color="#6FD8FA"/>
    <stop offset=".42" stop-color="${C.blue}"/>
    <stop offset=".78" stop-color="#0A6394"/>
    <stop offset="1" stop-color="#053B5C"/>
  </radialGradient>
  <linearGradient id="${id}Gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#F6E7B4"/><stop offset=".22" stop-color="${C.gold}"/>
    <stop offset=".48" stop-color="${C.goldDeep}"/><stop offset=".7" stop-color="${C.gold}"/>
    <stop offset="1" stop-color="#F6E7B4"/>
  </linearGradient>
  <radialGradient id="${id}RedGlow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="${C.red}" stop-opacity=".30"/>
    <stop offset=".42" stop-color="${C.red}" stop-opacity=".11"/>
    <stop offset=".76" stop-color="${C.red}" stop-opacity=".03"/>
    <stop offset="1" stop-color="${C.red}" stop-opacity="0"/>
  </radialGradient>
  <filter id="${id}GlobeFx" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${S*0.010}" result="sblur"/>
    <feOffset in="sblur" dx="0" dy="${S*0.005}" result="soff"/>
    <feFlood flood-color="#000000" flood-opacity="0.5" result="scol"/>
    <feComposite in="scol" in2="soff" operator="in" result="shadow"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}Glow" x="-70%" y="-70%" width="240%" height="240%">
    <feGaussianBlur stdDeviation="7" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}Soft" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="6"/>
  </filter>
  <filter id="${id}GoldGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="5" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <!-- Watermark legibility: a dark drop shadow so the mark holds up over
       bright footage, plus a gold bloom so it holds up over dark footage. -->
  <filter id="${id}EmblemFx" x="-60%" y="-60%" width="220%" height="220%">
    <!-- tight dark contour hugging the letterforms: this is what keeps the
         mark legible over bright footage, without adding a visible border -->
    <feMorphology in="SourceAlpha" operator="dilate" radius="${S*0.006}" result="grow"/>
    <feGaussianBlur in="grow" stdDeviation="${S*0.004}" result="sblur"/>
    <feFlood flood-color="#000000" flood-opacity="0.88" result="scol"/>
    <feComposite in="scol" in2="sblur" operator="in" result="shadow"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="${S*0.009}" result="gblur"/>
    <feFlood flood-color="${C.gold}" flood-opacity="0.65" result="gcol"/>
    <feComposite in="gcol" in2="gblur" operator="in" result="gglow"/>
    <feMerge>
      <feMergeNode in="shadow"/>
      <feMergeNode in="gglow"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>`);
  defs.push(emblemDefs(id + 'E'));

  /* ---- red energy glow, sitting behind everything ---------------- */
  // Centred on the emblem so it reads as a halo around the mark rather
  // than a wash across the canvas.
  const EX = S * 0.585, EY = S * 0.585;
  layers.push(`<circle cx="${EX}" cy="${EY}" r="${S*0.235}" fill="url(#${id}RedGlow)"/>`);

  /* ---- small globe, behind and above-left ------------------------ */
  const R = S * 0.098;
  const gx = S * 0.245, gy = S * 0.225;

  // blue energy bloom around the core
  layers.push(`<circle cx="${gx}" cy="${gy}" r="${R*1.32}" fill="${C.blue}" opacity=".26" filter="url(#${id}Soft)"/>`);
  // luminous core, with a soft dark seat so it holds over bright footage
  layers.push(`<circle cx="${gx}" cy="${gy}" r="${R}" fill="url(#${id}Core)" filter="url(#${id}GlobeFx)"/>`);
  // graticule, very faint surface detail (not a border)
  const grid = geo.graticule(R, gx, gy, 45);
  layers.push(`<g fill="none" stroke="#BDEBFF" stroke-width="${S*0.0026}" opacity=".22">` +
    grid.map(d => `<path d="${d}"/>`).join('') + `</g>`);
  // gold continents
  const lands = [geo.NORTH_AMERICA, geo.SOUTH_AMERICA, geo.GREENLAND, geo.CENTRAL_AMERICA];
  layers.push(`<g fill="url(#${id}Gold)" opacity=".9">` +
    lands.map(poly => `<path d="${geo.polyPath(poly, R, gx, gy)}"/>`).join('') + `</g>`);
  // a soft terminator so the core reads as a sphere, not a flat disc
  layers.push(`<circle cx="${gx}" cy="${gy}" r="${R}" fill="none" stroke="#BDEBFF"
    stroke-width="${S*0.005}" opacity=".55"/>`);
  // specular highlight on the upper-left of the sphere
  layers.push(`<ellipse cx="${gx - R*0.32}" cy="${gy - R*0.36}" rx="${R*0.30}" ry="${R*0.18}"
    fill="#EAFBFF" opacity=".38" transform="rotate(-30 ${gx - R*0.32} ${gy - R*0.36})"/>`);

  /* ---- the emblem, dominant, overlapping the globe ---------------- */
  const es = S * 0.780;
  const scale = es / 200;
  // centre the monogram's true ink bounds on this point
  const ex = S * 0.585, ey = S * 0.585;
  const tx = ex - ((MONO_BOUNDS.x0 + MONO_BOUNDS.x1) / 2) * scale;
  const ty = ey - ((MONO_BOUNDS.y0 + MONO_BOUNDS.y1) / 2) * scale;

  layers.push(`<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})"
     filter="url(#${id}EmblemFx)">
    ${emblem({ idPrefix: id + 'E', gold: C.gold, blue: C.blue })}
  </g>`);

  // electric-blue energy spilling off the emblem, tying it to the globe
  layers.push(`<g filter="url(#${id}Glow)" opacity=".85">
    <path d="M ${ex - S*0.075} ${ey + S*0.115} C ${ex - S*0.12} ${ey + S*0.045},
             ${ex - S*0.03} ${ey - S*0.02}, ${ex - S*0.075} ${ey - S*0.055}"
      fill="none" stroke="${C.blue}" stroke-width="${S*0.011}" stroke-linecap="round" opacity=".8"/>
  </g>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" role="img" aria-label="Justice Society of Activism watermark">
${defs.join('')}
${layers.join('\n')}
</svg>`;
}

/**
 * A preview sheet showing the watermark composited over bright, mid and dark
 * footage at the lower-right corner, at the size it would actually be used.
 */
function watermarkPreview(o) {
  o = Object.assign({ width: 960, height: 1620, idPrefix: 'W' }, o);
  const W = o.width, H = o.height, FH = H / 3;
  const wm = watermark({ size: 512, idPrefix: o.idPrefix + 'P' });
  const inner = wm.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const defs = wm.match(/<defs>[\s\S]*?<\/defs>/);
  const frames = [
    { name: 'BRIGHT FOOTAGE', top: '#e8e4dc', bot: '#cfc8bb', ink: '#333' },
    { name: 'MID FOOTAGE', top: '#6b7280', bot: '#4b5563', ink: '#fff' },
    { name: 'DARK FOOTAGE', top: '#0b0b0f', bot: '#1c2029', ink: '#fff' }
  ];
  const body = frames.map((f, i) => `
    <g transform="translate(0 ${i * FH})">
      <rect width="${W}" height="${FH}" fill="url(#${o.idPrefix}Bg${i})"/>
      <rect width="${W}" height="${FH}" fill="#000" opacity=".05"/>
      <text x="16" y="34" font-family="Montserrat, Arial, sans-serif" font-weight="700" font-size="15"
        letter-spacing="3" fill="${f.ink}" opacity=".8">${f.name}</text>
      <g transform="translate(${W - 132} ${FH - 128}) scale(0.222)">${inner}</g>
    </g>`).join('');

  const defsAll = frames.map((f, i) =>
    `<linearGradient id="${o.idPrefix}Bg${i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${f.top}"/><stop offset="1" stop-color="${f.bot}"/></linearGradient>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${defs ? defs[0] : ''}
<defs>${defsAll}</defs>
${body}
</svg>`;
}

module.exports = { watermark, watermarkPreview };
