/**
 * A self-contained preview page for the animated logo sequence.
 * Opens the SVG full-screen with a replay control and the scene list.
 */
const { DUR, TIMELINE } = require('./intro');

const SCENES = [
  ['Dark screen',              'black'],
  ['The globe forms',          'globe'],
  ['Network illuminates',      'network'],
  ['Energy rises',             'energy'],
  ['The emblem forms',         'emblem'],
  ['The hero flies through',   'fly'],
  ['The gold ring forms',      'ring'],
  ['The red halo ignites',     'halo'],
  ['Final crest lockup',       'lock']
];

function introPreview(o) {
  o = Object.assign({ width: 1280, height: 800 }, o);
  const svg = require('./intro').intro({ width: 1920, height: 1080 });
  const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const defs = svg.match(/<defs>[\s\S]*?<\/defs>/);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>JSA — Animated Logo Sequence (${DUR}s)</title>
<style>
  :root{--red:#E11937;--gold:#D4AF37;--blue:#00AEEF;--ink:#0B0B0F;--dim:#8a8a99}
  *{box-sizing:border-box}
  body{margin:0;background:var(--ink);color:#f2f2f5;
    font-family:'Roboto',Arial,Helvetica,sans-serif;min-height:100vh;display:flex;flex-direction:column}
  header{padding:22px 28px 14px;border-bottom:1px solid #23232c;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
  header h1{margin:0;font-size:17px;font-weight:800;letter-spacing:.4px}
  header p{margin:0;color:var(--dim);font-size:13px}
  .spacer{flex:1}
  button{font:600 13px/1 inherit;color:#fff;background:#1b1b24;border:1px solid #32323e;
    padding:10px 18px;border-radius:100px;cursor:pointer;transition:.15s}
  button:hover{background:#26262f}
  .stage{background:#000;display:grid;place-items:center;flex:1;padding:26px}
  .stage svg{width:100%;max-width:1200px;height:auto;display:block}
  ol{list-style:none;margin:0;padding:16px 28px 30px;display:grid;
    grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
  li{border:1px solid #23232c;border-radius:10px;padding:11px 13px;background:#101017}
  li .n{color:var(--gold);font-size:11px;font-weight:800;letter-spacing:1.4px}
  li .t{font-size:13.5px;font-weight:600;margin-top:3px}
  li .w{color:var(--dim);font-size:11.5px;margin-top:3px;font-variant-numeric:tabular-nums}
</style></head>
<body>
<header>
  <h1>Justice Society of Activism — Animated Logo Sequence</h1>
  <p>${DUR.toFixed(1)} seconds · 9 scenes · 1920×1080 · pure SMIL, no JavaScript required</p>
  <span class="spacer"></span>
  <button onclick="var s=document.querySelector('.stage svg');s.setCurrentTime(0);s.unpauseAnimations()">Replay</button>
  <button onclick="var s=document.querySelector('.stage svg');s.pauseAnimations()">Pause</button>
</header>
<div class="stage">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1200" height="675">
    ${defs ? defs[0] : ''}
    ${inner}
  </svg>
</div>
<ol>
${SCENES.map((sc, i) => {
  const key = Object.keys(TIMELINE)[i];
  const t = TIMELINE[key];
  return `<li><div class="n">SCENE ${i+1}</div><div class="t">${sc[0]}</div><div class="w">${t[0].toFixed(2)}s – ${t[1].toFixed(2)}s</div></li>`;
}).join('\n')}
</ol>
</body></html>`;
}

module.exports = { introPreview };
