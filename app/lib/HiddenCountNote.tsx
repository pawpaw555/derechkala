"use client";
import { useTheme } from "./useTheme";

/**
 * החיפוש מציג עד חמש תחנות, חמש נקודות ציון וארבעה מקומות. קודם לכן
 * העודף נעלם בשקט — חיפוש "בת ים" תואם תשע תחנות והציג חמש בלי לציין
 * זאת, כך שמי שחיפש את תחנת העמל הסיק שהיא לא קיימת.
 *
 * רכיב אחד לשני הממשקים, כי הניסוח והתנאי זהים בשניהם.
 */
export default function HiddenCountNote({ count }: { count: number }) {
  const { t } = useTheme();
  if (count < 1) return null;
  return (
    <div style={{
      padding: "9px 14px", fontSize: 11, color: t.muted,
      background: t.resultBg, fontFamily: "'Rubik', sans-serif",
      textAlign: "right", direction: "rtl",
    }}>
      {count === 1
        ? "ועוד תוצאה אחת — הוסיפו עוד אות כדי לראות אותה"
        : `ועוד ${count} תוצאות — הוסיפו עוד אות כדי לראות אותן`}
    </div>
  );
}
