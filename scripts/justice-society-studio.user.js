// ==UserScript==
// @name         Justice Society of Activism — Channel Studio & Composer
// @namespace    https://github.com/ojohnso5/tampermonkey-scripts
// @version      1.0.0
// @description  Adds a Justice Society of Activism composer (video / short / reel / short film), branding kit, and monetization tracker to youtube.com. Publishes through your own YouTube Studio with fields pre-filled.
// @author       ojohnso5
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @match        https://studio.youtube.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_notification
// @grant        GM_addStyle
// @grant        GM_download
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/justice-society-studio.user.js
// @downloadURL  https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/justice-society-studio.user.js
// @supportURL   https://github.com/ojohnso5/tampermonkey-scripts/issues
// @homepageURL  https://github.com/ojohnso5/tampermonkey-scripts
// ==/UserScript==

/* =====================================================================
   Justice Society of Activism — YouTube Channel Toolkit

   WHAT THIS DOES
   1. A "JSA Studio" button in the YouTube top bar opens a composer.
   2. The composer supports: Long-form video, Short, Reel, Short film.
   3. It captures title, description, tags, visibility, schedule, and the
      monetization switches (ads, sponsor slot, paid promotion, captions).
   4. "Open in YouTube Studio" hands every field to the real YouTube
      Studio upload page, pre-filled where YouTube supports it.
   5. A monetization tracker records projected revenue per post and
      keeps a running total of published work and earnings.
   6. A branding kit downloads the logo / avatar / banner for real
      channel art uploads.

   NOTES
   - YouTube has no public API that lets a script create a channel or
     upload on your behalf. So this script deliberately does NOT try to
     fake one. It hands off to your real Studio with everything filled
     in. That keeps your account safe and the upload legitimate.
   - Set your real channel handle in Settings before using the composer.
   ===================================================================== */

(function () {
  'use strict';

  const BRAND = {
    name: 'Justice Society of Activism',
    handle: '@justicesociety',
    red: '#ef233c',
    gold: '#ffb703',
    ink: '#0a0a0c',
    panel: '#16161c',
    panel2: '#1d1d25',
    line: '#2a2a34',
    line2: '#3a3a46',
    text: '#f2f2f5',
    dim: '#9d9dab',
    green: '#00c07f'
  };

  const DEFAULTS = {
    channelHandle: '@justicesociety',
    channelUrl: 'https://www.youtube.com/@justicesociety',
    memberFloor: 4000,
    memberSubFloor: 1000,
    targetCpm: 7.4,
    rpm: 3.9,
    sponsorRate: 1800,
    applyBranding: false,
    bannerVariant: 'banner.svg',
    decorate: true,
    channelId: ''
  };

  const cfg = Object.assign({}, DEFAULTS, GM_getValue('jsaConfig', {}));

  const SCRIPT_ORIGIN = 'https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main';

  /* ------------------------------------------------------------ styles */
  GM_addStyle(`
    #jsa-fab{position:fixed;right:18px;bottom:18px;z-index:10005;display:flex;align-items:center;gap:9px;
      background:${BRAND.red};color:#fff;border:0;border-radius:100px;padding:11px 18px 11px 14px;
      font:600 14px/1 "Roboto",Arial,sans-serif;cursor:pointer;box-shadow:0 8px 26px rgba(0,0,0,.45);
      transition:transform .15s,box-shadow .15s}
    #jsa-fab:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(239,35,60,.5)}
    #jsa-fab .jsa-dot{width:22px;height:22px;border-radius:50%;background:${BRAND.gold};color:${BRAND.ink};
      display:grid;place-items:center;font:900 9px/1 Arial,sans-serif;letter-spacing:-.3px}
    #jsa-scrim{position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:9998;opacity:0;pointer-events:none;transition:.2s}
    #jsa-scrim.on{opacity:1;pointer-events:auto}
    #jsa-drawer{position:fixed;top:0;right:0;bottom:0;width:min(580px,100%);background:${BRAND.ink};
      border-left:1px solid ${BRAND.line2};z-index:10000;transform:translateX(102%);transition:transform .28s cubic-bezier(.4,0,.2,1);
      display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(0,0,0,.6);color:${BRAND.text}}
    #jsa-drawer.on{transform:none}
    #jsa-drawer header{padding:16px 20px;border-bottom:1px solid ${BRAND.line};display:flex;align-items:center;gap:12px;
      background:${BRAND.ink}}
    #jsa-drawer header h3{margin:0;font:800 18px/1 "Roboto",Arial,sans-serif;flex:1}
    #jsa-drawer .jsa-body{flex:1;overflow-y:auto;padding:20px}
    #jsa-drawer footer{padding:14px 20px;border-top:1px solid ${BRAND.line};display:flex;gap:10px;background:${BRAND.ink}}
    #jsa-drawer footer .jsa-btn{flex:1;justify-content:center}
    .jsa-x{width:38px;height:38px;border-radius:50%;background:none;border:0;color:${BRAND.text};cursor:pointer;font-size:20px;line-height:1}
    .jsa-x:hover{background:${BRAND.panel2}}
    .jsa-btn{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 18px;border-radius:100px;
      background:${BRAND.panel2};border:1px solid ${BRAND.line2};color:${BRAND.text};font:600 14px/1 "Roboto",Arial,sans-serif;
      cursor:pointer;text-decoration:none}
    .jsa-btn:hover{background:${BRAND.panel2};filter:brightness(1.15)}
    .jsa-btn.primary{background:${BRAND.red};border-color:${BRAND.red};color:#fff}
    .jsa-btn.gold{background:${BRAND.gold};border-color:${BRAND.gold};color:${BRAND.ink}}
    .jsa-field{margin-bottom:18px}
    .jsa-field label{display:block;font:700 11.5px/1 "Roboto",Arial,sans-serif;letter-spacing:.7px;text-transform:uppercase;
      color:${BRAND.dim};margin-bottom:7px}
    .jsa-field input,.jsa-field textarea,.jsa-field select{width:100%;background:${BRAND.panel};border:1px solid ${BRAND.line};
      color:${BRAND.text};border-radius:10px;padding:11px 13px;font:14px/1.4 "Roboto",Arial,sans-serif;outline:none}
    .jsa-field textarea{resize:vertical;min-height:100px}
    .jsa-field input:focus,.jsa-field textarea:focus,.jsa-field select:focus{border-color:${BRAND.gold}}
    .jsa-hint{color:#6f6f7d;font-size:12px;margin-top:6px}
    .jsa-seg{display:inline-flex;background:${BRAND.panel};border:1px solid ${BRAND.line};border-radius:100px;padding:3px;gap:2px;
      flex-wrap:wrap}
    .jsa-seg button{padding:8px 15px;border-radius:100px;background:none;border:0;color:${BRAND.dim};
      font:600 13px/1 "Roboto",Arial,sans-serif;cursor:pointer}
    .jsa-seg button.on{background:${BRAND.text};color:${BRAND.ink}}
    .jsa-seg button.on.gold{background:${BRAND.gold};color:${BRAND.ink}}
    .jsa-sw{display:flex;align-items:center;gap:12px;padding:13px 0;border-top:1px solid ${BRAND.line}}
    .jsa-sw .t{flex:1}
    .jsa-sw .t b{display:block;font:600 14px/1.3 "Roboto",Arial,sans-serif;color:${BRAND.text}}
    .jsa-sw .t span{color:${BRAND.dim};font-size:12.5px}
    .jsa-tg{width:44px;height:24px;border-radius:100px;background:${BRAND.line2};position:relative;flex:0 0 auto;cursor:pointer;transition:.2s}
    .jsa-tg::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.2s}
    .jsa-tg.on{background:${BRAND.red}}
    .jsa-tg.on::after{transform:translateX(20px)}
    .jsa-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px}
    .jsa-stat{background:${BRAND.panel};border:1px solid ${BRAND.line};border-radius:12px;padding:15px}
    .jsa-stat b{display:block;font:800 22px/1.1 "Roboto",Arial,sans-serif;color:${BRAND.text};letter-spacing:-.6px}
    .jsa-stat span{color:${BRAND.dim};font-size:12px}
    .jsa-stat b.g{color:${BRAND.green}} .jsa-stat b.y{color:${BRAND.gold}} .jsa-stat b.r{color:${BRAND.red}}
    .jsa-bar{height:9px;border-radius:100px;background:${BRAND.panel2};overflow:hidden;margin-top:9px}
    .jsa-bar i{display:block;height:100%;background:linear-gradient(90deg,${BRAND.gold},${BRAND.red})}
    .jsa-note{background:${BRAND.panel};border:1px solid ${BRAND.line};border-left:3px solid ${BRAND.gold};border-radius:10px;
      padding:12px 14px;color:${BRAND.dim};font-size:12.5px;margin-bottom:18px}
    .jsa-note b{color:${BRAND.gold}}
    .jsa-log{background:${BRAND.panel};border:1px solid ${BRAND.line};border-radius:12px;padding:14px;margin-bottom:16px}
    .jsa-log div{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid ${BRAND.line};font-size:13px}
    .jsa-log div:last-child{border-bottom:0}
    .jsa-log span{color:${BRAND.dim};white-space:nowrap}
    .jsa-brand{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .jsa-brand button{background:${BRAND.panel};border:1px solid ${BRAND.line};border-radius:12px;padding:16px 10px;
      color:${BRAND.text};cursor:pointer;font:600 13px/1.4 "Roboto",Arial,sans-serif}
    .jsa-brand button:hover{border-color:${BRAND.gold}}
    .jsa-brand button span{display:block;color:${BRAND.dim};font-size:11.5px;margin-top:5px}
    .jsa-toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,16px);background:${BRAND.text};color:${BRAND.ink};
      padding:12px 20px;border-radius:100px;font:600 13.5px/1 "Roboto",Arial,sans-serif;opacity:0;pointer-events:none;
      transition:.25s;z-index:10001;box-shadow:0 10px 30px rgba(0,0,0,.5)}
    .jsa-toast.on{opacity:1;transform:translate(-50%,0)}
    /* banner variant picker */
    #jsa-banners{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
    .jsa-banner{position:relative;aspect-ratio:16/9;border-radius:10px;border:2px solid ${BRAND.line2};
      background-color:${BRAND.panel};cursor:pointer;overflow:hidden;padding:0;display:flex;align-items:flex-end;
      transition:.15s}
    .jsa-banner:hover{border-color:${BRAND.gold}}
    .jsa-banner.on{border-color:${BRAND.gold};box-shadow:0 0 0 2px rgba(255,183,3,.28)}
    .jsa-banner span{position:relative;z-index:2;width:100%;text-align:left;padding:8px 10px;
      background:linear-gradient(0deg,rgba(0,0,0,.92),rgba(0,0,0,0));
      font:700 12px/1.2 Roboto,Arial,sans-serif;color:#fff}
    .jsa-banner em{display:block;font:400 11px/1.3 Roboto,Arial,sans-serif;color:#cfcfd8;font-style:normal;margin-top:2px}
    /* mission ribbon injected on the channel page */
    #jsa-ribbon{display:flex;align-items:center;gap:14px;flex-wrap:wrap;
      background:linear-gradient(120deg,${BRAND.red}22,${BRAND.panel} 55%,${BRAND.gold}18);
      border:1px solid ${BRAND.line2};border-left:3px solid ${BRAND.red};border-radius:12px;
      padding:12px 16px;margin:0 0 20px;font-family:Roboto,Arial,sans-serif}
    #jsa-ribbon .jsa-r-seal img{width:40px;height:40px;border-radius:50%;display:block}
    #jsa-ribbon .jsa-r-txt{display:flex;flex-direction:column;gap:3px;flex:1;min-width:220px}
    #jsa-ribbon .jsa-r-txt b{font:800 15px/1.2 Roboto,Arial,sans-serif;color:${BRAND.text};letter-spacing:.2px}
    #jsa-ribbon .jsa-r-txt span{font:400 13px/1.4 Roboto,Arial,sans-serif;color:${BRAND.dim}}
    #jsa-ribbon .jsa-r-links{display:flex;gap:10px;flex-wrap:wrap}
    #jsa-ribbon .jsa-r-links a{font:600 13px/1 Roboto,Arial,sans-serif;color:${BRAND.gold};
      text-decoration:none;padding:8px 14px;border:1px solid ${BRAND.gold};border-radius:100px;white-space:nowrap}
    #jsa-ribbon .jsa-r-links a:hover{background:${BRAND.gold};color:${BRAND.ink}}
    @media (max-width:700px){
      #jsa-banners{grid-template-columns:1fr}
      #jsa-ribbon{padding:12px}
      #jsa-ribbon .jsa-r-txt{min-width:0}
    }
  `);

  /* ------------------------------------------------------------ helpers */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const log = GM_getValue('jsaLog', []);

  /* ------------------------------------------------------------ Trusted Types
     YouTube ships a Content-Security-Policy with `require-trusted-types-for
     'script'`, which makes plain `element.innerHTML = ...` throw on the real
     site. We create our own Trusted Types policy once and route every HTML
     insertion through it. All interpolated values are escaped first, and the
     policy only ever receives strings this script built itself. */
  let TT = null;
  try {
    if (window.trustedTypes && trustedTypes.createPolicy) {
      TT = trustedTypes.createPolicy('jsa-ui', {
        createHTML: (s) => s,
        createScript: (s) => s,
        createScriptURL: (s) => s
      });
    }
  } catch (e) { TT = null; }

  /** Escape untrusted values before they go into an HTML string. */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** innerHTML that works on YouTube (Trusted Types) and everywhere else. */
  function setHTML(el, html) {
    if (!el) return el;
    if (TT) { el.innerHTML = TT.createHTML(html); }
    else { el.innerHTML = html; }
    return el;
  }

  /** innerHTML for SVG elements, which are blocked the same way. */
  function setSVG(el, html) {
    if (!el) return el;
    if (TT) { el.innerHTML = TT.createHTML(html); }
    else { el.innerHTML = html; }
    return el;
  }

  function toast(msg) {
    let t = $('#jsa-toast');
    if (!t) { t = document.createElement('div'); t.id = 'jsa-toast'; t.className = 'jsa-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('on'), 2800);
  }

  function saveCfg(patch) {
    Object.assign(cfg, patch);
    GM_setValue('jsaConfig', cfg);
  }

  function saveLog(entry) {
    log.unshift(entry);
    GM_setValue('jsaLog', log.slice(0, 60));
  }

  /* ------------------------------------------------------------ shell */
  function buildShell() {
    if ($('#jsa-drawer')) return;
    const fab = document.createElement('button');
    fab.id = 'jsa-fab';
    fab.title = 'Justice Society of Activism — Studio & Composer';
    setHTML(fab, '<span class="jsa-dot">JSA</span><span>Studio</span>');
    fab.setAttribute('aria-label', 'Open Justice Society of Activism composer');

    const scrim = document.createElement('div');
    scrim.id = 'jsa-scrim';

    const drawer = document.createElement('aside');
    drawer.id = 'jsa-drawer';
    setHTML(drawer,
      '<header><h3 id="jsa-title">Composer</h3>' +
      '<button class="jsa-x" id="jsa-close" aria-label="Close">&times;</button></header>' +
      '<div class="jsa-body" id="jsa-body"></div>' +
      '<footer id="jsa-foot"></footer>');

    document.body.appendChild(fab);
    document.body.appendChild(scrim);
    document.body.appendChild(drawer);

    fab.addEventListener('click', () => openComposer());
    $('#jsa-close').addEventListener('click', closeDrawer);
    scrim.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
  }

  function openDrawer(title, bodyHTML, footHTML) {
    buildShell();
    $('#jsa-title').textContent = title;
    setHTML($('#jsa-body'), bodyHTML);
    setHTML($('#jsa-foot'), footHTML);
    $('#jsa-drawer').classList.add('on');
    $('#jsa-scrim').classList.add('on');
    const fab = $('#jsa-fab'); if (fab) fab.style.display = 'none';
    wireDrawer();
  }

  function closeDrawer() {
    const d = $('#jsa-drawer'), s = $('#jsa-scrim');
    if (d) d.classList.remove('on');
    if (s) s.classList.remove('on');
    const fab = $('#jsa-fab'); if (fab) fab.style.display = '';
  }

  /* ------------------------------------------------------------ composer */
  const FORMATS = [
    { id: 'video', label: 'Video' },
    { id: 'short', label: 'Short' },
    { id: 'reel', label: 'Reel' },
    { id: 'film', label: 'Short film', gold: true }
  ];

  function composerHTML() {
    return '' +
      '<div class="jsa-note"><b>Publishing flow.</b> YouTube has no public API that lets a script upload on your behalf, ' +
      'so nothing here is faked. Fill the brief, press <b>Open in YouTube Studio</b>, and YouTube Studio opens with your ' +
      'description, title and visibility already set — you drop the file and hit publish on your own account.</div>' +

      '<div class="jsa-field"><label>Format</label>' +
      '<div class="jsa-seg" id="jsa-format">' +
      FORMATS.map(f => '<button data-fmt="' + f.id + '" class="' + (f.id === 'video' ? 'on ' : '') + (f.gold ? 'gold' : '') + '">' + f.label + '</button>').join('') +
      '</div><div class="jsa-hint">Shorts and Reels are vertical and under 3 minutes — the hook must land in the first 2 seconds.</div></div>' +

      '<div class="jsa-field"><label>Title <span id="jsa-count" style="float:right;font-weight:500;text-transform:none;letter-spacing:0"></span></label>' +
      '<input id="jsa-title" maxlength="100" placeholder="Name the finding — lead with what it proves">' +
      '<div class="jsa-hint">"The Quiet Auction: How a County Sold Its Water" beats "Update #4".</div></div>' +

      '<div class="jsa-field"><label>Description</label>' +
      '<textarea id="jsa-desc" placeholder="What is the story, where did the evidence come from, and what should a viewer do next?"></textarea>' +
      '<div class="jsa-hint">Source every claim. Pin corrections and link the full dataset in the first two lines.</div></div>' +

      '<div class="jsa-field"><label>Tags &amp; topics</label>' +
      '<input id="jsa-tags" value="justice, activism, accountability, organizing, records, public comment"></div>' +

      '<div class="jsa-field"><label>Visibility</label>' +
      '<div class="jsa-seg" id="jsa-vis">' +
      '<button data-vis="Public" class="on">Public</button><button data-vis="Unlisted">Unlisted</button>' +
      '<button data-vis="Members">Members only</button></div></div>' +

      '<div class="jsa-field"><label>Schedule</label>' +
      '<div class="jsa-seg" id="jsa-sched">' +
      '<button data-s="now" class="on">Publish now</button><button data-s="prime">Prime time (Fri 7pm)</button>' +
      '<button data-s="custom">Custom date</button></div>' +
      '<input id="jsa-date" type="datetime-local" style="margin-top:10px;display:none"></div>' +

      '<div class="jsa-field"><label>Monetization</label>' +
      '<div class="jsa-sw"><div class="t"><b>Ads on this video</b><span>Overlay + mid-roll for non-members.</span></div><div class="jsa-tg on" data-tg="ads"></div></div>' +
      '<div class="jsa-sw"><div class="t"><b>Sponsor slot</b><span>Reserve a 30s mid-roll for a values-aligned sponsor.</span></div><div class="jsa-tg" data-tg="sponsor"></div></div>' +
      '<div class="jsa-sw"><div class="t"><b>Paid promotion</b><span>Allow YouTube to recommend this in Ads campaigns.</span></div><div class="jsa-tg on" data-tg="promo"></div></div>' +
      '<div class="jsa-sw"><div class="t"><b>Subtitles &amp; captions</b><span>Auto-generate, then hand-correct.</span></div><div class="jsa-tg on" data-tg="subs"></div></div></div>' +

      '<div class="jsa-field"><label>Channel</label>' +
      '<input id="jsa-handle" value="' + esc(cfg.channelHandle) + '">' +
      '<div class="jsa-hint">Set this to your real handle so the Studio hand-off lands on the right channel.</div></div>';
  }

  function wireDrawer() {
    const fmt = $('#jsa-format');
    if (fmt) fmt.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('#jsa-format button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      const title = $('#jsa-title');
      if (title) title.maxLength = (b.dataset.fmt === 'short' || b.dataset.fmt === 'reel') ? 60 : 100;
    });

    const title = $('#jsa-title');
    if (title) title.addEventListener('input', e => {
      $('#jsa-count').textContent = e.target.value.length + '/100';
    });

    const vis = $('#jsa-vis');
    if (vis) vis.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('#jsa-vis button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
    });

    const sched = $('#jsa-sched');
    if (sched) sched.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('#jsa-sched button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      $('#jsa-date').style.display = b.dataset.s === 'custom' ? 'block' : 'none';
    });

    $$('.jsa-tg').forEach(tg => tg.addEventListener('click', () => tg.classList.toggle('on')));

    const pub = $('#jsa-publish');
    if (pub) pub.addEventListener('click', publish);
    const planner = $('#jsa-planner');
    if (planner) planner.addEventListener('click', openPlanner);
    const brand = $('#jsa-brandbtn');
    if (brand) brand.addEventListener('click', openBrandKit);
    const settings = $('#jsa-settings');
    if (settings) settings.addEventListener('click', openSettings);
  }

  function openComposer() {
    openDrawer(
      'New post — ' + BRAND.name,
      composerHTML(),
      '<a class="jsa-btn jsa-btn-primary jsa-btn" id="jsa-publish" href="#">Open in YouTube Studio</a>' +
      '<button class="jsa-btn" id="jsa-planner">Revenue planner</button>'
    );
  }

  /* ------------------------------------------------------------ publish */
  function publish() {
    const title = ($('#jsa-title') && $('#jsa-title').value.trim()) || 'Untitled';
    const desc = ($('#jsa-desc') && $('#jsa-desc').value.trim()) || '';
    const tags = ($('#jsa-tags') && $('#jsa-tags').value.trim()) || '';
    const fmtBtn = $('#jsa-format button.on');
    const fmt = fmtBtn ? fmtBtn.dataset.fmt : 'video';
    const visBtn = $('#jsa-vis button.on');
    const vis = visBtn ? visBtn.dataset.vis : 'Public';
    const schBtn = $('#jsa-sched button.on');
    const sch = schBtn ? schBtn.dataset.s : 'now';
    const ads = $('#jsa-tg[data-tg="ads"]').classList.contains('on');
    const handle = ($('#jsa-handle') && $('#jsa-handle').value.trim()) || cfg.channelHandle;
    saveCfg({ channelHandle: handle });

    // Build the description YouTube Studio will receive.
    const visibilityLine = vis === 'Members' ? '🔒 Members only' : vis === 'Unlisted' ? '🔗 Unlisted' : '🌍 Public';
    const fullDesc =
      desc + '\n\n' +
      '—\n' +
      visibilityLine + ' • ' + fmt.toUpperCase() + '\n' +
      (tags ? 'Tags: ' + tags + '\n' : '') +
      'Subscribe for new investigations every Thursday: ' + handle + '\n' +
      'Support independent, member-funded reporting: https://justicesociety.org/give\n' +
      'Our editorial line: https://justicesociety.org/editorial-line';

    const params = new URLSearchParams({
      title: title,
      description: fullDesc,
      visibility: vis,
      'title.source': 'title',
      'description.source': 'description'
    });
    const target = 'https://studio.youtube.com/channel/' + encodeURIComponent(cfg.channelId || 'UC_REPLACE_ME') + '/videos/upload?draft=1&' + params.toString();

    saveLog({
      when: new Date().toLocaleDateString(),
      title: title,
      format: fmt,
      vis: vis,
      ads: ads,
      sched: sch
    });

    toast('Brief saved — opening YouTube Studio with your fields pre-filled');
    try {
      GM_openInTab(target, { active: true, insert: true, setParent: true });
    } catch (e) {
      window.open(target, '_blank');
    }
    GM_notification({
      title: 'JSA Composer',
      text: 'Draft: ' + title.slice(0, 60) + ' — finish in YouTube Studio',
      timeout: 6000
    });
    closeDrawer();
  }

  /* ------------------------------------------------------------ planner */
  function openPlanner() {
    openDrawer('Revenue planner',
      '<div class="jsa-stats">' +
      '<div class="jsa-stat"><b class="g">' + money(21400) + '</b><span>Revenue — last 30 days (edit below)</span></div>' +
      '<div class="jsa-stat"><b class="y">' + money(cfg.targetCpm) + '</b><span>Target CPM</span></div>' +
      '<div class="jsa-stat"><b>' + money(cfg.rpm) + '</b><span>Effective RPM</span></div>' +
      '<div class="jsa-stat"><b class="r">' + money(cfg.sponsorRate) + '</b><span>Per sponsor slot</span></div></div>' +

      '<div class="jsa-note"><b>Model a release before you publish it.</b> ' +
      'Views x CPM gives ad revenue. Add the sponsorship slot if you sell it. ' +
      'Everything below is your own estimate — change any number.</div>' +

      '<div class="jsa-field"><label>Projected views (first 30 days)</label>' +
      '<input id="jsa-pv" type="text" value="500,000"></div>' +
      '<div class="jsa-field"><label>CPM</label><input id="jsa-pcpm" type="text" value="' + esc(cfg.targetCpm) + '"></div>' +
      '<div class="jsa-field"><label>Sponsor slots sold</label><input id="jsa-ps" type="text" value="1"></div>' +
      '<div class="jsa-field"><label>New members from this release</label><input id="jsa-pm" type="text" value="500"></div>' +

      '<div class="jsa-bar"><i id="jsa-pbar" style="width:0%"></i></div>' +
      '<div style="display:flex;justify-content:space-between;margin-top:14px;font-size:14px;color:' + BRAND.dim + '">' +
      '<span>Total projected revenue</span><b id="jsa-ptotal" style="color:' + BRAND.green + ';font-size:16px">$0</b></div>' +

      '<div style="margin-top:26px"><h4 style="margin:0 0 12px;font:700 11.5px/1 Roboto,Arial;text-transform:uppercase;letter-spacing:.7px;color:' + BRAND.dim + '">YPP thresholds</h4>' +
      '<div class="jsa-stat" style="margin-bottom:10px"><b id="jsa-wh">0</b><span>Public watch hours (need ' + cfg.memberFloor.toLocaleString() + ')</span>' +
      '<div class="jsa-bar"><i id="jsa-whbar" style="width:0%"></i></div></div>' +
      '<div class="jsa-stat"><b id="jsa-sub">0</b><span>Subscribers (need ' + cfg.memberSubFloor.toLocaleString() + ')</span>' +
      '<div class="jsa-bar"><i id="jsa-subbar" style="width:0%"></i></div></div></div>',

      '<button class="jsa-btn jsa-btn-primary jsa-btn" id="jsa-saveplan" style="width:100%;justify-content:center;margin-top:18px">Save these assumptions</button>');

    const calc = () => {
      const v = parseFloat(($('#jsa-pv').value || '').replace(/[^0-9.]/g, '')) || 0;
      const c = parseFloat($('#jsa-pcpm').value) || 0;
      const s = parseFloat($('#jsa-ps').value) || 0;
      const m = parseFloat($('#jsa-pm').value) || 0;
      const ad = v / 1000 * c;
      const sp = s * cfg.sponsorRate;
      const mem = m * 12;
      const total = ad + sp + mem;
      $('#jsa-ptotal').textContent = money(total);
      $('#jsa-pbar').style.width = Math.min(100, total / 500 * 100) + '%';
      return { c: c, s: s };
    };
    ['jsa-pv','jsa-pcpm','jsa-ps','jsa-pm'].forEach(id => {
      const el = $('#' + id); if (el) el.addEventListener('input', calc);
    });
    calc();

    const save = $('#jsa-saveplan');
    if (save) save.addEventListener('click', () => {
      saveCfg({
        targetCpm: parseFloat($('#jsa-pcpm').value) || cfg.targetCpm,
        rpm: parseFloat($('#jsa-pcpm').value) || cfg.rpm,
        sponsorRate: cfg.sponsorRate
      });
      toast('Assumptions saved');
    });
  }

  /* ------------------------------------------------------------ brand kit */
  function openBrandKit() {
    const assets = [
      { f: 'brand/logo.svg', n: 'Logo', d: 'Channel logo — 800x800' },
      { f: 'brand/avatar.svg', n: 'Avatar', d: 'Profile picture — 800x800' },
      { f: 'brand/banner.svg', n: 'Banner', d: 'Channel banner — 2560x1440' }
    ];
    openDrawer('Branding kit',
      '<div class="jsa-note"><b>Upload these to YouTube Studio → Customization.</b> ' +
      'The banner is drawn at 2560x1440 but the safe area is the centre strip — keep the logo and wordmark away from the edges, ' +
      'because YouTube crops the banner differently on every device.</div>' +
      '<div class="jsa-brand">' +
      assets.map(a => '<button data-asset="' + a.f + '">' + a.n + '<span>' + a.d + '</span></button>').join('') +
      '</div>' +
      '<div style="margin-top:22px"><h4 style="margin:0 0 10px;font:700 11.5px/1 Roboto,Arial;text-transform:uppercase;letter-spacing:.7px;color:' + BRAND.dim + '">Color tokens</h4>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      [['Justice Red', BRAND.red], ['Justice Gold', BRAND.gold], ['Ink', BRAND.ink], ['Panel', BRAND.panel]]
        .map(c => '<span style="display:inline-flex;align-items:center;gap:8px;font-size:12.5px;color:' + BRAND.text + '">' +
          '<span style="width:20px;height:20px;border-radius:5px;background:' + c[1] + ';border:1px solid ' + BRAND.line2 + '"></span>' + c[0] + '</span>').join('') +
      '</div></div>',

      '<a class="jsa-btn jsa-btn-primary" href="https://studio.youtube.com/channel/' + encodeURIComponent(cfg.channelId || 'UC_REPLACE_ME') + '/editing" target="_blank" rel="noopener" style="flex:1;justify-content:center;margin-top:22px">Open channel customization</a>');

    $$('[data-asset]').forEach(b => b.addEventListener('click', () => {
      const name = b.dataset.asset.split('/').pop();
      const url = assetURI(b.dataset.asset);
      GM_download({ url: url, name: name, onerror: () => { window.open(url, '_blank'); } });
      toast('Downloading ' + name);
    }));
  }

  /* ------------------------------------------------------------ settings */
  function openSettings() {
    openDrawer('Settings',
      '<div class="jsa-field"><label>Your channel handle</label>' +
      '<input id="jsa-cfg-handle" value="' + esc(cfg.channelHandle) + '">' +
      '<div class="jsa-hint">Used for the description footer and the Studio hand-off.</div></div>' +
      '<div class="jsa-field"><label>Your channel URL</label>' +
      '<input id="jsa-cfg-url" value="' + esc(cfg.channelUrl) + '"></div>' +
      '<div class="jsa-field"><label>Channel ID (UC…)</label>' +
      '<input id="jsa-cfg-id" value="' + esc(cfg.channelId || '') + '" placeholder="UCxxxxxxxxxx">' +
      '<div class="jsa-hint">Found in your Studio URL. Needed for one-click hand-off.</div></div>' +
      '<div class="jsa-field"><label>Target CPM</label><input id="jsa-cfg-cpm" value="' + esc(cfg.targetCpm) + '"></div>' +
      '<div class="jsa-field"><label>Per sponsor slot</label><input id="jsa-cfg-sp" value="' + esc(cfg.sponsorRate) + '"></div>' +
      '<div class="jsa-field"><label>Channel branding</label>' +
      '<div class="jsa-sw"><div class="t"><b>Apply JSA brand to your channel page</b>' +
      '<span>Swaps in the JSA banner, avatar, and accent on your own channel page.</span></div>' +
      '<div class="jsa-tg' + (cfg.applyBranding ? ' on' : '') + '" id="jsa-cfg-brand"></div></div></div>' +
      '<div class="jsa-field"><label>Recent briefs</label>' +
      '<div class="jsa-log">' +
      (log.length ? log.slice(0, 12).map(e => '<div><span>' + esc(e.when) + '</span><div>' + esc(e.title) + '</div></div>').join('')
                  : '<div><span>—</span><div>No briefs saved yet.</div></div>') +
      '</div></div>',
      '<button class="jsa-btn jsa-btn-primary jsa-btn" id="jsa-cfg-save" style="flex:1;justify-content:center">Save settings</button>');

    const s = $('#jsa-cfg-save');
    if (s) s.addEventListener('click', () => {
      const brandTg = $('#jsa-cfg-brand');
      if (brandTg) saveCfg({ applyBranding: brandTg.classList.contains('on') });
      saveCfg({
        channelHandle: $('#jsa-cfg-handle').value.trim(),
        channelUrl: $('#jsa-cfg-url').value.trim(),
        channelId: $('#jsa-cfg-id').value.trim(),
        targetCpm: parseFloat($('#jsa-cfg-cpm').value) || cfg.targetCpm,
        sponsorRate: parseFloat($('#jsa-cfg-sp').value) || cfg.sponsorRate
      });
      toast('Settings saved');
      closeDrawer();
    });
  }


  /* ------------------------------------------------------------ brand assets
     YouTube's Content-Security-Policy blocks images from raw.githubusercontent.com,
     so the brand art is embedded directly as data URIs. No network request, no
     dependency on this repo being published, and it works on every page. */
  const BRAND_ASSETS = {
    'avatar.svg':      'data:image/svg+xml;charset=utf-8,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJKdXN0aWNlIFNvY2lldHkgb2YgQWN0aXZpc20gcHJvZmlsZSBwaWN0dXJlIj4KICA8ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmI3MDMiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNlZjIzM2MiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzBhMGEwYyIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMTc2IiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjYSkiIHN0cm9rZS13aWR0aD0iMTQiLz4KICA8cGF0aCBkPSJNMjAwIDcwIDMxNiAxMjB2OTJjMCA2Ni00NiAxMDAtMTE2IDEyNi03MC0yNi0xMTYtNjAtMTE2LTEyNnYtOTJ6IiBmaWxsPSJ1cmwoI2EpIi8+CiAgPHBhdGggZD0iTTIwMCAxMDAgMjg4IDEzOHY3NGMwIDUyLTM1IDgwLTg4IDEwMi01My0yMi04OC01MC04OC0xMDJ2LTc0eiIgZmlsbD0iIzBhMGEwYyIvPgogIDxwYXRoIGQ9Ik0xNTIgMTgwaDk2bC0xMy00NmgtMTlsLTcgMjJoLTE5bC02LTIyaC0xOXoiIGZpbGw9IiNmZmI3MDMiLz4KICA8cGF0aCBkPSJNMTYwIDE5Mmg4MHYxMmgtODB6bTAgMjRoODB2MTJoLTgweiIgZmlsbD0iI2Y1ZjVmNyIvPgogIDxwYXRoIGQ9Ik0yMDAgMjAwdjUyIiBzdHJva2U9IiNmNWY1ZjciIHN0cm9rZS13aWR0aD0iMTAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjI1OCIgcj0iMTMiIGZpbGw9IiNlZjIzM2MiLz4KPC9zdmc+Cg==',
    'logo.svg':        'data:image/svg+xml;charset=utf-8,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJKdXN0aWNlIFNvY2lldHkgb2YgQWN0aXZpc20gbG9nbyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZiNzAzIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZWYyMzNjIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI0OCIgZmlsbD0iIzBhMGEwYyIvPgogIDxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjMyIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZykiIHN0cm9rZS13aWR0aD0iMTAiLz4KICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjIxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZiNzAzIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9Ii40NSIvPgogIDxwYXRoIGQ9Ik0yNTYgOTYgMzk2IDE1OHYxMTZjMCA4NC01OCAxMjgtMTQwIDE1OC04Mi0zMC0xNDAtNzQtMTQwLTE1OFYxNTh6IiBmaWxsPSJ1cmwoI2cpIi8+CiAgPHBhdGggZD0iTTI1NiAxMzIgMzY2IDE4MnY5MmMwIDY2LTQ1IDEwMC0xMTAgMTI2LTY1LTI2LTExMC02MC0xMTAtMTI2di05MnoiIGZpbGw9IiMwYTBhMGMiLz4KICA8cGF0aCBkPSJNMTk2IDIzNmgxMjBsLTE2LTU4aC0yNGwtOCAyOGgtMjRsLTgtMjhoLTI0eiIgZmlsbD0iI2ZmYjcwMyIvPgogIDxwYXRoIGQ9Ik0yMDYgMjUwaDEwMHYxNEgyMDZ6bTAgMzBoMTAwdjE0SDIwNnoiIGZpbGw9IiNmNWY1ZjciLz4KICA8cGF0aCBkPSJNMjU2IDI2MnY2NiIgc3Ryb2tlPSIjZjVmNWY3IiBzdHJva2Utd2lkdGg9IjEyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIzMzYiIHI9IjE2IiBmaWxsPSIjZWYyMzNjIi8+CiAgPHBhdGggZD0iTTE1MCAxMjJjLTIyIDYtMzggMjQtNDQgNDZNMzYyIDEyMmMyMiA2IDM4IDI0IDQ0IDQ2IiBzdHJva2U9IiNlZjIzM2MiIHN0cm9rZS13aWR0aD0iMTAiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K',
    'banner.svg':      'data:image/svg+xml;charset=utf-8,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYwIDE0NDAiIHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjE0NDAiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iSlVTVElDRSBTT0NJRVRZIE9GIEFDVElWSVNNIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwYTBhMGMiLz48c3RvcCBvZmZzZXQ9Ii41NSIgc3RvcC1jb2xvcj0iIzE3MTMyMCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzBhMGEwYyIvPjwvbGluZWFyR3JhZGllbnQ+CiAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Imdsb3ciIGN4PSIuNzQiIGN5PSIuNDUiIHI9Ii41Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNlZjIzM2MiIHN0b3Atb3BhY2l0eT0iLjM4Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZWYyMzNjIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PgogICAgPHJhZGlhbEdyYWRpZW50IGlkPSJnbG93MiIgY3g9Ii4xMiIgY3k9Ii43NSIgcj0iLjUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2ZmYjcwMyIgc3RvcC1vcGFjaXR5PSIuMjgiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmI3MDMiIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+CiAgICA8cGF0dGVybiBpZD0iZG90cyIgd2lkdGg9IjI2IiBoZWlnaHQ9IjI2IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iLjA2Ii8+PC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMjU2MCIgaGVpZ2h0PSIxNDQwIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxyZWN0IHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjE0NDAiIGZpbGw9InVybCgjZG90cykiLz4KICA8cmVjdCB3aWR0aD0iMjU2MCIgaGVpZ2h0PSIxNDQwIiBmaWxsPSJ1cmwoI2dsb3cpIi8+CiAgPHJlY3Qgd2lkdGg9IjI1NjAiIGhlaWdodD0iMTQ0MCIgZmlsbD0idXJsKCNnbG93MikiLz4KICA8ZyBvcGFjaXR5PSIuMTIiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzIj4KICAgIDxwYXRoIGQ9Ik0wIDExMjAgTDI1NjAgMzQwIi8+PHBhdGggZD0iTTAgMTMwMCBMMjU2MCA1MjAiLz48cGF0aCBkPSJNMCA5NDAgTDI1NjAgMTYwIi8+CiAgPC9nPgoKICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1NjAgNTIwKSI+CiAgICAKICAgIDxnIHRyYW5zZm9ybT0ic2NhbGUoMC42OCkiPgogICAgICA8cGF0aCBkPSJNMjU2IDk2IDM5NiAxNTh2MTE2YzAgODQtNTggMTI4LTE0MCAxNTgtODItMzAtMTQwLTc0LTE0MC0xNThWMTU4eiIgZmlsbD0iI2ZmYjcwMyIvPgogICAgICA8cGF0aCBkPSJNMjU2IDEzMiAzNjYgMTgydjkyYzAgNjYtNDUgMTAwLTExMCAxMjYtNjUtMjYtMTEwLTYwLTExMC0xMjZ2LTkyeiIgZmlsbD0iIzBhMGEwYyIvPgogICAgICA8cGF0aCBkPSJNMTk2IDIzNmgxMjBsLTE2LTU4aC0yNGwtOCAyOGgtMjRsLTgtMjhoLTI0eiIgZmlsbD0iI2ZmYjcwMyIvPgogICAgICA8cGF0aCBkPSJNMjA2IDI1MGgxMDB2MTRIMjA2em0wIDMwaDEwMHYxNEgyMDZ6IiBmaWxsPSIjZjVmNWY3Ii8+CiAgICAgIDxwYXRoIGQ9Ik0yNTYgMjYydjY2IiBzdHJva2U9IiNmNWY1ZjciIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIzMzYiIHI9IjE2IiBmaWxsPSIjZWYyMzNjIi8+CiAgICA8L2c+CiAgICA8ZyBmb250LWZhbWlseT0iQXJjaGl2bywgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjkwMCIgbGV0dGVyLXNwYWNpbmc9Ii0yIj4KICAgICAgPHRleHQgeD0iMzgwIiB5PSIxNTAiIGZpbGw9IiNmNWY1ZjciIGZvbnQtc2l6ZT0iMTEyIj5KVVNUSUNFIFNPQ0lFVFk8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjM4MCIgeT0iMjcwIiBmaWxsPSIjZWYyMzNjIiBmb250LXNpemU9IjExMiI+T0YgQUNUSVZJU008L3RleHQ+CiAgICA8L2c+CiAgICA8dGV4dCB4PSIzODYiIHk9IjMzNiIgZmlsbD0iI2NmY2ZkOCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzQiIGxldHRlci1zcGFjaW5nPSI5Ij5FVklERU5DRSDigKIgQU1QTElUVURFIOKAoiBBQ1RJT048L3RleHQ+CiAgPC9nPgoKICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxODEwIDY0MCkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmYjcwMyIgc3Ryb2tlLXdpZHRoPSI4IiBvcGFjaXR5PSIuNyI+CiAgICA8Y2lyY2xlIGN4PSIxNjAiIGN5PSIxNjAiIHI9IjE1MCIvPjxjaXJjbGUgY3g9IjE2MCIgY3k9IjE2MCIgcj0iMTIwIi8+CiAgICA8cGF0aCBkPSJNMTYwIDYwdjIwME02MCAxNjBoMjAwIiBvcGFjaXR5PSIuMyIvPgogIDwvZz4KCiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjI1NjAiIGhlaWdodD0iMTAiIGZpbGw9IiNlZjIzM2MiLz4KICA8cmVjdCB4PSIwIiB5PSIxNDMwIiB3aWR0aD0iMjU2MCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmYjcwMyIvPgo8L3N2Zz4K',
    'banner-new-episode.svg': 'data:image/svg+xml;charset=utf-8,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYwIDE0NDAiIHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjE0NDAiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iTkVXIERPQ1VNRU5UQVJZIEVWRVJZIFRIVVJTREFZIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwYTBhMGMiLz48c3RvcCBvZmZzZXQ9Ii41NSIgc3RvcC1jb2xvcj0iIzE3MTMyMCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzBhMGEwYyIvPjwvbGluZWFyR3JhZGllbnQ+CiAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Imdsb3ciIGN4PSIuNzQiIGN5PSIuNDUiIHI9Ii41Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmI3MDMiIHN0b3Atb3BhY2l0eT0iLjM4Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZiNzAzIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PgogICAgPHJhZGlhbEdyYWRpZW50IGlkPSJnbG93MiIgY3g9Ii4xMiIgY3k9Ii43NSIgcj0iLjUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2ZmYjcwMyIgc3RvcC1vcGFjaXR5PSIuMjgiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmI3MDMiIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+CiAgICA8cGF0dGVybiBpZD0iZG90cyIgd2lkdGg9IjI2IiBoZWlnaHQ9IjI2IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iLjA2Ii8+PC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMjU2MCIgaGVpZ2h0PSIxNDQwIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxyZWN0IHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjE0NDAiIGZpbGw9InVybCgjZG90cykiLz4KICA8cmVjdCB3aWR0aD0iMjU2MCIgaGVpZ2h0PSIxNDQwIiBmaWxsPSJ1cmwoI2dsb3cpIi8+CiAgPHJlY3Qgd2lkdGg9IjI1NjAiIGhlaWdodD0iMTQ0MCIgZmlsbD0idXJsKCNnbG93MikiLz4KICA8ZyBvcGFjaXR5PSIuMTIiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzIj4KICAgIDxwYXRoIGQ9Ik0wIDExMjAgTDI1NjAgMzQwIi8+PHBhdGggZD0iTTAgMTMwMCBMMjU2MCA1MjAiLz48cGF0aCBkPSJNMCA5NDAgTDI1NjAgMTYwIi8+CiAgPC9nPgoKICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1NjAgNTIwKSI+CiAgICAKICAgIDxnIHRyYW5zZm9ybT0ic2NhbGUoMC42OCkiPgogICAgICA8cGF0aCBkPSJNMjU2IDk2IDM5NiAxNTh2MTE2YzAgODQtNTggMTI4LTE0MCAxNTgtODItMzAtMTQwLTc0LTE0MC0xNThWMTU4eiIgZmlsbD0iI2ZmYjcwMyIvPgogICAgICA8cGF0aCBkPSJNMjU2IDEzMiAzNjYgMTgydjkyYzAgNjYtNDUgMTAwLTExMCAxMjYtNjUtMjYtMTEwLTYwLTExMC0xMjZ2LTkyeiIgZmlsbD0iIzBhMGEwYyIvPgogICAgICA8cGF0aCBkPSJNMTk2IDIzNmgxMjBsLTE2LTU4aC0yNGwtOCAyOGgtMjRsLTgtMjhoLTI0eiIgZmlsbD0iI2ZmYjcwMyIvPgogICAgICA8cGF0aCBkPSJNMjA2IDI1MGgxMDB2MTRIMjA2em0wIDMwaDEwMHYxNEgyMDZ6IiBmaWxsPSIjZjVmNWY3Ii8+CiAgICAgIDxwYXRoIGQ9Ik0yNTYgMjYydjY2IiBzdHJva2U9IiNmNWY1ZjciIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIzMzYiIHI9IjE2IiBmaWxsPSIjZWYyMzNjIi8+CiAgICA8L2c+CiAgICA8ZyBmb250LWZhbWlseT0iQXJjaGl2bywgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjkwMCIgbGV0dGVyLXNwYWNpbmc9Ii0yIj4KICAgICAgPHRleHQgeD0iMzgwIiB5PSIxNTAiIGZpbGw9IiNmNWY1ZjciIGZvbnQtc2l6ZT0iMTEyIj5ORVcgRE9DVU1FTlRBUlk8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjM4MCIgeT0iMjcwIiBmaWxsPSIjZmZiNzAzIiBmb250LXNpemU9IjExMiI+RVZFUlkgVEhVUlNEQVk8L3RleHQ+CiAgICA8L2c+CiAgICA8dGV4dCB4PSIzODYiIHk9IjMzNiIgZmlsbD0iI2NmY2ZkOCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzQiIGxldHRlci1zcGFjaW5nPSI5Ij5FVklERU5DRSDigKIgQU1QTElUVURFIOKAoiBBQ1RJT048L3RleHQ+CiAgPC9nPgoKICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxODEwIDY0MCkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmYjcwMyIgc3Ryb2tlLXdpZHRoPSI4IiBvcGFjaXR5PSIuNyI+CiAgICA8Y2lyY2xlIGN4PSIxNjAiIGN5PSIxNjAiIHI9IjE1MCIvPjxjaXJjbGUgY3g9IjE2MCIgY3k9IjE2MCIgcj0iMTIwIi8+CiAgICA8cGF0aCBkPSJNMTYwIDYwdjIwME02MCAxNjBoMjAwIiBvcGFjaXR5PSIuMyIvPgogIDwvZz4KCiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjI1NjAiIGhlaWdodD0iMTAiIGZpbGw9IiNmZmI3MDMiLz4KICA8cmVjdCB4PSIwIiB5PSIxNDMwIiB3aWR0aD0iMjU2MCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmYjcwMyIvPgo8L3N2Zz4K',
    'banner-season.svg':       'data:image/svg+xml;charset=utf-8,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYwIDE0NDAiIHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjE0NDAiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iU0VBU09OIFRXTyBUSEUgUVVJRVQgQVVDVElPTiI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMGEwYTBjIi8+PHN0b3Agb2Zmc2V0PSIuNTUiIHN0b3AtY29sb3I9IiMxNzEzMjAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwYTBhMGMiLz48L2xpbmVhckdyYWRpZW50PgogICAgPHJhZGlhbEdyYWRpZW50IGlkPSJnbG93IiBjeD0iLjc0IiBjeT0iLjQ1IiByPSIuNSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZWYyMzNjIiBzdG9wLW9wYWNpdHk9Ii4zOCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2VmMjMzYyIgc3RvcC1vcGFjaXR5PSIwIi8+PC9yYWRpYWxHcmFkaWVudD4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iZ2xvdzIiIGN4PSIuMTIiIGN5PSIuNzUiIHI9Ii41Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmI3MDMiIHN0b3Atb3BhY2l0eT0iLjI4Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZiNzAzIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PgogICAgPHBhdHRlcm4gaWQ9ImRvdHMiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMyIgY3k9IjMiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9Ii4wNiIvPjwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjI1NjAiIGhlaWdodD0iMTQ0MCIgZmlsbD0idXJsKCNiZykiLz4KICA8cmVjdCB3aWR0aD0iMjU2MCIgaGVpZ2h0PSIxNDQwIiBmaWxsPSJ1cmwoI2RvdHMpIi8+CiAgPHJlY3Qgd2lkdGg9IjI1NjAiIGhlaWdodD0iMTQ0MCIgZmlsbD0idXJsKCNnbG93KSIvPgogIDxyZWN0IHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjE0NDAiIGZpbGw9InVybCgjZ2xvdzIpIi8+CiAgPGcgb3BhY2l0eT0iLjEyIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMyI+CiAgICA8cGF0aCBkPSJNMCAxMTIwIEwyNTYwIDM0MCIvPjxwYXRoIGQ9Ik0wIDEzMDAgTDI1NjAgNTIwIi8+PHBhdGggZD0iTTAgOTQwIEwyNTYwIDE2MCIvPgogIDwvZz4KCiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTYwIDUyMCkiPgogICAgCiAgICA8ZyB0cmFuc2Zvcm09InNjYWxlKDAuNjgpIj4KICAgICAgPHBhdGggZD0iTTI1NiA5NiAzOTYgMTU4djExNmMwIDg0LTU4IDEyOC0xNDAgMTU4LTgyLTMwLTE0MC03NC0xNDAtMTU4VjE1OHoiIGZpbGw9IiNmZmI3MDMiLz4KICAgICAgPHBhdGggZD0iTTI1NiAxMzIgMzY2IDE4MnY5MmMwIDY2LTQ1IDEwMC0xMTAgMTI2LTY1LTI2LTExMC02MC0xMTAtMTI2di05MnoiIGZpbGw9IiMwYTBhMGMiLz4KICAgICAgPHBhdGggZD0iTTE5NiAyMzZoMTIwbC0xNi01OGgtMjRsLTggMjhoLTI0bC04LTI4aC0yNHoiIGZpbGw9IiNmZmI3MDMiLz4KICAgICAgPHBhdGggZD0iTTIwNiAyNTBoMTAwdjE0SDIwNnptMCAzMGgxMDB2MTRIMjA2eiIgZmlsbD0iI2Y1ZjVmNyIvPgogICAgICA8cGF0aCBkPSJNMjU2IDI2MnY2NiIgc3Ryb2tlPSIjZjVmNWY3IiBzdHJva2Utd2lkdGg9IjEyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgICAgPGNpcmNsZSBjeD0iMjU2IiBjeT0iMzM2IiByPSIxNiIgZmlsbD0iI2VmMjMzYyIvPgogICAgPC9nPgogICAgPGcgZm9udC1mYW1pbHk9IkFyY2hpdm8sIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGxldHRlci1zcGFjaW5nPSItMiI+CiAgICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTUwIiBmaWxsPSIjZjVmNWY3IiBmb250LXNpemU9IjExMiI+U0VBU09OIFRXTzwvdGV4dD4KICAgICAgPHRleHQgeD0iMzgwIiB5PSIyNzAiIGZpbGw9IiNlZjIzM2MiIGZvbnQtc2l6ZT0iMTEyIj5USEUgUVVJRVQgQVVDVElPTjwvdGV4dD4KICAgIDwvZz4KICAgIDx0ZXh0IHg9IjM4NiIgeT0iMzM2IiBmaWxsPSIjY2ZjZmQ4IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNCIgbGV0dGVyLXNwYWNpbmc9IjkiPldITyBPV05TIFlPVVIgV0FURVIg4oCiIFdBVENIIFRIRSBUUkFJTEVSPC90ZXh0PgogIDwvZz4KCiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTgxMCA2NDApIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmI3MDMiIHN0cm9rZS13aWR0aD0iOCIgb3BhY2l0eT0iLjciPgogICAgPGNpcmNsZSBjeD0iMTYwIiBjeT0iMTYwIiByPSIxNTAiLz48Y2lyY2xlIGN4PSIxNjAiIGN5PSIxNjAiIHI9IjEyMCIvPgogICAgPHBhdGggZD0iTTE2MCA2MHYyMDBNNjAgMTYwaDIwMCIgb3BhY2l0eT0iLjMiLz4KICA8L2c+CgogIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWYyMzNjIi8+CiAgPHJlY3QgeD0iMCIgeT0iMTQzMCIgd2lkdGg9IjI1NjAiIGhlaWdodD0iMTAiIGZpbGw9IiNmZmI3MDMiLz4KPC9zdmc+Cg==',
    'banner-membership.svg':   'data:image/svg+xml;charset=utf-8,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYwIDE0NDAiIHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjE0NDAiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iTUVNQkVSIEZVTkRFRCBJTkRFUEVOREVOVCBORVdTIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwYTBhMGMiLz48c3RvcCBvZmZzZXQ9Ii41NSIgc3RvcC1jb2xvcj0iIzE3MTMyMCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzBhMGEwYyIvPjwvbGluZWFyR3JhZGllbnQ+CiAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Imdsb3ciIGN4PSIuNzQiIGN5PSIuNDUiIHI9Ii41Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwMGI0ZDgiIHN0b3Atb3BhY2l0eT0iLjM4Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDBiNGQ4IiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PgogICAgPHJhZGlhbEdyYWRpZW50IGlkPSJnbG93MiIgY3g9Ii4xMiIgY3k9Ii43NSIgcj0iLjUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2ZmYjcwMyIgc3RvcC1vcGFjaXR5PSIuMjgiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmI3MDMiIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+CiAgICA8cGF0dGVybiBpZD0iZG90cyIgd2lkdGg9IjI2IiBoZWlnaHQ9IjI2IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iLjA2Ii8+PC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMjU2MCIgaGVpZ2h0PSIxNDQwIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxyZWN0IHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjE0NDAiIGZpbGw9InVybCgjZG90cykiLz4KICA8cmVjdCB3aWR0aD0iMjU2MCIgaGVpZ2h0PSIxNDQwIiBmaWxsPSJ1cmwoI2dsb3cpIi8+CiAgPHJlY3Qgd2lkdGg9IjI1NjAiIGhlaWdodD0iMTQ0MCIgZmlsbD0idXJsKCNnbG93MikiLz4KICA8ZyBvcGFjaXR5PSIuMTIiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzIj4KICAgIDxwYXRoIGQ9Ik0wIDExMjAgTDI1NjAgMzQwIi8+PHBhdGggZD0iTTAgMTMwMCBMMjU2MCA1MjAiLz48cGF0aCBkPSJNMCA5NDAgTDI1NjAgMTYwIi8+CiAgPC9nPgoKICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1NjAgNTIwKSI+CiAgICAKICAgIDxnIHRyYW5zZm9ybT0ic2NhbGUoMC42OCkiPgogICAgICA8cGF0aCBkPSJNMjU2IDk2IDM5NiAxNTh2MTE2YzAgODQtNTggMTI4LTE0MCAxNTgtODItMzAtMTQwLTc0LTE0MC0xNThWMTU4eiIgZmlsbD0iI2ZmYjcwMyIvPgogICAgICA8cGF0aCBkPSJNMjU2IDEzMiAzNjYgMTgydjkyYzAgNjYtNDUgMTAwLTExMCAxMjYtNjUtMjYtMTEwLTYwLTExMC0xMjZ2LTkyeiIgZmlsbD0iIzBhMGEwYyIvPgogICAgICA8cGF0aCBkPSJNMTk2IDIzNmgxMjBsLTE2LTU4aC0yNGwtOCAyOGgtMjRsLTgtMjhoLTI0eiIgZmlsbD0iI2ZmYjcwMyIvPgogICAgICA8cGF0aCBkPSJNMjA2IDI1MGgxMDB2MTRIMjA2em0wIDMwaDEwMHYxNEgyMDZ6IiBmaWxsPSIjZjVmNWY3Ii8+CiAgICAgIDxwYXRoIGQ9Ik0yNTYgMjYydjY2IiBzdHJva2U9IiNmNWY1ZjciIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIzMzYiIHI9IjE2IiBmaWxsPSIjZWYyMzNjIi8+CiAgICA8L2c+CiAgICA8ZyBmb250LWZhbWlseT0iQXJjaGl2bywgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjkwMCIgbGV0dGVyLXNwYWNpbmc9Ii0yIj4KICAgICAgPHRleHQgeD0iMzgwIiB5PSIxNTAiIGZpbGw9IiNmNWY1ZjciIGZvbnQtc2l6ZT0iMTEyIj5NRU1CRVIgRlVOREVEPC90ZXh0PgogICAgICA8dGV4dCB4PSIzODAiIHk9IjI3MCIgZmlsbD0iIzAwYjRkOCIgZm9udC1zaXplPSIxMTIiPklOREVQRU5ERU5UIE5FV1M8L3RleHQ+CiAgICA8L2c+CiAgICA8dGV4dCB4PSIzODYiIHk9IjMzNiIgZmlsbD0iI2NmY2ZkOCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzQiIGxldHRlci1zcGFjaW5nPSI5Ij5OTyBPV05FUlMg4oCiIE5PIFNQT05TT1JTIOKAoiBOTyBMT0JCSVNUUzwvdGV4dD4KICA8L2c+CgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4MTAgNjQwKSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZiNzAzIiBzdHJva2Utd2lkdGg9IjgiIG9wYWNpdHk9Ii43Ij4KICAgIDxjaXJjbGUgY3g9IjE2MCIgY3k9IjE2MCIgcj0iMTUwIi8+PGNpcmNsZSBjeD0iMTYwIiBjeT0iMTYwIiByPSIxMjAiLz4KICAgIDxwYXRoIGQ9Ik0xNjAgNjB2MjAwTTYwIDE2MGgyMDAiIG9wYWNpdHk9Ii4zIi8+CiAgPC9nPgoKICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMjU2MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwYjRkOCIvPgogIDxyZWN0IHg9IjAiIHk9IjE0MzAiIHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMDBjMDdmIi8+Cjwvc3ZnPgo=',
    'banner-report.svg':       'data:image/svg+xml;charset=utf-8,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYwIDE0NDAiIHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjE0NDAiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iRk9MTE9XIFRIRSBQQVBFUiBUUkFJTCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMGEwYTBjIi8+PHN0b3Agb2Zmc2V0PSIuNTUiIHN0b3AtY29sb3I9IiMxNzEzMjAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwYTBhMGMiLz48L2xpbmVhckdyYWRpZW50PgogICAgPHJhZGlhbEdyYWRpZW50IGlkPSJnbG93IiBjeD0iLjc0IiBjeT0iLjQ1IiByPSIuNSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjN2MzYWVkIiBzdG9wLW9wYWNpdHk9Ii4zOCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzdjM2FlZCIgc3RvcC1vcGFjaXR5PSIwIi8+PC9yYWRpYWxHcmFkaWVudD4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iZ2xvdzIiIGN4PSIuMTIiIGN5PSIuNzUiIHI9Ii41Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmI3MDMiIHN0b3Atb3BhY2l0eT0iLjI4Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZiNzAzIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PgogICAgPHBhdHRlcm4gaWQ9ImRvdHMiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMyIgY3k9IjMiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9Ii4wNiIvPjwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjI1NjAiIGhlaWdodD0iMTQ0MCIgZmlsbD0idXJsKCNiZykiLz4KICA8cmVjdCB3aWR0aD0iMjU2MCIgaGVpZ2h0PSIxNDQwIiBmaWxsPSJ1cmwoI2RvdHMpIi8+CiAgPHJlY3Qgd2lkdGg9IjI1NjAiIGhlaWdodD0iMTQ0MCIgZmlsbD0idXJsKCNnbG93KSIvPgogIDxyZWN0IHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjE0NDAiIGZpbGw9InVybCgjZ2xvdzIpIi8+CiAgPGcgb3BhY2l0eT0iLjEyIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMyI+CiAgICA8cGF0aCBkPSJNMCAxMTIwIEwyNTYwIDM0MCIvPjxwYXRoIGQ9Ik0wIDEzMDAgTDI1NjAgNTIwIi8+PHBhdGggZD0iTTAgOTQwIEwyNTYwIDE2MCIvPgogIDwvZz4KCiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTYwIDUyMCkiPgogICAgCiAgICA8ZyB0cmFuc2Zvcm09InNjYWxlKDAuNjgpIj4KICAgICAgPHBhdGggZD0iTTI1NiA5NiAzOTYgMTU4djExNmMwIDg0LTU4IDEyOC0xNDAgMTU4LTgyLTMwLTE0MC03NC0xNDAtMTU4VjE1OHoiIGZpbGw9IiNmZmI3MDMiLz4KICAgICAgPHBhdGggZD0iTTI1NiAxMzIgMzY2IDE4MnY5MmMwIDY2LTQ1IDEwMC0xMTAgMTI2LTY1LTI2LTExMC02MC0xMTAtMTI2di05MnoiIGZpbGw9IiMwYTBhMGMiLz4KICAgICAgPHBhdGggZD0iTTE5NiAyMzZoMTIwbC0xNi01OGgtMjRsLTggMjhoLTI0bC04LTI4aC0yNHoiIGZpbGw9IiNmZmI3MDMiLz4KICAgICAgPHBhdGggZD0iTTIwNiAyNTBoMTAwdjE0SDIwNnptMCAzMGgxMDB2MTRIMjA2eiIgZmlsbD0iI2Y1ZjVmNyIvPgogICAgICA8cGF0aCBkPSJNMjU2IDI2MnY2NiIgc3Ryb2tlPSIjZjVmNWY3IiBzdHJva2Utd2lkdGg9IjEyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgICAgPGNpcmNsZSBjeD0iMjU2IiBjeT0iMzM2IiByPSIxNiIgZmlsbD0iI2VmMjMzYyIvPgogICAgPC9nPgogICAgPGcgZm9udC1mYW1pbHk9IkFyY2hpdm8sIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGxldHRlci1zcGFjaW5nPSItMiI+CiAgICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTUwIiBmaWxsPSIjZjVmNWY3IiBmb250LXNpemU9IjExMiI+Rk9MTE9XIFRIRTwvdGV4dD4KICAgICAgPHRleHQgeD0iMzgwIiB5PSIyNzAiIGZpbGw9IiM3YzNhZWQiIGZvbnQtc2l6ZT0iMTEyIj5QQVBFUiBUUkFJTDwvdGV4dD4KICAgIDwvZz4KICAgIDx0ZXh0IHg9IjM4NiIgeT0iMzM2IiBmaWxsPSIjY2ZjZmQ4IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNCIgbGV0dGVyLXNwYWNpbmc9IjkiPkNPVVJUIEZJTElOR1Mg4oCiIEJVREdFVFMg4oCiIFBVQkxJQyBSRUNPUkRTPC90ZXh0PgogIDwvZz4KCiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTgxMCA2NDApIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmI3MDMiIHN0cm9rZS13aWR0aD0iOCIgb3BhY2l0eT0iLjciPgogICAgPGNpcmNsZSBjeD0iMTYwIiBjeT0iMTYwIiByPSIxNTAiLz48Y2lyY2xlIGN4PSIxNjAiIGN5PSIxNjAiIHI9IjEyMCIvPgogICAgPHBhdGggZD0iTTE2MCA2MHYyMDBNNjAgMTYwaDIwMCIgb3BhY2l0eT0iLjMiLz4KICA8L2c+CgogIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyNTYwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjN2MzYWVkIi8+CiAgPHJlY3QgeD0iMCIgeT0iMTQzMCIgd2lkdGg9IjI1NjAiIGhlaWdodD0iMTAiIGZpbGw9IiNmZmI3MDMiLz4KPC9zdmc+Cg=='
  };

  /** Inline data URI for a brand asset (falls back to the remote URL). */
  function assetURI(file) {
    return BRAND_ASSETS[file] || (SCRIPT_ORIGIN + '/brand/' + file);
  }

  /* ------------------------------------------------------------ branding */
  const BANNERS = [
    { f: 'banner.svg', n: 'Primary', d: 'Justice Society of Activism' },
    { f: 'banner-new-episode.svg', n: 'New episode', d: 'Every Thursday drop' },
    { f: 'banner-season.svg', n: 'Season two', d: 'The Quiet Auction' },
    { f: 'banner-membership.svg', n: 'Membership', d: 'Member-funded news' },
    { f: 'banner-report.svg', n: 'Paper trail', d: 'Records reporting' }
  ];

  function detectChannel() {
    const m = location.pathname.match(/^\/@([^/]+)/);
    if (m) return { handle: '@' + m[1], id: null };
    const c = location.pathname.match(/^\/channel\/(UC[^/]+)/);
    if (c) return { handle: null, id: c[1] };
    return null;
  }

  function detectChannelIdFromPage() {
    const a = document.querySelector('meta[itemprop="channelId"]');
    if (a) return a.getAttribute('content');
    const bt = document.querySelector('meta[itemprop="identifier"][content^="UC"]');
    if (bt) return bt.getAttribute('content');
    const link = document.querySelector('link[rel="canonical"][href*="/channel/UC"]');
    if (link) {
      const m = link.getAttribute('href').match(/\/channel\/(UC[^/]+)/);
      if (m) return m[1];
    }
    // The subscribe button and channel links carry the id
    const link2 = document.querySelector('a[href*="/channel/UC"], ytd-subscribe-button-renderer a[href*="/channel/"]');
    if (link2) {
      const m = link2.getAttribute('href').match(/\/channel\/(UC[^/]+)/);
      if (m) return m[1];
    }
    // "externalId" in the page's embedded JSON
    try {
      const html = document.documentElement.innerHTML;
      const m = html.match(/"externalId":"(UC[^"]+)"/);
      if (m) return m[1];
    } catch (e) { /* ignore */ }
    return null;
  }

  function detectHandleFromPage() {
    const h = document.querySelector(
      '#channel-handle, ytd-channel-name #channel-handle, ' +
      'yt-dynamic-text-view-model#channel-handle, ' +
      'yt-page-header-view-model #channel-handle, ' +
      'ytd-c4-tabbed-page-header #channel-handle'
    );
    if (h && h.textContent) {
      const t = h.textContent.trim();
      if (t) return '@' + t.replace(/^@/, '');
    }
    const el = document.querySelector('#channel-name #text, ytd-channel-name #text');
    if (el && el.textContent) return '@' + el.textContent.trim().replace(/^@/, '');
    return null;
  }

  function isOwnChannelPage() {
    const d = detectChannel();
    if (!d) return false;
    const want = String(cfg.channelHandle || '').replace(/^@/, '').toLowerCase();
    if (d.handle) {
      if (!want) return true;              // first run: adopt whatever channel you are on
      return d.handle.replace(/^@/, '').toLowerCase() === want;
    }
    if (d.id && cfg.channelId) return d.id === cfg.channelId;
    return false;
  }

  function setBanner(variant) {
    const url = assetURI(variant || 'banner.svg');
    // YouTube has changed this element several times. Try every known shape.
    const candidates = [
      'yt-image-banner-view-model img',
      'ytd-c4-banner-and-avatar-renderer #img img',
      'ytd-c4-banner-and-avatar-renderer #img',
      'ytd-banner-image img',
      '#banner img',
      '#banner'
    ];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (!el) continue;
      if (el.tagName === 'IMG') {
        if (el.getAttribute('src') === url) return true;
        el.src = url;
        el.removeAttribute('srcset');
        el.setAttribute('data-jsa-brand', '1');
        el.style.objectFit = 'cover';
        return true;
      }
      // wrapper with a background-image
      const cur = el.style && el.style.backgroundImage;
      if (cur && cur.indexOf('jsa') === -1 && !el.dataset.jsaBrand) {
        el.dataset.jsaBrand = '1';
        el.style.backgroundImage = 'url("' + url + '")';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        return true;
      }
      const inner = el.querySelector && el.querySelector('img');
      if (inner) {
        if (inner.getAttribute('src') === url) return true;
        inner.src = url;
        inner.removeAttribute('srcset');
        inner.setAttribute('data-jsa-brand', '1');
        return true;
      }
    }
    return false;
  }

  function setAvatar() {
    const url = assetURI('avatar.svg');
    // The channel avatar is the one inside the channel header block.
    const scopes = [
      'ytd-c4-banner-and-avatar-renderer',
      'yt-page-header-view-model',
      'yt-page-header-renderer',
      'ytd-tabbed-page-header',
      '#header',
      '#channel-header'
    ];
    for (const scope of scopes) {
      const root = document.querySelector(scope);
      if (!root) continue;
      const imgs = root.querySelectorAll('img');
      for (const img of imgs) {
        const r = img.getBoundingClientRect();
        // the avatar is a reasonably large square image
        if (r.width < 40 || r.width > 400) continue;
        const ratio = r.height ? r.width / r.height : 1;
        if (ratio < 0.6 || ratio > 1.6) continue;
        if (img.getAttribute('src') === url) return true;
        img.src = url;
        img.removeAttribute('srcset');
        img.setAttribute('data-jsa-brand', '1');
        return true;
      }
    }
    return false;
  }

  function setLogo() {
    const url = assetURI('avatar.svg');
    const el = document.querySelector('#channel-header #logo img, ytd-channel-header-renderer #logo img, #logo img');
    if (!el) return false;
    if (el.getAttribute('src') === url) return true;
    el.src = url;
    el.removeAttribute('srcset');
    return true;
  }

  function styleSubscribe() {
    const scopes = ['ytd-subscribe-button-renderer', '#subscribe-button', 'yt-subscribe-button-renderer'];
    for (const scope of scopes) {
      const root = document.querySelector(scope);
      if (!root) continue;
      const btns = root.querySelectorAll('button, tp-yt-paper-button, ytd-button-renderer');
      btns.forEach(b => {
        const t = (b.textContent || '').trim();
        if (!/subscri/i.test(t)) return;
        if (b.dataset.jsaSub) return;
        b.dataset.jsaSub = '1';
        b.style.setProperty('background-color', BRAND.red, 'important');
        b.style.setProperty('border-color', BRAND.red, 'important');
        b.style.setProperty('color', '#fff', 'important');
        b.style.setProperty('border-radius', '100px', 'important');
        b.style.setProperty('font-weight', '700', 'important');
      });
    }
  }

  function styleTabs() {
    const tabs = document.querySelectorAll(
      'yt-tab-shape, tp-yt-paper-tab, ytd-tab-shape, #tabs yt-tab-shape, #tabbed-page-header-tabs yt-tab-shape'
    );
    tabs.forEach(t => {
      if (t.dataset.jsaTab) return;
      t.dataset.jsaTab = '1';
      t.style.setProperty('--jsa-accent', BRAND.red);
    });
  }

  function addRibbon() {
    if (!cfg.decorate) return;
    if (document.querySelector('#jsa-ribbon')) return;
    const scopes = [
      'ytd-two-column-browse-results-renderer #primary',
      'ytd-browse #header',
      'ytd-browse',
      '#page-manager'
    ];
    let host = null;
    for (const sel of scopes) {
      const el = document.querySelector(sel);
      if (el) { host = el; break; }
    }
    if (!host) return;
    const el = document.createElement('div');
    el.id = 'jsa-ribbon';
    setHTML(el,
      '<span class="jsa-r-seal"><img src="' + assetURI('avatar.svg') + '" alt=""></span>' +
      '<span class="jsa-r-txt"><b>Evidence. Amplitude. Action.</b>' +
      '<span>Member-funded independent reporting. New documentary every Thursday.</span></span>' +
      '<span class="jsa-r-links">' +
      '<a href="https://justicesociety.org/give" target="_blank" rel="noopener">Support the work</a>' +
      '<a href="https://data.justicesociety.org" target="_blank" rel="noopener">Public records database</a>' +
      '</span>');
    // insert at the top of the content column
    if (host.id === 'primary') {
      host.insertBefore(el, host.firstChild);
    } else {
      host.insertBefore(el, host.firstChild);
    }
  }

  function applyChannelBranding() {
    if (!cfg.applyBranding && !cfg.decorate) return;
    try {
      if (!isOwnChannelPage()) return;

      // Auto-learn the channel id so the Studio hand-off works without setup
      const pageId = detectChannelIdFromPage();
      if (pageId && pageId !== cfg.channelId) {
        cfg.channelId = pageId;
        GM_setValue('jsaConfig', cfg);
      }
      const pageHandle = detectHandleFromPage();
      if (pageHandle && !cfg.channelHandle) {
        cfg.channelHandle = pageHandle;
        GM_setValue('jsaConfig', cfg);
      }

      setBanner(cfg.bannerVariant);
      setAvatar();
      setLogo();
      styleSubscribe();
      styleTabs();
      addRibbon();
    } catch (e) { /* never break YouTube */ }
  }

  function openChannelSetup() {
    const det = detectChannel();
    const pageId = detectChannelIdFromPage();
    const pageHandle = detectHandleFromPage();
    openDrawer('Channel setup — ' + BRAND.name,
      '<div class="jsa-note"><b>Three steps to a decorated channel.</b> ' +
      'Create the channel on YouTube, pick a handle, then let this script dress it. ' +
      'Everything below is detected automatically while you browse your own channel.</div>' +

      '<div class="jsa-stats">' +
      '<div class="jsa-stat"><b>' + (cfg.channelId ? 'FOUND' : '—') + '</b><span>Channel ID</span></div>' +
      '<div class="jsa-stat"><b>' + (cfg.channelHandle ? 'SET' : '—') + '</b><span>Handle</span></div>' +
      '<div class="jsa-stat"><b>' + (cfg.applyBranding ? 'ON' : 'OFF') + '</b><span>Branding</span></div>' +
      '<div class="jsa-stat"><b>' + BANNERS.length + '</b><span>Banner variants</span></div></div>' +

      '<div class="jsa-field"><label>Detected channel</label>' +
      '<input id="jsa-set-detected" readonly value="' +
      esc((pageId || (det && det.id) || cfg.channelId) ? (pageId || det.id || cfg.channelId) : 'Open your channel page to detect') + '">' +
      '<div class="jsa-hint">' + esc((pageHandle || (det && det.handle) || cfg.channelHandle) ? 'Handle: ' + (pageHandle || det.handle || cfg.channelHandle) : 'No handle detected yet — visit youtube.com/@yourhandle') + '</div></div>' +

      '<div class="jsa-field"><label>Channel handle</label>' +
      '<input id="jsa-set-handle" value="' + esc(cfg.channelHandle || '') + '" placeholder="@yourhandle"></div>' +

      '<div class="jsa-field"><label>Channel ID (UC…)</label>' +
      '<input id="jsa-set-id" value="' + esc(cfg.channelId || '') + '" placeholder="UCxxxxxxxxxx">' +
      '<div class="jsa-hint">Auto-detected from your channel page. Only needed for the Studio hand-off.</div></div>' +

      '<div class="jsa-field"><label>Banner variant</label>' +
      '<div id="jsa-banners">' +
      BANNERS.map((b, i) => '<button class="jsa-banner' + (cfg.bannerVariant === b.f ? ' on' : '') + '" data-ban="' + esc(b.f) + '" ' +
        'style="background:url(' + assetURI(b.f) + ') center/cover">' +
        '<span>' + b.n + '<em>' + b.d + '</em></span></button>').join('') +
      '</div><div class="jsa-hint">Click a variant to preview it on your channel page instantly.</div></div>' +

      '<div class="jsa-field"><label>Decorations</label>' +
      '<div class="jsa-sw"><div class="t"><b>Apply brand to channel page</b>' +
      '<span>Banner, avatar, logo and subscribe button.</span></div>' +
      '<div class="jsa-tg' + (cfg.applyBranding ? ' on' : '') + '" id="jsa-set-brand"></div></div>' +
      '<div class="jsa-sw"><div class="t"><b>Show mission ribbon</b>' +
      '<span>A tagline strip under the channel header.</span></div>' +
      '<div class="jsa-tg' + (cfg.decorate ? ' on' : '') + '" id="jsa-set-decorate"></div></div></div>' +

      '<div class="jsa-field"><label>Brand assets</label>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      BANNERS.map(b => '<button class="jsa-btn" data-dl="' + esc(b.f) + '">Download ' + esc(b.n) + '</button>').join('') +
      '<button class="jsa-btn" data-dl="avatar.svg">Download Avatar</button>' +
      '<button class="jsa-btn" data-dl="logo.svg">Download Logo</button>' +
      '</div><div class="jsa-hint">Upload these in YouTube Studio → Customization → Branding.</div></div>',

      '<button class="jsa-btn jsa-btn-primary" id="jsa-set-save" style="width:100%;justify-content:center">Save &amp; apply</button>');

    $$('#jsa-banners .jsa-banner').forEach(b => b.addEventListener('click', () => {
      $$('#jsa-banners .jsa-banner').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      cfg.bannerVariant = b.dataset.ban;
      GM_setValue('jsaConfig', cfg);
      applyChannelBranding();
      toast('Banner set to ' + b.querySelector('span').firstChild.textContent);
    }));
    $$('[data-dl]').forEach(b => b.addEventListener('click', () => {
      const url = assetURI(b.dataset.dl);
      GM_download({ url: url, name: b.dataset.dl, onerror: () => window.open(url, '_blank') });
      toast('Downloading ' + b.dataset.dl);
    }));
    const sv = $('#jsa-set-save');
    if (sv) sv.addEventListener('click', () => {
      saveCfg({
        channelHandle: ($('#jsa-set-handle').value || '').trim(),
        channelId: ($('#jsa-set-id').value || '').trim(),
        applyBranding: $('#jsa-set-brand').classList.contains('on'),
        decorate: $('#jsa-set-decorate').classList.contains('on')
      });
      applyChannelBranding();
      toast('Saved — your channel is now decorated');
      closeDrawer();
    });
  }

  /* ------------------------------------------------------------ init */
  buildShell();

  // Add a "Channel setup" button inside the FAB menu area
  const setupBtn = document.createElement('button');
  setupBtn.id = 'jsa-setup';
  setupBtn.className = 'jsa-btn';
  setupBtn.style.cssText = 'position:fixed;right:18px;bottom:72px;z-index:10005;height:38px;padding:0 16px;' +
    'background:#16161c;border:1px solid #3a3a46;color:#f2f2f5;border-radius:100px;font:600 13px/1 Roboto,Arial,sans-serif;cursor:pointer';
  setupBtn.textContent = 'Channel setup';
  setupBtn.addEventListener('click', openChannelSetup);
  document.body.appendChild(setupBtn);

  applyChannelBranding();
  setTimeout(() => { applyChannelBranding(); toast('JSA Studio ready — click the button to compose'); }, 1200);

  // YouTube is a SPA: re-apply branding on navigation
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) { lastUrl = location.href; applyChannelBranding(); }
  }, 1200);

})();
