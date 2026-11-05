#!/usr/bin/env node
// משווה כל תשובת FAQ כפי שהיא במודול לתשובה כפי שהיא מוגשת לקורא.
//
// נולד מכשל אמיתי: FARE_ANSWER נכתב כשלוש תבניות מחורזות ב-`+`. הקובץ
// היה תקין ו-Node העריך אותו ל-184 תווים נכונים, אבל ה-build של Next
// פלט אותו קטוע — "ומעבר לכך 14.5במשך 90בטווח" — ב-154 קבצים מוכני
// רינדור, כולל ה-JSON-LD. הבדיקות שהיו אז לא תפסו את זה: האחת השוותה
// את המודול לעצמו, והשנייה חיפשה "8 ₪" בעמוד — מחרוזת שנשארה שלמה.
//
// לכן הבדיקה כאן היא היחידה בבלוק שמשווה שני צדדים שונים: מה שהקוד
// מחזיק מול מה שהשרת הגיש. השוואה מלאה, לא נוכחות של מספר.
import { load } from "./load.mjs";

const BASE = process.argv[2] || process.env.BASE || "http://localhost:3011";
const STATION = "/station/%D7%90%D7%91%D7%90%20%D7%94%D7%9C%D7%9C";

async function text(path) {
  const res = await fetch(BASE + path, { signal: AbortSignal.timeout(20000) });
  const html = await res.text();
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

const m = await load();
const [station, home] = await Promise.all([text(STATION), text("/")]);

const missing = [];
let checked = 0;

for (const { q, a } of m.STATION_FAQ) {
  checked++;
  if (!station.includes(a)) missing.push(`עמוד תחנה · ${q}`);
}
// שתי המחרוזות שעמוד הבית חולק עם עמודי התחנה. שאר ה-FAQ של עמוד הבית
// יושב בתוך HomeContent ואינו מיוצא, ולכן אין לו צד שני להשוות אליו.
for (const [name, a] of [["FARE_ANSWER", m.FARE_ANSWER], ["SURCHARGE_ANSWER", m.SURCHARGE_ANSWER]]) {
  checked++;
  if (!home.includes(a)) missing.push(`עמוד הבית · ${name}`);
}

// הבקרה: מחרוזת שידוע בוודאות שקיימת בכל אחד משני העמודים. אם היא
// נעדרת, ה-fetch נכשל וה-0 שלפניה חסר משמעות.
const control = station.includes("הקו האדום") && home.includes("הקו האדום");

if (process.argv.includes("count") || process.env.COUNT) {
  console.log("%d/%d · בקרה: %s", missing.length, checked, control ? "כן" : "לא");
} else {
  for (const x of missing) console.log("✗ %s", x);
  console.log("%d חסרות מתוך %d · בקרה: %s", missing.length, checked, control ? "כן" : "לא");
  if (missing.length) {
    const a = m.FARE_ANSWER;
    console.log("\nלהשוואה — מה שהמודול מחזיק:\n  %s", a);
  }
}

process.exit(missing.length === 0 && control ? 0 : 1);
