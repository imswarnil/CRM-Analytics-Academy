---
title: Data Layer — practice questions
domain: data-layer
quiz:
  - id: foundations-index-1
    q: What is the single strongest argument for CRM Analytics over a general-purpose BI tool?
    options:
      - Its charts look better
      - It inherits Salesforce's sharing and security model, so who-sees-what is already solved
      - It is cheaper
      - It is the only tool that can read Salesforce data
    answer: 1
    topic: foundations
  - id: foundations-index-2
    q: "A dataset in CRM Analytics is best described as:"
    options:
      - A live view over Salesforce objects
      - A materialised, columnar snapshot rebuilt on a schedule
      - A saved report
      - A SQL table you can write to
    answer: 1
    topic: foundations
  - id: foundations-index-3
    q: Your VP wants a screen showing call-centre queue depth updating every few seconds. Is CRM Analytics the right tool?
    options:
      - Yes, with a fast enough recipe schedule
      - No — it refreshes on a schedule, not a stream; this is an operational need, not an analytical one
      - Yes, if you use Einstein Discovery
      - Only with a Plus licence
    answer: 1
    topic: foundations
  - id: foundations-the-three-layers-1
    q: Which layer owns the definition of 'qualified pipeline'?
    options:
      - The design layer, because that is where the number is displayed
      - The data layer, because a metric defined per-dashboard is a metric two dashboards will disagree about
      - The intelligence layer
      - Whichever team asks first
    answer: 1
    topic: foundations
  - id: foundations-the-three-layers-2
    q: A dashboard is slow. Which layer should you suspect first?
    options:
      - The design layer — too many widgets
      - The data layer — a dataset at the wrong grain forcing every widget to aggregate millions of rows
      - The intelligence layer
      - The network
    answer: 1
    topic: foundations
  - id: foundations-the-three-layers-3
    q: Einstein Discovery produces a model that is 78% accurate. What does the intelligence layer owe the design layer?
    options:
      - The prediction only
      - The prediction, the confidence, and the top factors — a score with no reason attached cannot be acted on
      - The training data
      - Nothing; accuracy is enough
    answer: 1
    topic: foundations
  - id: foundations-what-a-dataset-really-is-1
    q: What does 'the grain' of a dataset mean?
    options:
      - How much data it holds
      - What exactly one row represents
      - How often it refreshes
      - Which fields are measures
    answer: 1
    topic: foundations
  - id: foundations-what-a-dataset-really-is-2
    q: You join opportunities (608 rows) to opportunity_products (1,192 rows) and sum Amount. What happens?
    options:
      - Nothing — the sum is correct
      - Amount is counted once per product line, so total revenue is inflated — here it nearly triples
      - The join fails
      - Only matching rows are summed, so revenue falls
    answer: 1
    topic: foundations
  - id: foundations-what-a-dataset-really-is-3
    q: Why does a dataset hold history that the Salesforce object does not?
    options:
      - Salesforce deletes old records
      - Each run can append a snapshot of state at that moment, while the object only ever holds its current values
      - Datasets are backed up
      - It does not
    answer: 1
    topic: foundations
  - id: foundations-how-the-data-arrives-1
    q: What is data sync (replication) for?
    options:
      - Writing data back to Salesforce
      - Keeping a local copy of selected objects and fields current, so recipes read from it instead of hitting the source each run
      - Scheduling dashboards
      - Encrypting datasets
    answer: 1
    topic: foundations
  - id: foundations-how-the-data-arrives-2
    q: A recipe run fails. Where do you look?
    options:
      - The dashboard inspector
      - Data Manager → Monitor
      - Setup → Analytics → Settings
      - The dataset's field attributes
    answer: 1
    topic: foundations
  - id: foundations-how-the-data-arrives-3
    q: Why does the integration user matter so much?
    options:
      - It owns the dashboards
      - Sync runs as that user, so any object or field it cannot see simply never arrives — with no error on the dashboard
      - It pays for the licence
      - It schedules the recipes
    answer: 1
    topic: foundations
  - id: foundations-the-vocabulary-1
    q: "An 'app' in CRM Analytics is:"
    options:
      - An installed application
      - A container for datasets, lenses and dashboards, carrying the sharing settings
      - A mobile experience
      - A managed package
    answer: 1
    topic: foundations
  - id: foundations-the-vocabulary-2
    q: What is the practical difference between a lens and a dashboard?
    options:
      - Lenses cannot be saved
      - A lens explores one dataset and is a disposable workspace; a dashboard assembles many queries, facets them together, and is built for other people
      - Dashboards cannot use SAQL
      - None
    answer: 1
    topic: foundations
  - id: foundations-the-vocabulary-3
    q: "In Einstein Discovery, a 'story' is:"
    options:
      - A deployed model
      - The analysis of what correlates with an outcome, which may then be deployed as a model
      - A dashboard template
      - A narrative text widget
    answer: 1
    topic: foundations
  - id: foundations-when-not-to-use-it-1
    q: A stakeholder asks for a dashboard that updates 'in real time'. What is the right first move?
    options:
      - Schedule the recipe hourly and call it real time
      - Ask what decision is made from it and how stale it can be before it is useless — the answer is usually measured in hours
      - Refuse the request
      - Use Einstein Discovery
    answer: 1
    topic: foundations
  - id: foundations-when-not-to-use-it-2
    q: Most of the company's data is in a warehouse; Salesforce holds only accounts and opportunities. What does that suggest?
    options:
      - Use CRM Analytics and sync the warehouse in
      - You are building a warehouse project with a CRM attached — a BI tool on the warehouse will likely serve better
      - Use Salesforce reports
      - Use Einstein Discovery
    answer: 1
    topic: foundations
  - id: foundations-your-first-dashboard-1
    q: Why does this dashboard open with a single total ARR number?
    options:
      - To fill space at the top
      - So a viewer who reads nothing else still leaves with the headline the screen is about
      - Because number widgets load fastest
      - It is required by Salesforce
    answer: 1
    topic: foundations
  - id: foundations-your-first-dashboard-2
    q: Clicking a segment bar filters the other two widgets. Why?
    options:
      - A binding was configured
      - Widgets built on the same dataset facet each other by default
      - The table is a child of the chart
      - Faceting must always be turned on manually
    answer: 1
    topic: foundations
  - id: foundations-your-first-dashboard-3
    q: "The top-accounts table shows 10 rows rather than all 140. The best reason is:"
    options:
      - Performance
      - The question is about concentration, and a table nobody can take in at a glance is a data export rather than a dashboard
      - Tables are limited to 10 rows
      - To hide the smaller accounts
    answer: 1
    topic: foundations
  - id: foundations-graded-quiz-1
    q: "A dataset in CRM Analytics is:"
    options:
      - A live view over Salesforce objects
      - A materialised, columnar snapshot rebuilt on a schedule
      - A saved Salesforce report
      - A writable SQL table
    answer: 1
    topic: foundations
  - id: foundations-graded-quiz-2
    q: "The strongest argument for CRM Analytics over a general-purpose BI tool is:"
    options:
      - Better chart types
      - It inherits the org's sharing and security model rather than making you rebuild it
      - Lower licence cost
      - It is the only way to read Salesforce data
    answer: 1
    topic: foundations
  - id: foundations-graded-quiz-3
    q: "Total revenue on your dashboard is exactly double what finance reports. Most likely cause:"
    options:
      - The security predicate
      - A join that fanned out — a parent measure repeated across child rows
      - The dataset has not refreshed
      - Currency formatting
    answer: 1
    topic: foundations
  - id: foundations-graded-quiz-4
    q: Users report records missing that they know exist. Where do you look FIRST?
    options:
      - The dashboard's widget queries
      - The integration user's access, then the security predicate
      - The chart type
      - The app's colour theme
    answer: 1
    topic: foundations
  - id: foundations-graded-quiz-5
    q: Which layer owns the definition of a metric like 'qualified pipeline'?
    options:
      - Design — it is displayed there
      - Data — a metric defined per dashboard is one two dashboards will disagree about
      - Intelligence
      - Whichever team asks first
    answer: 1
    topic: foundations
  - id: foundations-graded-quiz-6
    q: What is data sync for?
    options:
      - Writing analytics results back to Salesforce
      - Keeping a local copy of selected objects and fields current so recipes do not hit the source each run
      - Scheduling dashboard emails
      - Encrypting datasets at rest
    answer: 1
    topic: foundations
  - id: foundations-graded-quiz-7
    q: "An 'app' in CRM Analytics is:"
    options:
      - An installed package
      - A container for datasets, lenses and dashboards that carries the sharing settings
      - A mobile client
      - A dashboard template
    answer: 1
    topic: foundations
  - id: foundations-graded-quiz-8
    q: "A recipe runs successfully every night but the data is always a day old. The most likely cause is:"
    options:
      - The dataset is corrupt
      - The recipe is scheduled before the data sync it depends on finishes
      - Faceting is disabled
      - The integration user lacks access
    answer: 1
    topic: foundations
  - id: foundations-graded-quiz-9
    q: "Your stakeholder needs a screen updating every few seconds for a live call queue. You should:"
    options:
      - Schedule the recipe as often as possible
      - Say this is an operational requirement, not an analytical one, and point at a Salesforce page or purpose-built tooling
      - Use Einstein Discovery
      - Build it and add a refresh button
    answer: 1
    topic: foundations
  - id: foundations-graded-quiz-10
    q: Einstein Discovery deploys a model that scores opportunities. What must ship with the score?
    options:
      - The training dataset
      - The top factors behind it — a bare probability gives a rep nothing to act on
      - The SAQL query
      - Nothing else
    answer: 1
    topic: foundations
  - id: data-preparation-index-1
    q: Which of these is NOT a way data becomes a CRM Analytics dataset?
    options:
      - A CSV upload
      - Data sync from Salesforce objects, transformed by a recipe
      - A live query issued by a dashboard widget
      - An external connection to a warehouse, synced and transformed
    answer: 2
    topic: data-preparation
  - id: data-preparation-index-2
    q: "Before building any recipe you should be able to state:"
    options:
      - The chart types you will use
      - What exactly one row of the output dataset represents
      - The dashboard's colour theme
      - How many users will view it
    answer: 1
    topic: data-preparation
  - id: data-preparation-connections-and-sync-1
    q: Why do recipes read from synced data rather than from the source each run?
    options:
      - Recipes cannot read Salesforce directly
      - A local copy is faster and does not hammer the system of record on every run
      - Synced data is more accurate
      - It is a licensing requirement
    answer: 1
    topic: data-preparation
  - id: data-preparation-connections-and-sync-2
    q: "A recipe succeeds nightly but always shows yesterday's data. The likeliest cause is:"
    options:
      - A corrupt dataset
      - The recipe is scheduled before the sync it depends on finishes
      - The dashboard caches
      - The integration user lacks access
    answer: 1
    topic: data-preparation
  - id: data-preparation-connections-and-sync-3
    q: You will need month-by-month history of a field starting next quarter. When should you begin syncing it?
    options:
      - Next quarter, when it is needed
      - Now — a snapshot can only remember what was synced at the time, and history cannot be backfilled from an object holding current state
      - It does not matter
      - Only after the recipe exists
    answer: 1
    topic: data-preparation
  - id: data-preparation-load-a-csv-properly-1
    q: A CloseDate field loaded as text. What breaks?
    options:
      - Nothing; text dates work normally
      - Date filters, month groupings and trend lines — and the fix requires a reload
      - Only the record page
      - The dataset will not save
    answer: 1
    topic: data-preparation
  - id: data-preparation-load-a-csv-properly-2
    q: Why force numeric-looking IDs to dimensions?
    options:
      - To save space
      - Because typed as measures the product will offer to sum them, and eventually somebody accepts
      - It is required
      - To make them filterable
    answer: 1
    topic: data-preparation
  - id: data-preparation-load-a-csv-properly-3
    q: "Your uploaded dataset shows 607 rows instead of 608. Most likely:"
    options:
      - A permission issue
      - A header-row problem in the CSV parse
      - A security predicate
      - Normal rounding
    answer: 1
    topic: data-preparation
  - id: data-preparation-buckets-and-binning-1
    q: Where should bucket boundaries come from?
    options:
      - Even thirds of the range
      - The business — the point at which somebody does something differently
      - The dataset's quartiles, always
      - The chart's colour scale
    answer: 1
    topic: data-preparation
  - id: data-preparation-buckets-and-binning-2
    q: "Bucketing in each dashboard rather than in the recipe leads to:"
    options:
      - Better flexibility
      - "'Large' meaning different things on different screens, with both defensible"
      - Faster queries
      - Smaller datasets
    answer: 1
    topic: data-preparation
  - id: data-preparation-buckets-and-binning-3
    q: "A value exactly on a boundary — utilisation of exactly 55% — should be:"
    options:
      - Left to chance
      - Assigned by an explicit, written rule, because somebody will eventually query it
      - Excluded
      - Rounded away
    answer: 1
    topic: data-preparation
  - id: data-preparation-recipe-nodes-1
    q: Which node type changes the grain of the data flowing through it?
    options:
      - Filter
      - Join and aggregate
      - Formula
      - Output
    answer: 1
    topic: data-preparation
  - id: data-preparation-recipe-nodes-2
    q: You need a count of opportunities per account attached to each account row. Which node?
    options:
      - Formula
      - Aggregate on opportunities grouped by account, then join back to accounts
      - Filter
      - Transform
    answer: 1
    topic: data-preparation
  - id: data-preparation-recipe-nodes-3
    q: Why split a large recipe into several smaller ones?
    options:
      - Recipes have a hard node limit
      - A fifty-node recipe is unreadable by anyone who did not write it, and failure stops localising
      - Smaller recipes run faster
      - It is required for scheduling
    answer: 1
    topic: data-preparation
  - id: data-preparation-formulas-and-computed-fields-1
    q: Why is the average of per-deal discount rates usually wrong?
    options:
      - Rounding
      - It weights a $5,000 deal the same as a $2M one — the correct figure divides total discount by total list value
      - Discounts cannot be averaged
      - The field is text
    answer: 1
    topic: data-preparation
  - id: data-preparation-formulas-and-computed-fields-2
    q: "A ratio needed on ten dashboards should be computed:"
    options:
      - In each widget, so every team can adjust it
      - Once in the recipe, so all ten agree by construction
      - In a spreadsheet
      - By Einstein Discovery
    answer: 1
    topic: data-preparation
  - id: data-preparation-formulas-and-computed-fields-3
    q: Which calculation genuinely belongs in the dashboard rather than the recipe?
    options:
      - A company-wide metric definition
      - One that depends on the viewer's current filter selection
      - A currency conversion
      - A bucketed segment
    answer: 1
    topic: data-preparation
  - id: data-preparation-missing-values-1
    q: "Filling a blank Amount with zero is:"
    options:
      - Always correct
      - A claim — it asserts the deal is worth nothing, which changes every average built on it
      - Required before aggregation
      - A display-only choice
    answer: 1
    topic: data-preparation
  - id: data-preparation-missing-values-2
    q: "Only 44% of closed cases have a CSAT survey. The average CSAT is:"
    options:
      - Wrong
      - Correct, but it describes respondents rather than customers — so it ships with the response rate beside it
      - Unusable
      - Improved by imputing the missing scores
    answer: 1
    topic: data-preparation
  - id: data-preparation-missing-values-3
    q: "'Economic buyer field is blank' predicts losing. The most likely explanation is:"
    options:
      - Blank fields cause losses
      - A disengaged rep does not fill fields in — the blank is a symptom, not a cause
      - The field is broken
      - Coincidence
    answer: 1
    topic: data-preparation
  - id: data-preparation-de-duplication-1
    q: "Revenue doubled after you added a join. The duplicates are:"
    options:
      - Real duplicate records to delete
      - A join artefact — the fix is the join, not a de-duplication step
      - A data entry problem
      - Caused by nulls
    answer: 1
    topic: data-preparation
  - id: data-preparation-de-duplication-2
    q: "An account appears 18 times in arr_snapshots. This is:"
    options:
      - A duplicate to remove
      - The intended grain — one row per account per month
      - A load failure
      - A sync error
    answer: 1
    topic: data-preparation
  - id: data-preparation-de-duplication-3
    q: When collapsing genuine duplicates, which row should survive?
    options:
      - Whichever appears first
      - One chosen by an explicit rule — most recently modified, most complete, or from the preferred source
      - A random row
      - The one with the lowest id
    answer: 1
    topic: data-preparation
  - id: data-preparation-troubleshooting-a-recipe-1
    q: A dashboard shows a wrong total. Where do you look first?
    options:
      - The widget's chart configuration
      - "Data Manager → Monitor: did it run, when, and how many rows"
      - The app sharing settings
      - The browser console
    answer: 1
    topic: data-preparation
  - id: data-preparation-troubleshooting-a-recipe-2
    q: "Row count fell from 2,800 to 2,100 after a change you did not make. Most likely:"
    options:
      - Normal variation
      - An upstream filter, an inner join, or a permission change dropping records
      - A chart limit
      - Rounding
    answer: 1
    topic: data-preparation
  - id: data-preparation-troubleshooting-a-recipe-3
    q: "The fastest way to localise a grain problem in a recipe is:"
    options:
      - Re-reading the SAQL
      - Clicking through node previews and watching where the row count changes
      - Rebuilding the recipe
      - Exporting to CSV
    answer: 1
    topic: data-preparation
  - id: data-preparation-graded-quiz-1
    q: What is data sync for?
    options:
      - Writing analytics results back to Salesforce
      - Keeping a local copy of selected objects and fields current, so recipes do not hit the source on every run
      - Scheduling dashboard emails
      - Encrypting datasets
    answer: 1
    topic: data-preparation
  - id: data-preparation-graded-quiz-2
    q: "A recipe runs green nightly but the data is always a day old. Cause:"
    options:
      - A corrupt dataset
      - The recipe is scheduled before the sync it depends on completes
      - Dashboard caching
      - A stale predicate
    answer: 1
    topic: data-preparation
  - id: data-preparation-graded-quiz-3
    q: "A CloseDate loaded as text prevents:"
    options:
      - Nothing
      - Date filters, month groupings and trend lines
      - Sorting
      - Joining
    answer: 1
    topic: data-preparation
  - id: data-preparation-graded-quiz-4
    q: Why force numeric-looking IDs to dimensions at load?
    options:
      - To save space
      - Because typed as measures the product will offer to sum them, and eventually somebody accepts
      - It is required
      - To make them filterable
    answer: 1
    topic: data-preparation
  - id: data-preparation-graded-quiz-5
    q: "Bucket boundaries should come from:"
    options:
      - Even thirds of the range
      - The business — the point at which somebody does something differently
      - The dataset's quartiles, always
      - The chart palette
    answer: 1
    topic: data-preparation
  - id: data-preparation-graded-quiz-6
    q: "Bucketing in each dashboard rather than in the recipe leads to:"
    options:
      - More flexibility
      - "'Large' meaning different things on different screens, both defensible"
      - Faster queries
      - Smaller datasets
    answer: 1
    topic: data-preparation
  - id: data-preparation-graded-quiz-7
    q: "'Average discount' computed as the mean of per-deal rates is wrong because:"
    options:
      - Discounts are not numeric
      - It weights every deal equally regardless of size
      - Nulls are excluded
      - It needs a distinct count
    answer: 1
    topic: data-preparation
  - id: data-preparation-graded-quiz-8
    q: "Filling a blank Amount with zero is:"
    options:
      - Always correct
      - A claim — it asserts the deal is worth nothing, and it drags every average built on it
      - Required before aggregation
      - A display-only choice
    answer: 1
    topic: data-preparation
  - id: data-preparation-graded-quiz-9
    q: "Revenue doubled after adding a join. The 'duplicates' are:"
    options:
      - Real duplicate records to delete
      - A join artefact — the fix is the join, not a de-duplication step
      - A data-entry problem
      - Caused by nulls
    answer: 1
    topic: data-preparation
  - id: data-preparation-graded-quiz-10
    q: "The fastest way to localise a wrong number inside a recipe is:"
    options:
      - Reading the SAQL
      - Walking the node previews and watching where the row count changes
      - Rebuilding the dataset
      - Checking app sharing
    answer: 1
    topic: data-preparation
  - id: datasets-and-modelling-index-1
    q: What most determines which questions a dataset can answer?
    options:
      - Its row count
      - Its grain — what one row represents
      - The chart types used on it
      - Its refresh schedule
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-index-2
    q: "A dataset pre-aggregated to monthly totals is:"
    options:
      - Strictly better — it is faster
      - Faster, and permanently unable to answer questions below that grain
      - Equivalent to a fine-grained one
      - Only useful for exports
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-grain-joins-and-fan-out-1
    q: Joining 608 opportunities to 1,192 product lines gives 1,192 rows. Is that a bug?
    options:
      - Yes, the join is misconfigured
      - No — that is what a one-to-many join does. The bug is summing the parent's Amount afterwards
      - Yes, rows should never increase
      - Only if the keys are text
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-grain-joins-and-fan-out-2
    q: Which fix keeps product-level detail available?
    options:
      - Aggregating the line items before the join
      - Keeping the line grain and not carrying the parent's Amount down, summing LineAmount instead
      - Filtering to one product per deal
      - Using an inner join
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-grain-joins-and-fan-out-3
    q: A total is exactly 3× what you expect. What do you suspect?
    options:
      - A security predicate
      - A fan-out — a parent measure repeated across roughly three child rows each
      - A stale dataset
      - Currency conversion
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-grain-joins-and-fan-out-4
    q: "The best way to investigate a suspicious total is:"
    options:
      - Recheck the chart configuration
      - Filter down to a single entity and count the rows by hand
      - Rebuild the dashboard
      - Increase the row limit
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-dataset-design-1
    q: "The right starting point for designing a dataset is:"
    options:
      - The source tables available
      - The questions it has to answer, written down
      - The chart types planned
      - The refresh schedule
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-dataset-design-2
    q: "A dataset serving two audiences with different grains should usually:"
    options:
      - Compromise at a middle grain
      - Be two datasets, often from one recipe with two outputs
      - Use the finest grain
      - Be filtered per viewer
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-dataset-design-3
    q: "A filter applied inside the dataset rather than on the dashboard is right when:"
    options:
      - It is faster
      - The excluded rows should never appear in any question this dataset answers
      - Viewers might want to change it
      - Always
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-modelling-patterns-1
    q: "A reference table like accounts.csv is characterised by:"
    options:
      - Having the most rows
      - Being joined TO rather than aggregated — summing anything in it is usually a mistake
      - Changing most often
      - Having no keys
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-modelling-patterns-2
    q: "Long format (one row per entity per metric) is preferable when:"
    options:
      - There are few metrics that never change
      - Metrics are added often, or you want to chart many of them with one widget
      - Storage is limited
      - Never
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-modelling-patterns-3
    q: "A derived dataset built on another dataset's output risks:"
    options:
      - Nothing
      - A scheduling chain where a failure three links back is invisible at the end
      - Losing security
      - Duplicate columns
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-dates-history-and-snapshots-1
    q: Why can't you build a pipeline-movement dashboard from the Opportunity object alone?
    options:
      - The object is too large
      - It holds only current values — there is no record of what the stage or amount was last month
      - Opportunities cannot be synced
      - You can; it is built in
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-dates-history-and-snapshots-2
    q: "Cohorting leads by conversion date rather than creation date produces:"
    options:
      - A more accurate picture
      - A distorted one — recent cohorts look impossible and old ones look terrible, while both numbers are individually correct
      - No difference
      - An error in the recipe
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-dates-history-and-snapshots-3
    q: A snapshot dataset appends the current state each run. What does that mean for a field you start syncing today?
    options:
      - Its history is backfilled automatically
      - It has no history before today, and never will
      - It cannot be snapshotted
      - History comes from the audit log
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-field-metadata-and-formatting-1
    q: Where should a field's display label be set?
    options:
      - In each widget
      - On the dataset's field metadata, so every lens and widget inherits it
      - In the recipe's formula
      - In the app settings
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-field-metadata-and-formatting-2
    q: "A currency measure shows six decimal places on every dashboard. The efficient fix is:"
    options:
      - Format each widget
      - Set the format once on the dataset field
      - Round it in SAQL
      - Change the chart type
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-graded-quiz-1
    q: "Joining 608 opportunities to 1,192 product lines yields 1,192 rows. The bug is:"
    options:
      - The join itself
      - Summing the parent's Amount afterwards, which now repeats per line
      - Using a lookup rather than inner
      - There is no bug
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-graded-quiz-2
    q: "The fix that keeps product-level detail is:"
    options:
      - Aggregate line items before the join
      - Keep the line grain and sum LineAmount rather than the parent's Amount
      - Filter to one product per deal
      - Use an inner join
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-graded-quiz-3
    q: "A dataset's grain should be derived from:"
    options:
      - The source tables
      - The finest question it must answer
      - The chart types
      - The row limit
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-graded-quiz-4
    q: "Summing ARR across all rows of an 18-month snapshot gives:"
    options:
      - Company ARR
      - Roughly eighteen years of revenue
      - ARR per account
      - An error
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-graded-quiz-5
    q: "A field you start syncing today has:"
    options:
      - Backfilled history
      - No history before today, permanently
      - History from the audit trail
      - History after the next rebuild
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-graded-quiz-6
    q: "Summing a column on a reference table like accounts is:"
    options:
      - Standard practice
      - Usually a mistake — reference tables are joined to, not aggregated
      - Required for ARR
      - Faster than a fact table
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-graded-quiz-7
    q: "Long format's characteristic failure is:"
    options:
      - Slow queries
      - A query that forgets to filter to one metric, silently summing across unrelated metrics
      - Missing keys
      - Duplicate entities
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-graded-quiz-8
    q: "A utilisation percentage field with a default aggregation of sum produces:"
    options:
      - Correct totals
      - 960% across a year, rendered cleanly
      - An error
      - Nulls
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-graded-quiz-9
    q: "A filter applied inside the dataset should be documented because:"
    options:
      - It is required
      - It is invisible downstream, so a reconciliation against the source will differ with no visible cause
      - It affects performance
      - Viewers may want to change it
    answer: 1
    topic: datasets-and-modelling
  - id: datasets-and-modelling-graded-quiz-10
    q: "The most useful single sentence in a dataset's description is:"
    options:
      - Who built it
      - What one row represents
      - When it refreshes
      - Which app it is in
    answer: 1
    topic: datasets-and-modelling
---

Practice questions for the Data Layer domain of the CRM Analytics and Einstein Discovery Consultant exam.
