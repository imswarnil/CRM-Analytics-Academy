---
title: "Product & User Adoption"
description: "Whether the people who signed up are actually using the thing — activation, weekly active accounts, feature depth and the accounts that went quiet, with a team filter."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Service"
difficulty: "Intermediate"
publishedAt: "2026-09-28"
datasets:
  - "usage_monthly.csv"
  - "accounts.csv"
  - "web_sessions.csv"
kpis:
  - name: "Activation Rate"
    formula: "count(accounts reaching first meaningful use) / count(accounts created), by cohort month"
    note: "Define “meaningful” once and write it down — first API call, not first login. Every adoption number downstream inherits that definition, and teams that skip it end up with two activation rates."
  - name: "Weekly Active Accounts"
    formula: "count(distinct AccountId with usage in the week) / count(active accounts)"
    note: "Accounts, not users — this data has no per-user grain. Saying “accounts” in the label costs nothing and prevents somebody quoting it as a user number in a board deck."
  - name: "Feature Depth"
    formula: "count(distinct ProductCode used) per account per month"
    note: "The best single predictor of retention in a usage business: an account on three products behaves nothing like an account on one, and depth moves months before ARR does."
recipe:
  - step: "Pick the grain before anything else"
    detail: "usage_monthly is month × account × product. Adoption questions are per account per month, so collapse products first or every account counts once per product it uses."
  - step: "Define activation in the recipe"
    detail: "A boolean computed once, not a condition re-written per widget. This is the definition the whole dashboard rests on."
  - step: "Add the team filter as a real dimension"
    detail: "Join reps and CSM ownership onto the account so the dashboard filters by team. A team filter bolted on as a dashboard control without the join filters nothing."
  - step: "Chart the distribution, not the average"
    detail: "Average feature depth of 1.8 is the mean of accounts on one product and accounts on four. The bands are the finding; the mean is the headline."
techniques:
  - "Cohorting"
  - "Aggregate before join"
  - "Team filtering"
  - "Distribution over average"
---

Built on the consumption work in **[Build: Consumption and Commit Risk](/revops-analytics/consumption-and-commit-risk)**, which is where the utilisation bands and the risk flag are defined. Adoption asks the same data a different question: not “who is about to leave” but “who never really arrived”.
