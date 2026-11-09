/**
 * JSA Brand Palette — single source of truth.
 * Every asset generator imports from here so the system stays coherent.
 */
const C = {
  midnight:  '#0B0B0F',
  red:       '#E11937',
  gold:      '#D4AF37',
  blue:      '#00AEEF',

  // derived tones
  goldLight: '#F2DFA0',
  goldDeep:  '#8A6D1F',
  redDeep:   '#8E0F24',
  blueLight: '#7FE0FF',
  blueDeep:  '#005C86',
  ink:       '#050508',
  paper:     '#FFFFFF'
};

const rgba = (hex, a) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

module.exports = { C, rgba };
