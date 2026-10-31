#!/usr/bin/env python3
"""הפרסר היחיד של קבצי המקור. כלל 11.

בסשן אחד נכתבו 17 פרסרים נפרדים למערך STATIONS, ושני באגים התגלגלו
ביניהם: תשעה חסמו את המערך ב-`export const LANDMARKS` במקום ב-`];` שלו
עצמו, וארבעה לא פירקו גרשיים מוברחים — כך ש-`הבעש\"ט` ו-`כ\"ט בנובמבר`
פשוט לא נמצאו. שני הבאגים תוקנו פעם אחת כל אחד, ולא נסרקו כמחלקה.

כל מדידה שצריכה את הנתונים מהמקור עוברת מכאן. סקריפט חדש לא מפרסר בעצמו.
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _read(rel):
    return io.open(os.path.join(ROOT, rel), encoding='utf-8').read()


def _unescape(name):
    """`הבעש\\"ט` בקובץ TS אינו `הבעש"ט`. כלל 5ב."""
    return name.replace('\\"', '"').replace('\\\\', '\\')


def _array(src, decl):
    """הפרוסה נחסמת ב-`];` של המערך עצמו, לא בהצהרה שבאה אחריו."""
    start = src.find(decl)
    if start == -1:
        raise SystemExit('sources.py: לא נמצא %s' % decl)
    close = src.find('\n];', start)
    if close == -1:
        raise SystemExit('sources.py: לא נמצא סוף המערך של %s' % decl)
    return src[start:close]


def stations():
    seg = _array(_read('app/lib/data.ts'), 'export const STATIONS')
    out = []
    for m in re.finditer(
            r'\{\s*name:\s*"((?:[^"\\]|\\.)*)"'
            r'[^}]*?lat:\s*(-?[\d.]+),\s*lng:\s*(-?[\d.]+)'
            r'[^}]*?city:\s*"((?:[^"\\]|\\.)*)"', seg, re.S):
        out.append({'name': _unescape(m.group(1)), 'lat': float(m.group(2)),
                    'lng': float(m.group(3)), 'city': _unescape(m.group(4))})
    dupes = [s['name'] for i, s in enumerate(out)
             if s['name'] in [x['name'] for x in out[:i]]]
    if dupes:
        raise SystemExit('sources.py: שמות תחנה כפולים: %s' % ', '.join(dupes))
    return out


def station_names():
    return [s['name'] for s in stations()]


def landmark_count():
    return len(re.findall(r'\{ name:', _array(_read('app/lib/data.ts'), 'export const LANDMARKS')))


def poi_count():
    src = _read('app/lib/stationContent.ts')
    return len(re.findall(r'\{\s*name:\s*"(?:[^"\\]|\\.)*",\s*type:', src))


def place_count():
    return len(re.findall(r'^    name: "', _read('app/lib/places.ts'), re.M))


def counts():
    return len(stations()), landmark_count(), poi_count(), place_count()


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'counts':
        print('%d · %d · %d · %d' % counts())
    elif len(sys.argv) > 1 and sys.argv[1] == 'names':
        print('\n'.join(station_names()))
    else:
        st = stations()
        # בקרה: שתי התחנות שנושאות גרש חייבות לחזור עם גרש אמיתי
        esc = [s['name'] for s in st if '"' in s['name']]
        print('תחנות: %d · עם גרש: %s' % (len(st), ', '.join(esc) or 'אין'))
