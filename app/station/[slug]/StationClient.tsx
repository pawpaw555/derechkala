"use client";
import { useState, useEffect } from "react";
import { Station, Landmark, searchAll, findRoute, STATIONS, getNextDepartures } from "../../lib/data";
import { STATION_CONTENT } from "../../lib/stationContent";
import { useTheme } from "../../lib/useTheme";
import { SiteHeader, SiteFooter } from "../../lib/SiteComponents";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("../../lib/Map"), { ssr: false });

type Props = {
  stationName: string;
  station: Station | null;
};

type SearchResults = {
  stations: Station[];
  landmarks: (Landmark & { station: Station | undefined })[];
};

export default function StationClient({ stationName, station }: Props) {
  const { t } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ stations: [], landmarks: [] });
  const [toStation, setToStation] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [timeMode, setTimeMode] = useState<"departure" | "arrival">("departure");
  const [customDay, setCustomDay] = useState(1);
  const [customHour, setCustomHour] = useState(8);
  const [customMinute, setCustomMinute] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof findRoute>>(null);
  const [loading, setLoading] = useState(false);
  const [departures, setDepartures] = useState<{mins: number; time?: string; label: string}[]>([]);

  const color = station?.lineColor || "#b04050";
const content = STATION_CONTENT[stationName];
  useEffect(() => {
    const now = new Date();
    const deps = getNextDepartures(now, 3);
    setDepartures(deps.map(d => ({ mins: d.minsFromNow, time: d.time, label: d.label })));

    // Refresh every minute
    const id = setInterval(() => {
      const updated = getNextDepartures(new Date(), 3);
      setDepartures(updated.map(d => ({ mins: d.minsFromNow, time: d.time, label: d.label })));
    }, 60000);
    return () => clearInterval(id);
  }, [station]);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (toStation) {
      setToStation("");
      setToQuery("");
      setResult(null);
    }
    setResults(val.length >= 2 ? searchAll(val) : { stations: [], landmarks: [] });
  };

  const handleSelectStation = (s: Station) => {
    setToStation(s.name);
    setToQuery(s.name);
    setQuery(s.name);
    setResults({ stations: [], landmarks: [] });
  };

  const handleSelectLandmark = (l: Landmark & { station: Station | undefined }) => {
    if (!l.station) return;
    setToStation(l.station.name);
    setToQuery(l.name);
    setQuery(l.name);
    setResults({ stations: [], landmarks: [] });
  };

  const handlePlan = () => {
    if (!toStation) return;
    const from = STATIONS.find(s => s.name === stationName);
    const to = STATIONS.find(s => s.name === toStation);
    if (!from || !to) return;

    setLoading(true);
    setResult(null);

    const baseDate = new Date();
    if (useCustomTime) {
      baseDate.setDate(baseDate.getDate() + ((customDay - baseDate.getDay() + 7) % 7));
      baseDate.setHours(customHour, customMinute, 0, 0);
    }

    setTimeout(() => {
      if (useCustomTime && timeMode === "arrival") {
        const stops = Math.abs(STATIONS.findIndex(s => s.name === toStation) - STATIONS.findIndex(s => s.name === stationName));
        const estimatedTravelMins = stops * 2 + 2;
        const departureDate = new Date(baseDate.getTime() - estimatedTravelMins * 60 * 1000);
        const departures = getNextDepartures(departureDate, 1);
        setResult(findRoute(stationName, toStation, departures[0]?.minsFromNow, departureDate));
      } else {
        const departures = getNextDepartures(baseDate, 1);
        setResult(findRoute(stationName, toStation, departures[0]?.minsFromNow, baseDate));
      }
      setLoading(false);
    }, 2000 + Math.random() * 1000);
  };

  const hasResults = results.stations.length > 0 || results.landmarks.length > 0;
  const noResults = query.length >= 2 && !hasResults && !toStation && query === query.trim();

  return (
    <main style={{
      minHeight: "100vh",
      background: t.bg,
      fontFamily: "'Rubik', sans-serif",
      direction: "rtl",
      transition: "background 0.2s",
    }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "ראשי", "item": "https://derechkala.online" },
            { "@type": "ListItem", "position": 2, "name": "תחנות הקו האדום", "item": "https://derechkala.online/line-red" },
            { "@type": "ListItem", "position": 3, "name": `תחנת ${stationName}`, "item": `https://derechkala.online/station/${encodeURIComponent(stationName)}` }
          ]
        })}}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        input::placeholder { color: ${t.subtle}; }
        .station-dot-s { animation: stationPulseS 0.6s ease-in-out infinite alternate; }
        .station-dot-s:nth-child(1) { animation-delay: 0s; }
        .station-dot-s:nth-child(2) { animation-delay: 0.15s; }
        .station-dot-s:nth-child(3) { animation-delay: 0.3s; }
        .station-dot-s:nth-child(4) { animation-delay: 0.45s; }
        .station-dot-s:nth-child(5) { animation-delay: 0.6s; }
        @keyframes stationPulseS { 0% { opacity: 0.2; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.3); } }

        input { transition: border-color 0.2s, box-shadow 0.2s; }
        input:focus { border-color: #b04050 !important; box-shadow: 0 0 0 3px #b0405018 !important; }

        .btn-primary-s { transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease; }
        .btn-primary-s:hover { filter: brightness(1.08); box-shadow: 0 4px 12px #b0405030; }
        .btn-primary-s:active { transform: scale(0.97); filter: brightness(0.95); }

        .btn-toggle-s { transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .btn-toggle-s:active { transform: scale(0.96); }

        .dropdown-item-s { transition: background 0.12s ease; }
        .dropdown-item-s:hover { background: ${t.resultBg} !important; }

        .btn-reset-s { transition: border-color 0.15s ease, color 0.15s ease; }
        .btn-reset-s:hover { border-color: #b04050 !important; color: #b04050 !important; }
      `}</style>

      <SiteHeader backHref={station?.lineHref || "/"} />

      <section style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 48px" }}>

        {/* Breadcrumbs */}
        <nav style={{ fontSize: 12, color: t.muted, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <a href="/" style={{ color: t.muted, textDecoration: "none" }}>ראשי</a>
            <span>›</span>
            <a href="/line-red" style={{ color: t.muted, textDecoration: "none" }}>תחנות הקו האדום</a>
            <span>›</span>
            <span style={{ color: t.text, fontWeight: 500 }}>תחנת {stationName}</span>
          </div>
          <a href="/map" style={{
            fontSize: 12, color: color, fontWeight: 500,
            textDecoration: "none",
          }}>
            ראה במפה
          </a>
        </nav>

        {/* Station name + line */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: t.muted, marginBottom: 6, fontWeight: 500 }}>תחנת רכבת קלה</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: t.text, marginBottom: 8 }}>{stationName}</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {station && (
              <a href={station.lineHref} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 13, color: color, fontWeight: 500 }}>{station.lineName}</span>
              </a>
            )}
            <a href={`/?from=${encodeURIComponent(stationName)}`} style={{
              fontSize: 13, fontWeight: 600, color: "#fff",
              background: color, borderRadius: 8,
              padding: "6px 14px", textDecoration: "none",
            }}>
              תכנן נסיעה מכאן
            </a>
          </div>
        </div>

        {/* Address */}
        {(content || station) && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 6, fontWeight: 500, letterSpacing: "0.04em" }}>כתובת</div>
            {(content?.address || station?.address || "").split(/,\s*(?=כניסה)/).map((line, i) => (
              <div key={i} style={{ fontSize: 14, color: t.text, fontWeight: 500, marginBottom: 2 }}>
                {line.trim()}
              </div>
            ))}
            <div style={{ fontSize: 12, color: t.muted, marginTop: 3 }}>{content?.city || station?.city}</div>
            {content?.stationType && (
              <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>{content.stationType === "תת קרקעית" ? "תחנה תת-קרקעית" : content.stationType === "עילית" ? "תחנה עילית" : content.stationType}</div>
            )}
          </div>
        )}

        {/* Trip planner */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: t.muted, marginBottom: 10, fontWeight: 500, letterSpacing: "0.04em" }}>תכנן נסיעה מתחנה זו</div>

          {loading ? (
            <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1, height: 2, background: color, opacity: 0.15, borderRadius: 1 }} />
                <div style={{ position: "absolute", left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 10px" }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="station-dot-s" style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: color, border: "3px solid #fff",
                      boxShadow: `0 0 0 2px ${color}`,
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 13, color: t.muted, fontWeight: 500, fontFamily: "'Rubik', sans-serif" }}>
                מחפש את הנסיעה הטובה ביותר...
              </div>
            </div>
          ) : result ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Result summary */}
              <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: t.muted, fontWeight: 500 }}>מסלול נסיעה</div>
                  <div style={{ fontSize: 10, color: t.muted, background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 6, padding: "2px 7px" }}>הערכה בלבד</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ textAlign: "right", flex: 1 }}>
                    <div style={{ fontSize: 11, color: t.muted }}>מוצא</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: color }}>{stationName}</div>
                  </div>
                  <div style={{ fontSize: 16, color: result.lineColor }}>←</div>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{ fontSize: 11, color: t.muted }}>יעד</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: color }}>{toStation}</div>
                    {(() => {
                      const s = STATIONS.find(st => st.name === toStation);
                      return s && s.nearbyPlaces.length > 0 ? (
                        <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>ליד: {s.nearbyPlaces[0]}</div>
                      ) : null;
                    })()}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0", borderTop: `1px solid ${t.border}` }}>
                  {[
                    ["שעת יציאה", result.departureTime || `${result.next}′`, result.lineColor],
                    ["זמן נסיעה", `${result.mins}′`, t.text],
                    ["שעת הגעה", result.arrivalTime || "", t.text],
                  ].map(([label, val, col]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: col }}>{val}</div>
                      <div style={{ fontSize: 10, color: t.muted, marginTop: 3 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom time label */}
              {useCustomTime && (
                <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 9, padding: "10px 14px", textAlign: "center" }}>
                  <span style={{ fontSize: 12, color: t.muted }}>{timeMode === "arrival" ? "מגיע ב: " : "יוצא ב: "}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                    {["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"][customDay]} · {customHour.toString().padStart(2,"0")}:{customMinute.toString().padStart(2,"0")}
                  </span>
                </div>
              )}

              {/* Map */}
              <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}` }}>
                <Map stations={STATIONS} userLoc={null} fromStation={STATIONS.find(s => s.name === stationName) || null} toStation={STATIONS.find(s => s.name === toStation) || null} onUserLocation={() => {}} onSelectStation={() => {}} />
              </div>
{(() => {
                const s = STATIONS.find(st => st.name === toStation);
                return s && s.nearbyPlaces.length > 0 ? (
                  <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, color: t.muted, marginBottom: 8, fontWeight: 500 }}>מקומות קרובים ליעד</div>
                    {s.nearbyPlaces.map(place => (
                      <div key={place} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: t.text }}>{place}</span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
              <button onClick={() => setResult(null)} className="btn-reset-s" style={{
                background: "transparent", border: `1px solid ${t.border}`,
                borderRadius: 9, padding: "10px 14px",
                color: t.muted, fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "'Rubik', sans-serif",
              }}>חפש מסלול אחר</button>
            </div>

          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Search input */}
              <div style={{ position: "relative" }}>
                <input
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="לאן אתה רוצה להגיע?"
                  style={{
                    width: "100%", background: t.inputBg,
                    border: `1.5px solid ${toStation ? t.borderSelected : t.border}`,
                    borderRadius: 9, padding: "11px 14px", color: t.text,
                    fontSize: 14, outline: "none",
                    fontFamily: "'Rubik', sans-serif", direction: "rtl",
                  }}
                />
                {hasResults && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0,
                    background: t.card, border: `1px solid ${t.border}`,
                    borderRadius: 9, zIndex: 100, boxShadow: t.shadow, overflow: "hidden",
                  }}>
                    {results.landmarks.map(l => (
                      <button key={l.name} onClick={() => handleSelectLandmark(l)} className="dropdown-item-s" style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", background: "transparent",
                        border: "none", borderBottom: `1px solid ${t.border}`,
                        padding: "11px 14px", cursor: "pointer",
                      }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: l.station?.lineColor || "#888", flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <div style={{ fontSize: 13, color: t.text, fontWeight: 600, fontFamily: "'Rubik', sans-serif" }}>{l.name}</div>
                          <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "'Rubik', sans-serif" }}>תחנת {l.stationName} · {l.walkMins} דקות הליכה</div>
                        </div>
                      </button>
                    ))}
                    {results.stations.map(s => (
                      <button key={s.name} onClick={() => handleSelectStation(s)} className="dropdown-item-s" style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", background: "transparent",
                        border: "none", borderBottom: `1px solid ${t.border}`,
                        padding: "11px 14px", cursor: "pointer",
                      }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: s.lineColor, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <div style={{ fontSize: 13, color: t.text, fontWeight: 500, fontFamily: "'Rubik', sans-serif" }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "'Rubik', sans-serif" }}>
                            {s.city}{s.nearbyPlaces.length > 0 ? ` · ליד ${s.nearbyPlaces[0]}` : ""}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {noResults && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, zIndex: 100,
                    background: t.card, border: `1px solid ${t.border}`,
                    borderRadius: 9, boxShadow: t.shadow,
                    padding: "14px 16px", fontSize: 13, color: t.muted,
                    fontFamily: "'Rubik', sans-serif", textAlign: "right",
                  }}>לא נמצאו תוצאות עבור "{query}"</div>
                )}
              </div>

              {/* Selected destination card */}
              {toStation && (
                <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 9, padding: "10px 14px" }}>
                  <div style={{ fontSize: 13, color: t.text, fontWeight: 600, marginBottom: 4, textAlign: "right" }}>יעד: {toStation}</div>
                  {(() => {
                    const s = STATIONS.find(st => st.name === toStation);
                    return s && s.nearbyPlaces.length > 0 ? (
                      <div style={{ fontSize: 11, color: t.muted, textAlign: "right" }}>ליד: {s.nearbyPlaces.join(", ")}</div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Time picker */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setUseCustomTime(false)} className="btn-toggle-s" style={{
                  flex: 1, padding: "8px 12px", borderRadius: 8,
                  border: `1px solid ${!useCustomTime ? t.borderSelected : t.border}`,
                  background: !useCustomTime ? t.resultBg : "transparent",
                  color: !useCustomTime ? t.text : t.muted,
                  fontFamily: "'Rubik', sans-serif", fontSize: 13,
                  fontWeight: !useCustomTime ? 600 : 400, cursor: "pointer",
                }}>עכשיו</button>
                <button onClick={() => setUseCustomTime(true)} className="btn-toggle-s" style={{
                  flex: 1, padding: "8px 12px", borderRadius: 8,
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
                    borderRadius: 9, padding: "12px 14px",
                    display: "flex", gap: 10, alignItems: "center", justifyContent: "center",
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
                          <option key={i} value={i}>{i.toString().padStart(2,"0")}:00</option>
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
                          <option key={m} value={m}>{m.toString().padStart(2,"0")}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={handlePlan} className="btn-primary-s" style={{
                width: "100%", background: toStation ? color : t.border,
                color: toStation ? "#fff" : t.subtle,
                border: "none", borderRadius: 9,
                padding: "12px", fontSize: 14, fontWeight: 600,
                cursor: toStation ? "pointer" : "default",
                fontFamily: "'Rubik', sans-serif",
              }}>חפש נסיעה</button>
            </div>
          )}
        </div>
{/* Intro + Best for */}
        {content && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <p style={{ fontSize: 14, color: t.text, lineHeight: 1.8, marginBottom: 12 }}>{content.intro}</p>
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 500, marginBottom: 4 }}>למי התחנה שימושית</div>
            <div style={{ fontSize: 13, color: t.text }}>{content.bestFor}</div>
          </div>
        )}

        {/* POIs */}
        {content && content.pois.length > 0 && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 12, fontWeight: 500, letterSpacing: "0.04em" }}>מוקדי עניין ליד התחנה</div>
            {content.pois.map(poi => (
              <div key={poi.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
                <div>
                  <div style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{poi.name}</div>
                  <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{poi.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Name fact */}
        {content && content.nameFact && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 8, fontWeight: 500, letterSpacing: "0.04em" }}>עובדה מעניינת</div>
            <p style={{ fontSize: 14, color: t.text, lineHeight: 1.8 }}>{content.nameFact}</p>
          </div>
        )}

        {/* Prev/Next stations */}
        {content && (content.previousStation || content.nextStation) && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 12, fontWeight: 500, letterSpacing: "0.04em" }}>תחנות סמוכות בקו</div>
            <div style={{ display: "flex", gap: 10 }}>
              {content.previousStation && (
                <a href={`/station/${encodeURIComponent(content.previousStation)}`} style={{
                  flex: 1, background: t.resultBg, border: `1px solid ${t.border}`,
                  borderRadius: 9, padding: "12px 14px", textAlign: "right", textDecoration: "none",
                }}>
                  <div style={{ fontSize: 11, color: t.muted, marginBottom: 4 }}>תחנה קודמת</div>
                  <div style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>← {content.previousStation}</div>
                </a>
              )}
              {content.nextStation && (
                <a href={`/station/${encodeURIComponent(content.nextStation)}`} style={{
                  flex: 1, background: t.resultBg, border: `1px solid ${t.border}`,
                  borderRadius: 9, padding: "12px 14px", textAlign: "left", textDecoration: "none",
                }}>
                  <div style={{ fontSize: 11, color: t.muted, marginBottom: 4 }}>תחנה הבאה</div>
                  <div style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>{content.nextStation} →</div>
                </a>
              )}
            </div>
          </div>
        )}

       
{/* FAQ */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: t.muted, marginBottom: 12, fontWeight: 500, letterSpacing: "0.04em" }}>שאלות נפוצות</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { q: "כמה עולה נסיעה?", a: "עד 15 ק\"מ — 8 ₪. מעל 15 ק\"מ — 14.5 ₪. תוך 90 דקות ניתן להמשיך באוטובוס ללא תוספת." },
              { q: "איך משלמים?", a: "רב-קו או אפליקציה (Moovit, Pango, HopOn). חובה לתקף לפני עלייה לרכבת." },
              { q: "מה הקנס על נסיעה ללא תיקוף?", a: "180 ₪ בתוספת מחיר הנסיעה. מי ששילם מראש ולא תיקף — עד 100 ₪." },
              { q: "כל כמה זמן יש רכבת?", a: "שעות שיא כל 3.5 דקות, שעות רגילות כל 6 דקות." },
            ].map(({ q, a }, i) => (
              <details key={i} style={{
                border: `1px solid ${t.border}`, borderRadius: 9,
                padding: "12px 14px", cursor: "pointer",
              }}>
                <summary style={{
                  fontSize: 14, fontWeight: 600, color: t.text,
                  listStyle: "none", display: "flex",
                  justifyContent: "space-between", alignItems: "center",
                }}>
                  {q}
                  <span style={{ color: t.muted, fontSize: 16, fontWeight: 300 }}>+</span>
                </summary>
                <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.8, marginTop: 8 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}