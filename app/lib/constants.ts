export const SITE_NAME = "דרך קלה";
export const SITE_URL = "https://derechkala.online";

/**
 * תמונת השיתוף נוצרת ב-app/opengraph-image.tsx. Next מצרף אותה אוטומטית
 * רק כשהעמוד אינו מגדיר openGraph משלו — וכל שמונת העמודים כאן מגדירים,
 * ולכן היא הגיעה לעמוד הבית בלבד: 1 מתוך 41. כל openGraph מצרף אותה
 * במפורש דרך הקבוע הזה, כדי שיהיה מקור אחד לנתיב.
 */
export const OG_IMAGE = "/opengraph-image";
