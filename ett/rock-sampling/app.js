/* =====================================================================
   RegaPro · ETT Geotech — Чулуулгийн дээжлэлт
   Өгөгдөл: Survey123 «Rock Sample Logging» (ArcGIS Online)
     0: ROCK SAMPLE LOGGING (дээжлэлт — огноо, цооног, бүртгэгч)
     1: sample_rep (дээж бүр — гүн, хэсэг, хатуулаг, сав, зураг)
   Нэвтрэлт: ArcGIS OAuth (ЭТТ төвийн нийтлэг апп). Хуудас өгөгдөл хадгалахгүй.
   ===================================================================== */
(function () {
  'use strict';

  const CONFIG = {
    portalUrl: 'https://indi2435f4406830.maps.arcgis.com',
    appId: 'nZpUBgxKIR0dSIDO',
    svc: 'https://services6.arcgis.com/kXYSrbCkSfymtsXt/arcgis/rest/services/service_e2a62e28a59f48c0a380402e682d994d/FeatureServer',
    formItemId: '0cec8d5adbdc4da99ea4d26860ffe747',
    tzOffsetH: 8,
    refreshMin: 10,
    pageSize: 100
  };
  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const DAY = 864e5;

  /* ---------------- Хэл ---------------- */
  const I18N = {
    mn: {
      docTitle: 'Чулуулгийн дээжлэлт · RegaPro', crumb: 'ЭТТ Геотех', title: 'Чулуулгийн дээжлэлт',
      asof: 'Сүүлийн дээжлэлт: {0} · {1} дээж · {2} цооног', updated: 'Шинэчилсэн {0}', refresh: 'Шинэчлэх', signout: 'Гарах',
      'tab.overview': 'Тойм', 'tab.holes': 'Цооногоор', 'tab.samples': 'Дээжийн жагсаалт', 'tab.coolers': 'Сав', 'tab.dq': 'Өгөгдлийн чанар',
      filters: 'Шүүлтүүр', clear: 'Цэвэрлэх', 'f.period': 'Хугацаа', 'f.from': 'Эхлэх', 'f.to': 'Дуусах', 'f.holes': 'Цооног', 'f.none': 'Бүгдийг арилгах', 'f.all': 'Бүгдийг сонгох',
      'f.unit': 'Дээжлэлтийн хэсэг', 'f.zone': 'Ач холбогдол', 'f.str': 'Хатуулаг', 'p.7': '7 хоног', 'p.30': '30 хоног', 'p.90': '90 хоног', 'p.month': 'Энэ сар', 'p.all': 'Бүгд',
      loading: 'Өгөгдөл ачаалж байна…', noData: 'Сонгосон шүүлтүүрт дээж алга.', unknown: 'Тодорхойгүй', other: 'Бусад',
      'k.samples': 'Нийт дээж', 'k.holes': 'Цооног', 'k.len': 'Дээжийн нийт урт', 'k.crit': 'Гол анхаарах', 'k.photo': 'Зурагтай',
      'k.last7': 'Сүүлийн 7 хоногт: {0}', 'k.active': 'Сүүлийн 7 хоногт идэвхтэй: {0}', 'k.avgLen': 'Дундаж урт: {0} см', 'k.imp': 'Анхаарах: {0}', 'k.noPhoto': 'Зураггүй: {0}', 'k.photoLoading': 'Зураг шалгаж байна…',
      'c.weekly': 'Долоо хоног бүрийн дээж', 'c.weeks': '· {0} долоо хоног', 'c.sessions': 'Сүүлийн дээжлэлтүүд', 'c.unit': 'Дээжлэлтийн хэсгээр', 'c.rock': 'Чулуулгийн төрлөөр',
      'c.str': 'Хатуулаг (R1–R7)', 'c.wth': 'Өгөршил', 'c.cond': 'Дээжийн бүтэн байдал', 'c.week': '{0} – {1}', 'c.total': 'Нийт',
      'z.1': 'Гол анхаарах', 'z.2': 'Анхаарах',
      'h.title': 'Цооног тус бүрийн дээжлэлт', 'h.hint': 'Мөр дээр дарж цооногийн дээжийн баганыг харна.',
      'col.hole': 'Цооног', 'col.samples': 'Дээж', 'col.crit': 'Гол анх.', 'col.depth': 'Гүний хүрээ, м', 'col.len': 'Нийт урт, м', 'col.dates': 'Огноо', 'col.days': 'Өдөр', 'col.coolers': 'Сав', 'col.photo': 'Зураг', 'col.issues': 'Асуудал',
      'col.date': 'Огноо', 'col.id': 'Дээжийн дугаар', 'col.fromto': 'Гүн, м', 'col.l': 'Урт, м', 'col.unit': 'Хэсэг', 'col.zone': 'Ач холб.', 'col.rock': 'Чулуулаг', 'col.str': 'Хатуулаг',
      'col.wth': 'Өгөршил', 'col.sw': 'Хатуулаг · Өгөршил', 'col.cond': 'Бүтэн байдал', 'col.cooler': 'Сав', 'col.note': 'Тэмдэглэл', 'col.edit': '', 'col.no': '№', 'col.ids': 'Дээжийн дугаар', 'col.value': 'Утга',
      'hd.meta': '{0} дээж · {1}–{2} м · нийт урт {3} м · {4} сав', 'hd.strip.unit': 'Хэсэг', 'hd.strip.str': 'Хатуулаг', 'hd.strip.def': 'Ан цав',
      'hd.who': 'Бүртгэсэн: {0}', 'hd.pick': 'Цооног сонгоно уу',
      's.title': 'Дээжийн жагсаалт', 's.search': 'Дээж, цооног, сав, тэмдэглэлээр хайх', 's.count': '{0} дээж', 's.page': '{0}–{1} / {2}', 'prev': '‹ Өмнөх', 'next': 'Дараах ›',
      'k.title': 'Сав (cooler) тус бүр', 'k.hint': 'Дээж бүр аль саванд хийгдсэн — цооног, сав тус бүрийн дээжийн тоо, гүний болон огнооны хүрээ.', 'k.sub': '{0} сав · {1} цооног', 'k.badName': 'нэр буруу',
      'edit': 'Засах ↗', 'photo': 'Зураг', 'ph.loading': 'Ачаалж байна…', 'ph.err': 'Зураг ачаалагдсангүй', 'ph.open': 'Бүтэн хэмжээгээр татах', 'ph.n': '{0} / {1}', 'ph.none': '–',
      'dq.total': 'Нийт асуудал', 'dq.ok': 'Асуудал илрээгүй', 'sev.critical': 'Ноцтой', 'sev.serious': 'Чухал', 'sev.warning': 'Анхааруулга', 'sev.info': 'Мэдээлэл',
      'dq.interval': 'Гүний интервал буруу (хүртэл ≤ эхлэх)', 'dq.interval.w': 'Дээжийн «To» гүн «From»-оос их байх ёстой.',
      'dq.dup': 'Давхардсан дээжийн дугаар', 'dq.dup.w': 'Нэг дугаар хоёр ба түүнээс олон удаа бүртгэгдсэн.',
      'dq.overlap': 'Нэг цооногт давхцсан интервал', 'dq.overlap.w': 'Өмнөх дээжийн «To» гүнээс өмнө дараагийн дээж эхэлсэн.',
      'dq.unit': 'Дээжлэлтийн хэсгийн код жагсаалтад байхгүй', 'dq.unit.w': 'Маягтын сонголтод байхгүй код бичигдсэн (жишээ нь BA).',
      'dq.prefix': 'Дээжийн дугаар цооногийн нэрээр эхлээгүй', 'dq.prefix.w': 'Дугаар нь «ЦООНОГ-GT-###» хэлбэртэй байх ёстой.',
      'dq.hole': 'Дээжийн цооног дээжлэлтийн цооногоос ялгаатай', 'dq.hole.w': 'Дээжийн мөрийн цооног ба толгой бүртгэлийн цооног зөрсөн.',
      'dq.thk': 'Урт (Thk) гүнтэй таарахгүй', 'dq.thk.w': 'Thk ≠ To − From (2 см-ээс их зөрүү).',
      'dq.cooler': 'Савны нэр стандарт бус', 'dq.cooler.w': '«COOLER N» хэлбэрээр бичигдээгүй — саваар бүлэглэхэд алдаа гарна.',
      'dq.attr': 'Хатуулаг, өгөршил эсвэл бүтэн байдал бичигдээгүй', 'dq.attr.w': 'Геотехникийн гол үзүүлэлт дутуу.',
      'dq.lith': 'Чулуулгийн төрөл бичигдээгүй', 'dq.lith.w': 'Rock / Coaly rock / Coal аль нь ч сонгогдоогүй.',
      'dq.seq': 'Дээжийн дугаарын дараалал тасарсан', 'dq.seq.w': 'Цооногийн GT дугаарын дунд алга болсон дугаар бий.',
      'dq.photo': 'Зураггүй дээж', 'dq.photo.w': 'Survey123-д дээжийн зураг хавсаргаагүй.',
      'dq.mark': 'Чиглэлийн тэмдэглэгээгүй', 'dq.mark.w': '«Clear marking» = No эсвэл хоосон.',
      'dq.missing': 'Алга: {0}',
      'exp.btn': 'Тайлан татах', 'exp.title': 'Тайлан татах', 'exp.fmt': 'Файлын төрөл', 'exp.xlsx': 'Дээж, цооног, сав, чанарын шалгалт — тусдаа хуудсаар', 'exp.csv': 'Дээжийн жагсаалт, бусад программд',
      'exp.scope': 'Одоогийн шүүлтүүрээр: {0} дээж, {1} цооног, {2} – {3}.', 'exp.go': 'Татах', cancel: 'Болих', 'exp.busy': 'Бэлтгэж байна…', 'exp.done': 'Татаж авлаа ✓', 'exp.err': 'Алдаа: {0}',
      'sh.samples': 'Дээж', 'sh.holes': 'Цооног', 'sh.coolers': 'Сав', 'sh.dq': 'Чанар',
      'signin.h': 'Нэвтрэх шаардлагатай', 'signin.p': 'Өгөгдөл ArcGIS Online дээр хамгаалагдсан. Байгууллагын бүртгэлээрээ нэвтэрнэ үү.', 'signin.btn': 'ArcGIS-ээр нэвтрэх',
      'err.lib': 'ArcGIS сан ачаалагдсангүй. Интернэт холболтоо шалгаад дахин ачаална уу.', 'err.load': 'Өгөгдөл ачаалж чадсангүй: {0}', 'err.signin': 'Нэвтэрч чадсангүй: {0}',
      'u.m': 'м', 'u.cm': 'см', 'u.pcs': 'ш', wd: ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя']
    },
    en: {
      docTitle: 'Rock sampling · RegaPro', crumb: 'ETT Geotech', title: 'Rock sampling',
      asof: 'Latest sampling: {0} · {1} samples · {2} holes', updated: 'Updated {0}', refresh: 'Refresh', signout: 'Sign out',
      'tab.overview': 'Overview', 'tab.holes': 'By hole', 'tab.samples': 'Sample list', 'tab.coolers': 'Coolers', 'tab.dq': 'Data quality',
      filters: 'Filters', clear: 'Clear', 'f.period': 'Period', 'f.from': 'From', 'f.to': 'To', 'f.holes': 'Hole', 'f.none': 'Clear all', 'f.all': 'Select all',
      'f.unit': 'Sampling unit', 'f.zone': 'Priority', 'f.str': 'Strength', 'p.7': '7 days', 'p.30': '30 days', 'p.90': '90 days', 'p.month': 'This month', 'p.all': 'All',
      loading: 'Loading data…', noData: 'No samples for the selected filters.', unknown: 'Not recorded', other: 'Other',
      'k.samples': 'Samples', 'k.holes': 'Holes', 'k.len': 'Total sample length', 'k.crit': 'Critical', 'k.photo': 'With photo',
      'k.last7': 'Last 7 days: {0}', 'k.active': 'Active in last 7 days: {0}', 'k.avgLen': 'Average length: {0} cm', 'k.imp': 'Important: {0}', 'k.noPhoto': 'Without photo: {0}', 'k.photoLoading': 'Checking photos…',
      'c.weekly': 'Samples per week', 'c.weeks': '· {0} weeks', 'c.sessions': 'Latest sampling sessions', 'c.unit': 'By sampling unit', 'c.rock': 'By rock type',
      'c.str': 'Strength (R1–R7)', 'c.wth': 'Weathering', 'c.cond': 'Core condition', 'c.week': '{0} – {1}', 'c.total': 'Total',
      'z.1': 'Critical', 'z.2': 'Important',
      'h.title': 'Sampling by hole', 'h.hint': 'Click a row to see the hole’s sample column.',
      'col.hole': 'Hole', 'col.samples': 'Samples', 'col.crit': 'Critical', 'col.depth': 'Depth range, m', 'col.len': 'Total length, m', 'col.dates': 'Dates', 'col.days': 'Days', 'col.coolers': 'Coolers', 'col.photo': 'Photo', 'col.issues': 'Issues',
      'col.date': 'Date', 'col.id': 'Sample ID', 'col.fromto': 'Depth, m', 'col.l': 'Length, m', 'col.unit': 'Unit', 'col.zone': 'Priority', 'col.rock': 'Rock', 'col.str': 'Strength',
      'col.wth': 'Weathering', 'col.sw': 'Strength · Weathering', 'col.cond': 'Condition', 'col.cooler': 'Cooler', 'col.note': 'Note', 'col.edit': '', 'col.no': '#', 'col.ids': 'Sample IDs', 'col.value': 'Value',
      'hd.meta': '{0} samples · {1}–{2} m · total length {3} m · {4} coolers', 'hd.strip.unit': 'Unit', 'hd.strip.str': 'Strength', 'hd.strip.def': 'Defects',
      'hd.who': 'Logged by: {0}', 'hd.pick': 'Pick a hole',
      's.title': 'Sample list', 's.search': 'Search sample, hole, cooler, note', 's.count': '{0} samples', 's.page': '{0}–{1} of {2}', 'prev': '‹ Previous', 'next': 'Next ›',
      'k.title': 'By cooler', 'k.hint': 'Which cooler each sample went into — samples, depth and date range per hole and cooler.', 'k.sub': '{0} coolers · {1} holes', 'k.badName': 'bad name',
      'edit': 'Edit ↗', 'photo': 'Photo', 'ph.loading': 'Loading…', 'ph.err': 'Photo did not load', 'ph.open': 'Download full size', 'ph.n': '{0} of {1}', 'ph.none': '–',
      'dq.total': 'Total issues', 'dq.ok': 'No issues found', 'sev.critical': 'Critical', 'sev.serious': 'Serious', 'sev.warning': 'Warning', 'sev.info': 'Info',
      'dq.interval': 'Invalid depth interval (To ≤ From)', 'dq.interval.w': 'A sample’s To depth must be greater than its From depth.',
      'dq.dup': 'Duplicate sample ID', 'dq.dup.w': 'The same ID was logged more than once.',
      'dq.overlap': 'Overlapping intervals in a hole', 'dq.overlap.w': 'A sample starts before the previous sample’s To depth.',
      'dq.unit': 'Sampling unit code not in the list', 'dq.unit.w': 'A code that is not a form choice was recorded (e.g. BA).',
      'dq.prefix': 'Sample ID does not start with the hole name', 'dq.prefix.w': 'IDs should look like HOLE-GT-###.',
      'dq.hole': 'Sample hole differs from the session hole', 'dq.hole.w': 'The repeat row’s hole and the parent record’s hole disagree.',
      'dq.thk': 'Thk does not match the depths', 'dq.thk.w': 'Thk ≠ To − From (more than 2 cm apart).',
      'dq.cooler': 'Non-standard cooler name', 'dq.cooler.w': 'Not written as “COOLER N” — breaks grouping by cooler.',
      'dq.attr': 'Strength, weathering or condition missing', 'dq.attr.w': 'Key geotechnical attributes are missing.',
      'dq.lith': 'Rock type not recorded', 'dq.lith.w': 'None of Rock / Coaly rock / Coal was chosen.',
      'dq.seq': 'Gap in sample ID sequence', 'dq.seq.w': 'Numbers are missing in a hole’s GT sequence.',
      'dq.photo': 'Sample without photo', 'dq.photo.w': 'No photo attached in Survey123.',
      'dq.mark': 'No orientation marking', 'dq.mark.w': 'Clear marking = No or empty.',
      'dq.missing': 'Missing: {0}',
      'exp.btn': 'Download report', 'exp.title': 'Download report', 'exp.fmt': 'File type', 'exp.xlsx': 'Samples, holes, coolers, data checks — one sheet each', 'exp.csv': 'Sample list for other software',
      'exp.scope': 'Current filters: {0} samples, {1} holes, {2} – {3}.', 'exp.go': 'Download', cancel: 'Cancel', 'exp.busy': 'Preparing…', 'exp.done': 'Downloaded ✓', 'exp.err': 'Error: {0}',
      'sh.samples': 'Samples', 'sh.holes': 'Holes', 'sh.coolers': 'Coolers', 'sh.dq': 'Data quality',
      'signin.h': 'Sign-in required', 'signin.p': 'The data is protected in ArcGIS Online. Sign in with your organisation account.', 'signin.btn': 'Sign in with ArcGIS',
      'err.lib': 'The ArcGIS library did not load. Check the connection and reload.', 'err.load': 'Could not load the data: {0}', 'err.signin': 'Sign-in failed: {0}',
      'u.m': 'm', 'u.cm': 'cm', 'u.pcs': '', wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('dr_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dr_' + k, JSON.stringify(v)); } catch (e) { /* хаалттай */ } }
  };
  let LANG = store.get('lang', 'mn') === 'en' ? 'en' : 'mn';
  function t(k, ...a) {
    const L = I18N[LANG], v = (k in L) ? L[k] : (k in I18N.mn ? I18N.mn[k] : k);
    return typeof v === 'string' ? v.replace(/\{(\d)\}/g, (m, i) => (a[i] != null ? a[i] : '')) : v;
  }

  /* ---------------- Туслах ---------------- */
  const fmt = (v, d = 1) => (v == null || !isFinite(v)) ? '–' : Number(v).toLocaleString('en-US', { maximumFractionDigits: d });
  const fmtI = (v) => fmt(v, 0);
  const fmt2 = (v) => (v == null || !isFinite(v)) ? '–' : Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '–';
  const ubDate = (ms) => new Date(ms + CONFIG.tzOffsetH * 3600e3).toISOString().slice(0, 10);
  const ubNow = () => new Date(Date.now() + CONFIG.tzOffsetH * 3600e3).toISOString().slice(11, 16);
  const toMs = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  const addDays = (s, n) => new Date(toMs(s) + n * DAY).toISOString().slice(0, 10);
  const weekday = (s) => new Date(toMs(s)).getUTCDay();
  const weekStart = (s) => addDays(s, -((weekday(s) + 6) % 7));
  const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(s, style) {
    if (!s) return '–';
    const y = s.slice(0, 4), m = +s.slice(5, 7), d = +s.slice(8, 10);
    if (LANG === 'en') return style === 'short' ? d + ' ' + MONTHS_EN[m - 1] : d + ' ' + MONTHS_EN[m - 1] + ' ' + y;
    return style === 'short' ? String(m).padStart(2, '0') + '.' + String(d).padStart(2, '0') : y + '.' + String(m).padStart(2, '0') + '.' + String(d).padStart(2, '0');
  }
  const fmtDateAuto = (s) => (s && DATA_MAX && s.slice(0, 4) === DATA_MAX.slice(0, 4)) ? fmtDate(s, 'short') : fmtDate(s);
  function el(tag, attrs, parent, text) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) { if (attrs[k] == null) continue; if (k === 'class') e.className = attrs[k]; else if (k === 'style') e.style.cssText = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function S(tag, attrs, parent, text) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function nice(max, n) {
    n = n || 5; max = Math.max(max, 1e-9);
    const raw = max / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
    const top = Math.ceil(max / step - 1e-9) * step, ticks = [];
    for (let v = 0; v <= top + 1e-9; v += step) ticks.push(+v.toFixed(6));
    return { top, ticks };
  }
  function colPath(x, y, w, h, r) { if (h <= 0) return ''; r = Math.min(r, h, w / 2); return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`; }
  function hbarPath(x, y, w, h, r) { if (w <= 0) return ''; r = Math.min(r, w, h / 2); return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`; }
  const num = (v) => (v == null || v === '' || !isFinite(+v)) ? null : +v;
  const normG = (g) => String(g || '').replace(/[{}]/g, '').toLowerCase();
  const tip = () => $('tip');
  function tipShow(x, y, build) {
    const T = tip(); T.innerHTML = ''; build(T); T.style.display = 'block';
    const pad = 14, w = T.offsetWidth, h = T.offsetHeight;
    let left = x + pad, top = y + pad;
    if (left + w > innerWidth - 8) left = x - w - pad;
    if (top + h > innerHeight - 8) top = y - h - pad;
    T.style.left = Math.max(4, left) + 'px'; T.style.top = Math.max(4, top) + 'px';
  }
  function tipHide() { tip().style.display = 'none'; }
  function tipHead(T, text) { el('div', { class: 'th' }, T, text); }
  function tipRow(T, color, value, label) { const r = el('div', { class: 'tr' }, T); const k = el('span', { class: 'k box' }, r); k.style.background = color || 'transparent'; el('b', null, r, value); el('span', null, r, label); }
  function tipSep(T) { el('div', { class: 'sepl' }, T); }
  function bindTip(node, build) {
    node.addEventListener('pointermove', (e) => tipShow(e.clientX, e.clientY, build));
    node.addEventListener('pointerleave', tipHide);
    node.addEventListener('focus', () => { const b = node.getBoundingClientRect(); tipShow(b.right, b.top, build); });
    node.addEventListener('blur', tipHide);
  }
  function legend(box, items) {
    box.innerHTML = '';
    items.forEach((it) => { const s = el('span', null, box); const i = el('i', null, s); i.style.background = it.color; s.appendChild(document.createTextNode(it.label)); });
  }

  /* ---------------- Ангилал, өнгө ---------------- */
  const UNIT_ORDER = ['OV', 'MR', 'IR', 'CO', 'IF', 'MF', 'IB'];
  // dataviz: категорийн өнгийг тогтсон дарааллаар (validated palette)
  const UNIT_COLOR = { OV: '#257de0', MR: '#f47230', IR: '#00b894', CO: '#f2a600', IF: '#ee7fac', MF: '#008a17', IB: '#6a4ce2' };
  const GRAY = '#9aa4ad';
  const ZONE_COLOR = { 1: '#f47230', 2: '#257de0' };
  const STR_ORDER = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'];
  const STR_COLOR = ['#84b9f3', '#519ced', '#338ced', '#257de0', '#2370cd', '#1757ac', '#0e3d7e'];
  const WTH_ORDER = ['F', 'S', 'W', 'D', 'E'];
  const WTH_COLOR = ['#fbc8a8', '#f9a273', '#f47230', '#c9561d', '#8e3a10'];
  const unitColor = (u) => UNIT_COLOR[u] || GRAY;
  const strColor = (s) => { const i = STR_ORDER.indexOf(s); return i < 0 ? GRAY : STR_COLOR[i]; };

  /* ---------------- Домэйн (маягтын сонголтууд) ---------------- */
  const DOM = {};
  const CYR = /[Ѐ-ӿ]/;
  function parseName(code, name) {
    const s = String(name == null ? code : name).trim();
    const m = /^(.*?)\s*\((.*)\)+\s*$/.exec(s);
    if (!m) return { en: s, mn: s };
    const head = m[1].trim(), inner = m[2].replace(/\)+$/, '').trim();
    if (head === String(code)) {
      const k = inner.indexOf('/');
      if (k > 0) return { en: inner.slice(0, k).trim(), mn: inner.slice(k + 1).trim() || inner.slice(0, k).trim() };
      return { en: inner, mn: inner };
    }
    const k = inner.indexOf('/');
    if (k > 0 && CYR.test(inner.slice(k + 1))) return { en: head, mn: inner.slice(k + 1).trim() };
    return { en: head, mn: CYR.test(inner) ? inner : head };
  }
  function loadDomains(fields) {
    (fields || []).forEach((f) => {
      if (!f.domain || !f.domain.codedValues) return;
      const m = DOM[f.name] || (DOM[f.name] = new Map());
      f.domain.codedValues.forEach((c) => m.set(String(c.code), parseName(c.code, c.name)));
    });
  }
  function lbl(field, code) {
    if (code == null || code === '') return t('unknown');
    const d = DOM[field] && DOM[field].get(String(code));
    return d ? d[LANG] : String(code);
  }
  const inDomain = (field, code) => !DOM[field] || DOM[field].has(String(code));
  const unitLbl = (u) => (u ? lbl('sampling_unit', u) : t('unknown'));
  const zoneLbl = (z) => (z === '1' || z === '2' ? t('z.' + z) : t('unknown'));
  const strLbl = (s) => (s ? s + ' · ' + lbl('strenght', s) : t('unknown'));
  const wthLbl = (w) => (w ? w + ' · ' + lbl('weathering', w) : t('unknown'));
  function rockOf(r) {
    if (r.rock) return { key: 'r:' + r.rock, code: r.rock, label: lbl('lith_rock', r.rock) };
    if (r.coalRock) return { key: 'x:' + r.coalRock, code: r.coalRock, label: lbl('lith_coal_rock', r.coalRock) };
    if (r.coal) return { key: 'c:' + r.coal, code: r.coal, label: lbl('lith_coal', r.coal) };
    return null;
  }
  const who = (p) => p ? [p.logger && lbl('logger', p.logger), p.sampler && lbl('sampler', p.sampler)].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ') : '';

  /* ---------------- Төлөв ---------------- */
  let API = null, RECS = [], FREC = [], PAR = new Map(), HOLES = [], DATA_MIN = null, DATA_MAX = null, LAST = 0, USER = '';
  const ATT = new Map(); let ATT_DONE = false;
  const BLOBS = new Map();
  const F = { preset: 'all', from: null, to: null, exHoles: new Set(), exUnits: new Set(), exZones: new Set(), exStr: new Set() };
  let TAB = 'overview', SELHOLE = null;
  const SS = { key: 'date', dir: -1, q: '', page: 0 };

  /* ---------------- Өгөгдөл ---------------- */
  const P_FIELDS = 'objectid,globalid,sample_date,drillhole_id,drillhole_id_other,logger,logger_other,sampler,sampler_other,phase,phase_other,weather,CreationDate';
  const S_FIELDS = 'objectid,globalid,parentglobalid,sample_id,hole_id,hole_id_other,_from,_to,thk,zone,sampling_unit,strenght,weathering,_condition,_condition_other,lith_coal,lith_coal_rock,lith_rock,other,cooler_id,arrow_marking,type_top,type_bot,air_temperature,CreationDate';
  async function queryAll(url, params) {
    let off = 0, all = [];
    for (let guard = 0; guard < 60; guard++) {
      const d = await API.query(url, Object.assign({ where: '1=1', returnGeometry: false, orderByFields: 'objectid', resultOffset: off, resultRecordCount: 2000 }, params));
      if (d.error) throw new Error(d.error.message || 'query');
      const feats = d.features || [];
      all = all.concat(feats.map((f) => f.attributes));
      if (!d.exceededTransferLimit || !feats.length) break;
      off += feats.length;
    }
    return all;
  }
  function parseParent(a) {
    const ms = a.sample_date || a.CreationDate || null;
    const hole = (a.drillhole_id === 'other' ? a.drillhole_id_other : a.drillhole_id) || '';
    return {
      oid: a.objectid, gid: normG(a.globalid), ms, date: ms ? ubDate(ms) : null, hole: String(hole).trim(),
      logger: a.logger === 'other' ? (a.logger_other || null) : a.logger, sampler: a.sampler === 'other' ? (a.sampler_other || null) : a.sampler,
      phase: a.phase === 'other' ? a.phase_other : a.phase, weather: a.weather
    };
  }
  function parseSample(a) {
    const p = PAR.get(normG(a.parentglobalid)) || null;
    const hole = String((a.hole_id === 'other' ? a.hole_id_other : a.hole_id) || (p && p.hole) || '').trim();
    const from = num(a._from), to = num(a._to);
    const ms = (p && p.ms) || a.CreationDate || null;
    const cool = String(a.cooler_id || '').trim().replace(/\s+/g, ' ');
    const mm = /(\d+)\s*$/.exec(cool);
    const sid = String(a.sample_id || '').trim();
    const sq = /GT[-_ ]?(\d+)\s*$/i.exec(sid);
    return {
      oid: a.objectid, gid: normG(a.globalid), p, hole, id: sid, seq: sq ? +sq[1] : null,
      from, to, len: (from != null && to != null) ? +(to - from).toFixed(3) : null, thk: num(a.thk),
      zone: a.zone == null || a.zone === '' ? null : String(a.zone), unit: a.sampling_unit || null, str: a.strenght || null, wth: a.weathering || null,
      cond: a._condition || null, condOther: a._condition_other || '', rock: a.lith_rock || null, coalRock: a.lith_coal_rock || null, coal: a.lith_coal || null,
      note: String(a.other || '').trim(), cooler: cool, coolerNo: mm ? +mm[1] : null, coolerOk: /^cooler \d+$/i.test(cool),
      mark: a.arrow_marking || null, typeTop: a.type_top || null, typeBot: a.type_bot || null, airT: num(a.air_temperature),
      ms, date: ms ? ubDate(ms) : null
    };
  }
  function ingest(parents, samples) {
    PAR = new Map(parents.map(parseParent).map((p) => [p.gid, p]));
    RECS = samples.map(parseSample).sort((a, b) => (a.hole.localeCompare(b.hole)) || ((a.from == null ? 1e9 : a.from) - (b.from == null ? 1e9 : b.from)) || (a.oid - b.oid));
    const ds = RECS.map((r) => r.date).filter(Boolean).sort();
    DATA_MIN = ds[0] || null; DATA_MAX = ds[ds.length - 1] || null;
    const hm = new Map(); RECS.forEach((r) => hm.set(r.hole, (hm.get(r.hole) || 0) + 1));
    HOLES = [...hm].sort((a, b) => a[0].localeCompare(b[0])).map(([h, n]) => ({ h, n }));
    LAST = Date.now();
  }
  async function loadData(isRefresh) {
    const main = $('main'); if (isRefresh) main.classList.add('busy');
    $('refreshBtn').disabled = true;
    try {
      const [m0, m1] = await Promise.all([API.get(CONFIG.svc + '/0'), API.get(CONFIG.svc + '/1')]);
      loadDomains(m0.fields); loadDomains(m1.fields);
      const [ps, ss] = await Promise.all([queryAll(CONFIG.svc + '/0', { outFields: P_FIELDS }), queryAll(CONFIG.svc + '/1', { outFields: S_FIELDS })]);
      ingest(ps, ss);
      if (!F.from || F.preset !== 'custom') setPreset(F.preset === 'custom' ? 'all' : F.preset);
      showError(''); $('loading').style.display = 'none';
      renderFilters(); update();
      ATT_DONE = false; loadAttachments().then(() => { ATT_DONE = true; renderTab(); });
    } catch (e) { showError(t('err.load', (e && e.message) || e)); }
    finally { main.classList.remove('busy'); $('refreshBtn').disabled = false; }
  }
  async function loadAttachments() {
    const ids = RECS.map((r) => r.oid);
    for (let i = 0; i < ids.length; i += 400) {
      try {
        const d = await API.get(CONFIG.svc + '/1/queryAttachments', { objectIds: ids.slice(i, i + 400).join(','), returnMetadata: false });
        (d.attachmentGroups || []).forEach((g) => {
          ATT.set(g.parentObjectId, (g.attachmentInfos || []).filter((a) => /^image\//i.test(a.contentType || 'image/')).map((a) => ({ id: a.id, name: a.name, url: CONFIG.svc + '/1/' + g.parentObjectId + '/attachments/' + a.id })));
        });
      } catch (e) { /* зураг заавал биш */ }
    }
  }
  function showError(msg) { const b = $('errbox'); b.textContent = msg || ''; b.style.display = msg ? 'block' : 'none'; if (msg) $('loading').style.display = 'none'; }

  /* ---------------- Шүүлтүүр ---------------- */
  function setPreset(p) {
    F.preset = p;
    const end = DATA_MAX || new Date().toISOString().slice(0, 10);
    if (p === 'all') { F.from = DATA_MIN || end; F.to = end; }
    else if (p === 'month') { F.from = end.slice(0, 8) + '01'; F.to = end; }
    else { F.from = addDays(end, -(+p - 1)); F.to = end; }
    if (DATA_MIN && F.from < DATA_MIN) F.from = DATA_MIN;
  }
  const key = (v) => (v == null || v === '' ? '__none' : v);
  function passBase(r) {
    return !F.exHoles.has(r.hole) && !F.exUnits.has(key(r.unit)) && !F.exZones.has(key(r.zone)) && !F.exStr.has(key(r.str));
  }
  const inPeriod = (r) => !r.date || (r.date >= F.from && r.date <= F.to);
  function compute() { FREC = RECS.filter((r) => passBase(r) && inPeriod(r)); }
  function chkRow(box, label, count, checked, onChange, color) {
    const lab = el('label', { class: 'chk' }, box);
    const cb = el('input', { type: 'checkbox' }, lab); cb.checked = checked;
    cb.addEventListener('change', () => onChange(cb.checked));
    if (color) { const d = el('span', { class: 'dot' }, lab); d.style.background = color; d.style.borderRadius = '2px'; }
    el('span', null, lab, label);
    el('span', { class: 'meta' }, lab, fmtI(count));
  }
  function renderFilters() {
    document.querySelectorAll('#presets button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.days === F.preset)));
    $('dFrom').value = F.from || ''; $('dTo').value = F.to || '';
    $('dFrom').min = $('dTo').min = DATA_MIN || ''; $('dFrom').max = $('dTo').max = DATA_MAX || '';
    const hl = $('holeList'); hl.innerHTML = '';
    HOLES.forEach(({ h, n }) => chkRow(hl, h || t('unknown'), n, !F.exHoles.has(h), (on) => { if (on) F.exHoles.delete(h); else F.exHoles.add(h); update(); }));
    $('holesToggle').textContent = F.exHoles.size ? t('f.all') : t('f.none');
    const cnt = (fn) => { const m = new Map(); RECS.forEach((r) => { const k = key(fn(r)); m.set(k, (m.get(k) || 0) + 1); }); return m; };
    const uc = cnt((r) => r.unit), ul = $('unitList'); ul.innerHTML = '';
    [...UNIT_ORDER, ...[...uc.keys()].filter((k) => !UNIT_ORDER.includes(k))].filter((u) => uc.get(u)).forEach((u) =>
      chkRow(ul, u === '__none' ? t('unknown') : unitLbl(u) + (UNIT_ORDER.includes(u) ? '' : ' (' + u + ')'), uc.get(u), !F.exUnits.has(u), (on) => { if (on) F.exUnits.delete(u); else F.exUnits.add(u); update(); }, unitColor(u)));
    const zc = cnt((r) => r.zone), zl = $('zoneList'); zl.innerHTML = '';
    ['1', '2', '__none'].filter((z) => zc.get(z)).forEach((z) => chkRow(zl, z === '__none' ? t('unknown') : zoneLbl(z), zc.get(z), !F.exZones.has(z), (on) => { if (on) F.exZones.delete(z); else F.exZones.add(z); update(); }, ZONE_COLOR[z] || GRAY));
    const sc = cnt((r) => r.str), sl = $('strList'); sl.innerHTML = '';
    [...STR_ORDER, '__none'].filter((s) => sc.get(s)).forEach((s) => chkRow(sl, s === '__none' ? t('unknown') : strLbl(s), sc.get(s), !F.exStr.has(s), (on) => { if (on) F.exStr.delete(s); else F.exStr.add(s); update(); }, strColor(s)));
  }
  function update() {
    compute();
    document.querySelectorAll('#presets button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.days === F.preset)));
    $('dFrom').value = F.from || ''; $('dTo').value = F.to || '';
    $('holesToggle').textContent = F.exHoles.size ? t('f.all') : t('f.none');
    const lastP = [...PAR.values()].filter((p) => p.date).sort((a, b) => b.ms - a.ms)[0];
    $('asof').textContent = t('asof', fmtDate(lastP ? lastP.date : DATA_MAX), fmtI(RECS.length), fmtI(HOLES.length));
    $('updated').textContent = LAST ? t('updated', ubNow()) : '';
    renderTab();
  }

  /* ---------------- Табууд ---------------- */
  const TABS = ['overview', 'holes', 'samples', 'coolers', 'dq'];
  function setTab(name, noHash) {
    if (!TABS.includes(name)) name = 'overview';
    TAB = name;
    document.querySelectorAll('.tabs [role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b.id === 't-' + name)));
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('on', p.id === 'p-' + name));
    if (!noHash) history.replaceState(null, '', '#' + name);
    tipHide(); renderTab();
  }
  function renderTab() {
    if (!RECS.length) return;
    if (TAB === 'overview') renderOverview();
    else if (TAB === 'holes') renderHoles();
    else if (TAB === 'samples') renderSamples();
    else if (TAB === 'coolers') renderCoolers();
    else if (TAB === 'dq') renderDQ();
  }

  /* ---------------- 1. Тойм ---------------- */
  function kpi(box, label, value, unit, lines) {
    const c = el('div', { class: 'card kpi' }, box);
    el('div', { class: 'lbl' }, c, label);
    const v = el('div', { class: 'val' }, c, value); if (unit) el('small', null, v, unit);
    (lines || []).forEach((l) => el('div', { class: 'sub2' }, c, l));
    return c;
  }
  function renderOverview() {
    const box = $('kpis'); box.innerHTML = '';
    if (!FREC.length) { el('div', { class: 'card empty' }, box, t('noData')); }
    const n = FREC.length, end = F.to, s7 = addDays(end, -6);
    const last7 = FREC.filter((r) => r.date && r.date >= s7 && r.date <= end);
    const holes = new Set(FREC.map((r) => r.hole));
    const len = FREC.reduce((a, r) => a + (r.len > 0 ? r.len : 0), 0);
    const lens = FREC.filter((r) => r.len > 0);
    const crit = FREC.filter((r) => r.zone === '1').length, imp = FREC.filter((r) => r.zone === '2').length;
    kpi(box, t('k.samples'), fmtI(n), t('u.pcs'), [t('k.last7', fmtI(last7.length))]);
    kpi(box, t('k.holes'), fmtI(holes.size), '', [t('k.active', fmtI(new Set(last7.map((r) => r.hole)).size))]);
    kpi(box, t('k.len'), fmt(len), t('u.m'), [t('k.avgLen', lens.length ? fmt(len / lens.length * 100, 0) : '–')]);
    kpi(box, t('k.crit'), pct(crit, n), '', [fmtI(crit) + ' ' + t('u.pcs') + ' · ' + t('k.imp', fmtI(imp))]);
    const ph = FREC.filter((r) => (ATT.get(r.oid) || []).length).length;
    kpi(box, t('k.photo'), ATT_DONE ? pct(ph, n) : '…', '', [ATT_DONE ? t('k.noPhoto', fmtI(n - ph)) : t('k.photoLoading')]);
    renderWeekly(); renderSessions(); renderUnitChart(); renderRockChart();
    renderDist($('strChart'), STR_ORDER, (r) => r.str, STR_COLOR, strLbl);
    renderDist($('wthChart'), WTH_ORDER, (r) => r.wth, WTH_COLOR, wthLbl);
    renderCondChart();
  }
  function renderWeekly() {
    const host = $('weeklyChart'); host.innerHTML = '';
    legend($('weeklyLegend'), [{ color: ZONE_COLOR[1], label: t('z.1') }, { color: ZONE_COLOR[2], label: t('z.2') }]);
    if (!FREC.length || !F.from) { el('div', { class: 'empty' }, host, t('noData')); return; }
    const weeks = []; for (let w = weekStart(F.from); w <= F.to; w = addDays(w, 7)) weeks.push(w);
    $('weeklySub').textContent = t('c.weeks', weeks.length);
    const agg = new Map(weeks.map((w) => [w, { c: 0, i: 0, u: 0, holes: new Map() }]));
    FREC.forEach((r) => { if (!r.date) return; const a = agg.get(weekStart(r.date)); if (!a) return; if (r.zone === '1') a.c++; else if (r.zone === '2') a.i++; else a.u++; a.holes.set(r.hole, (a.holes.get(r.hole) || 0) + 1); });
    const W = Math.max(320, host.clientWidth || 640), H = W < 560 ? 240 : 330, m = { l: 40, r: 10, t: 10, b: 26 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const vals = weeks.map((w) => agg.get(w)), mx = Math.max(1, ...vals.map((v) => v.c + v.i + v.u));
    const { top, ticks } = nice(mx * 1.05, 4), y = (v) => m.t + ph - v / top * ph;
    const band = pw / weeks.length, bw = Math.max(2, Math.min(26, band * 0.7));
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': t('c.weekly') }, host);
    ticks.forEach((v) => { S('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v ? '#e7e7e7' : '#c2c2c2', 'shape-rendering': 'crispEdges' }, svg); S('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#5b6670' }, svg, fmtI(v)); });
    let lastLab = -1e9;
    vals.forEach((v, i) => {
      const x = m.l + i * band + (band - bw) / 2;
      let base = y(0);
      [[v.c, ZONE_COLOR[1]], [v.i, ZONE_COLOR[2]], [v.u, GRAY]].forEach(([n, col], k, arr) => {
        if (!n) return;
        const h = y(0) - y(n), isTop = arr.slice(k + 1).every((z) => !z[0]);
        const gap = k > 0 && base < y(0) ? 2 : 0;
        S('path', { d: isTop ? colPath(x, base - h + gap, bw, Math.max(0.5, h - gap), 3) : `M${x},${base}V${base - h + gap}H${x + bw}V${base}Z`, fill: col }, svg);
        base -= h;
      });
      const d = weeks[i];
      if (m.l + i * band - lastLab > 56 && (d.slice(8, 10) <= '07' || weeks.length <= 10)) { S('text', { x: m.l + i * band + band / 2, y: H - 8, 'text-anchor': 'middle', 'font-size': 11, fill: '#5b6670' }, svg, weeks.length > 16 ? (LANG === 'en' ? MONTHS_EN[+d.slice(5, 7) - 1] : d.slice(5, 7) + '-р сар') : fmtDate(d, 'short')); lastLab = m.l + i * band; }
      const hit = S('rect', { x: m.l + i * band, y: m.t, width: band, height: ph, fill: 'transparent' }, svg);
      bindTip(hit, (T) => {
        tipHead(T, t('c.week', fmtDate(d, 'short'), fmtDate(addDays(d, 6), 'short')));
        tipRow(T, null, fmtI(v.c + v.i + v.u), t('c.total'));
        if (v.c) tipRow(T, ZONE_COLOR[1], fmtI(v.c), t('z.1'));
        if (v.i) tipRow(T, ZONE_COLOR[2], fmtI(v.i), t('z.2'));
        if (v.u) tipRow(T, GRAY, fmtI(v.u), t('unknown'));
        if (v.holes.size) { tipSep(T); [...v.holes].sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([h, n]) => tipRow(T, null, fmtI(n), h)); }
      });
    });
  }
  function sessionsOf(recs) {
    const m = new Map();
    recs.forEach((r) => { const k = r.p ? r.p.gid : 'x' + r.date + r.hole; let s = m.get(k); if (!s) { s = { p: r.p, date: r.date, ms: r.ms || 0, hole: r.hole, n: 0, min: Infinity, max: -Infinity }; m.set(k, s); } s.n++; if (r.from != null) s.min = Math.min(s.min, r.from); if (r.to != null) s.max = Math.max(s.max, r.to); });
    return [...m.values()].sort((a, b) => b.ms - a.ms);
  }
  function renderSessions() {
    const ul = $('sessList'); ul.innerHTML = '';
    const ss = sessionsOf(FREC).slice(0, 8);
    if (!ss.length) { el('li', { class: 'empty' }, ul, t('noData')); return; }
    ss.forEach((s) => {
      const li = el('li', null, ul);
      el('time', { datetime: s.date || '' }, li, fmtDateAuto(s.date));
      const mid = el('div', null, li); el('b', null, mid, s.hole);
      const w = who(s.p); if (w) el('div', { class: 'who' }, mid, w);
      const n = el('div', { class: 'n' }, li, fmtI(s.n) + (t('u.pcs') ? ' ' + t('u.pcs') : '')); el('small', null, n, isFinite(s.min) ? fmt2(s.min) + '–' + fmt2(s.max) + ' ' + t('u.m') : '');
    });
  }
  function hbarChart(host, rows, opts) {
    host.innerHTML = '';
    if (!rows.length) { el('div', { class: 'empty' }, host, t('noData')); return; }
    const W = Math.max(300, host.clientWidth || 480), rowH = 26, lw = opts.lw || 150, rw = 64, H = rows.length * rowH + 8;
    const mx = Math.max(1, ...rows.map((r) => r.total)), pw = W - lw - rw;
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': opts.title || '' }, host);
    rows.forEach((r, i) => {
      const yy = 4 + i * rowH, bh = 16;
      const maxCh = Math.floor((lw - (r.dot ? 26 : 10)) / 6.6);
      S('text', { x: lw - (r.dot ? 22 : 8), y: yy + bh - 3, 'text-anchor': 'end', 'font-size': 12, fill: '#191919' }, svg, r.label.length > maxCh ? r.label.slice(0, maxCh - 1) + '…' : r.label);
      if (r.dot) S('rect', { x: lw - 17, y: yy + 3.5, width: 9, height: 9, rx: 2, fill: r.dot }, svg);
      let x = lw;
      const segs = r.segs || [{ v: r.total, color: opts.color }];
      segs.forEach((s, k) => {
        if (!s.v) return;
        const w = s.v / mx * pw, isLast = segs.slice(k + 1).every((z) => !z.v);
        const g = k > 0 && x > lw ? 2 : 0;
        S('path', { d: isLast ? hbarPath(x + g, yy, Math.max(0.5, w - g), bh, 3) : `M${x + g},${yy}H${x + w}V${yy + bh}H${x + g}Z`, fill: s.color }, svg);
        x += w;
      });
      S('text', { x: x + 6, y: yy + bh - 3, 'font-size': 12, fill: '#191919', 'font-weight': 600, style: 'font-variant-numeric:tabular-nums' }, svg, fmtI(r.total) + (opts.pctOf ? '  ' + pct(r.total, opts.pctOf) : ''));
      const hit = S('rect', { x: 0, y: yy - 4, width: W, height: rowH, fill: 'transparent' }, svg);
      bindTip(hit, (T) => { tipHead(T, r.label); tipRow(T, null, fmtI(r.total), t('c.total') + (opts.pctOf ? ' · ' + pct(r.total, opts.pctOf) : '')); (r.segs || []).forEach((s) => { if (s.v) tipRow(T, s.color, fmtI(s.v), s.label); }); });
    });
  }
  function renderUnitChart() {
    legend($('unitLegend'), [{ color: ZONE_COLOR[1], label: t('z.1') }, { color: ZONE_COLOR[2], label: t('z.2') }]);
    const m = new Map(); FREC.forEach((r) => { const k = r.unit || '__none'; const o = m.get(k) || { c: 0, i: 0, u: 0 }; if (r.zone === '1') o.c++; else if (r.zone === '2') o.i++; else o.u++; m.set(k, o); });
    const order = [...UNIT_ORDER, ...[...m.keys()].filter((k) => !UNIT_ORDER.includes(k))];
    const rows = order.filter((k) => m.get(k)).map((k) => { const o = m.get(k); return { label: k === '__none' ? t('unknown') : unitLbl(k) + (UNIT_ORDER.includes(k) ? '' : ' (' + k + ')'), dot: unitColor(k), total: o.c + o.i + o.u, segs: [{ v: o.c, color: ZONE_COLOR[1], label: t('z.1') }, { v: o.i, color: ZONE_COLOR[2], label: t('z.2') }, { v: o.u, color: GRAY, label: t('unknown') }] }; });
    hbarChart($('unitChart'), rows, { lw: 200, title: t('c.unit'), pctOf: FREC.length });
  }
  function renderRockChart() {
    const m = new Map(); FREC.forEach((r) => { const k = rockOf(r); const kk = k ? k.key : '__none'; const o = m.get(kk) || { n: 0, label: k ? k.label + (k.code && k.label !== k.code ? ' (' + k.code + ')' : '') : t('unknown') }; o.n++; m.set(kk, o); });
    let rows = [...m.values()].sort((a, b) => b.n - a.n).map((o) => ({ label: o.label, total: o.n }));
    if (rows.length > 10) { const rest = rows.slice(9).reduce((a, r) => a + r.total, 0); rows = rows.slice(0, 9).concat([{ label: t('other'), total: rest }]); }
    hbarChart($('rockChart'), rows, { lw: 170, color: '#1B4560', title: t('c.rock'), pctOf: FREC.length });
  }
  function renderCondChart() {
    const m = new Map(); FREC.forEach((r) => { const k = r.cond || '__none'; m.set(k, (m.get(k) || 0) + 1); });
    const rows = [...m].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ label: k === '__none' ? t('unknown') : lbl('_condition', k), total: n }));
    hbarChart($('condChart'), rows, { lw: 150, color: '#00a88f', title: t('c.cond') });
  }
  function renderDist(host, order, get, colors, label) {
    host.innerHTML = '';
    const m = new Map(); FREC.forEach((r) => { const k = get(r) || '__none'; m.set(k, (m.get(k) || 0) + 1); });
    const keys = [...order.filter((k) => m.get(k)), ...(m.get('__none') ? ['__none'] : [])];
    if (!keys.length) { el('div', { class: 'empty' }, host, t('noData')); return; }
    const W = Math.max(240, host.clientWidth || 300), H = 200, m2 = { l: 8, r: 8, t: 18, b: 24 }, pw = W - m2.l - m2.r, ph = H - m2.t - m2.b;
    const mx = Math.max(1, ...keys.map((k) => m.get(k))), band = pw / keys.length, bw = Math.min(40, band * 0.68);
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img' }, host);
    S('line', { x1: m2.l, x2: W - m2.r, y1: m2.t + ph, y2: m2.t + ph, stroke: '#c2c2c2' }, svg);
    keys.forEach((k, i) => {
      const v = m.get(k), h = v / mx * ph, x = m2.l + i * band + (band - bw) / 2, col = k === '__none' ? GRAY : colors[order.indexOf(k)];
      S('path', { d: colPath(x, m2.t + ph - h, bw, Math.max(0.5, h), 4), fill: col }, svg);
      S('text', { x: x + bw / 2, y: m2.t + ph - h - 4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: '#191919' }, svg, fmtI(v));
      S('text', { x: x + bw / 2, y: H - 8, 'text-anchor': 'middle', 'font-size': 11.5, fill: '#5b6670' }, svg, k === '__none' ? '?' : k);
      const hit = S('rect', { x: m2.l + i * band, y: 0, width: band, height: H, fill: 'transparent' }, svg);
      bindTip(hit, (T) => { tipHead(T, k === '__none' ? t('unknown') : label(k)); tipRow(T, col, fmtI(v), pct(v, FREC.length)); });
    });
  }

  /* ---------------- 2. Цооногоор ---------------- */
  function holeStats(recs) {
    const m = new Map();
    recs.forEach((r) => {
      let h = m.get(r.hole);
      if (!h) { h = { hole: r.hole, n: 0, crit: 0, min: Infinity, max: -Infinity, len: 0, first: null, last: null, days: new Set(), coolers: new Set(), photo: 0, recs: [], who: new Set() }; m.set(r.hole, h); }
      h.n++; if (r.zone === '1') h.crit++; if (r.from != null) h.min = Math.min(h.min, r.from); if (r.to != null) h.max = Math.max(h.max, r.to); if (r.len > 0) h.len += r.len;
      if (r.date) { if (!h.first || r.date < h.first) h.first = r.date; if (!h.last || r.date > h.last) h.last = r.date; h.days.add(r.date); }
      if (r.cooler) h.coolers.add(r.coolerNo != null ? r.coolerNo : r.cooler);
      if ((ATT.get(r.oid) || []).length) h.photo++;
      const w = who(r.p); if (w) w.split(', ').forEach((x) => h.who.add(x));
      h.recs.push(r);
    });
    return [...m.values()].sort((a, b) => (b.last || '').localeCompare(a.last || '') || a.hole.localeCompare(b.hole));
  }
  function renderHoles() {
    const hs = holeStats(FREC), issues = issuesByOid();
    $('holesSub').textContent = '· ' + fmtI(hs.length) + ' ' + t('col.hole').toLowerCase();
    const wrap = $('holesTbl'); wrap.innerHTML = '';
    if (!hs.length) { el('div', { class: 'empty' }, wrap, t('noData')); $('holeCard').hidden = true; return; }
    const tb = el('table', { class: 'tbl htbl' }, wrap), thr = el('tr', null, el('thead', null, tb));
    [['col.hole'], ['col.samples', 1], ['col.crit', 1], ['col.depth', 1], ['col.len', 1], ['col.dates'], ['col.days', 1], ['col.coolers', 1], ['col.photo', 1], ['col.issues', 1]].forEach(([k, n]) => el('th', { class: n ? 'num' : null, scope: 'col' }, thr, t(k)));
    const body = el('tbody', null, tb), mx = Math.max(...hs.map((h) => h.n));
    if (!SELHOLE || !hs.some((h) => h.hole === SELHOLE)) SELHOLE = hs[0].hole;
    hs.forEach((h) => {
      const tr = el('tr', { tabindex: 0, class: h.hole === SELHOLE ? 'sel' : null }, body);
      el('td', { class: 'hole' }, tr, h.hole);
      const tdn = el('td', { class: 'num' }, tr); const bm = el('span', { class: 'bar-mini', style: 'width:54px;margin-right:8px' }, tdn); const sp = el('span', null, bm); sp.style.width = (h.n / mx * 100) + '%'; sp.style.background = '#257de0'; tdn.appendChild(document.createTextNode(fmtI(h.n)));
      el('td', { class: 'num' }, tr, fmtI(h.crit));
      el('td', { class: 'num' }, tr, isFinite(h.min) ? fmt2(h.min) + ' – ' + fmt2(h.max) : '–');
      el('td', { class: 'num' }, tr, fmt(h.len));
      el('td', null, tr, h.first === h.last ? fmtDateAuto(h.first) : fmtDateAuto(h.first) + ' – ' + fmtDateAuto(h.last));
      el('td', { class: 'num' }, tr, fmtI(h.days.size));
      el('td', { class: 'num' }, tr, fmtI(h.coolers.size));
      el('td', { class: 'num' }, tr, ATT_DONE ? pct(h.photo, h.n) : '…');
      const iss = h.recs.filter((r) => issues.has(r.oid)).length;
      el('td', { class: 'num', style: iss ? 'color:#b3261e;font-weight:700' : null }, tr, iss ? fmtI(iss) : '–');
      const pick = () => { SELHOLE = h.hole; body.querySelectorAll('tr').forEach((x) => x.classList.toggle('sel', x === tr)); renderHoleDetail(h, issues); };
      tr.addEventListener('click', pick); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    $('holeCard').hidden = false;
    renderHoleDetail(hs.find((h) => h.hole === SELHOLE), issues);
  }
  function renderHoleDetail(h, issues) {
    if (!h) return;
    $('hdTitle').textContent = h.hole;
    $('hdMeta').textContent = t('hd.meta', fmtI(h.n), isFinite(h.min) ? fmt2(h.min) : '–', isFinite(h.max) ? fmt2(h.max) : '–', fmt(h.len), fmtI(h.coolers.size)) + (h.who.size ? ' · ' + t('hd.who', [...h.who].join(', ')) : '');
    // Бүтэц (хэсгээр)
    const comp = $('hdComp'); comp.innerHTML = '';
    const um = new Map(); h.recs.forEach((r) => um.set(r.unit || '__none', (um.get(r.unit || '__none') || 0) + 1));
    const order = [...UNIT_ORDER, ...[...um.keys()].filter((k) => !UNIT_ORDER.includes(k))].filter((k) => um.get(k));
    const bar = el('div', { class: 'comp', role: 'img', 'aria-label': order.map((k) => unitLbl(k) + ' ' + um.get(k)).join(', ') }, comp);
    order.forEach((k) => { const s = el('span', null, bar); s.style.width = (um.get(k) / h.n * 100) + '%'; s.style.background = unitColor(k); s.style.borderRight = '2px solid #fff'; bindTip(s, (T) => { tipHead(T, k === '__none' ? t('unknown') : unitLbl(k)); tipRow(T, unitColor(k), fmtI(um.get(k)), pct(um.get(k), h.n)); }); });
    const lg = el('div', { class: 'legend' }, comp);
    order.forEach((k) => { const s = el('span', null, lg); const i = el('i', null, s); i.style.background = unitColor(k); s.appendChild(document.createTextNode((k === '__none' ? t('unknown') : unitLbl(k)) + ' ' + fmtI(um.get(k)))); });
    // Гүний багана
    const recs = h.recs.slice().sort((a, b) => (a.from == null ? 1e9 : a.from) - (b.from == null ? 1e9 : b.from));
    const host = $('hdStrip'); host.innerHTML = '';
    const W = 300, H = 640, m = { t: 30, b: 12, l: 46 }, ph = H - m.t - m.b;
    const maxD = Math.max(10, ...recs.map((r) => r.to || r.from || 0));
    const { top, ticks } = nice(maxD, 8), y = (d) => m.t + d / top * ph;
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': h.hole + ' ' + t('hd.strip.unit') }, host);
    const cols = [{ x: 56, w: 70, k: 'hd.strip.unit' }, { x: 134, w: 70, k: 'hd.strip.str' }, { x: 212, w: 70, k: 'hd.strip.def' }];
    cols.forEach((c) => { S('rect', { x: c.x, y: m.t, width: c.w, height: ph, fill: '#f3f6f8', rx: 4 }, svg); S('text', { x: c.x + c.w / 2, y: 18, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#5b6670' }, svg, t(c.k)); });
    ticks.forEach((v) => { S('line', { x1: m.l, x2: W - 14, y1: y(v), y2: y(v), stroke: '#e3e8ed', 'shape-rendering': 'crispEdges' }, svg); S('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#5b6670' }, svg, fmtI(v)); });
    S('text', { x: 10, y: m.t + ph / 2, 'font-size': 11, fill: '#5b6670', transform: `rotate(-90 10 ${m.t + ph / 2})`, 'text-anchor': 'middle' }, svg, t('col.fromto'));
    recs.forEach((r) => {
      if (r.from == null) return;
      const y0 = y(r.from), hh = Math.max(2, y(r.to != null ? r.to : r.from + 0.3) - y0);
      const g = S('g', { tabindex: 0, role: 'listitem', 'aria-label': r.id + ' ' + fmt2(r.from) + '–' + fmt2(r.to) }, svg);
      S('rect', { x: cols[0].x + 4, y: y0, width: cols[0].w - 8, height: hh, fill: unitColor(r.unit) }, g);
      S('rect', { x: cols[1].x + 4, y: y0, width: cols[1].w - 8, height: hh, fill: strColor(r.str) }, g);
      if (r.typeTop) S('line', { x1: cols[2].x + 6, x2: cols[2].x + cols[2].w - 6, y1: y0, y2: y0, stroke: '#33424c', 'stroke-width': 1.5 }, g);
      if (r.typeBot) S('line', { x1: cols[2].x + 6, x2: cols[2].x + cols[2].w - 6, y1: y0 + hh, y2: y0 + hh, stroke: '#ec4647', 'stroke-width': 1.5 }, g);
      S('rect', { x: m.l, y: y0 - 1, width: W - m.l, height: hh + 2, fill: 'transparent' }, g);
      bindTip(g, (T) => {
        tipHead(T, r.id + ' · ' + fmt2(r.from) + '–' + fmt2(r.to) + ' ' + t('u.m'));
        tipRow(T, unitColor(r.unit), unitLbl(r.unit), zoneLbl(r.zone));
        tipRow(T, strColor(r.str), r.str || '?', r.str ? lbl('strenght', r.str) : t('unknown'));
        if (r.wth) tipRow(T, null, r.wth, lbl('weathering', r.wth));
        if (r.cond) tipRow(T, null, '', lbl('_condition', r.cond));
        if (r.typeTop || r.typeBot) { tipSep(T); if (r.typeTop) tipRow(T, '#33424c', 'Top', lbl('type_top', r.typeTop)); if (r.typeBot) tipRow(T, '#ec4647', 'Bot', lbl('type_bot', r.typeBot)); }
      });
      g.addEventListener('click', () => { const row = document.getElementById('hs-' + r.oid); if (row) { document.querySelectorAll('#hdList tr.hl').forEach((x) => x.classList.remove('hl')); row.classList.add('hl'); row.scrollIntoView({ block: 'center', behavior: 'smooth' }); } });
    });
    // Жагсаалт
    const wrap = $('hdList'); wrap.innerHTML = '';
    const tb = el('table', { class: 'tbl stbl' }, wrap), thr = el('tr', null, el('thead', null, tb));
    [['col.no', 1], ['col.id'], ['col.fromto', 1], ['col.unit'], ['col.sw'], ['col.cond'], ['col.cooler'], ['photo']].forEach(([k, n]) => el('th', { class: n ? 'num' : null, scope: 'col' }, thr, t(k)));
    const body = el('tbody', null, tb);
    recs.forEach((r, i) => {
      const tr = el('tr', { id: 'hs-' + r.oid }, body);
      el('td', { class: 'num' }, tr, String(i + 1));
      const tdi = el('td', { class: 'id' }, tr, r.id || '–'); if (issues.has(r.oid)) el('span', { class: 'flag', title: issues.get(r.oid).join(' · ') }, tdi, '!');
      const td = el('td', { class: 'num' }, tr, fmt2(r.from) + '–' + fmt2(r.to)); el('span', { class: 'sub' }, td, fmt2(r.len) + ' ' + t('u.m'));
      unitCell(tr, r, true);
      el('td', { style: 'white-space:nowrap', title: [r.str && strLbl(r.str), r.wth && wthLbl(r.wth)].filter(Boolean).join(' · ') || null }, tr, (r.str || '–') + ' · ' + (r.wth || '–'));
      el('td', null, tr, r.cond ? lbl('_condition', r.cond) : '–');
      el('td', { style: 'white-space:nowrap' }, tr, r.cooler || '–');
      photoCell(tr, r, recs);
    });
  }
  function unitCell(tr, r, short) {
    const td = el('td', null, tr); const c = el('span', { class: 'uchip', title: r.unit ? unitLbl(r.unit) : null }, td); const i = el('i', null, c); i.style.background = unitColor(r.unit); c.appendChild(document.createTextNode(r.unit ? (short ? r.unit : unitLbl(r.unit)) : '–'));
    if (r.zone === '1') el('span', { class: 'sub zone1' }, td, t('z.1'));
    return td;
  }

  /* ---------------- Зураг ---------------- */
  function blobUrl(url) {
    if (BLOBS.has(url)) return BLOBS.get(url);
    const pr = API.blob(url).then((b) => { if (b && b.type && !/^image\//i.test(b.type)) throw new Error('not image'); return URL.createObjectURL(b); });
    pr.catch(() => BLOBS.delete(url)); BLOBS.set(url, pr); return pr;
  }
  const thumbUrl = (p) => p.url + (p.url.includes('?') ? '&' : '?') + 'w=320';
  let lazyObs = null;
  function lazyImg(box, p) {
    const ph = el('div', { class: 'ph-ph' }, box, '…');
    const load = () => {
      blobUrl(thumbUrl(p)).catch(() => blobUrl(p.url)).then((u) => {
        const img = el('img', { alt: p.name || '', decoding: 'async' }); img.onload = () => ph.remove(); img.onerror = () => { img.remove(); ph.textContent = '×'; }; img.src = u; box.appendChild(img);
      }).catch(() => { ph.textContent = '×'; });
    };
    if (!('IntersectionObserver' in window)) { load(); return; }
    if (!lazyObs) lazyObs = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { lazyObs.unobserve(e.target); if (e.target.__load) e.target.__load(); } }), { rootMargin: '300px' });
    box.__load = load; lazyObs.observe(box);
  }
  function photoCell(tr, r, list) {
    const td = el('td', { class: 'photocell' }, tr);
    const ps = ATT.get(r.oid) || [];
    if (!ps.length) { td.textContent = ATT_DONE ? '–' : '…'; return; }
    const b = el('button', { class: 'thumb', type: 'button', 'aria-label': t('photo') + ' ' + r.id }, td);
    lazyImg(b, ps[0]);
    b.addEventListener('click', () => {
      const items = []; list.forEach((x) => (ATT.get(x.oid) || []).forEach((p) => items.push({ p, r: x })));
      openPhotos(items, Math.max(0, items.findIndex((it) => it.r === r)));
    });
  }
  let PV = { items: [], i: 0 };
  function openPhotos(items, i) { PV = { items, i }; showPhoto(); const d = $('photoDlg'); if (d.showModal) { if (!d.open) d.showModal(); } else d.setAttribute('open', ''); }
  function showPhoto() {
    const it = PV.items[PV.i]; if (!it) return; const r = it.r;
    $('photoTtl').textContent = r.id + ' · ' + r.hole + ' · ' + fmt2(r.from) + '–' + fmt2(r.to) + ' ' + t('u.m');
    $('photoCount').textContent = PV.items.length > 1 ? t('ph.n', PV.i + 1, PV.items.length) : '';
    $('photoNote').textContent = [unitLbl(r.unit), r.str, r.cond && lbl('_condition', r.cond), r.note].filter(Boolean).join(' · ');
    $('photoPrev').disabled = PV.i <= 0; $('photoNext').disabled = PV.i >= PV.items.length - 1;
    const box = $('photoBox'); box.innerHTML = ''; const ph = el('div', { class: 'ph-ph' }, box, t('ph.loading'));
    const open = $('photoOpen'); open.removeAttribute('href');
    blobUrl(it.p.url).then((u) => { if (PV.items[PV.i] !== it) return; ph.remove(); el('img', { alt: r.id, src: u }, box); open.href = u; open.setAttribute('download', it.p.name || r.id + '.jpg'); }).catch(() => { ph.textContent = t('ph.err'); });
    if (PV.items[PV.i + 1]) blobUrl(PV.items[PV.i + 1].p.url).catch(() => {});
  }

  /* ---------------- 3. Дээжийн жагсаалт ---------------- */
  const SCOLS = [
    { k: 'date', h: 'col.date', v: (r) => r.date || '' }, { k: 'id', h: 'col.id', v: (r) => r.hole + '|' + String(r.seq == null ? 9999 : r.seq).padStart(5, '0') + r.id },
    { k: 'from', h: 'col.fromto', num: 1, v: (r) => r.from == null ? -1 : r.from },
    { k: 'unit', h: 'col.unit', v: (r) => (UNIT_ORDER.indexOf(r.unit) + 1 || 99) * 10 + (r.zone === '1' ? 0 : 1) }, { k: 'rock', h: 'col.rock', v: (r) => (rockOf(r) || { label: '~' }).label },
    { k: 'str', h: 'col.sw', v: (r) => (r.str || 'Z') + (WTH_ORDER.indexOf(r.wth) + 1 || 9) }, { k: 'cond', h: 'col.cond', v: (r) => r.cond || '~' },
    { k: 'cooler', h: 'col.cooler', v: (r) => r.hole + '|' + String(r.coolerNo == null ? 999 : r.coolerNo).padStart(4, '0') }, { k: 'note', h: 'col.note', v: (r) => r.note || '~' }, { k: 'photo', h: 'photo', v: (r) => (ATT.get(r.oid) || []).length }, { k: 'edit', h: 'col.edit' }
  ];
  function sampleRows() {
    const q = SS.q.trim().toLowerCase();
    let rows = q ? FREC.filter((r) => [r.id, r.hole, r.cooler, r.note, r.condOther].join(' ').toLowerCase().includes(q)) : FREC.slice();
    const c = SCOLS.find((x) => x.k === SS.key) || SCOLS[0];
    rows.sort((a, b) => { const va = c.v(a), vb = c.v(b); const d = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb)); return (d || a.hole.localeCompare(b.hole) || (a.from || 0) - (b.from || 0)) * SS.dir; });
    return rows;
  }
  const editUrl = (r) => r.p ? `https://survey123.arcgis.com/share/${CONFIG.formItemId}?mode=edit&objectId=${r.p.oid}` : null;
  function renderSamples() {
    const rows = sampleRows(), issues = issuesByOid();
    $('sampSub').textContent = '· ' + t('s.count', fmtI(rows.length));
    const pages = Math.max(1, Math.ceil(rows.length / CONFIG.pageSize)); if (SS.page >= pages) SS.page = pages - 1;
    const slice = rows.slice(SS.page * CONFIG.pageSize, (SS.page + 1) * CONFIG.pageSize);
    const wrap = $('sampTbl'); wrap.innerHTML = '';
    if (!rows.length) { el('div', { class: 'empty' }, wrap, t('noData')); $('pager').innerHTML = ''; return; }
    const tb = el('table', { class: 'tbl stbl' }, wrap), thr = el('tr', null, el('thead', null, tb));
    SCOLS.forEach((c) => {
      const th = el('th', { class: c.num ? 'num' : null, scope: 'col', 'aria-sort': SS.key === c.k ? (SS.dir > 0 ? 'ascending' : 'descending') : null }, thr);
      if (!c.v || c.k === 'edit') { th.textContent = t(c.h); return; }
      const b = el('button', { class: 'sortb', type: 'button' }, th, t(c.h) + (SS.key === c.k ? (SS.dir > 0 ? ' ▲' : ' ▼') : ''));
      b.addEventListener('click', () => { if (SS.key === c.k) SS.dir = -SS.dir; else { SS.key = c.k; SS.dir = c.k === 'date' ? -1 : 1; } SS.page = 0; renderSamples(); });
    });
    const body = el('tbody', null, tb);
    slice.forEach((r) => {
      const tr = el('tr', null, body);
      el('td', { style: 'white-space:nowrap' }, tr, fmtDateAuto(r.date));
      const tdi = el('td', { class: 'id' }, tr, r.id || '–'); if (issues.has(r.oid)) el('span', { class: 'flag', title: issues.get(r.oid).join(' · ') }, tdi, '!');
      if (!r.id || !r.id.toUpperCase().startsWith(r.hole.toUpperCase())) el('span', { class: 'sub' }, tdi, r.hole);
      const td = el('td', { class: 'num' }, tr, fmt2(r.from) + '–' + fmt2(r.to)); el('span', { class: 'sub' }, td, fmt2(r.len) + ' ' + t('u.m'));
      unitCell(tr, r, true);
      el('td', null, tr, (rockOf(r) || { label: '–' }).label);
      el('td', { style: 'white-space:nowrap', title: [r.str && strLbl(r.str), r.wth && wthLbl(r.wth)].filter(Boolean).join(' · ') || null }, tr, (r.str || '–') + ' · ' + (r.wth || '–'));
      el('td', null, tr, r.cond ? lbl('_condition', r.cond) : '–');
      el('td', { style: 'white-space:nowrap' }, tr, r.cooler || '–');
      const tn = el('td', { class: 'notecell', style: 'min-width:120px;max-width:240px' }, tr); if (r.note) { const d = el('div', { class: 'clamp', tabindex: 0 }, tn, r.note); d.addEventListener('click', () => d.classList.toggle('open')); }
      photoCell(tr, r, slice);
      const te = el('td', null, tr); const u = editUrl(r); if (u) el('a', { href: u, target: '_blank', rel: 'noopener', class: 'editl' }, te, t('edit'));
    });
    const pg = $('pager'); pg.innerHTML = '';
    el('span', null, pg, t('s.page', fmtI(SS.page * CONFIG.pageSize + 1), fmtI(Math.min(rows.length, (SS.page + 1) * CONFIG.pageSize)), fmtI(rows.length)));
    const pb = el('button', { type: 'button' }, pg, t('prev')); pb.disabled = SS.page <= 0; pb.addEventListener('click', () => { SS.page--; renderSamples(); $('sampTbl').scrollTop = 0; });
    const nb = el('button', { type: 'button' }, pg, t('next')); nb.disabled = SS.page >= pages - 1; nb.addEventListener('click', () => { SS.page++; renderSamples(); $('sampTbl').scrollTop = 0; });
  }

  /* ---------------- 4. Сав ---------------- */
  function coolerGroups(recs) {
    const m = new Map();
    recs.forEach((r) => {
      const k = r.hole + '|' + (r.coolerNo != null ? 'n' + r.coolerNo : 'r' + (r.cooler || '–'));
      let g = m.get(k);
      if (!g) { g = { hole: r.hole, no: r.coolerNo, raw: new Set(), n: 0, min: Infinity, max: -Infinity, first: null, last: null, ids: [], bad: false }; m.set(k, g); }
      g.n++; g.raw.add(r.cooler || '–'); if (!r.coolerOk) g.bad = true;
      if (r.from != null) g.min = Math.min(g.min, r.from); if (r.to != null) g.max = Math.max(g.max, r.to);
      if (r.date) { if (!g.first || r.date < g.first) g.first = r.date; if (!g.last || r.date > g.last) g.last = r.date; }
      g.ids.push(r);
    });
    return [...m.values()].sort((a, b) => a.hole.localeCompare(b.hole) || (a.no == null ? 999 : a.no) - (b.no == null ? 999 : b.no));
  }
  function renderCoolers() {
    const gs = coolerGroups(FREC), holes = new Set(gs.map((g) => g.hole));
    $('coolSub').textContent = '· ' + t('k.sub', fmtI(gs.length), fmtI(holes.size));
    const wrap = $('coolTbl'); wrap.innerHTML = '';
    if (!gs.length) { el('div', { class: 'empty' }, wrap, t('noData')); return; }
    const tb = el('table', { class: 'tbl ctbl' }, wrap), thr = el('tr', null, el('thead', null, tb));
    [['col.hole'], ['col.cooler'], ['col.samples', 1], ['col.ids'], ['col.depth', 1], ['col.dates']].forEach(([k, n]) => el('th', { class: n ? 'num' : null, scope: 'col' }, thr, t(k)));
    const body = el('tbody', null, tb); let cur = null;
    gs.forEach((g) => {
      if (g.hole !== cur) {
        cur = g.hole; const all = gs.filter((x) => x.hole === cur);
        const tr = el('tr', null, body); el('td', { class: 'grp', colspan: 2 }, tr, cur);
        el('td', { class: 'num grp' }, tr, fmtI(all.reduce((a, x) => a + x.n, 0))); el('td', { class: 'grp', colspan: 3 }, tr, fmtI(all.length) + ' ' + t('col.coolers').toLowerCase());
      }
      const tr = el('tr', null, body);
      el('td', null, tr, '');
      const tc = el('td', { style: 'white-space:nowrap' }, tr, [...g.raw].join(', ')); if (g.bad) el('span', { class: 'flag' }, tc, t('k.badName'));
      el('td', { class: 'num' }, tr, fmtI(g.n));
      const ids = g.ids.slice().sort((a, b) => (a.from || 0) - (b.from || 0));
      el('td', null, tr, ids.length > 1 ? ids[0].id + ' … ' + ids[ids.length - 1].id : (ids[0].id || '–'));
      el('td', { class: 'num' }, tr, isFinite(g.min) ? fmt2(g.min) + ' – ' + fmt2(g.max) : '–');
      el('td', { style: 'white-space:nowrap' }, tr, g.first === g.last ? fmtDateAuto(g.first) : fmtDateAuto(g.first) + ' – ' + fmtDateAuto(g.last));
    });
  }

  /* ---------------- 5. Өгөгдлийн чанар ---------------- */
  function runChecks(recs) {
    const C = [];
    const add = (id, sev, rows, val) => C.push({ id, sev, rows, val });
    add('interval', 'critical', recs.filter((r) => r.from != null && r.to != null && r.to <= r.from), (r) => fmt2(r.from) + ' → ' + fmt2(r.to));
    const ids = new Map(); recs.forEach((r) => { if (r.id) ids.set(r.id, (ids.get(r.id) || 0) + 1); });
    add('dup', 'critical', recs.filter((r) => r.id && ids.get(r.id) > 1), (r) => '×' + ids.get(r.id));
    const ov = []; const byH = new Map(); recs.forEach((r) => { if (r.from != null && r.to != null && r.to > r.from) { if (!byH.has(r.hole)) byH.set(r.hole, []); byH.get(r.hole).push(r); } });
    byH.forEach((rs) => { rs.sort((a, b) => a.from - b.from); for (let i = 1; i < rs.length; i++) if (rs[i].from < rs[i - 1].to - 0.005) { rs[i].__ov = rs[i - 1]; ov.push(rs[i]); } });
    add('overlap', 'serious', ov, (r) => r.__ov.id + ' ' + fmt2(r.__ov.from) + '–' + fmt2(r.__ov.to));
    add('unit', 'serious', recs.filter((r) => r.unit && !inDomain('sampling_unit', r.unit)), (r) => r.unit);
    add('prefix', 'serious', recs.filter((r) => r.id && r.hole && !r.id.toUpperCase().startsWith(r.hole.toUpperCase())), (r) => r.id);
    add('hole', 'warning', recs.filter((r) => r.p && r.p.hole && r.hole && r.p.hole !== r.hole), (r) => r.p.hole + ' ≠ ' + r.hole);
    add('thk', 'warning', recs.filter((r) => r.thk != null && r.len != null && Math.abs(r.thk - r.len) > 0.02), (r) => 'Thk ' + fmt2(r.thk) + ' / ' + fmt2(r.len));
    add('cooler', 'warning', recs.filter((r) => !r.coolerOk), (r) => r.cooler || '∅');
    add('attr', 'warning', recs.filter((r) => !r.str || !r.wth || !r.cond), (r) => [!r.str && t('col.str'), !r.wth && t('col.wth'), !r.cond && t('col.cond')].filter(Boolean).join(', '));
    add('lith', 'warning', recs.filter((r) => !rockOf(r)), () => '∅');
    const gaps = []; const seqH = new Map(); recs.forEach((r) => { if (r.seq != null) { if (!seqH.has(r.hole)) seqH.set(r.hole, []); seqH.get(r.hole).push(r); } });
    seqH.forEach((rs) => { rs.sort((a, b) => a.seq - b.seq); for (let i = 1; i < rs.length; i++) { const d = rs[i].seq - rs[i - 1].seq; if (d > 1) { rs[i].__gap = d === 2 ? String(rs[i - 1].seq + 1) : (rs[i - 1].seq + 1) + '–' + (rs[i].seq - 1); gaps.push(rs[i]); } } });
    add('seq', 'info', gaps, (r) => t('dq.missing', r.__gap));
    if (ATT_DONE) add('photo', 'info', recs.filter((r) => !(ATT.get(r.oid) || []).length), () => '∅');
    add('mark', 'info', recs.filter((r) => r.mark !== 'Yes'), (r) => r.mark || '∅');
    return C;
  }
  let ISSUE_CACHE = null;
  function issuesByOid() {
    if (ISSUE_CACHE && ISSUE_CACHE.n === FREC && ISSUE_CACHE.a === ATT_DONE && ISSUE_CACHE.l === LANG) return ISSUE_CACHE.m;
    const m = new Map();
    runChecks(FREC).filter((c) => c.sev !== 'info').forEach((c) => c.rows.forEach((r) => { if (!m.has(r.oid)) m.set(r.oid, []); m.get(r.oid).push(t('dq.' + c.id)); }));
    ISSUE_CACHE = { n: FREC, a: ATT_DONE, l: LANG, m }; return m;
  }
  const SEV_COLOR = { critical: '#dc3c3d', serious: '#f18a59', warning: '#fbb315', info: '#5b6670' };
  const SEV_ICON = { critical: '<circle cx="8" cy="8" r="7" fill="#dc3c3d"/><path d="M8 4v5M8 11.5v.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>', serious: '<path d="M8 1l7 13H1z" fill="#f18a59"/><path d="M8 6v4M8 12v.3" stroke="#fff" stroke-width="2" stroke-linecap="round"/>', warning: '<path d="M8 1l7 13H1z" fill="#fbb315"/><path d="M8 6v4M8 12v.3" stroke="#191919" stroke-width="2" stroke-linecap="round"/>', info: '<circle cx="8" cy="8" r="7" fill="#5b6670"/><path d="M8 7v5M8 4.5v.3" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' };
  const sevIcon = (s) => '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">' + SEV_ICON[s] + '</svg>';
  function renderDQ() {
    const checks = runChecks(FREC);
    const box = $('dqKpis'); box.innerHTML = '';
    const tot = checks.reduce((a, c) => a + (c.sev === 'info' ? 0 : c.rows.length), 0);
    kpi(box, t('dq.total'), fmtI(tot), '', [fmtI(FREC.length) + ' ' + t('k.samples').toLowerCase()]);
    ['critical', 'serious', 'warning', 'info'].forEach((s) => { const c = kpi(box, '', fmtI(checks.filter((x) => x.sev === s).reduce((a, x) => a + x.rows.length, 0))); c.querySelector('.lbl').innerHTML = '<span class="sev">' + sevIcon(s) + ' ' + t('sev.' + s) + '</span>'; });
    const list = $('dqList'); list.innerHTML = '';
    const shown = checks.filter((c) => c.rows.length);
    if (!shown.length) { el('div', { class: 'card ok mt' }, list, '✓ ' + t('dq.ok')); return; }
    shown.forEach((c) => {
      const d = el('details', { class: 'dq' }, list); if (c.sev === 'critical') d.open = true;
      const sm = el('summary', null, d); sm.innerHTML = sevIcon(c.sev); el('span', null, sm, t('dq.' + c.id)); el('span', { class: 'cnt' }, sm, fmtI(c.rows.length));
      el('div', { class: 'why' }, d, t('dq.' + c.id + '.w'));
      const wrap = el('div', { class: 'tblwrap' }, d);
      const tb = el('table', { class: 'tbl' }, wrap), thr = el('tr', null, el('thead', null, tb));
      [['col.date'], ['col.hole'], ['col.id'], ['col.fromto', 1], ['col.value'], ['col.edit']].forEach(([k, n]) => el('th', { class: n ? 'num' : null, scope: 'col' }, thr, t(k)));
      const body = el('tbody', null, tb);
      c.rows.slice(0, 500).forEach((r) => {
        const tr = el('tr', null, body);
        el('td', { style: 'white-space:nowrap' }, tr, fmtDateAuto(r.date)); el('td', { class: 'hole' }, tr, r.hole); el('td', null, tr, r.id || '–');
        el('td', { class: 'num' }, tr, fmt2(r.from) + '–' + fmt2(r.to)); el('td', null, tr, c.val(r));
        const te = el('td', null, tr); const u = editUrl(r); if (u) el('a', { href: u, target: '_blank', rel: 'noopener', class: 'editl' }, te, t('edit'));
      });
    });
  }

  /* ---------------- Тайлан татах ---------------- */
  const libCache = {};
  function loadExcel() {
    if (window.ExcelJS) return Promise.resolve();
    if (libCache.x) return libCache.x;
    const tryUrl = (src) => new Promise((res, rej) => {
      const d = window.define; window.define = undefined;
      const sc = document.createElement('script'); sc.src = src; sc.async = true;
      sc.onload = () => { window.define = d; window.ExcelJS ? res() : rej(new Error('exceljs')); };
      sc.onerror = () => { window.define = d; sc.remove(); rej(new Error('exceljs')); };
      document.head.appendChild(sc);
    });
    libCache.x = tryUrl('../shared/lib/exceljs.min.js').catch(() => tryUrl('https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js')).catch((e) => { delete libCache.x; throw e; });
    return libCache.x;
  }
  function saveBlob(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000); }
  function sampleTable(recs) {
    const cols = [t('col.date'), t('col.hole'), t('col.id'), 'From', 'To', t('col.l'), t('col.unit'), t('col.zone'), t('col.rock'), t('col.str'), t('col.wth'), t('col.cond'), t('col.cooler'), t('col.note'), t('photo')];
    const rows = recs.map((r) => [r.date || '', r.hole, r.id, r.from, r.to, r.len, r.unit ? unitLbl(r.unit) : '', r.zone ? zoneLbl(r.zone) : '', (rockOf(r) || { label: '' }).label, r.str || '', r.wth || '', r.cond ? lbl('_condition', r.cond) : '', r.cooler, r.note, (ATT.get(r.oid) || []).length]);
    return { cols, rows };
  }
  async function runExport() {
    const fmtSel = (document.querySelector('input[name=expFmt]:checked') || {}).value || 'xlsx';
    const st = $('expStatus'); st.className = ''; st.innerHTML = '<span class="spin"></span> ' + t('exp.busy'); $('expGo').disabled = true;
    const recs = FREC.slice().sort((a, b) => a.hole.localeCompare(b.hole) || (a.from || 0) - (b.from || 0));
    const base = 'ETT-Geotech_rock-sampling_' + (F.to || '');
    try {
      const sm = sampleTable(recs);
      if (fmtSel === 'csv') {
        const esc = (v) => { const s = v == null ? '' : String(v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
        const csv = '﻿' + [sm.cols, ...sm.rows].map((r) => r.map(esc).join(',')).join('\r\n');
        saveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), base + '.csv');
      } else {
        await loadExcel();
        const wb = new window.ExcelJS.Workbook(); wb.creator = 'RegaPro';
        const sheet = (name, cols, rows, widths, numFmt) => {
          const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
          ws.addRow(cols); rows.forEach((r) => ws.addRow(r));
          const h = ws.getRow(1); h.font = { bold: true, color: { argb: 'FFFFFFFF' } }; h.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0C2839' } };
          ws.columns.forEach((c, i) => { c.width = widths[i] || 14; if (numFmt && numFmt[i]) c.numFmt = numFmt[i]; });
          ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
        };
        sheet(t('sh.samples'), sm.cols, sm.rows, [12, 14, 20, 9, 9, 9, 22, 14, 18, 8, 9, 22, 12, 40, 7], [null, null, null, '0.00', '0.00', '0.00']);
        const hs = holeStats(recs);
        sheet(t('sh.holes'), [t('col.hole'), t('col.samples'), t('col.crit'), 'From min', 'To max', t('col.len'), t('col.dates') + ' 1', t('col.dates') + ' 2', t('col.days'), t('col.coolers'), t('col.photo')],
          hs.map((h) => [h.hole, h.n, h.crit, isFinite(h.min) ? h.min : null, isFinite(h.max) ? h.max : null, +h.len.toFixed(2), h.first, h.last, h.days.size, h.coolers.size, h.photo]), [16, 9, 9, 10, 10, 12, 12, 12, 8, 8, 8], [null, null, null, '0.00', '0.00', '0.00']);
        const gs = coolerGroups(recs);
        sheet(t('sh.coolers'), [t('col.hole'), t('col.cooler'), t('col.samples'), 'ID 1', 'ID 2', 'From min', 'To max', t('col.dates') + ' 1', t('col.dates') + ' 2'],
          gs.map((g) => { const s = g.ids.slice().sort((a, b) => (a.from || 0) - (b.from || 0)); return [g.hole, [...g.raw].join(', '), g.n, s[0].id, s[s.length - 1].id, isFinite(g.min) ? g.min : null, isFinite(g.max) ? g.max : null, g.first, g.last]; }), [16, 14, 9, 20, 20, 10, 10, 12, 12], [null, null, null, null, null, '0.00', '0.00']);
        const dq = []; runChecks(recs).forEach((c) => c.rows.forEach((r) => dq.push([t('sev.' + c.sev), t('dq.' + c.id), r.date || '', r.hole, r.id, r.from, r.to, String(c.val(r))])));
        sheet(t('sh.dq'), [t('sev.warning').replace(/.*/, 'Severity'), 'Check', t('col.date'), t('col.hole'), t('col.id'), 'From', 'To', t('col.value')], dq, [12, 44, 12, 14, 20, 9, 9, 30], [null, null, null, null, null, '0.00', '0.00']);
        const buf = await wb.xlsx.writeBuffer();
        saveBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), base + '.xlsx');
      }
      st.textContent = t('exp.done');
    } catch (e) { st.className = 'err'; st.textContent = t('exp.err', (e && e.message) || e); }
    finally { $('expGo').disabled = false; }
  }
  function openExport() {
    $('expScope').textContent = t('exp.scope', fmtI(FREC.length), fmtI(new Set(FREC.map((r) => r.hole)).size), fmtDate(F.from), fmtDate(F.to));
    $('expStatus').textContent = ''; const d = $('expDlg'); if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }

  /* ---------------- Хэл, үйл явдал ---------------- */
  function applyI18n() {
    document.documentElement.lang = LANG; document.title = t('docTitle');
    document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach((n) => { n.placeholder = t(n.dataset.i18nPh); });
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
    if (USER) $('userBtn').textContent = USER + ' · ' + t('signout');
    if (window.ETT) window.ETT.setLang(LANG);
  }
  function wire() {
    document.querySelectorAll('.tabs [role=tab]').forEach((b) => b.addEventListener('click', () => setTab(b.id.slice(2))));
    $('presets').addEventListener('click', (e) => { const b = e.target.closest('button[data-days]'); if (!b || !RECS.length) return; setPreset(b.dataset.days); update(); });
    const onDate = () => { let a = $('dFrom').value, b = $('dTo').value; if (!a || !b) return; if (a > b) { const x = a; a = b; b = x; } F.from = a; F.to = b; F.preset = 'custom'; update(); };
    $('dFrom').addEventListener('change', onDate); $('dTo').addEventListener('change', onDate);
    $('holesToggle').addEventListener('click', () => { if (F.exHoles.size) F.exHoles.clear(); else HOLES.forEach((h) => F.exHoles.add(h.h)); renderFilters(); update(); });
    $('clearAll').addEventListener('click', () => { F.exHoles.clear(); F.exUnits.clear(); F.exZones.clear(); F.exStr.clear(); setPreset('all'); renderFilters(); update(); });
    let sq = null; $('sampSearch').addEventListener('input', (e) => { clearTimeout(sq); sq = setTimeout(() => { SS.q = e.target.value; SS.page = 0; renderSamples(); }, 160); });
    $('refreshBtn').addEventListener('click', () => { if (API) loadData(true); });
    $('filterToggle').addEventListener('click', () => { const f = $('filters'); const o = !f.classList.contains('open'); f.classList.toggle('open', o); $('filterToggle').setAttribute('aria-expanded', String(o)); });
    document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => { LANG = b.dataset.lang; store.set('lang', LANG); applyI18n(); if (RECS.length) { renderFilters(); update(); } }));
    $('expBtn').addEventListener('click', openExport); $('expBtnTop').addEventListener('click', openExport);
    $('expClose').addEventListener('click', () => $('expDlg').close()); $('expCancel').addEventListener('click', () => $('expDlg').close()); $('expGo').addEventListener('click', runExport);
    $('photoClose').addEventListener('click', () => $('photoDlg').close());
    $('photoPrev').addEventListener('click', () => { if (PV.i > 0) { PV.i--; showPhoto(); } });
    $('photoNext').addEventListener('click', () => { if (PV.i < PV.items.length - 1) { PV.i++; showPhoto(); } });
    $('photoDlg').addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') $('photoPrev').click(); if (e.key === 'ArrowRight') $('photoNext').click(); });
    $('photoDlg').addEventListener('click', (e) => { if (e.target === $('photoDlg')) $('photoDlg').close(); });
    window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (TABS.includes(h) && h !== TAB) setTab(h, true); });
    let rt = null, lw = 0; new ResizeObserver(() => { const w = $('main').clientWidth; if (Math.abs(w - lw) < 4) return; lw = w; clearTimeout(rt); rt = setTimeout(renderTab, 140); }).observe($('main'));
    setInterval(() => { if (!document.hidden && API && RECS.length) loadData(true); }, CONFIG.refreshMin * 60e3);
  }

  /* ---------------- Эхлэл ---------------- */
  function boot() {
    applyI18n(); wire();
    const h = location.hash.slice(1); if (TABS.includes(h)) setTab(h, true);
    if (window.RS_FIXTURE) { // зөвхөн локал туршилтад
      const fx = window.RS_FIXTURE;
      API = { query: () => Promise.reject(new Error('fixture')), get: (url, q) => {
        if (/queryAttachments$/.test(url)) { const ids = String((q || {}).objectIds || '').split(',').map(Number); return Promise.resolve({ attachmentGroups: ids.filter((i) => fx.att[i]).map((i) => ({ parentObjectId: i, attachmentInfos: [{ id: 1, name: 'p' + i + '.jpg', contentType: 'image/jpeg' }] })) }); }
        return Promise.reject(new Error('fixture')); }, blob: () => fetch(fx.photo).then((r) => r.blob()) };
      loadDomains(fx.fields0); loadDomains(fx.fields1);
      USER = fx.user || ''; if (USER) { $('userBtn').hidden = false; $('userBtn').textContent = USER + ' · ' + t('signout'); }
      ingest(fx.parents, fx.samples); setPreset('all'); $('loading').style.display = 'none'; renderFilters(); update();
      loadAttachments().then(() => { ATT_DONE = true; renderTab(); });
      return;
    }
    if (typeof window.require !== 'function') { showError(t('err.lib')); return; }
    window.require(['esri/identity/OAuthInfo', 'esri/identity/IdentityManager', 'esri/request', 'esri/portal/Portal'], (OAuthInfo, esriId, esriRequest, Portal) => {
      const sharing = CONFIG.portalUrl + '/sharing';
      esriId.registerOAuthInfos([new OAuthInfo({ appId: CONFIG.appId, portalUrl: CONFIG.portalUrl, popup: false, flowType: 'auto', redirectUri: location.origin + location.pathname })]);
      API = {
        query: (url, q) => esriRequest(url + '/query', { query: Object.assign({ f: 'json' }, q), responseType: 'json' }).then((r) => r.data),
        get: (url, q) => esriRequest(url, { query: Object.assign({ f: 'json' }, q), responseType: 'json' }).then((r) => r.data),
        blob: (url) => esriRequest(url, { responseType: 'blob' }).then((r) => r.data)
      };
      let started = false;
      const start = () => {
        if (started) return; started = true; $('signin').style.display = 'none';
        new Portal({ url: CONFIG.portalUrl, authMode: 'immediate' }).load().then((p) => {
          USER = (p.user && (p.user.fullName || p.user.username)) || ''; const ub = $('userBtn'); ub.hidden = !USER; ub.textContent = USER + ' · ' + t('signout');
          ub.onclick = () => { esriId.destroyCredentials(); location.reload(); };
        }).catch(() => {});
        loadData(false);
      };
      esriId.checkSignInStatus(sharing).then(start).catch(() => {
        if (started) return; $('loading').style.display = 'none'; $('signin').style.display = 'flex';
        $('signinBtn').onclick = () => esriId.getCredential(sharing).then(start).catch((e) => showError(t('err.signin', (e && e.message) || e)));
      });
    }, () => showError(t('err.lib')));
  }
  window.RS = { boot, _state: F };
})();
