"use client";
import { useEffect, useRef } from "react";
import { Station } from "./data";

type Props = {
  stations: Station[];
  userLoc?: { lat: number; lng: number } | null;
  onSelectStation: (station: Station) => void;
  onUserLocation: (lat: number, lng: number) => void;
  fromStation?: Station | null;
  toStation?: Station | null;
};

export default function Map({ stations, userLoc, onSelectStation, onUserLocation, fromStation, toStation }: Props) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelectStation);

  useEffect(() => {
    onSelectRef.current = onSelectStation;
  }, [onSelectStation]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    (async () => {
      const L = await import("leaflet");

      if ((containerRef.current as any)._leaflet_id) return;
      const map = L.map(containerRef.current!).setView([32.025, 34.790], 12);
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Draw line paths
      const lineGroups: Record<string, [number, number][]> = { red: [], green: [], purple: [] };
      stations.forEach(s => lineGroups[s.lineId]?.push([s.lat, s.lng]));
      const lineColors: Record<string, string> = { red: "#b04050", green: "#3a9060", purple: "#6a52a8" };
      Object.entries(lineGroups).forEach(([lineId, coords]) => {
        if (coords.length > 1) {
          L.polyline(coords, { color: lineColors[lineId], weight: 4, opacity: 0.7 }).addTo(map);
        }
      });

      // Station markers — clicking directly selects the station
      stations.forEach(s => {
        const isFrom = fromStation?.name === s.name;
        const isTo = toStation?.name === s.name;
        const size = isFrom || isTo ? 16 : 10;

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:${s.lineColor};
            border:2px solid ${isFrom ? "#5aa880" : isTo ? "#aa4858" : "#0e0e11"};
            box-shadow:0 0 ${isFrom || isTo ? 8 : 4}px ${s.lineColor}88;
            cursor:pointer;
          "></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([s.lat, s.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:'Heebo',sans-serif;direction:rtl;text-align:right;min-width:140px;padding:4px;">
              <div style="font-weight:700;font-size:14px;margin-bottom:3px;">${s.name}</div>
              <div style="font-size:11px;color:${s.lineColor};margin-bottom:3px;">${s.lineName}</div>
              <div style="font-size:11px;color:#666;margin-bottom:6px;">${s.city}</div>
              ${s.nearbyPlaces.length > 0 ? `<div style="font-size:10px;color:#888;">📍 ${s.nearbyPlaces.slice(0, 2).join(", ")}</div>` : ""}
            </div>
          `, { maxWidth: 200 });

        marker.on("click", () => {
          onSelectRef.current(s);
          marker.openPopup();
        });
      });

      // User location
      if (userLoc) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#4488ee;border:3px solid white;box-shadow:0 0 8px #4488ee88;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([userLoc.lat, userLoc.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family:'Heebo',sans-serif;direction:rtl;">📍 המיקום שלך</div>`);
        map.setView([userLoc.lat, userLoc.lng], 14);
      }
    })();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [userLoc]);

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid #22222a" }}>
      <div ref={containerRef} style={{ width: "100%", height: "350px" }} />
      <button
        onClick={() => {
          if (!navigator.geolocation) { onUserLocation(32.025, 34.790); return; }
          navigator.geolocation.getCurrentPosition(
            pos => onUserLocation(pos.coords.latitude, pos.coords.longitude),
            () => onUserLocation(32.025, 34.790),
            { timeout: 8000 }
          );
        }}
        style={{
          position: "absolute", bottom: 16, left: 16,
          background: "#0e0e11dd", border: "1px solid #3366ee44",
          borderRadius: 8, padding: "8px 12px",
          color: "#4488ee", fontSize: 12, cursor: "pointer",
          fontFamily: "'Heebo', sans-serif",
          display: "flex", alignItems: "center", gap: 6,
          zIndex: 1000, boxShadow: "0 2px 8px #00000088",
        }}
      >
        ⊙ המיקום שלי
      </button>
    </div>
  );
}