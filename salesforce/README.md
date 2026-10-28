# Salesforce project

An SFDX project for whichever org this course is being practised in. It lives
inside the site's repository on purpose: the lessons describe builds in a real
org, and the metadata for those builds belongs beside the lessons.

## Set up your own org in one command (learners)

Everything the course builds on goes into **your own** free CRM Analytics org —
nobody shares an org or a login. You need Node 18+ and the
[Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli).

```
# 1. a free org with CRM Analytics in it (NOT the plain Developer Edition signup)
#    https://trailhead.salesforce.com/promo/orgs/analytics-de
git clone https://github.com/imswarnil/CRM-Analytics-Academy.git
cd CRM-Analytics-Academy/salesforce
sf org login web --alias my-crma

# 2. see what it will do, then do it
node scripts/academy-setup.mjs --target-org my-crma --dry-run
node scripts/academy-setup.mjs --target-org my-crma
```

It assigns you **CRM Analytics Plus Admin** and **Plus User**, deploys the
**Academy Analytics** app, loads all 21 Academy CSVs into it as `academy_*`
datasets with their field types set explicitly (dates as dates, IDs as
dimensions, amounts with their decimals), and deploys any course builds
committed under `academy/`. It never touches the sample apps and datasets your
org shipped with, and it is safe to re-run — datasets are overwritten in place.

`--only accounts,leads` loads a subset. `--enable-null-measures` first turns on
*Null Measure Handling in Datasets* so blank numbers stay blank: without it
CRM Analytics forces a default, eight columns (CSAT, MentionRank, PilotDays…)
read 0 instead of empty, and averages come out wrong. The script names them.

The set-up lesson has you upload `accounts.csv` by hand on purpose — do that
once to learn what the upload checks; use the script to skip the other twenty.

## What lives where

```
academy/      the course's own assets, deployed to learners' orgs — commit here
force-app/    whatever `sf project retrieve start` retrieves (wave/ is gitignored)
scripts/      academy-setup.mjs, plus Apex and SOQL scratch
```

## Which org

Whatever you set as the CLI's **default** org — the scripts do not name one, so
you can point this at a fresh org without editing anything:

```
sf org login web --alias crma-learning --set-default
sf org list                    # confirm the default (marked with a target icon)
```

Nothing here is tied to a particular org, username or namespace.

## Working with it

```
sf project retrieve start --metadata WaveDashboard WaveRecipe WaveDataflow WaveLens WaveApplication
sf org open
```

Retrieve freely; commit deliberately. `salesforce/force-app/main/default/wave/`
is gitignored, because a freshly provisioned CRM Analytics org ships a few dozen
Salesforce sample dashboards and committing those to a public repo redistributes
their content and buries the work this course is about. When you build something
of your own, add it explicitly:

```
git add -f salesforce/force-app/main/default/wave/<YourDashboard>.wdash
```

## Never commit the auth state

`.sf/` and `.sfdx/` hold org access and refresh tokens. A refresh token in one of
those files is a live, password-free login to the org — anyone who gets the file
is inside it. Both are gitignored at the repo root; keep it that way, and never
paste a token into a lesson, an issue or a commit.
