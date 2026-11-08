#!/usr/bin/env node
// משווה את שעות השירות שהאתר מחזיק למה שדנקל מפרסמת, עכשיו.
//
// למה חיה ולא רשומה: דנקל כותבת בתחתית העמוד ששעות שישי ומוצ״ש
// **משתנות בהתאם לזמני כניסת/יציאת שבת**. כלומר אלה אינן עובדות
// קבועות אלא ערכים שזזים לאורך השנה, ומספר שנכתב כאן פעם אחת יתיישן
// בלי שאיש ישים לב. זה בדיוק מה שקרה ל-15:40 ול-19:45, ששכבו בקוד עד
// 08.11.2026 ולא הופיעו בשום שורה אצל דנקל.
//
// דנקל מוגשת מהשרת ולכן אפשר. עמוד שעות הפעילות נבדק ב-08.11.2026:
// 87KB, ואחרי הסרת תגיות 3,048 תווים שבהם כל חמש השורות קריאות.
//
// **דנקל אינה נותנת מספר אחד** — חמישה מסלולים לפי כיוון, כל אחד עם
// שעה משלו. לכן ההשוואה היא מול הקצה השמרני: המוקדם שבאחרונות של
// שישי, והמאוחר שבראשונות של מוצ״ש. אם מסלול כלשהו יוקדם, הבדיקה
// תיפול — וזה הכיוון שבו טעות עולה למשתמש שמגיע לתחנה ריקה.
//
// מדפיס את מה שנמצא ולא "כן/לא", כך ששינוי לוח זמנים אצל המפעילה
// מופיע בבלוק כשעה החדשה ולא כסתם כשל.
import { load } from "./load.mjs";
import { liveText } from "./net.mjs";

const HOURS_URL = "https://www.dankal.co.il/שעות-פעילות-ולוחות-זמנים/";

const hhmmToMins = (s) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
const minsToHhmm = (n) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

const html = await liveText("דנקל", HOURS_URL, {
  headers: { "user-agent": "derechkala-verify/1.0" },
  signal: AbortSignal.timeout(60000),
});

// כלל 5ב: הפענוח קודם לכל פעולה, ולא רק להשוואה — כאן הפעולה היא
// הפיצול למסלולים. נמדד 08.11.2026 שדנקל כותבת את אותו מקף בשתי
// צורות באותו עמוד: R1 ו-R3 נושאים אותו כתו, ו-**R2 נושא אותו
// כישות `&#8211;`**. פענוח שמכסה רק ישויות בשם היה מפספס בדיוק מסלול
// אחד מתוך חמישה — והערכים היו נראים נכונים, כי R2 אינו הקצה.
// `&amp;` אחרון בכוונה, אחרת `&amp;#8211;` היה מפוענח פעמיים.
const txt = html
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
  .replace(/&ndash;|&mdash;/g, "–")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ");

// כל מסלול הוא בלוק שמתחיל ב-"R<ספרה> –". הפיצול הזה הוא מה שמונע
// מביטוי של מסלול אחד לבלוע שעה של המסלול שאחריו.
const blocks = txt.split(/R\d\s*[–-]\s*/).slice(1);

// השעתיים נשלפות בתוך הבלוק בלבד: קטע שישי נגמר היכן שמתחיל מוצ״ש.
const friLasts = [];
const satFirsts = [];
for (const b of blocks) {
  const satAt = b.search(/מוצ["״]ש/);
  const friPart = satAt === -1 ? b : b.slice(0, satAt);
  const satPart = satAt === -1 ? "" : b.slice(satAt);
  const fri = friPart.match(/ימי שישי[\s\S]*?רכבת אחרונה\s*(\d{1,2}:\d{2})/);
  if (fri) friLasts.push(hhmmToMins(fri[1]));
  const sat = satPart.match(/רכבת ראשונה\s*(\d{1,2}:\d{2})/);
  if (sat) satFirsts.push(hhmmToMins(sat[1]));
}

// הבקרה: מבנה העמוד, לא הערכים. אם לא נמצאו חמישה בלוקים ולפחות ארבע
// שעות שישי, הפרסר נשבר — ואז "אין התאמה" הוא כשל של הכלי ולא של
// לוח הזמנים. בלי זה, עמוד שהשתנה היה נראה בדיוק כמו שעה שזזה.
const control =
  /שעות פעילות ולוחות זמנים/.test(txt) &&
  blocks.length >= 5 &&
  friLasts.length >= 4 &&
  satFirsts.length >= 3;

const m = await load();
const d = m.data || m;

const foundFri = friLasts.length ? Math.min(...friLasts) : null;
const foundSat = satFirsts.length ? Math.max(...satFirsts) : null;

const line =
  `${foundFri === null ? "—" : minsToHhmm(foundFri)} · ` +
  `${foundSat === null ? "—" : minsToHhmm(foundSat)} · ` +
  `מסלולים ${blocks.length} · בקרה: ${control ? "כן" : "לא"}`;
console.log(line);

if (process.argv[2] === "verbose") {
  console.log("  שישי, כל המסלולים :", friLasts.map(minsToHhmm).join(" · ") || "—");
  console.log("  מוצ״ש, כל המסלולים:", satFirsts.map(minsToHhmm).join(" · ") || "—");
  console.log("  אצלנו שישי %s · בדנקל המוקדם %s", minsToHhmm(d.FRIDAY_LAST_MINS), foundFri === null ? "—" : minsToHhmm(foundFri));
  console.log("  אצלנו מוצ״ש %s · בדנקל המאוחר %s", minsToHhmm(d.SATURDAY_NIGHT_FIRST_MINS), foundSat === null ? "—" : minsToHhmm(foundSat));
  console.log("  %s", HOURS_URL);
}

const ok =
  control && foundFri === d.FRIDAY_LAST_MINS && foundSat === d.SATURDAY_NIGHT_FIRST_MINS;
process.exit(ok ? 0 : 1);
