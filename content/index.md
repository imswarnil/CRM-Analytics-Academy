---
seo:
  title: CRM Analytics Academy — Learn Salesforce CRM Analytics
  description: A free, open-source curriculum for mastering Salesforce CRM Analytics — data prep, datasets, SAQL, dashboards, and Einstein Discovery, from fundamentals to advanced.
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
A free, open-source, community-driven curriculum that takes you from zero to confident — data integration, datasets, SAQL, dashboards, and Einstein Discovery — with hands-on recipes and real datasets.

#links
  :::u-button
  ---
  to: /getting-started
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

::u-page-section{#curriculum class="dark:bg-neutral-950"}
#title
The Curriculum

#description
Eight modules, ordered as a path. Start at the top and work down, or jump to the topic you need. The docs _are_ the course.

#features
  :::u-page-feature
  ---
  icon: i-lucide-compass
  to: /getting-started
  ---
  #title
  01 · Foundations

  #description
  What CRM Analytics is, licensing and setup, Analytics Studio, and finding your way around the platform.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-database
  to: /getting-started
  ---
  #title
  02 · Data Integration

  #description
  Data Manager, connectors, syncs, and scheduling — getting Salesforce and external data into the platform reliably.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-wand-sparkles
  to: /getting-started
  ---
  #title
  03 · Data Prep & Recipes

  #description
  Build recipes with joins, aggregates, transforms, and clustering to shape clean, analysis-ready datasets.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-table-2
  to: /getting-started
  ---
  #title
  04 · Datasets & Modeling

  #description
  Dataset structure, dimensions vs. measures, dates, augmenting data, and row-level security predicates.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-terminal
  to: /getting-started
  ---
  #title
  05 · SAQL

  #description
  The Salesforce Analytics Query Language — load, filter, group, foreach, windowing, and binding queries together.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-layout-dashboard
  to: /getting-started
  ---
  #title
  06 · Lenses & Dashboards

  #description
  Explore with lenses, then build interactive dashboards with widgets, faceting, and dashboard bindings.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-brain-circuit
  to: /getting-started
  ---
  #title
  07 · Einstein Discovery

  #description
  Predictive and prescriptive analytics — stories, models, improvements, and deploying predictions back into Salesforce.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-rocket
  to: /getting-started
  ---
  #title
  08 · Advanced & Delivery

  #description
  Templates, embedding in Lightning, the Analytics REST API, mobile, and production best practices.
  :::
::

::u-page-section{class="dark:bg-neutral-950"}
#title
Why learn here

#features
  :::u-page-feature
  ---
  icon: i-lucide-unlock
  ---
  #title
  Free & open source

  #description
  No paywalls, no sign-up. Every lesson lives in a public repo — fix a typo or contribute a recipe with a pull request.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-square-code
  ---
  #title
  Hands-on recipes

  #description
  Copy-paste SAQL, dataflow, recipe, and dashboard JSON examples you can drop straight into your own org.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-route
  ---
  #title
  A real learning path

  #description
  Concepts build on each other in order — from your first dataset to deploying Einstein Discovery models.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-bot
  ---
  #title
  AI-assistant ready

  #description
  Every page is available as clean Markdown and over MCP, so Claude or ChatGPT can teach from the source.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-badge-check
  ---
  #title
  Certification-aligned

  #description
  Mapped to the skills measured by the Salesforce CRM Analytics & Einstein Discovery Consultant exam.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-users
  ---
  #title
  Community-driven

  #description
  Built by practitioners. Suggest topics, report issues, and shape the curriculum alongside other learners.
  :::
::

:ad-unit{placement="betweenSections"}

::u-page-section{class="dark:bg-gradient-to-b from-neutral-950 to-neutral-900"}
  :::u-page-c-t-a
  ---
  links:
    - label: Start with the fundamentals
      to: '/getting-started'
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
