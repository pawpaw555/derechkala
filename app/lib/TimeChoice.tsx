"use client";
import { useTheme } from "./useTheme";

export type TimeChoiceValue = "now" | "departure" | "arrival";

/**
 * הבחירה בין "עכשיו", "יוצא ב־" ו"מגיע ב־" — פקד אחד.
 *
 * קודם היא ישבה בשני טוגלים נפרדים: "עכשיו / בחר זמן", ומתחתיו
 * "זמן יציאה / זמן הגעה" שהופיע רק אחרי שנבחר "בחר זמן". ארבעה כפתורים
 * בשתי שורות להחלטה אחת. גרוע מזה, שתי המילים "יציאה" ו"הגעה" הופיעו
 * גם בטוגל הכיוון שמעליהן — "יציאה מכאן / הגעה לכאן" — במשמעות אחרת
 * לגמרי: שם הן מקום, כאן זמן.
 *
 * נבדקו ארבעה ממשקים ב-02.11.2026. גוגל מפות נותנת רשימה אחת של ארבע
 * אפשרויות (יציאה עכשיו · יציאה ב־ · הגעה ב־ · הנסיעה האחרונה), רכבת
 * גרמניה נותנת כפתור אחד שכתוב עליו המצב הנוכחי כמשפט, ו-Moovit לא
 * שואלת על זמן בכלל במסך הפתיחה. אף אחד מהם לא מפצל את זה לשניים.
 *
 * הניסוח "יוצא ב־ / מגיע ב־" ולא "יציאה / הגעה", כדי שההבדל מטוגל
 * הכיוון יהיה במילה עצמה ולא רק בהקשר. זה גם הניסוח של שורת הסיכום
 * שמופיעה בכרטיס התוצאה, כך שהפקד והתוצאה מדברים באותה שפה.
 *
 * רכיב אחד לשני הממשקים. הם היו עותקים ידניים זה של זה, והתפצלו כבר
 * פעם אחת — בורר הדקות נתן 60 אפשרויות בעמוד הבית וארבע בעמוד תחנה.
 * `className` מגיע מבחוץ כי כל עמוד מגדיר את המעבר שלו בשם אחר
 * (`btn-toggle` מול `btn-toggle-s`), ושני הכללים זהים בתוכנם.
 */
export default function TimeChoice({ value, onChange, className, padding = "8px 12px" }: {
  value: TimeChoiceValue;
  onChange: (next: TimeChoiceValue) => void;
  className: string;
  /** עמוד הבית השתמש ב-9px ועמוד התחנה ב-8px. פרמטר, כדי שהאיחוד
   *  לא ישנה בשקט את גובה הכפתור באחד משני העמודים. */
  padding?: string;
}) {
  const { t } = useTheme();
  const options: [TimeChoiceValue, string][] = [
    ["now", "עכשיו"],
    ["departure", "יוצא ב־"],
    ["arrival", "מגיע ב־"],
  ];
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map(([key, label]) => {
        const on = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            aria-pressed={on}
            className={className}
            style={{
              flex: 1, padding, borderRadius: 8,
              border: `1px solid ${on ? t.borderSelected : t.border}`,
              background: on ? t.resultBg : "transparent",
              color: on ? t.text : t.muted,
              fontFamily: "'Rubik', sans-serif", fontSize: 13,
              fontWeight: on ? 600 : 400, cursor: "pointer",
            }}
          >{label}</button>
        );
      })}
    </div>
  );
}
