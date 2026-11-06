#!/usr/bin/env node
// 34 הכתובות מול המקור. כלל 2.
//
// הכתובות ישבו באתר בלי שום מקור, והן מוצגות בכל עמוד תחנה. דנקל
// מפרסמת כתובת לכל תחנה בדף `קווי-שירות-ותחנות`, בפאנל נפרד לכל אחת.
// כאן יושב צילום של 34 הכתובות שלה כלשונן, כפי שנקראו ב-05.11.2026.
//
// הצילום מפותח לפי **השמות שלנו**, לא לפי כותרות הפאנלים של דנקל: שתי
// כותרות אצלה שגויות או לא עקביות ("תחנת דנקר" בכותרת, "דנקנר" בגוף
// אותו פאנל), וחילוץ אוטומטי של שמות החזיר ארבעה פערי שם שהיו תקלות
// של התבנית שלי ולא נתונים. פיתוח לפי השם שלנו מוציא את זה מהמשוואה.
//
// ההשוואה היא על **התוכן העובדתי** — קבוצת "רחוב מספר" לכל כניסה —
// ולא על המחרוזת. דנקל מפרידה כניסות בקו מפריד ואנחנו בנקודתיים, היא
// משמיטה פסיק לפני העיר, ושתי הצורות של הגרש מופיעות בשני הצדדים.
// השוואת מחרוזות החזירה 12 "הפרשים" שרובם היו פיסוק. כלל 11א.
import { load } from "./load.mjs";
import { liveText } from "./net.mjs";

const SOURCE = {
  name: "דנקל",
  url: "https://www.dankal.co.il/קווי-שירות-ותחנות-החדש/",
  how: "curl",
  read: "05.11.2026",
};

/** כתובות דנקל כלשונן, מפותחות בשם התחנה אצלנו. */
export const DANKAL_ADDRESSES = new Map([
  ["תחנה מרכזית פתח תקווה", "זאב אורלוב 70 פתח תקווה"],
  ["פינסקר", "זאב אורלוב 41 פתח תקווה"],
  ["קרול", "זאב אורלוב 8 פתח תקווה"],
  ["דנקנר", "ז'בוטינסקי 31 פתח תקווה"],
  ["בילינסון", "ז'בוטינסקי 72 פתח תקווה"],
  ["שחם", "ז'בוטינסקי 82 פתח תקווה"],
  ["שנקר", "ז'בוטינסקי 101 פתח תקווה"],
  ["קריית אריה", "יצחק שמיר סמוך לתחנת רכבת ישראל פתח תקווה"],
  ["גשר אם המושבות", "כניסה A+B – דרך ז'בוינסקי סמוך לאמיל זולא 5, בני ברק"],
  ["אהרונוביץ'", "כניסה A – דרך ז'בוטינסקי 166, כניסה B – דרך ז'בוטינסקי 117 בני ברק"],
  ["בן גוריון", "כניסה A דרך ז'בוטינסקי 12, כניסה B דרך ז'בוטינסקי 3 בני ברק"],
  ["ביאליק", "כניסה A – דרך ז'בוטינסקי 85, כניסה B – דרך ז'בוטינסקי 68, כניסה C – דרך ז'בוטינסקי 75 רמת גן"],
  ["אבא הלל", "כניסה A – דרך ז'בוטינסקי 75, כניסה B – דרך ז'בוטינסקי 5, כניסה C – אבא הלל 1 רמת גן"],
  ["ארלוזורוב", "כניסה A – על פרשת דרכים 1, כניסה B – דרך מנחם בגין 160 תל אביב"],
  ["שאול המלך", "כניסה A – שדרות מנחם בגין 125, כניסה B שדרות מנחם בגין 144, כניסה C שדרות מנחם בגין 130."],
  ["יהודית", "כניסה A – מקלף 1, כניסה B – שדרות מנחם בגין 112, כניסה C – שדרות מנחם בגין 98, כניסה D – אלברט מנדל 38 תל אביב"],
  ["קרליבך", "כניסה A – קרליבך/לינקולן, כניסה B – קרליבך/מנחם בגין, כניסה C – קרליבך/מנחם בגין תל אביב"],
  ["אלנבי", "כניסה A – יהודה הלוי 63, כניסה B – מקווה ישראל 10, כניסה C – מקווה ישראל 47 תל אביב"],
  ["אליפלט", "כניסה מזרחי עילי – סמטת אהרון שלוש 7 (פארק המסילה)"],
  ["שלמה (סלמה)", "שדרות ירושלים 15 תל אביב-יפו"],
  ["אצטדיון בלומפילד", "שדרות ירושלים 42 תל אביב-יפו"],
  ["ארליך", "שדרות ירושלים 94 תל אביב-יפו"],
  ["איסקוב", "שדרות ירושלים 120 תל אביב-יפו"],
  ['הבעש"ט', "שדרות ירושלים 146 תל אביב-יפו"],
  ["מחרוזת", "שדרות ירושלים 210 תל אביב-יפו"],
  ["העצמאות", "שד' העצמאות 69 בת ים"],
  ["רוטשילד", "רוטשילד 17 בת ים"],
  ["ז'בוטינסקי", "הרצל 64 בת ים"],
  ["בלפור", "יוספטל 44 בת ים"],
  ["בנימין", "יוספטל 70 בת ים"],
  ["יוספטל", "יוספטל 82 בת ים"],
  ['כ"ט בנובמבר', "ניסבאום 48 בת ים"],
  ["העמל", "ניסבאום 7 בת ים"],
  ["הקוממיות", "דרך מנחם בגין 4 בת ים"],
]);

/**
 * פערים שנבדקו והוכרעו. הם **לא** נכשלים, אבל הם נספרים ומודפסים —
 * פער שהוכרע ונשכח הוא פער שיחזור כהפתעה.
 */
export const KNOWN_GAPS = new Map([
  [
    "גשר אם המושבות",
    'דנקל כותבת "ז\'בוינסקי" בלי ט. שגיאת כתיב אצלה; הכתיב שלנו נכון, ' +
      "והוא גם הכתיב בכל שאר הפאנלים שלה.",
  ],
  [
    "אבא הלל",
    'דנקל מפרסמת כניסה שלישית, "דרך ז\'בוטינסקי 75", שהיא **בדיוק** הכתובת ' +
      "שהיא נותנת לכניסה C של ביאליק — ושתי הנקודות ב-OSM רחוקות 830 מ׳ זו " +
      "מזו. שלוש הכניסות עצמן מאומתות בשני מקורות, אבל הכתובת של אחת מהן " +
      "שגויה אצל דנקל, ולכן לא יובאה. דורש עין אנושית במפה.",
  ],
]);

const CITY = /תל[\s-]*אביב([\s-]*יפו)?|פתח[\s-]*תקווה|בני[\s-]*ברק|רמת[\s-]*גן|בת[\s-]*ים/g;

/** התוכן העובדתי: קבוצת "רחוב מספר", בלי כניסות, פיסוק, עיר ותוויות דרך. */
export function parts(s) {
  const t = s
    .replace(/[׳’']/g, "'")
    .replace(/[״“”]/g, '"')
    .normalize("NFD")
    .replace(/[֑-ׇ]/g, "")
    .replace(CITY, " ")
    .replace(/(^|\s)(דרך|שדרות|שד')(\s)/g, "$1$3")
    .replace(/[()]/g, " ")
    .replace(/כניסה\s*([A-D])\s*\+\s*([A-D])/g, "|")
    .replace(/כניסה\s*[A-D]\s*[:–—-]?\s*/g, "|")
    .replace(/כניסה\s+\S+\s+\S+\s*[:–—-]\s*/g, "|")
    .replace(/\s+/g, " ");
  return new Set(
    t.split("|").map((x) => x.replace(/[,.]/g, " ").replace(/\s+/g, " ").trim()).filter((x) => x.length > 2)
  );
}

/**
 * מצב `live`: מושך את דף התחנות ומוודא שהצילום עדיין מתאים למה שדנקל
 * מפרסמת. בלי זה הצילום הוא רשומה שנכתבה פעם, ושינוי כתובת אצל
 * המפעילה היה נשאר בלי שנדע. הבקרה היא מספר הפאנלים שנמצאו: אם
 * החילוץ נשבר, הוא מדווח על עצמו ולא על העולם.
 */
async function live() {
  const raw = await liveText("דף התחנות של דנקל", SOURCE.url, {
    headers: { "user-agent": "derechkala-verify/1.0" },
    signal: AbortSignal.timeout(30000),
  });
  const ents = (s) =>
    s
      .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/&quot;/g, '"')
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&");
  const found = [];
  for (const [, body] of raw.matchAll(
    /<div id="station-content-\d+"[^>]*>([\s\S]*?)(?=<div id="station-content-\d+"|<div id='station-info-end'|$)/g
  )) {
    const t = ents(body.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    const i = t.indexOf("כתובת:");
    if (i < 0) continue;
    const ad = t
      .slice(i + 6)
      .match(/^\s*(.+?)\s*(?:קווי שירות|החלפת קווים|תחנה במפלס|תחנה תת|תעריפי נסיעה|$)/);
    if (ad) found.push(ad[1].trim());
  }
  const snap = [...DANKAL_ADDRESSES.values()];
  const gone = snap.filter((a) => !found.includes(a));
  const added = found.filter((a) => !snap.includes(a));
  return { panels: found.length, gone, added };
}

const m = await load();
const ours = Object.values(m.STATION_CONTENT);

const bad = [];
let compared = 0;
let gaps = 0;

for (const o of ours) {
  const d = DANKAL_ADDRESSES.get(o.name);
  if (!d) {
    bad.push([o.name, "אין כתובת בצילום של דנקל"]);
    continue;
  }
  compared++;
  const A = parts(o.address);
  const B = parts(d);
  const onlyA = [...A].filter((x) => !B.has(x));
  const onlyB = [...B].filter((x) => !A.has(x));
  if (!onlyA.length && !onlyB.length) continue;
  if (KNOWN_GAPS.has(o.name)) { gaps++; continue; }
  bad.push([o.name, `רק אצלנו: ${onlyA.join(" ; ") || "—"} · רק בדנקל: ${onlyB.join(" ; ") || "—"}`]);
}

// כל רשומה נושאת שדה מקור, ותמיד את אותו אחד.
const srcMissing = ours.filter((o) => !o.addressSource).length;
const srcWrong = ours.filter((o) => o.addressSource && !/דנקל/.test(o.addressSource)).length;

// הבקרה: תחנה שידוע שהיא בשני הצדדים, ושם מומצא שאינו באף אחד.
const control =
  DANKAL_ADDRESSES.has("אלנבי") &&
  ours.some((o) => o.name === "אלנבי") &&
  !DANKAL_ADDRESSES.has("תחנת הדמיון");

if (process.argv[2] === "live") {
  const { panels, gone, added } = await live();
  // 34 פאנלים הם הבקרה. פחות מזה והחילוץ נשבר, וה-0 שאחריו חסר משמעות.
  console.log("%d · %d · %d · פאנלים: %d", gone.length, added.length, DANKAL_ADDRESSES.size, panels);
  if (process.argv[3] === "verbose") {
    for (const a of gone) console.log("  ✗ בצילום ואינו בדף: %s", a);
    for (const a of added) console.log("  + בדף ואינו בצילום: %s", a);
  }
  process.exit(panels === 34 && !gone.length && !added.length ? 0 : 1);
}

if (process.argv[2] === "count") {
  console.log("%d · %d · %d · %d · בקרה: %s", bad.length, compared, gaps, srcMissing + srcWrong, control ? "כן" : "לא");
} else {
  console.log("מקור: %s · %s · %s · נקרא %s\n", SOURCE.name, SOURCE.url, SOURCE.how, SOURCE.read);
  for (const [n, why] of bad) console.log("✗ %s — %s", n, why);
  console.log("%d הפרשים לא צפויים · %d הושוו · %d פערים מוכרעים", bad.length, compared, gaps);
  for (const [n, why] of KNOWN_GAPS) console.log("\n  ◦ %s\n    %s", n, why);
  console.log("\nשדה מקור: חסר ב-%d · שגוי ב-%d · בקרה: %s", srcMissing, srcWrong, control ? "כן" : "לא");
}

process.exit(bad.length === 0 && srcMissing === 0 && srcWrong === 0 && control ? 0 : 1);
