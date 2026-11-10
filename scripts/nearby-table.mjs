// עובדת מקום יושבת בשני מקומות: `nearbyPlaces` של התחנה וטבלת
// LANDMARKS. כלל 4 — תיקון מופע אחד מתוך שניים הוא בדיוק הכשל שסעיף ג
// נולד ממנו (שוק הפשפשים הוזז בטבלה ולא במערך של התחנה, 31.10).
//
// ב-10.11 תיאטרון המסילה עבר מהתחנה המרכזית לפינסקר, והבדיקה הזאת היא
// מה שמונע שהמעבר ייעשה בצד אחד בלבד. היא לא הייתה קיימת כשסעיף ג נולד,
// ולכן הסתירה ההיסטורית **נספרת ואינה נסלחת**: הציפייה היא 1, ולא 0,
// והיא יכולה רק לרדת. סתירה שנייה תפיל את השורה.
//
// המספר השני והשלישי הם האוכלוסייה: אזכור שיימחק בשקט יוריד אותם.
// "בלי רשומה" הם שמות ב-nearbyPlaces שאינם בטבלת נקודות הציון בכלל —
// מקומות שהגיעו מ-pois או נכתבו ישר במערך, ואין להם מה לסתור.
import { load } from "./load.mjs";

const m = await load();
const byName = new Map(m.LANDMARKS.map((l) => [l.name, l]));

let bad = 0, pop = 0, noRecord = 0;
const lines = [];
for (const s of m.STATIONS) {
  for (const p of s.nearbyPlaces ?? []) {
    pop++;
    const l = byName.get(p);
    if (!l) { noRecord++; continue; }
    if (l.stationName !== s.name) {
      bad++;
      lines.push(`${p}: ${s.name} מונה אותו, הטבלה אומרת ${l.stationName}`);
    }
  }
}

if (!m.STATIONS.length || !m.LANDMARKS.length) {
  console.error("nearby-table: אוכלוסייה ריקה — הטוען שבור, לא הנתונים");
  process.exit(2);
}

if (process.argv[2] === "count") {
  console.log(`${bad} · ${pop} · ${noRecord}`);
} else {
  console.log(`סתירות ${bad} · אזכורים ${pop} · בלי רשומה ${noRecord}`);
  for (const l of lines) console.log("   ✗ " + l);
}
