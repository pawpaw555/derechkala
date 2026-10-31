import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "./lib/constants";

// קודם לכן לא היה not-found.tsx, ולכן כל כתובת שגויה הגישה את עמוד
// ברירת המחדל של Next — באנגלית, בכיוון LTR, בלי עיצוב האתר.
export const metadata: Metadata = {
  title: "הדף לא נמצא | דרך קלה",
  description: "הכתובת שחיפשתם אינה קיימת באתר. אפשר לחזור לדף הבית, למפת התחנות או לשעות הפעילות.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE_URL}/` },
};

const links = [
  { href: "/", label: "דף הבית", note: "תכנון נסיעה בין תחנות" },
  { href: "/map", label: "מפת התחנות", note: "כל 34 התחנות ומוקדי עניין" },
  { href: "/line-red", label: "הקו האדום", note: "רשימת כל התחנות לפי עיר" },
  { href: "/hours", label: "שעות פעילות", note: "ימי חול, ערב שבת ומוצאי שבת" },
];

export default function NotFound() {
  return (
    <main style={{
      minHeight: "100vh", background: "#eaeaef", direction: "rtl",
      fontFamily: "'Rubik', sans-serif", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#b04050" }} />
          <span style={{ fontSize: 13, color: "#444458" }}>דרך קלה</span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: "#111120", marginBottom: 10 }}>
          הדף הזה לא קיים
        </h1>
        <p style={{ fontSize: 14, color: "#444458", lineHeight: 1.8, marginBottom: 24 }}>
          ייתכן שהכתובת הוקלדה בטעות, או ששם התחנה שחיפשתם אינו אחת מ-34 תחנות הקו האדום.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              background: "#ffffff", border: "1px solid #d0d0dc", borderRadius: 10,
              padding: "13px 16px", textDecoration: "none", textAlign: "right",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111120" }}>{l.label}</div>
              <div style={{ fontSize: 12, color: "#444458", marginTop: 2 }}>{l.note}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
