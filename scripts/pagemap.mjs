#!/usr/bin/env node
// מפת העמודים במלאי מול הקוד.
//
// הטבלה ב-claim-inventory נוקבת במספר השאלות בכל עמוד. המספרים האלה
// מתיישנים בשקט: שאלה שישית נוספה ל-/map ב-7f41781, והשורה המשיכה
// לומר חמש עד שסשן אחר שם לב ודיווח.
//
// זה נכתב אחרי שנשקלה ונדחתה האפשרות להרחיב את audit-claims.mjs
// לקבצי .md. נמדד מה היה קורה: שלוש "סתירות", **כולן שקריות** —
// "24 עיליות", "67 LANDMARKS" ו-"136 pois" הם תיעוד של טעויות
// שתוקנו. ציטוט של טעות עבר אינו טענה, וסורק שצועק על תיעוד נהפך
// לסורק שמתעלמים ממנו. לכן בדיקה ממוקדת ולא סריקה רחבה.
//
// ול-audit-claims ממילא אין תבנית למילה "שאלות" — הוא לא היה תופס
// את זה גם אילו סרק את הקובץ.
import { readFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const INVENTORY = "seo-data/claim-inventory-2026-11-04.md";

/** העמוד בטבלה → הקובץ שמחזיק את ה-FAQ שלו. */
const PAGES = [
  ["/", "app/HomeContent.tsx"],
  ["/map", "app/map/MapContent.tsx"],
  ["/line-red", "app/line-red/RedLineContent.tsx"],
  ["/hours", "app/hours/HoursContent.tsx"],
];

const md = readFileSync(ROOT + INVENTORY, "utf8");
const bad = [];
let checked = 0;

for (const [page, file] of PAGES) {
  const row = md.split("\n").find((l) => l.startsWith(`| \`${page}\` |`));
  if (!row) { bad.push([page, "אין שורה בטבלה"]); continue; }
  const stated = row.match(/(\d+)\s+שאלות/)?.[1];
  if (!stated) { bad.push([page, "אין מספר שאלות בשורה"]); continue; }
  const src = readFileSync(ROOT + file, "utf8");
  const actual = (src.match(/\{ q:/g) || []).length;
  checked++;
  if (Number(stated) !== actual)
    bad.push([page, `הטבלה אומרת ${stated} · בקוד ${actual} (${file})`]);
}

// הבקרה: ארבעה עמודים נבדקו. פחות מזה והטבלה או הנתיבים השתנו,
// ו-0 סתירות מתוך 0 עמודים נראה כמו מפה תקינה.
if (process.argv[2] === "count") {
  console.log("%d/%d", bad.length, checked);
} else {
  for (const [p, why] of bad) console.log("✗ %s — %s", p, why);
  console.log("%d סתירות · %d עמודים נבדקו", bad.length, checked);
}
process.exit(bad.length === 0 && checked === PAGES.length ? 0 : 1);
