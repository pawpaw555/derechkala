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
  { name: "תחנה מרכזית פתח תקווה", lat: 32.0947, lng: 34.8868, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "התחנה המרכזית, פתח תקווה", nearbyPlaces: ["תיאטרון המסילה"] },
  { name: "פינסקר", lat: 32.0938, lng: 34.8825, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב פינסקר, פתח תקווה", nearbyPlaces: ["שוק פתח תקווה", "מתחמי הבילוי גיסין"] },
  { name: "קרול", lat: 32.0917, lng: 34.8772, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב קרול, פתח תקווה", nearbyPlaces: ["גלריית הציפור הכחולה", "פארק תמר בורנשטיין"] },
  { name: "דנקנר", lat: 32.0910, lng: 34.8718, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב דנקנר, פתח תקווה", nearbyPlaces: ["פארק יד לבנים", "מוזיאון האדם והסביבה"] },
  { name: "בילינסון", lat: 32.0915, lng: 34.8664, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "בית חולים בילינסון, פתח תקווה", nearbyPlaces: ["בית חולים בילינסון", "בית חולים שניידר"] },
  { name: "שחם", lat: 32.0919, lng: 34.8614, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב שחם, פתח תקווה", nearbyPlaces: ["מגדלי בסר פתח תקווה", "B.S.R סיטי"] },
  // התחנה קרויה על שם רחוב אריה שנקר, התעשיין. מכללת שנקר הופיעה כאן
  // כמקום סמוך — היא ברמת גן, 4.8 ק"מ מכאן, והתחנה הקרובה לה היא אבא הלל.
  // אזור התעשייה קריית אריה אומת ב-510 מ' מהתחנה.
  { name: "שנקר", lat: 32.0926, lng: 34.8536, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "רחוב שנקר, פתח תקווה", nearbyPlaces: ["פארקטק קריית אריה"] },
  { name: "קריית אריה", lat: 32.1062, lng: 34.8617, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", address: "קריית אריה, פתח תקווה", nearbyPlaces: ["אצטדיון שלמה ביטוח", "מסלול ירקון פתח תקווה"] },
  // ── קו אדום — בני ברק ───────────────────────────────
  { name: "גשר אם המושבות", lat: 32.0993, lng: 34.8464, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בני ברק", address: "גשר אם המושבות, בני ברק", nearbyPlaces: ["אזור תעשייה קריית אריה", "שכונת קריית הרצוג"] },
  { name: "אהרונוביץ'", lat: 32.0927, lng: 34.8382, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בני ברק", address: "רחוב אהרונוביץ', בני ברק", nearbyPlaces: ["לשכת האוכלוסין וההגירה", "מגדלי שקל"] },
  // ── קו אדום — רמת גן ────────────────────────────────
  // העיר אומתה מול שני מקורות: OSM מחזיר "תל גיבורים, בני ברק" לקואורדינטה
  // הזו, ו-Google מציג "בני ברק" לתחנה. קודם היה כאן "רמת גן", כך שכותרת
  // העמוד אמרה רמת גן בזמן שגוף העמוד אמר בני ברק.
  { name: "בן גוריון", lat: 32.0908, lng: 34.8229, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בני ברק", address: "שדרות בן גוריון, רמת גן", nearbyPlaces: ["בית המשפט לעניינים מקומיים", "מגדלי B.S.R"] },
  { name: "ביאליק", lat: 32.0864, lng: 34.8115, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "רמת גן", address: "רחוב ביאליק, רמת גן", nearbyPlaces: ["קניון ביאליק", "כיכר רמב\"ם"] },
  { name: "אבא הלל", lat: 32.0829, lng: 34.8030, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "רמת גן", address: "רחוב אבא הלל, רמת גן", nearbyPlaces: ["בורסת היהלומים", "מגדל משה אביב"] },
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
  { name: "איסקוב", lat: 32.0419, lng: 34.7569, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב איסקוב, תל אביב", nearbyPlaces: ["קריית חינוך יפו, עירוני ז׳"] },
  { name: "הבעש\"ט", lat: 32.0384, lng: 34.7556, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב הבעש\"ט, תל אביב", nearbyPlaces: ["בית חולים וולפסון", "מרכז הטניס יפו"] },
  { name: "מחרוזת", lat: 32.0333, lng: 34.7515, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", address: "רחוב מחרוזת, תל אביב", nearbyPlaces: ["שכונת עג'מי"] },
  // ── קו אדום — בת ים ─────────────────────────────────
  { name: "העצמאות", lat: 32.0279, lng: 34.7488, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב העצמאות, בת ים", nearbyPlaces: ["מרכז העיר בת ים", "כיכר המגינים (המצבה)"] },
  { name: "רוטשילד", lat: 32.0267, lng: 34.7441, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", address: "רחוב רוטשילד, בת ים", nearbyPlaces: ["מרכז העיר בת ים", "חוף הים בת ים"] },
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
  // אומת ב-Nominatim: השוק נמצא 667 מ' מהתחנה המרכזית ו-387 מ' מפינסקר.
  // ארבע הדקות שהוצהרו כאן התאימו למרחק שגוי ולתחנה שגויה.
  { name: "שוק פתח תקווה", stationName: "פינסקר", walkMins: 5, lineId: "red" },
  { name: "תיאטרון המסילה", stationName: "תחנה מרכזית פתח תקווה", walkMins: 6, lineId: "red" },
  // פינסקר
  { name: "מתחמי הבילוי גיסין", stationName: "פינסקר", walkMins: 5, lineId: "red" },
  // דנקנר
  { name: "פארק יד לבנים פתח תקווה", stationName: "דנקנר", walkMins: 4, lineId: "red" },
  { name: "מוזיאון האדם והסביבה", stationName: "דנקנר", walkMins: 5, lineId: "red" },
  // בילינסון
  { name: "בית חולים בילינסון", stationName: "בילינסון", walkMins: 3, lineId: "red" },
  // הוסר: "מרכז רפואי רבין" הוא שמו הרשמי של בית חולים בילינסון. שתי
  // הרשומות גיאוקודו לאותה נקודה בדיוק, 33 מ' מהתחנה, אבל הצהירו 3 ו-4
  // דקות — אותו מקום הופיע פעמיים באותו כרטיס עם שני זמנים.
  { name: "בית חולים שניידר", stationName: "בילינסון", walkMins: 5, lineId: "red" },
  // שחם
  { name: "B.S.R סיטי", stationName: "שחם", walkMins: 4, lineId: "red" },
  // שנקר
  // הוסר: "מכללת שנקר, תחנת שנקר, 3 דקות". המכללה ברמת גן ברחוב אנה פרנק,
  // 4.8 ק"מ מתחנת שנקר שבפתח תקווה — כשעה הליכה, לא שלוש דקות. השיוך הנכון
  // הוא לאבא הלל, והוא יושב ב-places.ts עם קואורדינטה מאומתת.
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
/**
 * מקלדת עברית ותיקון אוטומטי באייפון מייצרים גרש (U+05F3) וגרשיים
 * (U+05F4) טיפוגרפיים, בעוד שמות התחנות בקובץ כתובים באפוסטרוף ובמרכאות
 * של ASCII. בלי הנרמול הזה ארבע תחנות — ז'בוטינסקי, אהרונוביץ', הבעש"ט
 * וכ"ט בנובמבר — החזירו אפס תוצאות למי שהקליד אותן כרגיל.
 */
export function normalizeHebrew(s: string): string {
  return s
    .replace(/[\u05F3\u2018\u2019\u02BC\u00B4]/g, "'")
    .replace(/[\u05F4\u201C\u201D]/g, '"')
    .replace(/[\u05B0-\u05C7]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchAll(query: string): {
  stations: Station[];
  landmarks: (Landmark & { station: Station | undefined })[];
  /** כמה תוצאות נחתכו מעבר לחמש — כדי שהממשק יוכל לומר שיש עוד. */
  hiddenCount: number;
} {
  // "תחנת שנקר" הוא ניסוח טבעי לחיפוש תחנה, אבל אף תחנה לא נקראת כך.
  // בלי הקילוף הזה החיפוש החזיר נקודת ציון ולא את התחנה שהתבקשה.
  const q = normalizeHebrew(query).replace(/^תחנת\s+/, "");
  // הבדיקה חייבת לבוא אחרי הנרמול: קודם היא בדקה את המחרוזת הגולמית,
  // כך ש-"  " עבר אותה והפך למחרוזת ריקה שכל שם מכיל.
  if (q.length < 2) return { stations: [], landmarks: [], hiddenCount: 0 };
  const norm = (x: string) => normalizeHebrew(x);
  const seen = new Map<string, Landmark & { station: Station | undefined }>();
  LANDMARKS
    .filter(l => norm(l.name).includes(q))
    .forEach(l => {
      const existing = seen.get(l.name);
      if (!existing || l.walkMins < existing.walkMins) {
        seen.set(l.name, { ...l, station: STATIONS.find(s => s.name === l.stationName) });
      }
    });
  const allLandmarks = Array.from(seen.values());
  const landmarks = allLandmarks.slice(0, 5);
  // Both lists are always computed. Previously a landmark match returned an
  // empty stations array, which hid a station from a search for its own name
  // whenever a landmark shared the string (e.g. "יוספטל", "רוטשילד").
  const rank = (s: Station) => {
    const n = norm(s.name);
    if (n === q) return 0;
    if (n.startsWith(q)) return 1;
    if (n.includes(q)) return 2;
    return 3;
  };
  const allStations = STATIONS
    .filter(s => norm(s.name).includes(q) || norm(s.city).includes(q))
    .sort((a, b) => rank(a) - rank(b));
  const stations = allStations.slice(0, 5);
  // חיפוש "בת ים" מחזיר יותר מחמש תחנות, והחיתוך השקט הסתיר חלק מהעיר.
  // הספירה מאפשרת לממשק לומר שיש עוד.
  const hiddenCount = (allStations.length - stations.length) + (allLandmarks.length - landmarks.length);
  return { stations, landmarks, hiddenCount };
}
/** זמן הנסיעה לפי מספר התחנות. מקור יחיד — גם לתכנון קדימה וגם אחורה. */
export function travelMinutes(stops: number): number {
  return stops * 2;
}

/**
 * הקו האדום אינו שרשרת אחת אלא Y. אומת מול יחסי המסלול ב-OSM:
 * relation 2224880 (R1, 32 תחנות) עובר באהרונוביץ' → שנקר → שחם → פתח
 * תקווה, ו-relation 16224901 (R2, 27 תחנות) עובר קריית אריה → גשר אם
 * המושבות → אהרונוביץ'. אהרונוביץ' היא הצומת.
 *
 * קודם לכן המרחק נמדד לפי הפרש מיקומים במערך STATIONS, שהוא שטוח. נסיעה
 * מקריית אריה לתחנה המרכזית בפתח תקווה דווחה כ-7 תחנות ישיר, בעוד שבפועל
 * היא 9 תחנות עם החלפה.
 */
const JUNCTION = "אהרונוביץ'";
/** מהצומת צפונה לכיוון פתח תקווה (שירות R1). */
const BRANCH_PT = ["שנקר", "שחם", "בילינסון", "דנקנר", "קרול", "פינסקר", "תחנה מרכזית פתח תקווה"];
/** מהצומת צפונה לכיוון קריית אריה (שירות R2/R3). */
const BRANCH_KA = ["גשר אם המושבות", "קריית אריה"];

type Leg = { branch: "pt" | "ka" | "trunk"; index: number };

function locate(name: string): Leg | null {
  const pt = BRANCH_PT.indexOf(name);
  if (pt >= 0) return { branch: "pt", index: pt };
  const ka = BRANCH_KA.indexOf(name);
  if (ka >= 0) return { branch: "ka", index: ka };
  const trunk = STATIONS.filter(s => s.lineId === "red")
    .map(s => s.name)
    .filter(n => !BRANCH_PT.includes(n) && !BRANCH_KA.includes(n));
  const t = trunk.indexOf(name);
  return t >= 0 ? { branch: "trunk", index: t } : null;
}

/** מספר התחנות בין שתיים, ואם נדרשת החלפה בצומת. */
export function countStops(fromName: string, toName: string): { stops: number; change: string | null } | null {
  const a = locate(fromName), b = locate(toName);
  if (!a || !b) return null;
  if (a.branch === b.branch) return { stops: Math.abs(a.index - b.index), change: null };
  // ענף מול ענף — חייבים לעבור דרך הצומת ולהחליף שירות.
  if (a.branch !== "trunk" && b.branch !== "trunk")
    return { stops: a.index + 1 + b.index + 1, change: JUNCTION };
  // ענף מול הגזע: הצומת היא תחנה 0 בגזע.
  const branchLeg = a.branch === "trunk" ? b : a;
  const trunkLeg = a.branch === "trunk" ? a : b;
  return { stops: branchLeg.index + 1 + trunkLeg.index, change: null };
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
} | NoService | null {
  const from = STATIONS.find(s => s.name === fromName);
  const to = STATIONS.find(s => s.name === toName);
  if (!from || !to) return null;
  const counted = countStops(fromName, toName);
  if (!counted) return null;
  const stops = counted.stops;
  // קודם לכן היו כאן שתי הגרלות: תוספת של 0 עד 3 דקות לזמן הנסיעה, ועוד
  // 1 עד 5 דקות המתנה כשלא נמסרה. אותו חיפוש החזיר תשובה אחרת בכל פעם,
  // והמספרים התגלגלו מחדש בכל רינדור.
  const travelMins = travelMinutes(stops);
  const base = baseDate ?? new Date();
  // כשהקורא לא מסר זמן המתנה זה אומר שלא נמצאה יציאה — שואלים ישירות
  // במקום להניח אפס. בלי זה, ב-23:58 הרשימה אמרה "אין יציאות" והכרטיס
  // אמר "יציאה 23:58" באותו מסך.
  const nextFound = nextMins ?? getNextDepartures(base, 1)[0]?.minsFromNow;
  if (nextFound === undefined) return { noService: true, reason: describeNoService(base) };
  const next = nextFound;
  // שעת היציאה היא של הרכבת, לא של רגע הלחיצה. קודם לכן כש-baseDate נמסר —
  // ושני הקוראים תמיד מוסרים אותו — ההמתנה נזרקה, והכרטיס הציג "יציאה 09:00"
  // מעל רשימה שאמרה שהרכבת הראשונה ב-09:04.
  const depTime = new Date(base.getTime() + next * 60 * 1000);
  // שעת היציאה היא הנקודה שקובעת, לא השעה שבה נלחץ הכפתור: בערב שבת
  // ב-15:38 הרכבת הבאה בעוד 4 דקות כבר מעבר לרכבת האחרונה.
  if (!isOperating(depTime)) return { noService: true, reason: describeNoService(depTime) };
  const arrTime = new Date(depTime.getTime() + travelMins * 60 * 1000);
  const fmt = (d: Date) => `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
  return {
    stops,
    mins: travelMins,
    next,
    direct: counted.change === null,
    change: counted.change ?? undefined,
    lineName: "קו אדום",
    lineColor: "#b04050",
    departureTime: fmt(depTime),
    arrivalTime: fmt(arrTime),
  };
}
// ── Nearest station ──────────────────────────────────────────────
// מעלת אורך קצרה ממעלת רוחב בקו הרוחב של גוש דן (32°), ולכן אי אפשר
// להשוות הפרשי מעלות ישירות. הפונקציה ממירה למטרים לפני ההשוואה.
const M_PER_DEG_LAT = 110_900;
const M_PER_DEG_LNG = 94_400;

// מרחק אמיתי במטרים בין שתי נקודות (haversine).
export function distanceMetres(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(metres: number): string {
  return metres < 1000
    ? `${Math.round(metres / 10) * 10} מ׳`
    : `${(metres / 1000).toFixed(1)} ק״מ`;
}

// קצב הליכה ממוצע 80 מ' לדקה, מעוגל כלפי מעלה למינימום דקה.
export function walkMinutes(metres: number): number {
  return Math.max(1, Math.round(metres / 80));
}

export function findNearestStation(lat: number, lng: number): Station {
  let best = STATIONS[0];
  let bestDist = Infinity;
  for (const s of STATIONS) {
    const d = Math.hypot((s.lat - lat) * M_PER_DEG_LAT, (s.lng - lng) * M_PER_DEG_LNG);
    if (d < bestDist) { bestDist = d; best = s; }
  }
  return best;
}

// ── Related stations (internal linking) ──────────────────────────
// Other stations in the same city, excluding the station itself and its
// line neighbours (those already get their own links). Tops up from the
// nearest stations along the line when a city cannot supply enough.
export function getRelatedStations(
  stationName: string,
  exclude: (string | null)[] = [],
  count: number = 3,
): { stations: Station[]; sameCityOnly: boolean } {
  const self = STATIONS.find(s => s.name === stationName);
  if (!self) return { stations: [], sameCityOnly: true };

  const blocked = new Set([stationName, ...exclude.filter((n): n is string => !!n)]);
  const sameCity = STATIONS.filter(s => s.city === self.city && !blocked.has(s.name));
  const picked = sameCity.slice(0, count);

  if (picked.length < count) {
    const selfIdx = STATIONS.findIndex(s => s.name === stationName);
    const byDistance = STATIONS
      .map((s, i) => ({ s, d: Math.abs(i - selfIdx) }))
      .filter(({ s }) => !blocked.has(s.name) && !picked.some(p => p.name === s.name))
      .sort((a, b) => a.d - b.d)
      .map(({ s }) => s);
    picked.push(...byDistance.slice(0, count - picked.length));
  }

  // Only claim "same city" in the heading if every pick actually is.
  const sameCityOnly = picked.length > 0 && picked.every(s => s.city === self.city);
  return { stations: picked, sameCityOnly };
}

// ── Schedule Engine ──────────────────────────────────────────────
export type DayType = "weekday" | "friday" | "saturday";
export function getDayType(date: Date): DayType {
  const day = date.getDay();
  if (day === 6) return "saturday";
  if (day === 5) return "friday";
  return "weekday";
}
// שעות לפי לוח הזמנים הרשמי של דנקל (שירות R1):
// א'–ה' 05:30 עד חצות, שישי וערבי חג 05:30 עד 15:40, מוצ"ש מ-19:45.
export const FRIDAY_LAST_MINS = 15 * 60 + 40;
export const SATURDAY_NIGHT_FIRST_MINS = 19 * 60 + 45;
export const SERVICE_FIRST_MINS = 5 * 60 + 30;

/**
 * כשאין שירות בזמן המבוקש, findRoute מחזירה את זה במקום לוח זמנים.
 * קודם לכן היא התעלמה משעות הפעילות לחלוטין: בשבת ב-10:00 היא החזירה
 * "יציאה 10:00, הגעה 10:12", והכרטיס הוצג בלי שום אזהרה.
 */
export type NoService = { noService: true; reason: string };

const hhmm = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function describeNoService(date: Date): string {
  const t = getDayType(date);
  const mins = date.getHours() * 60 + date.getMinutes();
  if (t === "saturday" && mins < SATURDAY_NIGHT_FIRST_MINS)
    return `הרכבת אינה פועלת בשבת. השירות מתחדש במוצאי שבת ב-${hhmm(SATURDAY_NIGHT_FIRST_MINS)}.`;
  if (t === "friday" && mins > FRIDAY_LAST_MINS)
    return `בערב שבת הרכבת האחרונה יוצאת ב-${hhmm(FRIDAY_LAST_MINS)}. השירות מתחדש במוצאי שבת ב-${hhmm(SATURDAY_NIGHT_FIRST_MINS)}.`;
  if (mins < SERVICE_FIRST_MINS)
    return `הרכבת מתחילה לפעול ב-${hhmm(SERVICE_FIRST_MINS)}.`;
  // נשארנו בתוך שעות השירות אבל אין עוד יציאה היום — כלומר הרכבת
  // האחרונה כבר יצאה, והבאה היא כבר מחר.
  return `הרכבת האחרונה להיום כבר יצאה. השירות מתחדש מחר ב-${hhmm(SERVICE_FIRST_MINS)}.`;
}

export function isOperating(date: Date): boolean {
  const dayType = getDayType(date);
  const mins = date.getHours() * 60 + date.getMinutes();
  if (dayType === "saturday") return mins >= SATURDAY_NIGHT_FIRST_MINS;
  if (dayType === "friday") return mins >= SERVICE_FIRST_MINS && mins <= FRIDAY_LAST_MINS;
  return mins >= SERVICE_FIRST_MINS;
}
export function isSaturdayNight(date: Date): boolean {
  return date.getDay() === 6 && date.getHours() * 60 + date.getMinutes() >= SATURDAY_NIGHT_FIRST_MINS;
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
  if (date.getDay() === 6 && date.getHours() * 60 + date.getMinutes() < SATURDAY_NIGHT_FIRST_MINS) return [];
  if (date.getDay() === 5) {
    const mins = date.getHours() * 60 + date.getMinutes();
    if (mins > FRIDAY_LAST_MINS) return [];
  }
  const currentMins = date.getHours() * 60 + date.getMinutes();
  if (currentMins < SERVICE_FIRST_MINS && !isSaturdayNight(date)) return [];
  const frequency = getFrequencyMins(date);
  const departures = [];
  // הרכבות נעות בתדירות קבועה מתחילת השירות. גזירת ההיסט מהשעון נותנת
  // אותה תשובה לאותה דקה, במקום ההגרלה שהייתה כאן וייצרה זמנים שונים
  // בכל טעינה מחדש של אותו עמוד.
  const cadenceStart = isSaturdayNight(date) ? SATURDAY_NIGHT_FIRST_MINS : SERVICE_FIRST_MINS;
  const elapsed = currentMins - cadenceStart;
  const firstOffset = elapsed < 0 ? -elapsed : (frequency - (elapsed % frequency)) % frequency;
  for (let i = 0; i < count; i++) {
    const offsetMins = firstOffset + i * frequency;
    const depDate = new Date(date.getTime() + offsetMins * 60 * 1000);
    // בלי החסם הזה הרשימה המציאה יציאות אחרי סוף השירות — 00:04 בלילה,
    // או 15:46 בערב שבת, שש דקות אחרי הרכבת האחרונה.
    if (!isOperating(depDate)) break;
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

/** מבדיל בין תוצאת מסלול להודעת "אין שירות". */
export function isNoService(r: unknown): r is NoService {
  return !!r && typeof r === "object" && "noService" in (r as object);
}

/**
 * תכנון לפי שעת הגעה מבוקשת.
 *
 * קודם לכן כל קורא חישב זאת בעצמו: הפחית `stops * 2 + 2` משעת ההגעה ולקח
 * את היציאה הראשונה אחרי הנקודה הזו. שתי טעויות. ראשית, ספירת התחנות
 * נעשתה לפי הפרש מיקומים במערך השטוח, שמתעלם מהענף. שנית, ה-2 הקבוע לא
 * מכסה את ההמתנה לרכבת: findRoute מוסיפה אותה אחר כך, ולכן ההגעה יצאה
 * `מבוקש − 2 + המתנה` — עד שלוש דקות אחרי מה שהמשתמש ביקש.
 *
 * כאן מחפשים אחורה מרווח מלא ובוחרים את היציאה המאוחרת ביותר שעדיין
 * מגיעה בזמן, כך שזהו בדיוק ההפך של התכנון קדימה.
 */
export function findRouteByArrival(
  fromName: string,
  toName: string,
  arriveBy: Date
): ReturnType<typeof findRoute> {
  const counted = countStops(fromName, toName);
  if (!counted) return null;
  const travel = travelMinutes(counted.stops);
  const headway = getFrequencyMins(arriveBy);
  const searchFrom = new Date(arriveBy.getTime() - (travel + headway + 2) * 60 * 1000);

  // getNextDepartures מחזיר רשימה ריקה כשנקודת החיפוש לפני פתיחת השירות,
  // כי בשאלה "מתי הרכבת הבאה" אין תשובה ב-04:00. כאן השאלה אחרת: מהי
  // הרכבת הראשונה שאפשר לתפוס. בלי ההצמדה הזו בקשה להגיע ב-05:45 חיפשה
  // מ-05:27, קיבלה ריק, וענתה שאין שירות — למרות שהרכבת הראשונה ב-05:30
  // מגיעה בזמן.
  const dayOpens = getDayType(arriveBy) === "saturday" ? SATURDAY_NIGHT_FIRST_MINS : SERVICE_FIRST_MINS;
  if (
    searchFrom.toDateString() === arriveBy.toDateString() &&
    searchFrom.getHours() * 60 + searchFrom.getMinutes() < dayOpens
  ) {
    searchFrom.setHours(Math.floor(dayOpens / 60), dayOpens % 60, 0, 0);
  }
  // אם אחרי ההצמדה נקודת החיפוש כבר מאוחרת מהשעה המבוקשת, אין מה לחפש:
  // בשבת ב-10:00 ההצמדה דוחפת ל-19:45, וההסבר הנכון הוא שאין שירות בשבת
  // ולא "הרכבת הראשונה יוצאת ב-19:45".
  if (searchFrom.getTime() >= arriveBy.getTime()) {
    return { noService: true, reason: describeNoService(arriveBy) };
  }

  const candidates = getNextDepartures(searchFrom, 8);
  const inTime = candidates.filter(
    d => searchFrom.getTime() + (d.minsFromNow + travel) * 60 * 1000 <= arriveBy.getTime()
  );
  if (!inTime.length) {
    // ההסבר חייב להיות על מה שהמשתמש ביקש, לא על נקודת החיפוש הפנימית.
    // קודם לכן בקשה להגיע ב-05:35 ענתה "הרכבת מתחילה לפעול ב-05:30",
    // משפט שנשמע כאילו ביקשו מוקדם מדי — בעוד שהבעיה היא שהרכבת
    // הראשונה יוצאת ב-05:30 והנסיעה אורכת כ-10 דקות.
    const first = getNextDepartures(searchFrom, 1)[0];
    if (first) {
      const arrival = new Date(searchFrom.getTime() + (first.minsFromNow + travel) * 60 * 1000);
      return {
        noService: true,
        reason: `הנסיעה אורכת כ-${travel} דקות, והרכבת הראשונה שאפשר לתפוס יוצאת ב-${first.time}. ההגעה המוקדמת ביותר היא ${hhmm(arrival.getHours() * 60 + arrival.getMinutes())}.`,
      };
    }
    return { noService: true, reason: describeNoService(arriveBy) };
  }
  const chosen = inTime[inTime.length - 1];
  return findRoute(fromName, toName, chosen.minsFromNow, searchFrom);
}
