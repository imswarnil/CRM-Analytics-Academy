"""make_ep01.py — episode-specific copies of CRMA templates for
"Lesson 01 — Create a free CRM Analytics Developer Edition org" (folder CRMA-Episode 01).

    python make_ep01.py <out_dir>
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozml
import make_crma as mc
import make_crma2 as m2
from make_titles import with_animation

REPL = {}
_text, _rtext = ozml.Doc.text, m2.rtext


def text(self, string, *a, **k):
    return _text(self, REPL.get(string, string), *a, **k)


def rtext(d, s, *a, **k):
    return _rtext(d, REPL.get(s, s), *a, **k)


ozml.Doc.text = text
m2.rtext = rtext


def placed(d, body, s=1.0, ox=0, oy=0):
    return d.group('Placement', [body], x=ox, y=oy, sx=s, sy=s, pub=[('./1/100/101', 'Placement')])


def callout(eyebrow, color, txt, fill=mc.CARD, s=1.0, cx=410, cy=360):
    def build(d):
        body = with_animation(d, mc.callout_card(eyebrow, color, txt, fill)(d))
        return placed(d, body, s, cx - 410 * s, cy - 360 * s)
    return build


def click_at(x, y):
    def build(d):
        return placed(d, with_animation(d, mc.sc_click(d)), 1.0, x, y)
    return build


STEPS = [('01', 'Open the sign-up page', 'SALESFORCE.COM/PROMO/ORGS/ANALYTICS-DE'),
         ('02', 'Fill in the form', 'NAME · EMAIL · ROLE · USERNAME'),
         ('03', 'Verify your email', 'INBOX → VERIFY ACCOUNT'),
         ('04', 'Set your password', '8+ CHARACTERS · 1 LETTER · 1 NUMBER'),
         ('05', 'Your org is ready', 'SETUP → DEVELOPER EDITION')]

JOBS = [  # (name, builder, replacements, build markers, animated pop-up?)
    ('01 Title Slide', m2.sl_title, {'COURSE 01 — CRM ANALYTICS': 'LESSON 01 — GETTING STARTED', 'Dashboards that': 'Get a free CRM',
                                     'answer questions': 'Analytics org', 'A hands-on course · 24 lessons': 'Developer Edition with sample data · 5 minutes'}, (60, 276), False),
    ('01 Agenda', m2.sl_agenda, {'Connect your org': 'Open the sign-up page', 'Build a recipe': 'Fill in the form', 'Write your first SAQL': 'Verify your email',
                                 'Design the dashboard': 'Set your password', 'Share & secure': 'Open your new org', '04 MIN': 'STEP 1', '08 MIN': 'STEP 2',
                                 '10 MIN': 'STEP 3', '12 MIN': 'STEP 4', '06 MIN': 'STEP 5'}, (60, 276), False),
] + [(f'01 Step {int(n)} Bar', m2.lt_lesson_bar, {'04': n, 'Window functions': t, '12 MIN · SAQL · INTERMEDIATE': m, 'LESSON': 'STEP'}, (24, 276), True) for n, t, m in STEPS] + [
    ('01 Tip Username', callout('PRO TIP —', mc.SIGNAL, 'Username: any unique email-style name.', s=0.62, cx=-640, cy=60), {}, (24, 276), False),
    ('01 Note Inbox', callout('NOTE —', mc.TIDE, 'The activation email can take a few minutes.', fill=mc.ICE, cx=0, cy=-150), {}, (24, 276), False),
    ('01 Warning Answer', callout('WATCH OUT —', '#D9483B', 'Write down your security answer.', s=0.72, cx=605, cy=0), {}, (24, 276), False),
    ('01 Click Verify', click_at(72, 6), {}, (24, 276), False),
    ('01 Click Change Password', click_at(0, -497), {}, (24, 276), False),
    ('01 All Set', lambda d: placed(d, mc.le_checklist(d), 0.8, 560, -200), {'CHECKLIST —': 'ALL SET —', 'Dataset is synced': 'Org created on Trailhead',
                                                                             'Fields are typed': 'Email verified', 'Security predicate set': 'Password & answer saved'}, (24, 276), True),
    ('01 Summary', m2.sl_summary, {'Datasets are fast': 'Sign up is free', 'copies built for analysis': 'on Trailhead, in minutes',
                                   'Recipes shape data': 'Verify by email', 'before it reaches a lens': 'then set a password',
                                   'SAQL answers': 'Your org is ready', "what clicks can't": 'with CRM Analytics enabled', '13 —': '02 —'}, (60, 276), False),
]


def build_all(out):
    ozml.OUT = out
    for name, fn, repl, build, anim in JOBS:
        REPL.clear(); REPL.update(repl)
        d = m2.doc('title', name, 'Episode 01', 300, build, 150)
        body = fn(d)
        if anim:
            body = with_animation(d, body)
        d.write(body, mc.thumb_bp(name, 'Episode 01'))


if __name__ == '__main__':
    build_all(sys.argv[1])
