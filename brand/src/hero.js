/**
 * The hero figure — a futuristic superhero in a forward flight pose,
 * wearing a modern tactical suit.
 *
 * Construction: layered armour plates rather than a smooth bodysuit. Each
 * plate is drawn four times — a dark gradient body, a vertical shade, a
 * bevelled edge catching the key light from the upper left, and a gold trim
 * line — so the figure reads as machined metal rather than flat vector.
 *
 * Lighting model:
 *   key   warm gold, upper left
 *   fill  electric blue, lower right (bounce off the globe)
 *   rim   activism red, along the trailing edge
 *
 * The JSA monogram is engraved into the chest plate, not applied on top.
 *
 * Coordinate space: 0..1000 square.
 *   helmet x 555-750, y 68-268     chest plate x 434-706, y 200-402
 *   lead fist ~ (930, 465)         hips x 452-668, y 388-528
 *   far boot ~ (300, 900)          near boot ~ (740, 880)
 */
const { C, rgba } = require('./palette');

/**
 * A single armour plate with bevelled edges.
 * @param {string} d    path data
 * @param {object} o    { fill, trim, trimWidth, bevel, shade }
 */
function plate(d, o) {
  o = Object.assign({ fill: 'url(#SUIT)', trim: null, trimWidth: 3, bevel: true, shade: 0.28 }, o);
  const parts = [];
  parts.push(`<path d="${d}" fill="${o.fill}"/>`);
  if (o.shade) parts.push(`<path d="${d}" fill="url(#SHADE)" opacity="${o.shade}"/>`);
  if (o.bevel) parts.push(`<path d="${d}" fill="none" stroke="url(#BEVEL)" stroke-width="2.6" opacity=".55"/>`);
  if (o.trim) parts.push(`<path d="${d}" fill="none" stroke="${o.trim}" stroke-width="${o.trimWidth}" opacity=".85"/>`);
  return parts.join('\n');
}

// Monogram letterforms, drawn as one fused mark in a 0..200 box.
const MONO_J = `M 74 44 L 74 112 C 74 132, 62 144, 44 144 C 30 144, 21 137, 18 128 L 30 118 C 33 124, 37 127, 44 127 C 52 127, 56 122, 56 113 L 56 44 Z`;
const MONO_S = `M 118 40 C 106 33, 92 30, 80 33 C 66 37, 58 47, 60 60 C 62 72, 73 78, 88 82 C 101 85, 108 89, 110 96 C 112 103, 107 109, 98 111 C 88 113, 79 110, 72 105 L 62 118 C 73 126, 88 130, 102 126 C 116 122, 126 111, 124 97 C 122 84, 110 78, 95 74 C 82 71, 75 68, 75 62 C 75 56, 81 51, 90 51 C 97 51, 103 54, 109 58 Z`;
const MONO_A = `M 126 152 L 154 44 L 178 44 L 200 152 L 180 152 L 176 134 L 142 134 L 138 152 Z M 148 116 L 170 116 L 159 66 Z`;

function hero(o) {
  o = Object.assign({
    scale: 1, tx: 0, ty: 0, idPrefix: 'h',
    suit: '#1A1A24', trim: C.red, gold: C.gold, blue: C.blue, flat: false
  }, o);
  const id = o.idPrefix;
  const g = [];
  const T = o.trim, GD = o.gold, BL = o.blue;

  /* ---------- CAPE ---------- */
  g.push(`<path d="M 470 250 C 392 272, 320 322, 258 386 C 206 440, 160 506, 122 580 C 92 640, 84 700, 104 744 C 124 786, 176 792, 200 760 C 226 726, 208 668, 236 612 C 276 534, 344 470, 424 424 C 468 396, 500 366, 528 336 Z" fill="url(#CAPE)"/>`);
  g.push(`<path d="M 470 258 C 396 280, 326 330, 266 392 C 214 446, 170 510, 134 582 C 110 632, 100 684, 112 720 C 116 676, 150 600, 206 530 C 270 452, 386 386, 500 320 Z" fill="rgba(0,0,0,.40)"/>`);
  g.push(`<path d="M 528 336 C 500 366, 468 396, 424 424" fill="none" stroke="${GD}" stroke-width="2.6" opacity=".7"/>`);
  g.push(`<path d="M 122 580 C 92 640, 84 700, 104 744" fill="none" stroke="${T}" stroke-width="3.4" opacity=".85"/>`);

  /* ---------- FAR LEG ---------- */
  g.push(plate(`M 400 520 C 372 566, 348 618, 330 676 L 386 694 C 404 638, 428 584, 458 542 Z`, { fill: 'url(#SUIT_DARK)' }));
  g.push(plate(`M 330 672 L 386 690 C 380 740, 370 800, 356 856 L 298 848 C 306 790, 316 728, 330 672 Z`, { fill: 'url(#SUIT_DARK)' }));
  g.push(plate(`M 296 842 L 358 850 C 372 872, 368 906, 342 922 C 314 938, 278 930, 268 904 C 262 886, 274 852, 296 842 Z`, { fill: 'url(#SUIT_DARK)', trim: rgba(GD, .5), trimWidth: 2.4 }));
  g.push(`<path d="M 386 694 C 380 740, 370 800, 356 856" fill="none" stroke="${BL}" stroke-width="3.2" opacity=".6"/>`);

  /* ---------- FAR ARM ---------- */
  g.push(plate(`M 430 300 C 398 314, 368 344, 348 384 L 398 410 C 418 372, 442 342, 468 324 Z`, { fill: 'url(#SUIT_DARK)' }));
  g.push(plate(`M 348 380 L 400 406 C 384 438, 368 470, 352 498 L 302 470 C 314 436, 330 402, 348 380 Z`, { fill: 'url(#SUIT_DARK)' }));

  /* ---------- TORSO ---------- */
  g.push(plate(`M 452 388 L 668 388 C 680 440, 664 496, 626 528 L 500 528 C 462 500, 442 444, 452 388 Z`, { fill: 'url(#SUIT)' }));
  for (let i = 0; i < 3; i++) {
    const y = 420 + i * 34;
    g.push(`<path d="M ${466 + i*4} ${y} L ${654 - i*4} ${y}" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="4"/>`);
    g.push(`<path d="M ${468 + i*4} ${y+4} L ${652 - i*4} ${y+4}" fill="none" stroke="${rgba(GD,.35)}" stroke-width="1.6"/>`);
  }

  // main chest carapace
  g.push(plate(`M 452 236 C 502 206, 590 200, 646 220 C 690 236, 706 276, 700 322 C 694 366, 672 394, 640 402 L 478 402 C 448 394, 432 366, 434 322 C 436 280, 430 250, 452 236 Z`, { fill: 'url(#SUIT)', trim: rgba(GD, .55), trimWidth: 2.6 }));
  g.push(`<path d="M 470 250 C 512 224, 584 218, 634 236 C 660 248, 674 272, 676 300 C 626 276, 542 272, 466 296 C 464 276, 466 260, 470 250 Z" fill="url(#BEVEL)" opacity=".38"/>`);
  g.push(`<path d="M 452 244 C 478 232, 506 226, 530 228 L 524 268 C 500 266, 476 270, 456 280 Z" fill="${T}" opacity=".9"/>`);
  g.push(`<path d="M 452 244 C 478 232, 506 226, 530 228" fill="none" stroke="${rgba(GD,.7)}" stroke-width="2"/>`);
  g.push(`<path d="M 560 214 L 556 398" fill="none" stroke="${GD}" stroke-width="3" opacity=".75"/>`);

  /* ---------- CHEST EMBLEM: engraved monogram ---------- */
  const es = 0.74, ex = 566 - 100 * es, ey = 300 - 100 * es;
  g.push(`<g transform="translate(${ex} ${ey}) scale(${es})" id="${id}Monogram">`);
  g.push(`<rect x="30" y="12" width="140" height="176" rx="12" fill="rgba(0,0,0,.55)"/>`);
  g.push(`<rect x="30" y="12" width="140" height="176" rx="12" fill="none" stroke="${rgba(GD,.5)}" stroke-width="2"/>`);
  g.push(`<g fill="url(#MONO_GOLD)" stroke="rgba(0,0,0,.9)" stroke-width="4"><path d="${MONO_J}"/><path d="${MONO_S}"/><path d="${MONO_A}" fill-rule="evenodd"/></g>`);
  g.push(`<g fill="none" stroke="#F6E7B4" stroke-width="2" opacity=".8"><path d="M 74 44 L 74 112 C 74 132, 62 144, 44 144 C 30 144, 21 137, 18 128"/><path d="M 118 40 C 106 33, 92 30, 80 33 C 66 37, 58 47, 60 60"/><path d="M 126 152 L 154 44 L 178 44 L 200 152"/></g>`);
  g.push(`<g filter="url(#ENERGY_GLOW)"><path d="M 66 26 L 50 80 L 72 80 L 56 140 L 98 74 L 76 74 L 92 26 Z" fill="${BL}" opacity=".95"/><circle cx="66" cy="80" r="6" fill="#BDEBFF"/></g>`);
  g.push(`</g>`);

  /* ---------- NEAR LEG ---------- */
  g.push(plate(`M 520 508 C 566 524, 614 556, 652 600 L 606 652 C 572 612, 532 580, 486 556 Z`, { fill: 'url(#SUIT)' }));
  g.push(plate(`M 640 594 L 700 626 C 712 650, 706 676, 686 688 L 626 656 C 630 632, 634 612, 640 594 Z`, { fill: 'url(#SUIT)', trim: rgba(GD, .5), trimWidth: 2.2 }));
  g.push(plate(`M 646 660 L 706 682 C 726 736, 742 790, 748 840 L 680 848 C 668 792, 656 726, 646 660 Z`, { fill: 'url(#SUIT)' }));
  g.push(plate(`M 676 838 L 750 830 C 776 848, 790 886, 776 908 C 758 936, 712 934, 690 912 C 672 894, 668 856, 676 838 Z`, { fill: 'url(#SUIT)', trim: rgba(GD, .6), trimWidth: 2.6 }));
  g.push(`<path d="M 700 872 L 776 862 L 780 890 L 704 902 Z" fill="${T}" opacity=".85"/>`);
  g.push(`<path d="M 652 600 L 700 626 C 712 650, 706 676, 686 688" fill="none" stroke="${BL}" stroke-width="3" opacity=".55"/>`);

  /* ---------- HEAD ---------- */
  g.push(plate(`M 556 150 C 566 100, 610 68, 660 68 C 712 68, 748 100, 750 152 C 752 196, 734 234, 700 252 C 668 268, 618 268, 586 252 C 554 236, 542 194, 556 150 Z`, { fill: 'url(#HELM)', trim: rgba(GD, .65), trimWidth: 2.6 }));
  g.push(`<path d="M 600 82 C 640 62, 700 66, 728 96 L 712 118 C 690 96, 646 90, 614 102 Z" fill="${GD}" opacity=".8"/>`);
  g.push(`<path d="M 566 158 C 606 138, 690 138, 736 160 L 736 194 C 692 210, 610 208, 570 192 Z" fill="url(#VISOR)"/>`);
  g.push(`<path d="M 566 158 C 606 138, 690 138, 736 160" fill="none" stroke="${rgba(GD,.75)}" stroke-width="2.4"/>`);
  g.push(`<path d="M 744 152 L 752 160 L 748 206 L 738 196 Z" fill="${T}" opacity=".9"/>`);
  g.push(plate(`M 574 200 C 614 216, 690 218, 734 202 L 728 236 C 700 258, 640 262, 600 248 Z`, { fill: 'url(#HELM)', shade: .35 }));
  g.push(plate(`M 560 246 C 610 268, 676 268, 716 248 L 724 282 C 678 302, 606 302, 556 280 Z`, { fill: 'url(#SUIT)', trim: rgba(GD, .45), trimWidth: 2.2 }));

  /* ---------- NEAR ARM ---------- */
  g.push(plate(`M 646 224 C 686 216, 726 234, 742 274 L 700 302 C 682 268, 660 244, 636 234 Z`, { fill: 'url(#SUIT)', trim: rgba(GD, .6), trimWidth: 2.6 }));
  g.push(plate(`M 660 226 C 694 222, 724 238, 738 270 L 712 280 C 700 254, 682 238, 656 234 Z`, { fill: 'url(#SUIT)', shade: .15 }));
  g.push(plate(`M 700 296 C 736 306, 772 326, 800 352 L 762 392 C 736 368, 706 346, 672 330 Z`, { fill: 'url(#SUIT)' }));
  g.push(plate(`M 788 344 L 826 380 C 838 400, 832 424, 812 434 L 776 398 C 776 376, 780 358, 788 344 Z`, { fill: 'url(#SUIT)', trim: rgba(GD, .45), trimWidth: 2 }));
  g.push(plate(`M 812 386 C 852 400, 890 420, 918 442 L 886 484 C 860 462, 830 442, 796 428 Z`, { fill: 'url(#SUIT)', trim: rgba(GD, .7), trimWidth: 2.6 }));
  g.push(`<path d="M 830 396 L 806 428 M 862 414 L 838 450 M 892 432 L 868 468" fill="none" stroke="${rgba(GD,.55)}" stroke-width="2.6"/>`);
  g.push(plate(`M 906 430 C 936 428, 962 444, 968 468 C 974 490, 960 508, 936 506 C 912 504, 894 486, 890 464 C 888 448, 894 434, 906 430 Z`, { fill: 'url(#SUIT)', trim: rgba(GD, .5), trimWidth: 2.2 }));
  g.push(`<path d="M 916 438 L 962 446 L 964 462 L 920 454 Z" fill="${T}" opacity=".85"/>`);
  g.push(`<path d="M 700 296 C 736 306, 772 326, 800 352" fill="none" stroke="${GD}" stroke-width="3.4" opacity=".85"/>`);
  g.push(`<path d="M 812 386 C 852 400, 890 420, 918 442" fill="none" stroke="${GD}" stroke-width="3" opacity=".8"/>`);
  g.push(`<path d="M 700 314 C 734 326, 766 344, 792 366" fill="none" stroke="${BL}" stroke-width="2.6" opacity=".65"/>`);

  /* ---------- RIM LIGHTS ---------- */
  g.push(`<path d="M 556 150 C 566 100, 610 68, 660 68 C 712 68, 748 100, 750 152" fill="none" stroke="${GD}" stroke-width="4" opacity=".95"/>`);
  g.push(`<path d="M 452 236 C 502 206, 590 200, 646 220" fill="none" stroke="${GD}" stroke-width="4" opacity=".85"/>`);
  g.push(`<path d="M 640 594 L 700 626 C 712 650, 706 676, 686 688" fill="none" stroke="${GD}" stroke-width="3.4" opacity=".7"/>`);

  return `<g transform="translate(${o.tx} ${o.ty}) scale(${o.scale})" id="${id}Hero">${g.join('\n')}</g>`;
}

function heroDefs(id) {
  const { C } = require('./palette');
  return `
  <linearGradient id="SUIT" x1=".15" y1="0" x2=".9" y2="1">
    <stop offset="0" stop-color="#3C3C4E"/><stop offset=".3" stop-color="#26262F"/>
    <stop offset=".62" stop-color="#17171F"/><stop offset="1" stop-color="#0C0C12"/>
  </linearGradient>
  <linearGradient id="SUIT_DARK" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#22222C"/><stop offset="1" stop-color="#0A0A10"/>
  </linearGradient>
  <linearGradient id="HELM" x1=".15" y1="0" x2=".9" y2="1">
    <stop offset="0" stop-color="#4A4A60"/><stop offset=".45" stop-color="#2A2A36"/>
    <stop offset="1" stop-color="#101017"/>
  </linearGradient>
  <linearGradient id="VISOR" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#CFEEFF"/><stop offset=".35" stop-color="${C.blue}"/>
    <stop offset=".75" stop-color="#0B4E72"/><stop offset="1" stop-color="#06283C"/>
  </linearGradient>
  <linearGradient id="BEVEL" x1="0" y1="0" x2=".75" y2="1">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity=".75"/>
    <stop offset=".45" stop-color="#FFFFFF" stop-opacity=".10"/>
    <stop offset="1" stop-color="#000000" stop-opacity=".35"/>
  </linearGradient>
  <linearGradient id="SHADE" x1="0" y1="0" x2=".6" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity="0"/>
    <stop offset=".55" stop-color="#000" stop-opacity=".15"/>
    <stop offset="1" stop-color="#000" stop-opacity=".75"/>
  </linearGradient>
  <linearGradient id="CAPE" x1=".2" y1="0" x2=".85" y2="1">
    <stop offset="0" stop-color="#3A0A12"/><stop offset=".3" stop-color="${C.red}"/>
    <stop offset=".68" stop-color="#8E0F24"/><stop offset="1" stop-color="#4A0611"/>
  </linearGradient>
  <linearGradient id="MONO_GOLD" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.goldLight}"/><stop offset=".28" stop-color="${C.gold}"/>
    <stop offset=".55" stop-color="${C.goldDeep}"/><stop offset=".8" stop-color="${C.gold}"/>
    <stop offset="1" stop-color="${C.goldLight}"/>
  </linearGradient>
  <filter id="ENERGY_GLOW" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

// Anchor points in hero space, used to place the emblem and energy stream.
const ANCHORS = {
  chest: { x: 566, y: 300 },
  head:  { x: 650, y: 165 },
  fist:  { x: 930, y: 465 },
  core:  { x: 300, y: 520 },
  foot:  { x: 740, y: 880 }
};

module.exports = { hero, heroDefs, ANCHORS, plate };
