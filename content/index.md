---
seo:
  title: CRM Analytics Academy — Learn Salesforce CRM Analytics
  description: A free, open-source curriculum for mastering Salesforce CRM Analytics — from data prep and SAQL to dashboards and Einstein Discovery, in five hands-on modules.
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
---
#top
:hero-background

#title
Master Salesforce [CRM Analytics]{.text-primary}.

#description
A free, open-source curriculum that takes you from zero to confident — across five hands-on modules covering data integration, SAQL, dashboards, and Einstein Discovery, with real datasets and copy-paste examples.

#links
  :::u-button
  ---
  to: /foundations
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  Start learning
  :::

  :::u-button
  ---
  color: neutral
  variant: outline
  size: xl
  to: '#curriculum'
  icon: i-lucide-graduation-cap
  ---
  Browse curriculum
  :::

#default
  ```sql [revenue-by-stage.saql]
  q = load "Opportunities";
  q = filter q by 'CloseDate' in ["1 year ago".."current day"];
  q = group q by 'StageName';
  q = foreach q generate
        'StageName' as 'Stage',
        sum('Amount') as 'Pipeline';
  q = order q by 'Pipeline' desc;
  ```
::

:ad-unit{placement="belowHero"}

::u-page-section{class="dark:bg-neutral-950"}
#title
A curriculum, not a pile of articles

#description
Five modules build on each other — start at the top and you will touch the entire CRM Analytics pipeline, from raw data to a deployed prediction.

#features
  :::u-page-feature
  ---
  icon: i-lucide-book-open
  ---
  #title
  5 structured modules

  #description
  Foundations through Einstein Discovery, each ordered so concepts build naturally on what came before.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-square-code
  ---
  #title
  Hands-on & example-led

  #description
  Real SAQL, recipe, and dashboard examples you can paste straight into your own Salesforce org.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-unlock
  ---
  #title
  100% free & open source

  #description
  No paywalls, no sign-up. Every lesson lives in a public repo you can read, fork, and improve.
  :::
::

::u-page-section{#curriculum class="dark:bg-neutral-950"}
#title
The Curriculum

#description
Five modules take you from your first dataset to deploying explainable predictions back into Salesforce.

#features
  :::u-page-card
  ---
  to: /foundations
  icon: i-lucide-compass
  spotlight: true
  ---
  #title
  01 · Foundations

  #description
  What CRM Analytics is, licensing and access, and a guided tour of Analytics Studio so you know where everything lives.
  :::

  :::u-page-card
  ---
  to: /data-integration
  icon: i-lucide-database
  spotlight: true
  ---
  #title
  02 · Data Integration & Prep

  #description
  Connect and sync data, build Data Prep recipes, and model secure, analysis-ready datasets with row-level security.
  :::

  :::u-page-card
  ---
  to: /saql
  icon: i-lucide-terminal
  spotlight: true
  ---
  #title
  03 · SAQL

  #description
  The Salesforce Analytics Query Language — load, filter, group, windowing, and binding queries together for interactivity.
  :::

  :::u-page-card
  ---
  to: /dashboards
  icon: i-lucide-layout-dashboard
  spotlight: true
  ---
  #title
  04 · Dashboards

  #description
  Explore with lenses, assemble responsive dashboards, and add drill-downs, actions, and conditional formatting.
  :::

  :::u-page-card
  ---
  to: /einstein-discovery
  icon: i-lucide-brain-circuit
  spotlight: true
  ---
  #title
  05 · Einstein Discovery

  #description
  Build explainable models with stories, evaluate them, and deploy predictions and recommendations where users work.
  :::

  :::u-page-card
  ---
  to: /foundations
  icon: i-lucide-flag
  spotlight: true
  ---
  #title
  Start here →

  #description
  New to CRM Analytics? Begin with Foundations and follow the modules in order for a complete learning path.
  :::
::

:ad-unit{placement="betweenSections"}

::u-page-section{class="dark:bg-neutral-950"}
#title
How it works

#description
A simple loop: learn a concept, try it in your org, and build toward a complete analytics solution.

#features
  :::u-page-feature
  ---
  icon: i-lucide-book-marked
  ---
  #title
  1. Read the lesson

  #description
  Short, focused lessons explain one idea at a time with diagrams, callouts, and real examples.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-flask-conical
  ---
  #title
  2. Try it live

  #description
  Every concept maps to a concrete action in Analytics Studio — follow along in a Salesforce org or Developer Edition.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-blocks
  ---
  #title
  3. Build a project

  #description
  Modules accumulate into a working pipeline: synced data, clean datasets, dashboards, and a deployed model.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-bot
  ---
  #title
  4. Ask the AI

  #description
  Every page is available as Markdown and over MCP, so Claude or ChatGPT can tutor you from the source material.
  :::
::

::u-page-section{class="dark:bg-neutral-950"}
#title
What you will be able to do

#description
By the end of the curriculum you can deliver an end-to-end CRM Analytics solution.

#features
  :::u-page-feature
  ---
  icon: i-lucide-plug
  ---
  #title
  Integrate any data

  #description
  Connect Salesforce and external sources, schedule reliable syncs, and keep datasets fresh.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-wand-sparkles
  ---
  #title
  Shape data with recipes

  #description
  Join, aggregate, and clean raw data into trustworthy, well-modeled datasets.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-terminal
  ---
  #title
  Write real SAQL

  #description
  Author queries by hand for advanced metrics, windowing, and dashboard interactivity.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-layout-dashboard
  ---
  #title
  Build interactive dashboards

  #description
  Design responsive, faceted dashboards with drill-downs and embedded Salesforce actions.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-brain-circuit
  ---
  #title
  Deploy predictions

  #description
  Train explainable Einstein Discovery models and surface their predictions on records and in flows.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-badge-check
  ---
  #title
  Prep for certification

  #description
  Cover the skills measured by the CRM Analytics & Einstein Discovery Consultant exam.
  :::
::

::u-page-section{class="dark:bg-gradient-to-b from-neutral-950 to-neutral-900"}
  :::u-page-c-t-a
  ---
  links:
    - label: Start with Foundations
      to: '/foundations'
      trailingIcon: i-lucide-arrow-right
    - label: Star on GitHub
      to: 'https://github.com/crm-analytics-academy/crm-analytics-academy'
      target: _blank
      variant: subtle
      icon: i-simple-icons-github
  title: Ready to become a CRM Analytics pro?
  description: Begin the curriculum today — it is free, open, and built to take you all the way to certified.
  class: dark:bg-neutral-950
  ---

  :stars-bg
  :::
::
