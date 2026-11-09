/**
 * Raster helpers. sharp is resolved from whatever is installed locally so the
 * brand tooling stays dependency-light and works without a package.json.
 */
function loadSharp() {
  const candidates = [
    'sharp',
    '/tmp/t/node_modules/sharp',
    '/tmp/node_modules/sharp'
  ];
  for (const c of candidates) {
    try { return require(c); } catch (e) { /* keep looking */ }
  }
  return null;
}

/** Bounding box of the non-transparent pixels in an image. */
async function contentBox(file) {
  const sharp = loadSharp();
  if (!sharp) throw new Error('sharp is not available; install it to run this check');
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + 3] > 8) {
        if (x < minx) minx = x;
        if (x > maxx) maxx = x;
        if (y < miny) miny = y;
        if (y > maxy) maxy = y;
      }
    }
  }
  return { minx, miny, maxx, maxy };
}

module.exports = { loadSharp, contentBox };
