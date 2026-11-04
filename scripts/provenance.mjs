#!/usr/bin/env node
// סופר טענות בלי מקור. חמש תקרות שיכולות רק לרדת.
//
// הבלוק אינו יכול לדעת אם עובדה נכונה — הוא כן יכול לדעת אם היא נושאת
// מקור. 23 כללים כתובים לא עצרו אף טעות ביום שבו נכתבו שלוש; מספר
// שנופל כשהוא עולה כן. כל אימות שנעשה מוריד תקרה, והורדת תקרה נועלת
// את ההישג: אי אפשר להוסיף טענה חדשה בלי מקור, גם לא בטעות.
//
// התקרות עצמן יושבות בבלוק כארגומנט, לא כאן. כלל 6.
import { load } from "./load.mjs";

const m = await load();
const content = Object.values(m.STATION_CONTENT);
const pois = content.flatMap((c) => c.pois ?? []);

const FIELDS = {
  // landmarks ו-pois: זמן הליכה ושם שנכתבו ביד. עם קואורדינטה המרחק
  // נגזר, ואז יש שתי טענות לאמת במקום אחת לכל רשומה.
  landmarks: [m.LANDMARKS.filter((l) => l.lat === undefined).length, m.LANDMARKS.length],
  pois: [pois.filter((p) => p.lat === undefined).length, pois.length],
  // places: הדירוג קיים ונמדד. single פירושו "לא הוצלב".
  single: [m.PLACES.filter((p) => p.verification === "single").length, m.PLACES.length],
  // כתובות ועובדות שם: מוגשות לגוגל ולקורא בלי שדה מקור בכלל.
  address: [content.filter((c) => !c.addressSource).length, content.length],
  namefact: [content.filter((c) => c.nameFact && !c.nameFactSource).length, content.length],
};

// בקרה חיובית: 22 המקומות נושאים source. אם זה נופל, הטעינה שבורה
// ולא העולם, וכל חמשת המספרים למעלה חסרי משמעות.
const CONTROL = m.PLACES.filter((p) => p.source).length;

const key = process.argv[2];
if (key === "control") {
  console.log(CONTROL);
} else if (key && FIELDS[key]) {
  console.log(FIELDS[key][0]);
} else if (key === "report") {
  for (const [k, [bad, all]] of Object.entries(FIELDS)) {
    console.log("%s %d / %d", k.padEnd(10), bad, all);
  }
  console.log("%s %d (חייב 22)", "בקרה".padEnd(10), CONTROL);
} else {
  console.log(Object.values(FIELDS).map(([bad]) => bad).join(" "));
}
