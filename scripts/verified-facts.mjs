#!/usr/bin/env node
// מרשם העובדות הנעולות. כלל 2.
//
// עובדה נכנסת לכאן רק אם **נקראה ממקור חי**, לא נכתבה מהידע. לכל אחת
// רשום מאיזה מקור, באיזה דפדפן, באיזה תאריך, ומה המקור אמר בלשונו.
// הדירוג הוא מספר המקורות הבלתי תלויים — ולא יותר ממה שבאמת נקרא.
//
// הבלוק משווה כל עובדה לנתונים החיים ונופל על כל פער. זאת הנעילה:
// מי שישנה שם תחנה או שיוך עיר יראה את שם המקור שסותר אותו.
//
// נת״ע וגוגל מפות מחזירים 403 לקריאה אוטומטית ונקראו דרך Chrome של בעל
// האתר. לכן העובדות שמסתמכות עליהם לבד נושאות תאריך: הבלוק לא יוכל
// לקרוא אותן שוב, ורק אדם יכול.
import { load } from "./load.mjs";

const m = await load();

/**
 * צילום רשימת התחנות מהדף הקנוני של דנקל, כפי שנקראה ב-04.11.2026:
 * "תחנות הרכבת הקלה הקו האדום", מקובצת לפי עיר.
 *
 * הערה חשובה: בורר המסלול בעמוד הבית של דנקל מציג 35 פריטים ובהם
 * "בלינסון" ו-"קרית אריה" — שתי צורות שאינן בדף הקנוני. **הדף הקנוני
 * הוא המקור**, והוא כותב "בילינסון" ו-"קריית אריה", בדיוק כמונו.
 */
export const DANKAL_STATIONS = {
  "פתח תקווה": ["תחנה מרכזית פתח תקווה", "פינסקר", "קרול", "דנקנר", "בילינסון", "שחם", "שנקר", "קריית אריה"],
  "בני ברק": ["גשר אם המושבות", "אהרונוביץ'", "בן גוריון"],
  "רמת גן": ["ביאליק", "אבא הלל"],
  "תל אביב": ["ארלוזורוב", "שאול המלך", "יהודית", "קרליבך", "אלנבי", "אליפלט", "שלמה (סלמה)", "אצטדיון בלומפילד", "ארליך", "איסקוב", 'הבעש"ט', "מחרוזת"],
  "בת ים": ["העצמאות", "רוטשילד", "ז'בוטינסקי", "בלפור", "בנימין", "יוספטל", 'כ"ט בנובמבר', "העמל", "הקוממיות"],
};
const DANKAL_FLAT = Object.entries(DANKAL_STATIONS).flatMap(([city, ns]) => ns.map(n => [n, city]));

const NTA = {
  name: "נת״ע",
  url: "https://www.nta.co.il",
  how: "Chrome של בעל האתר (403 לקריאה אוטומטית)",
  read: "04.11.2026",
};
const DANKAL = {
  name: "דנקל",
  url: "https://www.dankal.co.il/קווי-שירות-ותחנות-החדש/",
  how: "דפדפן פנימי",
  read: "04.11.2026",
};
const BUS = {
  name: "הרשות הארצית לתחבורה ציבורית",
  url: "https://bus.gov.il/SingleRide",
  how: "דפדפן פנימי",
  read: "04.11.2026",
};
const OURS = { name: "הנתונים שלנו", how: "ספירה מהקוד", read: "חי" };

const content = Object.values(m.STATION_CONTENT);
const pois = content.flatMap(c => c.pois ?? []);

export const FACTS = [
  {
    id: "stations-count",
    claim: "בקו האדום 34 תחנות",
    grade: 3,
    sources: [
      { ...NTA, says: '"3 קווי שירות · 34 תחנות · 24 קילומטרים"' },
      { ...DANKAL, says: "34 שמות בדף הקנוני, מקובצים לפי חמש עיריות" },
      { ...OURS, says: "34 רשומות, בלי שמות כפולים" },
    ],
    check: () => [m.STATIONS.length, 34],
  },
  {
    id: "station-names",
    claim: "34 שמות התחנות, אות באות",
    grade: 2,
    sources: [
      { ...DANKAL, says: "הרשימה המלאה; 34 מתוך 34 זהים לשלנו" },
      { ...OURS, says: "השוואה מלאה, אפס הפרשים לשני הכיוונים" },
    ],
    check: () => {
      const bad = DANKAL_FLAT.filter(([n]) => !m.STATIONS.some(s => s.name === n)).length
        + m.STATIONS.filter(s => !DANKAL_FLAT.some(([n]) => n === s.name)).length;
      return [bad, 0];
    },
  },
  {
    id: "station-cities",
    claim: "שיוך העיר של כל 34 התחנות",
    grade: 2,
    sources: [
      { ...DANKAL, says: "פתח תקווה 8 · בני ברק 3 · רמת גן 2 · תל אביב–יפו 12 · בת ים 9" },
      { ...OURS, says: "34 מתוך 34 שיוכים זהים" },
    ],
    check: () => {
      const ours = new Map(m.STATIONS.map(s => [s.name, s.city]));
      const bad = DANKAL_FLAT.filter(([n, c]) => ours.get(n) !== c).length;
      return [bad, 0];
    },
  },
  {
    id: "line-length",
    claim: "אורך הקו 24 ק״מ",
    grade: 1,
    sources: [
      { ...NTA, says: '"24 קילומטרים"' },
      { ...OURS, says: "סכום אווירי בין תחנות עוקבות 23.3 ק״מ — קצר ממסילה, ולכן אינו סותר" },
    ],
    note: "מקור חיצוני אחד. דנקל אינו מפרסם את האורך בדף התחנות.",
    check: () => [m.LINE_LENGTH_KM, 24],
  },
  {
    id: "transfer-window",
    claim: "מעבר חופשי 90 דקות, בנסיעות עד 15 ק״מ",
    grade: 1,
    sources: [
      { ...BUS, says: '"בנסיעות בטווח של עד 15 ק״מ ... ללא תשלום נוסף למשך 90 דקות מרגע התיקוף הראשון"' },
    ],
    note: "מקור רשמי אחד, בעל העובדה. **המחיר עצמו טרם אומת** — האתר הזה אינו מפרסם טבלת מחירים.",
    check: () => {
      const faq = JSON.stringify(m.STATION_FAQ);
      return [/90 דקות/.test(faq) && /15 ק/.test(faq) ? "כן" : "לא", "כן"];
    },
  },
  {
    id: "rail-interchange",
    claim: "4 תחנות רכבת ישראל בטווח הליכה מהקו",
    grade: 2,
    sources: [
      { name: "OSM + ויקיפדיה", how: "שני מקורות לכל רשומה", read: "31.10.2026", says: "כל קואורדינטה משני מקורות, הפער נרשם" },
      { ...OURS, says: "4 רשומות, סף 600 מ׳, המרחק מחושב ולא נכתב" },
    ],
    check: () => [m.RAIL_STATIONS.length, 4],
  },
  {
    id: "red-line-opening",
    claim: "הקו האדום נפתח ב-18.8.2023",
    grade: 1,
    sources: [{ ...NTA, says: '"ב-18.8.2023 פתחנו את הקו האדום"' }],
    note: "מתועד, אינו מוצג באתר. אין מה להשוות.",
    check: null,
  },
  // ── פנימי: נגזר מהנתונים ומאומת מול עצמו, בלי מקור חיצוני ──────────
  {
    id: "type-split",
    claim: "23 עיליות · 10 תת-קרקעיות · 1 בשיקוע",
    grade: 0,
    sources: [{ ...OURS, says: "נספר מהרשומות; הסכום 34 מאומת מול נת״ע ודנקל" }],
    note: "**הפילוג עצמו לא אומת חיצונית.** רק הסכום.",
    // כלל 5ג: הגרסה הראשונה כאן השוותה 34/34 — הסכום, לא הפילוג —
    // וקראה לזה "פילוג". ספירה סופרת את מה שהיא טוענת לספור.
    check: () => {
      const n = t => content.filter(c => c.stationType === t).length;
      return [
        `${n("עילית")}/${n("תת קרקעית")}/${n("בשיקוע")}/${content.length}`,
        "23/10/1/34",
      ];
    },
  },
  {
    id: "places-nearest",
    claim: "22 המקומות המאומתים משויכים כולם לתחנה הקרובה ביותר",
    grade: 0,
    sources: [{ ...OURS, says: "מרחק מכל מקום ל-34 התחנות; אפס שיוכים שגויים" }],
    check: () => {
      const bad = m.PLACES.filter(p => {
        const near = m.STATIONS.reduce((a, s) =>
          m.distanceMetres(p, s) < m.distanceMetres(p, a) ? s : a, m.STATIONS[0]);
        return near.name !== p.stationName;
      }).length;
      return [bad, 0];
    },
  },
  {
    id: "escaped-names",
    claim: "5 שמות נושאים גרשיים מוברחים",
    grade: 0,
    sources: [{ ...OURS, says: "נמדד בשתי דרכים — טעינת מודול ופירסור טקסט" }],
    note: "הבקרה החיובית של כל שליפה מהקבצים.",
    check: () => {
      const q = [
        ...Object.keys(m.STATION_CONTENT).filter(n => n.includes('"')),
        ...new Set(pois.filter(p => p.name.includes('"')).map(p => p.name)),
      ];
      return [q.length, 5];
    },
  },
];

const run = FACTS.filter(f => f.check).map(f => {
  const [got, want] = f.check();
  return { ...f, got, want, ok: String(got) === String(want) };
});
const bad = run.filter(r => !r.ok);

if (process.argv[2] === "count") {
  // סתירות · עובדות שנבדקו · בקרה: עובדות בדירוג 3. הבקרה היא שהמרשם
  // נטען בכלל — 0 סתירות מתוך 0 עובדות נראה כמו אתר מאומת.
  console.log("%d · %d · %d", bad.length, run.length, FACTS.filter(f => f.grade === 3).length);
  process.exit(0);
}

const GRADE = { 3: "שלושה מקורות", 2: "שני מקורות", 1: "מקור אחד", 0: "פנימי בלבד" };
for (const f of FACTS) {
  const r = run.find(x => x.id === f.id);
  const mark = !r ? "·" : r.ok ? "✓" : "✗";
  console.log("\n%s %s   [%s]", mark, f.claim, GRADE[f.grade]);
  if (r && !r.ok) console.log("   נמדד %s · צפוי %s", r.got, r.want);
  for (const s of f.sources) {
    console.log("   %s — %s", s.name, s.says);
    if (s.url) console.log("     %s · %s · נקרא %s", s.url, s.how, s.read);
  }
  if (f.note) console.log("   ← %s", f.note);
}
console.log("\n%s · %d עובדות נבדקו · %d בדירוג שלושה מקורות",
  bad.length ? `${bad.length} סתירות` : "אין סתירות", run.length,
  FACTS.filter(f => f.grade === 3).length);
process.exit(bad.length ? 1 : 0);
