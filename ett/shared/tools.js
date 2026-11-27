/* =====================================================================
   RegaPro · ЭТТ хэрэгслийн жагсаалт
   Шинэ хэрэгсэл нэмэх: /ett/<path>/ хавтас үүсгээд энд нэг мөр нэмнэ.
   status: 'ready' (бэлэн) · 'soon' (удахгүй) · 'planned' (төлөвлөгөө)
   ===================================================================== */
window.ETT_TOOLS = [
  { id: 'dailyreport', path: 'dailyreport/', status: 'ready', icon: 'chart', legacy: 'Daily Report',
    mn: { name: 'Өдөр тутмын тайлан', short: 'Өдөр тутмын', desc: 'Өрөмдсөн метр, дээж, ээлжийн бүтээмж, өгөгдлийн чанар. PDF · Word · Excel татах.' },
    en: { name: 'Daily report', short: 'Daily', desc: 'Metres drilled, samples, shift productivity, data quality. PDF · Word · Excel export.' } },
  { id: 'rock-sampling', path: 'rock-sampling/', status: 'planned', icon: 'rock', legacy: 'Rock Sampling',
    mn: { name: 'Чулуулгийн дээжлэлт', short: 'Чулуулгийн дээж', desc: 'Чулуулгийн дээжийн бүртгэл — цооног, интервал, тоо.' },
    en: { name: 'Rock sampling', short: 'Rock samples', desc: 'Rock sample register — hole, interval, count.' } },
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
  { date: '2026-11-27', tool: '', mn: 'ЭТТ хэрэгслийн төв нээгдлээ — бүх хэрэгсэл нэг дор, нэг нэвтрэлтээр', en: 'ETT tools hub opened — all tools in one place, one sign-in' },
  { date: '2026-11-26', tool: 'dailyreport', mn: 'Метр, дээж нэг графикт; ээлжийн график Бүтээмж табд', en: 'Metres and samples in one chart; shift chart in the Productivity tab' },
  { date: '2026-11-26', tool: 'dailyreport', mn: 'PDF, Word, Excel тайлан татах', en: 'Download reports as PDF, Word, Excel' }
];
