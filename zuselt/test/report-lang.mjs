/**
 * Headless check for zuselt report languages.
 *
 *   npm install puppeteer-core
 *   node zuselt/test/report-lang.mjs [output-dir]
 *
 * Uses the system Chrome (google-chrome). Writes PDF / DOCX / XLSX / PNG samples
 * and exits non-zero if a language check fails.
 */
import { createRequire } from "module";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
function loadPuppeteer() {
  const candidates = ["puppeteer-core"];
  for (const dir of (process.env.NODE_PATH || "").split(path.delimiter)) {
    if (dir) candidates.push(path.join(dir, "puppeteer-core"));
  }
  candidates.push("/tmp/pwtest/node_modules/puppeteer-core");
  for (const name of candidates) {
    try { return require(name); } catch (e) { /* try the next location */ }
  }
  throw new Error("Install puppeteer-core (npm install puppeteer-core) so this test can drive Chrome.");
}
const puppeteer = loadPuppeteer();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.resolve(process.argv[2] || "/tmp/zuselt-reports");
fs.mkdirSync(outDir, { recursive: true });

const sec = {
  lengthM: 850.4,
  azimuth: 42.2,
  bufM: 20,
  projectId: "SH",
  crs: "WGS 84 / UTM 48N (EPSG:32648)",
  title: "Зүсэлт A–A′ · SH",
  subtitle: "Урт 850 м · буфер 20 м · 2 цооног · 2026-11-23",
  A: { E: 623456.2, N: 4823456.7, lat: 43.512345, lon: 106.234567 },
  B: { E: 624100.4, N: 4824100.2, lat: 43.518, lon: 106.242 },
  vertices: [
    { E: 623456.2, N: 4823456.7, lat: 43.512345, lon: 106.234567 },
    { E: 624100.4, N: 4824100.2, lat: 43.518, lon: 106.242 }
  ],
  ground: [
    { d: 0, z: 1420.2, E: 623456.2, N: 4823456.7 },
    { d: 400, z: 1435.5, E: 623700, N: 4823700 },
    { d: 850.4, z: 1410.1, E: 624100.4, N: 4824100.2 }
  ],
  holes: [
    {
      id: "DH-01", along: 120.2, off: 4.4, collarZ: 1428.35, E: 623500.1, N: 4823600.2, lat: 43.513, lon: 106.236,
      intervals: [
        { from: 0, to: 2.4, lith: "ST", comment: "Туршилтын тайлбар" },
        { from: 2.4, to: 11, lith: "SS", comment: "" },
        { from: 11, to: 16.5, lith: "CO", comment: "seam" },
        { from: 16.5, to: 20, lith: "FSS", comment: "" },
        { from: 20, to: 24, lith: "XYZ", comment: "as logged" }
      ]
    },
    {
      id: "DH-02", along: 640, off: -8.2, collarZ: 1418, E: 623900, N: 4824000, lat: 43.516, lon: 106.24,
      intervals: [
        { from: 0, to: 6, lith: "GV", comment: "" },
        { from: 6, to: 14.2, lith: "SH", comment: "weak" },
        { from: 14.2, to: 18, lith: "MS", comment: "" }
      ]
    }
  ]
};
const baseMeta = {
  org: "RegaPro",
  project: "SH",
  title: "Геологийн зүсэлт A–A′",
  drawingNo: "ГЗ-01",
  drawnBy: "Б. Бат",
  checkedBy: "Д. Дорж",
  note: "Туршилтын тайлбар",
  date: "2026-11-23",
  crs: sec.crs,
  fixNh: 0,
  fixNv: 0
};

const expect = {
  mn: ["Байгууллага", "Өндөр, м", "Шугамын дагуух зай", "Хөрс / Soil", "ЕРӨНХИЙ МЭДЭЭЛЭЛ", "Хуудас 1/", "Газрын гадарга", "Цооног"],
  en: ["Organization", "Elevation, m", "Distance along section", "Soil", "GENERAL INFORMATION", "Sheet 1/", "Ground surface", "Borehole", "From A, m", "LEGEND"],
  ru: ["Организация", "Отметка, м", "Почва", "ОБЩИЕ СВЕДЕНИЯ", "Лист 1/", "Дневная поверхность", "Скважина", "УСЛОВНЫЕ ОБОЗНАЧЕНИЯ"],
  zh: ["单位", "标高, 米", "沿剖面距离", "土壤", "基本信息", "第 1/", "地表", "钻孔", "图例", "孔口标高, 米"]
};
const absent = {
  en: ["Байгууллага", "Өндөр, м", "Хөрс / Soil"],
  ru: ["Байгууллага", "Өндөр, м", "Хөрс / Soil"],
  zh: ["Байгууллага", "Өндөр, м", "Хөрс / Soil", "Organization"]
};

function decodeDxf(s) {
  return s.replace(/\\U\+([0-9A-F]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

const server = spawn("python3", ["-m", "http.server", "8765", "--bind", "127.0.0.1"], { cwd: root, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 400));

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--font-render-hinting=none"]
});
const failures = [];
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  await page.goto("http://127.0.0.1:8765/test/harness.html", { waitUntil: "load" });
  await page.waitForFunction(() => window.ZCORE && window.jspdf && window.docx && window.ExcelJS);

  for (const lang of ["mn", "en", "ru", "zh"]) {
    const meta = { ...baseMeta, lang };
    const opts = { pdf: true, docx: lang === "en" || lang === "zh", xlsx: lang === "en" || lang === "zh", scale: 150 / 96 };
    const res = await page.evaluate((s, m, o) => window.runReport(s, m, o), sec, meta, opts);
    if (res.errors && res.errors.length) failures.push(lang + " errors: " + res.errors.join(" | "));
    const blob = (res.svg || "") + "\n" + (res.csv || "") + "\n" + JSON.stringify(res.info || []);
    for (const s of expect[lang]) if (!blob.includes(s)) failures.push(lang + " missing " + s);
    for (const s of absent[lang] || []) if (blob.includes(s)) failures.push(lang + " still has " + s);
    if (!blob.includes("Туршилтын тайлбар") || !blob.includes("Б. Бат") || !blob.includes("ГЕОЛОГИЙН ЗҮСЭЛТ")) failures.push(lang + " dropped user text");
    if (lang !== "mn" && !blob.includes("XYZ")) failures.push(lang + " unknown lithology was not kept");
    if (lang === "mn" && !blob.includes("Бусад")) failures.push("mn unknown lithology should stay Бусад");
    if (!/^[\x00-\x7F]*$/.test(res.dxf || "")) failures.push(lang + " DXF is not ASCII");
    const dxfText = decodeDxf(res.dxf || "");
    if (lang === "zh" && !dxfText.includes("土壤")) failures.push("zh DXF legend missing 土壤");
    if (lang === "en" && !dxfText.includes("Soil")) failures.push("en DXF legend missing Soil");
    if (lang === "ru" && !dxfText.includes("Почва")) failures.push("ru DXF legend missing Почва");
    if ((res.dark || 0) < 500) failures.push(lang + " PNG looks blank (" + res.dark + ")");
    if (lang === "zh" && !res.fontEmbedded) failures.push("zh font was not embedded (" + res.fontCss + " bytes)");
    const write = (name, b64) => { if (b64) fs.writeFileSync(path.join(outDir, name), Buffer.from(b64, "base64")); };
    const png = (res.png || "").split(",")[1];
    write(`report-${lang}-p1.png`, png);
    write(`report-${lang}.pdf`, res.pdf);
    write(`report-${lang}.docx`, res.docx);
    write(`report-${lang}.xlsx`, res.xlsx);
    fs.writeFileSync(path.join(outDir, `report-${lang}.csv`), res.csv || "");
    fs.writeFileSync(path.join(outDir, `report-${lang}.dxf`), res.dxf || "");
    console.log(lang, "pages", res.pages, "dark", res.dark, "font", res.fontCss || 0, "pdf", res.pdf ? res.pdf.length : 0, "docx", res.docx ? res.docx.length : 0, "xlsx", res.xlsx ? res.xlsx.length : 0);
  }

  const ui = await browser.newPage();
  ui.setDefaultTimeout(90000);
  await ui.goto("http://127.0.0.1:8765/index.html", { waitUntil: "domcontentloaded" });
  await ui.waitForFunction(() => window.ZCORE && document.getElementById("eqLang"));
  const langs = await ui.$eval("#eqLang", (el) => [...el.options].map((o) => o.value + ":" + o.textContent));
  if (langs.join(",") !== "mn:Монгол,en:English,ru:Русский,zh:中文") failures.push("selector options " + langs.join("|"));
  await ui.evaluate(() => {
    const sel = document.getElementById("eqLang");
    sel.value = "ru";
    sel.dispatchEvent(new Event("change"));
  });
  await ui.reload({ waitUntil: "domcontentloaded" });
  await ui.waitForFunction(() => document.getElementById("eqLang") && document.getElementById("eqLang").value);
  const kept = await ui.$eval("#eqLang", (el) => el.value);
  if (kept !== "ru") failures.push("localStorage did not keep ru, got " + kept);
  await ui.evaluate(() => document.getElementById("expDlg").showModal());
  await ui.screenshot({ path: path.join(outDir, "report-modal.png") });
  console.log("modal lang after reload", kept);
} finally {
  await browser.close();
  server.kill();
}

if (failures.length) {
  console.error("FAILURES:");
  failures.forEach((f) => console.error(" -", f));
  process.exit(1);
}
console.log("ok", outDir);
