# Set Up Your Org in Thirty Minutes — speaker notes

crmanalytics.imswarnil.com/introduction/set-up-your-org · 19 slides · ~9 min

## 01 · Set Up Your Org in Thirty Minutes (6s)

A free CRM Analytics Developer org, the two permission sets that actually matter, an app to build in, and the first Academy CSV loaded — the shortest honest path from nothing to a working dataset.

You need an org to build in. This lesson gets you from nothing to a working dataset in about half an hour, and skips every explanation that can wait — the access section covers licences, the integration user and row-level security properly. Do not use the normal Developer Edition signup. A standard free Developer org does not include CRM Analytics, and you cannot switch it on from Setup — the licence is not in the org. Use the CRM Analytics Developer Edition promo signup below. This is the single most common way a first evening gets wasted.

## 02 · What you will learn (12s)

- The six steps
- The two permission sets, in one paragraph
- What "app" means here, because it is confusing
- Loading a CSV: what to check every single time
- Your thirty minutes, spent
- Do not load all twenty-one files yet

## 03 · The two permission sets, in one paragraph (24s)

CRM Analytics access is granted by permission set, not by profile, and not by being an administrator. CRM Analytics Plus Admin carries the create-and-manage permissions: apps, datasets, recipes, dashboards, and the ability to see all data through the platform. CRM Analytics Plus User carries the day-to-day use permissions. In a real org these go to different people and the distinction is the whole subject of the access section; in your own practice org you want both, on yourself, and then you want to forget about it until the access section explains why the split exists. If the Analytics Studio tile is missing after assigning the permission sets, log out and log back in. Permission set assignments sometimes need a new session before the App Launcher picks them up. This resolves it far more often than any other fix.

## 04 · What "app" means here, because it is confusing (24s)

An app in CRM Analytics is a container with sharing settings — closer to a folder than to an application. Datasets, lenses and dashboards live inside one. Sharing an app shares what is in it, which is why the exploration section on collaboration is largely a lesson about app design rather than about buttons. Your org already contains sample apps from Salesforce. Leave them alone; they are useful reference material and occasionally a lesson points at them. Everything you build goes in Academy Analytics.

## 05 · Loading a CSV: what to check every single time (9s)

Uploading a CSV takes ten seconds. Checking it takes two minutes and saves a build. Three things go wrong, in this order of frequency:

## 06 · Your thirty minutes, spent (8s)

The remaining five minutes are the ones where the Analytics Studio tile does not appear and you log out and back in.

## 07 · Do not load all twenty-one files yet (24s)

Load accounts.csv and stop. The Data Preparation section loads the rest properly — through recipes rather than by hand, which is how it would be done in a real org, and which teaches you something that uploading twenty-one CSVs in a row does not. This site never touches your org. No lesson asks for your credentials, there is no connected app, and nothing here reads or writes Salesforce data. The datasets are plain CSV files you download and upload yourself. If any page ever asks you to authorise something against your org, it is not this one.

## 08 · Lab 1 — Sign up for the right kind of org (50s)

Screen: trailhead.salesforce.com/promo/orgs/analytics-de → the signup form

This is the one step where the wrong choice costs you an hour. A plain Developer Edition org from the normal signup page does not have CRM Analytics in it, and there is no switch to turn it on — you would get all the way to Setup before discovering the Analytics licence simply is not there. This promo page gives you a Developer Edition org with CRM Analytics already provisioned, with sample data, and it does not expire the way a thirty-day trial does.

## 09 · Lab 2 — The username is not an email address (40s)

Screen: The signup form → Username field

Use a real email address for Email, because you need the activation link. The Username field is separate and it must be globally unique across every Salesforce org on earth, so put something like your-name-crma-2026 at example dot com in it. It never has to receive mail. People reuse their email address here, hit a uniqueness error on their second org months later, and cannot work out why.

## 10 · Lab 3 — Activate and set a password you will not lose (25s)

Screen: The activation email → Change Password screen

The link is valid for a limited time and the org is unusable until you use it. Set the password in your password manager now, with the login URL, because a Developer org has no recovery path worth relying on — if you lose it you sign up again from scratch and reload everything.

## 11 · Lab 4 — Confirm CRM Analytics is really there (45s)

Screen: Setup → Quick Find 'Analytics' → Analytics → Settings

Before assigning anything, confirm. If you can see an Analytics section in Setup with a Settings page, and the checkbox for enabling CRM Analytics is already ticked, the org is the right kind. If Quick Find returns nothing under Analytics, stop — you have a plain Developer org and the fastest fix is signing up again through the promo link rather than trying to enable it.

## 12 · Lab 5 — Assign yourself the permission sets (55s)

Screen: Setup → Users → your user → Permission Set Assignments → Edit

Being a System Administrator is not enough. CRM Analytics access comes through permission sets, and you want two: CRM Analytics Plus Admin, which lets you create apps, datasets, recipes and dashboards, and CRM Analytics Plus User. Assign both to yourself. Section two explains what each permission inside them actually grants and why the split exists — for now, the point is that this step is the reason most people's first hour is spent staring at a missing Analytics tab.

## 13 · Lab 6 — Open Analytics Studio for the first time (30s)

Screen: App Launcher (the nine dots) → search 'Analytics' → Analytics Studio

If the tile is there, you are set up. If it is not, log out and back in — permission set assignments sometimes need a fresh session before the App Launcher notices them. That one trick resolves the overwhelming majority of I assigned it and it is still not there.

## 14 · Lab 7 — Create the app you will build everything in (40s)

Screen: Analytics Studio → Create → App → Create Blank App → name it 'Academy Analytics'

An app in CRM Analytics is a folder with sharing attached, not an application. Create one blank app called Academy Analytics and put every dataset, lens and dashboard from this course inside it. Two reasons: the sample data that shipped with your org lives in its own apps and you want yours cleanly separate, and when section six covers sharing, you will have something real to share.

## 15 · Lab 8 — Load the first CSV (45s)

Screen: Analytics Studio → Create → Dataset → CSV File → upload accounts.csv

Start with accounts dot csv, the smallest file at a hundred and forty rows. Drop it in, let Salesforce infer the schema, and then look carefully at what it inferred — this is the habit worth building on the smallest file rather than the largest. Give the dataset a name, choose the Academy Analytics app as its home, and upload.

## 16 · Lab 9 — Check the field types before you trust them (55s)

Screen: The upload preview → Edit Field Attributes

The inferred schema is right about eighty percent of the time and the twenty percent costs you a whole build. Watch three things. Dates: anything that came in as text cannot be used in a date filter, and fixing it later means reloading. Account identifiers: if an ID looks numeric it may be typed as a measure, which means Salesforce will happily offer to sum it. And currency amounts: check the scale, because a cent-level value read as an integer is out by a factor of a hundred and nothing later flags it.

## 17 · Lab 10 — Prove it worked (40s)

Screen: Analytics Studio → Browse → your dataset → click it

Clicking a dataset opens a lens on it — that is CRM Analytics' default gesture and you will use it hundreds of times. You should see a count of a hundred and forty rows. If you see a hundred and thirty-nine, your CSV had a header issue; if you see zero, the upload failed silently and the Data Manager's monitor tab will tell you why. Either way, fix it now: everything in this course counts on these numbers matching the README.

## 18 · Recap (8s)

- The six steps: 
- The two permission sets, in one paragraph: CRM Analytics access is granted by permission set, not by profile, and not by being an administrator.
- What "app" means here, because it is confusing: An app in CRM Analytics is a container with sharing settings — closer to a folder than to an application.
- Loading a CSV: what to check every single time: Uploading a CSV takes ten seconds.
- Your thirty minutes, spent: The remaining five minutes are the ones where the Analytics Studio tile does not appear and you log out and back in.
- Do not load all twenty-one files yet: csv and stop.

## 19 · Keep going (6s)

Next lesson: A Guided Tour of Analytics Studio. Everything is free at crmanalytics.imswarnil.com.
