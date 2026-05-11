import StationClient from "./StationClient";
import { STATIONS } from "../../lib/data";
import { SITE_URL, SITE_NAME } from "../../lib/constants";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const stationName = decodeURIComponent(slug);
  const station = STATIONS.find(s => s.name === stationName);
  const city = station?.city ?? "גוש דן";
  const nearby = station?.nearbyPlaces.slice(0, 2) ?? [];

  const description =
    nearby.length >= 2
      ? `תחנת ${stationName} ברכבת הקלה — ${city}. ליד ${nearby[0]} ו${nearby[1]}. תכנון נסיעה, שעות עזיבה ומפה.`
      : nearby.length === 1
      ? `תחנת ${stationName} ברכבת הקלה — ${city}. ליד ${nearby[0]}. תכנון נסיעה, שעות עזיבה ומפה.`
      : `תחנת ${stationName} ברכבת הקלה, ${city} — תכנון נסיעה, שעות עזיבה ומפה.`;

  const title = `תחנת ${stationName} — קו אדום, ${city} | דרך קלה`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/station/${encodeURIComponent(stationName)}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/station/${encodeURIComponent(stationName)}`,
      siteName: SITE_NAME,
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
  // Next.js 16 SSG double-encodes the slug in the default export params.
  // Try double-encoded match first, then single, then raw.
  const station =
    STATIONS.find(s => encodeURIComponent(encodeURIComponent(s.name)) === slug) ||
    STATIONS.find(s => encodeURIComponent(s.name) === slug) ||
    STATIONS.find(s => s.name === slug) ||
    null;
  const stationName = station?.name ?? (() => {
    try {
      const once = decodeURIComponent(slug);
      try { return decodeURIComponent(once); } catch { return once; }
    } catch { return slug; }
  })();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ראשי", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "תחנות הקו האדום", item: `${SITE_URL}/line-red` },
      { "@type": "ListItem", position: 3, name: `תחנת ${stationName}`, item: `${SITE_URL}/station/${encodeURIComponent(stationName)}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <StationClient stationName={stationName} station={station} />
    </>
  );
}
