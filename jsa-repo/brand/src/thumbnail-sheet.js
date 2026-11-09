/**
 * Contact sheet — every thumbnail variant stacked vertically with its
 * headline labelled, so the whole system can be reviewed at a glance.
 */
const { thumbnail, HEADLINES } = require('./thumbnail');

function contactSheet(o) {
  o = Object.assign({ width: 1300 }, o);
  const W = o.width;
  const pad = 10;
  const tw = 1280, th = 720;
  const labelH = 46;
  const rowH = labelH + th + pad;
  const H = HEADLINES.length * rowH + pad;
  let y = pad;
  const rows = HEADLINES.map(h => {
    const svg = thumbnail({ headline: h, kicker: 'JSA INVESTIGATION', variant: 'default' });
    const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    const defs = svg.match(/<defs>[\s\S]*?<\/defs>/);
    const row = `
      <g transform="translate(${pad} ${y})">
        <text x="0" y="28" font-family="'Montserrat', Arial, sans-serif" font-weight="800" font-size="22"
          letter-spacing="4" fill="#D4AF37">${h.toUpperCase()}</text>
        <g transform="translate(0 ${labelH}) scale(${tw / 1280})">${inner}</g>
      </g>`;
    y += labelH + th + pad;
    return { row, defs: defs ? defs[0] : '' };
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#0B0B0F"/>
${rows[0].defs}
${rows.map(r => r.row).join('\n')}
</svg>`;
}

module.exports = { contactSheet };
