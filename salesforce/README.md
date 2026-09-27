# Salesforce project

An SFDX project for the org this course is built against. It lives inside the site's
repository on purpose: the lessons describe builds in a real org, and the metadata for
those builds belongs beside the lessons rather than in somebody's local sandbox.

## What goes here

- `force-app/main/default/` — retrieved metadata: wave templates, dashboards, recipes,
  dataflows, permission sets, custom objects and fields, apps.
- `data/` — dummy CSVs generated or exported for the exercises. The Namilio dataset
  itself stays in `public/sample-data/namilio/`, which is what the site serves.

## Connecting the org

The CLI is installed (`sf --version`). Authorising is interactive and has to be done by
a human at a browser, so run it yourself from this session with a leading `!`:

```
!cd salesforce && sf org login web --alias crma-dev --set-default
```

Then retrieving metadata is scripted:

```
sf org list                                    # confirm the alias
sf project retrieve start --metadata Wave      # analytics assets
sf project retrieve start --metadata CustomObject:Account
```

## Never commit the auth state

`.sf/` and `.sfdx/` hold org access and refresh tokens. A refresh token in one of those
files is a live, password-free login to the org — anyone who gets the file is inside it.
Both are gitignored at the repo root; keep it that way, and never paste a token into a
lesson, an issue or a commit.
