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
    const stations = [
      "תחנה מרכזית פתח תקווה", "פינסקר", "קרול", "דנקנר", "בילינסון",
      "שחם", "שנקר", "קריית אריה", "גשר אם המושבות", "אהרונוביץ'",
      "בן גוריון", "ביאליק", "אבא הלל", "ארלוזורוב", "שאול המלך",
      "יהודית", "קרליבך", "אלנבי", "אליפלט", "שלמה (סלמה)",
      "אצטדיון בלומפילד", "ארליך", "איסקוב", 'הבעש"ט', "מחרוזת",
      "העצמאות", "רוטשילד", "ז'בוטינסקי", "בלפור", "בנימין",
      'יוספטל', 'כ"ט בנובמבר', "העמל", "הקוממיות",
    ];

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