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
        <p style={{ fontSize: 13, color: t.muted, marginBottom: 32 }}>עדכון אחרון: אוקטובר 2026</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 10 }}>כללי</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
              אתר דרך קלה הוא אתר מידע בלבד בנושא הרכבת הקלה בגוש דן. אנו מחויבים לשמירה על פרטיות המשתמשים. מסמך זה מסביר אילו נתונים נאספים, אם בכלל, וכיצד הם מטופלים.
            </p>
          </div>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 10 }}>איסוף מידע</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8, marginBottom: 10 }}>
              האתר אינו אוסף מידע אישי מזהה. אין טפסי הרשמה, אין חשבונות משתמש, ולא נשמרים שם, כתובת דואר אלקטרוני או מספר טלפון.
            </p>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
              לצורך שיפור האתר נאסף מידע סטטיסטי על אופן השימוש: אילו עמודים נצפו, לחיצות, גלילה ותנועות עכבר. המידע נאסף באמצעות שירות Microsoft Clarity, משמש להבנת דפוסי שימוש ולשיפור הממשק, ואינו מזוהה עם אדם מסוים.
            </p>
          </div>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 10 }}>עוגיות (Cookies)</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8, marginBottom: 10 }}>
              האתר משתמש ב-localStorage של הדפדפן לשמירת העדפת המשתמש בין מצב בהיר לכהה. מידע זה נשמר באופן מקומי על מכשיר המשתמש ואינו מועבר לשום שרת.
            </p>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>
              בנוסף, שירות Microsoft Clarity מציב עוגיות לצורך זיהוי ביקורים חוזרים וניתוח סטטיסטי. ניתן לחסום עוגיות דרך הגדרות הדפדפן, וחסימה כזו לא תפגע בתפקוד האתר.
            </p>
          </div>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 10 }}>שירותי צד שלישי</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8, marginBottom: 10 }}>
              האתר משתמש במספר שירותי צד שלישי:
            </p>
            <ul style={{ fontSize: 14, color: t.muted, lineHeight: 2, paddingRight: 20 }}>
              <li><strong style={{ color: t.text }}>OpenStreetMap</strong> — להצגת מפות אינטראקטיביות. אריחי המפה נטענים משרתי OpenStreetMap. גלישה במפה כפופה למדיניות הפרטיות של OpenStreetMap.</li>
              <li><strong style={{ color: t.text }}>Leaflet</strong> — ספריית המפות נטענת מ-unpkg CDN. הדפדפן עשוי לשלוח בקשה לשרתי unpkg בעת טעינת המפה.</li>
              <li><strong style={{ color: t.text }}>Google Fonts</strong> — גופן Rubik נטען משרתי Google Fonts. הדפדפן עשוי לשלוח בקשה לשרתי Google בעת טעינת העמוד.</li>
              <li><strong style={{ color: t.text }}>Netlify</strong> — האתר מתארח על שרתי Netlify. Netlify עשויה לתעד נתוני גישה בסיסיים כגון כתובת IP לצורכי אבטחה ותפעול.</li>
              <li><strong style={{ color: t.text }}>Microsoft Clarity</strong> — שירות לניתוח התנהגות משתמשים מבית מיקרוסופט. השירות מתעד את אופן השימוש באתר (לחיצות, גלילה ותנועות עכבר) לצורך שיפור הממשק, ומסתיר כברירת מחדל תוכן רגיש. המידע מאוחסן בשרתי מיקרוסופט וכפוף למדיניות הפרטיות של מיקרוסופט.</li>
            </ul>
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