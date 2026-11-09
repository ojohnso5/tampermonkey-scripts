/**
 * Font metrics.
 *
 * Advance widths for Bebas Neue in em units, measured from the real typeface
 * in a browser. With these, string widths can be computed exactly at build
 * time, so headline type can be auto-fitted to its column without a render
 * pass.
 */
const BEBAS = {
  "0": 0.57,
  "1": 0.57,
  "2": 0.57,
  "3": 0.57,
  "4": 0.57,
  "5": 0.57,
  "6": 0.57,
  "7": 0.57,
  "8": 0.57,
  "9": 0.57,
  "A": 0.64,
  "B": 0.65,
  "C": 0.63,
  "D": 0.73,
  "E": 0.555,
  "F": 0.52,
  "G": 0.73,
  "H": 0.74,
  "I": 0.34,
  "J": 0.275,
  "K": 0.62,
  "L": 0.525,
  "M": 0.905,
  "N": 0.76,
  "O": 0.78,
  "P": 0.605,
  "Q": 0.78,
  "R": 0.62,
  "S": 0.55,
  "T": 0.555,
  "U": 0.73,
  "V": 0.6,
  "W": 0.93,
  "X": 0.585,
  "Y": 0.565,
  "Z": 0.57,
  " ": 0
};

const DEFAULT = 0.6;

/** Width of a string in em units. */
function emWidth(text, table) {
  const t = table || BEBAS;
  let w = 0;
  for (const ch of String(text)) w += (t[ch] !== undefined ? t[ch] : DEFAULT);
  return w;
}

/**
 * Largest font size (px) at which `text` fits `avail` px, allowing for
 * letter-spacing of `ls` px per character.
 */
function fitSize(text, avail, ls, maxSize, minSize) {
  const n = String(text).length;
  const em = emWidth(text);
  if (em <= 0) return maxSize;
  const size = (avail - ls * n) / em;
  return Math.max(minSize, Math.min(maxSize, Math.floor(size)));
}

module.exports = { BEBAS, DEFAULT, emWidth, fitSize };
