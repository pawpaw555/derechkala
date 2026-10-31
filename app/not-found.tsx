import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "./lib/constants";
import { SiteHeader } from "./lib/SiteComponents";

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

/**
 * העמוד היה מקובע בצבעי lightTheme ולכן נדלק לבן בתוך מצב כהה — אותה
 * תקלה שתוקנה ב-/line-red. הוא נשאר רכיב שרת בכוונה: הסבה לרכיב לקוח
 * נוסתה ומחקה את כל התוכן מה-HTML של השרת. במקום זה הצבעים הם משתני
 * CSS שמתהפכים לפי data-theme, ש-useTheme מסמן על <html>.
 */
export default function NotFound() {
  return (
    <main className="nf">
      <style>{`
        .nf { --nf-bg:#eaeaef; --nf-card:#ffffff; --nf-border:#d0d0dc;
              --nf-text:#111120; --nf-muted:#444458; }
        html[data-theme="dark"] .nf { --nf-bg:#06060a; --nf-card:#18181f;
              --nf-border:#2a2a36; --nf-text:#f2f2fa; --nf-muted:#b0b0c8; }
        .nf { min-height:100vh; background:var(--nf-bg); direction:rtl;
              font-family:'Rubik',sans-serif; }
        .nf-wrap { max-width:520px; margin:0 auto; padding:56px 24px; }
        .nf h1 { font-size:30px; font-weight:700; color:var(--nf-text); margin-bottom:10px; }
        .nf p { font-size:14px; color:var(--nf-muted); line-height:1.8; margin-bottom:24px; }
        .nf-links { display:flex; flex-direction:column; gap:8px; }
        .nf-links a { background:var(--nf-card); border:1px solid var(--nf-border);
              border-radius:10px; padding:13px 16px; text-decoration:none; text-align:right; }
        .nf-links strong { display:block; font-size:14px; font-weight:600; color:var(--nf-text); }
        .nf-links span { display:block; font-size:12px; color:var(--nf-muted); margin-top:2px; }
      `}</style>
      <SiteHeader />
      <div className="nf-wrap">
        <h1>הדף הזה לא קיים</h1>
        <p>ייתכן שהכתובת הוקלדה בטעות, או ששם התחנה שחיפשתם אינו אחת מ-34 תחנות הקו האדום.</p>
        <div className="nf-links">
          {links.map(l => (
            <Link key={l.href} href={l.href}>
              <strong>{l.label}</strong>
              <span>{l.note}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
