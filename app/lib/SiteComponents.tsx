"use client";
import { usePathname } from "next/navigation";
import { useTheme } from "./useTheme";
import ThemeToggle from "./ThemeToggle";

import { SITE_NAME } from "./constants";
export { SITE_NAME };

/**
 * האדר אחד לכל האתר. קודם לכן היו שלושה: אחד בעמוד הבית, אחד בעמוד
 * המפה, והשלישי — זה — בשאר 39 העמודים. לשלושתם היו קישורים שונים בסדר
 * שונה, והשלישי לא כלל את עמוד השעות בכלל, כך שמעמוד תחנה לא הייתה שום
 * דרך להגיע אליו. בנוסף הוא היה בנוי משלוש משבצות, כשהראשונה היא קישור
 * "חזרה" שהיעד שלו משתנה מעמוד לעמוד ובחלקם ריק — ולכן מה שיושב בכל
 * פינה התחלף בכל מעבר בין עמודים.
 *
 * שתי משבצות קבועות: הלוגו, ואז התפריט עם המתג. התפריט נושא את אותם
 * ארבעה קישורים באותו סדר בכל עמוד, והעמוד הנוכחי מסומן.
 */
const NAV = [
  { href: "/", label: "דף הבית" },
  { href: "/map", label: "מפה" },
  { href: "/line-red", label: "תחנות" },
  { href: "/hours", label: "שעות פעילות" },
];

/** עמוד תחנה ועמודי הקווים שייכים כולם ל"תחנות". */
function isCurrent(href: string, path: string): boolean {
  if (href === "/") return path === "/";
  if (href === "/line-red") return path.startsWith("/line-") || path.startsWith("/station/");
  return path === href || path.startsWith(href + "/");
}

export function SiteHeader() {
  const { t } = useTheme();
  const path = usePathname() || "/";
  return (
    <header style={{
      padding: "14px 20px",
      display: "flex", flexWrap: "wrap", gap: 10,
      justifyContent: "space-between", alignItems: "center",
      borderBottom: `1px solid ${t.border}`,
      background: t.card,
    }}>
      <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>{SITE_NAME}</span>
      </a>
      {/* הגופן והמרווח יושבים ב-CSS ולא ב-style, כי ב-375px התפריט חרג
          ב-23 פיקסלים ונשבר לשתי שורות — והעדפת מדיה אינה אפשרית בסגנון
          מוטבע. נמדד: 71 לוגו + 277 תפריט מול 335 פנויים. */}
      <style>{`
        .site-nav { gap: 14px; }
        .site-nav a { font-size: 13px; }
        @media (max-width: 420px) {
          .site-nav { gap: 8px; }
          .site-nav a { font-size: 12px; }
        }
      `}</style>
      <nav className="site-nav" style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
        {NAV.map(l => {
          const on = isCurrent(l.href, path);
          return (
            <a key={l.href} href={l.href} aria-current={on ? "page" : undefined} style={{
              color: on ? "#b04050" : t.muted,
              fontWeight: on ? 600 : 500,
              textDecoration: "none",
            }}>
              {l.label}
            </a>
          );
        })}
        <ThemeToggle />
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useTheme();
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 24px 48px" }}>
      <div style={{ padding: 14, background: t.card, border: `1px solid ${t.border}`, borderRadius: 10 }}>
        <p style={{ fontSize: 11, color: t.muted, lineHeight: 1.7, marginBottom: 8 }}>
          האתר אינו קשור רשמית לדנקל או לנת"ע. המידע והזמנים המוצגים הם הערכה בלבד ואינם מידע רשמי.
          לזמנים מדויקים ומידע עדכני יש לפנות לאתר הרשמי של דנקל או לאפליקציית דנקל.
        </p>
        <a href="/privacy" style={{ fontSize: 11, color: t.muted, textDecoration: "underline" }}>
          מדיניות פרטיות
        </a>
        <p style={{ fontSize: 10, color: t.muted, lineHeight: 1.5, marginTop: 8 }}>
          מפות מבוססות על{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: t.muted }}>
            OpenStreetMap
          </a>{' '}
          contributors
        </p>
      </div>
    </div>
  );
}