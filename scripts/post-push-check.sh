#!/usr/bin/env bash
# בדיקת האתר החי אחרי דחיפה. כלל: נשמר ומוצג הם שני דברים שונים —
# מה שעבר מקומית חייב להיבדק שוב על הדומיין, אחרי שהבנייה הסתיימה.
# השורות שנכשלות כאן לפני הדחיפה הן בדיוק מה שהדחיפה אמורה לתקן.
set -u
cd "$(dirname "$0")/.."
BASE=${BASE:-https://derechkala.online}
ok(){ printf "  %-40s %s\n" "$1" "$2"; }
echo "═══ בדיקה חיה — $BASE ═══"

python3 -I - "$BASE" <<'PY'
import sys, re, html, subprocess, urllib.parse, collections
sys.path.insert(0, 'scripts'); import sources
base = sys.argv[1]
def enc(s): return urllib.parse.quote(s, safe="-_.!~*'()")
urls = ['/','/map','/line-red','/line-green','/line-purple','/hours','/privacy'] + \
       ['/station/' + enc(s['name']) for s in sources.stations()]
def get(u):
    h = subprocess.run(['curl','-s','--max-time','15',base+u],capture_output=True,text=True).stdout
    c = subprocess.run(['curl','-s','-o','/dev/null','-w','%{http_code}','--max-time','15',base+u],capture_output=True,text=True).stdout
    return c, h
bad_code, bad_canon, titles = [], [], collections.Counter()
for u in urls:
    code, h = get(u)
    if code != '200': bad_code.append((u, code))
    m = re.search(r'<link rel="canonical" href="([^"]+)"', h)
    want = 'https://derechkala.online' + ('' if u == '/' else u)
    got = html.unescape(m.group(1)) if m else None
    if got != want: bad_canon.append((urllib.parse.unquote(u), got))
    t = re.findall(r'<title>([^<]*)</title>', h)
    titles[html.unescape(t[0]) if t else '(אין)'] += 1
dupes = {k: v for k, v in titles.items() if v > 1}
print('  %-40s %d' % ('כתובות שנבדקו', len(urls)))
print('  %-40s %d' % ('קודים שאינם 200', len(bad_code)))
for b in bad_code[:5]: print('      ', b)
print('  %-40s %d' % ('canonical חסר או שגוי', len(bad_canon)))
for b in bad_canon[:5]: print('      ', b)
print('  %-40s %d' % ('כותרות כפולות', len(dupes)))
for k, v in list(dupes.items())[:3]: print('       %dx %s' % (v, k[:60]))
# הסייטמאפ מול מה שבאמת חי
sm = subprocess.run(['curl','-s','--max-time','15',base+'/sitemap-0.xml'],capture_output=True,text=True).stdout
locs = set(html.unescape(x) for x in re.findall(r'<loc>([^<]+)</loc>', sm))
want = set('https://derechkala.online' + ('' if u == '/' else u) for u in urls)
print('  %-40s %d · %d' % ('סייטמאפ מול הכתובות', len(locs), len(want)))
print('  %-40s %s' % ('בסייטמאפ ולא חי', sorted(locs - want)[:2] or 'אין'))
print('  %-40s %s' % ('חי ולא בסייטמאפ', sorted(want - locs)[:2] or 'אין'))
PY

ok "/station/<שטות> (אמור 404)"  "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$BASE/station/zzz")"
ok "/hours 15:40 · 19:45"        "$(curl -s --max-time 15 $BASE/hours | grep -o '15:40' | wc -l | tr -d ' ') · $(curl -s --max-time 15 $BASE/hours | grep -o '19:45' | wc -l | tr -d ' ')"
ok "תחנת תחנה (גמגום, אמור 0)"   "$(curl -s --max-time 15 "$BASE/station/%D7%AA%D7%97%D7%A0%D7%94%20%D7%9E%D7%A8%D7%9B%D7%96%D7%99%D7%AA%20%D7%A4%D7%AA%D7%97%20%D7%AA%D7%A7%D7%95%D7%95%D7%94" | grep -c 'תחנת תחנה')"
ok "רכבת ישראל בעמוד קריית אריה" "$(curl -s --max-time 15 "$BASE/station/%D7%A7%D7%A8%D7%99%D7%99%D7%AA%20%D7%90%D7%A8%D7%99%D7%94" | grep -c 'חיבור לרכבת ישראל')"
ok "שעות פעילות בהאדר של עמוד תחנה" "$(curl -s --max-time 15 "$BASE/station/%D7%90%D7%91%D7%90%20%D7%94%D7%9C%D7%9C" | grep -o 'href="/hours"' | wc -l | tr -d ' ')"
