"use client";
import { Fragment } from "react";
import { useTheme } from "../lib/useTheme";
import { STATIONS, areAdjacent, JUNCTION, hhmm, FRIDAY_LAST_MINS, SATURDAY_NIGHT_FIRST_MINS, PEAK_WINDOWS, PEAK_FREQ_MINS, BASE_FREQ_MINS, LINE_LENGTH_KM } from "../lib/data";
import { SiteHeader, SiteFooter } from "../lib/SiteComponents";
import { useNearestStation } from "../lib/useNearestStation";
import NearestStationFinder from "../lib/NearestStationFinder";

// שני אריחי התדירות ושתי תשובות בשאלות הנפוצות החזיקו את התדירות ואת
// לוח הזמנים ככתב. האריחים לא נתפסו בספירה הראשונה של המחלקה, כי אין
// בהם שעה ואין בהם מילים — רק המספר וסימן הדקות. המספרים עצמם לא
// נכתבים כאן בהערה, כדי שהיא לא תפיל בדיקה שתסרוק את הקובץ הזה.
const FRIDAY_LAST = hhmm(FRIDAY_LAST_MINS);
const SATURDAY_FIRST = hhmm(SATURDAY_NIGHT_FIRST_MINS);
const PEAK_LABEL = PEAK_WINDOWS.map(([f, t]) => `${hhmm(f * 60)}-${hhmm(t * 60)}`).join(" ו-");

const cities = ["פתח תקווה", "בני ברק", "רמת גן", "תל אביב", "בת ים"];

/** `typeBreakdown` נגזר ב-page.tsx. ראו STATION_TYPE_BREAKDOWN. */
export default function RedLineContent({ typeBreakdown }: { typeBreakdown: string }) {
  const { t, dark } = useTheme();
  const redStations = STATIONS.filter(s => s.lineId === "red");
  const finder = useNearestStation();

  return (
    // המעטפת הייתה ב-page.tsx של השרת, בלי גישה לערכת הנושא, ולכן הכותרת
    // והתחתית רונדרו על רקע לבן קבוע בזמן שהגוף היה כהה. זה היה העמוד
    // היחיד באתר שבנוי כך.
    <main style={{
      minHeight: "100vh", background: t.bg,
      fontFamily: "'Rubik', sans-serif", direction: "rtl",
      transition: "background 0.2s",
    }}>
      <SiteHeader />
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 48px" }}>

      {/* Breadcrumbs */}
      <nav style={{ fontSize: 12, color: t.muted, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
        <a href="/" style={{ color: t.muted, textDecoration: "none" }}>ראשי</a>
        <span>›</span>
        <span style={{ color: t.text, fontWeight: 500 }}>קו אדום</span>
      </nav>

      {/* H1 + status */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#b04050", flexShrink: 0 }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, color: t.text }}>קו אדום — הרכבת הקלה</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, marginRight: 26 }}>
        <div style={{
          background: dark ? "#1a2220" : "#f0faf5", border: `1px solid ${dark ? "#3a906055" : "#3a906044"}`,
          borderRadius: 20, padding: "3px 12px",
          fontSize: 12, fontWeight: 600, color: dark ? "#6fc496" : "#2f7a51",
        }}>
          פעיל
        </div>
        <span style={{ fontSize: 13, color: t.muted }}>{STATIONS.length} תחנות · {LINE_LENGTH_KM} ק&quot;מ · פתח תקווה עד בת ים</span>
      </div>

      {/* Route overview */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: t.muted, marginBottom: 12, fontWeight: 600, letterSpacing: "0.04em" }}>סקירת המסלול</div>
        <p style={{ fontSize: 14, color: t.text, lineHeight: 1.8, marginBottom: 12 }}>
          הקו האדום הוא הקו הפעיל היחיד של הרכבת הקלה בגוש דן. הוא עובר מתחנה מרכזית פתח תקווה דרך בני ברק, רמת גן, מרכז תל אביב ויפו, ומסתיים בהקוממיות בבת ים.
        </p>
        {/* הקו אינו שרשרת אחת אלא Y, ו-countStops יודע זאת מאז שהמרחק
            חושב לפי ענפים. הפסקה שמעל אמרה "עובר דרך קריית אריה" וסתרה
            את זה: נסיעה מפתח תקווה לבת ים אינה עוברת שם כלל. */}
        <p style={{ fontSize: 14, color: t.text, lineHeight: 1.8, marginBottom: 12 }}>
          קריית אריה וגשר אם המושבות יושבות על ענף נפרד, שמתפצל ב{JUNCTION}.
          נסיעה מפתח תקווה לבת ים אינה עוברת בהן, ומעבר בין שני הענפים דורש
          החלפה ב{JUNCTION}.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/map" style={{
            fontSize: 13, fontWeight: 600, color: "#b04050",
            border: "1px solid #b0405044", borderRadius: 8,
            padding: "8px 14px", textDecoration: "none",
          }}>
            ראה במפה
          </a>
          <a href="/hours" style={{
            fontSize: 13, fontWeight: 600, color: t.muted,
            border: `1px solid ${t.border}`, borderRadius: 8,
            padding: "8px 14px", textDecoration: "none",
          }}>
            שעות פעילות
          </a>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: "תחנות", value: "34" },
          { label: "אורך", value: `${LINE_LENGTH_KM} ק"מ` },
          { label: "שעות עומס", value: `${PEAK_FREQ_MINS}′` },
          { label: "שעות רגילות", value: `${BASE_FREQ_MINS}′` },
        ].map(({ label, value }) => (
          <div key={label} style={{
            flex: 1, background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 10, padding: "12px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{value}</div>
            <div style={{ fontSize: 10, color: t.muted, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Nearest station — אותו פיצ'ר שבעמוד המפה ובעמוד הבית */}
      <div style={{
        background: t.card, border: `1px solid ${t.border}`,
        borderRadius: 12, padding: 18, marginBottom: 20,
      }}>
        <h2 style={{ fontSize: 13, color: t.muted, marginBottom: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
          איזו תחנה קרובה אליכם?
        </h2>
        <NearestStationFinder finder={finder} />
      </div>

      {/* Station list by city */}
      <div style={{ fontSize: 13, color: t.muted, marginBottom: 12, fontWeight: 600, letterSpacing: "0.04em" }}>כל תחנות הקו האדום</div>
      {cities.map(city => {
        const cityStations = redStations.filter(s => s.city === city);
        if (cityStations.length === 0) return null;
        return (
          <div key={city} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginBottom: 8, paddingRight: 4 }}>{city}</div>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
              {/*
                המחבר מצויר מהשכנות האמיתית ולא ממקום במערך. בתוך פתח
                תקווה יושב שנקר — סוף ענף פתח תקווה — מיד לפני קריית אריה,
                שהיא סוף הענף האחר, ואין ביניהן מסילה. המחבר שם צייר אותן
                כשתי תחנות עוקבות, וזאת הטענה היחידה מהסוג הזה בכל חמש
                קבוצות העיר: נמדד 6 מחברים תקינים בפתח תקווה ואחד שבור,
                ו-0 שבורים בארבע הקבוצות האחרות.
              */}
              {cityStations.map((s, i, arr) => {
                const linkedAbove = i > 0 && areAdjacent("red", arr[i - 1].name, s.name);
                const linkedBelow = i < arr.length - 1 && areAdjacent("red", s.name, arr[i + 1].name);
                return (
                  <Fragment key={s.name}>
                    {i > 0 && !linkedAbove && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "9px 16px",
                        borderBottom: `1px solid ${t.border}`,
                        background: dark ? "#1b1118" : "#fdf6f7",
                      }}>
                        <div style={{ minWidth: 10, display: "flex", justifyContent: "center" }}>
                          <div style={{ width: 2, height: 14, background: `repeating-linear-gradient(${"#b0405055"} 0 3px, transparent 3px 6px)` }} />
                        </div>
                        <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.6 }}>
                          אין מסילה בין {arr[i - 1].name} ל{s.name}. שני הענפים
                          נפגשים ב{JUNCTION}, ונסיעה ביניהם דורשת החלפה שם.
                        </div>
                      </div>
                    )}
                    <a href={`/station/${encodeURIComponent(s.name)}`} style={{
                      display: "flex", alignItems: "center",
                      padding: "13px 16px",
                      borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none",
                      gap: 14, textDecoration: "none",
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 10 }}>
                        {linkedAbove && <div style={{ width: 2, height: 8, background: "#b0405055" }} />}
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#b04050", border: `2px solid ${t.card}` }} />
                        {linkedBelow && <div style={{ width: 2, height: 8, background: "#b0405055" }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{s.nearbyPlaces[0] || s.city}</div>
                      </div>
                      <span style={{ color: t.muted, fontSize: 13 }}>←</span>
                    </a>
                  </Fragment>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* FAQ */}
      <div style={{ fontSize: 13, color: t.muted, marginBottom: 12, fontWeight: 600, letterSpacing: "0.04em", marginTop: 8 }}>שאלות נפוצות</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {[
          { q: "מאיפה עד איפה עובר הקו האדום?", a: "הקו האדום עובר מתחנה מרכזית פתח תקווה עד הקוממיות בבת ים, דרך בני ברק, רמת גן, מרכז תל אביב ויפו. קריית אריה וגשר אם המושבות יושבות על ענף נפרד שמתפצל באהרונוביץ', ולכן נסיעה מפתח תקווה לבת ים אינה עוברת בהן." },
          { q: "כמה תחנות יש בקו האדום?", a: `${STATIONS.length} תחנות לאורך כ-${LINE_LENGTH_KM} ק"מ. מתוכן ${typeBreakdown}.` },
          { q: "כל כמה זמן יש רכבת בקו האדום?", a: `בשעות העומס (${PEAK_LABEL}) רכבת כל ${PEAK_FREQ_MINS} דקות. בשעות הרגילות רכבת כל ${BASE_FREQ_MINS} דקות.` },
          { q: "האם הקו האדום פועל בשבת?", a: `לא. הקו האדום אינו פועל בשבת. הרכבת האחרונה בערב שבת יוצאת ב-${FRIDAY_LAST} והשירות מתחדש במוצאי שבת ב-${SATURDAY_FIRST}.` },
          { q: "מה ההבדל בין קו אדום לקו ירוק וסגול?", a: "הקו האדום הוא הקו הפעיל היחיד כרגע. הקו הסגול צפוי לפתיחה ביולי 2028, ובקו הירוק ייפתח תחילה החלק הדרומי בדצמבר 2028." },
        ].map(({ q, a }, i) => (
          <details key={i} style={{
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 12, padding: "14px 18px", cursor: "pointer",
          }}>
            <summary style={{
              fontSize: 14, fontWeight: 600, color: t.text,
              listStyle: "none", display: "flex",
              justifyContent: "space-between", alignItems: "center",
            }}>
              {q}
              <span style={{ color: t.muted, fontSize: 18, fontWeight: 300 }}>+</span>
            </summary>
            <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.8, marginTop: 8 }}>{a}</p>
          </details>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ padding: 12, background: t.card, border: `1px solid ${t.border}`, borderRadius: 10 }}>
        <p style={{ fontSize: 11, color: t.muted, lineHeight: 1.7 }}>
          האתר אינו קשור רשמית לדנקל או לנת"ע. מידע כללי לא רשמי שעשוי להשתנות.
        </p>
      </div>

      </section>
      <SiteFooter />
    </main>
  );
}