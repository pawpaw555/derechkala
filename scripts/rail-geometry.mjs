/**
 * מושך פעם אחת את גאומטריית מסילות רכבת ישראל באזור, מפשט אותה, ושומר
 * ל-`app/lib/railLines.json`. **לא רץ בזמן אמת ולא בבלוק.**
 *
 * **למה פעם אחת ולא בכל טעינה:** בבדיקת הנתונים ב-10.11.2026 Overpass
 * החזיר 502 ("at capacity") פעמיים מתוך חמש שאילתות. מפה שתלויה בו בזמן
 * בקשה היא מפה שלפעמים בלי רכבת, והמשתמש לא יידע למה.
 *
 * **ולמה כל המסילות ולא רק אלה שיש להן שם:** הניסיון הראשון לקח רק
 * קטעים עם `name` — 50 קטעים ו-5 KB, נראה נקי. ואז נמדד: **20 מתוך 24
 * תחנות רכבת ישראל באזור נפלו מחוץ לקו הזה** — סבידור מרכז 2.4 ק״מ,
 * ההגנה 6.1, קריית אריה 5.9 — כי כל מסדרון איילון מורכב מקטעים בלי שם.
 * הסינון הנכון הוא `usage=main`, שמוציא מסילות שירות ומסילות חצר.
 *
 * הפישוט הוא דגלס-פויקר בסף 15 מ׳: 4,537 נקודות יורדות ל-953, והקובץ
 * ל-19 KB. סף 30 מ׳ חוסך עוד 2.5 KB בלבד, ולכן אין סיבה לאבד דיוק.
 *
 * רישיון: ODbL. הנתון כאן **נגזר** ממסד OpenStreetMap, והייחוס מופיע
 * גם בקובץ עצמו וגם על המפה.
 *
 *     node scripts/rail-geometry.mjs
 */
import { writeFile } from "node:fs/promises";

const BBOX = [31.93, 34.68, 32.18, 34.98]; // דרום, מערב, צפון, מזרח
const TOL_M = 15;
const M_PER_DEG = 111320;
const OUT = "app/lib/railLines.json";
const UA = "derechkala-rail-geometry/1.0 (one-off import; https://derechkala.online)";

/** תחנות שכבר יש להן רשומה מאומתת ב-railStations.ts — לא מוכפלות כאן. */
const ALREADY = ["קריית אריה", "השלום", "סבידור", "וולפסון"];

/**
 * שרתי Overpass ציבוריים נופלים ל-502 "at capacity" באופן שגרתי — זה
 * קרה פעמיים בבדיקת הנתונים ועוד פעם בהרצה הראשונה של הסקריפט הזה.
 * לכן: שלושה מראות, והמתנה שמכפילה את עצמה. הסקריפט **נכשל ברעש**
 * ואינו כותב קובץ חלקי: קובץ נתונים חצי הוא גרוע מאין קובץ.
 */
const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.osm.jp/api/interpreter",
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function overpass(query) {
  let last = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const url of MIRRORS) {
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ data: query }),
          signal: AbortSignal.timeout(120000),
        });
        const text = await r.text();
        if (r.ok && text.trimStart().startsWith("{")) return JSON.parse(text);
        last = `${url} → ${r.status}: ${text.slice(0, 80).replace(/\s+/g, " ")}`;
      } catch (err) {
        last = `${url} → ${err.message}`;
      }
      console.error(`   ✗ ${last}`);
      await sleep(2000);
    }
    await sleep(5000 * (attempt + 1));
  }
  throw new Error(`כל המראות נכשלו. האחרון: ${last}`);
}

/** דגלס-פויקר. התואם לנקודות [lon, lat] במעלות. */
function simplify(points, tol) {
  if (points.length < 3) return points;
  const perp = (p, a, b) => {
    const [x0, y0] = p, [x1, y1] = a, [x2, y2] = b;
    const dx = x2 - x1, dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.hypot(x0 - x1, y0 - y1);
    const t = Math.max(0, Math.min(1, ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(x0 - (x1 + t * dx), y0 - (y1 + t * dy));
  };
  let dmax = 0, idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perp(points[i], points[0], points[points.length - 1]);
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax > tol) {
    return simplify(points.slice(0, idx + 1), tol).slice(0, -1).concat(simplify(points.slice(idx), tol));
  }
  return [points[0], points[points.length - 1]];
}

const [s, w, n, e] = BBOX;
const ways = await overpass(
  `[out:json][timeout:120];way(${s},${w},${n},${e})["railway"="rail"]["usage"="main"];out geom;`
);
const lines = ways.elements
  .map(el => simplify((el.geometry ?? []).map(p => [p.lon, p.lat]), TOL_M / M_PER_DEG))
  .filter(l => l.length > 1)
  .map(l => l.map(([lon, lat]) => [Number(lon.toFixed(5)), Number(lat.toFixed(5))]));

if (lines.length < 100) throw new Error(`רק ${lines.length} קטעים — התשובה חלקית, לא נכתב דבר`);

await sleep(1500); // מדיניות Overpass
const nodes = await overpass(
  `[out:json][timeout:120];node(${s},${w},${n},${e})["railway"="station"]["train"="yes"];out tags center;`
);
const stations = nodes.elements
  .map(el => ({ name: el.tags?.["name:he"] || el.tags?.name, lat: el.lat, lng: el.lon }))
  .filter(st => st.name && !ALREADY.some(a => st.name.includes(a)))
  .map(st => ({ name: st.name, lat: Number(st.lat.toFixed(5)), lng: Number(st.lng.toFixed(5)) }))
  .sort((a, b) => b.lat - a.lat);

const out = {
  source: "OpenStreetMap — way[railway=rail][usage=main] ו-node[railway=station][train=yes]",
  licence: "ODbL — © OpenStreetMap contributors. נתון נגזר, לא גולמי.",
  fetched: new Date().toISOString().slice(0, 10),
  bbox: BBOX,
  simplifiedMetres: TOL_M,
  note: "נוצר על ידי scripts/rail-geometry.mjs. אינו נערך ביד. התחנות שכבר מאומתות ב-railStations.ts אינן כאן.",
  lines,
  stations,
};
await writeFile(OUT, JSON.stringify(out), "utf8");

const points = lines.reduce((a, l) => a + l.length, 0);
console.log(`${OUT}: ${lines.length} קטעים · ${points} נקודות · ${stations.length} תחנות`);
