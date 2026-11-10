/**
 * בודק את `app/lib/railLines.json` — בלי רשת, בכל הרצה של הבלוק.
 *
 * שלושה מספרים: קטעים, נקודות, והמרחק של **התחנה הרחוקה ביותר** מהקו
 * המצויר. השלישי הוא הלב: הוא מה שהפיל את הניסיון הראשון לקחת רק
 * מסילות עם שם — 20 מתוך 24 התחנות נפלו אז מעל קילומטר מהקו, כלומר
 * הקו לא עבר איפה שהרכבת עוברת. קו שאינו עובר בתחנות אינו קו הרכבת,
 * והמספר הזה הוא ההבדל בין נתון מאומת לציור יפה.
 *
 * הוא גם בקרה חיובית על עצמו: אם הקובץ יתרוקן או ייחתך, המרחק יקפוץ
 * מיד ולא יישאר 0 על אוכלוסייה ריקה.
 *
 *     node scripts/rail-check.mjs        # מפורט
 *     node scripts/rail-check.mjs count  # "קטעים · נקודות · מ׳"
 */
import { readFile } from "node:fs/promises";

const M_PER_DEG = 111320;
const d = JSON.parse(await readFile("app/lib/railLines.json", "utf8"));

const lines = d.lines ?? [];
const stations = d.stations ?? [];
if (!lines.length || !stations.length) {
  console.error("rail-check: הקובץ ריק — הנתון נמחק, לא העולם");
  process.exit(2);
}

/** מרחק נקודה לקטע, במעלות. הקירוב מספיק: הסף הוא 120 מ׳, לא 1 מ׳. */
function distToSegments(lat, lng) {
  let best = Infinity;
  for (const line of lines) {
    for (let i = 0; i < line.length - 1; i++) {
      const [x1, y1] = line[i];
      const [x2, y2] = line[i + 1];
      const dx = x2 - x1, dy = y2 - y1;
      let dist;
      if (dx === 0 && dy === 0) {
        dist = Math.hypot(lng - x1, lat - y1);
      } else {
        const t = Math.max(0, Math.min(1, ((lng - x1) * dx + (lat - y1) * dy) / (dx * dx + dy * dy)));
        dist = Math.hypot(lng - (x1 + t * dx), lat - (y1 + t * dy));
      }
      if (dist < best) best = dist;
    }
  }
  return best * M_PER_DEG;
}

let worst = { name: "", metres: 0 };
for (const st of stations) {
  const m = distToSegments(st.lat, st.lng);
  if (m > worst.metres) worst = { name: st.name, metres: m };
}

const points = lines.reduce((a, l) => a + l.length, 0);
if (process.argv[2] === "count") {
  console.log(`${lines.length} · ${points} · ${Math.round(worst.metres)} מ׳`);
} else {
  console.log(`קטעים ${lines.length} · נקודות ${points} · תחנות ${stations.length}`);
  console.log(`הרחוקה ביותר מהקו: ${worst.name} — ${Math.round(worst.metres)} מ׳`);
  console.log(`מקור: ${d.source}`);
  console.log(`רישיון: ${d.licence}`);
}
