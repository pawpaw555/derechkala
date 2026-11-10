"use client";
import { findNearestStation, distanceMetres, formatDistance, isWalkable } from "./data";
import { houseNumberNote, type Place } from "./useNearestStation";

/**
 * תוצאות הגיאוקודר כשורות לבחירה: מה שהוקלד, ולידו התחנה הקרובה אליו.
 *
 * **נולד ב-10.11.2026, כשהשדה השלישי ביקש את אותה רשימה.** עד אז
 * הסימון הזה ישב ב-`InputField` בעמוד הבית בלבד. כשחיבור הגיאוקודר
 * הגיע גם לעמוד התחנה, העתקה הייתה יוצרת עותק **שלישי** של אותן
 * עשרים שורות — ואחד מהם היה מתיישן. כלל 4.
 *
 * הרכיב מצייר את **השורות בלבד**, בלי המעטפת: לכל עמוד יש קופסת
 * דרופדאון משלו עם המיקום והצל שלה, וזה מה שנשאר אצלו.
 *
 * המשפט על מספר בית שלא נמצא מגיע מ-`houseNumberNote` — אותו מקור
 * יחיד ששני המקומות האחרים כבר קוראים לו, ולכן הוא נאמר כאן באותן
 * מילים בדיוק.
 */
export default function GeoPicks({
  query,
  results,
  busy,
  onSelect,
  t,
}: {
  query: string;
  results: Place[];
  busy: boolean;
  onSelect: (p: Place) => void;
  t: { card: string; border: string; text: string; muted: string; resultBg: string };
}) {
  if (busy) {
    return <div style={{ padding: "14px 16px", fontSize: 13, color: t.muted }}>מחפש מקומות…</div>;
  }
  if (results.length === 0) {
    return (
      <div style={{ padding: "14px 16px", fontSize: 13, color: t.muted }}>
        לא נמצאו תוצאות עבור &quot;{query}&quot;
      </div>
    );
  }
  return (
    <>
      <div style={{ padding: "8px 14px", fontSize: 11, color: t.muted, background: t.resultBg }}>
        {houseNumberNote(query, results) ?? "לא תחנה — אבל מצאנו את המקום"}
      </div>
      {results.map(g => {
        const st = findNearestStation(g.lat, g.lng);
        const m = Math.round(distanceMetres(g, st));
        return (
          <button key={g.label} onClick={() => onSelect(g)} className="dropdown-item" style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%", background: "transparent",
            border: "none", borderBottom: `1px solid ${t.border}`,
            padding: "12px 14px", cursor: "pointer",
          }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0, background: st.lineColor, transform: "rotate(45deg)" }} />
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ fontSize: 13, color: t.text, fontWeight: 600, fontFamily: "'Rubik', sans-serif" }}>{g.label}</div>
              <div style={{ fontSize: 11, color: t.muted, marginTop: 3, fontFamily: "'Rubik', sans-serif" }}>
                התחנה הקרובה: {st.name} · {formatDistance(m)}{isWalkable(m) ? "" : " · רחוק מכדי ללכת"}
              </div>
            </div>
          </button>
        );
      })}
    </>
  );
}
