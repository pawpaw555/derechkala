"use client";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { STATIONS, Station, findNearestStation, distanceMetres, formatDistance, walkMinutes } from "../lib/data";
import NavigationLinks from "../lib/NavigationLinks";
import { useTheme } from "../lib/useTheme";
import { useRouter } from "next/navigation";

const Map = dynamic(() => import("../lib/Map"), { ssr: false });

export default function MapClient() {
  const { t } = useTheme();
  const router = useRouter();
  const [userLoc, setUserLoc] = useState<{lat: number; lng: number} | null>(null);
  const [nearestStation, setNearestStation] = useState<Station | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [routeMetres, setRouteMetres] = useState<number | null>(null);
  const [approx, setApprox] = useState(false);
  const [diag, setDiag] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recent, setRecent] = useState<{ label: string; lat: number; lng: number } | null>(null);

  // המקום האחרון שנבחר נשמר מקומית בלבד, כדי שלא צריך להקליד אותו שוב.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("derechkala:lastPlace");
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const [place, setPlace] = useState("");
  const [placeResults, setPlaceResults] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const [placeMsg, setPlaceMsg] = useState<string | null>(null);

  const DENIED_MSG = "הדפדפן חוסם גישה למיקום. הדרך המהירה: הקלידו איפה אתם בשדה שלמעלה.";
  const RETRY_MSG = "לא קיבלנו מיקום מהדפדפן. הדרך המהירה: הקלידו איפה אתם בשדה שלמעלה.";

  // חיפוש מקום לפי שם, למי שה-GPS שלו אינו זמין. Photon מבוסס OpenStreetMap,
  // ללא מפתח. הפרמטר lang אינו תומך בעברית ולכן אינו נשלח — השמות חוזרים
  // בעברית ממילא.
  const searchPlace = async (raw?: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const q = (raw ?? place).trim();
    if (q.length < 2) return;
    setSearching(true);
    setPlaceMsg(null);
    setPlaceResults([]);
    try {
      const r = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8`);
      const d = await r.json();
      const wantedNumber = (q.match(/\d+/) || [])[0] || null;
      const hits = (d.features || [])
        .filter((f: any) => f.properties?.countrycode === "IL")
        .map((f: any) => {
          const p = f.properties;
          // מספר הבית הוא מה שהופך "בן גוריון" ל"בן גוריון 52". בלעדיו
          // התוצאה נראית כללית גם כשהקואורדינטה מדויקת.
          const street = [p.street || p.name, p.housenumber].filter(Boolean).join(" ");
          const label = [street, p.district, p.city].filter(Boolean).join(" · ");
          return {
            label: label || p.name || q,
            // התאמה מדויקת למספר שהוקלד מנצחת מספר בית כלשהו, שמנצח כתובת כללית.
            rank: wantedNumber && p.housenumber === wantedNumber ? 2 : p.housenumber ? 1 : 0,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          };
        })
        .sort((a: any, b: any) => b.rank - a.rank)
        .slice(0, 5);
      if (hits.length === 0) setPlaceMsg("לא נמצא מקום בשם הזה. נסו שם של רחוב, עיר או מקום מוכר.");
      setPlaceResults(hits);
    } catch {
      setPlaceMsg("החיפוש לא זמין כרגע. אפשר ללחוץ על המפה במקום שבו אתם נמצאים.");
    }
    setSearching(false);
  };

  // מסלול הליכה אמיתי לפי דרכים, מ-OSRM על נתוני OpenStreetMap, ללא מפתח.
  // המרחק שלו מדויק; משך הזמן שהוא מחזיר אינו קצב הליכה ולכן אינו בשימוש.
  const loadRoute = async (from: { lat: number; lng: number }, to: Station) => {
    setRoute(null);
    setRouteMetres(null);
    try {
      const r = await fetch(
        `https://router.project-osrm.org/route/v1/foot/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
      );
      const d = await r.json();
      const g = d?.routes?.[0];
      if (g?.geometry?.coordinates?.length) {
        setRoute(g.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]));
        setRouteMetres(g.distance);
      }
    } catch {
      // בלי מסלול המפה עדיין מציגה את שתי הנקודות; לא מציגים שגיאה.
    }
  };

  const setLocationAndFindStation = (lat: number, lng: number, approximate = false) => {
    const s = findNearestStation(lat, lng);
    setUserLoc({ lat, lng });
    setNearestStation(s);
    setApprox(approximate);
    setLocError(null);
    loadRoute({ lat, lng }, s);
  };

  // זיהוי לפי כתובת IP נוסה ונמחק: בישראל הוא מצביע על ספק האינטרנט ולא
  // על המשתמש, והציב משתמש בעיר אחרת בתל אביב בביטחון מלא. תשובה שגויה
  // שנראית ודאית גרועה מהיעדר תשובה.
  const focusSearch = () => {
    searchRef.current?.focus();
    searchRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const pickPlace = (p: { label: string; lat: number; lng: number }) => {
    setPlaceResults([]);
    setPlace(p.label);
    setLocationAndFindStation(p.lat, p.lng, false);
    setRecent(p);
    try { localStorage.setItem("derechkala:lastPlace", JSON.stringify(p)); } catch {}
  };

  // Google Maps אינו יכול להחזיר מיקום לאתר אחר — זה מודל האבטחה של
  // הדפדפן. מה שכן אפשר: להדביק משם. מזהים קואורדינטות גולמיות וגם
  // קישורי מפות נפוצים, כדי שהדבקה פשוט תעבוד.
  const parseCoords = (v: string): { lat: number; lng: number } | null => {
    const patterns = [
      /@(-?\d+\.\d+),\s*(-?\d+\.\d+)/,        // /maps/@32.08,34.78,15z
      /[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,   // ?q=32.08,34.78
      /[?&]ll=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,  // ?ll=32.08,34.78
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,       // place URLs
      /^\s*(-?\d{1,2}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})\s*$/, // הדבקה ישירה
    ];
    for (const re of patterns) {
      const m = v.match(re);
      if (m) {
        const lat = Number(m[1]), lng = Number(m[2]);
        if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
      }
    }
    return null;
  };

  // חיפוש תוך כדי הקלדה. השהיה קצרה כדי לא לשלוח בקשה על כל תו.
  const onType = (v: string) => {
    setPlace(v);
    setPlaceMsg(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const c = parseCoords(v);
    if (c) {
      setPlaceResults([]);
      setPlaceMsg("זוהו קואורדינטות — מחפש את התחנה הקרובה אליהן.");
      setLocationAndFindStation(c.lat, c.lng, false);
      return;
    }

    if (v.trim().length < 3) { setPlaceResults([]); return; }
    debounceRef.current = setTimeout(() => searchPlace(v), 350);
  };

  const locate = () => {
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocationAndFindStation(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      err => {
        setLocError(err.code === err.PERMISSION_DENIED ? DENIED_MSG : RETRY_MSG);
        setDiag(
          `קוד ${err.code}` +
          (err.code === 1 ? " — הרשאה נדחתה" : err.code === 2 ? " — המיקום אינו זמין" : err.code === 3 ? " — פג הזמן" : "") +
          ` · ${navigator.userAgent.slice(0, 90)}`
        );
        setLocating(false);
        focusSearch();
      },
      { timeout: 15000, enableHighAccuracy: false, maximumAge: 300000 }
    );
  };

  const getLocation = async () => {
    if (!navigator.geolocation) {
      setLocError(RETRY_MSG);
      return;
    }
    // If permission is already denied the request never prompts and never
    // resolves visibly, so explain up front instead of firing it.
    try {
      const status = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
      if (status?.state === "denied") {
        setLocError(DENIED_MSG);
        setDiag(`הרשאה חסומה מראש · ${navigator.userAgent.slice(0, 90)}`);
        focusSearch();
        return;
      }
    } catch {
      // Permissions API unavailable — fall through to getCurrentPosition.
    }
    locate();
  };

  return (
    <>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={getLocation} disabled={locating} aria-busy={locating} style={{
          background: "#f0faf5",
          border: "1px solid #3a906088",
          borderRadius: 10, padding: "10px 18px",
          color: "#3a9060", fontSize: 14, fontWeight: 600,
          cursor: locating ? "progress" : "pointer", fontFamily: "'Rubik', sans-serif",
          opacity: locating ? 0.7 : 1,
        }}>
          {locating ? "מאתר..." : "מצא את התחנה הקרובה אליי"}
        </button>
        <p style={{ fontSize: 12, color: t.muted, marginTop: 6 }}>
          או הקלידו כתובת למטה, או לחצו על המפה במקום שבו אתם נמצאים.
        </p>
      </div>

      {/* חיפוש מקום — החלופה ל-GPS כשהוא חסום או לא זמין */}
      <form onSubmit={e => searchPlace(place, e)} style={{ marginBottom: 12, position: "relative" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={searchRef}
            value={place}
            onChange={e => onType(e.target.value)}
            placeholder="איפה אתם? התחילו להקליד רחוב, עיר או מקום"
            aria-label="חיפוש מקום"
            autoComplete="off"
            style={{
              flex: 1, background: t.inputBg, border: `1.5px solid ${t.border}`,
              borderRadius: 9, padding: "11px 14px", color: t.text,
              fontSize: 14, outline: "none", fontFamily: "'Rubik', sans-serif", direction: "rtl",
            }}
          />
          {searching && (
            <span style={{ alignSelf: "center", fontSize: 12, color: t.muted, whiteSpace: "nowrap" }}>מחפש…</span>
          )}
        </div>

        {recent && !place && (
          <button type="button" onClick={() => pickPlace(recent)} style={{
            marginTop: 8, background: t.resultBg, border: `1px solid ${t.border}`,
            borderRadius: 8, padding: "8px 12px", fontSize: 12, color: t.text,
            cursor: "pointer", fontFamily: "'Rubik', sans-serif", textAlign: "right",
          }}>
            ↩ המקום האחרון שלך: <strong>{recent.label}</strong>
          </button>
        )}

        {placeResults.length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, zIndex: 500,
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 9, boxShadow: t.shadow, overflow: "hidden",
          }}>
            {placeResults.map(p => (
              <button key={`${p.lat},${p.lng}`} type="button" onClick={() => pickPlace(p)} style={{
                display: "block", width: "100%", textAlign: "right",
                background: "transparent", border: "none",
                borderBottom: `1px solid ${t.border}`, padding: "11px 14px",
                fontSize: 13, color: t.text, cursor: "pointer", fontFamily: "'Rubik', sans-serif",
              }}>{p.label}</button>
            ))}
          </div>
        )}

        {placeMsg && (
          <div style={{ fontSize: 12, color: t.muted, marginTop: 8 }}>{placeMsg}</div>
        )}
      </form>

      {nearestStation && (
        <div style={{
          marginBottom: 16, padding: "14px 16px",
          background: t.card, border: "1px solid #3a906055", borderRadius: 12,
        }}>
          <div style={{ fontSize: 12, color: t.muted, marginBottom: 4 }}>
            {approx ? "התחנה הקרובה למיקום המשוער שלך" : "התחנה הקרובה אליך"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <Link href={`/station/${encodeURIComponent(nearestStation.name)}`} style={{ color: "#b04050", fontWeight: 700, fontSize: 18 }}>
              {nearestStation.name}
            </Link>
            <span style={{ fontSize: 12, color: t.muted }}>
              {nearestStation.city}
              {userLoc && (() => {
                const m = routeMetres ?? distanceMetres(userLoc, nearestStation);
                // זמן הליכה מוצג רק כשהליכה היא באמת אפשרות. "131 דק׳ הליכה"
                // אינו מידע שימושי למי שנמצא בעיר אחרת.
                const walkable = m <= 2500;
                return ` · ${formatDistance(m)}${walkable ? ` · כ-${walkMinutes(m)} דק׳ הליכה` : ""}`;
              })()}
            </span>
          </div>
          {approx && (
            <div style={{
              fontSize: 11, color: t.muted, lineHeight: 1.6,
              background: t.resultBg, border: `1px solid ${t.border}`,
              borderRadius: 8, padding: "8px 10px", marginBottom: 10,
            }}>
              המיקום נקבע לפי כתובת האינטרנט ולא לפי GPS, ולכן הוא ברמת אזור בלבד.
              אם זו אינה התחנה הנכונה — הקלידו כתובת מדויקת למעלה, או לחצו על המפה במקום שבו אתם נמצאים.
            </div>
          )}
          <div style={{ fontSize: 12, color: t.muted, marginBottom: 10 }}>
            {userLoc && (routeMetres ?? distanceMetres(userLoc, nearestStation)) > 2500
              ? "רחוק מכדי ללכת — איך מגיעים לשם"
              : "איך מגיעים לשם"}
          </div>
          <NavigationLinks
            station={nearestStation}
            from={userLoc}
            transitFirst={!!userLoc && (routeMetres ?? distanceMetres(userLoc, nearestStation)) > 2500}
          />
        </div>
      )}

      {locError && (
        <div role="alert" style={{
          marginBottom: 16, padding: "12px 14px",
          background: t.card, border: "1px solid #b0405055",
          borderRadius: 10, fontSize: 13, lineHeight: 1.7, color: t.text,
        }}>
          <div style={{ marginBottom: 10 }}>{locError}</div>
          <details style={{ fontSize: 12, color: t.muted, lineHeight: 1.8 }}>
            <summary style={{ cursor: "pointer", color: t.text, fontWeight: 600, marginBottom: 6 }}>
              איך מפעילים את איתור המיקום?
            </summary>
            <div style={{ marginTop: 8 }}>
              <strong style={{ color: t.text }}>באייפון או אנדרואיד:</strong> בדרך כלל יופיע חלון שמבקש רשות —
              אשרו אותו. אם לא הופיע, היכנסו להגדרות המכשיר ← הדפדפן שלכם ← מיקום, ואפשרו.
              <div style={{ marginTop: 10 }}>
                <strong style={{ color: t.text }}>במחשב מק עם כרום:</strong> צריך לאשר בשני מקומות.
                <div style={{ marginTop: 6 }}>
                  1. בתפריט אפל ← הגדרות מערכת ← פרטיות ואבטחה ← שירותי מיקום ← הדליקו את Google Chrome.
                </div>
                <div style={{ marginTop: 4 }}>
                  2. סגרו את כרום לגמרי ופתחו מחדש, ואז נסו שוב כאן.
                </div>
                <div style={{ marginTop: 6, color: t.subtle }}>
                  בלי שלב 1, כרום אינו יכול אפילו להציג את חלון הבקשה — ולכן נראה כאילו לא קורה כלום.
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <strong style={{ color: t.text }}>אם אפליקציית גוגל מפות כן יודעת איפה אתם:</strong>
                <div style={{ marginTop: 6 }}>
                  פתחו אותה, לחצו על הנקודה הכחולה של המיקום שלכם, גררו את הכרטיס התחתון כלפי מעלה,
                  והעתיקו את שורת הקואורדינטות. הדביקו אותה כאן בשדה החיפוש — האתר יזהה אותה לבד.
                </div>
              </div>
              <div style={{ marginTop: 10, color: t.text }}>
                ואם זה נשמע מסובך — פשוט הקלידו את שם המקום בשדה למעלה. זו הדרך המהירה ביותר, והיא עובדת תמיד.
              </div>
              {diag && (
                <div style={{
                  marginTop: 12, padding: "8px 10px", borderRadius: 8,
                  background: t.resultBg, border: `1px solid ${t.border}`,
                  fontSize: 11, color: t.subtle, direction: "ltr", textAlign: "left",
                  wordBreak: "break-all", fontFamily: "monospace",
                }}>
                  <div style={{ direction: "rtl", textAlign: "right", marginBottom: 4, fontFamily: "'Rubik', sans-serif" }}>
                    פרטים טכניים (לדיווח תקלה):
                  </div>
                  {diag}
                </div>
              )}
            </div>
          </details>
        </div>
      )}

      <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${t.border}`, marginBottom: 24, boxShadow: t.shadow }}>
        <Map
          stations={STATIONS}
          userLoc={userLoc}
          fromStation={null}
          toStation={null}
          route={route}
          onUserLocation={(lat, lng) => setLocationAndFindStation(lat, lng)}
          onSelectStation={(s) => router.push(`/station/${encodeURIComponent(s.name)}`)}
        />
      </div>
    </>
  );
}