"use client";
import { useTheme } from "../lib/useTheme";
import { SiteHeader, SiteFooter } from "../lib/SiteComponents";

export default function GreenLine() {
  const { t } = useTheme();

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
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#3a9060", flexShrink: 0 }} />
          <h1 style={{ fontSize: 30, fontWeight: 700, color: t.text }}>קו ירוק</h1>
        </div>
        <p style={{ fontSize: 14, color: t.muted, marginBottom: 28, marginRight: 26 }}>
          הרצליה — ראשון לציון · 62 תחנות
        </p>

        {/* Coming soon banner */}
        <div style={{
          background: t.card,
          border: `1px solid #3a906044`,
          borderRadius: 12, padding: 24,
          textAlign: "center", marginBottom: 24,
        }}>
          <div style={{
            display: "inline-block",
            background: "#f0faf5",
            border: "1px solid #3a906066",
            borderRadius: 20, padding: "4px 14px",
            fontSize: 12, fontWeight: 600, color: "#3a9060",
            marginBottom: 16,
          }}>
            בבנייה
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 10 }}>
            הקו הירוק צפוי לפתיחה דצמבר 2028
          </h2>
          <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.7 }}>
            הקו הירוק יחבר את הרצליה בצפון עם ראשון לציון בדרום, דרך תל אביב וחולון.
            החלק הדרומי (ראשון לציון עד לוינסקי) צפוי לפתיחה בדצמבר 2028.
            הקו המלא צפוי לפעול במלואו ב-2030.
          </p>
        </div>

        <SiteFooter />
      </section>
    </main>
  );
}