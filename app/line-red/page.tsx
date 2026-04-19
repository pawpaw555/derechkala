"use client";
import { useTheme } from "../lib/useTheme";
import { STATIONS } from "../lib/data";
import { SiteHeader, SiteFooter } from "../lib/SiteComponents";

export default function RedLine() {
  const { t } = useTheme();
  const redStations = STATIONS.filter(s => s.lineId === "red");

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
      `}</style>

      <SiteHeader backHref="/" />

      <section style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#b04050", flexShrink: 0 }} />
          <h1 style={{ fontSize: 30, fontWeight: 700, color: t.text }}>קו אדום</h1>
        </div>
        <p style={{ fontSize: 14, color: t.muted, marginBottom: 28, marginRight: 26 }}>
          תחנה מרכזית פתח תקווה — הקוממיות בת ים · {redStations.length} תחנות · כל 3.5 דקות בשעות עומס
        </p>

        <h2 style={{ fontSize: 13, color: t.muted, marginBottom: 10, fontWeight: 500, letterSpacing: "0.04em" }}>תחנות הקו</h2>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
          {redStations.map((s, i, arr) => (
            <a key={s.name} href={`/station/${encodeURIComponent(s.name)}`} style={{
              display: "flex", alignItems: "center",
              padding: "13px 16px",
              borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none",
              gap: 14,
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 10 }}>
                {i > 0 && <div style={{ width: 2, height: 8, background: "#b0405055" }} />}
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#b04050", border: `2px solid ${t.card}` }} />
                {i < arr.length - 1 && <div style={{ width: 2, height: 8, background: "#b0405055" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{s.name}</div>
                <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{s.nearbyPlaces[0] || s.city}</div>
              </div>
              <span style={{ color: t.subtle, fontSize: 13 }}>←</span>
            </a>
          ))}
        </div>

        <SiteFooter />
      </section>
    </main>
  );
}