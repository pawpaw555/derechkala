"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { findRoute, findRouteByArrival, isNoService, Station, STATIONS, Landmark, getNextDepartures, normalizeHebrew, stationLabel } from "./lib/data";
import { searchCombined, PlaceHit, SearchResults } from "./lib/places";
import HiddenCountNote from "./lib/HiddenCountNote";
import { useTheme, type Theme } from "./lib/useTheme";
import { SiteHeader } from "./lib/SiteComponents";
import { useNearestStation } from "./lib/useNearestStation";
import NearestStationFinder from "./lib/NearestStationFinder";

const Map = dynamic(() => import("./lib/Map"), { ssr: false });

const STATION_CITIES = ["פתח תקווה", "בני ברק", "רמת גן", "תל אביב", "בת ים"];



function SearchDropdown({ results, onSelectStation, onSelectLandmark, onSelectPlace, t }: {
  results: SearchResults;
  onSelectStation: (s: Station) => void;
  onSelectLandmark: (l: Landmark & { station: Station | undefined }) => void;
  onSelectPlace: (p: PlaceHit) => void;
  t: Theme;
}) {
  const hasResults = results.stations.length > 0 || results.landmarks.length > 0 || results.places.length > 0;
  if (!hasResults) return null;

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, zIndex: 100,
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 10, boxShadow: t.shadow, overflow: "hidden",
    }}>      {/* כשהוקלד שם תחנה במדויק היא התשובה, ולכן היא קודמת. אחרת
          אזורים קודמים, כי מי שמקליד "בורסה" מחפש אזור ולא תחנה. */}
      {results.stationsFirst ? (<>
      {results.stations.map(s => (
        <button
          key={s.lineId + s.name}
          onClick={() => onSelectStation(s)}
          className="dropdown-item"
          style={{
            display: "flex", alignItems: "center", gap: 10,
          width: "100%", background: "transparent",
          border: "none", borderBottom: `1px solid ${t.border}`,
          padding: "11px 14px", cursor: "pointer",
        }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: s.lineColor, flexShrink: 0 }} />
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 500, fontFamily: "'Rubik', sans-serif" }}>{s.name}</div>
            <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "'Rubik', sans-serif" }}>
              {s.city}{s.nearbyPlaces.length > 0 ? ` · ליד ${s.nearbyPlaces[0]}` : ""}
            </div>
          </div>
        </button>
      ))}
      {results.places.map(p => (
        <button
          key={"place:" + p.name}
          onClick={() => onSelectPlace(p)}
          className="dropdown-item"
          style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%", background: "transparent",
            border: "none", borderBottom: `1px solid ${t.border}`,
            padding: "12px 14px", cursor: "pointer",
          }}>
          <div style={{
            width: 10, height: 10, borderRadius: 3, flexShrink: 0,
            background: p.station?.lineColor || "#888", transform: "rotate(45deg)",
          }} />
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 14, color: t.text, fontWeight: 600, fontFamily: "'Rubik', sans-serif" }}>
              {p.name}
              <span style={{ fontSize: 11, color: t.subtle, fontWeight: 400, marginRight: 6 }}>{p.kind}</span>
            </div>
            <div style={{ fontSize: 11, color: t.muted, marginTop: 3, fontFamily: "'Rubik', sans-serif" }}>
              {p.context}
            </div>
          </div>
        </button>
      ))}
      </>) : (<>
      {results.places.map(p => (
        <button
          key={"place:" + p.name}
          onClick={() => onSelectPlace(p)}
          className="dropdown-item"
          style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%", background: "transparent",
            border: "none", borderBottom: `1px solid ${t.border}`,
            padding: "12px 14px", cursor: "pointer",
          }}>
          <div style={{
            width: 10, height: 10, borderRadius: 3, flexShrink: 0,
            background: p.station?.lineColor || "#888", transform: "rotate(45deg)",
          }} />
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 14, color: t.text, fontWeight: 600, fontFamily: "'Rubik', sans-serif" }}>
              {p.name}
              <span style={{ fontSize: 11, color: t.subtle, fontWeight: 400, marginRight: 6 }}>{p.kind}</span>
            </div>
            <div style={{ fontSize: 11, color: t.muted, marginTop: 3, fontFamily: "'Rubik', sans-serif" }}>
              {p.context}
            </div>
          </div>
        </button>
      ))}
      {results.stations.map(s => (
        <button
          key={s.lineId + s.name}
          onClick={() => onSelectStation(s)}
          className="dropdown-item"
          style={{
            display: "flex", alignItems: "center", gap: 10,
          width: "100%", background: "transparent",
          border: "none", borderBottom: `1px solid ${t.border}`,
          padding: "11px 14px", cursor: "pointer",
        }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: s.lineColor, flexShrink: 0 }} />
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 500, fontFamily: "'Rubik', sans-serif" }}>{s.name}</div>
            <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "'Rubik', sans-serif" }}>
              {s.city}{s.nearbyPlaces.length > 0 ? ` · ליד ${s.nearbyPlaces[0]}` : ""}
            </div>
          </div>
        </button>
      ))}
      </>)}
      {results.landmarks.map((l) => (
        <button
    key={l.name}
    onClick={() => onSelectLandmark(l)}
    className="dropdown-item"
    style={{
      display: "flex", alignItems: "center", gap: 12,
          width: "100%", background: "transparent",
          border: "none", borderBottom: `1px solid ${t.border}`,
          padding: "12px 14px", cursor: "pointer",
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.station?.lineColor || "#888", flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 14, color: t.text, fontWeight: 600, fontFamily: "'Rubik', sans-serif" }}>{l.name}</div>
            <div style={{ fontSize: 11, color: t.muted, marginTop: 3, fontFamily: "'Rubik', sans-serif" }}>
              {stationLabel(l.stationName)} · {l.walkMins} דקות הליכה
            </div>
          </div>
        </button>
      ))}
      <HiddenCountNote count={results.hiddenCount ?? 0} />
    </div>
  );
}

function InputField({ id, label, value, onChange, placeholder, selected, results, onSelectStation, onSelectLandmark, onSelectPlace, t }: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  selected: Station | null;
  results: SearchResults;
  onSelectStation: (s: Station) => void;
  onSelectLandmark: (l: Landmark & { station: Station | undefined }) => void;
  onSelectPlace: (p: PlaceHit) => void;
  t: Theme;
}) {
  return (
    <div>
      {/* הייתה כאן div: תווית נראית בלי קשר לשדה. placeholder אינו שם נגיש
          והוא נעלם ברגע שמקלידים, ולכן שני השדות היו בלי שם בכלל. label
          אמיתית נותנת שם נגיש וגם ממקדת את השדה בלחיצה על הטקסט. */}
      <label htmlFor={id} style={{ display: "block", fontSize: 13, color: t.label, marginBottom: 6, fontWeight: 600, cursor: "pointer" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", background: t.inputBg,
            border: `1.5px solid ${selected ? t.borderSelected : t.border}`,
            borderRadius: 10, padding: "12px 40px 12px 14px",
            color: t.text, fontSize: 15, outline: "none",
            fontFamily: "'Rubik', sans-serif", direction: "rtl",
            transition: "border-color 0.15s",
          }}
        />
        {selected && (
          <div style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)",
            width: 10, height: 10, borderRadius: "50%",
            background: selected.lineColor, pointerEvents: "none",
          }} />
        )}
        <SearchDropdown results={results} onSelectStation={onSelectStation} onSelectLandmark={onSelectLandmark} onSelectPlace={onSelectPlace} t={t} />
        {value.length >= 2 && results.stations.length === 0 && results.landmarks.length === 0 && results.places.length === 0 && !selected && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, zIndex: 100,
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 10, boxShadow: t.shadow,
            padding: "14px 16px", fontSize: 13, color: t.muted,
            fontFamily: "'Rubik', sans-serif", textAlign: "right",
          }}>
            לא נמצאו תוצאות עבור "{value}"
          </div>
        )}
      </div>
      {selected && (
        <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 9, padding: "10px 14px", marginTop: 6 }}>
          <div style={{ fontSize: 13, color: t.text, fontWeight: 600, marginBottom: 4, textAlign: "right" }}>{selected.name}</div>
          {selected.nearbyPlaces.length > 0 && (
            <div style={{ fontSize: 11, color: t.muted, textAlign: "right" }}>
              ליד: {selected.nearbyPlaces.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** שעה בפורמט HH:MM על אותו יום, כדי לעגן את רשימת היציאות לרכבת שנבחרה. */
function instantFromTime(sameDay: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(sameDay.getTime());
  d.setHours(h, m, 0, 0);
  return d;
}

export default function HomeContent() {
  const EMPTY_RESULTS: SearchResults = { stations: [], landmarks: [], places: [] };
  const [swapSpinning, setSwapSpinning] = useState(false);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromResults, setFromResults] = useState<SearchResults>({ stations: [], landmarks: [], places: [] });
  const [toResults, setToResults] = useState<SearchResults>({ stations: [], landmarks: [], places: [] });
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [result, setResult] = useState<ReturnType<typeof findRoute>>(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customDay, setCustomDay] = useState(new Date().getDay());
  const [customHour, setCustomHour] = useState(8);
  const [customMinute, setCustomMinute] = useState(0);
  const [timeMode, setTimeMode] = useState<"departure" | "arrival">("departure");
  // הנקודה שממנה מחושבת רשימת "עזיבות הבאות". במצב הגעה זו שעת היציאה
  // שנבחרה, ולא שעת ההגעה המבוקשת — אחרת הרשימה סותרת את הכרטיס שמעליה.
  const [planInstant, setPlanInstant] = useState<Date | null>(null);
  const finder = useNearestStation();
  const { locError, locating } = finder;
  /** מה הוזן מהכתובת, ומאיזה עמוד הגענו — כדי להסביר למשתמש מה קרה. */
  const [arrivedWith, setArrivedWith] = useState<{ from?: string; to?: string } | null>(null);
  const [backTo, setBackTo] = useState<{ href: string; label: string } | null>(null);

  useEffect(() => {
    // עמוד התחנה מקשר לכאן בשני הכיוונים: מי שמחפש תחנת מוצא ומי שמחפש
    // תחנת יעד. קודם לכן רק ?from= נקרא, ולכן לא היה אפשר להגיע לתחנה.
    // URLSearchParams.get מפענח את הערך בעצמו. ה-decodeURIComponent שהיה
    // כאן היה פענוח שני, והוא זרק URIError על כל % תועה — זריקה מתוך effect
    // בטעינה מפילה את כל העץ, כך ש-/?to=% הציג מסך שגיאה באנגלית במקום
    // האתר. ארבעת המייצרים (StationClient, Map) מקודדים פעם אחת בלבד.
    const params = new URLSearchParams(window.location.search);
    const picked: { from?: string; to?: string } = {};
    const from = params.get("from");
    if (from) {
      const station = STATIONS.find(s => s.name === from);
      if (station) { handleFromSelectStation(station); picked.from = station.name; }
    }
    const to = params.get("to");
    if (to) {
      const station = STATIONS.find(s => s.name === to);
      if (station) { handleToSelectStation(station); picked.to = station.name; }
    }
    // מי שלוחץ "תכנן נסיעה לכאן" בכרטיס שעל המפה נוחת כאן עם שדה מלא
    // ובלי הסבר, ולא ברור לו לאן הגיע ואיך לחזור. ההודעה אומרת את שניהם.
    if (picked.from || picked.to) {
      setArrivedWith(picked);
      try {
        const ref = document.referrer ? new URL(document.referrer) : null;
        if (ref && ref.origin === window.location.origin) {
          if (ref.pathname === "/map") setBackTo({ href: "/map", label: "חזרה למפה" });
          else if (ref.pathname.startsWith("/station/")) setBackTo({ href: ref.pathname, label: "חזרה לעמוד התחנה" });
        }
      } catch { /* referrer לא תקין — פשוט בלי קישור חזרה */ }
    }
  }, []);


  // הערכה מגיעה מהספק המשותף. ההגדרה שישבה כאן שוכפלה מ-useTheme
  // והייתה גדולה ממנה בשבעה שדות.
  const { dark, t } = useTheme();

  const handleFromSearch = (val: string) => {
    setArrivedWith(null);
    setFromQuery(val);
    setFromStation(null);
    setFromResults(val.length >= 2 ? searchCombined(val) : EMPTY_RESULTS);
  };

  const handleToSearch = (val: string) => {
    setArrivedWith(null);
    setToQuery(val);
    setToStation(null);
    setToResults(val.length >= 2 ? searchCombined(val) : EMPTY_RESULTS);
  };

  const handleFromSelectStation = (s: Station) => {
    setFromStation(s);
    setFromQuery(s.name);
    setFromResults(EMPTY_RESULTS);
  };

  const handleFromSelectLandmark = (l: Landmark & { station: Station | undefined }) => {
    if (!l.station) return;
    setFromStation(l.station);
    setFromQuery(l.name);
    setFromResults(EMPTY_RESULTS);
  };

  // בחירת אזור בוחרת את התחנה שלו, אבל משאירה בשדה את מה שהמשתמש חיפש
  // בפועל — "מתחם הבורסה" ולא "אבא הלל", כדי שיישאר ברור למה נבחרה התחנה.
  const handleFromSelectPlace = (p: PlaceHit) => {
    if (!p.station) return;
    setFromStation(p.station);
    setFromQuery(p.name);
    setFromResults(EMPTY_RESULTS);
  };

  const handleToSelectStation = (s: Station) => {
    setToStation(s);
    setToQuery(s.name);
    setToResults(EMPTY_RESULTS);
  };

  const handleToSelectPlace = (p: PlaceHit) => {
    if (!p.station) return;
    setToStation(p.station);
    setToQuery(p.name);
    setToResults(EMPTY_RESULTS);
  };

  const handleToSelectLandmark = (l: Landmark & { station: Station | undefined }) => {
    if (!l.station) return;
    setToStation(l.station);
    setToQuery(l.name);
    setToResults(EMPTY_RESULTS);
  };

  const handleSwap = () => {
    const tmpStation = fromStation;
    const tmpQuery = fromQuery;
    setFromStation(toStation);
    setFromQuery(toQuery);
    setToStation(tmpStation);
    setToQuery(tmpQuery);
    // כל מטפל אחר שמשנה ערך של שדה מנקה את הרשימה של אותו שדה. ההחלפה
    // שינתה את שני השדות ולא ניקתה אף אחת, כך שרשימה שנפתחה תחת "מוצא"
    // נשארה שם בזמן שהטקסט שהוליד אותה עבר ל"יעד".
    setFromResults(EMPTY_RESULTS);
    setToResults(EMPTY_RESULTS);
    setResult(null);
  };

  // מי שמקליד את שם התחנה במלואו ולא מקיש על השורה ברשימה — דפוס נפוץ
  // בנייד, כי הטקסט כבר נראה נכון — נתקל בכפתור שלא עושה כלום ובלי הסבר.
  // שם מלא ומדויק נחשב מעכשיו לבחירה.
  const resolveStation = (selected: Station | null, typed: string) =>
    selected ?? STATIONS.find(s => normalizeHebrew(s.name) === normalizeHebrew(typed)) ?? null;
  const fromReady = resolveStation(fromStation, fromQuery);
  const toReady = resolveStation(toStation, toQuery);

  const handlePlan = () => {
    const fromStation = fromReady;
    const toStation = toReady;
    if (!fromStation || !toStation) return;
    setLoading(true);
    setResult(null);

    const baseDate = new Date();
    if (useCustomTime) {
      baseDate.setDate(baseDate.getDate() + ((customDay - baseDate.getDay() + 7) % 7));
      baseDate.setHours(customHour, customMinute, 0, 0);
    }

    setTimeout(() => {
      // שני הענפים עוברים דרך פונקציה אחת כל אחד, כדי שהחישוב לא ישוכפל
      // ויתפצל. הנקודה שנבחרה נשמרת, כי רשימת "עזיבות הבאות" מתחת לכרטיס
      // בנתה את עצמה משעת ההגעה המבוקשת וסתרה אותו.
      if (useCustomTime && timeMode === "arrival") {
        const r = findRouteByArrival(fromStation.name, toStation.name, baseDate);
        setResult(r);
        setPlanInstant(r && !isNoService(r) && r.departureTime ? instantFromTime(baseDate, r.departureTime) : baseDate);
      } else {
        const departures = getNextDepartures(baseDate, 1);
        setResult(findRoute(fromStation.name, toStation.name, departures[0]?.minsFromNow, baseDate));
        setPlanInstant(baseDate);
      }
      setLoading(false);
    }, 2000 + Math.random() * 1000);
  };

  // הלוגיקה המשותפת יושבת ב-useNearestStation, כדי שעמוד הבית ועמוד
  // המפה יתנהגו אותו דבר ולא יתפצלו שוב.
  const getLocation = () => finder.requestLocation(s => handleFromSelectStation(s));

  return (
    <main style={{
      minHeight: "100vh", background: t.bg,
      fontFamily: "'Rubik', sans-serif", direction: "rtl",
      transition: "background 0.2s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: ${t.subtle}; }
        a { text-decoration: none; }

        .station-dot { animation: stationPulse 0.6s ease-in-out infinite alternate; }
        .station-dot:nth-child(1) { animation-delay: 0s; }
        .station-dot:nth-child(2) { animation-delay: 0.15s; }
        .station-dot:nth-child(3) { animation-delay: 0.3s; }
        .station-dot:nth-child(4) { animation-delay: 0.45s; }
        .station-dot:nth-child(5) { animation-delay: 0.6s; }
        @keyframes stationPulse { 0% { opacity: 0.2; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.3); } }

        input:focus { border-color: #b04050 !important; box-shadow: 0 0 0 3px #b0405018 !important; transition: all 0.2s; }

        .btn-primary { transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease; }
        .btn-primary:hover { filter: brightness(1.08); box-shadow: 0 4px 12px #b0405030; }
        .btn-primary:active { transform: scale(0.97); filter: brightness(0.95); }

        .btn-secondary { transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
        .btn-secondary:hover { border-color: #b04050 !important; color: #b04050 !important; }
        .btn-secondary:active { transform: scale(0.97); }

        .btn-toggle { transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .btn-toggle:active { transform: scale(0.96); }

        .btn-mappick { transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease; }
        .btn-mappick:active { transform: scale(0.99); }
        .btn-swap { transition: box-shadow 0.2s ease; }
        .btn-swap:hover { box-shadow: 0 4px 16px #b0405050 !important; transform: scale(1.1); }

        .dropdown-item { transition: background 0.12s ease; }
        .dropdown-item:hover { background: ${t.resultBg} !important; }

        .card-selected { animation: cardPop 0.2s ease-out; }
        @keyframes cardPop { 0% { transform: scale(0.98); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }

        .dropdown-enter { animation: dropIn 0.15s ease-out; }
        @keyframes dropIn { 0% { opacity: 0; transform: translateY(-6px); } 100% { opacity: 1; transform: translateY(0); } }

        .line-card { transition: transform 0.15s ease, box-shadow 0.15s ease; display: flex; }
        .line-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px #00000015 !important; }
      `}</style>

      <SiteHeader />

      {/* Hero */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "52px 24px 36px", textAlign: "center" }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: t.text, marginBottom: 10, lineHeight: 1.25 }}>
          הרכבת הקלה של גוש דן
        </h1>

        <div style={{ marginBottom: 32, position: "relative", overflow: "hidden", height: 72 }}>
          <style>{`
            @keyframes trainSlide {
              0% { transform: translateX(600px); }
              100% { transform: translateX(-600px); }
            }
            @keyframes textFadeIn {
              0% { opacity: 0; transform: translateY(6px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .train-anim { animation: trainSlide 14s linear infinite; display: inline-block; }
            .slogan-anim { animation: textFadeIn 1.2s ease-out forwards; }
          `}</style>

          <div style={{
            position: "absolute", bottom: 8, left: 0, right: 0,
            height: 2, background: "#b04050", opacity: 0.2, borderRadius: 1,
          }} />

          <div className="train-anim" style={{
            position: "absolute", bottom: 6, left: "50%",
          }}>
            <svg width="160" height="16" viewBox="0 0 160 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Car 1 */}
              <rect x="0" y="0" width="34" height="12" rx="3" fill="#b04050"/>
              <rect x="2" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <rect x="12" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <rect x="22" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <circle cx="7" cy="14" r="2.5" fill="#7a2030"/>
              <circle cx="27" cy="14" r="2.5" fill="#7a2030"/>
              {/* Car 2 */}
              <rect x="38" y="0" width="34" height="12" rx="3" fill="#b04050"/>
              <rect x="40" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <rect x="50" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <rect x="60" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <circle cx="45" cy="14" r="2.5" fill="#7a2030"/>
              <circle cx="65" cy="14" r="2.5" fill="#7a2030"/>
              {/* Car 3 */}
              <rect x="76" y="0" width="34" height="12" rx="3" fill="#b04050"/>
              <rect x="78" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <rect x="88" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <rect x="98" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <circle cx="83" cy="14" r="2.5" fill="#7a2030"/>
              <circle cx="103" cy="14" r="2.5" fill="#7a2030"/>
              {/* Car 4 */}
              <rect x="114" y="0" width="34" height="12" rx="3" fill="#b04050"/>
              <rect x="116" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <rect x="126" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <rect x="136" y="2" width="7" height="6" rx="1" fill="#f8d0d4" opacity="0.8"/>
              <circle cx="121" cy="14" r="2.5" fill="#7a2030"/>
              <circle cx="141" cy="14" r="2.5" fill="#7a2030"/>
            </svg>
          </div>

          <p className="slogan-anim" style={{
            fontSize: 15, color: t.muted, lineHeight: 1.8,
            position: "absolute", top: 0, left: 0, right: 0, textAlign: "center",
          }}>
            הדרך הקלה להגיע ולנסוע ברכבת הקלה<br/>הקו האדום — פתח תקווה עד בת ים
          </p>
        </div>

        {/* Search Card */}
        <div style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderRadius: 16, padding: 20,
          display: "flex", flexDirection: "column", gap: 10,
          textAlign: "right", boxShadow: t.shadow,
        }}>
          {loading ? (
            <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1, height: 2, background: "#b04050", opacity: 0.15, borderRadius: 1 }} />
                <div style={{ position: "absolute", left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 10px" }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="station-dot" style={{
                      width: 14, height: 14, borderRadius: "50%",
                      background: "#b04050", border: "3px solid #fff",
                      boxShadow: "0 0 0 2px #b04050",
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 14, color: t.muted, fontWeight: 500, fontFamily: "'Rubik', sans-serif" }}>
                מחפש את הנסיעה הטובה ביותר...
              </div>
            </div>
          ) : result && isNoService(result) ? (
            <div role="alert" style={{
              background: t.card, border: "1px solid #b0405055", borderRadius: 12,
              padding: "16px 18px", textAlign: "right",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>
                אין רכבת בזמן שבחרת
              </div>
              <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.7 }}>{result.reason}</div>
              <a href="/hours" style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: "#b04050" }}>
                לוח שעות הפעילות המלא ←
              </a>
            </div>
          ) : result ? (
            /* Collapsed result view */
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: t.muted, fontWeight: 500, letterSpacing: "0.04em" }}>מסלול נסיעה</div>
                  <div style={{ fontSize: 10, color: t.muted, background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 6, padding: "2px 7px" }}>הערכה בלבד</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ textAlign: "right", flex: 1 }}>
                    <div style={{ fontSize: 11, color: t.muted, marginBottom: 2 }}>מוצא</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: fromStation?.lineColor }}>{fromStation?.name}</div>
                    {fromStation && fromStation.nearbyPlaces.length > 0 && (
                      <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>ליד: {fromStation.nearbyPlaces[0]}</div>
                    )}
                  </div>
                  <div style={{ fontSize: 18, color: result.lineColor }}>←</div>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{ fontSize: 11, color: t.muted, marginBottom: 2 }}>יעד</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: toStation?.lineColor }}>{toStation?.name}</div>
                    {toStation && toStation.nearbyPlaces.length > 0 && (
                      <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>ליד: {toStation.nearbyPlaces[0]}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0", borderTop: `1px solid ${t.border}` }}>
                  {[
                    ["שעת יציאה", result.departureTime || `${result.next}′`, result.lineColor],
                    ["זמן נסיעה", `${result.mins}′`, t.text],
                    ["שעת הגעה", result.arrivalTime || "", t.text],
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
                      <div style={{ fontSize: 10, color: t.muted, marginTop: 3 }}>{label}</div>
                    </div>
                  ))}
                </div>
                {result.change && (
                  <div style={{
                    borderTop: `1px solid ${t.border}`, padding: "10px 14px",
                    fontSize: 12, color: t.text, lineHeight: 1.6, textAlign: "right",
                  }}>
                    <strong>נדרשת החלפה ב{stationLabel(result.change)}.</strong> הקו מתפצל שם: שירות אחד ממשיך
                    לפתח תקווה והשני לקריית אריה, ולכן אין נסיעה ישירה בין שני הענפים.
                  </div>
                )}
              </div>

              {useCustomTime && (
                <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <span style={{ fontSize: 12, color: t.muted }}>{timeMode === "arrival" ? "מגיע ב: " : "יוצא ב: "}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                    {["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"][customDay]} · {customHour.toString().padStart(2,"0")}:{customMinute.toString().padStart(2,"0")}
                  </span>
                </div>
              )}

              {(() => {
                // הרשימה מתעגנת לשעת היציאה שנבחרה, לא לשעה שהמשתמש
                // הקליד. במצב הגעה אלה שתי נקודות שונות, והרשימה הציגה
                // רכבות אחרות מאלה שבכרטיס שמעליה.
                const deps = getNextDepartures(planInstant ?? new Date(), 3);
                if (deps.length === 0) return (
                  <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14, textAlign: "center", color: t.muted, fontSize: 13 }}>
                    הרכבת אינה פועלת כעת
                  </div>
                );
                return (
                  <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 11, color: t.muted, marginBottom: 10, fontWeight: 500, letterSpacing: "0.04em" }}>עזיבות הבאות</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {deps.map((d, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          background: i === 0 ? t.resultBg : "transparent",
                          border: `1px solid ${i === 0 ? fromStation?.lineColor + "44" : t.border}`,
                          borderRadius: 8, padding: "10px 14px",
                        }}>
                          <span style={{ fontSize: 13, color: i === 0 ? t.text : t.muted, fontWeight: i === 0 ? 600 : 400 }}>{d.label}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {useCustomTime ? (
                            <span style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? fromStation?.lineColor : t.text }}>{d.time}</span>
                          ) : (
                            <>
                              <span style={{ fontSize: 20, fontWeight: 700, color: i === 0 ? fromStation?.lineColor : t.text }}>{d.minsFromNow}</span>
                              <span style={{ fontSize: 11, color: t.muted }}>דקות</span>
                              <span style={{ fontSize: 12, color: t.muted }}>({d.time})</span>
                            </>
                          )}
                        </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Route map */}
              <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${t.border}` }}>
                <Map
                  stations={STATIONS}
                  userLoc={null}
                  fromStation={fromStation}
                  toStation={toStation}
                />
              </div>
{toStation && toStation.nearbyPlaces.length > 0 && (
                <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: t.muted, marginBottom: 8, fontWeight: 500 }}>מקומות קרובים ליעד</div>
                  {toStation.nearbyPlaces.map(place => (
                    <div key={place} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: toStation.lineColor, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: t.text }}>{place}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setResult(null)} style={{
                background: "transparent", border: `1px solid ${t.border}`,
                borderRadius: 10, padding: "11px 14px",
                color: t.muted, fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "'Rubik', sans-serif",
              }}>
                חפש מסלול אחר
              </button>
            </div>

          ) : (
            /* Full search form */
            <>
              {arrivedWith && (
                <div role="status" style={{
                  display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
                  justifyContent: "space-between",
                  background: t.resultBg, border: `1px solid ${t.border}`,
                  borderRadius: 9, padding: "9px 12px",
                  fontSize: 12, color: t.muted, fontFamily: "'Rubik', sans-serif",
                }}>
                  <span>
                    {arrivedWith.from && arrivedWith.to
                      ? `המוצא והיעד הוזנו מראש`
                      : arrivedWith.to
                      ? `היעד הוזן: ${arrivedWith.to}`
                      : `המוצא הוזן: ${arrivedWith.from}`}
                  </span>
                  {backTo && (
                    <a href={backTo.href} style={{ color: "#b04050", fontWeight: 600, textDecoration: "none" }}>
                      {backTo.label}
                    </a>
                  )}
                </div>
              )}
              <InputField
                id="plan-from"
                label="מתחנה"
                value={fromQuery}
                onChange={handleFromSearch}
                placeholder="מאיפה אתה יוצא?"
                selected={fromStation}
                results={fromResults}
                onSelectStation={handleFromSelectStation}
                onSelectLandmark={handleFromSelectLandmark}
                onSelectPlace={handleFromSelectPlace}
                t={t}
              />

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={getLocation} disabled={locating} aria-busy={locating} style={{
                  flex: 1, background: dark ? "#1a2220" : "#f0faf5",
                  border: `1px solid ${dark ? "#3a906066" : "#3a906088"}`,
                  borderRadius: 8, padding: "9px 12px",
                  color: dark ? "#6fc496" : "#2f7a51", fontSize: 13, fontWeight: 600,
                  cursor: locating ? "progress" : "pointer", fontFamily: "'Rubik', sans-serif",
                  opacity: locating ? 0.7 : 1,
                }}>
                  {locating ? "מאתר..." : "המיקום שלי"}
                </button>
                <button onClick={() => { handleSwap(); setSwapSpinning(true); setTimeout(() => setSwapSpinning(false), 400); }} style={{
                  background: "#b04050", border: "none",
                  borderRadius: "50%", width: 40, height: 40,
                  color: "#ffffff", fontSize: 20,
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0, boxShadow: "0 2px 8px #b0405044",
                  transform: swapSpinning ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.35s ease, box-shadow 0.2s ease",
                }} aria-label="החלף בין תחנת המוצא לתחנת היעד">⇅</button>
              </div>

              {locError && (
                <div style={{ marginTop: 4 }}>
                  <NearestStationFinder
                    finder={finder}
                    hideButton
                    hideResult
                    onFound={st => handleFromSelectStation(st)}
                  />
                </div>
              )}

              <InputField
                id="plan-to"
                label="לתחנה"
                value={toQuery}
                onChange={handleToSearch}
                placeholder="לאן אתה רוצה להגיע?"
                selected={toStation}
                results={toResults}
                onSelectStation={handleToSelectStation}
                onSelectLandmark={handleToSelectLandmark}
                onSelectPlace={handleToSelectPlace}
                t={t}
              />

              {/* המשתמש דיווח שהוא לא מבחין בכפתור הזה וצריך לחפש אותו.
                  הניגודיות הייתה תקינה (8.36:1) — הבעיה הייתה צורה: מסגרת
                  מקווקוות היא קונבנציה של אזור גרירה ולא של כפתור, והטקסט
                  ב-t.muted נקרא כמשני. עכשיו מסגרת מלאה, טקסט בצבע הקו
                  ומשקל 600, כמו "ראה במפה" בעמוד הקו. הגוון הכהה שונה כי
                  #b04050 על רקע הכפתור הכהה הוא 2.76:1; #e08090 הוא 5.72:1. */}
              <button onClick={() => setShowMap(m => !m)} className="btn-mappick" style={{
                background: showMap ? (dark ? "#1a2220" : "#f0faf5") : t.mapBtn,
                border: `1.5px solid ${showMap ? "#3a906088" : (dark ? "#e0809066" : "#b0405066")}`,
                borderRadius: 10, padding: "12px 14px",
                color: showMap ? (dark ? "#6fc496" : "#2f7a51") : (dark ? "#e08090" : "#b04050"),
                fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <span aria-hidden="true">{showMap ? "✕" : "📍"}</span>
                {showMap ? "סגור מפה" : "בחר תחנת יעד מהמפה"}
              </button>

              {showMap && (
                <div>
                  <div style={{
                    // הצבע היה קבוע #6a52a8 בשתי הערכות. על הרקע הכהה זה
                    // 2.76:1 — המשפט היחיד שמסביר מה לעשות עם המפה היה
                    // כמעט בלתי קריא. עכשיו צבע לכל ערכה, שניהם מעל AA.
                    background: dark ? "#1a1a2a" : "#f4f0fc",
                    padding: "8px 14px", fontSize: 12, fontWeight: 500,
                    color: dark ? "#b9a8e8" : "#5b4592", fontFamily: "'Rubik', sans-serif", textAlign: "right",
                    borderRadius: "10px 10px 0 0",
                    border: `1px solid ${t.border}`, borderBottom: "none",
                  }}>
                    לחץ על תחנת היעד שלך
                  </div>
                  <Map
                    stations={STATIONS}
                    userLoc={finder.userLoc}
                    fromStation={fromStation}
                    toStation={toStation}
                    onSelectStation={(s) => { handleToSelectStation(s); setShowMap(false); }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setUseCustomTime(false)} className="btn-toggle" style={{
                  flex: 1, padding: "9px 12px", borderRadius: 8,
                  border: `1px solid ${!useCustomTime ? t.borderSelected : t.border}`,
                  background: !useCustomTime ? t.resultBg : "transparent",
                  color: !useCustomTime ? t.text : t.muted,
                  fontFamily: "'Rubik', sans-serif", fontSize: 13,
                  fontWeight: !useCustomTime ? 600 : 400, cursor: "pointer",
                }}>עכשיו</button>
                <button onClick={() => setUseCustomTime(true)} className="btn-toggle" style={{
                  flex: 1, padding: "9px 12px", borderRadius: 8,
                  border: `1px solid ${useCustomTime ? t.borderSelected : t.border}`,
                  background: useCustomTime ? t.resultBg : "transparent",
                  color: useCustomTime ? t.text : t.muted,
                  fontFamily: "'Rubik', sans-serif", fontSize: 13,
                  fontWeight: useCustomTime ? 600 : 400, cursor: "pointer",
                }}>בחר זמן</button>
              </div>

              {useCustomTime && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setTimeMode("departure")} style={{
                    flex: 1, padding: "8px 12px", borderRadius: 8,
                    border: `1px solid ${timeMode === "departure" ? t.borderSelected : t.border}`,
                    background: timeMode === "departure" ? t.resultBg : "transparent",
                    color: timeMode === "departure" ? t.text : t.muted,
                    fontFamily: "'Rubik', sans-serif", fontSize: 13,
                    fontWeight: timeMode === "departure" ? 600 : 400, cursor: "pointer",
                  }}>זמן יציאה</button>
                  <button onClick={() => setTimeMode("arrival")} style={{
                    flex: 1, padding: "8px 12px", borderRadius: 8,
                    border: `1px solid ${timeMode === "arrival" ? t.borderSelected : t.border}`,
                    background: timeMode === "arrival" ? t.resultBg : "transparent",
                    color: timeMode === "arrival" ? t.text : t.muted,
                    fontFamily: "'Rubik', sans-serif", fontSize: 13,
                    fontWeight: timeMode === "arrival" ? 600 : 400, cursor: "pointer",
                  }}>זמן הגעה</button>
                </div>
                <div style={{
                  background: t.resultBg, border: `1px solid ${t.border}`,
                  borderRadius: 10, padding: "12px 14px",
                  display: "flex", gap: 10, alignItems: "center",
                  justifyContent: "center",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: 11, color: t.muted, fontWeight: 500 }}>יום</div>
                    <select value={customDay} onChange={e => setCustomDay(Number(e.target.value))} style={{
                      background: t.inputBg, border: `1px solid ${t.border}`,
                      borderRadius: 7, padding: "6px 10px", color: t.text,
                      fontSize: 13, fontFamily: "'Rubik', sans-serif", outline: "none",
                    }}>
                      <option value={0}>ראשון</option>
                      <option value={1}>שני</option>
                      <option value={2}>שלישי</option>
                      <option value={3}>רביעי</option>
                      <option value={4}>חמישי</option>
                      <option value={5}>שישי</option>
                      <option value={6}>שבת</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: 11, color: t.muted, fontWeight: 500 }}>שעה</div>
                    <select value={customHour} onChange={e => setCustomHour(Number(e.target.value))} style={{
                      background: t.inputBg, border: `1px solid ${t.border}`,
                      borderRadius: 7, padding: "6px 10px", color: t.text,
                      fontSize: 13, fontFamily: "'Rubik', sans-serif", outline: "none",
                    }}>
                      {Array.from({length: 24}, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: 11, color: t.muted, fontWeight: 500 }}>דקות</div>
                    <select value={customMinute} onChange={e => setCustomMinute(Number(e.target.value))} style={{
                      background: t.inputBg, border: `1px solid ${t.border}`,
                      borderRadius: 7, padding: "6px 10px", color: t.text,
                      fontSize: 13, fontFamily: "'Rubik', sans-serif", outline: "none",
                    }}>
                      {Array.from({length: 60}, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, "0")}</option>
                      ))}
                    </select>
                  </div>
                </div>
                </div>
              )}

              <button
                onClick={handlePlan}
                disabled={!fromReady || !toReady}
                className="btn-primary"
                style={{
                  background: fromReady && toReady ? fromReady.lineColor : t.card2,
                  color: fromReady && toReady ? "#fff" : t.muted,
                  border: `1px solid ${fromReady && toReady ? "transparent" : t.border}`,
                  borderRadius: 10, padding: "14px",
                  fontSize: 15, fontWeight: 600,
                  cursor: fromReady && toReady ? "pointer" : "not-allowed",
                  fontFamily: "'Rubik', sans-serif", transition: "background 0.2s",
                }}>
                {fromReady && toReady ? "חפש נסיעה" : "בחרו תחנת מוצא ותחנת יעד"}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Lines */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 14, color: t.muted, marginBottom: 6, fontWeight: 500, letterSpacing: "0.04em" }}>קווי הרכבת הקלה</h2>
        {[
          { name: "קו אדום", desc: "פתח תקווה — בת ים · 34 תחנות · פעיל", color: "#b04050", href: "/line-red", active: true },
          { name: "קו ירוק", desc: "הרצליה — ראשון לציון · חלק דרומי צפוי דצמבר 2028", color: "#3a9060", href: "/line-green", active: false },
          { name: "קו סגול", desc: "יהוד — תל אביב · צפוי לפתיחה יולי 2028", color: "#6a52a8", href: "/line-purple", active: false },
        ].map(line => (
          <a key={line.name} href={line.href} className="line-card" style={{
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 12, padding: "15px 18px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: line.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{line.name}</span>
                {!line.active && (
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    background: t.card2, color: t.subtle,
                    border: `1px solid ${t.border}`,
                    borderRadius: 10, padding: "2px 7px",
                  }}>בבנייה</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{line.desc}</div>
            </div>
            <span style={{ color: t.subtle, fontSize: 14 }}>←</span>
          </a>
        ))}
      </section>

      {/* Popular Stations */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 24px" }}>
        <h2 style={{ fontSize: 14, color: t.muted, marginBottom: 10, fontWeight: 500, letterSpacing: "0.04em" }}>כל תחנות הקו האדום</h2>
        <style>{`
          .station-chips { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; }
          @media (max-width: 320px) { .station-chips { grid-template-columns: 1fr; } }
        `}</style>
        {STATION_CITIES.map(city => {
          const cityStations = STATIONS.filter(s => s.city === city);
          if (cityStations.length === 0) return null;
          return (
            <div key={city} style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 12, color: t.subtle, marginBottom: 6, fontWeight: 500, letterSpacing: "0.04em" }}>{city}</h3>
              <div className="station-chips">
                {cityStations.map(s => (
                  <a key={s.name} href={`/station/${encodeURIComponent(s.name)}`} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: t.card, border: `1px solid ${t.border}`,
                    borderRadius: 10, padding: "10px 12px",
                    textDecoration: "none",
                    transition: "border-color 0.15s",
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.lineColor, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: t.text, lineHeight: 1.3 }}>{s.name}</span>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* SEO Content */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 56px" }}>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: "24px 22px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 16 }}>הרכבת הקלה בגוש דן</h2>
          <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8, marginBottom: 18 }}>
            הרכבת הקלה של גוש דן, המכונה דנקל, מחברת את ערי המטרופולין: תל אביב, פתח תקווה, בני ברק, רמת גן, בת ים ויפו. נכון לאפריל 2026, הקו האדום הוא הקו הפעיל היחיד עם 34 תחנות. הקו הירוק והקו הסגול נמצאים בבנייה ומתוכננים לפתיחה ב-2028.
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 8 }}>תחנות רכבת קלה בתל אביב</h3>
          <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8, marginBottom: 18 }}>
            הקו האדום עובר דרך מרכז תל אביב עם תחנות מרכזיות כמו סבידור מרכז, אבן גבירול/ארלוזורוב ואלנבי. הקו הירוק מחבר את צפון העיר דרך תל אביב אוניברסיטה ועד פלורנטין בדרום.
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 8 }}>רכבת קלה פתח תקווה</h3>
          <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8, marginBottom: 18 }}>
            הקו האדום מתחיל בתחנה המרכזית פתח תקווה ועובר דרך קריית אריה. הקו הסגול אינו מגיע לפתח תקווה — הוא יחבר את יהוד ואור יהודה עם מרכז תל אביב, דרך גבעת שמואל הסמוכה, רמת גן וגבעתיים.
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 8 }}>שעות פעילות רכבת קלה</h3>
          <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
            הרכבת הקלה פועלת בימי חול מ-05:30 עד חצות, בערב שבת עד 15:40, ובמוצאי שבת מ-19:45.
          </p>
        </div>
      </section>

    {/* FAQ */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 24px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 16 }}>שאלות נפוצות</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { q: "כמה עולה נסיעה ברכבת הקלה?", a: "נסיעה עד 15 ק\"מ עולה 8 ₪. נסיעה מעל 15 ק\"מ עולה 14.5 ₪. מרגע התיקוף ניתן להמשיך לנסוע באוטובוס ללא תוספת תשלום במשך 90 דקות ובטווח של עד 15 ק\"מ." },
            { q: "איך משלמים ברכבת הקלה?", a: "ניתן לשלם עם כרטיס רב-קו או אפליקציה (Moovit, Pango, HopOn). חובה לתקף לפני עלייה לרכבת — בשערי התחנות התת-קרקעיות או במכשירי התיקוף בתחנות העיליות. אין אפשרות לתקף בתוך הרכבת עצמה." },
            { q: "מה הקנס על נסיעה ללא תיקוף?", a: "הקנס עומד על 180 ₪ בתוספת מחיר הנסיעה. מי שרכש מנוי (חופשי חודשי, שנתי או יומי) ולא תיקף — הקנס לא יעלה על 100 ₪." },
            { q: "מתי פועלת הרכבת הקלה?", a: "ימי ראשון עד חמישי: 05:30 עד חצות. שישי וערבי חג: 05:30 עד 15:40. מוצאי שבת: מ-19:45 עד חצות. הרכבת אינה פועלת בשבת." },
            { q: "כל כמה זמן יש רכבת?", a: "בשעות השיא (07:00-09:00 ו-16:00-19:00) רכבת כל 3.5 דקות. בשעות הרגילות רכבת כל 6 דקות." },
            { q: "כמה תחנות יש בקו האדום?", a: "34 תחנות לאורך 24 ק\"מ, מתחנה מרכזית פתח תקווה ועד הקוממיות בבת ים. 10 מהתחנות הן תת-קרקעיות." },
            { q: "האם הרכבת הקלה פועלת בשבת?", a: "לא. הרכבת הקלה אינה פועלת בשבת. השירות מתחדש במוצאי שבת מהשעה 19:45." },
            { q: "מתי ייפתחו הקו הירוק והקו הסגול?", a: "הקו הסגול צפוי לפתיחה ביולי 2028. בקו הירוק ייפתח תחילה החלק הדרומי, מראשון לציון עד לוינסקי, בדצמבר 2028 — והקו המלא עד הרצליה צפוי לפעול ב-2030. שני הקווים נמצאים כעת בבנייה." },
          ].map(({ q, a }, i) => (
            <details key={i} style={{
              background: t.card, border: `1px solid ${t.border}`,
              borderRadius: 12, padding: "14px 18px",
              cursor: "pointer",
            }}>
              <summary style={{
                fontSize: 15, fontWeight: 600, color: t.text,
                listStyle: "none", display: "flex",
                justifyContent: "space-between", alignItems: "center",
              }}>
                {q}
                <span style={{ color: t.muted, fontSize: 18, fontWeight: 300 }}>+</span>
              </summary>
              <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8, marginTop: 10 }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

    {/* Disclaimer */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 40px" }}>
        <div style={{ padding: 14, background: dark ? "#1a1a10" : "#fffbe6", border: `1px solid ${dark ? "#44440a" : "#e8d84a"}`, borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: dark ? "#d4c840" : "#7a6a00", marginBottom: 6 }}>
            שימו לב - זמנים משוערים בלבד
          </div>
          <p style={{ fontSize: 11, color: dark ? "#b0a840" : "#5a5000", lineHeight: 1.7, marginBottom: 8 }}>
            האתר אינו קשור רשמית לדנקל או לנת"ע. זמני הרכבות המוצגים הם הערכה בלבד על בסיס לוח זמנים ידוע ואינם מידע רשמי בזמן אמת. לזמנים מדויקים יש להשתמש באפליקציית דנקל הרשמית.
          </p>
          <a href="/privacy" style={{ fontSize: 11, color: dark ? "#b0a840" : "#5a5000", textDecoration: "underline" }}>
            מדיניות פרטיות
          </a>
        </div>
      </section>

    </main>
  );
}