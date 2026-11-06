#!/usr/bin/env node
// משווה את המחירים שהאתר מציג למה שדנקל מפרסמת, עכשיו.
//
// המחיר הוא הטענה היחידה באתר שמי שטועה בה מעלות לקורא כסף, והוא
// היחיד שהבלוק יכול לאמת מול בעל העובדה בכל הרצה: bus.gov.il הוא
// אפליקציית צד-לקוח ו-curl מקבל ממנה shell ריק, ודנקל מוגשת מהשרת.
//
// השורה מדפיסה את מה שנמצא בעמוד, לא "כן/לא" — כך ששינוי תעריף אצל
// המפעילה מופיע בבלוק כמספר החדש ולא כסתם כשל.
//
// שימו לב: סטטוס 200 אינו הוכחה שעמוד קיים. ‎bus.gov.il/Fares מחזיר
// 200 ומפנה ל-‎/home. לכן נבדק תוכן ולא קוד תשובה.
import { load } from "./load.mjs";
import { liveText } from "./net.mjs";

const FARE_URL = "https://www.dankal.co.il/חובת-התיקוף/";
const SURCHARGE_URL = "https://www.dankal.co.il/מידע-על-חיוב-מוגדל/";

async function text(url) {
  const html = await liveText("דנקל", url, {
    headers: { "user-agent": "derechkala-verify/1.0" },
    signal: AbortSignal.timeout(20000),
  });
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

const m = await load();
const [fareTxt, surTxt] = await Promise.all([text(FARE_URL), text(SURCHARGE_URL)]);

// הבקרה: מחרוזת שידוע שקיימת בכל עמוד. אם היא נעלמה, מבנה העמוד
// השתנה והשליפה חסרת משמעות — ואז זה כשל של הכלי, לא של התעריף.
const control =
  /תעריפי הנסיעה בדנקל/.test(fareTxt) && /חיוב מוגדל/.test(surTxt);

const grab = (txt, re) => {
  const hit = txt.match(re);
  return hit ? hit[1] : "—";
};

const found = {
  fare: grab(fareTxt, /צהוב\)\s*:\s*([\d.]+)\s*₪/),
  fareLong: grab(fareTxt, /ירוק\)\s*:\s*([\d.]+)\s*₪/),
  surcharge: grab(surTxt, /קנס כספי[^\d]{0,14}([\d.]+)\s*₪/),
};

const want = {
  fare: String(m.FARE_ILS),
  fareLong: String(m.FARE_LONG_ILS),
  surcharge: String(m.SURCHARGE_ILS),
};

const line = `${found.fare}/${found.fareLong}/${found.surcharge}`;
console.log(`${line} · בקרה: ${control ? "כן" : "לא"}`);

if (process.argv[2] === "verbose") {
  for (const k of Object.keys(want)) {
    console.log(`  %s  אצלנו %s · בדנקל %s`, found[k] === want[k] ? "✓" : "✗", want[k], found[k]);
  }
  console.log("  %s\n  %s", FARE_URL, SURCHARGE_URL);
}

const ok = control && Object.keys(want).every((k) => found[k] === want[k]);
process.exit(ok ? 0 : 1);
