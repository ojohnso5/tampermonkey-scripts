/**
 * The hero figure — a stylised superhero in a forward flight pose.
 *
 * Read: the figure is a near-black silhouette with a gold key rim-light on
 * the leading edge and a blue fill-light from the globe below, so it stays
 * legible against a dark field at avatar size. The cape defines the
 * trailing silhouette and carries the red.
 *
 * Proportions are heroic but not comic-book: ~7.5 heads, streamlined,
 * cinematic. No exaggerated musculature.
 *
 * Coordinate space: 0..1000 square.
 *   head ~ (600,190)   chest ~ (545,300)   hips ~ (455,430)
 *   leading hand ~ (865,175)   trailing hand ~ (320,395)   feet ~ (215,700)
 */
const { C, rgba } = require('./palette');

function hero(o) {
  o = Object.assign({
    scale: 1, tx: 0, ty: 0,
    suit: '#1B1B26', trim: C.red, gold: C.gold, blue: C.blue,
    flat: false, idPrefix: 'h'
  }, o);
  const id = o.idPrefix;
  const g = [];

  // ------------------------------------------------------------------
  // CAPE — a ribbon streaming back and down, red, with gold edge light.
  // ------------------------------------------------------------------
  g.push(`<path d="M 556 258
      C 470 268, 380 320, 300 392
      C 232 452, 176 530, 132 616
      C 104 670, 96 724, 116 764
      C 136 802, 186 806, 208 776
      C 232 744, 214 690, 238 640
      C 274 566, 336 500, 410 448
      C 456 416, 508 384, 556 350 Z"
      fill="${o.flat ? o.trim : 'url(#' + id + 'Cape)'}"
      ${o.flat ? '' : 'stroke="' + rgba(o.gold, .5) + '" stroke-width="3" stroke-linejoin="round"'}/>`);

  // cape inner shadow
  if (!o.flat) {
    g.push(`<path d="M 556 268 C 470 280, 384 332, 306 402 C 240 462, 186 540, 144 622
        C 122 668, 118 706, 130 736 C 134 690, 168 610, 224 540 C 288 462, 400 396, 520 330 Z"
        fill="rgba(0,0,0,.34)"/>`);
  }

  // ------------------------------------------------------------------
  // FAR LEG — trailing, behind the near leg, darker.
  // ------------------------------------------------------------------
  g.push(`<path d="M 430 424
      C 380 486, 330 556, 286 632
      C 254 688, 228 742, 226 782
      C 225 806, 244 818, 266 810
      C 296 798, 330 752, 366 700
      C 410 636, 452 570, 486 508 Z"
      fill="${o.flat ? o.suit : 'url(#' + id + 'SuitB)'}"
      ${o.flat ? '' : 'stroke="' + rgba(o.blue, .5) + '" stroke-width="2.5"'}/>`);

  // far boot
  if (!o.flat) {
    g.push(`<path d="M 228 768 C 252 762, 278 774, 288 796 C 294 810, 284 820, 266 816
        C 242 810, 224 794, 222 780 Z" fill="${o.trim}" opacity=".9"/>`);
  }

  // ------------------------------------------------------------------
  // FAR ARM — trailing back, bent, mostly in shadow.
  // ------------------------------------------------------------------
  g.push(`<path d="M 508 268
      C 458 288, 404 322, 360 366
      C 330 396, 326 424, 350 436
      C 374 448, 410 424, 448 396
      C 486 368, 522 342, 548 322 Z"
      fill="${o.flat ? o.suit : 'url(#' + id + 'SuitB)'}"
      ${o.flat ? '' : 'stroke="' + rgba(o.blue, .42) + '" stroke-width="2.5"'}/>`);

  // ------------------------------------------------------------------
  // TORSO — the primary mass. Shoulders wide, tapering to the waist.
  // ------------------------------------------------------------------
  g.push(`<path d="M 500 232
      C 548 196, 618 190, 660 214
      C 700 236, 716 278, 710 330
      C 704 386, 672 438, 622 476
      C 580 508, 512 508, 470 478
      C 434 452, 418 400, 424 350
      C 428 302, 456 258, 500 232 Z"
      fill="${o.flat ? o.suit : 'url(#' + id + 'Suit)'}"
      ${o.flat ? '' : 'stroke="' + rgba(o.gold, .6) + '" stroke-width="3.2"'}/>`);

  if (!o.flat) {
    // pectoral highlight
    g.push(`<path d="M 505 246 C 552 214, 618 212, 658 234 C 682 248, 694 276, 692 302
        C 646 274, 566 268, 490 292 C 490 272, 496 256, 505 246 Z"
      fill="rgba(255,255,255,.06)"/>`);
    // abdominal shadow
    g.push(`<path d="M 432 340 C 486 362, 578 366, 702 344 C 696 404, 666 448, 620 474
        C 580 504, 514 504, 472 476 C 438 452, 424 396, 432 340 Z"
      fill="rgba(0,0,0,.30)"/>`);
    // red chest plating across the shoulders
    g.push(`<path d="M 500 234 C 548 204, 614 198, 656 220 C 684 236, 700 262, 704 288
        C 660 258, 566 250, 484 280 C 488 258, 492 242, 500 234 Z"
      fill="${o.trim}" opacity=".85"/>`);
    // slim red belt at the waist
    g.push(`<path d="M 452 404 C 500 424, 588 428, 700 406 C 696 424, 692 438, 688 450
        C 580 470, 500 466, 456 448 C 452 434, 451 418, 452 404 Z"
      fill="${o.trim}" opacity=".8"/>`);
  }

  // ------------------------------------------------------------------
  // NEAR LEG — thrusting forward and down.
  // ------------------------------------------------------------------
  g.push(`<path d="M 500 452
      C 546 480, 596 520, 640 566
      C 676 604, 700 646, 700 684
      C 700 716, 678 734, 650 726
      C 618 716, 594 684, 560 648
      C 512 598, 462 552, 428 510 Z"
      fill="${o.flat ? o.suit : 'url(#' + id + 'SuitA)'}"
      ${o.flat ? '' : 'stroke="' + rgba(o.gold, .5) + '" stroke-width="3"'}/>`);

  if (!o.flat) {
    // boot
    g.push(`<path d="M 646 686 C 676 680, 706 692, 718 714 C 726 730, 714 744, 692 740
        C 664 734, 640 716, 634 700 Z" fill="${o.trim}"/>`);
  }

  // ------------------------------------------------------------------
  // HEAD — helmet, angled forward, jaw set.
  // ------------------------------------------------------------------
  g.push(`<path d="M 578 118
      C 540 128, 518 166, 522 208
      C 526 250, 560 280, 606 282
      C 652 284, 688 254, 692 210
      C 696 166, 666 128, 620 118
      C 606 114, 590 115, 578 118 Z"
      fill="${o.flat ? o.suit : 'url(#' + id + 'Helm)'}"
      ${o.flat ? '' : 'stroke="' + rgba(o.gold, .65) + '" stroke-width="3.2"'}/>`);

  if (!o.flat) {
    // visor — angled, forward gaze
    g.push(`<path d="M 542 176 C 578 156, 644 156, 684 180 C 692 188, 692 202, 684 212
        C 638 228, 580 226, 544 208 C 534 200, 534 184, 542 176 Z"
      fill="url(#${id}Visor)"/>`);
    // lower mask
    g.push(`<path d="M 544 212 C 582 230, 640 232, 686 214 C 680 246, 652 266, 612 266
        C 574 266, 550 246, 544 212 Z" fill="${o.suit}" opacity=".9"/>`);
    // helmet crest
    g.push(`<path d="M 608 112 C 646 114, 678 138, 688 174 L 666 174
        C 656 148, 636 130, 606 130 Z" fill="${o.gold}" opacity=".6"/>`);
  }

  // ------------------------------------------------------------------
  // NEAR ARM — extended forward, the leading gesture.
  // ------------------------------------------------------------------
  g.push(`<path d="M 648 240
      C 704 250, 768 268, 826 292
      C 872 311, 906 340, 918 372
      C 928 398, 912 420, 886 414
      C 858 408, 830 386, 798 366
      C 740 330, 686 302, 638 286 Z"
      fill="${o.flat ? o.suit : 'url(#' + id + 'SuitA)'}"
      ${o.flat ? '' : 'stroke="' + rgba(o.gold, .55) + '" stroke-width="3"'}/>`);

  // gold gauntlet
  if (!o.flat) {
    g.push(`<path d="M 812 296 C 856 314, 890 340, 912 368 L 886 394
        C 866 368, 834 342, 796 322 Z" fill="${o.gold}" opacity=".85"/>`);
  }

  // fist
  g.push(`<path d="M 886 366 C 914 362, 940 378, 948 400 C 954 420, 940 438, 918 436
        C 896 434, 876 418, 872 398 C 870 384, 876 370, 886 366 Z"
      fill="${o.trim}"/>`);

  // ------------------------------------------------------------------
  // RIM LIGHTS — the reason the silhouette reads at small sizes.
  // ------------------------------------------------------------------
  if (!o.flat) {
    // gold key light along the top/leading contour
    g.push(`<path d="M 502 230 C 550 194, 618 190, 660 214" fill="none"
      stroke="${o.gold}" stroke-width="7" stroke-linecap="round" opacity="1"/>`);
    g.push(`<path d="M 664 218 C 700 240, 716 282, 710 330" fill="none"
      stroke="${o.gold}" stroke-width="6" stroke-linecap="round" opacity=".92"/>`);
    g.push(`<path d="M 522 208 C 518 166, 540 128, 578 118" fill="none"
      stroke="${o.gold}" stroke-width="6.5" stroke-linecap="round" opacity=".98"/>`);
    g.push(`<path d="M 606 114 C 646 116, 678 140, 690 176" fill="none"
      stroke="${o.gold}" stroke-width="5" stroke-linecap="round" opacity=".9"/>`);
    g.push(`<path d="M 660 244 C 716 256, 780 274, 838 298" fill="none"
      stroke="${o.gold}" stroke-width="7" stroke-linecap="round" opacity=".95"/>`);
    g.push(`<path d="M 500 232 C 548 196, 618 190, 660 214" fill="none"
      stroke="${C.goldLight}" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`);
    g.push(`<path d="M 424 350 C 418 400, 434 452, 470 478" fill="none"
      stroke="${o.blue}" stroke-width="6" stroke-linecap="round" opacity=".9"/>`);
    g.push(`<path d="M 428 508 C 462 552, 512 598, 560 648" fill="none"
      stroke="${o.blue}" stroke-width="5" stroke-linecap="round" opacity=".75"/>`);
    g.push(`<path d="M 226 782 C 228 742, 254 688, 286 632" fill="none"
      stroke="${o.blue}" stroke-width="4.5" stroke-linecap="round" opacity=".65"/>`);
  }

  return `<g transform="translate(${o.tx} ${o.ty}) scale(${o.scale})" id="${id}Hero">${g.join('\n')}</g>`;
}

function heroDefs(id) {
  const { C } = require('./palette');
  return `
  <linearGradient id="${id}Suit" x1=".15" y1="0" x2=".85" y2="1">
    <stop offset="0" stop-color="#3A3A4C"/><stop offset=".38" stop-color="#24242F"/>
    <stop offset="1" stop-color="#0E0E15"/>
  </linearGradient>
  <linearGradient id="${id}SuitA" x1=".2" y1="0" x2=".9" y2="1">
    <stop offset="0" stop-color="#434355"/><stop offset=".5" stop-color="#24242F"/>
    <stop offset="1" stop-color="#101017"/>
  </linearGradient>
  <linearGradient id="${id}SuitB" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#24242E"/><stop offset="1" stop-color="#0C0C12"/>
  </linearGradient>
  <linearGradient id="${id}Cape" x1=".15" y1="0" x2=".85" y2="1">
    <stop offset="0" stop-color="#34090F"/><stop offset=".35" stop-color="${C.red}"/>
    <stop offset=".72" stop-color="${C.redDeep}"/><stop offset="1" stop-color="#4E0613"/>
  </linearGradient>
  <linearGradient id="${id}Helm" x1=".2" y1="0" x2=".9" y2="1">
    <stop offset="0" stop-color="#4A4A5E"/><stop offset=".5" stop-color="#282833"/>
    <stop offset="1" stop-color="#111118"/>
  </linearGradient>
  <linearGradient id="${id}Visor" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.blueLight}" stop-opacity=".95"/>
    <stop offset=".45" stop-color="${C.blue}" stop-opacity=".92"/>
    <stop offset="1" stop-color="#0A4E70" stop-opacity=".95"/>
  </linearGradient>
  <linearGradient id="${id}Gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.goldLight}"/><stop offset=".35" stop-color="${C.gold}"/>
    <stop offset=".7" stop-color="${C.goldDeep}"/><stop offset="1" stop-color="${C.goldLight}"/>
  </linearGradient>
  <filter id="${id}Rim" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="2.6" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

// Anchor points in hero space, used by the crest to place the emblem and
// the energy stream precisely on the figure.
const ANCHORS = {
  chest:  { x: 570, y: 268 },
  head:   { x: 606, y: 196 },
  fist:   { x: 910, y: 400 },
  core:   { x: 300, y: 520 }   // where the cape streams
};

module.exports = { hero, heroDefs, ANCHORS };
