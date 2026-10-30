"use client";
import { useState, useRef, useEffect } from "react";
import { Station, findNearestStation } from "./data";

export type Place = { label: string; lat: number; lng: number };

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

export const LOC_DENIED_MSG = "הדפדפן חוסם גישה למיקום. הדרך המהירה: הקלידו איפה אתם בשדה החיפוש.";
export const LOC_RETRY_MSG = "לא קיבלנו מיקום מהדפדפן. הדרך המהירה: הקלידו איפה אתם בשדה החיפוש.";

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
 * מסלול הליכה לפי דרכים, מ-OSRM על נתוני OpenStreetMap, ללא מפתח.
 * המרחק מדויק; משך הזמן שהוא מחזיר אינו קצב הליכה ולכן אינו בשימוש.
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
      `https://router.project-osrm.org/route/v1/foot/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
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
 * המרחק שמוצג למשתמש, ואם מותר לגזור ממנו זמן הליכה.
 *
 * OSRM אמין ברוב המקרים, אבל בקטעים קצרים הוא מחזיר עקיפה שאינה הליכה
 * אמיתית כשאחת הנקודות אינה מחוברת לרשת ההולכי רגל שלו: 91 מ' אוויריים
 * מאבא הלל למגדל משה אביב חזרו כ-624 מ', ו-256 מ' בין שני בניינים באותו
 * מתחם חזרו כ-2,018. מעל 400 מ' יחס גבוה הוא בדרך כלל מחסום אמיתי —
 * מסילה או כביש מהיר — ואז המסלול נכון.
 *
 * כשהמסלול נדחה מוצג המרחק האווירי בלי זמן: זמן שנגזר מקו אווירי נמוך
 * מדי, ולהמעיט בהליכה גרוע מלא לתת אותה. קישורי הניווט נותנים את האמת.
 *
 * יושב כאן ולא בכל רכיב בנפרד — קודם לכן הכלל היה רק בפאנל התחנה הקרובה,
 * ועמוד התחנה המשיך להזין את מספר OSRM הגולמי לזמן ההליכה.
 */
export function walkEstimate(
  airMetres: number | null,
  routeMetres: number | null
): { metres: number | null; fromRoute: boolean; trustTime: boolean } {
  if (airMetres == null) return { metres: routeMetres, fromRoute: routeMetres != null, trustTime: routeMetres != null };
  if (routeMetres == null) return { metres: airMetres, fromRoute: false, trustTime: true };
  const SHORT_HOP_M = 400;
  const plausible = airMetres >= SHORT_HOP_M || routeMetres <= airMetres * 3;
  return plausible
    ? { metres: routeMetres, fromRoute: true, trustTime: true }
    : { metres: airMetres, fromRoute: false, trustTime: false };
}

/**
 * כל הלוגיקה של "איפה אני ואיזו תחנה קרובה": GPS, חיפוש מקום, הדבקת
 * קואורדינטות, מסלול הליכה וזיכרון המקום האחרון. היה קודם רק בעמוד המפה.
 */
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

  /**
   * Nominatim יודע מספרי בית שחסרים ל-Photon. מדיניות השימוש שלו מגבילה
   * לפנייה אחת בשנייה, ולכן הוא נקרא רק כשהמשתמש הקליד מספר ו-Photon לא
   * החזיר אותו — אחרי השהיית ההקלדה, לא בכל תו.
   */
  const searchByHouseNumber = async (q: string): Promise<Place[]> => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=il&limit=3&accept-language=he&addressdetails=1&q=${encodeURIComponent(q)}`
      );
      const rows = await r.json();
      return (rows || []).map((x: { lat: string; lon: string; address?: Record<string, string>; display_name: string }) => {
        const a = x.address || {};
        const street = [a.road, a.house_number].filter(Boolean).join(" ");
        const city = a.city || a.town || a.village || a.municipality;
        return {
          label: [street, a.suburb, city].filter(Boolean).join(" · ") || x.display_name.split(",").slice(0, 3).join(" · "),
          lat: Number(x.lat),
          lng: Number(x.lon),
        };
      });
    } catch {
      return [];
    }
  };

  const search = async (raw?: string) => {
    const q = (raw ?? place).trim();
    if (q.length < 2) return;
    setSearching(true);
    setPlaceMsg(null);
    setResults([]);
    try {
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
          return {
            label: [street, p.district, p.city].filter(Boolean).join(" · ") || p.name || q,
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

      if (merged.length === 0) setPlaceMsg("לא נמצא מקום בשם הזה. נסו שם של רחוב, עיר או מקום מוכר.");
      setResults(merged);
    } catch {
      setPlaceMsg("החיפוש לא זמין כרגע. אפשר ללחוץ על המפה במקום שבו אתם נמצאים.");
    }
    setSearching(false);
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
