#!/usr/bin/env python3
"""שדות שהשכבה מחשבת ואף קובץ ממשק אינו קורא. כלל 10.

נולד מ-`hiddenCount`: החיפוש חתך תוצאות לחמש בשקט, הוספתי שדה שסופר
כמה הוסתרו, כתבתי בהערה "הספירה מאפשרת לממשק לומר שיש עוד", ודיווחתי
שהחיתוך השקט נסגר. לשדה לא היה אף קורא בממשק, והחיתוך נשאר שקט.

הבדיקה הזאת רצה בבלוק הרגרסיה כדי שזה לא יהיה תלוי בזיכרון שלי.
הבסיס הוא 13 נכון ל-31.10.2026 — שלוש-עשרה רשומות פנימיות לגיטימיות:
צורת תשובה של API, שדות תיעוד, וקלט לחישוב שהממשק מקבל מעובד.
`hiddenCount` היה חריג אמיתי והוא חובר לממשק באותו יום, והבסיס ירד ל-11;
`nearStation` ו-`sourceGap` של תחנות רכבת ישראל הצטרפו אחריו — הראשון
משמש את חישוב המרחק והשני מתעד את הפער בין שני המקורות. מספר שעולה =
שדה חדש שאינו מגיע לאף אחד.

**07.11.2026: הבסיס עלה ל-15.** `nameFactSource` נוסף, מאותה סיבה
בדיוק כמו `addressSource` יום קודם — שדה תיעוד שקוראים אותו
`provenance.mjs` ו-`verified-facts.mjs`, ואין לו קורא בממשק במכוון.
**שתי עליות רצופות מאותו סוג הן תבנית ולא חריג:** כל פעם שטענה
מקבלת מקור, נולד עוד שדה שהממשק אינו מציג. אם הבסיס ימשיך לעלות
כך, שווה להפריד את שדות התיעוד למניין נפרד במקום להעלות תקרה שוב.

**05.11.2026: הבסיס עלה ל-14.** `addressSource` נוסף ל-34 רשומות התחנה,
ואין לו קורא בממשק **במכוון** — הוא שדה תיעוד, כמו `sourceGap`,
`verification` ו-`verifiedGap` שכבר בבסיס. קוראים אותו שלושה סקריפטים:
`addresses.mjs`, `provenance.mjs` ו-`verified-facts.mjs`. זאת העלאה
מוצדקת של תקרה, והיא נרשמת כאן ולא רק בבלוק כדי שמי שיראה 14 יידע למה.
"""
import io, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DECL = (r'(?:export\s+)?(?:type|interface)\s+\w+\s*=?\s*\{(.*?)\n\}',
        r'export function \w+\([^)]*\)\s*:\s*\{(.*?)\n\}')


def scan():
    lib, ui = [], []
    for dirpath, _, names in os.walk(os.path.join(ROOT, 'app')):
        for fn in names:
            if not fn.endswith(('.ts', '.tsx')):
                continue
            p = os.path.join(dirpath, fn)
            (lib if os.sep + 'lib' in dirpath else ui).append(p)
    declared = collections.defaultdict(set)
    for p in lib:
        s = io.open(p, encoding='utf-8').read()
        for pat in DECL:
            for m in re.finditer(pat, s, re.S):
                for f in re.finditer(r'^\s*/?\*?\*?\s*(\w+)\s*\??\s*:', m.group(1), re.M):
                    declared[f.group(1)].add(p)
    if not declared:
        raise SystemExit('dead-fields.py: אופס שדות הוכרזו — הפרסר שבור, לא העולם')
    uitext = [io.open(p, encoding='utf-8').read() for p in ui]
    dead = [f for f in sorted(declared) if sum(t.count(f) for t in uitext) == 0]
    return declared, dead


if __name__ == '__main__':
    declared, dead = scan()
    if len(sys.argv) > 1 and sys.argv[1] == 'count':
        print(len(dead))
    else:
        print('שדות מוכרזים: %d · בלי קורא בממשק: %d' % (len(declared), len(dead)))
        for f in dead:
            print('   ' + f)
