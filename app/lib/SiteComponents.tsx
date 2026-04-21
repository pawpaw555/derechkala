"use client";
import { useTheme } from "./useTheme";

export const SITE_NAME = "דרך קלה";

export function SiteHeader({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  const { t } = useTheme();
  return (
    <header style={{
      padding: "18px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `1px solid ${t.border}`,
      background: t.card,
    }}>
      {backHref
        ? <a href={backHref} style={{ color: t.muted, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{backLabel || "חזרה"}</a>
        : <div style={{ width: 60 }} />
      }
      <a href="/" style={{ textDecoration: "none" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>{SITE_NAME}</span>
      </a>
      <a href="/" style={{ color: t.muted, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>דף הבית</a>
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
      </div>
    </div>
  );
}