"use client";
import { useState } from "react";
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

  const [place, setPlace] = useState("");
  const [placeResults, setPlaceResults] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const [placeMsg, setPlaceMsg] = useState<string | null>(null);

  const DENIED_MSG = "הגישה למיקום חסומה. בכרום: לחצו על סמל המנעול שליד הכתובת ואפשרו מיקום. במק ייתכן שצריך גם לאפשר לכרום גישה למיקום בהגדרות המערכת. אפשר גם להקליד כתובת בשדה למטה.";
  const RETRY_MSG = "לא הצלחנו לאתר את המיקום — ייתכן שהדפדפן חסום מגישה למיקום ברמת המערכת. הקלידו כתובת או מקום בשדה למטה, ונמצא את התחנה הקרובה.";

  // חיפוש מקום לפי שם, למי שה-GPS שלו אינו זמין. Photon מבוסס OpenStreetMap,
  // ללא מפתח. הפרמטר lang אינו תומך בעברית ולכן אינו נשלח — השמות חוזרים
  // בעברית ממילא.
  const searchPlace = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = place.trim();
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

  const setLocationAndFindStation = (lat: number, lng: number) => {
    const s = findNearestStation(lat, lng);
    setUserLoc({ lat, lng });
    setNearestStation(s);
    setLocError(null);
    loadRoute({ lat, lng }, s);
  };

  const pickPlace = (p: { label: string; lat: number; lng: number }) => {
    setPlaceResults([]);
    setPlace(p.label);
    setLocationAndFindStation(p.lat, p.lng);
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
        setLocating(false);
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
      <form onSubmit={searchPlace} style={{ marginBottom: 12, position: "relative" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={place}
            onChange={e => setPlace(e.target.value)}
            placeholder="איפה אתם? רחוב, עיר או מקום מוכר"
            aria-label="חיפוש מקום"
            style={{
              flex: 1, background: t.inputBg, border: `1.5px solid ${t.border}`,
              borderRadius: 9, padding: "11px 14px", color: t.text,
              fontSize: 14, outline: "none", fontFamily: "'Rubik', sans-serif", direction: "rtl",
            }}
          />
          <button type="submit" disabled={searching || place.trim().length < 2} style={{
            background: searching || place.trim().length < 2 ? t.border : "#b04050",
            color: searching || place.trim().length < 2 ? t.subtle : "#fff",
            border: "none", borderRadius: 9, padding: "11px 18px",
            fontSize: 14, fontWeight: 600, fontFamily: "'Rubik', sans-serif",
            cursor: searching || place.trim().length < 2 ? "not-allowed" : "pointer",
          }}>{searching ? "מחפש..." : "חפש"}</button>
        </div>

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
          <div style={{ fontSize: 12, color: t.muted, marginBottom: 4 }}>התחנה הקרובה אליך</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <Link href={`/station/${encodeURIComponent(nearestStation.name)}`} style={{ color: "#b04050", fontWeight: 700, fontSize: 18 }}>
              {nearestStation.name}
            </Link>
            <span style={{ fontSize: 12, color: t.muted }}>
              {nearestStation.city}
              {userLoc ? ` · ${formatDistance(routeMetres ?? distanceMetres(userLoc, nearestStation))} · כ-${walkMinutes(routeMetres ?? distanceMetres(userLoc, nearestStation))} דק׳ הליכה${routeMetres ? " (לפי מסלול)" : ""}` : ""}
            </span>
          </div>
          <div style={{ fontSize: 12, color: t.muted, marginBottom: 10 }}>איך מגיעים לשם</div>
          <NavigationLinks station={nearestStation} from={userLoc} />
        </div>
      )}

      {locError && (
        <div role="alert" style={{
          marginBottom: 16, padding: "12px 14px",
          background: t.card, border: "1px solid #b0405055",
          borderRadius: 10, fontSize: 13, lineHeight: 1.7, color: t.text,
        }}>
          {locError}
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