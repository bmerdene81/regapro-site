/* =====================================================================
   RegaPro · ETT Geotech — Өрөмдлөгийн өдөр тутмын тайлан
   Өгөгдөл: Survey123 «Геотехникийн ажлын өдөр тутмын мэдээ» (ArcGIS Online)
   Нэвтрэлт: ArcGIS OAuth (Цооногийн зүсэлт (OAuth) апп-ын Client ID)
   Хуудас нь өгөгдөл хадгалдаггүй — нэвтэрсэн хэрэглэгчийн эрхээр шууд уншина.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     ТОХИРГОО
     --------------------------------------------------------------- */
  const CONFIG = {
    portalUrl: 'https://indi2435f4406830.maps.arcgis.com',
    appId: 'nZpUBgxKIR0dSIDO',
    // Survey123: Геотехникийн ажлын өдөр тутмын мэдээ
    surveyItemId: 'de52e203fb8f4910a02c81194d7b2607',
    dailyUrl: 'https://services6.arcgis.com/kXYSrbCkSfymtsXt/arcgis/rest/services/survey123_de52e203fb8f4910a02c81194d7b2607/FeatureServer/0',
    // Rock Sampling — чулуулгийн дээжийн бүртгэл (тулгалтад ашиглана, уншигдахгүй бол алгасна)
    rockUrl: 'https://services6.arcgis.com/kXYSrbCkSfymtsXt/arcgis/rest/services/service_e2a62e28a59f48c0a380402e682d994d/FeatureServer/1',
    // Сонголттой: төлөвлөсөн гүнгийн hosted table (талбар: hole_id, planned_depth). Хоосон бол хөтчийн хадгалалтыг ашиглана.
    planTableUrl: '',
    tzOffsetH: 8,            // Улаанбаатар (UTC+8)
    defaultDays: 30,
    refreshMin: 5,
    lateDays: 2
  };

  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const DAY = 864e5;

  /* ---------------------------------------------------------------
     ХЭЛ (MN / EN)
     --------------------------------------------------------------- */
  const I18N = {
    mn: {
      docTitle: 'Өрөмдлөгийн өдөр тутмын тайлан · RegaPro',
      title: 'ETT Geotech — Өрөмдлөгийн өдөр тутмын тайлан', crumb: 'ЭТТ Геотех', title2: 'Өрөмдлөгийн өдөр тутмын тайлан',
      asof: 'Мэдээллийн огноо: {0} · Улаанбаатарын цаг (UTC+8)',
      updated: 'Шинэчилсэн {0}', refresh: 'Шинэчлэх',
      'tab.overview': 'Өдрийн тойм', 'tab.holes': 'Цооногийн явц', 'tab.prod': 'Бүтээмж', 'tab.dq': 'Өгөгдлийн чанар',
      filters: 'Шүүлтүүр', clearAll: 'Цэвэрлэх',
      'f.range': 'Хугацаа', 'f.month': 'Энэ сар', 'f.all': 'Бүгд', 'f.from': 'Эхлэх', 'f.to': 'Дуусах',
      'f.repday': 'Тайлангийн өдөр', 'f.holes': 'Цооног', 'f.selectAll': 'Бүгдийг сонгох', 'f.selectNone': 'Бүгдийг арилгах',
      'f.type': 'Цооногийн төрөл', 'f.shift': 'Ээлж',
      'f.kpiNote': 'KPI картууд сонгосон хугацааны сүүлийн өдрийг (эсвэл графикаас сонгосон өдрийг) харуулна.',
      'shift.day': 'Өдрийн ээлж', 'shift.night': 'Шөнийн ээлж', 'shift.unk': 'Ээлж бүртгээгүй',
      other: 'Бусад (дугааргүй)', 'plan.edit': 'Төлөвлөсөн гүн', exportCsv: 'CSV татах', print: 'Хэвлэх / PDF',
      loading: 'Өгөгдөл ачаалж байна…',
      'c.shift': 'Өдөр тутмын өрөмдлөг, дээжлэлт', 'c.panelM': 'Өдөрт өрөмдсөн (м)', 'c.panelS': 'Өдөрт авсан дээж (ш)',
      'tab.recs': 'Өдөр тутмын мэдээ', 'r.title': 'Өдөр тутмын мэдээ', 'r.search': 'Цооног эсвэл тэмдэглэлээр хайх', 'r.ships': 'Тээврийн мэдээг харуулах',
      'r.sub': '· {0} бичлэг', 'r.depth': 'Нийт гүн, м', 'r.m': 'Өдөрт өрөмдсөн, м', 'r.s': 'Өдөрт авсан дээж, ш', 'r.sent': 'Лаб илгээсэн, ш',
      'r.tsamp': 'Нийт дээж, ш', 'r.ship': 'Тээвэр', 'r.dayAb': 'Ө', 'r.nightAb': 'Ш', 'r.total': 'Нийт ({0} бичлэг)', 'r.issues': 'Өгөгдлийн чанарын асуудал',
      'r.hint': 'Баганын нэр дээр дарж эрэмбэлнэ. Ө — өдрийн ээлж, Ш — шөнийн ээлж.', 'col.soilTag': 'хөрс', 'exp.s.records': 'Өдөр тутмын мэдээ (цооногоор)', 'c.days': '· {0} хоног', 'c.shiftNote': 'Багана дээр дарж (эсвэл ← → товчоор) тухайн өдрийг тайлангийн өдөр болгоно.',
      avg7: '7 хоногийн дундаж', 'c.progress': 'Цооногийн явц', 'c.progressSub': '· одоогийн ба төлөвлөсөн гүн',
      'c.notes': 'Цооног бүрийн сүүлийн тэмдэглэл', 'c.sent': 'Лаборатори руу илгээсэн дээж', 'c.byWeek': '· долоо хоногоор',
      'c.backlog': 'Авсан ба илгээсэн дээж (цооногоор)', rock: 'Чулуулаг', soil: 'Хөрс', plan: 'Төлөвлөгөө',
      'status.prep': 'Бэлтгэл', 'status.drill': 'Өрөмдөж байна', 'status.done': 'Өрөмдлөг дууссан', 'status.lab': 'Лаб руу илгээсэн',
      'k.metres': 'Өрөмдсөн метр', 'k.samples': 'Авсан дээж', 'k.active': 'Идэвхтэй цооног', 'k.sent': 'Лаб руу илгээсэн', 'k.tp': 'Тест пит',
      'k.vsPrev': 'өмнөх өдрөөс', 'k.vsAvg': '7 хоногийн дунджаас', 'k.period': 'Сонгосон хугацаанд: {0}',
      'k.lastSent': 'Сүүлд илгээсэн: {0} · {1} ш', 'k.rangeLbl': 'Сонгосон хугацаанд: {0}', 'k.noneSent': 'Хугацаанд илгээгээгүй', 'k.sentSplit': 'чулуулаг {0} · хөрс {1}',
      'u.m': 'м', 'u.pcs': 'ш', 'u.days': 'хоног',
      'col.hole': 'Цооног', 'col.status': 'Төлөв', 'col.date': 'Огноо', 'col.note': 'Тэмдэглэл', 'col.taken': 'Авсан', 'col.sent': 'Илгээсэн',
      'col.left': 'Илгээгээгүй', 'col.start': 'Эхэлсэн', 'col.last': 'Сүүлийн мэдээ', 'col.days': 'Хоног', 'col.depth': 'Гүн, м',
      'col.plan': 'Төлөвлөсөн, м', 'col.pct': 'Гүйцэтгэл', 'col.rate': 'м/өдөр', 'col.samples': 'Дээж', 'col.per10': 'Дээж/10 м',
      'col.eta': 'Дуусах таамаг', 'col.m': 'Өрөмдсөн, м', 'col.issue': 'Асуудал', 'col.shift': 'Ээлж', 'col.avgShift': 'Дундаж м/ээлж',
      'col.shifts': 'Ээлжийн тоо',
      'eta.reached': 'Төлөвлөсөн гүнд хүрсэн', 'eta.noRate': 'Сүүлийн 7 хоногт ахиц алга', 'eta.days': '{0} (~{1} хоног)',
      noPlan: 'төлөвлөгөөгүй', 'plan.title': 'Төлөвлөсөн гүн',
      'plan.help': 'Цооног бүрийн төлөвлөсөн гүнийг метрээр оруулна. Утга энэ хөтөч дээр хадгалагдана. Бүх хэрэглэгч ижил төлөвлөгөө харахын тулд ArcGIS-д төлөвлөгөөний хүснэгт холбож болно.',
      'plan.cur': 'одоо {0} м', cancel: 'Болих', save: 'Хадгалах',
      'h.table': 'Цооногийн дэлгэрэнгүй', 'h.etaNote': 'Дуусах таамаг: сүүлийн 7 хоногийн дундаж хурдаар үлдсэн гүнийг өрөмдөх хугацаа.',
      'h.curves': 'Гүний өсөлт', 'h.curvesSub': '· цооног бүрийн нийт гүн хугацаагаар', 'h.plan': 'Төлөвлөгөө {0} м',
      'p.total': 'Нийт өрөмдсөн', 'p.holeDays': 'Өрөмдсөн цооног-өдөр', 'p.idle': 'өрөмдөөгүй мэдээ: {0}', 'p.avg': 'Дундаж / цооног-өдөр',
      'p.per10': 'Дээж / 10 м', 'p.best': 'Хамгийн их өдөр', 'p.shiftShare': 'Ээлжийн харьцаа', 'p.shiftDaily': 'Ээлжээр өрөмдлөг, дээжлэлт', 'p.weekly': 'Долоо хоногийн өрөмдлөг',
      'p.weeklySub': '· метр', 'p.heat': 'Цооног × өдөр', 'p.heatSub': '· өдөрт өрөмдсөн метр', 'p.noReport': 'Мэдээгүй',
      'p.down': 'Зогсолт, засварын тэмдэглэл', 'p.downSub': '· {0} бичлэг', 'p.week': '{0} – {1}', 'p.samplesTaken': 'Авсан дээж: {0}',
      'dq.checks': 'Шалгалтууд', 'dq.scope': 'Сонгосон хугацаа, цооногт хамаарна. «Засах» нь Survey123-ийн бичлэгийг нээнэ.',
      'dq.total': 'Нийт асуудал', 'sev.critical': 'Ноцтой', 'sev.serious': 'Анхаарах', 'sev.warning': 'Сэрэмжлүүлэг', 'sev.info': 'Мэдээлэл',
      'dq.ok': 'Асуудал илрээгүй', edit: 'Засах ↗',
      'dq.depthDrop': 'Нийт гүн буурсан', 'dq.depthDrop.why': 'Нийт гүн өмнөх мэдээнийхээс бага болсон. Аль нэг өдрийн нийт гүн буруу бичигдсэн байх магадлалтай.',
      'dq.depthSeq': 'Нийт гүн өмнөх мэдээтэй таарахгүй', 'dq.depthSeq.why': 'Өмнөх мэдээний нийт гүн + тухайн өдөр өрөмдсөн метр ≠ тухайн өдрийн нийт гүн.',
      'dq.sampleSeq': 'Нийт дээж өмнөх мэдээтэй таарахгүй', 'dq.sampleSeq.why': 'Өмнөх мэдээний нийт дээж + тухайн өдөр авсан дээж ≠ тухайн өдрийн нийт дээж.',
      'dq.dup': 'Нэг өдөр давхар мэдээ', 'dq.dup.why': 'Нэг цооногт нэг өдөр хоёр ба түүнээс олон өрөмдлөгийн мэдээ орсон.',
      'dq.shiftSum': 'Ээлжийн нийлбэр зөрүүтэй', 'dq.shiftSum.why': 'Өдрийн + шөнийн ээлжийн утга өдрийн нийт дүнтэй тэнцэхгүй байна.',
      'dq.missing': 'Мэдээ ороогүй өдөр', 'dq.missing.why': 'Цооног өрөмдөж байх хугацаанд өдрийн мэдээ ороогүй өдрүүд.',
      'dq.holeId': 'Цооногийн дугаар тодорхойгүй эсвэл олон', 'dq.holeId.why': 'Бичлэгт цооногийн дугаар сонгоогүй («Бусад»), эсвэл нэг бичлэгт хэд хэдэн цооног бичсэн.',
      'dq.nullM': 'Өрөмдсөн метр хоосон', 'dq.nullM.why': 'Өрөмдлөгийн мэдээнд өдөрт өрөмдсөн метрийг бөглөөгүй (0 ч биш).',
      'dq.soil': 'Хөрсний дээжийн бүртгэл', 'dq.soil.why': 'Хөрсний дээжийг чулуулгийн талбарт бүртгэсэн, эсвэл тэмдэглэлд дурдсан ч хөрсний талбар хоосон. Тайланд хөрс гэж тооцсон.',
      'dq.sentOver': 'Илгээсэн дээж авснаасаа их', 'dq.sentOver.why': 'Тээврийн мэдээнүүдийн нийлбэр тухайн цооногт авсан нийт дээжээс их. Олон цооногийн дээжийг нэг бичлэгт оруулсан байж болно.',
      'dq.rockLog': 'Rock Sampling бүртгэлтэй тулгалт', 'dq.rockLog.why': 'Өдөр тутмын мэдээний нийт дээж Rock Sampling маягтад бүртгэсэн дээжийн тоотой таарахгүй байна. Rock Sampling-ийг сүүлийн мэдээний дараа өдрийн 12:00 хүртэлх бүртгэлээр тоолсон.',
      'dq.late': 'Хоцорч оруулсан мэдээ', 'dq.late.why': 'Тайлангийн өдрөөс 2-оос дээш хоногийн дараа оруулсан мэдээ.',
      'm.depthDrop': '{0} м → {1} м', 'm.seq': 'Байх ёстой {0}, бичигдсэн {1} (өмнөх {2} + {3})', 'm.dup': '{0} бичлэг',
      'm.shift': 'Өдөр {0} + шөнө {1} = {2}, нийт {3} ({4})', 'm.metres': 'метр', 'm.samples': 'дээж',
      'm.missing': '{0} өдөр: {1}', 'm.holeId': 'Цооног: «{0}»', 'm.soilFix': '{0} ширхэгийг хөрс гэж тооцов («{1}»)',
      'm.soilNote': 'Тэмдэглэлд хөрсний дээж дурдсан, хөрсний талбар хоосон', 'm.sentOver': 'Илгээсэн {0} > авсан {1}',
      'm.rock': 'Өдөр тутмын мэдээ {0} ш · Rock Sampling {1} ш', 'm.late': '{0} хоногийн дараа ({1})',
      rockNA: 'Rock Sampling давхарга уншигдсангүй — энэ шалгалтыг алгаслаа.',
      'signin.title': 'Нэвтрэх шаардлагатай', 'signin.text': 'Энэ тайлан ArcGIS Online-ийн хаалттай өгөгдлийг харуулдаг. Байгууллагын ArcGIS эрхээрээ нэвтэрнэ үү.',
      'signin.btn': 'ArcGIS-ээр нэвтрэх', signout: 'Гарах',
      'err.load': 'Өгөгдөл ачаалж чадсангүй: {0}', 'err.lib': 'ArcGIS-ийн сан ачаалагдсангүй. Интернэт холболтоо шалгаад хуудсаа дахин ачаална уу.',
      'err.signin': 'Нэвтэрч чадсангүй: {0}', noData: 'Сонгосон шүүлтүүрт өгөгдөл алга.',
      wd: ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'],
      'csv.cols': ['Огноо', 'Цооног', 'Өрөмдсөн м', 'Өдрийн ээлж м', 'Шөнийн ээлж м', 'Дээж', 'Өдрийн ээлж дээж', 'Шөнийн ээлж дээж', 'Нийт гүн м', 'Нийт дээж', 'Лаб илгээсэн чулуулаг', 'Лаб илгээсэн хөрс', 'Тээврийн мэдээ', 'Тэмдэглэл', 'objectid'],
      yes: 'Тийм', total: 'Нийт', day: 'өдөр',
      'ph.title': 'Өдрийн зураг', 'ph.sub': '· {0} · {1} зураг', 'ph.none': 'Тайлангийн өдөр ({0}) зураг ороогүй. Хамгийн сүүлийн зураг: {1}',
      'ph.empty': 'Сонгосон хугацаа, цооногт зураг алга.', 'ph.hint': 'Графикаас өдөр сонгоход солигдоно',
      'ph.err': 'Зураг уншигдсангүй', 'ph.loading': 'Ачаалж байна…', 'ph.open': 'Бүтэн хэмжээгээр ↗', 'ph.attErr': 'Зургийн мэдээлэл уншигдсангүй: {0}',
      'col.photo': 'Зураг', 'ph.n': '{0}/{1}',
      'dq.noPhoto': 'Зураг хавсаргаагүй мэдээ', 'dq.noPhoto.why': 'Өрөмдлөг хийсэн өдрийн мэдээнд Survey123-ийн «Зураг» хэсэгт зураг хавсаргаагүй.',
      'm.noPhoto': '{0} м өрөмдсөн, зураг алга', 'csv.photos': 'Зураг (ш)',
      'exp.btn': 'Тайлан татах', printOnly: 'Хэвлэх', 'exp.title': 'Тайлан татах', 'exp.format': 'Формат',
      'exp.pdf': 'Хэвлэх, илгээхэд', 'exp.docx': 'Засварлаж болно (.docx)', 'exp.xlsx': 'Хүснэгт, тооцоолол (.xlsx)', 'exp.csv': 'Зөвхөн бичлэгүүд (.csv)',
      'exp.sections': 'Хэсгүүд', 'exp.lang': 'Тайлангийн хэл', 'exp.go': 'Татах',
      'exp.scope': 'Одоогийн шүүлтүүрээр: {0} · тайлангийн өдөр {1} · цооног: {2}',
      'exp.s.summary': 'Хураангуй, графикууд', 'exp.s.notes': 'Цооногийн сүүлийн тэмдэглэл', 'exp.s.samples': 'Лаб руу илгээсэн дээж',
      'exp.s.holes': 'Цооногийн дэлгэрэнгүй', 'exp.s.daily': 'Өдөр тутмын хүснэгт', 'exp.s.prod': 'Бүтээмж', 'exp.s.dq': 'Өгөгдлийн чанар', 'exp.s.photos': 'Тайлангийн өдрийн зураг',
      'exp.working': 'Тайлан бэлтгэж байна…', 'exp.err': 'Тайлан үүсгэж чадсангүй: {0}', 'exp.done': 'Татаж авлаа ✓', 'exp.pick': 'Дор хаяж нэг хэсэг сонгоно уу.',
      'exp.generated': 'Үүсгэсэн', 'exp.holesAll': 'бүгд ({0})', 'exp.shiftBoth': 'Өдөр, шөнө', 'exp.shipments': 'Тээврийн мэдээ (сонгосон хугацаанд)',
      'exp.kpi': 'Үзүүлэлт', 'exp.value': 'Утга', 'exp.repVal': 'Тайлангийн өдөр', 'exp.periodVal': 'Сонгосон хугацаанд',
      'exp.records': 'Бичлэгүүд', 'exp.charts': 'Графикууд', 'exp.summarySheet': 'Хураангуй', 'exp.page': 'Хуудас {0}/{1}',
      'exp.photoDay': 'Зургийн өдөр: {0}', 'exp.noPhotos': 'Энэ өдөр зураг алга.', 'exp.wd': 'Гараг',
      'col.active': 'Идэвхтэй цооног', 'col.dayM': 'Өдрийн ээлж, м', 'col.nightM': 'Шөнийн ээлж, м', 'col.unkM': 'Ээлж бүртгээгүй, м', 'col.totM': 'Нийт, м',
      'col.sev': 'Түвшин', 'col.check': 'Шалгалт'
    },
    en: {
      docTitle: 'Daily Drilling Report · RegaPro',
      title: 'ETT Geotech — Daily Drilling Report', crumb: 'ETT Geotech', title2: 'Daily Drilling Report',
      asof: 'Data as of {0} · Mongolia time (UTC+8)',
      updated: 'Updated {0}', refresh: 'Refresh',
      'tab.overview': 'Daily overview', 'tab.holes': 'Hole progress', 'tab.prod': 'Productivity', 'tab.dq': 'Data quality',
      filters: 'Filters', clearAll: 'Clear all',
      'f.range': 'Date range', 'f.month': 'This month', 'f.all': 'All', 'f.from': 'From', 'f.to': 'To',
      'f.repday': 'Report day', 'f.holes': 'Hole', 'f.selectAll': 'Select all', 'f.selectNone': 'Clear all',
      'f.type': 'Hole type', 'f.shift': 'Shift',
      'f.kpiNote': 'KPI cards show the last day of the selected range (or the day picked on the chart).',
      'shift.day': 'Day shift', 'shift.night': 'Night shift', 'shift.unk': 'Shift not recorded',
      other: 'Other (no hole ID)', 'plan.edit': 'Planned depths', exportCsv: 'Download CSV', print: 'Print / PDF',
      loading: 'Loading data…',
      'c.shift': 'Daily drilling and sampling', 'c.panelM': 'Metres drilled per day', 'c.panelS': 'Samples taken per day',
      'tab.recs': 'Daily reports', 'r.title': 'Daily reports', 'r.search': 'Search hole or note', 'r.ships': 'Show shipment reports',
      'r.sub': '· {0} records', 'r.depth': 'Total depth, m', 'r.m': 'Drilled that day, m', 'r.s': 'Samples that day', 'r.sent': 'Sent to lab',
      'r.tsamp': 'Total samples', 'r.ship': 'Shipment', 'r.dayAb': 'D', 'r.nightAb': 'N', 'r.total': 'Total ({0} records)', 'r.issues': 'Data quality issues',
      'r.hint': 'Click a column name to sort. D — day shift, N — night shift.', 'col.soilTag': 'soil', 'exp.s.records': 'Daily reports (by hole)', 'c.days': '· {0} days', 'c.shiftNote': 'Click a column (or use ← →) to make that day the report day.',
      avg7: '7-day average', 'c.progress': 'Hole progress', 'c.progressSub': '· current vs planned depth',
      'c.notes': 'Latest note per hole', 'c.sent': 'Samples sent to lab', 'c.byWeek': '· by week',
      'c.backlog': 'Samples taken vs sent (by hole)', rock: 'Rock', soil: 'Soil', plan: 'Plan',
      'status.prep': 'Preparing', 'status.drill': 'Drilling', 'status.done': 'Drilling finished', 'status.lab': 'Sent to lab',
      'k.metres': 'Metres drilled', 'k.samples': 'Samples taken', 'k.active': 'Active holes', 'k.sent': 'Sent to lab', 'k.tp': 'Test pits',
      'k.vsPrev': 'vs previous day', 'k.vsAvg': 'vs 7-day avg', 'k.period': 'In selected range: {0}',
      'k.lastSent': 'Last shipment: {0} · {1}', 'k.rangeLbl': 'Selected range: {0}', 'k.noneSent': 'None sent in range', 'k.sentSplit': 'rock {0} · soil {1}',
      'u.m': 'm', 'u.pcs': '', 'u.days': 'days',
      'col.hole': 'Hole', 'col.status': 'Status', 'col.date': 'Date', 'col.note': 'Note', 'col.taken': 'Taken', 'col.sent': 'Sent',
      'col.left': 'Not sent', 'col.start': 'Started', 'col.last': 'Last report', 'col.days': 'Days', 'col.depth': 'Depth, m',
      'col.plan': 'Planned, m', 'col.pct': 'Progress', 'col.rate': 'm/day', 'col.samples': 'Samples', 'col.per10': 'Samples/10 m',
      'col.eta': 'Forecast finish', 'col.m': 'Drilled, m', 'col.issue': 'Issue', 'col.shift': 'Shift', 'col.avgShift': 'Avg m per shift',
      'col.shifts': 'Shifts',
      'eta.reached': 'Planned depth reached', 'eta.noRate': 'No progress in last 7 days', 'eta.days': '{0} (~{1} days)',
      noPlan: 'no plan', 'plan.title': 'Planned depths',
      'plan.help': 'Enter the planned depth of each hole in metres. Values are saved in this browser. To let every user see the same plan, connect a plan table in ArcGIS.',
      'plan.cur': 'now {0} m', cancel: 'Cancel', save: 'Save',
      'h.table': 'Hole details', 'h.etaNote': 'Forecast finish: time to drill the remaining depth at the average rate of the last 7 days.',
      'h.curves': 'Depth over time', 'h.curvesSub': '· total depth of each hole by date', 'h.plan': 'Plan {0} m',
      'p.total': 'Total drilled', 'p.holeDays': 'Drilling hole-days', 'p.idle': 'reports with no metres: {0}', 'p.avg': 'Avg per hole-day',
      'p.per10': 'Samples per 10 m', 'p.best': 'Best day', 'p.shiftShare': 'Shift split', 'p.shiftDaily': 'Drilling and sampling by shift', 'p.weekly': 'Weekly metres',
      'p.weeklySub': '· metres', 'p.heat': 'Hole × day', 'p.heatSub': '· metres drilled per day', 'p.noReport': 'No report',
      'p.down': 'Downtime and repair notes', 'p.downSub': '· {0} records', 'p.week': '{0} – {1}', 'p.samplesTaken': 'Samples taken: {0}',
      'dq.checks': 'Checks', 'dq.scope': 'Uses the selected range and holes. “Edit” opens the record in Survey123.',
      'dq.total': 'Total issues', 'sev.critical': 'Critical', 'sev.serious': 'Serious', 'sev.warning': 'Warning', 'sev.info': 'Info',
      'dq.ok': 'No issues found', edit: 'Edit ↗',
      'dq.depthDrop': 'Total depth decreased', 'dq.depthDrop.why': 'Total depth is lower than in the previous report. One of the days probably has a wrong total depth.',
      'dq.depthSeq': 'Total depth doesn’t follow previous report', 'dq.depthSeq.why': 'Previous total depth + metres drilled that day ≠ total depth that day.',
      'dq.sampleSeq': 'Total samples don’t follow previous report', 'dq.sampleSeq.why': 'Previous total samples + samples taken that day ≠ total samples that day.',
      'dq.dup': 'Duplicate report for a day', 'dq.dup.why': 'Two or more drilling reports for the same hole on the same day.',
      'dq.shiftSum': 'Shift values don’t add up', 'dq.shiftSum.why': 'Day shift + night shift is not equal to the daily total.',
      'dq.missing': 'Days without a report', 'dq.missing.why': 'Days with no daily report while the hole was being drilled.',
      'dq.holeId': 'Missing or multiple hole IDs', 'dq.holeId.why': 'The record has no hole selected (“Other”) or lists several holes.',
      'dq.nullM': 'Metres left blank', 'dq.nullM.why': 'A drilling report with the metres-drilled field left empty (not even 0).',
      'dq.soil': 'Soil sample recording', 'dq.soil.why': 'Soil samples were recorded in the rock field, or the note mentions soil samples while the soil field is empty. Counted as soil in this report.',
      'dq.sentOver': 'More samples sent than taken', 'dq.sentOver.why': 'Shipments recorded for the hole add up to more than its total samples. Samples of several holes may be in one record.',
      'dq.rockLog': 'Check against Rock Sampling log', 'dq.rockLog.why': 'Total samples in the daily report differ from the number of samples logged in the Rock Sampling form (counted up to 12:00 on the day after the latest report).',
      'dq.late': 'Late entries', 'dq.late.why': 'Reports entered more than 2 days after the report date.',
      'm.depthDrop': '{0} m → {1} m', 'm.seq': 'Expected {0}, recorded {1} (previous {2} + {3})', 'm.dup': '{0} records',
      'm.shift': 'Day {0} + night {1} = {2}, total {3} ({4})', 'm.metres': 'metres', 'm.samples': 'samples',
      'm.missing': '{0} days: {1}', 'm.holeId': 'Hole: “{0}”', 'm.soilFix': '{0} counted as soil (“{1}”)',
      'm.soilNote': 'Note mentions soil samples, soil field is empty', 'm.sentOver': 'Sent {0} > taken {1}',
      'm.rock': 'Daily report {0} · Rock Sampling {1}', 'm.late': '{0} days later ({1})',
      rockNA: 'The Rock Sampling layer could not be read — this check was skipped.',
      'signin.title': 'Sign-in required', 'signin.text': 'This report shows private ArcGIS Online data. Sign in with your organisation’s ArcGIS account.',
      'signin.btn': 'Sign in with ArcGIS', signout: 'Sign out',
      'err.load': 'Couldn’t load data: {0}', 'err.lib': 'The ArcGIS library didn’t load. Check your connection and reload the page.',
      'err.signin': 'Sign-in failed: {0}', noData: 'No data for the selected filters.',
      wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      'csv.cols': ['Date', 'Hole', 'Drilled m', 'Day shift m', 'Night shift m', 'Samples', 'Day shift samples', 'Night shift samples', 'Total depth m', 'Total samples', 'Rock sent to lab', 'Soil sent to lab', 'Shipment report', 'Note', 'objectid'],
      yes: 'Yes', total: 'Total', day: 'day',
      'ph.title': 'Photos of the day', 'ph.sub': '· {0} · {1} photos', 'ph.none': 'No photos on the report day ({0}). Latest photos: {1}',
      'ph.empty': 'No photos for the selected range and holes.', 'ph.hint': 'Changes with the day picked on the chart',
      'ph.err': 'Photo could not be loaded', 'ph.loading': 'Loading…', 'ph.open': 'Full size ↗', 'ph.attErr': 'Photo information could not be read: {0}',
      'col.photo': 'Photo', 'ph.n': '{0} of {1}',
      'dq.noPhoto': 'Reports without a photo', 'dq.noPhoto.why': 'A drilling report with metres drilled but no photo attached in the Survey123 “Photo” section.',
      'm.noPhoto': '{0} m drilled, no photo', 'csv.photos': 'Photos',
      'exp.btn': 'Download report', printOnly: 'Print', 'exp.title': 'Download report', 'exp.format': 'Format',
      'exp.pdf': 'To print or send', 'exp.docx': 'Editable (.docx)', 'exp.xlsx': 'Tables for analysis (.xlsx)', 'exp.csv': 'Records only (.csv)',
      'exp.sections': 'Sections', 'exp.lang': 'Report language', 'exp.go': 'Download',
      'exp.scope': 'Uses the current filters: {0} · report day {1} · holes: {2}',
      'exp.s.summary': 'Summary and charts', 'exp.s.notes': 'Latest note per hole', 'exp.s.samples': 'Samples sent to lab',
      'exp.s.holes': 'Hole details', 'exp.s.daily': 'Daily table', 'exp.s.prod': 'Productivity', 'exp.s.dq': 'Data quality', 'exp.s.photos': 'Photos of the report day',
      'exp.working': 'Preparing the report…', 'exp.err': 'Couldn’t create the report: {0}', 'exp.done': 'Downloaded ✓', 'exp.pick': 'Pick at least one section.',
      'exp.generated': 'Generated', 'exp.holesAll': 'all ({0})', 'exp.shiftBoth': 'Day and night', 'exp.shipments': 'Shipments in the selected range',
      'exp.kpi': 'Measure', 'exp.value': 'Value', 'exp.repVal': 'Report day', 'exp.periodVal': 'Selected range',
      'exp.records': 'Records', 'exp.charts': 'Charts', 'exp.summarySheet': 'Summary', 'exp.page': 'Page {0} of {1}',
      'exp.photoDay': 'Photo day: {0}', 'exp.noPhotos': 'No photos on this day.', 'exp.wd': 'Weekday',
      'col.active': 'Active holes', 'col.dayM': 'Day shift, m', 'col.nightM': 'Night shift, m', 'col.unkM': 'Shift not recorded, m', 'col.totM': 'Total, m',
      'col.sev': 'Level', 'col.check': 'Check'
    }
  };
  const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const store = {
    get(k, d) { try { const v = localStorage.getItem('dr_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dr_' + k, JSON.stringify(v)); } catch (e) { /* хадгалалт хаалттай */ } }
  };

  let LANG = (new URLSearchParams(location.search).get('lang') || store.get('lang', 'mn')) === 'en' ? 'en' : 'mn';
  function t(k) {
    let s = I18N[LANG][k];
    if (s == null) s = I18N.mn[k];
    if (s == null) s = k;
    if (typeof s !== 'string') return s;
    for (let i = 1; i < arguments.length; i++) s = s.split('{' + (i - 1) + '}').join(String(arguments[i]));
    return s;
  }

  /* ---------------------------------------------------------------
     Туслах функцууд
     --------------------------------------------------------------- */
  const fmt = (v, d = 1) => (v == null || !isFinite(v)) ? '–' : Number(v).toLocaleString('en-US', { maximumFractionDigits: d });
  const fmtI = (v) => fmt(v, 0);
  const pcs = (v) => fmtI(v) + (t('u.pcs') ? ' ' + t('u.pcs') : '');
  const mtr = (v) => fmt(v) + ' ' + t('u.m');
  const ubDate = (ms) => new Date(ms + CONFIG.tzOffsetH * 3600e3).toISOString().slice(0, 10);
  const toMs = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  const addDays = (s, n) => new Date(toMs(s) + n * DAY).toISOString().slice(0, 10);
  const diffDays = (a, b) => Math.round((toMs(b) - toMs(a)) / DAY);
  const weekday = (s) => new Date(toMs(s)).getUTCDay();
  const weekStart = (s) => addDays(s, -((weekday(s) + 6) % 7));
  function dateRange(a, b) { const out = []; if (!a || !b || a > b) return out; for (let d = a; d <= b; d = addDays(d, 1)) out.push(d); return out; }
  function fmtDate(s, style) {
    if (!s) return '–';
    const y = s.slice(0, 4), m = +s.slice(5, 7), d = +s.slice(8, 10);
    if (LANG === 'en') {
      if (style === 'short') return d + ' ' + MONTHS_EN[m - 1];
      return d + ' ' + MONTHS_EN[m - 1] + ' ' + y;
    }
    if (style === 'short') return String(m).padStart(2, '0') + '.' + String(d).padStart(2, '0');
    return y + '.' + String(m).padStart(2, '0') + '.' + String(d).padStart(2, '0');
  }
  const fmtDateAuto = (s) => (s && DATA_MAX && s.slice(0, 4) === DATA_MAX.slice(0, 4)) ? fmtDate(s, 'short') : fmtDate(s);
  const fmtDateWd = (s) => fmtDate(s) + ', ' + t('wd')[weekday(s)];
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
  // Суурь дээр тэгш, дээд талдаа 4px бөөрөнхий багана
  function colPath(x, y, w, h, r) {
    if (h <= 0) return '';
    r = Math.min(r, h, w / 2);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  // Зүүн талдаа тэгш, баруун төгсгөлдөө бөөрөнхий хэвтээ багана
  function hbarPath(x, y, w, h, r) {
    if (w <= 0) return '';
    r = Math.min(r, w, h / 2);
    return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
  }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  const COLORS = {};
  function loadColors() {
    ['day', 'night', 'unk', 'drill', 'done', 'lab', 'prep', 'rock', 'soil', 'avg', 'total', 'metre', 'samp'].forEach((k) => { COLORS[k] = cssVar('--c-' + k); });
    ['good', 'warn', 'serious', 'crit'].forEach((k) => { COLORS['s-' + k] = cssVar('--s-' + k); });
  }

  /* ---------------------------------------------------------------
     Tooltip
     --------------------------------------------------------------- */
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
  function tipRow(T, color, value, label, box) {
    const r = el('div', { class: 'tr' }, T);
    const k = el('span', { class: 'k' + (box ? ' box' : '') }, r); k.style.background = color || 'transparent';
    el('b', null, r, value); el('span', null, r, label);
  }
  function tipSep(T) { el('div', { class: 'sepl' }, T); }
  function bindTip(node, build) {
    node.addEventListener('pointermove', (e) => tipShow(e.clientX, e.clientY, build));
    node.addEventListener('pointerleave', tipHide);
    node.addEventListener('focus', () => { const b = node.getBoundingClientRect(); tipShow(b.right, b.top, build); });
    node.addEventListener('blur', tipHide);
  }

  /* ---------------------------------------------------------------
     Өгөгдөл унших, цэвэрлэх
     --------------------------------------------------------------- */
  const HOLE_RE = /^[A-Z]{2,6}_\d{3,6}[A-Z]?$/;
  const CLOSE_RE = /хаагд|хаасан|хааж|хайгдсан|хаалаа|дуусгав/i;
  const DOWN_RE = /засвар|эвдэр|гацсан|гацаж|гацах|блок|блог|тасар|сальник|шарик|помп|хазайлт|зогс|цоорч|нурж|ус алд/i;
  const SOIL_RE = /bucket|хөрс|шурф|soil|test ?pit/i;
  const ID_IN_TEXT = /[A-ZА-Я]{2,6}[_-]\d{4,6}[A-Z]?/gi;

  function normHole(s) {
    const h = String(s || '').trim().toUpperCase().replace(/\s+/g, '').replace(/-/g, '_');
    return HOLE_RE.test(h) ? h : null;
  }
  const num = (v) => (v == null || v === '' || !isFinite(+v)) ? null : +v;

  function parseRecord(a) {
    const raw = String(a.drillholes || '').trim();
    const isOther = !raw || raw.toLowerCase() === 'other';
    const src = isOther ? String(a.drillholes_other || '') : raw;
    const holes = [];
    src.split(/[,;/]+/).forEach((p) => { const h = normHole(p); if (h && !holes.includes(h)) holes.push(h); });
    const ms = a._date != null ? a._date : a.CreationDate;
    const r = {
      oid: a.objectid, date: ubDate(ms), created: a.CreationDate || null,
      raw, other: isOther ? String(a.drillholes_other || '').trim() : '', isOther, holes, hole: holes[0] || null,
      m: num(a.drilled_m_per_day), mDay: num(a.drilled_m_day), mNight: num(a.drilled_m_night),
      s: num(a.sample_per_day), sDay: num(a.sample_day), sNight: num(a.sample_night),
      depth: num(a.total_depth_m), tsamp: num(a.total_sample),
      rock: num(a.rock_sample), soil: num(a.soil_sample),
      tp: num(a.total_test_pit_per_day), tpS: num(a.total_samples),
      note: String(a.note_ || '').trim(), soilFix: false, soilNote: false
    };
    const flag = a.is_transport;
    const flagged = flag != null && flag !== '' && !/^(no|false|0|үгүй)$/i.test(String(flag));
    r.transport = flagged || ((r.rock || 0) + (r.soil || 0)) > 0;
    // Хөрсний дээжийг (bucket) чулуулгийн талбарт бүртгэсэн тохиолдол
    if (r.transport && !r.soil && !r.holes.length && SOIL_RE.test(r.other) && r.rock > 0) { r.soil = r.rock; r.rock = 0; r.soilFix = true; }
    if (r.transport && !r.soil && /хөрс/i.test(r.note)) r.soilNote = true;
    r.hasSplit = r.mDay != null || r.mNight != null;
    r.mTot = r.m != null ? r.m : (r.hasSplit ? (r.mDay || 0) + (r.mNight || 0) : null);
    r.sSplit = r.sDay != null || r.sNight != null;
    r.sTot = r.s != null ? r.s : (r.sSplit ? (r.sDay || 0) + (r.sNight || 0) : null);
    r.drillRec = !r.transport;     // өрөмдлөгийн мэдээ (тээврийнх биш)
    return r;
  }

  /* ---------------------------------------------------------------
     Төлөв (state)
     --------------------------------------------------------------- */
  let RECS = [], BY_HOLE = new Map(), DATA_MAX = null, DATA_MIN = null;
  let ROCK = null, ROCK_ERR = false, PLAN_TABLE = {}, LAST_LOAD = null;
  let ATT = new Map(), ATT_READY = false, ATT_ERR = '';
  const BLOBS = new Map();
  const F = { from: null, to: null, preset: String(CONFIG.defaultDays), repDay: null, exHoles: new Set(), exTypes: new Set(), day: true, night: true };
  let TAB = 'overview';
  let FREC = [], AGG = new Map(), TOTC = new Map();
  let API = null;

  const plans = () => Object.assign({}, PLAN_TABLE, store.get('plans_v1', {}));
  const typeOf = (k) => k === '__other' ? '__other' : k.split('_')[0];
  const keysOf = (r) => r.holes.length ? r.holes : ['__other'];
  const passHole = (r) => keysOf(r).some((k) => !F.exHoles.has(k) && !F.exTypes.has(typeOf(k)));
  const repDay = () => F.repDay || F.to;

  function mParts(r) {
    const tot = r.mTot || 0;
    if (!r.hasSplit) return { day: 0, night: 0, unk: (F.day && F.night) ? tot : 0 };
    const d = r.mDay || 0, n = r.mNight || 0, u = Math.max(0, tot - d - n);
    return { day: F.day ? d : 0, night: F.night ? n : 0, unk: (F.day && F.night) ? u : 0 };
  }
  function sParts(r) {
    const tot = r.sTot || 0;
    if (!r.sSplit) return { day: 0, night: 0, unk: (F.day && F.night) ? tot : 0 };
    const d = r.sDay || 0, n = r.sNight || 0, u = Math.max(0, tot - d - n);
    return { day: F.day ? d : 0, night: F.night ? n : 0, unk: (F.day && F.night) ? u : 0 };
  }
  const sum3 = (p) => p.day + p.night + p.unk;
  const mVal = (r) => sum3(mParts(r));
  const sVal = (r) => sum3(sParts(r));

  function compute() {
    FREC = RECS.filter(passHole);
    AGG = new Map(); TOTC = new Map();
    FREC.forEach((r) => { if (!AGG.has(r.date)) AGG.set(r.date, []); AGG.get(r.date).push(r); });
    AGG.forEach((rs, d) => TOTC.set(d, rs.reduce((a, r) => a + mVal(r), 0)));
  }
  const dayRecs = (d) => AGG.get(d) || [];
  const dayM = (d) => TOTC.get(d) || 0;
  const dayS = (d) => dayRecs(d).reduce((a, r) => a + sVal(r), 0);
  const daySent = (d) => dayRecs(d).reduce((a, r) => a + (r.transport ? (r.rock || 0) + (r.soil || 0) : 0), 0);
  const dayTp = (d) => dayRecs(d).reduce((a, r) => a + (r.tp || 0), 0);
  function dayActive(d) { const s = new Set(); dayRecs(d).forEach((r) => { if (mVal(r) > 0) keysOf(r).forEach((k) => { if (k !== '__other') s.add(k); }); }); return s.size; }
  function avgBefore(fn, d, n) { let s = 0; for (let i = 1; i <= n; i++) s += fn(addDays(d, -i)); return s / n; }
  function rolling(d, n) { let s = 0; for (let i = 0; i < n; i++) s += dayM(addDays(d, -i)); return s / n; }
  function rangeSum(fn) { return dateRange(F.from, F.to).reduce((a, d) => a + fn(d), 0); }
  const recsInRange = () => FREC.filter((r) => r.date >= F.from && r.date <= F.to);

  // Цооногийн мэдээлэл (тухайн өдрийн байдлаар)
  function holeInfo(h, D) {
    const all = (BY_HOLE.get(h) || []).filter((r) => r.date <= D);
    if (!all.length) return null;
    const drill = all.filter((r) => r.drillRec);
    const pick = (field) => { for (let i = all.length - 1; i >= 0; i--) if (all[i][field] != null) return all[i][field]; return null; };
    const depth = pick('depth') || 0, tsamp = pick('tsamp') || 0;
    const drilled = drill.filter((r) => (r.mTot || 0) > 0);
    const firstDrill = drilled.length ? drilled[0].date : null, lastDrill = drilled.length ? drilled[drilled.length - 1].date : null;
    let closeDate = null;
    all.forEach((r) => {
      if (!CLOSE_RE.test(r.note)) return;
      const ids = (r.note.match(ID_IN_TEXT) || []).map(normHole).filter(Boolean);
      if (ids.length && !ids.includes(h)) return;
      closeDate = r.date;
    });
    const ships = all.filter((r) => r.transport && r.hole === h);
    const sent = ships.reduce((a, r) => a + (r.rock || 0) + (r.soil || 0), 0);
    const plan = plans()[h] || null;
    let closed = !!(closeDate && (!lastDrill || lastDrill <= closeDate));
    if (!closed && ships.length && lastDrill && ships[ships.length - 1].date >= lastDrill) closed = true;
    if (!closed && lastDrill && diffDays(lastDrill, D) >= 14) closed = true;
    let status = 'drill';
    if (!lastDrill && depth === 0) status = 'prep';
    else if (closed) status = sent > 0 ? 'lab' : 'done';
    // Сүүлийн 7 хоногийн хурд, дуусах таамаг
    const span = firstDrill ? Math.max(1, Math.min(7, diffDays(firstDrill, D) + 1)) : 7;
    let wk = 0; drill.forEach((r) => { if (r.date > addDays(D, -span)) wk += (r.mTot || 0); });
    const rate = wk / span;
    let eta = null;
    if (status === 'drill' && plan) {
      const rem = plan - depth;
      if (rem <= 0) eta = { reached: true };
      else if (rate > 0) { const days = Math.ceil(rem / rate); eta = { date: addDays(D, days), days }; }
      else eta = { none: true };
    }
    const activeDays = new Set(drilled.map((r) => r.date)).size;
    const lastNote = [...all].reverse().find((r) => r.note) || null;
    return {
      hole: h, type: typeOf(h), first: all[0].date, last: all[all.length - 1].date, firstDrill, lastDrill,
      depth, tsamp, sent, ships, plan, status, closed, rate, eta, activeDays,
      pct: plan ? depth / plan : null, lastNote, recs: all
    };
  }
  const STATUS_ORDER = { drill: 0, prep: 1, done: 2, lab: 3 };
  function holesInRange() {
    const set = new Set();
    recsInRange().forEach((r) => r.holes.forEach((h) => { if (!F.exHoles.has(h) && !F.exTypes.has(typeOf(h))) set.add(h); }));
    const D = repDay();
    return [...set].map((h) => holeInfo(h, D)).filter(Boolean)
      .sort((a, b) => (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) || (b.last < a.last ? -1 : b.last > a.last ? 1 : 0) || a.hole.localeCompare(b.hole));
  }
  const statusColor = (s) => COLORS[s] || COLORS.prep;

  /* ---------------------------------------------------------------
     Шүүлтүүр UI
     --------------------------------------------------------------- */
  function setPreset(p) {
    F.preset = p; F.repDay = null;
    const end = DATA_MAX;
    if (p === 'all') { F.from = DATA_MIN; F.to = end; }
    else if (p === 'month') { F.from = end.slice(0, 8) + '01'; F.to = end; }
    else { F.from = addDays(end, -(+p - 1)); F.to = end; }
    if (F.from < DATA_MIN) F.from = DATA_MIN;
  }
  function renderFilters() {
    document.querySelectorAll('#presets button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.days === F.preset)));
    document.querySelectorAll('#presets button[data-days]').forEach((b) => { if (/^\d+$/.test(b.dataset.days)) b.textContent = b.dataset.days + ' ' + (LANG === 'en' ? 'd' : 'хоног'); });
    $('dFrom').value = F.from; $('dTo').value = F.to;
    $('dFrom').min = $('dTo').min = DATA_MIN; $('dFrom').max = $('dTo').max = DATA_MAX;
    $('repDayBox').hidden = !F.repDay; $('repDayTxt').textContent = F.repDay ? fmtDate(F.repDay) : '';
    // Цооногийн жагсаалт: хугацаанд бичлэгтэй цооногууд
    const keys = new Map();
    RECS.filter((r) => r.date >= F.from && r.date <= F.to).forEach((r) => keysOf(r).forEach((k) => keys.set(k, (keys.get(k) || '') < r.date ? r.date : keys.get(k))));
    const D = repDay();
    const list = $('holeList'); list.innerHTML = '';
    const sorted = [...keys.keys()].sort((a, b) => a === '__other' ? 1 : b === '__other' ? -1 : (keys.get(b).localeCompare(keys.get(a)) || a.localeCompare(b)));
    sorted.forEach((k) => {
      const lab = el('label', { class: 'chk' }, list);
      const cb = el('input', { type: 'checkbox' }, lab); cb.checked = !F.exHoles.has(k);
      cb.addEventListener('change', () => { if (cb.checked) F.exHoles.delete(k); else F.exHoles.add(k); update(); });
      const info = k === '__other' ? null : holeInfo(k, D);
      const dot = el('span', { class: 'dot' }, lab); dot.style.background = info ? statusColor(info.status) : 'transparent';
      if (!info) dot.style.border = '1px solid #c3cbd3';
      el('span', null, lab, k === '__other' ? t('other') : k);
      if (info) el('span', { class: 'meta' }, lab, fmt(info.depth) + ' ' + t('u.m'));
    });
    const anyEx = sorted.some((k) => F.exHoles.has(k));
    $('holesAll').textContent = anyEx ? t('f.selectAll') : t('f.selectNone');
    $('holesAll').onclick = () => { if (anyEx) sorted.forEach((k) => F.exHoles.delete(k)); else sorted.forEach((k) => F.exHoles.add(k)); update(); };
    // Төрөл
    const types = [...new Set(sorted.map(typeOf))].sort((a, b) => a === '__other' ? 1 : b === '__other' ? -1 : a.localeCompare(b));
    const tl = $('typeList'); tl.innerHTML = '';
    types.forEach((ty) => {
      const lab = el('label', { class: 'chk' }, tl);
      const cb = el('input', { type: 'checkbox' }, lab); cb.checked = !F.exTypes.has(ty);
      cb.addEventListener('change', () => { if (cb.checked) F.exTypes.delete(ty); else F.exTypes.add(ty); update(); });
      el('span', null, lab, ty === '__other' ? t('other') : ty);
    });
    $('shDay').checked = F.day; $('shNight').checked = F.night;
  }

  /* ---------------------------------------------------------------
     ЗУРАГ (Survey123-ийн «Зураг» хавсралт)
     --------------------------------------------------------------- */
  const photosOf = (r) => ATT.get(r.oid) || [];
  function photoTime(name) { const m = /(\d{8})[-_ ]?(\d{2})(\d{2})(\d{2})/.exec(name || ''); return m ? m[2] + ':' + m[3] : ''; }
  function photoItems(recs) {
    const out = [];
    recs.forEach((r) => photosOf(r).forEach((p) => out.push({ p, r })));
    return out;
  }
  // Зургийг нэвтэрсэн эрхээр blob болгон татна (токен DOM-д харагдахгүй)
  function blobUrl(url) {
    if (BLOBS.has(url)) return BLOBS.get(url);
    const pr = API.blob(url).then((b) => { if (b && b.type && !/^image\//i.test(b.type)) throw new Error('not image'); return URL.createObjectURL(b); });
    pr.catch(() => BLOBS.delete(url));
    BLOBS.set(url, pr);
    return pr;
  }
  const thumbUrl = (p) => p.url + (p.url.includes('?') ? '&' : '?') + 'w=480';
  let lazyObs = null;
  function lazyImg(box, p, thumb) {
    const ph = el('div', { class: 'ph-ph' }, box, t('ph.loading'));
    const load = () => {
      (thumb ? blobUrl(thumbUrl(p)).catch(() => blobUrl(p.url)) : blobUrl(p.url)).then((u) => {
        const img = el('img', { alt: p.name || '', decoding: 'async' });
        img.onload = () => ph.remove();
        img.onerror = () => { img.remove(); ph.textContent = t('ph.err'); };
        img.src = u; box.appendChild(img);
      }).catch(() => { ph.textContent = t('ph.err'); });
    };
    if (!('IntersectionObserver' in window)) { load(); return; }
    if (!lazyObs) lazyObs = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { lazyObs.unobserve(e.target); if (e.target.__load) e.target.__load(); } }), { rootMargin: '300px' });
    box.__load = load; lazyObs.observe(box);
  }
  function photoCaption(it) {
    const tm = photoTime(it.p.name);
    return (it.r.holes.join(', ') || it.r.other || '–') + ' · ' + fmtDate(it.r.date, 'short') + (tm ? ' ' + tm : '');
  }
  let PV = { items: [], i: 0 };
  function openPhotos(items, i) {
    PV = { items, i };
    showPhoto();
    const dlg = $('photoDlg');
    if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
  }
  function showPhoto() {
    const items = PV.items, i = PV.i, it = items[i];
    $('photoTtl').textContent = photoCaption(it);
    $('photoCount').textContent = items.length > 1 ? t('ph.n', i + 1, items.length) : '';
    $('photoNote').textContent = it.r.note || '';
    $('photoPrev').disabled = i <= 0; $('photoNext').disabled = i >= items.length - 1;
    $('photoPrev').hidden = $('photoNext').hidden = items.length < 2;
    const box = $('photoBox'); box.innerHTML = '';
    const ph = el('div', { class: 'ph-ph' }, box, t('ph.loading'));
    const open = $('photoOpen'); open.removeAttribute('href');
    blobUrl(it.p.url).then((u) => {
      if (PV.items[PV.i] !== it) return;
      ph.remove();
      const img = el('img', { alt: photoCaption(it) }, box); img.src = u;
      open.href = u; open.setAttribute('download', it.p.name || 'photo.jpg');
    }).catch(() => { ph.textContent = t('ph.err'); });
    if (items[i + 1]) blobUrl(items[i + 1].p.url).catch(() => {});
  }
  async function loadAttachments() {
    ATT_READY = false; ATT_ERR = '';
    const map = new Map();
    const take = (oid, infos) => {
      const list = (infos || []).filter((x) => /^image\//i.test(x.contentType || '') || /\.(jpe?g|png|webp|gif|heic)$/i.test(x.name || ''))
        .map((x) => ({ id: x.id, name: x.name || '', type: x.contentType || '', size: x.size || 0, url: `${CONFIG.dailyUrl}/${oid}/attachments/${x.id}` }));
      if (list.length) map.set(oid, list);
    };
    const oids = RECS.map((r) => r.oid);
    try {
      for (let i = 0; i < oids.length; i += 200) {
        const d = await API.get(CONFIG.dailyUrl + '/queryAttachments', { objectIds: oids.slice(i, i + 200).join(','), returnUrl: false });
        if (d.error) throw new Error(d.error.message || 'queryAttachments');
        (d.attachmentGroups || []).forEach((gr) => take(gr.parentObjectId, gr.attachmentInfos));
      }
    } catch (e) {
      // Нөөц арга: сүүлийн 120 бичлэгийн хавсралтыг нэг нэгээр нь уншина
      const recent = RECS.slice(-120).map((r) => r.oid);
      for (let i = 0; i < recent.length; i += 8) {
        await Promise.all(recent.slice(i, i + 8).map((oid) => API.get(`${CONFIG.dailyUrl}/${oid}/attachments`, {}).then((d) => take(oid, d.attachmentInfos)).catch(() => {})));
      }
      if (!map.size) ATT_ERR = (e && e.message) || 'attachments';
    }
    ATT = map; ATT_READY = true;
  }


  /* ---------------------------------------------------------------
     1. ӨДРИЙН ТОЙМ
     --------------------------------------------------------------- */
  function sparkline(parent, vals, hiIdx) {
    const W = 96, H = 34, max = Math.max(1, ...vals);
    const svg = S('svg', { class: 'spark', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' }, parent);
    const bw = W / vals.length;
    vals.forEach((v, i) => {
      const h = Math.max(v > 0 ? 2 : 1, v / max * (H - 2));
      S('rect', { x: i * bw + 1, y: H - h, width: Math.max(1, bw - 2), height: h, rx: 1, fill: i === hiIdx ? COLORS.total : '#c9d3dc' }, svg);
    });
  }
  function deltaLine(parent, delta, label, digits) {
    const cls = delta > 0.0001 ? 'up' : delta < -0.0001 ? 'dn' : '';
    const d = el('div', { class: 'dl ' + cls }, parent);
    const arrow = delta > 0.0001 ? '▲' : delta < -0.0001 ? '▼' : '●';
    el('b', null, d, arrow + ' ' + fmt(Math.abs(delta), digits));
    el('span', null, d, label);
  }
  function renderKpis() {
    const box = $('kpis'); box.innerHTML = '';
    const D = repDay();
    const spark = (fn) => { const v = []; for (let i = 13; i >= 0; i--) v.push(fn(addDays(D, -i))); return v; };
    const card = (cls) => el('div', { class: 'card kpi ' + (cls || '') }, box);
    const items = [
      { key: 'k.metres', fn: dayM, unit: t('u.m'), digits: 1, hero: true, period: (v) => mtr(v) },
      { key: 'k.samples', fn: dayS, unit: t('u.pcs'), digits: 1, period: (v) => pcs(v) },
      { key: 'k.active', fn: dayActive, unit: '', digits: 1, period: null }
    ];
    items.forEach((it) => {
      const c = card(it.hero ? 'hero' : '');
      el('div', { class: 'lbl' }, c, t(it.key));
      const v = it.fn(D);
      const val = el('div', { class: 'val' }, c, fmt(v, it.digits)); if (it.unit) el('small', null, val, it.unit);
      deltaLine(c, v - it.fn(addDays(D, -1)), t('k.vsPrev'), it.digits);
      deltaLine(c, v - avgBefore(it.fn, D, 7), t('k.vsAvg'), it.digits);
      if (it.period) el('div', { class: 'per' }, c, t('k.period', it.period(rangeSum(it.fn))));
      else {
        const holes = holesInRange();
        const by = {}; holes.forEach((h) => { by[h.status] = (by[h.status] || 0) + 1; });
        el('div', { class: 'per' }, c, ['drill', 'done', 'lab'].filter((s) => by[s]).map((s) => t('status.' + s) + ' ' + by[s]).join(' · ') || '–');
      }
      sparkline(c, spark(it.fn), 13);
    });
    // Лаб руу илгээсэн
    const c = card();
    el('div', { class: 'lbl' }, c, t('k.sent'));
    const inR = recsInRange().filter((r) => r.transport);
    const rock = inR.reduce((a, r) => a + (r.rock || 0), 0), soil = inR.reduce((a, r) => a + (r.soil || 0), 0);
    const val = el('div', { class: 'val' }, c, fmtI(rock + soil)); if (t('u.pcs')) el('small', null, val, t('u.pcs'));
    el('div', { class: 'dl' }, c, t('k.sentSplit', fmtI(rock), fmtI(soil)));
    const last = inR.filter((r) => r.date <= D).slice(-1)[0];
    el('div', { class: 'dl' }, c, last ? t('k.lastSent', fmtDate(last.date, 'short'), fmtI((last.rock || 0) + (last.soil || 0))) : t('k.noneSent'));
    el('div', { class: 'per' }, c, t('k.rangeLbl', fmtDate(F.from, 'short') + ' – ' + fmtDate(F.to, 'short')));
    sparkline(c, spark(daySent), 13);
    // Тест пит (өгөгдөлд байвал)
    if (recsInRange().some((r) => (r.tp || 0) > 0)) {
      const c2 = card();
      el('div', { class: 'lbl' }, c2, t('k.tp'));
      const v = dayTp(D);
      el('div', { class: 'val' }, c2, fmtI(v));
      deltaLine(c2, v - dayTp(addDays(D, -1)), t('k.vsPrev'), 1);
      deltaLine(c2, v - avgBefore(dayTp, D, 7), t('k.vsAvg'), 1);
      el('div', { class: 'per' }, c2, t('k.period', fmtI(rangeSum(dayTp))));
    }
  }

  function legend(box, items) {
    box.innerHTML = '';
    items.forEach((it) => { const s = el('span', null, box); const i = el('i', { class: it.line ? 'ln' : '' }, s); i.style.background = it.color; s.appendChild(document.createTextNode(it.label)); });
  }

  let shiftFocus = -1;
  function svgLegend(svg, items, x, y) {
    let cx = x;
    items.forEach((it) => {
      if (it.line) S('line', { x1: cx, x2: cx + 14, y1: y, y2: y, stroke: it.color, 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      else S('rect', { x: cx, y: y - 5, width: 10, height: 10, rx: 2, fill: it.color }, svg);
      const off = it.line ? 19 : 15;
      const tx = S('text', { x: cx + off, y: y + 4, 'font-size': 11.5, fill: '#5b6670' }, svg, it.label);
      let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = 0; }
      if (!w) w = it.label.length * 6.5;
      cx += off + w + 16;
    });
  }
  // Өдөр тутмын өрөмдлөг (шугам, м) ба дээжлэлт (багана, ш) — нэг график, нэг тэнхлэг
  function renderShiftChart(hostArg, exp) {
    const host = hostArg || $('shiftChart'); host.innerHTML = '';
    const days = dateRange(F.from, F.to);
    if (!exp) $('shiftSub').textContent = t('c.days', days.length);
    const leg = [{ color: COLORS.samp, label: t('c.panelS') }, { color: COLORS.metre, label: t('c.panelM'), line: true }];
    if (!exp) legend($('shiftLegend'), leg);
    if (!days.length) { el('div', { class: 'empty' }, host, t('noData')); return null; }

    const W = Math.max(300, host.clientWidth || 600), narrow = W < 520;
    const H = exp ? 360 : (narrow ? 260 : 320);
    const m = { l: 38, r: narrow ? 44 : 54, t: exp ? 34 : 14, b: 26 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const agg = (d, fn) => { const p = { day: 0, night: 0, unk: 0 }; dayRecs(d).forEach((r) => { const q = fn(r); p.day += q.day; p.night += q.night; p.unk += q.unk; }); p.tot = p.day + p.night + p.unk; return p; };
    const mv = days.map((d) => agg(d, mParts)), sv = days.map((d) => agg(d, sParts));
    const { top, ticks } = nice(Math.max(10, ...mv.map((v) => v.tot), ...sv.map((v) => v.tot)) * 1.08, narrow ? 4 : 5);
    const y = (v) => m.t + ph - (v / top) * ph;
    const band = pw / days.length, bw = Math.min(20, Math.max(2, band * 0.62));
    const cx = (i) => m.l + i * band + band / 2;
    const D = repDay();
    const sumM = mv.reduce((a, v) => a + v.tot, 0), sumS = sv.reduce((a, v) => a + v.tot, 0);
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': t('c.shift') + ', ' + fmtDate(F.from) + ' – ' + fmtDate(F.to) + ': ' + mtr(sumM) + ', ' + pcs(sumS) }, host);
    // Долоо хоногийн ээлжилсэн суурь
    let wk = 0, startI = 0;
    days.forEach((d, i) => {
      if (i > 0 && weekday(d) === 1) { if (wk % 2 === 1) S('rect', { x: m.l + startI * band, y: m.t, width: (i - startI) * band, height: ph, fill: '#f4f6f8' }, svg); wk++; startI = i; }
      if (i === days.length - 1 && wk % 2 === 1) S('rect', { x: m.l + startI * band, y: m.t, width: (i + 1 - startI) * band, height: ph, fill: '#f4f6f8' }, svg);
    });
    const di = days.indexOf(D);
    if (di >= 0) S('rect', { x: m.l + di * band, y: m.t, width: band, height: ph, fill: '#e6f2e6' }, svg);
    // Тор
    ticks.forEach((v) => {
      S('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v === 0 ? cssVar('--axis') : cssVar('--grid'), 'stroke-width': 1, 'shape-rendering': 'crispEdges' }, svg);
      S('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#5b6670', style: 'font-variant-numeric:tabular-nums' }, svg, fmt(v, 0));
    });
    // Дээж — багана
    sv.forEach((v, i) => {
      if (v.tot <= 0) return;
      const h = Math.max(0.8, y(0) - y(v.tot));
      S('path', { d: colPath(cx(i) - bw / 2, y(0) - h, bw, h, 4), fill: COLORS.samp }, svg);
    });
    // Өрөмдсөн метр — шугам, цэг
    const pts = mv.map((v, i) => [cx(i), y(v.tot)]);
    S('path', { d: 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L'), fill: 'none', stroke: COLORS.metre, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    const dotR = band >= 9 ? 4 : 0;
    pts.forEach((p, i) => { if (dotR || i === pts.length - 1) S('circle', { cx: p[0], cy: p[1], r: dotR || 4, fill: COLORS.metre, stroke: '#fff', 'stroke-width': 1.5 }, svg); });
    // Сүүлийн өдрийн шууд шошго
    const li = days.length - 1, lm = mv[li].tot, ls = sv[li].tot;
    let ym = y(lm) + 4, ys = y(ls) + 4;
    if (Math.abs(ym - ys) < 14) { if (ym <= ys) ys = ym + 14; else ym = ys + 14; }
    const lx = cx(li) + Math.max(bw / 2, 4) + 6;
    S('text', { x: lx, y: ym, 'font-size': 11.5, 'font-weight': 700, fill: '#191919' }, svg, fmt(lm) + ' ' + t('u.m'));
    S('text', { x: lx, y: ys, 'font-size': 11.5, 'font-weight': 600, fill: '#5b6670' }, svg, fmtI(ls) + (t('u.pcs') ? ' ' + t('u.pcs') : ''));
    // X тэнхлэг
    const step = Math.max(1, Math.ceil(48 / band));
    for (let i = days.length - 1; i >= 0; i -= step) S('text', { x: cx(i), y: H - 8, 'text-anchor': 'middle', 'font-size': 11, fill: '#5b6670' }, svg, fmtDate(days[i], 'short'));
    if (di >= 0) S('path', { d: `M${cx(di) - 5},${m.t + ph + 7}l5,-6l5,6z`, fill: cssVar('--green-700') }, svg);
    if (exp) { svgLegend(svg, leg, m.l, 12); return svg; }
    // Hover
    const hl = S('rect', { x: 0, y: m.t, width: band, height: ph, fill: 'rgba(12,40,57,.06)', visibility: 'hidden', 'pointer-events': 'none' }, svg);
    const build = (i) => (T) => {
      const d = days[i], v = mv[i], s = sv[i];
      tipHead(T, fmtDateWd(d));
      tipRow(T, COLORS.metre, mtr(v.tot), t('c.panelM'));
      const split = (p, f) => [F.day ? t('r.dayAb') + ' ' + f(p.day) : '', F.night ? t('r.nightAb') + ' ' + f(p.night) : '', p.unk > 0 ? '? ' + f(p.unk) : ''].filter(Boolean).join(' · ');
      if (v.tot > 0) tipRow(T, null, '', split(v, fmt));
      tipRow(T, COLORS.samp, pcs(s.tot), t('c.panelS'), true);
      if (s.tot > 0) tipRow(T, null, '', split(s, fmtI));
      const byH = new Map();
      dayRecs(d).forEach((r) => { if (!r.drillRec) return; const k = r.hole || r.other || '?'; const o = byH.get(k) || { m: 0, s: 0 }; o.m += mVal(r); o.s += sVal(r); byH.set(k, o); });
      if (byH.size) { tipSep(T); byH.forEach((o, h) => tipRow(T, null, mtr(o.m) + ' · ' + pcs(o.s), h)); }
      const sent = daySent(d); if (sent) { tipSep(T); tipRow(T, null, pcs(sent), t('k.sent')); }
    };
    const hit = S('rect', { x: m.l, y: m.t, width: pw, height: ph, fill: 'transparent', style: 'cursor:pointer' }, svg);
    const idxAt = (e) => { const b = svg.getBoundingClientRect(); const sx = (e.clientX - b.left) * (W / b.width); return Math.max(0, Math.min(days.length - 1, Math.floor((sx - m.l) / band))); };
    const showAt = (i, x, yy) => { hl.setAttribute('x', m.l + i * band); hl.setAttribute('visibility', 'visible'); tipShow(x, yy, build(i)); };
    const hideHl = () => { hl.setAttribute('visibility', 'hidden'); tipHide(); };
    hit.addEventListener('pointermove', (e) => showAt(idxAt(e), e.clientX, e.clientY));
    hit.addEventListener('pointerleave', hideHl);
    hit.addEventListener('click', (e) => { const d = days[idxAt(e)]; F.repDay = d === F.to ? null : d; update(); });
    host.tabIndex = 0; host.setAttribute('aria-label', t('c.shift') + '. ' + t('c.shiftNote'));
    host.onkeydown = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Enter') return;
      e.preventDefault();
      if (shiftFocus < 0 || shiftFocus >= days.length) shiftFocus = Math.max(0, days.indexOf(D));
      if (e.key === 'ArrowLeft') shiftFocus = Math.max(0, shiftFocus - 1);
      if (e.key === 'ArrowRight') shiftFocus = Math.min(days.length - 1, shiftFocus + 1);
      if (e.key === 'Enter') { const d = days[shiftFocus]; F.repDay = d === F.to ? null : d; update(); setTimeout(() => $('shiftChart').focus(), 0); return; }
      const b = svg.getBoundingClientRect(), sc = b.width / W;
      showAt(shiftFocus, b.left + (m.l + shiftFocus * band + band) * sc, b.top + m.t * sc);
    };
    host.onblur = hideHl;
  }
  function renderProgress(host, holes, opts) {
    opts = opts || {};
    host.innerHTML = '';
    const rows = holes.filter((h) => h.depth > 0 || h.plan);
    if (!rows.length) { el('div', { class: 'empty' }, host, t('noData')); return null; }
    const W = Math.max(280, host.clientWidth || 400), narrow = W < 460;
    const lw = narrow ? 92 : 104, rw = narrow ? 118 : 168, rowH = 30, m = { t: opts.exp ? 30 : 4, b: 22 };
    const H = m.t + rows.length * rowH + m.b, pw = W - lw - rw - 6;
    const max = Math.max(...rows.map((h) => Math.max(h.depth, h.plan || 0))) * 1.02;
    const { top, ticks } = nice(max, narrow ? 3 : 4);
    const x = (v) => lw + (v / top) * pw;
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': t('c.progress') }, host);
    ticks.forEach((v) => {
      S('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, stroke: v === 0 ? cssVar('--axis') : cssVar('--grid'), 'shape-rendering': 'crispEdges' }, svg);
      S('text', { x: x(v), y: H - 6, 'text-anchor': 'middle', 'font-size': 11, fill: '#5b6670' }, svg, fmt(v, 0));
    });
    rows.forEach((h, i) => {
      const yc = m.t + i * rowH + rowH / 2, bh = 14;
      const g = S('g', { tabindex: 0, role: 'listitem', 'aria-label': `${h.hole}: ${t('status.' + h.status)}, ${mtr(h.depth)}${h.plan ? ' / ' + mtr(h.plan) : ''}` }, svg);
      S('rect', { x: 0, y: yc - rowH / 2, width: W, height: rowH, fill: 'transparent' }, g);
      S('text', { x: lw - 8, y: yc + 4, 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: '#191919' }, g, h.hole);
      if (h.plan) S('path', { d: hbarPath(x(0), yc - bh / 2, x(h.plan) - x(0), bh, 4), fill: '#eef1f4' }, g);
      S('path', { d: hbarPath(x(0), yc - bh / 2, Math.max(1.5, x(h.depth) - x(0)), bh, 4), fill: statusColor(h.status) }, g);
      if (h.plan) S('line', { x1: x(h.plan), x2: x(h.plan), y1: yc - 11, y2: yc + 11, stroke: COLORS.avg, 'stroke-width': 2 }, g);
      const lab = S('text', { x: W - rw + 6, y: yc + 4, 'font-size': 12, fill: '#191919', style: 'font-variant-numeric:tabular-nums' }, g);
      if (h.plan) {
        S('tspan', null, lab, fmt(h.depth) + ' / ' + fmt(h.plan, 0) + ' ' + t('u.m'));
        S('tspan', { dx: 6, 'font-weight': 600, fill: h.pct >= 1 ? cssVar('--up') : '#191919' }, lab, Math.round(h.pct * 100) + '%');
      } else {
        S('tspan', null, lab, mtr(h.depth));
        S('tspan', { dx: 6, fill: '#8a949d', 'font-size': 11 }, lab, t('noPlan'));
      }
      bindTip(g, (T) => {
        tipHead(T, h.hole + ' · ' + t('status.' + h.status));
        tipRow(T, statusColor(h.status), mtr(h.depth), t('col.depth').replace(/, ?m$|, ?м$/, ''), true);
        if (h.plan) { tipRow(T, COLORS.avg, mtr(h.plan), t('plan')); tipRow(T, null, Math.round(h.pct * 100) + '%', t('col.pct')); }
        tipRow(T, null, pcs(h.tsamp), t('col.samples'));
        if (h.sent) tipRow(T, null, pcs(h.sent), t('col.sent'));
        if (h.eta) tipRow(T, null, etaText(h.eta), t('col.eta'));
        tipSep(T); tipRow(T, null, fmtDate(h.last, 'short'), t('col.last'));
      });
    });
    const legItems = ['drill', 'done', 'lab'].concat(holes.some((h) => h.status === 'prep') ? ['prep'] : []).map((s) => ({ color: statusColor(s), label: t('status.' + s) }))
      .concat(holes.some((h) => h.plan) ? [{ color: COLORS.avg, label: t('plan'), line: true }] : []);
    if (opts.exp) { svgLegend(svg, legItems, 8, 11); return svg; }
    if (!opts.noLegend) legend($('statusLegend'), legItems);
    return svg;
  }
  function etaText(e) {
    if (!e) return '–';
    if (e.reached) return t('eta.reached');
    if (e.none) return t('eta.noRate');
    return t('eta.days', fmtDate(e.date), e.days);
  }
  function etaShort(e) {
    if (!e) return '–';
    if (e.reached || e.none) return etaText(e);
    return fmtDateAuto(e.date) + ' (~' + e.days + ' ' + t('u.days') + ')';
  }
  function chip(parent, status) {
    const c = el('span', { class: 'chip' }, parent); const i = el('i', null, c); i.style.background = statusColor(status);
    c.appendChild(document.createTextNode(t('status.' + status)));
    return c;
  }

  function renderNotes() {
    const host = $('notesTbl'); host.innerHTML = '';
    const D = repDay();
    const rows = holesInRange().map((h) => {
      const r = [...h.recs].reverse().find((x) => x.note && x.date >= F.from && x.date <= D);
      return r ? { h, r } : null;
    }).filter(Boolean).sort((a, b) => b.r.date.localeCompare(a.r.date) || a.h.hole.localeCompare(b.h.hole));
    if (!rows.length) { el('div', { class: 'empty' }, host, t('noData')); return; }
    const tb = el('table', { class: 'tbl' }, host);
    const hr = el('tr', null, el('thead', null, tb));
    [t('col.hole'), t('col.status'), t('col.date'), t('col.note'), t('col.photo')].forEach((s) => el('th', null, hr, s));
    const body = el('tbody', null, tb);
    rows.forEach(({ h, r }) => {
      const tr = el('tr', null, body);
      el('td', { class: 'hole' }, tr, h.hole);
      chip(el('td', null, tr), h.status);
      el('td', { style: 'white-space:nowrap' }, tr, fmtDate(r.date, 'short'));
      const td = el('td', { class: 'notecell' }, tr); const d = el('div', { class: 'clamp', tabindex: 0, title: '' }, td, r.note);
      const pc = el('td', { class: 'photocell' }, tr);
      // Тухайн цооногийн тайлангийн өдөр хүртэлх хамгийн сүүлийн зураг
      const withPh = [...h.recs].reverse().find((x) => x.date <= D && x.date >= F.from && photosOf(x).length);
      if (withPh) {
        const items = photoItems([withPh]);
        const b = el('button', { type: 'button', class: 'thumb', 'aria-label': t('col.photo') + ': ' + photoCaption(items[0]), title: photoCaption(items[0]) }, pc);
        lazyImg(b, items[0].p, true);
        if (items.length > 1) el('span', { class: 'n' }, b, String(items.length));
        b.addEventListener('click', () => openPhotos(items, 0));
      }
      const toggle = () => d.classList.toggle('open');
      d.addEventListener('click', toggle); d.addEventListener('keydown', (e) => { if (e.key === 'Enter') toggle(); });
    });
  }

  // Ерөнхий багана график (нэг эсвэл давхарласан цуваа)
  function columnChart(host, cats, series, opts) {
    host.innerHTML = '';
    if (!cats.length) { el('div', { class: 'empty' }, host, t('noData')); return null; }
    const W = Math.max(260, host.clientWidth || 400), H = opts.height || 200;
    const m = { l: 36, r: 8, t: opts.legend && opts.legend.length ? 34 : 18, b: 26 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const totals = cats.map((_, i) => series.reduce((a, s) => a + (s.values[i] || 0), 0));
    const { top, ticks } = nice(Math.max(opts.minTop || 5, ...totals) * 1.08, 4);
    const y = (v) => m.t + ph - (v / top) * ph;
    const band = pw / cats.length, bw = Math.min(24, Math.max(3, band * 0.62));
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': opts.label || '' }, host);
    ticks.forEach((v) => {
      S('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v === 0 ? cssVar('--axis') : cssVar('--grid'), 'shape-rendering': 'crispEdges' }, svg);
      S('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#5b6670' }, svg, fmt(v, 0));
    });
    const maxI = totals.indexOf(Math.max(...totals));
    cats.forEach((c, i) => {
      const x = m.l + i * band + (band - bw) / 2;
      const segs = series.filter((s) => (s.values[i] || 0) > 0);
      let base = 0;
      segs.forEach((s, si) => {
        const v = s.values[i], y0 = y(base), y1 = y(base + v), gap = si > 0 ? 2 : 0, h = Math.max(0.8, y0 - y1 - gap);
        if (si === segs.length - 1) S('path', { d: colPath(x, y0 - gap - h, bw, h, 4), fill: s.color }, svg);
        else S('rect', { x, y: y0 - gap - h, width: bw, height: h, fill: s.color }, svg);
        base += v;
      });
      const labelIt = totals[i] > 0 && (cats.length <= 8 || i === maxI || i === cats.length - 1);
      if (labelIt) S('text', { x: x + bw / 2, y: y(totals[i]) - 5, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: '#191919' }, svg, (opts.fmt || fmtI)(totals[i]));
      const step = Math.max(1, Math.ceil(54 / band));
      if ((cats.length - 1 - i) % step === 0) S('text', { x: x + bw / 2, y: H - 8, 'text-anchor': 'middle', 'font-size': 11, fill: '#5b6670' }, svg, opts.catLabel ? opts.catLabel(c) : c);
      const hit = S('rect', { x: m.l + i * band, y: m.t, width: band, height: ph, fill: 'transparent', tabindex: 0 }, svg);
      if (opts.tooltip) bindTip(hit, (T) => opts.tooltip(T, i, totals[i]));
      hit.addEventListener('pointerenter', () => hit.setAttribute('fill', 'rgba(12,40,57,.05)'));
      hit.addEventListener('pointerleave', () => hit.setAttribute('fill', 'transparent'));
    });
    if (opts.legend && opts.legend.length) svgLegend(svg, opts.legend, m.l, 12);
    return svg;
  }

  function weeksOfRange() {
    const out = []; if (!F.from) return out;
    for (let w = weekStart(F.from); w <= F.to; w = addDays(w, 7)) out.push(w);
    return out;
  }
  function renderSent() {
    const weeks = weeksOfRange();
    const ships = recsInRange().filter((r) => r.transport);
    const rock = weeks.map((w) => ships.filter((r) => r.date >= w && r.date < addDays(w, 7)).reduce((a, r) => a + (r.rock || 0), 0));
    const soil = weeks.map((w) => ships.filter((r) => r.date >= w && r.date < addDays(w, 7)).reduce((a, r) => a + (r.soil || 0), 0));
    const series = [{ key: 'rock', color: COLORS.rock, values: rock }];
    const hasSoil = soil.some((v) => v > 0);
    if (hasSoil) series.push({ key: 'soil', color: COLORS.soil, values: soil });
    legend($('sentLegend'), hasSoil ? [{ color: COLORS.rock, label: t('rock') }, { color: COLORS.soil, label: t('soil') }] : []);
    columnChart($('sentChart'), weeks, series, {
      height: 190, label: t('c.sent'),
      catLabel: (w) => fmtDate(w < F.from ? F.from : w, 'short'),
      tooltip: (T, i, tot) => {
        const w = weeks[i], we = addDays(w, 6);
        tipHead(T, t('p.week', fmtDate(w < F.from ? F.from : w, 'short'), fmtDate(we > F.to ? F.to : we, 'short')));
        tipRow(T, null, pcs(tot), t('total'));
        if (hasSoil) { tipRow(T, COLORS.rock, pcs(rock[i]), t('rock'), true); tipRow(T, COLORS.soil, pcs(soil[i]), t('soil'), true); }
        const rs = ships.filter((r) => r.date >= w && r.date < addDays(w, 7));
        if (rs.length) { tipSep(T); rs.forEach((r) => tipRow(T, null, pcs((r.rock || 0) + (r.soil || 0)), fmtDate(r.date, 'short') + ' · ' + (r.holes.join(', ') || r.other))); }
      }
    });
    // Авсан ба илгээсэн
    const host = $('backlogTbl'); host.innerHTML = '';
    const holes = holesInRange().filter((h) => h.tsamp > 0).map((h) => ({ h, left: Math.max(0, h.tsamp - h.sent) }))
      .sort((a, b) => b.left - a.left || a.h.hole.localeCompare(b.h.hole));
    if (!holes.length) { el('div', { class: 'empty' }, host, t('noData')); return; }
    const tb = el('table', { class: 'tbl wrap' }, host);
    const hr = el('tr', null, el('thead', null, tb));
    [[t('col.hole')], [t('col.taken'), 'num'], [t('col.sent'), 'num'], [t('col.left'), 'num'], ['', '']].forEach(([s, c]) => el('th', { class: c || null }, hr, s));
    const body = el('tbody', null, tb);
    holes.forEach(({ h, left }) => {
      const tr = el('tr', null, body);
      el('td', { class: 'hole' }, tr, h.hole);
      el('td', { class: 'num' }, tr, fmtI(h.tsamp));
      el('td', { class: 'num' }, tr, fmtI(h.sent));
      el('td', { class: 'num', style: left > 0 ? 'font-weight:700' : 'color:var(--ink-3)' }, tr, fmtI(left));
      const td = el('td', { style: 'width:58px;padding-left:2px;padding-right:2px' }, tr);
      const bar = el('span', { class: 'bar-mini', style: 'width:50px', title: Math.round(Math.min(1, h.sent / h.tsamp) * 100) + '%' }, td);
      const fill = el('span', null, bar); fill.style.width = Math.min(100, h.sent / h.tsamp * 100) + '%'; fill.style.background = COLORS.lab;
    });
  }

  /* ---------------------------------------------------------------
     2. ЦООНОГИЙН ЯВЦ
     --------------------------------------------------------------- */
  function renderHoles() {
    const holes = holesInRange();
    const host = $('holeTbl'); host.innerHTML = '';
    if (!holes.length) { el('div', { class: 'empty' }, host, t('noData')); $('multiples').innerHTML = ''; return; }
    const tb = el('table', { class: 'tbl wrap' }, host);
    const hr = el('tr', null, el('thead', null, tb));
    const cols = [['col.hole'], ['col.status'], ['col.start'], ['col.last'], ['col.days', 'num'], ['col.depth', 'num'], ['col.plan', 'num'], ['col.pct'], ['col.rate', 'num'], ['col.samples', 'num'], ['col.per10', 'num'], ['col.sent', 'num'], ['col.eta']];
    cols.forEach(([k, c]) => el('th', { class: c || null }, hr, t(k)));
    const body = el('tbody', null, tb);
    holes.forEach((h) => {
      const tr = el('tr', null, body);
      el('td', { class: 'hole' }, tr, h.hole);
      chip(el('td', null, tr), h.status);
      el('td', { style: 'white-space:nowrap' }, tr, fmtDateAuto(h.firstDrill || h.first));
      el('td', { style: 'white-space:nowrap' }, tr, fmtDateAuto(h.last));
      el('td', { class: 'num' }, tr, h.firstDrill ? fmtI(diffDays(h.firstDrill, h.lastDrill || h.firstDrill) + 1) : '–');
      el('td', { class: 'num', style: 'font-weight:600' }, tr, fmt(h.depth));
      el('td', { class: 'num' }, tr, h.plan ? fmt(h.plan, 0) : '–');
      const pc = el('td', { style: 'white-space:nowrap' }, tr);
      if (h.plan) {
        const bar = el('span', { class: 'bar-mini', style: 'width:54px' }, pc); const f = el('span', null, bar);
        f.style.width = Math.min(100, h.pct * 100) + '%'; f.style.background = statusColor(h.status);
        el('span', { style: 'margin-left:6px;font-variant-numeric:tabular-nums' }, pc, Math.round(h.pct * 100) + '%');
      } else pc.textContent = '–';
      el('td', { class: 'num' }, tr, h.activeDays ? fmt(h.depth / h.activeDays) : '–');
      el('td', { class: 'num' }, tr, fmtI(h.tsamp));
      el('td', { class: 'num' }, tr, h.depth > 0 ? fmt(h.tsamp / h.depth * 10) : '–');
      el('td', { class: 'num' }, tr, h.sent ? fmtI(h.sent) : '–');
      el('td', { style: 'white-space:nowrap', title: h.eta ? etaText(h.eta) : '' }, tr, h.status === 'drill' ? (h.plan ? etaShort(h.eta) : t('noPlan')) : '–');
    });
    // Жижиг графикууд
    const mh = $('multiples'); mh.innerHTML = '';
    const D = repDay();
    holes.filter((h) => h.depth > 0).forEach((h) => {
      const card = el('div', { class: 'mcard' }, mh);
      const head = el('div', { class: 'mh' }, card);
      const left = el('div', null, head); el('b', null, left, h.hole); left.appendChild(document.createTextNode(' ')); chip(left, h.status);
      el('span', null, head, fmt(h.depth) + (h.plan ? ' / ' + fmt(h.plan, 0) : '') + ' ' + t('u.m'));
      const host2 = el('div', { class: 'chart' }, card);
      const pts = []; let lastD = null;
      h.recs.forEach((r) => { if (r.depth != null && r.date !== lastD) { pts.push([r.date, r.depth]); lastD = r.date; } else if (r.depth != null) pts[pts.length - 1] = [r.date, Math.max(pts[pts.length - 1][1], r.depth)]; });
      const start = h.firstDrill ? addDays(h.firstDrill, -1) : h.first, end = D > h.last ? h.last : D;
      const data = pts.filter((p) => p[0] >= start && p[0] <= end);
      if (data.length < 1) return;
      const W = Math.max(240, card.clientWidth - 24), H = 118, m = { l: 34, r: 8, t: 10, b: 20 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
      const span = Math.max(1, diffDays(start, end));
      const { top, ticks } = nice(Math.max(h.depth, h.plan || 0) * 1.05, 3);
      const x = (d) => m.l + diffDays(start, d) / span * pw, y = (v) => m.t + ph - v / top * ph;
      const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': h.hole + ' ' + t('h.curves') }, host2);
      ticks.forEach((v) => {
        S('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v === 0 ? cssVar('--axis') : cssVar('--grid'), 'shape-rendering': 'crispEdges' }, svg);
        S('text', { x: m.l - 5, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 10.5, fill: '#5b6670' }, svg, fmt(v, 0));
      });
      if (h.plan) {
        S('line', { x1: m.l, x2: W - m.r, y1: y(h.plan), y2: y(h.plan), stroke: COLORS.avg, 'stroke-width': 1 }, svg);
        const above = h.depth < h.plan;
        S('text', { x: W - m.r - 2, y: above ? y(h.plan) - 5 : y(h.plan) + 13, 'text-anchor': 'end', 'font-size': 10.5, fill: '#5b6670' }, svg, t('h.plan', fmt(h.plan, 0)));
      }
      const c = statusColor(h.status);
      const line = data.map((p) => x(p[0]).toFixed(1) + ',' + y(p[1]).toFixed(1));
      S('path', { d: 'M' + x(data[0][0]) + ',' + y(0) + 'L' + line.join('L') + 'L' + x(data[data.length - 1][0]) + ',' + y(0) + 'Z', fill: c, 'fill-opacity': 0.1 }, svg);
      S('path', { d: 'M' + line.join('L'), fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
      const lp = data[data.length - 1];
      S('circle', { cx: x(lp[0]), cy: y(lp[1]), r: 4, fill: c, stroke: '#fff', 'stroke-width': 2 }, svg);
      S('text', { x: m.l, y: H - 5, 'font-size': 10.5, fill: '#5b6670' }, svg, fmtDate(start, 'short'));
      S('text', { x: W - m.r, y: H - 5, 'text-anchor': 'end', 'font-size': 10.5, fill: '#5b6670' }, svg, fmtDate(end, 'short'));
      // Crosshair
      const cross = S('line', { y1: m.t, y2: m.t + ph, stroke: '#8a949d', 'stroke-width': 1, visibility: 'hidden' }, svg);
      const hit = S('rect', { x: m.l, y: m.t, width: pw, height: ph, fill: 'transparent' }, svg);
      hit.addEventListener('pointermove', (e) => {
        const b = svg.getBoundingClientRect(), sx = (e.clientX - b.left) * (W / b.width);
        let best = data[0]; data.forEach((p) => { if (Math.abs(x(p[0]) - sx) < Math.abs(x(best[0]) - sx)) best = p; });
        cross.setAttribute('x1', x(best[0])); cross.setAttribute('x2', x(best[0])); cross.setAttribute('visibility', 'visible');
        tipShow(e.clientX, e.clientY, (T) => { tipHead(T, h.hole + ' · ' + fmtDateWd(best[0])); tipRow(T, c, mtr(best[1]), t('col.depth').replace(/, ?(m|м)$/, '')); });
      });
      hit.addEventListener('pointerleave', () => { cross.setAttribute('visibility', 'hidden'); tipHide(); });
    });
  }

  /* ---------------------------------------------------------------
     3. БҮТЭЭМЖ
     --------------------------------------------------------------- */
  // Бүтээмж: ээлжээр өдөр тутмын өрөмдлөг (дээд самбар, м) ба дээжлэлт (доод самбар, ш) — нэг X тэнхлэг, хоёр самбар, 7 хоногийн дундаж
  function rollingS(d, n) { let s = 0; for (let i = 0; i < n; i++) s += dayS(addDays(d, -i)); return s / n; }
  let prodFocus = -1;
  function renderShiftPanels(hostArg, exp) {
    const host = hostArg || $('prodShift'); host.innerHTML = '';
    const days = dateRange(F.from, F.to);
    if (!exp) $('prodShiftSub').textContent = t('c.days', days.length);
    const leg = [];
    if (F.day) leg.push({ color: COLORS.day, label: t('shift.day') });
    if (F.night) leg.push({ color: COLORS.night, label: t('shift.night') });
    const anyUnk = F.day && F.night && days.some((d) => dayRecs(d).some((r) => mParts(r).unk > 0 || sParts(r).unk > 0));
    if (anyUnk) leg.push({ color: COLORS.unk, label: t('shift.unk') });
    leg.push({ color: COLORS.avg, label: t('avg7'), line: true });
    if (!exp) legend($('prodShiftLegend'), leg);
    if (!days.length) { el('div', { class: 'empty' }, host, t('noData')); return null; }

    const W = Math.max(300, host.clientWidth || 600), narrow = W < 520;
    const ph1 = exp ? 230 : (narrow ? 170 : 220), ph2 = exp ? 120 : (narrow ? 90 : 112), gap = 30;
    const m = { l: 40, r: 10, t: exp ? 46 : 22, b: 26 };
    const H = m.t + ph1 + gap + ph2 + m.b, pw = W - m.l - m.r;
    const top1 = m.t, top2 = m.t + ph1 + gap;
    const agg = (d, fn) => { const p = { day: 0, night: 0, unk: 0 }; dayRecs(d).forEach((r) => { const q = fn(r); p.day += q.day; p.night += q.night; p.unk += q.unk; }); p.tot = p.day + p.night + p.unk; return p; };
    const vals = days.map((d) => { const p = agg(d, mParts); p.avg = rolling(d, 7); return p; });
    const svals = days.map((d) => { const p = agg(d, sParts); p.avg = rollingS(d, 7); return p; });
    const sc1 = nice(Math.max(10, ...vals.map((v) => Math.max(v.tot, v.avg))) * 1.04, narrow ? 4 : 5);
    const sc2 = nice(Math.max(5, ...svals.map((v) => Math.max(v.tot, v.avg))) * 1.06, 3);
    const y1 = (v) => top1 + ph1 - (v / sc1.top) * ph1, y2 = (v) => top2 + ph2 - (v / sc2.top) * ph2;
    const band = pw / days.length, bw = Math.min(24, Math.max(2, band * 0.7));
    const D = repDay();
    const sumM = vals.reduce((a, v) => a + v.tot, 0), sumS = svals.reduce((a, v) => a + v.tot, 0);
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': t('p.shiftDaily') + ', ' + fmtDate(F.from) + ' – ' + fmtDate(F.to) + ': ' + mtr(sumM) + ', ' + pcs(sumS) }, host);
    // Долоо хоногийн ээлжилсэн суурь, сонгосон өдөр (хоёр самбарт)
    const bands = (top, h) => {
      let wk = 0, startI = 0;
      days.forEach((d, i) => {
        if (i > 0 && weekday(d) === 1) { if (wk % 2 === 1) S('rect', { x: m.l + startI * band, y: top, width: (i - startI) * band, height: h, fill: '#f4f6f8' }, svg); wk++; startI = i; }
        if (i === days.length - 1 && wk % 2 === 1) S('rect', { x: m.l + startI * band, y: top, width: (i + 1 - startI) * band, height: h, fill: '#f4f6f8' }, svg);
      });
    };
    bands(top1, ph1); bands(top2, ph2);
    const di = days.indexOf(D);
    if (di >= 0) { S('rect', { x: m.l + di * band, y: top1, width: band, height: ph1, fill: '#e6f2e6' }, svg); S('rect', { x: m.l + di * band, y: top2, width: band, height: ph2, fill: '#e6f2e6' }, svg); }
    // Тор, Y тэмдэглэгээ
    const grid = (sc, y, digits) => sc.ticks.forEach((v) => {
      S('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v === 0 ? cssVar('--axis') : cssVar('--grid'), 'stroke-width': 1, 'shape-rendering': 'crispEdges' }, svg);
      S('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#5b6670', style: 'font-variant-numeric:tabular-nums' }, svg, fmt(v, digits));
    });
    grid(sc1, y1, 0); grid(sc2, y2, 0);
    // Самбарын гарчиг
    S('text', { x: m.l, y: top1 - 8, 'font-size': 12, 'font-weight': 600, fill: '#191919' }, svg, t('c.panelM'));
    S('text', { x: m.l, y: top2 - 8, 'font-size': 12, 'font-weight': 600, fill: '#191919' }, svg, t('c.panelS'));
    // Багана
    const bars = (arr, y) => arr.forEach((v, i) => {
      const x = m.l + i * band + (band - bw) / 2;
      const segs = [['day', COLORS.day], ['night', COLORS.night], ['unk', COLORS.unk]].filter(([k]) => v[k] > 0);
      let base = 0;
      segs.forEach(([k, c], si) => {
        const y0 = y(base), yt = y(base + v[k]);
        const g = si > 0 ? 2 : 0, h = Math.max(0.8, y0 - yt - g);
        if (si === segs.length - 1) S('path', { d: colPath(x, y0 - g - h, bw, h, 4), fill: c }, svg);
        else S('rect', { x, y: y0 - g - h, width: bw, height: h, fill: c }, svg);
        base += v[k];
      });
    });
    bars(vals, y1); bars(svals, y2);
    // 7 хоногийн дундаж (самбар бүрт)
    const avgLine = (arr, y) => {
      const pts = arr.map((v, i) => [m.l + i * band + band / 2, y(v.avg)]);
      S('path', { d: 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L'), fill: 'none', stroke: COLORS.avg, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
      const lp = pts[pts.length - 1];
      S('circle', { cx: lp[0], cy: lp[1], r: 4, fill: COLORS.avg, stroke: '#fff', 'stroke-width': 2 }, svg);
    };
    avgLine(vals, y1); avgLine(svals, y2);
    // X тэнхлэг
    const step = Math.max(1, Math.ceil(48 / band));
    for (let i = days.length - 1; i >= 0; i -= step) {
      S('text', { x: m.l + i * band + band / 2, y: H - 8, 'text-anchor': 'middle', 'font-size': 11, fill: '#5b6670' }, svg, fmtDate(days[i], 'short'));
    }
    if (di >= 0) S('path', { d: `M${m.l + di * band + band / 2 - 5},${top2 + ph2 + 7}l5,-6l5,6z`, fill: cssVar('--green-700') }, svg);
    if (exp) { svgLegend(svg, leg, m.l, 12); return svg; }
    // Hover давхарга (хоёр самбарыг хамарна)
    const hlA = S('rect', { x: 0, y: top1, width: band, height: ph1, fill: 'rgba(12,40,57,.06)', visibility: 'hidden', 'pointer-events': 'none' }, svg);
    const hlB = S('rect', { x: 0, y: top2, width: band, height: ph2, fill: 'rgba(12,40,57,.06)', visibility: 'hidden', 'pointer-events': 'none' }, svg);
    const build = (i) => (T) => {
      const d = days[i], v = vals[i], s = svals[i];
      tipHead(T, fmtDateWd(d));
      tipRow(T, null, mtr(v.tot), t('c.panelM'));
      if (F.day) tipRow(T, COLORS.day, mtr(v.day), t('shift.day'), true);
      if (F.night) tipRow(T, COLORS.night, mtr(v.night), t('shift.night'), true);
      if (v.unk > 0) tipRow(T, COLORS.unk, mtr(v.unk), t('shift.unk'), true);
      tipRow(T, COLORS.avg, mtr(v.avg), t('avg7'));
      tipSep(T);
      tipRow(T, null, pcs(s.tot), t('c.panelS'));
      if (F.day) tipRow(T, COLORS.day, pcs(s.day), t('shift.day'), true);
      if (F.night) tipRow(T, COLORS.night, pcs(s.night), t('shift.night'), true);
      if (s.unk > 0) tipRow(T, COLORS.unk, pcs(s.unk), t('shift.unk'), true);
      tipRow(T, COLORS.avg, pcs(Math.round(s.avg * 10) / 10), t('avg7'));
      const byH = new Map();
      dayRecs(d).forEach((r) => { if (!r.drillRec) return; const k = r.hole || r.other || '?'; const o = byH.get(k) || { m: 0, s: 0 }; o.m += mVal(r); o.s += sVal(r); byH.set(k, o); });
      if (byH.size) { tipSep(T); byH.forEach((o, h) => tipRow(T, null, mtr(o.m) + ' · ' + pcs(o.s), h)); }
      const sent = daySent(d); if (sent) tipRow(T, null, pcs(sent), t('k.sent'));
    };
    const hit = S('rect', { x: m.l, y: top1, width: pw, height: top2 + ph2 - top1, fill: 'transparent', style: 'cursor:pointer' }, svg);
    const idxAt = (e) => { const b = svg.getBoundingClientRect(); const sx = (e.clientX - b.left) * (W / b.width); return Math.max(0, Math.min(days.length - 1, Math.floor((sx - m.l) / band))); };
    const showAt = (i, cx, cy) => { [hlA, hlB].forEach((h) => { h.setAttribute('x', m.l + i * band); h.setAttribute('visibility', 'visible'); }); tipShow(cx, cy, build(i)); };
    const hideHl = () => { [hlA, hlB].forEach((h) => h.setAttribute('visibility', 'hidden')); tipHide(); };
    hit.addEventListener('pointermove', (e) => showAt(idxAt(e), e.clientX, e.clientY));
    hit.addEventListener('pointerleave', hideHl);
    hit.addEventListener('click', (e) => { const d = days[idxAt(e)]; F.repDay = d === F.to ? null : d; update(); });
    host.tabIndex = 0; host.setAttribute('aria-label', t('p.shiftDaily') + '. ' + t('c.shiftNote'));
    host.onkeydown = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Enter') return;
      e.preventDefault();
      if (prodFocus < 0 || prodFocus >= days.length) prodFocus = Math.max(0, days.indexOf(D));
      if (e.key === 'ArrowLeft') prodFocus = Math.max(0, prodFocus - 1);
      if (e.key === 'ArrowRight') prodFocus = Math.min(days.length - 1, prodFocus + 1);
      if (e.key === 'Enter') { const d = days[prodFocus]; F.repDay = d === F.to ? null : d; update(); setTimeout(() => $('prodShift').focus(), 0); return; }
      const b = svg.getBoundingClientRect(), sc = b.width / W;
      showAt(prodFocus, b.left + (m.l + prodFocus * band + band) * sc, b.top + top1 * sc);
    };
    host.onblur = hideHl;
  }
  function renderProd() {
    const rs = recsInRange();
    const drill = rs.filter((r) => r.drillRec);
    const tot = drill.reduce((a, r) => a + mVal(r), 0), samples = drill.reduce((a, r) => a + sVal(r), 0);
    const hd = new Map(); drill.forEach((r) => { if (r.hole) { const k = r.hole + '|' + r.date; hd.set(k, (hd.get(k) || 0) + mVal(r)); } });
    const active = [...hd.values()].filter((v) => v > 0).length, idle = [...hd.values()].filter((v) => v === 0).length;
    let best = null; dateRange(F.from, F.to).forEach((d) => { const v = dayM(d); if (!best || v > best.v) best = { d, v }; });
    const box = $('prodKpis'); box.innerHTML = '';
    const tile = (lbl, val, unit, sub) => { const c = el('div', { class: 'card kpi' }, box); el('div', { class: 'lbl' }, c, lbl); const v = el('div', { class: 'val' }, c, val); if (unit) el('small', null, v, unit); if (sub) el('div', { class: 'dl' }, c, sub); return c; };
    tile(t('p.total'), fmt(tot), t('u.m'), t('c.days', dateRange(F.from, F.to).length).replace(/^·\s*/, ''));
    tile(t('p.holeDays'), fmtI(active), '', t('p.idle', fmtI(idle)));
    tile(t('p.avg'), active ? fmt(tot / active) : '–', t('u.m'));
    tile(t('p.per10'), tot > 0 ? fmt(samples / tot * 10) : '–', '', t('p.samplesTaken', fmtI(samples)));
    tile(t('p.best'), best && best.v > 0 ? fmt(best.v) : '–', t('u.m'), best && best.v > 0 ? fmtDateWd(best.d) : '');
    renderShiftPanels();

    // Ээлжийн харьцаа — өндөр сегментлэсэн багана
    const P = { day: 0, night: 0, unk: 0 }, PS = { day: 0, night: 0, unk: 0 }, NS_ = { day: 0, night: 0 };
    drill.forEach((r) => { const q = mParts(r), s = sParts(r); P.day += q.day; P.night += q.night; P.unk += q.unk; PS.day += s.day; PS.night += s.night; PS.unk += s.unk; if (r.hasSplit) { if ((r.mDay || 0) > 0) NS_.day++; if ((r.mNight || 0) > 0) NS_.night++; } });
    const share = $('shareBar'); share.innerHTML = '';
    const tsum = P.day + P.night + P.unk;
    const parts = [['day', COLORS.day, '#0b0b0b'], ['night', COLORS.night, '#fff'], ['unk', COLORS.unk, '#0b0b0b']].filter(([k]) => P[k] > 0);
    if (tsum > 0) {
      const W = Math.max(260, share.clientWidth || 400), H = 28;
      const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': t('p.shiftShare') + ': ' + parts.map(([k]) => t('shift.' + k) + ' ' + Math.round(P[k] / tsum * 100) + '%').join(', ') }, share);
      let x = 0; const gap = 2, avail = W - gap * (parts.length - 1);
      parts.forEach(([k, c, ink]) => {
        const w = P[k] / tsum * avail;
        const g = S('g', { tabindex: 0 }, svg);
        S('rect', { x, y: 0, width: Math.max(0, w), height: H, rx: 4, fill: c }, g);
        const lbl = Math.round(P[k] / tsum * 100) + '%';
        if (w > 44) S('text', { x: x + 8, y: 18.5, 'font-size': 12.5, 'font-weight': 600, fill: ink }, g, lbl);
        bindTip(g, (T) => { tipHead(T, t('shift.' + k)); tipRow(T, c, mtr(P[k]), lbl, true); });
        x += w + gap;
      });
    } else el('div', { class: 'empty' }, share, t('noData'));
    legend($('shareLegend'), parts.map(([k, c]) => ({ color: c, label: t('shift.' + k) })));
    const st = $('shiftTbl'); st.innerHTML = '';
    const thr = el('tr', null, el('thead', null, st));
    [[t('col.shift')], [t('col.m'), 'num'], [t('col.shifts'), 'num'], [t('col.avgShift'), 'num'], [t('col.samples'), 'num'], [t('col.per10'), 'num']].forEach(([s, c]) => el('th', { class: c || null }, thr, s));
    const sb = el('tbody', null, st);
    [['day', COLORS.day], ['night', COLORS.night]].forEach(([k, c]) => {
      if (!(k === 'day' ? F.day : F.night)) return;
      const tr = el('tr', null, sb);
      const td = el('td', null, tr); const ch = el('span', { class: 'chip' }, td); const i = el('i', null, ch); i.style.background = c; i.style.borderRadius = '2px'; ch.appendChild(document.createTextNode(t('shift.' + k)));
      el('td', { class: 'num' }, tr, fmt(P[k])); el('td', { class: 'num' }, tr, fmtI(NS_[k]));
      el('td', { class: 'num' }, tr, NS_[k] ? fmt(P[k] / NS_[k]) : '–'); el('td', { class: 'num' }, tr, fmtI(PS[k]));
      el('td', { class: 'num' }, tr, P[k] > 0 ? fmt(PS[k] / P[k] * 10) : '–');
    });

    // Долоо хоногийн өрөмдлөг
    const weeks = weeksOfRange();
    const wv = weeks.map((w) => dateRange(w < F.from ? F.from : w, addDays(w, 6) > F.to ? F.to : addDays(w, 6)).reduce((a, d) => a + dayM(d), 0));
    columnChart($('weeklyChart'), weeks, [{ key: 'm', color: COLORS.total, values: wv }], {
      height: 220, label: t('p.weekly'), fmt: (v) => fmt(v, 0), catLabel: (w) => fmtDate(w < F.from ? F.from : w, 'short'),
      tooltip: (T, i, tv) => { const w = weeks[i], we = addDays(w, 6); tipHead(T, t('p.week', fmtDate(w < F.from ? F.from : w, 'short'), fmtDate(we > F.to ? F.to : we, 'short'))); tipRow(T, COLORS.total, mtr(tv), t('total'), true); }
    });
    renderHeatmap();
    // Зогсолт, засвар
    const down = rs.filter((r) => r.note && DOWN_RE.test(r.note)).sort((a, b) => b.date.localeCompare(a.date));
    $('downSub').textContent = t('p.downSub', down.length);
    const host = $('downTbl'); host.innerHTML = '';
    if (!down.length) { el('div', { class: 'empty' }, host, t('noData')); return; }
    const tb = el('table', { class: 'tbl' }, host);
    const hr = el('tr', null, el('thead', null, tb));
    [[t('col.date')], [t('col.hole')], [t('col.m'), 'num'], [t('col.note')]].forEach(([s, c]) => el('th', { class: c || null }, hr, s));
    const body = el('tbody', null, tb);
    down.forEach((r) => {
      const tr = el('tr', null, body);
      el('td', { style: 'white-space:nowrap' }, tr, fmtDate(r.date, 'short'));
      el('td', { class: 'hole' }, tr, r.hole || r.other || '–');
      el('td', { class: 'num' }, tr, r.mTot == null ? '–' : fmt(r.mTot));
      el('td', null, tr, r.note);
    });
  }

  const HEAT = [[0, '#eef1f4'], [10, '#cce3fd'], [25, '#9dc8f7'], [40, '#6aabf1'], [60, '#338ced'], [80, '#2370cd'], [Infinity, '#0f4a96']];
  function heatColor(v) { if (v <= 0) return HEAT[0][1]; for (let i = 1; i < HEAT.length; i++) if (v <= HEAT[i][0]) return HEAT[i][1]; return HEAT[HEAT.length - 1][1]; }
  function renderHeatmap() {
    const host = $('heatmap'); host.innerHTML = '';
    const days = dateRange(F.from, F.to);
    const rs = recsInRange().filter((r) => r.drillRec && r.hole);
    const holes = [...new Set(rs.map((r) => r.hole))].sort((a, b) => {
      const fa = rs.find((r) => r.hole === a).date, fb = rs.find((r) => r.hole === b).date; return fa.localeCompare(fb) || a.localeCompare(b);
    });
    const lg = $('heatLegend'); lg.innerHTML = '';
    const lbls = ['0', '≤10', '≤25', '≤40', '≤60', '≤80', '>80'];
    HEAT.forEach(([, c], i) => { const s = el('span', null, lg); const k = el('i', null, s); k.style.background = c; s.appendChild(document.createTextNode(lbls[i])); });
    const s0 = el('span', null, lg); const k0 = el('i', null, s0); k0.style.background = '#fff'; k0.style.border = '1px solid #d5dce3'; s0.appendChild(document.createTextNode(t('p.noReport')));
    if (!holes.length || !days.length) { el('div', { class: 'empty' }, host, t('noData')); return; }
    const avail = Math.max(300, host.clientWidth || 600), lw = 104;
    const cw = Math.max(9, Math.min(24, (avail - lw - 8) / days.length)), ch = 22;
    const W = lw + cw * days.length + 8, H = holes.length * (ch + 2) + 26;
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': t('p.heat'), style: 'width:' + W + 'px;max-width:none' }, host);
    const idx = new Map(); rs.forEach((r) => { const k = r.hole + '|' + r.date; idx.set(k, (idx.get(k) || 0) + mVal(r)); });
    holes.forEach((h, j) => {
      const yy = j * (ch + 2);
      S('text', { x: lw - 8, y: yy + ch / 2 + 4, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: '#191919' }, svg, h);
      days.forEach((d, i) => {
        const k = h + '|' + d, has = idx.has(k), v = idx.get(k) || 0;
        const x = lw + i * cw;
        const rect = S('rect', { x: x + 1, y: yy, width: cw - 2, height: ch, rx: 3, fill: has ? heatColor(v) : '#fff', stroke: has ? 'none' : '#e3e8ed' }, svg);
        if (has) bindTip(rect, (T) => { tipHead(T, h + ' · ' + fmtDateWd(d)); tipRow(T, heatColor(v), mtr(v), t('col.m').replace(/, ?(m|м)$/, ''), true); });
      });
    });
    const step = Math.max(1, Math.ceil(46 / cw));
    for (let i = days.length - 1; i >= 0; i -= step) S('text', { x: lw + i * cw + cw / 2, y: H - 6, 'text-anchor': 'middle', 'font-size': 11, fill: '#5b6670' }, svg, fmtDate(days[i], 'short'));
  }

  /* ---------------------------------------------------------------
     4. ӨГӨГДЛИЙН ЧАНАР
     --------------------------------------------------------------- */
  const SEV_ORDER = ['critical', 'serious', 'warning', 'info'];
  const SEV_COLOR = () => ({ critical: COLORS['s-crit'], serious: COLORS['s-serious'], warning: COLORS['s-warn'], info: '#8a949d' });
  function sevIcon(parent, sev) {
    const c = SEV_COLOR()[sev];
    const svg = S('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true' }, parent);
    if (sev === 'critical') { S('path', { d: 'M5 1h6l4 4v6l-4 4H5l-4-4V5z', fill: c }, svg); S('path', { d: 'M5.5 5.5l5 5M10.5 5.5l-5 5', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, svg); }
    else if (sev === 'serious') { S('path', { d: 'M8 1l7 7-7 7-7-7z', fill: c }, svg); S('path', { d: 'M8 4.5v4.5', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, svg); S('circle', { cx: 8, cy: 11.4, r: 1, fill: '#fff' }, svg); }
    else if (sev === 'warning') { S('path', { d: 'M8 1.2l7.2 13H.8z', fill: c }, svg); S('path', { d: 'M8 5.5v4', stroke: '#0b0b0b', 'stroke-width': 1.7, 'stroke-linecap': 'round' }, svg); S('circle', { cx: 8, cy: 11.8, r: 0.95, fill: '#0b0b0b' }, svg); }
    else { S('circle', { cx: 8, cy: 8, r: 7, fill: c }, svg); S('path', { d: 'M8 7v4.5', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, svg); S('circle', { cx: 8, cy: 4.6, r: 1, fill: '#fff' }, svg); }
    return svg;
  }
  function sevLabel(parent, sev) { const s = el('span', { class: 'sev' }, parent); sevIcon(s, sev); s.appendChild(document.createTextNode(t('sev.' + sev))); return s; }

  function runChecks() {
    const inR = (d) => d >= F.from && d <= F.to;
    const out = {}; const add = (key, sev, row) => { (out[key] = out[key] || { key, sev, rows: [] }).rows.push(row); };
    const rs = recsInRange();
    // Ээлжийн нийлбэр
    rs.forEach((r) => {
      if (r.hasSplit && r.m != null && Math.abs((r.mDay || 0) + (r.mNight || 0) - r.m) > 0.05) add('shiftSum', 'warning', { r, msg: t('m.shift', fmt(r.mDay || 0), fmt(r.mNight || 0), fmt((r.mDay || 0) + (r.mNight || 0)), fmt(r.m), t('m.metres')) });
      if (r.sSplit && r.s != null && Math.abs((r.sDay || 0) + (r.sNight || 0) - r.s) > 0.01) add('shiftSum', 'warning', { r, msg: t('m.shift', fmtI(r.sDay || 0), fmtI(r.sNight || 0), fmtI((r.sDay || 0) + (r.sNight || 0)), fmtI(r.s), t('m.samples')) });
      if (r.drillRec && r.hole && r.mTot == null && r.depth != null && r.depth > 0) add('nullM', 'warning', { r, msg: fmtDate(r.date) });
      if (r.drillRec && (r.holes.length !== 1)) add('holeId', 'warning', { r, msg: t('m.holeId', r.raw === 'other' || !r.raw ? 'other → ' + (r.other || '—') : r.raw) });
      else if (r.transport && (r.holes.length !== 1) && !r.soilFix) add('holeId', 'warning', { r, msg: t('m.holeId', r.raw === 'other' || !r.raw ? 'other → ' + (r.other || '—') : r.raw) });
      if (r.soilFix) add('soil', 'warning', { r, msg: t('m.soilFix', fmtI(r.soil), r.other) });
      else if (r.soilNote) add('soil', 'warning', { r, msg: t('m.soilNote') });
      if (ATT_READY && !ATT_ERR && r.drillRec && r.hole && (r.mTot || 0) > 0 && !photosOf(r).length) add('noPhoto', 'info', { r, msg: t('m.noPhoto', fmt(r.mTot)) });
      if (r.created) { const lag = diffDays(r.date, ubDate(r.created)); if (lag > CONFIG.lateDays) add('late', 'info', { r, msg: t('m.late', lag, fmtDate(ubDate(r.created))) }); }
    });
    // Цооног тус бүрийн дараалал
    const holesSet = new Set(); rs.forEach((r) => r.holes.forEach((h) => { if (!F.exHoles.has(h) && !F.exTypes.has(typeOf(h))) holesSet.add(h); }));
    holesSet.forEach((h) => {
      const seq = (BY_HOLE.get(h) || []).filter((r) => r.drillRec && r.holes.length === 1);
      for (let i = 1; i < seq.length; i++) {
        const p = seq[i - 1], c = seq[i];
        if (!inR(c.date)) continue;
        if (p.depth != null && c.depth != null) {
          if (c.depth < p.depth - 0.05) add('depthDrop', 'critical', { r: c, msg: t('m.depthDrop', fmt(p.depth), fmt(c.depth)) });
          else { const exp = p.depth + (c.mTot || 0); if (Math.abs(exp - c.depth) > 0.15) add('depthSeq', 'serious', { r: c, msg: t('m.seq', fmt(exp), fmt(c.depth), fmt(p.depth), fmt(c.mTot || 0)) }); }
        }
        if (p.tsamp != null && c.tsamp != null) { const exp = p.tsamp + (c.sTot || 0); if (Math.abs(exp - c.tsamp) > 0.01) add('sampleSeq', 'serious', { r: c, msg: t('m.seq', fmtI(exp), fmtI(c.tsamp), fmtI(p.tsamp), fmtI(c.sTot || 0)) }); }
      }
      // Давхар өдөр
      const byD = new Map(); seq.forEach((r) => { if (!byD.has(r.date)) byD.set(r.date, []); byD.get(r.date).push(r); });
      byD.forEach((list, d) => { if (list.length > 1 && inR(d)) list.forEach((r) => add('dup', 'serious', { r, msg: t('m.dup', list.length) })); });
      // Мэдээ ороогүй өдөр
      const drilled = seq.filter((r) => (r.mTot || 0) > 0);
      if (drilled.length) {
        const a = drilled[0].date, b = seq[seq.length - 1].date, miss = [];
        dateRange(a > F.from ? a : F.from, b < F.to ? b : F.to).forEach((d) => { if (!byD.has(d)) miss.push(d); });
        if (miss.length) {
          const groups = []; miss.forEach((d) => { const g = groups[groups.length - 1]; if (g && addDays(g[1], 1) === d) g[1] = d; else groups.push([d, d]); });
          add('missing', 'warning', { r: { hole: h, date: miss[0], oid: null }, msg: t('m.missing', miss.length, groups.map((g) => g[0] === g[1] ? fmtDate(g[0], 'short') : fmtDate(g[0], 'short') + '–' + fmtDate(g[1], 'short')).join(', ')) });
        }
      }
      // Илгээсэн > авсан
      const info = holeInfo(h, repDay());
      if (info && info.sent > info.tsamp && info.tsamp > 0) { const last = info.ships[info.ships.length - 1]; add('sentOver', 'warning', { r: last, msg: t('m.sentOver', fmtI(info.sent), fmtI(info.tsamp)) }); }
      // Rock Sampling
      if (ROCK && info && info.tsamp > 0 && ROCK[h] != null && ROCK[h] !== info.tsamp) add('rockLog', 'warning', { r: { hole: h, date: info.last, oid: null }, msg: t('m.rock', fmtI(info.tsamp), fmtI(ROCK[h])) });
    });
    return SEV_ORDER.flatMap((s) => Object.values(out).filter((c) => c.sev === s)).map((c) => { c.rows.sort((a, b) => b.r.date.localeCompare(a.r.date)); return c; });
  }
  function editUrl(oid) { return `https://survey123.arcgis.com/share/${CONFIG.surveyItemId}?mode=edit&objectId=${oid}`; }
  function renderDQ() {
    const checks = runChecks();
    const counts = { critical: 0, serious: 0, warning: 0, info: 0 }; let total = 0;
    checks.forEach((c) => { counts[c.sev] += c.rows.length; total += c.rows.length; });
    const box = $('dqKpis'); box.innerHTML = '';
    const tot = el('div', { class: 'card kpi' }, box); el('div', { class: 'lbl' }, tot, t('dq.total')); el('div', { class: 'val' }, tot, fmtI(total));
    SEV_ORDER.forEach((s) => { const c = el('div', { class: 'card kpi' }, box); sevLabel(el('div', { class: 'lbl', style: 'text-transform:none;letter-spacing:0;font-size:13px' }, c), s); el('div', { class: 'val' }, c, fmtI(counts[s])); });
    const list = $('dqList'); list.innerHTML = '';
    if (!total) { const ok = el('div', { class: 'ok' }, list); ok.textContent = '✓ ' + t('dq.ok'); }
    checks.forEach((c) => {
      const d = el('details', { class: 'dq' }, list);
      if (c.sev === 'critical' || c.sev === 'serious') d.open = true;
      const sm = el('summary', null, d); sevIcon(sm, c.sev); el('span', null, sm, t('dq.' + c.key)); el('span', { class: 'cnt' }, sm, fmtI(c.rows.length));
      el('div', { class: 'why' }, d, t('dq.' + c.key + '.why'));
      const wrap = el('div', { class: 'tblwrap' }, d);
      const tb = el('table', { class: 'tbl' }, wrap);
      const hr = el('tr', null, el('thead', null, tb));
      [t('col.date'), t('col.hole'), t('col.issue'), ''].forEach((s) => el('th', null, hr, s));
      const body = el('tbody', null, tb);
      c.rows.forEach(({ r, msg }) => {
        const tr = el('tr', null, body);
        el('td', { style: 'white-space:nowrap' }, tr, fmtDate(r.date));
        el('td', { class: 'hole' }, tr, r.hole || r.raw || r.other || '–');
        el('td', null, tr, msg);
        const td = el('td', { style: 'white-space:nowrap;text-align:right' }, tr);
        if (r.oid != null) el('a', { href: editUrl(r.oid), target: '_blank', rel: 'noopener' }, td, t('edit'));
      });
    });
    if (ROCK_ERR) el('p', { class: 'note', style: 'color:var(--ink-3);font-size:12px;margin:10px 2px 0' }, list, t('rockNA'));
  }

  /* ---------------------------------------------------------------
     5. ӨДӨР ТУТМЫН МЭДЭЭ (цооног × өдрийн бичлэгүүд)
     --------------------------------------------------------------- */
  const REC = { key: 'date', dir: -1, q: '', ships: true };
  const REC_COLS = [
    { k: 'date', l: 'col.date' }, { k: 'hole', l: 'col.hole' }, { k: 'depth', l: 'r.depth', num: true },
    { k: 'm', l: 'r.m', num: true }, { k: 's', l: 'r.s', num: true }, { k: 'sent', l: 'r.sent', num: true },
    { k: 'tsamp', l: 'r.tsamp', num: true }, { k: null, l: 'col.note' }, { k: null, l: 'col.photo' }, { k: null, l: '' }
  ];
  const REC_VAL = {
    date: (r) => r.date + String(r.oid).padStart(9, '0'), hole: (r) => r.hole || r.other || '',
    depth: (r) => (r.depth == null ? -1 : r.depth), m: (r) => (r.drillRec && r.mTot != null ? mVal(r) : -1),
    s: (r) => (r.drillRec && r.sTot != null ? sVal(r) : -1), sent: (r) => (r.transport ? (r.rock || 0) + (r.soil || 0) : -1),
    tsamp: (r) => (r.tsamp == null ? -1 : r.tsamp)
  };
  function recIssues() {
    const map = new Map();
    runChecks().forEach((c) => c.rows.forEach(({ r, msg }) => {
      if (!r || r.oid == null) return;
      const a = map.get(r.oid) || []; a.push({ sev: c.sev, text: t('dq.' + c.key) + ': ' + msg }); map.set(r.oid, a);
    }));
    return map;
  }
  function recRows() {
    let rs = recsInRange();
    if (!REC.ships) rs = rs.filter((r) => r.drillRec);
    const q = REC.q.trim().toLowerCase();
    if (q) rs = rs.filter((r) => (r.holes.join(' ') + ' ' + r.other + ' ' + r.raw + ' ' + r.note).toLowerCase().includes(q));
    const f = REC_VAL[REC.key] || REC_VAL.date;
    return rs.slice().sort((a, b) => { const x = f(a), y = f(b); return (x < y ? -1 : x > y ? 1 : 0) * REC.dir || (b.date.localeCompare(a.date)); });
  }
  function splitTxt(p, unit) {
    const parts = [];
    if (F.day) parts.push(t('r.dayAb') + ' ' + fmt(p.day));
    if (F.night) parts.push(t('r.nightAb') + ' ' + fmt(p.night));
    return parts.join(' · ');
  }
  function renderRecs() {
    const host = $('recTbl'); host.innerHTML = '';
    const rows = recRows(), issues = recIssues();
    const drill = rows.filter((r) => r.drillRec);
    const sumM = drill.reduce((a, r) => a + mVal(r), 0), sumS = drill.reduce((a, r) => a + sVal(r), 0);
    const sumSent = rows.reduce((a, r) => a + (r.transport ? (r.rock || 0) + (r.soil || 0) : 0), 0);
    $('recSub').textContent = t('r.sub', fmtI(rows.length));
    if (!rows.length) { el('div', { class: 'empty' }, host, t('noData')); return; }
    const tb = el('table', { class: 'tbl wrap rtbl' }, host);
    const hr = el('tr', null, el('thead', null, tb));
    REC_COLS.forEach((c) => {
      const th = el('th', { class: c.num ? 'num' : null }, hr);
      if (!c.k) { th.textContent = c.l ? t(c.l) : ''; return; }
      const on = REC.key === c.k;
      th.setAttribute('aria-sort', on ? (REC.dir > 0 ? 'ascending' : 'descending') : 'none');
      const b = el('button', { type: 'button', class: 'sortb' }, th, t(c.l) + (on ? (REC.dir > 0 ? ' ▲' : ' ▼') : ''));
      b.addEventListener('click', () => { if (REC.key === c.k) REC.dir = -REC.dir; else { REC.key = c.k; REC.dir = c.k === 'hole' ? 1 : -1; } renderRecs(); });
    });
    const body = el('tbody', null, tb);
    // Нийт мөр
    const tot = el('tr', { class: 'totrow' }, body);
    el('td', { colspan: 2 }, tot, t('r.total', fmtI(rows.length)));
    el('td', { class: 'num' }, tot, '');
    el('td', { class: 'num' }, tot, fmt(sumM));
    el('td', { class: 'num' }, tot, fmtI(sumS));
    el('td', { class: 'num' }, tot, sumSent ? fmtI(sumSent) : '–');
    el('td', { colspan: 4 }, tot, '');
    rows.forEach((r) => {
      const tr = el('tr', { class: r.transport ? 'ship' : null }, body);
      const dtd = el('td', { style: 'white-space:nowrap' }, tr, fmtDateAuto(r.date));
      el('span', { class: 'sub' }, dtd, t('wd')[weekday(r.date)]);
      const htd = el('td', { class: 'hole' }, tr, r.holes.join(', ') || r.other || '–');
      if (r.transport) el('span', { class: 'badge' }, htd, t('r.ship') + (r.soil ? ' · ' + t('col.soilTag') : ''));
      el('td', { class: 'num' }, tr, r.depth == null ? '–' : fmt(r.depth));
      const numCell = (v, parts, split, isPcs) => {
        const td = el('td', { class: 'num' }, tr);
        if (!r.drillRec) { td.textContent = ''; return; }
        if (v == null) { td.textContent = '–'; td.classList.add('miss'); return; }
        td.textContent = isPcs ? fmtI(v) : fmt(v);
        if (split) el('span', { class: 'sub', title: t('shift.day') + ' / ' + t('shift.night') }, td, splitTxt(parts));
      };
      numCell(r.mTot == null ? null : mVal(r), mParts(r), r.hasSplit, false);
      numCell(r.sTot == null ? null : sVal(r), sParts(r), r.sSplit, true);
      el('td', { class: 'num', style: r.transport ? 'font-weight:700' : 'color:var(--ink-3)' }, tr, r.transport ? fmtI((r.rock || 0) + (r.soil || 0)) : '');
      el('td', { class: 'num' }, tr, r.tsamp == null ? '–' : fmtI(r.tsamp));
      const ntd = el('td', { class: 'notecell' }, tr);
      if (r.note) { const d = el('div', { class: 'clamp', tabindex: 0 }, ntd, r.note); d.addEventListener('click', () => d.classList.toggle('open')); d.addEventListener('keydown', (e) => { if (e.key === 'Enter') d.classList.toggle('open'); }); }
      const ptd = el('td', null, tr);
      const items = photoItems([r]);
      if (items.length) {
        const b = el('button', { type: 'button', class: 'thumb', 'aria-label': t('col.photo') + ': ' + photoCaption(items[0]), title: photoCaption(items[0]) }, ptd);
        lazyImg(b, items[0].p, true);
        if (items.length > 1) el('span', { class: 'n' }, b, String(items.length));
        b.addEventListener('click', () => openPhotos(items, 0));
      }
      const atd = el('td', { style: 'white-space:nowrap;text-align:right' }, tr);
      const iss = issues.get(r.oid);
      if (iss) {
        const worst = SEV_ORDER.find((s) => iss.some((x) => x.sev === s));
        const sp = el('span', { class: 'issue', tabindex: 0, role: 'img', 'aria-label': t('r.issues') + ': ' + iss.map((x) => x.text).join('; '), title: iss.map((x) => x.text).join('\n') }, atd);
        sevIcon(sp, worst);
        bindTip(sp, (T) => { tipHead(T, t('r.issues')); iss.forEach((x) => { const row = el('div', { class: 'tr' }, T); sevIcon(row, x.sev); el('span', null, row, x.text); }); });
      }
      el('a', { href: editUrl(r.oid), target: '_blank', rel: 'noopener', class: 'editl' }, atd, t('edit'));
    });
  }
  function recReportTable() {
    const rows = recsInRange().slice().sort((a, b) => b.date.localeCompare(a.date) || (a.hole || '').localeCompare(b.hole || ''))
      .map((r) => [r.date, (r.holes.join(', ') || r.other || '–') + (r.transport ? ' (' + t('r.ship') + ')' : ''), r.depth,
        r.drillRec && r.mTot != null ? mVal(r) : null, r.drillRec && r.sTot != null ? sVal(r) : null,
        r.transport ? (r.rock || 0) + (r.soil || 0) : null, r.tsamp, r.note]);
    return { cols: normW([{ t: t('col.date'), type: 'date', w: 0.08 }, { t: t('col.hole'), w: 0.13 }, { t: t('r.depth'), type: 'num', w: 0.07 }, { t: t('r.m'), type: 'num', w: 0.08 },
      { t: t('r.s'), type: 'int', w: 0.08 }, { t: t('r.sent'), type: 'int', w: 0.07 }, { t: t('r.tsamp'), type: 'int', w: 0.07 }, { t: t('col.note'), w: 0.42 }]), rows };
  }

  /* ---------------------------------------------------------------
     ТАЙЛАН ТАТАХ — PDF, Word, Excel, CSV
     Сангууд /ett/shared/lib-ээс (байхгүй бол CDN), PDF-ийн монгол фонт lib/Inter-*.ttf
     --------------------------------------------------------------- */
  const LIBS = {
    jspdf: { ok: () => window.jspdf && window.jspdf.jsPDF, urls: ['../shared/lib/jspdf.umd.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'] },
    autotable: { ok: () => window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable, urls: ['lib/jspdf.plugin.autotable.min.js', 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js'] },
    docx: { ok: () => window.docx && window.docx.Document, urls: ['../shared/lib/docx.iife.js', 'https://cdn.jsdelivr.net/npm/docx@9.16.0/dist/index.iife.js'] },
    exceljs: { ok: () => window.ExcelJS, urls: ['../shared/lib/exceljs.min.js', 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js'] }
  };
  const libCache = {};
  function loadLib(name) {
    const L = LIBS[name];
    if (L.ok()) return Promise.resolve();
    if (libCache[name]) return libCache[name];
    const tryUrl = (src) => new Promise((res, rej) => {
      const d = window.define; window.define = undefined;          // ArcGIS-ийн AMD loader-ийг түр нууна
      const sc = document.createElement('script'); sc.src = src; sc.async = true;
      sc.onload = () => { window.define = d; L.ok() ? res() : rej(new Error(name)); };
      sc.onerror = () => { window.define = d; sc.remove(); rej(new Error(name)); };
      document.head.appendChild(sc);
    });
    libCache[name] = L.urls.reduce((p, u) => p.catch(() => tryUrl(u)), Promise.reject(new Error('start')))
      .catch((e) => { delete libCache[name]; throw new Error(name + ' сан ачаалагдсангүй'); });
    return libCache[name];
  }
  function saveBlob(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  }
  function toB64(buf) {
    const u = new Uint8Array(buf); let s = '';
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function dataUrlBytes(dataUrl) {
    const b = atob(dataUrl.split(',')[1]); const u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  }
  function loadImage(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('image')); im.src = src; }); }

  // SVG графикийг PNG болгох
  async function svgPng(svg, scale) {
    const W = +svg.getAttribute('width'), H = +svg.getAttribute('height');
    const c = svg.cloneNode(true);
    c.setAttribute('xmlns', NS);
    c.setAttribute('font-family', "Inter, 'Segoe UI', Arial, sans-serif");
    c.querySelectorAll('[visibility="hidden"]').forEach((n) => n.remove());
    const str = new XMLSerializer().serializeToString(c);
    const img = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str));
    const cv = document.createElement('canvas'); cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
    const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    const dataUrl = cv.toDataURL('image/png');
    return { dataUrl, data: dataUrlBytes(dataUrl), w: W, h: H, type: 'png' };
  }
  let LOGO = null;
  async function loadLogo() {
    if (LOGO !== null) return LOGO;
    try {
      const blob = await (await fetch('../../images/logo-horizontal.png')).blob();
      const dataUrl = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
      const im = await loadImage(dataUrl);
      LOGO = { dataUrl, data: dataUrlBytes(dataUrl), w: im.naturalWidth, h: im.naturalHeight, type: 'png' };
    } catch (e) { LOGO = undefined; }
    return LOGO;
  }
  let FONTS = null;
  async function pdfFonts(doc) {
    if (!FONTS) {
      FONTS = Promise.all(['lib/Inter-Regular.ttf', 'lib/Inter-SemiBold.ttf'].map((u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.arrayBuffer(); }).then(toB64)));
      FONTS.catch(() => { FONTS = null; });
    }
    const [reg, bold] = await FONTS;
    doc.addFileToVFS('Inter-Regular.ttf', reg); doc.addFont('Inter-Regular.ttf', 'Inter', 'normal');
    doc.addFileToVFS('Inter-SemiBold.ttf', bold); doc.addFont('Inter-SemiBold.ttf', 'Inter', 'bold');
    doc.setFont('Inter', 'normal');
  }

  /* ---------- Тайлангийн агуулга (бүх форматад нэг загвар) ---------- */
  const isNum = (c) => c.type === 'num' || c.type === 'int' || c.type === 'pct';
  function cellText(v, c) {
    if (v == null || v === '') return isNum(c) || c.type === 'date' ? '–' : '';
    if (typeof v === 'string' && c.type !== 'date') return v;
    if (c.type === 'date') return /^\d{4}-\d{2}-\d{2}$/.test(v) ? fmtDate(v) : String(v);
    if (c.type === 'num') return fmt(v, c.d == null ? 1 : c.d);
    if (c.type === 'int') return fmtI(v);
    if (c.type === 'pct') return Math.round(v * 100) + '%';
    return String(v);
  }
  function normW(cols) { const s = cols.reduce((a, c) => a + (c.w || 1), 0); cols.forEach((c) => { c.w = (c.w || 1) / s; }); return cols; }
  const dlt = (v, d) => (v > 0.0001 ? '▲ ' : v < -0.0001 ? '▼ ' : '● ') + fmt(Math.abs(v), d == null ? 1 : d);

  function kpiModel() {
    const D = repDay();
    const one = (label, fn, unit, periodFmt) => {
      const v = fn(D), p = fn(addDays(D, -1)), a = avgBefore(fn, D, 7);
      return { label, value: fmt(v), unit, lines: [dlt(v - p) + ' ' + t('k.vsPrev'), dlt(v - a) + ' ' + t('k.vsAvg')].concat(periodFmt ? [t('k.period', periodFmt(rangeSum(fn)))] : []),
        raw: { v, dPrev: v - p, dAvg: v - a, period: periodFmt ? rangeSum(fn) : null } };
    };
    const k = [one(t('k.metres'), dayM, t('u.m'), mtr), one(t('k.samples'), dayS, t('u.pcs'), pcs), one(t('k.active'), dayActive, '', null)];
    const hs = holesInRange(), by = {}; hs.forEach((h) => { by[h.status] = (by[h.status] || 0) + 1; });
    k[2].lines.push(['drill', 'done', 'lab'].filter((s) => by[s]).map((s) => t('status.' + s) + ' ' + by[s]).join(' · '));
    const ships = recsInRange().filter((r) => r.transport);
    const rock = ships.reduce((a, r) => a + (r.rock || 0), 0), soil = ships.reduce((a, r) => a + (r.soil || 0), 0);
    const last = ships.filter((r) => r.date <= D).slice(-1)[0];
    k.push({ label: t('k.sent'), value: fmtI(rock + soil), unit: t('u.pcs'),
      lines: [t('k.sentSplit', fmtI(rock), fmtI(soil)), last ? t('k.lastSent', fmtDate(last.date, 'short'), fmtI((last.rock || 0) + (last.soil || 0))) : t('k.noneSent'), t('k.rangeLbl', fmtDate(F.from, 'short') + ' – ' + fmtDate(F.to, 'short'))],
      raw: { v: daySent(D), dPrev: null, dAvg: null, period: rock + soil } });
    return k;
  }
  function notesTable() {
    const D = repDay();
    const rows = holesInRange().map((h) => { const r = [...h.recs].reverse().find((x) => x.note && x.date >= F.from && x.date <= D); return r ? [h.hole, t('status.' + h.status), r.date, r.note] : null; })
      .filter(Boolean).sort((a, b) => b[2].localeCompare(a[2]) || a[0].localeCompare(b[0]));
    return { cols: normW([{ t: t('col.hole'), w: 0.12 }, { t: t('col.status'), w: 0.14 }, { t: t('col.date'), type: 'date', w: 0.09 }, { t: t('col.note'), w: 0.65 }]), rows };
  }
  function backlogTable() {
    const rows = holesInRange().filter((h) => h.tsamp > 0).map((h) => [h.hole, h.tsamp, h.sent, Math.max(0, h.tsamp - h.sent), h.tsamp ? Math.min(1, h.sent / h.tsamp) : null])
      .sort((a, b) => b[3] - a[3] || a[0].localeCompare(b[0]));
    return { title: t('c.backlog'), width: 0.55, cols: normW([{ t: t('col.hole'), w: 0.3 }, { t: t('col.taken'), type: 'int', w: 0.17 }, { t: t('col.sent'), type: 'int', w: 0.17 }, { t: t('col.left'), type: 'int', w: 0.18 }, { t: '%', type: 'pct', w: 0.18 }]), rows };
  }
  function shipmentsTable() {
    const rows = recsInRange().filter((r) => r.transport).map((r) => [r.date, r.holes.join(', ') || r.other || '–', r.rock || 0, r.soil || 0, r.note]);
    return { title: t('exp.shipments'), cols: normW([{ t: t('col.date'), type: 'date', w: 0.1 }, { t: t('col.hole'), w: 0.17 }, { t: t('rock'), type: 'int', w: 0.08 }, { t: t('soil'), type: 'int', w: 0.08 }, { t: t('col.note'), w: 0.57 }]), rows };
  }
  function holesTable() {
    const rows = holesInRange().map((h) => [h.hole, t('status.' + h.status), h.firstDrill || h.first, h.last,
      h.firstDrill ? diffDays(h.firstDrill, h.lastDrill || h.firstDrill) + 1 : null, h.depth, h.plan || null, h.plan ? h.pct : null,
      h.activeDays ? h.depth / h.activeDays : null, h.tsamp, h.depth > 0 ? h.tsamp / h.depth * 10 : null, h.sent || null,
      h.status === 'drill' ? (h.plan ? etaShort(h.eta) : t('noPlan')) : '–']);
    return { cols: normW([{ t: t('col.hole'), w: 0.1 }, { t: t('col.status'), w: 0.12 }, { t: t('col.start'), type: 'date', w: 0.08 }, { t: t('col.last'), type: 'date', w: 0.08 },
      { t: t('col.days'), type: 'int', w: 0.05 }, { t: t('col.depth'), type: 'num', w: 0.06 }, { t: t('col.plan'), type: 'num', d: 0, w: 0.07 }, { t: t('col.pct'), type: 'pct', w: 0.07 },
      { t: t('col.rate'), type: 'num', w: 0.06 }, { t: t('col.samples'), type: 'int', w: 0.06 }, { t: t('col.per10'), type: 'num', w: 0.07 }, { t: t('col.sent'), type: 'int', w: 0.06 }, { t: t('col.eta'), w: 0.12 }]), rows };
  }
  function dailyTable() {
    const days = dateRange(F.from, F.to).slice().reverse();
    const parts = (d) => { const p = { day: 0, night: 0, unk: 0 }; dayRecs(d).forEach((r) => { const q = mParts(r); p.day += q.day; p.night += q.night; p.unk += q.unk; }); return p; };
    const anyUnk = days.some((d) => parts(d).unk > 0);
    const T = { day: 0, night: 0, unk: 0, s: 0, sent: 0 };
    const rows = days.map((d) => {
      const p = parts(d), s = dayS(d), sent = daySent(d);
      T.day += p.day; T.night += p.night; T.unk += p.unk; T.s += s; T.sent += sent;
      const r = [d, t('wd')[weekday(d)]];
      if (F.day) r.push(p.day); if (F.night) r.push(p.night); if (anyUnk) r.push(p.unk);
      r.push(p.day + p.night + p.unk, s, dayActive(d), sent);
      return r;
    });
    const cols = [{ t: t('col.date'), type: 'date', w: 0.12 }, { t: t('exp.wd'), w: 0.1 }];
    if (F.day) cols.push({ t: t('col.dayM'), type: 'num', w: 0.1 });
    if (F.night) cols.push({ t: t('col.nightM'), type: 'num', w: 0.1 });
    if (anyUnk) cols.push({ t: t('col.unkM'), type: 'num', w: 0.1 });
    cols.push({ t: t('col.totM'), type: 'num', w: 0.1 }, { t: t('col.samples'), type: 'int', w: 0.1 }, { t: t('col.active'), type: 'int', w: 0.12 }, { t: t('col.sent'), type: 'int', w: 0.1 });
    const tot = [t('total'), ''];
    if (F.day) tot.push(T.day); if (F.night) tot.push(T.night); if (anyUnk) tot.push(T.unk);
    tot.push(T.day + T.night + T.unk, T.s, null, T.sent);
    rows.unshift(tot);
    return { cols: normW(cols), rows, boldRows: [0] };
  }
  function prodModel() {
    const rs = recsInRange(), drill = rs.filter((r) => r.drillRec);
    const tot = drill.reduce((a, r) => a + mVal(r), 0), samples = drill.reduce((a, r) => a + sVal(r), 0);
    const hd = new Map(); drill.forEach((r) => { if (r.hole) { const k = r.hole + '|' + r.date; hd.set(k, (hd.get(k) || 0) + mVal(r)); } });
    const active = [...hd.values()].filter((v) => v > 0).length, idle = [...hd.values()].filter((v) => v === 0).length;
    let best = null; dateRange(F.from, F.to).forEach((d) => { const v = dayM(d); if (!best || v > best.v) best = { d, v }; });
    const stats = { width: 0.55, cols: normW([{ t: t('exp.kpi'), w: 0.55 }, { t: t('exp.value'), w: 0.45 }]), rows: [
      [t('p.total'), mtr(tot)], [t('p.holeDays'), fmtI(active) + ' (' + t('p.idle', fmtI(idle)) + ')'],
      [t('p.avg'), active ? mtr(tot / active) : '–'], [t('p.per10'), tot > 0 ? fmt(samples / tot * 10) : '–'],
      [t('p.best'), best && best.v > 0 ? mtr(best.v) + ' · ' + fmtDateWd(best.d) : '–']] };
    const P = { day: 0, night: 0 }, PS = { day: 0, night: 0 }, N = { day: 0, night: 0 };
    drill.forEach((r) => { const q = mParts(r), s = sParts(r); P.day += q.day; P.night += q.night; PS.day += s.day; PS.night += s.night; if (r.hasSplit) { if ((r.mDay || 0) > 0) N.day++; if ((r.mNight || 0) > 0) N.night++; } });
    const shiftRows = ['day', 'night'].filter((k) => (k === 'day' ? F.day : F.night)).map((k) => [t('shift.' + k), P[k], N[k], N[k] ? P[k] / N[k] : null, PS[k], P[k] > 0 ? PS[k] / P[k] * 10 : null]);
    const shift = { title: t('p.shiftShare'), width: 0.75, cols: normW([{ t: t('col.shift'), w: 0.24 }, { t: t('col.m'), type: 'num', w: 0.15 }, { t: t('col.shifts'), type: 'int', w: 0.15 }, { t: t('col.avgShift'), type: 'num', w: 0.16 }, { t: t('col.samples'), type: 'int', w: 0.14 }, { t: t('col.per10'), type: 'num', w: 0.16 }]), rows: shiftRows };
    const down = rs.filter((r) => r.note && DOWN_RE.test(r.note)).sort((a, b) => b.date.localeCompare(a.date)).map((r) => [r.date, r.hole || r.other || '–', r.mTot, r.note]);
    const downT = { title: t('p.down'), cols: normW([{ t: t('col.date'), type: 'date', w: 0.1 }, { t: t('col.hole'), w: 0.13 }, { t: t('col.m'), type: 'num', w: 0.09 }, { t: t('col.note'), w: 0.68 }]), rows: down };
    return { stats, shift, down: downT };
  }
  function dqTable() {
    const rows = [];
    runChecks().forEach((c) => c.rows.forEach(({ r, msg }) => rows.push([t('sev.' + c.sev), t('dq.' + c.key), r.date, r.hole || r.raw || r.other || '–', msg])));
    return { cols: normW([{ t: t('col.sev'), w: 0.1 }, { t: t('col.check'), w: 0.24 }, { t: t('col.date'), type: 'date', w: 0.09 }, { t: t('col.hole'), w: 0.13 }, { t: t('col.issue'), w: 0.44 }]), rows };
  }
  function recordsTable() {
    const c = t('csv.cols');
    const cols = [{ t: c[0], type: 'date', w: 1 }, { t: c[1], w: 1.4 }, { t: c[2], type: 'num', w: 1 }, { t: c[3], type: 'num', w: 1 }, { t: c[4], type: 'num', w: 1 }, { t: c[5], type: 'int', w: 1 },
      { t: c[6], type: 'int', w: 1 }, { t: c[7], type: 'int', w: 1 }, { t: c[8], type: 'num', w: 1 }, { t: c[9], type: 'int', w: 1 }, { t: c[10], type: 'int', w: 1 }, { t: c[11], type: 'int', w: 1 },
      { t: c[12], w: 0.8 }, { t: c[13], w: 4 }, { t: t('csv.photos'), type: 'int', w: 0.6 }, { t: c[14], type: 'int', w: 0.7 }];
    const rows = recsInRange().map((r) => [r.date, r.holes.join(', ') || r.other, r.mTot, r.mDay, r.mNight, r.sTot, r.sDay, r.sNight, r.depth, r.tsamp, r.rock, r.soil, r.transport ? t('yes') : '', r.note, photosOf(r).length, r.oid]);
    return { cols: normW(cols), rows };
  }
  function sentSeries() {
    const weeks = weeksOfRange(), ships = recsInRange().filter((r) => r.transport);
    const inW = (w) => ships.filter((r) => r.date >= w && r.date < addDays(w, 7));
    const rock = weeks.map((w) => inW(w).reduce((a, r) => a + (r.rock || 0), 0)), soil = weeks.map((w) => inW(w).reduce((a, r) => a + (r.soil || 0), 0));
    const series = [{ key: 'rock', color: COLORS.rock, values: rock }], legendItems = [{ color: COLORS.rock, label: t('rock') }];
    if (soil.some((v) => v > 0)) { series.push({ key: 'soil', color: COLORS.soil, values: soil }); legendItems.push({ color: COLORS.soil, label: t('soil') }); }
    return { weeks, series, legend: legendItems };
  }
  function weeklySeries() {
    const weeks = weeksOfRange();
    return { weeks, values: weeks.map((w) => dateRange(w < F.from ? F.from : w, addDays(w, 6) > F.to ? F.to : addDays(w, 6)).reduce((a, d) => a + dayM(d), 0)) };
  }
  async function exportPhotos() {
    const D = repDay();
    let day = D, items = photoItems(dayRecs(D));
    if (!items.length) { const prev = FREC.filter((r) => r.date <= D && r.date >= F.from && photosOf(r).length); if (prev.length) { day = prev[prev.length - 1].date; items = photoItems(dayRecs(day)); } }
    const out = [];
    for (const it of items.slice(0, 12)) {
      try {
        const im = await loadImage(await blobUrl(it.p.url));
        const sc = Math.min(1, 1400 / Math.max(im.naturalWidth, im.naturalHeight));
        const cv = document.createElement('canvas'); cv.width = Math.round(im.naturalWidth * sc); cv.height = Math.round(im.naturalHeight * sc);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        const dataUrl = cv.toDataURL('image/jpeg', 0.82);
        out.push({ dataUrl, data: dataUrlBytes(dataUrl), w: cv.width, h: cv.height, type: 'jpg', caption: photoCaption(it), note: it.r.note || '' });
      } catch (e) { /* уншигдаагүй зургийг алгасна */ }
    }
    return { day, items: out };
  }
  async function buildModel(sel, lang) {
    const prevLang = LANG; LANG = lang;
    const host = el('div', { 'aria-hidden': 'true', style: 'position:fixed;left:-30000px;top:0;width:1000px;background:#fff' }, document.body);
    try {
      const D = repDay(), holes = holesInRange();
      const filtered = F.exHoles.size || F.exTypes.size;
      const nowUB = new Date(Date.now() + CONFIG.tzOffsetH * 3600e3).toISOString().slice(0, 16).replace('T', ' ');
      const M = {
        lang, title: t('title'), asof: t('asof', fmtDate(DATA_MAX)), logo: await loadLogo(),
        info: [[t('f.range'), fmtDate(F.from) + ' – ' + fmtDate(F.to) + ' (' + dateRange(F.from, F.to).length + ' ' + t('u.days') + ')'], [t('f.repday'), fmtDateWd(D)],
          [t('f.holes'), filtered ? holes.map((h) => h.hole).join(', ') : t('exp.holesAll', holes.length)],
          [t('f.shift'), F.day && F.night ? t('exp.shiftBoth') : F.day ? t('shift.day') : t('shift.night')],
          [t('exp.generated'), (USER ? USER + ' · ' : '') + nowUB]],
        kpis: kpiModel(), sections: [], footer: 'RegaPro · ' + t('title'), file: 'ETT-Geotech_daily-report_' + D
      };
      const png = async (svg) => (svg ? svgPng(svg, 2) : null);
      if (sel.summary) {
        host.style.width = '1000px'; const a = await png(renderShiftChart(host, true));
        host.style.width = '640px'; const b = await png(renderProgress(host, holes, { exp: true }));
        M.sections.push({ key: 'summary', title: t('exp.s.summary'), blocks: [{ type: 'kpis' }, { type: 'charts2', items: [
          { title: t('c.shift') + ' ' + t('c.days', dateRange(F.from, F.to).length), img: a, w: 0.6 }, { title: t('c.progress') + ' ' + t('c.progressSub'), img: b, w: 0.4 }].filter((x) => x.img) }] });
      }
      if (sel.records) M.sections.push({ key: 'records', title: t('exp.s.records'), blocks: [Object.assign({ type: 'table' }, recReportTable())] });
      if (sel.notes) M.sections.push({ key: 'notes', title: t('exp.s.notes'), blocks: [Object.assign({ type: 'table' }, notesTable())] });
      if (sel.samples) {
        const ss = sentSeries(); host.style.width = '760px';
        const img = await png(columnChart(host, ss.weeks, ss.series, { height: 250, legend: ss.legend, label: t('c.sent'), catLabel: (w) => fmtDate(w < F.from ? F.from : w, 'short') }));
        const blocks = []; if (img) blocks.push({ type: 'chart', title: t('c.sent') + ' ' + t('c.byWeek'), img, w: 0.5 });
        blocks.push(Object.assign({ type: 'table' }, backlogTable()), Object.assign({ type: 'table' }, shipmentsTable()));
        M.sections.push({ key: 'samples', title: t('exp.s.samples'), blocks });
      }
      if (sel.holes) M.sections.push({ key: 'holes', title: t('exp.s.holes'), blocks: [Object.assign({ type: 'table' }, holesTable()), { type: 'text', text: t('h.etaNote') }] });
      if (sel.daily) M.sections.push({ key: 'daily', title: t('exp.s.daily'), blocks: [Object.assign({ type: 'table' }, dailyTable())] });
      if (sel.prod) {
        const pm = prodModel(), ws = weeklySeries(); host.style.width = '760px';
        const img = await png(columnChart(host, ws.weeks, [{ key: 'm', color: COLORS.total, values: ws.values }], { height: 250, label: t('p.weekly'), fmt: (v) => fmt(v, 0), catLabel: (w) => fmtDate(w < F.from ? F.from : w, 'short') }));
        host.style.width = '1000px'; const imgS = await png(renderShiftPanels(host, true));
        const blocks = [Object.assign({ type: 'table' }, pm.stats)];
        if (imgS) blocks.push({ type: 'chart', title: t('p.shiftDaily') + ' ' + t('c.days', dateRange(F.from, F.to).length), img: imgS, w: 1 });
        if (img) blocks.push({ type: 'chart', title: t('p.weekly') + ' ' + t('p.weeklySub'), img, w: 0.5 });
        blocks.push(Object.assign({ type: 'table' }, pm.shift), Object.assign({ type: 'table' }, pm.down));
        M.sections.push({ key: 'prod', title: t('exp.s.prod'), blocks });
      }
      if (sel.dq) { const dq = dqTable(); M.sections.push({ key: 'dq', title: t('exp.s.dq'), blocks: dq.rows.length ? [Object.assign({ type: 'table' }, dq)] : [{ type: 'text', text: t('dq.ok') }] }); }
      if (sel.photos) { const ph = await exportPhotos(); M.sections.push({ key: 'photos', title: t('exp.s.photos'), blocks: [{ type: 'photos', day: ph.day, items: ph.items }] }); }
      M.records = recordsTable();
      // Хэлний текстүүдийг энэ хэлээр нь хадгална (бүтээх үед LANG сэргээгдсэн байна)
      M.tx = { page: (i, n) => t('exp.page', i, n), photoDay: (d) => t('exp.photoDay', fmtDateWd(d)), noPhotos: t('exp.noPhotos'), kpi: t('exp.kpi'), value: t('exp.value'), repVal: t('exp.repVal'),
        vsPrev: t('k.vsPrev'), vsAvg: t('k.vsAvg'), periodVal: t('exp.periodVal'), summarySheet: t('exp.summarySheet'), records: t('exp.records'), charts: t('exp.charts') };
      M.sections.forEach((s) => s.blocks.forEach((b) => { if (b.type === 'photos') b.dayTxt = t('exp.photoDay', fmtDateWd(b.day)); }));
      return M;
    } finally { host.remove(); LANG = prevLang; }
  }

  /* ---------- PDF ---------- */
  async function buildPdf(M) {
    await loadLib('jspdf'); await loadLib('autotable');
    const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    await pdfFonts(doc);
    const PW = 297, PH = 210, MG = 12, CW = PW - 2 * MG, BOT = PH - 14;
    const NAVY = [12, 40, 57], INK = [25, 25, 25], GRAY = [91, 102, 112], LINE = [227, 232, 237], GREEN = [46, 139, 51];
    let y = MG;
    const font = (style, size, color) => { doc.setFont('Inter', style); doc.setFontSize(size); doc.setTextColor.apply(doc, color); };
    const ensure = (h) => { if (y + h > BOT) { doc.addPage(); y = MG + 2; } };
    // Толгой
    if (M.logo) doc.addImage(M.logo.dataUrl, 'PNG', MG, y, 40, 40 * M.logo.h / M.logo.w);
    font('normal', 8.5, GRAY); doc.text(M.asof, PW - MG, y + 4, { align: 'right' });
    y += 15; font('bold', 17, NAVY); doc.text(M.title, MG, y);
    y += 5.5; font('normal', 8.8, GRAY);
    const infoLines = doc.splitTextToSize(M.info.map((p) => p[0] + ': ' + p[1]).join('     '), CW);
    doc.text(infoLines, MG, y + 3); y += infoLines.length * 4.1 + 2.5;
    doc.setDrawColor.apply(doc, GREEN); doc.setLineWidth(0.6); doc.line(MG, y, PW - MG, y); y += 6;
    const heading = (txt) => { ensure(22); font('bold', 12.5, NAVY); doc.text(txt, MG, y + 3); doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.3); doc.line(MG, y + 5.2, PW - MG, y + 5.2); y += 10; };
    const subTitle = (txt) => { font('bold', 9.5, INK); doc.text(txt, MG, y + 3); y += 5.5; };
    const table = (tb) => {
      if (tb.title) { ensure(20); subTitle(tb.title); }
      if (!tb.rows.length) { font('normal', 8.5, GRAY); doc.text('–', MG, y + 3); y += 7; return; }
      doc.autoTable({
        startY: y, head: [tb.cols.map((c) => c.t)], body: tb.rows.map((r) => r.map((v, i) => cellText(v, tb.cols[i]))),
        margin: { left: MG, right: MG, top: MG + 2, bottom: 16 }, theme: 'grid',
        styles: { font: 'Inter', fontStyle: 'normal', fontSize: 7.9, cellPadding: 1.4, textColor: INK, lineColor: LINE, lineWidth: 0.15, overflow: 'linebreak', valign: 'top' },
        headStyles: { font: 'Inter', fontStyle: 'bold', fillColor: NAVY, textColor: 255, fontSize: 7.6, valign: 'bottom' },
        alternateRowStyles: { fillColor: [248, 250, 251] },
        tableWidth: CW * (tb.width || 1),
        columnStyles: Object.fromEntries(tb.cols.map((c, i) => [i, { cellWidth: c.w * CW * (tb.width || 1), halign: isNum(c) ? 'right' : 'left' }])),
        didParseCell: (d) => {
          if (d.section === 'head' && isNum(tb.cols[d.column.index])) d.cell.styles.halign = 'right';
          if (d.section === 'body' && tb.boldRows && tb.boldRows.includes(d.row.index)) { d.cell.styles.fontStyle = 'bold'; d.cell.styles.fillColor = [234, 241, 236]; }
        }
      });
      y = doc.lastAutoTable.finalY + 6;
    };
    const kpis = () => {
      const n = M.kpis.length, gap = 4, bw = (CW - gap * (n - 1)) / n, bh = 29;
      ensure(bh + 4);
      M.kpis.forEach((k, i) => {
        const x = MG + i * (bw + gap);
        doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.3); doc.roundedRect(x, y, bw, bh, 2, 2, 'S');
        font('bold', 7.4, GRAY); doc.text(k.label.toUpperCase(), x + 3.5, y + 5.2);
        font('bold', 19, INK); doc.text(k.value, x + 3.5, y + 13.4);
        if (k.unit) { const vw = doc.getTextWidth(k.value); font('bold', 9, GRAY); doc.text(k.unit, x + 4.5 + vw, y + 13.4); }
        font('normal', 7.2, GRAY);
        k.lines.forEach((ln, j) => { if (ln) doc.text(doc.splitTextToSize(ln, bw - 7)[0], x + 3.5, y + 18 + j * 3.4); });
      });
      y += bh + 6;
    };
    const chartsRow = (items) => {
      const gap = 6, tw = items.reduce((a, it) => a + it.w, 0);
      const dims = items.map((it) => { const w = items.length === 1 ? CW * Math.min(1, it.w) : (CW - gap * (items.length - 1)) * it.w / tw; return { w, h: w * it.img.h / it.img.w }; });
      const hmax = Math.max(...dims.map((d) => d.h));
      ensure(hmax + 7);
      let x = MG;
      items.forEach((it, i) => {
        font('bold', 9.5, INK); doc.text(doc.splitTextToSize(it.title, dims[i].w)[0], x, y + 3);
        doc.addImage(it.img.dataUrl, 'PNG', x, y + 5, dims[i].w, dims[i].h, undefined, 'FAST');
        x += dims[i].w + gap;
      });
      y += hmax + 10;
    };
    const photos = (b) => {
      font('normal', 8.5, GRAY); ensure(10); doc.text(b.items.length ? b.dayTxt : M.tx.noPhotos, MG, y + 3); y += 6;
      const cols = 3, gap = 6, cw = (CW - gap * (cols - 1)) / cols, ch = 64;
      for (let i = 0; i < b.items.length; i += cols) {
        ensure(ch + 12);
        b.items.slice(i, i + cols).forEach((p, j) => {
          const x = MG + j * (cw + gap), sc = Math.min(cw / p.w, ch / p.h), w = p.w * sc, h = p.h * sc;
          doc.setFillColor(243, 246, 248); doc.rect(x, y, cw, ch, 'F');
          doc.addImage(p.dataUrl, 'JPEG', x + (cw - w) / 2, y + (ch - h) / 2, w, h, undefined, 'FAST');
          font('bold', 8, INK); doc.text(doc.splitTextToSize(p.caption, cw)[0], x, y + ch + 4);
        });
        y += ch + 9;
      }
    };
    M.sections.forEach((s, si) => {
      if (si > 0) ensure(70);
      heading(s.title);
      s.blocks.forEach((b) => {
        if (b.type === 'kpis') kpis();
        else if (b.type === 'charts2') chartsRow(b.items);
        else if (b.type === 'chart') chartsRow([{ title: b.title, img: b.img, w: b.w || 0.6 }]);
        else if (b.type === 'table') table(b);
        else if (b.type === 'text') { font('normal', 8.3, GRAY); const l = doc.splitTextToSize(b.text, CW); ensure(l.length * 4 + 3); doc.text(l, MG, y + 3); y += l.length * 4 + 4; }
        else if (b.type === 'photos') photos(b);
      });
    });
    // Хөл
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i);
      doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.3); doc.line(MG, PH - 10, PW - MG, PH - 10);
      font('normal', 7.4, GRAY);
      doc.text(M.footer, MG, PH - 6);
      doc.text(M.info[M.info.length - 1][1], PW / 2, PH - 6, { align: 'center' });
      doc.text(M.tx.page(i, n), PW - MG, PH - 6, { align: 'right' });
    }
    saveBlob(doc.output('blob'), M.file + '.pdf');
  }

  /* ---------- Word (.docx) ---------- */
  async function buildDocx(M) {
    await loadLib('docx');
    const X = window.docx;
    const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType, PageOrientation, ShadingType, Footer, PageNumber, VerticalAlign, TableLayoutType, BorderStyle } = X;
    const FONT = 'Arial', tw = (mm) => Math.round(mm * 56.6929), CWmm = 297 - 30, CW = tw(CWmm), PX = (mm) => Math.round(mm * 96 / 25.4);
    const run = (text, o) => { o = o || {}; return new TextRun({ text: String(text == null ? '' : text), bold: o.b, size: o.size || 18, color: o.color, font: FONT }); };
    const para = (children, o) => { o = o || {}; return new Paragraph({ children, alignment: o.align, spacing: o.spacing || { after: 60 }, keepNext: o.keepNext }); };
    const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const thin = { style: BorderStyle.SINGLE, size: 4, color: 'D5DCE3' };
    const cell = (kids, o) => new TableCell({
      verticalAlign: VerticalAlign.TOP, width: o.w ? { size: o.w, type: WidthType.DXA } : undefined,
      shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
      margins: { top: 50, bottom: 50, left: 80, right: 80 }, borders: o.noBorder ? { top: none, bottom: none, left: none, right: none } : { top: thin, bottom: thin, left: thin, right: thin },
      children: kids
    });
    const txtCell = (txt, o) => cell([new Paragraph({ alignment: o.right ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [run(txt, { b: o.b, size: o.size || 16, color: o.color })] })], o);
    const table = (tb) => {
      const TW = Math.round(CW * (tb.width || 1)), ws = tb.cols.map((c) => Math.round(c.w * TW));
      return new Table({
        width: { size: TW, type: WidthType.DXA }, columnWidths: ws, layout: TableLayoutType.FIXED,
        rows: [new TableRow({ tableHeader: true, children: tb.cols.map((c, i) => txtCell(c.t, { b: true, fill: '0C2839', color: 'FFFFFF', w: ws[i], right: isNum(c), size: 15 })) })]
          .concat(tb.rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((v, i) => txtCell(cellText(v, tb.cols[i]), { w: ws[i], right: isNum(tb.cols[i]), b: tb.boldRows && tb.boldRows.includes(ri), fill: tb.boldRows && tb.boldRows.includes(ri) ? 'EAF1EC' : (ri % 2 ? 'F8FAFB' : undefined) })) })))
      });
    };
    const image = (img, wmm) => new ImageRun({ type: img.type || 'png', data: img.data, transformation: { width: PX(wmm), height: Math.round(PX(wmm) * img.h / img.w) } });
    const H = (txt) => para([run(txt, { b: true, size: 28, color: '0C2839' })], { spacing: { before: 280, after: 120 }, keepNext: true });
    const H3 = (txt) => para([run(txt, { b: true, size: 20, color: '191919' })], { spacing: { before: 160, after: 80 }, keepNext: true });
    const kids = [];
    if (M.logo) kids.push(para([image(M.logo, 42)], { spacing: { after: 120 } }));
    kids.push(para([run(M.title, { b: true, size: 34, color: '0C2839' })], { spacing: { after: 60 } }));
    kids.push(para([run(M.asof, { size: 17, color: '5B6670' })], { spacing: { after: 100 } }));
    const iw = [Math.round(CW * 0.22), Math.round(CW * 0.78)];
    kids.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: iw, layout: TableLayoutType.FIXED,
      rows: M.info.map((p) => new TableRow({ children: [txtCell(p[0], { b: true, w: iw[0], fill: 'F3F6F8' }), txtCell(p[1], { w: iw[1] })] })) }));
    M.sections.forEach((s) => {
      kids.push(H(s.title));
      s.blocks.forEach((b) => {
        if (b.type === 'kpis') {
          const w = Math.round(CW / M.kpis.length);
          kids.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: M.kpis.map(() => w), layout: TableLayoutType.FIXED, rows: [new TableRow({ children: M.kpis.map((k) => cell(
            [para([run(k.label.toUpperCase(), { b: true, size: 14, color: '5B6670' })]), para([run(k.value, { b: true, size: 40 }), run(k.unit ? ' ' + k.unit : '', { b: true, size: 18, color: '5B6670' })])]
              .concat(k.lines.filter(Boolean).map((l) => para([run(l, { size: 14, color: '5B6670' })], { spacing: { after: 20 } }))), { w })) })] }));
        } else if (b.type === 'charts2' || b.type === 'chart') {
          const items = b.type === 'chart' ? [{ title: b.title, img: b.img }] : b.items;
          items.forEach((it) => {
            kids.push(H3(it.title));
            const wmm = Math.min(CWmm, it.img.w * 0.2);
            kids.push(para([image(it.img, wmm)], { spacing: { after: 120 } }));
          });
        } else if (b.type === 'table') {
          if (b.title) kids.push(H3(b.title));
          kids.push(b.rows.length ? table(b) : para([run('–', { color: '5B6670' })]));
          kids.push(para([run('')], { spacing: { after: 80 } }));
        } else if (b.type === 'text') kids.push(para([run(b.text, { size: 16, color: '5B6670' })], { spacing: { before: 60, after: 120 } }));
        else if (b.type === 'photos') {
          kids.push(para([run(b.items.length ? b.dayTxt : M.tx.noPhotos, { size: 17, color: '5B6670' })]));
          b.items.forEach((p) => {
            const wmm = p.w >= p.h ? 150 : 95;
            kids.push(para([image(p, wmm)], { spacing: { before: 120, after: 40 } }));
            kids.push(para([run(p.caption, { b: true, size: 17 })], { spacing: { after: 20 } }));
            if (p.note) kids.push(para([run(p.note, { size: 16, color: '5B6670' })], { spacing: { after: 160 } }));
          });
        }
      });
    });
    const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
      run(M.footer + ' · ', { size: 15, color: '5B6670' }), new TextRun({ children: [PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES], size: 15, color: '5B6670', font: FONT })] })] });
    const doc = new Document({
      creator: 'RegaPro', title: M.title,
      styles: { default: { document: { run: { font: FONT, size: 18 } } } },
      sections: [{ properties: { page: { size: { width: tw(210), height: tw(297), orientation: PageOrientation.LANDSCAPE }, margin: { top: tw(14), bottom: tw(14), left: tw(15), right: tw(15) } } }, footers: { default: footer }, children: kids }]
    });
    saveBlob(await Packer.toBlob(doc), M.file + '.docx');
  }

  /* ---------- Excel (.xlsx) ---------- */
  async function buildXlsx(M) {
    await loadLib('exceljs');
    const wb = new window.ExcelJS.Workbook(); wb.creator = 'RegaPro'; wb.created = new Date();
    const NAVY = 'FF0C2839', used = new Set();
    const sheetName = (s) => { let n = String(s).replace(/[\[\]:*?/\\]/g, ' ').slice(0, 31).trim() || 'Sheet'; let k = 2; const base = n; while (used.has(n.toLowerCase())) n = (base.slice(0, 28) + ' ' + k++); used.add(n.toLowerCase()); return n; };
    const fmtFor = (c) => c.type === 'int' ? '#,##0' : c.type === 'pct' ? '0%' : c.type === 'num' ? (c.d === 0 ? '#,##0' : '#,##0.0') : c.type === 'date' ? 'yyyy-mm-dd' : undefined;
    const toCell = (v, c) => {
      if (v == null || v === '') return null;
      if (c.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(toMs(v));
      return v;
    };
    const writeTable = (ws, tb, r0, title) => {
      let r = r0;
      if (title) { const tc = ws.getCell(r, 1); tc.value = title; tc.font = { bold: true, size: 12, color: { argb: NAVY } }; r++; }
      const hr = ws.getRow(r);
      tb.cols.forEach((c, i) => { const cl = hr.getCell(i + 1); cl.value = c.t; cl.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }; cl.alignment = { vertical: 'middle', wrapText: true, horizontal: isNum(c) ? 'right' : 'left' }; });
      hr.height = 30;
      const headRow = r;
      tb.rows.forEach((row, ri) => {
        r++;
        const xr = ws.getRow(r);
        row.forEach((v, i) => {
          const c = tb.cols[i], cl = xr.getCell(i + 1);
          cl.value = toCell(v, c);
          const nf = fmtFor(c); if (nf && typeof cl.value !== 'string') cl.numFmt = nf;
          cl.alignment = { vertical: 'top', wrapText: !isNum(c) && c.w > 0.2 };
          if (tb.boldRows && tb.boldRows.includes(ri)) { cl.font = { bold: true }; cl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF1EC' } }; }
        });
      });
      return { next: r + 2, headRow, lastRow: r };
    };
    const widths = (ws, tb, base) => tb.cols.forEach((c, i) => { const col = ws.getColumn(i + 1); const w = Math.max(10, Math.min(70, Math.round(c.w * (base || 160)))); col.width = Math.max(col.width || 0, w); });
    const tableSheet = (name, tb) => {
      const ws = wb.addWorksheet(sheetName(name), { views: [{ state: 'frozen', ySplit: 1 }] });
      widths(ws, tb);
      const res = writeTable(ws, tb, 1);
      if (tb.rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: res.lastRow, column: tb.cols.length } };
      return ws;
    };
    // Хураангуй
    const sum = wb.addWorksheet(sheetName(M.tx.summarySheet));
    sum.getColumn(1).width = 30; sum.getColumn(2).width = 22; sum.getColumn(3).width = 18; sum.getColumn(4).width = 22; sum.getColumn(5).width = 22;
    sum.getCell('A1').value = M.title; sum.getCell('A1').font = { bold: true, size: 16, color: { argb: NAVY } };
    sum.getCell('A2').value = M.asof; sum.getCell('A2').font = { color: { argb: 'FF5B6670' } };
    let r = 4;
    M.info.forEach((p) => { sum.getCell(r, 1).value = p[0]; sum.getCell(r, 1).font = { bold: true }; sum.getCell(r, 2).value = p[1]; r++; });
    r++;
    const kt = { cols: [{ t: M.tx.kpi, w: 0.3 }, { t: M.tx.repVal, type: 'num', w: 0.18 }, { t: M.tx.vsPrev, type: 'num', w: 0.17 }, { t: M.tx.vsAvg, type: 'num', w: 0.17 }, { t: M.tx.periodVal, type: 'num', w: 0.18 }],
      rows: M.kpis.map((k) => [k.label + (k.unit ? ', ' + k.unit : ''), k.raw.v, k.raw.dPrev, k.raw.dAvg, k.raw.period]) };
    writeTable(sum, kt, r);
    // Хэсгүүд
    const imgs = [];
    M.sections.forEach((s) => {
      const tables = s.blocks.filter((b) => b.type === 'table');
      s.blocks.forEach((b) => { if (b.type === 'charts2') b.items.forEach((it) => imgs.push(it)); if (b.type === 'chart') imgs.push({ title: b.title, img: b.img }); });
      if (s.key === 'photos') {
        const b = s.blocks[0], ws = wb.addWorksheet(sheetName(s.title));
        ws.getColumn(1).width = 90; ws.getCell('A1').value = b.items.length ? b.dayTxt : M.tx.noPhotos; ws.getCell('A1').font = { bold: true };
        let row = 3;
        b.items.forEach((p) => {
          const w = 520, h = Math.round(w * p.h / p.w);
          ws.getCell(row, 1).value = p.caption + (p.note ? ' — ' + p.note : ''); ws.getCell(row, 1).font = { bold: true };
          const id = wb.addImage({ base64: p.dataUrl, extension: 'jpeg' });
          ws.addImage(id, { tl: { col: 0, row }, ext: { width: w, height: h } });
          row += Math.ceil(h / 20) + 3;
        });
        return;
      }
      if (!tables.length) return;
      if (tables.length === 1 && !tables[0].title) { tableSheet(s.title, tables[0]); return; }
      const ws = wb.addWorksheet(sheetName(s.title));
      let rr = 1;
      tables.forEach((tb) => { widths(ws, tb); rr = writeTable(ws, tb, rr, tb.title).next; });
    });
    // Бүх бичлэг
    tableSheet(M.tx.records, M.records);
    // Графикууд
    if (imgs.length) {
      const ws = wb.addWorksheet(sheetName(M.tx.charts));
      ws.getColumn(1).width = 110;
      let row = 1;
      imgs.forEach((it) => {
        ws.getCell(row, 1).value = it.title; ws.getCell(row, 1).font = { bold: true, size: 12, color: { argb: NAVY } };
        const w = Math.min(900, it.img.w), h = Math.round(w * it.img.h / it.img.w);
        const id = wb.addImage({ base64: it.img.dataUrl, extension: 'png' });
        ws.addImage(id, { tl: { col: 0, row }, ext: { width: w, height: h } });
        row += Math.ceil(h / 20) + 3;
      });
    }
    const buf = await wb.xlsx.writeBuffer();
    saveBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), M.file + '.xlsx');
  }

  /* ---------- Цонх ---------- */
  const EXP_SECS = ['summary', 'records', 'notes', 'samples', 'holes', 'daily', 'prod', 'dq', 'photos'];
  function openExport() {
    if (!RECS.length) return;
    const saved = store.get('exp_secs', null);
    const box = $('expSecs'); box.innerHTML = '';
    EXP_SECS.forEach((k) => {
      const lab = el('label', { class: 'chk' }, box);
      const cb = el('input', { type: 'checkbox', value: k }, lab);
      cb.checked = saved ? saved.includes(k) : k !== 'photos';
      el('span', null, lab, t('exp.s.' + k));
    });
    const fmtSaved = store.get('exp_fmt', 'pdf');
    document.querySelectorAll('input[name=expFmt]').forEach((r) => { r.checked = r.value === fmtSaved; });
    $('expLang').value = LANG;
    syncExpFmt();
    const holes = holesInRange();
    $('expScope').textContent = t('exp.scope', fmtDate(F.from) + ' – ' + fmtDate(F.to), fmtDate(repDay()), (F.exHoles.size || F.exTypes.size) ? holes.map((h) => h.hole).join(', ') : t('exp.holesAll', holes.length));
    setExpStatus('');
    const dlg = $('expDlg');
    if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
  }
  function syncExpFmt() {
    const f = (document.querySelector('input[name=expFmt]:checked') || {}).value || 'pdf';
    $('expSecs').classList.toggle('off', f === 'csv');
  }
  function setExpStatus(msg, kind) {
    const s = $('expStatus'); s.innerHTML = ''; s.className = kind === 'err' ? 'err' : '';
    if (kind === 'busy') el('span', { class: 'spin' }, s);
    if (msg) s.appendChild(document.createTextNode(msg));
  }
  async function runExport() {
    const f = (document.querySelector('input[name=expFmt]:checked') || {}).value || 'pdf';
    const lang = $('expLang').value === 'en' ? 'en' : 'mn';
    store.set('exp_fmt', f);
    if (f === 'csv') { const pl = LANG; LANG = lang; try { exportCsv(); } finally { LANG = pl; } $('expDlg').close(); return; }
    const sel = {}; const picked = [];
    document.querySelectorAll('#expSecs input').forEach((cb) => { sel[cb.value] = cb.checked; if (cb.checked) picked.push(cb.value); });
    store.set('exp_secs', picked);
    if (!picked.length) { setExpStatus(t('exp.pick'), 'err'); return; }
    const go = $('expGo'); go.disabled = true;
    setExpStatus(t('exp.working'), 'busy');
    const uiLang = LANG;
    try {
      if (sel.photos && !ATT_READY) await loadAttachments();
      LANG = lang;                              // тайланг сонгосон хэлээр бүтээнэ
      const M = await buildModel(sel, lang);
      LANG = lang;
      if (f === 'pdf') await buildPdf(M);
      else if (f === 'docx') await buildDocx(M);
      else await buildXlsx(M);
      LANG = uiLang;
      setExpStatus(t('exp.done'));
      setTimeout(() => { if ($('expDlg').open) $('expDlg').close(); }, 900);
    } catch (e) {
      LANG = uiLang;
      console.error(e);
      setExpStatus(t('exp.err', (e && e.message) || e), 'err');
    } finally { LANG = uiLang; go.disabled = false; }
  }

  /* ---------------------------------------------------------------
     Экспорт, хэвлэх
     --------------------------------------------------------------- */
  function exportCsv() {
    const cols = t('csv.cols');
    const q = (v) => { const s = v == null ? '' : String(v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const rows = recsInRange().map((r) => [r.date, r.holes.join(' ') || r.other, r.mTot, r.mDay, r.mNight, r.sTot, r.sDay, r.sNight, r.depth, r.tsamp, r.rock, r.soil, r.transport ? t('yes') : '', r.note, r.oid, photosOf(r).length]);
    const csv = '\ufeff' + [cols.concat([t('csv.photos')])].concat(rows).map((row) => row.map(q).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `daily-report_${F.from}_${F.to}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 30000);
  }

  /* ---------------------------------------------------------------
     Төлөвлөсөн гүн
     --------------------------------------------------------------- */
  function openPlans() {
    const dlg = $('planDlg'), rowsBox = $('planRows'); rowsBox.innerHTML = '';
    const P = plans(), D = repDay();
    const holes = [...BY_HOLE.keys()].map((h) => holeInfo(h, D)).filter((h) => h && h.recs.some((r) => r.drillRec && r.hole === h.hole)).sort((a, b) => b.last.localeCompare(a.last));
    holes.forEach((h) => {
      const row = el('div', { class: 'prow' }, rowsBox);
      el('b', null, row, h.hole);
      el('span', null, row, t('plan.cur', fmt(h.depth)));
      const inp = el('input', { type: 'number', min: 0, step: 0.1, inputmode: 'decimal', 'data-hole': h.hole, 'aria-label': h.hole }, row);
      if (P[h.hole]) inp.value = P[h.hole];
    });
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function savePlans() {
    const local = {};
    document.querySelectorAll('#planRows input').forEach((inp) => { const v = parseFloat(inp.value); if (isFinite(v) && v > 0 && PLAN_TABLE[inp.dataset.hole] !== v) local[inp.dataset.hole] = v; });
    store.set('plans_v1', local);
    $('planDlg').close(); update();
  }

  /* ---------------------------------------------------------------
     Зурах
     --------------------------------------------------------------- */
  function renderHeader() {
    $('asof').textContent = DATA_MAX ? t('asof', fmtDate(DATA_MAX)) : '';
    $('updated').textContent = LAST_LOAD ? t('updated', new Date(LAST_LOAD).toLocaleTimeString(LANG === 'en' ? 'en-GB' : 'en-GB', { hour: '2-digit', minute: '2-digit' })) : '';
  }
  function renderTab() {
    tipHide();
    if (!RECS.length) return;
    if (TAB === 'overview') {
      renderKpis(); renderShiftChart(); renderProgress($('progressChart'), holesInRange()); renderRecs(); renderNotes(); renderSent();
    } else if (TAB === 'holes') renderHoles();
    else if (TAB === 'prod') renderProd();
    else if (TAB === 'dq') renderDQ();
  }
  function update() {
    if (F.repDay && (F.repDay < F.from || F.repDay > F.to)) F.repDay = null;
    compute(); renderFilters(); renderHeader(); renderTab();
  }
  // Хуучин #recs холбоос → Өдрийн тойм (хүснэгт графикийн доор шилжсэн)
  function tabFromHash() { const h = (location.hash || '').replace('#', ''); if (h === 'recs') return 'overview'; return ['overview', 'holes', 'prod', 'dq'].includes(h) ? h : null; }
  function setTab(name) {
    TAB = name;
    document.querySelectorAll('.tabs [role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b.id === 't-' + name)));
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('on', p.id === 'p-' + name));
    try { history.replaceState(null, '', '#' + name); } catch (e) { /* */ }
    renderTab();
  }
  function applyI18n() {
    document.documentElement.lang = LANG;
    document.title = t('docTitle');
    document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach((n) => { n.placeholder = t(n.dataset.i18nPh); });
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
    if (USER) $('userBtn').textContent = USER + ' · ' + t('signout');
    if (window.ETT) window.ETT.setLang(LANG);
  }

  /* ---------------------------------------------------------------
     Өгөгдөл ачаалах
     --------------------------------------------------------------- */
  async function queryAll(url, params) {
    let off = 0, all = [];
    for (let guard = 0; guard < 50; guard++) {
      const d = await API.query(url, Object.assign({ where: '1=1', returnGeometry: false, orderByFields: 'objectid', resultOffset: off, resultRecordCount: 1000 }, params));
      if (d.error) throw new Error(d.error.message || 'query');
      const feats = d.features || [];
      all = all.concat(feats.map((f) => f.attributes));
      if (!d.exceededTransferLimit || !feats.length) break;
      off += feats.length;
    }
    return all;
  }
  const OUT_FIELDS = ['objectid', 'CreationDate', '_date', 'drillholes', 'drillholes_other', 'drilled_m_per_day', 'sample_per_day', 'total_depth_m', 'total_sample', 'total_test_pit_per_day', 'total_samples', 'rock_sample', 'soil_sample', 'note_', 'drilled_m_day', 'sample_day', 'drilled_m_night', 'sample_night', 'is_transport'];
  async function loadRock() {
    try {
      // Тайлангийн сүүлийн өдрийн маргааш 12:00 (УБ) хүртэл бүртгэсэн дээжийг тоолно — өдөр тутмын мэдээ мөн тэр үед ордог
      const cut = new Date(toMs(addDays(DATA_MAX, 1)) + (12 - CONFIG.tzOffsetH) * 3600e3).toISOString().slice(0, 19).replace('T', ' ');
      const d = await API.query(CONFIG.rockUrl, { where: "hole_id IS NOT NULL AND hole_id <> 'other' AND CreationDate < TIMESTAMP '" + cut + "'", groupByFieldsForStatistics: 'hole_id', outStatistics: JSON.stringify([{ statisticType: 'count', onStatisticField: 'objectid', outStatisticFieldName: 'n' }]), returnGeometry: false });
      if (d.error) throw new Error(d.error.message);
      const m = {}; (d.features || []).forEach((f) => { const h = normHole(f.attributes.hole_id || f.attributes.HOLE_ID); if (h) m[h] = (m[h] || 0) + (f.attributes.n || f.attributes.N || 0); });
      ROCK = m; ROCK_ERR = false;
    } catch (e) { ROCK = null; ROCK_ERR = true; }
  }
  async function loadPlansTable() {
    if (!CONFIG.planTableUrl) return;
    try {
      const rows = await queryAll(CONFIG.planTableUrl, { outFields: 'hole_id,planned_depth', orderByFields: '' });
      const m = {}; rows.forEach((a) => { const h = normHole(a.hole_id); if (h && a.planned_depth > 0) m[h] = +a.planned_depth; });
      PLAN_TABLE = m;
    } catch (e) { /* төлөвлөгөөний хүснэгт уншигдсангүй */ }
  }
  function ingest(attrs) {
    RECS = attrs.map(parseRecord).filter((r) => r.date).sort((a, b) => a.date.localeCompare(b.date) || a.oid - b.oid);
    BY_HOLE = new Map();
    RECS.forEach((r) => r.holes.forEach((h) => { if (!BY_HOLE.has(h)) BY_HOLE.set(h, []); BY_HOLE.get(h).push(r); }));
    DATA_MIN = RECS.length ? RECS[0].date : null;
    DATA_MAX = RECS.length ? RECS[RECS.length - 1].date : null;
    LAST_LOAD = Date.now();
  }
  async function loadData(isRefresh) {
    const main = $('main');
    if (isRefresh) main.classList.add('busy');
    const btn = $('refreshBtn'); btn.disabled = true;
    try {
      const prevMax = DATA_MAX;
      const [attrs] = await Promise.all([queryAll(CONFIG.dailyUrl, { outFields: OUT_FIELDS.join(',') }), loadPlansTable()]);
      ingest(attrs);
      await loadRock();
      if (!F.from || (F.to === prevMax && F.preset !== 'custom')) setPreset(F.preset === 'custom' ? String(CONFIG.defaultDays) : F.preset);
      showError('');
      afterLoad();
      loadAttachments().then(() => { if (TAB === 'overview' || TAB === 'dq') renderTab(); });
    } catch (e) {
      showError(t('err.load', (e && e.message) || e));
    } finally {
      main.classList.remove('busy'); btn.disabled = false;
    }
  }
  function afterLoad() {
    $('loading').style.display = 'none';
    if (!RECS.length) { showError(t('noData')); return; }
    const want = tabFromHash();
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('on', p.id === 'p-' + TAB));
    if (want && want !== TAB) { TAB = want; }
    document.querySelectorAll('.tabs [role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b.id === 't-' + TAB)));
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('on', p.id === 'p-' + TAB));
    update();
  }
  function showError(msg) { const b = $('errbox'); b.textContent = msg || ''; b.style.display = msg ? 'block' : 'none'; if (msg) $('loading').style.display = 'none'; }

  /* ---------------------------------------------------------------
     Үйл явдал
     --------------------------------------------------------------- */
  let USER = '';
  function wire() {
    document.querySelectorAll('.tabs [role=tab]').forEach((b) => b.addEventListener('click', () => setTab(b.id.slice(2))));
    $('presets').addEventListener('click', (e) => { const b = e.target.closest('button[data-days]'); if (!b || !DATA_MAX) return; setPreset(b.dataset.days); update(); });
    const onDate = () => {
      let a = $('dFrom').value, b = $('dTo').value; if (!a || !b) return;
      if (a > b) { const x = a; a = b; b = x; }
      F.from = a < DATA_MIN ? DATA_MIN : a; F.to = b > DATA_MAX ? DATA_MAX : b; F.preset = 'custom'; F.repDay = null; update();
    };
    $('dFrom').addEventListener('change', onDate); $('dTo').addEventListener('change', onDate);
    $('repDayClear').addEventListener('click', () => { F.repDay = null; update(); });
    $('shDay').addEventListener('change', (e) => { F.day = e.target.checked; if (!F.day && !F.night) { F.night = true; } update(); });
    $('shNight').addEventListener('change', (e) => { F.night = e.target.checked; if (!F.day && !F.night) { F.day = true; } update(); });
    $('clearAll').addEventListener('click', () => { F.exHoles.clear(); F.exTypes.clear(); F.day = F.night = true; setPreset(String(CONFIG.defaultDays)); update(); });
    $('expBtn').addEventListener('click', openExport); $('expBtnTop').addEventListener('click', openExport);
    $('expClose').addEventListener('click', () => $('expDlg').close()); $('expCancel').addEventListener('click', () => $('expDlg').close());
    $('expGo').addEventListener('click', runExport);
    let rq = null;
    $('recSearch').addEventListener('input', (e) => { clearTimeout(rq); rq = setTimeout(() => { REC.q = e.target.value; renderRecs(); }, 160); });
    $('recShip').addEventListener('change', (e) => { REC.ships = e.target.checked; renderRecs(); });
    document.querySelectorAll('input[name=expFmt]').forEach((r) => r.addEventListener('change', syncExpFmt));
    $('printBtn').addEventListener('click', () => window.print());
    $('planBtn').addEventListener('click', openPlans); $('planBtn2').addEventListener('click', openPlans);
    $('planClose').addEventListener('click', () => $('planDlg').close()); $('planCancel').addEventListener('click', () => $('planDlg').close());
    $('planSave').addEventListener('click', savePlans);
    $('photoClose').addEventListener('click', () => $('photoDlg').close());
    $('photoPrev').addEventListener('click', () => { if (PV.i > 0) { PV.i--; showPhoto(); } });
    $('photoNext').addEventListener('click', () => { if (PV.i < PV.items.length - 1) { PV.i++; showPhoto(); } });
    $('photoDlg').addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') $('photoPrev').click(); if (e.key === 'ArrowRight') $('photoNext').click(); });
    $('photoDlg').addEventListener('click', (e) => { if (e.target === $('photoDlg')) $('photoDlg').close(); });
    $('refreshBtn').addEventListener('click', () => loadData(true));
    $('filterToggle').addEventListener('click', () => { const f = $('filters'); const open = !f.classList.contains('open'); f.classList.toggle('open', open); $('filterToggle').setAttribute('aria-expanded', String(open)); });
    document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => { LANG = b.dataset.lang; store.set('lang', LANG); applyI18n(); if (RECS.length) update(); }));
    let rt = null, lastW = 0;
    const ro = new ResizeObserver(() => { const w = $('main').clientWidth; if (Math.abs(w - lastW) < 4) return; lastW = w; clearTimeout(rt); rt = setTimeout(renderTab, 120); });
    ro.observe($('main'));
    window.addEventListener('beforeprint', () => { tipHide(); });
    window.addEventListener('hashchange', () => { const h = tabFromHash(); if (h && h !== TAB && RECS.length) setTab(h); });
    setInterval(() => { if (!document.hidden && API && RECS.length) loadData(true); }, CONFIG.refreshMin * 60e3);
  }

  /* ---------------------------------------------------------------
     Эхлэл, нэвтрэлт
     --------------------------------------------------------------- */
  function boot() {
    loadColors(); applyI18n(); wire();
    const want = tabFromHash();
    if (want) TAB = want;
    // Туршилтын горим (зөвхөн локал шалгалтад): window.DR_FIXTURE
    if (window.DR_FIXTURE) {
      const fx = window.DR_FIXTURE;
      API = {
        query: () => Promise.reject(new Error('fixture')),
        get: (url) => {
          if (/queryAttachments$/.test(url)) return Promise.resolve({ attachmentGroups: Object.keys(fx.attachments || {}).map((oid) => ({ parentObjectId: +oid, attachmentInfos: fx.attachments[oid] })) });
          return Promise.reject(new Error('fixture'));
        },
        blob: (url) => { const m = /\/(\d+)\/attachments\/(\d+)/.exec(url); const f = m && (fx.files || {})[m[2]]; return f ? fetch(f).then((r) => r.blob()) : Promise.reject(new Error('no file')); }
      };
      if (fx.rock) ROCK = fx.rock; else ROCK_ERR = true;
      USER = fx.user || ''; if (USER) { $('userBtn').hidden = false; $('userBtn').textContent = USER + ' · ' + t('signout'); }
      ingest(fx.daily); setPreset(String(CONFIG.defaultDays)); afterLoad();
      loadAttachments().then(() => renderTab());
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
        if (started) return; started = true;
        $('signin').style.display = 'none';
        new Portal({ url: CONFIG.portalUrl, authMode: 'immediate' }).load().then((p) => {
          USER = (p.user && (p.user.fullName || p.user.username)) || '';
          const ub = $('userBtn'); ub.hidden = !USER; ub.textContent = USER + ' · ' + t('signout');
          ub.onclick = () => { esriId.destroyCredentials(); location.reload(); };
        }).catch(() => { /* хэрэглэгчийн нэр заавал биш */ });
        loadData(false);
      };
      esriId.checkSignInStatus(sharing).then(start).catch(() => {
        if (started) return;
        $('loading').style.display = 'none';
        $('signin').style.display = 'flex';
        $('signinBtn').onclick = () => esriId.getCredential(sharing).then(start).catch((e) => showError(t('err.signin', (e && e.message) || e)));
      });
    }, () => showError(t('err.lib')));
  }

  /* ---------------------------------------------------------------
     ЭТТ төвд зориулсан товч (DOM ашиглахгүй): тайлантай ижил тооцоо
     --------------------------------------------------------------- */
  function summaryOf(attrs) {
    ingest(attrs);
    if (!RECS.length) return null;
    F.exHoles.clear(); F.exTypes.clear(); F.day = F.night = true;
    setPreset(String(CONFIG.defaultDays)); compute();
    const D = DATA_MAX, P = addDays(D, -1);
    const active = new Set(); dayRecs(D).forEach((r) => { if (mVal(r) > 0) keysOf(r).forEach((k) => { if (k !== '__other') active.add(k); }); });
    const sentR = recsInRange().filter((r) => r.transport);
    const last = sentR.slice(-1)[0];
    const spark = (fn) => { const v = []; for (let i = 13; i >= 0; i--) v.push(fn(addDays(D, -i))); return v; };
    return {
      date: D, from: F.from, to: F.to, days: dateRange(F.from, F.to).length,
      metres: dayM(D), metresPrev: dayM(P), samples: dayS(D), samplesPrev: dayS(P),
      active: active.size, activeHoles: [...active].sort(),
      sent: sentR.reduce((a, r) => a + (r.rock || 0) + (r.soil || 0), 0),
      lastSent: last ? { date: last.date, n: (last.rock || 0) + (last.soil || 0) } : null,
      m30: rangeSum(dayM), s30: rangeSum(dayS),
      sparkM: spark(dayM), sparkS: spark(dayS), records: RECS.length,
      holeM: (() => { const m = new Map(); dayRecs(D).forEach((r) => { if (!r.drillRec) return; const k = r.hole || r.other; if (!k) return; m.set(k, (m.get(k) || 0) + mVal(r)); }); return [...m].filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).map((x) => ({ hole: x[0], m: x[1] })); })()
    };
  }
  async function fetchSummary(api) {
    API = api;
    const attrs = await queryAll(CONFIG.dailyUrl, { outFields: OUT_FIELDS.join(',') });
    return summaryOf(attrs);
  }

  window.DR = { boot, summaryOf, fetchSummary, CONFIG, _t: t, _state: F };
})();
