"use client";
import { useState, useEffect } from "react";
import { useTheme } from "../lib/useTheme";
import { SiteHeader, SiteFooter } from "../lib/SiteComponents";
import {
  getDayType, isOperating, hhmm,
  describeNoService,
  SERVICE_FIRST_MINS, FRIDAY_LAST_MINS, SATURDAY_NIGHT_FIRST_MINS,
  WEEKDAY_LAST_MINS, PEAK_WINDOWS, PEAK_FREQ_MINS, BASE_FREQ_MINS,
} from "../lib/data";

// העמוד החזיק עותק משלו של שעות הפעילות, של getDayType ושל isOperating,
// ולא ייבא דבר מ-data.ts. שינוי בלוח הזמנים במקום אחד היה משאיר את
// מתכנן הנסיעה ואת העמוד הזה אומרים דברים שונים, בלי שום אזהרה.
// minsUntilClose ו-timeToMins הוצהרו ולא נקראו מעולם.
const FIRST = hhmm(SERVICE_FIRST_MINS);
const MIDNIGHT = hhmm(WEEKDAY_LAST_MINS % (24 * 60));
const FRIDAY_LAST = hhmm(FRIDAY_LAST_MINS);
const SATURDAY_FIRST = hhmm(SATURDAY_NIGHT_FIRST_MINS);
const LAST_BY_DAY = { weekday: MIDNIGHT, friday: FRIDAY_LAST, saturday: MIDNIGHT };
const peakRanges = PEAK_WINDOWS.map(([f, t]) => `${hhmm(f * 60)}–${hhmm(t * 60)}`);
const PEAK_LABEL = peakRanges.join(" · ");
const PEAK_LABEL_AND = peakRanges.join(" ו-");

export default function HoursContent() {
  const { t } = useTheme();
  // העמוד נבנה סטטית, ולכן new Date() בזמן רינדור הוא שעת הבנייה — העמוד
  // הגיש "פועלת עכשיו" לפי שעון של לפני ימים, וגם יצר פער מול הלקוח.
  // מתחילים ריק ומעדכנים אחרי העלייה, כך שהשעה היא תמיד של המשתמש.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    const first = setTimeout(update, 0);
    const id = setInterval(update, 60000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);

  const ready = now !== null;
  const clock = now ?? new Date(0);
  const dayType = getDayType(clock);
  const currentTime = ready ? clock.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "";
  const dayLabel = { weekday: "יום חול", friday: "ערב שבת", saturday: "שבת" }[dayType];
  const operating = ready && isOperating(clock);
  // ה-21:00 שהיה כאן היה עותק שלישי של לוח הזמנים, ששרד את המעבר ל-data.ts
  // כי הוא מספר ולא מחרוזת. בשבת בין 19:45 ל-21:00 isOperating החזיר true
  // והכרטיס אמר "לא פועלת בשבת" ומתחתיו "השירות מתחדש מהשעה 19:45" — שעה
  // שכבר עברה, בזמן שמתכנן הנסיעה הציע יציאות חיות. שבת היא לא טווח שעות
  // משלה: היא בדיוק "יום שבת ועוד לא פועלת", לפי אותו מקור יחיד.
  // "שבת ולפני החידוש", ולא "שבת ולא פועלת". ב-03.11.2026 isOperating
  // קיבל גבול עליון — הוא מחזיר false גם **אחרי** היציאה האחרונה — ואז
  // `!operating` הפך נכון גם ב-23:58 במוצאי שבת, והכרטיס היה חוזר לומר
  // "לא פועלת בשבת · מתחדש ב-19:45" על שעה שעברה לפני ארבע שעות. זה
  // בדיוק הבאג ש-1aabe49 תיקן, והוא כמעט חזר מכיוון אחר.
  const nowMins = clock.getHours() * 60 + clock.getMinutes();
  const isShabat = ready && dayType === "saturday" && nowMins < SATURDAY_NIGHT_FIRST_MINS;

  return (
    <main style={{
      minHeight: "100vh",
      background: t.bg,
      fontFamily: "'Rubik', sans-serif",
      direction: "rtl",
      transition: "background 0.2s",
    }}>
      <SiteHeader />
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 48px" }}>

        {/* Breadcrumbs */}
        <nav style={{ fontSize: 12, color: t.muted, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
          <a href="/" style={{ color: t.muted, textDecoration: "none" }}>ראשי</a>
          <span>›</span>
          <span style={{ color: t.text, fontWeight: 500 }}>שעות פעילות</span>
        </nav>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 6 }}>
          שעות פעילות הרכבת הקלה
        </h1>
        {/* השעה הייתה שורה אפורה בת 13 פיקסלים מתחת לכותרת, והיא התשובה
            שבגללה אנשים נכנסים לעמוד הזה. ממורכזת ובולטת, מעל כרטיס הסטטוס
            שמסביר מה המשמעות שלה. ה-nbsp שומר על הגובה לפני שהשעון עולה,
            כדי שהעמוד לא יקפוץ. */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{
            fontSize: 44, fontWeight: 700, color: t.text, lineHeight: 1.1,
            fontVariantNumeric: "tabular-nums", direction: "ltr",
          }}>
            {ready ? currentTime : "\u00A0"}
          </div>
          <div style={{ fontSize: 13, color: t.muted, marginTop: 4, fontWeight: 500 }}>
            {ready ? dayLabel : "\u00A0"}
          </div>
        </div>

        {/* Is it operating today? */}
        <div style={{
          background: !ready ? "#f4f4f8" : isShabat ? "#fdf0f0" : operating ? "#f0faf5" : "#fdf0f0",
          border: `1px solid ${!ready ? "#d0d0dc" : isShabat ? "#c0404044" : operating ? "#3a906044" : "#c0404044"}`,
          borderRadius: 14, padding: "18px 20px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: !ready ? "#444458" : isShabat ? "#c04040" : operating ? "#3a9060" : "#c04040", marginBottom: 6 }}>
            {!ready
              ? "בודק את השעה שלך…"
              : isShabat
              ? "הרכבת הקלה לא פועלת בשבת"
              : operating
              ? "הרכבת הקלה פועלת עכשיו"
              : "הרכבת הקלה לא פועלת כרגע"}
          </div>
          {/* רקע הכרטיס קבוע בהיר, ולכן הטקסט חייב להיות כהה קבוע. קודם
              לכן הוא השתמש ב-t.muted, שבמצב כהה בהיר — ויצא 1.9:1. */}
          <div style={{ fontSize: 13, color: "#444458", lineHeight: 1.7 }}>
            {!ready
              ? "השעה נקראת מהדפדפן שלך."
              : isShabat
              ? `השירות מתחדש במוצאי שבת מהשעה ${SATURDAY_FIRST}.`
              : operating
              ? `השירות פעיל עד ${LAST_BY_DAY[dayType]}.`
              : /* **הענף הזה אמר "בדקו את לוח הזמנים השבועי למטה".** נכון,
                 * וחסר תועלת בדיוק ברגע שבו שואלים. נמדדו 32 דקות בשבוע
                 * שבהן הוא מוצג בעוד הטבלה שמתחתיו מבטיחה שירות, בשלושה
                 * סוגי יום — הפירוט ב-open-items יג וב-card-vs-table.mjs.
                 * כלומר המסך סתר את עצמו ולא הסביר.
                 *
                 * `describeNoService` כבר ניסח את התשובה בשביל מתכנן
                 * הנסיעה; עכשיו שלושת המסכים חולקים אותה ואינם יכולים
                 * להיחלק.
                 *
                 * שורות ההמשך כאן מתחילות ב-`*` בכוונה: השורה "לוח זמנים
                 * קשיח בכל app/" מנכה שורות כאלה, ובגרסה הראשונה שלי
                 * הערת ה-JSX הזאת החזיקה שש שעות והפילה אותה. הבדיקה
                 * צדקה — היא אינה יכולה להבחין בין הערה לקוד. */
                describeNoService(clock)}
          </div>
        </div>

        {/* Weekly schedule */}
        <div style={{ fontSize: 13, color: t.muted, marginBottom: 10, fontWeight: 600, letterSpacing: "0.04em" }}>לוח זמנים שבועי — קו אדום</div>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          {[
            { label: "ראשון עד חמישי", sub: "ימי חול", first: FIRST, last: MIDNIGHT, key: "weekday" },
            { label: "ערב שבת (שישי)", sub: "ובערבי חג", first: FIRST, last: FRIDAY_LAST, key: "friday" },
            { label: "שבת", sub: "לא פועל", first: "—", last: "—", key: "shabat" },
            { label: "מוצאי שבת", sub: "ומוצאי חג", first: SATURDAY_FIRST, last: MIDNIGHT, key: "saturday" },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "13px 18px",
              borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none",
              background: row.key === dayType ? t.resultBg : "transparent",
            }}>
              <div>
                <div style={{ fontSize: 14, color: t.text, fontWeight: row.key === dayType ? 600 : 400 }}>{row.label}</div>
                <div style={{ fontSize: 11, color: t.muted }}>{row.sub}</div>
              </div>
              <span style={{ fontSize: 13, color: row.key === "shabat" ? t.muted : t.text, fontWeight: 500, direction: "ltr" }}>
                {row.key === "shabat" ? "—" : `${row.first}–${row.last}`}
              </span>
            </div>
          ))}
        </div>

        {/* Frequency */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: t.muted, marginBottom: 12, fontWeight: 600, letterSpacing: "0.04em" }}>תדירות — קו אדום</div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#b04050" }}>{PEAK_FREQ_MINS}′</div>
              <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>שעות עומס</div>
              <div style={{ fontSize: 10, color: t.muted }}>{PEAK_LABEL}</div>
            </div>
            <div style={{ flex: 1, background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: t.text }}>{BASE_FREQ_MINS}′</div>
              <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>שעות רגילות</div>
              <div style={{ fontSize: 10, color: t.muted }}>שאר שעות היום</div>
            </div>
          </div>
        </div>

        {/* Green/Purple */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3a9060" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6a52a8" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>קו ירוק וקו סגול</span>
          </div>
          <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.7 }}>
            שני הקווים נמצאים בבנייה ואינם פעילים. הקו הסגול צפוי לפתיחה יולי 2028, והחלק הדרומי של הקו הירוק דצמבר 2028.
          </p>
        </div>

        {/* FAQ */}
        <div style={{ fontSize: 13, color: t.muted, marginBottom: 10, fontWeight: 600, letterSpacing: "0.04em" }}>שאלות נפוצות</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {[
            { q: "האם הרכבת הקלה פועלת בשבת?", a: `לא. הרכבת הקלה אינה פועלת בשבת. השירות מתחדש במוצאי שבת מהשעה ${SATURDAY_FIRST}.` },
            { q: "עד מתי פועלת הרכבת הקלה בשישי?", a: `בערב שבת ובערבי חג הרכבת האחרונה יוצאת ב-${FRIDAY_LAST}. חשוב לתכנן את הנסיעה מראש.` },
            { q: "מתי מתחיל השירות בבוקר?", a: `בימי חול ובשישי השירות מתחיל ב-${FIRST}. במוצאי שבת ומוצאי חג השירות מתחיל ב-${SATURDAY_FIRST}.` },
            { q: "כל כמה זמן יש רכבת?", a: `בשעות העומס (${PEAK_LABEL_AND}) רכבת כל ${PEAK_FREQ_MINS} דקות. בשעות הרגילות רכבת כל ${BASE_FREQ_MINS} דקות.` },
            { q: "האם יש שינויים בחגים?", a: `כן. בערבי חג השירות מסתיים מוקדם (כמו ערב שבת), ובמוצאי חג השירות מתחדש בשעה ${SATURDAY_FIRST}. מומלץ לבדוק באתר הרשמי של דנקל לפני חג.` },
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

        {/* Official source + disclaimer */}
        <div style={{ padding: 16, background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 8 }}>מקור רשמי</div>
          <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.7, marginBottom: 10 }}>
            המידע באתר זה הוא הערכה כללית בלבד ואינו מידע רשמי בזמן אמת. בחגים ואירועים מיוחדים ייתכנו שינויים בלוח הזמנים.
          </p>
          <a
            href="https://www.dankal.co.il"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block", fontSize: 13, fontWeight: 600,
              color: "#b04050", textDecoration: "none",
              border: "1px solid #b0405044", borderRadius: 8,
              padding: "8px 14px",
            }}
          >
            לאתר הרשמי של דנקל ←
          </a>
        </div>

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