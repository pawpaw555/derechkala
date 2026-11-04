#!/usr/bin/env node
// סורק את האתר מול כלל 2: טענות שסותרות את הנתונים או את עצמן.
//
// התקרות ב-provenance.mjs אומרות *כמה* טענות אין להן מקור. הן אינן
// אומרות *איפה*. הסורק הזה נותן קובץ ושורה, והוא מכסה בדיוק את מחלקות
// השגיאות שנמצאו בקריאה ידנית ב-04.11.2026 — כדי שהקריאה ההיא לא
// תידרש שוב.
//
// חמישה מעברים. 1 ו-4 הם הכרעות — מספר מול הנתונים, ולכן הם נכשלים.
// 2, 3 ו-5 הם דגלים לשיקול דעת ואינם מכשילים.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { load } from "./load.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const m = await load();

// ── האמת, מחושבת מהנתונים ולא נכתבת ─────────────────────────────────
const content = Object.values(m.STATION_CONTENT);
const TYPES = {};
for (const c of content) TYPES[c.stationType] = (TYPES[c.stationType] || 0) + 1;
const TRUTH = {
  "תחנות": m.STATIONS.length,
  "עיליות": TYPES["עילית"] || 0,
  "תת-קרקעיות": TYPES["תת קרקעית"] || 0,
  "בשיקוע": TYPES["בשיקוע"] || 0,
};
const COUNTS = {
  LANDMARKS: m.LANDMARKS.length,
  pois: content.flatMap((c) => c.pois ?? []).length,
  places: m.PLACES.length,
  STATIONS: m.STATIONS.length,
};

// ── קבצי הממשק ───────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}
const FILES = walk(join(ROOT, "app")).map((p) => [p.slice(ROOT.length), readFileSync(p, "utf8")]);
// בקרה חיובית: בלי קבצים אין ממצאים, וזה ייראה כמו אתר תקין
if (FILES.length < 20) {
  console.error("audit: נמצאו רק %d קבצים — הסריקה שבורה", FILES.length);
  process.exit(2);
}

const hard = [];
const flags = [];
const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;

// ── 1. מספר על תחנות מול הנתונים ─────────────────────────────────────
// הגרסה הראשונה של המעבר הזה השוותה כל "N תחנות" ל-34 והחזירה עשר
// "סתירות" שאינן סתירות: ספירות ענף (7, 9, 27, 32), סריקת תחנות רכבת
// (29), ותבנית ריקה (0). כלל 11א — ממצא מבדיקה חדשה הוא השערה.
//
// עיליות / תת-קרקעיות / בשיקוע הן תמיד טענה על הקו כולו. "N תחנות"
// נבדק רק כשאותה מחרוזת אומרת במפורש שמדובר בקו האדום.
// "N תחנות <סוג>" נבדק מול הסוג, לא מול הסך — אחרת "10 תחנות
// תת-קרקעיות" נקרא כטענה על 10 תחנות בקו. ו-"N תחנות" סתם נבדק רק
// בטענת סך מפורשת, כי אותו דפוס מכסה גם ספירות ענף וספירות יחס OSM.
const OTHER_LINE = /line-(green|purple)/;
const TOTAL = /כמה תחנות|לאורך/;
for (const [file, src] of FILES) {
  for (const mm of src.matchAll(/(\d+)\s+תחנות\s+(תת-קרקעיות|עיליות|בשיקוע)|(\d+)\s+(תת-קרקעיות|עיליות|בשיקוע)|(\d+)\s+(תחנות)/g)) {
    const n = mm[1] ?? mm[3] ?? mm[5];
    const unit = mm[2] ?? mm[4] ?? mm[6];
    const line = lineOf(src, mm.index);
    if (OTHER_LINE.test(file)) { flags.push([file, line, `${n} ${unit} — קו אחר, לא נבדק מול הנתונים`]); continue; }
    const ctx = src.slice(Math.max(0, mm.index - 220), mm.index + 220);
    if (unit === "תחנות" && !TOTAL.test(ctx)) continue;
    if (Number(n) !== TRUTH[unit]) hard.push([file, line, `"${n} ${unit}" — בנתונים ${TRUTH[unit]}`]);
  }
}

// ── 2. שם תחנת רכבת ישראל שמוצג כתחנה של הקו ──────────────────────────
// סבידור מרכז היא תחנת רכבת, והיא הוצגה כתחנה של הקו האדום.
// פיצול השם לטוקנים החזיר "אביב" ו"מרכז" — 157 דגלים חסרי משמעות.
// הביטוי המלא בלבד, ורק אם הוא אינו גם תחנה של הקו ואינו מקום מאומת.
const LIGHT = new Set(m.STATIONS.map((s) => s.name));
const PLACE_NAMES = new Set(m.PLACES.map((p) => p.name));
// ביטוי של מילה אחת הוא רעש: "השלום" תפס גם את "בית משפט השלום" וגם
// את "תחנת רכבת תל אביב השלום" שמזוהה נכון. שתי מילים ומעלה בלבד,
// וכל אזכור של "רכבת" במחרוזת פוסל — זה בדיוק סימון נכון.
// הבקרה החיובית נטעה "תל אביב השלום" בפרוזה והכלי לא תפס, כי "השלום"
// הוא מילה אחת. לכן גם השם המלא, עם המקף מנורמל לרווח — הפרוזה כותבת
// "תל אביב השלום" ולא "תל אביב – השלום".
const RAIL_ONLY = [...new Set(m.RAIL_STATIONS.flatMap((r) => [
  r.name.replace(/\s*–\s*/g, " ").trim(),
  r.name.split(/\s*–\s*/).pop().trim(),
]))]
  .filter((t) => t.split(/\s+/).length >= 2)
  .filter((t) => !LIGHT.has(t) && ![...PLACE_NAMES].some((p) => p.includes(t)));
// שורה-שורה, לא לפי מחרוזות במרכאות: הפרוזה של עמוד הבית היא טקסט
// JSX ואינה במרכאות כלל, והביטוי `"..."` בלע שורות שלמות והחזיר את
// הממצא הנכון במספר שורה שגוי — תשובה נכונה מסיבה שגויה.
for (const [file, src] of FILES) {
  if (file.includes("railStations")) continue;
  src.split("\n").forEach((s, i) => {
    if (!/תחנ/.test(s) || /רכבת/.test(s)) return;
    for (const t of RAIL_ONLY) {
      if (s.includes(t)) hard.push([file, i + 1, `"${t}" — תחנת רכבת ישראל מוצגת כתחנה של הקו`]);
    }
  });
}

// ── 3. תאריך שהתיישן ─────────────────────────────────────────────────
const MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const now = new Date();
for (const [file, src] of FILES) {
  for (const mm of src.matchAll(/נכון ל([א-ת]+)\s+(\d{4})/g)) {
    const mi = MONTHS.indexOf(mm[1]);
    if (mi < 0) continue;
    const age = (now.getFullYear() - Number(mm[2])) * 12 + (now.getMonth() - mi);
    if (age > 6) flags.push([file, lineOf(src, mm.index), `"נכון ל${mm[1]} ${mm[2]}" — לפני ${age} חודשים`]);
  }
}

// ── 4. הערה שמצהירה מספר מול המערך ───────────────────────────────────
for (const [file, src] of FILES) {
  for (const mm of src.matchAll(/(\d+)\s+(LANDMARKS|pois|places|STATIONS)\b/g)) {
    const [, n, name] = mm;
    if (Number(n) !== COUNTS[name]) hard.push([file, lineOf(src, mm.index), `הערה "${n} ${name}" — בפועל ${COUNTS[name]}`]);
  }
}

// ── 5. מחירים: כל ערך בשקלים, לשיקול דעת ─────────────────────────────
const money = new Map();
for (const [file, src] of FILES) {
  for (const mm of src.matchAll(/(\d+(?:\.\d+)?)\s*₪/g)) {
    const k = mm[1];
    if (!money.has(k)) money.set(k, []);
    money.get(k).push(`${file}:${lineOf(src, mm.index)}`);
  }
}

// ── דיווח ────────────────────────────────────────────────────────────
const show = (t, rows) => {
  console.log("\n── %s (%d) ──", t, rows.length);
  for (const [f, l, msg] of rows) console.log("  %s:%d  %s", f, l, msg);
  if (!rows.length) console.log("  אין");
};
console.log("סרקתי %d קובצי ממשק · אמת: %s", FILES.length,
  Object.entries(TRUTH).map(([k, v]) => `${v} ${k}`).join(" · "));
show("סתירה מול הנתונים — מכשיל", hard);
show("לשיקול דעת", flags);
console.log("\n── מחירים בשקלים (%d ערכים) ──", money.size);
for (const [v, where] of [...money.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
  console.log("  %s %s", (v + " ₪").padEnd(8), where.join(", "));
}
console.log("\n%s", hard.length ? `נכשל: ${hard.length} סתירות` : "עבר: אין סתירות מול הנתונים");
process.exit(hard.length ? 1 : 0);
