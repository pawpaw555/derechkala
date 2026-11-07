#!/usr/bin/env node
// לוח הזמנים שבקוד מול המתכנן של דנקל, עכשיו.
//
// קודם לכן זמן הנסיעה היה `stops * 2`, נוסחה מומצאת שהזינה את שעת
// ההגעה בכל חיפוש מסלול באתר. עכשיו הוא נגזר מלוח הזמנים — ולוח זמנים
// משתנה. בלי השורה הזאת הטבלה היא רשומה שנכתבה פעם.
//
// המתכנן של דנקל שולח בתשובת ה-POST את לוח הזמנים תחנה-תחנה, עם
// arrivalTime מדויק לכל אחת. אין צורך ב-API נסתר; זה בגוף העמוד.
//
// הגשר נבדק **בדיוק מלא**: נמדד שההיסטים זהים לשנייה בשלוש יציאות
// עוקבות ובין 10:00 ל-17:00. הענף נבדק בסובלנות של 60 שניות, כי שם
// נמדד הפרש אמיתי בין תבניות נסיעה — 390 שניות מול 363.
import { load } from "./load.mjs";
import { liveText } from "./net.mjs";

const URL = "https://www.dankal.co.il/%d7%aa%d7%9b%d7%a0%d7%95%d7%9f-%d7%9e%d7%a1%d7%9c%d7%95%d7%9c-%d7%a0%d7%a1%d7%99%d7%a2%d7%94/";
const REFERER = "/%D7%AA%D7%9B%D7%A0%D7%95%D7%9F-%D7%9E%D7%A1%D7%9C%D7%95%D7%9C-%D7%A0%D7%A1%D7%99%D7%A2%D7%94/";
const UA = { "user-agent": "derechkala-verify/1.0" };
const BRANCH_TOLERANCE_SECS = 60;

/** שמות המתכנן אינם זהים לשלנו. רק מה שנפרד. */
const NAMES = new Map([
  ["קרית אריה", "קריית אריה"],
  ["בלינסון", "בילינסון"],
  ["שלמה", "שלמה (סלמה)"],
  ["הבעש''ט", 'הבעש"ט'],
  ["כ''ט בנובמבר", 'כ"ט בנובמבר'],
]);
const ours = (n) => NAMES.get(n) ?? n;

const ents = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, "&");

let session = null;
async function init() {
  if (session) return session;
  // הקוקי נדרש ל-POST, ולכן כאן fetch ישיר ולא liveText — עטוף בניסיון
  // חוזר משלו באותה צורה, כי כשל כאן נראה בדיוק כמו כשל שם.
  let g, html;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      g = await fetch(URL, { headers: UA, signal: AbortSignal.timeout(60000) });
      html = await g.text();
      break;
    } catch (err) {
      if (attempt === 2) {
        console.log("אין תשובה מהרשת · מתכנן דנקל · %s", err?.cause?.code ?? err?.name ?? "שגיאה");
        process.exit(1);
      }
      await new Promise((s) => setTimeout(s, 2500));
    }
  }
  const cookie = (g.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
  const nonce = html.match(/name="jPlanner"[^>]*value="([^"]+)"/)?.[1];
  const codes = new Map();
  // האפשרויות נפרסות על כמה שורות בתוך התג עצמו. תבנית שדרשה
  // `<option value=` רצוף החזירה אפס תחנות, והבקרה תפסה את זה מיד.
  for (const m of html.matchAll(/<option\b[^>]*?value="(\d+)"[^>]*>([\s\S]*?)<\/option>/g)) {
    const t = m[2].replace(/\s+/g, " ").trim();
    if (t && !codes.has(t)) codes.set(t, m[1]);
  }
  session = { cookie, nonce, codes };
  return session;
}

async function trip(a, b, time = "10:00") {
  const { cookie, nonce, codes } = await init();
  if (!nonce || !codes.get(a) || !codes.get(b)) return null;
  const body = new URLSearchParams({
    "planner-search-select-start": codes.get(a),
    "planner-search-select-end": codes.get(b),
    "planner-search-datetime": time,
    "ppd-time-input": time,
    jPlanner: nonce,
    _wp_http_referer: REFERER,
    toOrFrom: "depart",
  });
  const h = await liveText("מתכנן דנקל", URL, {
    method: "POST",
    headers: { ...UA, "content-type": "application/x-www-form-urlencoded", cookie },
    body,
    signal: AbortSignal.timeout(60000),
  });
  for (const m of h.matchAll(/Routes\['(\d+)'\]\s*=\s*'([^']*)'/g)) {
    try {
      const legs = JSON.parse(ents(m[2])).map((l) => (l || []).filter(Boolean)).filter((l) => l.length);
      if (legs.length) return legs;
    } catch {}
  }
  return null;
}

const secs = (s) => new Date(s.arrivalTime).getTime() / 1000;
const offsets = (leg) => {
  const z = secs(leg[0]);
  const o = new Map();
  for (const s of leg) o.set(ours(s.name), Math.round(secs(s) - z));
  return o;
};

const m = await load();

/**
 * המתכנן של דנקל מתכנן **להיום בלבד** — נמדד ב-07.11.2026 שתאריך
 * בשדה, בשדה נפרד או משולב בשעה אינו משנה דבר.
 *
 * ולכן הבדיקה נפלה בשבת: היא שאלה על 10:00, אין שירות, והמתכנן החזיר
 * אפס מסלולים. הבקרה דיווחה על זה נכון ("0 מתוך 0" לא עבר בשקט), אבל
 * שורה שנופלת בכל שבת היא שורה מהבהבת — בדיוק מה שהכלל אוסר.
 *
 * לכן נשאלות שתי שעות: 10:00, ואם אין שירות אז 21:00. במוצאי שבת
 * השירות מתחדש ב-19:45, ונמדד ש-21:00 מחזיר 32 תחנות. השעה שנענתה
 * מודפסת, כי "לא נבדק" ו"נבדק ב-21:00" אינם אותו דבר.
 */
const TIMES = ["10:00", "21:00"];
async function tripAnyTime(a, b) {
  for (const t of TIMES) {
    const legs = await trip(a, b, t);
    if (legs?.length) return { legs, at: t };
  }
  return { legs: null, at: null };
}

const trunkAsked = await tripAnyTime("תחנה מרכזית פתח תקווה", "הקוממיות");
const trunkTrip = trunkAsked.legs;
const trunkLeg = trunkTrip?.[0] ?? null;
await new Promise((s) => setTimeout(s, 1500));
const branchAsked = await tripAnyTime("קריית אריה", "אלנבי");
const branchTrip = branchAsked.legs;
const branchLeg = branchTrip?.[0] ?? null;

/**
 * המודל שלנו אומר שנסיעה מהענף **דרומה** היא רגל אחת רצופה, בלי
 * החלפה — ולכן בלי המתנה. שמונה מדידות ב-06.11.2026 הסכימו, ומדידה
 * בודדת מ-05.11 הראתה שתי רגליים ונותרה חריגה שלא הוסברה.
 *
 * מספר הרגליים כאן הוא התשובה, והוא כבר בידינו מאותה שליפה. אם דנקל
 * תתחיל לדרוש החלפה גם דרומה, השורה הזאת תיפול — ואז 28 הזוגות של
 * JUNCTION_WAIT_MINS הם לא כל המקרים.
 */
const branchLegCount = branchTrip?.length ?? 0;

// הבקרה: מה המתכנן החזיר בכלל. אם החילוץ נשבר הוא מדווח על עצמו ולא
// על לוח הזמנים — 0 הפרשים מתוך 0 היסטים נראה כמו טבלה תקינה.
//
// הגשר חייב להיות 32 תחנות: זה מספר התחנות על R1, ושתי התחנות הנוספות
// יושבות על הענף. אורך רגל הענף **אינו** מקובע — המתכנן מחזיר את כל
// תבנית הנסיעה, ולכן "קריית אריה → אלנבי" חוזר עם 11 תחנות ולא עם 3.
// ציפייה של 35 כאן נכשלה לשקר: ניחשתי סכום במקום למדוד אותו.
const trunkLen = trunkLeg?.length ?? 0;
const branchLen = branchLeg?.length ?? 0;
const controlOk = trunkLen === 32 && branchLen >= 3 && branchLegCount === 1;

const bad = [];
let checked = 0;

if (trunkLeg) {
  const live = offsets(trunkLeg);
  for (const [name, want] of Object.entries(m.TRUNK_SECS)) {
    const got = live.get(name);
    if (got === undefined) { bad.push([name, "אינו בלוח של המתכנן"]); continue; }
    checked++;
    if (got !== want) bad.push([name, `אצלנו ${want} שנ׳ · במתכנן ${got} שנ׳`]);
  }
}

if (branchLeg) {
  const live = offsets(branchLeg);
  const junction = live.get("אהרונוביץ'");
  if (junction === undefined) {
    bad.push(["אהרונוביץ'", "הצומת אינו ברגל הענף"]);
  } else {
    for (const [name, want] of Object.entries(m.BRANCH_SECS)) {
      const at = live.get(name);
      if (at === undefined) { bad.push([name, "אינו ברגל הענף"]); continue; }
      checked++;
      const got = junction - at;
      if (Math.abs(got - want) > BRANCH_TOLERANCE_SECS)
        bad.push([name, `אצלנו ${want} שנ׳ · במתכנן ${got} שנ׳ (סובלנות ${BRANCH_TOLERANCE_SECS})`]);
    }
  }
}

const endToEnd = trunkLeg ? Math.round(m.TRUNK_SECS["הקוממיות"] / 60) : 0;

const ok = bad.length === 0 && controlOk;

if (process.argv[2] === "count") {
  console.log("%d · %d · %d דק׳ · בקרה: %s", bad.length, checked, endToEnd, controlOk ? "כן" : "לא");
  process.exit(ok ? 0 : 1);
}

console.log("מקור: מתכנן המסלולים של דנקל · %s\n", URL);
for (const [n, why] of bad) console.log("✗ %s — %s", n, why);
console.log(
  "%d הפרשים · %d היסטים נבדקו · מקצה לקצה %d דקות",
  bad.length, checked, endToEnd
);
console.log(
  "בקרה: הגשר %d תחנות (נדרש 32) · רגל הענף %d (נדרש ≥3) · רגליים בענף %d (נדרש 1) · %s",
  trunkLen, branchLen, branchLegCount, controlOk ? "עברה" : "נכשלה"
);
console.log(
  "נשאל בשעה: גשר %s · ענף %s",
  trunkAsked.at ?? "—", branchAsked.at ?? "—"
);
console.log("הגשר נבדק בדיוק מלא · הענף בסובלנות %d שניות", BRANCH_TOLERANCE_SECS);
process.exit(ok ? 0 : 1);
