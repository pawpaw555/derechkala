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
import { pathToFileURL } from "node:url";
import { load } from "./load.mjs";
import { liveText } from "./net.mjs";

// רק ארגומנט שנראה ככתובת נחשב לבסיס. `node faq-rendered.mjs count`
// לקח קודם את המילה "count" ככתובת, ה-fetch נפל, והסקריפט מת בשקט —
// אותה מחלקה בדיוק שתוקנה ב-net.mjs, הפעם בטיפול בארגומנטים.
const urlArg = process.argv.slice(2).find((a) => /^https?:\/\//.test(a));
const BASE = urlArg || process.env.BASE || "http://localhost:3011";
const STATION = "/station/%D7%90%D7%91%D7%90%20%D7%94%D7%9C%D7%9C";

/**
 * פענוח ישויות HTML. **ישויות מספריות קודם לישויות בשם**, ו-`&amp;`
 * אחרון — אחרת `&amp;#8211;` מפוענח פעמיים.
 *
 * הגרסה הראשונה כאן כיסתה ארבע ישויות בשם בלבד. זה החזיק כאן במקרה,
 * אבל אותה חסרה הפילה את `hours-live.mjs` ב-08.11: דנקל כותבת את אותו
 * מקף פעם כתו ופעם כ-`&#8211;`, והפיצול איבד מסלול אחד מתוך חמישה.
 * כלל 5ב — הפענוח קודם לכל פעולה, גם להשוואה וגם לפיצול.
 *
 * מיוצא כדי שיהיה מפענח אחד ולא שניים שנחלקים בשקט.
 */
export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

async function text(path) {
  const html = await liveText(`השרת המקומי ${path}`, BASE + path, {
    signal: AbortSignal.timeout(20000),
  });
  return decodeEntities(html);
}

/** בלוקי ה-JSON-LD של העמוד, מפורסרים. */
export function jsonLd(html) {
  const out = [];
  for (const [, body] of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  )) {
    try {
      const d = JSON.parse(body);
      for (const item of Array.isArray(d) ? d : [d]) out.push(item);
    } catch {}
  }
  return out;
}

/**
 * המסמך **הנראה**: ה-HTML בלי בלוקי ה-JSON-LD, כטקסט.
 *
 * זאת הנקודה שבה הבדיקה הזאת נכשלה קודם. היא שאלה "האם המחרוזת קיימת
 * ב-HTML" — ומחרוזת שיושבת רק ב-JSON-LD עונה כן. כלומר אם הבלוק הנראה
 * היה נשבר לגמרי, הבדיקה הייתה עוברת. נוכחות אינה מיקום.
 *
 * מיוצא כדי שבדיקות אחרות ישאלו "האם זה **נראה**" באותו כלי בדיוק.
 * `addresses.mjs rendered` מייבא אותו; מימוש שני היה נפרד ממנו בשקט.
 */
export function visible(html) {
  const stripped = html.replace(
    /<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,
    " "
  );
  return stripped.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

/**
 * שני העמודים שנושאים FAQPage: שם ה-FAQ יושב **פעמיים** — פעם גלוי
 * לקורא ופעם ב-JSON-LD שגוגל קורא — ואין קשר מובנה ביניהם.
 *
 * הפער הזה נמסר על ידי הסשן שעבד על המפה: ב-/map שני העותקים נכתבים
 * ביד בשני קבצים (MapContent.tsx ו-map/page.tsx), והבדיקה כאן לא נגעה
 * בהם בכלל. כל פריט ב-JSON-LD חייב להופיע במסמך הנראה — אחרת גוגל
 * מקבל תשובה שהקורא אינו רואה, או להפך.
 */
export function compareFaqPage(page, html, visibleText) {
  const gaps = [];
  const faq = jsonLd(html).find((x) => x["@type"] === "FAQPage");
  if (!faq) return { gaps: [`${page} · אין FAQPage ב-JSON-LD`], pairs: 0, found: false };
  const items = faq.mainEntity ?? [];
  if (!items.length) return { gaps: [`${page} · FAQPage ריק`], pairs: 0, found: false };
  for (const item of items) {
    const name = item?.name ?? "";
    const answer = item?.acceptedAnswer?.text ?? "";
    if (!name || !visibleText.includes(name))
      gaps.push(`${page} · שאלה שאינה גלויה: ${name.slice(0, 40)}`);
    if (!answer || !visibleText.includes(answer))
      gaps.push(`${page} · תשובה שאינה גלויה: ${name.slice(0, 30)}`);
  }
  return { gaps, pairs: items.length * 2, found: true };
}

// הגוף רץ רק כשהקובץ מופעל ישירות, כדי שבדיקה תוכל לייבא את
// compareFaqPage ולהאכיל אותה קלט מבוקר בלי להריץ את כל השליפות.
const isMain = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;
if (!isMain) {
  // ייבוא בלבד. שום שליפה, שום יציאה.
} else {

const m = await load();
const [station, home, map, redline] = await Promise.all([
  text(STATION), text("/"), text("/map"), text("/line-red"),
]);
const vis = {
  station: visible(station),
  home: visible(home),
  map: visible(map),
  redline: visible(redline),
};

const missing = [];
let checked = 0;

for (const { q, a } of m.STATION_FAQ) {
  checked++;
  if (!vis.station.includes(a)) missing.push(`עמוד תחנה · ${q}`);
}
// שתי המחרוזות שעמוד הבית חולק עם עמודי התחנה. שאר ה-FAQ של עמוד הבית
// יושב בתוך HomeContent ואינו מיוצא, ולכן אין לו צד שני להשוות אליו.
for (const [name, a] of [["FARE_ANSWER", m.FARE_ANSWER], ["SURCHARGE_ANSWER", m.SURCHARGE_ANSWER]]) {
  checked++;
  if (!vis.home.includes(a)) missing.push(`עמוד הבית · ${name}`);
}


// פילוג סוגי התחנות — המשפט **השלם**, בטקסט הנראה, בשלושת הצרכנים.
//
// STATION_TYPE_BREAKDOWN נגזר מהרשומות ועובר כ-prop לשלושה עמודים.
// השורה שהגנה עליו בבלוק חיפשה את תת-המחרוזת "23 עיליות" ב-HTML הגולמי
// של שניים מהם. שלוש חולשות באותה שורה: עמוד הבית הוא צרכן שלישי ולא
// נבדק כלל; תת-מחרוזת עוברת גם אם סעיף השיקוע נקטע — בדיוק מחלקת
// הקטיעה שהקובץ הזה נולד ממנה; ו-HTML גולמי עונה "כן" גם למחרוזת
// שיושבת רק במטען ה-RSC. כאן זה המשפט כולו, אחרי הסרת ה-JSON-LD.
for (const [page, v] of [["עמוד הבית", vis.home], ["/map", vis.map], ["/line-red", vis.redline]]) {
  checked++;
  if (!v.includes(m.STATION_TYPE_BREAKDOWN))
    missing.push(`${page} · פילוג סוגי התחנות אינו גלוי`);
}

let faqPages = 0;
for (const [page, html, v] of [["/map", map, vis.map], ["עמוד תחנה", station, vis.station]]) {
  const { gaps, pairs, found } = compareFaqPage(page, html, v);
  if (found) faqPages++;
  checked += pairs;
  missing.push(...gaps);
}

// הבקרה: מחרוזת שידוע בוודאות שקיימת בכל שלושת העמודים, ושני עמודים
// נושאי FAQPage. אם אחד מהם נעדר, ה-fetch נכשל או המבנה השתנה, וה-0
// שלפניו חסר משמעות.
const control =
  vis.station.includes("הקו האדום") &&
  vis.home.includes("הקו האדום") &&
  vis.map.includes("הקו האדום") &&
  vis.redline.includes("הקו האדום") &&
  // בלי זה, STATION_TYPE_BREAKDOWN שאינו מיוצא מ-load.mjs היה
  // undefined, שלוש ההשוואות היו נכשלות, והכשל היה נראה כמו תקלה
  // בעמודים. הוא נוסף ל-load.mjs ב-08.11 בדיוק בגלל זה.
  typeof m.STATION_TYPE_BREAKDOWN === "string" &&
  m.STATION_TYPE_BREAKDOWN.length > 20 &&
  faqPages === 2;

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

}
