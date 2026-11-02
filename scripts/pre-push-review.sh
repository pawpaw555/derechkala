#!/usr/bin/env bash
# מה עומד לעלות לאוויר, לפני שהוא עולה.
#
# 22 קומיטים ממתינים לבילד אחד, ולכן מה שיוצא לאוויר אינו אף קומיט בודד
# אלא הסכום שלהם. בלוק הרגרסיה בודק את HEAD; הסקריפט הזה בודק את ה*הפרש*
# בין מה שחי לבין מה שימתין — דבר שאף בדיקה אחרת כאן לא עושה.
#
# הסדר: (1) scripts/regression.sh  (2) הסקריפט הזה  (3) דחיפה
#        (4) scripts/post-push-check.sh מול הדומיין החי.
set -u
cd "$(dirname "$0")/.."
REMOTE=${REMOTE:-origin/main}
ok(){ printf "  %-44s %s\n" "$1" "$2"; }
echo "═══ מה ממתין לדחיפה — מול $REMOTE ═══"

ok "עץ העבודה נקי (אמור: כן)"        "$([ -z "$(git status --porcelain | grep -v '^?? \.claude/')" ] && echo כן || echo 'לא — יש שינוי שלא נכנס לאף קומיט')"
ok "הדחיפה האחרונה"                   "$(git log -1 --format='%h  %ad' --date=short "$REMOTE")"
ok "קומיטים ממתינים"                  "$(git rev-list --count "$REMOTE"..HEAD)"
ok "קבצים שישתנו"                     "$(git diff --name-only "$REMOTE"..HEAD | wc -l | tr -d ' ')"
ok "שורות"                            "$(git diff --shortstat "$REMOTE"..HEAD | sed 's/^ *//')"

# כלל 8: קומיט מתאר מה נמדד. גוף ריק אומר שאין תיעוד למה שעולה לאוויר.
empty=0
for h in $(git rev-list "$REMOTE"..HEAD); do
  [ -z "$(git log -1 --format='%b' "$h" | tr -d '[:space:]')" ] && empty=$((empty+1))
done
ok "קומיטים בלי גוף (בסיס 0)"         "$empty"

# הסייטמאפ מתחדש בכל בנייה. שינוי חותמות הוא רעש; כתובת שנוספה או נעלמה
# היא שינוי אמיתי, והוא חייב להיות מכוון. בקרה: שתי הספירות חייבות להופיע.
live=$(git show "$REMOTE":public/sitemap-0.xml 2>/dev/null | grep -c "<loc>")
pend=$(git show HEAD:public/sitemap-0.xml 2>/dev/null | grep -c "<loc>")
tot=$(git diff "$REMOTE"..HEAD -- public/sitemap-0.xml | grep -c '^[+-][^+-]')
lm=$(git diff "$REMOTE"..HEAD -- public/sitemap-0.xml | grep -c '^[+-].*lastmod')
ok "סייטמאפ: כתובות חי · ממתין"       "$live · $pend $([ "$live" = "$pend" ] && echo '' || echo '← השתנה')"
ok "סייטמאפ: שורות שונות · מהן חותמת" "$tot · $lm $([ "$tot" = "$lm" ] && echo '(רעש בלבד)' || echo '← לא רק חותמות')"

echo
echo "  ── עמודים שהקוד שלהם נגע, לבדיקה אחרי הדחיפה ──"
git diff --name-only "$REMOTE"..HEAD -- 'app/*' | while read -r f; do
  case "$f" in
    app/HomeContent.tsx|app/page.tsx)            echo "      /" ;;
    app/map/*)                                   echo "      /map" ;;
    app/hours/*)                                 echo "      /hours" ;;
    app/line-red/*)                              echo "      /line-red" ;;
    app/line-green/*)                            echo "      /line-green" ;;
    app/line-purple/*)                           echo "      /line-purple" ;;
    app/station/*)                               echo "      /station/<כל 34>" ;;
    app/layout.tsx|app/globals.css)              echo "      כל העמודים" ;;
    app/lib/Map.tsx)                             echo "      / ו-/map (המפה)" ;;
    app/lib/*)                                   echo "      ספרייה משותפת — $f" ;;
  esac
done | sort -u

cat <<'NOTE'

  ── מה הסקריפט הזה אינו רואה ──
      מראה, פריסה, גודל מפה, אזור לחיצה, צבע, התנהגות בנייד.
      כל אלה נמדדים בדפדפן לפי כלל 7, או שאינם נבדקים כלל.
      הסקריפט סופר ומשווה. הוא לא פותח אף עמוד.
NOTE
