#!/usr/bin/env node
// טבלת הצלבה לקואורדינטות של LANDMARKS. כלל 2.
//
// ── למה היא קיימת ──────────────────────────────────────────────────
// 65 רשומות ב-LANDMARKS מציגות "X דקות הליכה" שנכתב ביד
// (HomeContent.tsx:154, StationClient.tsx:622), ואף אחת מהן אינה נושאת
// קואורדינטה. מספר שנכתב ביד אין לו מול מה להיבדק — לא היום ולא מחר.
// עם קואורדינטה הזמן נגזר מהמנתב, והבלוק בודק אותו בכל הרצה.
//
// ── ולמה היא לא נבנתה קודם ─────────────────────────────────────────
// נקבע כאן שאין מקור שני בלתי תלוי שעונה לקריאה אוטומטית. **זה היה
// רחב מדי, ובעל האתר הוא ששאל.** govmap מחזיר 403 וגוגל מפות אינו
// קריא אוטומטית — אבל ויקינתונים כן עונה, והקואורדינטה שלו מגיעה
// מוויקיפדיה (P143) או ממקור מצוטט (P248), **ולא מ-OpenStreetMap**.
// נמדד 09.11.2026: בילינסון נושא P143 → Q191168 (ויקיפדיה העברית).
//
// Nominatim ו-Photon, לעומת זאת, **אינם** שני מקורות: שניהם קוראים את
// אותו OSM, ובמדגם הפער ביניהם היה 0 מטר בכל רשומה שבה שניהם ענו.
// "דנקל שמצטט את נת״ע הוא מקור אחד" — אותו כלל בדיוק.
//
// ── שלוש העמודות ───────────────────────────────────────────────────
//   OSM           Photon. עונה לרוב, וטועה לפעמים בעיר.
//   ויקינתונים    בלתי תלוי. עונה לחלק, וטועה לפעמים ביבשת.
//   מרחק מהתחנה   הקואורדינטות שלנו, שכבר מאומתות. עונה תמיד.
//
// שלושתן יחד תופסות את שלושת סוגי הכישלון, וכל אחת לבדה מחמיצה אחד.
// נמדד על 12: ההצלבה תפסה את מוזיאון האדם והסביבה (OSM שגוי ב-6.5
// ק״מ), את בורסת היהלומים (ויקינתונים החזיר את בורסת סוראט שבהודו,
// 3,946 ק״מ) ואת תיאטרון המסילה (13.5 ק״מ מהתחנה, ויקינתונים שתק).
//
// ── 34 מתוך 65 אינן נקודות ציון ────────────────────────────────────
// הן כתובות התחנות עצמן — "ז'בוטינסקי 101 פתח תקווה → שנקר" היא
// הכתובת של שנקר. נמדד: 32 מתוך 34 תואמות מילולית לכתובת התחנה,
// ושתי החריגות הן שתי הכניסות של קרליבך, כלומר גם הן. הכתובות האלה
// כבר אומתו מול דנקל ונעולות בבלוק (0 בלי שדה מקור), ולכן הן אינן
// צריכות גיאוקודינג כלל: הקואורדינטה שלהן היא של התחנה.
//
// ── הסף ──────────────────────────────────────────────────────────
// 2,000 מ׳ מהתחנה הוא **קנרית ולא כיול**: הזמן הכתוב ביד הגדול ביותר
// הוא 11 דקות, כלומר 880 מ׳ ב-80 מ׳ לדקה. הסף יושב הרבה מעל כל מה
// שלגיטימי, ותפקידו לתפוס "עיר אחרת" ולא למיין הליכות.
import { load } from "./load.mjs";
import { writeFile } from "node:fs/promises";

const UA = "derechkala-landmark-geo/1.0";
const AGREE_M = 150;      // שני מקורות נחשבים מסכימים עד 150 מ׳
const STATION_MAX_M = 2000;
const PACE = 80;          // מ׳ לדקה — נמדד מול 22 מסלולים אמיתיים

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hav = (a, b, c, d) => {
  const R = 6371000, p = Math.PI / 180;
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

async function getJson(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25000) });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

async function osm(q, lat, lon) {
  const j = await getJson(`https://photon.komoot.io/api?q=${encodeURIComponent(q)}&limit=1&lat=${lat}&lon=${lon}`);
  const f = j?.features?.[0];
  return f ? { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] } : null;
}

async function wikidata(q) {
  const sj = await getJson(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=he&uselang=he&format=json&limit=3`);
  for (const hit of sj?.search ?? []) {
    await sleep(250);
    const e = await getJson(`https://www.wikidata.org/wiki/Special:EntityData/${hit.id}.json`);
    const ent = e && Object.values(e.entities)[0];
    const c = ent?.claims?.P625?.[0];
    if (!c) continue;
    const v = c.mainsnak.datavalue.value;
    const refs = (c.references ?? []).flatMap((r) => Object.keys(r.snaks)).join(",");
    return { lat: v.latitude, lon: v.longitude, id: hit.id, refs: refs || "ללא מקור מצוטט" };
  }
  return null;
}

async function route(aLat, aLon, bLat, bLon) {
  const j = await getJson(`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${aLon},${aLat};${bLon},${bLat}?overview=false`);
  return j?.routes?.[0] ? Math.round(j.routes[0].distance) : null;
}

const m = await load();
const station = new Map(m.STATIONS.map((s) => [s.name, s]));
const content = m.STATION_CONTENT;
const norm = (s) => (s || "").replace(/[,'׳]/g, "").replace(/\s+/g, " ").trim();

// ── מצב check ────────────────────────────────────────────────────
// בלי רשת. בודק את מה שכבר יושב ב-data.ts, ולכן יכול לרוץ בבלוק בכל
// הרצה: כל קואורדינטה שנכתבה חייבת להיות בטווח שפוי מהתחנה שאליה
// הרשומה משויכת, וכל רשומה עם קואורדינטה חייבת לשאת שדה מקור.
// זאת העמודה השלישית של הטבלה — הקואורדינטות שלנו, שכבר מאומתות —
// והיא זאת שתפסה את איכילוב ואת וולפסון כשהגיאוקודר שלח אותם 6 ו-8
// ק״מ משם, ואת תיאטרון המסילה ב-13.5 ק״מ.
if (process.argv[2] === "check") {
  const withCoord = m.LANDMARKS.filter((l) => l.lat !== undefined);
  const far = [], noSource = [];
  for (const l of withCoord) {
    const st = station.get(l.stationName);
    if (!st) continue;
    const d = Math.round(hav(l.lat, l.lng, st.lat, st.lng));
    if (d > STATION_MAX_M) far.push(`${l.name} · ${d} מ׳`);
    if (!l.coordSource || !l.coordVerification) noSource.push(l.name);
  }
  // בקרה חיובית: הקיצוניות שנמדדה בפועל. אם המקסימום צנח לאפס,
  // הקואורדינטות נמחקו או שהחישוב שבור — ו-"0 רחוקות" היה נכון
  // על אוכלוסייה ריקה.
  const maxD = Math.max(0, ...withCoord.map((l) => {
    const st = station.get(l.stationName);
    return st ? Math.round(hav(l.lat, l.lng, st.lat, st.lng)) : 0;
  }));
  if (process.argv.includes("count"))
    console.log("%d · %d · %d · הרחוקה ביותר %d מ׳", withCoord.length, far.length, noSource.length, maxD);
  else {
    console.log("עם קואורדינטה %d מתוך %d · רחוקות מהתחנה %d · בלי שדה מקור %d · הרחוקה ביותר %d מ׳",
      withCoord.length, m.LANDMARKS.length, far.length, noSource.length, maxD);
    for (const f of far) console.log("  ✗ רחוקה מהתחנה: %s", f);
    for (const n of noSource) console.log("  ✗ בלי שדה מקור: %s", n);
  }
  process.exit(!far.length && !noSource.length && maxD > 0 ? 0 : 1);
}

// כתובת התחנה עצמה — מזוהה מהנתונים, לא מרשימה שהוקלדה.
//
// הדרישה: **כל** מילה בשם חייבת להופיע בכתובת התחנה. הגרסה הראשונה
// הסתפקה במילה הראשונה כשהכתובת מכילה "כניסה", וזה היה רופף מדי
// לטעמי — אבל שתי הגרסאות מחזירות את אותן 38.
//
// **וזה נבדק אחרי שחשדתי בעצמי, וההנחה שלי הייתה השגויה.** ארבע
// רשומות סווגו ככתובת תחנה עם זמן כתוב ביד של 2 עד 4 דקות ולא 1,
// ולקחתי את זה כסיווג שגוי — בניין אחר באותו רחוב. קריאת הכתובות
// המלאות הראתה שכל הארבע הן **כניסות נוספות של תחנות מרובות-כניסות**:
// אהרונוביץ' היא "כניסה A: ז'בוטינסקי 166, כניסה B: ז'בוטינסקי 117",
// יהודית מגיעה עד "כניסה D", ו"פארק המסילה" כתוב מילולית בכתובת של
// אליפלט. הזמן 2–4 דקות הוא המרחק לכניסה האחרת, והוא נכון.
// כלל 11א: ממצא של בדיקה שנכתבה עכשיו הוא השערה, לא פסק דין.
function isStationAddress(l) {
  const c = content[l.stationName];
  if (!c?.address) return false;
  const a = norm(c.address).replace(/[\/]/g, " ");
  const words = norm(l.name).split(" ").filter(Boolean);
  if (!words.length) return false;
  return words.every((w) => a.includes(w));
}

const rows = [];
for (const l of m.LANDMARKS) {
  const st = station.get(l.stationName);
  if (!st) { rows.push({ name: l.name, stationName: l.stationName, kind: "שגיאה", note: "התחנה אינה קיימת" }); continue; }

  if (isStationAddress(l)) {
    rows.push({
      name: l.name, stationName: l.stationName, handMins: l.walkMins,
      kind: "כתובת התחנה", lat: st.lat, lon: st.lng, metres: 0, derivedMins: 1,
      rating: "מאומת — שרשרת הכתובות מול דנקל", flag: null,
    });
    continue;
  }

  const q = `${l.name}, ישראל`;
  const a = await osm(q, st.lat, st.lng); await sleep(400);
  const b = await wikidata(l.name); await sleep(400);

  const dA = a ? Math.round(hav(a.lat, a.lon, st.lat, st.lng)) : null;
  const dB = b ? Math.round(hav(b.lat, b.lon, st.lat, st.lng)) : null;
  const gap = a && b ? Math.round(hav(a.lat, a.lon, b.lat, b.lon)) : null;

  // מי מהשניים שרד את בדיקת המרחק מהתחנה
  const aOk = dA !== null && dA <= STATION_MAX_M;
  const bOk = dB !== null && dB <= STATION_MAX_M;

  let pick = null, rating = null, flag = null;
  if (a && b && gap <= AGREE_M && aOk) { pick = a; rating = "שני מקורות · OSM + ויקינתונים"; }
  else if (a && b && gap > AGREE_M) {
    if (aOk && !bOk) { pick = a; rating = "מקור יחיד · OSM (ויקינתונים נפסל על המרחק)"; }
    else if (bOk && !aOk) { pick = b; rating = "מקור יחיד · ויקינתונים (OSM נפסל על המרחק)"; }
    else { flag = `שני המקורות ענו ונחלקו ב-${gap} מ׳`; }
  }
  else if (a && aOk) { pick = a; rating = "מקור יחיד · OSM"; }
  else if (b && bOk) { pick = b; rating = "מקור יחיד · ויקינתונים"; }
  else if (a || b) { flag = `כל המועמדים רחוקים מהתחנה (${[dA, dB].filter((x) => x !== null).join(" / ")} מ׳)`; }
  else { flag = "אף מקור לא ענה"; }

  let metres = null, derivedMins = null;
  if (pick) { metres = await route(pick.lat, pick.lon, st.lat, st.lng); await sleep(300);
              if (metres !== null) derivedMins = Math.max(1, Math.round(metres / PACE)); }

  rows.push({
    name: l.name, stationName: l.stationName, handMins: l.walkMins, kind: "נקודת ציון",
    lat: pick?.lat ?? null, lon: pick?.lon ?? null,
    osm: a, wikidata: b, gap, dA, dB, metres, derivedMins, rating, flag,
  });
}

// ── הפלט ──────────────────────────────────────────────────────────
const addr = rows.filter((r) => r.kind === "כתובת התחנה");
const poi = rows.filter((r) => r.kind === "נקודת ציון");
const two = poi.filter((r) => r.rating?.startsWith("שני"));
const one = poi.filter((r) => r.rating?.startsWith("מקור יחיד"));
const flagged = poi.filter((r) => r.flag);
const drift = poi.filter((r) => r.derivedMins !== null && Math.abs(r.derivedMins - r.handMins) >= 3);

const lines = [];
lines.push("# טבלת הקואורדינטות של LANDMARKS — נוצרה " + new Date().toISOString().slice(0, 10));
lines.push("");
lines.push("**הפלט של `scripts/landmark-geo.mjs`. אינו נכתב ביד ואינו נערך ביד.**");
lines.push("");
lines.push("```");
lines.push(`סך הרשומות            ${rows.length}`);
lines.push(`כתובות התחנות        ${addr.length}  ← הקואורדינטה של התחנה, כבר מאומתת`);
lines.push(`נקודות ציון           ${poi.length}`);
lines.push(`   שני מקורות         ${two.length}`);
lines.push(`   מקור יחיד          ${one.length}`);
lines.push(`   דורשות הכרעה       ${flagged.length}  ← Chrome של בעל האתר`);
lines.push("```");
lines.push("");
lines.push("## דורשות הכרעה");
lines.push("");
if (!flagged.length) lines.push("אין.");
for (const r of flagged) lines.push(`- **${r.name}** → ${r.stationName} · כתוב ביד ${r.handMins}′ · ${r.flag}` +
  (r.osm ? `\n    OSM ${r.osm.lat.toFixed(5)},${r.osm.lon.toFixed(5)} (${r.dA} מ׳ מהתחנה)` : "") +
  (r.wikidata ? `\n    ויקינתונים ${r.wikidata.lat.toFixed(5)},${r.wikidata.lon.toFixed(5)} (${r.dB} מ׳ מהתחנה, ${r.wikidata.refs})` : ""));
lines.push("");
lines.push("## הזמן הנגזר רחוק ב-3 דקות או יותר מהכתוב ביד");
lines.push("");
lines.push("אין כאן הכרעה מי צודק — לקואורדינטה יש מקור, למספר הכתוב ביד אין.");
lines.push("");
if (!drift.length) lines.push("אין.");
for (const r of drift) lines.push(`- ${r.name} → ${r.stationName} · ביד ${r.handMins}′ · נגזר ${r.derivedMins}′ (${r.metres} מ׳ מסלול) · ${r.rating}`);
lines.push("");
lines.push("## כל נקודות הציון");
lines.push("");
lines.push("| שם | תחנה | ביד | נגזר | מסלול | דירוג |");
lines.push("|---|---|---|---|---|---|");
for (const r of poi) lines.push(`| ${r.name} | ${r.stationName} | ${r.handMins}′ | ${r.derivedMins ? r.derivedMins + "′" : "—"} | ${r.metres ?? "—"} | ${r.rating ?? r.flag} |`);

await writeFile("seo-data/landmark-coords.md", lines.join("\n") + "\n", "utf8");
await writeFile("seo-data/landmark-coords.json", JSON.stringify(rows, null, 2), "utf8");

console.log(`רשומות ${rows.length} · כתובות ${addr.length} · נקודות ציון ${poi.length} · שני מקורות ${two.length} · יחיד ${one.length} · להכרעה ${flagged.length} · פער 3 דק׳+ ${drift.length}`);
