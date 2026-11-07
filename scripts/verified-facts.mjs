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
// טבלת התעריפים הרשמית. ‎/Fares ו-‎/fares מחזירים 200 ומפנים ל-‎/home:
// ה-200 הוא ה-shell של אפליקציית הצד-לקוח ואינו מעיד שעמוד קיים.
// הכתובת האמיתית נקראה מהקישורים בעמוד הבית, לא נוחשה.
const BUS_FARES = {
  name: "הרשות הארצית לתחבורה ציבורית · טבלת התעריפים",
  url: "https://bus.gov.il/FaresDistance",
  how: "דפדפן פנימי",
  read: "05.11.2026",
};
const DANKAL_FARE = {
  name: "דנקל · תיקוף ותעריפים",
  url: "https://www.dankal.co.il/חובת-התיקוף/",
  how: "curl",
  read: "05.11.2026",
};
const DANKAL_SURCHARGE = {
  name: "דנקל · מידע על חיוב מוגדל",
  url: "https://www.dankal.co.il/מידע-על-חיוב-מוגדל/",
  how: "curl",
  read: "05.11.2026",
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
    id: "fare",
    claim: "נסיעה 8 ₪ עד 15 ק״מ אווירי, 14.5 ₪ מעבר לכך",
    grade: 2,
    sources: [
      { ...BUS_FARES, says: 'אזור צהוב 0-15 ק״מ "אוטובוס: 8 ₪" · אזור ירוק 15-40 ק״מ "אוטובוס: 14.5 ₪", והטבלה קובעת שהרכבות הקלות נכנסות לקטגוריית "אוטובוס"' },
      { ...DANKAL_FARE, says: '"בדנקל ייתכנו שני תעריפי נסיעה ... עד 15 ק״מ: 8 ₪ ... מעל 15 ק״מ: 14.5 ₪"' },
    ],
    note: "הטווח אווירי ולא לאורך המסילה. המרחק האווירי הגדול ביותר בקו הוא 16.7 ק״מ, ולכן התעריף הירוק קיים — אבל רק בנסיעות הארוכות ממש.",
    // כלל: מספר שאיש אינו רואה לא מגיע לאף קורא. לכן נבדק גם שהוא מוצג.
    check: () => {
      const faq = JSON.stringify(m.STATION_FAQ);
      const shown = faq.includes(`${m.FARE_ILS} ₪`) && faq.includes(`${m.FARE_LONG_ILS} ₪`);
      return [`${m.FARE_ILS}/${m.FARE_LONG_ILS}/${m.FARE_ZONE_KM}/${shown ? "מוצג" : "לא מוצג"}`, "8/14.5/15/מוצג"];
    },
  },
  {
    id: "surcharge",
    claim: "חיוב מוגדל 180 ₪ בתוספת מחיר נסיעה מלא",
    grade: 1,
    sources: [
      { ...DANKAL_SURCHARGE, says: '"סכום החיוב הוא מחיר נסיעה מלא בתוספת קנס כספי ע״ס 180 ₪ על פי חוק ובכלל זה, תקנות מסילות הברזל (דרישה לתשלום חיוב מוגדל לנוסע ברכבת מקומית), תשע״א-2011"' },
    ],
    note: "מקור אחד — המפעילה. דיווחי חדשות על 50 או 100 ₪ נוגעים לאוטובוסים או להצעות חוק. הטענה שהייתה כאן, \"מי שרכש מנוי ולא תיקף — עד 100 ₪\", הוסרה: היא לא הופיעה באף מקור רשמי, והבדיקה שומרת שלא תחזור.",
    check: () => {
      const faq = JSON.stringify(m.STATION_FAQ);
      const shown = faq.includes(`${m.SURCHARGE_ILS} ₪`);
      return [
        `${m.SURCHARGE_ILS}/${shown ? "מוצג" : "לא מוצג"}/${/100 ₪/.test(faq) ? "חזר 100" : "אין 100"}`,
        "180/מוצג/אין 100",
      ];
    },
  },
  {
    id: "transfer-window",
    claim: "מעבר חופשי 90 דקות, בנסיעות עד 15 ק״מ",
    grade: 2,
    sources: [
      { ...BUS, says: '"בנסיעות בטווח של עד 15 ק״מ ... ללא תשלום נוסף למשך 90 דקות מרגע התיקוף הראשון"' },
      { ...DANKAL_FARE, says: '"במשך 90 דקות מעת התיקוף הראשון מתאפשרות נסיעות ללא הגבלה באוטובוסים ובדנקל, בטווח אווירי של עד 15 ק״מ"' },
    ],
    note: "המקור אומר \"באוטובוסים ובדנקל\" — הנוסח הקודם שלנו אמר \"באוטובוס\" בלבד, וצמצם את מה שמגיע לקורא. המקור גם מדגיש שחובה לתקף כל נסיעה גם כשאין תוספת תשלום; גם זה נוסף.",
    check: () => {
      const faq = JSON.stringify(m.STATION_FAQ);
      return [
        /90 דקות/.test(faq) && /15 ק/.test(faq) && /חובה לתקף/.test(faq) ? "כן" : "לא",
        "כן",
      ];
    },
  },
  {
    id: "addresses",
    claim: "34 כתובות התחנות, כולל הכניסות",
    grade: 1,
    sources: [
      { ...DANKAL, says: "כתובת בפאנל נפרד לכל אחת מ-34 התחנות; 34 מתוך 34 זהות בתוכן לשלנו" },
      { name: "OSM", how: "Overpass", read: "05.11.2026", says: "צמתי railway=subway_entrance: אבא הלל 3 · שאול המלך 3 · ביאליק 3 · אלנבי 3 · יהודית 4 — מספר הכניסות בלבד, בלי כתובת" },
    ],
    note:
      "מקור חיצוני אחד לכתובת עצמה. OSM מאשר את **מספר** הכניסות ולא את הרחוב והמספר. " +
      "שני פערים הוכרעו ומתועדים ב-scripts/addresses.mjs: שגיאת כתיב אצל דנקל בגשר אם " +
      "המושבות, וכניסה שלישית באבא הלל שהכתובת שלה אצל דנקל שגויה ולכן לא יובאה.",
    check: () => {
      const miss = content.filter(c => !c.addressSource).length;
      const wrong = content.filter(c => c.addressSource && !/דנקל/.test(c.addressSource)).length;
      return [`${content.filter(c => c.address).length}/${miss}/${wrong}`, "34/0/0"];
    },
  },
  {
    id: "travel-time",
    claim: "זמני הנסיעה מלוח הזמנים — 65 דקות מקצה לקצה",
    grade: 1,
    sources: [
      {
        name: "דנקל · מתכנן המסלולים",
        url: "https://www.dankal.co.il/תכנון-מסלול-נסיעה/",
        how: "POST, לוח הזמנים בגוף התשובה",
        read: "05.11.2026",
        says: "arrivalTime לכל תחנה; פתח תקווה מרכזית 10:03 עד הקוממיות 11:08 = 65.0 דקות, זהה בשלוש יציאות עוקבות וב-17:00",
      },
    ],
    note:
      "החליף את `stops * 2`, נוסחה מומצאת בלי מקור שהזינה את שעת ההגעה בכל חיפוש " +
      "מסלול. היא טעתה 5% מקצה לקצה אבל עד **41%** בנסיעות קצרות. המספרים הם זמנים " +
      "**מתוכננים**, לא מדידה. ההמתנה בהחלפה בצומת אינה כלולה — פער פתוח.",
    check: () => {
      const names = m.STATIONS.map(s => s.name);
      const uncovered = names.filter(n => names.some(t => m.travelMinutes(n, t) === null)).length;
      const e2e = m.travelMinutes("תחנה מרכזית פתח תקווה", "הקוממיות");
      const short = m.travelMinutes("אלנבי", "שלמה (סלמה)");
      const branch = m.travelMinutes("קריית אריה", "הקוממיות");
      return [`${uncovered}/${e2e}/${short}/${branch}`, "0/65/7/58"];
    },
  },
  {
    id: "junction-wait",
    claim: "המתנה של 7 דקות בהחלפה בצומת, ב-28 זוגות",
    grade: 1,
    sources: [
      {
        name: "דנקל · מתכנן המסלולים",
        url: "https://www.dankal.co.il/תכנון-מסלול-נסיעה/",
        how: "POST, לוח הזמנים בגוף התשובה",
        read: "06.11.2026",
        says: "שמונה מדידות על שלושה זוגות בשלוש שעות: 5.9 · 6.9 · 7.5 · 7.5 · 7.6 · 7.6 · 7.6 · 8.5 — ממוצע 7.4",
      },
    ],
    note:
      "חל רק על זרוע פתח תקווה מול זרוע קריית אריה: 28 מתוך 1122 הזוגות. הכרטיס כבר " +
      "אמר 'נדרשת החלפה' ונתן שעת הגעה בלי המתנה, כלומר סתר את עצמו. **כל שמונה המדידות " +
      "הן בכיוון אחד** — חמש שאילתות בכיוון ההפוך לא החזירו מסלול, והערך מוחל על שניהם.",
    check: () => {
      const names = m.STATIONS.map(s => s.name);
      const onBranch = n => n in m.BRANCH_SECS && !(n in m.TRUNK_SECS);
      let both = 0, changeOnly = 0, waitOnly = 0;
      for (const a of names) for (const b of names) {
        if (a === b) continue;
        const c = m.countStops(a, b);
        let ride = null;
        if (onBranch(a) || onBranch(b)) {
          const bs = onBranch(a) ? a : b, ts = onBranch(a) ? b : a;
          if (ts in m.TRUNK_SECS)
            ride = Math.round((m.BRANCH_SECS[bs] + Math.abs(m.TRUNK_SECS[ts] - m.TRUNK_SECS[m.JUNCTION])) / 60);
        }
        const hasWait = ride !== null && m.travelMinutes(a, b) === ride + m.JUNCTION_WAIT_MINS;
        if (c?.change && hasWait) both++;
        else if (c?.change) changeOnly++;
        else if (hasWait) waitOnly++;
      }
      // ההמתנה חייבת לחול בדיוק על הזוגות שהכרטיס מצהיר עליהם החלפה.
      // שני האפסים הם העיקר: לא זוג בלי המתנה, ולא המתנה בלי הצהרה.
      return [`${both}/${changeOnly}/${waitOnly}/${m.JUNCTION_WAIT_MINS}`, "28/0/0/7"];
    },
  },
  {
    id: "walk-pace",
    claim: "קצב הליכה 80 מטר לדקה",
    grade: 2,
    sources: [
      {
        name: "Valhalla · ניתוב הליכה על OpenStreetMap",
        url: "https://valhalla1.openstreetmap.de/route",
        how: "costing pedestrian, 22 מסלולים",
        read: "07.11.2026",
        says: "קצב משתמע: ממוצע 80, טווח 68-90 מ׳ לדקה",
      },
      {
        name: "BRouter · מנוע ניתוב אחר, אותם 22 מסלולים",
        url: "https://brouter.de/brouter",
        how: "profile hiking-beta",
        read: "07.11.2026",
        says: "קצב משתמע: ממוצע 84, טווח 80-88 מ׳ לדקה",
      },
    ],
    note:
      "**שני מנועי ניתוב — אבל מפה אחת.** שניהם על נתוני OpenStreetMap, ולכן הם " +
      "בלתי תלויים כמנועים ולא כמקור נתונים: הם תופסים באג פרופיל כמו זה של OSRM, " +
      "ולא שביל חסר במפה. זאת הרמה שאפשר להשיג בלי מפתח API.\n" +
      "   ← **ועל המרחק הם לא מסכימים מספיק כדי לנעול:** פער ממוצע 23% ומקסימום " +
      "205% (מגדל משה אביב: 616 מ׳ מול 202). הצלבה עובדת לקצב, לא למרחק של מסלול בודד.\n" +
      "   ← המרחק עצמו עדיין שבור: השרת הציבורי של OSRM מחזיר ניתוב רכב. ההחלפה " +
      "נוגעת בקבצים של סשן אחר ודורשת החלטה.",
    check: () => {
      // שלושה דברים: הקבוע, שהוא באמת מזין את הפונקציה, ושהוא בטווח
      // שנמדד. 80 בלבד היה עובר גם אילו הפונקציה התעלמה ממנו.
      const inRange = m.WALK_PACE_M_PER_MIN >= 68 && m.WALK_PACE_M_PER_MIN <= 90;
      const drives = m.walkMinutes(m.WALK_PACE_M_PER_MIN * 10) === 10;
      return [`${m.WALK_PACE_M_PER_MIN}/${inRange ? "בטווח" : "מחוץ"}/${drives ? "מזין" : "מנותק"}`, "80/בטווח/מזין"];
    },
  },
  {
    id: "name-facts",
    claim: "3 עובדות השם החדות ביותר — אומתו ונמצאו נכונות",
    grade: 1,
    sources: [
      {
        name: "ויקיפדיה העברית",
        url: "https://he.wikipedia.org/",
        how: "שלושה ערכים",
        read: "07.11.2026",
        says: '"היה ראש העירייה השלישי של בני ברק" · "מייסדו ועורכו הראשון של העיתון מעריב" · "ונחנך ב-27 באוקטובר 1936"',
      },
    ],
    note:
      "34 טענות השם אינן מחלקה אחת: 13 נושאות תפקיד מוגדר, 12 כוללות פרשנות שאינה " +
      "טענה בדיקה, 3 נושאות תאריך, 6 אינן אומרות דבר שניתן להפריך. נבחרו שלוש החדות " +
      "ביותר — מספר סידורי, תפקיד, ותאריך — **וכל השלוש נכונות**.\n" +
      "   ← **ודנקנר נוסה ולא אומת.** לא נמצא מקור לשם הרחוב ולא לזהות האיש. זה אינו " +
      "אומר שהטענה שגויה אלא שלא נבדקה בהצלחה, והיעדר nameFactSource שם הוא בכוונה.\n" +
      "   ← 31 מתוך 34 עדיין בלי מקור. התקרה ירדה מ-34 ל-31 ולא יותר.",
    check: () => {
      const withSrc = content.filter(c => c.nameFactSource).length;
      const all = content.filter(c => c.nameFact).length;
      // דנקנר חייב להישאר **בלי** מקור — אחרת מישהו סימן אותו כמאומת.
      const dankner = content.find(c => c.name === "דנקנר");
      return [`${withSrc}/${all}/${dankner?.nameFactSource ? "מסומן" : "לא מסומן"}`, "3/34/לא מסומן"];
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
