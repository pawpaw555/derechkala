"use client";
import { useState, useRef, useEffect } from "react";
import { Station, findNearestStation } from "./data";

export type Place = { label: string; lat: number; lng: number };

export const LOC_DENIED_MSG = "הדפדפן חוסם גישה למיקום. הדרך המהירה: הקלידו איפה אתם בשדה החיפוש.";
export const LOC_RETRY_MSG = "לא קיבלנו מיקום מהדפדפן. הדרך המהירה: הקלידו איפה אתם בשדה החיפוש.";

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

  const [place, setPlace] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [placeMsg, setPlaceMsg] = useState<string | null>(null);
  const [recent, setRecent] = useState<Place | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("derechkala:lastPlace");
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const loadRoute = async (from: { lat: number; lng: number }, to: Station) => {
    setRoute(null);
    setRouteMetres(null);
    const r = await fetchFootRoute(from, to);
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
    setSearching(true);
    setPlaceMsg(null);
    setResults([]);
    try {
      const d = await (await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8`)).json();
      const wanted = (q.match(/\d+/) || [])[0] || null;
      const hits: Place[] = (d.features || [])
        .filter((f: any) => f.properties?.countrycode === "IL")
        .map((f: any) => {
          const p = f.properties;
          const street = [p.street || p.name, p.housenumber].filter(Boolean).join(" ");
          return {
            label: [street, p.district, p.city].filter(Boolean).join(" · ") || p.name || q,
            rank: wanted && p.housenumber === wanted ? 2 : p.housenumber ? 1 : 0,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          };
        })
        .sort((a: any, b: any) => b.rank - a.rank)
        .slice(0, 5);
      if (hits.length === 0) setPlaceMsg("לא נמצא מקום בשם הזה. נסו שם של רחוב, עיר או מקום מוכר.");
      setResults(hits);
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
      setResults([]);
      setPlaceMsg("זוהו קואורדינטות — מחפש את התחנה הקרובה אליהן.");
      applyLocation(c.lat, c.lng);
      return;
    }
    if (v.trim().length < 3) { setResults([]); return; }
    debounceRef.current = setTimeout(() => search(v), 350);
  };

  const pick = (p: Place) => {
    setResults([]);
    setPlace(p.label);
    setRecent(p);
    try { localStorage.setItem("derechkala:lastPlace", JSON.stringify(p)); } catch {}
    return applyLocation(p.lat, p.lng);
  };

  const describeError = (code: number) =>
    code === 1 ? " — הרשאה נדחתה" : code === 2 ? " — המיקום אינו זמין" : code === 3 ? " — פג הזמן" : "";

  const locate = (onFound?: (s: Station) => void) => {
    if (!navigator.geolocation) { setLocError(LOC_RETRY_MSG); focusSearch(); return; }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const s = applyLocation(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        onFound?.(s);
      },
      err => {
        setLocError(err.code === 1 ? LOC_DENIED_MSG : LOC_RETRY_MSG);
        setDiag(`קוד ${err.code}${describeError(err.code)} · ${navigator.userAgent.slice(0, 90)}`);
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
        setDiag(`הרשאה חסומה מראש · ${navigator.userAgent.slice(0, 90)}`);
        focusSearch();
        return;
      }
    } catch {
      // Permissions API חסר — ממשיכים ישירות
    }
    locate(onFound);
  };

  return {
    userLoc, station, route, routeMetres,
    locError, locating, diag,
    place, results, searching, placeMsg, recent,
    searchRef, onType, search, pick, requestLocation, applyLocation,
  };
}
