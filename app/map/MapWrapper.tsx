"use client";
import { useTheme } from "../lib/useTheme";

export default function MapWrapper({ children }: { children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <div style={{
      background: t.bg,
      color: t.text,
      minHeight: "100vh",
      fontFamily: "'Rubik', sans-serif",
      direction: "rtl",
      transition: "background 0.2s",
    }}>
      {children}
    </div>
  );
}