"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Station, Landmark, findNearestStation, findRoute, findRouteByArrival, isNoService, hhmm, STATIONS, getNextDepartures, getRelatedStations, distanceMetres, formatDistance, walkMinutes, walkEstimate, walkNote, isWalkable, stationLabel, JUNCTION_WAIT_MINS, pickerDefaults, dateForDay, dayLabel, dayOptions } from "../../lib/data";
import { STATION_CONTENT, STATION_FAQ, STATION_TYPE_LABEL } from "../../lib/stationContent";
import { useTheme } from "../../lib/useTheme";
import { SiteHeader, SiteFooter } from "../../lib/SiteComponents";
import NavigationLinks from "../../lib/NavigationLinks";
import HiddenCountNote from "../../lib/HiddenCountNote";
import { railNear, railDistance } from "../../lib/railStations";
import { useNearestStation, fetchFootRoute, runGeoLookup, type Place } from "../../lib/useNearestStation";
import GeoPicks from "../../lib/GeoPicks";
import { searchCombined, PlaceHit, SearchResults } from "../../lib/places";
import NearestStationFinder from "../../lib/NearestStationFinder";
import TimeChoice, { TimeChoiceValue } from "../../lib/TimeChoice";
import RadioPills from "../../lib/RadioPills";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("../../lib/Map"), { ssr: false });

type Props = {
  stationName: string;
  station: Station | null;
};

/** שכנה אחת או כמה: אהרונוביץ' היא צומת ולכן יש לה שתי תחנות קודמות. */
const asList = (v: string | string[] | null | undefined): string[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

/** שעה בפורמט HH:MM על אותו יום, כדי לעגן את רשימת היציאות לרכבת שנבחרה. */
function instantFromTime(sameDay: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(sameDay.getTime());
  d.setHours(h, m, 0, 0);
  return d;
}

export default function StationClient({ stationName, station }: Props) {
  const { t } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ stations: [], landmarks: [], places: [] });
  /** התחנה שהמשתמש בחר. לפי `direction` היא היעד או המוצא. */
  const [toStation, setToStation] = useState("");
  /** "from" = יוצאים מהתחנה הזאת. "to" = מגיעים אליה. */
  const [direction, setDirection] = useState<"from" | "to">("from");
  const [toQuery, setToQuery] = useState("");
  /** נלחצה במפה התחנה של העמוד עצמו — מסבירים במקום להתעלם בשקט. */
  const [selfPick, setSelfPick] = useState(false);
  // חיפוש כתובות בשדה היעד, כמו בעמוד הבית. עד 10.11.2026 השדה הזה
  // קיבל תחנות בלבד, ולכן גם הניסוח היה "בחרו תחנת יעד".
  const [geo, setGeo] = useState<Place[]>([]);
  const [geoBusy, setGeoBusy] = useState(false);
  const geoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geoSeq = useRef(0);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [timeMode, setTimeMode] = useState<"departure" | "arrival">("departure");
  // הנקודה שממנה מחושבת רשימת "עזיבות הבאות". במצב הגעה זו שעת היציאה
  // שנבחרה, ולא שעת ההגעה המבוקשת — אחרת הרשימה סותרת את הכרטיס שמעליה.

  // הקפיצה בבורר הדקות. מזינה גם את אפשרויות ה-select וגם את העיגול
  // ב-pickerDefaults, כדי ששניהם לא יוכלו להתפצל.
  const MINUTE_STEP = 15;
  const [customDay, setCustomDay] = useState(1);
  const [customHour, setCustomHour] = useState(8);
  const [customMinute, setCustomMinute] = useState(0);
  // הערכים שלמעלה נדרסים בשעה הנוכחית בבחירה הראשונה של שעה מפורשת.
  // רק הראשונה: מי שחזר ל"עכשיו" ושוב לשעה מפורשת לא מאבד את מה שהגדיר.
  const timeSeeded = useRef(false);
  /** ראה את ההערה ב-HomeContent: נשמר ואינו מחושב ברינדור. */
  const chooseTime = (next: TimeChoiceValue) => {
    if (next === "now") { setUseCustomTime(false); return; }
    if (!timeSeeded.current) {
      const n = pickerDefaults(MINUTE_STEP);
      setCustomDay(n.day); setCustomHour(n.hour); setCustomMinute(n.minute);
      timeSeeded.current = true;
    }
    setTimeMode(next);
    setUseCustomTime(true);
  };
  /**
   * כמו בעמוד הבית מ-10.11.2026: התשובה נגזרת ואינה נשמרת. ההנמקה
   * המלאה שם, כולל למה `new Date()` בגזירה בטוח כאן — ההבדל היחיד
   * הוא שבעמוד הזה תחנה אחת קבועה (זו של העמוד) והשנייה נבחרת.
   */
  const [planTick, setPlanTick] = useState(0);
  const [dismissKey, setDismissKey] = useState<string | null>(null);
  const finder = useNearestStation();
  const [routeHere, setRouteHere] = useState<{ key: string; metres: number; snap: number | null } | null>(null);

  // המרחק הרלוונטי בעמוד תחנה הוא עד התחנה הזאת, לא עד התחנה הקרובה ביותר.
  // נמדד בדרכים כמו בשאר האתר; המרחק האווירי הוא רק גשר עד שהמסלול חוזר.
  // התוצאה נשמרת עם המפתח שחושב עבורו, כדי שערך ישן לא יוצג אחרי שהמיקום
  // השתנה — בלי לאפס state בתוך האפקט, שמייצר רינדור מדורג.
  const { lat: userLat, lng: userLng } = finder.userLoc ?? { lat: null, lng: null };
  const routeKey = station && userLat !== null && userLng !== null
    ? `${station.name}|${userLat},${userLng}`
    : null;

  useEffect(() => {
    if (!station || userLat === null || userLng === null) return;
    const key = `${station.name}|${userLat},${userLng}`;
    let cancelled = false;
    fetchFootRoute({ lat: userLat, lng: userLng }, station)
      .then(r => { if (!cancelled && r) setRouteHere({ key, metres: r.metres, snap: r.snapMetres }); });
    return () => { cancelled = true; };
  }, [station, userLat, userLng]);

  const routeMetresHere = routeHere && routeHere.key === routeKey ? routeHere.metres : null;
  const routeSnapHere = routeHere && routeHere.key === routeKey ? routeHere.snap : null;
  // אותו כלל כמו בפאנל התחנה הקרובה. קודם לכן כאן הוזן מספר OSRM הגולמי,
  // כך שמי שחיפש מקום שאינו מחובר לרשת ההליכה קיבל זמן מנופח פי כמה.
  const airHere = station && finder.userLoc ? distanceMetres(finder.userLoc, station) : null;
  const estHere = walkEstimate(airHere, routeMetresHere, routeSnapHere);
  const toHere = estHere.metres;
  const walkableHere = isWalkable(toHere);
  const showWalkHere = walkableHere && estHere.trustTime;

  const color = station?.lineColor || "#b04050";
const content = STATION_CONTENT[stationName];
  const related = getRelatedStations(stationName, [...asList(content?.previousStation), ...asList(content?.nextStation)]);
  // nearbyPlaces overlaps content.pois for most stations; only show what pois don't already cover.
  const poiNames = content?.pois.map(p => p.name) ?? [];
  const ownNearby = (station?.nearbyPlaces ?? []).filter(
    p => !poiNames.some(n => n.includes(p) || p.includes(n))
  );
  // הוסר: טיימר של 60 שניות שחישב את היציאות הבאות ושמר אותן ב-state
  // שאיש לא קרא. עמוד התחנה אינו מציג רשימת יציאות, ולכן כל עמוד תחנה
  // פתוח הריץ חישוב וגרם לרינדור מחדש פעם בדקה ללא שום פלט.

  /**
   * התחנה של העמוד הזה אינה קצה אפשרי לנסיעה מתוכו. עד 03.11.2026 היא
   * הופיעה בהשלמה כמו כל תחנה אחרת, ובחירה בה נתנה "נסיעה" של 0 תחנות
   * ו-0 דקות — נמדד `findRoute("אבא הלל","אבא הלל")` → 14:00 → 14:00.
   * מסננים כאן, במקום אחד, כי שתי רשימות התוצאות למטה קוראות מ-results.
   */
  const dropSelf = (r: SearchResults): SearchResults =>
    ({ ...r, stations: r.stations.filter(s => s.name !== stationName) });

  const handleSearch = (val: string) => {
    setQuery(val);
    setSelfPick(false);
    if (toStation) {
      setToStation("");
      setToQuery("");
    }
    const local = val.length >= 2 ? dropSelf(searchCombined(val)) : { stations: [], landmarks: [], places: [] };
    setResults(local);
    const empty = local.stations.length === 0 && local.landmarks.length === 0 && local.places.length === 0;
    runGeoLookup(val, empty, geoTimer, geoSeq, setGeo, setGeoBusy);
  };

  /**
   * כתובת כיעד: נבחרת התחנה הקרובה אליה, והשדה שומר את מה שהוקלד.
   * כלל 3, אותה מחלקה כמו handleSelectPlace: כתובת שהתחנה הקרובה אליה
   * היא התחנה של העמוד מובילה לנסיעה של אפס דקות, ולכן נאמר למה לא
   * קרה כלום במקום להתעלם בשקט.
   */
  const handleSelectGeo = (g: Place) => {
    const st = findNearestStation(g.lat, g.lng);
    if (st.name === stationName) {
      setSelfPick(true);
      return;
    }
    setSelfPick(false);
    setToStation(st.name);
    setToQuery(g.label);
    setQuery(g.label);
    setResults({ stations: [], landmarks: [], places: [] });
    setGeo([]);
    setGeoBusy(false);
  };

  const handleSelectStation = (s: Station) => {
    // מהמפה אפשר ללחוץ גם על התחנה של העמוד — היא דווקא הסמן שבמרכז
    // התצוגה הממוקדת, כלומר הקל ביותר לפגוע בו. התעלמות שקטה הייתה
    // נראית כמו מפה תקועה, ולכן נאמר למה לא קרה כלום.
    if (s.name === stationName) {
      setSelfPick(true);
      return;
    }
    setSelfPick(false);
    setToStation(s.name);
    setToQuery(s.name);
    setQuery(s.name);
    setResults({ stations: [], landmarks: [], places: [] });
  };

  // 22 המקומות המאומתים היו נגישים רק מעמוד הבית ומעמוד המפה. עמוד
  // התחנה חיפש ב-searchAll, שאינו יודע עליהם, ולכן מי שהקליד "בורסה"
  // ב-31 עמודי התחנה קיבל כלום.
  const handleSelectPlace = (p: PlaceHit) => {
    if (!p.station) return;
    // כלל 3: אותה מחלקה. מקום שהתחנה הקרובה לו היא התחנה של העמוד
    // מוביל לאותה נסיעה של אפס דקות.
    if (p.station.name === stationName) {
      setSelfPick(true);
      return;
    }
    setSelfPick(false);
    setToStation(p.station.name);
    setToQuery(p.name);
    setResults({ stations: [], landmarks: [], places: [] });
  };

  const handleSelectLandmark = (l: Landmark & { station: Station | undefined }) => {
    if (!l.station) return;
    setToStation(l.station.name);
    setToQuery(l.name);
    setQuery(l.name);
    setResults({ stations: [], landmarks: [], places: [] });
  };

  /** תחנת רכבת ישראל בטווח הליכה, אם יש. ארבע מתוך 34. */
  const rail = railNear(stationName);
  const railM = rail ? railDistance(rail) : null;

  const origin = direction === "from" ? stationName : toStation;
  const dest = direction === "from" ? toStation : stationName;

  const planKey = [
    origin, dest, useCustomTime ? timeMode : "now",
    useCustomTime ? `${customDay}:${customHour}:${customMinute}` : "", planTick,
  ].join("|");

  const plan = useMemo(() => {
    if (!toStation) return null;
    const from = STATIONS.find(s => s.name === origin);
    const to = STATIONS.find(s => s.name === dest);
    if (!from || !to) return null;

    const baseDate = useCustomTime ? dateForDay(customDay) : new Date();
    if (useCustomTime) {
      baseDate.setHours(customHour, customMinute, 0, 0);
    }

    // החישוב סינכרוני ומקומי — ראה את אותה הערה ב-HomeContent. גם כאן
    // ישבה המתנה מלאכותית של 2 עד 3 שניות, ואיתה מצב loading שלא חיכה לכלום.
    let r: ReturnType<typeof findRoute>;
    let instant: Date;
    if (useCustomTime && timeMode === "arrival") {
      r = findRouteByArrival(origin, dest, baseDate);
      instant = r && !isNoService(r) ? instantFromTime(baseDate, r.departureTime) : baseDate;
    } else {
      const departures = getNextDepartures(baseDate, 1);
      r = findRoute(origin, dest, departures[0]?.minsFromNow, baseDate);
      instant = baseDate;
    }

    // אותו חישוב כמו ב-HomeContent, ומאותו טעם. ראה את ההערה המלאה שם.
    // בעמוד הזה הקפיצה היא 15 ולא 1, ולכן הזמן המוצע מתיישר לרשת של
    // הבוררים כאן — `pickerDefaults` מקבל את הקפיצה בדיוק בשביל זה.
    let next = null as null | { day: number; hour: number; minute: number; label: string };
    if (r && isNoService(r)) {
      const n = pickerDefaults(MINUTE_STEP, baseDate);
      next = { ...n, label: `${hhmm(n.hour * 60 + n.minute)}, ${dayLabel(n.day, new Date())}` };
    }
    return { result: r, planInstant: instant, nextService: next };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planKey]);

  const dismissed = dismissKey === planKey;
  const result = dismissed ? null : plan?.result ?? null;
  const planInstant = plan?.planInstant ?? null;
  const nextService = dismissed ? null : plan?.nextService ?? null;

  const hasResults = results.stations.length > 0 || results.landmarks.length > 0 || results.places.length > 0;
  const noResults = query.length >= 2 && !hasResults && !toStation && query === query.trim();

  return (
    <main style={{
      minHeight: "100vh",
      background: t.bg,
      fontFamily: "'Rubik', sans-serif",
      direction: "rtl",
      transition: "background 0.2s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        input::placeholder { color: ${t.subtle}; }
        input { transition: border-color 0.2s, box-shadow 0.2s; }
        /* input:focus עבר ל-globals.css — ראה שם למה. */

        .btn-primary-s { transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease; }
        .btn-primary-s:hover { filter: brightness(1.08); box-shadow: 0 4px 12px #b0405030; }
        .btn-primary-s:active { transform: scale(0.97); filter: brightness(0.95); }

        .btn-toggle-s { transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .btn-toggle-s:active { transform: scale(0.96); }

        .dropdown-item-s { transition: background 0.12s ease; }
        .dropdown-item-s:hover { background: ${t.resultBg} !important; }

        .btn-reset-s { transition: border-color 0.15s ease, color 0.15s ease; }
        .btn-reset-s:hover { border-color: #b04050 !important; color: #b04050 !important; }
      `}</style>

      <SiteHeader />

      <section style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 48px" }}>

        {/* Breadcrumbs */}
        <nav style={{ fontSize: 12, color: t.muted, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <a href="/" style={{ color: t.muted, textDecoration: "none" }}>ראשי</a>
            <span>›</span>
            <a href="/line-red" style={{ color: t.muted, textDecoration: "none" }}>תחנות הקו האדום</a>
            <span>›</span>
            <span style={{ color: t.text, fontWeight: 500 }}>{stationLabel(stationName)}</span>
          </div>
          <a href="/map" style={{
            fontSize: 12, color: color, fontWeight: 500,
            textDecoration: "none",
          }}>
            ראה במפה
          </a>
        </nav>

        {/* Station name + line */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: t.muted, marginBottom: 6, fontWeight: 500 }}>תחנת רכבת קלה</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: t.text, marginBottom: 8 }}>{stationName}</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {station && (
              <a href={station.lineHref} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 13, color: color, fontWeight: 500 }}>{station.lineName}</span>
              </a>
            )}
          </div>
        </div>

        {/* רק ארבע תחנות בקו נמצאות בטווח הליכה מרכבת ישראל, והאתר לא
            אמר על כך דבר חוץ מפסקה אחת בקריית אריה. למי שעומד בארלוזורוב
            זה ההבדל בין נסיעה אחת לשתיים. */}
        {rail && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <h2 style={{ fontSize: 11, color: t.muted, marginBottom: 6, fontWeight: 500, letterSpacing: "0.04em" }}>חיבור לרכבת ישראל</h2>
            <div style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>{rail.name}</div>
            {railM !== null && (
              <div style={{ fontSize: 12, color: t.muted, marginTop: 3 }}>
                {formatDistance(railM)} מהתחנה
              </div>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${rail.lat},${rail.lng}&travelmode=walking`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: color, fontWeight: 600, textDecoration: "none" }}
            >
              🚶 ניווט לתחנת הרכבת
            </a>
          </div>
        )}

        {/* Address */}
        {(content || station) && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <h2 style={{ fontSize: 11, color: t.muted, marginBottom: 6, fontWeight: 500, letterSpacing: "0.04em" }}>כתובת</h2>
            {(content?.address || "").split(/,\s*(?=כניסה)/).map((line, i) => (
              <div key={i} style={{ fontSize: 14, color: t.text, fontWeight: 500, marginBottom: 2 }}>
                {line.trim()}
              </div>
            ))}
            <div style={{ fontSize: 12, color: t.muted, marginTop: 3 }}>{content?.city || station?.city}</div>
            {content?.stationType && (
              <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>{STATION_TYPE_LABEL[content.stationType] ?? content.stationType}</div>
            )}
          </div>
        )}

        {/* Station map */}
        {/* עד כאן עמוד התחנה לא הציג מפה בהגעה. המפה היחידה בו ישבה בתוך
            בלוק התוצאות, כלומר רק אחרי שמתכננים נסיעה — נמדד 0 מיכלי
            Leaflet ו-0 סמנים בטעינה של /station/אבא הלל. "איפה התחנה" היא
            השאלה הראשונה בעמוד תחנה, והיא נענתה בכתובת בלבד.
            focusStation פותח על התחנה ועל שכנותיה במסילה, ולא על 24 הק"מ. */}
        {station && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <h2 style={{ fontSize: 11, color: t.muted, marginBottom: 10, fontWeight: 500, letterSpacing: "0.04em" }}>התחנה על המפה</h2>
            <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}` }}>
              {/* לחיצה על סמן בוחרת את התחנה לשדה במקום לפתוח כרטיס.
                  בלי זה הכרטיס הציע "תכנן נסיעה לכאן" שמוביל לעמוד
                  הבית — כלומר יוצא מעמוד התחנה ומאבד את הכיוון שכבר
                  נבחר כאן. הטוגל "יציאה מכאן / הגעה לכאן" כבר קיים
                  מעליו, ולכן נשארת בחירה אחת בלבד אחרי הלחיצה. */}
              <Map stations={STATIONS} focusStation={station} userLoc={finder.userLoc} onSelectStation={handleSelectStation} />
            </div>
          </div>
        )}

        {/* Trip planner */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
          <h2 style={{ fontSize: 11, color: t.muted, marginBottom: 10, fontWeight: 500, letterSpacing: "0.04em" }}>תכנון נסיעה</h2>
          {/* הבחירה הייתה שני קישורים בראש העמוד, אחד מלא ואחד במסגרת —
              היררכיה בין שני דברים שווים, ובגובה שונה בפיקסל בגלל המסגרת.
              כאן היא פקד אחד.

              הערה קודמת כאן אמרה שהניסוח מיושר בכוונה עם "זמן יציאה /
              זמן הגעה" שמתחת. זה היה המקור לבלבול ולא פתרון שלו: אותן
              שתי מילים שימשו בשני פקדים במשמעויות שונות — כאן מקום,
              שם זמן. הפקד שמתחת אומר עכשיו "יוצא ב־ / מגיע ב־", והפקד
              הזה נשאר על "מכאן / לכאן". ההבדל במילה ולא בהקשר. */}
          {/* כלל 3: אותה מחלקה כמו בורר הזמן — שורת כפתורים לחוצים,
              בלי קבוצה ובלי תווית. אותו רכיב לשניהם. */}
          <div style={{ marginBottom: 12 }}>
            <RadioPills<"from" | "to">
              label={`כיוון הנסיעה מתחנת ${stationName}`}
              value={direction}
              onChange={d => setDirection(d)}
              selectedBorder={color}
              options={[["from", "יציאה מכאן"], ["to", "הגעה לכאן"]]}
            />
          </div>

          {/*
              אותו סידור כמו בעמוד הבית מ-10.11.2026, ומאותה סיבה: ברגע
              שהתשובה מגיעה לבד, טופס שנעלם לוקח איתו את בורר הזמן. כאן
              זה היה חמור יותר — ההערה שמעל קופסת "אין רכבת" מתארת יציאה
              שמתרחשת **במקרה**, דרך כפתור הכיוון שיושב מחוץ לתנאי.
              עכשיו הטופס עצמו הוא היציאה, בשני העמודים.
          */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Search input */}
              <div style={{ position: "relative" }}>
                <input
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder={direction === "from" ? "בחרו יעד — תחנה, מקום או כתובת" : "בחרו מוצא — תחנה, מקום או כתובת"}
                  aria-label={direction === "from" ? "בחרו יעד" : "בחרו מוצא"}
                  autoComplete="off"
                  style={{
                    width: "100%", background: t.inputBg,
                    border: `1.5px solid ${toStation ? t.borderSelected : t.border}`,
                    borderRadius: 9, padding: "11px 14px", color: t.text,
                    fontSize: 14, outline: "none",
                    fontFamily: "'Rubik', sans-serif", direction: "rtl",
                  }}
                />
                {selfPick && (
                  <div role="status" style={{
                    marginTop: 8, fontSize: 12, color: t.muted,
                    lineHeight: 1.6, textAlign: "right",
                  }}>
                    זאת התחנה שאתם נמצאים בה. בחרו תחנה אחרת על המפה או הקלידו כאן.
                  </div>
                )}
                {hasResults && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0,
                    background: t.card, border: `1px solid ${t.border}`,
                    borderRadius: 9, zIndex: 100, boxShadow: t.shadow, overflow: "hidden",
                  }}>                    {results.stationsFirst ? (<>
                    {results.stations.map(s => (
                      <button key={s.name} onClick={() => handleSelectStation(s)} className="dropdown-item-s" style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", background: "transparent",
                        border: "none", borderBottom: `1px solid ${t.border}`,
                        padding: "11px 14px", cursor: "pointer",
                      }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: s.lineColor, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <div style={{ fontSize: 13, color: t.text, fontWeight: 500, fontFamily: "'Rubik', sans-serif" }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "'Rubik', sans-serif" }}>
                            {s.city}{s.nearbyPlaces.length > 0 ? ` · ליד ${s.nearbyPlaces[0]}` : ""}
                          </div>
                        </div>
                      </button>
                    ))}

                    {results.places.map(p => (
                      <button key={"place:" + p.name} onClick={() => handleSelectPlace(p)} className="dropdown-item-s" style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", background: "transparent",
                        border: "none", borderBottom: `1px solid ${t.border}`,
                        padding: "11px 14px", cursor: "pointer",
                      }}>
                        <div style={{ width: 9, height: 9, borderRadius: 3, background: p.station?.lineColor || "#888", flexShrink: 0, transform: "rotate(45deg)" }} />
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <div style={{ fontSize: 13, color: t.text, fontWeight: 600, fontFamily: "'Rubik', sans-serif" }}>
                            {p.name}
                            <span style={{ fontSize: 10, color: t.subtle, fontWeight: 400, marginRight: 6 }}>{p.kind}</span>
                          </div>
                          <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "'Rubik', sans-serif" }}>{p.context}</div>
                        </div>
                      </button>
                    ))}
                    </>) : (<>

                    {results.places.map(p => (
                      <button key={"place:" + p.name} onClick={() => handleSelectPlace(p)} className="dropdown-item-s" style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", background: "transparent",
                        border: "none", borderBottom: `1px solid ${t.border}`,
                        padding: "11px 14px", cursor: "pointer",
                      }}>
                        <div style={{ width: 9, height: 9, borderRadius: 3, background: p.station?.lineColor || "#888", flexShrink: 0, transform: "rotate(45deg)" }} />
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <div style={{ fontSize: 13, color: t.text, fontWeight: 600, fontFamily: "'Rubik', sans-serif" }}>
                            {p.name}
                            <span style={{ fontSize: 10, color: t.subtle, fontWeight: 400, marginRight: 6 }}>{p.kind}</span>
                          </div>
                          <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "'Rubik', sans-serif" }}>{p.context}</div>
                        </div>
                      </button>
                    ))}
                    {results.stations.map(s => (
                      <button key={s.name} onClick={() => handleSelectStation(s)} className="dropdown-item-s" style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", background: "transparent",
                        border: "none", borderBottom: `1px solid ${t.border}`,
                        padding: "11px 14px", cursor: "pointer",
                      }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: s.lineColor, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <div style={{ fontSize: 13, color: t.text, fontWeight: 500, fontFamily: "'Rubik', sans-serif" }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "'Rubik', sans-serif" }}>
                            {s.city}{s.nearbyPlaces.length > 0 ? ` · ליד ${s.nearbyPlaces[0]}` : ""}
                          </div>
                        </div>
                      </button>
                    ))}
                    </>)}
                    {results.landmarks.map(l => (
                      <button key={l.name} onClick={() => handleSelectLandmark(l)} className="dropdown-item-s" style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", background: "transparent",
                        border: "none", borderBottom: `1px solid ${t.border}`,
                        padding: "11px 14px", cursor: "pointer",
                      }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: l.station?.lineColor || "#888", flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <div style={{ fontSize: 13, color: t.text, fontWeight: 600, fontFamily: "'Rubik', sans-serif" }}>{l.name}</div>
                          <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "'Rubik', sans-serif" }}>{stationLabel(l.stationName)} · {l.walkMins} דקות הליכה</div>
                        </div>
                      </button>
                    ))}
                    <HiddenCountNote count={results.hiddenCount ?? 0} />
                  </div>
                )}
                {noResults && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, zIndex: 100,
                    background: t.card, border: `1px solid ${t.border}`,
                    borderRadius: 9, boxShadow: t.shadow, overflow: "hidden",
                    fontFamily: "'Rubik', sans-serif", textAlign: "right",
                  }}>
                    {geoBusy || geo.length > 0 ? (
                      <GeoPicks query={query} results={geo} busy={geoBusy} onSelect={handleSelectGeo} t={t} />
                    ) : (
                      <div style={{ padding: "14px 16px", fontSize: 13, color: t.muted }}>
                        <div style={{ marginBottom: 6 }}>לא נמצאה תחנה בשם הזה — נסו שם של רחוב, עיר או מקום מוכר</div>
                        <a href="/map" style={{ color: color, fontWeight: 600 }}>פתחו את המפה</a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected destination card */}
              {toStation && (
                <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 9, padding: "10px 14px" }}>
                  <div style={{ fontSize: 13, color: t.text, fontWeight: 600, marginBottom: 4, textAlign: "right" }}>{direction === "from" ? "יעד" : "מוצא"}: {toStation}</div>
                  {(() => {
                    const s = STATIONS.find(st => st.name === toStation);
                    return s && s.nearbyPlaces.length > 0 ? (
                      <div style={{ fontSize: 11, color: t.muted, textAlign: "right" }}>ליד: {s.nearbyPlaces.join(", ")}</div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Time picker */}
              <TimeChoice value={useCustomTime ? timeMode : "now"} onChange={chooseTime} className="btn-toggle-s" />

              {useCustomTime && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{
                    background: t.resultBg, border: `1px solid ${t.border}`,
                    borderRadius: 9, padding: "12px 14px",
                    display: "flex", gap: 10, alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label htmlFor="st-day" style={{ fontSize: 11, color: t.muted, fontWeight: 500, display: "block", cursor: "pointer" }}>יום</label>
                      <select id="st-day" value={customDay} onChange={e => setCustomDay(Number(e.target.value))} style={{
                        background: t.inputBg, border: `1px solid ${t.border}`,
                        borderRadius: 7, padding: "6px 10px", color: t.text,
                        fontSize: 13, fontFamily: "'Rubik', sans-serif", outline: "none",
                      }}>
                        {dayOptions().map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label htmlFor="st-hour" style={{ fontSize: 11, color: t.muted, fontWeight: 500, display: "block", cursor: "pointer" }}>שעה</label>
                      <select id="st-hour" value={customHour} onChange={e => setCustomHour(Number(e.target.value))} style={{
                        background: t.inputBg, border: `1px solid ${t.border}`,
                        borderRadius: 7, padding: "6px 10px", color: t.text,
                        fontSize: 13, fontFamily: "'Rubik', sans-serif", outline: "none",
                      }}>
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={i}>{i.toString().padStart(2,"0")}:00</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label htmlFor="st-min" style={{ fontSize: 11, color: t.muted, fontWeight: 500, display: "block", cursor: "pointer" }}>דקות</label>
                      <select id="st-min" value={customMinute} onChange={e => setCustomMinute(Number(e.target.value))} style={{
                        background: t.inputBg, border: `1px solid ${t.border}`,
                        borderRadius: 7, padding: "6px 10px", color: t.text,
                        fontSize: 13, fontFamily: "'Rubik', sans-serif", outline: "none",
                      }}>
                        {Array.from({length: 60 / MINUTE_STEP}, (_, i) => i * MINUTE_STEP).map(m => (
                          <option key={m} value={m}>{m.toString().padStart(2,"0")}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/*
                  הכפתור משנה תפקיד, כמו בעמוד הבית: אומר מה חסר, או
                  מרענן את "עכשיו", או יורד כשאין מה לרענן.
              */}
              {!toStation ? (
                <div
                  role="status"
                  style={{
                    width: "100%", background: t.card2, color: t.muted,
                    border: `1px solid ${t.border}`, borderRadius: 9,
                    padding: "12px", fontSize: 14, fontWeight: 600,
                    textAlign: "center", fontFamily: "'Rubik', sans-serif",
                  }}>
                  {direction === "from" ? "בחרו יעד כדי לחפש נסיעה" : "בחרו מוצא כדי לחפש נסיעה"}
                </div>
              ) : !useCustomTime ? (
                <button
                  onClick={() => { setPlanTick(n => n + 1); setDismissKey(null); }}
                  className="btn-primary-s"
                  style={{
                    width: "100%", background: color, color: "#fff",
                    border: "none", borderRadius: 9,
                    padding: "12px", fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: "'Rubik', sans-serif",
                  }}
                >עדכנו לשעה הנוכחית</button>
              ) : null}
          </div>
          {result && isNoService(result) ? (
            <div role="alert" style={{
              background: t.card, border: "1px solid #b0405055", borderRadius: 12,
              padding: "16px 18px", textAlign: "right",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>
                אין רכבת בזמן שבחרת
              </div>
              <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.7 }}>{result.reason}</div>
              {/* כאן הטופס לא ננעל כמו בעמוד הבית — כפתור הכיוון יושב
                  מעל התנאי ומנקה את התוצאה. אבל זאת יציאה **במקרה**,
                  דרך פקד שאינו קשור, והלופ זהה: הזמן נשאר על השעה שאין
                  בה שירות. אותם שני כפתורים, מאותו חישוב. */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {nextService && (
                  <button
                    onClick={() => {
                      setCustomDay(nextService.day);
                      setCustomHour(nextService.hour);
                      setCustomMinute(nextService.minute);
                      timeSeeded.current = true;
                      setTimeMode("departure");
                      setUseCustomTime(true);
                    }}
                    style={{
                      background: "#b04050", border: "1px solid #b04050",
                      borderRadius: 10, padding: "10px 14px", color: "#fff",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      fontFamily: "'Rubik', sans-serif",
                    }}
                  >
                    תכננו ל-{nextService.label}
                  </button>
                )}
                <button
                  onClick={() => setDismissKey(planKey)}
                  style={{
                    background: "transparent", border: `1px solid ${t.border}`,
                    borderRadius: 10, padding: "10px 14px", color: t.muted,
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                    fontFamily: "'Rubik', sans-serif",
                  }}
                >
                  שנו את החיפוש
                </button>
              </div>
              <a href="/hours" style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: "#b04050" }}>
                לוח שעות הפעילות המלא ←
              </a>
            </div>
          ) : result ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Result summary */}
              <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: t.muted, fontWeight: 500 }}>מסלול נסיעה</div>
                  <div style={{ fontSize: 10, color: t.muted, background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 6, padding: "2px 7px" }}>הערכה בלבד</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ textAlign: "right", flex: 1 }}>
                    <div style={{ fontSize: 11, color: t.muted }}>מוצא</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: color }}>{origin}</div>
                  </div>
                  <div style={{ fontSize: 16, color: result.lineColor }}>←</div>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{ fontSize: 11, color: t.muted }}>יעד</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: color }}>{dest}</div>
                    {(() => {
                      // ⚠ כאן היה `toStation` — התחנה **שנבחרה**, לא היעד.
                      // בכיוון "הגעה לכאן" היעד הוא התחנה של העמוד והנבחרת
                      // היא המוצא, ולכן השורה תיארה את המוצא מתחת לכותרת
                      // "יעד": נראה על המסך "יעד פינסקר · ליד: קניון TLV",
                      // וקניון TLV שייך לקרליבך. באג קיים שנחשף ב-10.11.2026
                      // כשהתשובה התחילה להופיע לבד — קודם צריך היה ללחוץ,
                      // ואז להחליף כיוון, ואז ללחוץ שוב.
                      const s = STATIONS.find(st => st.name === dest);
                      return s && s.nearbyPlaces.length > 0 ? (
                        <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>ליד: {s.nearbyPlaces[0]}</div>
                      ) : null;
                    })()}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0", borderTop: `1px solid ${t.border}` }}>
                  {[
                    ["שעת יציאה", result.departureTime, result.lineColor],
                    ["זמן נסיעה", `${result.mins}′`, t.text],
                    ["שעת הגעה", result.arrivalTime, t.text],
                  ].map(([label, val, col]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: col }}>{val}</div>
                      <div style={{ fontSize: 10, color: t.muted, marginTop: 3 }}>{label}</div>
                    </div>
                  ))}
                </div>
                {result.change && (
                  <div style={{
                    borderTop: `1px solid ${t.border}`, padding: "10px 14px",
                    fontSize: 12, color: t.text, lineHeight: 1.6, textAlign: "right",
                  }}>
                    <strong>נדרשת החלפה ב{stationLabel(result.change)}.</strong> הקו מתפצל שם: שירות אחד ממשיך
                    לפתח תקווה והשני לקריית אריה, ולכן אין נסיעה ישירה בין שני הענפים.
                    זמן הנסיעה שלמעלה כולל המתנה משוערת של {JUNCTION_WAIT_MINS} דקות להחלפה.
                  </div>
                )}
              </div>

              {/* Custom time label */}
              {useCustomTime && (
                <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 9, padding: "10px 14px", textAlign: "center" }}>
                  <span style={{ fontSize: 12, color: t.muted }}>{timeMode === "arrival" ? "מגיע ב: " : "יוצא ב: "}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                    {dayLabel(customDay)} · {customHour.toString().padStart(2,"0")}:{customMinute.toString().padStart(2,"0")}
                  </span>
                </div>
              )}

              {/* Map */}
              <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}` }}>
                {/* גם כאן, כדי ששתי המפות באותו עמוד לא יגיבו אחרת
                    לאותה תנועה. מי שרואה את התוצאה ורוצה יעד אחר לוחץ
                    עליו ומחפש שוב, במקום לצאת לעמוד הבית. */}
                <Map stations={STATIONS} userLoc={finder.userLoc} onSelectStation={handleSelectStation} fromStation={STATIONS.find(s => s.name === origin) || null} toStation={STATIONS.find(s => s.name === dest) || null} />
              </div>
{(() => {
                const s = STATIONS.find(st => st.name === toStation);
                return s && s.nearbyPlaces.length > 0 ? (
                  <div style={{ background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, color: t.muted, marginBottom: 8, fontWeight: 500 }}>מקומות קרובים {direction === "from" ? "ליעד" : "למוצא"}</div>
                    {s.nearbyPlaces.map(place => (
                      <div key={place} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: t.text }}>{place}</span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
              <button onClick={() => setDismissKey(planKey)} className="btn-reset-s" style={{
                background: "transparent", border: `1px solid ${t.border}`,
                borderRadius: 9, padding: "10px 14px",
                color: t.muted, fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "'Rubik', sans-serif",
              }}>חפש מסלול אחר</button>
            </div>

          ) : null}
        </div>
{/* Intro + Best for */}
        {content && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <p style={{ fontSize: 14, color: t.text, lineHeight: 1.8, marginBottom: 12 }}>{content.intro}</p>
            {content.locationSummary && (
              <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.8, marginBottom: 12 }}>{content.locationSummary}</p>
            )}
            <h2 style={{ fontSize: 12, color: t.muted, fontWeight: 500, marginBottom: 4 }}>למי התחנה שימושית</h2>
            <div style={{ fontSize: 13, color: t.text }}>{content.bestFor}</div>
          </div>
        )}

        {/* POIs */}
        {content && content.pois.length > 0 && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <h2 style={{ fontSize: 11, color: t.muted, marginBottom: 12, fontWeight: 500, letterSpacing: "0.04em" }}>מוקדי עניין ליד התחנה</h2>
            {content.pois.map(poi => (
              <div key={poi.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
                <div>
                  <div style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{poi.name}</div>
                  <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{poi.type}</div>
                </div>
              </div>
            ))}
            {ownNearby.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: t.muted, marginBottom: 6, fontWeight: 500 }}>גם במרחק הליכה</div>
                <div style={{ fontSize: 13, color: t.text }}>{ownNearby.join(" · ")}</div>
              </div>
            )}
          </div>
        )}

        {/* Name fact */}
        {content && content.nameFact && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <h2 style={{ fontSize: 11, color: t.muted, marginBottom: 8, fontWeight: 500, letterSpacing: "0.04em" }}>עובדה מעניינת</h2>
            <p style={{ fontSize: 14, color: t.text, lineHeight: 1.8 }}>{content.nameFact}</p>
          </div>
        )}

        {/* Prev/Next stations */}
        {content && (asList(content.previousStation).length > 0 || asList(content.nextStation).length > 0) && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <h2 style={{ fontSize: 11, color: t.muted, marginBottom: 12, fontWeight: 500, letterSpacing: "0.04em" }}>תחנות סמוכות בקו</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {asList(content.previousStation).map(n => (
                <a key={"prev:" + n} href={`/station/${encodeURIComponent(n)}`} style={{
                  flex: "1 1 40%", background: t.resultBg, border: `1px solid ${t.border}`,
                  borderRadius: 9, padding: "12px 14px", textAlign: "right", textDecoration: "none",
                }}>
                  <div style={{ fontSize: 11, color: t.muted, marginBottom: 4 }}>תחנה קודמת</div>
                  <div style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>← {n}</div>
                </a>
              ))}
              {asList(content.nextStation).map(n => (
                <a key={"next:" + n} href={`/station/${encodeURIComponent(n)}`} style={{
                  flex: "1 1 40%", background: t.resultBg, border: `1px solid ${t.border}`,
                  borderRadius: 9, padding: "12px 14px", textAlign: "left", textDecoration: "none",
                }}>
                  <div style={{ fontSize: 11, color: t.muted, marginBottom: 4 }}>תחנה הבאה</div>
                  <div style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>{n} →</div>
                </a>
              ))}
            </div>
            {asList(content.previousStation).length + asList(content.nextStation).length > 2 && (
              <div style={{ fontSize: 11, color: t.muted, marginTop: 10, lineHeight: 1.6 }}>
                זו תחנת צומת. הקו מתפצל כאן בין השירות לפתח תקווה לבין השירות לקריית אריה.
              </div>
            )}
          </div>
        )}

        {/* How to get here */}
        {station && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <h2 style={{ fontSize: 11, color: t.muted, marginBottom: 12, fontWeight: 500, letterSpacing: "0.04em" }}>איך מגיעים לתחנה</h2>

            {toHere !== null ? (
              <div style={{
                marginBottom: 12, padding: "11px 13px", borderRadius: 10,
                background: t.resultBg, border: `1px solid ${t.border}`,
                fontSize: 13, color: t.text,
              }}>
                מהמיקום שלך: <strong>{formatDistance(toHere)}</strong>
                {showWalkHere ? ` · כ-${walkMinutes(toHere)} דק׳ הליכה` : walkableHere ? "" : " — רחוק מכדי ללכת"}
                {/* הענף האמצעי כאן היה `""`: מרחק בלי זמן ובלי הסבר. walkNote
                    אומר למה, ואותו משפט בדיוק מופיע בפאנל. */}
                {walkNote(estHere) && (
                  <div style={{ fontSize: 11, color: t.muted, marginTop: 6, lineHeight: 1.6 }}>
                    {walkNote(estHere)}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: t.muted, marginBottom: 10, lineHeight: 1.6 }}>
                  כדי לראות את המרחק וזמן ההליכה עד התחנה, אתרו את מיקומכם או הקלידו אותו.
                </div>
                <NearestStationFinder finder={finder} hideResult buttonLabel="אתרו את המיקום שלי" hintLabel="או הקלידו איפה אתם" />
              </div>
            )}

            <NavigationLinks station={station} from={finder.userLoc} transitFirst={toHere !== null && !walkableHere} />
            <div style={{ fontSize: 11, color: t.muted, marginTop: 10, lineHeight: 1.6 }}>
              {finder.userLoc
                ? "הניווט נפתח באפליקציית המפות במכשיר שלך, מהמיקום שאיתרנו."
                : "הניווט נפתח באפליקציית המפות במכשיר שלך, ממיקומך הנוכחי."}
            </div>
          </div>
        )}

        {/* Other stations nearby */}
        {related.stations.length > 0 && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <h2 style={{ fontSize: 11, color: t.muted, marginBottom: 12, fontWeight: 500, letterSpacing: "0.04em" }}>
              {related.sameCityOnly ? `תחנות נוספות ב${station?.city ?? content?.city}` : "תחנות נוספות בקו"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {related.stations.map(s => (
                <a key={s.name} href={`/station/${encodeURIComponent(s.name)}`} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: t.resultBg, border: `1px solid ${t.border}`,
                  borderRadius: 9, padding: "10px 14px", textDecoration: "none",
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: t.muted, marginRight: "auto" }}>{s.city}</span>
                </a>
              ))}
            </div>
          </div>
        )}

{/* FAQ */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
          <h2 style={{ fontSize: 11, color: t.muted, marginBottom: 12, fontWeight: 500, letterSpacing: "0.04em" }}>שאלות נפוצות</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {STATION_FAQ.map(({ q, a }, i) => (
              <details key={i} style={{
                border: `1px solid ${t.border}`, borderRadius: 9,
                padding: "12px 14px", cursor: "pointer",
              }}>
                <summary style={{
                  fontSize: 14, fontWeight: 600, color: t.text,
                  listStyle: "none", display: "flex",
                  justifyContent: "space-between", alignItems: "center",
                }}>
                  {q}
                  <span style={{ color: t.muted, fontSize: 16, fontWeight: 300 }}>+</span>
                </summary>
                <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.8, marginTop: 8 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}