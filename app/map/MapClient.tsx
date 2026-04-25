"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { STATIONS, Station } from "../lib/data";
import { useTheme } from "../lib/useTheme";
import { useRouter } from "next/navigation";

const Map = dynamic(() => import("../lib/Map"), { ssr: false });

export default function MapClient() {
  const { t } = useTheme();
  const router = useRouter();
  const [userLoc, setUserLoc] = useState<{lat: number; lng: number} | null>(null);
  const [nearestStation, setNearestStation] = useState<Station | null>(null);

  const getLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let best = STATIONS[0];
        let bestDist = Infinity;
        STATIONS.forEach(s => {
          const d = Math.hypot(s.lat - lat, s.lng - lng);
          if (d < bestDist) { bestDist = d; best = s; }
        });
        setUserLoc({ lat, lng });
        setNearestStation(best);
      },
      () => {},
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={getLocation} style={{
          background: "#f0faf5",
          border: "1px solid #3a906088",
          borderRadius: 10, padding: "10px 18px",
          color: "#3a9060", fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: "'Rubik', sans-serif",
        }}>
          מצא את התחנה הקרובה אליי
        </button>
        {nearestStation && (
          <span style={{ fontSize: 14, color: t.text }}>
            התחנה הקרובה אליך:{' '}
            <Link href={`/station/${encodeURIComponent(nearestStation.name)}`} style={{ color: "#b04050", fontWeight: 600 }}>
              {nearestStation.name}
            </Link>
          </span>
        )}
      </div>

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