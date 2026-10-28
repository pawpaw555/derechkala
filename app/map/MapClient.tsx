"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { STATIONS, Station, findNearestStation } from "../lib/data";
import { useTheme } from "../lib/useTheme";
import { useRouter } from "next/navigation";

const Map = dynamic(() => import("../lib/Map"), { ssr: false });

export default function MapClient() {
  const { t } = useTheme();
  const router = useRouter();
  const [userLoc, setUserLoc] = useState<{lat: number; lng: number} | null>(null);
  const [nearestStation, setNearestStation] = useState<Station | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const DENIED_MSG = "הגישה למיקום חסומה בדפדפן. כדי לאפשר: היכנסו להגדרות האתר בדפדפן ואפשרו גישה למיקום, או בחרו תחנה מהרשימה למטה.";
  const RETRY_MSG = "לא הצלחנו לאתר את המיקום. נסו שוב, או בחרו תחנה מהרשימה למטה.";

  const locate = () => {
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLoc({ lat, lng });
        setNearestStation(findNearestStation(lat, lng));
        setLocating(false);
      },
      err => {
        setLocError(err.code === err.PERMISSION_DENIED ? DENIED_MSG : RETRY_MSG);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const getLocation = async () => {
    if (!navigator.geolocation) {
      setLocError(RETRY_MSG);
      return;
    }
    // If permission is already denied the request never prompts and never
    // resolves visibly, so explain up front instead of firing it.
    try {
      const status = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
      if (status?.state === "denied") {
        setLocError(DENIED_MSG);
        return;
      }
    } catch {
      // Permissions API unavailable — fall through to getCurrentPosition.
    }
    locate();
  };

  return (
    <>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={getLocation} disabled={locating} aria-busy={locating} style={{
          background: "#f0faf5",
          border: "1px solid #3a906088",
          borderRadius: 10, padding: "10px 18px",
          color: "#3a9060", fontSize: 14, fontWeight: 600,
          cursor: locating ? "progress" : "pointer", fontFamily: "'Rubik', sans-serif",
          opacity: locating ? 0.7 : 1,
        }}>
          {locating ? "מאתר..." : "מצא את התחנה הקרובה אליי"}
        </button>
        <p style={{ fontSize: 12, color: t.muted, marginTop: 6 }}>
          אפשרו גישה למיקום כדי לראות איזו תחנה הכי קרובה אליכם.
        </p>
        {nearestStation && (
          <span style={{ fontSize: 14, color: t.text }}>
            התחנה הקרובה אליך:{' '}
            <Link href={`/station/${encodeURIComponent(nearestStation.name)}`} style={{ color: "#b04050", fontWeight: 600 }}>
              {nearestStation.name}
            </Link>
          </span>
        )}
      </div>

      {locError && (
        <div role="alert" style={{
          marginBottom: 16, padding: "12px 14px",
          background: t.card, border: "1px solid #b0405055",
          borderRadius: 10, fontSize: 13, lineHeight: 1.7, color: t.text,
        }}>
          {locError}
        </div>
      )}

      <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${t.border}`, marginBottom: 24, boxShadow: t.shadow }}>
        <Map
          stations={STATIONS}
          userLoc={userLoc}
          fromStation={null}
          toStation={null}
          onUserLocation={(lat, lng) => setUserLoc({ lat, lng })}
          onSelectStation={(s) => router.push(`/station/${encodeURIComponent(s.name)}`)}
        />
      </div>
    </>
  );
}