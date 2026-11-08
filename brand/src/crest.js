/**
 * The JSA crest — the primary logo.
 *
 * Composition (outside in):
 *   red energy halo -> brushed gold ring -> electric blue halo
 *   -> cosmic field with particles -> globe (the power source)
 *   -> hero in flight, with the JSA emblem on the chest
 *
 * The energy reads bottom-up: blue globe core, blue stream rising into the
 * chest emblem, gold ring closing the circuit.
 */
const { C, rgba } = require('./palette');
const geo = require('./geo');
const { hero, heroDefs, ANCHORS } = require('./hero');
const { layout } = require('./crest-layout');
const { emblem, emblemDefs } = require('./emblem');

function crest(o) {
  o = Object.assign({
    size: 1024, idPrefix: 'J', transparent: false,
    withHero: true, withGlobe: true, withParticles: true, flatRing: false
  }, o);

  const S = o.size;
  const cx = S / 2, cy = S / 2;
  const id = o.idPrefix;
  const LAY = layout(S, ANCHORS.chest);
  const defs = [];
  const layers = [];

  // ================= DEFS =================
  defs.push(`
  <radialGradient id="${id}Field" cx=".5" cy=".42" r=".62">
    <stop offset="0" stop-color="#181826"/>
    <stop offset=".55" stop-color="#0E0E16"/>
    <stop offset="1" stop-color="${C.midnight}"/>
  </radialGradient>
  <radialGradient id="${id}Halo" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="${C.red}" stop-opacity="0"/>
    <stop offset=".80" stop-color="${C.red}" stop-opacity="0"/>
    <stop offset=".90" stop-color="${C.red}" stop-opacity=".30"/>
    <stop offset=".965" stop-color="${C.red}" stop-opacity=".16"/>
    <stop offset="1" stop-color="${C.red}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="${id}RingGold" x1=".05" y1="0" x2=".95" y2="1">
    <stop offset="0" stop-color="${C.goldLight}"/>
    <stop offset=".14" stop-color="${C.gold}"/>
    <stop offset=".30" stop-color="${C.goldDeep}"/>
    <stop offset=".44" stop-color="${C.goldLight}"/>
    <stop offset=".58" stop-color="${C.gold}"/>
    <stop offset=".76" stop-color="${C.goldDeep}"/>
    <stop offset=".9" stop-color="${C.gold}"/>
    <stop offset="1" stop-color="${C.goldLight}"/>
  </linearGradient>
  <linearGradient id="${id}RingInner" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.goldLight}"/><stop offset="1" stop-color="${C.goldDeep}"/>
  </linearGradient>
  <radialGradient id="${id}GlobeCore" cx=".42" cy=".36" r=".74">
    <stop offset="0" stop-color="#5FD4FF"/>
    <stop offset=".22" stop-color="#1E9FD6"/>
    <stop offset=".5" stop-color="#0E6494"/>
    <stop offset="1" stop-color="#06283F"/>
  </radialGradient>
  <radialGradient id="${id}GlobeLand" cx=".4" cy=".35" r=".8">
    <stop offset="0" stop-color="${C.goldLight}"/>
    <stop offset=".5" stop-color="${C.gold}"/>
    <stop offset="1" stop-color="${C.goldDeep}"/>
  </radialGradient>
  <radialGradient id="${id}GlobeShade" cx=".35" cy=".32" r=".75">
    <stop offset=".55" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".55"/>
  </radialGradient>
  <filter id="${id}Soft" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="${S*0.012}"/>
  </filter>
  <filter id="${id}BlueGlow" x="-70%" y="-70%" width="240%" height="240%">
    <feGaussianBlur stdDeviation="${S*0.016}" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}GoldGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="${S*0.008}" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}HeroHalo" x="-25%" y="-25%" width="150%" height="150%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="${S*0.006}" result="dil"/>
    <feGaussianBlur in="dil" stdDeviation="${S*0.005}" result="blur"/>
    <feFlood flood-color="#BDEBFF" flood-opacity="0.9" result="col"/>
    <feComposite in="col" in2="blur" operator="in" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}Grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope=".07"/></feComponentTransfer>
  </filter>`);

  defs.push(heroDefs(id + 'H'));
  defs.push(emblemDefs(id + 'E'));

  // ================= BACKGROUND =================
  if (!o.transparent) {
    layers.push(`<circle cx="${cx}" cy="${cy}" r="${S*0.497}" fill="url(#${id}Field)"/>`);
  }

  // Red outer energy halo. On a transparent background it is masked to the
  // ring area only, so the deliverable has clean, empty transparency.
  if (o.transparent) {
    layers.push(`<circle cx="${cx}" cy="${cy}" r="${S*0.50}" fill="url(#${id}Halo)" style="mix-blend-mode:screen"/>`);
  } else {
    layers.push(`<circle cx="${cx}" cy="${cy}" r="${S*0.50}" fill="url(#${id}Halo)"/>`);
  }

  // ================= GLOBE =================
  if (o.withGlobe) {
    const R = LAY.globe.r;
    const gx = LAY.globe.x, gy = LAY.globe.y;
    const g = [];

    // Blue core
    g.push(`<circle cx="${gx}" cy="${gy}" r="${R}" fill="url(#${id}GlobeCore)"/>`);

    // Graticule
    const grid = geo.graticule(R, gx, gy, 20);
    g.push(`<g fill="none" stroke="${C.blue}" stroke-width="${S*0.0022}" opacity=".30">` +
      grid.map(d => `<path d="${d}"/>`).join('') + `</g>`);

    // Landmasses
    const lands = [
      geo.NORTH_AMERICA, geo.SOUTH_AMERICA, geo.GREENLAND,
      geo.CENTRAL_AMERICA, geo.CARIBBEAN
    ];
    g.push(`<g fill="url(#${id}GlobeLand)" opacity=".92">` +
      lands.map(poly => `<path d="${geo.polyPath(poly, R, gx, gy)}"/>`).join('') + `</g>`);

    // Global network energy lines wrapping around the sphere
    const arcs = geo.networkArcs(R, gx, gy);
    g.push(`<g stroke="${C.blue}" stroke-width="${S*0.0032}" stroke-linecap="round" opacity=".8" filter="url(#${id}BlueGlow)" fill="none">` +
      arcs.map(d => `<path d="${d}"/>`).join('') + `</g>`);

    // network nodes on the lattice
    const nodes = geo.networkNodes(R, gx, gy, 26, 4409);
    g.push(`<g fill="${C.blueLight}">` +
      nodes.map(n => `<circle cx="${n[0].toFixed(1)}" cy="${n[1].toFixed(1)}" r="${n[2].toFixed(1)}" opacity=".85"/>`).join('') + `</g>`);

    // Blue energy radiating up out of the globe toward the hero
    const rays = [];
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI * 0.5 + (i - 8.5) * 0.135;
      const r1 = R * 1.02, r2 = R * (1.18 + (i % 3) * 0.1);
      rays.push(`M ${(gx + Math.cos(a) * r1).toFixed(1)} ${(gy + Math.sin(a) * r1).toFixed(1)} ` +
        `L ${(gx + Math.cos(a) * r2).toFixed(1)} ${(gy + Math.sin(a) * r2).toFixed(1)}`);
    }
    g.push(`<g stroke="${C.blue}" stroke-width="${S*0.0032}" stroke-linecap="round" opacity=".55" filter="url(#${id}BlueGlow)">` +
      rays.map(d => `<path d="${d}"/>`).join('') + `</g>`);

    // Gold framing — two arcs
    g.push(`<circle cx="${gx}" cy="${gy}" r="${R}" fill="none" stroke="url(#${id}RingInner)" stroke-width="${S*0.007}"/>`);
    g.push(`<circle cx="${gx}" cy="${gy}" r="${R*1.055}" fill="none" stroke="${C.gold}" stroke-width="${S*0.004}" opacity=".7" stroke-dasharray="${S*0.022} ${S*0.014}"/>`);
    g.push(`<circle cx="${gx}" cy="${gy}" r="${R*1.012}" fill="none" stroke="${C.goldLight}" stroke-width="${S*0.0022}" opacity=".55"/>`);

    // Terminator shading
    g.push(`<circle cx="${gx}" cy="${gy}" r="${R}" fill="url(#${id}GlobeShade)"/>`);

    // Specular highlight
    g.push(`<ellipse cx="${gx - R*0.34}" cy="${gy - R*0.42}" rx="${R*0.36}" ry="${R*0.22}"
      fill="${C.blueLight}" opacity=".16" transform="rotate(-28 ${gx - R*0.34} ${gy - R*0.42})"/>`);

    // backlight bloom so the hero reads as a silhouette against it
    g.push(`<circle cx="${gx}" cy="${gy}" r="${R*1.28}" fill="${C.blue}" opacity=".10" filter="url(#${id}Soft)"/>`);
    layers.push(`<g id="${id}Globe">${g.join('\n')}</g>`);
  }

  // ================= HERO =================
  // The hero is placed first so the emblem and energy stream can be derived
  // from its actual transform rather than hard-coded coordinates.
  const hs = LAY.hero.scale;
  const hx = LAY.hero.tx;
  const hy = LAY.hero.ty;
  const toCrest = LAY.hero.toCrest;

  if (o.withHero) {
    layers.push(`<g filter="url(#${id}HeroHalo)">` + hero({
      idPrefix: id + 'H',
      scale: hs, tx: hx, ty: hy,
      suit: '#1B1B26', trim: C.red, gold: C.gold, blue: C.blue
    }) + `</g>`);
  }

  const chest = toCrest(ANCHORS.chest);

  // ================= ENERGY STREAM =================
  // Blue energy rising from the globe core into the chest emblem.
  if (o.withHero && o.withGlobe) {
    const gx = LAY.globe.x, gy = LAY.globe.y;
    const sx = gx, sy = gy;
    const ex = chest.x, ey = chest.y;
    layers.push(`<g id="${id}Stream" filter="url(#${id}BlueGlow)" opacity=".95">
      <path d="M ${sx} ${sy} C ${sx - S*0.028} ${sy - S*0.075}, ${ex - S*0.055} ${ey + S*0.085}, ${ex} ${ey}"
        fill="none" stroke="${C.blue}" stroke-width="${S*0.009}" stroke-linecap="round"/>
      <path d="M ${sx + S*0.018} ${sy} C ${sx - S*0.005} ${sy - S*0.08}, ${ex - S*0.035} ${ey + S*0.09}, ${ex + S*0.014} ${ey + S*0.016}"
        fill="none" stroke="${C.blueLight}" stroke-width="${S*0.0032}" stroke-linecap="round" opacity=".85"/>
    </g>`);
  }

  // ================= CHEST EMBLEM =================
  if (o.withHero) {
    const es = LAY.emblem.size;
    layers.push(`<g transform="translate(${chest.x - es/2} ${chest.y - es/2}) scale(${es/200})" id="${id}Emblem"
      filter="url(#${id}GoldGlow)">
      ${emblem({ idPrefix: id + 'E', gold: C.gold, blue: C.blue })}
    </g>`);
  }

  // ================= RINGS =================
  const rOuter = LAY.ring.outer, rInner = LAY.ring.inner;
  if (!o.flatRing) {
    // Brushed-metal grain on the gold ring
    layers.push(`<circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="url(#${id}RingGold)" stroke-width="${S*0.036}"/>`);
    layers.push(`<circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="#000" stroke-width="${S*0.036}" opacity=".22" filter="url(#${id}Grain)" style="mix-blend-mode:overlay"/>`);
  } else {
    layers.push(`<circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="${C.gold}" stroke-width="${S*0.036}"/>`);
  }
  // Inner + outer gold hairlines
  layers.push(`<circle cx="${cx}" cy="${cy}" r="${rOuter - S*0.018}" fill="none" stroke="${C.goldLight}" stroke-width="${S*0.0035}" opacity=".7"/>`);
  layers.push(`<circle cx="${cx}" cy="${cy}" r="${rOuter + S*0.018}" fill="none" stroke="${C.goldDeep}" stroke-width="${S*0.003}" opacity=".8"/>`);

  // Electric blue interior halo
  layers.push(`<circle cx="${cx}" cy="${cy}" r="${rInner}" fill="none" stroke="${C.blue}" stroke-width="${S*0.0055}" opacity=".85" filter="url(#${id}BlueGlow)"/>`);

  // ================= PARTICLES =================
  if (o.withParticles) {
    // Deterministic pseudo-random so output is reproducible.
    let seed = 20260917;
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    const parts = [];
    for (let i = 0; i < 130; i++) {
      const a = rnd() * Math.PI * 2;
      const r = S * (0.30 + rnd() * 0.17);
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      const rad = S * (0.0016 + rnd() * 0.0042);
      const blue = rnd() > 0.45;
      parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(2)}"
        fill="${blue ? C.blue : C.gold}" opacity="${(0.18 + rnd() * 0.5).toFixed(2)}"/>`);
    }
    // Energy streaks
    for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI * 2;
      const r0 = S * (0.33 + rnd() * 0.09), r1 = r0 + S * (0.02 + rnd() * 0.05);
      parts.push(`<path d="M ${(cx + Math.cos(a) * r0).toFixed(1)} ${(cy + Math.sin(a) * r0).toFixed(1)}
        L ${(cx + Math.cos(a) * r1).toFixed(1)} ${(cy + Math.sin(a) * r1).toFixed(1)}"
        stroke="${i % 2 ? C.blue : C.gold}" stroke-width="${S*0.0022}" opacity=".45" stroke-linecap="round"/>`);
    }
    layers.push(`<g id="${id}Particles">${parts.join('')}</g>`);
  }

  // Vignette
  if (!o.transparent) {
    layers.push(`<circle cx="${cx}" cy="${cy}" r="${S*0.497}" fill="none"
      stroke="#000" stroke-width="${S*0.02}" opacity=".55"/>`);
  }

  const body = `<defs>${defs.join('')}</defs>\n${layers.join('\n')}`;

  // `inner` lets other assets inline the crest without nesting <svg> tags.
  if (o.inner) return body;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" role="img" aria-label="Justice Society of Activism crest">
${body}
</svg>`;
}

module.exports = { crest };
