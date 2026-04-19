import { useState, useEffect } from "react";

export const lightTheme = {
  bg: "#eaeaef",
  card: "#ffffff",
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
};

export const darkTheme = {
  bg: "#06060a",
  card: "#18181f",
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
};

export type Theme = typeof lightTheme;

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dankal_theme");
    if (saved === "dark") setDark(true);
  }, []);

  const t = dark ? darkTheme : lightTheme;

  return { dark, t };
}