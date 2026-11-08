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

module.exports = {
  project, polyPath, graticule, limbPoints, networkArcs, networkNodes,
  NORTH_AMERICA, SOUTH_AMERICA, GREENLAND, CENTRAL_AMERICA, CARIBBEAN
};
