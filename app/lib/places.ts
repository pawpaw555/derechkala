import { STATIONS, LANDMARKS, Station, distanceMetres, formatDistance, searchAll, normalizeHebrew } from "./data";

/**
 * מקומות שאפשר לחפש לפי האזור, לא לפי שם התחנה.
 *
 * הנתונים הקיימים באתר — 67 LANDMARKS ו-136 pois — נושאים שיוך לתחנה
 * ולפעמים זמן הליכה מוצהר, אבל אף אחד מהם לא נושא קואורדינטה. בלי
 * קואורדינטה אי אפשר לא לאמת את השיוך, לא לתת מרחק, ולא לסמן על המפה.
 *
 * כל רשומה כאן נושאת את מקור הקואורדינטה שלה, ואומתה מול שני מקורות
 * בלתי תלויים: Nominatim (OpenStreetMap) ו-Google Maps. הפער ביניהם
 * נרשם ב-verifiedGap. רשומה בלי אימות כזה לא נכנסת.
 */
export type Place = {
  name: string;
  /** מונחים שאנשים מקלידים בפועל. "בורסה" אינו שם של שום רשומה בנתונים. */
  aliases?: string[];
  kind: string;
  stationName: string;
  lat: number;
  lng: number;
  /** מאיפה הגיעה הקואורדינטה. */
  source: string;
  /** "double" = Nominatim וגם סיכה ב-Google. "single" = מקור אחד בלבד. */
  verification: "double" | "partial" | "single";
  verifiedGap: string;
};

export const PLACES: Place[] = [
  // ── רמת גן, אזור הבורסה ──
  {
    name: "מתחם הבורסה", aliases: ["בורסה"], kind: "אזור עסקים",
    stationName: "אבא הלל", lat: 32.08595, lng: 34.80220,
    source: "Nominatim — שכונת הבורסה, רמת גן, מרכז השכונה",
    verification: "single", verifiedGap: "מקור אחד בלבד; אזור ולא נקודה",
  },
  {
    name: "בורסת היהלומים", aliases: ["בורסה", "יהלומים"], kind: "מרכז עסקים",
    stationName: "אבא הלל", lat: 32.08355, lng: 34.80145,
    source: "Google Maps — זיסמן שלום, הבורסה, רמת גן",
    verification: "double", verifiedGap: "42 מ׳ בין Nominatim ל-Google",
  },
  {
    name: "מגדל משה אביב", kind: "מגדל משרדים",
    stationName: "אבא הלל", lat: 32.08376, lng: 34.80385,
    source: "Google Maps — ז׳בוטינסקי 7, רמת גן",
    verification: "double", verifiedGap: "38 מ׳ בין Nominatim ל-Google",
  },
  {
    name: "מכללת שנקר", aliases: ["שנקר"], kind: "מוסד אקדמי",
    stationName: "אבא הלל", lat: 32.08999, lng: 34.80300,
    source: "Nominatim — אנה פרנק 12, רמת גן",
    verification: "partial", verifiedGap: "25 מ׳ ממרכז תצוגת Google; לא הוחזרה סיכה",
  },
  // ── תל אביב ──
  {
    name: "מרכז עזריאלי", aliases: ["עזריאלי"], kind: "קניון ומגדלים",
    stationName: "שאול המלך", lat: 32.07502, lng: 34.79184,
    source: "Nominatim — מרכז עזריאלי, גשר הקריה",
    verification: "single", verifiedGap: "התחנה הקרובה המחושבת תואמת לשיוך הקיים",
  },
  {
    name: "בית חולים איכילוב", aliases: ["איכילוב", "סוראסקי"], kind: "בית חולים",
    stationName: "שאול המלך", lat: 32.07933, lng: 34.79025,
    source: "Google Maps — תל אביב",
    verification: "partial", verifiedGap: "Nominatim החזיר רחוב בפתח תקווה, 8.8 ק״מ משם — נפסל",
  },
  {
    name: "קריית הממשלה", aliases: ["משרדי ממשלה"], kind: "מוסדות ממשלה",
    stationName: "יהודית", lat: 32.07279, lng: 34.78959,
    source: "Google Maps — קרית הממשלה, תל אביב",
    verification: "double", verifiedGap: "248 מ׳ בין המקורות; נבחר הרחוק מביניהם",
  },
  {
    name: "שדרות רוטשילד", aliases: ["רוטשילד"], kind: "שדרה מרכזית",
    stationName: "אלנבי", lat: 32.06408, lng: 34.77466,
    source: "Nominatim — שדרות רוטשילד, לב תל אביב",
    verification: "single", verifiedGap: "התחנה הקרובה המחושבת תואמת לשיוך הקיים",
  },
  {
    name: "שוק הכרמל", aliases: ["כרמל"], kind: "שוק",
    stationName: "אלנבי", lat: 32.06837, lng: 34.76855,
    source: "Nominatim — שוק הכרמל, כרם התימנים",
    verification: "single", verifiedGap: "מקור אחד",
  },
  {
    name: "נווה צדק", kind: "שכונה היסטורית",
    stationName: "אליפלט", lat: 32.06325, lng: 34.76413,
    source: "Nominatim — נוה צדק, תל אביב",
    verification: "single", verifiedGap: "אזור ולא נקודה",
  },
  // ── יפו ──
  {
    name: "יפו העתיקה", aliases: ["יפו", "נמל יפו"], kind: "אתר תיירות",
    stationName: "שלמה (סלמה)", lat: 32.05398, lng: 34.75027,
    source: "Nominatim — נמל יפו, רציף העלייה השנייה",
    verification: "single", verifiedGap: "אזור ולא נקודה",
  },
  {
    name: "שוק הפשפשים", aliases: ["פשפשים"], kind: "שוק",
    stationName: "שלמה (סלמה)", lat: 32.05358, lng: 34.75627,
    source: "Nominatim — שוק הפשפשים, רבי יוחנן",
    verification: "single", verifiedGap: "מקור אחד",
  },
  {
    name: "מגדל השעון יפו", aliases: ["מגדל השעון"], kind: "אתר היסטורי",
    stationName: "שלמה (סלמה)", lat: 32.05507, lng: 34.75627,
    source: "Nominatim — מגדל השעון, יפו",
    verification: "single", verifiedGap: "מקור אחד",
  },
  {
    name: "אצטדיון בלומפילד", aliases: ["בלומפילד"], kind: "אצטדיון",
    stationName: "אצטדיון בלומפילד", lat: 32.05184, lng: 34.76158,
    source: "Nominatim — אצטדיון בלומפילד, התקומה",
    verification: "single", verifiedGap: "מקור אחד",
  },
  {
    name: "המכללה האקדמית תל אביב-יפו", aliases: ["המכללה האקדמית"], kind: "מוסד אקדמי",
    stationName: "ארליך", lat: 32.04746, lng: 34.76069,
    source: "Nominatim — המכללה האקדמית תל אביב יפו",
    verification: "single", verifiedGap: "מקור אחד",
  },
  {
    name: "מרכז פרס לשלום ולחדשנות", aliases: ["מרכז פרס"], kind: "מרכז תרבות",
    stationName: "מחרוזת", lat: 32.03742, lng: 34.74586,
    source: "Nominatim — מרכז פרס לשלום, יפו",
    verification: "single", verifiedGap: "מקור אחד",
  },
  // ── חולון ובת ים ──
  {
    name: "בית חולים וולפסון", aliases: ["וולפסון"], kind: "בית חולים",
    stationName: "הבעש\"ט", lat: 32.03603, lng: 34.76271,
    source: "Google Maps — המרכז הרפואי ע״ש אדית וולפסון, חולון",
    verification: "double", verifiedGap: "121 מ׳ בין המקורות; אותו קמפוס",
  },
  {
    name: "קניון בת ים", kind: "קניון",
    stationName: "יוספטל", lat: 32.01526, lng: 34.75610,
    source: "Nominatim — קניון בת ים, יוספטל 92",
    verification: "single", verifiedGap: "התחנה הקרובה המחושבת תואמת לשיוך הקיים",
  },
  // ── פתח תקווה ──
  {
    name: "בית חולים בילינסון", aliases: ["בילינסון", "מרכז רפואי רבין"], kind: "בית חולים",
    stationName: "בילינסון", lat: 32.09146, lng: 34.86675,
    source: "Nominatim — בילינסון, ז׳בוטינסקי, פתח תקווה",
    verification: "single", verifiedGap: "33 מ׳ מהתחנה שנקראת על שמו",
  },
  {
    name: "בית חולים שניידר", aliases: ["שניידר"], kind: "בית חולים",
    stationName: "בילינסון", lat: 32.08854, lng: 34.86858,
    source: "Nominatim — בית חולים שניידר, פתח תקווה",
    verification: "single", verifiedGap: "התחנה הקרובה המחושבת תואמת לשיוך הקיים",
  },
  {
    name: "עופר הקניון הגדול פתח תקווה", aliases: ["הקניון הגדול", "עופר"], kind: "קניון",
    stationName: "בילינסון", lat: 32.09332, lng: 34.86551,
    source: "Nominatim — הקניון הגדול, ז׳בוטינסקי 72",
    verification: "single", verifiedGap: "מקור אחד",
  },
  {
    name: "אזור התעשייה קריית אריה", aliases: ["קריית אריה", "פארקטק"], kind: "אזור תעסוקה",
    stationName: "שנקר", lat: 32.09683, lng: 34.85572,
    source: "Nominatim — אזור התעשייה קריית אריה, פתח תקווה",
    verification: "single", verifiedGap: "510 מ׳ מתחנת שנקר",
  },
];

export type PlaceHit = Place & {
  station: Station | undefined;
  metres: number | null;
  /** מחרוזת מוכנה לתצוגה, לעולם לא תחנה בלי הקשר. */
  context: string;
};

/** זמן ההליכה שכבר הוצהר באתר עבור אותו מקום, אם קיים. */
function declaredWalk(p: Place): number | null {
  const hits = LANDMARKS.filter(l => l.name === p.name && l.stationName === p.stationName);
  return hits.length ? Math.min(...hits.map(l => l.walkMins)) : null;
}

/**
 * המרחק נמדד בקו אווירי ולא בדרכים. במרחקים הקצרים האלה OSRM נותן
 * תשובות שגויות בגדול: הוא החזיר 2,018 מ׳ בין בורסת היהלומים למגדל משה
 * אביב, שני בניינים במרחק 257 מ׳ זה מזה, כי נקודת המגדל אינה מחוברת
 * לרשת ההולכי רגל שלו. יחס דרך/אוויר של פי 7 הופיע בכל מסלול שנגע בו.
 *
 * זמן הליכה אינו מחושב מהמרחק הזה. קו אווירי מתחנה תת קרקעית אל מרכז
 * בניין מחמיץ את היציאה מהמפלס, את הרמזור ואת הכניסה למתחם: עבור בורסת
 * היהלומים הוא נותן 2 דקות מול 4 שהוצהרו באתר, וההצהרה קרובה יותר.
 * לכן הזמן מוצג רק כשהוא הוצהר בידי אדם, והמרחק — שתלוי רק בשתי
 * קואורדינטות מאומתות — מוצג תמיד.
 */
export function describePlace(p: Place): PlaceHit {
  const station = STATIONS.find(s => s.name === p.stationName);
  const metres = station ? distanceMetres(p, station) : null;
  const mins = declaredWalk(p);
  const parts = [`תחנת ${p.stationName}`];
  if (metres !== null) parts.push(formatDistance(metres));
  if (mins !== null) parts.push(`${mins} דקות הליכה`);
  return { ...p, station, metres, context: parts.join(" · ") };
}

/**
 * כינוי נחשב להתאמה אם הוא מכיל את מה שהוקלד, או אם הוא מופיע בשאילתה
 * כמילה שלמה. הבדיקה הרחבה הקודמת, q.includes(a), התאימה כל כינוי קצר
 * לכל שאילתה שהכילה אותו כרצף תווים — "תחנת שנקר" החזיר את מכללת שנקר
 * ברמת גן ולא את התחנה.
 */
function aliasHit(alias: string, q: string): boolean {
  if (alias.includes(q)) return true;
  return q.split(/[\s,.\u05be"'־]+/).some(w => w === alias);
}

export function searchPlaces(query: string, limit = 4): PlaceHit[] {
  const q = normalizeHebrew(query);
  if (q.length < 2) return [];  // normalizeHebrew כבר עשה trim
  return PLACES
    .filter(p => normalizeHebrew(p.name).includes(q) || p.aliases?.some(a => aliasHit(normalizeHebrew(a), q)))
    .map(describePlace)
    .sort((a, b) => (a.metres ?? Infinity) - (b.metres ?? Infinity))
    .slice(0, limit);
}

/**
 * חלק מהמקומות כאן קיימים גם ב-LANDMARKS, עם זמן הליכה מוצהר שאינו זהה
 * למרחק המחושב. בלי האיחוד הזה אותו מקום הופיע פעמיים באותה רשימה —
 * "בורסת היהלומים · 2 דק׳" ומיד אחריו "בורסת היהלומים · 4 דקות".
 * רשומה עם קואורדינטה מאומתת גוברת, והכפילה נושרת.
 */
export function searchCombined(query: string) {
  const base = searchAll(query);
  const places = searchPlaces(query);
  const taken = new Set(places.map(p => p.name));
  // כשהוקלד שם תחנה במדויק, היא התשובה — לא מקום שבמקרה מכיל את המילה.
  // "שנקר" הציג את המכללה ברמת גן מעל התחנה ששמה בדיוק כך.
  const q = normalizeHebrew(query).replace(/^תחנת\s+/, "");
  const exactStation = base.stations.some(s => normalizeHebrew(s.name) === q);
  return {
    stations: base.stations,
    landmarks: base.landmarks.filter(l => !taken.has(l.name)),
    places,
    stationsFirst: exactStation,
    hiddenCount: base.hiddenCount,
  };
}
