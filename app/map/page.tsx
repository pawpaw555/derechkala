import MapHeader from "./MapHeader";
import { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "../lib/constants";
import { SiteHeader, SiteFooter } from "../lib/SiteComponents";
import MapContent from "./MapContent";
import MapWrapper from "./MapWrapper";

export const metadata: Metadata = {
  title: "מפת הרכבת הקלה בגוש דן | דרך קלה",
  description: "מפה אינטראקטיבית של כל 34 תחנות הקו האדום של הרכבת הקלה בגוש דן. מצאו תחנה קרובה אליכם, ראו את מסלול הקו ועיינו בפרטי כל תחנה.",
  alternates: {
    canonical: `${SITE_URL}/map`,
  },
  openGraph: {
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
            { "@type": "Question", "name": "איפה עובר הקו האדום?", "acceptedAnswer": { "@type": "Answer", "text": "הקו האדום עובר מתחנה מרכזית פתח תקווה דרך בני ברק, רמת גן ומרכז תל אביב ועד הקוממיות בבת ים. האורך הכולל הוא כ-24 ק\"מ עם 34 תחנות." } },
            { "@type": "Question", "name": "כמה תחנות יש בקו האדום?", "acceptedAnswer": { "@type": "Answer", "text": "34 תחנות, מתוכן 10 תת-קרקעיות ו-24 עיליות." } },
            { "@type": "Question", "name": "האם הקו הירוק פעיל?", "acceptedAnswer": { "@type": "Answer", "text": "לא. הקו הירוק נמצא בבנייה וצפוי לפתיחה בדצמבר 2028." } },
            { "@type": "Question", "name": "האם הקו הסגול פעיל?", "acceptedAnswer": { "@type": "Answer", "text": "לא. הקו הסגול נמצא בבנייה וצפוי לפתיחה ביולי 2028." } },
            { "@type": "Question", "name": "איך מוצאים את התחנה הקרובה אליי?", "acceptedAnswer": { "@type": "Answer", "text": "לחצו על הכפתור \"מצא את התחנה הקרובה אליי\" ואפשרו גישה למיקום. האתר יזהה את התחנה הקרובה אליכם ביותר." } },
          ]
        })}}
      />
      <MapHeader />
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 48px" }}>

        {/* H1 — server rendered for SEO */}
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          מפת הרכבת הקלה בגוש דן
        </h1>

        {/* All interactive + themed content */}
        <MapContent />

      </section>
      <SiteFooter />
    </MapWrapper>
  );
}