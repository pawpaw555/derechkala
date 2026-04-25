import { Metadata } from "next";
import Link from "next/link";
import { STATIONS } from "../lib/data";
import { SITE_NAME, SITE_URL } from "../lib/constants";
import { SiteHeader, SiteFooter } from "../lib/SiteComponents";
import MapClient from "./MapClient";

export const metadata: Metadata = {
  title: "מפת הרכבת הקלה בגוש דן | דרך קלה",
  description: "מפה אינטראקטיבית של כל 34 תחנות הקו האדום של הרכבת הקלה בגוש דן. מצאו תחנה קרובה אליכם, ראו את מסלול הקו ועיינו בפרטי כל תחנה.",
  alternates: {
    canonical: `${SITE_URL}/map`,
  },
  openGraph: {
    title: "מפת הרכבת הקלה בגוש דן | דרך קלה",
    description: "מפה אינטראקטיבית של כל 34 תחנות הקו האדום. מצאו תחנה קרובה אליכם.",
    url: `${SITE_URL}/map`,
    siteName: SITE_NAME,
    locale: "he_IL",
    type: "website",
  },
};

const cities = ["פתח תקווה", "בני ברק", "רמת גן", "תל אביב", "בת ים"];

export default function MapPage() {
  return (
    <main style={{
      minHeight: "100vh",
      fontFamily: "'Rubik', sans-serif",
      direction: "rtl",
    }}>
      <SiteHeader backHref="/" />

      <section style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 48px" }}>

        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" style={{ fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/" style={{ color: "#444458" }}>ראשי</Link>
          <span>›</span>
          <span>מפת הרכבת הקלה</span>
        </nav>

        {/* H1 */}
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          מפת הרכבת הקלה בגוש דן
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 24, color: "#444458" }}>
          מפה אינטראקטיבית של כל תחנות הקו האדום של הרכבת הקלה בגוש דן — מתחנה מרכזית פתח תקווה ועד הקוממיות בבת ים. לחצו על תחנה לפרטים נוספים.
        </p>

        {/* Client map component */}
        <MapClient />

        {/* Line legend */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 4, background: "#b04050", borderRadius: 2 }} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>קו אדום — פעיל · 34 תחנות</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 4, background: "#3a9060", borderRadius: 2, opacity: 0.5 }} />
              <span style={{ fontSize: 14, color: "#777788" }}>קו ירוק — בבנייה · צפוי דצמבר 2028</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 4, background: "#6a52a8", borderRadius: 2, opacity: 0.5 }} />
              <span style={{ fontSize: 14, color: "#777788" }}>קו סגול — בבנייה · צפוי יולי 2028</span>
            </div>
          </div>
        </div>

        {/* Station list by city */}
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>כל תחנות הקו האדום</h2>
        {cities.map(city => {
          const cityStations = STATIONS.filter(s => s.city === city);
          if (cityStations.length === 0) return null;
          return (
            <div key={city} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, letterSpacing: "0.04em", color: "#777788" }}>{city}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cityStations.map(s => (
                  <Link
                    key={s.name}
                    href={`/station/${encodeURIComponent(s.name)}`}
                    style={{
                      borderRadius: 10, padding: "12px 16px",
                      display: "flex", alignItems: "center", gap: 10,
                      border: "1px solid #d0d0dc",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#b04050", flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#111120" }}>{s.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* FAQ */}
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>שאלות נפוצות</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { q: "איפה עובר הקו האדום?", a: "הקו האדום עובר מתחנה מרכזית פתח תקווה דרך בני ברק, רמת גן ומרכז תל אביב ועד הקוממיות בבת ים. האורך הכולל הוא כ-24 ק\"מ עם 34 תחנות." },
            { q: "כמה תחנות יש בקו האדום?", a: "34 תחנות, מתוכן 10 תת-קרקעיות ו-24 עיליות." },
            { q: "האם הקו הירוק פעיל?", a: "לא. הקו הירוק נמצא בבנייה וצפוי לפתיחה בדצמבר 2028." },
            { q: "האם הקו הסגול פעיל?", a: "לא. הקו הסגול נמצא בבנייה וצפוי לפתיחה ביולי 2028." },
            { q: "איך מוצאים את התחנה הקרובה אליי?", a: "לחצו על הכפתור \"מצא את התחנה הקרובה אליי\" ואפשרו גישה למיקום. האתר יזהה את התחנה הקרובה אליכם ביותר." },
          ].map(({ q, a }, i) => (
            <details key={i} style={{
              border: "1px solid #d0d0dc",
              borderRadius: 12, padding: "14px 18px", cursor: "pointer",
            }}>
              <summary style={{
                fontSize: 15, fontWeight: 600, color: "#111120",
                listStyle: "none", display: "flex",
                justifyContent: "space-between", alignItems: "center",
              }}>
                {q}
                <span style={{ fontSize: 18, fontWeight: 300, color: "#777788" }}>+</span>
              </summary>
              <p style={{ fontSize: 14, lineHeight: 1.8, marginTop: 10, color: "#444458" }}>{a}</p>
            </details>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 24, padding: 14, border: "1px solid #d0d0dc", borderRadius: 10 }}>
          <p style={{ fontSize: 11, lineHeight: 1.7, color: "#777788" }}>
            מיקומי התחנות במפה הם משוערים. לניווט מדויק השתמשו באפליקציית דנקל הרשמית. מידע כללי לא רשמי שעשוי להשתנות.
          </p>
        </div>

      </section>
      <SiteFooter />
    </main>
  );
}