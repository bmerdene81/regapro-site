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
      title: 'ETT Geotech — Өрөмдлөгийн өдөр тутмын тайлан',
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
      'c.shift': 'Ээлжээр өрөмдсөн метр', 'c.days': '· {0} хоног', 'c.shiftNote': 'Багана дээр дарж (эсвэл ← → товчоор) тухайн өдрийг тайлангийн өдөр болгоно.',
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
      'p.per10': 'Дээж / 10 м', 'p.best': 'Хамгийн их өдөр', 'p.shiftShare': 'Ээлжийн харьцаа', 'p.weekly': 'Долоо хоногийн өрөмдлөг',
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
      'm.noPhoto': '{0} м өрөмдсөн, зураг алга', 'csv.photos': 'Зураг (ш)'
    },
    en: {
      docTitle: 'Daily Drilling Report · RegaPro',
      title: 'ETT Geotech — Daily Drilling Report',
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
      'c.shift': 'Metres drilled by shift', 'c.days': '· {0} days', 'c.shiftNote': 'Click a column (or use ← →) to make that day the report day.',
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
      'p.per10': 'Samples per 10 m', 'p.best': 'Best day', 'p.shiftShare': 'Shift split', 'p.weekly': 'Weekly metres',
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
      'm.noPhoto': '{0} m drilled, no photo', 'csv.photos': 'Photos'
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
    ['day', 'night', 'unk', 'drill', 'done', 'lab', 'prep', 'rock', 'soil', 'avg', 'total'].forEach((k) => { COLORS[k] = cssVar('--c-' + k); });
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
  function renderGallery() {
    const g = $('gallery'); g.innerHTML = '';
    if (!ATT_READY) { $('photoSub').textContent = ''; el('div', { class: 'empty' }, g, t('ph.loading')); return; }
    if (ATT_ERR && !ATT.size) { $('photoSub').textContent = ''; el('div', { class: 'empty' }, g, t('ph.attErr', ATT_ERR)); return; }
    const D = repDay();
    let day = D, items = photoItems(dayRecs(D)), noneMsg = '';
    if (!items.length) {
      const prev = FREC.filter((r) => r.date <= D && r.date >= F.from && photosOf(r).length);
      if (prev.length) { day = prev[prev.length - 1].date; items = photoItems(dayRecs(day)); noneMsg = t('ph.none', fmtDate(D, 'short'), fmtDate(day, 'short')); }
    }
    $('photoSub').textContent = items.length ? t('ph.sub', fmtDate(day, 'short'), items.length) : '';
    if (!items.length) { el('div', { class: 'empty' }, g, t('ph.empty')); return; }
    if (noneMsg) el('div', { class: 'note', style: 'grid-column:1/-1;margin:0 0 2px' }, g, noneMsg);
    items.forEach((it, i) => {
      const b = el('button', { type: 'button', class: 'ph', 'aria-label': photoCaption(it) }, g);
      const im = el('div', { class: 'im' }, b);
      lazyImg(im, it.p, true);
      const cap = el('div', { class: 'cap' }, b);
      el('b', null, cap, it.r.holes.join(', ') || it.r.other || '–');
      const tm = photoTime(it.p.name);
      el('span', null, cap, fmtDateWd(it.r.date) + (tm ? ' · ' + tm : ''));
      b.addEventListener('click', () => openPhotos(items, i));
    });
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
  function renderShiftChart() {
    const host = $('shiftChart'); host.innerHTML = '';
    const days = dateRange(F.from, F.to);
    $('shiftSub').textContent = t('c.days', days.length);
    const leg = [];
    if (F.day) leg.push({ color: COLORS.day, label: t('shift.day') });
    if (F.night) leg.push({ color: COLORS.night, label: t('shift.night') });
    const anyUnk = F.day && F.night && days.some((d) => dayRecs(d).some((r) => mParts(r).unk > 0));
    if (anyUnk) leg.push({ color: COLORS.unk, label: t('shift.unk') });
    leg.push({ color: COLORS.avg, label: t('avg7'), line: true });
    legend($('shiftLegend'), leg);
    if (!days.length) { el('div', { class: 'empty' }, host, t('noData')); return; }

    const W = Math.max(300, host.clientWidth || 600), H = W < 520 ? 230 : 290;
    const m = { l: 38, r: 10, t: 10, b: 26 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const vals = days.map((d) => {
      const p = { day: 0, night: 0, unk: 0 };
      dayRecs(d).forEach((r) => { const q = mParts(r); p.day += q.day; p.night += q.night; p.unk += q.unk; });
      p.tot = p.day + p.night + p.unk; p.avg = rolling(d, 7); return p;
    });
    const { top, ticks } = nice(Math.max(10, ...vals.map((v) => Math.max(v.tot, v.avg))) * 1.04, 5);
    const y = (v) => m.t + ph - (v / top) * ph;
    const band = pw / days.length, bw = Math.min(24, Math.max(2, band * 0.7));
    const D = repDay();
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': t('c.shift') + ', ' + fmtDate(F.from) + ' – ' + fmtDate(F.to) + ', ' + t('total') + ' ' + mtr(vals.reduce((a, v) => a + v.tot, 0)) }, host);
    // Долоо хоногийн ээлжилсэн суурь
    let wk = 0, startI = 0;
    days.forEach((d, i) => {
      if (i > 0 && weekday(d) === 1) { if (wk % 2 === 1) S('rect', { x: m.l + startI * band, y: m.t, width: (i - startI) * band, height: ph, fill: '#f4f6f8' }, svg); wk++; startI = i; }
      if (i === days.length - 1 && wk % 2 === 1) S('rect', { x: m.l + startI * band, y: m.t, width: (i + 1 - startI) * band, height: ph, fill: '#f4f6f8' }, svg);
    });
    // Сонгосон өдөр
    const di = days.indexOf(D);
    if (di >= 0) S('rect', { x: m.l + di * band, y: m.t, width: band, height: ph, fill: '#e6f2e6' }, svg);
    // Тор
    ticks.forEach((v) => {
      S('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v === 0 ? cssVar('--axis') : cssVar('--grid'), 'stroke-width': 1, 'shape-rendering': 'crispEdges' }, svg);
      S('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#5b6670', style: 'font-variant-numeric:tabular-nums' }, svg, fmt(v, 0));
    });
    // Багана
    vals.forEach((v, i) => {
      const x = m.l + i * band + (band - bw) / 2;
      const segs = [['day', COLORS.day], ['night', COLORS.night], ['unk', COLORS.unk]].filter(([k]) => v[k] > 0);
      let base = 0;
      segs.forEach(([k, c], si) => {
        const y0 = y(base), y1 = y(base + v[k]);
        const gap = si > 0 ? 2 : 0, h = Math.max(0.8, y0 - y1 - gap);
        const isTop = si === segs.length - 1;
        if (isTop) S('path', { d: colPath(x, y0 - gap - h, bw, h, 4), fill: c }, svg);
        else S('rect', { x, y: y0 - gap - h, width: bw, height: h, fill: c }, svg);
        base += v[k];
      });
    });
    // 7 хоногийн дундаж
    const pts = vals.map((v, i) => [m.l + i * band + band / 2, y(v.avg)]);
    S('path', { d: 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L'), fill: 'none', stroke: COLORS.avg, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    const lp = pts[pts.length - 1];
    S('circle', { cx: lp[0], cy: lp[1], r: 4, fill: COLORS.avg, stroke: '#fff', 'stroke-width': 2 }, svg);
    // X тэнхлэг
    const step = Math.max(1, Math.ceil(48 / band));
    for (let i = days.length - 1; i >= 0; i -= step) {
      S('text', { x: m.l + i * band + band / 2, y: H - 8, 'text-anchor': 'middle', 'font-size': 11, fill: '#5b6670' }, svg, fmtDate(days[i], 'short'));
    }
    if (di >= 0) S('path', { d: `M${m.l + di * band + band / 2 - 5},${m.t + ph + 7}l5,-6l5,6z`, fill: cssVar('--green-700') }, svg);
    // Hover давхарга
    const hl = S('rect', { x: 0, y: m.t, width: band, height: ph, fill: 'rgba(12,40,57,.06)', visibility: 'hidden', 'pointer-events': 'none' }, svg);
    const build = (i) => (T) => {
      const d = days[i], v = vals[i];
      tipHead(T, fmtDateWd(d));
      tipRow(T, null, mtr(v.tot), t('total'));
      if (F.day) tipRow(T, COLORS.day, mtr(v.day), t('shift.day'), true);
      if (F.night) tipRow(T, COLORS.night, mtr(v.night), t('shift.night'), true);
      if (v.unk > 0) tipRow(T, COLORS.unk, mtr(v.unk), t('shift.unk'), true);
      tipRow(T, COLORS.avg, mtr(v.avg), t('avg7'));
      const byH = new Map();
      dayRecs(d).forEach((r) => { const mv = mVal(r); if (mv > 0 || r.drillRec) byH.set(r.hole || r.other || '?', (byH.get(r.hole || r.other || '?') || 0) + mv); });
      if (byH.size) { tipSep(T); byH.forEach((mv, h) => tipRow(T, null, mtr(mv), h)); }
      const s = dayS(d); if (s) { tipSep(T); tipRow(T, null, pcs(s), t('k.samples')); }
    };
    const hit = S('rect', { x: m.l, y: m.t, width: pw, height: ph, fill: 'transparent', style: 'cursor:pointer' }, svg);
    const idxAt = (e) => { const b = svg.getBoundingClientRect(); const sx = (e.clientX - b.left) * (W / b.width); return Math.max(0, Math.min(days.length - 1, Math.floor((sx - m.l) / band))); };
    const showAt = (i, cx, cy) => { hl.setAttribute('x', m.l + i * band); hl.setAttribute('visibility', 'visible'); tipShow(cx, cy, build(i)); };
    hit.addEventListener('pointermove', (e) => showAt(idxAt(e), e.clientX, e.clientY));
    hit.addEventListener('pointerleave', () => { hl.setAttribute('visibility', 'hidden'); tipHide(); });
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
    host.onblur = () => { hl.setAttribute('visibility', 'hidden'); tipHide(); };
  }

  function renderProgress(host, holes, opts) {
    opts = opts || {};
    host.innerHTML = '';
    const rows = holes.filter((h) => h.depth > 0 || h.plan);
    if (!rows.length) { el('div', { class: 'empty' }, host, t('noData')); return; }
    const W = Math.max(280, host.clientWidth || 400), narrow = W < 460;
    const lw = narrow ? 92 : 104, rw = narrow ? 112 : 150, rowH = 30, m = { t: 4, b: 22 };
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
    if (!opts.noLegend) legend($('statusLegend'), ['drill', 'done', 'lab'].concat(holes.some((h) => h.status === 'prep') ? ['prep'] : []).map((s) => ({ color: statusColor(s), label: t('status.' + s) }))
      .concat(holes.some((h) => h.plan) ? [{ color: COLORS.avg, label: t('plan'), line: true }] : []));
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
    if (!cats.length) { el('div', { class: 'empty' }, host, t('noData')); return; }
    const W = Math.max(260, host.clientWidth || 400), H = opts.height || 200;
    const m = { l: 36, r: 8, t: 18, b: 26 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
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
      renderKpis(); renderShiftChart(); renderProgress($('progressChart'), holesInRange()); renderGallery(); renderNotes(); renderSent();
    } else if (TAB === 'holes') renderHoles();
    else if (TAB === 'prod') renderProd();
    else if (TAB === 'dq') renderDQ();
  }
  function update() {
    if (F.repDay && (F.repDay < F.from || F.repDay > F.to)) F.repDay = null;
    compute(); renderFilters(); renderHeader(); renderTab();
  }
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
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
    if (USER) $('userBtn').textContent = USER + ' · ' + t('signout');
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
    const want = (location.hash || '').replace('#', '');
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('on', p.id === 'p-' + TAB));
    if (['overview', 'holes', 'prod', 'dq'].includes(want) && want !== TAB) { TAB = want; }
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
    $('csvBtn').addEventListener('click', exportCsv);
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
    window.addEventListener('hashchange', () => { const h = (location.hash || '').replace('#', ''); if (['overview', 'holes', 'prod', 'dq'].includes(h) && h !== TAB && RECS.length) setTab(h); });
    setInterval(() => { if (!document.hidden && API && RECS.length) loadData(true); }, CONFIG.refreshMin * 60e3);
  }

  /* ---------------------------------------------------------------
     Эхлэл, нэвтрэлт
     --------------------------------------------------------------- */
  function boot() {
    loadColors(); applyI18n(); wire();
    const want = (location.hash || '').replace('#', '');
    if (['overview', 'holes', 'prod', 'dq'].includes(want)) TAB = want;
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

  window.DR = { boot, _t: t, _state: F };
})();
