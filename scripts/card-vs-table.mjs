// כרטיס הסטטוס ב-/hours מול הטבלה שמתחתיו, באותו מסך ובאותה דקה.
//
// זאת המחלקה של הבאג ש-1aabe49 תיקן, ולא המופע. שם isShabat חושב מ-21:00
// קשיח בעוד השירות מתחדש ב-SATURDAY_NIGHT_FIRST_MINS, והכרטיס הכריז "לא
// פועלת בשבת" 75 דקות בכל שבוע בזמן שהמתכנן הציע יציאות חיות. המופע
// נסגר. המחלקה — הכרטיס אומר דבר אחד והעמוד עצמו מבטיח אחר — לא נמדדה
// מעולם, ו-service-edges.mjs אינו מודד אותה: הוא משווה את isOperating
// למתכנן, ושניהם מסכימים 10,080 מתוך 10,080. הסתירה כאן היא בין שתי
// אמירות של **העמוד**, ושתיהן נכונות לשיטתן.
//
// מה נמדד: בכל אחת מ-10,080 הדקות בשבוע, שלושת הענפים של הכרטיס (שורות
// 101–118 ב-HoursContent.tsx) מול שורת הטבלה של אותו יום (LAST_BY_DAY,
// שורה 19). דקה נספרת כשהכרטיס אינו אומר "פועלת עכשיו" והטבלה עוד
// מבטיחה שירות באותה דקה.
//
// נמדד 08.11.2026: 32 דקות בשבוע, בשלושה סוגי יום —
//
//     ראשון–חמישי 23:55–23:59 (5 × 5)   הטבלה: עד 00:00, יציאה אחרונה 23:54
//     שישי        14:07–14:10 (4)       הטבלה: עד 14:10, יציאה אחרונה 14:06
//     שבת         23:57–23:59 (3)       הטבלה: עד 00:00, יציאה אחרונה 23:56
//
// כולן מאותו שורש: שעת סיום מוצהרת אינה חייבת ליפול על רשת היציאות.
// זה אותו פער שרשום בסעיף יג ב-open-items, וכאן יש לו מספר.
//
// **הכיוון הפוך מהבאג המקורי.** שם הכרטיס הכחיש רכבת שנסעה; כאן הכרטיס
// צודק והטבלה היא זו שמבטיחה יותר ממה שיש. הנזק קטן יותר אבל אמיתי:
// מי שקורא ב-23:56 "05:30–00:00" הולך לתחנה.
//
// הבקרה אינה "האם 32" — זאת הציפייה. הבקרה היא ששתי הרצות נוספות
// משחזרות את הבאג ההיסטורי מהמקור: hist מחזיר את 21:00 הקשיח **ואת**
// 19:45, ובשבת לבדה חייב לצאת 75 — המספר שרשום בהודעת הקומיט. אם הוא
// אינו 75, הסריקה אינה מודדת את המחלקה הנכונה וה-32 שלידו חסר משמעות.
//
// counts מדפיס: דקות עכשיו · דקות ב-hist · מתוכן בשבת
import { load } from "./load.mjs";

const d = await load();
const {
  getDayType, isOperating, hhmm,
  SERVICE_FIRST_MINS, FRIDAY_LAST_MINS, SATURDAY_NIGHT_FIRST_MINS, WEEKDAY_LAST_MINS,
} = d;

// MIDNIGHT בעמוד הוא hhmm(WEEKDAY_LAST_MINS % 1440) = "00:00". בתור גבול
// להשוואה זה 1440 ולא 0, אחרת כל יום חול היה יוצא "הטבלה אינה מבטיחה".
const MIDNIGHT_MINS = WEEKDAY_LAST_MINS % 1440 === 0 ? 1440 : WEEKDAY_LAST_MINS % 1440;
const LAST_SHOWN = { weekday: MIDNIGHT_MINS, friday: FRIDAY_LAST_MINS, saturday: MIDNIGHT_MINS };

const BASE = new Date("2026-11-01T00:00:00"); // ראשון
const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

// mode: "now" — המודל כפי שהוא. "hist" — isShabat מ-21:00 קשיח ושירות
// שמתחדש ב-19:45, כלומר העמוד כפי שהיה לפני 1aabe49.
function sweep(mode) {
  const satFirst = mode === "hist" ? 19 * 60 + 45 : SATURDAY_NIGHT_FIRST_MINS;
  const hits = [];
  let scanned = 0;
  for (let dow = 0; dow < 7; dow++) {
    for (let m = 0; m < 1440; m++) {
      const t = new Date(BASE);
      t.setDate(BASE.getDate() + dow);
      t.setHours(0, m, 0, 0);
      scanned++;
      const dayType = getDayType(t);
      const operating = isOperating(t);
      const isShabat =
        mode === "hist"
          ? dayType === "saturday" && t.getHours() < 21
          : dayType === "saturday" && m < satFirst;
      // שלושת הענפים, בדיוק בסדר שבו הכרטיס בודק אותם
      const head = isShabat ? "לא פועלת בשבת" : operating ? "פועלת עכשיו" : "לא פועלת כרגע";
      const firstShown = dayType === "saturday" ? satFirst : SERVICE_FIRST_MINS;
      const promised = m >= firstShown && m <= LAST_SHOWN[dayType];
      if (head !== "פועלת עכשיו" && promised) hits.push({ dow, m, head, dayType });
    }
  }
  return { hits, scanned };
}

function ranges(hits) {
  const out = [];
  for (const h of hits) {
    const prev = out[out.length - 1];
    if (prev && prev.dow === h.dow && prev.to === h.m - 1 && prev.head === h.head) prev.to = h.m;
    else out.push({ dow: h.dow, from: h.m, to: h.m, head: h.head, dayType: h.dayType });
  }
  return out;
}

const now = sweep("now");
const hist = sweep("hist");
const histSat = hist.hits.filter((h) => h.dow === 6 && h.head === "לא פועלת בשבת").length;

if (process.argv[2] === "counts") {
  console.log([now.hits.length, hist.hits.length, histSat].join(" · "));
} else {
  console.log("דקות סתירה בשבוע: %d מתוך %d שנסרקו", now.hits.length, now.scanned);
  for (const r of ranges(now.hits))
    console.log(
      "   %s %s–%s (%d׳) · \"%s\" · הטבלה מבטיחה עד %s",
      DAYS[r.dow], hhmm(r.from), hhmm(r.to), r.to - r.from + 1, r.head,
      hhmm(LAST_SHOWN[r.dayType] % 1440),
    );
  console.log("בקרה — העמוד לפני 1aabe49: %d בשבוע, מתוכן בשבת %d (חייב 75)", hist.hits.length, histSat);
}
