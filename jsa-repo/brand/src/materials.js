/**
 * Materials — the surface treatment behind "metallic gold finishes" and
 * "photorealistic materials".
 *
 * Pure vector cannot be physically rendered, but it can reproduce what
 * makes metal read as metal:
 *
 *   - anisotropic reflection: sharp bright and deep shadow bands, not a
 *     smooth ramp, because a polished surface reflects a hard environment
 *   - brushed micro-streaks: fine directional grain across the surface
 *   - a specular highlight: one hard, bright edge where the key light hits
 *   - a broad environment band: the soft mid-tone the metal sits in
 *
 * These are shared by the crest, the emblem, the banner type and the
 * watermark, so every gold surface in the system behaves the same way.
 */
const { C } = require('./palette');

/**
 * An anisotropic metal gradient.
 * @param {string} id
 * @param {object} o { angle, spread, tone, bands }
 */
function metalGradient(id, o) {
  o = Object.assign({ angle: 'x1="0" y1="0" x2="1" y2="1"', spread: 1, tone: 1, bands: 9 }, o);
  const hi = '#F7E9BE', mid = C.gold, lo = '#6E551A', deep = '#3E300D';
  const stops = [];
  for (let i = 0; i <= o.bands; i++) {
    const t = i / o.bands;
    // a hard-edged reflection: bright band, falling to a deep shadow, twice
    let col;
    if (t < 0.10) col = hi;
    else if (t < 0.22) col = mid;
    else if (t < 0.34) col = lo;
    else if (t < 0.46) col = hi;
    else if (t < 0.58) col = mid;
    else if (t < 0.70) col = deep;
    else if (t < 0.82) col = mid;
    else if (t < 0.92) col = hi;
    else col = mid;
    stops.push(`<stop offset="${t.toFixed(3)}" stop-color="${col}" stop-opacity="${o.tone}"/>`);
  }
  return `<linearGradient id="${id}" ${o.angle}>${stops.join('')}</linearGradient>`;
}

/**
 * Brushed micro-streaks: fine directional grain.
 * Deterministic, so output is reproducible.
 * @param {object} o { cx, cy, r, width, count, angle, color, opacity, seed }
 * @returns {string} path data for a group of thin lines
 */
function brushedStreaks(o) {
  o = Object.assign({
    cx: 0, cy: 0, r: 0, width: 0, count: 120, angle: -22,
    color: '#F7E9BE', opacity: 0.16, seed: 5150, len: 0.55
  }, o);
  let seed = o.seed;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const rad = o.angle * Math.PI / 180;
  const out = [];
  for (let i = 0; i < o.count; i++) {
    // a chord across the shape, jittered along the surface
    const t = (rnd() - 0.5) * 2;                       // -1..1 across
    const half = Math.sqrt(Math.max(0, 1 - t * t)) * o.r * o.len;
    const nx = -Math.sin(rad), ny = Math.cos(rad);
    const mx = o.cx + Math.cos(rad) * t * o.r;
    const my = o.cy + Math.sin(rad) * t * o.r;
    const a = rnd() > 0.5 ? 1 : -1;
    const x1 = mx - nx * half * a, y1 = my - ny * half * a;
    const x2 = mx + nx * half * a, y2 = my + ny * half * a;
    const w = (0.35 + rnd() * 1.1) * (o.width / 36);
    out.push(`<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}"
      stroke="${o.color}" stroke-width="${w.toFixed(2)}" opacity="${(o.opacity * (0.4 + rnd() * 0.8)).toFixed(3)}"
      stroke-linecap="round"/>`);
  }
  return out.join('');
}

/**
 * A hard specular highlight: a short bright arc where the key light hits.
 */
function specularArc(o) {
  o = Object.assign({
    cx: 0, cy: 0, r: 0, width: 0, from: -125, to: -55,
    color: '#FFF6DC', opacity: 0.85
  }, o);
  const a0 = o.from * Math.PI / 180, a1 = o.to * Math.PI / 180;
  const x0 = o.cx + Math.cos(a0) * o.r, y0 = o.cy + Math.sin(a0) * o.r;
  const x1 = o.cx + Math.cos(a1) * o.r, y1 = o.cy + Math.sin(a1) * o.r;
  return `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${o.r} ${o.r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}"
    fill="none" stroke="${o.color}" stroke-width="${o.width}" opacity="${o.opacity}" stroke-linecap="round"/>`;
}

/**
 * A mask that keeps an overlay inside a stroked circle — used to brush the
 * streaks onto a ring without spilling onto the background.
 */
function ringMask(id, cx, cy, r, width) {
  return `<mask id="${id}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-width="${width}"/>
  </mask>`;
}

/**
 * A mask that keeps an overlay inside a filled path.
 */
function pathMask(id, d) {
  return `<mask id="${id}"><path d="${d}" fill="#ffffff"/></mask>`;
}

module.exports = { metalGradient, brushedStreaks, specularArc, ringMask, pathMask };
