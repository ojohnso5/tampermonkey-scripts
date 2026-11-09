/**
 * Animated logo sequence — 5.0 seconds, nine scenes.
 *
 *   1  0.00-0.45  dark screen
 *   2  0.45-1.15  a small electric-blue globe forms
 *   3  1.15-1.80  global network connections illuminate across the globe
 *   4  1.80-2.35  blue energy rises upward from the globe
 *   5  2.35-2.95  a metallic JSA emblem forms out of the energy
 *   6  2.95-3.55  a superhero flies through frame
 *   7  3.55-4.05  a metallic gold ring forms around the hero
 *   8  4.05-4.50  the red energy halo ignites
 *   9  4.50-5.00  the final hero-and-globe crest locks up
 *
 * The geometry comes from crest-layout.js, so the animation lands on exactly
 * the same composition as the finished logo.
 *
 * Pure SMIL: no JavaScript, plays in any browser, and can be scrubbed.
 */
const { C, rgba } = require('./palette');
const { faces } = require('./fonts');
const geo = require('./geo');
const { hero, heroDefs, ANCHORS } = require('./hero');
const { emblem, emblemDefs } = require('./emblem');
const { layout } = require('./crest-layout');

const DUR = 5.0;

// ---- scene timing, in seconds ----
const T = {
  dark:   [0.00, 0.45],
  globe:  [0.45, 1.15],
  network:[1.15, 1.80],
  energy: [1.80, 2.35],
  emblem: [2.35, 2.95],
  fly:    [2.95, 3.55],
  ring:   [3.55, 4.05],
  halo:   [4.05, 4.50],
  lock:   [4.50, 5.00]
};

/** keyTimes helper: a value that holds, then transitions, then holds. */
function kt(from, to, v0, v1, dur) {
  const a = (from / dur).toFixed(4), b = (to / dur).toFixed(4);
  return { values: `${v0};${v1};${v1}`, keyTimes: `0;${b};1`, a, b };
}


/**
 * SMIL requires keyTimes to start at 0 and END at 1. A keyTimes list that
 * stops early makes Chromium discard the whole animation silently, which
 * leaves the scene blank with no error anywhere. This pads every animation
 * so the final value holds to the end of the timeline.
 */
function padKeyTimes(svg) {
  return svg.replace(
    /(<animate(?:Transform)?\b[^>]*?values=")([^"]*)("[^>]*?keyTimes=")([^"]*)("[^>]*?>)/g,
    (m, pre, values, mid, keyTimes, post) => {
      const v = values.split(';');
      const k = keyTimes.split(';');
      const last = parseFloat(k[k.length - 1]);
      if (!isNaN(last) && last < 1) {
        v.push(v[v.length - 1]);
        k.push('1');
      }
      return pre + v.join(';') + mid + k.join(';') + post;
    }
  );
}

/**
 * Validates that every animation is well formed. A malformed keyTimes list
 * is the difference between a working sequence and a blank frame, so it is
 * worth failing the build rather than shipping it.
 */
function validateAnimations(svg) {
  const problems = [];
  const re = /<animate(?:Transform)?\b[^>]*?values="([^"]*)"[^>]*?keyTimes="([^"]*)"[^>]*?>/g;
  let m;
  while ((m = re.exec(svg))) {
    const vals = m[1].split(';');
    const times = m[2].split(';').map(Number);
    if (vals.length !== times.length) {
      problems.push('values/keyTimes length mismatch: ' + m[1].slice(0, 40));
      continue;
    }
    if (times[0] !== 0) problems.push('keyTimes must start at 0');
    if (times[times.length - 1] !== 1) problems.push('keyTimes must end at 1: ' + m[2]);
    for (let i = 1; i < times.length; i++) {
      if (times[i] < times[i - 1]) problems.push('keyTimes must be non-decreasing: ' + m[2]);
    }
  }
  if (problems.length) {
    throw new Error('intro: invalid SMIL animation -> ' + problems.slice(0, 4).join(' | '));
  }
}

function intro(o) {
  o = Object.assign({ width: 1920, height: 1080, idPrefix: 'I' }, o);
  const W = o.width, H = o.height, id = o.idPrefix;
  const D = DUR;

  // The crest is composed at 1024 and scaled into the frame.
  const CS = 1024;
  const L = layout(CS, ANCHORS.chest);
  const crestScale = 0.62;
  const crestX = W / 2 - (CS / 2) * crestScale;
  const crestY = 150;
  // map crest-space coordinates into frame coordinates
  const F = p => ({ x: crestX + p.x * crestScale, y: crestY + p.y * crestScale });

  const globeC = F(L.globe);
  const gR = L.globe.r * crestScale;
  const ringC = F({ x: L.cx, y: L.cy });
  const ringR = L.ring.outer * crestScale;
  const emblemC = F(L.emblem);
  const emblemS = L.emblem.size * crestScale;

  // the hero's resting transform in frame coordinates
  const heroFrame = {
    tx: crestX + L.hero.tx * crestScale,
    ty: crestY + L.hero.ty * crestScale,
    s: L.hero.scale * crestScale
  };

  const defs = [];
  const layers = [];

  /* ================= DEFS ================= */
  defs.push(`
  <radialGradient id="${id}Core" cx=".38" cy=".30" r=".82">
    <stop offset="0" stop-color="#DFF6FF"/><stop offset=".14" stop-color="#6FD8FA"/>
    <stop offset=".42" stop-color="${C.blue}"/><stop offset=".78" stop-color="#0A6394"/>
    <stop offset="1" stop-color="#053B5C"/>
  </radialGradient>
  <linearGradient id="${id}Gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.goldLight}"/><stop offset=".3" stop-color="${C.gold}"/>
    <stop offset=".58" stop-color="${C.goldDeep}"/><stop offset=".8" stop-color="${C.gold}"/>
    <stop offset="1" stop-color="${C.goldLight}"/>
  </linearGradient>
  <linearGradient id="${id}RingGold" x1=".05" y1="0" x2=".95" y2="1">
    <stop offset="0" stop-color="${C.goldLight}"/><stop offset=".14" stop-color="${C.gold}"/>
    <stop offset=".3" stop-color="${C.goldDeep}"/><stop offset=".44" stop-color="${C.goldLight}"/>
    <stop offset=".58" stop-color="${C.gold}"/><stop offset=".76" stop-color="${C.goldDeep}"/>
    <stop offset=".9" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldLight}"/>
  </linearGradient>
  <radialGradient id="${id}Halo" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="${C.red}" stop-opacity="0"/>
    <stop offset=".72" stop-color="${C.red}" stop-opacity="0"/>
    <stop offset=".88" stop-color="${C.red}" stop-opacity=".34"/>
    <stop offset=".97" stop-color="${C.red}" stop-opacity=".14"/>
    <stop offset="1" stop-color="${C.red}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="${id}BlueGlow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="${C.blue}" stop-opacity=".55"/>
    <stop offset=".55" stop-color="${C.blue}" stop-opacity=".16"/>
    <stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="${id}Vignette" cx=".5" cy=".5" r=".72">
    <stop offset=".45" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".85"/>
  </radialGradient>
  <linearGradient id="${id}Fade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff"/>
    <stop offset="1" stop-color="#fff"/>
  </linearGradient>
  <filter id="${id}BlueGlowF" x="-70%" y="-70%" width="240%" height="240%">
    <feGaussianBlur stdDeviation="16" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}Soft" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="34"/>
  </filter>
  <filter id="${id}Glow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="8" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}Blur" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="14"/>
  </filter>`);
  defs.push(heroDefs(id + 'H'));
  defs.push(emblemDefs(id + 'E'));

  /* ================= SCENE 1 — DARK ================= */
  layers.push(`<rect width="${W}" height="${H}" fill="#000000"/>`);
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Vignette)" opacity=".5"/>`);

  // atmosphere that is barely there, then breathes
  layers.push(`<circle cx="${W/2}" cy="${H/2}" r="${H*0.55}" fill="url(#${id}BlueGlow)" opacity="0">
    <animate attributeName="opacity" values="0;0;.22;.1" keyTimes="0;${(T.dark[0]/D).toFixed(3)};${(T.dark[1]/D).toFixed(3)};1" dur="${D}s" fill="freeze"/>
  </circle>`);

  // drifting dust, so the darkness has depth
  let seed = 20260917;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const dust = [];
  for (let i = 0; i < 150; i++) {
    const x = rnd() * W, y = rnd() * H;
    const r = 0.8 + rnd() * 2.6;
    const c = rnd() > 0.45 ? C.blue : C.gold;
    dust.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${c}" opacity="0">
      <animate attributeName="opacity" values="0;0;.5;0" keyTimes="0;${(T.dark[0]/D).toFixed(3)};${(0.75).toFixed(3)};1" dur="${D}s" fill="freeze"/>
    </circle>`);
  }
  layers.push(`<g>${dust.join('')}</g>`);

  /* ================= SCENE 2 — THE GLOBE FORMS ================= */
  const gAppear = kt(T.globe[0], T.globe[1], 0, 1, D);
  layers.push(`<g id="${id}Globe" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;${(T.globe[0]/D).toFixed(3)};${(T.globe[1]/D).toFixed(3)};1" dur="${D}s" fill="freeze"/>
    <circle cx="${globeC.x}" cy="${globeC.y}" r="${gR * 1.9}" fill="url(#${id}BlueGlow)" opacity="0">
      <animate attributeName="opacity" values="0;0;.85;.55" keyTimes="0;${(T.globe[0]/D).toFixed(3)};${(T.globe[1]/D).toFixed(3)};1" dur="${D}s" fill="freeze"/>
    </circle>
    <circle cx="${globeC.x}" cy="${globeC.y}" r="0" fill="url(#${id}Core)">
      <animate attributeName="r" values="0;0;${gR}" keyTimes="0;${(T.globe[0]/D).toFixed(3)};${(T.globe[1]/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
    </circle>
    <circle cx="${globeC.x}" cy="${globeC.y}" r="${gR}" fill="none" stroke="#BDEBFF" stroke-width="3" opacity="0">
      <animate attributeName="opacity" values="0;0;.85" keyTimes="0;${(T.globe[0]/D).toFixed(3)};${(T.globe[1]/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
    </circle>
  </g>`);

  // continents, revealed as the globe forms
  const lands = [geo.NORTH_AMERICA, geo.SOUTH_AMERICA, geo.GREENLAND, geo.CENTRAL_AMERICA, geo.CARIBBEAN];
  layers.push(`<g opacity="0" fill="url(#${id}Gold)">
    <animate attributeName="opacity" values="0;0;1" keyTimes="0;${(T.globe[0]/D).toFixed(3)};${(T.globe[1]/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
    ${lands.map(poly => `<path d="${geo.polyPath(poly, gR, globeC.x, globeC.y)}"/>`).join('')}
  </g>`);

  /* ================= SCENE 3 — NETWORK ILLUMINATES ================= */
  const arcs = geo.networkArcs(gR, globeC.x, globeC.y);
  const netNodes = geo.networkNodes(gR, globeC.x, globeC.y, 26, 4409);
  const arcPaths = arcs.map((d, i) => {
    // each arc draws in, staggered
    const start = T.network[0] + (i / arcs.length) * 0.34;
    const len = 4000;
    return `<path d="${d}" fill="none" stroke="${C.blue}" stroke-width="2.4" stroke-linecap="round"
      stroke-dasharray="${len}" stroke-dashoffset="${len}" opacity="0">
      <animate attributeName="stroke-dashoffset" values="${len};${len};0" keyTimes="0;${(start/D).toFixed(4)};${((start+0.26)/D).toFixed(4)}" dur="${D}s" fill="freeze"/>
      <animate attributeName="opacity" values="0;0;.9" keyTimes="0;${(start/D).toFixed(4)};${((start+0.18)/D).toFixed(4)}" dur="${D}s" fill="freeze"/>
    </path>`;
  }).join('');
  layers.push(`<g id="${id}Network" filter="url(#${id}Glow)">${arcPaths}</g>`);

  const nodeEls = netNodes.map((n, i) => {
    const start = T.network[0] + 0.12 + (i % 9) * 0.05;
    return `<circle cx="${n[0].toFixed(1)}" cy="${n[1].toFixed(1)}" r="0" fill="#BDEBFF">
      <animate attributeName="r" values="0;0;${n[2].toFixed(1)}" keyTimes="0;${(start/D).toFixed(4)};${((start+0.12)/D).toFixed(4)}" dur="${D}s" fill="freeze"/>
    </circle>`;
  }).join('');
  layers.push(`<g id="${id}Nodes">${nodeEls}</g>`);

  /* ================= SCENE 4 — BLUE ENERGY RISES ================= */
  const rise = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const x0 = globeC.x + Math.cos(a) * gR * 0.75;
    const y0 = globeC.y + Math.sin(a) * gR * 0.55;
    const lift = 180 + (i % 5) * 55;
    const st = T.energy[0] + (i % 7) * 0.035;
    rise.push(`<circle cx="${x0.toFixed(1)}" cy="${y0.toFixed(1)}" r="${(2 + (i % 3) * 1.4).toFixed(1)}"
      fill="${C.blueLight}" opacity="0">
      <animate attributeName="cy" values="${y0.toFixed(1)};${y0.toFixed(1)};${(y0 - lift).toFixed(1)}"
        keyTimes="0;${(st/D).toFixed(4)};${((st+0.42)/D).toFixed(4)}" dur="${D}s" fill="freeze"/>
      <animate attributeName="opacity" values="0;0;1;0" keyTimes="0;${(st/D).toFixed(4)};${((st+0.2)/D).toFixed(4)};${((st+0.45)/D).toFixed(4)}" dur="${D}s" fill="freeze"/>
    </circle>`);
  }
  layers.push(`<g id="${id}Rise" filter="url(#${id}Glow)">${rise.join('')}</g>`);

  // the rising column of energy, brightest just above the globe
  layers.push(`<path d="M ${globeC.x} ${globeC.y} C ${globeC.x - 34} ${globeC.y - 90}, ${globeC.x + 26} ${globeC.y - 140}, ${globeC.x} ${globeC.y - 210}"
    fill="none" stroke="${C.blue}" stroke-width="7" stroke-linecap="round" opacity="0" filter="url(#${id}BlueGlowF)">
    <animate attributeName="opacity" values="0;0;.95;0" keyTimes="0;${(T.energy[0]/D).toFixed(3)};${((T.energy[0]+0.28)/D).toFixed(3)};${((T.energy[1]+0.12)/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
    <animate attributeName="stroke-dasharray" values="0 600;0 600;600 0" keyTimes="0;${(T.energy[0]/D).toFixed(3)};${(T.energy[1]/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
  </path>`);

  /* ================= SCENE 5 — THE EMBLEM FORMS ================= */
  const emScale = emblemS / 200;
  const emTx = emblemC.x - 109 * emScale;
  const emTy = emblemC.y - 91 * emScale;
  // The scale is animated on an inner group so the animation REPLACES the
  // transform. With additive="sum" on a group that already carries a scale,
  // the two scales multiply and the emblem stays microscopic.
  //
  // The emblem forms large out of the rising energy, then shrinks onto the
  // hero's chest as the hero arrives, and holds there for the lockup.
  const BIG = emScale * 2.25;
  layers.push(`<g id="${id}Emblem" transform="translate(${emTx.toFixed(2)} ${emTy.toFixed(2)})" opacity="0" filter="url(#${id}Glow)">
    <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;${(T.emblem[0]/D).toFixed(3)};${(T.emblem[0]+0.18)/D > 1 ? 1 : ((T.emblem[0]+0.18)/D).toFixed(3)};1" dur="${D}s" fill="freeze"/>
    <g transform="scale(${(emScale * 0.18).toFixed(4)})">
      <animateTransform attributeName="transform" type="scale"
        values="${(emScale*0.18).toFixed(4)};${(emScale*0.18).toFixed(4)};${BIG.toFixed(4)};${BIG.toFixed(4)};${emScale.toFixed(4)};${emScale.toFixed(4)}"
        keyTimes="0;${(T.emblem[0]/D).toFixed(3)};${((T.emblem[0]+0.30)/D).toFixed(3)};${(T.fly[0]/D).toFixed(3)};${((T.fly[0]+0.34)/D).toFixed(3)};1"
        dur="${D}s" fill="freeze"/>
      ${emblem({ idPrefix: id + 'E', gold: C.gold, blue: C.blue })}
    </g>
  </g>`);

  /* ================= SCENE 6 — THE HERO FLIES THROUGH ================= */
  // Motion trails: copies of the hero, offset behind it and fading out.
  const FLY_IN = 900;      // how far off-frame the hero starts
  const FLY_DROP = 420;
  const trails = [0.05, 0.095, 0.14].map((off, i) => `
    <g transform="translate(${(heroFrame.tx - FLY_IN * off).toFixed(1)} ${(heroFrame.ty + FLY_DROP * off).toFixed(1)}) scale(${(heroFrame.s * (1 - i * 0.05)).toFixed(4)})" opacity="0">
      <animate attributeName="opacity" values="0;0;${(0.34 - i * 0.09).toFixed(2)};0" keyTimes="0;${(T.fly[0]/D).toFixed(3)};${((T.fly[0]+0.28)/D).toFixed(3)};${(T.fly[1]/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
      ${hero({ idPrefix: id + 'T' + i, scale: 1, tx: 0, ty: 0, suit: '#1A1A24', trim: C.red, gold: C.gold, blue: C.blue })}
    </g>`).join('');

  const flying = `
    <g transform="translate(${(heroFrame.tx - FLY_IN).toFixed(1)} ${(heroFrame.ty + FLY_DROP).toFixed(1)}) scale(${heroFrame.s.toFixed(4)})" opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;1" keyTimes="0;${(T.fly[0]/D).toFixed(3)};${((T.fly[0]+0.10)/D).toFixed(3)};${(T.fly[1]/D).toFixed(3)};1" dur="${D}s" fill="freeze"/>
      <animateTransform attributeName="transform" type="translate" additive="sum"
        values="${(heroFrame.tx - FLY_IN).toFixed(1)} ${(heroFrame.ty + FLY_DROP).toFixed(1)};
                ${(heroFrame.tx - FLY_IN).toFixed(1)} ${(heroFrame.ty + FLY_DROP).toFixed(1)};
                ${heroFrame.tx.toFixed(1)} ${heroFrame.ty.toFixed(1)}"
        keyTimes="0;${(T.fly[0]/D).toFixed(3)};${(T.fly[1]/D).toFixed(3)}" dur="${D}s" fill="freeze"
        calcMode="spline" keySplines="0.12 0.86 0.2 1"/>
    </g>`;

  layers.push(`<g id="${id}Fly">${trails}${flying}</g>`);



  /* ================= SCENE 7 — GOLD RING FORMS ================= */
  const ringDash = 2 * Math.PI * ringR;
  layers.push(`<g id="${id}Ring">
    <circle cx="${ringC.x}" cy="${ringC.y}" r="${ringR}" fill="none" stroke="url(#${id}RingGold)"
      stroke-width="${(L.ring.width * crestScale).toFixed(1)}" stroke-linecap="round"
      stroke-dasharray="${ringDash.toFixed(0)}" stroke-dashoffset="${ringDash.toFixed(0)}" opacity="0" filter="url(#${id}Glow)">
      <animate attributeName="stroke-dashoffset" values="${ringDash.toFixed(0)};${ringDash.toFixed(0)};0"
        keyTimes="0;${(T.ring[0]/D).toFixed(3)};${(T.ring[1]/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
      <animate attributeName="opacity" values="0;0;1" keyTimes="0;${(T.ring[0]/D).toFixed(3)};${((T.ring[0]+0.14)/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
      <animateTransform attributeName="transform" type="rotate" from="-70 ${ringC.x} ${ringC.y}" to="0 ${ringC.x} ${ringC.y}"
        dur="${D}s" begin="0s" fill="freeze"/>
    </circle>
    <circle cx="${ringC.x}" cy="${ringC.y}" r="${(L.ring.inner * crestScale).toFixed(1)}" fill="none"
      stroke="${C.blue}" stroke-width="3" opacity="0" filter="url(#${id}BlueGlowF)">
      <animate attributeName="opacity" values="0;0;.9" keyTimes="0;${(T.ring[0]/D).toFixed(3)};${(T.ring[1]/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
    </circle>
  </g>`);

  /* ================= SCENE 8 — RED HALO IGNITES ================= */
  layers.push(`<circle cx="${ringC.x}" cy="${ringC.y}" r="${(ringR * 1.18).toFixed(1)}" fill="url(#${id}Halo)" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;${(T.halo[0]/D).toFixed(3)};${((T.halo[0]+0.16)/D).toFixed(3)};1" dur="${D}s" fill="freeze"/>
    <animate attributeName="r" values="${(ringR*1.05).toFixed(1)};${(ringR*1.05).toFixed(1)};${(ringR*1.18).toFixed(1)}"
      keyTimes="0;${(T.halo[0]/D).toFixed(3)};${(T.halo[1]/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
  </circle>`);
  // a hot flash at ignition
  layers.push(`<circle cx="${ringC.x}" cy="${ringC.y}" r="${(ringR*1.1).toFixed(1)}" fill="${C.red}" opacity="0" filter="url(#${id}Soft)">
    <animate attributeName="opacity" values="0;0;.5;0" keyTimes="0;${(T.halo[0]/D).toFixed(3)};${((T.halo[0]+0.1)/D).toFixed(3)};${((T.halo[0]+0.4)/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
  </circle>`);

  /* ================= SCENE 9 — FINAL LOCKUP ================= */
  // the emblem flares once more as the lockup completes
  layers.push(`<circle cx="${emblemC.x}" cy="${emblemC.y}" r="${(emblemS*1.6).toFixed(1)}" fill="${C.gold}" opacity="0" filter="url(#${id}Soft)">
    <animate attributeName="opacity" values="0;0;.34;0" keyTimes="0;${(T.lock[0]/D).toFixed(3)};${((T.lock[0]+0.12)/D).toFixed(3)};${((T.lock[0]+0.4)/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
  </circle>`);

  // wordmark
  layers.push(`<g opacity="0">
    <animate attributeName="opacity" values="0;0;1" keyTimes="0;${(T.lock[0]/D).toFixed(3)};${((T.lock[0]+0.24)/D).toFixed(3)}" dur="${D}s" fill="freeze"/>
    <text x="${W/2}" y="${crestY + CS * crestScale + 78}" text-anchor="middle"
      font-family="'Bebas Neue', 'Arial Narrow', Impact, sans-serif" font-size="74" letter-spacing="5"
      fill="url(#${id}Gold)" filter="url(#${id}Glow)">JUSTICE SOCIETY OF ACTIVISM</text>
    <text x="${W/2}" y="${crestY + CS * crestScale + 124}" text-anchor="middle"
      font-family="'Montserrat', Arial, sans-serif" font-weight="700" font-size="21" letter-spacing="10"
      fill="#C9C9D4">EVIDENCE • AMPLITUDE • ACTION</text>
  </g>`);

  // final vignette and grain
  layers.push(`<rect width="${W}" height="${H}" fill="url(#${id}Vignette)" opacity=".55"/>`);

  const out = padKeyTimes(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
  role="img" aria-label="Justice Society of Activism animated logo">
${faces()}
${defs.join('')}
${layers.join('\n')}
</svg>`);

  validateAnimations(out);

  // A NaN or undefined in a coordinate silently blanks a layer, so fail loudly.
  if (/NaN|undefined/.test(out)) {
    const bad = out.match(/[^\s"']*(NaN|undefined)[^\s"']*/g) || [];
    throw new Error('intro: invalid numeric value in output -> ' + bad.slice(0, 5).join(' | '));
  }
  return out;
}

module.exports = { intro, DUR, TIMELINE: T };
