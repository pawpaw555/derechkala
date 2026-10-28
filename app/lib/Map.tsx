"use client";
import { useEffect, useRef, useState } from "react";
import { Station, findNearestStation, distanceMetres, formatDistance, walkMinutes } from "./data";

type Props = {
  stations: Station[];
  userLoc?: { lat: number; lng: number } | null;
  onSelectStation: (station: Station) => void;
  onUserLocation: (lat: number, lng: number) => void;
  fromStation?: Station | null;
  toStation?: Station | null;
};

// כרטיס תחנה אחיד — משמש גם ללחיצה על סמן וגם ללחיצה על רקע המפה.
// כשנמסרת נקודת מוצא, מוצגים גם מרחק וזמן הליכה ממנה.
function stationPopup(s: Station, from?: { lat: number; lng: number }) {
  const near = s.nearbyPlaces.slice(0, 2).join(" · ");
  let meta = s.city;
  if (from) {
    const m = distanceMetres(from, s);
    meta += ` · ${formatDistance(m)} · כ-${walkMinutes(m)} דק׳ הליכה`;
  }
  return `
    <div style="font-family:'Rubik',sans-serif;direction:rtl;text-align:right;min-width:180px;padding:2px;">
      ${from ? `<div style="font-size:11px;color:#777;margin-bottom:4px;">התחנה הקרובה לנקודה שבחרת</div>` : ""}
      <div style="font-weight:700;font-size:15px;margin-bottom:2px;">${s.name}</div>
      <div style="font-size:11px;color:#666;margin-bottom:${near ? 4 : 8}px;">${meta}</div>
      ${near ? `<div style="font-size:11px;color:#888;margin-bottom:8px;">📍 ${near}</div>` : ""}
      <a href="/station/${encodeURIComponent(s.name)}"
         style="display:block;text-align:center;background:${s.lineColor};color:#fff;border-radius:7px;padding:7px 10px;font-size:12px;font-weight:600;text-decoration:none;margin-bottom:6px;">
         פרטי התחנה</a>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=walking"
         target="_blank" rel="noopener noreferrer"
         style="display:block;text-align:center;border:1px solid #ccc;border-radius:7px;padding:7px 10px;font-size:12px;font-weight:600;text-decoration:none;color:#333;">
         🚶 ניווט לתחנה</a>
    </div>`;
}

export default function Map({ stations, userLoc, onSelectStation, onUserLocation, fromStation, toStation }: Props) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelectStation);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelectStation;
  }, [onSelectStation]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    (async () => {
      const L = await import("leaflet");

      if ((containerRef.current as any)._leaflet_id) return;
      const map = L.map(containerRef.current!).setView([32.055, 34.790], 11);
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
          .bindPopup(stationPopup(s), { maxWidth: 240 });

        // לחיצה על סמן פותחת את הכרטיס בלבד. קודם לכן היא גם ניווטה מיד
        // לעמוד התחנה, כך שהכרטיס נעלם לפני שהספיקו לקרוא אותו.
        marker.on("click", () => marker.openPopup());
      });

      // לחיצה על רקע המפה הייתה קליק מת — 53% מהקליקים בעמוד.
      // עכשיו היא עונה על השאלה שנשאלה בפועל: איזו תחנה קרובה לנקודה הזאת.
      map.on("click", (e: any) => {
        const s = findNearestStation(e.latlng.lat, e.latlng.lng);
        L.popup({ maxWidth: 240 })
          .setLatLng(e.latlng)
          .setContent(stationPopup(s, { lat: e.latlng.lat, lng: e.latlng.lng }))
          .openOn(map);
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
          setLocError(null);
          navigator.geolocation.getCurrentPosition(
            pos => { setLocError(null); onUserLocation(pos.coords.latitude, pos.coords.longitude); },
            err => setLocError(
              err.code === err.PERMISSION_DENIED
                ? "הגישה למיקום חסומה בדפדפן"
                : "לא הצלחנו לאתר את המיקום"
            ),
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
      {locError && (
        <div role="alert" style={{
          position: "absolute", bottom: 56, left: 16, right: 16,
          background: "#0e0e11ee", border: "1px solid #b0405088",
          borderRadius: 8, padding: "8px 12px",
          color: "#fff", fontSize: 12, lineHeight: 1.6,
          fontFamily: "'Rubik', sans-serif", direction: "rtl",
          zIndex: 1000,
        }}>
          {locError}
        </div>
      )}
    </div>
  );
}