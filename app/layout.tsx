import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "דרך קלה — הרכבת הקלה של גוש דן",
  description: "תכנון נסיעה, זמנים ותחנות של הרכבת הקלה בגוש דן — קו אדום פעיל עם 34 תחנות. קו ירוק וסגול בבנייה.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23b04050'/><text x='50' y='67' font-size='52' text-anchor='middle' fill='white' font-family='Arial'>ד</text></svg>" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}