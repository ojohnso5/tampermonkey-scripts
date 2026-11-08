/**
 * JSA chest emblem — the hidden monogram.
 *
 * Design: the letters J, S and A are fused into a single interlocking
 * mark. Gold metal structure, with an electric-blue energy stream running
 * through the negative space. Reads as one symbol at 32px.
 *
 * Coordinate space: 0..200 square, centred.
 */
const { C, rgba } = require('./palette');

/**
 * @param {object} o
 * @param {number} o.size    rendered size in user units
 * @param {string} o.gold    metal colour
 * @param {string} o.blue    energy colour
 * @param {boolean} o.standalone  render with its own shield frame
 */
function emblem(o) {
  o = Object.assign({
    size: 200, gold: C.gold, blue: C.blue, standalone: false,
    idPrefix: 'e', showShield: false
  }, o);
  const g = [];

  // --- Interlocked letterforms -----------------------------------------
  // J : vertical stem with a hook to the left, squared terminals
  g.push(`<path d="M 74 44 L 74 112 C 74 132, 62 144, 44 144 C 30 144, 21 137, 18 128
      L 30 118 C 33 124, 37 127, 44 127 C 52 127, 56 122, 56 113 L 56 44 Z"
      fill="url(#${o.idPrefix}Gold)"/>`);

  // S : the middle spine, a bold S that overlaps the J
  g.push(`<path d="M 118 40 C 106 33, 92 30, 80 33 C 66 37, 58 47, 60 60
      C 62 72, 73 78, 88 82 C 101 85, 108 89, 110 96 C 112 103, 107 109, 98 111
      C 88 113, 79 110, 72 105 L 62 118 C 73 126, 88 130, 102 126
      C 116 122, 126 111, 124 97 C 122 84, 110 78, 95 74 C 82 71, 75 68, 75 62
      C 75 56, 81 51, 90 51 C 97 51, 103 54, 109 58 Z"
      fill="url(#${o.idPrefix}Gold)"/>`);

  // A : the outer triangle, overlapping S and J on the right
  g.push(`<path d="M 126 152 L 154 44 L 178 44 L 200 152 L 180 152 L 176 134
      L 142 134 L 138 152 Z M 148 116 L 170 116 L 159 66 Z"
      fill="url(#${o.idPrefix}Gold)" fill-rule="evenodd"/>`);

  // --- Energy stream through the mark ---------------------------------
  // A blue bolt threading J -> S -> A, the "truth flowing through" line.
  g.push(`<path d="M 66 28 L 52 78 L 72 78 L 58 132 L 96 72 L 74 72 L 90 28 Z"
      fill="${o.blue}" opacity=".92" filter="url(#${o.idPrefix}Glow)"/>`);

  // Small energy node at the crossing point
  g.push(`<circle cx="66" cy="78" r="7" fill="${C.blueLight}" opacity=".95"/>`);
  g.push(`<circle cx="66" cy="78" r="13" fill="none" stroke="${o.blue}" stroke-width="2" opacity=".55"/>`);

  // --- Shield frame (standalone / badge use) ---------------------------
  if (o.showShield) {
    g.push(`<path d="M 100 6 L 190 34 L 190 104 C 190 148, 154 176, 100 194
        C 46 176, 10 148, 10 104 L 10 34 Z"
      fill="rgba(11,11,15,.92)" stroke="url(#${o.idPrefix}Gold)" stroke-width="6"/>`);
    g.push(`<path d="M 100 18 L 178 42 L 178 102 C 178 140, 148 164, 100 180
        C 52 164, 22 140, 22 102 L 22 42 Z"
      fill="none" stroke="${o.blue}" stroke-width="2" opacity=".6"/>`);
  }

  return g.join('\n');
}

/** Defs for the emblem. */
function emblemDefs(id) {
  const { C } = require('./palette');
  return `
  <linearGradient id="${id}Gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.goldLight}"/><stop offset=".3" stop-color="${C.gold}"/>
    <stop offset=".62" stop-color="${C.goldDeep}"/><stop offset=".85" stop-color="${C.gold}"/>
    <stop offset="1" stop-color="${C.goldLight}"/>
  </linearGradient>
  <filter id="${id}Glow" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

module.exports = { emblem, emblemDefs };
