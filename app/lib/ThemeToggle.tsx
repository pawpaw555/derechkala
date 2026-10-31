"use client";
import { useTheme } from "./useTheme";

/**
 * מתג הערכה. היה כפתור מוטבע בעמוד הבית בלבד, ולכן בכל שאר העמודים —
 * כולל עמודי התחנה, שהם דלת הכניסה האורגנית — אי אפשר היה להחליף ערכה
 * והמשתמש נשאר נעול על מה שעמוד הבית קבע. נמדד: toggle נקרא מ-page.tsx:443
 * ומשם בלבד, בזמן ש-15 קבצים צורכים את הערכה.
 */
export default function ThemeToggle() {
  const { dark, t, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "עבור לערכה בהירה" : "עבור לערכה כהה"}
      aria-pressed={dark}
      style={{
        background: t.swapBg, border: `1px solid ${t.swapBorder}`,
        borderRadius: 8, padding: "5px 10px",
        color: t.swapText, fontSize: 13, fontWeight: 500,
        cursor: "pointer", fontFamily: "'Rubik', sans-serif",
        flexShrink: 0,
      }}
    >
      {dark ? "בהיר" : "כהה"}
    </button>
  );
}
