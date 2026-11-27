/* =====================================================================
   RegaPro · ЭТТ хэрэгслийн жагсаалт
   Шинэ хэрэгсэл нэмэх: /ett/<path>/ хавтас үүсгээд энд нэг мөр нэмнэ.
   status: 'ready' (бэлэн) · 'soon' (удахгүй) · 'planned' (төлөвлөгөө)
   ===================================================================== */
window.ETT_TOOLS = [
  { id: 'dailyreport', path: 'dailyreport/', status: 'ready', icon: 'chart', legacy: 'Daily Report',
    mn: { name: 'Өдөр тутмын тайлан', short: 'Өдөр тутмын', desc: 'Өрөмдсөн метр, дээж, ээлжийн бүтээмж, өгөгдлийн чанар. PDF · Word · Excel тайлан татах.', tabs: ['Өдрийн тойм', 'Цооногийн явц', 'Бүтээмж', 'Өгөгдлийн чанар'] },
    en: { name: 'Daily report', short: 'Daily', desc: 'Metres drilled, samples, shift productivity, data quality. PDF · Word · Excel export.', tabs: ['Daily overview', 'Hole progress', 'Productivity', 'Data quality'] } },
  { id: 'rock-sampling', path: 'rock-sampling/', status: 'ready', icon: 'rock', legacy: 'Rock Sampling',
    mn: { name: 'Чулуулгийн дээжлэлт', short: 'Чулуулгийн дээж', desc: 'Дээж бүрийн гүн, хэсэг, хатуулаг, сав, зураг. Цооногийн дээжийн багана, өгөгдлийн шалгалт, Excel тайлан.', tabs: ['Тойм', 'Цооногоор', 'Дээжийн жагсаалт', 'Сав', 'Өгөгдлийн чанар'] },
    en: { name: 'Rock sampling', short: 'Rock samples', desc: 'Depth, unit, strength, cooler and photo of every sample. Hole sample column, data checks, Excel export.', tabs: ['Overview', 'By hole', 'Sample list', 'Coolers', 'Data quality'] } },
  { id: 'run-info', path: 'run-info/', status: 'planned', icon: 'run', legacy: 'Run Info',
    mn: { name: 'Run-ийн мэдээлэл', short: 'Run мэдээ', desc: 'Өрөмдлөгийн run бүрийн мэдээлэл.' },
    en: { name: 'Run info', short: 'Run info', desc: 'Information for each drilling run.' } },
  { id: 'monitoring', path: 'monitoring/', status: 'planned', icon: 'pulse', legacy: 'Monitoring',
    mn: { name: 'Мониторинг', short: 'Мониторинг', desc: 'Ажлын явцын хяналт.' },
    en: { name: 'Monitoring', short: 'Monitoring', desc: 'Progress monitoring.' } },
  { id: 'transportation', path: 'transportation/', status: 'planned', icon: 'truck', legacy: 'Transportation',
    mn: { name: 'Дээж тээвэрлэлт', short: 'Тээвэр', desc: 'Лаборатори руу дээж тээвэрлэлт, хүлээлцэх.' },
    en: { name: 'Sample transport', short: 'Transport', desc: 'Sample shipments to the laboratory and hand-over.' } },
  { id: 'water-depth', path: 'water-depth/', status: 'planned', icon: 'drop', legacy: 'Water Depth',
    mn: { name: 'Усны түвшин', short: 'Усны түвшин', desc: 'Цооног дахь усны түвшний хэмжилт.' },
    en: { name: 'Water depth', short: 'Water depth', desc: 'Water level measurements in holes.' } },
  { id: 'safety', path: 'safety/', status: 'planned', icon: 'shield', legacy: 'Safety Reports',
    mn: { name: 'Аюулгүй ажиллагаа', short: 'ХАБ', desc: 'Аюулгүй ажиллагааны тайлан.' },
    en: { name: 'Safety reports', short: 'Safety', desc: 'Health and safety reports.' } },
  { id: 'sample-list', path: 'sample-list/', status: 'planned', icon: 'list', legacy: 'Sample List',
    mn: { name: 'Дээжийн жагсаалт', short: 'Дээжийн жагс.', desc: 'Бүх дээжийн жагсаалт, хайлт.' },
    en: { name: 'Sample list', short: 'Samples', desc: 'All samples — list and search.' } },
  { id: 'drilling-map', path: 'drilling-map/', status: 'planned', icon: 'map', legacy: 'Drilling Map',
    mn: { name: 'Өрөмдлөгийн зураг', short: 'Газрын зураг', desc: 'Цооногийн байршил газрын зураг дээр.' },
    en: { name: 'Drilling map', short: 'Map', desc: 'Drillhole locations on a map.' } },
  { id: 'sample-log', path: 'sample-log/', status: 'planned', icon: 'log', legacy: 'Sample Log',
    mn: { name: 'Дээжийн бүртгэл', short: 'Дээжийн лог', desc: 'Дээжийн лог, түүх.' },
    en: { name: 'Sample log', short: 'Sample log', desc: 'Sample log and history.' } }
];

/* Сүүлийн шинэчлэлтүүд (шинэ нь дээрээ) */
window.ETT_NEWS = [
  { date: '2026-11-28', tool: 'rock-sampling', mn: 'Шинэ хэрэгсэл: цооногийн дээжийн багана, сав, зураг, 13 төрлийн шалгалт', en: 'New tool: hole sample column, coolers, photos, 13 data checks' },
  { date: '2026-11-27', tool: '', mn: 'ЭТТ хэрэгслийн төв нээгдлээ — бүх хэрэгсэл нэг дор, нэг нэвтрэлтээр', en: 'ETT tools hub opened — all tools in one place, one sign-in' },
  { date: '2026-11-26', tool: 'dailyreport', mn: 'Метр, дээж нэг графикт; ээлжийн график Бүтээмж табд', en: 'Metres and samples in one chart; shift chart in the Productivity tab' },
  { date: '2026-11-26', tool: 'dailyreport', mn: 'PDF, Word, Excel тайлан татах', en: 'Download reports as PDF, Word, Excel' }
];
