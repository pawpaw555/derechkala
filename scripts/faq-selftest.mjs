// בדיקה של הבדיקה. כלל 11א: בדיקה שלא נראתה נופלת היא השערה.
//
// compareFaqPage משווה את ה-FAQPage ב-JSON-LD למסמך הנראה. כדי להוכיח
// שהיא תופסת צריך אי-התאמה אמיתית — ואת זאת אי אפשר לייצר על העמוד
// החי בלי לערוך את MapContent.tsx ואת map/page.tsx, שהם קבצים שסשן
// אחר עבד עליהם. לכן הקלט כאן מבוקר, והקוד הנבדק הוא הקוד האמיתי.
//
// בלי רשת, בלי שרת. רץ בבלוק ולכן ההוכחה אינה תלויה בזיכרון של אף אחד.
import { compareFaqPage } from "./faq-rendered.mjs";

const page = (items) => `<html><body><p>הקו האדום</p>
<script type="application/ld+json">${JSON.stringify({"@type":"FAQPage",mainEntity:items})}</script>
</body></html>`;
const Q = (n,a) => ({ "@type":"Question", name:n, acceptedAnswer:{ "@type":"Answer", text:a } });

const tests = [
  ["בקרה חיובית — שניהם גלויים", page([Q("שאלה א","תשובה א")]), "שאלה א תשובה א הקו האדום", 0],
  ["תשובה שאינה גלויה",          page([Q("שאלה א","תשובה א")]), "שאלה א הקו האדום",            1],
  ["שאלה שאינה גלויה",           page([Q("שאלה א","תשובה א")]), "תשובה א הקו האדום",           1],
  ["שניהם חסרים",                page([Q("שאלה א","תשובה א")]), "הקו האדום",                   2],
  ["שישה פריטים, אחד שבור",      page([Q("q1","a1"),Q("q2","a2"),Q("q3","a3"),Q("q4","a4"),Q("q5","a5"),Q("q6","a6")]),
                                  "q1 a1 q2 a2 q3 a3 q4 a4 q5 a5 q6", 1],
];
const QUIET = process.argv[2] === "count";
const say = (...a) => { if (!QUIET) console.log(...a); };

let fail = 0;
let ran = 0;
for (const [label, html, vis, want] of tests) {
  const { gaps, pairs } = compareFaqPage("בדיקה", html, vis);
  const ok = gaps.length === want;
  if (!ok) fail++;
  ran++;
  say(`${ok?"✓":"✗"} ${label.padEnd(30)} פערים ${gaps.length} (צפוי ${want}) · זוגות ${pairs}`);
  for (const g of gaps) say("      " + g);
}
// בלי FAQPage בכלל
const r = compareFaqPage("בדיקה", "<html><body>כלום</body></html>", "כלום");
const ok = r.found === false && r.gaps.length === 1;
if (!ok) fail++;
ran++;
say(`${ok?"✓":"✗"} בלי FAQPage                     found=${r.found} · ${r.gaps[0]}`);

// נכשלו / נבדקו. מספר המקרים הוא הבקרה: 0 מתוך 0 נראה כמו הצלחה.
if (QUIET) console.log("%d/%d", fail, ran);
else console.log(fail ? `\n${fail} מתוך ${ran} נכשלו` : `\nכל ${ran} המקרים עברו`);
process.exit(fail ? 1 : 0);
