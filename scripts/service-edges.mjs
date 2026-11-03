// הסכמה בין "פועלת עכשיו" לבין המתכנן, על המודול עצמו.
//
// עד 03.11.2026 isOperating ביום חול היה `mins >= SERVICE_FIRST_MINS` בלי
// גבול עליון. הגבול נאכף במקום אחר ובמקרה: getNextDepartures מוסיף דקות
// ל-Date, התאריך מתגלגל אחרי חצות, ושם הבדיקה נכשלת על הגבול התחתון של
// הבוקר. התוצאה הייתה 31 דקות בשבוע שבהן /hours הכריז "פועלת עכשיו"
// והמתכנן באותו רגע ענה "הרכבת האחרונה להיום כבר יצאה":
//
//     ראשון–חמישי 23:55–23:59 · שישי 15:37–15:40 · שבת 23:58–23:59
//
// הבדיקה סורקת את כל 1440 הדקות בכל שבעת הימים. היא אטית מ-grep אבל זו
// המחלקה היחידה כאן שאי אפשר לתפוס בתבנית — שתי פונקציות שמסכימות
// בדיוק 10,049 פעם ונחלקות 31.
//
// counts מדפיס: דקות-סתירה · ימים · יציאה אחרונה בחול/שישי/מוצ״ש
// הראשון בסיס 0. השני בקרה — אם הוא 0 הייבוא נכשל והאפס שלפניו ריק.
// שלושת הזמנים הם בקרה חיובית נוספת: הם חייבים להיות שעות אמיתיות.
const d = await import(new URL("../app/lib/data.ts", import.meta.url).pathname);
const { isOperating, findRoute, isNoService, hhmm } = d;

const BASE = new Date("2026-11-01T00:00:00"); // ראשון
const PAIR = ["אבא הלל", "אלנבי"];

let conflicts = 0, days = 0;
const lastDep = {};
for (let dow = 0; dow < 7; dow++) {
  days++;
  let last = null;
  for (let m = 0; m < 1440; m++) {
    const t = new Date(BASE);
    t.setDate(BASE.getDate() + dow);
    t.setHours(0, m, 0, 0);
    const op = isOperating(t);
    if (op) last = m;
    const r = findRoute(PAIR[0], PAIR[1], undefined, t);
    const plannable = r !== null && !isNoService(r);
    if (op !== plannable) conflicts++;
  }
  if (dow === 2) lastDep.weekday = last;   // שלישי
  if (dow === 5) lastDep.friday = last;    // שישי
  if (dow === 6) lastDep.saturday = last;  // שבת
}

const fmt = v => (v === null ? "—" : hhmm(v));
if (process.argv[2] === "counts") {
  console.log([conflicts, days, fmt(lastDep.weekday), fmt(lastDep.friday), fmt(lastDep.saturday)].join(" · "));
} else {
  console.log(`דקות סתירה בשבוע: ${conflicts}`);
  console.log(`ימים שנסרקו: ${days}`);
  console.log(`יציאה אחרונה — חול ${fmt(lastDep.weekday)} · שישי ${fmt(lastDep.friday)} · מוצ״ש ${fmt(lastDep.saturday)}`);
}
