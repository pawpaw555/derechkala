import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "דרך קלה | הרכבת הקלה של גוש דן",
  description: "תכנון נסיעה, זמנים ותחנות של הרכבת הקלה בגוש דן — קו אדום פעיל עם 34 תחנות. קו ירוק וסגול בבנייה.",
  openGraph: {
    title: "דרך קלה | הרכבת הקלה של גוש דן",
    description: "תכנון נסיעה ברכבת הקלה בגוש דן. קו אדום פעיל עם 34 תחנות מפתח תקווה עד בת ים.",
    url: "https://derechkala.online",
    siteName: "דרך קלה",
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "דרך קלה | הרכבת הקלה של גוש דן",
    description: "תכנון נסיעה ברכבת הקלה בגוש דן. קו אדום פעיל עם 34 תחנות מפתח תקווה עד בת ים.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "yrc8o851ob");`}
        </Script>
      </body>
    </html>
  );
}