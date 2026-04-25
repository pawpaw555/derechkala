"use client";
import { useTheme } from "../lib/useTheme";
import { SITE_NAME } from "../lib/constants";

export default function MapHeader() {
  const { t } = useTheme();
  const links = [
    { href: "/", label: "דף הבית" },
    { href: "/map", label: "מפה" },
    { href: "/line-red", label: "תחנות" },
    { href: "/hours", label: "שעות פעילות" },
  ];

  return (
    <header style={{
      padding: "14px 24px", display: "flex",
      justifyContent: "space-between", alignItems: "center",
      borderBottom: `1px solid ${t.border}`, background: t.card,
    }}>
      <nav style={{ display: "flex", gap: 16 }}>
        {links.map(l => (
          <a key={l.href} href={l.href} style={{
            color: l.href === "/map" ? "#b04050" : t.muted,
            fontSize: 13, fontWeight: l.href === "/map" ? 600 : 500,
            textDecoration: "none",
          }}>
            {l.label}
          </a>
        ))}
      </nav>
      <a href="/" style={{ fontSize: 20, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", textDecoration: "none" }}>
        {SITE_NAME}
      </a>
      <div style={{ width: 120 }} />
    </header>
  );
}