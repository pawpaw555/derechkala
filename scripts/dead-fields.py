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

**10.11.2026: ההפרדה נעשתה, במקום עלייה רביעית.** `coordSource`
ו-`coordVerification` נוספו ל-59 רשומות LANDMARKS, והתקרה הייתה עולה
מ-15 ל-17 — בדיוק מה שהפסקה שמעל חזתה. תקרה שמעלים בכל פעם שהיא
נוגעת אינה שומר. שדות התיעוד נספרים מעכשיו **בנפרד**, והמניין הראשון
חוזר למשמעותו: שדה שהשכבה מחשבת ואיש אינו רואה.

**והפטור אינו רשימת שמות שנסמוך עליה.** כל שם ב-PROVENANCE חייב
להיקרא בפועל על ידי סקריפט תחת `scripts/`, והבדיקה מאמתת את זה בכל
הרצה. שם שיאבד את הקורא שלו ייפול בחזרה למניין הראשון מעצמו — כלומר
הפטור פג כשהסיבה לו פגה, בלי שאיש יזכור לבדוק.
"""
import io, os, re, sys, collections, glob

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


# שדות תיעוד: קיימים כדי שלטענה יהיה מקור, ואין להם קורא בממשק במכוון.
PROVENANCE = ('addressSource', 'nameFactSource', 'coordSource',
              'coordVerification', 'verification', 'verifiedGap', 'sourceGap')


def script_readers():
    """מי מהשמות באמת נקרא על ידי סקריפט. בלי זה הפטור הוא רשימה שמתיישנת."""
    text = []
    for p in glob.glob(os.path.join(ROOT, 'scripts', '*.*')):
        # הסקריפט עצמו, ובלוק הרגרסיה. הבלוק **מריץ** סקריפטים ואינו
        # צרכן של שדה — והערה בתוכו אינה קריאה. בהרצה הראשונה שלי
        # הוא העלה את המניין מ-5 ל-7, כי כתבתי שם בהערה את שמות שני
        # השדות שהבדיקה פסלה. אותה מלכודת כמו הערת ה-JSX שהפילה את
        # סריקת הזמנים הקשיחים: טקסט חופשי נספר כמו קוד.
        if os.path.basename(p) in (os.path.basename(__file__), 'regression.sh'):
            continue
        try:
            text.append(io.open(p, encoding='utf-8').read())
        except (UnicodeDecodeError, IsADirectoryError):
            pass
    return {f for f in PROVENANCE if sum(t.count(f) for t in text) > 0}


if __name__ == '__main__':
    declared, dead = scan()
    readers = script_readers()
    doc = [f for f in dead if f in readers]
    real = [f for f in dead if f not in readers]
    if len(sys.argv) > 1 and sys.argv[1] == 'count':
        print(len(real))
    elif len(sys.argv) > 1 and sys.argv[1] == 'doc':
        # שני המספרים: שדות תיעוד מתוך הרשימה, וכמה מהם אומתו כנקראים
        print('%d · נקראים בסקריפט %d' % (len(doc), len(readers)))
    else:
        print('שדות מוכרזים: %d · בלי קורא בממשק: %d · מהם תיעוד: %d'
              % (len(declared), len(dead), len(doc)))
        print('בלי קורא בכלל:')
        for f in real:
            print('   ' + f)
        print('תיעוד (נקראים בסקריפט, לא בממשק):')
        for f in doc:
            print('   ' + f)
        missing = [f for f in PROVENANCE if f not in readers]
        if missing:
            print('⚠ ברשימת הפטור ואין להם קורא בסקריפט: ' + ', '.join(missing))
