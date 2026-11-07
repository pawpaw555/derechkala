#!/usr/bin/env node
// האם שרת הניתוב באמת מכבד את הפרופיל.
//
// זאת הבדיקה שהייתה תופסת את התקלה ביום שהיא נולדה. האתר ביקש
// `/route/v1/foot/` מ-`router.project-osrm.org` במשך חודשים, קיבל `Ok`,
// וקיבל ניתוב רכב — כי אותו שרת **זורק את הנתיב**. נמדד: `foot`,
// `driving`, `banana` ואפילו `zzz-not-a-profile` החזירו תוצאה זהה
// בייט לבייט. המסמרה: `routed-car` של FOSSGIS מחזיר **בדיוק** את
// אותו מספר — כלומר השרת הישן הוא פרופיל הרכב, מילולית.
//
// הרעיון להשוות פרופילים הגיע מהסשן שחוקר, והמדידה שלו שוחזרה כאן
// לפני שנכתבה הבדיקה.
//
// הבדיקה אינה שואלת "כמה מטר" אלא **"האם הליכה שונה מנסיעה"**. אם
// FOSSGIS יאחד פרופילים או יפנה אותם לאותו מנוע, השורה הזאת תיפול
// באותו יום — ולא חודשים אחרי, כשמישהו ישאל למה כתוב 33 דקות.
import { liveText } from "./net.mjs";

const HOST = "https://routing.openstreetmap.de";
// יוספטל → בנימין בבת ים. שתי תחנות סמוכות שבהן חד-סטרי מנפח את
// מסלול הרכב פי כמה, ולכן ההפרש בין הפרופילים גדול וברור.
const SEG = "34.7488,32.0163;34.7471691,32.01662";

async function one(service) {
  const txt = await liveText(`${service}`, `${HOST}/${service}/route/v1/driving/${SEG}?overview=false`, {
    headers: { "user-agent": "derechkala-verify/1.0" },
    signal: AbortSignal.timeout(60000),
  });
  try {
    const rt = JSON.parse(txt).routes?.[0];
    return rt ? { metres: rt.distance, pace: rt.distance / (rt.duration / 60) } : null;
  } catch {
    return null;
  }
}

const foot = await one("routed-foot");
const car = await one("routed-car");

// הבקרה: שני הפרופילים ענו בכלל. בלעדיה "שונים: לא" מתוך שתי תשובות
// ריקות נראה כמו שרת שקרס, ולא כמו פרופילים שהתאחדו.
const answered = foot !== null && car !== null;
// קצב הליכה סביר, ובוודאי לא קצב רכב. 513 מ׳/דק׳ זה 31 קמ״ש.
const walks = answered && foot.pace >= 40 && foot.pace <= 130;
const differs = answered && Math.abs(foot.metres - car.metres) > 1;

if (process.argv[2] === "count") {
  console.log(
    "%s · %s · בקרה: %s",
    differs ? "שונים" : "זהים",
    walks ? "קצב הליכה" : "לא קצב הליכה",
    answered ? "כן" : "לא"
  );
} else {
  console.log("שרת: %s\n", HOST);
  // console.log אינו תומך ברוחב שדה כמו %-12s — הוא מדפיס אותו כפשוטו.
  for (const [n, r] of [["routed-foot", foot], ["routed-car", car]])
    console.log("  %s %s", n.padEnd(12), r ? `${r.metres.toFixed(1)} מ׳ · ${r.pace.toFixed(1)} מ׳/דק׳` : "לא ענה");
  console.log("\nשונים זה מזה: %s · קצב הליכה סביר: %s", differs ? "כן" : "**לא**", walks ? "כן" : "**לא**");
  if (!differs && answered)
    console.log("\n⚠ הפרופילים התאחדו. זאת בדיוק התקלה שהייתה בשרת הקודם.");
}

process.exit(answered && walks && differs ? 0 : 1);
