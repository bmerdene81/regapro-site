/* =====================================================================
   Цооногийн зүсэлт — тайлангийн орчуулга
   ---------------------------------------------------------------------
   Нэг толь: түлхүүр → { mn, en, ru, zh }.
   mn текст нь одоогийн тайлангийн тексттэй тэмдэгтээрээ таарна.
   Хэрэглэгчийн бичсэн утга (төсөл, зургийн нэр, нэр, тайлбар) энд орохгүй.
   Литологийн код танигдахгүй бол mn дээр "Бусад", бусад хэл дээр эх текст.
   ===================================================================== */
(function (root) {
  "use strict";

  const LANGS = ["mn", "en", "ru", "zh"];

  const STR = {
    "unit.m":  { mn: "м",  en: "m",  ru: "м",  zh: "米" },
    "unit.km": { mn: "км", en: "km", ru: "км", zh: "千米" },

    "axis.elev": { mn: "Өндөр, {u}", en: "Elevation, {u}", ru: "Отметка, {u}", zh: "标高, {u}" },
    "axis.dist": { mn: "Шугамын дагуух зай", en: "Distance along section", ru: "Расстояние по разрезу", zh: "沿剖面距离" },
    "axis.ve":   { mn: " · босоо өсгөлт ×{n}", en: " · vertical exaggeration ×{n}", ru: " · верт. преувеличение ×{n}", zh: " · 垂直夸张 ×{n}" },

    "cap.lith":   { mn: "ЛИТОЛОГИ", en: "LITHOLOGY", ru: "ЛИТОЛОГИЯ", zh: "岩性" },
    "cap.map":    { mn: "БАЙРЛАЛЫН ЗУРАГ", en: "LOCATION MAP", ru: "СХЕМА РАСПОЛОЖЕНИЯ", zh: "位置图" },
    "cap.legend": { mn: "ТАЙЛБАР", en: "LEGEND", ru: "УСЛОВНЫЕ ОБОЗНАЧЕНИЯ", zh: "图例" },

    "sym.ground": { mn: "Газрын гадарга", en: "Ground surface", ru: "Дневная поверхность", zh: "地表" },
    "sym.collar": { mn: "Цооногийн ам · доор нь нийт гүн", en: "Borehole collar · total depth below", ru: "Устье скважины · ниже — общая глубина", zh: "孔口 · 下方为孔深" },
    "sym.holeId": { mn: "Цооногийн дугаар", en: "Borehole ID", ru: "Номер скважины", zh: "钻孔编号" },

    "map.north":       { mn: "N", en: "N", ru: "С", zh: "北" },
    "map.missing":     { mn: "Газрын зураг байхгүй", en: "Map not available", ru: "Карта отсутствует", zh: "无地图" },
    "map.docxCaption": { mn: "Зүсэлтийн шугам A–A′, буфер ба цооногууд (дээд тал — хойд зүг)", en: "Section line A–A′, buffer and boreholes (top — north)", ru: "Линия разреза A–A′, буфер и скважины (верх — север)", zh: "剖面线 A–A′、缓冲区与钻孔（上方为北）" },
    "map.xlsxCaption": { mn: "Байрлалын зураг (дээд тал — хойд зүг)", en: "Location map (top — north)", ru: "Схема расположения (верх — север)", zh: "位置图（上方为北）" },

    "stamp.org":     { mn: "Байгууллага", en: "Organization", ru: "Организация", zh: "单位" },
    "stamp.project": { mn: "Төсөл", en: "Project", ru: "Проект", zh: "项目" },
    "stamp.title":   { mn: "Зургийн нэр", en: "Drawing title", ru: "Наименование", zh: "图名" },
    "stamp.scale":   { mn: "Масштаб", en: "Scale", ru: "Масштаб", zh: "比例尺" },
    "stamp.crs":     { mn: "Координат", en: "Coordinates", ru: "Координаты", zh: "坐标系" },
    "stamp.drawn":   { mn: "Зурсан", en: "Drawn by", ru: "Составил", zh: "绘图" },
    "stamp.checked": { mn: "Хянасан", en: "Checked by", ru: "Проверил", zh: "审核" },
    "stamp.sign":    { mn: "Гарын үсэг:", en: "Signature:", ru: "Подпись:", zh: "签名:" },
    "stamp.date":    { mn: "Огноо", en: "Date", ru: "Дата", zh: "日期" },
    "stamp.page":    { mn: "Хуудас {page}/{pages}", en: "Sheet {page}/{pages}", ru: "Лист {page}/{pages}", zh: "第 {page}/{pages} 页" },
    "stamp.dwg":     { mn: "Зураг №: {no}", en: "Dwg No.: {no}", ru: "Чертёж №: {no}", zh: "图号: {no}" },

    "sheet.project":     { mn: "Төсөл: ", en: "Project: ", ru: "Проект: ", zh: "项目: " },
    "sheet.length":      { mn: "Урт ", en: "Length ", ru: "Длина ", zh: "长度 " },
    "sheet.azimuth":     { mn: "Азимут ", en: "Azimuth ", ru: "Азимут ", zh: "方位角 " },
    "sheet.buffer":      { mn: "Буфер ", en: "Buffer ", ru: "Буфер ", zh: "缓冲 " },
    "sheet.scalePrefix": { mn: "Масштаб: ", en: "Scale: ", ru: "Масштаб: ", zh: "比例尺: " },
    "sheet.elevNote":    { mn: "Өндөр: далайн түвшнээс, м", en: "Elevation: m above sea level", ru: "Отметки: м над уровнем моря", zh: "标高: 海拔, 米" },

    "scale.h":  { mn: "Хэвтээ", en: "Horizontal", ru: "Горизонтальный", zh: "水平" },
    "scale.v":  { mn: "Босоо", en: "Vertical", ru: "Вертикальный", zh: "垂直" },
    "scale.ve": { mn: "өсгөлт", en: "VE", ru: "преувел.", zh: "夸张" },

    "info.dwg":     { mn: "Зургийн дугаар", en: "Drawing No.", ru: "Номер чертежа", zh: "图号" },
    "info.length":  { mn: "Зүсэлтийн урт", en: "Section length", ru: "Длина разреза", zh: "剖面长度" },
    "info.azimuth": { mn: "Чиглэл (азимут) A → A′", en: "Direction (azimuth) A → A′", ru: "Направление (азимут) A → A′", zh: "方向（方位角）A → A′" },
    "info.buffer":  { mn: "Буферийн өргөн", en: "Buffer width", ru: "Ширина буфера", zh: "缓冲宽度" },
    "info.aUtm":    { mn: "A цэг (UTM)", en: "Point A (UTM)", ru: "Точка A (UTM)", zh: "A点 (UTM)" },
    "info.aWgs":    { mn: "A цэг (WGS 84)", en: "Point A (WGS 84)", ru: "Точка A (WGS 84)", zh: "A点 (WGS 84)" },
    "info.bUtm":    { mn: "A′ цэг (UTM)", en: "Point A′ (UTM)", ru: "Точка A′ (UTM)", zh: "A′点 (UTM)" },
    "info.bWgs":    { mn: "A′ цэг (WGS 84)", en: "Point A′ (WGS 84)", ru: "Точка A′ (WGS 84)", zh: "A′点 (WGS 84)" },
    "info.crs":     { mn: "Координатын систем", en: "Coordinate system", ru: "Система координат", zh: "坐标系" },
    "info.scale":   { mn: "Масштаб (хуудсан дээр)", en: "Scale (on sheet)", ru: "Масштаб (на листе)", zh: "图面比例尺" },
    "info.holes":   { mn: "Цооногийн тоо", en: "Number of boreholes", ru: "Число скважин", zh: "钻孔数量" },
    "info.drilled": { mn: "Нийт өрөмдлөг", en: "Total drilled length", ru: "Суммарная проходка", zh: "累计进尺" },
    "info.elev":    { mn: "Газрын гадаргын өндөр", en: "Ground surface elevation", ru: "Отметки дневной поверхности", zh: "地表高程" },
    "info.source":  { mn: "Өгөгдлийн эх сурвалж", en: "Data source", ru: "Источник данных", zh: "数据来源" },
    "info.note":    { mn: "Тайлбар", en: "Remarks", ru: "Примечание", zh: "备注" },

    "elevSrc": { mn: "Esri World Elevation (Terrain3D), далайн түвшнээс", en: "Esri World Elevation (Terrain3D), above sea level", ru: "Esri World Elevation (Terrain3D), над уровнем моря", zh: "Esri World Elevation (Terrain3D), 海拔" },
    "dataSrc": { mn: "ArcGIS Online · Drillhole_Lithology_3D_TEST", en: "ArcGIS Online · Drillhole_Lithology_3D_TEST", ru: "ArcGIS Online · Drillhole_Lithology_3D_TEST", zh: "ArcGIS Online · Drillhole_Lithology_3D_TEST" },

    "h.info":    { mn: "Ерөнхий мэдээлэл", en: "General information", ru: "Общие сведения", zh: "基本信息" },
    "h.info.up": { mn: "ЕРӨНХИЙ МЭДЭЭЛЭЛ", en: "GENERAL INFORMATION", ru: "ОБЩИЕ СВЕДЕНИЯ", zh: "基本信息" },
    "h.holes":   { mn: "Цооногийн жагсаалт", en: "Borehole list", ru: "Ведомость скважин", zh: "钻孔一览" },
    "h.holes.up":{ mn: "ЦООНОГИЙН ЖАГСААЛТ", en: "BOREHOLE LIST", ru: "ВЕДОМОСТЬ СКВАЖИН", zh: "钻孔一览" },
    "h.lith":    { mn: "Литологийн нэгтгэл", en: "Lithology summary", ru: "Сводка по литологии", zh: "岩性汇总" },
    "h.lith.up": { mn: "ЛИТОЛОГИЙН НЭГТГЭЛ", en: "LITHOLOGY SUMMARY", ru: "СВОДКА ПО ЛИТОЛОГИИ", zh: "岩性汇总" },
    "h.iv":      { mn: "Интервалын дэлгэрэнгүй", en: "Interval log", ru: "Описание интервалов", zh: "分层明细" },
    "h.iv.up":   { mn: "ИНТЕРВАЛЫН ДЭЛГЭРЭНГҮЙ", en: "INTERVAL LOG", ru: "ОПИСАНИЕ ИНТЕРВАЛОВ", zh: "分层明细" },
    "h.map":     { mn: "Байрлалын зураг", en: "Location map", ru: "Схема расположения", zh: "位置图" },
    "h.sign":    { mn: "Гарын үсэг", en: "Signatures", ru: "Подписи", zh: "签字" },

    "col.item":       { mn: "Үзүүлэлт", en: "Item", ru: "Показатель", zh: "指标" },
    "col.value":      { mn: "Утга", en: "Value", ru: "Значение", zh: "值" },
    "col.no":         { mn: "№", en: "№", ru: "№", zh: "№" },
    "col.hole":       { mn: "Цооног", en: "Borehole", ru: "Скважина", zh: "钻孔" },
    "col.holeN":      { mn: "Цооног", en: "Boreholes", ru: "Скважин", zh: "钻孔数" },
    "col.x":          { mn: "X (UTM E), м", en: "X (UTM E), m", ru: "X (UTM E), м", zh: "X (UTM E), 米" },
    "col.y":          { mn: "Y (UTM N), м", en: "Y (UTM N), m", ru: "Y (UTM N), м", zh: "Y (UTM N), 米" },
    "col.lat":        { mn: "Өргөрөг, °", en: "Latitude, °", ru: "Широта, °", zh: "纬度, °" },
    "col.lon":        { mn: "Уртраг, °", en: "Longitude, °", ru: "Долгота, °", zh: "经度, °" },
    "col.collar":     { mn: "Амны өндөр, м", en: "Collar elev., m", ru: "Отм. устья, м", zh: "孔口标高, 米" },
    "col.depth":      { mn: "Гүн, м", en: "Depth, m", ru: "Глубина, м", zh: "孔深, 米" },
    "col.fromA":      { mn: "Зай A-аас, м", en: "From A, m", ru: "От A, м", zh: "距A, 米" },
    "col.offset":     { mn: "Шугамаас, м", en: "Offset, m", ru: "Смещение, м", zh: "偏距, 米" },
    "col.nIv":        { mn: "Интервал", en: "Intervals", ru: "Интервалы", zh: "分层数" },
    "col.code":       { mn: "Код", en: "Code", ru: "Код", zh: "代码" },
    "col.lith":       { mn: "Литологи", en: "Lithology", ru: "Литология", zh: "岩性" },
    "col.thickTotal": { mn: "Нийт зузаан, м", en: "Total thickness, m", ru: "Сумм. мощность, м", zh: "累计厚度, 米" },
    "col.thick":      { mn: "Зузаан, м", en: "Thickness, m", ru: "Мощность, м", zh: "厚度, 米" },
    "col.pct":        { mn: "Хувь, %", en: "Percent, %", ru: "Доля, %", zh: "比例, %" },
    "col.color":      { mn: "Өнгө", en: "Color", ru: "Цвет", zh: "颜色" },
    "col.from":       { mn: "Эхлэл", en: "From", ru: "От", zh: "自" },
    "col.fromM":      { mn: "Эхлэл, м", en: "From, m", ru: "От, м", zh: "自, 米" },
    "col.to":         { mn: "Төгсгөл", en: "To", ru: "До", zh: "至" },
    "col.toM":        { mn: "Төгсгөл, м", en: "To, m", ru: "До, м", zh: "至, 米" },
    "col.thk":        { mn: "Зузаан", en: "Thick.", ru: "Мощн.", zh: "厚度" },
    "col.topShort":   { mn: "Дээд өнд.", en: "Top elev.", ru: "Отм. кровли", zh: "顶标高" },
    "col.botShort":   { mn: "Доод өнд.", en: "Bot. elev.", ru: "Отм. подошвы", zh: "底标高" },
    "col.top":        { mn: "Дээд өндөр, м", en: "Top elev., m", ru: "Отм. кровли, м", zh: "顶板标高, 米" },
    "col.bot":        { mn: "Доод өндөр, м", en: "Bot. elev., m", ru: "Отм. подошвы, м", zh: "底板标高, 米" },
    "col.name":       { mn: "Нэр", en: "Name", ru: "ФИО", zh: "姓名" },
    "col.sign":       { mn: "Гарын үсэг", en: "Signature", ru: "Подпись", zh: "签名" },
    "col.point":      { mn: "Цэг", en: "Point", ru: "Точка", zh: "点" },

    "holes.one":  { mn: "цооног", en: "borehole",  ru: "скважина",  zh: "个钻孔" },
    "holes.few":  { mn: "цооног", en: "boreholes", ru: "скважины",  zh: "个钻孔" },
    "holes.many": { mn: "цооног", en: "boreholes", ru: "скважин",   zh: "个钻孔" },

    "docx.pagePrefix": { mn: "Хуудас ", en: "Sheet ", ru: "Лист ", zh: "第 " },
    "docx.pageSuffix": { mn: "", en: "", ru: "", zh: " 页" },
    "docx.desc":       { mn: "Цооногийн геологийн зүсэлт", en: "Borehole geological cross-section", ru: "Геологический разрез по скважинам", zh: "钻孔地质剖面" },

    "x.report":    { mn: "Тайлан", en: "Report", ru: "Отчёт", zh: "报告" },
    "x.holes":     { mn: "Цооногууд", en: "Boreholes", ru: "Скважины", zh: "钻孔" },
    "x.intervals": { mn: "Интервалууд", en: "Intervals", ru: "Интервалы", zh: "分层" },
    "x.lith":      { mn: "Литологи", en: "Lithology", ru: "Литология", zh: "岩性" },
    "x.ground":    { mn: "Газрын профиль", en: "Ground profile", ru: "Профиль рельефа", zh: "地形剖面" },
    "x.line":      { mn: "Шугам", en: "Section line", ru: "Линия разреза", zh: "剖面线" },
    "xlsx.sheetNote": { mn: "Зүсэлтийн хуудас (штамп, масштаб, байрлалын зурагтай)", en: "Section sheet (title block, scale and location map)", ru: "Лист разреза (штамп, масштаб и схема расположения)", zh: "剖面图页（图签、比例尺与位置图）" },

    "dxf.axes": { mn: "X=зай (м), Y=өндөр (м), 1:1", en: "X=distance (m), Y=elevation (m), 1:1", ru: "X=расстояние (м), Y=отметка (м), 1:1", zh: "X=距离 (米), Y=标高 (米), 1:1" },
    "dxf.az":   { mn: "Азимут", en: "Azimuth", ru: "Азимут", zh: "方位角" },

    "lith.other": { mn: "Бусад", en: "Other", ru: "Прочее", zh: "其他" }
  };

  /* mn = хүснэгтийн богино нэр (тайлангийн багана). full = зургийн тайлбар / нэгтгэл дэх бүтэн мөр. */
  const LITHN = {
    ST:   { mn: "Хөрс", full: "Хөрс / Soil", en: "Soil", ru: "Почва", zh: "土壤" },
    GV:   { mn: "Хайрга", full: "Хайрга / Gravel", en: "Gravel", ru: "Гравий", zh: "砾石" },
    SS:   { mn: "Элсэн чулуу", full: "Элсэн чулуу / Sandstone", en: "Sandstone", ru: "Песчаник", zh: "砂岩" },
    FSS:  { mn: "Нарийн ширхэгт элсэн чулуу", full: "Нарийн ширхэгт элсэн чулуу / Fine sandstone", en: "Fine sandstone", ru: "Мелкозернистый песчаник", zh: "细粒砂岩" },
    SILT: { mn: "Алевролит", full: "Алевролит / Siltstone", en: "Siltstone", ru: "Алевролит", zh: "粉砂岩" },
    MS:   { mn: "Аргиллит", full: "Аргиллит / Mudstone", en: "Mudstone", ru: "Аргиллит", zh: "泥岩" },
    SH:   { mn: "Занар", full: "Занар / Shale", en: "Shale", ru: "Сланец", zh: "页岩" },
    CO:   { mn: "Нүүрс", full: "Нүүрс / Coal", en: "Coal", ru: "Уголь", zh: "煤" },
    C1:   { mn: "Нүүрсний үе C1", full: "Нүүрсний үе C1 / Coal seam C1", en: "Coal seam C1", ru: "Угольный пласт C1", zh: "煤层 C1" },
    C3:   { mn: "Нүүрсний үе C3", full: "Нүүрсний үе C3 / Coal seam C3", en: "Coal seam C3", ru: "Угольный пласт C3", zh: "煤层 C3" },
    C6:   { mn: "Нүүрсний үе C6", full: "Нүүрсний үе C6 / Coal seam C6", en: "Coal seam C6", ru: "Угольный пласт C6", zh: "煤层 C6" },
    CAVE: { mn: "Нуралт", full: "Нуралт / Cave-in", en: "Cave-in", ru: "Обрушение", zh: "塌孔" },
    R:    { mn: "R (тодорхойгүй)", en: "R (unspecified)", ru: "R (не определено)", zh: "R（未定）" },
    CS:   { mn: "CS (тодорхойгүй)", en: "CS (unspecified)", ru: "CS (не определено)", zh: "CS（未定）" },
    RK:   { mn: "RK (тодорхойгүй)", en: "RK (unspecified)", ru: "RK (не определено)", zh: "RK（未定）" }
  };

  const COMPASS = {
    mn: ["Х", "ХЗү", "Зү", "ӨЗү", "Ө", "ӨБ", "Б", "ХБ"],
    en: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
    ru: ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"],
    zh: ["北", "东北", "东", "东南", "南", "西南", "西", "西北"]
  };

  function norm(lang) {
    const l = String(lang == null ? "mn" : lang).toLowerCase();
    return LANGS.indexOf(l) >= 0 ? l : "mn";
  }

  function t(lang, id, vars) {
    const row = STR[id];
    const l = norm(lang);
    let s = row && row[l] != null ? row[l] : (row && row.mn != null ? row.mn : id);
    if (vars) s = String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
    return s;
  }

  function lithName(lang, code, opts) {
    const c = code == null ? "" : String(code);
    const row = LITHN[c];
    const l = norm(lang);
    const full = !!(opts && opts.full);
    if (!row) {
      if (l === "mn") return "Бусад";
      return c || t(l, "lith.other");
    }
    if (l === "mn") return full && row.full ? row.full : row.mn;
    return row[l] || c;
  }

  function compass(lang) {
    return COMPASS[norm(lang)];
  }

  function ruCardinal(n, one, few, many) {
    const x = Math.abs(Math.trunc(Number(n) || 0));
    const n10 = x % 10, n100 = x % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 >= 20)) return few;
    return many;
  }

  function holesWord(lang, n) {
    const l = norm(lang);
    if (l === "en") return Math.abs(Number(n)) === 1 ? t(l, "holes.one") : t(l, "holes.many");
    if (l === "ru") return ruCardinal(n, t(l, "holes.one"), t(l, "holes.few"), t(l, "holes.many"));
    return t(l, "holes.many");
  }

  function allText(lang) {
    const l = norm(lang);
    const bits = [];
    Object.keys(STR).forEach((k) => { if (STR[k][l] != null) bits.push(String(STR[k][l])); });
    Object.keys(LITHN).forEach((c) => { if (LITHN[c][l]) bits.push(LITHN[c][l]); });
    (COMPASS[l] || []).forEach((x) => bits.push(x));
    return bits.join("\n");
  }

  root.ZREPORT = { LANGS, STR, LITH: LITHN, COMPASS, norm, t, lithName, compass, holesWord, allText, ruCardinal };
})(typeof window !== "undefined" ? window : globalThis);
