"use client";
import { useTheme } from "../lib/useTheme";
import { STATIONS } from "../lib/data";

const cities = ["פתח תקווה", "בני ברק", "רמת גן", "תל אביב", "בת ים"];

export default function RedLineContent() {
  const { t } = useTheme();
  const redStations = STATIONS.filter(s => s.lineId === "red");

  return (
    <section style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 48px", background: t.bg, minHeight: "80vh" }}>

      {/* Breadcrumbs */}
      <nav style={{ fontSize: 12, color: t.muted, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
        <a href="/" style={{ color: t.muted, textDecoration: "none" }}>ראשי</a>
        <span>›</span>
        <span style={{ color: t.text, fontWeight: 500 }}>קו אדום</span>
      </nav>

      {/* H1 + status */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#b04050", flexShrink: 0 }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, color: t.text }}>קו אדום — הרכבת הקלה</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, marginRight: 26 }}>
        <div style={{
          background: "#f0faf5", border: "1px solid #3a906044",
          borderRadius: 20, padding: "3px 12px",
          fontSize: 12, fontWeight: 600, color: "#3a9060",
        }}>
          פעיל
        </div>
        <span style={{ fontSize: 13, color: t.muted }}>34 תחנות · 24 ק"מ · פתח תקווה עד בת ים</span>
      </div>

      {/* Route overview */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: t.muted, marginBottom: 12, fontWeight: 600, letterSpacing: "0.04em" }}>סקירת המסלול</div>
        <p style={{ fontSize: 14, color: t.text, lineHeight: 1.8, marginBottom: 12 }}>
          הקו האדום הוא הקו הפעיל היחיד של הרכבת הקלה בגוש דן. הוא עובר מתחנה מרכזית פתח תקווה דרך קריית אריה, בני ברק, רמת גן, מרכז תל אביב ויפו, ומסתיים בהקוממיות בבת ים.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/map" style={{
            fontSize: 13, fontWeight: 600, color: "#b04050",
            border: "1px solid #b0405044", borderRadius: 8,
            padding: "8px 14px", textDecoration: "none",
          }}>
            ראה במפה
          </a>
          <a href="/hours" style={{
            fontSize: 13, fontWeight: 600, color: t.muted,
            border: `1px solid ${t.border}`, borderRadius: 8,
            padding: "8px 14px", textDecoration: "none",
          }}>
            שעות פעילות
          </a>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: "תחנות", value: "34" },
          { label: "אורך", value: "24 ק\"מ" },
          { label: "שעות עומס", value: "3.5′" },
          { label: "שעות רגילות", value: "6′" },
        ].map(({ label, value }) => (
          <div key={label} style={{
            flex: 1, background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 10, padding: "12px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{value}</div>
            <div style={{ fontSize: 10, color: t.muted, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Station list by city */}
      <div style={{ fontSize: 13, color: t.muted, marginBottom: 12, fontWeight: 600, letterSpacing: "0.04em" }}>כל תחנות הקו האדום</div>
      {cities.map(city => {
        const cityStations = redStations.filter(s => s.city === city);
        if (cityStations.length === 0) return null;
        return (
          <div key={city} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginBottom: 8, paddingRight: 4 }}>{city}</div>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
              {cityStations.map((s, i, arr) => (
                <a key={s.name} href={`/station/${encodeURIComponent(s.name)}`} style={{
                  display: "flex", alignItems: "center",
                  padding: "13px 16px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none",
                  gap: 14, textDecoration: "none",
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
                  <span style={{ color: t.muted, fontSize: 13 }}>←</span>
                </a>
              ))}
            </div>
          </div>
        );
      })}

      {/* FAQ */}
      <div style={{ fontSize: 13, color: t.muted, marginBottom: 12, fontWeight: 600, letterSpacing: "0.04em", marginTop: 8 }}>שאלות נפוצות</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {[
          { q: "מאיפה עד איפה עובר הקו האדום?", a: "הקו האדום עובר מתחנה מרכזית פתח תקווה עד הקוממיות בבת ים. הקו עובר דרך קריית אריה, בני ברק, רמת גן, מרכז תל אביב ויפו." },
          { q: "כמה תחנות יש בקו האדום?", a: "34 תחנות לאורך כ-24 ק\"מ. מתוכן 10 תחנות תת-קרקעיות ו-24 תחנות עיליות." },
          { q: "כל כמה זמן יש רכבת בקו האדום?", a: "בשעות העומס (07:00-09:00 ו-16:00-19:00) רכבת כל 3.5 דקות. בשעות הרגילות רכבת כל 6 דקות." },
          { q: "האם הקו האדום פועל בשבת?", a: "לא. הקו האדום אינו פועל בשבת. השירות מסתיים בערב שבת בשעה 17:10 ומתחדש במוצאי שבת ב-21:00." },
          { q: "מה ההבדל בין קו אדום לקו ירוק וסגול?", a: "הקו האדום הוא הקו הפעיל היחיד כרגע. הקו הסגול צפוי לפתיחה ביולי 2028 והקו הירוק בדצמבר 2028." },
        ].map(({ q, a }, i) => (
          <details key={i} style={{
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 12, padding: "14px 18px", cursor: "pointer",
          }}>
            <summary style={{
              fontSize: 14, fontWeight: 600, color: t.text,
              listStyle: "none", display: "flex",
              justifyContent: "space-between", alignItems: "center",
            }}>
              {q}
              <span style={{ color: t.muted, fontSize: 18, fontWeight: 300 }}>+</span>
            </summary>
            <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.8, marginTop: 8 }}>{a}</p>
          </details>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ padding: 12, background: t.card, border: `1px solid ${t.border}`, borderRadius: 10 }}>
        <p style={{ fontSize: 11, color: t.muted, lineHeight: 1.7 }}>
          האתר אינו קשור רשמית לדנקל או לנת"ע. מידע כללי לא רשמי שעשוי להשתנות.
        </p>
      </div>

    </section>
  );
}