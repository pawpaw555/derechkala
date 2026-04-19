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
  { name: "תחנה מרכזית פתח תקווה", lat: 32.0907, lng: 34.8878, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "התחנה המרכזית, פתח תקווה", nearbyPlaces: ["שוק פתח תקווה", "תיאטרון המסילה"] },
  { name: "פינסקר", lat: 32.0882, lng: 34.8838, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב פינסקר, פתח תקווה", nearbyPlaces: ["שוק פתח תקווה", "מתחמי הבילוי גיסין"] },
  { name: "קרול", lat: 32.0857, lng: 34.8800, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב קרול, פתח תקווה", nearbyPlaces: ["גלריית הציפור הכחולה", "פארק תמר בורנשטיין"] },
  { name: "דנקנר", lat: 32.0832, lng: 34.8762, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב דנקנר, פתח תקווה", nearbyPlaces: ["פארק יד לבנים", "מוזיאון האדם והסביבה"] },
  { name: "בילינסון", lat: 32.0938, lng: 34.8720, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "בית חולים בילינסון, פתח תקווה", nearbyPlaces: ["מרכז רפואי רבין", "בית חולים שניידר"] },
  { name: "שחם", lat: 32.0808, lng: 34.8724, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב שחם, פתח תקווה", nearbyPlaces: ["מגדלי בסר", "B.S.R סיטי"] },
  { name: "שנקר", lat: 32.0779, lng: 34.8688, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב שנקר, פתח תקווה", nearbyPlaces: ["מכללת שנקר", "פארקטק קריית אריה"] },
  { name: "קריית אריה", lat: 32.0748, lng: 34.8652, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "קריית אריה, פתח תקווה", nearbyPlaces: ["אצטדיון שלמה ביטוח", "מסלול ירקון פתח תקווה"] },

  // ── קו אדום — בני ברק ───────────────────────────────
  { name: "גשר אם המושבות", lat: 32.0712, lng: 34.8598, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בני ברק", address: "גשר אם המושבות, בני ברק", nearbyPlaces: ["אזור תעשייה קריית אריה", "שכונת קריית הרצוג"] },
  { name: "אהרונוביץ'", lat: 32.0688, lng: 34.8554, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בני ברק", address: "רחוב אהרונוביץ', בני ברק", nearbyPlaces: ["לשכת האוכלוסין", "מגדלי שקל"] },

  // ── קו אדום — רמת גן ────────────────────────────────
  { name: "בן גוריון", lat: 32.0652, lng: 34.8508, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "רמת גן", address: "שדרות בן גוריון, רמת גן", nearbyPlaces: ["בית המשפט לעניינים מקומיים", "מגדלי B.S.R"] },
  { name: "ביאליק", lat: 32.0618, lng: 34.8462, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "רמת גן", address: "רחוב ביאליק, רמת גן", nearbyPlaces: ["קניון ביאליק", "כיכר רמב\"ם"] },
  { name: "אבא הלל", lat: 32.0584, lng: 34.8418, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "רמת גן", address: "רחוב אבא הלל, רמת גן", nearbyPlaces: ["בורסת היהלומים", "מגדל משה אביב"] },

  // ── קו אדום — תל אביב ───────────────────────────────
  { name: "ארלוזורוב", lat: 32.0548, lng: 34.8368, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב ארלוזורוב, תל אביב", nearbyPlaces: ["תחנת רכבת סבידור מרכז", "מסוף 2000"] },
  { name: "שאול המלך", lat: 32.0518, lng: 34.8328, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "שדרות שאול המלך, תל אביב", nearbyPlaces: ["מרכז עזריאלי", "בית חולים איכילוב"] },
  { name: "יהודית", lat: 32.0488, lng: 34.8288, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "שדרות יהודית, תל אביב", nearbyPlaces: ["מתחם שרונה", "קריית הממשלה"] },
  { name: "קרליבך", lat: 32.0458, lng: 34.8248, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב קרליבך, תל אביב", nearbyPlaces: ["קניון TLV", "מגדל אקרו"] },
  { name: "אלנבי", lat: 32.0428, lng: 34.8208, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב אלנבי, תל אביב", nearbyPlaces: ["שדרות רוטשילד", "שוק הכרמל"] },
  { name: "אליפלט", lat: 32.0398, lng: 34.8168, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב אליפלט, תל אביב", nearbyPlaces: ["מתחם התחנה", "פארק המסילה"] },
  { name: "שלמה (סלמה)", lat: 32.0368, lng: 34.8128, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב שלמה, תל אביב", nearbyPlaces: ["יפו העתיקה", "תיאטרון גשר"] },
  { name: "אצטדיון בלומפילד", lat: 32.0338, lng: 34.8088, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "אצטדיון בלומפילד, תל אביב", nearbyPlaces: ["אצטדיון בלומפילד", "שוק הפשפשים"] },
  { name: "ארליך", lat: 32.0308, lng: 34.8048, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב ארליך, תל אביב", nearbyPlaces: ["המכללה האקדמית תל אביב יפו"] },
  { name: "איסקוב", lat: 32.0278, lng: 34.8008, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב איסקוב, תל אביב", nearbyPlaces: ["קריית חינוך יפו"] },
  { name: "הבעש\"ט", lat: 32.0248, lng: 34.7968, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב הבעש\"ט, תל אביב", nearbyPlaces: ["בית חולים וולפסון", "מרכז הטניס יפו"] },
  { name: "מחרוזת", lat: 32.0218, lng: 34.7928, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב מחרוזת, תל אביב", nearbyPlaces: ["שכונת עג'מי"] },

  // ── קו אדום — בת ים ─────────────────────────────────
  { name: "העצמאות", lat: 32.0188, lng: 34.7888, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב העצמאות, בת ים", nearbyPlaces: ["מרכז העיר בת ים", "כיכר המגינים"] },
  { name: "רוטשילד", lat: 32.0158, lng: 34.7848, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב רוטשילד, בת ים", nearbyPlaces: ["מרכז העיר", "חוף הים בת ים"] },
  { name: "ז'בוטינסקי", lat: 32.0128, lng: 34.7808, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב ז'בוטינסקי, בת ים", nearbyPlaces: ["חוף הים בת ים"] },
  { name: "בלפור", lat: 32.0098, lng: 34.7768, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב בלפור, בת ים", nearbyPlaces: ["עיריית בת ים"] },
  { name: "בנימין", lat: 32.0068, lng: 34.7728, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב בנימין, בת ים", nearbyPlaces: ["ספריית בת ים", "גן שעשועים ירושלמי"] },
  { name: "יוספטל", lat: 32.0038, lng: 34.7688, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב יוספטל, בת ים", nearbyPlaces: ["קניון בת ים"] },
  { name: "כ\"ט בנובמבר", lat: 32.0008, lng: 34.7648, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב כ\"ט בנובמבר, בת ים", nearbyPlaces: ["קניון בת ימון", "אזור תעשייה"] },
  { name: "העמל", lat: 31.9978, lng: 34.7608, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב העמל, בת ים", nearbyPlaces: ["בית משפט השלום בת ים", "בית הדין לעבודה"] },
  { name: "הקוממיות", lat: 31.9948, lng: 34.7568, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב הקוממיות, בת ים", nearbyPlaces: ["אצטדיון בת ים", "קאנטרי בת ים"] },
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
  { name: "בית חולים וולפסון", stationName: 'הבעש"ט', walkMins: 4, lineId: "red" },

  // יוספטל
  { name: "קניון בת ים", stationName: "יוספטל", walkMins: 5, lineId: "red" },

  // בלפור
  { name: "עיריית בת ים", stationName: "בלפור", walkMins: 4, lineId: "red" },

  // הקוממיות
  { name: "אצטדיון בת ים", stationName: "הקוממיות", walkMins: 5, lineId: "red" },
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

export function findRoute(fromName: string, toName: string): {
  stops: number;
  mins: number;
  next: number;
  direct: boolean;
  lineName: string;
  lineColor: string;
  change?: string;
} | null {
  const from = STATIONS.find(s => s.name === fromName);
  const to = STATIONS.find(s => s.name === toName);
  if (!from || !to) return null;

  const lineStations = STATIONS.filter(s => s.lineId === "red");
  const fi = lineStations.findIndex(s => s.name === fromName);
  const ti = lineStations.findIndex(s => s.name === toName);
  const stops = Math.abs(ti - fi);

  return {
    stops,
    mins: stops * 2 + Math.round(Math.random() * 3),
    next: Math.round(Math.random() * 4) + 1,
    direct: true,
    lineName: "קו אדום",
    lineColor: "#b04050",
  };
}