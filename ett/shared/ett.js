/* =====================================================================
   RegaPro · ЭТТ хэрэгслийн төв — нийтлэг скрипт
   - ETT.mountNav({ active, base }) : хэрэгсэл доторх зүүн цэс
   - ETT.hub()                      : /ett/ төв нүүр (нэвтрэлт, товч мэдээ, хэрэгслүүд)
   Нэвтрэлт: ArcGIS OAuth (нэг апп, нэг домэйн → бүх хэрэгсэлд нэг нэвтрэлт)
   ===================================================================== */
(function () {
  'use strict';

  const CFG = {
    portalUrl: 'https://indi2435f4406830.maps.arcgis.com',
    appId: 'nZpUBgxKIR0dSIDO',
    legacyDashboard: 'https://indi2435f4406830.maps.arcgis.com/apps/dashboards/a30d0161c39640cbab65400e4e4a224a',
    survey123: 'https://survey123.arcgis.com/surveys',
    appVer: '20261127b'
  };

  /* ---------- Хэл: тайлантай ижил хадгалалт (dr_lang) ---------- */
  const readLang = () => { try { return JSON.parse(localStorage.getItem('dr_lang')) === 'en' ? 'en' : 'mn'; } catch (e) { return 'mn'; } };
  const saveLang = (l) => { try { localStorage.setItem('dr_lang', JSON.stringify(l)); } catch (e) { /* хаалттай */ } };
  let LANG = readLang();

  const STR = {
    mn: {
      docTitle: 'ЭТТ хэрэгслийн төв · RegaPro', hubTitle: 'ЭТТ Геотех — Хэрэгслийн төв', hubSub: 'regapro.com/ett · Зөвхөн эрх бүхий хэрэглэгчид',
      checking: 'Нэвтрэлт шалгаж байна…', gateKick: 'ЭТТ ГЕОТЕХ', gateTitle: 'Хэрэгслийн төв',
      gateLead: 'Өрөмдлөг, дээжлэлт, лабораторийн ажлын хэрэгслүүд нэг дор. Өгөгдөл Survey123 / ArcGIS-ээс шууд татагдана.',
      gateB1: 'Өдөр тутмын өрөмдлөгийн тайлан', gateB2: 'Удахгүй: чулуулгийн дээжлэлт, дээж тээвэрлэлт, дээжийн жагсаалт…',
      signinH: 'Нэвтрэх', signinP: 'Энэ хэсэг зөвхөн ArcGIS байгууллагын эрхтэй хэрэглэгчдэд нээлттэй. Нэг удаа нэвтэрвэл бүх хэрэгсэлд нэвтэрсэн хэвээр байна.',
      signinBtn: 'ArcGIS-ээр нэвтрэх', signinNote: 'Зөвхөн ArcGIS байгууллагын эрхтэй хэрэглэгчид. Нууц үгийг RegaPro хадгалахгүй.',
      hello: 'Сайн байна уу, {0}', helloAnon: 'Сайн байна уу', asof: 'Мэдээллийн огноо: {0} · Улаанбаатарын цаг (UTC+8)',
      search: 'Хэрэгсэл хайх…', today: 'Сүүлийн өдрийн товч', todaySrc: 'Survey123-аас шууд', openDaily: 'Дэлгэрэнгүй тайлан →',
      kMetres: 'Өрөмдсөн', kSamples: 'Авсан дээж', kActive: 'Идэвхтэй цооног', kSent: 'Лаб руу илгээсэн',
      vsPrev: '{0} өмнөх өдрөөс', sentSub: '{0} хоногт · сүүлд {1} · {2} ш', sentNone: '{0} хоногт илгээгээгүй', noActive: 'Тухайн өдөр өрөмдлөггүй',
      loadingSum: 'Товч мэдээ ачаалж байна…', errSum: 'Товч мэдээ ачаалж чадсангүй: {0}', noData: 'Өгөгдөл алга',
      tools: 'Хэрэгслүүд', 'st.ready': 'Бэлэн', 'st.soon': 'Удахгүй', 'st.planned': 'Төлөвлөгөө',
      legacyNow: 'Одоогоор: хуучин dashboard ↗', noTools: 'Хайлтад тохирох хэрэгсэл алга.',
      news: 'Сүүлийн шинэчлэлт', links: 'Шуурхай холбоос', lS123: 'Survey123 маягтууд ↗', lAgol: 'ArcGIS Online ↗', lLegacy: 'Хуучин ArcGIS dashboard ↗', lSite: 'RegaPro сайт',
      foot: 'Өгөгдөл ArcGIS-д хадгалагдана, зөвхөн байгууллагын эрхтэй хүнд харагдана · Хайлтын системд индекслэгдэхгүй',
      signout: 'Гарах', navHome: 'ЭТТ', navHub: 'Төв', navAll: 'Бүгд', navLabel: 'ЭТТ хэрэгслүүд', crumb: 'ЭТТ хэрэгслийн төв',
      errLib: 'ArcGIS сан ачаалагдсангүй. Интернэт холболтоо шалгаад дахин ачаална уу.', errSignin: 'Нэвтэрч чадсангүй: {0}',
      uM: 'м', uPcs: 'ш',
      crumbHub: 'ЭТТ Геотех', eyebrow: 'Хэрэгслийн төв', heroA: 'Өрөмдлөг, дээжлэлтийн мэдээлэл —', heroB: 'нэг дор, бодит цагаар',
      heroLead: 'Survey123-аар хээрээс ирсэн мэдээлэл тайлан, график, газрын зураг болж шууд харагдана. Бүх хэрэгсэл нэг нэвтрэлтээр.',
      ctaDaily: 'Өдөр тутмын тайлан', ctaTools: 'Бүх хэрэгсэл', toolsEyebrow: 'Хэрэгслүүд', toolsTitle: 'Ажлын хэсэг бүрт — нэг хэрэгсэл',
      toolsLead: 'Бэлэн болсон хэрэгсэл шууд нээгдэнэ. Бусад нь шинээр хийгдэх хүртэл хуучин dashboard-оор ажиллана.',
      open: 'Нээх →', asofShort: '{0}-ны мэдээ', heroSignin: 'Зөвхөн ArcGIS байгууллагын эрхтэй хэрэглэгчид. Нууц үгийг RegaPro хадгалахгүй.'
    },
    en: {
      docTitle: 'ETT tools hub · RegaPro', hubTitle: 'ETT Geotech — Tools hub', hubSub: 'regapro.com/ett · Authorised users only',
      checking: 'Checking sign-in…', gateKick: 'ETT GEOTECH', gateTitle: 'Tools hub',
      gateLead: 'Drilling, sampling and laboratory tools in one place. Data comes live from Survey123 / ArcGIS.',
      gateB1: 'Daily drilling report', gateB2: 'Coming: rock sampling, sample transport, sample list…',
      signinH: 'Sign in', signinP: 'This area is open only to users of the ArcGIS organisation. Sign in once and every tool stays signed in.',
      signinBtn: 'Sign in with ArcGIS', signinNote: 'ArcGIS organisation members only. RegaPro never stores your password.',
      hello: 'Hello, {0}', helloAnon: 'Hello', asof: 'Data as of {0} · Ulaanbaatar time (UTC+8)',
      search: 'Search tools…', today: 'Latest day', todaySrc: 'live from Survey123', openDaily: 'Full report →',
      kMetres: 'Drilled', kSamples: 'Samples', kActive: 'Active holes', kSent: 'Sent to lab',
      vsPrev: '{0} vs previous day', sentSub: 'in {0} days · last {1} · {2}', sentNone: 'none in {0} days', noActive: 'No drilling that day',
      loadingSum: 'Loading the summary…', errSum: 'Could not load the summary: {0}', noData: 'No data',
      tools: 'Tools', 'st.ready': 'Ready', 'st.soon': 'Soon', 'st.planned': 'Planned',
      legacyNow: 'For now: old dashboard ↗', noTools: 'No tools match your search.',
      news: 'Recent updates', links: 'Quick links', lS123: 'Survey123 forms ↗', lAgol: 'ArcGIS Online ↗', lLegacy: 'Old ArcGIS dashboard ↗', lSite: 'RegaPro website',
      foot: 'Data stays in ArcGIS and is visible only to organisation members · Not indexed by search engines',
      signout: 'Sign out', navHome: 'ETT', navHub: 'Hub', navAll: 'All', navLabel: 'ETT tools', crumb: 'ETT tools hub',
      errLib: 'The ArcGIS library did not load. Check the connection and reload.', errSignin: 'Sign-in failed: {0}',
      uM: 'm', uPcs: '',
      crumbHub: 'ETT Geotech', eyebrow: 'Tools hub', heroA: 'Drilling and sampling data —', heroB: 'in one place, in real time',
      heroLead: 'Field data captured in Survey123 shows up straight away as reports, charts and maps. Every tool with one sign-in.',
      ctaDaily: 'Daily report', ctaTools: 'All tools', toolsEyebrow: 'Tools', toolsTitle: 'One tool for each part of the work',
      toolsLead: 'Ready tools open straight away. The rest keep running on the old dashboard until they are rebuilt.',
      open: 'Open →', asofShort: 'data as of {0}', heroSignin: 'ArcGIS organisation members only. RegaPro never stores your password.'
    }
  };
  const t = (k, ...a) => String(STR[LANG] && k in STR[LANG] ? STR[LANG][k] : (k in STR.mn ? STR.mn[k] : k)).replace(/\{(\d)\}/g, (m, i) => (a[i] != null ? a[i] : ''));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tools = () => window.ETT_TOOLS || [];
  const tx = (tool) => tool[LANG] || tool.mn;

  /* ---------- Дүрс тэмдэг (stroke SVG) ---------- */
  const ICONS = {
    home: '<path d="M3 11l9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    rock: '<path d="M3 17l3-8 6-4 6 3 3 7-5 4H7z"/><path d="M6 9l6 3 6-4M12 12v7"/>',
    run: '<rect x="8" y="2" width="8" height="20" rx="2"/><path d="M8 8h8M8 14h8"/>',
    pulse: '<path d="M2 12h4l3-8 4 16 3-8h6"/>',
    truck: '<path d="M2 6h13v11H2zM15 10h4l3 3v4h-7"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    drop: '<path d="M12 2s7 7.6 7 12.5A7 7 0 0 1 5 14.5C5 9.6 12 2 12 2z"/><path d="M8.5 15a3.5 3.5 0 0 0 3.5 3.5"/>',
    shield: '<path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    log: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v3h6V3M9 11h6M9 15h4"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'
  };
  const icon = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || ICONS.grid) + '</svg>';

  /* ---------- Хэрэгсэл доторх зүүн цэс ---------- */
  let NAV = null;
  function renderNav() {
    if (!NAV) return;
    const { el, active, base } = NAV;
    const items = tools().filter((x) => x.status === 'ready' || x.status === 'soon' || x.id === active);
    el.setAttribute('aria-label', t('navLabel'));
    el.innerHTML =
      '<a class="ett-home" href="' + esc(base) + '" title="' + esc(t('crumb')) + '">' + icon('home') + '<b>' + esc(t('navHome')) + '</b></a><hr>' +
      items.map((x) => '<a href="' + esc(base + x.path) + '"' + (x.id === active ? ' aria-current="page"' : '') + ' title="' + esc(tx(x).name) + '">' + icon(x.icon) + '<span>' + esc(tx(x).short) + '</span></a>').join('') +
      '<div class="ett-fill"></div><a href="' + esc(base) + '#tools" title="' + esc(t('tools')) + '">' + icon('grid') + '<span>' + esc(t('navAll')) + '</span></a>';
  }
  function mountNav(opts) {
    const o = Object.assign({ active: '', base: '../' }, opts || {});
    const el = document.createElement('nav'); el.className = 'ett-rail';
    document.body.insertBefore(el, document.body.firstChild);
    document.body.classList.add('ett-has-rail');
    NAV = { el, active: o.active, base: o.base };
    renderNav();
  }
  function setLang(l) { LANG = l === 'en' ? 'en' : 'mn'; renderNav(); }

  /* ---------- Төв нүүр ---------- */
  const $ = (id) => document.getElementById(id);
  const nf1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
  const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const fdate = (d) => (d ? (LANG === 'en' ? d : d.replace(/-/g, '.')) : '–');
  const fshort = (d) => (d ? d.slice(5).replace('-', '.') : '–');
  let SUM = null, SUM_ERR = '', USER = '', SIGNOUT = null;

  function applyHub() {
    document.documentElement.lang = LANG;
    document.title = t('docTitle');
    document.querySelectorAll('[data-t]').forEach((n) => { n.textContent = t(n.dataset.t); });
    document.querySelectorAll('[data-t-ph]').forEach((n) => { n.placeholder = t(n.dataset.tPh); });
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
    $('helloName').textContent = USER ? t('hello', USER) : t('helloAnon');
    const ub = $('userBtn'); ub.hidden = !USER || STATE !== 'hub'; ub.textContent = (USER ? USER + ' · ' : '') + t('signout');
    renderSummary(); renderTools(); renderNews();
  }
  function delta(v) {
    if (!isFinite(v) || Math.abs(v) < 0.05) return '<span>± 0</span>';
    return '<span class="' + (v > 0 ? 'up' : 'down') + '">' + (v > 0 ? '▲ ' : '▼ ') + nf1.format(Math.abs(v)) + '</span>';
  }
  function renderSummary() {
    const box = $('sumBody');
    $('asof').textContent = SUM && SUM !== 'none' ? '· ' + t('asofShort', fdate(SUM.date)) : '';
    if (SUM_ERR) { box.innerHTML = '<div class="err">' + esc(t('errSum', SUM_ERR)) + '</div>'; return; }
    if (!SUM) { box.innerHTML = '<div class="sum-msg">' + esc(t('loadingSum')) + '</div>'; return; }
    if (SUM === 'none') { box.innerHTML = '<div class="sum-msg">' + esc(t('noData')) + '</div>'; return; }
    const s = SUM, pcs = t('uPcs') ? ' <small>' + esc(t('uPcs')) + '</small>' : '';
    const st = (l, v, d, hl) => '<div class="stat' + (hl ? ' hl' : '') + '"><div class="l">' + esc(l) + '</div><div class="v">' + v + '</div><div class="d">' + d + '</div></div>';
    box.innerHTML = '<div class="stats">' +
      st(t('kMetres'), nf1.format(s.metres) + ' <small>' + esc(t('uM')) + '</small>', t('vsPrev', delta(s.metres - s.metresPrev)), true) +
      st(t('kSamples'), nf0.format(s.samples) + pcs, t('vsPrev', delta(s.samples - s.samplesPrev))) +
      st(t('kActive'), nf0.format(s.active), s.activeHoles.length ? esc(s.activeHoles.join(' · ')) : esc(t('noActive'))) +
      st(t('kSent'), nf0.format(s.sent) + pcs, s.lastSent ? esc(t('sentSub', s.days, fshort(s.lastSent.date), nf0.format(s.lastSent.n))) : esc(t('sentNone', s.days))) +
      '</div>';
  }
  function heroData() {
    const s = SUM; if (!s || s === 'none' || !window.ETT_HERO) return;
    const u = t('uPcs') ? ' ' + t('uPcs') : '';
    window.ETT_HERO.setData({
      bars: s.sparkM, barText: nf1.format(s.metres) + ' ' + t('uM'),
      holes: (s.holeM || []).slice(0, 2).map((h) => ({ name: h.hole, m: nf1.format(h.m) + ' ' + t('uM') })),
      ring: { text: nf0.format(s.samples) + u, frac: s.samples / Math.max(1, ...s.sparkS) }
    });
  }
  function renderTools() {
    const q = ($('toolSearch').value || '').trim().toLowerCase();
    const list = tools().filter((x) => !q || [x.mn.name, x.en.name, x.legacy, x.mn.desc, x.en.desc].join(' ').toLowerCase().includes(q));
    $('toolGrid').innerHTML = list.map((x) => {
      const n = tx(x), live = x.status === 'ready';
      const head = '<div class="row"><div class="ic">' + icon(x.icon) + '</div><span class="badge ' + x.status + '">' + esc(t('st.' + x.status)) + '</span></div>' +
        '<div class="nm">' + esc(n.name) + '</div><div class="ds">' + esc(n.desc) + '</div>';
      if (live) return '<a class="tool" href="' + esc(x.path) + '">' + head + '<div class="ft"><code>/ett/' + esc(x.path) + '</code><span class="go">' + esc(t('open')) + '</span></div></a>';
      return '<div class="tool off">' + head + '<div class="ft"><span>' + esc(x.legacy) + '</span><a href="' + esc(CFG.legacyDashboard) + '" target="_blank" rel="noopener">' + esc(t('legacyNow')) + '</a></div></div>';
    }).join('') || '<div class="empty">' + esc(t('noTools')) + '</div>';
  }
  function renderNews() {
    const byId = new Map(tools().map((x) => [x.id, x]));
    $('newsList').innerHTML = (window.ETT_NEWS || []).slice(0, 5).map((n) => {
      const tool = byId.get(n.tool);
      return '<li><time datetime="' + esc(n.date) + '">' + esc(fshort(n.date)) + '</time><span>' + (tool ? '<b>' + esc(tx(tool).name) + '</b> — ' : '') + esc(n[LANG] || n.mn) + '</span></li>';
    }).join('');
  }
  let STATE = 'checking';
  function show(which) {
    STATE = which;
    document.body.classList.toggle('is-checking', which === 'checking');
    document.body.classList.toggle('is-gate', which === 'gate');
    $('checking').hidden = which !== 'checking';
    $('gate').hidden = which !== 'gate';
    ['hubActions', 'heroStats', 'hubMain', 'hello'].forEach((id) => { $(id).hidden = which !== 'hub'; });
    $('userBtn').hidden = which !== 'hub' || !USER;
  }
  function gateError(msg) { const b = $('gateErr'); b.textContent = msg || ''; b.hidden = !msg; }
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(src)); document.head.appendChild(s); });
  }
  async function loadSummary(api, fixture) {
    try {
      // Тайлангийн тооцоог дахин ашиглана (ижил тоо гарна)
      if (!window.DR) await loadScript('dailyreport/app.js?v=' + CFG.appVer);
      const s = fixture ? window.DR.summaryOf(fixture) : await window.DR.fetchSummary(api);
      SUM = s || 'none';
    } catch (e) { SUM_ERR = (e && e.message) || String(e); }
    renderSummary(); heroData();
  }
  function wireHub() {
    document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => { LANG = b.dataset.lang; saveLang(LANG); applyHub(); heroData(); }));
    let tq = null;
    $('toolSearch').addEventListener('input', () => { clearTimeout(tq); tq = setTimeout(renderTools, 120); });
    $('userBtn').addEventListener('click', () => { if (SIGNOUT) SIGNOUT(); });
    $('lLegacy').href = CFG.legacyDashboard; $('lS123').href = CFG.survey123; $('lAgol').href = CFG.portalUrl + '/home/';
  }
  function hub() {
    wireHub(); applyHub(); show('checking');
    if (window.DR_FIXTURE) { // зөвхөн локал туршилтад
      USER = window.DR_FIXTURE.user || ''; show('hub'); applyHub();
      loadSummary(null, window.DR_FIXTURE.daily);
      return;
    }
    if (typeof window.require !== 'function') { show('gate'); gateError(t('errLib')); return; }
    window.require(['esri/identity/OAuthInfo', 'esri/identity/IdentityManager', 'esri/request', 'esri/portal/Portal'], (OAuthInfo, esriId, esriRequest, Portal) => {
      const sharing = CFG.portalUrl + '/sharing';
      esriId.registerOAuthInfos([new OAuthInfo({ appId: CFG.appId, portalUrl: CFG.portalUrl, popup: false, flowType: 'auto', redirectUri: location.origin + location.pathname })]);
      const api = {
        query: (url, q) => esriRequest(url + '/query', { query: Object.assign({ f: 'json' }, q), responseType: 'json' }).then((r) => r.data),
        get: (url, q) => esriRequest(url, { query: Object.assign({ f: 'json' }, q), responseType: 'json' }).then((r) => r.data),
        blob: (url) => esriRequest(url, { responseType: 'blob' }).then((r) => r.data)
      };
      let started = false;
      const start = () => {
        if (started) return; started = true;
        SIGNOUT = () => { esriId.destroyCredentials(); location.reload(); };
        show('hub'); applyHub();
        new Portal({ url: CFG.portalUrl, authMode: 'immediate' }).load().then((p) => {
          USER = (p.user && (p.user.fullName || p.user.username)) || ''; applyHub();
        }).catch(() => { /* нэр заавал биш */ });
        loadSummary(api);
      };
      esriId.checkSignInStatus(sharing).then(start).catch(() => {
        if (started) return;
        show('gate');
        $('signinBtn').onclick = () => esriId.getCredential(sharing).then(start).catch((e) => gateError(t('errSignin', (e && e.message) || e)));
      });
    }, () => { show('gate'); gateError(t('errLib')); });
  }

  window.ETT = { CFG, icon, mountNav, setLang, hub, t, lang: () => LANG };
})();
