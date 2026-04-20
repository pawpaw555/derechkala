/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.derechkala.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
  },
  changefreq: 'weekly',
  priority: 0.7,
  additionalPaths: async (config) => [
    { loc: '/', priority: 1.0, changefreq: 'daily' },
    { loc: '/line-red', priority: 0.9, changefreq: 'weekly' },
    { loc: '/line-green', priority: 0.7, changefreq: 'monthly' },
    { loc: '/line-purple', priority: 0.7, changefreq: 'monthly' },
    { loc: '/hours', priority: 0.8, changefreq: 'weekly' },
  ],
}