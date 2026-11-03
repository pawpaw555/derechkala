"use client";
import { useRef, type KeyboardEvent } from "react";
import { useTheme } from "./useTheme";

/**
 * בחירה אחת מתוך כמה, כשורת כפילים.
 *
 * עד 03.11.2026 שני הטוגלים באתר היו שורת `<button>` עם `aria-pressed`
 * ותו לא — בלי `role="radiogroup"`, בלי `fieldset` ובלי תווית משותפת.
 * נמדד 0 מכל אחד בעמוד. קורא מסך הכריז עליהם כשלושה כפתורי החלפה
 * בלתי קשורים: לא נאמר שהם בחירה אחת, לא נאמר כמה אפשרויות יש, ולא
 * נאמר על מה הבחירה. `aria-pressed` אומר "הכפתור הזה לחוץ", לא "זאת
 * האפשרות שנבחרה מתוך שלוש".
 *
 * כאן זה radiogroup אמיתי: `role="radio"` ו-`aria-checked` במקום
 * `aria-pressed`, ותווית לקבוצה כולה.
 *
 * ומכאן נובע גם ניווט המקלדת. radiogroup עובד ב-roving tabindex — Tab
 * נוחת פעם אחת על הקבוצה, והחצים מזיזים בתוכה. בלי זה ARIA מבטיח
 * התנהגות שאינה קיימת, וזה גרוע מלא להצהיר עליה כלל.
 *
 * כיוון החצים האופקיים הפוך מה-APG כי הממשק RTL: הכפיל הראשון יושב
 * מימין, ולכן ArrowLeft מתקדם ברשימה ו-ArrowRight חוזר. האנכיים
 * והקיצוניים כרגיל.
 *
 * רכיב אחד ולא שניים: שני הטוגלים הם אותה צורה בדיוק, ולוגיקת מקלדת
 * כפולה היא בדיוק המחלקה שהפרויקט הזה כבר שילם עליה בלוח הזמנים,
 * בבוררי הזמן ובמפות.
 */
export default function RadioPills<T extends string>({
  label, value, options, onChange,
  className, padding = "9px 12px", selectedBorder,
}: {
  /** תווית הקבוצה, מה שקורא המסך יכריז לפני האפשרויות. */
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (next: T) => void;
  /** שם המחלקה למעבר החזותי; כל עמוד מגדיר אותו בשם אחר. */
  className?: string;
  padding?: string;
  /** צבע הגבול של הנבחר. ברירת המחדל היא זו של ערכת הנושא. */
  selectedBorder?: string;
}) {
  const { t } = useTheme();
  const groupRef = useRef<HTMLDivElement>(null);
  const current = options.findIndex(([k]) => k === value);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number | "first" | "last"> = {
      ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1,
      Home: "first", End: "last",
    };
    const move = step[e.key];
    if (move === undefined) return;
    e.preventDefault();
    const next =
      move === "first" ? 0
      : move === "last" ? options.length - 1
      : (Math.max(current, 0) + move + options.length) % options.length;
    onChange(options[next][0]);
    // ב-roving tabindex המיקוד נע עם הבחירה, אחרת ה-Tab הבא יוצא
    // מהקבוצה מהמקום הישן.
    groupRef.current?.querySelectorAll("button")[next]?.focus();
  };

  return (
    <div ref={groupRef} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}
      style={{ display: "flex", gap: 8 }}>
      {options.map(([key, text], i) => {
        const on = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            // רק הנבחר נמצא בסדר ה-Tab. כשאין נבחר — הראשון, אחרת
            // הקבוצה כולה נופלת מחוץ לניווט המקלדת.
            tabIndex={on || (current === -1 && i === 0) ? 0 : -1}
            onClick={() => onChange(key)}
            className={className}
            style={{
              flex: 1, padding, borderRadius: 8,
              border: `1px solid ${on ? (selectedBorder ?? t.borderSelected) : t.border}`,
              background: on ? t.resultBg : "transparent",
              color: on ? t.text : t.muted,
              fontFamily: "'Rubik', sans-serif", fontSize: 13,
              fontWeight: on ? 600 : 400, cursor: "pointer",
            }}
          >{text}</button>
        );
      })}
    </div>
  );
}
