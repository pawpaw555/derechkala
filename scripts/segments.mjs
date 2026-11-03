// קטעי הקו האדום — נבדקים על הקוד האמיתי, לא על שחזור שלו (כלל 11).
//
// הקו הוא Y: הצומת אהרונוביץ', ענף לפתח תקווה, ענף לקריית אריה, וגזע
// לבת ים. STATIONS הוא מערך שטוח, ובו שנקר (סוף ענף אחד) יושב מיד לפני
// קריית אריה (סוף הענף האחר). כל מי שגוזר שכנות ממקום במערך מצייר
// ביניהן מסילה שאינה קיימת — וזה מה שקרה גם ברשימה וגם בפוליליין.
//
// Node 24 מריץ TypeScript ישירות, ו-data.ts בלי ייבואים, ולכן הבדיקה
// מייבאת את המודול עצמו ולא מפרסרת אותו.
//
// counts מדפיס חמישה שדות:
//   לא-מכוסות · תחנות · תפרים · שנקר↔קריית-אריה · שחם↔שנקר
// הראשון בסיס 0, השני בקרה (אם הוא 0 הייבוא נכשל והאפס שלפניו חסר
// משמעות), השלישי בסיס 1 — התפר האחד שהרשימה מסמנת, והאחרונים שני
// קצות המטבע: טענה שחייבת להיות false וטענה שחייבת להיות true.
const here = new URL(".", import.meta.url).pathname;
const d = await import(`${here}../app/lib/data.ts`);
const { STATIONS, LINE_SEGMENTS, areAdjacent } = d;

const CITIES = ["פתח תקווה", "בני ברק", "רמת גן", "תל אביב", "בת ים"];
const red = STATIONS.filter(s => s.lineId === "red");
const covered = new Set((LINE_SEGMENTS.red ?? []).flat());
const uncovered = red.filter(s => !covered.has(s.name));

// התפרים שהרשימה בעמוד תסמן: זוגות עוקבים בקבוצת עיר שאינם שכנים.
let seams = 0;
for (const city of CITIES) {
  const g = red.filter(s => s.city === city);
  for (let i = 0; i < g.length - 1; i++)
    if (!areAdjacent("red", g[i].name, g[i + 1].name)) seams++;
}

const mode = process.argv[2];
if (mode === "counts") {
  console.log([
    uncovered.length,
    red.length,
    seams,
    areAdjacent("red", "שנקר", "קריית אריה"),
    areAdjacent("red", "שחם", "שנקר"),
  ].join(" · "));
} else {
  console.log(`תחנות אדומות: ${red.length}`);
  (LINE_SEGMENTS.red ?? []).forEach((s, i) =>
    console.log(`  קטע ${i}: ${s.length} — ${s[0]} … ${s[s.length - 1]}`));
  console.log(`לא מכוסות: ${uncovered.map(s => s.name).join(", ") || "אין"}`);
  console.log(`תפרים ברשימה: ${seams}`);
}
