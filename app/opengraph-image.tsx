import { ImageResponse } from "next/og";
import { STATIONS } from "./lib/data";

// לפני זה לא היה og:image בשום עמוד, וכל שיתוף בוואטסאפ נראה כרטיס טקסט
// ריק. התמונה נוצרת בזמן בנייה מהנתונים עצמם, כך שמספר התחנות לא יוכל
// להתיישן מול STATIONS.
export const alt = "דרך קלה — הרכבת הקלה של גוש דן";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";


/**
 * מנוע התמונות של Next (Satori) אינו מיישם כיווניות דו-כיוונית: הוא מצייר
 * את התווים בסדר שבו הם מאוחסנים, ולכן "דרך קלה" יצא "הלק ךרד".
 * ההמרה כאן מסדרת את המחרוזת בסדר חזותי: מקטעי עברית מתהפכים, ומקטעים
 * לטיניים וספרות נשארים כפי שהם ומשנים מקום ככלל.
 */
function visual(text: string): string {
  // רווחים הם מקטע בפני עצמו. כשהם נבלעים במקטע סמוך הם נוחתים אחרי
  // ההיפוך בצד הלא נכון, ו-"34 תחנות" יצא "34תחנות".
  const runs = text.match(/\s+|[\u0590-\u05FF'"״׳.,·—-]+|[^\u0590-\u05FF\s]+/g) ?? [text];
  return runs
    .reverse()
    .map(r => (/[\u0590-\u05FF]/.test(r) ? [...r].reverse().join("") : r))
    .join("");
}

export default async function OpengraphImage() {
  const red = STATIONS.filter(s => s.lineId === "red");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "#ffffff",
          fontFamily: "sans-serif", direction: "rtl", padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: "#b04050" }} />
          <div style={{ fontSize: 40, color: "#777788" }}>{visual("דרך קלה")}</div>
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, color: "#111120", textAlign: "center", lineHeight: 1.2 }}>
          {visual("הרכבת הקלה של גוש דן")}
        </div>
        <div style={{ fontSize: 34, color: "#444458", marginTop: 24, textAlign: "center" }}>
          {visual(`הקו האדום — ${red.length} תחנות מפתח תקווה עד בת ים`)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 52 }}>
          <div style={{ width: 420, height: 5, background: "#b04050", borderRadius: 3 }} />
        </div>
        <div style={{ fontSize: 26, color: "#777788", marginTop: 44 }}>
          {visual("תכנון נסיעה · שעות פעילות · מפת תחנות")}
        </div>
      </div>
    ),
    size
  );
}
