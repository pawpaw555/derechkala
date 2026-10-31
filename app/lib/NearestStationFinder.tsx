"use client";
import Link from "next/link";
import { Station, distanceMetres, formatDistance, walkMinutes, walkEstimate, isWalkable } from "./data";
import { useTheme } from "./useTheme";
import { detectPlatform } from "./useNearestStation";
import NavigationLinks from "./NavigationLinks";

type Finder = ReturnType<typeof import("./useNearestStation").useNearestStation>;

/**
 * ממשק "איפה אני ואיזו תחנה קרובה", משותף לעמוד המפה ולעמוד הבית.
 * הלוגיקה יושבת ב-useNearestStation; כאן רק התצוגה.
 */
export default function NearestStationFinder({
  finder,
  onFound,
  resultHref = true,
  hideButton,
  hideResult,
  buttonLabel = "מצא את התחנה הקרובה אליי",
}: {
  finder: Finder;
  onFound?: (s: Station) => void;
  /** בעמוד הבית התחנה נבחרת בטופס, ולכן אין צורך בקישור החוצה. */
  resultHref?: boolean;
  /** כשההורה כבר מציג כפתור מיקום משלו. */
  hideButton?: boolean;
  /** כשההורה מציג את התוצאה בעצמו, למשל כשדה בטופס. */
  hideResult?: boolean;
  /** בעמוד תחנה השאלה היא "איפה אני", לא "איזו תחנה קרובה אליי". */
  buttonLabel?: string;
}) {
  const { t, dark } = useTheme();
  const {
    userLoc, station, routeMetres, accuracy, locError, locating, diag,
    place, results, searching, placeMsg, recent,
    searchRef, onType, pick, requestLocation,
  } = finder;

  // הכלל עצמו יושב ב-walkEstimate, משותף עם עמוד התחנה.
  const airMetres = userLoc && station ? distanceMetres(userLoc, station) : null;
  const est = walkEstimate(airMetres, routeMetres ?? null);
  const metres = est.metres;
  const walkable = isWalkable(metres);
  const showWalkTime = walkable && est.trustTime;
  // כשרדיוס השגיאה גדול מהמרחק עצמו, "התחנה הקרובה" היא ניחוש. אומרים
  // את זה במקום להציג מספר שנראה ודאי.
  const vague = accuracy !== null && metres !== null && accuracy > Math.max(300, metres);

  // נקרא רק בתוך בלוק השגיאה, שמופיע אחרי פעולת משתמש ולכן תמיד בצד הלקוח.
  // קריאה ל-navigator בזמן רינדור ראשוני הייתה יוצרת פער מול השרת.
  const platform = locError ? detectPlatform() : "other";

  return (
    <div>
      {!hideButton && (
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <button
          onClick={() => requestLocation(onFound)}
          disabled={locating}
          aria-busy={locating}
          style={{
            background: dark ? "#1a2220" : "#f0faf5",
            border: `1px solid ${dark ? "#3a906066" : "#3a906088"}`,
            borderRadius: 10, padding: "10px 18px",
            color: dark ? "#6fc496" : "#2f7a51", fontSize: 14, fontWeight: 600,
            cursor: locating ? "progress" : "pointer",
            fontFamily: "'Rubik', sans-serif", opacity: locating ? 0.7 : 1,
          }}
        >{locating ? "מאתר..." : buttonLabel}</button>
        <span style={{ fontSize: 12, color: t.muted }}>או הקלידו איפה אתם</span>
      </div>
      )}

      <div style={{ position: "relative", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={searchRef}
            value={place}
            onChange={e => onType(e.target.value)}
            placeholder="רחוב, עיר או מקום מוכר"
            aria-label="חיפוש מקום"
            autoComplete="off"
            style={{
              flex: 1, background: t.inputBg, border: `1.5px solid ${t.border}`,
              borderRadius: 9, padding: "11px 14px", color: t.text,
              fontSize: 14, outline: "none", fontFamily: "'Rubik', sans-serif", direction: "rtl",
            }}
          />
          {searching && <span style={{ alignSelf: "center", fontSize: 12, color: t.muted }}>מחפש…</span>}
        </div>

        {recent && !place && (
          <button type="button" onClick={() => { const s = pick(recent); onFound?.(s); }} style={{
            marginTop: 8, background: t.resultBg, border: `1px solid ${t.border}`,
            borderRadius: 8, padding: "8px 12px", fontSize: 12, color: t.text,
            cursor: "pointer", fontFamily: "'Rubik', sans-serif", textAlign: "right",
          }}>↩ המקום האחרון שלך: <strong>{recent.label}</strong></button>
        )}

        {results.length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, zIndex: 500,
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 9, boxShadow: t.shadow, overflow: "hidden",
          }}>
            {results.map(p => (
              <button key={`${p.lat},${p.lng}`} type="button"
                onClick={() => { const s = pick(p); onFound?.(s); }}
                style={{
                  display: "block", width: "100%", textAlign: "right",
                  background: "transparent", border: "none",
                  borderBottom: `1px solid ${t.border}`, padding: "11px 14px",
                  fontSize: 13, color: t.text, cursor: "pointer", fontFamily: "'Rubik', sans-serif",
                }}>{p.label}</button>
            ))}
          </div>
        )}

        {placeMsg && <div style={{ fontSize: 12, color: t.muted, marginTop: 8 }}>{placeMsg}</div>}
      </div>

      {locError && (
        <div role="alert" style={{
          marginBottom: 12, padding: "12px 14px",
          background: t.card, border: "1px solid #b0405055",
          borderRadius: 10, fontSize: 13, lineHeight: 1.7, color: t.text,
        }}>
          <div style={{ marginBottom: 8 }}>{locError}</div>
          <details style={{ fontSize: 12, color: t.muted, lineHeight: 1.8 }}>
            <summary style={{ cursor: "pointer", color: t.text, fontWeight: 600 }}>
              איך מפעילים את איתור המיקום?
            </summary>
            <div style={{ marginTop: 8 }}>
              {platform === "ios" && (
                <>
                  <strong style={{ color: t.text }}>באייפון או באייפד:</strong> הגדרות ← פרטיות ואבטחה
                  ← שירותי מיקום. ודאו שהמתג העליון דלוק, ואז בחרו את הדפדפן שלכם
                  (<span style={{ direction: "ltr", display: "inline-block" }}>Safari Websites</span> או
                  {" "}<span style={{ direction: "ltr", display: "inline-block" }}>Chrome</span>)
                  ← בזמן השימוש באפליקציה.
                  <div style={{ marginTop: 10 }}>
                    שימו לב: תחת הגדרות ← Safari אין סעיף מיקום. הוא יושב רק תחת שירותי מיקום.
                  </div>
                </>
              )}
              {platform === "android" && (
                <>
                  <strong style={{ color: t.text }}>באנדרואיד:</strong> בדרך כלל יופיע חלון שמבקש רשות —
                  אשרו אותו. אם לא הופיע: הגדרות המכשיר ← אפליקציות ← הדפדפן שלכם ← הרשאות ← מיקום ← אפשרו.
                </>
              )}
              {platform === "mac" && (
                <>
                  <strong style={{ color: t.text }}>במק:</strong> תפריט אפל ← הגדרות מערכת ← פרטיות ואבטחה
                  ← שירותי מיקום ← הדליקו את הדפדפן שלכם, ואז סגרו ופתחו אותו מחדש.
                </>
              )}
              {platform === "other" && (
                <>
                  <strong style={{ color: t.text }}>במחשב:</strong> לחצו על הסמל שמשמאל לכתובת האתר
                  בשורת הכתובת ← הרשאות ← מיקום ← אפשרו, ואז רעננו את העמוד.
                </>
              )}
              {(platform === "ios" || platform === "android") && (
                <div style={{ marginTop: 10 }}>
                  <strong style={{ color: t.text }}>אם אפליקציית גוגל מפות יודעת איפה אתם:</strong> לחצו על
                  הנקודה הכחולה, גררו את הכרטיס התחתון מעלה, והעתיקו את שורת הקואורדינטות לשדה החיפוש כאן.
                </div>
              )}
              {diag && (
                <div style={{
                  marginTop: 12, padding: "8px 10px", borderRadius: 8,
                  background: t.resultBg, border: `1px solid ${t.border}`,
                  fontSize: 11, color: t.subtle, direction: "ltr", textAlign: "left",
                  wordBreak: "break-all", fontFamily: "monospace",
                }}>
                  <div style={{ direction: "rtl", textAlign: "right", marginBottom: 4, fontFamily: "'Rubik', sans-serif" }}>
                    פרטים טכניים (לדיווח תקלה):
                  </div>
                  {diag}
                </div>
              )}
            </div>
          </details>
        </div>
      )}

      {station && !hideResult && (
        <div style={{
          marginBottom: 12, padding: "14px 16px",
          background: t.card, border: "1px solid #3a906055", borderRadius: 12,
        }}>
          <div style={{ fontSize: 12, color: t.muted, marginBottom: 4 }}>
            {vague ? "ככל הנראה התחנה הקרובה אליך" : "התחנה הקרובה אליך"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {resultHref ? (
              <Link href={`/station/${encodeURIComponent(station.name)}`} style={{ color: "#b04050", fontWeight: 700, fontSize: 18 }}>
                {station.name}
              </Link>
            ) : (
              <span style={{ color: "#b04050", fontWeight: 700, fontSize: 18 }}>{station.name}</span>
            )}
            <span style={{ fontSize: 12, color: t.muted }}>
              {station.city}
              {metres !== null && ` · ${formatDistance(metres)}${showWalkTime ? ` · כ-${walkMinutes(metres)} דק׳ הליכה` : ""}`}
            </span>
          </div>
          <div style={{ fontSize: 12, color: t.muted, marginBottom: 10 }}>
            {metres !== null && !walkable ? "רחוק מכדי ללכת — איך מגיעים לשם" : "איך מגיעים לשם"}
          </div>
          {vague && (
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 8, lineHeight: 1.6 }}>
              הדפדפן דיווח על מיקום משוער ברדיוס של כ-{formatDistance(accuracy!)}. אם זו אינה התחנה הנכונה, הקלידו איפה אתם.
            </div>
          )}
          <NavigationLinks station={station} from={userLoc} transitFirst={metres !== null && !walkable} />
        </div>
      )}
    </div>
  );
}
