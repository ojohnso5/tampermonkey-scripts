/**
 * YouTube channel watermark — 150 x 150 (and 300 x 300 for high-DPI).
 *
 * YouTube's video-watermark slot is a 150x150 transparent PNG placed in the
 * lower-right corner of every video from 0:15 onward. It is automatically
 * clickable and links to the channel.
 *
 * This is the minimalist mark from brand/src/watermark.js, scaled and
 * re-centred for the square slot. The globe sits upper-left, the emblem
 * lower-right, both fitting inside a 120px safe circle so the mark survives
 * YouTube's own compression.
 */
const { watermark } = require('./watermark');

function channelWatermark(o) {
  o = Object.assign({ size: 150, idPrefix: 'CW' }, o);
  // The watermark module renders at 512 internally and scales. For a 150px
  // output we want the same composition, just smaller.
  return watermark({ size: o.size * 3.4133, idPrefix: o.idPrefix });
}

module.exports = { channelWatermark };
