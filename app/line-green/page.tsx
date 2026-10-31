import { Metadata } from "next";
import { SITE_NAME, SITE_URL, OG_IMAGE } from "../lib/constants";
import GreenLineContent from "./GreenLineContent";

// קודם לכן זה היה רכיב לקוח בלי metadata, ולכן העמוד שלח את הכותרת
// והתיאור של עמוד הבית ולא היה לו קנוניקל כלל. הקנוניקל גם פותר את
// ה-rewrite העברי /קו-ירוק, שהגיש את אותו HTML בכתובת שנייה.
export const metadata: Metadata = {
  title: "קו ירוק רכבת קלה — מסלול, תחנות ומועד פתיחה | דרך קלה",
  description: "הקו הירוק של הרכבת הקלה יחבר את הרצליה עם ראשון לציון דרך תל אביב וחולון. החלק הדרומי צפוי להיפתח בדצמבר 2028 והקו המלא ב-2030. מה ידוע היום על המסלול.",
  alternates: { canonical: `${SITE_URL}/line-green` },
  openGraph: {
    images: [OG_IMAGE],
    title: "קו ירוק רכבת קלה — מסלול ומועד פתיחה",
    description: "הרצליה עד ראשון לציון. החלק הדרומי צפוי דצמבר 2028, הקו המלא ב-2030.",
    url: `${SITE_URL}/line-green`,
    siteName: SITE_NAME,
    locale: "he_IL",
    type: "website",
  },
};

export default function GreenLinePage() {
  return <GreenLineContent />;
}
