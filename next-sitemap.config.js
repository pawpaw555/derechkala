/* eslint-disable @typescript-eslint/no-require-imports -- next-sitemap loads this as CommonJS */
const fs = require('fs');
const path = require('path');

// Station names come from app/lib/data.ts so there is one source of truth.
// data.ts is TypeScript and cannot be require()d here, so the STATIONS array
// is parsed from source. Throws rather than silently emitting a wrong sitemap.
//
// The slice is bounded by the array's own closing `];`, not by the position of
// whatever is declared next. Keying off `export const LANDMARKS` meant that any
// array inserted between the two would have had its `{ name: "..." }` entries
// counted as stations, inflating the sitemap with URLs that return 404.
function stationNamesFromData() {
  const file = path.join(__dirname, 'app/lib/data.ts');
  const src = fs.readFileSync(file, 'utf8');
  const start = src.indexOf('export const STATIONS');
  if (start === -1) {
    throw new Error(`next-sitemap: could not locate the STATIONS array in ${file}`);
  }
  const close = src.indexOf('\n];', start);
  if (close === -1) {
    throw new Error(`next-sitemap: could not find the end of the STATIONS array in ${file}`);
  }
  const names = [...src.slice(start, close).matchAll(/\{\s*name:\s*"((?:[^"\\]|\\.)*)"/g)]
    .map(m => m[1].replace(/\\"/g, '"'));
  if (names.length === 0) {
    throw new Error(`next-sitemap: parsed 0 stations from ${file}`);
  }
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length > 0) {
    throw new Error(`next-sitemap: duplicate station names in ${file}: ${dupes.join(', ')}`);
  }
  return names;
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://derechkala.online',
  generateRobotsTxt: true,
  outDir: 'public',
  // next-sitemap סורק את תוצרי הבנייה ומוסיף כל נתיב שמצא, כולל
  // /opengraph-image — נתיב שמחזיר PNG ולא עמוד. הוא נשאר נגיש לסורקים
  // כדי שתצוגות השיתוף יעבדו, אבל אינו כתובת שצריכה להיות בסייטמאפ.
  exclude: ['/opengraph-image'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
    additionalSitemaps: [],
  },
  changefreq: 'weekly',
  priority: 0.7,
  additionalPaths: async (config) => {
    const stations = stationNamesFromData();

    const stationPaths = stations.map(name => ({
      loc: `/station/${encodeURIComponent(name)}`,
      priority: 0.8,
      changefreq: 'weekly',
    }));

    return [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/line-red', priority: 0.9, changefreq: 'weekly' },
      { loc: '/line-green', priority: 0.7, changefreq: 'monthly' },
      { loc: '/line-purple', priority: 0.7, changefreq: 'monthly' },
      { loc: '/hours', priority: 0.8, changefreq: 'weekly' },
      { loc: '/map', priority: 0.9, changefreq: 'monthly' },
      { loc: '/privacy', priority: 0.5, changefreq: 'yearly' },
      ...stationPaths,
    ];
  },
}