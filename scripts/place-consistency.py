#!/usr/bin/env python3
"""עובדה על מקום יושבת בשני מבנים — nearbyPlaces של התחנה, ו-LANDMARKS.
הם יכולים לסתור זה את זה בשקט. כלל 4: אחרי תיקון מופע אחד, לסרוק את המחלקה.

ב-31.10 שוק הפשפשים הועבר מאצטדיון בלומפילד לשלמה (סלמה) בטבלת LANDMARKS
ונשאר ב-nearbyPlaces של בלומפילד. מופע אחד מתוך שניים.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sources

nearby = sources.station_nearby()
marks = {m['name']: m for m in sources.landmarks()}

self_ref, disagree, orphan, missing = [], [], [], []

for st, places in nearby.items():
    for p in places:
        if p == st:
            self_ref.append(st)
        elif p in marks:
            # לא כשל. LANDMARKS בוחר תחנה אחת — הקרובה ביותר; nearbyPlaces
            # מתאר מה יש מסביב. מקום בין שתי תחנות סמוכות קרוב לשתיהן,
            # ו-stationContent.ts מונה אותו לשתיהן בכוונה. מידע בלבד.
            if marks[p]['stationName'] != st:
                disagree.append((st, p, marks[p]['stationName']))
        else:
            orphan.append((st, p))

for name, m in marks.items():
    st = m['stationName']
    if st in nearby and name not in nearby[st] and name != st:
        missing.append((st, name, m['walkMins']))

if len(sys.argv) > 1 and sys.argv[1] == 'count':
    print(len(self_ref))
    sys.exit(0)


def show(title, rows, fmt):
    print('\n%s: %d' % (title, len(rows)))
    for r in rows:
        print('   ' + fmt(r))

show('תחנה שמונה את עצמה כמקום סמוך', self_ref, lambda r: r)
show('שיוך שונה ב-LANDMARKS (צפוי, לא כשל)', disagree,
     lambda r: '%s מונה "%s", אבל LANDMARKS משייך אותו ל-%s' % r)
show('ב-nearbyPlaces ואין לו רשומה ב-LANDMARKS', orphan,
     lambda r: '%s → %s' % r)
show('ב-LANDMARKS ולא ב-nearbyPlaces של אותה תחנה', missing,
     lambda r: '%s ← %s (%d דק׳)' % r)

# רק ההפניה העצמית היא כשל: "אצטדיון בלומפילד · ליד אצטדיון בלומפילד".
bad = len(self_ref)
print('\nכשלים: %d' % bad)
sys.exit(1 if bad else 0)
