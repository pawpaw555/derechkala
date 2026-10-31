import { Metadata } from "next";
import { SITE_NAME, SITE_URL, OG_IMAGE } from "../lib/constants";
import RedLineContent from "./RedLineContent";

export const metadata: Metadata = {
  title: "קו אדום רכבת קלה | כל התחנות והמסלול | דרך קלה",
  description: "כל 34 תחנות הקו האדום של הרכבת הקלה בגוש דן — מתחנה מרכזית פתח תקווה עד הקוממיות בת ים. מפה, שעות פעילות וקישורים לכל תחנה.",
  alternates: {
    canonical: `${SITE_URL}/line-red`,
  },
  openGraph: {
    images: [OG_IMAGE],
    title: "קו אדום רכבת קלה | כל התחנות והמסלול",
    description: "כל 34 תחנות הקו האדום של הרכבת הקלה בגוש דן — מפתח תקווה עד בת ים.",
    url: `${SITE_URL}/line-red`,
    siteName: SITE_NAME,
    locale: "he_IL",
    type: "website",
  },
};

export default function RedLinePage() {
  return <RedLineContent />;
}
