/**
 * Crest geometry — the single source of truth.
 *
 * Both the crest logo and the animated intro resolve their positions from
 * here, so the animation lands on exactly the same composition as the
 * finished mark. Nothing is hand-placed twice.
 */

/**
 * Resolve every significant position for a crest of size S.
 * @param {number} S  crest size in user units (the logo is a 1024 box)
 */
function layout(S, chestAnchor) {
  const cx = S / 2, cy = S / 2;
  const hs = S / 1000 * 0.95;
  const hx = cx - S * 0.455;
  const hy = cy - S * 0.395;
  const toCrest = p => ({ x: hx + p.x * hs, y: hy + p.y * hs });
  const chest = toCrest(chestAnchor);
  return {
    S, cx, cy,
    globe: { x: cx, y: cy + S * 0.185, r: S * 0.230 },
    hero: { scale: hs, tx: hx, ty: hy, toCrest },
    emblem: { x: chest.x, y: chest.y, size: S * 0.088 },
    stream: { from: { x: cx, y: cy + S * 0.185 }, to: chest },
    ring: { outer: S * 0.468, inner: S * 0.432, width: S * 0.036 }
  };
}

module.exports = { layout };
