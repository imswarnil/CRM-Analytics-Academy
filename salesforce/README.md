# Salesforce project

An SFDX project for whichever org this course is being practised in. It lives
inside the site's repository on purpose: the lessons describe builds in a real
org, and the metadata for those builds belongs beside the lessons.

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
pnpm org:pull     # retrieve analytics metadata into force-app/
pnpm org:open     # open the default org in a browser
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
