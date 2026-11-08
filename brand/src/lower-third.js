/**
 * Lower-third — a thin graphic that sits at the bottom of a video frame.
 *
 * Two variants:
 *   - episode   : small crest + wordmark on the left, episode title + kicker
 *                 on the right, with a red accent bar and gold rule
 *   - live      : same layout, but the kicker is replaced by a pulsing
 *                 LIVE badge
 *
 * Canvas: 1920 x 240. Transparent background so it can be overlaid on any
 * footage. The bottom 240 px of a 1080 frame is the standard lower-third
 * band.
 */
const { C, rgba } = require('./palette');
const { faces } = require('./fonts');
const { crest } = require('./crest');
const mat = require('./materials');

function lowerThird(o) {
  o = Object.assign({
    width: 1920, height: 240,
    wordmark: 'JUSTICE SOCIETY OF ACTIVISM',
    kicker: 'EPISODE 01',
    title: 'THE QUIET AUCTION',
    idPrefix: 'L',
    variant: 'episode'   // 'episode' | 'live'
  }, o);
  const W = o.width, H = o.height, id = o.idPrefix;
  const defs = [];
  const layers = [];

  defs.push(`
  <linearGradient id="${id}Bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0B0B0F" stop-opacity="0"/>
    <stop offset=".35" stop-color="#0B0B0F" stop-opacity=".78"/>
    <stop offset="1" stop-color="#0B0B0F" stop-opacity=".96"/>
  </linearGradient>
  <linearGradient id="${id}Gold" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.gold}"/><stop offset=".5" stop-color="${C.goldLight}"/>
    <stop offset="1" stop-color="${C.gold}"/>
  </linearGradient>
  <radialGradient id="${id}RedGlow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="${C.red}" stop-opacity=".55"/>
    <stop offset="1" stop-color="${C.red}" stop-opacity="0"/>
  </radialGradient>
  <filter id="${id}Glow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="6" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}BlurS" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="5"/>
  </filter>`);

  // ---- background band ----
  layers.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id}Bg)"/>`);

  // red accent bar at the top
  layers.push(`<rect x="0" y="0" width="${W}" height="6" fill="${C.red}"/>`);
  layers.push(`<rect x="0" y="0" width="${W}" height="6" fill="url(#${id}RedGlow)" opacity=".6"/>`);

  // blue energy streak along the bottom
  layers.push(`<g filter="url(#${id}BlurS)">
    <path d="M 0 ${H-18} C 420 ${H-50}, 860 ${H+10}, 1320 ${H-26} S 1720 ${H+14}, ${W} ${H-18}"
      fill="none" stroke="${C.blue}" stroke-width="8" stroke-linecap="round" opacity=".55"/>
  </g>`);
  layers.push(`<path d="M 0 ${H-18} C 420 ${H-50}, 860 ${H+10}, 1320 ${H-26} S 1720 ${H+14}, ${W} ${H-18}"
    fill="none" stroke="${C.blue}" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>`);

  // ---- left: small crest + wordmark ----
  const cs = 108;
  layers.push(`<g transform="translate(36 ${(H - cs) / 2 - 6}) scale(${cs / 1024})">
    ${crest({ size: 1024, idPrefix: id + 'C', transparent: true, withParticles: false, inner: true })}
  </g>`);
  layers.push(`<text x="${36 + cs + 14}" y="${H / 2 + 6}"
    font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
    font-size="34" letter-spacing="2" fill="${C.gold}">${o.wordmark}</text>`);
  layers.push(`<text x="${36 + cs + 14}" y="${H / 2 + 28}"
    font-family="'Montserrat', Arial, sans-serif" font-weight="700"
    font-size="13" letter-spacing="5" fill="#8f8f9e">EVIDENCE • AMPLITUDE • ACTION</text>`);

  // ---- right: kicker + title ----
  const kickerX = 1180;
  if (o.variant === 'live') {
    // pulsing LIVE badge
    layers.push(`<g>
      <rect x="${kickerX}" y="${H / 2 - 44}" width="108" height="34" rx="6" fill="${C.red}"/>
      <circle cx="${kickerX + 22}" cy="${H / 2 - 27}" r="5" fill="#fff">
        <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      <text x="${kickerX + 62}" y="${H / 2 - 20}" text-anchor="middle"
        font-family="'Montserrat', Arial, sans-serif" font-weight="800" font-size="18" letter-spacing="3"
        fill="#fff">LIVE</text>
    </g>`);
  } else {
    layers.push(`<rect x="${kickerX}" y="${H / 2 - 44}" width="10" height="34" fill="${C.gold}"/>`);
    layers.push(`<text x="${kickerX + 22}" y="${H / 2 - 20}"
      font-family="'Montserrat', Arial, sans-serif" font-weight="800" font-size="18" letter-spacing="4"
      fill="${C.gold}">${o.kicker}</text>`);
  }

  // title
  layers.push(`<text x="${kickerX}" y="${H / 2 + 30}"
    font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
    font-size="48" letter-spacing="2" fill="#FFFFFF">${o.title}</text>`);

  // gold rule under the title
  layers.push(`<rect x="${kickerX}" y="${H / 2 + 44}" width="620" height="3" fill="url(#${id}Gold)"/>`);

  // thin gold divider between left and right
  layers.push(`<rect x="${W / 2 - 1}" y="26" width="2" height="${H - 52}" fill="${C.gold}" opacity=".28"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="lower third">
${faces()}
${defs.join('')}
${layers.join('\n')}
</svg>`;
}

module.exports = { lowerThird };
