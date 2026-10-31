"use client";
import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * מקור אחד לערכת הנושא.
 *
 * קודם לכן useTheme החזיק state נפרד בכל רכיב וקרא מ-localStorage רק
 * בטעינה, ובמקביל עמוד הבית הגדיר ערכה משלו עם 19 שדות מול 12 כאן.
 * התוצאה: לחיצה על מתג הערכה הפכה את הכרטיסים בעמוד הבית והשאירה את
 * המעטפת, הכותרת והתחתית בהירות. נמדד — main נשאר #eaeaef בזמן
 * שהכרטיס עבר ל-#18181f.
 */
export const lightTheme = {
  bg: "#eaeaef",
  card: "#ffffff",
  card2: "#f4f4f8",
  border: "#d0d0dc",
  borderSelected: "#333344",
  text: "#111120",
  label: "#222233",
  muted: "#444458",
  subtle: "#777788",
  inputBg: "#ffffff",
  shadow: "0 8px 24px #00000022",
  resultBg: "#f8f8fc",
  routeBg: "#e8e8f0",
  mapBtn: "#f0f0f6",
  mapBtnBorder: "#c0c0cc",
  mapBtnText: "#333344",
  swapBg: "#e8e8f0",
  swapBorder: "#b0b0c0",
  swapText: "#222233",
};

export const darkTheme: typeof lightTheme = {
  bg: "#06060a",
  card: "#18181f",
  card2: "#222230",
  border: "#303044",
  borderSelected: "#5a5a78",
  text: "#f2f2fa",
  label: "#d8d8ee",
  muted: "#b0b0c8",
  subtle: "#787890",
  inputBg: "#222230",
  shadow: "0 8px 24px #000000bb",
  resultBg: "#222230",
  routeBg: "#06060a",
  mapBtn: "#222230",
  mapBtnBorder: "#404058",
  mapBtnText: "#d8d8ee",
  swapBg: "#2e2e40",
  swapBorder: "#505068",
  swapText: "#f2f2fa",
};

export type Theme = typeof lightTheme;

export const THEME_KEY = "dankal_theme";

type Ctx = { dark: boolean; t: Theme; toggle: () => void; setDark: (v: boolean) => void };
const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(THEME_KEY) === "dark") setDark(true);
    } catch {}
  }, []);

  // body עצמו נשאר לבן בשני המצבים, ו-main מכסה אותו ב-minHeight: 100vh.
  // זה נראה תקין בגלילה רגילה, אבל במשיכת-יתר באייפון נחשף לבן מתחת
  // לעמוד כהה. color-scheme נדרש בנפרד כדי שפסי הגלילה ופקדי הטופס
  // המקוריים של הדפדפן יקבלו גם הם את הערכה.
  useEffect(() => {
    document.body.style.background = dark ? darkTheme.bg : lightTheme.bg;
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    // רכיב שרת אינו יכול לקרוא את הערכה דרך הקונטקסט. עמוד ה-404 הוא
    // כזה, והוא נשאר בהיר במצב כהה. הסימון הזה נותן ל-CSS רגיל לענות
    // על אותה שאלה, בלי להפוך את העמוד לרכיב לקוח ולאבד את הרינדור בשרת.
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  const apply = (v: boolean) => {
    setDark(v);
    try { localStorage.setItem(THEME_KEY, v ? "dark" : "light"); } catch {}
  };

  return createElement(
    ThemeContext.Provider,
    { value: { dark, t: dark ? darkTheme : lightTheme, toggle: () => apply(!dark), setDark: apply } },
    children
  );
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  // בלי ספק — למשל בבדיקה מבודדת — נופלים לערכה הבהירה במקום לזרוק.
  if (!ctx) return { dark: false, t: lightTheme, toggle: () => {}, setDark: () => {} };
  return ctx;
}
