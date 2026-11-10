export type Station = {
  name: string;
  lat: number;
  lng: number;
  lineId: "red" | "green" | "purple";
  lineName: string;
  lineColor: string;
  lineHref: string;
  city: string;
  nearbyPlaces: string[];
};
export type Landmark = {
  name: string;
  stationName: string;
  /**
   * נכתב ביד, ונשאר כך בהכרעת בעל האתר ב-10.11.2026. ל-59 מהרשומות יש
   * עכשיו קואורדינטה עם מקור, ולכן **אפשר** לגזור את הזמן מהמנתב —
   * ובילינסון הוא הראיה שאסור: שני מקורות מסכימים על הקואורדינטה, והיא
   * מרכז הקמפוס, ולכן המסלול הוא 1503 מ׳ מול 263 מ׳ אוויריים (יחס 5.71,
   * מתחת לסף MAX_WALK_DETOUR) — כלומר 19 דקות להליכה של 3. אל תחליף את
   * המספר בנגזר בלי לפתור את הקמפוסים. seo-data/open-items.md, הכרעת 10.11
   *
   * **חריג אחד, מאותו יום:** תיאטרון המסילה. שם השיוך לתחנה עצמו היה
   * שגוי, ולכן 6 הדקות נמדדו מתחנה שאינה שלו — ערך כתוב ביד שאין לו
   * מה לשמר. הוא הועבר לפינסקר וקיבל את 7 הדקות מהמנתב. סעיף טז.
   */
  walkMins: number;
  lineId: "red" | "green" | "purple";
  /** קואורדינטה שיש לה מקור. נעדרת = לא הוכרעה; seo-data/landmark-coords.md */
  lat?: number;
  lng?: number;
  coordSource?: string;
  coordVerification?: "two" | "single" | "address";
};
export const STATIONS: Station[] = [
  // ── קו אדום — פתח תקווה ──────────────────────────────
  { name: "תחנה מרכזית פתח תקווה", lat: 32.0947, lng: 34.8868, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", nearbyPlaces: [] },
  { name: "פינסקר", lat: 32.0938, lng: 34.8825, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", nearbyPlaces: ["שוק פתח תקווה", "מתחמי הבילוי גיסין", "תיאטרון המסילה"] },
  { name: "קרול", lat: 32.0917, lng: 34.8772, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", nearbyPlaces: ["גלריית הציפור הכחולה", "פארק תמר בורנשטיין"] },
  { name: "דנקנר", lat: 32.0910, lng: 34.8718, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", nearbyPlaces: ["פארק יד לבנים", "מוזיאון האדם והסביבה"] },
  { name: "בילינסון", lat: 32.0915, lng: 34.8664, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", nearbyPlaces: ["בית חולים בילינסון", "בית חולים שניידר"] },
  { name: "שחם", lat: 32.0919, lng: 34.8614, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", nearbyPlaces: ["מגדלי בסר פתח תקווה", "B.S.R סיטי"] },
  // התחנה קרויה על שם רחוב אריה שנקר, התעשיין. מכללת שנקר הופיעה כאן
  // כמקום סמוך — היא ברמת גן, 4.8 ק"מ מכאן, והתחנה הקרובה לה היא אבא הלל.
  // אזור התעשייה קריית אריה אומת ב-510 מ' מהתחנה.
  { name: "שנקר", lat: 32.0926, lng: 34.8536, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", nearbyPlaces: ["פארקטק קריית אריה"] },
  { name: "קריית אריה", lat: 32.1062, lng: 34.8617, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "פתח תקווה", nearbyPlaces: ["אצטדיון שלמה ביטוח", "מסלול ירקון פתח תקווה"] },
  // ── קו אדום — בני ברק ───────────────────────────────
  { name: "גשר אם המושבות", lat: 32.0993, lng: 34.8464, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בני ברק", nearbyPlaces: ["אזור תעשייה קריית אריה", "שכונת קריית הרצוג"] },
  { name: "אהרונוביץ'", lat: 32.0927, lng: 34.8382, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בני ברק", nearbyPlaces: ["לשכת האוכלוסין וההגירה", "מגדלי שקל"] },
  // ── קו אדום — רמת גן ────────────────────────────────
  // העיר אומתה מול שני מקורות: OSM מחזיר "תל גיבורים, בני ברק" לקואורדינטה
  // הזו, ו-Google מציג "בני ברק" לתחנה. קודם היה כאן "רמת גן", כך שכותרת
  // העמוד אמרה רמת גן בזמן שגוף העמוד אמר בני ברק.
  { name: "בן גוריון", lat: 32.0908, lng: 34.8229, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בני ברק", nearbyPlaces: ["בית המשפט לעניינים מקומיים", "מגדלי B.S.R"] },
  { name: "ביאליק", lat: 32.0864, lng: 34.8115, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "רמת גן", nearbyPlaces: ["קניון ביאליק", "כיכר רמב\"ם"] },
  { name: "אבא הלל", lat: 32.0829, lng: 34.8030, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "רמת גן", nearbyPlaces: ["בורסת היהלומים", "מגדל משה אביב"] },
  // ── קו אדום — תל אביב ───────────────────────────────
  { name: "ארלוזורוב", lat: 32.0815, lng: 34.7962, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["תחנת רכבת סבידור מרכז", "מסוף 2000"] },
  { name: "שאול המלך", lat: 32.0766, lng: 34.7920, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["מרכז עזריאלי", "בית חולים איכילוב"] },
  { name: "יהודית", lat: 32.0702, lng: 34.7884, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["מתחם שרונה", "קריית הממשלה"] },
  { name: "קרליבך", lat: 32.0653, lng: 34.7829, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["קניון TLV", "מגדל אקרו"] },
  { name: "אלנבי", lat: 32.0626, lng: 34.7746, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["שדרות רוטשילד", "שוק הכרמל"] },
  { name: "אליפלט", lat: 32.0583, lng: 34.7625, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["מתחם התחנה", "פארק המסילה"] },
  { name: "שלמה (סלמה)", lat: 32.0542, lng: 34.7594, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["יפו העתיקה", "תיאטרון גשר"] },
  { name: "אצטדיון בלומפילד", lat: 32.0500, lng: 34.7589, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["שוק הפשפשים", "מרכז תרבות מנדל"] },
  { name: "ארליך", lat: 32.0457, lng: 34.7583, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["המכללה האקדמית תל אביב יפו"] },
  { name: "איסקוב", lat: 32.0419, lng: 34.7569, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["קריית חינוך יפו, עירוני ז׳"] },
  { name: "הבעש\"ט", lat: 32.0384, lng: 34.7556, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["בית חולים וולפסון", "מרכז הטניס יפו"] },
  { name: "מחרוזת", lat: 32.0333, lng: 34.7515, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "תל אביב", nearbyPlaces: ["שכונת עג'מי"] },
  // ── קו אדום — בת ים ─────────────────────────────────
  { name: "העצמאות", lat: 32.0279, lng: 34.7488, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", nearbyPlaces: ["מרכז העיר בת ים", "כיכר המגינים (המצבה)"] },
  { name: "רוטשילד", lat: 32.0267, lng: 34.7441, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", nearbyPlaces: ["מרכז העיר בת ים", "חוף הים בת ים"] },
  { name: "ז'בוטינסקי", lat: 32.0214, lng: 34.7432, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", nearbyPlaces: ["חוף הים בת ים"] },
  { name: "בלפור", lat: 32.0173, lng: 34.7450, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", nearbyPlaces: ["עיריית בת ים"] },
  { name: "בנימין", lat: 32.0163, lng: 34.7488, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", nearbyPlaces: ["ספריית בת ים", "גן שעשועים ירושלמי"] },
  { name: "יוספטל", lat: 32.0152, lng: 34.7525, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", nearbyPlaces: ["קניון בת ים"] },
  { name: "כ\"ט בנובמבר", lat: 32.0105, lng: 34.7513, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", nearbyPlaces: ["קניון בת ימון", "אזור תעשייה"] },
  { name: "העמל", lat: 32.0061, lng: 34.7492, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", nearbyPlaces: ["בית משפט השלום בת ים", "בית הדין לעבודה"] },
  { name: "הקוממיות", lat: 32.0024, lng: 34.7469, lineId: "red", lineName: "קו אדום", lineColor: "#b04050", lineHref: "/line-red", city: "בת ים", nearbyPlaces: ["אצטדיון בת ים", "קאנטרי בת ים"] },
];
export const LANDMARKS: Landmark[] = [
  // תחנה מרכזית פתח תקווה
  // אומת ב-Nominatim: השוק נמצא 667 מ' מהתחנה המרכזית ו-387 מ' מפינסקר.
  // ארבע הדקות שהוצהרו כאן התאימו למרחק שגוי ולתחנה שגויה.
  { name: "שוק פתח תקווה", stationName: "פינסקר", walkMins: 5, lineId: "red", lat: 32.09034, lng: 34.88193, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  { name: "תיאטרון המסילה", stationName: "פינסקר", walkMins: 7, lineId: "red", lat: 32.09625, lng: 34.88033, coordSource: "האחים בכר 3 — עיריית פ״ת (מפעילת האולם) + BE106 · אמצע הרחוב ב-OSM, בלי מספר בית", coordVerification: "single" },
  // פינסקר
  { name: "מתחמי הבילוי גיסין", stationName: "פינסקר", walkMins: 5, lineId: "red" },
  // דנקנר
  { name: "פארק יד לבנים פתח תקווה", stationName: "דנקנר", walkMins: 4, lineId: "red", lat: 32.08655, lng: 34.87326, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  { name: "מוזיאון האדם והסביבה", stationName: "דנקנר", walkMins: 5, lineId: "red", lat: 32.08836, lng: 34.87319, coordSource: "מקור יחיד · ויקינתונים (OSM נפסל על המרחק)", coordVerification: "single" },
  // בילינסון
  { name: "בית חולים בילינסון", stationName: "בילינסון", walkMins: 3, lineId: "red", lat: 32.08945, lng: 34.86779, coordSource: "שני מקורות · OSM + ויקינתונים", coordVerification: "two" },
  // הוסר: "מרכז רפואי רבין" הוא שמו הרשמי של בית חולים בילינסון. שתי
  // הרשומות גיאוקודו לאותה נקודה בדיוק, 33 מ' מהתחנה, אבל הצהירו 3 ו-4
  // דקות — אותו מקום הופיע פעמיים באותו כרטיס עם שני זמנים.
  { name: "בית חולים שניידר", stationName: "בילינסון", walkMins: 5, lineId: "red", lat: 32.08854, lng: 34.86858, coordSource: "שני מקורות · OSM + ויקינתונים", coordVerification: "two" },
  // שחם
  { name: "B.S.R סיטי", stationName: "שחם", walkMins: 4, lineId: "red", lat: 32.09153, lng: 34.86127, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // שנקר
  // הוסר: "מכללת שנקר, תחנת שנקר, 3 דקות". המכללה ברמת גן ברחוב אנה פרנק,
  // 4.8 ק"מ מתחנת שנקר שבפתח תקווה — כשעה הליכה, לא שלוש דקות. השיוך הנכון
  // הוא לאבא הלל, והוא יושב ב-places.ts עם קואורדינטה מאומתת.
  // קריית אריה
  { name: "אצטדיון שלמה ביטוח", stationName: "קריית אריה", walkMins: 5, lineId: "red", lat: 32.1042, lng: 34.86508, coordSource: "מקור יחיד · ויקינתונים", coordVerification: "single" },
  // אבא הלל
  { name: "בורסת היהלומים", stationName: "אבא הלל", walkMins: 4, lineId: "red", lat: 32.08344, lng: 34.80102, coordSource: "מקור יחיד · OSM (ויקינתונים נפסל על המרחק)", coordVerification: "single" },
  { name: "מגדל משה אביב", stationName: "אבא הלל", walkMins: 5, lineId: "red", lat: 32.08343, lng: 34.80374, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // ארלוזורוב
  { name: "תחנת רכבת סבידור מרכז", stationName: "ארלוזורוב", walkMins: 3, lineId: "red", lat: 32.08503, lng: 34.79852, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // שאול המלך
  { name: "מרכז עזריאלי", stationName: "שאול המלך", walkMins: 5, lineId: "red", lat: 32.0747, lng: 34.79197, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  { name: "בית חולים איכילוב", stationName: "שאול המלך", walkMins: 6, lineId: "red", lat: 32.08056, lng: 34.79, coordSource: "ויקינתונים Q2561450 — הטענה ללא מקור מצוטט", coordVerification: "single" },
  // יהודית
  { name: "מתחם שרונה", stationName: "יהודית", walkMins: 5, lineId: "red", lat: 32.07325, lng: 34.7868, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // קרליבך
  { name: "קניון TLV", stationName: "קרליבך", walkMins: 4, lineId: "red", lat: 32.06833, lng: 34.78321, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // אלנבי
  { name: "שוק הכרמל", stationName: "אלנבי", walkMins: 11, lineId: "red", lat: 32.06837, lng: 34.76855, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  { name: "שדרות רוטשילד", stationName: "אלנבי", walkMins: 6, lineId: "red", lat: 32.06599, lng: 34.77722, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // אליפלט
  { name: "פארק המסילה", stationName: "אליפלט", walkMins: 4, lineId: "red" },
  { name: "נווה צדק", stationName: "אליפלט", walkMins: 7, lineId: "red", lat: 32.05974, lng: 34.76674, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // שלמה (סלמה)
  { name: "יפו העתיקה", stationName: "שלמה (סלמה)", walkMins: 11, lineId: "red", lat: 32.05382, lng: 34.75333, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  { name: "תיאטרון גשר", stationName: "שלמה (סלמה)", walkMins: 5, lineId: "red", lat: 32.05331, lng: 34.75165, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // אצטדיון בלומפילד
  { name: "אצטדיון בלומפילד", stationName: "אצטדיון בלומפילד", walkMins: 4, lineId: "red", lat: 32.05184, lng: 34.76158, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  { name: "שוק הפשפשים", stationName: "שלמה (סלמה)", walkMins: 4, lineId: "red", lat: 32.05358, lng: 34.75627, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // הבעש"ט
  { name: "בית חולים וולפסון", stationName: "הבעש\"ט", walkMins: 9, lineId: "red", lat: 32.0353, lng: 34.7631, coordSource: "ויקינתונים Q2091071 (P143) + OSM \"Wolfson Medical Center\" — פער 68 מ׳", coordVerification: "two" },
  // יוספטל
  { name: "קניון בת ים", stationName: "יוספטל", walkMins: 5, lineId: "red", lat: 32.01526, lng: 34.7561, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // בלפור
  { name: "עיריית בת ים", stationName: "בלפור", walkMins: 4, lineId: "red", lat: 32.0162, lng: 34.74122, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // הקוממיות
  { name: "אצטדיון בת ים", stationName: "הקוממיות", walkMins: 5, lineId: "red", lat: 32.00081, lng: 34.7484, coordSource: "מקור יחיד · OSM", coordVerification: "single" },
  // ── כתובות רחובות ────────────────────────────────────────────
  { name: "זאב אורלוב 70", stationName: "תחנה מרכזית פתח תקווה", walkMins: 1, lineId: "red", lat: 32.0947, lng: 34.8868, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "זאב אורלוב 41", stationName: "פינסקר", walkMins: 1, lineId: "red", lat: 32.0938, lng: 34.8825, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "זאב אורלוב 8", stationName: "קרול", walkMins: 1, lineId: "red", lat: 32.0917, lng: 34.8772, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "ז'בוטינסקי 31 פתח תקווה", stationName: "דנקנר", walkMins: 1, lineId: "red", lat: 32.091, lng: 34.8718, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "ז'בוטינסקי 72 פתח תקווה", stationName: "בילינסון", walkMins: 1, lineId: "red", lat: 32.0915, lng: 34.8664, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "ז'בוטינסקי 82 פתח תקווה", stationName: "שחם", walkMins: 1, lineId: "red", lat: 32.0919, lng: 34.8614, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "ז'בוטינסקי 101 פתח תקווה", stationName: "שנקר", walkMins: 1, lineId: "red", lat: 32.0926, lng: 34.8536, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "ז'בוטינסקי 166 בני ברק", stationName: "אהרונוביץ'", walkMins: 1, lineId: "red", lat: 32.0927, lng: 34.8382, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "ז'בוטינסקי 117 בני ברק", stationName: "אהרונוביץ'", walkMins: 2, lineId: "red" },
  { name: "ז'בוטינסקי 12 בני ברק", stationName: "בן גוריון", walkMins: 1, lineId: "red", lat: 32.0908, lng: 34.8229, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "ז'בוטינסקי 85 רמת גן", stationName: "ביאליק", walkMins: 1, lineId: "red", lat: 32.0864, lng: 34.8115, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "ז'בוטינסקי 68 רמת גן", stationName: "ביאליק", walkMins: 2, lineId: "red" },
  { name: "ז'בוטינסקי 5 רמת גן", stationName: "אבא הלל", walkMins: 1, lineId: "red", lat: 32.0829, lng: 34.803, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "מנחם בגין 160", stationName: "ארלוזורוב", walkMins: 1, lineId: "red", lat: 32.0815, lng: 34.7962, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "מנחם בגין 125", stationName: "שאול המלך", walkMins: 1, lineId: "red", lat: 32.0766, lng: 34.792, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "מנחם בגין 144", stationName: "שאול המלך", walkMins: 1, lineId: "red", lat: 32.0766, lng: 34.792, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "מנחם בגין 112", stationName: "יהודית", walkMins: 1, lineId: "red", lat: 32.0702, lng: 34.7884, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "מנחם בגין 98", stationName: "יהודית", walkMins: 2, lineId: "red" },
  { name: "קרליבך לינקולן", stationName: "קרליבך", walkMins: 1, lineId: "red", lat: 32.0653, lng: 34.7829, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "קרליבך מנחם בגין", stationName: "קרליבך", walkMins: 1, lineId: "red", lat: 32.0653, lng: 34.7829, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "יהודה הלוי 63", stationName: "אלנבי", walkMins: 1, lineId: "red", lat: 32.0626, lng: 34.7746, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "מקווה ישראל 10", stationName: "אלנבי", walkMins: 1, lineId: "red", lat: 32.0626, lng: 34.7746, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "שדרות ירושלים 15", stationName: "שלמה (סלמה)", walkMins: 1, lineId: "red", lat: 32.0542, lng: 34.7594, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "שדרות ירושלים 42", stationName: "אצטדיון בלומפילד", walkMins: 1, lineId: "red", lat: 32.05, lng: 34.7589, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "שדרות ירושלים 94", stationName: "ארליך", walkMins: 1, lineId: "red", lat: 32.0457, lng: 34.7583, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "שדרות ירושלים 120", stationName: "איסקוב", walkMins: 1, lineId: "red", lat: 32.0419, lng: 34.7569, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "שדרות ירושלים 146", stationName: "הבעש\"ט", walkMins: 1, lineId: "red", lat: 32.0384, lng: 34.7556, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "שדרות ירושלים 210", stationName: "מחרוזת", walkMins: 1, lineId: "red", lat: 32.0333, lng: 34.7515, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "שד' העצמאות 69", stationName: "העצמאות", walkMins: 1, lineId: "red", lat: 32.0279, lng: 34.7488, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "רוטשילד 17 בת ים", stationName: "רוטשילד", walkMins: 1, lineId: "red", lat: 32.0267, lng: 34.7441, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "הרצל 64 בת ים", stationName: "ז'בוטינסקי", walkMins: 1, lineId: "red", lat: 32.0214, lng: 34.7432, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "יוספטל 44", stationName: "בלפור", walkMins: 1, lineId: "red", lat: 32.0173, lng: 34.745, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "יוספטל 70", stationName: "בנימין", walkMins: 1, lineId: "red", lat: 32.0163, lng: 34.7488, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "יוספטל 82", stationName: "יוספטל", walkMins: 1, lineId: "red", lat: 32.0152, lng: 34.7525, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "ניסבאום 48", stationName: "כ\"ט בנובמבר", walkMins: 1, lineId: "red", lat: 32.0105, lng: 34.7513, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "ניסבאום 7", stationName: "העמל", walkMins: 1, lineId: "red", lat: 32.0061, lng: 34.7492, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
  { name: "מנחם בגין 4 בת ים", stationName: "הקוממיות", walkMins: 1, lineId: "red", lat: 32.0024, lng: 34.7469, coordSource: "כתובת התחנה — מאומתת מול דנקל", coordVerification: "address" },
];
/**
 * מקלדת עברית ותיקון אוטומטי באייפון מייצרים גרש (U+05F3) וגרשיים
 * (U+05F4) טיפוגרפיים, בעוד שמות התחנות בקובץ כתובים באפוסטרוף ובמרכאות
 * של ASCII. בלי הנרמול הזה ארבע תחנות — ז'בוטינסקי, אהרונוביץ', הבעש"ט
 * וכ"ט בנובמבר — החזירו אפס תוצאות למי שהקליד אותן כרגיל.
 */
/**
 * "תחנת" + שם התחנה. "תחנה מרכזית פתח תקווה" כבר מכילה את המילה, ולכן
 * שרשור עיוור הפיק "תחנת תחנה מרכזית פתח תקווה" בכותרת, בתיאור, ב-og,
 * בפירורים הנראים, ב-BreadcrumbList וב-TrainStation.
 * מתלבש גם על תחילית: `ב${stationLabel(n)}` נותן "בתחנת שנקר" או
 * "בתחנה מרכזית פתח תקווה", שתיהן תקינות.
 *
 * הגבול כתוב במפורש ולא כ-\b: ב-JS גבול מילה מבוסס על [A-Za-z0-9_],
 * ואות עברית אינה תו מילה — כך ש-/^תחנ[הת]\b/ מחזיר false על
 * "תחנה מרכזית פתח תקווה" ומחמיץ בדיוק את המקרה היחיד שקיים.
 */
export function stationLabel(name: string): string {
  return /^תחנ[הת](?:\s|$)/.test(name) ? name : `תחנת ${name}`;
}

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
/**
 * שניות מתחנה מרכזית פתח תקווה לאורך הגשר הראשי, לפי לוח הזמנים.
 *
 * קודם לכן זמן הנסיעה היה `stops * 2` — נוסחה מומצאת בלי שום מקור,
 * שהזינה את שעת ההגעה בכל חיפוש מסלול באתר, בשני הכיוונים. היא נתנה
 * 62 דקות מקצה לקצה במקום 65, אבל זה החלק הקטן: בנסיעות קצרות, שהן
 * המקרה הנפוץ, היא טעתה עד **41%** — "אלנבי → שלמה" יצא 4 דקות במקום
 * 6.8. שתי דקות אחידות לכל עצירה התעלמו מכך שהקטע התת-קרקעי מהיר
 * בהרבה מהקטע הרחובי בשדרות ירושלים, שם מרווח אחד לוקח 3.5 דקות.
 *
 * מקור: מתכנן המסלולים של דנקל, https://www.dankal.co.il/תכנון-מסלול-נסיעה/
 * — נקרא ב-05.11.2026. התשובה שלו מוסרת את לוח הזמנים תחנה-תחנה עם
 * `arrivalTime` מדויק לכל אחת, והמספרים כאן הם ההפרש מהתחנה הראשונה
 * בנסיעה של 10:03 ביום חמישי.
 *
 * **אלה זמנים מתוכננים, ולא מדידה של נסיעה אמיתית.**
 *
 * היציבות נמדדה: ההיסטים על הגשר **זהים לשנייה** בשלוש יציאות עוקבות
 * באותה שליפה, וגם בין שליפה ב-10:00 לשליפה ב-17:00 — אפס שניות הפרש.
 * הענף דווקא כן משתנה בין תבניות נסיעה: קריית אריה עד הצומת יצא 390
 * שניות בשליפות שהתחילו בקריית אריה ו-363 בשליפה שהתחילה בגשר אם
 * המושבות. לכן BRANCH_SECS הוא מדגם, ו-travel-live.mjs בודק אותו
 * בסובלנות של דקה ואת הגשר בדיוק מלא.
 *
 * הכיוון כמעט אינו משנה — 65.0 דקות מפתח תקווה לבת ים ו-65.3 בהפוך.
 *
 * scripts/travel-live.mjs משווה את הטבלה למתכנן בכל הרצה של הבלוק.
 */
export const TRUNK_SECS: Record<string, number> = {
  "תחנה מרכזית פתח תקווה": 0,
  "פינסקר": 95,
  "קרול": 205,
  "דנקנר": 325,
  "בילינסון": 422,
  "שחם": 533,
  "שנקר": 673,
  "אהרונוביץ'": 803,
  "בן גוריון": 948,
  "ביאליק": 1076,
  "אבא הלל": 1206,
  "ארלוזורוב": 1304,
  "שאול המלך": 1412,
  "יהודית": 1520,
  "קרליבך": 1627,
  "אלנבי": 1754,
  "אליפלט": 1951,
  "שלמה (סלמה)": 2162,
  "אצטדיון בלומפילד": 2279,
  "ארליך": 2402,
  "איסקוב": 2506,
  'הבעש"ט': 2594,
  "מחרוזת": 2753,
  "העצמאות": 2879,
  "רוטשילד": 2988,
  "ז'בוטינסקי": 3202,
  "בלפור": 3363,
  "בנימין": 3452,
  "יוספטל": 3549,
  'כ"ט בנובמבר': 3682,
  "העמל": 3797,
  "הקוממיות": 3901,
};

/**
 * שניות מהתחנה בענף עד הצומת באהרונוביץ'. שתי התחנות שאינן על הגשר.
 * אהרונוביץ' עצמה היא 0 כאן, והיא מופיעה גם ב-TRUNK_SECS.
 */
export const BRANCH_SECS: Record<string, number> = {
  "קריית אריה": 390,
  "גשר אם המושבות": 195,
  "אהרונוביץ'": 0,
};

/**
 * ההמתנה בהחלפה בצומת, בדקות.
 *
 * חלה **רק** על נסיעה בין זרוע פתח תקווה לזרוע קריית אריה — 28 מתוך
 * 1122 הזוגות המסודרים, 2.5%. אלה הזוגות שהכרטיס כבר אומר עליהם
 * "נדרשת החלפה באהרונוביץ'", ועד 06.11.2026 הוא נתן לצידם שעת הגעה
 * שהניחה שאין המתנה בכלל. הכרטיס סתר את עצמו.
 *
 * מקור: מתכנן המסלולים של דנקל, נמדד ב-06.11.2026 על שלושה זוגות
 * בשלוש שעות. שמונה מדידות שהצליחו:
 *
 *   שחם → קריית אריה               7.5 · 7.5 · 8.5
 *   תחנה מרכזית פ״ת → קריית אריה   7.6 · 7.6 · 7.6
 *   שנקר → גשר אם המושבות          5.9 · 6.9
 *
 * טווח 5.9–8.5, ממוצע 7.4. **הערך כאן הוא 7 — עיגול של הממוצע, לא
 * מדידה של נסיעה מסוימת**, והאתר אומר "הערכה בלבד" מעל התוצאה.
 *
 * **מגבלה שנרשמת ולא מוסתרת:** כל שמונה המדידות הן בכיוון פתח תקווה
 * ← קריית אריה. חמש שאילתות בכיוון ההפוך החזירו "לא הוחזרו מסלולים"
 * מהמתכנן, ולכן אותן 7 דקות מוחלות על שני הכיוונים על סמך כיוון אחד.
 *
 * מה שאומת בדרך: זמן הנסיעה עצמו שלנו מדויק מול המתכנן — 19.9 דקות
 * אצלו ו-20 אצלנו, 11.0 אצלו ו-11 אצלנו. רק ההמתנה הייתה חסרה.
 *
 * ומה שנבדק ונדחה: שמונה מדידות בשני כיוונים הראו שנסיעה מהענף
 * **דרומה** היא רגל אחת בלי החלפה, בדיוק כמו המודל שלנו. מדידה בודדת
 * מ-05.11 שהראתה שם שתי רגליים נותרה חריגה שלא הוסברה, והיא לא מספיקה
 * כדי לשנות מודל. scripts/travel-live.mjs בודק את זה בכל הרצה.
 */
export const JUNCTION_WAIT_MINS = 7;

/**
 * זמן הנסיעה בין שתי תחנות, מלוח הזמנים. מקור יחיד — גם לתכנון קדימה
 * וגם אחורה.
 *
 * מחזיר null כששם אינו מוכר, במקום ליפול לאפס או לנוסחה: שעת הגעה
 * שגויה בשקט היא בדיוק מה שהוחלף כאן. שורה בבלוק מוודאת שכל 34
 * התחנות מכוסות, ולכן null אינו אמור לקרות בפועל.
 *
 * **אינו כולל את ההמתנה בהחלפה** בצומת. גם הנוסחה הקודמת לא כללה
 * אותה, וזה נשאר פער פתוח ולא רגרסיה: המתכנן של דנקל מראה המתנה של
 * כ-8.5 דקות באהרונוביץ' בנסיעה מקריית אריה דרומה, כך שמי שמגיע משתי
 * תחנות הענף רואה אצלנו זמן קצר מהאמת. רשום ב-claim-inventory.
 */
export function travelMinutes(fromName: string, toName: string): number | null {
  const onBranch = (n: string) => n in BRANCH_SECS && !(n in TRUNK_SECS);
  const a = fromName, b = toName;

  if (onBranch(a) && onBranch(b)) {
    return Math.round(Math.abs(BRANCH_SECS[a] - BRANCH_SECS[b]) / 60);
  }
  if (onBranch(a) || onBranch(b)) {
    const branchStop = onBranch(a) ? a : b;
    const trunkStop = onBranch(a) ? b : a;
    if (!(trunkStop in TRUNK_SECS)) return null;
    const toJunction = BRANCH_SECS[branchStop];
    const alongTrunk = Math.abs(TRUNK_SECS[trunkStop] - TRUNK_SECS[JUNCTION]);
    const ride = Math.round((toJunction + alongTrunk) / 60);
    // צפונית לצומת יושבת זרוע פתח תקווה, ונסיעה בינה לבין הענף דורשת
    // החלפה — אותם 28 זוגות ש-countStops מסמנת. דרומה לצומת זאת רגל
    // אחת רצופה, ואין המתנה. ההבחנה היא צד הצומת, לא מרחק.
    const needsChange = TRUNK_SECS[trunkStop] < TRUNK_SECS[JUNCTION];
    return ride + (needsChange ? JUNCTION_WAIT_MINS : 0);
  }
  if (!(a in TRUNK_SECS) || !(b in TRUNK_SECS)) return null;
  return Math.round(Math.abs(TRUNK_SECS[a] - TRUNK_SECS[b]) / 60);
}

/**
 * אורך הקו בקילומטרים.
 *
 * מקור: עמוד הבית של נת״ע, בעלת העובדה, מצהיר "3 קווי שירות · 34 תחנות ·
 * 24 קילומטרים" — נקרא ב-04.11.2026. סכום אווירי בין תחנות עוקבות מהנתונים
 * שלנו הוא 23.3 ק״מ, קצר ממסילה אמיתית כמצופה, ולכן אינו סותר.
 *
 * המספר ישב קשיח בחמישה מקומות בלי מקור. כלל 1.
 */
export const LINE_LENGTH_KM = 24;

/**
 * תעריפי הנסיעה והחיוב על נסיעה ללא תיקוף.
 *
 * המחירים ישבו קשיחים בשני נוסחים — בעמוד הבית וב-STATION_FAQ — וכל
 * אחד יכול היה להתעדכן בלי השני. זאת הטענה היחידה באתר שמי שטועה בה
 * מעלות לקורא כסף, ולכן היא יושבת כאן פעם אחת ושני הנוסחים נגזרים ממנה.
 *
 * מקורות, שניהם נקראו ב-05.11.2026:
 *
 * 1. הרשות הארצית לתחבורה ציבורית, https://bus.gov.il/FaresDistance —
 *    טבלת התעריפים הרשמית: אזור צהוב 0-15 ק״מ "אוטובוס: 8 ₪", אזור ירוק
 *    15-40 ק״מ "אוטובוס: 14.5 ₪". הטבלה קובעת במפורש שהרכבות הקלות
 *    (דנקל וירושלים) נכנסות לקטגוריית "אוטובוס".
 * 2. דנקל, המפעילה, https://www.dankal.co.il/חובת-התיקוף/ — "בדנקל
 *    ייתכנו שני תעריפי נסיעה: נסיעה בטווח של עד 15 ק״מ (אזור תעריף
 *    צהוב): 8 ₪ · נסיעה בטווח של מעל 15 ק״מ (אזור תעריף ירוק): 14.5 ₪".
 *
 * הטווח הוא **אווירי** בין תחנת המוצא לתחנת היעד, לא לאורך המסילה. לכן
 * אף ש-LINE_LENGTH_KM הוא 24, המרחק האווירי הגדול ביותר בקו — תחנה
 * מרכזית פתח תקווה עד הקוממיות — הוא 16.7 ק״מ. התעריף הירוק אכן קיים
 * בקו, אבל רק בנסיעות הארוכות ממש.
 */
export const FARE_ILS = 8;
export const FARE_LONG_ILS = 14.5;
export const FARE_ZONE_KM = 15;
export const TRANSFER_MINS = 90;

/**
 * "חיוב מוגדל" בלשון המפעילה, לא "קנס".
 *
 * מקור: דנקל, https://www.dankal.co.il/מידע-על-חיוב-מוגדל/ — נקרא
 * ב-05.11.2026: "סכום החיוב הוא מחיר נסיעה מלא בתוספת קנס כספי ע״ס
 * 180 ₪ על פי חוק ובכלל זה, תקנות מסילות הברזל (דרישה לתשלום חיוב
 * מוגדל לנוסע ברכבת מקומית), תשע״א-2011".
 *
 * מקור אחד. שתי הסתייגויות שנרשמות ולא מוצגות לקורא:
 * דיווחי חדשות על הפחתת הקנס ל-50 או ל-100 ₪ נוגעים לאוטובוסים או
 * להצעות חוק, לא לתקנה שדנקל מצטטת; ופרוטוקולי ועדת הכלכלה מ-2011
 * מזכירים הצמדה למדד. בשני המקרים לא דורסים את המספר שהמפעילה
 * מפרסמת היום. verified-facts.mjs מחזיק את זה בדירוג מקור אחד.
 *
 * הערה: הטענה "מי שרכש מנוי ולא תיקף — עד 100 ₪" הוסרה מהאתר. היא לא
 * הופיעה באף מקור רשמי, ועמוד החיוב המוגדל של דנקל מונה אי-תיקוף בין
 * שלושת המקרים ונוקב בסכום אחד בלבד.
 */
export const SURCHARGE_ILS = 180;

/**
 * תשובת המחיר. נוסח אחד לעמוד הבית ולעמודי התחנה.
 *
 * מחרוזת אחת, בלי שרשור ב-`+`. הנוסח הראשון כאן נכתב כשלושה תבניות
 * מחורזות ב-`+`, והקובץ היה תקין — Node העריך אותו ל-184 תווים נכונים.
 * אבל ה-build של Next פלט אותו קטוע: הטקסט שאחרי ה-`${}` האחרון בכל
 * תבנית שלאחריה `+` נעלם, והקורא קיבל "ומעבר לכך 14.5במשך 90בטווח".
 * זה ישב ב-154 קבצים מוכני-רינדור — עמוד הבית, 34 עמודי התחנה, ושני
 * ה-JSON-LD שגוגל קורא. בדוק מול הפלט הבנוי לפני שמחזירים `+` לכאן.
 */
export const FARE_ANSWER = `נסיעה בטווח אווירי של עד ${FARE_ZONE_KM} ק"מ עולה ${FARE_ILS} ₪, ומעבר לכך ${FARE_LONG_ILS} ₪. במשך ${TRANSFER_MINS} דקות מהתיקוף הראשון ניתן להמשיך באוטובוסים וברכבת הקלה בלי תוספת תשלום, בטווח של עד ${FARE_ZONE_KM} ק"מ — אבל חובה לתקף כל נסיעה.`;

/** תשובת החיוב המוגדל. נוסח אחד לעמוד הבית ולעמודי התחנה. */
export const SURCHARGE_ANSWER = `${SURCHARGE_ILS} ₪ בתוספת מחיר נסיעה מלא. דנקל קוראת לזה "חיוב מוגדל", והוא מוטל גם על מי שיש לו הסדר נסיעה תקף אך לא תיקף אותו לפני העלייה לרכבת.`;

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
/** הצומת. מיוצאת כדי שממשק שמסביר פיצול לא יקודד את השם בכתב. */
export const JUNCTION = "אהרונוביץ'";
/** מהצומת צפונה לכיוון פתח תקווה (שירות R1). */
const BRANCH_PT = ["שנקר", "שחם", "בילינסון", "דנקנר", "קרול", "פינסקר", "תחנה מרכזית פתח תקווה"];
/** מהצומת צפונה לכיוון קריית אריה (שירות R2/R3). */
const BRANCH_KA = ["גשר אם המושבות", "קריית אריה"];

/** הגזע, מהצומת ודרומה. הצומת היא תחנה 0 בו — ראה countStops. */
const TRUNK = STATIONS.filter(s => s.lineId === "red")
  .map(s => s.name)
  .filter(n => !BRANCH_PT.includes(n) && !BRANCH_KA.includes(n));

/**
 * שלושת הקטעים הרציפים של הקו, כל אחד מהקצה שלו עד הצומת. הצומת מופיעה
 * בשלושתם, ולכן קווים שמצוירים מהם נפגשים בה ולא נקטעים.
 *
 * **זה מה שמציירים, לא את הסדר של STATIONS.** STATIONS הוא מערך שטוח,
 * ובו שנקר — סוף ענף פתח תקווה — יושב מיד לפני קריית אריה, שהיא סוף הענף
 * **האחר**. אין ביניהן מסילה ואין ביניהן נסיעה בלי החלפה באהרונוביץ',
 * אבל כל מי שגוזר שכנות ממקום במערך מצייר אותן כשתי תחנות עוקבות.
 *
 * רק הקו האדום מופיע כאן כי רק לו יש תחנות. קו שיקבל תחנות ויישאר בלי
 * קטעים לא יקבל אף מחבר, ובלוק הרגרסיה סופר תחנות שאינן מכוסות בקטע.
 */
export const LINE_SEGMENTS: Record<string, readonly string[][]> = {
  red: [
    [...BRANCH_PT].reverse().concat(JUNCTION),
    [...BRANCH_KA].reverse().concat(JUNCTION),
    TRUNK,
  ],
};

/**
 * האם שתי תחנות שכנות על המסילה. נגזר מאותם קטעים שמציירים, ולכן מה
 * שהרשימה מחברת ומה שהמפה מקשרת אינם יכולים להיחלק.
 */
export function areAdjacent(lineId: string, a: string, b: string): boolean {
  return (LINE_SEGMENTS[lineId] ?? []).some(seg => {
    const i = seg.indexOf(a), j = seg.indexOf(b);
    return i >= 0 && j >= 0 && Math.abs(i - j) === 1;
  });
}

type Leg = { branch: "pt" | "ka" | "trunk"; index: number };

function locate(name: string): Leg | null {
  const pt = BRANCH_PT.indexOf(name);
  if (pt >= 0) return { branch: "pt", index: pt };
  const ka = BRANCH_KA.indexOf(name);
  if (ka >= 0) return { branch: "ka", index: ka };
  const t = TRUNK.indexOf(name);
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
  // לא אופציונליים. מסלול ההצלחה היחיד שלמטה מציב את שניהם תמיד, וגם
  // findRouteByArrival מחזירה או NoService או את findRoute עצמה. כל עוד
  // הם היו `?`, שני כרטיסי התוצאה נפלו בשקט ל-`|| ""` — תא ריק בלי שום
  // סימן. ב-02.11.2026 דיווחתי על "שעת הגעה ריקה" שלא קרתה מעולם, והנפילה
  // הזאת היא מה שהפך את הדיווח לאמין. עכשיו הקומפיילר מוודא שהם קיימים
  // במקום שהרינדור יסתיר את היעדרם.
  departureTime: string;
  arrivalTime: string;
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
  // null פירושו שם שאינו בטבלת לוח הזמנים. אין נפילה לנוסחה ולא לאפס:
  // שעת הגעה שגויה בשקט היא בדיוק מה שהוחלף כאן.
  const travelMins = travelMinutes(fromName, toName);
  if (travelMins === null) return null;
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

/**
 * קצב ההליכה, מטרים לדקה.
 *
 * ישב כאן כמספר קשיח בלי מקור. **אומת ב-07.11.2026 ונמצא נכון** —
 * וזה מה שנמדד ולא מה שהונח.
 *
 * מקור: Valhalla, מנתב הליכה פתוח על נתוני OpenStreetMap, בשרת
 * הציבורי valhalla1.openstreetmap.de עם costing "pedestrian". נבדקו
 * כל 22 המקומות המאומתים ב-places.ts אל התחנה שלהם, והקצב המשתמע
 * מהמרחק והמשך שהוא מחזיר:
 *
 *     מינימום 68 · מקסימום 90 · **ממוצע 80** מטר לדקה
 *
 * כלומר 80 הוא בדיוק הממוצע של 22 מסלולי הליכה אמיתיים באזור הזה.
 *
 * **מה שכן התגלה שבור הוא המרחק, לא הקצב** — ראו את ההערה על
 * walkEstimate, ואת seo-data/claim-inventory סעיף "זמני ההליכה".
 */
export const WALK_PACE_M_PER_MIN = 80;

/** מעוגל כלפי מעלה למינימום דקה. */
export function walkMinutes(metres: number): number {
  return Math.max(1, Math.round(metres / WALK_PACE_M_PER_MIN));
}

/**
 * המרחק שמוצג למשתמש, ואם מותר לגזור ממנו זמן הליכה.
 *
 * OSRM אמין ברוב המקרים, אבל בקטעים קצרים הוא מחזיר עקיפה שאינה הליכה
 * אמיתית כשאחת הנקודות אינה מחוברת לרשת ההולכי רגל שלו: 91 מ' אוויריים
 * מאבא הלל למגדל משה אביב חזרו כ-624 מ', ו-256 מ' בין שני בניינים באותו
 * מתחם חזרו כ-2,018. מעל 400 מ' יחס גבוה הוא בדרך כלל מחסום אמיתי —
 * מסילה או כביש מהיר — ואז המסלול נכון.
 *
 * כשהמסלול נדחה מוצג המרחק האווירי בלי זמן: זמן שנגזר מקו אווירי נמוך
 * מדי, ולהמעיט בהליכה גרוע מלא לתת אותה. קישורי הניווט נותנים את האמת.
 *
 * ────────────────────────────────────────────────────────────────
 * **07.11.2026 — הכלל הזה בנוי על הנחה שהתבררה כשגויה.**
 *
 * השרת הציבורי `router.project-osrm.org` **מתעלם מהפרופיל בכתובת**.
 * נמדד: אותן שתי נקודות ב-foot, walking, driving, car ו-bike החזירו
 * תוצאה זהה בייט לבייט — 1803.5 מ׳ ו-210.9 שנ׳, קצב 513 מ׳ לדקה.
 * זאת נסיעה ברכב, לא הליכה. כלומר `routeMetres` שמגיע לכאן הוא
 * **מרחק נסיעה**, מנופח על ידי חד-סטריים ואיסורי פנייה.
 *
 * ההיקף נמדד על 22 המקומות: יחס מסלול/אווירי ממוצע 4.49, מקסימום
 * 30.78, ו-12 מתוך 22 הציגו זמן שנגזר מהמספר הזה. הגרוע ביותר —
 * מכללת שנקר, 788 מ׳ אוויריים, הוצגו 2668 מ׳ ו"33 דקות הליכה".
 * מנתב הליכה אמיתי מחזיר שם 947 מ׳ ו-12.4 דקות.
 *
 * **ולמה הסף כאן אינו הכלי:** נמדד שגם הליכה אמיתית עוקפת הרבה —
 * יחס 1.07 עד 6.88, ממוצע 1.95 (בילינסון: 33 מ׳ אוויריים, 229 מ׳
 * הליכה סביב הבניין). שום סף יחס אינו מפריד בין ניתוב רכב להליכה.
 * הידוק הסף ל-1.5 היה פוסל 11 מתוך 22 הליכות לגיטימיות.
 *
 * **התיקון הוא להחליף את המנתב, לא לכוונן את הסף.**
 *
 * ההמלצה הראשונה כאן הייתה Valhalla, והיא **תוקנה ב-07.11.2026** אחרי
 * בדיקה חוזרת. התיקון הנכון קטן בהרבה: `routing.openstreetmap.de`
 * של FOSSGIS מריץ פרופילים נפרדים באמת —
 *
 *     routed-foot   387 מ׳ ·  73 מ׳/דק׳
 *     routed-bike   442 מ׳ · 144 מ׳/דק׳
 *     routed-car   1804 מ׳ · 513 מ׳/דק׳   ← מה שאנחנו מקבלים היום
 *
 * **ואותו API של OSRM בדיוק.** כלומר שינוי כתובת בשורה אחת, בלי
 * ספק חדש ובלי מבנה תשובה אחר, וההצהרה ב-PrivacyContent שאומרת
 * "OSRM — חישוב מסלול הליכה" נשארת נכונה ואף נעשית נכונה לראשונה.
 *
 * מאומת בשלושה מנועים על 22 המסלולים: routed-foot מול Valhalla
 * נחלקים ב-9.5% בממוצע, לעומת 23.2% בין BRouter ל-Valhalla. הפער
 * בדקות המוצגות עולה על דקה בשניים מתוך 22 בלבד, והקצב המשתמע
 * מ-routed-foot הוא 77 — ליד 80 שלנו וליד 80 של Valhalla.
 *
 * **מדיניות השימוש נבדקה** (routing.openstreetmap.de/about.html):
 * מופעל על ידי FOSSGIS, "בקשה אחת לשנייה לכל היותר", "בלי גרידה ובלי
 * שימוש כבד", חובת ייחוס ו-user-agent תקין, ואין התחייבות לזמינות.
 * **השרת שבשימוש היום נמצא תחת אותה מדיניות בדיוק** — זה אינו סיכון
 * חדש, והתנועה כאן רחוקה מהמגבלה. הייחוס ל-OpenStreetMap כבר קיים
 * במפה ובכותרת התחתונה; קישור "תקן את המפה" שהמדיניות מבקשת חסר,
 * והיעדרו קדם לשינוי הזה. זמני תגובה נמדדו: 0.21 שנ׳, מהר יותר מהשרת
 * הנוכחי.
 *
 * **ומה התיקון יעשה בפועל**, נמדד על 22 המסלולים: 20 מתוך 22 יציגו
 * זמן במקום 12 היום, ומכללת שנקר תרד מ-33 דקות ל-12. **שני מקרים
 * יישארו בלי זמן** — מגדל משה אביב (125 מ׳ אוויריים, 570 הליכה) ובית
 * חולים בילינסון (33 מול 223) — כי השומר כאן פוסל יחס מעל 3 מתחת
 * ל-400 מ׳, ואלה הליכות קצרות אמיתיות שמקיפות בניין. זאת זהירות יתר
 * ולא טעות, ושינוי השומר הוא החלטה נפרדת שלא נכללת בתיקון הזה.
 *
 * השינוי עצמו יושב ב-useNearestStation.ts, שאינו הקובץ הזה, **ודורש
 * החלטה של בעל האתר**. עד אז ההתנהגות כאן לא שונתה, כדי שלא יישאר
 * חצי תיקון.
 * ────────────────────────────────────────────────────────────────
 *
 * יושב כאן ולא בכל רכיב בנפרד — קודם לכן הכלל היה רק בפאנל התחנה הקרובה,
 * ועמוד התחנה המשיך להזין את מספר OSRM הגולמי לזמן ההליכה.
 */
export function walkEstimate(
  airMetres: number | null,
  routeMetres: number | null,
  /** מרחק ההצמדה של המנתב — כמה רחוק הוא הזיז את הנקודה שנמסרה לו. */
  snapMetres?: number | null
): { metres: number | null; fromRoute: boolean; trustTime: boolean; reason?: "detour" | "snap" } {
  if (airMetres == null) return { metres: routeMetres, fromRoute: routeMetres != null, trustTime: routeMetres != null };
  if (routeMetres == null) return { metres: airMetres, fromRoute: false, trustTime: true };
  /**
   * היחס המרבי בין מסלול ההליכה למרחק האווירי. מעליו המסלול נחשב
   * לא סביר, ואז מוצג המרחק האווירי בלי זמן.
   *
   * **זאת קנרית, לא כיול — וההבדל חשוב למי שיקרא את זה בעוד חצי שנה.**
   *
   * סף מכויל מופרד ממקרי כשל שנמדדו. **כאן אין ולו מקרה כשל אחד.**
   * חמישה-עשר ניסיונות מכוונים לייצר יחס גבוה מ-routed-foot — ים,
   * שדה פתוח, תוך מבנה, שני צדי איילון, הירקון, מסילה, כביש 4, נמל,
   * פארק, מתחם סגור — החזירו **מקסימום 2.62**. והיחס הגבוה ביותר
   * שנצפה אי פעם מהמנתב הזה הוא 6.88, והוא **הליכה נכונה**: בילינסון,
   * 33 מ׳ אוויריים מול 223 מ׳ סביב הבניין.
   *
   * **ועדכון מדידה, 08.11.2026: 8 כבר אינו מעל כל מה שנצפה.** נמדד יחס
   * **8.83** בנקודה 32.0900,34.8664 — 167 מ׳ אוויריים מבילינסון, ומסלול
   * רגלי של 1,472 מ׳ מסביב למסילה. זה **אינו** כשל של המנתב: המנתב צודק,
   * וההליכה באמת ארוכה פי תשעה מהקו הישר. כלומר הסף אינו רק קנרית —
   * **הוא נורה היום, על גאוגרפיה אמיתית, ועשה בדיוק את עבודתו**: הפאנל
   * ועמוד התחנה הציגו 170 מ׳ בלי זמן ועם ההערה, במקום "כ-2 דק׳ הליכה"
   * להליכה של 18 דקות. הטענה שנשארה נכונה היא הצרה יותר — הסף אינו פוסל
   * אף הליכה אמיתית שנמדדה. הטענה הרחבה, שאין ולו מקרה אחד מעליו,
   * הייתה נכונה לשני הסשנים ההם ואינה נכונה עכשיו.
   *
   * ומה שהוא **כן** עושה: לא פוסל אף הליכה אמיתית שנמדדה —
   *
   *     סף  5   פוסל 1 הליכה אמיתית
   *     סף  7   פוסל 0, אבל צמוד ל-6.88 שכבר נמדד
   *     סף  8   פוסל 0, עם מרווח
   *
   * ומה תפקידו: **לתפוס רגרסיה עתידית במנתב** — היום שבו הכתובת
   * תחזיר בשקט ניתוב רכב שוב, כפי שקרה עד 07.11.2026. ניתובי הרכב
   * ההם הגיעו ליחס 30.78, והסף הזה היה תופס אותם. ההגנה הראשונה היא
   * `scripts/router-profile.mjs` בבלוק, שתופס קריסת פרופיל בזמן
   * בנייה; זאת השנייה, בזמן בקשה.
   *
   * **ושלושת המספרים האלה חלים על שלושה מסכים מתוך ארבעה.** כרטיס
   * המפה (`Map.tsx:1026`) אינו עובר כאן בכלל: הוא מחשב מרחק אווירי
   * ומזין אותו ישירות ל-walkMinutes. נמדד על המסך ב-08.11 שהוא הציג
   * "2.2 ק״מ · כ-27 דק׳ הליכה" להליכה של 3,390 מ׳ ו-42 דקות. נעול
   * בבלוק בשורה "זמן הליכה: מציגים · מגודרים" על "3 · 2".
   *
   * **אל תקרא את המספרים למטה כאילו הם מקרי כשל של המנתב הנוכחי.**
   * ההבחנה הזאת הגיעה מהסשן שחוקר, אחרי שהנוסח הקודם כאן הציג את
   * הסף כאילו הוא מופרד מכשלים נמדדים.
   */
  const MAX_WALK_DETOUR = 8;

  /**
   * ⚠ עד 07.11.2026 היה כאן `airMetres >= 400 || routeMetres <= airMetres * 3`,
   * וה-`||` קיצר: מעל 400 מ׳ בדיקת היחס **לא רצה כלל**.
   *
   * נמדד שזה בדיוק האזור שבו ישבו הזמנים המנופחים — 7 מקומות מעל
   * 400 מ׳, כולם ללא בדיקה — ושהמקרה הגרוע, מכללת שנקר ביחס 3.38,
   * היה **חורג מהסף הכתוב**. הכלל היה תופס אותו; הוא לא רץ.
   *
   * הבקרה שמבודדת את זה, בלי רשת:
   *     walkEstimate(788, 2668) → true    יחס 3.3858
   *     walkEstimate(399, 1350) → false   יחס 3.3835
   * אותו יחס עד האלפית, תוצאה הפוכה, המשתנה היחיד הוא האווירי.
   *
   * עכשיו הסף חל **בכל הטווחים**. זה גם מחזיר הגנה למרחקים הארוכים,
   * שבהם לא הייתה כל הגנה, וגם מפסיק לפסול עקיפות רגליות אמיתיות
   * קצרות — בילינסון (33 מ׳ אוויריים, 223 הליכה סביב הבניין) ומגדל
   * משה אביב חוזרים להציג זמן.
   *
   * הפער נמצא על ידי הסשן שחוקר, ושוחזר כאן לפני שתוקן.
   */
  /**
   * המנתב אינו מסרב לנקודה שאינה על דרך — הוא **מצמיד** אותה לדרך
   * הקרובה ביותר ומחזיר מסלול מהנקודה המוצמדת, עם `code: Ok`.
   *
   * **נמצא על המסך של בעל האתר ב-10.11.2026:** הוא לחץ על נקודה
   * אקראית בים וקיבל הוראות הגעה. הנקודה 32.0800,34.7400 הוצמדה
   * **2,430 מ׳** אל החוף, והמסלול שחושב מתחיל שם ולא במקום שנבחר.
   * שומר היחס אינו תופס את זה, כי המסלול מהנקודה המוצמדת סביר לגמרי.
   *
   * **הסף נמדד ולא נוחש.** הצמדה של נקודות לגיטימיות, מול אותו שרת:
   *
   *     תחנה שלנו               4 מ׳
   *     בתוך מרכז עזריאלי        2 מ׳
   *     מרכז קמפוס בילינסון     11 מ׳
   *     בתוך דשא בפארק הירקון   45 מ׳
   *     שדה פתוח מזרחית לפ״ת    87 מ׳   ← הגבוה ביותר שנמדד
   *     ים, 2 ק״מ מהחוף      2,430 מ׳   ← מקרה הכשל
   *
   * 300 יושב פי 3.4 מעל הגבוה שנמדד ופי 8 מתחת לכשל. כמו
   * `MAX_WALK_DETOUR`, זאת קנרית עם מרווח ולא כיול: מי שעומד בשטח
   * סגור גדול עלול להצמיד יותר מ-87, ואסור שהוא ייפסל.
   */
  const MAX_SNAP_M = 300;
  if (snapMetres != null && snapMetres > MAX_SNAP_M) {
    return { metres: airMetres, fromRoute: false, trustTime: false, reason: "snap" };
  }

  const plausible = routeMetres <= airMetres * MAX_WALK_DETOUR;
  return plausible
    ? { metres: routeMetres, fromRoute: true, trustTime: true }
    : { metres: airMetres, fromRoute: false, trustTime: false, reason: "detour" };
}

/**
 * מעל המרחק הזה הליכה אינה הצעה אמיתית, והאתר אינו מציג זמן הליכה.
 * המספר ישב פעמיים — בפאנל התחנה הקרובה ובעמוד התחנה — ולא ישב כלל
 * בכרטיס שנפתח בלחיצה על המפה, שהציע "כ-239 דק׳ הליכה" ל-19.1 ק״מ.
 */
export const WALKABLE_MAX_M = 2500;

export function isWalkable(metres: number | null): boolean {
  return metres !== null && metres <= WALKABLE_MAX_M;
}

/**
 * מה נאמר למשתמש על המרחק שמוצג, כשהמוצג אינו מה שחושב.
 *
 * `walkEstimate` פוסלת מסלול לא סביר ומחזירה במקומו את הקו האווירי
 * **בלי זמן**. עד 07.11.2026 שני המקומות שמציגים את המספר הזה — הפאנל
 * ועמוד התחנה — פשוט השמיטו את הזמן ולא אמרו דבר: המשתמש ראה מרחק
 * שלפעמים מופיע עם זמן ולפעמים בלי, בלי שום הסבר להבדל.
 *
 * זאת אותה מחלקה שבעל האתר תפס בחיפוש הכתובת: **הצגנו משהו אחר ממה
 * שחושב, ולא אמרנו שהחלפנו.** שם זה היה מספר בית, כאן זה המרחק.
 *
 * מעל `WALKABLE_MAX_M` אין הודעה — הממשק כבר אומר "רחוק מכדי ללכת",
 * ושני משפטים על אותו מספר גרועים מאחד.
 *
 * טהורה בכוונה, ולכן `scripts/silent-selftest.mjs` בודק אותה בבלוק.
 */
export function walkNote(est: {
  metres: number | null;
  trustTime: boolean;
  reason?: "detour" | "snap";
}): string | null {
  if (est.metres === null) return null;
  if (!isWalkable(est.metres)) return null;
  if (est.trustTime) return null;
  // שתי סיבות שונות, שני משפטים. משפט אחד לשתיהן היה אומר "עקיף מדי" גם
  // למי שלחץ בים — הסבר שגוי, כי המסלול שם סביר לגמרי והוא פשוט מתחיל
  // במקום אחר. ראו MAX_SNAP_M ב-walkEstimate.
  if (est.reason === "snap") {
    return "הנקודה שנבחרה אינה על דרך להולכי רגל — המרחק הוא קו אווירי, ולכן לא מוצג זמן.";
  }
  return "המרחק הוא קו אווירי — מסלול ההליכה שחזר נראה עקיף מדי, ולכן לא מוצג זמן. קישורי הניווט נותנים את המסלול המדויק.";
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
/**
 * שעות השירות. נקראו מדנקל ב-08.11.2026 מעמוד "שעות פעילות ולוחות
 * זמנים", שמוגש מהשרת ולכן ניתן לאימות חוזר — `scripts/hours-live.mjs`
 * מושך אותו בכל הרצה של הבלוק.
 *
 * **דנקל אינה נותנת מספר אחד. היא נותנת חמש שורות, לפי מסלול וכיוון:**
 *
 *     R1  הקוממיות → פ״ת CBS      חול 05:30–23:40   שישי 14:10   מוצ״ש 18:20
 *     R1  פ״ת CBS → הקוממיות      חול 05:30–00:00   שישי 14:10   מוצ״ש 18:20
 *     R2  הקוממיות → קריית אריה   חול עד 00:10      שישי 14:40   מוצ״ש —
 *     R3  קריית אריה → אליפלט     חול 05:30–00:05   שישי 15:00   מוצ״ש 18:20
 *     R3  אליפלט → קריית אריה     חול 05:30–00:30   שישי 15:15   מוצ״ש 18:20
 *
 * עד 08.11.2026 ישב כאן 15:40 לשישי ו-19:45 למוצ״ש. **אף אחד מהשניים
 * אינו מופיע בשום שורה אצל דנקל.** המאוחר ביותר בשישי הוא 15:15 והמסלול
 * הראשי הוא 14:10, וכל חמש השורות אומרות 18:20 במוצ״ש. כלומר האתר הבטיח
 * עד 90 דקות של שירות בשישי שאינו קיים, ואיחר את חידוש השירות במוצ״ש
 * בשעה ורבע — ושלח אנשים למונית בזמן שרכבות כבר נוסעות.
 *
 * **הבחירה כאן שמרנית, ובעל האתר אישר אותה:** המוקדם ביותר לאחרונה
 * בשישי, המאוחר ביותר לראשונה במוצ״ש. כך האתר לעולם אינו מבטיח יותר
 * ממה שיש. המחיר הוא שמי שנוסע ב-R3 מקבל פחות משיש לו — 14:10 במקום
 * 15:15 — וזה הצד הנכון לטעות בו.
 *
 * **ואלה אינן שעות קבועות.** דנקל כותבת בתחתית העמוד: "שעות הפעילות
 * בימי שישי ובמוצ״ש משתנות בהתאם לזמני כניסת/יציאת שבת". מספר קבוע כאן
 * יתיישן בכל שינוי עונה, וזה מה שקרה ל-15:40 ול-19:45. הבדיקה החיה היא
 * מה שיתפוס את זה, לא הזיכרון של מי שיקרא את הקובץ.
 *
 * `WEEKDAY_LAST_MINS` נשאר חצות: הוא בטווח שדנקל נותנת (23:40 עד 00:30),
 * והוא גם הגבול העליון של `serviceWindow` ולא יציאה מוצהרת.
 */
export const FRIDAY_LAST_MINS = 14 * 60 + 10;
export const SATURDAY_NIGHT_FIRST_MINS = 18 * 60 + 20;
export const SERVICE_FIRST_MINS = 5 * 60 + 30;
export const WEEKDAY_LAST_MINS = 24 * 60;
// התדירות הוגדרה כאן ושוכפלה ביד בעמוד השעות. עכשיו שניהם קוראים מכאן.
export const PEAK_WINDOWS: readonly (readonly [number, number])[] = [[7, 9], [16, 19]];
export const PEAK_FREQ_MINS = 3.5;
export const BASE_FREQ_MINS = 6;

/**
 * כשאין שירות בזמן המבוקש, findRoute מחזירה את זה במקום לוח זמנים.
 * קודם לכן היא התעלמה משעות הפעילות לחלוטין: בשבת ב-10:00 היא החזירה
 * "יציאה 10:00, הגעה 10:12", והכרטיס הוצג בלי שום אזהרה.
 */
export type NoService = { noService: true; reason: string };

// מיוצא כדי שעמוד השעות יציג את אותן דקות באותו פורמט.
export const hhmm = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/**
 * המשפט שמסביר **למה** אין רכבת ברגע נתון.
 *
 * מיוצא מ-09.11.2026: עד אז הוא שירת רק את מתכנן הנסיעה, וכרטיס הסטטוס
 * ב-/hours אמר בענף השלישי שלו "בדקו את לוח הזמנים השבועי למטה" — נכון,
 * וחסר תועלת בדיוק ברגע שבו המשתמש שואל. נמדדו 32 דקות בשבוע שבהן
 * הכרטיס אמר "לא פועלת כרגע" והטבלה באותו מסך הבטיחה שירות
 * (`scripts/card-vs-table.mjs`), ובכולן המשפט הזה אומר את הדבר הנכון.
 * שלושת המסכים חולקים עכשיו ניסוח אחד ואינם יכולים להיחלק.
 */
export function describeNoService(date: Date): string {
  const t = getDayType(date);
  const mins = date.getHours() * 60 + date.getMinutes();
  if (t === "saturday" && mins < SATURDAY_NIGHT_FIRST_MINS)
    return `הרכבת אינה פועלת בשבת. השירות מתחדש במוצאי שבת ב-${hhmm(SATURDAY_NIGHT_FIRST_MINS)}.`;
  // >= ולא > : בשישי בין 15:37 ל-15:40 כבר אין יציאה, אבל השעה עוד לא
  // עברה את FRIDAY_LAST_MINS. בתנאי הקודם ארבע הדקות האלה נפלו לשורה
  // האחרונה ואמרו "מתחדש מחר ב-05:30" — ובשישי מחר היא שבת, שבה אין
  // שירות עד מוצאי שבת. נחשף כשהגבול העליון נכנס ל-isOperating.
  // **"יוצאת ב-14:10" הוחלף ב-"נגמר ב-14:10" ב-09.11.2026.** הענף הזה
  // נקרא רק כשאין שירות, ובשישי מעל 05:30 פירושו שהיציאה האחרונה כבר
  // הייתה — ולכן זמן עתיד הבטיח רכבת שלא תגיע. ב-14:07–14:10 זה היה
  // בולט במיוחד: ארבע דקות בכל שבוע שבהן המשפט מבטיח יציאה בעוד רגע.
  // "השירות נגמר ב-" מתאר את חלון השירות שדנקל מפרסמת, והוא נכון בכל
  // דקה בענף — גם ב-14:08 וגם ב-20:00 — בלי להבטיח יציאה.
  if (t === "friday" && mins >= SERVICE_FIRST_MINS)
    return `בערב שבת השירות נגמר ב-${hhmm(FRIDAY_LAST_MINS)}. הוא מתחדש במוצאי שבת ב-${hhmm(SATURDAY_NIGHT_FIRST_MINS)}.`;
  if (mins < SERVICE_FIRST_MINS)
    return `הרכבת מתחילה לפעול ב-${hhmm(SERVICE_FIRST_MINS)}.`;
  // נשארנו בתוך שעות השירות אבל אין עוד יציאה היום — כלומר הרכבת
  // האחרונה כבר יצאה, והבאה היא כבר מחר.
  return `הרכבת האחרונה להיום כבר יצאה. השירות מתחדש מחר ב-${hhmm(SERVICE_FIRST_MINS)}.`;
}

/**
 * חלון השירות של אותו יום, בדקות מחצות: הדקה הראשונה שבה רכבת יכולה
 * לצאת והאחרונה. ביום חול ובמוצאי שבת הגבול הוא חצות, כלומר 1439 —
 * וזה הקורא הראשון של WEEKDAY_LAST_MINS מחוץ לתצוגה.
 */
function serviceWindow(date: Date): { from: number; to: number } {
  const t = getDayType(date);
  if (t === "saturday") return { from: SATURDAY_NIGHT_FIRST_MINS, to: WEEKDAY_LAST_MINS - 1 };
  if (t === "friday") return { from: SERVICE_FIRST_MINS, to: FRIDAY_LAST_MINS };
  return { from: SERVICE_FIRST_MINS, to: WEEKDAY_LAST_MINS - 1 };
}

/**
 * היציאה הבאה באותו יום, בדקות מחצות, או null כשכבר אין.
 *
 * אותה רשת שמייצרת getNextDepartures: מתחילת החלון, כל frequency דקות.
 * מכאן ששתי התשובות אינן יכולות להיחלק.
 */
function nextDepartureMins(date: Date): number | null {
  const w = serviceWindow(date);
  const mins = date.getHours() * 60 + date.getMinutes();
  if (mins < w.from || mins > w.to) return null;
  const f = getFrequencyMins(date);
  const dep = w.from + Math.ceil((mins - w.from) / f) * f;
  return dep <= w.to ? dep : null;
}

/**
 * האם רכבת עוד תצא היום. זאת השאלה ש"הרכבת הקלה פועלת עכשיו" בעמוד
 * השעות באמת שואל.
 *
 * עד 03.11.2026 הענף של יום חול היה `mins >= SERVICE_FIRST_MINS` בלבד,
 * בלי שום גבול עליון, ו-WEEKDAY_LAST_MINS היה מוגדר ולא נקרא. הגבול
 * נאכף במקרה ובמקום אחר: getNextDepartures מוסיף דקות ל-Date, התאריך
 * מתגלגל אחרי חצות, ושם הבדיקה נכשלת דווקא על הגבול **התחתון** של
 * הבוקר. כך /hours הכריז "פועלת עכשיו" בזמן שהמתכנן באותו רגע ענה
 * "הרכבת האחרונה להיום כבר יצאה".
 *
 * נמדד דקה-דקה לפני התיקון, כל שבעת הימים ועל ארבעה זוגות תחנות:
 *
 *     ראשון–חמישי   23:55–23:59   5 דק׳ ליום
 *     שישי          15:37–15:40   4 דק׳
 *     שבת           23:58–23:59   2 דק׳        סה״כ 31 דק׳ בשבוע
 *
 * החלון היה רחב 5 דקות בלי קשר לאורך הנסיעה — נבדק על 2, 10 ו-62 דקות
 * — כי הוא נגזר מרשת היציאות ולא מהנסיעה. זו אותה מחלקה ש-1aabe49 תיקן
 * לשבת, בכיוון ההפוך.
 */
export function isOperating(date: Date): boolean {
  return nextDepartureMins(date) !== null;
}
export function isSaturdayNight(date: Date): boolean {
  return date.getDay() === 6 && date.getHours() * 60 + date.getMinutes() >= SATURDAY_NIGHT_FIRST_MINS;
}
export function getFrequencyMins(date: Date): number {
  const hour = date.getHours();
  const isPeak = PEAK_WINDOWS.some(([from, to]) => hour >= from && hour < to);
  return isPeak ? PEAK_FREQ_MINS : BASE_FREQ_MINS;
}
/**
 * ערכי הפתיחה של בורר השעה — היום, השעה והדקה שבהן הוא נפתח. נקרא
 * מ-TimeChoice בבחירה הראשונה של "יוצא ב־" או "מגיע ב־"; עד 02.11.2026
 * הכפתור שפתח אותו נקרא "בחר זמן".
 *
 * שני הבוררים נפתחו קודם על 08:00 קבוע: עמוד תחנה על "שני 08:00" בלי
 * קשר לשעה, ועמוד הבית על היום הנוכחי ב-08:00. נמדד 02.11.2026 מול
 * ביטוי התאריך שבעמוד התחנה: מי שבחר שעה מפורשת ביום שני ב-21:00
 * וחיפש, תכנן נסיעה ל-08:00 של אותו יום — שלוש-עשרה שעות בעבר, בלי
 * שום סימן. בעמוד הבית זה קרה לכל כניסה אחרי שמונה בבוקר.
 *
 * ארבעה ממשקים שנבדקו באותו יום (גוגל מפות, רכבת גרמניה, Moovit,
 * bus.gov.il) נפתחים על השעה הנוכחית. שניים מהם גם נותנים כפתור
 * "עכשיו" בתוך העורך.
 *
 * העיגול כלפי מעלה ולא מטה, כי `stepMinutes` יכול להיות 15: עיגול
 * מטה היה מחזיר עד 14 דקות אחורה — אותו באג בקטן. `setMinutes(60)`
 * מגלגל את השעה ואת התאריך, ולכן `getDay()` שלמטה נכון גם בחצות.
 *
 * `stepMinutes` חייב להיות הקפיצה שבאפשרויות ה-select של אותו עמוד,
 * אחרת תיבחר דקה שאינה ברשימה וה-select ייפתח ריק. בשני העמודים
 * אותו קבוע מזין גם את הרשימה וגם את הקריאה לכאן.
 */
export function pickerDefaults(stepMinutes: number, now: Date = new Date()): {
  day: number;
  hour: number;
  minute: number;
} {
  const d = new Date(now);
  d.setSeconds(0, 0);
  d.setMinutes(Math.ceil(d.getMinutes() / stepMinutes) * stepMinutes);
  const m = nextServiceMoment(d);
  // מעגלים שוב, כי תחילת שירות אינה בהכרח על רשת הקפיצה. שני המועדים
  // הקיימים — 05:30 ו-19:45 — כן מתחלקים ב-15 וב-1, ולכן זה no-op
  // היום; השורה כאן כדי שקפיצה אחרת בעתיד לא תיתן דקה מחוץ לרשימה.
  m.setMinutes(Math.ceil(m.getMinutes() / stepMinutes) * stepMinutes);
  return { day: m.getDay(), hour: m.getHours(), minute: m.getMinutes() };
}

/**
 * הרגע הקרוב ביותר מ-`from` והלאה שבו באמת אפשר לנסוע.
 *
 * בלי זה בורר הזמן נפתח על משבצת שהמתכנן עונה עליה "אין רכבת". נמדד
 * ב-03.11.2026: בעמוד התחנה הקפיצה היא 15 דקות, ולכן מ-23:46
 * `Math.ceil(46/15)*15` יוצא 60 והיום מתגלגל — הבורר נפתח על "מחר
 * 00:00", שהיא בדיוק המשבצת שבה היציאה האחרונה כבר יצאה. 14 דקות ביום.
 * בעמוד הבית הקפיצה היא 1, ושם זה קרה רק ב-23:59.
 *
 * מחפש קדימה יום-יום ולא דקה-דקה: בכל יום יש חלון אחד רציף, ולכן די
 * לבדוק את תחילתו. שמונה ימים הם חסם ולא ציפייה — היום הארוך ביותר בלי
 * שירות הוא שבת, ואחריה תמיד יש מוצאי שבת.
 */
function nextServiceMoment(from: Date): Date {
  const d = new Date(from);
  d.setSeconds(0, 0);
  for (let i = 0; i < 8; i++) {
    const w = serviceWindow(d);
    // ביום הראשון מתחילים מהשעה עצמה; בימים שאחריו מתחילת היום.
    const mins = i === 0 ? d.getHours() * 60 + d.getMinutes() : 0;
    const start = Math.max(mins, w.from);
    if (start <= w.to) {
      const at = new Date(d);
      at.setHours(0, start, 0, 0);
      if (nextDepartureMins(at) !== null) return at;
    }
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
  }
  return from;
}

export const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"] as const;
const MONTH_SHORT = ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"] as const;

/**
 * התאריך הקרוב ביותר שבו חל יום השבוע `day` (0=ראשון), היום כולל.
 *
 * הביטוי הזה היה כתוב ביד בשני הבוררים, וממנו נגזר התאריך שהחיפוש
 * באמת משתמש בו. עכשיו גם התווית שהמשתמש קורא נגזרת מכאן, כדי ששתיהן
 * לא יוכלו להגיד שני תאריכים שונים.
 */
function dayOffset(day: number, now: Date): number {
  return (day - now.getDay() + 7) % 7;
}
export function dateForDay(day: number, now: Date = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset(day, now));
  return d;
}

/**
 * "היום, 2 בנוב׳" · "מחר, 3 בנוב׳" · "שני, 9 בנוב׳"
 *
 * הבורר הראה שם יום בלבד. "שני" ביום שלישי הוא בעוד שישה ימים, והממשק
 * לא אמר את זה בשום מקום — נמדד 02.11.2026 שבחירת "שני" ביום שלישי
 * ב-09:00 מתכננת נסיעה בעוד 143 שעות. גוגל מפות מציגה "יום ב׳, 2 בנוב׳"
 * ורכבת גרמניה מציגה לוח שנה עם תאריכים; אף אחת מהן לא נותנת שם יום לבד.
 */
export function dayLabel(day: number, now: Date = new Date()): string {
  const d = dateForDay(day, now);
  const offset = dayOffset(day, now);
  const date = `${d.getDate()} ב${MONTH_SHORT[d.getMonth()]}`;
  if (offset === 0) return `היום, ${date}`;
  if (offset === 1) return `מחר, ${date}`;
  return `${DAY_NAMES[day]}, ${date}`;
}

/**
 * שבעת הימים הקרובים, לפי סדר התאריכים ולא לפי סדר ימות השבוע.
 *
 * הרשימה הייתה ראשון עד שבת תמיד, כך שביום שלישי היא נפתחה בראשון —
 * שהוא בעוד חמישה ימים — והתאריכים ירדו ואז קפצו. `value` נשאר
 * `getDay()`, ולכן שום חישוב במעלה הזרם לא משתנה.
 */
export function dayOptions(now: Date = new Date()): { value: number; label: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const value = (now.getDay() + i) % 7;
    return { value, label: dayLabel(value, now) };
  });
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
  const travel = travelMinutes(fromName, toName);
  if (travel === null) return null;
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
