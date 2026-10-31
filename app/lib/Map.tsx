"use client";
import { useEffect, useRef, useState } from "react";
import { Station, findNearestStation, distanceMetres, formatDistance, walkMinutes, walkEstimate, stationLabel } from "./data";
import { PLACES } from "./places";
import { useTheme } from "./useTheme";
// ייבוא טיפוס בלבד — נמחק בקומפילציה ואינו טוען את Leaflet בשרת.
import type { Map as LeafletMap, Marker, Layer, LeafletMouseEvent } from "leaflet";

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
    // דרך walkEstimate כמו כל שאר האתר. כאן אין מסלול לשאול עליו, והכלל
    // מרשה אווירי במקרה הזה — אבל הוא מוכרע במקום אחד, לא משוכפל כאן.
    const est = walkEstimate(distanceMetres(from, s), null);
    if (est.metres !== null) {
      meta += ` · ${formatDistance(est.metres)}`;
      if (est.trustTime) meta += ` · כ-${walkMinutes(est.metres)} דק׳ הליכה`;
    }
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
/**
 * מוקדי העניין נדלקים דרגה אחת מאוחר יותר. נמדד בזום 14 על 56 התוויות:
 * 13 זוגות חופפים, מתוכם 7 בין שם תחנה לשם מוקד ו-3 בין שני מוקדים.
 * דחיית המוקדים לזום 15 משאירה 3 חפיפות בלבד, וגם מסדרת את הסדר —
 * קודם שמות התחנות, ואחר כך הפירוט סביבן. הורדת הסף ל-13 נבדקה גם היא
 * ונדחתה: 55 חפיפות.
 */
const POI_LABEL_ZOOM = 15;

export default function Map({ stations, userLoc, onSelectStation, fromStation, toStation, route }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelectStation);
  /** השכבות תלויות הזום, כדי שאפשר יהיה לסנכרן אותן גם אחרי בנייה מחדש. */
  const zoomLayersRef = useRef<Marker[]>([]);
  /** תוויות וסמני המוקדים, שנדלקים בזום גבוה יותר מתוויות התחנות. */
  const poiLayersRef = useRef<Marker[]>([]);
  /** מה מוצג כרגע, כדי שהרצועה שמעל המפה תגיד את הדבר הנכון. */
  const [stage, setStage] = useState<"far" | "stations" | "all">("far");
  const { t, dark } = useTheme();
  /** #b04050 על רקע הכרטיס הכהה הוא 3.11:1, מתחת לסף. אותו גוון שתיקן
   *  את כפתור בחירת היעד מהמפה. הסמלים עצמם נשארים בצבע הסמן האמיתי. */
  const hint = dark ? "#e08090" : "#b04050";
  const markersRef = useRef<Marker[]>([]);
  const overlayRef = useRef<Layer[]>([]);
  /** מסנכרן את השכבות תלויות הזום. ב-ref ולא על אובייקט המפה. */
  const syncRef = useRef<() => void>(() => {});
  // אפקט א' יוצר את המפה אחרי await, ולכן אפקטים ב' ו-ג' רצים לפניו
  // ורואים mapRef ריק. בלי הדגל הזה הם חזרו מוקדם ולא רצו שוב, והמפה
  // נשארה בלי 34 סמני התחנות ובלי התוויות שלהן.
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelectStation;
  }, [onSelectStation]);

  // ── אפקט א: המפה עצמה, פעם אחת ──────────────────────────────
  // קודם לכן הכל ישב באפקט אחד שתלוי ב-[userLoc, route], והניקוי שלו קרא
  // ל-map.remove(). בחירת מקום משנה את שניהם — userLoc, ואז route מתאפס,
  // ואז route חוזר מ-OSRM — כלומר המפה נהרסה ונבנתה שלוש פעמים, ובכל פעם
  // הזום והמיקום של המשתמש אבדו. זה ביטל את תוויות התחנות, שמופיעות רק
  // מזום 14 ומעלה.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      if ((containerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) return;

      const map = L.map(containerRef.current).setView([32.055, 34.790], 11);
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const lineGroups: Record<string, [number, number][]> = { red: [], green: [], purple: [] };
      stations.forEach(s => lineGroups[s.lineId]?.push([s.lat, s.lng]));
      const lineColors: Record<string, string> = { red: "#b04050", green: "#3a9060", purple: "#6a52a8" };
      Object.entries(lineGroups).forEach(([lineId, coords]) => {
        if (coords.length > 1) {
          L.polyline(coords, { color: lineColors[lineId], weight: 4, opacity: 0.7 }).addTo(map);
        }
      });

      // נקודות עניין אינן תלויות במוצא או ביעד, ולכן נבנות כאן פעם אחת.
      const poiLayer: Marker[] = [];
      PLACES.forEach(p => {
        const st = stations.find(x => x.name === p.stationName);
        const m = st ? Math.round(distanceMetres(p, st)) : null;
        const poiPopup =
          `<div style="font-family:'Rubik',sans-serif;direction:rtl;text-align:right;min-width:160px;padding:2px;">
             <div style="font-weight:700;font-size:14px;">${p.name}</div>
             <div style="font-size:11px;color:#666;margin-bottom:6px;">${p.kind}</div>
             <div style="font-size:12px;margin-bottom:8px;">${stationLabel(p.stationName)}${m !== null ? ` · ${formatDistance(m)}` : ""}</div>
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
      poiLayersRef.current = poiLayer;

      const sync = () => {
        const z = map.getZoom();
        const names = z >= LABEL_ZOOM;
        const pois = z >= POI_LABEL_ZOOM;
        zoomLayersRef.current.forEach(l => (names ? l.addTo(map) : map.removeLayer(l)));
        poiLayersRef.current.forEach(l => (pois ? l.addTo(map) : map.removeLayer(l)));
        setStage(pois ? "all" : names ? "stations" : "far");
      };
      syncRef.current = sync;
      map.on("zoomend", sync);
      sync();

      // לחיצה על רקע המפה הייתה קליק מת — 53% מהקליקים בעמוד.
      // עכשיו היא עונה על השאלה שנשאלה בפועל: איזו תחנה קרובה לנקודה הזאת.
      map.on("click", (e: LeafletMouseEvent) => {
        const s = findNearestStation(e.latlng.lat, e.latlng.lng);
        L.popup({ maxWidth: 240 })
          .setLatLng(e.latlng)
          .setContent(stationPopup(s, { lat: e.latlng.lat, lng: e.latlng.lng }))
          .openOn(map);
      });

      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      zoomLayersRef.current = [];
      markersRef.current = [];
      overlayRef.current = [];
      setMapReady(false);
    };
  }, [stations]);

  // ── אפקט ב: סמני התחנות והתוויות, כשמוצא או יעד משתנים ───────
  // גודל הסמן וצבע המסגרת תלויים ב-fromStation/toStation. קודם לכן הם
  // נקראו באפקט שלא היה תלוי בהם, ולכן הודגשה התחנה הישנה.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;

      markersRef.current.forEach(m => map.removeLayer(m));
      zoomLayersRef.current = zoomLayersRef.current.filter(l => !markersRef.current.includes(l));
      markersRef.current = [];

      const labels: Marker[] = [];
      stations.forEach(s => {
        const isFrom = fromStation?.name === s.name;
        const isTo = toStation?.name === s.name;
        const size = isFrom || isTo ? 16 : 10;

        const marker = L.marker([s.lat, s.lng], {
          icon: L.divIcon({
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
          }),
        })
          .addTo(map)
          .bindPopup(stationPopup(s), { maxWidth: 240 });

        marker.on("click", () => {
          if (onSelectRef.current) onSelectRef.current(s);
          else marker.openPopup();
        });
        markersRef.current.push(marker);

        // שמות התחנות נדלקים כשמתקרבים. ב-Clarity נראו משתמשים מתקרבים
        // ועוברים נקודה-נקודה בחיפוש תחנה; בזום שבו הם כבר נמצאים יש מקום
        // לשמות, ובזום ההתחלתי אין. התווית לחיצה בדיוק כמו הנקודה.
        const label = L.marker([s.lat, s.lng], {
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
        }).bindPopup(stationPopup(s), { maxWidth: 240 });
        labels.push(label);
        markersRef.current.push(label);
      });

      zoomLayersRef.current = labels;
      syncRef.current();
    })();

    return () => { cancelled = true; };
  }, [mapReady, stations, fromStation?.name, toStation?.name]);

  // ── אפקט ג: מיקום המשתמש והמסלול ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;

      overlayRef.current.forEach(l => map.removeLayer(l));
      overlayRef.current = [];

      if (userLoc) {
        const dot = L.marker([userLoc.lat, userLoc.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#4488ee;border:3px solid white;box-shadow:0 0 8px #4488ee88;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        })
          .addTo(map)
          .bindPopup(`<div style="font-family:'Rubik',sans-serif;direction:rtl;">📍 המיקום שלך</div>`);
        overlayRef.current.push(dot);
      }

      if (route && route.length > 1) {
        const line = L.polyline(route, { color: "#2563eb", weight: 5, opacity: 0.85, dashArray: "1 8", lineCap: "round" }).addTo(map);
        overlayRef.current.push(line);
        // קודם לכן fitBounds רץ ומיד אחריו setView על מיקום המשתמש, כך
        // שהקצה הרחוק של המסלול נדחף מחוץ למסך. כשיש מסלול הוא קובע.
        map.fitBounds(L.latLngBounds(route), { padding: [40, 40] });
      } else if (userLoc) {
        map.setView([userLoc.lat, userLoc.lng], Math.max(map.getZoom(), 14));
      }
      syncRef.current();
    })();

    return () => { cancelled = true; };
  }, [mapReady, userLoc, route]);

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${t.border}` }}>
      {/* הרצועה הזאת הייתה טקסט אפור בן 11 פיקסלים על רקע קבוע בהיר —
          גם במצב כהה, על עמוד ברקע 06060a. ומשתמש שנשאל עליה לא ידע
          בכלל שהיא קיימת. עכשיו היא עוקבת אחרי הערכה, ואומרת בכל רגע
          את הדבר היחיד שרלוונטי: קודם מה לעשות, ואחר כך מה רואים. */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        padding: "9px 12px", background: t.card,
        borderBottom: `1px solid ${t.border}`,
        fontSize: 12, fontFamily: "'Rubik', sans-serif", direction: "rtl",
      }}>
        {stage === "far" ? (
          <span style={{ color: hint, fontWeight: 600 }}>
            🔍 התקרבו במפה כדי לראות את שמות התחנות
          </span>
        ) : (
          <>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: t.text, fontWeight: 500 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#b04050", display: "inline-block" }} />
              תחנה
            </span>
            {stage === "all" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: t.text, fontWeight: 500 }}>
                <span style={{ width: 9, height: 9, background: "#2563eb", transform: "rotate(45deg)", display: "inline-block" }} />
                מוקד עניין
              </span>
            ) : (
              <span style={{ color: hint, fontWeight: 600 }}>🔍 עוד קצת למוקדי עניין באזור</span>
            )}
            <span style={{ color: t.muted, marginRight: "auto" }}>לחצו על שם או על נקודה לפרטים.</span>
          </>
        )}
      </div>
      <div ref={containerRef} style={{ width: "100%", height: "350px" }} />
    </div>
  );
}