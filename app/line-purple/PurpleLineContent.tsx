"use client";
import { useTheme } from "../lib/useTheme";
import { SiteHeader, SiteFooter } from "../lib/SiteComponents";

export default function PurpleLineContent() {
  const { t, dark } = useTheme();

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

      <SiteHeader />

      <section style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#6a52a8", flexShrink: 0 }} />
          <h1 style={{ fontSize: 30, fontWeight: 700, color: t.text }}>קו סגול</h1>
        </div>
        <p style={{ fontSize: 14, color: t.muted, marginBottom: 28, marginRight: 26 }}>
          יהוד — תל אביב · 43 תחנות
        </p>

        {/* Coming soon banner */}
        <div style={{
          background: t.card,
          border: `1px solid #6a52a844`,
          borderRadius: 12, padding: 24,
          textAlign: "center", marginBottom: 24,
        }}>
          <div style={{
            display: "inline-block",
            background: dark ? "#1a1a2a" : "#f4f0fc",
            border: `1px solid ${dark ? "#6a52a855" : "#6a52a866"}`,
            borderRadius: 20, padding: "4px 14px",
            fontSize: 12, fontWeight: 600, color: dark ? "#b9a8e8" : "#5b4592",
            marginBottom: 16,
          }}>
            בבנייה
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 10 }}>
            הקו הסגול צפוי לפתיחה יולי 2028
          </h2>
          <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.7 }}>
            הקו הסגול יחבר את יהוד ואור יהודה עם מרכז תל אביב, דרך גבעת שמואל, רמת גן וגבעתיים.
            הקו צפוי לפתיחה מסחרית ביולי 2028.
          </p>
        </div>

        <SiteFooter />
      </section>
    </main>
  );
}