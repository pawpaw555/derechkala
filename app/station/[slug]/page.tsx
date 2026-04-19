import StationClient from "./StationClient";
import { STATIONS } from "../../lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const stationName = decodeURIComponent(slug);
  return {
    title: `תחנת ${stationName} — דרך קלה`,
    description: `מידע על תחנת ${stationName} ברכבת הקלה של גוש דן — זמני עזיבה, תכנון נסיעה ומקומות קרובים.`,
  };
}

export default async function StationPage({ params }: Props) {
  const { slug } = await params;
  const stationName = decodeURIComponent(slug);
  const station = STATIONS.find(s => s.name === stationName) || null;
  return <StationClient stationName={stationName} station={station} />;
}