/**
 * Globe geometry — orthographic projection with simplified but recognizable
 * continent outlines for the Americas, which the brand treats as home turf.
 */

// Orthographic projection centred on the Americas (lon0 = -78, lat0 = 18).
const LON0 = -78 * Math.PI / 180;
const LAT0 = 18 * Math.PI / 180;

function project(lon, lat, R) {
  const l = lon * Math.PI / 180, p = lat * Math.PI / 180;
  const x = R * Math.cos(p) * Math.sin(l - LON0);
  const y = R * (Math.cos(LAT0) * Math.sin(p) - Math.sin(LAT0) * Math.cos(p) * Math.cos(l - LON0));
  return [x, y];
}

// Simplified continent outlines [lon, lat] pairs.
const NORTH_AMERICA = [
  [-168,65],[-161,71],[-140,70],[-125,70],[-105,72],[-95,74],[-82,73],[-73,68],
  [-62,60],[-55,52],[-59,47],[-66,44],[-70,42],[-74,40],[-76,35],[-80,31],[-81,25],
  [-82,27],[-88,30],[-94,29],[-97,26],[-92,18],[-88,16],[-84,11],[-78,9],[-80,8],
  [-84,10],[-88,13],[-92,15],[-97,16],[-105,20],[-110,24],[-114,28],[-117,32],
  [-121,37],[-124,42],[-124,48],[-131,54],[-136,58],[-149,59],[-158,57],[-165,60]
];

const SOUTH_AMERICA = [
  [-78,8],[-72,12],[-62,11],[-52,5],[-50,0],[-44,-2],[-35,-6],[-35,-9],[-39,-14],
  [-41,-22],[-48,-25],[-53,-33],[-57,-38],[-62,-40],[-63,-45],[-66,-50],[-68,-54],
  [-72,-52],[-74,-45],[-73,-38],[-71,-30],[-70,-23],[-71,-18],[-76,-14],[-81,-6],
  [-80,-2],[-78,2]
];

const GREENLAND = [
  [-45,60],[-20,70],[-22,78],[-40,83],[-58,82],[-55,70]
];

const CENTRAL_AMERICA = [
  [-92,16],[-88,16],[-84,11],[-79,9],[-77,8],[-79,7],[-84,10],[-88,13],[-91,14]
];

const CARIBBEAN = [
  [-74,20],[-70,22],[-64,18],[-61,17],[-66,18],[-72,18]
];

/** Project a polygon into an SVG path string. */
function polyPath(points, R, cx, cy) {
  const d = points.map((p, i) => {
    const [x, y] = project(p[0], p[1], R);
    return (i === 0 ? 'M' : 'L') + (cx + x).toFixed(2) + ' ' + (cy + y).toFixed(2);
  }).join(' ');
  return d + ' Z';
}

/** Latitude/longitude graticule as projected paths. */
function graticule(R, cx, cy, step) {
  const paths = [];
  for (let lat = -60; lat <= 80; lat += step) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += 4) {
      const [x, y] = project(lon, lat, R);
      if (Math.hypot(x, y) <= R) pts.push([cx + x, cy + y]);
    }
    if (pts.length > 2) {
      paths.push('M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'));
    }
  }
  for (let lon = -180; lon < 180; lon += step) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 3) {
      const [x, y] = project(lon, lat, R);
      if (Math.hypot(x, y) <= R) pts.push([cx + x, cy + y]);
    }
    if (pts.length > 2) {
      paths.push('M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'));
    }
  }
  return paths;
}

/** Points on the visible limb, used for energy arcs and orbit rings. */
function limbPoints(R, count, phase) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2 + (phase || 0);
    pts.push([Math.cos(t) * R, Math.sin(t) * R]);
  }
  return pts;
}


/**
 * Network energy lines that wrap around the globe: latitude bands and
 * tilted great-circle arcs. Each returns an SVG path in globe coordinates.
 */
function networkArcs(R, cx, cy) {
  const paths = [];

  // latitude bands, projected as ellipses that foreshorten with latitude
  for (let lat = -45; lat <= 45; lat += 30) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += 5) {
      const [x, y] = project(lon, lat, R);
      if (Math.hypot(x, y) <= R * 1.02) pts.push([cx + x, cy + y]);
    }
    if (pts.length > 3) {
      paths.push('M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'));
    }
  }

  // tilted great circles, drawn as arcs that curve around the sphere
  const tilts = [0.35, -0.55, 1.05, 2.15];
  tilts.forEach(t => {
    const pts = [];
    for (let a = 0; a <= 360; a += 4) {
      const rad = a * Math.PI / 180;
      const rr = R * 1.035;
      const x = Math.cos(rad) * rr;
      const y = Math.sin(rad) * rr * Math.cos(t);
      const ox = Math.sin(rad) * rr * 0.10;
      pts.push([cx + x + ox, cy + y]);
    }
    paths.push('M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'));
  });

  return paths;
}

/** Node positions scattered across the globe for the network lattice. */
function networkNodes(R, cx, cy, count, seed) {
  let s = seed || 7919;
  const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const r = R * Math.sqrt(rnd()) * 0.96;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.4 + rnd() * 3.2]);
  }
  return out;
}

/* ================================================================
   Flat (equirectangular) projection, for world-map artwork.
   ================================================================ */

/** Longitude/latitude to a point on a flat W x H map. */
function equirect(lon, lat, W, H) {
  return [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
}

/** A continent polygon as an SVG path on a flat map. */
function polyEquirect(points, W, H) {
  return points.map((p, i) => {
    const [x, y] = equirect(p[0], p[1], W, H);
    return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
  }).join(' ') + ' Z';
}

/** Even-odd point-in-polygon test on flat map coordinates. */
function pointInPoly(x, y, poly, W, H) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = equirect(poly[i][0], poly[i][1], W, H);
    const [xj, yj] = equirect(poly[j][0], poly[j][1], W, H);
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

/**
 * A dot-matrix world map: a grid of dots that fall inside the continents.
 * This is the premium treatment used for background texture — it reads as
 * a world map without ever competing with the foreground.
 */
function dotWorld(W, H, step, r, polys) {
  const list = polys || [NORTH_AMERICA, SOUTH_AMERICA, GREENLAND, CENTRAL_AMERICA, CARIBBEAN];
  const out = [];
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      let hit = false;
      for (const poly of list) {
        if (pointInPoly(x, y, poly, W, H)) { hit = true; break; }
      }
      if (hit) out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`);
    }
  }
  return out;
}


/* ------------------------------------------------------------------
   Simplified outlines for the rest of the world. These are used for the
   flat world-map artwork only. The crest's globe keeps the Americas,
   because that is the hemisphere the brand is centred on.
   ------------------------------------------------------------------ */
const EURASIA = [
  [-10,36],[-9,43],[-2,48],[2,51],[8,54],[12,55],[10,58],[18,56],[21,60],[28,60],
  [24,66],[30,70],[44,68],[55,70],[70,73],[85,74],[100,77],[113,74],[128,73],[142,72],
  [160,70],[170,66],[178,64],[170,60],[162,58],[155,52],[142,46],[135,43],[130,38],[126,35],
  [121,31],[117,24],[110,20],[105,10],[100,6],[98,12],[94,18],[89,22],[80,15],[77,8],
  [72,20],[67,24],[60,25],[57,20],[52,16],[48,13],[43,13],[38,18],[35,29],[34,36],[28,36],
  [22,37],[15,38],[12,45],[5,43],[0,39]
];

const AFRICA = [
  [-17,37],[-10,35],[-5,36],[3,37],[10,34],[20,32],[25,32],[32,31],[35,27],[39,15],
  [43,12],[51,12],[48,5],[42,-2],[40,-10],[36,-18],[33,-26],[26,-34],[19,-35],[15,-27],
  [12,-18],[9,-1],[2,5],[-5,5],[-12,8],[-17,15]
];

const AUSTRALIA = [
  [113,-22],[114,-28],[118,-34],[125,-32],[132,-32],[137,-35],[141,-38],[147,-38],[150,-35],
  [153,-28],[146,-19],[142,-11],[136,-12],[130,-11],[125,-14],[121,-18]
];

const GREENLAND_EAST = GREENLAND;

/**
 * Every continent, for full-world map artwork.
 */
const WORLD = [
  NORTH_AMERICA, SOUTH_AMERICA, GREENLAND_EAST, CENTRAL_AMERICA, CARIBBEAN,
  EURASIA, AFRICA, AUSTRALIA
];
module.exports = {
  EURASIA, AFRICA, AUSTRALIA, WORLD,
  project, polyPath, graticule, limbPoints, networkArcs, networkNodes,
  equirect, polyEquirect, pointInPoly, dotWorld,
  NORTH_AMERICA, SOUTH_AMERICA, GREENLAND, CENTRAL_AMERICA, CARIBBEAN
};
