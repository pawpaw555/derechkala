#!/usr/bin/env bash
# בלוק הרגרסיה של כלל 6. זהה בכל פעם, לא לפי מקרה.
set -u
cd "$(dirname "$0")/.."
PORT=${PORT:-3011}
B="http://localhost:$PORT"
ok(){ printf "  %-38s %s\n" "$1" "$2"; }

pkill -f "next start -p $PORT" 2>/dev/null
npm run build > /tmp/reg-build.log 2>&1; BUILD=$?
(npx next start -p "$PORT" > /tmp/reg-srv.log 2>&1 &)

# כלל 5א: ממתינים לעמוד שעליו מודדים, לא רק לשורש
ST="$B/station/%D7%90%D7%91%D7%90%20%D7%94%D7%9C%D7%9C"
for i in $(seq 1 90); do
  [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "$ST" 2>/dev/null)" = "200" ] && \
  [ "$(curl -s "$ST" | grep -o '<h2' | wc -l | tr -d ' ')" -gt 0 ] && break
done

S=$(curl -s "$ST")
echo "═══ בלוק רגרסיה ═══"
ok "tsc"                        "$(npx tsc --noEmit 2>&1 | grep -c 'error TS')"
ok "build"                      "$BUILD"
ok "lint (בסיס 26)"             "$(npm run lint 2>&1 | grep -o '[0-9]* problems' | head -1)"
# grep -c סופר שורות, ו-Next קובע את מעברי השורה ב-HTML לפי שיקוליו:
# הוספת בלוק <style> אחד הזיזה את אותן מחרוזות מ-2 שורות ל-3 בלי ששום
# תוכן השתנה. סופרים מופעים, ומתוך תשובה אחת ולא שתיים.
HRS=$(curl -s $B/hours)
ok "/hours 15:40 · 19:45"       "$(echo "$HRS"|grep -o '15:40'|wc -l|tr -d ' ') · $(echo "$HRS"|grep -o '19:45'|wc -l|tr -d ' ')"
ok "עמוד תחנה h2 · h1"          "$(echo "$S"|grep -o '<h2'|wc -l|tr -d ' ') · $(echo "$S"|grep -o '<h1'|wc -l|tr -d ' ')"
ok "TrainStation · FAQPage"     "$(echo "$S"|grep -o 'TrainStation'|wc -l|tr -d ' ') · $(echo "$S"|grep -o 'FAQPage'|wc -l|tr -d ' ')"
ok "/station/<שטות>"            "$(curl -s -o /dev/null -w '%{http_code}' $B/station/zzz)"
# כלל 11: הספירות באות מהפרסר היחיד, כדי שהוא יהיה בשימוש ולא ירקב
ok "תחנות·landmarks·pois·places" "$(python3 -I scripts/sources.py counts)"
# כלל 10: שדה שהשכבה מחשבת ואף ממשק אינו קורא
ok "שדות בלי קורא בממשק (בסיס 11)" "$(python3 -I scripts/dead-fields.py count)"
ok "שנקר → ≠ קריית אריה"        "$(curl -s "$B/station/%D7%A9%D7%A0%D7%A7%D7%A8"|grep -o 'תחנה הבאה[^<]*<[^>]*>[^<]*'|grep -c 'קריית אריה')"
C=""; for p in / /map /line-red /line-green /line-purple /hours /privacy; do C="$C$(curl -s -o /dev/null -w '%{http_code}' $B$p) "; done
ok "שבעת העמודים"               "$C"
ok "שגיאות שרת"                 "$(grep -ci 'error\|unhandled' /tmp/reg-srv.log)"
