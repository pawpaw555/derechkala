"use client";
import { useEffect, useRef, useState } from "react";
import { Station, distanceMetres, formatDistance, isWalkable, stationLabel, LINE_SEGMENTS, areAdjacent } from "./data";
import { PLACES } from "./places";
import { RAIL_STATIONS, railDistance } from "./railStations";
import { useTheme } from "./useTheme";
// ייבוא טיפוס בלבד — נמחק בקומפילציה ואינו טוען את Leaflet בשרת.
import type { Map as LeafletMap, Marker, Layer } from "leaflet";

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
  /**
   * כשנמסרת, המפה נפתחת על התחנה הזאת ועל שכנותיה במסילה — ולא על כל
   * הקו. עמוד תחנה שואל "איפה זה", ותצוגה של 24 ק"מ אינה עונה על זה.
   */
  focusStation?: Station | null;
  /**
   * כשנמסרת, לחיצה על **גוף** המפה מסמנת את הנקודה שנלחצה בפין, שולפת
   * לה כתובת, ואומרת איזו תחנה משרתת אותה.
   *
   * זו הצטרפות מפורשת ולא ברירת מחדל, כי יש מפות שבהן הלחיצה הזאת
   * מתחרה במה שכבר קיים: במפה עם `onSelectStation` הלחיצה כבר בוחרת
   * תחנה, ובמפת התוצאה של המתכנן המשתמש כבר בחר מוצא ויעד. נכון
   * ל-05.11.2026 רק `/map` מעבירה אותה.
   */
  pickPoint?: boolean;
};

// כרטיס תחנה, לסמן ולתווית. היה לו גם מצב שני שהציג מרחק וזמן הליכה
// מנקודה שנלחצה על רקע המפה; בעל האתר ביקש להסיר את הלחיצה ההיא, ואיתה
// ירד הענף — קוד שאיש אינו מגיע אליו גרוע מקוד שאינו קיים.
function stationPopup(s: Station) {
  const near = s.nearbyPlaces.slice(0, 2).join(" · ");
  const meta = s.city;
  return `
    <div style="font-family:'Rubik',sans-serif;direction:rtl;text-align:right;min-width:180px;padding:2px;">
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
 * מוקדי העניין נדלקו דרגה אחת מאוחר יותר, כדי להימנע מ-13 זוגות תוויות
 * חופפים בזום 14. המשתמש ביקש לראות אותם כבר בזום הראשון שבו יש שמות,
 * ולכן הסיבה טופלה במקום התוצאה: שתי משפחות התוויות ישבו באותו צד של
 * הסמן — שתיהן `right`, כלומר משמאל לנקודה — ולכן התנגשו. שם תחנה נשאר
 * משמאל לסמן, ושם מוקד עבר מימין לו. הורדת הסף ל-13 נבדקה ונדחתה: 55 חפיפות.
 */
const POI_LABEL_ZOOM = LABEL_ZOOM;
/**
 * גבול עליון לשטח הלחיצה. מעליו ההילה גדולה מהצורך ואינה מוסיפה דיוק.
 *
 * קודם לכן כאן ישב `HIT_ZOOM = 12` — מתחת לזום 12 ההילה כבויה, ומעליו
 * 4 פיקסל אחידים לכל 34 הסמנים (map-far) או 10 מזום 14. נמדד בדפדפן
 * שהשער הזה שוגה בשני הכיוונים, כי הזום אינו מה שקובע — ומפתיע יותר,
 * הוא גם אינו קבוע:
 *
 *   /map במסך 1440 · מיכל 1068×620 · נפתח בזום 11 או 12, לא אחד מהם
 *     קבוע: נמדד 6 פעמים 11 ו-3 פעמים 12 באותו מיכל בדיוק. fitBounds
 *     בוחר 12 למיכל בגובה 620 ו-11 לגובה 350 — שהוא ברירת המחדל של
 *     `var(--map-h, 350px)` — ואין מי שיתאים שוב אחרי שהגובה מוחל.
 *     בטעינות שיצאו 12 המרווח החציוני 15.1, השער פתח 4 לכולם, והתוצאה
 *     25 זוגות הילות נחתכות, 11.7 בגרוע: ההילה בלעה שכנים, בדיוק מה
 *     שהשער נועד למנוע. בטעינות שיצאו 11 הוא סגר הכול.
 *   בוחר היעד בעמוד הבית · 468×350 · זום 11 · מרווח חציוני 7.6
 *   /map במסך 375 · 323×350 · זום 11 · מרווח חציוני 7.6
 *     כאן הסגירה נכונה: 29 זוגות סמנים חופפים זה את זה כבר בלי שום
 *     הילה, כי סמן ברוחב 13 ומרווח 7.6 אינם יכולים להתקיים יחד.
 *
 * הזום נמדד משני מקורות בלתי תלויים — הזומים של כל האריחים ב-DOM, וגזירה
 * מהמרווח הנמדד בין הסמנים. קריאת האריח הראשון בלבד מטעה: שכבת הזום
 * הקודמת נשארת ב-DOM בזמן הדהייה.
 *
 * שער שנשען על זום לא יכול לעבוד כאן, כי הזום עצמו אינו מוסכם בין שתי
 * טעינות של אותו עמוד. מרווח נמדד תקף בשתיהן.
 *
 * לכן המרווח נמדד ישירות. לכל סמן i:
 *   p_i = min( HIT_MAX,  min_j (d_ij − r_i − r_j) / 2 ),  לא שלילי
 * ומכאן שלכל זוג (r_i+p_i) + (r_j+p_j) ≤ d_ij: שתי ההילות אינן נחתכות
 * ולחיצה לעולם אינה נוחתת על שכן. d_ij נמדד על נקודות מעוגלות, כמו
 * שליפט ממקם סמנים, אחרת המרחק המחושב אינו המרחק המצויר. j עובר על כל
 * השכנים הלחיצים ולא על תחנות בלבד: סמן מוקד עניין וסמן רכבת ישראל
 * לחיצים גם הם, והילה שבולעת אותם היא אותו באג. תוויות אינן בחישוב —
 * declutter כבר מסתיר אותן בחפיפה, והן נדלקות רק מזום 14.
 *
 * נמדד אחרי השינוי, בכל זום מ-11 עד 16: ההילה מוסיפה 0 זוגות חפיפה
 * ו-0 פיקסל. 4 זוגות הסמנים שכן חופפים בזום 11 הם גוף הסמן עצמו — 13
 * פיקסל רוחב במרווח 11.7, ושני הסמנים שם מקבלים הילה 0 — וזה גודל הסמן
 * ולא שטח הלחיצה. בקרה חיובית: אותה בדיקה כשכל ההילות מאולצות ל-10
 * מדווחת 124 זוגות ו-26 פיקסל.
 *
 * מה שזה אינו פותר, ואסור שייחשב פתור: בזום 11 שום הילה אינה אפשרית,
 * ולכן בעמוד הבית ובנייד התיקון מזיז 2 סמנים מ-34 ולא יותר. 53% הקליקים
 * על שטח מת אינם נפתרים מכאן — הם דורשים מכניזם אחר, כמו לחיצה על גוף
 * המפה שבוחרת את התחנה הקרובה.
 */
const HIT_MAX = 10;
/**
 * גבול ההתקרבות בתצוגה ממוקדת־תחנה. זו **תקרה** ל-fitBounds ולא זום
 * קבוע: הזום בפועל נקבע מהמרווח לשכנות במסילה ומגודל המיכל.
 *
 * **והתקרה הזאת אינה נחסמת אף פעם — היא קנרית ולא כיול.** ההערה כאן
 * קבעה קודם שה-16 "חוסם רק את תחנות הקצה שיש להן שכנה אחת", ושתי
 * הטענות שבמשפט הזה שגויות. נמדד ב-07.11.2026, 34 עמודים × 2 רוחבים:
 *
 *   המיכל בעמוד תחנה הוא 470×350 ואינו גדל מעבר לזה — נמדד שהוא נשאר
 *   470 גם בתצוגה ברוחב 2560. הביקוש הגבוה ביותר לזום מבין כל 34 הוא
 *   16.93 (תחנה מרכזית פתח תקווה), ו-floor לבדו כבר מחזיר 16; כדי
 *   שהתקרה תיחסום באמת דרוש ביקוש 17, ואין כזה.
 *
 *   ו"רק תחנות הקצה" שגוי בשני הכיוונים. **בנימין אינה תחנת קצה** —
 *   שתי שכנות, בלפור ויוספטל — והיא כן מגיעה ל-16. **קריית אריה כן
 *   בעלת שכנה אחת**, קצה הענף, והיא מגיעה ל-15 בלבד. מה שקובע הוא
 *   המרווח ולא מספר השכנות: בנימין יושבת בין שני המרווחים הצפופים
 *   ביותר בקו, 370 ו-375 מ׳, מול חציון 551 מ׳ על 66 זוגות סמוכים.
 *
 * ה-16 שומר מפני מיכל עתידי גדול יותר, וזה תפקיד לגיטימי — אבל הניסוח
 * חייב לומר אותו: מי שקורא "חוסם" יניח שיש מקרים שנחסמו, ואין ולו אחד.
 * **ושאינה נחסמת היא גזירה ולא תצפית** — מודל fitBounds שוחזר מהמקור
 * והתאים לזום הנמדד ב-68 מתוך 68 עמודים, אבל תקרה שלא ירתה אי אפשר
 * לראות בלי לכמת את הקוד.
 *
 * ההערה כאן קבעה קודם גם שהתצוגה הזאת יושבת "מעל LABEL_ZOOM, כך שהשמות
 * דלוקים ושטח הלחיצה מגיע למלוא ה-HIT_MAX". שתי הטענות נמדדו ב-04.11
 * על כל 34 העמודים ואומתו מחדש ב-07.11, ושתיהן אינן מדויקות:
 *
 *     מיכל 470×350 (מ-1000 פיקסל ומעלה)   כל 34 בזום 14–16
 *                                         (9 ב-14, 22 ב-15, 3 ב-16)
 *     מיכל 285×350 (375 פיקסל)            28 בזום 14–16, שש בזום 13:
 *                                         שנקר · גשר אם המושבות ·
 *                                         אהרונוביץ' · בן גוריון ·
 *                                         ביאליק · אלנבי
 *     שטח לחיצה לפי זום, נמדד בכל 34      13 → 0/34 במלוא 10, מקסימום 7
 *                                         14 → 29/34 · 15 → 31 · 16 → 33
 *
 * בשש התחנות האלה בנייד השמות כבויים (LABEL_ZOOM) ושטח הלחיצה קטן.
 * זה לא באג שמחכה לתיקון: אלה בדיוק התחנות שהשכנות שלהן רחוקות, והעלאת
 * הזום שם תחתוך שכנה מהמסך — וזה מה ש-fitBounds קיים כדי למנוע.
 */
const FOCUS_MAX_ZOOM = 16;

export default function Map({ stations, userLoc, onSelectStation, fromStation, toStation, route, focusStation, pickPoint }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelectStation);
  /** השכבות תלויות הזום, כדי שאפשר יהיה לסנכרן אותן גם אחרי בנייה מחדש. */
  const zoomLayersRef = useRef<Marker[]>([]);
  /** תוויות וסמני המוקדים, שנדלקים בזום גבוה יותר מתוויות התחנות. */
  const poiLayersRef = useRef<Marker[]>([]);
  /** תוויות המוקדים בנפרד מהסמנים, כי רק הן נבדקות מול שמות התחנות. */
  const poiLabelsRef = useRef<Marker[]>([]);
  /** תחנות רכבת ישראל: התוויות נדלקות עם השמות, והסמנים — עם הטוגל. */
  const railLabelsRef = useRef<Marker[]>([]);
  /** סמני רכבת ישראל. עד 10.11.2026 הם נוספו למפה ישירות ובלי ref,
   *  כלומר אי אפשר היה להסיר אותם. הטוגל הוא שדרש את ההחזקה. */
  const railLayersRef = useRef<Marker[]>([]);
  /**
   * אילו שכבות דלוקות. ב-ref **וגם** ב-state: `sync` נוצרת בתוך effect
   * עם מערך תלויות ריק ולכן רואה רק refs, והרצועה שמעל המפה צריכה
   * state כדי להיצבע מחדש. שניהם מתעדכנים יחד ב-toggleLayer.
   */
  const layersRef = useRef({ poi: true, rail: true, track: false });
  const [layers, setLayers] = useState({ poi: true, rail: true, track: false });
  /**
   * מסילות רכבת ישראל. **כבויות כברירת מחדל ונטענות רק בהדלקה** —
   * 20 KB של גאומטריה אינם צריכים להישלח למי שבא לראות את הקו האדום.
   * `app/lib/railLines.json` נוצר פעם אחת ב-scripts/rail-geometry.mjs,
   * כי Overpass החזיר 502 בשלוש מתוך שש שאילתות בבדיקה — מפה שתלויה
   * בו בזמן בקשה היא מפה שלפעמים בלי רכבת.
   */
  const trackLayersRef = useRef<Layer[]>([]);
  const trackLoadingRef = useRef(false);
  /** `sync` נוצרת בתוך אפקט הבנייה ורואה רק refs. */
  const ensureTrackRef = useRef<() => Promise<void>>(async () => {});
  const declutterRef = useRef<() => void>(() => {});
  /** מה מוצג כרגע, כדי שהרצועה שמעל המפה תגיד את הדבר הנכון. */
  const [stage, setStage] = useState<"far" | "stations" | "all">("far");
  const { t } = useTheme();
  /**
   * הדלקה וכיבוי של שכבה. מעדכן את ה-ref ואז קורא ל-`sync` הקיימת —
   * אותה פונקציה שמחליטה מה על המפה בכל זום. בלי `setView` ובלי
   * `fitBounds`: המשתמש כיבה שכבה, הוא לא ביקש לזוז.
   */
  /**
   * טוען את המסילות בפעם הראשונה שמדליקים אותן. אחרי זה הן יושבות
   * ב-ref והמתג רק מוסיף ומוריד אותן מהמפה, כמו שאר השכבות.
   */
  const ensureTrack = async () => {
    if (trackLayersRef.current.length || trackLoadingRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    trackLoadingRef.current = true;
    try {
      const [L, mod] = await Promise.all([import("leaflet"), import("./railLines.json")]);
      // ⚠ **בלי `type` בעל שם כאן.** סורק השדות המתים סופר כל שדה
      // שמוכרז בטיפוס תחת `app/lib` ואינו נקרא בקובץ ממשק — ו-`Map.tsx`
      // עצמו הוא lib, כלומר קריאה כאן אינה נספרת. טיפוס בעל שם היה
      // מוסיף את `lines` למניין המתים בשקט. נבדקה גם ההרחבה שתכיר
      // ברכיבי `.tsx` שב-lib כקוראים, והיא **הוחזרה**: היא הוציאה
      // מהרשימה גם `geometry` ו-`properties`, שהם מילים גנריות שנמצאות
      // בקוד של ליפט — כלומר היא הייתה משתיקה שדות מתים אמיתיים.
      const data = mod.default ?? (mod as unknown as typeof mod.default);
      const built: Layer[] = [];
      for (const line of data.lines) {
        built.push(L.polyline(line.map(([lng, lat]) => [lat, lng] as [number, number]), {
          color: "#334155", weight: 2, opacity: 0.55,
        }));
      }
      for (const st of data.stations) {
        built.push(
          L.marker([st.lat, st.lng], {
            icon: L.divIcon({ className: "", html: `<div class="mk mk-track"></div>`, iconSize: [8, 8], iconAnchor: [4, 4] }),
          }).bindPopup(
            `<div style="font-family:'Rubik',sans-serif;direction:rtl;text-align:right;min-width:120px;padding:2px;">
               <div style="font-weight:700;font-size:13px;">${st.name}</div>
               <div style="font-size:11px;color:#666;">תחנת רכבת ישראל</div>
             </div>`,
            { maxWidth: 200 }
          )
        );
      }
      trackLayersRef.current = built;
    } finally {
      trackLoadingRef.current = false;
    }
    syncRef.current();
  };

  ensureTrackRef.current = ensureTrack;

  /**
   * מה שהודלק נשאר דלוק. בעל האתר דיווח ב-10.11.2026 שהדליק את
   * המסילות, "סגר ופתח", והן לא הוצגו — ברירת המחדל חזרה לכבוי בכל
   * טעינה. מצב שבחרת ואינו נשמר נקרא כתקלה, בצדק.
   *
   * אותו מפתח לשלוש השכבות ולכל המפות באתר, ולכן המצב אחיד בין עמוד
   * המפה לעמוד הבית ולעמוד התחנה. נכתב רק מתוך פעולת משתמש.
   */
  const LAYERS_KEY = "derechkala:map-layers";

  const toggleLayer = (key: "poi" | "rail" | "track") => {
    const next = { ...layersRef.current, [key]: !layersRef.current[key] };
    layersRef.current = next;
    setLayers(next);
    try { localStorage.setItem(LAYERS_KEY, JSON.stringify(next)); } catch { /* חסום — לא נורא */ }
    if (key === "track" && next.track) void ensureTrack();
    else syncRef.current();
  };


  const markersRef = useRef<Marker[]>([]);
  /**
   * סמני הנקודה בלבד — markersRef מחזיק גם את התוויות, ולהן אין `.mk`
   * ואין רדיוס. המיקום והרדיוס נשמרים כאן כי sizeHits צריך לחשב מרווחים
   * לפני שהוא נוגע ב-DOM, והגודל תלוי במוצא וביעד.
   */
  const dotsRef = useRef<{ marker: Marker; lat: number; lng: number; r: number }[]>([]);
  const overlayRef = useRef<Layer[]>([]);
  /** מסנכרן את השכבות תלויות הזום. ב-ref ולא על אובייקט המפה. */
  const syncRef = useRef<() => void>(() => {});
  /**
   * האם התצוגה כבר נשלטת בידי משהו אחר — תזוזה של המשתמש, מסלול או
   * מיקום. מרגע שכן, אסור להתאים אותה מחדש מתחתיו.
   */
  const viewOwnedRef = useRef(false);
  /**
   * גודל המיכל שעבורו נעשתה ההתאמה האחרונה. נכתב ב-`fitStations` ונקרא
   * ב-`ResizeObserver`, ואסור להחליף אותו ב-`map.getSize()` — למה, בהערה
   * שליד הצופה.
   */
  const fittedSizeRef = useRef<{ x: number; y: number } | null>(null);
  /** מנתק את המשקיף על המיכל ואת מאזיני הקלט. נאסף באפקט א'. */
  const teardownRef = useRef<() => void>(() => {});
  // אפקט א' יוצר את המפה אחרי await, ולכן אפקטים ב' ו-ג' רצים לפניו
  // ורואים mapRef ריק. בלי הדגל הזה הם חזרו מוקדם ולא רצו שוב, והמפה
  // נשארה בלי 34 סמני התחנות ובלי התוויות שלהן.
  const [mapReady, setMapReady] = useState(false);

  /**
   * הקריאה מהזיכרון המקומי היא **אחרי** שהמפה מוכנה ולא ברינדור:
   * קריאה ברינדור הייתה יוצרת פער מול מה שהשרת בנה, ו-ensureTrack
   * זקוקה למפה קיימת.
   */
  useEffect(() => {
    if (!mapReady) return;
    try {
      const raw = localStorage.getItem(LAYERS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<{ poi: boolean; rail: boolean; track: boolean }>;
      const next = {
        poi: saved.poi ?? true,
        rail: saved.rail ?? true,
        track: saved.track ?? false,
      };
      layersRef.current = next;
      setLayers(next);
      if (next.track) void ensureTrack();
      else syncRef.current();
    } catch { /* ערך פגום — נשארים בברירת המחדל */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);
  /**
   * הנקודה שהמשתמש בחר על גוף המפה, כש-`pickPoint` דולקת.
   * `label` null פירושו שאין כתובת — או שהיא עוד נשלפת (`pending`), או
   * שהמקור לא ידע לומר. שני המצבים נראים שונה לקורא, ולכן הם שני שדות
   * ולא ערך אחד שמנחשים לפיו.
   */
  const [picked, setPicked] = useState<
    { lat: number; lng: number; label: string | null; pending: boolean; cardAtTop: boolean } | null
  >(null);
  const pinRef = useRef<Marker | null>(null);
  /** שליפת הכתובת האחרונה, כדי שלחיצה חדשה תבטל את הקודמת. */
  const addrAbortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    onSelectRef.current = onSelectStation;
  }, [onSelectStation]);

  // אותה תבנית כמו onSelectRef: תצוגת הפתיחה נקבעת פעם אחת בבנייה, ולכן
  // האפקט תלוי בשם בלבד. דרך ref כדי שהוא לא ייתלה באובייקט עצמו — קורא
  // שיעביר `STATIONS.find(...)` בתוך ה-JSX יוצר אובייקט חדש בכל רינדור,
  // וזה היה בונה את המפה מחדש בכל פעם.
  const focusRef = useRef(focusStation);
  useEffect(() => {
    focusRef.current = focusStation;
  }, [focusStation]);

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

      // זום 11 קבוע התאים למיכל של 708×350. משהמיכל גדל ל-1068×620 בעמוד
      // המפה, אותו זום השאיר את הקו קטן באמצע ים של שטח ריק. התאמה
      // לגבולות התחנות נותנת את הזום הנכון לכל גודל מיכל, ובנייד היא
      // מחזירה בדיוק את מה שהיה.
      const map = L.map(containerRef.current).setView([32.055, 34.790], 11);
      mapRef.current = map;

      /**
       * ההתאמה רצה גם מחדש כשהמיכל משתנה, ולא פעם אחת בבנייה בלבד.
       *
       * גובה המיכל הוא `var(--map-h, 350px)`, ועמוד המפה מעלה אותו ל-620
       * (`app/map/page.tsx`). כשההתאמה רצה לפני שה-CSS הוחל היא מדדה מיכל
       * בגובה 350, ושם fitBounds בוחר זום 11 ולא 12 — חושב מהמקור: הקו
       * תופס 209×178 פיקסל בזום 11 ו-418×357 בזום 12, מול שטח שימושי של
       * 1012×294 בגובה 350 ו-1012×564 בגובה 620.
       *
       * נמדד בדפדפן לפני התיקון, מסך 1440, אותו מיכל 1068×620 בכל טעינה:
       * 6 טעינות נפתחו בזום 11 ו-3 בזום 12. כלומר רוב המבקרים ראו את הקו
       * ב-209×178 פיקסל בתוך מיכל של 1068×620, ורוב השטח שקומיט a67af84
       * הוסיף נשאר ריק. fitBounds רץ פעם אחת ולא היה מי שיתאים שוב.
       */
      /**
       * ההתאמה לגבולות התחנות. `animate: false` הוא התיקון עצמו, לא ליטוש.
       *
       * ב-Leaflet 1.9.4 `_tryAnimatedZoom` מחזיר `true` ודוחה את התזוזה
       * עצמה ל-requestAnimationFrame, ולכן `fitBounds` חוזר בלי שהזום
       * השתנה — ובינתיים ממשיכות לרוץ כאן שכבת האריחים, שלושת הקווים,
       * 22 מוקדי העניין וארבע תחנות הרכבת.
       *
       * נמדד: `getBoundsZoom` החזיר 12 בכל טעינה, אבל התזוזה הדחויה
       * התרחשה רק בטעינה אחת מכל שלוש. בשתיים האחרות הזום נשאר 11 לנצח,
       * בלי שאף `zoomstart` או `zoomend` נורה. מכאן זום פתיחה דו-יציב
       * באותו מיכל 1068×620 בדיוק: 6 טעינות ב-11 ו-3 ב-12 לפני התיקון.
       *
       * התנאי הראשון ב-`_tryAnimatedZoom` הוא `options.animate === false`,
       * והוא מוציא את הקריאה לנתיב הסינכרוני של `_resetView`. הזום נקבע
       * אז בתוך הקריאה עצמה ואין מה שיתחרה בה: 6 מתוך 6 ב-12.
       *
       * אין כאן הפסד — זו תצוגת הפתיחה, ואין ממה לאנפש אותה.
       *
       * `invalidateSize` לפני כן כי ליפט מודד את המיכל פעם אחת ושומר.
       */
      const fitStations = () => {
        if (stations.length === 0) return;
        map.invalidateSize();
        // הגודל שההתאמה הזאת נעשתה עבורו. זה מה שה-ResizeObserver משווה
        // מולו, ולכן הוא נרשם כאן — בנקודה שבה ההתאמה באמת קרתה — ולא
        // בתוך הצופה. ראה את ההערה שם.
        const fitSize = map.getSize();
        fittedSizeRef.current = { x: fitSize.x, y: fitSize.y };
        const focus = focusRef.current;
        if (focus) {
          // התחנה ושכנותיה **במסילה**, לא השכנות לפי מקום במערך: בצומת
          // אהרונוביץ' זה שלוש שכנות משני ענפים והגזע, ובשנקר זו אחת
          // ועוד הצומת — ולא קריית אריה, שאין אליה מסילה.
          //
          // fitBounds ולא זום קבוע, כי המרווח בין תחנות אינו אחיד: בבת ים
          // הוא כ-400 מ׳ ובפתח תקווה כ-700. הגבול העליון מונע התקרבות
          // מוגזמת בתחנת קצה, שיש לה שכנה אחת בלבד.
          const around = [focus, ...stations.filter(s =>
            areAdjacent(focus.lineId, focus.name, s.name))];
          map.fitBounds(L.latLngBounds(around.map(s => [s.lat, s.lng] as [number, number])), {
            padding: [44, 44], maxZoom: FOCUS_MAX_ZOOM, animate: false,
          });
          return;
        }
        map.fitBounds(L.latLngBounds(stations.map(s => [s.lat, s.lng] as [number, number])), {
          padding: [28, 28],
          animate: false,
        });
      };
      fitStations();

      /**
       * תזוזה של המשתמש מזוהה מאירועי הקלט עצמם ולא מאירועי ליפט:
       * `fitBounds` מפעיל `movestart` ו-`zoomstart` בדיוק כמו גלגלת, ואין
       * דרך להבדיל ביניהם מתוך האירוע. לחיצה נחשבת גם היא — אין טעם להזיז
       * את המפה מתחת למי שבדיוק פתח כרטיס תחנה.
       */
      const own = () => { viewOwnedRef.current = true; };
      const INPUT = ["wheel", "mousedown", "touchstart", "keydown", "dblclick"];
      INPUT.forEach(e => containerRef.current?.addEventListener(e, own, { passive: true }));

      /**
       * ההתאמה רצה שוב כשהמיכל משתנה — שינוי גודל חלון, סיבוב טלפון, או
       * CSS שהוחל אחרי הבנייה. ResizeObserver ולא אירוע resize של החלון,
       * כי הגובה כאן בא מ-`var(--map-h)` ויכול להשתנות בלי שהחלון זז,
       * וליפט אינו שומע על זה בעצמו.
       *
       * ההשוואה היא מול `fittedSizeRef` — הגודל שעבורו `fitStations` עשה
       * את ההתאמה האחרונה. **לא** מול `map.getSize()`, ולא מול מטמון
       * שנכתב כאן בתוך הצופה. שתי הגרסאות האלה נוסו וכל אחת נכשלה אחרת:
       *
       * מטמון שנכתב בתוך הצופה בולע את השינוי הראשון, כי הקריאה הראשונה
       * של `observe` אסינכרונית ורצה אחרי שהפריסה התייצבה — היא רושמת את
       * הגודל שאחרי השינוי ומשווה אותו לעצמו.
       *
       * `map.getSize()` יכול לבלוע שינוי שמגיע משינוי גודל חלון, כי ליפט
       * מקדים את הצופה: `trackResize: true` הוא ברירת מחדל, וב-`_onResize`
       * הוא קורא ל-`invalidateSize` ב-rAF הבא (`leaflet-src.js:4437`
       * ו-`:4446`). אז `getSize()` כבר שווה ל-DOM, התנאי קורא "שום דבר לא
       * השתנה", והצופה יוצא בלי להתאים. **נצפה** ב-04.11 במכשור בנקודת
       * הקריאה: `dom` 470×350 ו-`known` 470×350, שווים, ויציאה.
       *
       * `fittedSizeRef` נכתב ב-`fitStations` עצמו, ולכן הוא עונה על השאלה
       * הנכונה: "האם המיכל שונה מזה שההתאמה נעשתה עבורו". הוא אינו יכול
       * ליצור לופ — אחרי ההתאמה שני הצדדים שווים והקריאה הבאה יוצאת, והוא
       * גם אינו יכול לבלוע את השינוי הראשון כמו מטמון שנכתב כאן.
       *
       * **מה שלא נמדד, ואסור להציג כנמדד:** האפקט מקצה לקצה בדפדפן אמיתי.
       * אמולציית הרוחב של חלונית הדפדפן כאן משנה את גודל המיכל בלי לשגר
       * אירוע `resize` — נמדד ב-04.11, אפס אירועים בשלושה גילומים מתוך
       * ארבעה, עם בקרה חיובית שהמאזין כן עובד כשהאירוע נורה. בגילום
       * היחיד שבו האירוע נורה, הזום כן עלה מ-13 ל-14. לכן התיקון כאן נשען
       * על התנאי שנצפה שגוי ולא על תרחיש משתמש שהוכח. ראה open-items יב׳.
       *
       * נמדד קודם, על תצוגת כל־הקו: הקטנת המיכל ל-648×350 מורידה את הזום
       * ל-11, והגדלה בחזרה ל-1068×620 מחזירה אותו ל-12.
       */
      const refit = () => {
        const el = containerRef.current;
        if (!el) return;
        const fitted = fittedSizeRef.current;
        if (fitted && fitted.x === el.clientWidth && fitted.y === el.clientHeight) return;
        if (!viewOwnedRef.current) fitStations();
        else {
          map.invalidateSize();
          fittedSizeRef.current = { x: el.clientWidth, y: el.clientHeight };
        }
      };
      const ro = new ResizeObserver(refit);
      ro.observe(containerRef.current);
      teardownRef.current = () => {
        ro.disconnect();
        INPUT.forEach(e => containerRef.current?.removeEventListener(e, own));
      };

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      /**
       * קו אחד לכל קטע רציף, ולא קו אחד לכל lineId.
       *
       * קודם לכן הקואורדינטות נדחפו בסדר של STATIONS, שהוא מערך שטוח. בקו
       * האדום זה צייר מסילה ישרה משנקר לקריית אריה ובחזרה לגשר אם המושבות
       * — זיגזג של 1.9 ק"מ בכל כיוון שאינו קיים במציאות, כי שנקר וקריית
       * אריה הן שתי קצוות של שני ענפים שונים. LINE_SEGMENTS מחזיק שלושה
       * קטעים, הצומת מופיעה בכולם, ולכן שלושת הקווים נפגשים בה.
       *
       * קו בלי קטעים מוגדרים נופל לסדר השטוח, שהוא הנכון לקו שהוא שרשרת.
       */
      const lineColors: Record<string, string> = { red: "#b04050", green: "#3a9060", purple: "#6a52a8" };
      // לא `new Map(...)` — הקומפוננטה בקובץ הזה נקראת Map ומצילה את הגלובלי,
      // ו-tsc תפס את זה כ-"target lacks a construct signature".
      const byName: Record<string, Station> = {};
      stations.forEach(s => { byName[s.name] = s; });
      const draw = (names: string[], color: string) => {
        const coords = names
          .map(n => byName[n])
          .filter((s): s is Station => !!s)
          .map(s => [s.lat, s.lng] as [number, number]);
        if (coords.length > 1) L.polyline(coords, { color, weight: 4, opacity: 0.7 }).addTo(map);
      };
      [...new Set(stations.map(s => s.lineId))].forEach(lineId => {
        const segments = LINE_SEGMENTS[lineId];
        if (segments) segments.forEach(seg => draw([...seg], lineColors[lineId]));
        else draw(stations.filter(s => s.lineId === lineId).map(s => s.name), lineColors[lineId]);
      });

      // נקודות עניין אינן תלויות במוצא או ביעד, ולכן נבנות כאן פעם אחת.
      const poiLayer: Marker[] = [];
      const poiLabels: Marker[] = [];
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
              html: `<div class="mk mk-poi"></div>`,
              iconSize: [9, 9],
              iconAnchor: [4.5, 4.5],
            }),
          }).bindPopup(poiPopup, { maxWidth: 220 }).addTo(map)
        );
        // תחנת אצטדיון בלומפילד קרויה על שם האצטדיון, שיושב 321 מ׳ ממנה.
        // שתי התוויות הופיעו זו ליד זו ואמרו בדיוק אותו דבר, בלי לרמוז
        // איזו מהן התחנה. הנקודה הכחולה נשארת — היא מסמנת את האצטדיון
        // עצמו והכרטיס שלה מסביר את ההבדל — אבל הטקסט לא נכפל.
        if (p.name !== p.stationName) poiLabels.push(
          L.marker([p.lat, p.lng], {
            icon: L.divIcon({
              className: "",
              html: `<div style="
                position:absolute;left:11px;top:-8px;white-space:nowrap;
                font-family:'Rubik',sans-serif;font-size:10px;font-weight:500;
                color:#1d4ed8;background:#eff6fff5;border:1px solid #1d4ed826;border-radius:4px;
                padding:2px 6px;direction:rtl;cursor:pointer;
              ">${p.name}</div>`,
              iconSize: [0, 0],
            }),
          }).bindPopup(poiPopup, { maxWidth: 220 })
        );
      });
      poiLayersRef.current = poiLayer;
      poiLabelsRef.current = poiLabels;

      // תחנות רכבת ישראל בטווח הליכה. הסמן גלוי בכל זום — מי שמסתכל על
      // הקו כולו רוצה לדעת איפה אפשר להחליף לרכבת, וארבעה ריבועים אינם
      // מעמיסים. התווית נדלקת עם שמות התחנות ועוברת את אותו סינון.
      const railLabels: Marker[] = [];
      const railLayer: Marker[] = [];
      RAIL_STATIONS.forEach(r => {
        const d = railDistance(r);
        const popup =
          `<div style="font-family:'Rubik',sans-serif;direction:rtl;text-align:right;min-width:170px;padding:2px;">
             <div style="font-weight:700;font-size:14px;">${r.name}</div>
             <div style="font-size:11px;color:#666;margin-bottom:6px;">רכבת ישראל</div>
             <div style="font-size:12px;margin-bottom:8px;">${stationLabel(r.nearStation)}${d !== null ? ` · ${formatDistance(d)}` : ""}</div>
             <a href="/station/${encodeURIComponent(r.nearStation)}"
                style="display:block;text-align:center;background:#b04050;color:#fff;border-radius:7px;padding:7px 10px;font-size:12px;font-weight:600;text-decoration:none;margin-bottom:6px;">
                תחנת הרכבת הקלה</a>
             <a href="https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}&travelmode=walking"
                target="_blank" rel="noopener noreferrer"
                style="display:block;text-align:center;border:1px solid #ccc;border-radius:7px;padding:7px 10px;font-size:12px;font-weight:600;text-decoration:none;color:#333;">
                🚶 ניווט לתחנת הרכבת</a>
           </div>`;
        railLayer.push(
          L.marker([r.lat, r.lng], {
            icon: L.divIcon({
              className: "",
              html: `<div class="mk mk-rail"></div>`,
              iconSize: [9, 9],
              iconAnchor: [4.5, 4.5],
            }),
          }).bindPopup(popup, { maxWidth: 230 }).addTo(map)
        );
        railLabels.push(
          L.marker([r.lat, r.lng], {
            icon: L.divIcon({
              className: "",
              html: `<div style="
                position:absolute;left:11px;top:-8px;white-space:nowrap;
                font-family:'Rubik',sans-serif;font-size:10px;font-weight:600;
                color:#1e293b;background:#e2e8f0f7;border:1px solid #33415533;border-radius:4px;
                padding:2px 6px;direction:rtl;cursor:pointer;
              ">רכבת ישראל</div>`,
              iconSize: [0, 0],
            }),
          }).bindPopup(popup, { maxWidth: 230 })
        );
      });
      railLabelsRef.current = railLabels;
      railLayersRef.current = railLayer;

      /**
       * שם תחנה מנצח שם מוקד. הזזת התוויות לא פתרה את ההתנגשות — מוקד
       * יושב עשרות פיקסלים מהתחנה שלו, ושני השמות ארוכים: צד נגדי נתן
       * 14 חפיפות ומיקום מתחת לסמן 16, מול 13 במצב המקורי. לכן מודדים
       * בפועל ומסתירים את מה שמתנגש, במקום לנחש מיקום. רץ אחרי שליפט
       * מיקם את הסמנים, ולכן בתוך requestAnimationFrame.
       */
      const declutter = () => {
        const boxes: DOMRect[] = [];
        zoomLayersRef.current.forEach(l => {
          const el = l.getElement();
          if (el && el.firstElementChild) boxes.push(el.firstElementChild.getBoundingClientRect());
        });
        const hits = (r: DOMRect) =>
          boxes.some(b => r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top);
        // סדר העדיפות: שם תחנה, אחריו רכבת ישראל, ורק אז מוקד עניין.
        [...railLabelsRef.current, ...poiLabelsRef.current].forEach(l => {
          const el = l.getElement();
          const inner = el && (el.firstElementChild as HTMLElement | null);
          if (!inner) return;
          inner.style.visibility = "visible";
          const r = inner.getBoundingClientRect();
          if (hits(r)) inner.style.visibility = "hidden";
          else boxes.push(r);
        });
      };

      /**
       * קובע לכל סמן תחנה את שטח הלחיצה שלו לפי המרווח לשכן הקרוב לו.
       * ההפרש בין שתי נקודות מוקרנות תלוי בזום בלבד ולא במרכז התצוגה,
       * ולכן די להריץ ב-zoomend ואין צורך להיתלות ב-moveend.
       */
      const sizeHits = (far: boolean) => {
        // ליפט ממקם סמנים בפיקסלים שלמים — נמדד שהשארית השברית של left
        // היא 0 בכל 34 הסמנים — ולכן מעגלים גם כאן. בלי זה המרחק המחושב
        // אינו המרחק המצויר, ונמדדו 4 זוגות בחפיפה של 1.3 פיקסל שכולה
        // הפרש העיגול ולא חישוב. שולי ביטחון היו מכסים את זה ומקצצים את
        // ההילה בכל מקום; עיגול זהה מבטל את ההפרש עצמו.
        const at = (lat: number, lng: number) => {
          const p = map.latLngToContainerPoint([lat, lng]);
          return { x: Math.round(p.x), y: Math.round(p.y) };
        };
        // map-far מגדיל כל סמן ב-30%, ואיתו גם הרדיוס שצריך להתחשב בו.
        const sc = far ? 1.3 : 1;
        // מוקד עניין הוא ריבוע 9 מסובב ב-45°, ולכן רדיוס חוסם 6.4 ולא 4.5.
        const others = [
          ...PLACES.map(p => ({ p: at(p.lat, p.lng), r: 6.4 * sc })),
          ...RAIL_STATIONS.map(s => ({ p: at(s.lat, s.lng), r: 5 * sc })),
        ];
        const dots = dotsRef.current.map(d => ({ m: d.marker, p: at(d.lat, d.lng), r: d.r * sc }));
        dots.forEach((a, i) => {
          // Infinity ולא HIT_MAX, כדי שהתקרה תיחתך אחרי המדידה ולא לפניה:
          // כשהיא נחתכה קודם, אף סמן לא הגיע ל-10 גם במרווח של 60 פיקסל.
          let pad = Infinity;
          const near = (b: { p: { x: number; y: number }; r: number }) => {
            pad = Math.min(pad, (Math.hypot(a.p.x - b.p.x, a.p.y - b.p.y) - a.r - b.r) / 2);
          };
          dots.forEach((b, j) => { if (j !== i) near(b); });
          others.forEach(near);
          // ה-inset נכתב לפני ה-transform ומוכפל ב-sc יחד עם הסמן, ולכן
          // מחלקים כאן — אחרת ההילה גדולה פי 1.3 ממה שנמדד שיש לה מקום.
          const el = a.m.getElement()?.firstElementChild as HTMLElement | null;
          const px = Math.floor(Math.min(HIT_MAX, Math.max(0, pad)) / sc);
          el?.style.setProperty("--hit", `${px}px`);
        });
      };

      const sync = () => {
        const z = map.getZoom();
        const names = z >= LABEL_ZOOM;
        const pois = z >= POI_LABEL_ZOOM;
        zoomLayersRef.current.forEach(l => (names ? l.addTo(map) : map.removeLayer(l)));
        // הסמנים עצמם גלויים בכל זום — המשתמש ביקש לראות כבר במבט הראשון
        // שיש מה לחפש. רק השמות ממתינים, כי הם אלה שמתנגשים.
        //
        // **ומ-10.11.2026 גם הטוגלים עוברים דרך כאן, ולא דרך קוד נפרד.**
        // שכבה שכבויה יורדת בכל זום, ושכבה שדלוקה חוזרת לכלל הזום שלה —
        // ולכן אין מצב שבו טוגל והזום סותרים זה את זה. זאת הסיבה שהם
        // לא נכתבו כ-effect משלהם: שתי ידיים על אותה שכבה נפרדות בשקט.
        const on = layersRef.current;
        poiLayersRef.current.forEach(l => (on.poi ? l.addTo(map) : map.removeLayer(l)));
        poiLabelsRef.current.forEach(l => (pois && on.poi ? l.addTo(map) : map.removeLayer(l)));
        railLayersRef.current.forEach(l => (on.rail ? l.addTo(map) : map.removeLayer(l)));
        trackLayersRef.current.forEach(l => (on.track ? l.addTo(map) : map.removeLayer(l)));
        // דלוק אבל ריק = מצב שנטען מהזיכרון המקומי לפני שהמפה הייתה
        // מוכנה, או מפה שנבנתה מחדש. הטעינה קוראת ל-sync בסופה, והשומר
        // למעלה עוצר את הלולאה.
        if (on.track && !trackLayersRef.current.length && !trackLoadingRef.current) {
          void ensureTrackRef.current();
        }
        railLabelsRef.current.forEach(l => (names && on.rail ? l.addTo(map) : map.removeLayer(l)));
        containerRef.current?.classList.toggle("map-far", !names);
        sizeHits(!names);
        setStage(pois ? "all" : names ? "stations" : "far");
        if (pois) requestAnimationFrame(declutter);
      };
      declutterRef.current = () => requestAnimationFrame(declutter);
      map.on("moveend", () => { if (map.getZoom() >= POI_LABEL_ZOOM) requestAnimationFrame(declutter); });
      syncRef.current = sync;
      map.on("zoomend", sync);
      sync();

      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      teardownRef.current();
      teardownRef.current = () => {};
      viewOwnedRef.current = false;
      fittedSizeRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      zoomLayersRef.current = [];
      markersRef.current = [];
      dotsRef.current = [];
      overlayRef.current = [];
      // שאר השכבות נבנות מחדש באפקט הזה עצמו; המסילות נבנות ב-ensureTrack,
      // שמדלג כשה-ref מלא. ריקון כאן מחזיר אותן למסלול הטעינה הרגיל.
      //
      // **ולמען הדיוק: זאת הגנה, לא תיקון של תקלה שנצפתה.** ניסיתי
      // לשחזר — ניווט בין עמודי תחנה בלי טעינה מלאה, שהוא הנתיב שבו
      // המפה נבנית מחדש בלי שהרכיב מתפרק — והשכבות **כן** חזרו גם בלי
      // השורה הזאת. היא נשארת כי ref שמחזיק שכבות של מפה שנהרסה הוא
      // מצב לא תקין בפני עצמו, ושאר ה-refs מנוקים כאן ממש.
      trackLayersRef.current = [];
      setMapReady(false);
    };
    // focusStation כאן כי הוא קובע את תצוגת הפתיחה, ותצוגת הפתיחה נקבעת
    // פעם אחת בבנייה. ניווט בין עמודי תחנה שאינו טעינה מלאה יבנה את המפה
    // מחדש וימקד אותה על התחנה החדשה. לפי שם, כדי ש-STATIONS.find שמחזיר
    // אובייקט חדש בכל רינדור לא יבנה את המפה מחדש לשווא.
  }, [stations, focusStation?.name]);

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
      dotsRef.current = [];

      const labels: Marker[] = [];
      const dots: { marker: Marker; lat: number; lng: number; r: number }[] = [];
      stations.forEach(s => {
        const isFrom = fromStation?.name === s.name;
        const isTo = toStation?.name === s.name;
        const size = isFrom || isTo ? 16 : 10;

        const marker = L.marker([s.lat, s.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div class="mk mk-station" style="
              width:${size}px;height:${size}px;
              background:${s.lineColor};
              border-color:${isFrom ? "#5aa880" : isTo ? "#aa4858" : "#0e0e11"};
            "></div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          }),
        }).addTo(map);

        /**
         * כשיש בורר, לחיצה בוחרת — ולכן אין כרטיס כלל.
         *
         * `bindPopup` של ליפט רושם מאזין לחיצה משלו ופותח את הכרטיס
         * בעצמו, בנוסף למטפל שכאן. התוצאה הייתה שהלחיצה גם בחרה וגם
         * פתחה כרטיס מעל המפה — נמדד popupsOpened=1 אחרי בחירה מוצלחת —
         * והכרטיס הזה מציע "תכנן נסיעה לכאן" שמוביל לעמוד הבית, בדיוק
         * מה שהבחירה במקום נועדה למנוע.
         */
        const selectable = !!onSelectRef.current;
        if (!selectable) marker.bindPopup(stationPopup(s), { maxWidth: 240 });
        marker.on("click", () => {
          if (onSelectRef.current) onSelectRef.current(s);
          else marker.openPopup();
        });
        markersRef.current.push(marker);
        dots.push({ marker, lat: s.lat, lng: s.lng, r: size / 2 });

        // שמות התחנות נדלקים כשמתקרבים. ב-Clarity נראו משתמשים מתקרבים
        // ועוברים נקודה-נקודה בחיפוש תחנה; בזום שבו הם כבר נמצאים יש מקום
        // לשמות, ובזום ההתחלתי אין. התווית לחיצה בדיוק כמו הנקודה.
        const label = L.marker([s.lat, s.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div style="
              position:absolute;right:10px;top:-9px;white-space:nowrap;
              font-family:'Rubik',sans-serif;font-size:11px;font-weight:600;
              color:#1a1a22;background:#fffffff2;border:1px solid #00000014;border-radius:4px;
              padding:2px 6px;box-shadow:0 1px 3px #00000022;direction:rtl;
              cursor:pointer;
            ">${s.name}</div>`,
            iconSize: [0, 0],
          }),
        });
        // ההערה למעלה אומרת "התווית לחיצה בדיוק כמו הנקודה", ועד
        // 03.11.2026 זה לא היה נכון כשהיה בורר: לנקודה היה מטפל בחירה
        // ולתווית רק כרטיס. מי שלחץ על **שם** התחנה בבוחר היעד שבעמוד
        // הבית קיבל כרטיס במקום בחירה. עכשיו שתיהן עושות אותו דבר.
        if (selectable) label.on("click", () => onSelectRef.current?.(s));
        else label.bindPopup(stationPopup(s), { maxWidth: 240 });
        labels.push(label);
        markersRef.current.push(label);
      });

      zoomLayersRef.current = labels;
      // לפני syncRef — sync קורא ל-sizeHits, ש-dotsRef הוא הקלט שלו.
      dotsRef.current = dots;
      syncRef.current();
      declutterRef.current();
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
        // `animate: false` מאותה סיבה כמו ב-fitStations, וכלל 3: אותו
        // נתיב דחוי של ליפט, אותו כשל שקט. כאן הוא לא נצפה, אבל תזוזה
        // שלא מתרחשת בלי שום סימן אינה שווה אנימציה.
        map.fitBounds(L.latLngBounds(route), { padding: [40, 40], animate: false });
        // ומרגע שהוא קובע, שינוי גודל מיכל לא יחזיר את התצוגה לגבולות
        // התחנות ויבלע את המסלול. אותו דבר למיקום המשתמש.
        viewOwnedRef.current = true;
      } else if (userLoc) {
        map.setView([userLoc.lat, userLoc.lng], Math.max(map.getZoom(), 14), { animate: false });
        viewOwnedRef.current = true;
      }
      syncRef.current();
    })();

    return () => { cancelled = true; };
  }, [mapReady, userLoc, route]);

  // ── אפקט ד: לחיצה על גוף המפה מסמנת נקודה ───────────────────
  /**
   * הוחזר ב-05.11.2026, אחרי ש-`7b7152d` הסיר ב-31.10 צורה קודמת שלו.
   * שם הלחיצה פתחה מיד כרטיס של התחנה הקרובה, ובעל האתר אמר שזה נקרא
   * כאילו המפה עונה למי שלא שאל אותה. **ההבדל הוא הסדר:** קודם מסומן
   * מה שהמשתמש בחר, ורק מתחת לזה נאמר איזו תחנה משרתת את המקום.
   *
   * הסיבה שבגללה זה חוזר נמדדה ב-04–05.11: בנייד שטח הלחיצה לתחנה הוא
   * 13 פיקסל והמרווח לשכנה 7.6, ו-32 מתוך 34 התחנות חופפות לסמן אחר.
   * 90% משטח המפה אינם לחיצים. הסעיף המלא ב-`seo-data/open-items.md` 5.
   *
   * `map.on("click")` ולא מאזין DOM על `.leaflet-container`, ושני
   * ההבדלים נקראו מהמקור של ליפט 1.9.4:
   *   `:4475`  גרירה מסמנת dragging ומונעת את הקליק שאחריה
   *   `:4488`  המפה נוספת כיעד רק כשאין יעד אחר — כלומר לחיצה שנחתה
   *            על סמן או על תווית אינה מגיעה לכאן כלל
   * מאזין DOM אינו נותן אף אחת מהשתיים: ב-02.11 נמדד שגרירה של 413
   * פיקסל יורה `click` רגיל על אותו אלמנט.
   */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pickPoint) return;
    let cancelled = false;

    const onClick = async (e: { latlng: { lat: number; lng: number } }) => {
      const { lat, lng } = e.latlng;
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;

      if (pinRef.current) map.removeLayer(pinRef.current);
      pinRef.current = L.marker([lat, lng], {
        // הפין גבוה מרוחבו וקצהו למטה, כדי שהוא יצביע על הנקודה עצמה
        // ולא ישב עליה. iconAnchor בתחתית הוא מה שעושה את זה.
        icon: L.divIcon({
          className: "",
          iconSize: [20, 28],
          iconAnchor: [10, 28],
          html: `<div class="mk-pin"></div>`,
        }),
        keyboard: false,
      }).addTo(map);

      // הכרטיס עובר למעלה כשהנקודה בחצי התחתון, אחרת הוא מכסה בדיוק את
      // מה שהמשתמש זה עתה בחר. נמדד במוקאפ: כרטיס תחתון על מפה בגובה
      // 350 הסתיר את הפין בכל לחיצה מתחת לאמצע.
      const cardAtTop = map.latLngToContainerPoint([lat, lng]).y > map.getSize().y / 2;
      setPicked({ lat, lng, label: null, pending: true, cardAtTop });

      addrAbortRef.current?.abort();
      const ac = new AbortController();
      addrAbortRef.current = ac;
      try {
        // Photon ולא Nominatim, ושלוש בקרות ב-05.11.2026 הכריעו:
        //   ים פתוח        Photon 0 תוצאות · Nominatim המציא רשומה
        //                  ברמת המדינה, 200 ק״מ משם
        //   נקודה ברמת גן  Photon "רוקח ישראל" · Nominatim "שביל יונתן"
        //   בקרה, חולדה    שניהם "חולדה, תל אביב" — מסכימים
        // מקור שמודה שאין לו תשובה עדיף על מקור שתמיד עונה. ומספר הבית
        // אינו מוצג גם כשהוא מגיע: שם הרחוב הוא מה שאומר למשתמש איפה
        // הוא, ומספר בית שגוי נראה מדויק יותר מרחוב בלי מספר.
        // `lang=default` הוא אותו פרמטר שהחיפוש כבר שולח, והוא מה שמחזיר
        // שמות בעברית — Photon דוחה `lang=he` במפורש.
        const r = await fetch(
          `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&limit=1&lang=default`,
          { signal: ac.signal }
        );
        const d = await r.json();
        const p = (d.features || [])[0]?.properties;
        const label =
          p && p.countrycode === "IL"
            ? [p.street || p.name, p.city || p.district || p.county].filter(Boolean).join(", ") || null
            : null;
        if (!cancelled && !ac.signal.aborted) {
          setPicked(prev => (prev && prev.lat === lat && prev.lng === lng ? { ...prev, label, pending: false } : prev));
        }
      } catch {
        if (!cancelled && !ac.signal.aborted) {
          setPicked(prev => (prev && prev.lat === lat && prev.lng === lng ? { ...prev, pending: false } : prev));
        }
      }
    };

    map.on("click", onClick);
    return () => {
      cancelled = true;
      map.off("click", onClick);
      addrAbortRef.current?.abort();
      if (pinRef.current) { map.removeLayer(pinRef.current); pinRef.current = null; }
      setPicked(null);
    };
  }, [mapReady, pickPoint]);

  /** התחנה הקרובה לנקודה שנבחרה, ומה שנגזר ממנה. */
  const pickedNearest = (() => {
    if (!picked) return null;
    // ה-prop עצמו ולא ref: זה מתרחש בזמן רינדור, ו-ref שנקרא ברינדור
    // יכול להחזיק ערך מסבב קודם.
    const list = stations;
    if (!list.length) return null;
    let best = list[0];
    let bestM = distanceMetres({ lat: picked.lat, lng: picked.lng }, { lat: best.lat, lng: best.lng });
    list.forEach(s => {
      const m = distanceMetres({ lat: picked.lat, lng: picked.lng }, { lat: s.lat, lng: s.lng });
      if (m < bestM) { bestM = m; best = s; }
    });
    return { station: best, metres: bestM };
  })();

  const closePick = () => {
    addrAbortRef.current?.abort();
    const map = mapRef.current;
    if (map && pinRef.current) { map.removeLayer(pinRef.current); pinRef.current = null; }
    setPicked(null);
  };

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${t.border}` }}>
      {/*
        סמן בולט על מפה אינו עניין של גוון אלא של ניגודיות והילה. נמדד מול
        הרקעים של אריחי OSM: צהוב מחזיר 1.03–1.44 מול מים ויבשה, כלומר
        נעלם; האפור-כהה של רכבת ישראל מחזיר 6.99–10.35, ולכן דווקא הוא
        נתפס מיד בעין. לכן הגוונים נשמרים — הם נושאים משמעות — והבליטות
        מגיעה משלוש טבעות: ליבה צבעונית, טבעת מנוגדת, הילה.

        בזום הרחוק הסמנים גדלים ב-30%, כי שם המסר הוא "יש כאן דברים,
        התקרבו". נוסתה גם פעימה קלה בזום הזה; בעל האתר ראה אותה ואמר
        שהיא חזקה מדי, והיא הוסרה. הגודל נשאר.
      */}
      <style>{`
        .mk { box-sizing: border-box; cursor: pointer; position: relative;
              transition: transform .18s ease; }
        .mk-station { border-radius: 50%; border: 2px solid #0e0e11;
              box-shadow: 0 0 0 2px #ffffffee, 0 1px 4px rgba(0,0,0,.45); }
        /* שטח לחיצה בלבד — שקוף, ולא משנה פיקסל אחד במראה. נמדד שהסמן
           נתפס עד שישה פיקסלים מהמרכז בלבד, ומעבר לזה הקליק נוחת על גוף
           המפה. ::after לא נוגע בפריסה ולא מחייב לחשב מחדש את iconAnchor.
           הערך נקבע לכל סמן בנפרד ב-sizeHits, לפי המרווח לשכן הקרוב לו.
           ברירת המחדל 0: עד שנמדד, אין הילה — הילה שלא נמדדה עלולה לבלוע
           שכן, וזה גרוע מהחטאה כי זה נראה כאילו עבד. */
        .mk-station::after { content: ""; position: absolute;
              inset: calc(-1 * var(--hit, 0px)); border-radius: 50%; }
        .mk-poi { width: 9px; height: 9px; background: #2563eb;
              border: 2px solid #fff; transform: rotate(45deg);
              box-shadow: 0 0 0 1px rgba(0,0,0,.4), 0 1px 4px rgba(0,0,0,.4); }
        .mk-rail { width: 10px; height: 10px; background: #334155;
              border: 2px solid #fff;
              box-shadow: 0 0 0 1px rgba(0,0,0,.45), 0 1px 4px rgba(0,0,0,.45); }
        /* הפין של הנקודה שנבחרה. בכוונה בלי המחלקה mk: שם יושבים
           transition וגם ההגדלה של map-far, ופין שמשנה גודל עם הזום
           כבר אינו מצביע על אותו פיקסל.
           ואין כאן גרש אחורי בכוונה — הבלוק הזה הוא template literal,
           וגרש אחורי בתוך הערה סוגר אותו ומפיל את הקומפילציה. */
        .mk-pin { width: 20px; height: 20px; background: #b04050;
              border: 2px solid #ffffff; border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 2px 5px rgba(0,0,0,.45); }
        .map-far .mk-station, .map-far .mk-rail { transform: scale(1.3); }
        .map-far .mk-poi { transform: rotate(45deg) scale(1.3); }
        /**
         * תיבת סימון שנראית כמתג. בעל האתר דיווח ב-10.11.2026 ש"לא ברור
         * בכלל שזה מתגים" — והוא צדק: תיבת סימון קטנה ליד נקודת מקרא
         * נקראת כמו חלק מהמקרא, לא כמו פקד. הסמנטיקה נשארת של תיבת
         * סימון (רווח וקורא מסך עובדים בלי קוד), רק המראה השתנה.
         * ובלי גרש אחורי כאן — ההערה שלוש שורות מעל אומרת למה.
         */
        .mk-track { width: 8px; height: 8px; background: #475569;
              border: 1px solid #ffffff; opacity: 0.85; }
        .lyr {
          appearance: none; -webkit-appearance: none;
          width: 30px; height: 17px; border-radius: 999px;
          background: ${t.border}; position: relative; margin: 0;
          cursor: pointer; flex-shrink: 0;
          transition: background 0.18s ease;
        }
        .lyr::after {
          content: ""; position: absolute; top: 2px; right: 2px;
          width: 13px; height: 13px; border-radius: 50%;
          background: #ffffff; box-shadow: 0 1px 2px #0003;
          transition: transform 0.18s ease;
        }
        .lyr:checked { background: #b04050; }
        /* RTL: הידית יושבת מימין כשכבוי ונעה שמאלה כשדלוק. */
        .lyr:checked::after { transform: translateX(-13px); }
        @media (prefers-reduced-motion: reduce) {
          .lyr, .lyr::after { transition: none; }
        }
        @media (prefers-reduced-motion: reduce) { .mk { transition: none; } }
      `}</style>
      {/* הרצועה הזאת הייתה טקסט אפור בן 11 פיקסלים על רקע קבוע בהיר —
          גם במצב כהה, על עמוד ברקע 06060a. היא נשארה מפתח בלבד: המשתמש
          דיווח שהוא לא מבחין בה, ורמז שיושב מחוץ למפה לא נקרא כשהעין
          על המפה. הקריאה לפעולה עברה לתוך המפה עצמה. */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        // ממורכז מ-10.11.2026, לבקשת בעל האתר: הרצועה יושבת מעל מפה
        // ממורכזת, ושורה שנצמדת לימין נראית כמו שארית ולא ככותרת שלה.
        justifyContent: "center",
        padding: "9px 12px", background: t.card,
        borderBottom: `1px solid ${t.border}`,
        fontSize: 12, fontFamily: "'Rubik', sans-serif", direction: "rtl",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: t.text, fontWeight: 500 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#b04050", display: "inline-block" }} />
          תחנה
        </span>
        {/*
            שתי השכבות שאפשר לכבות הן **הכיסוי**, לא התוכן: המשתמש ביקש
            להסתיר את מה שהוא לא רוצה לראות, והתחנות הן מה שהמפה מראה.
            לכן "תחנה" נשאר מפתח, ושני אלה כפתורים.

            **וזאת הכרעה ולא השמטה:** השאלה הועלתה לבעל האתר ב-10.11.2026
            עם ההנמקה הזאת, והוא בחר להשאיר את התחנות גלויות תמיד. מתג
            שלישי אינו "השלמה" של הסדרה — הוא ביטול של מה שהמפה היא.

            תיבת סימון ולא כפתור-מצב: זאת הסמנטיקה המדויקת של
            "הצג/הסתר שכבה", הרווח עובד בלי קוד מקלדת, וכלל המיקוד
            ב-globals.css כבר חל על שדות קלט. כפתור-המצב היחיד באתר
            נשאר זה של הערכה הכהה, ושורת הבלוק שסופרת אותם שומרת על כך.

            **ושתי המילים שהיו כאן קודם הפילו את הבלוק.** כתבתי בהערה
            הזאת את שמות שתי התכונות שהשורות האלה סופרות, והן נספרו
            כאילו היו קוד: 1·0·9 הפך ל-1·1·9, ו-1·2·1 הפך ל-1·2·3.
            אותה מלכודת של הערת ה-JSX שהפילה את סריקת הזמנים הקשיחים,
            פעם שלישית. התיקון האמיתי אינו "לא לכתוב את המילה" אלא
            שהסריקות מדלגות על הערות JSX — וזה מה שנעשה.
        */}
        {([
          { key: "poi" as const, label: "מוקד עניין", swatch: { background: "#2563eb", transform: "rotate(45deg)" } },
          { key: "rail" as const, label: "רכבת ישראל", swatch: { background: "#334155" } },
          { key: "track" as const, label: "מסילת הרכבת", swatch: { background: "#334155", height: 3, width: 14, opacity: 0.6 } },
        ]).map(l => (
          <label key={l.key} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            color: t.text, fontWeight: 500, cursor: "pointer",
            opacity: layers[l.key] ? 1 : 0.45,
            transition: "opacity 0.15s ease",
          }}>
            <input
              type="checkbox"
              checked={layers[l.key]}
              onChange={() => toggleLayer(l.key)}
              className="lyr"
            />
            <span style={{ width: 9, height: 9, display: "inline-block", ...l.swatch }} />
            {l.label}
          </label>
        ))}
        {/* הרמז תלוי ביכולת: מפה בלי pickPoint אינה עונה ללחיצה על
            הרקע, ורמז שמבטיח התנהגות שאינה קיימת גרוע מאין רמז. */}
        <span style={{ color: t.muted }}>
          {pickPoint ? "לחצו על תחנה, או על כל מקום במפה." : "לחצו על שם או על נקודה לפרטים."}
        </span>
      </div>
      <div style={{ position: "relative" }}>
        {/* הגובה הוא משתנה כדי שעמוד המפה יוכל להגדיל אותו במסך רחב בלי
            לשנות את המפה הקטנה שבעמוד התחנה. ברירת המחדל זהה לקודם. */}
        <div ref={containerRef} style={{ width: "100%", height: "var(--map-h, 350px)" }} />
        {/* שלב הביניים ("עוד קצת למוקדי עניין") נמחק — המשתמש קרא לו
            נדנוד, והוא צודק: אחרי שהשמות דלוקים אין מה לבקש ממנו.
            pointer-events: none כדי שהגרירה והלחיצה יעברו דרכו. */}
        {stage === "far" && (
          <div style={{
            position: "absolute", top: 12, left: 0, right: 0, zIndex: 1000,
            display: "flex", justifyContent: "center", pointerEvents: "none",
          }}>
            <span style={{
              background: "#11112ae6", color: "#ffffff",
              fontFamily: "'Rubik', sans-serif", fontSize: 12, fontWeight: 600,
              padding: "7px 14px", borderRadius: 999,
              boxShadow: "0 2px 10px #00000040", direction: "rtl",
            }}>
              🔍 התקרבו כדי לראות את שמות התחנות
            </span>
          </div>
        )}
        {/* כרטיס הנקודה שנבחרה. הוא יושב בתוך המפה ולא מתחתיה, כדי
            שהקשר בינו לבין הפין יהיה ויזואלי ולא דורש גלילה. */}
        {picked && pickedNearest && (
          <div style={{
            // נצמד לקצה הימני ונעצר ב-360: בנייד הוא ממילא כמעט מלוא
            // הרוחב, ובמסך רחב כרטיס שנמתח על 1052 פיקסל בשביל שתי
            // שורות טקסט הוא רצועה ולא כרטיס.
            position: "absolute", right: 8, width: "calc(100% - 16px)", maxWidth: 360,
            zIndex: 1000,
            ...(picked.cardAtTop ? { top: 8 } : { bottom: 8 }),
            background: t.card, borderRadius: 12,
            border: `1px solid ${t.border}`, boxShadow: "0 2px 14px rgba(0,0,0,.22)",
            fontFamily: "'Rubik', sans-serif", direction: "rtl", textAlign: "right",
            padding: "9px 11px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text, lineHeight: 1.35 }}>
                  {picked.pending ? "מאתר כתובת…" : picked.label || "הנקודה שבחרתם"}
                </div>
                {/* הקואורדינטה נשארת גם כשיש כתובת, כמו בגוגל מפות: היא
                    הדבר היחיד כאן שנמדד ולא נשלף ממקור שיכול לטעות. */}
                <div style={{ fontSize: 10, color: t.muted, marginTop: 2, letterSpacing: .2 }}>
                  {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
                </div>
              </div>
              <button
                type="button"
                onClick={closePick}
                aria-label="סגירת הנקודה שנבחרה"
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: "0 2px",
                  fontSize: 18, lineHeight: 1, color: t.muted, flexShrink: 0,
                }}
              >×</button>
            </div>
            <div style={{ borderTop: `1px solid ${t.border}`, marginTop: 8, paddingTop: 8 }}>
              <div style={{ fontSize: 13, color: t.text }}>
                <span style={{ color: t.muted }}>התחנה הקרובה · </span>
                <strong>{pickedNearest.station.name}</strong>
              </div>
              {/* **הכרטיס הזה הציג מרחק אווירי כזמן הליכה.** `pickedNearest`
                  מחושב ב-`distanceMetres` בלבד (שורות 872–877), ואין בקובץ
                  הזה שום קריאה למנתב — ולכן אין לו מסלול להשוות אליו, אין
                  לו את סף 8 להחיל, ואין לו `walkNote` להציג. נמדד על המסך
                  ב-09.11.2026: לחיצה ב-32.07399,34.84589 הראתה
                  "שנקר · 2.2 ק״מ · כ-27 דק׳ הליכה" להליכה של 3,390 מ׳
                  וכ-42 דקות. זאת אותה מחלקה שהאזור הזה נולד ממנה — מרחק
                  מסוג אחד מוצג כהליכה — רק שהפעם הוא אווירי ולא של רכב.

                  התיקון הוא ניסוח ולא קריאת רשת: הכרטיס אומר מה המספר
                  **הוא**, ואינו גוזר ממנו זמן שאינו יכול לעמוד מאחוריו.
                  המרחק המדויק ומשך ההליכה נמצאים בעמוד התחנה, כפתור אחד
                  מכאן. open-items יד. */}
              <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>
                {formatDistance(pickedNearest.metres)} בקו אווירי
                {isWalkable(pickedNearest.metres)
                  ? " · ההליכה בפועל ארוכה יותר"
                  : " — רחוק מכדי ללכת"}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <a href={`/station/${encodeURIComponent(pickedNearest.station.name)}`} style={{
                  flex: 1, textAlign: "center", background: pickedNearest.station.lineColor,
                  color: "#fff", borderRadius: 7, padding: "7px 6px",
                  fontSize: 12, fontWeight: 600, textDecoration: "none",
                }}>פרטי התחנה</a>
                <a href={`/?to=${encodeURIComponent(pickedNearest.station.name)}`} style={{
                  flex: 1, textAlign: "center", border: `1px solid ${t.border}`,
                  color: t.text, borderRadius: 7, padding: "7px 6px",
                  fontSize: 12, fontWeight: 600, textDecoration: "none",
                }}>תכנן נסיעה לכאן</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}