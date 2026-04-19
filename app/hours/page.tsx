"use client";
import { useState, useEffect } from "react";
import { useTheme } from "../lib/useTheme";
import { SiteHeader, SiteFooter } from "../lib/SiteComponents";

const SCHEDULE = {
  red: { name: "קו אדום", color: "#b04050", weekday: { first: "05:30", last: "00:00" }, friday: { first: "05:30", last: "17:10" }, saturday: { first: "21:00", last: "00:00" } },
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
  const dayLabel = { weekday: "יום חול", friday: "ערב שבת", saturday: "מוצאי שבת" }[dayType];

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
      `}</style>

      <SiteHeader backHref="/" />

      <section style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 48px" }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: t.text, marginBottom: 6 }}>שעות פעילות</h1>
        <p style={{ fontSize: 13, color: t.muted, marginBottom: 28 }}>{dayLabel}, {currentTime}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {Object.values(SCHEDULE).map(line => {
            const operating = isOperating(now, dayType, line);
            const hours = line[dayType as keyof typeof line] as { first: string; last: string };
            const minsLeft = operating ? minsUntilClose(now, dayType, line) : 0;
            const hoursLeft = Math.floor(minsLeft / 60);
            const minsLeftRem = minsLeft % 60;

            return (
              <div key={line.name} style={{
                background: t.card,
                border: `1px solid ${operating ? line.color + "44" : t.border}`,
                borderRadius: 12, padding: 18,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: line.color }} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{line.name}</span>
                  </div>
                  <div style={{
                    background: operating ? "#f0faf5" : "#fdf0f0",
                    border: `1px solid ${operating ? "#3a906044" : "#c0404044"}`,
                    borderRadius: 20, padding: "4px 12px",
                    fontSize: 12, fontWeight: 600,
                    color: operating ? "#3a9060" : "#c04040",
                  }}>
                    {operating ? "פעיל עכשיו" : "לא פעיל"}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: t.muted, marginBottom: 4, fontWeight: 500 }}>רכבת ראשונה</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{hours.first}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: t.muted, marginBottom: 4, fontWeight: 500 }}>רכבת אחרונה</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{hours.last}</div>
                  </div>
                  {operating && minsLeft > 0 && minsLeft < 120 && (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: t.muted, marginBottom: 4, fontWeight: 500 }}>נסגר בעוד</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#c08030" }}>
                        {hoursLeft > 0 ? `${hoursLeft}ש׳ ${minsLeftRem}ד׳` : `${minsLeft}ד׳`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3a9060", marginTop: 4 }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6a52a8", marginTop: 4 }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>קו ירוק וקו סגול</span>
          </div>
          <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.7 }}>
            שני הקווים נמצאים בבנייה ואינם פעילים. הקו הסגול צפוי לפתיחה יולי 2028, הקו הירוק דצמבר 2028.
          </p>
        </div>

        <h2 style={{ fontSize: 14, color: t.muted, marginBottom: 10, fontWeight: 500, letterSpacing: "0.04em" }}>לוח זמנים שבועי — קו אדום</h2>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
          {[
            { label: "ראשון עד חמישי", first: "05:30", last: "00:00", key: "weekday" },
            { label: "ערב שבת (שישי)", first: "05:30", last: "17:10", key: "friday" },
            { label: "מוצאי שבת",      first: "21:00", last: "00:00", key: "saturday" },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "13px 18px",
              borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none",
              background: row.key === dayType ? t.resultBg : "transparent",
            }}>
              <span style={{ fontSize: 14, color: t.text, fontWeight: row.key === dayType ? 600 : 400 }}>{row.label}</span>
              <span style={{ fontSize: 13, color: t.muted }}>{row.first} — {row.last}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: 14, background: t.card, border: `1px solid ${t.border}`, borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.7 }}>
            בשבת הרכבת הקלה אינה פועלת. בחגים ייתכנו שינויים בשעות הפעילות.
            תדירות: קו אדום כל 3.5 דקות בשעות עומס.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}