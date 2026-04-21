"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { findRoute, Station, STATIONS, searchAll, Landmark, getNextDepartures } from "./lib/data";
import { SITE_NAME } from "./lib/SiteComponents";

const Map = dynamic(() => import("./lib/Map"), { ssr: false });

type Theme = {
  bg: string; card: string; card2: string; border: string;
  borderSelected: string; text: string; label: string;
  muted: string; subtle: string; inputBg: string; shadow: string;
  resultBg: string; routeBg: string; mapBtn: string;
  mapBtnBorder: string; mapBtnText: string;
  swapBg: string; swapBorder: string; swapText: string;
};

type SearchResults = {
  stations: Station[];
  landmarks: (Landmark & { station: Station | undefined })[];
};

function SearchDropdown({ results, onSelectStation, onSelectLandmark, t }: {
  results: SearchResults;
  onSelectStation: (s: Station) => void;
  onSelectLandmark: (l: Landmark & { station: Station | undefined }) => void;
  t: Theme;
}) {
  const hasResults = results.stations.length > 0 || results.landmarks.length > 0;
  if (!hasResults) return null;

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, zIndex: 100,
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 10, boxShadow: t.shadow, overflow: "hidden",
    }}>
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
              תחנת {l.stationName} · {l.walkMins} דקות הליכה
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
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, selected, results, onSelectStation, onSelectLandmark, t }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  selected: Station | null;
  results: SearchResults;
  onSelectStation: (s: Station) => void;
  onSelectLandmark: (l: Landmark & { station: Station | undefined }) => void;
  t: Theme;
}) {
  return (
    <div>
      <div style={{ fontSize: 13, color: t.label, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ position: "relative" }}>
        <input
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
        <SearchDropdown results={results} onSelectStation={onSelectStation} onSelectLandmark={onSelectLandmark} t={t} />
        {value.length >= 2 && results.stations.length === 0 && results.landmarks.length === 0 && !selected && (
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

export default function Home() {
  const [dark, setDark] = useState(false);
  const [swapSpinning, setSwapSpinning] = useState(false);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromResults, setFromResults] = useState<SearchResults>({ stations: [], landmarks: [] });
  const [toResults, setToResults] = useState<SearchResults>({ stations: [], landmarks: [] });
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [result, setResult] = useState<ReturnType<typeof findRoute>>(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [userLoc, setUserLoc] = useState<{lat: number; lng: number} | null>(null);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customDay, setCustomDay] = useState(1);
  const [customHour, setCustomHour] = useState(8);
  const [customMinute, setCustomMinute] = useState(0);
  const [timeMode, setTimeMode] = useState<"departure" | "arrival">("departure");

  useEffect(() => {
    const saved = localStorage.getItem("dankal_theme");
    if (saved === "dark") setDark(true);
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    if (from) {
      const station = STATIONS.find(s => s.name === decodeURIComponent(from));
      if (station) handleFromSelectStation(station);
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("dankal_theme", next ? "dark" : "light");
  };

  const t: Theme = dark ? {
    bg: "#06060a", card: "#18181f", card2: "#222230", border: "#303044",
    borderSelected: "#5a5a78", text: "#f2f2fa", label: "#d8d8ee",
    muted: "#b0b0c8", subtle: "#787890", inputBg: "#222230",
    shadow: "0 8px 24px #000000bb", resultBg: "#222230", routeBg: "#06060a",
    mapBtn: "#222230", mapBtnBorder: "#404058", mapBtnText: "#d8d8ee",
    swapBg: "#2e2e40", swapBorder: "#505068", swapText: "#f2f2fa",
  } : {
    bg: "#eaeaef", card: "#ffffff", card2: "#f4f4f8", border: "#d0d0dc",
    borderSelected: "#333344", text: "#111120", label: "#222233",
    muted: "#444458", subtle: "#777788", inputBg: "#ffffff",
    shadow: "0 8px 24px #00000022", resultBg: "#f8f8fc", routeBg: "#e8e8f0",
    mapBtn: "#f0f0f6", mapBtnBorder: "#c0c0cc", mapBtnText: "#333344",
    swapBg: "#e8e8f0", swapBorder: "#b0b0c0", swapText: "#222233",
  };

  const handleFromSearch = (val: string) => {
    setFromQuery(val);
    setFromStation(null);
    setFromResults(val.length >= 2 ? searchAll(val) : { stations: [], landmarks: [] });
  };

  const handleToSearch = (val: string) => {
    setToQuery(val);
    setToStation(null);
    setToResults(val.length >= 2 ? searchAll(val) : { stations: [], landmarks: [] });
  };

  const handleFromSelectStation = (s: Station) => {
    setFromStation(s);
    setFromQuery(s.name);
    setFromResults({ stations: [], landmarks: [] });
  };

  const handleFromSelectLandmark = (l: Landmark & { station: Station | undefined }) => {
    if (!l.station) return;
    setFromStation(l.station);
    setFromQuery(l.name);
    setFromResults({ stations: [], landmarks: [] });
  };

  const handleToSelectStation = (s: Station) => {
    setToStation(s);
    setToQuery(s.name);
    setToResults({ stations: [], landmarks: [] });
  };

  const handleToSelectLandmark = (l: Landmark & { station: Station | undefined }) => {
    if (!l.station) return;
    setToStation(l.station);
    setToQuery(l.name);
    setToResults({ stations: [], landmarks: [] });
  };

  const handleSwap = () => {
    const tmpStation = fromStation;
    const tmpQuery = fromQuery;
    setFromStation(toStation);
    setFromQuery(toQuery);
    setToStation(tmpStation);
    setToQuery(tmpQuery);
    setResult(null);
  };

  const handlePlan = () => {
    if (!fromStation || !toStation) return;
    setLoading(true);
    setResult(null);

    const baseDate = new Date();
    if (useCustomTime) {
      baseDate.setDate(baseDate.getDate() + ((customDay - baseDate.getDay() + 7) % 7));
      baseDate.setHours(customHour, customMinute, 0, 0);
    }

    setTimeout(() => {
      if (useCustomTime && timeMode === "arrival") {
        const fromIdx = STATIONS.findIndex(s => s.name === fromStation.name);
        const toIdx = STATIONS.findIndex(s => s.name === toStation.name);
        const stops = Math.abs(toIdx - fromIdx);
        const estimatedTravelMins = stops * 2 + 2;
        const departureDate = new Date(baseDate.getTime() - estimatedTravelMins * 60 * 1000);
        const departures = getNextDepartures(departureDate, 1);
        setResult(findRoute(fromStation.name, toStation.name, departures[0]?.minsFromNow, departureDate));
      } else {
        const departures = getNextDepartures(baseDate, 1);
        setResult(findRoute(fromStation.name, toStation.name, departures[0]?.minsFromNow, baseDate));
      }
      setLoading(false);
    }, 2000 + Math.random() * 1000);
  };

  const getLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let best = STATIONS[0];
        let bestDist = Infinity;
        STATIONS.forEach(s => {
          const d = Math.hypot(s.lat - lat, s.lng - lng);
          if (d < bestDist) { bestDist = d; best = s; }
        });
        handleFromSelectStation(best);
      },
      () => handleFromSelectStation(STATIONS[9]),
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

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

      {/* Header */}
      <header style={{
        padding: "14px 16px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${t.border}`, background: t.card,
      }}>
        <nav style={{ display: "flex", gap: 14 }}>
          <a href="/hours" style={{ color: t.muted, fontSize: 13, fontWeight: 500 }}>שעות פעילות</a>
          <a href="/line-red" style={{ color: t.muted, fontSize: 13, fontWeight: 500 }}>תחנות</a>
        </nav>
        <span style={{ fontSize: 20, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>דרך קלה</span>
        <button onClick={toggleTheme} style={{
          background: t.swapBg, border: `1px solid ${t.swapBorder}`,
          borderRadius: 8, padding: "5px 10px",
          color: t.swapText, fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "'Rubik', sans-serif",
        }}>
          {dark ? "בהיר" : "כהה"}
        </button>
      </header>

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
          ) : result ? (
            /* Collapsed result view */
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, color: t.muted, marginBottom: 10, fontWeight: 500, letterSpacing: "0.04em" }}>מסלול נסיעה</div>
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
                const baseDate = new Date();
                if (useCustomTime) {
                  baseDate.setDate(baseDate.getDate() + ((customDay - baseDate.getDay() + 7) % 7));
                  baseDate.setHours(customHour, customMinute, 0, 0);
                }
                const deps = getNextDepartures(baseDate, 3);
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
                  onUserLocation={() => {}}
                  onSelectStation={() => {}}
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
              <InputField
                label="מתחנה"
                value={fromQuery}
                onChange={handleFromSearch}
                placeholder="מאיפה אתה יוצא?"
                selected={fromStation}
                results={fromResults}
                onSelectStation={handleFromSelectStation}
                onSelectLandmark={handleFromSelectLandmark}
                t={t}
              />

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={getLocation} style={{
                  flex: 1, background: dark ? "#1a2220" : "#f0faf5",
                  border: `1px solid ${dark ? "#3a906066" : "#3a906088"}`,
                  borderRadius: 8, padding: "9px 12px",
                  color: "#3a9060", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Rubik', sans-serif",
                }}>
                  המיקום שלי
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
                }}>⇅</button>
              </div>

              <InputField
                label="לתחנה"
                value={toQuery}
                onChange={handleToSearch}
                placeholder="לאן אתה רוצה להגיע?"
                selected={toStation}
                results={toResults}
                onSelectStation={handleToSelectStation}
                onSelectLandmark={handleToSelectLandmark}
                t={t}
              />

              <button onClick={() => setShowMap(m => !m)} style={{
                background: showMap ? (dark ? "#1a2220" : "#f0faf5") : t.mapBtn,
                border: `1.5px dashed ${showMap ? "#3a906088" : t.border}`,
                borderRadius: 10, padding: "12px 14px",
                color: showMap ? "#3a9060" : t.muted,
                fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 500,
                cursor: "pointer",
              }}>
                {showMap ? "סגור מפה" : "בחר תחנת יעד מהמפה"}
              </button>

              {showMap && (
                <div>
                  <div style={{
                    background: dark ? "#1a1a2a" : "#f4f0fc",
                    padding: "8px 14px", fontSize: 12, fontWeight: 500,
                    color: "#6a52a8", fontFamily: "'Rubik', sans-serif", textAlign: "right",
                    borderRadius: "10px 10px 0 0",
                    border: `1px solid ${t.border}`, borderBottom: "none",
                  }}>
                    לחץ על תחנת היעד שלך
                  </div>
                  <Map
                    stations={STATIONS}
                    userLoc={userLoc}
                    fromStation={fromStation}
                    toStation={toStation}
                    onUserLocation={(lat, lng) => setUserLoc({ lat, lng })}
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
                      {[0, 15, 30, 45].map(m => (
                        <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
                      ))}
                    </select>
                  </div>
                </div>
                </div>
              )}

              <button onClick={handlePlan} className="btn-primary" style={{
            background: fromStation && toStation ? fromStation.lineColor : t.border,
            color: fromStation && toStation ? "#fff" : t.subtle,
            border: "none", borderRadius: 10, padding: "14px",
            fontSize: 15, fontWeight: 600,
            cursor: fromStation && toStation ? "pointer" : "default",
            fontFamily: "'Rubik', sans-serif", transition: "background 0.2s",
          }}>
                חפש נסיעה
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
          { name: "קו ירוק", desc: "הרצליה — ראשון לציון · צפוי לפתיחה דצמבר 2028", color: "#3a9060", href: "/line-green", active: false },
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
            הקו האדום מתחיל בתחנה המרכזית פתח תקווה ועובר דרך קריית אריה. הקו הסגול מתחיל אף הוא בקריית אריה ומחבר לרמת גן וגבעתיים.
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 8 }}>שעות פעילות רכבת קלה</h3>
          <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
            הרכבת הקלה פועלת בימי חול מ-05:30 עד חצות, בערב שבת עד 17:10, ובמוצאי שבת מ-21:00.
          </p>
        </div>
      </section>

    {/* Disclaimer */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 40px" }}>
        <div style={{ padding: 14, background: t.card, border: `1px solid ${t.border}`, borderRadius: 10 }}>
          <p style={{ fontSize: 11, color: t.muted, lineHeight: 1.7, marginBottom: 8 }}>
            האתר אינו קשור רשמית לדנקל או לנת"ע. המידע והזמנים המוצגים הם הערכה בלבד ואינם מידע רשמי.
            לזמנים מדויקים ומידע עדכני יש לפנות לאתר הרשמי של דנקל או לאפליקציית דנקל.
          </p>
          <a href="/privacy" style={{ fontSize: 11, color: t.muted, textDecoration: "underline" }}>
            מדיניות פרטיות
          </a>
        </div>
      </section>

    </main>
  );
}