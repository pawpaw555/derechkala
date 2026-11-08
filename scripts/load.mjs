#!/usr/bin/env node
// טוען את מודולי app/lib כקוד, לא כטקסט. כלל 5ב, השורש.
//
// ארבע פעמים ביום אחד נשבר פרסור על גרשיים מוברחים: `הבעש\"ט` בקובץ TS
// אינו `הבעש"ט`, ו-`"([^"]+)"` נעצר על הגרש הפנימי. התיקון האמיתי אינו
// ביטוי רגולרי טוב יותר — הוא לא לפרסר בכלל. ל-JS אין בעיית גרשיים.
//
// data.ts נטען ישירות (אין בו ייבואים). places/stationContent/railStations
// מייבאים "./data" בלי סיומת, ו-ESM דורש סיומת — לכן ה-hook שלמטה.
//
// שימוש:  const { PLACES, STATION_CONTENT } = await load();
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";

registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith(".") && !/\.[a-z]+$/.test(spec)) {
      const withTs = spec + ".ts";
      if (existsSync(new URL(withTs, ctx.parentURL))) return next(withTs, ctx);
    }
    return next(spec, ctx);
  },
});

const LIB = new URL("../app/lib/", import.meta.url);

export async function load() {
  const [data, places, content, rail] = await Promise.all([
    import(new URL("data.ts", LIB).href),
    import(new URL("places.ts", LIB).href),
    import(new URL("stationContent.ts", LIB).href),
    import(new URL("railStations.ts", LIB).href),
  ]);
  return {
    ...data,
    PLACES: places.PLACES,
    STATION_CONTENT: content.STATION_CONTENT,
    STATION_FAQ: content.STATION_FAQ,
    // נגזר מהרשומות ב-stationContent.ts ועובר כ-prop לשלושה עמודים.
    // נוסף ב-08.11 כדי שבדיקה תוכל להשוות את המשפט השלם למה שמוגש,
    // במקום לחפש תת-מחרוזת שלו.
    STATION_TYPE_BREAKDOWN: content.STATION_TYPE_BREAKDOWN,
    STATION_TYPE_COUNTS: content.STATION_TYPE_COUNTS,
    TRENCH_STATIONS: content.TRENCH_STATIONS,
    RAIL_STATIONS: rail.RAIL_STATIONS,
    railDistance: rail.railDistance,
  };
}

// מונים לצד בקרת גרשיים. הבלוק משווה את המספרים האלה למה ש-sources.py
// מוציא מאותם קבצים בפירסור טקסט: שני מסלולים שונים לאותה עובדה, וכל
// פער ביניהם נופל. השמות עם הגרש הם הבקרה החיובית — אם הם חוזרים ריקים,
// הטעינה שבורה ולא העולם.
if (import.meta.url === `file://${process.argv[1]}`) {
  const m = await load();
  const pois = Object.values(m.STATION_CONTENT).flatMap((c) => c.pois ?? []);
  const quoted = [
    ...Object.keys(m.STATION_CONTENT).filter((n) => n.includes('"')),
    ...new Set(pois.filter((p) => p.name.includes('"')).map((p) => p.name)),
  ];
  console.log(
    "%d · %d · %d · %d · גרש: %d",
    m.STATIONS.length,
    m.LANDMARKS.length,
    pois.length,
    m.PLACES.length,
    quoted.length,
  );
}
