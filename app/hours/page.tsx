import { Metadata } from "next";
import { SITE_NAME, SITE_URL, OG_IMAGE } from "../lib/constants";
import HoursContent from "./HoursContent";

export const metadata: Metadata = {
  title: "שעות פעילות הרכבת הקלה — קו אדום, שישי ומוצ״ש | דרך קלה",
  description: "הקו האדום פועל ראשון עד חמישי מ-05:30 עד חצות, בערב שבת הרכבת האחרונה יוצאת ב-15:40, ובמוצאי שבת השירות מתחדש ב-19:45. בשבת אין שירות. כולל תדירות ולוח זמנים שבועי.",
  alternates: {
    canonical: `${SITE_URL}/hours`,
  },
  openGraph: {
    images: [OG_IMAGE],
    title: "שעות פעילות הרכבת הקלה — קו אדום",
    description: "ראשון עד חמישי 05:30 עד חצות, ערב שבת עד 15:40, מוצאי שבת מ-19:45. בשבת אין שירות.",
    url: `${SITE_URL}/hours`,
    siteName: SITE_NAME,
    locale: "he_IL",
    type: "website",
  },
};

export default function HoursPage() {
  return <HoursContent />;
}
