export type Station = {
  name: string;
  lat: number;
  lng: number;
  lineId: "red" | "green" | "purple";
  lineName: string;
  lineColor: string;
  lineHref: string;
  city: string;
  address: string;
  nearbyPlaces: string[];
};
export type Landmark = {
  name: string;
  stationName: string;
  walkMins: number;
  lineId: "red" | "green" | "purple";
};
export const STATIONS: Station[] = [
  // ── קו אדום — פתח תקווה ──────────────────────────────
  { name: "תחנה מרכזית פתח תקווה", lat: 32.0947, lng: 34.8868, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "התחנה המרכזית, פתח תקווה", nearbyPlaces: ["שוק פתח תקווה", "תיאטרון המסילה"] },
  { name: "פינסקר", lat: 32.0938, lng: 34.8825, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב פינסקר, פתח תקווה", nearbyPlaces: ["שוק פתח תקווה", "מתחמי הבילוי גיסין"] },
  { name: "קרול", lat: 32.0917, lng: 34.8772, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב קרול, פתח תקווה", nearbyPlaces: ["גלריית הציפור הכחולה", "פארק תמר בורנשטיין"] },
  { name: "דנקנר", lat: 32.0910, lng: 34.8718, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב דנקנר, פתח תקווה", nearbyPlaces: ["פארק יד לבנים", "מוזיאון האדם והסביבה"] },
  { name: "בילינסון", lat: 32.0915, lng: 34.8664, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "בית חולים בילינסון, פתח תקווה", nearbyPlaces: ["מרכז רפואי רבין", "בית חולים שניידר"] },
  { name: "שחם", lat: 32.0921, lng: 34.8600, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב שחם, פתח תקווה", nearbyPlaces: ["מגדלי בסר", "B.S.R סיטי"] },
  { name: "שנקר", lat: 32.0926, lng: 34.8536, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב שנקר, פתח תקווה", nearbyPlaces: ["מכללת שנקר", "פארקטק קריית אריה"] },
  { name: "קריית אריה", lat: 32.1062, lng: 34.8617, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "קריית אריה, פתח תקווה", nearbyPlaces: ["אצטדיון שלמה ביטוח", "מסלול ירקון פתח תקווה"] },
  // ── קו אדום — בני ברק ───────────────────────────────
  { name: "גשר אם המושבות", lat: 32.0993, lng: 34.8464, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בני ברק", address: "גשר אם המושבות, בני ברק", nearbyPlaces: ["אזור תעשייה קריית אריה", "שכונת קריית הרצוג"] },
  { name: "אהרונוביץ'", lat: 32.0960, lng: 34.8347, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בני ברק", address: "רחוב אהרונוביץ', בני ברק", nearbyPlaces: ["לשכת האוכלוסין", "מגדלי שקל"] },
  // ── קו אדום — רמת גן ────────────────────────────────
  { name: "בן גוריון", lat: 32.0908, lng: 34.8229, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "רמת גן", address: "שדרות בן גוריון, רמת גן", nearbyPlaces: ["בית המשפט לעניינים מקומיים", "מגדלי B.S.R"] },
  { name: "ביאליק", lat: 32.0864, lng: 34.8115, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "רמת גן", address: "רחוב ביאליק, רמת גן", nearbyPlaces: ["קניון ביאליק", "כיכר רמב\"ם"] },
  { name: "אבא הלל", lat: 32.0828, lng: 34.8019, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "רמת גן", address: "רחוב אבא הלל, רמת גן", nearbyPlaces: ["בורסת היהלומים", "מגדל משה אביב"] },
  // ── קו אדום — תל אביב ───────────────────────────────
  { name: "ארלוזורוב", lat: 32.0815, lng: 34.7962, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב ארלוזורוב, תל אביב", nearbyPlaces: ["תחנת רכבת סבידור מרכז", "מסוף 2000"] },
  { name: "שאול המלך", lat: 32.0766, lng: 34.7920, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "שדרות שאול המלך, תל אביב", nearbyPlaces: ["מרכז עזריאלי", "בית חולים איכילוב"] },
  { name: "יהודית", lat: 32.0702, lng: 34.7884, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "שדרות יהודית, תל אביב", nearbyPlaces: ["מתחם שרונה", "קריית הממשלה"] },
  { name: "קרליבך", lat: 32.0653, lng: 34.7829, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב קרליבך, תל אביב", nearbyPlaces: ["קניון TLV", "מגדל אקרו"] },
  { name: "אלנבי", lat: 32.0626, lng: 34.7746, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב אלנבי, תל אביב", nearbyPlaces: ["שדרות רוטשילד", "שוק הכרמל"] },
  { name: "אליפלט", lat: 32.0583, lng: 34.7625, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב אליפלט, תל אביב", nearbyPlaces: ["מתחם התחנה", "פארק המסילה"] },
  { name: "שלמה (סלמה)", lat: 32.0542, lng: 34.7594, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב שלמה, תל אביב", nearbyPlaces: ["יפו העתיקה", "תיאטרון גשר"] },
  { name: "אצטדיון בלומפילד", lat: 32.0500, lng: 34.7589, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "אצטדיון בלומפילד, תל אביב", nearbyPlaces: ["אצטדיון בלומפילד", "שוק הפשפשים"] },
  { name: "ארליך", lat: 32.0457, lng: 34.7583, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב ארליך, תל אביב", nearbyPlaces: ["המכללה האקדמית תל אביב יפו"] },
  { name: "איסקוב", lat: 32.0419, lng: 34.7569, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב איסקוב, תל אביב", nearbyPlaces: ["קריית חינוך יפו"] },
  { name: "הבעש\"ט", lat: 32.0384, lng: 34.7556, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב הבעש\"ט, תל אביב", nearbyPlaces: ["בית חולים וולפסון", "מרכז הטניס יפו"] },
  { name: "מחרוזת", lat: 32.0333, lng: 34.7515, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב מחרוזת, תל אביב", nearbyPlaces: ["שכונת עג'מי"] },
  // ── קו אדום — בת ים ─────────────────────────────────
  { name: "העצמאות", lat: 32.0279, lng: 34.7488, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב העצמאות, בת ים", nearbyPlaces: ["מרכז העיר בת ים", "כיכר המגינים"] },
  { name: "רוטשילד", lat: 32.0267, lng: 34.7441, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב רוטשילד, בת ים", nearbyPlaces: ["מרכז העיר", "חוף הים בת ים"] },
  { name: "ז'בוטינסקי", lat: 32.0214, lng: 34.7432, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב ז'בוטינסקי, בת ים", nearbyPlaces: ["חוף הים בת ים"] },
  { name: "בלפור", lat: 32.0173, lng: 34.7450, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב בלפור, בת ים", nearbyPlaces: ["עיריית בת ים"] },
  { name: "בנימין", lat: 32.0163, lng: 34.7488, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב בנימין, בת ים", nearbyPlaces: ["ספריית בת ים", "גן שעשועים ירושלמי"] },
  { name: "יוספטל", lat: 32.0152, lng: 34.7525, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב יוספטל, בת ים", nearbyPlaces: ["קניון בת ים"] },
  { name: "כ\"ט בנובמבר", lat: 32.0105, lng: 34.7513, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב כ\"ט בנובמבר, בת ים", nearbyPlaces: ["קניון בת ימון", "אזור תעשייה"] },
  { name: "העמל", lat: 32.0061, lng: 34.7492, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב העמל, בת ים", nearbyPlaces: ["בית משפט השלום בת ים", "בית הדין לעבודה"] },
  { name: "הקוממיות", lat: 32.0024, lng: 34.7469, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב הקוממיות, בת ים", nearbyPlaces: ["אצטדיון בת ים", "קאנטרי בת ים"] },
];
export const LANDMARKS: Landmark[] = [
  // תחנה מרכזית פתח תקווה
  { name: "שוק פתח תקווה", stationName: "תחנה מרכזית פתח תקווה", walkMins: 4, lineId: "red" },
  { name: "תיאטרון המסילה", stationName: "תחנה מרכזית פתח תקווה", walkMins: 6, lineId: "red" },
  // פינסקר
  { name: "מתחמי הבילוי גיסין", stationName: "פינסקר", walkMins: 5, lineId: "red" },
  // דנקנר
  { name: "פארק יד לבנים פתח תקווה", stationName: "דנקנר", walkMins: 4, lineId: "red" },
  { name: "מוזיאון האדם והסביבה", stationName: "דנקנר", walkMins: 5, lineId: "red" },
  // בילינסון
  { name: "בית חולים בילינסון", stationName: "בילינסון", walkMins: 3, lineId: "red" },
  { name: "מרכז רפואי רבין", stationName: "בילינסון", walkMins: 4, lineId: "red" },
  { name: "בית חולים שניידר", stationName: "בילינסון", walkMins: 5, lineId: "red" },
  // שחם
  { name: "B.S.R סיטי", stationName: "שחם", walkMins: 4, lineId: "red" },
  // שנקר
  { name: "מכללת שנקר", stationName: "שנקר", walkMins: 3, lineId: "red" },
  // קריית אריה
  { name: "אצטדיון שלמה ביטוח", stationName: "קריית אריה", walkMins: 5, lineId: "red" },
  // אבא הלל
  { name: "בורסת היהלומים", stationName: "אבא הלל", walkMins: 4, lineId: "red" },
  { name: "מגדל משה אביב", stationName: "אבא הלל", walkMins: 5, lineId: "red" },
  // ארלוזורוב
  { name: "תחנת רכבת סבידור מרכז", stationName: "ארלוזורוב", walkMins: 3, lineId: "red" },
  // שאול המלך
  { name: "מרכז עזריאלי", stationName: "שאול המלך", walkMins: 5, lineId: "red" },
  { name: "בית חולים איכילוב", stationName: "שאול המלך", walkMins: 6, lineId: "red" },
  // יהודית
  { name: "מתחם שרונה", stationName: "יהודית", walkMins: 5, lineId: "red" },
  // קרליבך
  { name: "קניון TLV", stationName: "קרליבך", walkMins: 4, lineId: "red" },
  // אלנבי
  { name: "שוק הכרמל", stationName: "אלנבי", walkMins: 5, lineId: "red" },
  { name: "שדרות רוטשילד", stationName: "אלנבי", walkMins: 6, lineId: "red" },
  // אליפלט
  { name: "פארק המסילה", stationName: "אליפלט", walkMins: 4, lineId: "red" },
  { name: "נווה צדק", stationName: "אליפלט", walkMins: 6, lineId: "red" },
  // שלמה (סלמה)
  { name: "יפו העתיקה", stationName: "שלמה (סלמה)", walkMins: 7, lineId: "red" },
  { name: "תיאטרון גשר", stationName: "שלמה (סלמה)", walkMins: 5, lineId: "red" },
  // אצטדיון בלומפילד
  { name: "אצטדיון בלומפילד", stationName: "אצטדיון בלומפילד", walkMins: 2, lineId: "red" },
  { name: "שוק הפשפשים", stationName: "אצטדיון בלומפילד", walkMins: 6, lineId: "red" },
  // הבעש"ט
  { name: "בית חולים וולפסון", stationName: "הבעש\"ט", walkMins: 4, lineId: "red" },
  // יוספטל
  { name: "קניון בת ים", stationName: "יוספטל", walkMins: 5, lineId: "red" },
  // בלפור
  { name: "עיריית בת ים", stationName: "בלפור", walkMins: 4, lineId: "red" },
  // הקוממיות
  { name: "אצטדיון בת ים", stationName: "הקוממיות", walkMins: 5, lineId: "red" },
  // ── כתובות רחובות ────────────────────────────────────────────
  { name: "זאב אורלוב 70", stationName: "תחנה מרכזית פתח תקווה", walkMins: 1, lineId: "red" },
  { name: "זאב אורלוב 41", stationName: "פינסקר", walkMins: 1, lineId: "red" },
  { name: "זאב אורלוב 8", stationName: "קרול", walkMins: 1, lineId: "red" },
  { name: "ז'בוטינסקי 31 פתח תקווה", stationName: "דנקנר", walkMins: 1, lineId: "red" },
  { name: "ז'בוטינסקי 72 פתח תקווה", stationName: "בילינסון", walkMins: 1, lineId: "red" },
  { name: "ז'בוטינסקי 82 פתח תקווה", stationName: "שחם", walkMins: 1, lineId: "red" },
  { name: "ז'בוטינסקי 101 פתח תקווה", stationName: "שנקר", walkMins: 1, lineId: "red" },
  { name: "ז'בוטינסקי 166 בני ברק", stationName: "אהרונוביץ'", walkMins: 1, lineId: "red" },
  { name: "ז'בוטינסקי 117 בני ברק", stationName: "אהרונוביץ'", walkMins: 2, lineId: "red" },
  { name: "ז'בוטינסקי 12 בני ברק", stationName: "בן גוריון", walkMins: 1, lineId: "red" },
  { name: "ז'בוטינסקי 85 רמת גן", stationName: "ביאליק", walkMins: 1, lineId: "red" },
  { name: "ז'בוטינסקי 68 רמת גן", stationName: "ביאליק", walkMins: 2, lineId: "red" },
  { name: "ז'בוטינסקי 5 רמת גן", stationName: "אבא הלל", walkMins: 1, lineId: "red" },
  { name: "מנחם בגין 160", stationName: "ארלוזורוב", walkMins: 1, lineId: "red" },
  { name: "מנחם בגין 125", stationName: "שאול המלך", walkMins: 1, lineId: "red" },
  { name: "מנחם בגין 144", stationName: "שאול המלך", walkMins: 1, lineId: "red" },
  { name: "מנחם בגין 112", stationName: "יהודית", walkMins: 1, lineId: "red" },
  { name: "מנחם בגין 98", stationName: "יהודית", walkMins: 2, lineId: "red" },
  { name: "קרליבך לינקולן", stationName: "קרליבך", walkMins: 1, lineId: "red" },
  { name: "קרליבך מנחם בגין", stationName: "קרליבך", walkMins: 1, lineId: "red" },
  { name: "יהודה הלוי 63", stationName: "אלנבי", walkMins: 1, lineId: "red" },
  { name: "מקווה ישראל 10", stationName: "אלנבי", walkMins: 1, lineId: "red" },
  { name: "שדרות ירושלים 15", stationName: "שלמה (סלמה)", walkMins: 1, lineId: "red" },
  { name: "שדרות ירושלים 42", stationName: "אצטדיון בלומפילד", walkMins: 1, lineId: "red" },
  { name: "שדרות ירושלים 94", stationName: "ארליך", walkMins: 1, lineId: "red" },
  { name: "שדרות ירושלים 120", stationName: "איסקוב", walkMins: 1, lineId: "red" },
  { name: "שדרות ירושלים 146", stationName: "הבעש\"ט", walkMins: 1, lineId: "red" },
  { name: "שדרות ירושלים 210", stationName: "מחרוזת", walkMins: 1, lineId: "red" },
  { name: "שד' העצמאות 69", stationName: "העצמאות", walkMins: 1, lineId: "red" },
  { name: "רוטשילד 17 בת ים", stationName: "רוטשילד", walkMins: 1, lineId: "red" },
  { name: "הרצל 64 בת ים", stationName: "ז'בוטינסקי", walkMins: 1, lineId: "red" },
  { name: "יוספטל 44", stationName: "בלפור", walkMins: 1, lineId: "red" },
  { name: "יוספטל 70", stationName: "בנימין", walkMins: 1, lineId: "red" },
  { name: "יוספטל 82", stationName: "יוספטל", walkMins: 1, lineId: "red" },
  { name: "ניסבאום 48", stationName: "כ\"ט בנובמבר", walkMins: 1, lineId: "red" },
  { name: "ניסבאום 7", stationName: "העמל", walkMins: 1, lineId: "red" },
  { name: "מנחם בגין 4 בת ים", stationName: "הקוממיות", walkMins: 1, lineId: "red" },
];
export function searchAll(query: string): {
  stations: Station[];
  landmarks: (Landmark & { station: Station | undefined })[];
} {
  if (query.length < 2) return { stations: [], landmarks: [] };
  const q = query.trim();
  const seen = new Map<string, Landmark & { station: Station | undefined }>();
  LANDMARKS
    .filter(l => l.name.includes(q))
    .forEach(l => {
      const existing = seen.get(l.name);
      if (!existing || l.walkMins < existing.walkMins) {
        seen.set(l.name, { ...l, station: STATIONS.find(s => s.name === l.stationName) });
      }
    });
  const landmarks = Array.from(seen.values()).slice(0, 5);
  const stations = landmarks.length === 0
    ? STATIONS.filter(s =>
        s.name.includes(q) ||
        s.city.includes(q)
      ).slice(0, 5)
    : [];
  return { stations, landmarks };
}
export function findRoute(fromName: string, toName: string, nextMins?: number, baseDate?: Date): {
  stops: number;
  mins: number;
  next: number;
  direct: boolean;
  lineName: string;
  lineColor: string;
  change?: string;
  departureTime?: string;
  arrivalTime?: string;
} | null {
  const from = STATIONS.find(s => s.name === fromName);
  const to = STATIONS.find(s => s.name === toName);
  if (!from || !to) return null;
  const lineStations = STATIONS.filter(s => s.lineId === "red");
  const fi = lineStations.findIndex(s => s.name === fromName);
  const ti = lineStations.findIndex(s => s.name === toName);
  const stops = Math.abs(ti - fi);
  const travelMins = stops * 2 + Math.round(Math.random() * 3);
  const next = nextMins ?? Math.round(Math.random() * 4) + 1;
  const base = baseDate ?? new Date();
  const depTime = baseDate
    ? new Date(base.getTime())
    : new Date(base.getTime() + next * 60 * 1000);
  const arrTime = new Date(depTime.getTime() + travelMins * 60 * 1000);
  const fmt = (d: Date) => `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
  return {
    stops,
    mins: travelMins,
    next,
    direct: true,
    lineName: "קו אדום",
    lineColor: "#b04050",
    departureTime: fmt(depTime),
    arrivalTime: fmt(arrTime),
  };
}
// ── Schedule Engine ──────────────────────────────────────────────
export type DayType = "weekday" | "friday" | "saturday";
export function getDayType(date: Date): DayType {
  const day = date.getDay();
  if (day === 6) return "saturday";
  if (day === 5) return "friday";
  return "weekday";
}
export function isOperating(date: Date): boolean {
  const dayType = getDayType(date);
  const mins = date.getHours() * 60 + date.getMinutes();
  if (dayType === "saturday") return false;
  if (dayType === "friday") return mins >= 5 * 60 + 30 && mins <= 17 * 60 + 10;
  return mins >= 5 * 60 + 30;
}
export function isSaturdayNight(date: Date): boolean {
  return date.getDay() === 6 && date.getHours() >= 21;
}
export function getFrequencyMins(date: Date): number {
  const hour = date.getHours();
  const isPeak = (hour >= 7 && hour < 9) || (hour >= 16 && hour < 19);
  return isPeak ? 3.5 : 6;
}
export function getNextDepartures(date: Date, count: number = 3): {
  time: string;
  minsFromNow: number;
  label: string;
}[] {
  if (date.getDay() === 6 && date.getHours() < 21) return [];
  if (date.getDay() === 5) {
    const mins = date.getHours() * 60 + date.getMinutes();
    if (mins > 17 * 60 + 10) return [];
  }
  const currentMins = date.getHours() * 60 + date.getMinutes();
  if (currentMins < 5 * 60 + 30 && !isSaturdayNight(date)) return [];
  const frequency = getFrequencyMins(date);
  const departures = [];
  const firstOffset = Math.random() * frequency;
  for (let i = 0; i < count; i++) {
    const offsetMins = firstOffset + i * frequency;
    const depDate = new Date(date.getTime() + offsetMins * 60 * 1000);
    const h = depDate.getHours().toString().padStart(2, "0");
    const m = depDate.getMinutes().toString().padStart(2, "0");
    const minsFromNow = Math.round(offsetMins);
    departures.push({
      time: `${h}:${m}`,
      minsFromNow,
      label: i === 0 ? "הרכבת הקרובה" : i === 1 ? "הרכבת הבאה" : "הרכבת אחריה",
    });
  }
  return departures;
}