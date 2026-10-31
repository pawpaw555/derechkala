import { notFound } from "next/navigation";
import StationClient from "./StationClient";
import { STATIONS, stationLabel } from "../../lib/data";
import { STATION_CONTENT, STATION_FAQ } from "../../lib/stationContent";
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
      ? `${stationLabel(stationName)} ברכבת הקלה — ${city}. ליד ${nearby[0]} ו${nearby[1]}. תכנון נסיעה, שעות עזיבה ומפה.`
      : nearby.length === 1
      ? `${stationLabel(stationName)} ברכבת הקלה — ${city}. ליד ${nearby[0]}. תכנון נסיעה, שעות עזיבה ומפה.`
      : `${stationLabel(stationName)} ברכבת הקלה, ${city} — תכנון נסיעה, שעות עזיבה ומפה.`;

  const title = `${stationLabel(stationName)} — קו אדום, ${city} | דרך קלה`;

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
  // כל slug שאינו אחת מ-34 התחנות החזיר 200 עם עמוד תחנה מומצא, שנבנה
  // סביב השם שחולץ מהכתובת. זה גם מטעה משתמש וגם נותן לגוגל אינסוף
  // עמודים דקים לאינדוקס.
  if (!station) notFound();
  const stationName = station.name;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ראשי", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "תחנות הקו האדום", item: `${SITE_URL}/line-red` },
      { "@type": "ListItem", position: 3, name: stationLabel(stationName), item: `${SITE_URL}/station/${encodeURIComponent(stationName)}` },
    ],
  };

  const content = STATION_CONTENT[stationName];
  const stationUrl = `${SITE_URL}/station/${encodeURIComponent(stationName)}`;

  // Every value below is read from STATIONS / STATION_CONTENT. Fields with
  // no backing data (accessibility, platforms, opening date) are omitted.
  const stationSchema = station
    ? {
        "@context": "https://schema.org",
        "@type": "TrainStation",
        name: stationLabel(stationName),
        url: stationUrl,
        ...(content?.locationSummary ? { description: content.locationSummary } : {}),
        geo: {
          "@type": "GeoCoordinates",
          latitude: station.lat,
          longitude: station.lng,
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: content?.address,
          addressLocality: content?.city ?? station.city,
        },
      }
    : null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: STATION_FAQ.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {stationSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(stationSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <StationClient stationName={stationName} station={station} />
    </>
  );
}
