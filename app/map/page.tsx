import { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL, OG_IMAGE } from "../lib/constants";
import { SiteHeader, SiteFooter } from "../lib/SiteComponents";
import MapContent from "./MapContent";
// נגזר כאן, ברכיב שרת, כדי ששני העותקים — ה-FAQ הנראה וה-JSON-LD —
// יאמרו את אותה מחרוזת, ושהתוכן של 54 KB לא ייכנס לחבילת הלקוח.
import { STATION_TYPE_BREAKDOWN } from "../lib/stationContent";
import { STATIONS, LINE_LENGTH_KM } from "../lib/data";
import MapWrapper from "./MapWrapper";

export const metadata: Metadata = {
  title: "מפת הרכבת הקלה בגוש דן | דרך קלה",
  description: "מפה אינטראקטיבית של כל 34 תחנות הקו האדום של הרכבת הקלה בגוש דן. מצאו תחנה קרובה אליכם, ראו את מסלול הקו ועיינו בפרטי כל תחנה.",
  alternates: {
    canonical: `${SITE_URL}/map`,
  },
  openGraph: {
    images: [OG_IMAGE],
    title: "מפת הרכבת הקלה בגוש דן | דרך קלה",
    description: "מפה אינטראקטיבית של כל 34 תחנות הקו האדום. מצאו תחנה קרובה אליכם.",
    url: `${SITE_URL}/map`,
    siteName: SITE_NAME,
    locale: "he_IL",
    type: "website",
  },
};

export default function MapPage() {
  return (
    <MapWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "איפה עובר הקו האדום?", "acceptedAnswer": { "@type": "Answer", "text": `הקו האדום עובר מתחנה מרכזית פתח תקווה דרך בני ברק, רמת גן ומרכז תל אביב ועד הקוממיות בבת ים. האורך הכולל הוא כ-${LINE_LENGTH_KM} ק"מ עם ${STATIONS.length} תחנות.` } },
            { "@type": "Question", "name": "כמה תחנות יש בקו האדום?", "acceptedAnswer": { "@type": "Answer", "text": `${STATIONS.length} תחנות, מתוכן ${STATION_TYPE_BREAKDOWN}.` } },
            { "@type": "Question", "name": "האם הקו הירוק פעיל?", "acceptedAnswer": { "@type": "Answer", "text": "לא. הקו הירוק בבנייה. החלק הדרומי, מראשון לציון עד לוינסקי, צפוי לפתיחה בדצמבר 2028, והקו המלא עד הרצליה ב-2030." } },
            { "@type": "Question", "name": "האם הקו הסגול פעיל?", "acceptedAnswer": { "@type": "Answer", "text": "לא. הקו הסגול נמצא בבנייה וצפוי לפתיחה ביולי 2028." } },
            { "@type": "Question", "name": "איך מוצאים את התחנה הקרובה אליי?", "acceptedAnswer": { "@type": "Answer", "text": "לחצו על הכפתור \"מצא את התחנה הקרובה אליי\" ואפשרו גישה למיקום. אפשר גם להקליד בשדה החיפוש כל רחוב, עיר או מקום מוכר — גם את היעד שאליו אתם רוצים להגיע — והאתר יציג את התחנה הקרובה אליו." } },
            { "@type": "Question", "name": "אפשר ללחוץ על המפה כדי לראות איזו תחנה קרובה למקום מסוים?", "acceptedAnswer": { "@type": "Answer", "text": "כן. לחיצה על כל מקום במפה מסמנת אותו בפין, מציגה את שם הרחוב והעיר שם, ואומרת איזו תחנה הקרובה אליו ביותר, מה המרחק וכמה דקות הליכה. זה עובד גם על מקום שאין בו תחנה — למשל היעד שאליו אתם רוצים להגיע. לחיצה על סמן של תחנה פותחת את כרטיס התחנה כרגיל." } },
          ]
        })}}
      />
      <SiteHeader />
      {/*
        המפה היא העמוד הנצפה ביותר באתר, והיא ישבה ב-350px גובה בתוך עמודה
        של 760px — במסך של 1440 זה פחות מחצי מהרוחב, עם שוליים ריקים משני
        הצדדים. במסך רחב העמודה נפתחת ל-1120 והמפה ל-620, אבל פסקת הפתיחה
        נשארת ב-760 כי שורת טקסט ארוכה מדי קשה לקריאה. בנייד שום דבר לא משתנה.
      */}
      <style>{`
        .map-page { max-width: 760px; margin: 0 auto; padding: 36px 24px 48px; }
        @media (min-width: 1000px) {
          .map-page { max-width: 1120px; --map-h: 620px; }
          .map-page .map-prose { max-width: 760px; }
        }
      `}</style>
      <section className="map-page">

        {/* H1 — server rendered for SEO */}
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          מפת הרכבת הקלה בגוש דן
        </h1>

        {/* All interactive + themed content */}
        <MapContent typeBreakdown={STATION_TYPE_BREAKDOWN} />

      </section>
      <SiteFooter />
    </MapWrapper>
  );
}