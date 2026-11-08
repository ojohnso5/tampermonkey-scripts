/**
 * YouTube's banner safe area — the single source of truth.
 *
 * YouTube crops channel banners differently on every device. The region
 * that survives every crop is a 1546 x 423 rectangle centred in the
 * 2560 x 1440 canvas:
 *
 *   x  507 .. 2053
 *   y  508 ..  931
 *
 * Anything outside that band can be cut off on phones, TVs or in the mobile
 * app, so every meaningful element must sit inside it.
 */
const CANVAS = { width: 2560, height: 1440 };
const SAFE = { width: 1546, height: 423 };

const AREA = {
  x0: Math.round((CANVAS.width  - SAFE.width)  / 2),
  x1: Math.round((CANVAS.width  + SAFE.width)  / 2),
  y0: Math.round((CANVAS.height - SAFE.height) / 2),
  y1: Math.round((CANVAS.height + SAFE.height) / 2)
};

module.exports = { CANVAS, SAFE, AREA };
