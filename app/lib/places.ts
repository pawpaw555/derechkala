import { STATIONS, LANDMARKS, Station, distanceMetres, formatDistance, searchAll } from "./data";

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
  {
    name: "מתחם הבורסה", aliases: ["בורסה"], kind: "אזור עסקים",
    stationName: "אבא הלל", lat: 32.08595, lng: 34.80220,
    source: "Nominatim — שכונת הבורסה, רמת גן, מרכז השכונה",
    verification: "single",
    verifiedGap: "מקור אחד בלבד; אזור ולא נקודה",
  },
  {
    name: "בורסת היהלומים", aliases: ["בורסה", "יהלומים"], kind: "מרכז עסקים",
    stationName: "אבא הלל", lat: 32.08355, lng: 34.80145,
    source: "Google Maps — זיסמן שלום, הבורסה, רמת גן",
    verification: "double",
    verifiedGap: "42 מ׳ בין Nominatim ל-Google",
  },
  {
    name: "מגדל משה אביב", kind: "מגדל משרדים",
    stationName: "אבא הלל", lat: 32.08376, lng: 34.80385,
    source: "Google Maps — ז׳בוטינסקי 7, רמת גן",
    verification: "double",
    verifiedGap: "38 מ׳ בין Nominatim ל-Google",
  },
  {
    name: "מכללת שנקר", aliases: ["שנקר"], kind: "מוסד אקדמי",
    stationName: "אבא הלל", lat: 32.08999, lng: 34.80300,
    source: "Nominatim — אנה פרנק 12, רמת גן",
    verification: "partial",
    verifiedGap: "25 מ׳ ממרכז תצוגת Google; Google לא החזיר סיכה לעסק",
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

export function searchPlaces(query: string, limit = 4): PlaceHit[] {
  const q = query.trim();
  if (q.length < 2) return [];
  return PLACES
    .filter(p => p.name.includes(q) || p.aliases?.some(a => a.includes(q) || q.includes(a)))
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
  return {
    stations: base.stations,
    landmarks: base.landmarks.filter(l => !taken.has(l.name)),
    places,
  };
}
