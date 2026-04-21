"use client";
import { useState, useEffect } from "react";
import { Station, Landmark, searchAll, findRoute, STATIONS, getNextDepartures } from "../../lib/data";
import { useTheme } from "../../lib/useTheme";
import { SiteHeader, SiteFooter } from "../../lib/SiteComponents";

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
  const [result, setResult] = useState<ReturnType<typeof findRoute>>(null);
  const [departures, setDepartures] = useState<{mins: number; time?: string; label: string}[]>([]);

  const color = station?.lineColor || "#b04050";

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
    if (!from || !to) {
      alert(`לא נמצאה תחנה: ${!from ? stationName : toStation}`);
      return;
    }
    setResult(findRoute(stationName, toStation));
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        input::placeholder { color: ${t.subtle}; }
      `}</style>

      <SiteHeader backHref={station?.lineHref || "/"} />

      <section style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 48px" }}>

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
        {station && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 6, fontWeight: 500, letterSpacing: "0.04em" }}>כתובת</div>
            <div style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>{station.address}</div>
            <div style={{ fontSize: 12, color: t.muted, marginTop: 3 }}>{station.city}</div>
          </div>
        )}

        {/* Trip planner */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: t.muted, marginBottom: 10, fontWeight: 500, letterSpacing: "0.04em" }}>תכנן נסיעה מתחנה זו</div>

          <div style={{ position: "relative", marginBottom: 10 }}>
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

            {/* Dropdown */}
            {hasResults && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0,
                background: t.card, border: `1px solid ${t.border}`,
                borderRadius: 9, zIndex: 100, boxShadow: t.shadow, overflow: "hidden",
              }}>
                {results.landmarks.map(l => (
                  <button key={l.name} onClick={() => handleSelectLandmark(l)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", background: "transparent",
                    border: "none", borderBottom: `1px solid ${t.border}`,
                    padding: "11px 14px", cursor: "pointer",
                  }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: l.station?.lineColor || "#888", flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <div style={{ fontSize: 13, color: t.text, fontWeight: 600, fontFamily: "'Rubik', sans-serif" }}>{l.name}</div>
                      <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "'Rubik', sans-serif" }}>
                        תחנת {l.stationName} · {l.walkMins} דקות הליכה
                      </div>
                    </div>
                  </button>
                ))}
                {results.stations.map(s => (
                  <button key={s.name} onClick={() => handleSelectStation(s)} style={{
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

            {/* No results */}
            {noResults && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, zIndex: 100,
                background: t.card, border: `1px solid ${t.border}`,
                borderRadius: 9, boxShadow: t.shadow,
                padding: "14px 16px", fontSize: 13, color: t.muted,
                fontFamily: "'Rubik', sans-serif", textAlign: "right",
              }}>
                לא נמצאו תוצאות עבור "{query}"
              </div>
            )}
          </div>

          {toStation && (
            <div style={{
              background: t.resultBg, border: `1px solid ${t.border}`,
              borderRadius: 9, padding: "10px 14px", marginBottom: 10,
            }}>
              {(() => {
                const s = STATIONS.find(st => st.name === toStation);
                return (
                  <div>
                    <div style={{ fontSize: 13, color: t.text, fontWeight: 600, marginBottom: 4, textAlign: "right" }}>
                      יעד: {toStation}
                    </div>
                    {s && s.nearbyPlaces.length > 0 && (
                      <div style={{ fontSize: 11, color: t.muted, textAlign: "right" }}>
                        ליד: {s.nearbyPlaces.join(", ")}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          <button onClick={handlePlan} style={{
            width: "100%", background: toStation ? color : t.border,
            color: toStation ? "#fff" : t.subtle,
            border: "none", borderRadius: 9,
            padding: "12px", fontSize: 14, fontWeight: 600,
            cursor: toStation ? "pointer" : "default",
            fontFamily: "'Rubik', sans-serif",
          }}>
            חפש נסיעה
          </button>

          {result && (
            <div style={{ marginTop: 14, background: t.resultBg, borderRadius: 9, padding: 14, border: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: result.lineColor }} />
                <span style={{ fontSize: 12, color: t.muted, fontWeight: 500 }}>{result.lineName}</span>
                {!result.direct && (
                  <span style={{ fontSize: 10, color: "#a04040", borderRadius: 5, padding: "2px 8px", border: "1px solid #e0a0a044", background: "#fdf0f0" }}>
                    החלפה ב{result.change}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {[
                  ["שעת יציאה", result.departureTime || `${result.next}′`, result.lineColor],
                  ["זמן נסיעה", `${result.mins}′`, t.text],
                  ["שעת הגעה", result.arrivalTime || "", t.text],
                ].map(([label, val, col]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: col }}>{val}</div>
                    <div style={{ fontSize: 10, color: t.muted, marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Next departures */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: t.muted, marginBottom: 12, fontWeight: 500, letterSpacing: "0.04em" }}>עזיבות הבאות</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {departures.map((d, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: i === 0 ? t.resultBg : "transparent",
                border: `1px solid ${i === 0 ? color + "44" : t.border}`,
                borderRadius: 8, padding: "10px 14px",
              }}>
                <span style={{ fontSize: 13, color: i === 0 ? t.text : t.muted, fontWeight: i === 0 ? 600 : 400 }}>{d.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: i === 0 ? color : t.text }}>{d.mins}</span>
                  <span style={{ fontSize: 11, color: t.muted }}>דקות</span>
                  {d.time && <span style={{ fontSize: 11, color: t.muted }}>({d.time})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby places */}
        {station && station.nearbyPlaces.length > 0 && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 12, fontWeight: 500, letterSpacing: "0.04em" }}>מקומות קרובים</div>
            {station.nearbyPlaces.map(place => (
              <div key={place} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: t.text }}>{place}</span>
              </div>
            ))}
          </div>
        )}

      </section>
      <SiteFooter />
    </main>
  );
}