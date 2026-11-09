/* =========================================================================
   Justice Society of Activism — channel page
   Vanilla JS, no dependencies. Thumbnails are generated as inline SVG data
   URIs so the page works fully offline.
   ========================================================================= */
'use strict';

const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => n >= 1e6 ? (n/1e6).toFixed(n>=1e7?0:1)+'M' : n>=1e3 ? (n/1e3).toFixed(n>=1e4?0:1)+'K' : String(n);

/* ---------------------------------------------------------------- artwork */
const PALETTES = [
  ['#ef233c','#8b1020'],['#ffb703','#b45309'],['#00b4d8','#0369a1'],['#00c07f','#065f46'],
  ['#7c3aed','#3b0764'],['#f97316','#7c2d12'],['#e11d48','#4c0519'],['#0891b2','#083344'],
  ['#ca8a04','#713f12'],['#4f46e5','#1e1b4b'],['#16a34a','#052e16'],['#db2777','#500724']
];
const MOTIFS = ['bars','grid','wave','dots','arc','diag'];

function hashSeed(seed){
  if (typeof seed === 'number' && isFinite(seed)) return Math.abs(Math.round(seed));
  let h = 0;
  const str = String(seed);
  for (let i = 0; i < str.length; i++){ h = (h * 31 + str.charCodeAt(i)) % 1000003; }
  return Math.abs(h);
}

function artwork(seed, w, h, motif, label){
  const n = hashSeed(seed);
  const p = PALETTES[n % PALETTES.length];
  const m = motif || MOTIFS[n % MOTIFS.length];
  let art = '';
  if (m === 'bars'){
    for (let i=0;i<7;i++) art += `<rect x="${(i*w)/7}" y="${h*(0.15+0.06*(i%3))}" width="${w/9}" height="${h}" fill="#fff" opacity="${0.06+0.02*i}"/>`;
  } else if (m === 'grid'){
    for (let i=0;i<9;i++) art += `<path d="M${i*w/8} 0 L${i*w/8+w*0.18} ${h}" stroke="#fff" stroke-opacity=".10" stroke-width="${w/28}"/>`;
  } else if (m === 'wave'){
    for (let i=0;i<4;i++) art += `<path d="M0 ${h*(0.45+i*0.12)} C ${w*0.3} ${h*(0.2+i*0.1)}, ${w*0.6} ${h*(0.8+i*0.05)}, ${w} ${h*(0.4+i*0.12)}" stroke="#fff" stroke-opacity=".12" stroke-width="${w/20}" fill="none"/>`;
  } else if (m === 'dots'){
    for (let y=0;y<7;y++) for (let x=0;x<11;x++) art += `<circle cx="${x*w/10}" cy="${y*h/6}" r="${w/45}" fill="#fff" opacity=".13"/>`;
  } else if (m === 'arc'){
    for (let i=0;i<5;i++) art += `<circle cx="${w*0.5}" cy="${h*1.1}" r="${h*(0.35+i*0.18)}" fill="none" stroke="#fff" stroke-opacity=".10" stroke-width="${w/30}"/>`;
  } else {
    for (let i=0;i<8;i++) art += `<rect x="${-h+w*0.25*i}" y="${-h}" width="${w/12}" height="${h*3}" fill="#fff" opacity=".07" transform="rotate(18 ${w/2} ${h/2})"/>`;
  }
  const words = (label || '').split(' ').filter(Boolean);
  const big = words.slice(0,2).map(w2 => w2.toUpperCase()).join(' ');
  const rest = words.slice(2).join(' ');
  const fs = Math.max(18, Math.round(w/16));
  const lbl = big ? `<g font-family="Archivo, Helvetica, Arial, sans-serif" font-weight="900">`+
    `<text x="${w*0.055}" y="${h*0.62}" font-size="${fs}" fill="#ffffff" opacity=".92">${big.replace(/[&<>]/g,'')}</text>`+
    (rest ? `<text x="${w*0.055}" y="${h*0.62+fs*1.05}" font-size="${fs*0.46}" fill="#ffffff" opacity=".62">${rest.toUpperCase().replace(/[&<>]/g,'')}</text>` : '')+
    `</g>` : '';
  const r = h*0.085, cx = w*0.885, cy = h*0.235;
  const seal = `<g opacity=".92"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-width="${Math.max(1,w/420)}"/>`+
    `<text x="${cx}" y="${cy+r*0.32}" text-anchor="middle" font-family="Archivo, Helvetica, Arial, sans-serif" font-weight="900" font-size="${r*0.82}" fill="#ffffff" opacity=".9">JSA</text></g>`;
  const scrim = `<rect x="0" y="${h*0.34}" width="${w}" height="${h*0.66}" fill="#000" opacity=".28"/>`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`+
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient>`+
    `<filter id="n"><feTurbulence baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="saturate" values="0"/>`+
    `<feComponentTransfer><feFuncA type="linear" slope="0.10"/></feComponentTransfer></filter></defs>`+
    `<rect width="${w}" height="${h}" fill="url(#g)"/>${art}${scrim}${lbl}${seal}`+
    `<rect width="${w}" height="${h}" filter="url(#n)" opacity=".45"/>`+
    `</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ---------------------------------------------------------------- content */
const CHANNEL = {
  name:'Justice Society of Activism',
  handle:'@justicesociety',
  subs:1284000
};

const VIDEOS = [
  {id:1, t:'The Quiet Auction: How a County Sold Its Water', c:'Documentary', d:'42:18', v:2840000, ago:'2 days ago', live:false, hot:true,
   desc:'Three years of sealed bids, one rural county, and the shell companies that turned a public utility into a private windfall.'},
  {id:2, t:'What Actually Happens During a Town Hall', c:'Explainer', d:'12:04', v:1120000, ago:'4 days ago', live:false,
   desc:'A 12-minute walkthrough of the meeting format, the legal protections, and the exact words that move a room.'},
  {id:3, t:'They Deleted 40,000 Comments. We Kept a Copy.', c:'Investigative', d:'28:37', v:3760000, ago:'1 week ago', live:false, hot:true,
   desc:'Public comment is a record. We requested it, we archived it, and we built a searchable public database.'},
  {id:4, t:'Organizing in a Union Shop (No, Not That Kind)', c:'Organizing', d:'19:50', v:824000, ago:'1 week ago', live:false,
   desc:'The 8-step outreach ladder that worked in 14 of 16 plants — with the two that flopped and why.'},
  {id:5, t:'How We Verified 11,000 Voting Records', c:'Explainer', d:'9:12', v:647000, ago:'2 weeks ago', live:false,
   desc:'Chain of custody, OCR error rates, and the audit trail behind our precinct-by-precinct analysis.'},
  {id:6, t:'Interview: A Public Defender on the Inside', c:'Interview', d:'51:02', v:1980000, ago:'2 weeks ago', live:false,
   desc:'A 50-minute conversation about what a good case actually requires — and who gets to decide.'},
  {id:7, t:'We Followed the Money for 18 Months', c:'Documentary', d:'37:44', v:2410000, ago:'3 weeks ago', live:false, hot:true,
   desc:'The invoices, the shell LLCs, and the one name that appears in every filing.'},
  {id:8, t:'FOIA in Practice: Filing That Actually Works', c:'Organizing', d:'24:16', v:918000, ago:'3 weeks ago', live:false,
   desc:'Templates, appeal language, and the seven-word sentence that cut our response time by half.'},
  {id:9, t:'Live Town Hall: The Housing Budget, Line by Line', c:'Live', d:'1:58:22', v:456000, ago:'1 month ago', live:true,
   desc:'Our editors read the budget aloud while viewers annotate it in real time.'},
  {id:10, t:'The Case Against the Algorithm', c:'Documentary', d:'33:09', v:1640000, ago:'1 month ago', live:false,
   desc:'Who is scored, who is excluded, and where the model gets its labels.'},
  {id:11, t:'Reading a Contract in 20 Minutes', c:'Explainer', d:'16:44', v:734000, ago:'1 month ago', live:false,
   desc:'Termination clauses, auto-renewal, and the four sentences that decide whether you can leave.'},
  {id:12, t:'Can a Neighborhood Sue a City?', c:'Explainer', d:'21:30', v:589000, ago:'2 months ago', live:false,
   desc:'Standing, exhaustion of remedies, and the cases that made it to the appellate court.'},
  {id:13, t:'Dispatch from the Water Committee', c:'Organizing', d:'7:41', v:412000, ago:'2 months ago', live:false,
   desc:'Four minutes from the floor of a room where the decision was already made.'},
  {id:14, t:'Interview: Ten Years Inside a Statehouse', c:'Interview', d:'1:14:05', v:1330000, ago:'2 months ago', live:false,
   desc:'What actually moves a bill, from the drafting table to the final vote.'},
  {id:15, t:'The Records That Refused to Be Produced', c:'Investigative', d:'29:33', v:1720000, ago:'3 months ago', live:false,
   desc:'Twelve agencies, four lawsuits, and the redactions that told the story on their own.'},
  {id:16, t:'Why Your Vote Was Counted Late', c:'Explainer', d:'14:22', v:806000, ago:'3 months ago', live:false,
   desc:'Election infrastructure, chain of custody, and the 48 hours nobody explains.'},
  {id:17, t:'De-escalation for People Who Have to Be There', c:'Organizing', d:'26:08', v:1020000, ago:'3 months ago', live:false,
   desc:'Practical de-escalation for parents, students, and neighbors who cannot leave the room.'},
  {id:18, t:'The Public Comment That Rewrote a Zoning Plan', c:'Documentary', d:'22:47', v:1510000, ago:'4 months ago', live:false,
   desc:'Nine minutes of testimony, and a five-year plan that changed eleven blocks.'},
  {id:19, t:'Data Before Rhetoric: Building a Public Case', c:'Explainer', d:'18:36', v:498000, ago:'4 months ago', live:false,
   desc:'How to build a spreadsheet that a city council actually persuades itself to believe.'},
  {id:20, t:'Open Mic: Organizers Tell the Story', c:'Interview', d:'46:12', v:922000, ago:'5 months ago', live:false,
   desc:'Six organizers, no slides, straight stories about what got them to their first action.'},
  {id:21, t:'The Audit We Filed and What It Cost', c:'Investigative', d:'31:19', v:1390000, ago:'5 months ago', live:false,
   desc:'We paid $18,000 in filing fees to release a number the agency already had.'},
  {id:22, t:'Five Years of Reporting, in Eleven Minutes', c:'Explainer', d:'11:11', v:1290000, ago:'6 months ago', live:false,
   desc:'A recap for new supporters — and an honest accounting of what we got wrong.'},
  {id:23, t:'Live Q&A: Ask the Newsroom Anything', c:'Live', d:'1:12:09', v:318000, ago:'6 months ago', live:true,
   desc:'Our reporters answered viewer questions for 72 minutes, unedited.'},
  {id:24, t:'The Public Record Is Not Ours to Keep', c:'Documentary', d:'35:50', v:1870000, ago:'7 months ago', live:false, hot:true,
   desc:'Every document we obtain belongs to the public. Here is how we hand it back.'}
];

const SHORTS = [
  {id:'s1', t:'One question that ends the meeting in 10 seconds', v:2400000, ago:'1 day ago'},
  {id:'s2', t:'Read a city budget in 4 steps', v:1810000, ago:'2 days ago'},
  {id:'s3', t:'When your council blocks the microphones', v:3120000, ago:'3 days ago'},
  {id:'s4', t:'What a subpoena looks like (redacted)', v:960000, ago:'4 days ago'},
  {id:'s5', t:'The 3-line records request that worked', v:1420000, ago:'5 days ago'},
  {id:'s6', t:'Proof your city has to publish minutes', v:2180000, ago:'6 days ago'},
  {id:'s7', t:'How to win a public comment slot', v:760000, ago:'1 week ago'},
  {id:'s8', t:'Anonymize a document in 60 seconds', v:1250000, ago:'1 week ago'},
  {id:'s9', t:'The line item that funded the surprise', v:1690000, ago:'1 week ago'},
  {id:'s10', t:'What "in camera" actually means', v:1090000, ago:'2 weeks ago'}
];

const PLAYLISTS = [
  {t:'Start Here: The Justice Society Method', n:12, d:'The five moves we use on every story, in order.', s:0},
  {t:'FOIA Field Guide', n:18, d:'Templates, appeal language, and filing calendars.', s:2},
  {t:'Organizing Starter Kit', n:24, d:'Outreach ladders, scripts, and follow-up templates.', s:4},
  {t:'Budgets for Citizens', n:9, d:'Reading municipal budgets without a finance degree.', s:6},
  {t:'Courtroom Basics', n:15, d:'Standing, procedure, and what to expect in a hearing.', s:8},
  {t:'Public Meetings, Publicly Recorded', n:11, d:'Rules, rights, and how to fight a bad one.', s:10},
  {t:'Data & Documents', n:21, d:'Open records, cleaning data, and building a public case.', s:1},
  {t:'Election Season 2024 Archive', n:27, d:'Precinct-by-precinct findings and the full methodology.', s:3}
];

const LIVE = [
  {d:'THU', t:'Open Line: Public Comment Clinic', time:'7:00 PM', s:'Drop in with a draft comment. We edit live.', live:true},
  {d:'SAT', t:'The Accountability Hour: Housing', time:'2:00 PM', s:'Four officials, one question, sixty minutes.', live:true},
  {d:'MON', t:'Organizers Only: Wins & Warnings', time:'8:30 PM', s:'Members-only debrief. What worked and what did not.', live:true},
  {d:'MAY 2', t:'Town Hall: The Zoning Plan', time:'6:00 PM', s:'Recorded and archived. Captions on.', live:false},
  {d:'APR 18', t:'Ask the Newsroom', time:'7:00 PM', s:'72 minutes, unedited.', live:false}
];

const POSTS = [
  {ch:'Justice Society of Activism', ago:'2 days ago', body:'We just filed the last 40,000 deleted comments into a public, searchable archive. Every one of them is a person who showed up.',
   likes:8421, comments:391, poll:{q:'Which local body should we document next?', opts:[['City council',4120],['School board',2870],['Zoning commission',2210],['County commission',1490]]}},
  {ch:'Maya Okafor', ago:'3 days ago', body:'Used the JSA budget template on our city budget for the first time. We found a line item nobody had questioned since 2014. Thank you for teaching us to read it.',
   likes:1204, comments:87},
  {ch:'Justice Society of Activism', ago:'5 days ago', body:'NEW SERIES: "The Quiet Auction." Episode 1 is live — a county sold its water three times before anyone voted on it. Free to watch, ad-free for members.',
   likes:11020, comments:1204},
  {ch:'Dan Whitfield', ago:'1 week ago', body:'Requesting a Spanish-language version of the public comment script. My whole block needs it.',
   likes:640, comments:132}
];

const TIERS = [
  {n:'Supporter', p:'$4 / month', f:['Ad-free viewing on every format','Supporter badge in comments','Monthly field notes newsletter'],
   btn:'Become a Supporter', cls:'btn-ghost-plain'},
  {n:'Organizer', p:'$12 / month', f:['Everything in Supporter','Downloadable toolkits and templates','Monthly members-only briefing','Early access to new films'],
   btn:'Join as Organizer', cls:'btn-primary'},
  {n:'Sustainer', p:'$40 / month', f:['Everything in Organizer','Fund a month of records requests','Name in the annual transparency report','Quarterly call with the newsroom'],
   btn:'Become a Sustainer', cls:'btn-gold'}
];

const LINKS = [
  ['Website','justicesociety.org'],['Newsletter','justicesociety.org/thursday'],['Field guide (PDF)','justicesociety.org/guide'],
  ['Public comment database','data.justicesociety.org'],['Donate','justicesociety.org/give'],['Press kit','justicesociety.org/press']
];

/* ---------------------------------------------------------------- state */
const state = {
  tab:'home', filter:'all', query:'', subscribed:false, liked:new Set(),
  published:[], videos:VIDEOS.slice()
};

/* ---------------------------------------------------------------- icons */
const I = {
  play:'M8 5v14l11-7z',
  views:'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10z',
  check:'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  heart:'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z',
  comment:'M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z',
  share:'M18 16.08a2.9 2.9 0 0 0-1.96.77L8.91 12.7a3.3 3.3 0 0 0 0-1.4l7.05-4.11A3 3 0 1 0 15 5a3 3 0 0 0 .06.7L7.99 9.81a3 3 0 1 0 0 4.38l7.12 4.16A3 3 0 1 0 18 16.08z',
  link:'M10.6 13.4a1 1 0 0 1 0-1.4l4.2-4.2a2 2 0 0 1 2.8 2.8l-1.2 1.2 1.4 1.4 1.2-1.2a4 4 0 0 0-5.6-5.6l-4.2 4.2a4 4 0 0 0 0 5.6zm2.8-2.8a1 1 0 0 1 0 1.4l-4.2 4.2a2 2 0 0 1-2.8-2.8l1.2-1.2-1.4-1.4-1.2 1.2a4 4 0 0 0 5.6 5.6l4.2-4.2a4 4 0 0 0 0-5.6z',
  globe:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 9h-3.4a15.6 15.6 0 0 0-1.4-5.7A8 8 0 0 1 19.9 11zM12 4c.8 1.2 1.9 3.4 2.1 7H9.9c.2-3.6 1.3-5.8 2.1-7zM4.1 13h3.4c.1 2.1.6 4 1.4 5.7A8 8 0 0 1 4.1 13zm3.4-2H4.1a8 8 0 0 1 4.8-4.7A15.6 15.6 0 0 0 7.5 11zM12 20c-.8-1.2-1.9-3.4-2.1-7h4.2c-.2 3.6-1.3 5.8-2.1 7zm4.1-1.3c.8-1.7 1.3-3.6 1.4-5.7h3.4a8 8 0 0 1-4.8 4.7z',
  mail:'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z',
  plus:'M12 4a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V5a1 1 0 0 1 1-1z'
};
const svg = (d, cls) => `<svg viewBox="0 0 24 24"${cls?` class="${cls}"`:''}><path d="${d}"/></svg>`;

/* ---------------------------------------------------------------- renderers */
function videoCard(v, i){
  const art = artwork(v.id + '#' + i, 640, 360, null, v.t);
  return `<article class="card" data-vid="${v.id}">
    <div class="thumb">
      <img src="${art}" alt="${esc(v.t)} thumbnail" loading="lazy">
      ${v.c==='Live'?'<span class="badge">Live</span>':v.hot?'<span class="badge gold">Popular</span>':''}
      <span class="dur">${v.d}</span>
      <span class="hov"><span class="circle">${svg(I.play)}</span></span>
    </div>
    <div class="cmeta">
      <img src="brand/public/crest.svg" alt="${CHANNEL.name}">
      <div style="min-width:0">
        <h4>${esc(v.t)}</h4>
        <p class="ch"><b>${CHANNEL.name}</b></p>
        <p class="ch">${fmt(v.v)} views${v.published?' • <span class="new">Just published</span>':' • '+v.ago}</p>
      </div>
      <button class="mnu" aria-label="More options">${svg('M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4m0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4')}</button>
    </div>
  </article>`;
}

function shortCard(s, i){
  return `<div class="short" data-sid="${s.id}">
    <div class="sbox">
      <img src="${artwork(s.t + '#' + i, 360, 640, null, s.t)}" alt="${esc(s.t)}" loading="lazy">
      <span class="splay">${svg(I.play)}</span>
      <span class="views">${svg(I.views)}${fmt(s.v)}</span>
    </div>
    <h5>${esc(s.t)}</h5>
    <p class="ch">${CHANNEL.name} • ${s.ago}</p>
  </div>`;
}

function playlistCard(p, i){
  const a = artwork('pl' + p.s, 640, 360, null, p.t), b = artwork(p.s + 3, 640, 360), c = artwork(p.s + 7, 640, 360);
  return `<article class="pl">
    <div class="stack"><img src="${a}" alt=""><img src="${b}" alt=""><img src="${c}" alt=""><span class="cnt">${p.n} videos</span></div>
    <div class="body"><h4>${esc(p.t)}</h4><p>${esc(p.d)}</p></div>
  </article>`;
}

function postCard(p, i){
  const poll = p.poll ? `<div class="poll">${p.poll.opts.map((o, oi) =>
    `<div class="opt" data-poll="${i}" data-oi="${oi}"><span class="fill" style="width:${(o[1]/p.poll.opts[0][1]*100).toFixed(1)}%"></span>
      <span>${esc(o[0])}</span><span class="pct">${Math.round(o[1]/p.poll.opts.reduce((a,b)=>a+b[1],0)*100)}%</span></div>`).join('')}</div>` : '';
  return `<article class="post">
    <div class="ph"><img src="brand/public/crest.svg" alt=""><div><b>${esc(p.ch)}</b><span>${p.ago}</span></div></div>
    <p>${esc(p.body)}</p>${poll}
    <div class="acts">
      <button>${svg(I.heart)}${fmt(p.likes)}</button>
      <button>${svg(I.comment)}${fmt(p.comments)}</button>
      <button>${svg(I.share)}Share</button>
    </div>
  </article>`;
}

function liveCard(l, i){
  return `<article class="card" data-live="${i}">
    <div class="thumb"><img src="${artwork('live' + i, 640, 360, null, l.t)}" alt="">
      ${l.live?'<span class="badge">Scheduled</span>':'<span class="badge gold">Replay</span>'}
      <span class="dur">${l.live?l.time:'VOD'}</span>
      <span class="hov"><span class="circle">${svg(I.play)}</span></span></div>
    <div class="cmeta"><img src="brand/public/crest.svg" alt=""><div style="min-width:0">
      <h4>${esc(l.t)}</h4><p class="ch">${esc(l.s)}</p><p class="ch">${l.d} • ${l.live?'Live stream':'Archived'}</p>
    </div></div></article>`;
}

/* ---------------------------------------------------------------- pages */
function renderHome(){
  const f = state.videos.find(v => v.hot) || state.videos[0];
  $('#fThumb').src = artwork('f' + f.id, 1280, 720, null, f.t);
  $('#fTitle').textContent = f.t;
  $('#fDesc').textContent = f.desc;
  $('#fViews').textContent = fmt(f.v) + ' views • ' + f.ago;
  $('#fWatch').onclick = () => openPlayer(f.id);

  $('#latestGrid').innerHTML = state.videos.slice(0, 6).map(videoCard).join('');
  $('#shortsRail').innerHTML = SHORTS.slice(0,8).map(shortCard).join('');
  $('#homeSeries').innerHTML = PLAYLISTS.slice(0,4).map(playlistCard).join('');

  $('#liveList').innerHTML = LIVE.slice(0,3).map(l =>
    `<div class="live-item"><div class="when">${l.d}</div><div><h5>${esc(l.t)}</h5><span>${l.time} • ${esc(l.s)}</span></div></div>`).join('');

  $('#pulse').innerHTML = `
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:14px">
      <img src="brand/public/crest.svg" alt="" style="width:40px;height:40px;border-radius:50%">
      <div style="flex:1"><b style="font-size:13.5px">This week on the channel</b>
      <div style="color:var(--dim);font-size:12.5px">412 new members joined</div></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span class="fchip on">+312 uploads</span><span class="fchip">+18.4K subs</span><span class="fchip">96% retention</span>
    </div>`;
}

function renderVideos(){
  let list = state.videos.slice();
  const f = state.filter, q = state.query.toLowerCase();
  if (q) list = list.filter(v => (v.t + ' ' + v.c + ' ' + (v.desc||'')).toLowerCase().includes(q));
  if (f === 'popular') list.sort((a,b) => b.v - a.v);
  else if (f === 'latest') list.sort((a,b) => b.id - a.id);
  else if (f !== 'all') list = list.filter(v => v.c.toLowerCase() === f);
  $('#videosGrid').innerHTML = list.map(videoCard).join('');
  $('#videosEmpty').hidden = list.length > 0;
  $('#videoCount').textContent = String(state.videos.length + state.published.length);
}

function renderShorts(){
  const html = SHORTS.map(shortCard).join('');
  $('#shortsRail2').innerHTML = html;
  $('#shortsRail').innerHTML = SHORTS.slice(0,8).map(shortCard).join('');
}

function renderPlaylists(){ $('#plGrid').innerHTML = PLAYLISTS.map(playlistCard).join(''); }
function renderLive(){ $('#liveGrid').innerHTML = LIVE.map(liveCard).join(''); }
function renderCommunity(){ $('#commGrid').innerHTML = POSTS.map(postCard).join(''); }
function renderSupport(){
  $('#tiers').innerHTML = TIERS.map((t,i) => `
    <div class="tier">
      <span class="tn">${t.n}</span>
      <h4>${t.p}</h4>
      <p class="price">${t.n==='Supporter'?'Entry level':t.n==='Organizer'?'Most chosen':'Fund the reporting'}</p>
      <ul>${t.f.map(f=>`<li>${svg(I.check)}${esc(f)}</li>`).join('')}</ul>
      <button class="btn ${t.cls}" data-tier="${i}">${esc(t.btn)}</button>
    </div>`).join('');
}
function renderAboutLinks(){
  const icons = {Website:I.globe,Newsletter:I.mail};
  $('#linkList').innerHTML = LINKS.map(l =>
    `<a href="#" onclick="return false">${svg(icons[l[0]]||I.link)}<span>${esc(l[0])}</span>
      <span style="color:var(--dim);font-weight:400;margin-left:auto;font-size:12.5px">${esc(l[1])}</span></a>`).join('');
}

/* ---------------------------------------------------------------- tabs */
function goTab(name){
  state.tab = name;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  $$('.tabpane').forEach(p => p.hidden = p.id !== 'pane-' + name);
  if (name === 'videos') renderVideos();
  if (name === 'shorts') renderShorts();
  if (name === 'playlists') renderPlaylists();
  if (name === 'live') renderLive();
  if (name === 'community') renderCommunity();
  if (name === 'support') renderSupport();
  if (name === 'about') renderAboutLinks();
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ---------------------------------------------------------------- toast */
let toastT;
function toast(msg, kind){
  const t = $('#toast');
  $('#toastMsg').textContent = msg;
  t.classList.toggle('warn', kind === 'warn');
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------------------------------------------------------------- player */
let currentVideo = null;
function openPlayer(id){
  const v = state.videos.find(x => String(x.id) === String(id));
  if (!v) return;
  currentVideo = v;
  $('#mTitle').textContent = v.t;
  $('#mMeta').textContent = `${CHANNEL.name} • ${fmt(v.v)} views • ${v.ago} • ${v.d}`;
  $('#mLikeCount').textContent = fmt(1200 + (v.v % 900));
  $('#player').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePlayer(){
  $('#player').classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------------------------------------------------------------- drawer */
function openDrawer(mode){
  const body = $('#drawerBody'), foot = $('#drawerFooter');
  if (mode === 'upload'){
    $('#drawerTitle').textContent = 'Create';
    body.innerHTML = uploadForm();
    foot.innerHTML = `<button class="btn btn-ghost-plain" id="cancelUpload">Cancel</button>
      <button class="btn btn-primary" id="publishBtn">Publish</button>`;
  } else {
    $('#drawerTitle').textContent = 'Studio & Monetization';
    body.innerHTML = studioPanel();
    foot.innerHTML = `<button class="btn btn-ghost-plain" id="closeStudio">Close</button>`;
  }
  $('#drawer').classList.add('open');
  $('#scrim').classList.add('open');
  if (mode === 'upload') wireUpload();
  else wireStudio();
}
function closeDrawer(){
  $('#drawer').classList.remove('open');
  $('#scrim').classList.remove('open');
}

/* ---------------------------------------------------------------- upload form */
function uploadForm(){
  return `
  <div class="seg" id="typeSeg" style="margin-bottom:20px">
    <button class="on" data-type="video">Video</button>
    <button data-type="short">Short</button>
    <button data-type="reel">Reel</button>
    <button class="gold" data-type="film">Short film</button>
  </div>

  <div class="field">
    <label for="upTitle">Title <span class="counter" id="titleCount">0/100</span></label>
    <input type="text" id="upTitle" maxlength="100" placeholder="Name this upload — lead with what it proves">
    <div class="hint">Strong titles name the finding. "The Quiet Auction: How a County Sold Its Water" beats "Update #4".</div>
  </div>

  <div class="field">
    <label for="upDesc">Description</label>
    <textarea id="upDesc" placeholder="What is the story, where did the evidence come from, and what should a viewer do next?"></textarea>
    <div class="hint">Source every claim. Pin corrections, and note where the full dataset lives.</div>
  </div>

  <div class="field">
    <label for="upFile">Video file</label>
    <div class="drop" id="drop">
      <svg viewBox="0 0 24 24"><path d="M12 3 7 8h3v6h4V8h3zM5 18h14v2H5z"/></svg>
      <b id="dropLabel">Drop a file or browse</b>
      <span id="dropSub">MP4, WebM or MOV • up to 12 GB</span>
    </div>
    <input type="file" id="upFile" accept="video/*" hidden>
    <div class="thumb-prev">
      <div class="prev" id="thumbPrev">Auto thumbnail<br>or upload</div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">Visibility</div>
        <div class="seg" id="visSeg">
          <button class="on" data-vis="Public">Public</button>
          <button data-vis="Unlisted">Unlisted</button>
          <button data-vis="Members">Members</button>
        </div>
      </div>
    </div>
  </div>

  <div class="field">
    <label for="upTags">Tags &amp; topics</label>
    <input type="text" id="upTags" value="justice, activism, accountability, organizing" placeholder="comma, separated, topics">
  </div>

  <div class="field">
    <label>Monetization</label>
    <div class="sw">
      <div class="txt"><b>Ads on this video</b><span>Overlay + mid-roll for non-members. Off = members only.</span></div>
      <div class="toggle on" id="tgAds" role="switch" aria-checked="true"></div>
    </div>
    <div class="sw">
      <div class="txt"><b>Sponsor slot</b><span>Reserved 30s mid-roll for a values-aligned sponsor.</span></div>
      <div class="toggle" id="tgSponsor" role="switch" aria-checked="false"></div>
    </div>
    <div class="sw">
      <div class="txt"><b>Paid promotion</b><span>Allow YouTube to recommend this in Ads campaigns.</span></div>
      <div class="toggle" id="tgPromo" role="switch" aria-checked="true"></div>
    </div>
    <div class="sw">
      <div class="txt"><b>Subtitles &amp; captions</b><span>Auto-generate, then hand-correct before publishing.</span></div>
      <div class="toggle on" id="tgSubs" role="switch" aria-checked="true"></div>
    </div>
  </div>

  <div class="field">
    <label>Schedule</label>
    <div class="seg" id="schedSeg">
      <button class="on" data-sched="now">Publish now</button>
      <button data-sched="prime">Prime time (Fri 7pm)</button>
      <button data-sched="custom">Custom</button>
    </div>
  </div>`;
}

function wireUpload(){
  const seg = $('#typeSeg');
  if (seg) seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#typeSeg button').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    if (b.dataset.type === 'short' || b.dataset.type === 'reel'){
      $('#upTitle').maxLength = 60;
      toast('Short format: keep the hook in the first 2 seconds');
    } else { $('#upTitle').maxlength = 100; }
  });
  const t = $('#upTitle');
  if (t) t.addEventListener('input', e => { $('#titleCount').textContent = e.target.value.length + '/100'; });

  const drop = $('#drop'), file = $('#upFile');
  if (drop){
    drop.addEventListener('click', () => file.click());
    ['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('drag'); }));
    ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('drag'); }));
    drop.addEventListener('drop', e => { if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); });
    file.addEventListener('change', e => { if (e.target.files[0]) setFile(e.target.files[0]); });
  }
  function setFile(f){
    $('#dropLabel').textContent = f.name;
    $('#dropSub').textContent = (f.size/1048576).toFixed(1) + ' MB • ready to publish';
    $('#thumbPrev').innerHTML = 'Generating<br>thumbnail…';
    setTimeout(() => { $('#thumbPrev').innerHTML = '<img src="' + artwork(f.name.length * 7, 320, 180) + '" alt="Auto thumbnail">'; }, 600);
  }
  const vis = $('#visSeg');
  if (vis) vis.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#visSeg button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  });
  const sch = $('#schedSeg');
  if (sch) sch.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#schedSeg button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  });
  $$('.toggle').forEach(tg => tg.addEventListener('click', () => {
    tg.classList.toggle('on');
    tg.setAttribute('aria-checked', tg.classList.contains('on'));
  }));
  const pub = $('#publishBtn');
  if (pub) pub.addEventListener('click', publish);
  const can = $('#cancelUpload');
  if (can) can.addEventListener('click', closeDrawer);
}

function publish(){
  const title = ($('#upTitle') && $('#upTitle').value.trim()) || 'Untitled upload';
  const desc = ($('#upDesc') && $('#upDesc').value.trim()) || '';
  const typeBtn = $('#typeSeg button.on');
  const type = typeBtn ? typeBtn.dataset.type : 'video';
  const visBtn = $('#visSeg button.on');
  const vis = visBtn ? visBtn.dataset.vis : 'Public';
  const tags = ($('#upTags') && $('#upTags').value) || '';
  const adsOn = $('#tgAds').classList.contains('on');
  const newV = {
    id: 'p' + Date.now(), t: title, c: type === 'film' ? 'Short film' : type === 'short' ? 'Short' : type === 'reel' ? 'Reel' : 'Upload',
    d: type === 'short' || type === 'reel' ? '0:47' : '12:34', v: 0, ago: 'Just now', live:false, published:true, desc: desc, tags: tags, ads: adsOn, vis: vis
  };
  state.videos.unshift(newV);
  state.published.push(newV);
  $('#videoCount').textContent = String(state.videos.length);
  closeDrawer();
  toast('Published: "' + title.slice(0,34) + (title.length>34?'…':'') + '" — visible as ' + vis);
  try { renderVideos(); renderHome(); } catch(e){ console.error('render error', e); }
}

/* ---------------------------------------------------------------- studio / monetization */
const STUDIO = {
  revenue: 84200, revenue30: 21400, cpm: 7.4, rpm: 3.9, watchHours: 184200, watchGoal: 20000,
  subs: 1284000, subGoal: 1300000, views30: 8420000, adRevenue: 51200, sponsors: 18600,
  cpmHistory:[5.8,6.1,6.0,6.6,6.9,7.1,7.0,7.4,7.2,7.6,7.4,7.4]
};

function studioPanel(){
  const s = STUDIO;
  const goalPct = Math.min(100, s.watchHours / s.watchGoal * 100);
  const subPct = Math.min(100, s.subs / s.subGoal * 100);
  const spark = s.cpmHistory.map((v,i) => {
    const x = 12 + i * (356/11), y = 64 - (v-5)/(8-5)*52;
    return (i?'L':'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }).join(' ');
  return `
  <div class="stat-grid">
    <div class="stat"><b class="g">$${fmt(s.revenue30)}</b><span>Revenue — last 30 days</span></div>
    <div class="stat"><b>$${fmt(s.revenue)}</b><span>Total revenue to date</span></div>
    <div class="stat"><b>$${s.cpm}</b><span>Average CPM</span></div>
    <div class="stat"><b>$${s.rpm}</b><span>Effective RPM</span></div>
  </div>

  <div class="stat-grid">
    <div class="stat"><b>${fmt(s.views30)}</b><span>Views — last 28 days</span></div>
    <div class="stat"><b>${fmt(s.watchHours)}</b><span>Watch hours — last 12 months</span></div>
    <div class="stat"><b>${fmt(s.subs)}</b><span>Subscribers</span></div>
    <div class="stat"><b class="y">$${fmt(s.sponsors)}</b><span>Direct + sponsorship income</span></div>
  </div>

  <div class="sec">
    <div class="sec-head"><h2 style="font-size:18px">Revenue mix</h2></div>
    <div class="mono-note" style="margin-bottom:14px">
      <b>Where the money comes from.</b> Ads fund 61% of operations, memberships 26%, sponsorships 11%, grants 2%.
      Our editorial line is protected by the member floor: no sponsor may buy coverage.
    </div>
    <div class="bar" style="height:14px"><i style="width:61%"></i></div>
    <div style="display:flex;justify-content:space-between;color:var(--dim);font-size:12px;margin-top:8px">
      <span>Ad revenue $${fmt(s.adRevenue)}</span><span>Memberships $18.6K</span><span>Sponsors $${fmt(s.sponsors)}</span>
    </div>
  </div>

  <div class="sec">
    <div class="sec-head"><h2 style="font-size:18px">CPM trend (12 months)</h2></div>
    <svg viewBox="0 0 380 72" style="width:100%;height:72px;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:4px">
      <path d="${spark}" fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <p style="color:var(--dim);font-size:12.5px;margin:8px 0 0">CPM rose 28% after the trust-and-safety overhaul pinned every claim to a source in the description. Higher-value, brand-safe inventory.</p>
  </div>

  <div class="sec">
    <div class="sec-head"><h2 style="font-size:18px">Monetization milestones</h2></div>
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px">
        <span>YPP watch hours (4K / 1M hour pair)</span><span style="color:var(--dim)">${fmt(s.watchHours)} / ${fmt(s.watchGoal)}</span>
      </div>
      <div class="bar"><i style="width:${goalPct}%"></i></div>
      <div style="color:var(--dim2);font-size:12px;margin-top:6px">YPP threshold: 4,000 valid public watch hours + 1,000 subscribers. Threshold reached — full ad share unlocked.</div>
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px">
        <span>Next subscriber goal</span><span style="color:var(--dim)">${fmt(s.subs)} / ${fmt(s.subGoal)}</span>
      </div>
      <div class="bar"><i style="width:${subPct}%"></i></div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-head"><h2 style="font-size:18px">Revenue planner</h2></div>
    <div class="mono-note">
      <b>Model a release.</b> Adjust views and CPM to see the ceiling before you publish — the same math the desk uses for series budgets.
    </div>
    <div class="field"><label>Projected views (first 30 days)</label>
      <input type="text" id="plViews" value="500,000"></div>
    <div class="field"><label>Expected CPM</label><input type="text" id="plCpm" value="7.40"></div>
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:18px;margin-top:6px">
      <div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--dim)"><span>Projected ad revenue</span><span id="plOut">$37,000</span></div>
      <div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--dim);margin-top:8px"><span>Membership lift (est.)</span><span id="plMem">+$1,240</span></div>
      <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:800;margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">
        <span>Total</span><span style="color:var(--green)" id="plTotal">$38,240</span></div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-head"><h2 style="font-size:18px">Top monetized videos</h2></div>
    ${state.videos.slice().sort((a,b)=>b.v-a.v).slice(0,5).map((v,i)=>`
      <div class="live-item">
        <div class="when">#${i+1}</div>
        <div style="min-width:0;flex:1"><h5>${esc(v.t)}</h5><span>${fmt(v.v)} views • est. $${fmt(Math.round(v.v*s.rpm/1000))}</span></div>
      </div>`).join('')}
  </div>

  <div class="sec">
    <div class="sec-head"><h2 style="font-size:18px">Sponsorship slots</h2></div>
    <div class="mono-note"><b>Available inventory:</b> 2 mid-rolls per long-form upload, 1 bumper per Short. Values-aligned sponsors only — see our editorial line.</div>
    ${['Truth Alliance (climate records)','Civic Records Co.','Field Notes Foundation'].map((sp,i)=>`
      <div class="sw">
        <div class="txt"><b>${sp}</b><span>${i%2?'2 mid-rolls open':'1 mid-roll open'} • $${1800+i*600}/slot</span></div>
        <button class="btn btn-ghost-plain" data-sponsor="${i}" style="height:34px;font-size:13px">Accept</button>
      </div>`).join('')}
  </div>`;
}

function wireStudio(){
  const calc = () => {
    const v = parseFloat(($('#plViews')||{}).value.replace(/[^0-9.]/g,'')) || 0;
    const c = parseFloat(($('#plCpm')||{}).value.replace(/[^0-9.]/g,'')) || 0;
    const ad = v/1000*c;
    const mem = v/1000*2.48;
    if ($('#plOut')) $('#plOut').textContent = '$' + Math.round(ad).toLocaleString();
    if ($('#plMem')) $('#plMem').textContent = '+$' + Math.round(mem).toLocaleString();
    if ($('#plTotal')) $('#plTotal').textContent = '$' + Math.round(ad+mem).toLocaleString();
  };
  ['plViews','plCpm'].forEach(id => { const el = $('#'+id); if (el) el.addEventListener('input', calc); });
  $$('[data-sponsor]').forEach(b => b.addEventListener('click', () => {
    b.textContent = 'Accepted ✓'; b.disabled = true; toast('Sponsor slot reserved — terms emailed');
  }));
  const cs = $('#closeStudio'); if (cs) cs.addEventListener('click', closeDrawer);
}

/* ---------------------------------------------------------------- events */
document.addEventListener('DOMContentLoaded', function(){
  /* theme */
  const savedTheme = localStorage.getItem('jsa-theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  $('#themeBtn').addEventListener('click', function(){
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('jsa-theme', next);
  });

  /* tabs */
  $('#tabs').addEventListener('click', function(e){
    const b = e.target.closest('.tab'); if (!b) return;
    goTab(b.dataset.tab);
  });
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => goTab(b.dataset.goto)));

  /* subscribe */
  const subBtn = $('#subBtn');
  function paintSub(){
    if (state.subscribed){
      subBtn.className = 'btn is-sub';
      subBtn.innerHTML = svg(I.check) + '<span>Subscribed</span><span class="count">1.28M</span>';
    } else {
      subBtn.className = 'btn btn-primary';
      subBtn.textContent = 'Subscribe';
    }
  }
  subBtn.addEventListener('click', function(){
    state.subscribed = !state.subscribed;
    paintSub();
    if (state.subscribed){
      CHANNEL.subs++; $('#subCount').textContent = fmt(CHANNEL.subs);
      toast('Subscribed — thank you for backing independent reporting');
    } else { CHANNEL.subs--; $('#subCount').textContent = fmt(CHANNEL.subs); }
  });
  paintSub();

  /* join + share + tiers */
  $('#joinBtn').addEventListener('click', function(){ goTab('support'); });
  $('#shareBtn').addEventListener('click', function(){ toast('Channel link copied to clipboard'); });
  document.addEventListener('click', function(e){
    const t = e.target.closest('[data-tier]'); if (!t) return;
    const tier = TIERS[+t.dataset.tier];
    toast(tier.n + ' membership selected — checkout opening');
  });

  /* search */
  $('#searchForm').addEventListener('submit', function(e){
    e.preventDefault();
    state.query = $('#q').value.trim();
    goTab('videos');
    toast(state.query ? 'Searching this channel for "' + state.query + '"' : 'Showing every upload');
  });

  /* video filters */
  $('#videoFilters').addEventListener('click', function(e){
    const b = e.target.closest('.fchip'); if (!b) return;
    $$('#videoFilters .fchip').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    state.filter = b.dataset.filter;
    renderVideos();
  });

  /* card clicks (delegated) */
  document.addEventListener('click', function(e){
    const card = e.target.closest('[data-vid]');
    if (card){ openPlayer(card.dataset.vid); return; }
    const sh = e.target.closest('[data-sid]');
    if (sh){ toast('Short opened — vertical player coming next'); return; }
    const opt = e.target.closest('.opt');
    if (opt){
      $$('.poll .opt').forEach(o => o.classList.remove('voted'));
      opt.classList.add('voted');
      toast('Vote counted — thanks for participating');
      return;
    }
    const mnu = e.target.closest('.mnu');
    if (mnu){ e.stopPropagation(); toast('Video options: save, share, report, download'); return; }
  });

  /* player */
  $('#playerClose').addEventListener('click', closePlayer);
  $('#player').addEventListener('click', function(e){ if (e.target.id === 'player') closePlayer(); });
  $('#mLike').addEventListener('click', function(){
    const v = currentVideo; if (!v) return;
    const on = state.liked.has(v.id);
    on ? state.liked.delete(v.id) : state.liked.add(v.id);
    $('#mLike').style.color = on ? '' : 'var(--red)';
    $('#mLikeCount').textContent = fmt(1200 + (v.v % 900) + (on ? 1 : 0));
    toast(on ? 'Like removed' : 'Liked — signal helps the algo');
  });
  $('#mSave').addEventListener('click', function(){ toast('Saved to your Playlists'); });
  $('#mShare').addEventListener('click', function(){ toast('Link copied'); });

  /* drawer */
  $('#uploadBtn').addEventListener('click', function(){ openDrawer('upload'); });
  $('#studioBtn').addEventListener('click', function(){ openDrawer('studio'); });
  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#scrim').addEventListener('click', closeDrawer);

  /* newsletter */
  $('#newsForm').addEventListener('submit', function(e){
    e.preventDefault();
    toast('You\'re on the list — first issue lands Thursday');
    e.target.reset();
  });

  /* menu button */
  $('#menuBtn').addEventListener('click', function(){
    document.querySelector('.hero').scrollIntoView({behavior:'smooth'});
    toast('Channel navigation is in the tabs below');
  });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){ closePlayer(); closeDrawer(); }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT'){ e.preventDefault(); $('#q').focus(); }
  });

  /* initial paint */
  renderHome(); renderVideos(); renderShorts(); renderPlaylists(); renderLive();
  renderCommunity(); renderSupport(); renderAboutLinks();
});
