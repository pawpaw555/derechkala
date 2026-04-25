"use client";
import Link from "next/link";
import { useTheme } from "../lib/useTheme";
import { STATIONS } from "../lib/data";
import MapClient from "./MapClient";

const cities = ["פתח תקווה", "בני ברק", "רמת גן", "תל אביב", "בת ים"];

export default function MapContent() {
  const { t } = useTheme();

  return (
    
    <>
    {/* Breadcrumbs + intro */}
      <nav aria-label="breadcrumb" style={{ fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        <Link href="/" style={{ color: t.muted, textDecoration: "none" }}>ראשי</Link>
        <span style={{ color: t.muted }}>›</span>
        <span style={{ color: t.text }}>מפת הרכבת הקלה</span>
      </nav>
      <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 24, color: t.muted }}>
        מפה אינטראקטיבית של כל תחנות הקו האדום של הרכבת הקלה בגוש דן — מתחנה מרכזית פתח תקווה ועד הקוממיות בבת ים. לחצו על תחנה לפרטים נוספים.
      </p>
      {/* Map client */}
      <MapClient />

      {/* Line legend */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 4, background: "#b04050", borderRadius: 2 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: t.text }}>קו אדום — פעיל · 34 תחנות</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 4, background: "#3a9060", borderRadius: 2, opacity: 0.5 }} />
            <span style={{ fontSize: 14, color: t.muted }}>קו ירוק — בבנייה · צפוי דצמבר 2028</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 4, background: "#6a52a8", borderRadius: 2, opacity: 0.5 }} />
            <span style={{ fontSize: 14, color: t.muted }}>קו סגול — בבנייה · צפוי יולי 2028</span>
          </div>
        </div>
      </div>

      {/* Station list by city */}
      <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 16 }}>כל תחנות הקו האדום</h2>
      {cities.map(city => {
        const cityStations = STATIONS.filter(s => s.city === city);
        if (cityStations.length === 0) return null;
        return (
          <div key={city} style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, letterSpacing: "0.04em", color: t.muted }}>{city}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cityStations.map(s => (
                <Link
                  key={s.name}
                  href={`/station/${encodeURIComponent(s.name)}`}
                  style={{
                    background: t.card, border: `1px solid ${t.border}`,
                    borderRadius: 10, padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: 10,
                    textDecoration: "none",
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#b04050", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{s.name}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {/* FAQ */}
      <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 16, marginTop: 32 }}>שאלות נפוצות</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { q: "איפה עובר הקו האדום?", a: "הקו האדום עובר מתחנה מרכזית פתח תקווה דרך בני ברק, רמת גן ומרכז תל אביב ועד הקוממיות בבת ים. האורך הכולל הוא כ-24 ק\"מ עם 34 תחנות." },
          { q: "כמה תחנות יש בקו האדום?", a: "34 תחנות, מתוכן 10 תת-קרקעיות ו-24 עיליות." },
          { q: "האם הקו הירוק פעיל?", a: "לא. הקו הירוק נמצא בבנייה וצפוי לפתיחה בדצמבר 2028." },
          { q: "האם הקו הסגול פעיל?", a: "לא. הקו הסגול נמצא בבנייה וצפוי לפתיחה ביולי 2028." },
          { q: "איך מוצאים את התחנה הקרובה אליי?", a: "לחצו על הכפתור \"מצא את התחנה הקרובה אליי\" ואפשרו גישה למיקום. האתר יזהה את התחנה הקרובה אליכם ביותר." },
        ].map(({ q, a }, i) => (
          <details key={i} style={{
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 12, padding: "14px 18px", cursor: "pointer",
          }}>
            <summary style={{
              fontSize: 15, fontWeight: 600, color: t.text,
              listStyle: "none", display: "flex",
              justifyContent: "space-between", alignItems: "center",
            }}>
              {q}
              <span style={{ fontSize: 18, fontWeight: 300, color: t.muted }}>+</span>
            </summary>
            <p style={{ fontSize: 14, lineHeight: 1.8, marginTop: 10, color: t.muted }}>{a}</p>
          </details>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: 24, padding: 14, background: t.card, border: `1px solid ${t.border}`, borderRadius: 10 }}>
        <p style={{ fontSize: 11, lineHeight: 1.7, color: t.muted }}>
          מיקומי התחנות במפה הם משוערים. לניווט מדויק השתמשו באפליקציית דנקל הרשמית. מידע כללי לא רשמי שעשוי להשתנות.
        </p>
      </div>
    </>
  );
}