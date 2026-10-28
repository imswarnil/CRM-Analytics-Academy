---
title: Security — practice questions
domain: security
quiz:
  - id: setup-index-1
    q: Why does CRM Analytics access come through permission sets rather than profiles?
    options:
      - Profiles are deprecated
      - Analytics permissions ship as permission set licences that are granted additively, so access is composed rather than baked into one profile
      - Profiles cannot grant object access
      - It is a licensing bug
    answer: 1
    topic: setup
  - id: setup-index-2
    q: "A dashboard is correct for you and empty for the sales team. The most likely cause is:"
    options:
      - A broken widget query
      - Row-level security — the predicate or sharing inheritance is filtering their rows away
      - The dataset failed to refresh
      - They need a different browser
    answer: 1
    topic: setup
  - id: setup-index-3
    q: When should security be designed?
    options:
      - After the dashboards are approved
      - Before the first dataset is built, because the predicate depends on fields that must be synced and sometimes on a recipe node that flattens the role hierarchy
      - Only if the data is sensitive
      - It is automatic
    answer: 1
    topic: setup
  - id: setup-licences-and-permission-sets-1
    q: A System Administrator cannot see the Analytics Studio tile. What is wrong?
    options:
      - Their profile is misconfigured
      - Nothing is wrong — CRM Analytics access comes by permission set, and admin rights do not include it
      - The org has no data
      - They need to be a Salesforce Platform user
    answer: 1
    topic: setup
  - id: setup-licences-and-permission-sets-2
    q: Which capability sits in the higher (Plus) tier rather than the base one?
    options:
      - Building dashboards
      - Einstein Discovery — training stories and deploying predictive models
      - Creating datasets
      - Sharing an app
    answer: 1
    topic: setup
  - id: setup-licences-and-permission-sets-3
    q: "The fastest way to find out what a user is missing is:"
    options:
      - Compare their profile to yours
      - Open their user record and read the permission set assignments, then check the org's licence entitlements
      - Rebuild the dashboard
      - Ask them to log out and in
    answer: 1
    topic: setup
  - id: setup-the-integration-user-1
    q: The integration user lacks field-level access to Discount__c. What happens?
    options:
      - The sync fails with an error
      - The field never arrives; the recipe and dashboard build cleanly and quietly compute figures without discounts
      - The field arrives empty and is flagged
      - Salesforce grants access automatically
    answer: 1
    topic: setup
  - id: setup-the-integration-user-2
    q: Why is this failure especially dangerous?
    options:
      - It corrupts the dataset
      - It is silent and produces plausible numbers, so it survives review
      - It deletes records
      - It only affects administrators
    answer: 1
    topic: setup
  - id: setup-the-integration-user-3
    q: A new custom field was added last month but is not in the dataset. First thing to check?
    options:
      - The dashboard's widget query
      - Whether the field was added to the data sync selection AND is visible to the integration user
      - The security predicate
      - The app sharing settings
    answer: 1
    topic: setup
  - id: setup-row-level-security-1
    q: Where is a security predicate applied?
    options:
      - On each widget, at design time
      - On the dataset, at query time, per viewer
      - In the recipe, at build time
      - On the app's sharing settings
    answer: 1
    topic: setup
  - id: setup-row-level-security-2
    q: Why does a role-hierarchy predicate usually need a 'flatten' node in the recipe?
    options:
      - To reduce row count
      - Because a predicate cannot walk the hierarchy at query time — the ancestry has to be precomputed into a column it can compare against
      - To sort the data
      - It does not; flatten is optional styling
    answer: 1
    topic: setup
  - id: setup-row-level-security-3
    q: "You add a predicate and your own dashboards go empty. The likeliest explanation is:"
    options:
      - The dataset is corrupt
      - The predicate is evaluated for you too, and your user does not satisfy it
      - The recipe failed
      - Predicates only work for admins
    answer: 1
    topic: setup
  - id: setup-sharing-inheritance-1
    q: What is the main advantage of sharing inheritance over a hand-written predicate?
    options:
      - It is faster to query
      - It reuses the org's existing sharing, so analytics cannot drift from the CRM as the business reorganises
      - It supports more objects
      - It removes the need for the integration user
    answer: 1
    topic: setup
  - id: setup-sharing-inheritance-2
    q: Why does sharing inheritance need a fallback predicate?
    options:
      - For non-Salesforce data only
      - Because inheritance has limits — when a user's sharing is too complex to evaluate, the fallback decides what they see
      - To speed up the dashboard
      - It does not need one
    answer: 1
    topic: setup
  - id: setup-org-settings-and-rollout-1
    q: A new CRM Analytics feature toggle appears after a release. Where should you enable it first?
    options:
      - Production, so everyone benefits immediately
      - A sandbox or developer org, where a behaviour change cannot affect a live dashboard
      - Nowhere — never enable new features
      - It makes no difference
    answer: 1
    topic: setup
  - id: setup-org-settings-and-rollout-2
    q: What is the right first audience for a new dashboard?
    options:
      - The whole company, to maximise feedback
      - Two or three people who will actually make the decision it supports
      - Executives only
      - Nobody — publish silently
    answer: 1
    topic: setup
  - id: setup-hands-on-locking-down-the-academy-1
    q: Where is the security predicate configured?
    options:
      - On the dashboard
      - On the dataset
      - On the app
      - On the user profile
    answer: 1
    topic: setup
  - id: setup-hands-on-locking-down-the-academy-2
    q: Your own dashboard goes empty after adding a predicate. What happened?
    options:
      - The dataset broke
      - The predicate applies to you too and your user does not satisfy it
      - Predicates disable dashboards
      - The recipe needs to re-run
    answer: 1
    topic: setup
  - id: setup-hands-on-locking-down-the-academy-3
    q: A user's region field is blank. What do they see?
    options:
      - Everything
      - Nothing — a null fails closed
      - Only their own records
      - An error message
    answer: 1
    topic: setup
  - id: setup-graded-quiz-1
    q: A System Administrator has no Analytics Studio tile. Why?
    options:
      - Their profile is broken
      - CRM Analytics access comes by permission set; admin rights do not include it
      - The org has no data
      - They must be a Platform user
    answer: 1
    topic: setup
  - id: setup-graded-quiz-2
    q: "Einstein Discovery requires:"
    options:
      - The base Growth tier
      - The higher Plus tier
      - No licence at all
      - A separate Tableau licence
    answer: 1
    topic: setup
  - id: setup-graded-quiz-3
    q: The integration user cannot see a custom field. What happens?
    options:
      - The sync fails loudly
      - The field never arrives, everything downstream builds cleanly, and the numbers are quietly incomplete
      - The field arrives as null and is flagged
      - Access is granted automatically
    answer: 1
    topic: setup
  - id: setup-graded-quiz-4
    q: Where is a security predicate applied?
    options:
      - On the dashboard at design time
      - On the dataset, per viewer, at query time
      - In the recipe at build time
      - On the app's sharing
    answer: 1
    topic: setup
  - id: setup-graded-quiz-5
    q: You add a predicate and your own dashboards go empty. Why?
    options:
      - The dataset is corrupt
      - The predicate is evaluated for you too and your user does not satisfy it
      - Predicates disable admin access permanently
      - The recipe must re-run
    answer: 1
    topic: setup
  - id: setup-graded-quiz-6
    q: A user's predicate field is blank. What do they see?
    options:
      - Everything
      - Nothing — nulls fail closed
      - Their own records
      - An error
    answer: 1
    topic: setup
  - id: setup-graded-quiz-7
    q: Why does a role-hierarchy predicate need a flatten node?
    options:
      - To reduce dataset size
      - A predicate cannot walk a hierarchy at query time, so the ancestry is precomputed into a comparable column
      - To sort roles alphabetically
      - It does not
    answer: 1
    topic: setup
  - id: setup-graded-quiz-8
    q: "The main advantage of sharing inheritance over a hand-written predicate is:"
    options:
      - Faster queries
      - It reuses the org's existing sharing, so analytics cannot drift as the business reorganises
      - It works on all external data
      - It removes the need for an integration user
    answer: 1
    topic: setup
  - id: setup-graded-quiz-9
    q: Why does sharing inheritance need a fallback predicate?
    options:
      - For performance
      - Because inheritance has limits, and something must decide what a viewer sees when it cannot be evaluated
      - To support dashboards
      - It does not
    answer: 1
    topic: setup
  - id: setup-graded-quiz-10
    q: "Before releasing a secured dashboard you should:"
    options:
      - Review it as an administrator
      - Check it as a restricted user, a manager, and someone who should see nothing
      - Export it to a spreadsheet
      - Enable every feature toggle
    answer: 1
    topic: setup
---

Practice questions for the Security domain of the CRM Analytics and Einstein Discovery Consultant exam.
