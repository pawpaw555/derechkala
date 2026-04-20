"use client";
import { useTheme } from "../lib/useTheme";
import { SiteHeader, SiteFooter } from "../lib/SiteComponents";

export default function PrivacyPage() {
  const { t } = useTheme();

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

      <section style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 48px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 8 }}>מדיניות פרטיות</h1>
        <p style={{ fontSize: 13, color: t.muted, marginBottom: 32 }}>עדכון אחרון: אפריל 2026</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 10 }}>כללי</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
              אתר דרך קלה הוא אתר מידע בלבד בנושא הרכבת הקלה בגוש דן. אנו מחויבים לשמירה על פרטיות המשתמשים. מסמך זה מסביר אילו נתונים נאספים, אם בכלל, וכיצד הם מטופלים.
            </p>
          </div>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 10 }}>איסוף מידע</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
              האתר אינו אוסף כל מידע אישי. אין טפסי הרשמה, אין חשבונות משתמש, ואין אחסון של נתוני גלישה. לא נשמר שום מידע מזהה על המשתמשים.
            </p>
          </div>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 10 }}>עוגיות (Cookies)</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
              האתר משתמש ב-localStorage של הדפדפן לשמירת העדפת המשתמש בין מצב בהיר לכהה בלבד. מידע זה נשמר באופן מקומי על מכשיר המשתמש ואינו מועבר לשום שרת.
            </p>
          </div>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 10 }}>שירותי צד שלישי</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
              האתר משתמש ב-OpenStreetMap להצגת מפות. גלישה במפה עשויה להיות כפופה למדיניות הפרטיות של OpenStreetMap. האתר מתארח על שרתי Netlify.
            </p>
          </div>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 10 }}>מיקום המשתמש</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
              האתר מבקש גישה למיקום המשתמש אך ורק לצורך מציאת התחנה הקרובה. המיקום אינו נשמר, אינו מועבר לשרת, ומשמש רק באופן זמני בדפדפן המשתמש.
            </p>
          </div>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 10 }}>אחריות על המידע</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
              המידע המוצג באתר לגבי זמני רכבות ולוחות זמנים הוא הערכה בלבד ואינו מידע רשמי. לזמנים מדויקים יש לפנות לאתר הרשמי של דנקל או לאפליקציית דנקל.
            </p>
          </div>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 10 }}>יצירת קשר</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
              לכל שאלה בנושא מדיניות הפרטיות ניתן לפנות אלינו דרך עמוד האתר.
            </p>
          </div>

        </div>
      </section>

      <SiteFooter />
    </main>
  );
}