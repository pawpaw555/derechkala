import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "../lib/constants";
import PurpleLineContent from "./PurpleLineContent";

export const metadata: Metadata = {
  title: "קו סגול רכבת קלה — מסלול, תחנות ומועד פתיחה | דרך קלה",
  description: "הקו הסגול של הרכבת הקלה יחבר את יהוד ואור יהודה עם מרכז תל אביב, דרך גבעת שמואל, רמת גן וגבעתיים. פתיחה מסחרית צפויה ביולי 2028. מה ידוע היום על המסלול.",
  alternates: { canonical: `${SITE_URL}/line-purple` },
  openGraph: {
    title: "קו סגול רכבת קלה — מסלול ומועד פתיחה",
    description: "יהוד ואור יהודה עד מרכז תל אביב, דרך גבעת שמואל ורמת גן. צפוי יולי 2028.",
    url: `${SITE_URL}/line-purple`,
    siteName: SITE_NAME,
    locale: "he_IL",
    type: "website",
  },
};

export default function PurpleLinePage() {
  return <PurpleLineContent />;
}
