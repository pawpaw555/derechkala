import { Metadata } from "next";
import { SITE_NAME, SITE_URL, OG_IMAGE } from "../lib/constants";
import { hhmm, SERVICE_FIRST_MINS, FRIDAY_LAST_MINS, SATURDAY_NIGHT_FIRST_MINS } from "../lib/data";
import HoursContent from "./HoursContent";

// העמוד עצמו עבר ל-data.ts, והתיאור שגוגל מציג עליו נשאר מודפס ביד.
// שינוי בלוח הזמנים היה מעדכן את גוף העמוד ומשאיר את תוצאת החיפוש
// מספרת את השעות הקודמות.
const FIRST = hhmm(SERVICE_FIRST_MINS);
const FRIDAY_LAST = hhmm(FRIDAY_LAST_MINS);
const SATURDAY_FIRST = hhmm(SATURDAY_NIGHT_FIRST_MINS);

export const metadata: Metadata = {
  title: "שעות פעילות הרכבת הקלה — קו אדום, שישי ומוצ״ש | דרך קלה",
  description: `הקו האדום פועל ראשון עד חמישי מ-${FIRST} עד חצות, בערב שבת הרכבת האחרונה יוצאת ב-${FRIDAY_LAST}, ובמוצאי שבת השירות מתחדש ב-${SATURDAY_FIRST}. בשבת אין שירות. כולל תדירות ולוח זמנים שבועי.`,
  alternates: {
    canonical: `${SITE_URL}/hours`,
  },
  openGraph: {
    images: [OG_IMAGE],
    title: "שעות פעילות הרכבת הקלה — קו אדום",
    description: `ראשון עד חמישי ${FIRST} עד חצות, ערב שבת עד ${FRIDAY_LAST}, מוצאי שבת מ-${SATURDAY_FIRST}. בשבת אין שירות.`,
    url: `${SITE_URL}/hours`,
    siteName: SITE_NAME,
    locale: "he_IL",
    type: "website",
  },
};

export default function HoursPage() {
  return <HoursContent />;
}
