/* eslint-disable @typescript-eslint/no-require-imports -- next-sitemap loads this as CommonJS */
const fs = require('fs');
const path = require('path');

// Station names come from app/lib/data.ts so there is one source of truth.
// data.ts is TypeScript and cannot be require()d here, so the STATIONS array
// is parsed from source. Throws rather than silently emitting a short sitemap.
function stationNamesFromData() {
  const file = path.join(__dirname, 'app/lib/data.ts');
  const src = fs.readFileSync(file, 'utf8');
  const start = src.indexOf('export const STATIONS');
  const end = src.indexOf('export const LANDMARKS');
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`next-sitemap: could not locate the STATIONS array in ${file}`);
  }
  const names = [...src.slice(start, end).matchAll(/\{\s*name:\s*"((?:[^"\\]|\\.)*)"/g)]
    .map(m => m[1].replace(/\\"/g, '"'));
  if (names.length === 0) {
    throw new Error(`next-sitemap: parsed 0 stations from ${file}`);
  }
  return names;
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://derechkala.online',
  generateRobotsTxt: true,
  outDir: 'public',
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