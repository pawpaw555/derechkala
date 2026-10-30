"use client";
import { useEffect, useRef } from "react";
import { Station, findNearestStation, distanceMetres, formatDistance, walkMinutes } from "./data";
import { PLACES } from "./places";
// ייבוא טיפוס בלבד — נמחק בקומפילציה ואינו טוען את Leaflet בשרת.
import type { Marker } from "leaflet";

type Props = {
  stations: Station[];
  userLoc?: { lat: number; lng: number } | null;
  /**
   * כשנמסרת, לחיצה על תחנה בוחרת אותה מיד — זה מה ש"בחר תחנת יעד מהמפה"
   * צריך. כשלא נמסרת, לחיצה פותחת את הכרטיס בלבד, והקישור שבתוכו מנווט.
   * קודם לכן הקריאה הוסרה לגמרי כדי לתקן ניווט מיידי ב-/map, וזה הרג גם
   * את בחירת היעד בעמוד הבית.
   */
  onSelectStation?: (station: Station) => void;
  fromStation?: Station | null;
  toStation?: Station | null;
  /** מסלול הליכה לציור על המפה, כזוגות [lat, lng]. */
  route?: [number, number][] | null;
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
      <a href="/?to=${encodeURIComponent(s.name)}"
         style="display:block;text-align:center;border:1px solid #ccc;border-radius:7px;padding:7px 10px;font-size:12px;font-weight:600;text-decoration:none;color:#333;margin-bottom:6px;">
         תכנן נסיעה לכאן</a>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=walking"
         target="_blank" rel="noopener noreferrer"
         style="display:block;text-align:center;border:1px solid #ccc;border-radius:7px;padding:7px 10px;font-size:12px;font-weight:600;text-decoration:none;color:#333;">
         🚶 ניווט לתחנה</a>
    </div>`;
}

// איתור המיקום אינו יושב כאן אלא ב-useNearestStation, והממשק שלו ב-
// NearestStationFinder. קודם לכן היה כאן כפתור "המיקום שלי" עם מימוש משלו:
// timeout קצר יותר, בלי בדיקת הרשאה, בלי קוד שגיאה לדיווח, ועם קואורדינטה
// קבועה בתל אביב כשה-API חסר — כלומר האתר הצהיר בשקט שהמשתמש בתל אביב.
/**
 * מתחת לסף הזה אי אפשר להציג שמות: בזום 11, שבו כל הקו נכנס למסך,
 * 34 תוויות דורשות 612 פיקסלים של ערימה והמפה גבוהה 350. נמדד בפועל —
 * בזום 13 נכנסות 21 מתוך 34, בזום 14 נכנסות 29, ובזום 15 כולן.
 */
const LABEL_ZOOM = 14;

export default function Map({ stations, userLoc, onSelectStation, fromStation, toStation, route }: Props) {
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

        marker.on("click", () => {
          if (onSelectRef.current) onSelectRef.current(s);
          else marker.openPopup();
        });
      });

      // שמות התחנות נדלקים כשמתקרבים. ב-Clarity נראו משתמשים מתקרבים
      // ועוברים נקודה-נקודה בחיפוש תחנה; בזום שבו הם כבר נמצאים יש מקום
      // לשמות, ובזום ההתחלתי אין — לכן התצוגה תלוית זום ולא קבועה.
      // התווית לחיצה בדיוק כמו הנקודה: היא גדולה יותר ולכן קלה יותר לפגיעה,
      // ומשתמש שרואה שם מצפה שהשם עצמו יהיה הלחיץ.
      const labels: Marker[] = [];
      stations.forEach(s => {
        labels.push(
          L.marker([s.lat, s.lng], {
            icon: L.divIcon({
              className: "",
              html: `<div style="
                position:absolute;right:10px;top:-9px;white-space:nowrap;
                font-family:'Rubik',sans-serif;font-size:11px;font-weight:600;
                color:#1a1a22;background:#ffffffdd;border-radius:4px;
                padding:2px 6px;box-shadow:0 1px 3px #00000022;direction:rtl;
                cursor:pointer;
              ">${s.name}</div>`,
              iconSize: [0, 0],
            }),
          }).bindPopup(stationPopup(s), { maxWidth: 240 })
        );
      });

      // נקודות עניין: מה שאנשים מחפשים כשהם יודעים לאיזה אזור הם רוצים
      // אבל לא באיזו תחנה לרדת. כל קואורדינטה כאן אומתה מול מקור חיצוני.
      const poiLayer: Marker[] = [];
      PLACES.forEach(p => {
        const st = stations.find(x => x.name === p.stationName);
        const m = st ? Math.round(distanceMetres(p, st)) : null;
        const poiPopup =
          `<div style="font-family:'Rubik',sans-serif;direction:rtl;text-align:right;min-width:160px;padding:2px;">
             <div style="font-weight:700;font-size:14px;">${p.name}</div>
             <div style="font-size:11px;color:#666;margin-bottom:6px;">${p.kind}</div>
             <div style="font-size:12px;margin-bottom:8px;">תחנת ${p.stationName}${m !== null ? ` · ${formatDistance(m)}` : ""}</div>
             <a href="/station/${encodeURIComponent(p.stationName)}"
                style="display:block;text-align:center;background:#b04050;color:#fff;border-radius:7px;padding:7px 10px;font-size:12px;font-weight:600;text-decoration:none;margin-bottom:6px;">
                פרטי התחנה</a>
             <a href="/?to=${encodeURIComponent(p.stationName)}"
                style="display:block;text-align:center;border:1px solid #ccc;border-radius:7px;padding:7px 10px;font-size:12px;font-weight:600;text-decoration:none;color:#333;">
                תכנן נסיעה לכאן</a>
           </div>`;
        poiLayer.push(
          L.marker([p.lat, p.lng], {
            icon: L.divIcon({
              className: "",
              html: `<div style="
                width:9px;height:9px;background:#2563eb;border:2px solid #fff;
                transform:rotate(45deg);box-shadow:0 0 4px #2563eb66;cursor:pointer;
              "></div>`,
              iconSize: [9, 9],
              iconAnchor: [4.5, 4.5],
            }),
          }).bindPopup(poiPopup, { maxWidth: 220 })
        );
        poiLayer.push(
          L.marker([p.lat, p.lng], {
            icon: L.divIcon({
              className: "",
              html: `<div style="
                position:absolute;right:9px;top:-8px;white-space:nowrap;
                font-family:'Rubik',sans-serif;font-size:10px;font-weight:500;
                color:#1d4ed8;background:#eff6ffdd;border-radius:4px;
                padding:2px 6px;direction:rtl;cursor:pointer;
              ">${p.name}</div>`,
              iconSize: [0, 0],
            }),
          }).bindPopup(poiPopup, { maxWidth: 220 })
        );
      });

      const syncZoomLayers = () => {
        const on = map.getZoom() >= LABEL_ZOOM;
        labels.forEach(l => (on ? l.addTo(map) : map.removeLayer(l)));
        poiLayer.forEach(l => (on ? l.addTo(map) : map.removeLayer(l)));
      };
      map.on("zoomend", syncZoomLayers);
      syncZoomLayers();

      // לחיצה על רקע המפה הייתה קליק מת — 53% מהקליקים בעמוד.
      // עכשיו היא עונה על השאלה שנשאלה בפועל: איזו תחנה קרובה לנקודה הזאת.
      map.on("click", (e: any) => {
        const s = findNearestStation(e.latlng.lat, e.latlng.lng);
        L.popup({ maxWidth: 240 })
          .setLatLng(e.latlng)
          .setContent(stationPopup(s, { lat: e.latlng.lat, lng: e.latlng.lng }))
          .openOn(map);
      });

      // מסלול הליכה ממיקום המשתמש לתחנה
      if (route && route.length > 1) {
        L.polyline(route, { color: "#2563eb", weight: 5, opacity: 0.85, dashArray: "1 8", lineCap: "round" }).addTo(map);
        map.fitBounds(L.latLngBounds(route), { padding: [40, 40] });
      }

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
  }, [userLoc, route]);

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid #22222a" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
        padding: "7px 12px", background: "#f4f4f8", borderBottom: "1px solid #e4e4ec",
        fontSize: 11, color: "#444458", fontFamily: "'Rubik', sans-serif", direction: "rtl",
      }}>
        <span>לחצו על תחנה לפרטים.</span>
        <span style={{ color: "#777788" }}>התקרבו כדי לראות שמות תחנות ומוקדים באזור.</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: "auto" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#b04050", display: "inline-block" }} />
          תחנה
          <span style={{ width: 8, height: 8, background: "#2563eb", transform: "rotate(45deg)", display: "inline-block", marginRight: 6 }} />
          מוקד עניין
        </span>
      </div>
      <div ref={containerRef} style={{ width: "100%", height: "350px" }} />
    </div>
  );
}