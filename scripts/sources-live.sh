#!/usr/bin/env bash
# בודק שמקורות האימות של כלל 2 עדיין עונים מה שנרשם עליהם.
#
# הטבלה בכלל 2 נכתבה פעם אחת מהידע ולא מקריאה, ואחד מהמקורות שישב בה
# כבעל עובדה התברר כחסום. שורה שמושכת את המקורות הייתה תופסת את זה
# באותו רגע ולא יומיים אחרי, כששאלו.
#
# הסטטוס הצפוי הוא חלק מהעובדה: 403 על נת״ע ועל govmap אינו תקלה, הוא
# מה שנמדד ב-04.11.2026 — הם נקראים רק מדפדפן. שינוי לכל כיוון הוא
# מידע: מקור שחזר, או מקור שמת.
set -u

EXPECT="
200 https://bus.gov.il/SingleRide
200 https://www.dankal.co.il
200 https://nominatim.openstreetmap.org/search?q=Tel+Aviv&format=json&limit=1
403 https://www.govmap.gov.il
403 https://www.nta.co.il
"

BAD=0
OUT=""
while read -r want url; do
  [ -z "${url:-}" ] && continue
  got=$(curl -s -m 10 -A 'derechkala-verify/1.0' -o /dev/null -w '%{http_code}' "$url")
  if [ "$got" = "$want" ]; then
    OUT="$OUT$got "
  else
    OUT="$OUT$got(≠$want) "
    BAD=$((BAD + 1))
  fi
done <<< "$EXPECT"

if [ "${1:-}" = "verbose" ]; then
  printf '%s\n' "$EXPECT" | while read -r want url; do
    [ -z "${url:-}" ] && continue
    printf "  %-3s %s\n" "$want" "$url"
  done
fi

# הבקרה היא nominatim עם שאילתה שידוע שהיא מחזירה תוצאה. אם גם היא
# נופלת, הרשת שבורה ולא המקורות.
CTRL=$(curl -s -m 10 -A 'derechkala-verify/1.0' \
  "https://nominatim.openstreetmap.org/search?q=Tel+Aviv&format=json&limit=1" \
  | grep -c '"lat"')

echo "${OUT% } · בקרה: $CTRL"
[ "$BAD" -gt 0 ] && exit 1
exit 0
