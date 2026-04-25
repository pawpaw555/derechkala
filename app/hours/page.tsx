"use client";
import { useState, useEffect } from "react";
import { useTheme } from "../lib/useTheme";
import { SiteHeader, SiteFooter } from "../lib/SiteComponents";

const SCHEDULE = {
  red: {
    name: "קו אדום",
    color: "#b04050",
    weekday: { first: "05:30", last: "00:00" },
    friday: { first: "05:30", last: "17:10" },
    saturday: { first: "21:00", last: "00:00" },
  },
};

function getDayType(date: Date) {
  const day = date.getDay();
  if (day === 5) return "friday";
  if (day === 6) return "saturday";
  return "weekday";
}

function timeToMins(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function isOperating(date: Date, dayType: string, schedule: typeof SCHEDULE.red) {
  if (dayType === "saturday") {
    const hour = date.getHours();
    return hour >= 21;
  }
  const now = date.getHours() * 60 + date.getMinutes();
  const hours = schedule[dayType as keyof typeof schedule] as { first: string; last: string };
  const first = timeToMins(hours.first);
  const last = hours.last === "00:00" ? 24 * 60 : timeToMins(hours.last);
  return now >= first && now <= last;
}

function minsUntilClose(date: Date, dayType: string, schedule: typeof SCHEDULE.red) {
  const now = date.getHours() * 60 + date.getMinutes();
  const hours = schedule[dayType as keyof typeof schedule] as { first: string; last: string };
  const last = hours.last === "00:00" ? 24 * 60 : timeToMins(hours.last);
  return last - now;
}

export default function HoursPage() {
  const { t } = useTheme();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const dayType = getDayType(now);
  const currentTime = now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const dayLabel = { weekday: "יום חול", friday: "ערב שבת", saturday: "שבת" }[dayType];
  const operating = isOperating(now, dayType, SCHEDULE.red);
  const isShabat = dayType === "saturday" && now.getHours() < 21;

  return (
    <main style={{
      minHeight: "100vh",
      background: t.bg,
      fontFamily: "'Rubik', sans-serif",
      direction: "rtl",
      transition: "background 0.2s",
    }}>
      <SiteHeader backHref="/" />
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
        <p style={{ fontSize: 13, color: t.muted, marginBottom: 24 }}>
          {dayLabel} · {currentTime}
        </p>

        {/* Is it operating today? */}
        <div style={{
          background: isShabat ? "#fdf0f0" : operating ? "#f0faf5" : "#fdf0f0",
          border: `1px solid ${isShabat ? "#c0404044" : operating ? "#3a906044" : "#c0404044"}`,
          borderRadius: 14, padding: "18px 20px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: isShabat ? "#c04040" : operating ? "#3a9060" : "#c04040", marginBottom: 6 }}>
            {isShabat
              ? "הרכבת הקלה לא פועלת בשבת"
              : operating
              ? "הרכבת הקלה פועלת עכשיו"
              : dayType === "saturday"
              ? "הרכבת הקלה תחזור לפעול בעוד זמן מה"
              : "הרכבת הקלה לא פועלת כרגע"}
          </div>
          <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.7 }}>
            {isShabat
              ? "השירות מתחדש במוצאי שבת מהשעה 21:00."
              : operating
              ? `השירות פעיל עד ${SCHEDULE.red[dayType as keyof typeof SCHEDULE.red] && (SCHEDULE.red[dayType as keyof typeof SCHEDULE.red] as any).last}.`
              : "בדקו את לוח הזמנים השבועי למטה."}
          </div>
        </div>

        {/* Weekly schedule */}
        <div style={{ fontSize: 13, color: t.muted, marginBottom: 10, fontWeight: 600, letterSpacing: "0.04em" }}>לוח זמנים שבועי — קו אדום</div>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          {[
            { label: "ראשון עד חמישי", sub: "ימי חול", first: "05:30", last: "00:00", key: "weekday" },
            { label: "ערב שבת (שישי)", sub: "ובערבי חג", first: "05:30", last: "17:10", key: "friday" },
            { label: "שבת", sub: "לא פועל", first: "—", last: "—", key: "shabat" },
            { label: "מוצאי שבת", sub: "ומוצאי חג", first: "21:00", last: "00:00", key: "saturday" },
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
              <span style={{ fontSize: 13, color: row.key === "shabat" ? t.muted : t.text, fontWeight: 500 }}>
                {row.first === "—" ? "לא פועל" : `${row.first} — ${row.last}`}
              </span>
            </div>
          ))}
        </div>

        {/* Frequency */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: t.muted, marginBottom: 12, fontWeight: 600, letterSpacing: "0.04em" }}>תדירות — קו אדום</div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#b04050" }}>3.5′</div>
              <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>שעות עומס</div>
              <div style={{ fontSize: 10, color: t.muted }}>07:00–09:00 · 16:00–19:00</div>
            </div>
            <div style={{ flex: 1, background: t.resultBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: t.text }}>6′</div>
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
            שני הקווים נמצאים בבנייה ואינם פעילים. הקו הסגול צפוי לפתיחה יולי 2028, הקו הירוק דצמבר 2028.
          </p>
        </div>

        {/* FAQ */}
        <div style={{ fontSize: 13, color: t.muted, marginBottom: 10, fontWeight: 600, letterSpacing: "0.04em" }}>שאלות נפוצות</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {[
            { q: "האם הרכבת הקלה פועלת בשבת?", a: "לא. הרכבת הקלה אינה פועלת בשבת. השירות מתחדש במוצאי שבת מהשעה 21:00." },
            { q: "עד מתי פועלת הרכבת הקלה בשישי?", a: "בערב שבת ובערבי חג השירות מסתיים בשעה 17:10. חשוב לתכנן את הנסיעה מראש." },
            { q: "מתי מתחיל השירות בבוקר?", a: "בימי חול ובשישי השירות מתחיל ב-05:30. במוצאי שבת ומוצאי חג השירות מתחיל ב-21:00." },
            { q: "כל כמה זמן יש רכבת?", a: "בשעות העומס (07:00–09:00 ו-16:00–19:00) רכבת כל 3.5 דקות. בשעות הרגילות רכבת כל 6 דקות." },
            { q: "האם יש שינויים בחגים?", a: "כן. בערבי חג השירות מסתיים מוקדם (כמו ערב שבת), ובמוצאי חג השירות מתחדש בשעה 21:00. מומלץ לבדוק באתר הרשמי של דנקל לפני חג." },
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