import type { Metadata } from "next";
import HomeContent from "./HomeContent";
import { SITE_URL } from "./lib/constants";

/**
 * העמוד היה "use client" ולכן לא יכול היה לייצא metadata, והיה העמוד
 * היחיד באתר בלי canonical. זה לא היה תיאורטי: כל אחד מ-34 עמודי התחנה
 * מקשר ל-/?from=<שם> ול-/?to=<שם>, וגם חלוניות המפה — כלומר עשרות
 * קישורים פנימיים לגרסאות של עמוד הבית עם מחרוזת שאילתה, בלי שום דבר
 * שמאחד אותן. אותו מבנה שכבר קיים ב-/line-red: עמוד שרת למטא, תוכן לקוח.
 */
export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/` },
};

export default function Home() {
  return <HomeContent />;
}
