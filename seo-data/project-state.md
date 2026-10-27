# Derechkala — Project State

## Last updated: 2026-05-19

## What this project is
A live Hebrew-language Next.js 16 website at **derechkala.online** — a light rail trip planner for the Tel Aviv Gush Dan metro area (Red Line, 34 stations). Deployed via Netlify, triggered by pushes to GitHub (`pawpaw555/derechkala`, branch `main`).

## Current git state
- Branch: `main`
- Ahead of origin: **0** (all 5 SEO/UX commits were pushed)
- Working tree: clean except for `seo-data/` which is untracked and intentionally not committed

## What was done (in order)

### Already pushed to origin/main
1. **`a0d086f`** — Station pages: richer metadata + server-rendered BreadcrumbList JSON-LD
   - `app/station/[slug]/page.tsx`: `generateMetadata` now uses station city + 2 nearbyPlaces for unique per-station descriptions; BreadcrumbList JSON-LD moved from client to server component; fixed Next.js 16 SSG double-encoding bug
   - `app/station/[slug]/StationClient.tsx`: removed duplicate client-side BreadcrumbList script
2. **`ac23a13`** — Add featured red line station links to homepage
   - `app/page.tsx`: new "תחנות מרכזיות בקו האדום" section with 8 station chip links (responsive grid), inserted between line cards and SEO content block
3. **`1976f78`** — Improve trip planner defaults and minute selector
   - `app/page.tsx`: `customDay` defaults to today; geolocation failure no longer silently selects arbitrary station; minutes selector expanded from 4 options to 0–59
4. **`c47c2e8`** — Use webpack for local dev to fix Turbopack CSS resolution error
   - `package.json`: `"dev": "next dev --webpack"` — Turbopack was mis-detecting workspace root due to sibling project lockfile at `/Users/rotemlavi/AI-Projects/easyplanner-qa-app copy/`
5. **`4b4c440`** — Improve map default view and geolocation fallback
   - `app/lib/Map.tsx`: map default center adjusted to `[32.055, 34.790] zoom 11` (better fits full Red Line); geolocation failure callback changed to no-op

## Pending: production validation
The 5 commits above are on GitHub but **Netlify deploy was not triggered** (no credits available at time of push). When credits are restored, one deploy will run automatically or manually. After deploy, validate:
- Homepage loads + "תחנות מרכזיות" section appears between line cards and SEO block
- All 8 station chip links work
- `/map` renders correctly (new default center/zoom)
- Trip planner works (route search, minute selector 0–59, day defaults to today)
- `/line-red` loads with all 34 station links
- Station pages load: `/station/ארלוזורוב`, `/station/בילינסון`, `/station/הקוממיות`
- BreadcrumbList rich result still valid (test via Rich Results Test)
- Netlify build log: no errors, next-sitemap completed

## Deferred work (do not start until production validated + explicit approval)
- Tailwind cleanup (Option A: remove unused `@import "tailwindcss"` from globals.css)
- FAQPage schema on station pages
- Nearby station cross-links on station pages
- Station photos
- `/stations` hub page
- Geolocation UX message ("יש לאפשר גישה למיקום בהגדרות הדפדפן") when permission denied

## Working rules
See `seo-data/claude-working-rules.md` (untracked file, exists locally).
Key rules:
- No code changes before approved plan
- No push/deploy without explicit approval
- Use `git add -p` when file has mixed approved/unapproved hunks
- Show `git diff --cached` before every commit
- Separate SEO, UX, map, schema changes into separate commits
- Batch commits before pushing to save Netlify build credits
- Python used only as local analysis tool, never in production

## Local dev
- `npm run dev` — starts webpack dev server (not Turbopack)
- `npm run build` — builds 44 pages (34 stations + 10 other routes), generates sitemap
- Local URL: http://localhost:3000

## Key files
- `app/station/[slug]/page.tsx` — station server component, metadata, BreadcrumbList
- `app/station/[slug]/StationClient.tsx` — station client component (UI)
- `app/page.tsx` — homepage (client component, SSG-rendered)
- `app/line-red/RedLineContent.tsx` — Red Line page with all 34 station links
- `app/lib/data.ts` — STATIONS array (34 stations, each with name, city, nearbyPlaces, coords)
- `app/lib/stationContent.ts` — per-station content including previousStation/nextStation
- `app/lib/constants.ts` — SITE_URL, SITE_NAME
- `public/sitemap-0.xml` — regenerated on every build (timestamps change, URLs stable)
- `next.config.ts` — rewrites + redirects for Hebrew URL aliases
- `package.json` — dev uses webpack flag
- `netlify.toml` — Netlify build config
- `seo-data/gsc/` — Google Search Console exports (local only, untracked)

**עדכון 11.09.2026:** seo-data/ נמצאת ב-git מאז קומיט e603bbb. השורה שטוענת אחרת אינה נכונה. המצב העדכני ביותר: audit-full-2026-09-11-v3.md
