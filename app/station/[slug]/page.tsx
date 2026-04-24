import StationClient from "./StationClient";
import { STATIONS } from "../../lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const stationName = decodeURIComponent(slug);
  return {
    title: `תחנת ${stationName} | רכבת קלה גוש דן | דרך קלה`,
    description: `מידע על תחנת ${stationName} ברכבת הקלה של גוש דן — זמני עזיבה, מוקדי עניין, תכנון נסיעה ומפה.`,
    alternates: {
      canonical: `https://derechkala.online/station/${encodeURIComponent(stationName)}`,
    },
    openGraph: {
      title: `תחנת ${stationName} | דרך קלה`,
      description: `מידע על תחנת ${stationName} ברכבת הקלה של גוש דן.`,
      url: `https://derechkala.online/station/${encodeURIComponent(stationName)}`,
      siteName: "דרך קלה",
      locale: "he_IL",
      type: "website",
    },
  };
}
export async function generateStaticParams() {
  return STATIONS.map(s => ({
    slug: encodeURIComponent(s.name),
  }));
}
export default async function StationPage({ params }: Props) {
  const { slug } = await params;
  const stationName = decodeURIComponent(slug);
  const station = STATIONS.find(s => s.name === stationName) || null;
  return <StationClient stationName={stationName} station={station} />;
}