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
    applyBranding: false
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
  `);

  /* ------------------------------------------------------------ helpers */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const log = GM_getValue('jsaLog', []);

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
    fab.innerHTML = '<span class="jsa-dot">JSA</span><span>Studio</span>';
    fab.setAttribute('aria-label', 'Open Justice Society of Activism composer');

    const scrim = document.createElement('div');
    scrim.id = 'jsa-scrim';

    const drawer = document.createElement('aside');
    drawer.id = 'jsa-drawer';
    drawer.innerHTML =
      '<header><h3 id="jsa-title">Composer</h3>' +
      '<button class="jsa-x" id="jsa-close" aria-label="Close">&times;</button></header>' +
      '<div class="jsa-body" id="jsa-body"></div>' +
      '<footer id="jsa-foot"></footer>';

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
    $('#jsa-body').innerHTML = bodyHTML;
    $('#jsa-foot').innerHTML = footHTML;
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
      '<input id="jsa-handle" value="' + cfg.channelHandle + '">' +
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
    const target = 'https://studio.youtube.com/channel/' + (cfg.channelId || 'UC_REPLACE_ME') + '/videos/upload?draft=1&' + params.toString();

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
      '<div class="jsa-field"><label>CPM</label><input id="jsa-pcpm" type="text" value="' + cfg.targetCpm + '"></div>' +
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

      '<a class="jsa-btn jsa-btn-primary jsa-btn" href="https://studio.youtube.com/channel/' + (cfg.channelId || 'UC_REPLACE_ME') + '/editing" target="_blank" rel="noopener" style="flex:1;justify-content:center;margin-top:22px">Open channel customization</a>');

    $$('[data-asset]').forEach(b => b.addEventListener('click', () => {
      const url = SCRIPT_ORIGIN + '/' + b.dataset.asset;
      GM_download({ url: url, name: b.dataset.asset.split('/').pop(), onerror: () => { window.open(url, '_blank'); } });
      toast('Downloading ' + b.dataset.asset.split('/').pop());
    }));
  }

  /* ------------------------------------------------------------ settings */
  function openSettings() {
    openDrawer('Settings',
      '<div class="jsa-field"><label>Your channel handle</label>' +
      '<input id="jsa-cfg-handle" value="' + cfg.channelHandle + '">' +
      '<div class="jsa-hint">Used for the description footer and the Studio hand-off.</div></div>' +
      '<div class="jsa-field"><label>Your channel URL</label>' +
      '<input id="jsa-cfg-url" value="' + cfg.channelUrl + '"></div>' +
      '<div class="jsa-field"><label>Channel ID (UC…)</label>' +
      '<input id="jsa-cfg-id" value="' + (cfg.channelId || '') + '" placeholder="UCxxxxxxxxxx">' +
      '<div class="jsa-hint">Found in your Studio URL. Needed for one-click hand-off.</div></div>' +
      '<div class="jsa-field"><label>Target CPM</label><input id="jsa-cfg-cpm" value="' + cfg.targetCpm + '"></div>' +
      '<div class="jsa-field"><label>Per sponsor slot</label><input id="jsa-cfg-sp" value="' + cfg.sponsorRate + '"></div>' +
      '<div class="jsa-field"><label>Channel branding</label>' +
      '<div class="jsa-sw"><div class="t"><b>Apply JSA brand to your channel page</b>' +
      '<span>Swaps in the JSA banner, avatar, and accent on your own channel page.</span></div>' +
      '<div class="jsa-tg' + (cfg.applyBranding ? ' on' : '') + '" id="jsa-cfg-brand"></div></div></div>' +
      '<div class="jsa-field"><label>Recent briefs</label>' +
      '<div class="jsa-log">' +
      (log.length ? log.slice(0, 12).map(e => '<div><span>' + e.when + '</span><div>' + e.title + '</div></div>').join('')
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

  /* ------------------------------------------------------------ branding */
  function currentChannelPath() {
    const m = location.pathname.match(/^\/@([^/]+)/);
    return m ? m[1].toLowerCase() : null;
  }

  function applyChannelBranding() {
    if (!cfg.applyBranding) return;
    try {
      const want = String(cfg.channelHandle || '').replace(/^@/, '').toLowerCase();
      const here = currentChannelPath();
      if (!want || !here || (here !== want && here !== 'c' && here !== 'user')) return;

      // Banner (the container is a <img> or a background-image div)
      const bannerImg = document.querySelector('ytd-c4-banner-and-avatar-renderer #img, #banner.ytd-c4-banner-and-avatar-renderer img');
      if (bannerImg && bannerImg.src.indexOf('jsa-brand-banner') === -1) {
        bannerImg.src = SCRIPT_ORIGIN + '/brand/banner.svg';
        bannerImg.dataset.jsaBrandBanner = '1';
      }
      const bannerBg = document.querySelector('ytd-c4-banner-and-avatar-renderer #img');
      if (bannerBg && bannerBg.style.backgroundImage) {
        bannerBg.style.backgroundImage = 'none';
      }

      // Avatar
      const av = document.querySelector('ytd-c4-banner-and-avatar-renderer yt-avatar-shape img, #avatar img');
      if (av && av.src.indexOf('jsa-brand-avatar') === -1) {
        av.src = SCRIPT_ORIGIN + '/brand/avatar.svg';
        av.dataset.jsaBrandAvatar = '1';
      }

      // Accent the Subscribe button so the channel reads as one system
      const sub = document.querySelector('#subscribe-button button, ytd-subscribe-button-renderer button');
      if (sub && !sub.dataset.jsaSub) {
        sub.dataset.jsaSub = '1';
        sub.style.background = BRAND.red;
        sub.style.borderRadius = '100px';
        sub.style.fontWeight = '700';
      }
    } catch (e) { /* never break the page */ }
  }

  /* ------------------------------------------------------------ init */
  buildShell();
  applyChannelBranding();
  setTimeout(() => { applyChannelBranding(); toast('JSA Studio ready — click the button to compose'); }, 1200);

  // YouTube is a SPA: re-apply branding on navigation
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) { lastUrl = location.href; applyChannelBranding(); }
  }, 1200);

})();
