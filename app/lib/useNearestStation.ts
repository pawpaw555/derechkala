"use client";
import { useState, useRef, useEffect } from "react";
import { findNearestStation } from "./data";
// טיפוס בייבוא נפרד, אחרת טוען המודולים של node מחפש אותו כערך —
// אותה תקלה שתוקנה ב-places.ts. בלי זה scripts/silent-selftest.mjs
// נופל ב-"does not provide an export named Station".
import type { Station } from "./data";

export type Place = { label: string; lat: number; lng: number; housenumber?: string };

/**
 * המשתמש ביקש מספר בית ואף תוצאה לא נושאת אותו — מחזיר את המספר.
 *
 * **נולד מבדיקה ידנית של בעל האתר ב-07.11.2026.** הוא הקליד
 * "יוספטל 82 בת ים", והאתר הציג את יוספטל 92, את הקניון ואת תחנת
 * האוטובוס — **בלי לומר שהוא לא מצא את 82**. מספר 82 פשוט אינו קיים
 * ב-OpenStreetMap, אז אין מה למצוא; אבל מי שמקליד כתובת ומקבל כתובת
 * אחרת בלי הסבר חושב שהאתר שבור, והוא צודק שהוא חושב כך.
 *
 * הקוד כבר ידע לעשות את זה נכון במקום אחד — כשהמיקום מעורפל הוא אומר
 * "ככל הנראה התחנה הקרובה אליך". זאת אותה התנהגות, במקום שני.
 *
 * טהורה בכוונה: אין בה רשת ואין בה React, ולכן `silent-selftest.mjs`
 * בודק אותה בבלוק על קלט מבוקר.
 */
export function missingHouseNumber(q: string, places: Place[]): string | null {
  const wanted = (q.match(/\d+/) || [])[0];
  if (!wanted) return null;
  if (!places.length) return null;
  return places.some(p => p.housenumber === wanted) ? null : wanted;
}

/**
 * אותו משפט בדיוק, בשני המקומות שמציגים תוצאות מקום: הפאנל
 * (NearestStationFinder) ושדה המוצא בעמוד הבית (InputField).
 *
 * המשפט נולד בפאנל ב-07.11.2026, ושדה המוצא **נשאר שותק** — הוא אפילו
 * הכריז "לא תחנה — אבל מצאנו את המקום" מעל תוצאות שאינן מה שהוקלד.
 * אילו הייתי מעתיק את המשפט לשם, היה כאן אותו טקסט פעמיים, והתיקון
 * הבא היה נוחת באחד מהם. לכן המשפט יושב כאן, ושני המקומות קוראים לו.
 */
export function houseNumberNote(q: string, places: Place[]): string | null {
  const miss = missingHouseNumber(q, places);
  return miss ? `מספר ${miss} לא נמצא במפה. אלה המקומות הקרובים ביותר:` : null;
}

/** הצורה שאנחנו באמת קוראים מתשובת Photon. */
type PhotonFeature = {
  properties?: {
    countrycode?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    city?: string;
  };
  geometry: { coordinates: [number, number] };
};

// הניסוח ניטרלי בכוונה: השדה מוגש גם כ"לאן אתם רוצים להגיע" (עמוד המפה
// והקו האדום) וגם כ"איפה אתם" (עמוד תחנה), והודעה שנועלת כיוון אחד
// סותרת את התווית שמוצגת לידה. `NearestStationFinder.hintLabel`.
export const LOC_DENIED_MSG = "הדפדפן חוסם גישה למיקום. הדרך המהירה: הקלידו את הכתובת בשדה החיפוש.";
export const LOC_RETRY_MSG = "לא קיבלנו מיקום מהדפדפן. הדרך המהירה: הקלידו את הכתובת בשדה החיפוש.";

export type Platform = "ios" | "android" | "mac" | "other";

/**
 * המסלול להפעלת שירותי מיקום שונה לגמרי בין המערכות, והוראה למערכת הלא
 * נכונה שולחת את המשתמש למסך שאין בו מה שהוא מחפש. באייפון, למשל, אין
 * "מיקום" תחת הגדרות ← Safari — הוא יושב תחת שירותי מיקום.
 */
export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  // iPadOS 13 ומעלה מדווח על עצמו כ-Macintosh; מספר נקודות המגע מפריד ביניהם.
  if (/iPhone|iPod/.test(ua) || (/iPad|Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Macintosh/.test(ua)) return "mac";
  return "other";
}

// Google Maps אינו יכול להחזיר מיקום לאתר אחר — זה מודל האבטחה של הדפדפן.
// מה שכן אפשר: להדביק משם. מזהים קואורדינטות גולמיות וגם קישורי מפות נפוצים.
export function parseCoords(v: string): { lat: number; lng: number } | null {
  const patterns = [
    /@(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /[?&]ll=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /^\s*(-?\d{1,2}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})\s*$/,
  ];
  for (const re of patterns) {
    const m = v.match(re);
    if (m) {
      const lat = Number(m[1]), lng = Number(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

/**
 * שרת הניתוב. **הכתובת היא העובדה כאן, לא הקוד.**
 *
 * עד 07.11.2026 זה היה `router.project-osrm.org` עם `/route/v1/foot/`,
 * והשרת הזה **מתעלם מהפרופיל בכתובת**. נמדד: אותן שתי נקודות ב-foot,
 * walking, driving, car ו-bike החזירו תוצאה זהה בייט לבייט — 1803.5 מ׳
 * ו-210.9 שנ׳, קצב 513 מ׳ לדקה. כלומר כל "מרחק הליכה" באתר היה מרחק
 * נסיעה ברכב, מנופח על ידי חד-סטריים ואיסורי פנייה. על 22 המקומות
 * המאומתים היחס למרחק האווירי היה 4.49 בממוצע, ומכללת שנקר הוצגה
 * כ-2668 מ׳ ו"33 דקות הליכה" במקום 931 מ׳ ו-12 דקות.
 *
 * `routing.openstreetmap.de` של FOSSGIS מריץ פרופילים נפרדים באמת:
 *
 *     routed-foot    387 מ׳ ·  73 מ׳/דק׳
 *     routed-bike    442 מ׳ · 144 מ׳/דק׳
 *     routed-car    1804 מ׳ · 513 מ׳/דק׳   ← מה שהתקבל קודם
 *
 * שימו לב ש**הנתיב בכתובת נשאר `driving`** — זה שם ה-endpoint של OSRM,
 * והפרופיל נקבע על ידי השירות (`routed-foot`). כתיבת `foot` שם היא
 * בדיוק הטעות שהייתה כאן קודם: היא נראית נכונה ואינה עושה דבר.
 *
 * אומת בשלושה מנועים על 22 מסלולים: routed-foot ו-Valhalla נחלקים
 * ב-9.5% בממוצע, לעומת 23.2% בין BRouter ל-Valhalla, והקצב המשתמע
 * הוא 77 מ׳ לדקה — ליד WALK_PACE_M_PER_MIN שהוא 80.
 *
 * מדיניות (routing.openstreetmap.de/about.html): בקשה אחת לשנייה,
 * בלי שימוש כבד, חובת ייחוס ו-user-agent תקין, בלי התחייבות לזמינות.
 * השרת הקודם היה תחת אותה מדיניות. זמן תגובה נמדד 0.21 שנ׳.
 */
const FOOT_ROUTER = "https://routing.openstreetmap.de/routed-foot";

/**
 * מסלול הליכה לפי דרכים, על נתוני OpenStreetMap, ללא מפתח.
 * המרחק מדויק; משך הזמן שהוא מחזיר אינו בשימוש — הזמן נגזר
 * מ-WALK_PACE_M_PER_MIN, שאומת בנפרד מול שני מנועים.
 *
 * כל עמוד שמציג מרחק למשתמש חייב לעבור דרך כאן. מרחק אווירי מקצר את
 * ההליכה בפועל בעשרות אחוזים — מ-Dizengoff 72 לארלוזורוב הוא 2.1 ק"מ
 * אווירי אבל ההליכה ארוכה יותר — ושני עמודים שמודדים אחרת סותרים זה את זה.
 */
export async function fetchFootRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<{ coords: [number, number][]; metres: number } | null> {
  try {
    const r = await fetch(
      `${FOOT_ROUTER}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    );
    const g = (await r.json())?.routes?.[0];
    if (!g?.geometry?.coordinates?.length) return null;
    return {
      coords: g.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]),
      metres: g.distance,
    };
  } catch {
    // בלי מסלול נופלים חזרה למרחק אווירי; אין טעם בשגיאה למשתמש.
    return null;
  }
}


/**
 * כל הלוגיקה של "איפה אני ואיזו תחנה קרובה": GPS, חיפוש מקום, הדבקת
 * קואורדינטות, מסלול הליכה וזיכרון המקום האחרון. היה קודם רק בעמוד המפה.
 */
/**
 * Nominatim יודע מספרי בית שחסרים ל-Photon. מדיניות השימוש שלו מגבילה
 * לפנייה אחת בשנייה, ולכן הוא נקרא רק כשהמשתמש הקליד מספר ו-Photon לא
 * החזיר אותו — אחרי השהיית ההקלדה, לא בכל תו.
 */
async function searchByHouseNumber(q: string): Promise<Place[]> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=il&limit=3&accept-language=he&addressdetails=1&q=${encodeURIComponent(q)}`
    );
    const rows = await r.json();
    return (rows || []).map((x: { lat: string; lon: string; address?: Record<string, string>; display_name: string }) => {
      const a = x.address || {}
      const street = [a.road, a.house_number].filter(Boolean).join(" ");
      const city = a.city || a.town || a.village || a.municipality;
      // אותה כפילות כמו ב-lookupPlaces: בערים קטנות suburb זהה ל-city,
      // והתווית יצאה "יוספטל · בת ים · בת ים". תוקן כאן אחרי שתוקן שם —
      // מופע אחד תוקן ואז נסרקה המחלקה, ונמצא שני.
      const area = a.suburb && a.suburb !== city ? a.suburb : null;
      return {
        housenumber: a.house_number,
        label: [street, area, city].filter(Boolean).join(" · ") || x.display_name.split(",").slice(0, 3).join(" · "),
        lat: Number(x.lat),
        lng: Number(x.lon),
      };
    });
  } catch {
    return [];
  }
};


/**
 * חיפוש המקום היחיד באתר: Photon, ונפילה ל-Nominatim כשהוקלד מספר בית
 * שהוא לא החזיר. שני הצרכנים — פאנל התחנה הקרובה ושדה המוצא בעמוד הבית —
 * קוראים לכאן. אין שני חיבורים ל-Photon ואין שני פרסרים לתשובה שלו.
 * שומר הרצף וההשהיה נשארים אצל הקורא, כי הם תלויים בממשק שלו.
 */
export async function lookupPlaces(q: string): Promise<Place[]> {
    // lang=default חיוני: בלעדיו Photon מכבד את Accept-Language של הדפדפן,
    // וגולש ישראלי בכרום באנגלית קיבל "HaLohamim · Neve Ofer · Tel Aviv"
    // במקום "הלוחמים · נווה עופר · תל אביב".
    const d = await (await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=default`
    )).json();
    const wanted = (q.match(/\d+/) || [])[0] || null;
    const hits: Place[] = (d.features || [])
      .filter((f: PhotonFeature) => f.properties?.countrycode === "IL")
      .map((f: PhotonFeature) => {
        const p = f.properties ?? {};
        const street = [p.street || p.name, p.housenumber].filter(Boolean).join(" ");
        // שני תיקונים שנמצאו בבדיקה ידנית של בעל האתר ב-07.11.2026:
        //
        // 1. Photon מחזיר district ו-city זהים בערים קטנות, והתווית יצאה
        //    "יוספטל · בת ים · בת ים". מוצג רק אחד מהם.
        // 2. לתחנת אוטובוס יש `name` ("בת ים - יוספטל") ו-`street` נפרד
        //    ("איילון דרום"). הקוד הציג רק את הרחוב, והתוצאה נראתה
        //    אקראית למי שחיפש כתובת. עכשיו השם מופיע כשהוא שונה מהרחוב.
        const area = p.district && p.district !== p.city ? p.district : null;
        const named = p.name && p.name !== p.street && p.street ? p.name : null;
        return {
          housenumber: p.housenumber,
          label: [named, street, area, p.city].filter(Boolean).join(" · ") || p.name || q,
          rank: wanted && p.housenumber === wanted ? 2 : p.housenumber ? 1 : 0,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        };
      })
      .sort((a: Place & { rank: number }, b: Place & { rank: number }) => b.rank - a.rank)
      .slice(0, 5);

    // המשתמש ביקש מספר בית ו-Photon לא החזיר אותו — זה המקרה שבו
    // "הלוחמים 2 תל אביב" החזיר רק את הרחוב בלי הבית.
    const gotNumber = wanted && (d.features || []).some((f: PhotonFeature) => f.properties?.housenumber === wanted);
    const extra = wanted && !gotNumber ? await searchByHouseNumber(q) : [];

    const seen = new Set<string>();
    const merged = [...extra, ...hits].filter(h => {
      const k = h.label;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 5);

  return merged;
}

export function useNearestStation() {
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [routeMetres, setRouteMetres] = useState<number | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [diag, setDiag] = useState<string | null>(null);
  /** רדיוס אי-הוודאות שהדפדפן דיווח עליו, במטרים. */
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const [place, setPlace] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [placeMsg, setPlaceMsg] = useState<string | null>(null);
  const [recent, setRecent] = useState<Place | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  // כל שינוי מיקום מפעיל בקשת מסלול. בלי מונה, תשובה איטית של בקשה ישנה
  // דורסת תשובה חדשה יותר, והפאנל מציג מרחק למקום אחר ממה שעל המסך.
  const routeSeq = useRef(0);
  // אותו שיקול בחיפוש הכתובות: שאילתה עם מספר בית מפעילה גם קריאה שנייה
  // ל-Nominatim ולכן איטית בהרבה מהשאילתה שבאה אחריה. בלי מונה, "הלוחמים 2"
  // חוזרת אחרי "הלוחמים 25" ודורסת אותה — השדה מראה טקסט אחד והרשימה אחר.
  const searchSeq = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("derechkala:lastPlace");
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const loadRoute = async (from: { lat: number; lng: number }, to: Station) => {
    const seq = ++routeSeq.current;
    setRoute(null);
    setRouteMetres(null);
    const r = await fetchFootRoute(from, to);
    if (seq !== routeSeq.current) return;
    if (r) {
      setRoute(r.coords);
      setRouteMetres(r.metres);
    }
  };

  const applyLocation = (lat: number, lng: number) => {
    const s = findNearestStation(lat, lng);
    setUserLoc({ lat, lng });
    setStation(s);
    setLocError(null);
    loadRoute({ lat, lng }, s);
    return s;
  };

  const focusSearch = () => {
    searchRef.current?.focus();
    searchRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const search = async (raw?: string) => {
    const q = (raw ?? place).trim();
    if (q.length < 2) return;
    const seq = ++searchSeq.current;
    setSearching(true);
    setPlaceMsg(null);
    setResults([]);
    try {
      const merged = await lookupPlaces(q);
      if (seq !== searchSeq.current) return;
      if (merged.length === 0) setPlaceMsg("לא נמצא מקום בשם הזה. נסו שם של רחוב, עיר או מקום מוכר.");
      else {
        // ההחלפה השקטה שבעל האתר תפס: תוצאות הוצגו במקום מה שהוקלד,
        // בלי לומר זאת. אם ביקשת מספר בית ואין אותו — נאמר.
        const note = houseNumberNote(q, merged);
        if (note) setPlaceMsg(note);
      }
      setResults(merged);
    } catch {
      if (seq !== searchSeq.current) return;
      setPlaceMsg("החיפוש לא זמין כרגע. אפשר ללחוץ על המפה במקום שבו אתם נמצאים.");
    } finally {
      if (seq === searchSeq.current) setSearching(false);
    }
  };

  const onType = (v: string) => {
    setPlace(v);
    setPlaceMsg(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const c = parseCoords(v);
    if (c) {
      setAccuracy(null);
      setResults([]);
      setPlaceMsg("זוהו קואורדינטות — מחפש את התחנה הקרובה אליהן.");
      applyLocation(c.lat, c.lng);
      return;
    }
    if (v.trim().length < 3) { setResults([]); return; }
    debounceRef.current = setTimeout(() => search(v), 350);
  };

  const pick = (p: Place) => {
    setAccuracy(null);
    setResults([]);
    setPlace(p.label);
    setRecent(p);
    try { localStorage.setItem("derechkala:lastPlace", JSON.stringify(p)); } catch {}
    return applyLocation(p.lat, p.lng);
  };

  const describeError = (code: number) =>
    code === 1 ? " — הרשאה נדחתה" : code === 2 ? " — המיקום אינו זמין" : code === 3 ? " — פג הזמן" : "";

  // ה-UA נחתך קודם ב-90 תווים, בדיוק לפני החלק שמזהה את הדפדפן: באייפון
  // הכל עד AppleWebKit זהה בספארי ובכרום, וה-CriOS/Safari מגיע אחריו.
  const describeDevice = () => `${detectPlatform()} · ${navigator.userAgent.slice(0, 200)}`;

  const locate = (onFound?: (s: Station) => void) => {
    if (!navigator.geolocation) { setLocError(LOC_RETRY_MSG); focusSearch(); return; }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        // enableHighAccuracy כבוי, ולכן דפדפן בלי סריקת WiFi שימושית נופל
        // לאיכון רשת שרדיוס השגיאה שלו יכול להיות קילומטרים. בלי לקרוא
        // את accuracy, מיקום כזה הוצג כתחנה קרובה ודאית עם מרחק מדויק.
        setAccuracy(typeof pos.coords.accuracy === "number" ? pos.coords.accuracy : null);
        const s = applyLocation(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        onFound?.(s);
      },
      err => {
        setLocError(err.code === 1 ? LOC_DENIED_MSG : LOC_RETRY_MSG);
        setDiag(`קוד ${err.code}${describeError(err.code)} · ${describeDevice()}`);
        setLocating(false);
        focusSearch();
      },
      { timeout: 15000, enableHighAccuracy: false, maximumAge: 300000 }
    );
  };

  const requestLocation = async (onFound?: (s: Station) => void) => {
    try {
      const status = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
      if (status?.state === "denied") {
        setLocError(LOC_DENIED_MSG);
        setDiag(`הרשאה חסומה מראש · ${describeDevice()}`);
        focusSearch();
        return;
      }
    } catch {
      // Permissions API חסר — ממשיכים ישירות
    }
    locate(onFound);
  };

  return {
    userLoc, station, route, routeMetres, accuracy,
    locError, locating, diag,
    place, results, searching, placeMsg, recent,
    searchRef, onType, search, pick, requestLocation, applyLocation,
  };
}
