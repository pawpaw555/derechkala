"use client";
import { Station } from "./data";
import { useTheme } from "./useTheme";

// קישור ניווט אוניברסלי של Google Maps. נפתח באפליקציית המפות שמותקנת
// במכשיר, ובדסקטופ בדפדפן. origin מושמט כשאין מיקום — המפות משלימות
// אותו מהמכשיר עצמו.
function dirUrl(station: Station, mode: string, from?: { lat: number; lng: number } | null) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${station.lat},${station.lng}`,
    travelmode: mode,
  });
  if (from) params.set("origin", `${from.lat},${from.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

const MODES: { mode: string; label: string; icon: string }[] = [
  { mode: "walking", label: "ברגל", icon: "🚶" },
  { mode: "transit", label: "תחבורה ציבורית", icon: "🚌" },
  { mode: "driving", label: "ברכב", icon: "🚗" },
  { mode: "bicycling", label: "באופניים", icon: "🚲" },
];

export default function NavigationLinks({
  station,
  from,
  compact,
}: {
  station: Station;
  from?: { lat: number; lng: number } | null;
  compact?: boolean;
}) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {MODES.map(({ mode, label, icon }) => (
        <a
          key={mode}
          href={dirUrl(station, mode, from)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: t.resultBg, border: `1px solid ${t.border}`,
            borderRadius: 9, padding: compact ? "7px 11px" : "9px 14px",
            fontSize: compact ? 12 : 13, fontWeight: 500, color: t.text,
            textDecoration: "none", flex: compact ? "0 0 auto" : "1 1 auto",
            justifyContent: "center",
          }}
        >
          <span aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </a>
      ))}
    </div>
  );
}
