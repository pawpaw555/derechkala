"use client";
import { useEffect, useRef, useState } from "react";
import { Station, distanceMetres, formatDistance, stationLabel, LINE_SEGMENTS, areAdjacent } from "./data";
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
 * קבוע: הזום בפועל נקבע מהמרווח לשכנות במסילה ומרוחב המיכל, ולכן
 * ה-16 חוסם רק את תחנות הקצה שיש להן שכנה אחת.
 *
 * ההערה כאן קבעה קודם שהתצוגה הזאת יושבת "מעל LABEL_ZOOM, כך שהשמות
 * דלוקים ושטח הלחיצה מגיע למלוא ה-HIT_MAX". שתי הטענות נמדדו ב-04.11
 * על כל 34 העמודים, ושתיהן אינן מדויקות:
 *
 *     מיכל 470×350 (מ-1000 פיקסל ומעלה)   כל 34 בזום 14–16
 *     מיכל 285×350 (375 פיקסל)            28 בזום 14–16, שש בזום 13:
 *                                         שנקר · גשר אם המושבות ·
 *                                         אהרונוביץ' · בן גוריון ·
 *                                         ביאליק · אלנבי
 *     שטח לחיצה בשנקר, זום 14             29/34 סמנים במלוא 10
 *     שטח לחיצה בשנקר, זום 13             0/34 במלוא 10, המקסימום 7
 *
 * בשש התחנות האלה בנייד השמות כבויים (LABEL_ZOOM) ושטח הלחיצה קטן.
 * זה לא באג שמחכה לתיקון: אלה בדיוק התחנות שהשכנות שלהן רחוקות, והעלאת
 * הזום שם תחתוך שכנה מהמסך — וזה מה ש-fitBounds קיים כדי למנוע.
 */
const FOCUS_MAX_ZOOM = 16;

export default function Map({ stations, userLoc, onSelectStation, fromStation, toStation, route, focusStation }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelectStation);
  /** השכבות תלויות הזום, כדי שאפשר יהיה לסנכרן אותן גם אחרי בנייה מחדש. */
  const zoomLayersRef = useRef<Marker[]>([]);
  /** תוויות וסמני המוקדים, שנדלקים בזום גבוה יותר מתוויות התחנות. */
  const poiLayersRef = useRef<Marker[]>([]);
  /** תוויות המוקדים בנפרד מהסמנים, כי רק הן נבדקות מול שמות התחנות. */
  const poiLabelsRef = useRef<Marker[]>([]);
  /** תחנות רכבת ישראל: הסמנים גלויים תמיד, התוויות נדלקות עם השמות. */
  const railLabelsRef = useRef<Marker[]>([]);
  const declutterRef = useRef<() => void>(() => {});
  /** מה מוצג כרגע, כדי שהרצועה שמעל המפה תגיד את הדבר הנכון. */
  const [stage, setStage] = useState<"far" | "stations" | "all">("far");
  const { t } = useTheme();
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
        L.marker([r.lat, r.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div class="mk mk-rail"></div>`,
            iconSize: [9, 9],
            iconAnchor: [4.5, 4.5],
          }),
        }).bindPopup(popup, { maxWidth: 230 }).addTo(map);
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
        poiLabelsRef.current.forEach(l => (pois ? l.addTo(map) : map.removeLayer(l)));
        railLabelsRef.current.forEach(l => (names ? l.addTo(map) : map.removeLayer(l)));
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
        .map-far .mk-station, .map-far .mk-rail { transform: scale(1.3); }
        .map-far .mk-poi { transform: rotate(45deg) scale(1.3); }
        @media (prefers-reduced-motion: reduce) { .mk { transition: none; } }
      `}</style>
      {/* הרצועה הזאת הייתה טקסט אפור בן 11 פיקסלים על רקע קבוע בהיר —
          גם במצב כהה, על עמוד ברקע 06060a. היא נשארה מפתח בלבד: המשתמש
          דיווח שהוא לא מבחין בה, ורמז שיושב מחוץ למפה לא נקרא כשהעין
          על המפה. הקריאה לפעולה עברה לתוך המפה עצמה. */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "9px 12px", background: t.card,
        borderBottom: `1px solid ${t.border}`,
        fontSize: 12, fontFamily: "'Rubik', sans-serif", direction: "rtl",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: t.text, fontWeight: 500 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#b04050", display: "inline-block" }} />
          תחנה
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: t.text, fontWeight: 500 }}>
          <span style={{ width: 9, height: 9, background: "#2563eb", transform: "rotate(45deg)", display: "inline-block" }} />
          מוקד עניין
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: t.text, fontWeight: 500 }}>
          <span style={{ width: 9, height: 9, background: "#334155", display: "inline-block" }} />
          רכבת ישראל
        </span>
        <span style={{ color: t.muted, marginRight: "auto" }}>לחצו על שם או על נקודה לפרטים.</span>
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
      </div>
    </div>
  );
}