/* =====================================================================
   Цооногийн зүсэлт — үндсэн тооцоолол, зураглал, тайлангийн export
   (ArcGIS-ээс хамааралгүй; хөтөч болон Node дээр ажиллана)
   ===================================================================== */
(function (root) {
  "use strict";

  /* ---------------- Литологи ---------------- */
  const LITH = {
    ST:   ["#8c510a", "Хөрс / Soil"],
    GV:   ["#cd853f", "Хайрга / Gravel"],
    SS:   ["#f2b705", "Элсэн чулуу / Sandstone"],
    FSS:  ["#fde780", "Нарийн ширхэгт элсэн чулуу / Fine sandstone"],
    SILT: ["#a6c478", "Алевролит / Siltstone"],
    MS:   ["#7886a0", "Аргиллит / Mudstone"],
    SH:   ["#4d8060", "Занар / Shale"],
    CO:   ["#141414", "Нүүрс / Coal"],
    C1:   ["#800026", "Нүүрсний үе C1 / Coal seam C1"],
    C3:   ["#08306b", "Нүүрсний үе C3 / Coal seam C3"],
    C6:   ["#54278f", "Нүүрсний үе C6 / Coal seam C6"],
    CAVE: ["#b2ebf2", "Нуралт / Cave-in"],
    R:    ["#e64b35", "R (тодорхойгүй)"],
    CS:   ["#00a087", "CS (тодорхойгүй)"],
    RK:   ["#f080c8", "RK (тодорхойгүй)"]
  };
  const LITH_DEFAULT = ["#bebebe", "Бусад"];
  const lithInfo = (c) => LITH[c] || LITH_DEFAULT;
  const lithNameMn = (c) => lithInfo(c)[1].split(" / ")[0];
  const lithOrder = Object.keys(LITH);
  const lithRank = (c) => (lithOrder.indexOf(c) < 0 ? 999 : lithOrder.indexOf(c));
  const sortLith = (arr) => arr.sort((a, b) => lithRank(a) - lithRank(b) || String(a).localeCompare(String(b)));

  /* ---------------- Тогтмолууд ---------------- */
  const MM = 96 / 25.4;                       // px / мм (96 dpi)
  const PAPERS = { A4: { w: 297, h: 210 }, A3: { w: 420, h: 297 } };
  const STD_SCALES = [];
  [100, 1000, 10000, 100000].forEach((p) => [1, 1.5, 2, 2.5, 3, 4, 5, 7.5].forEach((m) => STD_SCALES.push(p * m)));
  STD_SCALES.push(1000000);
  const FONT = "'Segoe UI', Arial, sans-serif";
  const R_EARTH = 6378137;

  /* ---------------- Туслах функцууд ---------------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const fmt = (v, d = 1) => (v == null || !isFinite(v) ? "" : (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toLocaleString("en-US", { maximumFractionDigits: d }));
  const fmtSp = (v, d = 0) => (v == null || !isFinite(v) ? "" : Number(v).toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, " "));
  const scaleTxt = (n) => "1:" + fmtSp(n);
  const niceStep = (range, target) => {
    const raw = range / Math.max(1, target), p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  };
  const nice125Floor = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f >= 5 ? 5 : f >= 2 ? 2 : 1) * p; };
  const fitText = (str, maxW, px) => {
    str = String(str ?? "");
    const cw = px * 0.56;
    if (str.length * cw <= maxW) return str;
    const n = Math.max(1, Math.floor(maxW / cw) - 1);
    return str.slice(0, n) + "…";
  };
  const textOn = (hex) => {
    const h = hex.replace("#", ""), r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? "#000000" : "#ffffff";
  };
  const holeDepth = (h) => Math.max(0, ...h.intervals.map((i) => i.to));
  const distTxt = (m) => (m >= 1000 ? fmt(m / 1000, m >= 10000 ? 1 : 2) + " км" : fmt(m, 0) + " м");

  /* ---------------- Геометр ---------------- */
  const wmToLat = (y) => (Math.atan(Math.sinh(y / R_EARTH)) * 180) / Math.PI;
  const wmToLon = (x) => (x / R_EARTH) * 180 / Math.PI;
  const utmZone = (lon) => Math.min(60, Math.max(1, Math.floor((lon + 180) / 6) + 1));
  function toUTM(lat, lon, zone) {
    const a = 6378137, f = 1 / 298.257223563, e2 = f * (2 - f), ep2 = e2 / (1 - e2), k0 = 0.9996, e4 = e2 * e2, e6 = e4 * e2;
    zone = zone || utmZone(lon);
    const phi = (lat * Math.PI) / 180, lam = (lon * Math.PI) / 180, lam0 = (((zone - 1) * 6 - 180 + 3) * Math.PI) / 180;
    const sp = Math.sin(phi), cp = Math.cos(phi), tp = Math.tan(phi);
    const N = a / Math.sqrt(1 - e2 * sp * sp), T = tp * tp, C = ep2 * cp * cp, A = cp * (lam - lam0);
    const M = a * ((1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256) * phi - ((3 * e2) / 8 + (3 * e4) / 32 + (45 * e6) / 1024) * Math.sin(2 * phi)
      + ((15 * e4) / 256 + (45 * e6) / 1024) * Math.sin(4 * phi) - ((35 * e6) / 3072) * Math.sin(6 * phi));
    const E = k0 * N * (A + ((1 - T + C) * A ** 3) / 6 + ((5 - 18 * T + T * T + 72 * C - 58 * ep2) * A ** 5) / 120) + 500000;
    let Nn = k0 * (M + N * tp * ((A * A) / 2 + ((5 - T + 9 * C + 4 * C * C) * A ** 4) / 24 + ((61 - 58 * T + T * T + 600 * C - 330 * ep2) * A ** 6) / 720));
    if (lat < 0) Nn += 10000000;
    return { E, N: Nn, zone, hemi: lat >= 0 ? "N" : "S" };
  }
  const azimuthDeg = (x1, y1, x2, y2) => ((Math.atan2(x2 - x1, y2 - y1) * 180) / Math.PI + 360) % 360;
  const compass8 = (az) => ["Х", "ХЗү", "Зү", "ӨЗү", "Ө", "ӨБ", "Б", "ХБ"][Math.round(az / 45) % 8];

  function cumLengths(pts) {
    const c = [0];
    for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return c;
  }
  function samplePoints(pts, n) {
    const c = cumLengths(pts), total = c[c.length - 1], out = [];
    let seg = 1;
    for (let k = 0; k < n; k++) {
      const d = (total * k) / (n - 1);
      while (seg < pts.length - 1 && c[seg] < d) seg++;
      const a = pts[seg - 1], b = pts[seg], L = c[seg] - c[seg - 1] || 1, t = Math.min(1, Math.max(0, (d - c[seg - 1]) / L));
      out.push({ x: a[0] + t * (b[0] - a[0]), y: a[1] + t * (b[1] - a[1]), d });
    }
    return out;
  }
  function projectOnLine(pts, px, py) {
    const c = cumLengths(pts);
    let best = { along: 0, off: Infinity };
    for (let i = 1; i < pts.length; i++) {
      const ax = pts[i - 1][0], ay = pts[i - 1][1], bx = pts[i][0], by = pts[i][1];
      const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1;
      const t = Math.min(1, Math.max(0, ((px - ax) * vx + (py - ay) * vy) / L2));
      const qx = ax + t * vx, qy = ay + t * vy, off = Math.hypot(px - qx, py - qy);
      if (off < best.off) best = { along: c[i - 1] + t * Math.sqrt(L2), off };
    }
    return best;
  }
  const pickScale = (meters, availPx) => STD_SCALES.find((n) => (meters * 1000 * MM) / n <= availPx) || STD_SCALES[STD_SCALES.length - 1];

  /* =====================================================================
     Зүсэлтийн зураг (SVG)
     o.width / o.plotH  — дэлгэцэнд (өргөнд тааруулна)
     o.maxW / o.maxH    — хуудсанд (стандарт масштаб сонгоно)
     o.header / o.legend — гарчиг, тайлбар харуулах эсэх
     ===================================================================== */
  function renderSection(sec, o = {}) {
    const left = 72, right = 28, axisB = 46;
    const header = o.header !== false, showLegend = o.legend !== false;
    const holes = sec.holes.slice().sort((a, b) => a.along - b.along);

    let zMin = Infinity, zMax = -Infinity;
    sec.ground.forEach((g) => { if (g.z != null && isFinite(g.z)) { zMin = Math.min(zMin, g.z); zMax = Math.max(zMax, g.z); } });
    holes.forEach((h) => { zMax = Math.max(zMax, h.collarZ); zMin = Math.min(zMin, h.collarZ - holeDepth(h)); });
    if (!isFinite(zMin)) { zMin = 0; zMax = 100; }
    const padZ = Math.max(5, (zMax - zMin) * 0.06);
    zMin -= padZ; zMax += padZ;
    const yStep = niceStep(zMax - zMin, 7);
    zMin = Math.floor(zMin / yStep) * yStep; zMax = Math.ceil(zMax / yStep) * yStep;
    const zR = zMax - zMin;

    const labelW = (id) => Math.max(56, String(id).length * 7.6 + 18);
    const rowsFor = (plotW) => {
      const MAX_ROWS = 6, rr = [];
      const rows = holes.map((h) => {
        const x = left + (h.along / sec.lengthM) * plotW, w = labelW(h.id);
        let r = 0;
        while (r < MAX_ROWS && rr[r] != null && x - w / 2 < rr[r] + 4) r++;
        if (r === MAX_ROWS) r = rr.indexOf(Math.min(...rr));
        rr[r] = x + w / 2;
        return r;
      });
      return { rows, n: Math.max(1, rr.length) };
    };
    const topFor = (n) => (header ? 30 : 6) + n * 28 + 14;

    let W, plotW, plotH, Nh = null, Nv = null, lr;
    let fallback = false;
    const fits = (n, meters, avail) => n && (meters * 1000 * MM) / n <= avail;
    if (o.maxW) {
      Nh = pickScale(sec.lengthM, o.maxW - left - right);
      if (o.fixNh) { if (fits(o.fixNh, sec.lengthM, o.maxW - left - right)) Nh = o.fixNh; else fallback = true; }
      plotW = (sec.lengthM * 1000 * MM) / Nh;
      lr = rowsFor(plotW);
      if (o.maxH) {
        if (o.fixNv && fits(o.fixNv, zR, o.maxH - topFor(lr.n) - axisB)) Nv = o.fixNv;
        else {
          if (o.fixNv) fallback = true;
          for (let it = 0; it < 4; it++) {
            Nv = pickScale(zR, o.maxH - topFor(lr.n) - axisB);
            if (Nv > Nh && !o.fixNh) { Nh = Nv; plotW = (sec.lengthM * 1000 * MM) / Nh; lr = rowsFor(plotW); } else break;
          }
          if (Nv > Nh && !o.fixNh) { Nh = Nv; plotW = (sec.lengthM * 1000 * MM) / Nh; lr = rowsFor(plotW); }
        }
        plotH = (zR * 1000 * MM) / Nv;
      } else plotH = o.plotH || 420;
      W = left + plotW + right;
    } else {
      W = Math.max(720, Math.round(o.width || 1100));
      plotW = W - left - right;
      lr = rowsFor(plotW);
      plotH = Math.max(260, Math.round(o.plotH || 420));
    }
    const top = topFor(lr.n), bottom = top + plotH;
    const xOf = (d) => left + (d / sec.lengthM) * plotW;
    const yOf = (z) => top + ((zMax - z) / zR) * plotH;
    const ve = plotH / zR / (plotW / sec.lengthM);

    const used = [];
    holes.forEach((h) => h.intervals.forEach((i) => { if (!used.includes(i.lith)) used.push(i.lith); }));
    sortLith(used);
    const legendLabel = (c) => `${c} — ${lithInfo(c)[1]}`;
    const legendItemW = Math.max(190, Math.max(0, ...used.map((c) => legendLabel(c).length)) * 6.9 + 36);
    const legendCols = Math.max(1, Math.floor((W - left - right) / legendItemW));
    const legendRows = Math.ceil(used.length / legendCols);
    const legendTop = bottom + 58;
    const H = showLegend && used.length ? legendTop + 24 + legendRows * 24 + 16 : bottom + axisB;

    const s = [];
    s.push(`<rect x="0" y="0" width="${W.toFixed(1)}" height="${H.toFixed(1)}" fill="#ffffff"/>`);
    if (header) {
      const veTxt = ve >= 1.05 ? ` · босоо өсгөлт ×${fmt(ve, ve < 10 ? 1 : 0)}` : "";
      s.push(`<text x="${left}" y="22" font-size="16" font-weight="700" fill="#1f2d3d">${esc(sec.title)}</text>`);
      s.push(`<text x="${W - right}" y="22" font-size="12" fill="#556373" text-anchor="end">${esc((sec.subtitle || "") + veTxt)}</text>`);
    }
    for (let z = zMin; z <= zMax + 1e-6; z += yStep) {
      const y = yOf(z);
      s.push(`<line x1="${left}" y1="${y.toFixed(1)}" x2="${(left + plotW).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e3e7ec" stroke-width="0.8"/>`);
      s.push(`<text x="${left - 8}" y="${(y + 4).toFixed(1)}" font-size="12" fill="#3d4b5c" text-anchor="end">${fmt(z, 0)}</text>`);
    }
    const xStep = niceStep(sec.lengthM, Math.max(4, Math.round(plotW / 130)));
    for (let d = 0; d <= sec.lengthM + 1e-6; d += xStep) {
      const x = xOf(d);
      s.push(`<line x1="${x.toFixed(1)}" y1="${bottom}" x2="${x.toFixed(1)}" y2="${bottom + 5}" stroke="#6b7785"/>`);
      const lab = sec.lengthM >= 2000 ? fmt(d / 1000, 2) + " км" : fmt(d, 0) + " м";
      s.push(`<text x="${x.toFixed(1)}" y="${bottom + 20}" font-size="12" fill="#3d4b5c" text-anchor="middle">${lab}</text>`);
    }
    s.push(`<text x="18" y="${(top + plotH / 2).toFixed(1)}" font-size="12" fill="#3d4b5c" text-anchor="middle" transform="rotate(-90 18 ${(top + plotH / 2).toFixed(1)})">Өндөр, м</text>`);
    s.push(`<text x="${(left + plotW / 2).toFixed(1)}" y="${bottom + 40}" font-size="12" fill="#3d4b5c" text-anchor="middle">Шугамын дагуух зай</text>`);

    const gp = sec.ground.filter((g) => g.z != null && isFinite(g.z)).map((g) => `${xOf(g.d).toFixed(1)},${yOf(g.z).toFixed(1)}`);
    if (gp.length > 1) {
      s.push(`<polygon points="${gp.join(" ")} ${xOf(sec.lengthM).toFixed(1)},${bottom.toFixed(1)} ${left},${bottom.toFixed(1)}" fill="#f4e7dc" fill-opacity="0.85"/>`);
      s.push(`<polyline points="${gp.join(" ")}" fill="none" stroke="#b54900" stroke-width="2.2"/>`);
    }
    s.push(`<rect x="${left}" y="${top}" width="${plotW.toFixed(1)}" height="${plotH.toFixed(1)}" fill="none" stroke="#6b7785" stroke-width="0.9"/>`);
    s.push(`<text x="${left}" y="${top - 6}" font-size="15" font-weight="700" fill="#08536a" text-anchor="middle">A</text>`);
    s.push(`<text x="${(left + plotW).toFixed(1)}" y="${top - 6}" font-size="15" font-weight="700" fill="#08536a" text-anchor="middle">A′</text>`);

    const colW = Math.max(8, Math.min(18, (plotW / Math.max(holes.length, 1)) * 0.45));
    const labelTop = header ? 30 : 6;
    holes.forEach((h, hi) => {
      const x = xOf(h.along), x0 = x - colW / 2;
      const ivs = h.intervals.slice().sort((a, b) => a.from - b.from);
      ivs.forEach((iv) => {
        const yA = yOf(h.collarZ - iv.from), yB = yOf(h.collarZ - iv.to), [col, name] = lithInfo(iv.lith);
        const tip = `${h.id}|${iv.lith}|${name}|${fmt(iv.from)}–${fmt(iv.to)} м|${fmt(h.collarZ - iv.from)}–${fmt(h.collarZ - iv.to)} м|${iv.comment || ""}`;
        s.push(`<rect class="iv" data-tip="${esc(tip)}" x="${x0.toFixed(1)}" y="${yA.toFixed(1)}" width="${colW.toFixed(1)}" height="${Math.max(0.6, yB - yA).toFixed(1)}" fill="${col}"/>`);
      });
      const td = holeDepth(h), yTop = yOf(h.collarZ), yBot = yOf(h.collarZ - td);
      s.push(`<rect x="${x0.toFixed(1)}" y="${yTop.toFixed(1)}" width="${colW.toFixed(1)}" height="${(yBot - yTop).toFixed(1)}" fill="none" stroke="#1f2d3d" stroke-width="0.8" pointer-events="none"/>`);
      s.push(`<polygon points="${(x - 7).toFixed(1)},${(yTop - 13).toFixed(1)} ${(x + 7).toFixed(1)},${(yTop - 13).toFixed(1)} ${x.toFixed(1)},${(yTop - 1).toFixed(1)}" fill="#111111"/>`);
      const ly = labelTop + lr.rows[hi] * 28, lw = labelW(h.id);
      s.push(`<line x1="${x.toFixed(1)}" y1="${ly + 22}" x2="${x.toFixed(1)}" y2="${(yTop - 14).toFixed(1)}" stroke="#9aa6b2" stroke-dasharray="2 3"/>`);
      s.push(`<rect x="${(x - lw / 2).toFixed(1)}" y="${ly}" width="${lw.toFixed(1)}" height="22" rx="11" fill="#0f2236"/>`);
      s.push(`<text x="${x.toFixed(1)}" y="${ly + 15.5}" font-size="12.5" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(h.id)}</text>`);
      s.push(`<text x="${x.toFixed(1)}" y="${(yBot + 15).toFixed(1)}" font-size="11.5" fill="#3d4b5c" text-anchor="middle">${fmt(td, 1)} м</text>`);
    });

    if (showLegend && used.length) {
      s.push(`<text x="${left}" y="${legendTop}" font-size="12" font-weight="700" fill="#556373" letter-spacing="0.06em">ЛИТОЛОГИ</text>`);
      const colWpx = (W - left - right) / legendCols;
      used.forEach((c, i) => {
        const cx = left + (i % legendCols) * colWpx, cy = legendTop + 14 + Math.floor(i / legendCols) * 24;
        s.push(`<rect x="${cx.toFixed(1)}" y="${cy}" width="15" height="15" rx="3" fill="${lithInfo(c)[0]}" stroke="#9aa6b2" stroke-width="0.6"/>`);
        s.push(`<text x="${(cx + 22).toFixed(1)}" y="${cy + 12}" font-size="12.5" fill="#1f2d3d">${esc(legendLabel(c))}</text>`);
      });
    }
    const body = `<g font-family="${FONT}">${s.join("")}</g>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" width="${W.toFixed(1)}" height="${H.toFixed(1)}" role="img" aria-label="${esc(sec.title)}">${body}</svg>`;
    return { svg, body, W, H, Nh, Nv, ve, zMin, zMax, yStep, used, fallback };
  }
  const renderSectionSVG = (sec, widthPx, plotHpx) => renderSection(sec, { width: widthPx, plotH: plotHpx }).svg;

  /* =====================================================================
     Тайлангийн мэдээлэл
     ===================================================================== */
  function lithSummary(sec) {
    const m = {};
    let total = 0;
    sec.holes.forEach((h) => h.intervals.forEach((iv) => {
      const t = Math.max(0, iv.to - iv.from);
      const r = m[iv.lith] || (m[iv.lith] = { code: iv.lith, n: 0, m: 0, holes: new Set() });
      r.n++; r.m += t; r.holes.add(h.id); total += t;
    }));
    return sortLith(Object.keys(m)).map((c) => ({ ...m[c], holes: m[c].holes.size, pct: total ? (m[c].m / total) * 100 : 0, total }));
  }

  /** Тайлангийн бүх хүснэгтийн мөрүүд (PDF/Word/Excel-д ижилхэн ашиглана) */
  function reportTables(sec, meta) {
    const holes = sec.holes.slice().sort((a, b) => a.along - b.along);
    const info = [
      ["Байгууллага", meta.org],
      ["Төсөл", meta.project],
      ["Зургийн нэр", meta.title],
      ["Зургийн дугаар", meta.drawingNo],
      ["Зурсан", meta.drawnBy],
      ["Хянасан", meta.checkedBy],
      ["Огноо", meta.date],
      ["Зүсэлтийн урт", distTxt(sec.lengthM) + ` (${fmt(sec.lengthM, 1)} м)`],
      ["Чиглэл (азимут) A → A′", `${fmt(sec.azimuth, 1)}° (${compass8(sec.azimuth)})`],
      ["Буферийн өргөн", `±${sec.bufM} м`],
      ["A цэг (UTM)", `X = ${fmtSp(sec.A.E, 1)}, Y = ${fmtSp(sec.A.N, 1)}`],
      ["A цэг (WGS 84)", `${fmt(sec.A.lat, 6)}°, ${fmt(sec.A.lon, 6)}°`],
      ["A′ цэг (UTM)", `X = ${fmtSp(sec.B.E, 1)}, Y = ${fmtSp(sec.B.N, 1)}`],
      ["A′ цэг (WGS 84)", `${fmt(sec.B.lat, 6)}°, ${fmt(sec.B.lon, 6)}°`],
      ["Координатын систем", meta.crs],
      ["Масштаб (хуудсан дээр)", meta.scaleText || "—"],
      ["Цооногийн тоо", String(holes.length)],
      ["Нийт өрөмдлөг", fmt(holes.reduce((a, h) => a + holeDepth(h), 0), 1) + " м"],
      ["Газрын гадаргын өндөр", meta.elevSrc],
      ["Өгөгдлийн эх сурвалж", meta.dataSrc]
    ];
    if (meta.note) info.push(["Тайлбар", meta.note]);
    const holeRows = holes.map((h, i) => [i + 1, h.id, h.E, h.N, h.lat, h.lon, h.collarZ, holeDepth(h), h.along, h.off, h.intervals.length]);
    const lith = lithSummary(sec);
    const ivRows = [];
    holes.forEach((h) => h.intervals.slice().sort((a, b) => a.from - b.from).forEach((iv) =>
      ivRows.push([h.id, iv.from, iv.to, iv.to - iv.from, h.collarZ - iv.from, h.collarZ - iv.to, iv.lith, lithNameMn(iv.lith), iv.comment || ""])));
    return { info, holeRows, lith, ivRows, holes };
  }

  /* =====================================================================
     Хуудасны зураг (штамп, луужин, масштабтай) — SVG
     ===================================================================== */
  const T = (x, y, str, o = {}) =>
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.size || 11}"${o.weight ? ` font-weight="${o.weight}"` : ""}${o.anchor ? ` text-anchor="${o.anchor}"` : ""} fill="${o.fill || "#111"}"${o.ls ? ` letter-spacing="${o.ls}"` : ""}>${esc(o.maxW ? fitText(str, o.maxW, o.size || 11) : str)}</text>`;
  const Ln = (x1, y1, x2, y2, w = 0.8, c = "#000") => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${w}"/>`;
  const svgOpen = (W, H) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" width="${(W / MM).toFixed(1)}mm" height="${(H / MM).toFixed(1)}mm">`;

  function frame(W, H) {
    const fx = 20 * MM, fy = 5 * MM, fw = W - 25 * MM, fh = H - 10 * MM;
    return { fx, fy, fw, fh, svg: `<rect x="0" y="0" width="${W.toFixed(1)}" height="${H.toFixed(1)}" fill="#ffffff"/><rect x="${fx.toFixed(1)}" y="${fy.toFixed(1)}" width="${fw.toFixed(1)}" height="${fh.toFixed(1)}" fill="none" stroke="#000" stroke-width="1.8"/>` };
  }

  function northArrow(cx, cy, r) {
    return `<g>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" fill-opacity="0.92" stroke="#111" stroke-width="0.8"/>
      <polygon points="${cx},${cy - r * 0.78} ${cx + r * 0.32},${cy + r * 0.45} ${cx},${cy + r * 0.2}" fill="#111"/>
      <polygon points="${cx},${cy - r * 0.78} ${cx - r * 0.32},${cy + r * 0.45} ${cx},${cy + r * 0.2}" fill="#ffffff" stroke="#111" stroke-width="0.8"/>
      <text x="${cx}" y="${cy - r - 3}" font-size="${(r * 0.75).toFixed(1)}" font-weight="700" text-anchor="middle" fill="#111" stroke="#fff" stroke-width="3" paint-order="stroke">N</text>
    </g>`;
  }

  function scaleBar(x, y, metersPerPx, maxPx) {
    const L = nice125Floor(metersPerPx * maxPx), px = L / metersPerPx, h = 5;
    const lab = (v) => (L >= 1000 ? fmt(v / 1000, v / 1000 < 1 ? 2 : 1) + (v === L ? " км" : "") : fmt(v, 0) + (v === L ? " м" : ""));
    const s = [`<rect x="${(x - 5).toFixed(1)}" y="${(y - 15).toFixed(1)}" width="${(px + 26).toFixed(1)}" height="${(h + 22).toFixed(1)}" fill="#ffffff" fill-opacity="0.9" rx="2"/>`];
    for (let i = 0; i < 4; i++) s.push(`<rect x="${(x + (px / 4) * i).toFixed(1)}" y="${y}" width="${(px / 4).toFixed(1)}" height="${h}" fill="${i % 2 ? "#ffffff" : "#111"}" stroke="#111" stroke-width="0.6"/>`);
    [0, 0.5, 1].forEach((f) => s.push(T(x + px * f, y - 4, lab(L * f), { size: 8.5, anchor: "middle" })));
    return s.join("");
  }

  function stamp(x, y, w, h, meta, page, pages, logo) {
    const rows = 9, rh = h / rows, lw = 27 * MM, vx = x + lw, vw = w - lw;
    const fs = Math.min(11.5, rh * 0.42), small = Math.min(9.5, rh * 0.36);
    const s = [`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#ffffff" stroke="#000" stroke-width="1.6"/>`];
    for (let i = 1; i < rows; i++) if (i !== 3) s.push(Ln(x, y + rh * i, x + w, y + rh * i, i === 2 || i === 4 ? 1.2 : 0.7));
    s.push(Ln(vx, y, vx, y + h, 0.9));
    const ty = (i, k = 1) => y + rh * i + (rh * k) / 2 + fs * 0.36;
    const lab = (i, str, k = 1) => s.push(T(x + 2 * MM, ty(i, k), str, { size: small, fill: "#333", maxW: lw - 3 * MM }));
    const val = (i, str, o = {}) => s.push(T(o.x || vx + 2 * MM, ty(i, o.k || 1), str, { size: o.size || fs, weight: o.weight, maxW: o.maxW || vw - 4 * MM }));

    lab(0, "Байгууллага");
    let orgMax = vw - 4 * MM;
    if (logo) {
      const lh = rh * 0.72, lwid = (lh * logo.w) / logo.h;
      s.push(`<image xlink:href="${logo.dataUrl}" href="${logo.dataUrl}" x="${(x + w - lwid - 2 * MM).toFixed(1)}" y="${(y + (rh - lh) / 2).toFixed(1)}" width="${lwid.toFixed(1)}" height="${lh.toFixed(1)}"/>`);
      orgMax -= lwid + 2 * MM;
    }
    val(0, meta.org, { weight: 700, maxW: orgMax });
    lab(1, "Төсөл"); val(1, meta.project);
    lab(2, "Зургийн нэр", 2); val(2, meta.title, { k: 2, size: Math.min(15, rh * 0.55), weight: 700 });
    lab(4, "Масштаб"); val(4, meta.scaleText);
    lab(5, "Координат"); val(5, meta.crs);
    const c1 = vx + vw * 0.52;
    [6, 7].forEach((i) => {
      lab(i, i === 6 ? "Зурсан" : "Хянасан");
      val(i, i === 6 ? meta.drawnBy : meta.checkedBy, { maxW: vw * 0.52 - 4 * MM });
      s.push(Ln(c1, y + rh * i, c1, y + rh * (i + 1), 0.7));
      s.push(T(c1 + 1.5 * MM, ty(i), "Гарын үсэг:", { size: small, fill: "#333" }));
    });
    lab(8, "Огноо");
    const d1 = vx + vw * 0.3, d2 = vx + vw * 0.55;
    val(8, meta.date, { maxW: vw * 0.3 - 3 * MM });
    s.push(Ln(d1, y + rh * 8, d1, y + h, 0.7), Ln(d2, y + rh * 8, d2, y + h, 0.7));
    s.push(T(d1 + 1.5 * MM, ty(8), `Хуудас ${page}/${pages}`, { size: fs }));
    s.push(T(d2 + 1.5 * MM, ty(8), "Зураг №: " + (meta.drawingNo || "—"), { size: fs, maxW: vw * 0.45 - 3 * MM }));
    return s.join("");
  }

  function miniStamp(x, y, w, h, meta, page, pages) {
    const rh = h / 2, s = [`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#fff" stroke="#000" stroke-width="1.4"/>`];
    s.push(Ln(x, y + rh, x + w, y + rh, 0.7), Ln(x + w * 0.42, y, x + w * 0.42, y + h, 0.7), Ln(x + w * 0.72, y + rh, x + w * 0.72, y + h, 0.7));
    s.push(T(x + 2 * MM, y + rh * 0.68, meta.org, { size: 10.5, weight: 700, maxW: w * 0.42 - 4 * MM }));
    s.push(T(x + w * 0.42 + 2 * MM, y + rh * 0.68, meta.title, { size: 10.5, weight: 700, maxW: w * 0.58 - 4 * MM }));
    s.push(T(x + 2 * MM, y + rh * 1.68, meta.project, { size: 9.5, maxW: w * 0.42 - 4 * MM }));
    s.push(T(x + w * 0.42 + 2 * MM, y + rh * 1.68, meta.date + (meta.drawingNo ? " · №" + meta.drawingNo : ""), { size: 9.5, maxW: w * 0.3 - 4 * MM }));
    s.push(T(x + w * 0.72 + 2 * MM, y + rh * 1.68, `Хуудас ${page}/${pages}`, { size: 9.5 }));
    return s.join("");
  }

  /** 1-р хуудас: зүсэлт + байрлалын зураг + тайлбар + штамп */
  function sheetPage(sec, meta, mapShot, logo, paperKey, page, pages) {
    const P = PAPERS[paperKey], W = P.w * MM, H = P.h * MM, A3 = paperKey === "A3";
    const F = frame(W, H), { fx, fy, fw, fh } = F;
    const titleH = (A3 ? 15 : 13) * MM, bandH = (A3 ? 84 : 64) * MM;
    const stampW = (A3 ? 185 : 128) * MM, mapW = (A3 ? 118 : 80) * MM;
    const s = [svgOpen(W, H), `<g font-family="${FONT}">`, F.svg];

    // --- Зүсэлт
    const secBox = { x: fx + 2 * MM, y: fy + titleH + 1 * MM, w: fw - 4 * MM, h: fh - titleH - bandH - 2 * MM };
    const r = renderSection(sec, { maxW: secBox.w, maxH: secBox.h, header: false, legend: false, fixNh: meta.fixNh, fixNv: meta.fixNv });
    meta.scaleFallback = r.fallback;
    meta.scaleText = `Хэвтээ ${scaleTxt(r.Nh)} · Босоо ${scaleTxt(r.Nv)}` + (r.Nh !== r.Nv ? ` (өсгөлт ×${fmt(r.Nh / r.Nv, 1)})` : "");
    const sx = secBox.x + Math.max(0, (secBox.w - r.W) / 2);
    s.push(`<g transform="translate(${sx.toFixed(1)},${secBox.y.toFixed(1)})">${r.body}</g>`);

    // --- Гарчиг
    s.push(T(fx + 4 * MM, fy + 7.2 * MM, String(meta.title || "").toUpperCase(), { size: A3 ? 21 : 18, weight: 800, fill: "#0f2236", maxW: fw * 0.55 }));
    s.push(T(fx + 4 * MM, fy + (A3 ? 12.2 : 11) * MM,
      `Төсөл: ${meta.project} · Урт ${distTxt(sec.lengthM)} · Азимут ${fmt(sec.azimuth, 0)}° (${compass8(sec.azimuth)}) · Буфер ±${sec.bufM} м · ${sec.holes.length} цооног`,
      { size: A3 ? 12 : 10.5, fill: "#333", maxW: fw * 0.58 }));
    s.push(T(fx + fw - 4 * MM, fy + 7.2 * MM, "Масштаб: " + meta.scaleText, { size: A3 ? 13 : 11, weight: 700, anchor: "end" }));
    s.push(T(fx + fw - 4 * MM, fy + (A3 ? 12.2 : 11) * MM, meta.crs + " · Өндөр: далайн түвшнээс, м", { size: A3 ? 11 : 9.5, anchor: "end", fill: "#333" }));
    s.push(Ln(fx, fy + titleH, fx + fw, fy + titleH, 1.2));

    // --- Доод хэсэг
    const by = fy + fh - bandH;
    s.push(Ln(fx, by, fx + fw, by, 1.6));

    // Байрлалын зураг
    const capH = 6.5 * MM, img = { x: fx + 1.5 * MM, y: by + capH, w: mapW - 3 * MM, h: bandH - capH - 1.5 * MM };
    s.push(Ln(fx + mapW, by, fx + mapW, fy + fh, 1.2));
    s.push(T(fx + 2 * MM, by + 4.6 * MM, "БАЙРЛАЛЫН ЗУРАГ", { size: 10.5, weight: 700, ls: "0.04em" }));
    if (mapShot) {
      const mPerPxOut = (mapShot.metersPerPx * mapShot.wPx) / img.w;          // м / хуудасны px
      const mapScale = mPerPxOut * MM * 1000;
      const ms = mapScale > 2000 ? Math.round(mapScale / 100) * 100 : Math.round(mapScale / 10) * 10;
      s.push(T(fx + mapW - 2 * MM, by + 4.6 * MM, "≈ " + scaleTxt(ms), { size: 10, anchor: "end" }));
      s.push(`<clipPath id="mapclip"><rect x="${img.x.toFixed(1)}" y="${img.y.toFixed(1)}" width="${img.w.toFixed(1)}" height="${img.h.toFixed(1)}"/></clipPath>`);
      s.push(`<image xlink:href="${mapShot.dataUrl}" href="${mapShot.dataUrl}" x="${img.x.toFixed(1)}" y="${img.y.toFixed(1)}" width="${img.w.toFixed(1)}" height="${img.h.toFixed(1)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#mapclip)"/>`);
      s.push(`<rect x="${img.x.toFixed(1)}" y="${img.y.toFixed(1)}" width="${img.w.toFixed(1)}" height="${img.h.toFixed(1)}" fill="none" stroke="#111" stroke-width="0.8"/>`);
      const nr = (A3 ? 7.5 : 6) * MM;
      s.push(northArrow(img.x + img.w - nr - 2 * MM, img.y + nr + 5 * MM, nr));
      s.push(scaleBar(img.x + 4 * MM, img.y + img.h - 5 * MM, mPerPxOut, img.w * 0.38));
    } else {
      s.push(`<rect x="${img.x.toFixed(1)}" y="${img.y.toFixed(1)}" width="${img.w.toFixed(1)}" height="${img.h.toFixed(1)}" fill="#f3f5f8" stroke="#999"/>`);
      s.push(T(img.x + img.w / 2, img.y + img.h / 2, "Газрын зураг байхгүй", { size: 11, anchor: "middle", fill: "#666" }));
    }

    // Тайлбар (литологи + тэмдэг)
    const lx = fx + mapW, lw = fw - mapW - stampW, ly = by;
    s.push(T(lx + 3 * MM, ly + 4.6 * MM, "ТАЙЛБАР", { size: 10.5, weight: 700, ls: "0.04em" }));
    const itemH = (A3 ? 5.6 : 4.1) * MM, fsz = A3 ? 10.5 : 8.6, symH = itemH * 3 + 2 * MM;
    const avail = bandH - capH - symH - 2 * MM, perCol = Math.max(1, Math.floor(avail / itemH));
    const cols = Math.max(1, Math.ceil(r.used.length / perCol)), colW = (lw - 4 * MM) / cols;
    r.used.forEach((c, i) => {
      const cx = lx + 3 * MM + Math.floor(i / perCol) * colW, cy = ly + capH + (i % perCol) * itemH;
      s.push(`<rect x="${cx.toFixed(1)}" y="${(cy + 0.6 * MM).toFixed(1)}" width="${(7 * MM).toFixed(1)}" height="${(itemH - 1.6 * MM).toFixed(1)}" fill="${lithInfo(c)[0]}" stroke="#333" stroke-width="0.5"/>`);
      s.push(T(cx + 8.5 * MM, cy + itemH * 0.62, `${c} — ${lithNameMn(c)}`, { size: fsz, maxW: colW - 10 * MM }));
    });
    const sy0 = by + bandH - symH;
    s.push(Ln(lx, sy0, lx + lw, sy0, 0.6, "#999"));
    const sx0 = lx + 3 * MM;
    s.push(`<line x1="${sx0.toFixed(1)}" y1="${(sy0 + itemH * 0.55).toFixed(1)}" x2="${(sx0 + 7 * MM).toFixed(1)}" y2="${(sy0 + itemH * 0.55).toFixed(1)}" stroke="#b54900" stroke-width="2.2"/>`);
    s.push(T(sx0 + 8.5 * MM, sy0 + itemH * 0.72, "Газрын гадарга", { size: fsz }));
    const ty2 = sy0 + itemH * 1.55;
    s.push(`<polygon points="${(sx0 + 2 * MM).toFixed(1)},${(ty2 - 1.4 * MM).toFixed(1)} ${(sx0 + 5 * MM).toFixed(1)},${(ty2 - 1.4 * MM).toFixed(1)} ${(sx0 + 3.5 * MM).toFixed(1)},${(ty2 + 1.2 * MM).toFixed(1)}" fill="#111"/>`);
    s.push(T(sx0 + 8.5 * MM, sy0 + itemH * 1.72, "Цооногийн ам · доор нь нийт гүн", { size: fsz, maxW: lw - 12 * MM }));
    const py = sy0 + itemH * 2.15;
    s.push(`<rect x="${sx0.toFixed(1)}" y="${py.toFixed(1)}" width="${(7 * MM).toFixed(1)}" height="${(itemH * 0.7).toFixed(1)}" rx="${(itemH * 0.35).toFixed(1)}" fill="#0f2236"/>`);
    s.push(T(sx0 + 8.5 * MM, sy0 + itemH * 2.72, "Цооногийн дугаар", { size: fsz }));

    // Штамп
    s.push(Ln(fx + fw - stampW, by, fx + fw - stampW, fy + fh, 1.6));
    s.push(stamp(fx + fw - stampW, by, stampW, bandH, meta, page, pages, logo));

    s.push("</g></svg>");
    return { svg: s.join(""), W, H, Nh: r.Nh, Nv: r.Nv };
  }

  /** Хүснэгтэн хуудсууд: ерөнхий мэдээлэл, цооног, литологи, интервал */
  function tablePages(sec, meta, paperKey, firstPage) {
    const P = PAPERS[paperKey], W = P.w * MM, H = P.h * MM, A3 = paperKey === "A3";
    const t = reportTables(sec, meta);
    const fs = A3 ? 11 : 9.6, rowH = (A3 ? 6.2 : 5.1) * MM, headH = rowH * 1.15;
    const F0 = frame(W, H);
    const cx = F0.fx + 5 * MM, cw = F0.fw - 10 * MM, cTop = F0.fy + 7 * MM, stampH = 15 * MM, cBottom = F0.fy + F0.fh - stampH - 5 * MM;

    const N = (v, d) => ({ v: fmt(v, d), a: "end" });
    const blocks = [
      { h: "1. ЕРӨНХИЙ МЭДЭЭЛЭЛ" },
      { cols: [{ t: "Үзүүлэлт", w: 0.32 }, { t: "Утга", w: 0.68 }], rows: t.info.map((r) => [{ v: r[0], b: true }, r[1] ?? ""]) },
      { h: "2. ЦООНОГИЙН ЖАГСААЛТ" },
      {
        cols: [{ t: "№", w: 0.04, a: "end" }, { t: "Цооног", w: 0.13 }, { t: "X (UTM E), м", w: 0.11, a: "end" }, { t: "Y (UTM N), м", w: 0.12, a: "end" },
          { t: "Өргөрөг, °", w: 0.1, a: "end" }, { t: "Уртраг, °", w: 0.1, a: "end" }, { t: "Амны өндөр, м", w: 0.1, a: "end" }, { t: "Гүн, м", w: 0.07, a: "end" },
          { t: "Зай A-аас, м", w: 0.09, a: "end" }, { t: "Шугамаас, м", w: 0.08, a: "end" }, { t: "Интервал", w: 0.06, a: "end" }],
        rows: t.holeRows.map((r) => [{ v: r[0], a: "end" }, { v: r[1], b: true }, { v: fmtSp(r[2], 1), a: "end" }, { v: fmtSp(r[3], 1), a: "end" }, N(r[4], 6), N(r[5], 6), N(r[6], 1), N(r[7], 1), N(r[8], 0), N(r[9], 1), { v: r[10], a: "end" }])
      },
      { h: "3. ЛИТОЛОГИЙН НЭГТГЭЛ" },
      {
        cols: [{ t: "Код", w: 0.1 }, { t: "Литологи", w: 0.4 }, { t: "Цооног", w: 0.1, a: "end" }, { t: "Интервал", w: 0.12, a: "end" }, { t: "Нийт зузаан, м", w: 0.15, a: "end" }, { t: "Хувь, %", w: 0.13, a: "end" }],
        rows: t.lith.map((l) => [{ v: l.code, fill: lithInfo(l.code)[0], b: true }, lithInfo(l.code)[1], { v: l.holes, a: "end" }, { v: l.n, a: "end" }, N(l.m, 1), N(l.pct, 1)])
      },
      { h: "4. ИНТЕРВАЛЫН ДЭЛГЭРЭНГҮЙ" },
      {
        cols: [{ t: "Цооног", w: 0.12 }, { t: "Эхлэл, м", w: 0.08, a: "end" }, { t: "Төгсгөл, м", w: 0.08, a: "end" }, { t: "Зузаан, м", w: 0.08, a: "end" },
          { t: "Дээд өндөр, м", w: 0.1, a: "end" }, { t: "Доод өндөр, м", w: 0.1, a: "end" }, { t: "Код", w: 0.07 }, { t: "Литологи", w: 0.2 }, { t: "Тайлбар", w: 0.17 }],
        rows: t.ivRows.map((r) => [{ v: r[0], b: true }, N(r[1], 2), N(r[2], 2), N(r[3], 2), N(r[4], 2), N(r[5], 2), { v: r[6], fill: lithInfo(r[6])[0], b: true }, r[7], r[8]])
      }
    ];

    // Хуудаслалт
    const pages = [];
    let cur = [], y = cTop;
    const newPage = () => { pages.push(cur); cur = []; y = cTop; };
    const drawHeader = (cols) => {
      let x = cx;
      cur.push(`<rect x="${cx.toFixed(1)}" y="${y.toFixed(1)}" width="${cw.toFixed(1)}" height="${headH.toFixed(1)}" fill="#0f2236"/>`);
      cols.forEach((c) => {
        const w = c.w * cw;
        cur.push(T(c.a === "end" ? x + w - 1.5 * MM : x + 1.5 * MM, y + headH * 0.66, c.t, { size: fs * 0.95, weight: 700, fill: "#ffffff", anchor: c.a, maxW: w - 3 * MM }));
        x += w;
      });
      y += headH;
    };
    blocks.forEach((b) => {
      if (b.h) {
        if (y + 10 * MM + headH + rowH * 2 > cBottom) newPage();
        y += y === cTop ? 0 : 4 * MM;
        cur.push(T(cx, y + 5 * MM, b.h, { size: fs * 1.25, weight: 800, fill: "#0f2236" }));
        y += 7.5 * MM;
        return;
      }
      drawHeader(b.cols);
      b.rows.forEach((row, ri) => {
        if (y + rowH > cBottom) { newPage(); drawHeader(b.cols); }
        if (ri % 2) cur.push(`<rect x="${cx.toFixed(1)}" y="${y.toFixed(1)}" width="${cw.toFixed(1)}" height="${rowH.toFixed(1)}" fill="#f2f5f8"/>`);
        let x = cx;
        b.cols.forEach((c, ci) => {
          const w = c.w * cw, cell = row[ci], o = cell && typeof cell === "object" ? cell : { v: cell };
          if (o.fill) cur.push(`<rect x="${(x + 0.6).toFixed(1)}" y="${(y + 0.6).toFixed(1)}" width="${(w - 1.2).toFixed(1)}" height="${(rowH - 1.2).toFixed(1)}" fill="${o.fill}"/>`);
          const a = o.a || c.a;
          cur.push(T(a === "end" ? x + w - 1.5 * MM : x + 1.5 * MM, y + rowH * 0.68, o.v ?? "", { size: fs, weight: o.b ? 700 : null, anchor: a, fill: o.fill ? textOn(o.fill) : "#111", maxW: w - 3 * MM }));
          x += w;
        });
        cur.push(Ln(cx, y + rowH, cx + cw, y + rowH, 0.4, "#c9d1da"));
        y += rowH;
      });
    });
    if (cur.length) pages.push(cur);
    return {
      count: pages.length,
      render: (pagesTotal) => pages.map((frag, i) => {
        const F = frame(W, H);
        return { W, H, svg: [svgOpen(W, H), `<g font-family="${FONT}">`, F.svg, frag.join(""),
          miniStamp(F.fx + F.fw - 150 * MM, F.fy + F.fh - stampH, 150 * MM, stampH, meta, firstPage + i, pagesTotal), "</g></svg>"].join("") };
      })
    };
  }

  /** Байрлалын зургийн хүрээ (мм) — газрын зургийн screenshot-ийн харьцааг тааруулахад */
  function mapBoxMm(paperKey) {
    const A3 = paperKey === "A3", bandH = A3 ? 84 : 64, mapW = A3 ? 118 : 80;
    return { w: mapW - 3, h: bandH - 6.5 - 1.5 };
  }

  /** Word/Excel-д: газрын зураг + хойд зүгийн сум + масштабын шугам */
  function mapFigureSVG(mapShot) {
    const W = mapShot.wPx, H = mapShot.hPx, k = Math.max(1, W / 600), r = 26;
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><g font-family="${FONT}">
      <image xlink:href="${mapShot.dataUrl}" href="${mapShot.dataUrl}" x="0" y="0" width="${W}" height="${H}"/>
      <g transform="scale(${k})">${northArrow(W / k - r - 14, r + 26, r)}${scaleBar(18, H / k - 18, mapShot.metersPerPx * k, (W / k) * 0.32)}</g>
      <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="#111" stroke-width="1"/></g></svg>`;
  }

  /** Бүх хуудас: [зургийн хуудас, ...хүснэгтийн хуудсууд] */
  function buildReportPages(sec, meta, mapShot, logo, paperKey, withTables = true) {
    sheetPage(sec, meta, mapShot, logo, paperKey, 1, 1);          // масштабыг (meta.scaleText) урьдчилан тооцно
    const tp = withTables ? tablePages(sec, meta, paperKey, 2) : { count: 0, render: () => [] };
    const total = 1 + tp.count;
    const sheet = sheetPage(sec, meta, mapShot, logo, paperKey, 1, total);
    return [sheet, ...tp.render(total)];
  }

  /* =====================================================================
     Word (.docx) — docx сан
     ===================================================================== */
  function buildDocx(D, sec, meta, sheetImg, mapImg, paperKey) {
    const { Document, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel,
      PageOrientation, ShadingType, Footer, PageNumber, VerticalAlign, TableLayoutType } = D;
    const P = PAPERS[paperKey], tw = (mm) => Math.round(mm * 56.6929);
    const t = reportTables(sec, meta);
    const run = (text, o = {}) => new TextRun({ text: String(text ?? ""), bold: o.b, size: o.size || 18, color: o.color, font: "Arial" });
    const cell = (c, o = {}) => {
      const v = c && typeof c === "object" ? c : { v: c };
      return new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        shading: (v.fill || o.fill) ? { type: ShadingType.CLEAR, color: "auto", fill: (v.fill || o.fill).replace("#", "") } : undefined,
        margins: { top: 30, bottom: 30, left: 60, right: 60 },
        children: [new Paragraph({ alignment: v.a === "end" ? AlignmentType.RIGHT : AlignmentType.LEFT,
          children: [run(v.v, { b: v.b || o.b, size: o.size, color: v.fill ? textOn(v.fill).replace("#", "") : o.color })] })]
      });
    };
    const table = (cols, rows, size = 16) => new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType ? TableLayoutType.FIXED : undefined,
      columnWidths: cols.map((c) => Math.round(c.w * 9600)),
      rows: [
        new TableRow({ tableHeader: true, children: cols.map((c) => cell({ v: c.t, a: c.a }, { b: true, fill: "#0f2236", color: "FFFFFF", size })) }),
        ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c && typeof c === "object" ? { ...c, a: c.a || cols[i].a } : { v: c, a: cols[i].a }, { size })) }))
      ]
    });
    const H = (txt) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 }, children: [run(txt, { b: true, size: 24, color: "0F2236" })] });
    const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
      run(`${meta.org} · ${meta.title} · `, { size: 16, color: "555555" }),
      new TextRun({ children: ["Хуудас ", PageNumber.CURRENT, "/", PageNumber.TOTAL_PAGES], size: 16, color: "555555", font: "Arial" })] })] });

    // 1-р хэсэг: хуудсан зураг (хэвтээ)
    const innerW = (P.w - 16) * MM, innerH = (P.h - 20) * MM;
    const r1 = Math.min(innerW / sheetImg.wPx, innerH / sheetImg.hPx);
    const sec1 = {
      properties: { page: { size: { width: tw(P.h), height: tw(P.w), orientation: PageOrientation.LANDSCAPE }, margin: { top: tw(8), bottom: tw(8), left: tw(8), right: tw(8) } } },
      footers: { default: footer },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: "png", data: sheetImg.data, transformation: { width: Math.round(sheetImg.wPx * r1), height: Math.round(sheetImg.hPx * r1) } })] })]
    };

    // 2-р хэсэг: тайлан (босоо A4)
    const N = (v, d) => ({ v: fmt(v, d), a: "end" });
    const kids = [
      new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 60 }, children: [run(meta.title, { b: true, size: 36, color: "0F2236" })] }),
      new Paragraph({ spacing: { after: 200 }, children: [run(`${meta.org} · Төсөл: ${meta.project} · ${meta.date}`, { size: 20, color: "555555" })] }),
      H("1. Ерөнхий мэдээлэл"),
      table([{ t: "Үзүүлэлт", w: 0.34 }, { t: "Утга", w: 0.66 }], t.info.map((r) => [{ v: r[0], b: true }, r[1] ?? ""]), 18)
    ];
    if (mapImg) {
      const mw = 170 * MM, mh = (mw * mapImg.hPx) / mapImg.wPx;
      kids.push(H("2. Байрлалын зураг"),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: "png", data: mapImg.data, transformation: { width: Math.round(mw), height: Math.round(mh) } })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [run("Зүсэлтийн шугам A–A′, буфер ба цооногууд (дээд тал — хойд зүг)", { size: 16, color: "555555" })] }));
    }
    kids.push(H((mapImg ? "3" : "2") + ". Цооногийн жагсаалт"),
      table([{ t: "№", w: 0.05, a: "end" }, { t: "Цооног", w: 0.14 }, { t: "X (UTM E), м", w: 0.13, a: "end" }, { t: "Y (UTM N), м", w: 0.14, a: "end" },
        { t: "Амны өндөр, м", w: 0.12, a: "end" }, { t: "Гүн, м", w: 0.1, a: "end" }, { t: "Зай A-аас, м", w: 0.11, a: "end" }, { t: "Шугамаас, м", w: 0.11, a: "end" }, { t: "Интервал", w: 0.1, a: "end" }],
      t.holeRows.map((r) => [{ v: r[0], a: "end" }, { v: r[1], b: true }, { v: fmtSp(r[2], 1), a: "end" }, { v: fmtSp(r[3], 1), a: "end" }, N(r[6], 1), N(r[7], 1), N(r[8], 0), N(r[9], 1), { v: r[10], a: "end" }])),
      H((mapImg ? "4" : "3") + ". Литологийн нэгтгэл"),
      table([{ t: "Код", w: 0.1 }, { t: "Литологи", w: 0.42 }, { t: "Цооног", w: 0.1, a: "end" }, { t: "Интервал", w: 0.12, a: "end" }, { t: "Зузаан, м", w: 0.14, a: "end" }, { t: "Хувь, %", w: 0.12, a: "end" }],
        t.lith.map((l) => [{ v: l.code, fill: lithInfo(l.code)[0], b: true }, lithInfo(l.code)[1], { v: l.holes, a: "end" }, { v: l.n, a: "end" }, N(l.m, 1), N(l.pct, 1)])),
      H((mapImg ? "5" : "4") + ". Интервалын дэлгэрэнгүй"),
      table([{ t: "Цооног", w: 0.14 }, { t: "Эхлэл, м", w: 0.09, a: "end" }, { t: "Төгсгөл, м", w: 0.09, a: "end" }, { t: "Зузаан, м", w: 0.09, a: "end" },
        { t: "Дээд өндөр, м", w: 0.11, a: "end" }, { t: "Доод өндөр, м", w: 0.11, a: "end" }, { t: "Код", w: 0.08 }, { t: "Литологи", w: 0.17 }, { t: "Тайлбар", w: 0.12 }],
        t.ivRows.map((r) => [{ v: r[0], b: true }, N(r[1], 2), N(r[2], 2), N(r[3], 2), N(r[4], 2), N(r[5], 2), { v: r[6], fill: lithInfo(r[6])[0], b: true }, r[7], r[8]]), 15),
      H("Гарын үсэг"),
      table([{ t: "", w: 0.2 }, { t: "Нэр", w: 0.4 }, { t: "Гарын үсэг", w: 0.25 }, { t: "Огноо", w: 0.15 }],
        [[{ v: "Зурсан", b: true }, meta.drawnBy, "", meta.date], [{ v: "Хянасан", b: true }, meta.checkedBy, "", ""]], 18));
    const sec2 = {
      properties: { page: { size: { width: tw(210), height: tw(297) }, margin: { top: tw(15), bottom: tw(15), left: tw(20), right: tw(12) } } },
      footers: { default: footer },
      children: kids
    };
    return new Document({
      creator: meta.drawnBy || meta.org, title: meta.title, description: "Цооногийн геологийн зүсэлт",
      styles: { default: { document: { run: { font: "Arial", size: 18 } } } },
      sections: [sec1, sec2]
    });
  }

  /* =====================================================================
     Excel (.xlsx) — ExcelJS
     ===================================================================== */
  function buildXlsx(ExcelJS, sec, meta, sheetImg, mapImg) {
    const t = reportTables(sec, meta);
    const wb = new ExcelJS.Workbook();
    wb.creator = meta.drawnBy || meta.org; wb.created = new Date(); wb.title = meta.title; wb.company = meta.org;
    const navy = "FF0F2236", thin = { style: "thin", color: { argb: "FFC9D1DA" } };
    const border = { top: thin, left: thin, bottom: thin, right: thin };
    const headStyle = (row) => row.eachCell((c) => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: navy } }; c.alignment = { vertical: "middle", wrapText: true }; c.border = border; });
    const argb = (hex) => "FF" + hex.replace("#", "").toUpperCase();

    // Тайлан
    const ws = wb.addWorksheet("Тайлан", { views: [{ showGridLines: false }], pageSetup: { orientation: "landscape", paperSize: 9, fitToPage: true } });
    ws.columns = [{ width: 30 }, { width: 70 }];
    ws.mergeCells("A1:B1");
    ws.getCell("A1").value = meta.title; ws.getCell("A1").font = { bold: true, size: 16, color: { argb: navy } };
    ws.getCell("A2").value = `${meta.org} · Төсөл: ${meta.project} · ${meta.date}`; ws.getCell("A2").font = { color: { argb: "FF555555" } };
    ws.mergeCells("A2:B2");
    let r = 4;
    t.info.forEach(([k, v]) => {
      const row = ws.getRow(r++);
      row.getCell(1).value = k; row.getCell(2).value = v ?? "";
      row.getCell(1).font = { bold: true };
      row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F5F8" } };
      row.eachCell((c) => { c.border = border; c.alignment = { vertical: "middle", wrapText: true }; });
    });
    r += 1;
    ws.getCell(`A${r}`).value = "Зүсэлтийн хуудас (штамп, масштаб, байрлалын зурагтай)"; ws.getCell(`A${r}`).font = { bold: true, size: 12, color: { argb: navy } };
    r += 1;
    if (sheetImg) {
      const id = wb.addImage({ base64: sheetImg.dataUrl, extension: "png" });
      const w = 1150, h = (w * sheetImg.hPx) / sheetImg.wPx;
      ws.addImage(id, { tl: { col: 0, row: r - 1 }, ext: { width: w, height: h } });
      r += Math.ceil(h / 20) + 2;
    }
    if (mapImg) {
      ws.getCell(`A${r}`).value = "Байрлалын зураг (дээд тал — хойд зүг)"; ws.getCell(`A${r}`).font = { bold: true, size: 12, color: { argb: navy } };
      const id2 = wb.addImage({ base64: mapImg.dataUrl, extension: "png" });
      const w2 = 700, h2 = (w2 * mapImg.hPx) / mapImg.wPx;
      ws.addImage(id2, { tl: { col: 0, row: r }, ext: { width: w2, height: h2 } });
    }

    // Цооногууд
    const wh = wb.addWorksheet("Цооногууд", { views: [{ state: "frozen", ySplit: 1 }] });
    wh.columns = [
      { header: "№", width: 5 }, { header: "Цооног", width: 16 }, { header: "X (UTM E), м", width: 14, style: { numFmt: "0.0" } }, { header: "Y (UTM N), м", width: 15, style: { numFmt: "0.0" } },
      { header: "Өргөрөг, °", width: 12, style: { numFmt: "0.000000" } }, { header: "Уртраг, °", width: 12, style: { numFmt: "0.000000" } },
      { header: "Амны өндөр, м", width: 14, style: { numFmt: "0.00" } }, { header: "Гүн, м", width: 10, style: { numFmt: "0.0" } },
      { header: "Зай A-аас, м", width: 13, style: { numFmt: "0.0" } }, { header: "Шугамаас, м", width: 12, style: { numFmt: "0.0" } }, { header: "Интервал", width: 10 }];
    headStyle(wh.getRow(1));
    t.holeRows.forEach((x) => wh.addRow(x));
    wh.autoFilter = { from: "A1", to: "K1" };

    // Интервалууд
    const wi = wb.addWorksheet("Интервалууд", { views: [{ state: "frozen", ySplit: 1 }] });
    wi.columns = [
      { header: "Цооног", width: 16 }, { header: "Эхлэл, м", width: 10, style: { numFmt: "0.00" } }, { header: "Төгсгөл, м", width: 10, style: { numFmt: "0.00" } },
      { header: "Зузаан, м", width: 10, style: { numFmt: "0.00" } }, { header: "Дээд өндөр, м", width: 13, style: { numFmt: "0.00" } }, { header: "Доод өндөр, м", width: 13, style: { numFmt: "0.00" } },
      { header: "Код", width: 8 }, { header: "Литологи", width: 30 }, { header: "Тайлбар", width: 30 }];
    headStyle(wi.getRow(1));
    t.ivRows.forEach((x) => {
      const row = wi.addRow(x), c = row.getCell(7), col = lithInfo(x[6])[0];
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(col) } };
      c.font = { bold: true, color: { argb: argb(textOn(col)) } };
    });
    wi.autoFilter = { from: "A1", to: "I1" };

    // Литологи
    const wl = wb.addWorksheet("Литологи");
    wl.columns = [{ header: "Код", width: 8 }, { header: "Литологи", width: 44 }, { header: "Өнгө", width: 10 }, { header: "Цооног", width: 9 },
      { header: "Интервал", width: 10 }, { header: "Нийт зузаан, м", width: 15, style: { numFmt: "0.0" } }, { header: "Хувь, %", width: 10, style: { numFmt: "0.0" } }];
    headStyle(wl.getRow(1));
    t.lith.forEach((l) => {
      const col = lithInfo(l.code)[0], row = wl.addRow([l.code, lithInfo(l.code)[1], col, l.holes, l.n, l.m, l.pct]);
      row.getCell(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(col) } };
      row.getCell(3).font = { color: { argb: argb(textOn(col)) } };
    });

    // Газрын профиль
    const wg = wb.addWorksheet("Газрын профиль", { views: [{ state: "frozen", ySplit: 1 }] });
    wg.columns = [{ header: "Зай A-аас, м", width: 14, style: { numFmt: "0.0" } }, { header: "Өндөр, м", width: 12, style: { numFmt: "0.00" } },
      { header: "X (UTM E), м", width: 14, style: { numFmt: "0.0" } }, { header: "Y (UTM N), м", width: 15, style: { numFmt: "0.0" } }];
    headStyle(wg.getRow(1));
    sec.ground.forEach((g) => wg.addRow([g.d, g.z, g.E ?? null, g.N ?? null]));

    // Шугам
    const wsl = wb.addWorksheet("Шугам");
    wsl.columns = [{ header: "Цэг", width: 8 }, { header: "X (UTM E), м", width: 14, style: { numFmt: "0.0" } }, { header: "Y (UTM N), м", width: 15, style: { numFmt: "0.0" } },
      { header: "Өргөрөг, °", width: 12, style: { numFmt: "0.000000" } }, { header: "Уртраг, °", width: 12, style: { numFmt: "0.000000" } }];
    headStyle(wsl.getRow(1));
    (sec.vertices || []).forEach((v, i, arr) => wsl.addRow([i === 0 ? "A" : i === arr.length - 1 ? "A′" : String(i), v.E, v.N, v.lat, v.lon]));
    wsl.addRow([]);
    wsl.addRow(["Координатын систем", meta.crs]);
    return wb;
  }

  /* =====================================================================
     DXF (AutoCAD R12) — X = шугамын дагуух зай (м), Y = өндөр (м), 1:1
     ===================================================================== */
  function aciPalette() {
    const pal = { 1: [255, 0, 0], 2: [255, 255, 0], 3: [0, 255, 0], 4: [0, 255, 255], 5: [0, 0, 255], 6: [255, 0, 255], 8: [128, 128, 128], 9: [192, 192, 192] };
    const hsv = (h, s, v) => { const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return [f(5), f(3), f(1)].map((x) => Math.round(x * 255)); };
    for (let i = 10; i <= 249; i++) { const v = i % 10; pal[i] = hsv(((Math.floor(i / 10) - 1) * 15) % 360, v % 2 ? 0.5 : 1, [1, 0.65, 0.5, 0.3, 0.15][Math.floor(v / 2)]); }
    [51, 80, 105, 130, 190, 255].forEach((g, j) => (pal[250 + j] = [g, g, g]));
    return pal;
  }
  function nearestAci(hex) {
    const pal = aciPalette(), h = hex.replace("#", ""), c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    let best = 7, bd = Infinity;
    Object.entries(pal).forEach(([k, p]) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; best = +k; } });
    return best;
  }
  function buildDXF(sec, meta) {
    const o = [], p = (c, v) => o.push(String(c), String(v));
    const u = (s) => String(s ?? "").replace(/[^\x20-\x7e]/g, (ch) => "\\U+" + ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0"));
    const r = renderSection(sec, { width: 1200, header: false, legend: false });
    const zMin = r.zMin, zMax = r.zMax, L = sec.lengthM, th = Math.max(0.8, L / 220), cw = Math.max(1, L / 160);
    const holes = sec.holes.slice().sort((a, b) => a.along - b.along);
    const used = r.used;
    const layers = [["0", 7], ["ZUSELT_GROUND", 30], ["ZUSELT_HOLES", 250], ["ZUSELT_TEXT", 7], ["ZUSELT_GRID", 8], ...used.map((c) => ["LITH_" + c.replace(/[^A-Za-z0-9_]/g, "_"), nearestAci(lithInfo(c)[0])])];
    p(0, "SECTION"); p(2, "HEADER"); p(9, "$ACADVER"); p(1, "AC1009"); p(9, "$INSUNITS"); p(70, 6);
    p(9, "$EXTMIN"); p(10, -L * 0.08); p(20, zMin); p(30, 0); p(9, "$EXTMAX"); p(10, L * 1.02); p(20, zMax + th * 12); p(30, 0); p(0, "ENDSEC");
    p(0, "SECTION"); p(2, "TABLES");
    p(0, "TABLE"); p(2, "LTYPE"); p(70, 1); p(0, "LTYPE"); p(2, "CONTINUOUS"); p(70, 0); p(3, "Solid line"); p(72, 65); p(73, 0); p(40, 0.0); p(0, "ENDTAB");
    p(0, "TABLE"); p(2, "LAYER"); p(70, layers.length);
    layers.forEach(([n, c]) => { p(0, "LAYER"); p(2, n); p(70, 0); p(62, c); p(6, "CONTINUOUS"); });
    p(0, "ENDTAB"); p(0, "ENDSEC");
    p(0, "SECTION"); p(2, "ENTITIES");
    const poly = (layer, pts, closed, color) => {
      p(0, "POLYLINE"); p(8, layer); if (color) p(62, color); p(66, 1); p(70, closed ? 1 : 0); p(10, 0); p(20, 0); p(30, 0);
      pts.forEach(([x, y]) => { p(0, "VERTEX"); p(8, layer); p(10, x.toFixed(3)); p(20, y.toFixed(3)); p(30, 0); });
      p(0, "SEQEND"); p(8, layer);
    };
    const text = (layer, x, y, h, str, align = 0) => {
      p(0, "TEXT"); p(8, layer); p(10, x.toFixed(3)); p(20, y.toFixed(3)); p(30, 0); p(40, h.toFixed(3)); p(1, u(str));
      if (align) { p(72, align); p(11, x.toFixed(3)); p(21, y.toFixed(3)); p(31, 0); }
    };
    // Тор
    for (let z = zMin; z <= zMax + 1e-6; z += r.yStep) {
      poly("ZUSELT_GRID", [[0, z], [L, z]], false);
      text("ZUSELT_GRID", -th * 0.8, z - th * 0.4, th, fmt(z, 0), 2);
    }
    poly("ZUSELT_GRID", [[0, zMin], [L, zMin], [L, zMax], [0, zMax]], true);
    const xs = niceStep(L, 8);
    for (let d = 0; d <= L + 1e-6; d += xs) text("ZUSELT_GRID", d, zMin - th * 1.8, th, L >= 2000 ? fmt(d / 1000, 2) + " км" : fmt(d, 0) + " м", 1);
    // Газрын гадарга
    poly("ZUSELT_GROUND", sec.ground.filter((g) => g.z != null && isFinite(g.z)).map((g) => [g.d, g.z]), false);
    // Цооногууд
    holes.forEach((h) => {
      const x0 = h.along - cw / 2, x1 = h.along + cw / 2;
      h.intervals.forEach((iv) => {
        const y0 = h.collarZ - iv.to, y1 = h.collarZ - iv.from, layer = "LITH_" + String(iv.lith).replace(/[^A-Za-z0-9_]/g, "_");
        p(0, "SOLID"); p(8, layer); p(10, x0.toFixed(3)); p(20, y0.toFixed(3)); p(30, 0); p(11, x1.toFixed(3)); p(21, y0.toFixed(3)); p(31, 0);
        p(12, x0.toFixed(3)); p(22, y1.toFixed(3)); p(32, 0); p(13, x1.toFixed(3)); p(23, y1.toFixed(3)); p(33, 0);
      });
      const td = holeDepth(h);
      poly("ZUSELT_HOLES", [[x0, h.collarZ], [x1, h.collarZ], [x1, h.collarZ - td], [x0, h.collarZ - td]], true);
      text("ZUSELT_TEXT", h.along, h.collarZ + th * 1.2, th * 1.1, h.id, 1);
      text("ZUSELT_TEXT", h.along, h.collarZ - td - th * 1.6, th * 0.85, fmt(td, 1) + " м", 1);
    });
    text("ZUSELT_TEXT", 0, zMax + th * 2, th * 1.3, "A", 1);
    text("ZUSELT_TEXT", L, zMax + th * 2, th * 1.3, "A'", 1);
    text("ZUSELT_TEXT", 0, zMax + th * 5.5, th * 1.6, `${meta.title} · ${meta.project}`);
    text("ZUSELT_TEXT", 0, zMax + th * 3.6, th * 0.9, `${meta.org} · ${meta.date} · ${meta.crs} · X=зай (м), Y=өндөр (м), 1:1 · Азимут ${fmt(sec.azimuth, 0)}°`);
    // Тайлбар
    used.forEach((c, i) => {
      const y = zMin - th * (5 + i * 1.8), x = 0, layer = "LITH_" + c.replace(/[^A-Za-z0-9_]/g, "_");
      p(0, "SOLID"); p(8, layer); p(10, x); p(20, y); p(30, 0); p(11, x + th * 2.5); p(21, y); p(31, 0); p(12, x); p(22, y + th * 1.2); p(32, 0); p(13, x + th * 2.5); p(23, y + th * 1.2); p(33, 0);
      text("ZUSELT_TEXT", x + th * 3.2, y + th * 0.15, th * 0.9, `${c} - ${lithInfo(c)[1]}`);
    });
    p(0, "ENDSEC"); p(0, "EOF");
    return o.join("\r\n") + "\r\n";
  }

  /* ---------------- CSV ---------------- */
  function buildCSV(sec) {
    const rows = [["hole_id", "distance_m", "offset_m", "collar_elev_m", "utm_e", "utm_n", "from_m", "to_m", "thickness_m", "top_elev_m", "bot_elev_m", "lithology", "lithology_name", "comment"]];
    sec.holes.slice().sort((a, b) => a.along - b.along).forEach((h) => h.intervals.slice().sort((a, b) => a.from - b.from).forEach((iv) =>
      rows.push([h.id, h.along.toFixed(1), h.off.toFixed(1), h.collarZ.toFixed(2), h.E != null ? h.E.toFixed(1) : "", h.N != null ? h.N.toFixed(1) : "",
        iv.from, iv.to, (iv.to - iv.from).toFixed(2), (h.collarZ - iv.from).toFixed(2), (h.collarZ - iv.to).toFixed(2), iv.lith, lithInfo(iv.lith)[1], iv.comment])));
    return "﻿" + rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  }

  root.ZCORE = {
    LITH, LITH_DEFAULT, lithInfo, lithNameMn, MM, PAPERS, STD_SCALES,
    esc, fmt, fmtSp, niceStep, cumLengths, samplePoints, projectOnLine, wmToLat, wmToLon, toUTM, utmZone, azimuthDeg, compass8, distTxt, holeDepth,
    renderSection, renderSectionSVG, lithSummary, reportTables, buildReportPages, sheetPage, mapBoxMm, mapFigureSVG, buildDocx, buildXlsx, buildDXF, buildCSV, nearestAci
  };
})(typeof window !== "undefined" ? window : globalThis);
