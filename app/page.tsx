"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { findRoute, Station, STATIONS, searchAll, Landmark } from "./lib/data";
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
      {/* Landmarks first */}
      {results.landmarks.map((l) => (
  <button
    key={l.name}
    onClick={() => onSelectLandmark(l)}
    style={{
      display: "flex", alignItems: "center", gap: 12,
      width: "100%", background: "transparent",
      border: "none", borderBottom: `1px solid ${t.border}`,
      padding: "12px 14px", cursor: "pointer",
    }}
  >
    <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.station?.lineColor || "#888", flexShrink: 0, marginTop: 2 }} />
    <div style={{ flex: 1, textAlign: "right" }}>
      <div style={{ fontSize: 14, color: t.text, fontWeight: 600, fontFamily: "'Rubik', sans-serif" }}>{l.name}</div>
      <div style={{ fontSize: 11, color: t.muted, marginTop: 3, fontFamily: "'Rubik', sans-serif" }}>
        תחנת {l.stationName} · {l.walkMins} דקות הליכה
      </div>
    </div>
  </button>
))}

      {/* Stations */}
      {results.stations.map(s => (
        <button
          key={s.lineId + s.name}
          onClick={() => onSelectStation(s)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", background: "transparent",
            border: "none", borderBottom: `1px solid ${t.border}`,
            padding: "11px 14px", cursor: "pointer",
          }}
        >
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
            background: selected.lineColor,
            pointerEvents: "none",
          }} />
        )}
        <SearchDropdown
          results={results}
          onSelectStation={onSelectStation}
          onSelectLandmark={onSelectLandmark}
          t={t}
        />
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
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromResults, setFromResults] = useState<SearchResults>({ stations: [], landmarks: [] });
  const [toResults, setToResults] = useState<SearchResults>({ stations: [], landmarks: [] });
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [result, setResult] = useState<ReturnType<typeof findRoute>>(null);
  const [showMap, setShowMap] = useState(false);
  const [userLoc, setUserLoc] = useState<{lat: number; lng: number} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("dankal_theme");
    if (saved === "dark") setDark(true);

    // Pre-fill from station if coming from station page
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
    setResult(findRoute(fromStation.name, toStation.name));
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
      `}</style>

      {/* Header */}
      <header style={{
        padding: "18px 24px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${t.border}`, background: t.card,
      }}>
        <nav style={{ display: "flex", gap: 20 }}>
          <a href="/hours" style={{ color: t.muted, fontSize: 14, fontWeight: 500 }}>שעות פעילות</a>
          <a href="/line-red" style={{ color: t.muted, fontSize: 14, fontWeight: 500 }}>קווים</a>
        </nav>
        <span style={{ fontSize: 20, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>דרך קלה</span>
        <button onClick={toggleTheme} style={{
          background: t.swapBg, border: `1px solid ${t.swapBorder}`,
          borderRadius: 8, padding: "5px 12px",
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
        <p style={{ fontSize: 16, color: t.muted, marginBottom: 32, lineHeight: 1.6 }}>
          תכנון נסיעה ברכבת הקלה בגוש דן · קו אדום, קו ירוק וקו סגול
        </p>

        {/* Search Card */}
        <div style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderRadius: 16, padding: 20,
          display: "flex", flexDirection: "column", gap: 10,
          textAlign: "right", boxShadow: t.shadow,
        }}>
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

          {/* Location + Swap */}
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
            <button onClick={handleSwap} style={{
              background: "#b04050", border: "none",
              borderRadius: "50%", width: 40, height: 40,
              color: "#ffffff", fontSize: 20,
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 2px 8px #b0405044",
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

          {/* Map toggle */}
          <button onClick={() => setShowMap(m => !m)} style={{
            background: showMap ? (dark ? "#1a2220" : "#f0faf5") : t.mapBtn,
            border: `1.5px dashed ${showMap ? "#3a906088" : t.border}`,
            borderRadius: 10, padding: "12px 14px",
            color: showMap ? "#3a9060" : t.muted,
            fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}>
            {showMap ? "סגור מפה" : "בחר תחנת יעד מהמפה"}
          </button>

          {/* Map */}
          {showMap && (
            <div>
              <div style={{
                background: dark ? "#1a1a2a" : "#f4f0fc",
                padding: "8px 14px", fontSize: 12, fontWeight: 500,
                color: "#6a52a8",
                fontFamily: "'Rubik', sans-serif", textAlign: "right",
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
                onSelectStation={(s) => {
                  handleToSelectStation(s);
                  setShowMap(false);
                }}
              />
            </div>
          )}

          {/* Search button */}
          <button onClick={handlePlan} style={{
            background: fromStation && toStation ? fromStation.lineColor : t.border,
            color: fromStation && toStation ? "#fff" : t.subtle,
            border: "none", borderRadius: 10, padding: "14px",
            fontSize: 15, fontWeight: 600,
            cursor: fromStation && toStation ? "pointer" : "default",
            fontFamily: "'Rubik', sans-serif", transition: "background 0.2s",
          }}>
            חפש נסיעה
          </button>

          {/* Result */}
          {result && (
            <div style={{ background: t.resultBg, borderRadius: 12, padding: 16, border: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: result.lineColor }} />
                <span style={{ fontSize: 13, color: t.muted, fontWeight: 500 }}>{result.lineName}</span>
                {!result.direct && (
                  <span style={{ fontSize: 11, background: dark ? "#2a1e1e" : "#fdf0f0", color: "#a04040", borderRadius: 5, padding: "2px 8px", border: "1px solid #e0a0a044" }}>
                    החלפה ב{result.change}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 14 }}>
                {[
                  ["הרכבת הבאה", `${result.next}′`, result.lineColor],
                  ["זמן נסיעה", `${result.mins}′`, t.text],
                  ["תחנות", String(result.stops), t.text],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color }}>{val}</div>
                    <div style={{ fontSize: 11, color: t.muted, marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: t.routeBg, borderRadius: 8, padding: "9px 12px" }}>
                <div style={{ fontSize: 10, color: t.muted, marginBottom: 6, textAlign: "right" }}>מסלול הנסיעה</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: t.muted }}>מוצא</div>
                    <div style={{ fontSize: 13, color: fromStation?.lineColor, fontWeight: 600 }}>{fromStation?.name}</div>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ flex: 1, height: 2, background: result.lineColor + "44", borderRadius: 1 }} />
                    <span style={{ fontSize: 14, color: result.lineColor }}>←</span>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 11, color: t.muted }}>יעד</div>
                    <div style={{ fontSize: 13, color: toStation?.lineColor, fontWeight: 600 }}>{toStation?.name}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lines */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 14, color: t.muted, marginBottom: 6, fontWeight: 500, letterSpacing: "0.04em" }}>קווים</h2>
        {[
          { name: "קו אדום", desc: "פתח תקווה — בת ים · 34 תחנות · פעיל", color: "#b04050", href: "/line-red", active: true },
          { name: "קו ירוק", desc: "הרצליה — ראשון לציון · צפוי לפתיחה דצמבר 2028", color: "#3a9060", href: "/line-green", active: false },
          { name: "קו סגול", desc: "יהוד — תל אביב · צפוי לפתיחה יולי 2028", color: "#6a52a8", href: "/line-purple", active: false },
        ].map(line => (
          <a key={line.name} href={line.href} style={{
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
          <p style={{ fontSize: 11, color: t.muted, lineHeight: 1.7 }}>
            האתר אינו קשור רשמית לדנקל או לנת"ע. המידע והזמנים המוצגים הם הערכה בלבד ואינם מידע רשמי.
            לזמנים מדויקים ומידע עדכני יש לפנות לאתר הרשמי של דנקל או לאפליקציית דנקל.
          </p>
        </div>
      </section>

    </main>
  );
}