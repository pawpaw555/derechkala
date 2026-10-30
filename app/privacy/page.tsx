import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "../lib/constants";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "מדיניות פרטיות | דרך קלה",
  description: "איזה מידע נאסף באתר דרך קלה, אילו שירותים חיצוניים מקבלים נתונים, מה נשמר בדפדפן שלכם וכיצד נעשה שימוש במיקום. ללא חשבונות וללא שמירת נתונים בשרת.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "מדיניות פרטיות — דרך קלה",
    description: "איזה מידע נאסף, אילו שירותים חיצוניים מעורבים ומה נשמר בדפדפן.",
    url: `${SITE_URL}/privacy`,
    siteName: SITE_NAME,
    locale: "he_IL",
    type: "website",
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
