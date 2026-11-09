#!/usr/bin/env node
// מה שהקוד מחזיק מול מה שהשרת באמת הגיש. שתי שאלות באותה צורה.
//
// שתיהן נולדו מאותו לקח: `grep` על קובץ מקור מוכיח שמשהו **נכתב**, לא
// שהוא **הגיע**. הדוגמה בבית הזה היא טקסט המחיר, שהיה תקין במודול
// ונפלט קטוע ב-154 קבצים (ראו faq-rendered.mjs).
//
// ── links ────────────────────────────────────────────────────────────
// 34 קישורי התחנות ב-/line-red. השורה שהגנה עליהם ספרה מופעים של
// `href="/station/` וקיבלה 34 — אבל **34 קישורים לאותה תחנה היו עונים
// 34 בדיוק כמו 34 נכונים**. כאן נבדקת הזהות: אותה קבוצה בדיוק כמו
// ב-STATIONS, ובאותו סדר.
//
// כלל 5ב: הפענוח קודם להשוואה. הגרסה הראשונה של הבדיקה הזאת דיווחה על
// שתי תחנות חסרות שהיו שלמות — `אהרונוביץ&#x27;` אינו `אהרונוביץ'`.
// זה בדיוק הבאג שהפיל את hours-live.mjs יום קודם, באותו שבוע.
//
// ── css ──────────────────────────────────────────────────────────────
// כלל טבעת המיקוד. השורה הקיימת בבלוק סופרת אותו ב-`app/globals.css`,
// כלומר במקור. ייבוא שיוסר מ-layout.tsx משאיר את הספירה על 1 ומוחק את
// הטבעת מכל העמודים בלי שאיש יראה. כאן נשלפים גיליונות הסגנון של
// העמוד עצמו ונבדק שההצהרה בתוכם.
//
// **ומה שהבדיקה הזאת אינה אומרת:** שהטבעת נדלקת. הטריגר הוא `:focus`
// על מיקוד מקלדת אמיתי, ובחלונית הדפדפן של הסשן `document.hasFocus()`
// הוא false ו-`querySelectorAll(":focus")` מחזיר 0 גם כששדה הקלט הוא
// activeElement — כלומר הסביבה אינה יכולה לענות על השאלה. נמדד
// 08.11.2026. מה שכן נמדד שם: ההצהרה **מסוגלת** לגבור על ה-style
// המוטבע, והיא זקוקה ל-!important כדי לעשות זאת — בלעדיו הגבול נשאר
// rgb(208,208,220), כי `border: 1.5px solid #d0d0dc` יושב inline.
import { load } from "./load.mjs";

const BASE = process.argv.find((a) => /^https?:\/\//.test(a)) || process.env.BASE || "http://localhost:3011";
const mode = process.argv[2];

// מפענח אחד לכל הסקריפטים, ב-faq-rendered.mjs. כאן ישב עותק שני שלו,
// זהה — ושני עותקים זהים הם שני עותקים שייחלקו ביום שאחד מהם יתוקן.
const { decodeEntities } = await import("./faq-rendered.mjs");

async function links() {
  const m = await load();
  const raw = await (await fetch(`${BASE}/line-red`, { signal: AbortSignal.timeout(20000) })).text();
  const html = decodeEntities(raw);
  const names = [...html.matchAll(/href="\/station\/([^"]+)"/g)].map((x) => {
    const h = x[1];
    try { return decodeURIComponent(decodeURIComponent(h)); } catch { return decodeURIComponent(h); }
  });
  const uniq = [...new Set(names)];
  const ours = m.STATIONS.map((s) => s.name);
  const missing = ours.filter((n) => !uniq.includes(n));
  const extra = uniq.filter((n) => !ours.includes(n));
  const sameOrder = JSON.stringify(uniq) === JSON.stringify(ours);
  // בקרת קצה, כלל 9: הראשונה והאחרונה באוכלוסייה חייבות להופיע שתיהן,
  // אחרת הסריקה לא הגיעה עד הסוף. ובקרה שלילית: שם מומצא לא נמצא.
  const edges = uniq.includes(ours[0]) && uniq.includes(ours[ours.length - 1]);
  const negative = !uniq.includes("תחנת הדמיון");
  const control = ours.length === 34 && edges && negative;
  return { total: names.length, uniq: uniq.length, missing, extra, sameOrder, control };
}

// ── fares ────────────────────────────────────────────────────────────
// טקסט המחיר **המלא**, בכל 34 עמודי התחנה.
//
// זאת הטענה היחידה באתר שעולה לקורא כסף אם היא שגויה, וזה בדיוק המקום
// שבו הקטיעה קרתה: `FARE_ANSWER` נכתב כשרשור של שלוש תבניות ב-`+`,
// המודול היה תקין, ו-Next פלט אותו קטוע — "ומעבר לכך 14.5במשך 90בטווח" —
// **ב-154 קבצים מוכני רינדור**, כולל כל 34 עמודי התחנה ושני בלוקי
// ה-JSON-LD שגוגל קורא. שתי בדיקות עברו על הטקסט השבור: אחת השוותה
// את המודול לעצמו, והשנייה חיפשה "8 ₪" שנשאר שלם.
//
// `faq-rendered.mjs` נולד מזה והוא משווה טקסט מלא — אבל על **עמוד תחנה
// אחד**. הקטיעה פגעה ב-34. כאן נסגר ההפרש: 34 עמודים × 4 תשובות.
//
// הבקרה אינה "0". היא ששתי תשובות המחיר נמצאות בפועל בקבוצה שהושוותה:
// בלעדיה אפשר להשוות 136 מחרוזות נכונות שאינן המחיר, ולקבל 0 מושלם.
async function fares() {
  const { visible, jsonLd } = await import("./faq-rendered.mjs");
  const m = await load();
  const answers = m.STATION_FAQ.map((f) => f.a);
  // הבקרה שמכוונת את הבדיקה לשאלה הנכונה
  const coversFare = answers.includes(m.FARE_ANSWER) && answers.includes(m.SURCHARGE_ANSWER);

  let pages = 0, compared = 0, missVis = 0, missLd = 0, seen = 0;
  const bad = [];
  for (const st of m.STATIONS) {
    const res = await fetch(`${BASE}/station/${encodeURIComponent(st.name)}`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) { bad.push(`${st.name} · HTTP ${res.status}`); continue; }
    const html = decodeEntities(await res.text());
    pages++;
    const vis = visible(html);
    if (vis.includes("הקו האדום")) seen++;
    for (const a of answers) {
      compared++;
      if (!vis.includes(a)) { missVis++; bad.push(`${st.name} · לא נראה: ${a.slice(0, 40)}`); }
    }
    const faq = jsonLd(html).find((x) => x["@type"] === "FAQPage");
    for (const it of faq?.mainEntity ?? []) {
      const text = it?.acceptedAnswer?.text ?? "";
      if (!text || !vis.includes(text)) { missLd++; bad.push(`${st.name} · ב-JSON-LD ואינו נראה: ${(it?.name ?? "").slice(0, 30)}`); }
    }
  }
  const control = coversFare && pages === 34 && seen === 34 && compared === 136;
  return { pages, compared, missVis, missLd, control, coversFare, bad };
}

async function css() {
  const PAGES = ["/", "/line-red", "/map", "/hours"];
  let served = 0, controls = 0, sheets = 0;
  for (const p of PAGES) {
    const html = await (await fetch(BASE + p, { signal: AbortSignal.timeout(20000) })).text();
    const hrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((x) => x[1]);
    let hit = false, ctl = false;
    for (const h of hrefs) {
      sheets++;
      const text = (await (await fetch(h.startsWith("http") ? h : BASE + h)).text()).replace(/\s+/g, " ");
      if (/input:focus[\s\S]{0,120}border-color:\s*#b04050/.test(text)) hit = true;
      // הבקרה היא הצהרה אחרת שידוע שיושבת באותם גיליונות. בלעדיה
      // "לא נמצא" מתוך גיליון ריק נראה כמו כלל שנמחק.
      if (/box-sizing/.test(text) || /Rubik/.test(text)) ctl = true;
    }
    if (hit) served++;
    if (ctl) controls++;
  }
  return { pages: PAGES.length, served, controls, sheets };
}

if (mode === "links") {
  const r = await links();
  if (process.argv.includes("count"))
    console.log("%d · %d · %d · %s · בקרה: %s", r.missing.length, r.extra.length, r.uniq, r.sameOrder ? "סדר זהה" : "סדר שונה", r.control ? "כן" : "לא");
  else {
    console.log("קישורים %d · ייחודיים %d · סדר זהה: %s", r.total, r.uniq, r.sameOrder ? "כן" : "לא");
    for (const n of r.missing) console.log("  ✗ חסרה מהעמוד: %s", n);
    for (const n of r.extra) console.log("  + בעמוד ואינה במודול: %s", n);
    console.log("בקרה (קצוות + שם מומצא): %s", r.control ? "כן" : "לא");
  }
  process.exit(!r.missing.length && !r.extra.length && r.sameOrder && r.control ? 0 : 1);
} else if (mode === "fares") {
  const r = await fares();
  if (process.argv.includes("count"))
    console.log("%d · %d · %d · %d · בקרה: %s", r.missVis, r.missLd, r.pages, r.compared, r.control ? "כן" : "לא");
  else {
    console.log("עמודים %d · השוואות %d · חסר בנראה %d · JSON-LD שאינו נראה %d", r.pages, r.compared, r.missVis, r.missLd);
    for (const b of r.bad.slice(0, 12)) console.log("  ✗ %s", b);
    console.log("שתי תשובות המחיר בקבוצה שהושוותה: %s · בקרה: %s", r.coversFare ? "כן" : "לא", r.control ? "כן" : "לא");
  }
  process.exit(!r.missVis && !r.missLd && r.control ? 0 : 1);
} else if (mode === "css") {
  const r = await css();
  if (process.argv.includes("count"))
    console.log("%d/%d · גיליונות %d · בקרה: %d", r.served, r.pages, r.sheets, r.controls);
  else
    console.log("כלל הטבעת מוגש ב-%d מתוך %d עמודים · %d גיליונות נשלפו · בקרה ב-%d", r.served, r.pages, r.sheets, r.controls);
  process.exit(r.served === r.pages && r.controls === r.pages ? 0 : 1);
} else {
  console.log("שימוש: served.mjs links|fares|css [count] [base-url]");
  process.exit(2);
}
