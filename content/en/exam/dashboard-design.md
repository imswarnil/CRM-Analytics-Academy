---
title: Analytics Dashboard Design — practice questions
domain: dashboard-design
quiz:
  - id: data-visualization-index-1
    q: What is the first question to ask before choosing a chart type?
    options:
      - Which type looks best in the brand colours?
      - What comparison is the reader supposed to make?
      - How many rows are in the dataset?
      - Which types does CRM Analytics support?
    answer: 1
    topic: data-visualization
  - id: data-visualization-index-2
    q: "A bar chart sorted alphabetically instead of by value mostly:"
    options:
      - Renders faster
      - Hides the ranking, which is usually the reason somebody drew a bar chart
      - Is more accurate
      - Makes no difference
    answer: 1
    topic: data-visualization
  - id: data-visualization-choosing-a-chart-1
    q: "You have one dimension with 40 categories and one measure. The best first choice is:"
    options:
      - A pie chart
      - A horizontal bar chart of the top N, with the limit in the title
      - A line chart
      - A scatter plot
    answer: 1
    topic: data-visualization
  - id: data-visualization-choosing-a-chart-2
    q: "Two measures, and you want to know whether they move together. The chart is:"
    options:
      - A dual-axis line chart
      - A scatter plot, one measure per axis
      - Two separate bar charts
      - A stacked column
    answer: 1
    topic: data-visualization
  - id: data-visualization-choosing-a-chart-3
    q: Why is horizontal usually better than vertical for categorical bars?
    options:
      - It renders faster
      - Category names are words, and words read along a horizontal axis rather than rotated under a column
      - Vertical bars are deprecated
      - It uses less space
    answer: 1
    topic: data-visualization
  - id: data-visualization-bar-and-column-1
    q: When should a column (vertical) chart beat a bar (horizontal) one?
    options:
      - Always — vertical is standard
      - When the categories are ordered periods, like months, which readers expect to run left to right
      - When there are many categories
      - When the labels are long
    answer: 1
    topic: data-visualization
  - id: data-visualization-bar-and-column-2
    q: Grouped or stacked, when the reader needs to compare each sub-category across groups?
    options:
      - Stacked — it shows totals
      - Grouped — only the bottom segment of a stack shares a baseline, so the others cannot be compared by eye
      - Either works equally
      - Neither; use a pie
    answer: 1
    topic: data-visualization
  - id: data-visualization-bar-and-column-3
    q: "A bar chart's axis starts at 40 rather than 0. This is:"
    options:
      - Fine and standard
      - Misleading for bars — bar length IS the encoding, so a truncated axis misstates the ratio between bars
      - Required for readability
      - Only a problem in print
    answer: 1
    topic: data-visualization
  - id: data-visualization-line-and-area-1
    q: A dual-axis chart shows revenue and headcount crossing in June. What does the crossing mean?
    options:
      - Revenue overtook headcount
      - Nothing — the crossing point is decided by where you set the two axes, not by the data
      - They are correlated
      - June was the break-even month
    answer: 1
    topic: data-visualization
  - id: data-visualization-line-and-area-2
    q: "Your dataset has no rows for a month with no activity. The line chart should:"
    options:
      - Join straight across the gap
      - Show zero if zero is true, and a break if the value is genuinely unknown — they mean different things
      - Hide the month
      - Interpolate the average
    answer: 1
    topic: data-visualization
  - id: data-visualization-line-and-area-3
    q: How many series can a line chart carry before it stops working?
    options:
      - One
      - About four, and only if they are separable by colour and shape
      - Ten
      - Unlimited with a legend
    answer: 1
    topic: data-visualization
  - id: data-visualization-part-of-whole-1
    q: How many slices can a donut carry before readers stop being able to compare them?
    options:
      - About three or four
      - About ten
      - Twenty with labels
      - There is no limit
    answer: 0
    topic: data-visualization
  - id: data-visualization-part-of-whole-2
    q: "A 100% stacked bar over time is best at showing:"
    options:
      - Absolute growth
      - Whether the MIX has shifted — at the cost of hiding size entirely
      - Individual values
      - Outliers
    answer: 1
    topic: data-visualization
  - id: data-visualization-part-of-whole-3
    q: "Composition data where the exact percentages matter is usually best shown as:"
    options:
      - A donut
      - A sorted table with a share column
      - A treemap
      - A gauge
    answer: 1
    topic: data-visualization
  - id: data-visualization-scatter-and-distribution-1
    q: Company utilisation is 88%. Why is that potentially useless?
    options:
      - It is too precise
      - It can be the average of accounts at 30% and at 140%, which need opposite actions and are both invisible in it
      - Percentages cannot be averaged at all
      - It should be a median
    answer: 1
    topic: data-visualization
  - id: data-visualization-scatter-and-distribution-2
    q: A scatter plot answers which question that no bar chart can?
    options:
      - Which category is biggest
      - Whether two measures move together, across many entities at once
      - How something changed over time
      - What share each part is
    answer: 1
    topic: data-visualization
  - id: data-visualization-scatter-and-distribution-3
    q: "A bubble chart's third measure is encoded as:"
    options:
      - Colour
      - Bubble area
      - Position on a third axis
      - Label size
    answer: 1
    topic: data-visualization
  - id: data-visualization-numbers-gauges-and-sparklines-1
    q: What makes a KPI number actionable?
    options:
      - A larger font
      - A comparison and a direction — against plan or last period, with an arrow
      - A currency symbol
      - A coloured background
    answer: 1
    topic: data-visualization
  - id: data-visualization-numbers-gauges-and-sparklines-2
    q: "A gauge is a good choice when:"
    options:
      - Any single number is shown
      - There is a genuine fixed target and the question is 'how close are we'
      - The number is a percentage
      - Space is limited
    answer: 1
    topic: data-visualization
  - id: data-visualization-numbers-gauges-and-sparklines-3
    q: "CAC payback fell from 15.3 to 14.2 months. The arrow should be:"
    options:
      - Down and red
      - Down and green — goodness is a property of the metric, not the direction
      - Up and green
      - No arrow
    answer: 1
    topic: data-visualization
  - id: data-visualization-tables-and-pivots-1
    q: When does a table beat a chart outright?
    options:
      - Never
      - When the identity of each row matters — which account, which deal — or the exact values do
      - When there are more than 20 rows
      - When the data is text
    answer: 1
    topic: data-visualization
  - id: data-visualization-tables-and-pivots-2
    q: "A table with a scrollbar on a dashboard usually means:"
    options:
      - Good information density
      - It has become a data export rather than a dashboard widget
      - The rows need sorting
      - The font is too large
    answer: 1
    topic: data-visualization
  - id: data-visualization-tables-and-pivots-3
    q: "Numbers in a table should be:"
    options:
      - Left-aligned with the text
      - Right-aligned with consistent decimals, so magnitudes are comparable at a glance
      - Centred
      - Coloured by value
    answer: 1
    topic: data-visualization
  - id: data-visualization-maps-1
    q: You have revenue for six sales regions. Is a map the right chart?
    options:
      - Yes — regions are geographic
      - Usually not — with six categories a sorted bar ranks them precisely, where a map makes the reader estimate colours
      - Yes, if the colours are accessible
      - Only with a legend
    answer: 1
    topic: data-visualization
  - id: data-visualization-maps-2
    q: "A choropleth of raw revenue by country mostly shows:"
    options:
      - Where your product performs best
      - Where the most people and the largest economies are
      - Market share
      - Growth
    answer: 1
    topic: data-visualization
  - id: data-visualization-maps-3
    q: "The usual fix for that is:"
    options:
      - A different colour scale
      - Normalising — revenue per account, per capita, or against market size
      - Removing small countries
      - Using a bubble map
    answer: 1
    topic: data-visualization
  - id: data-visualization-funnels-and-waterfalls-1
    q: A funnel spans 2.1 million sessions down to 506 opportunities on a linear scale. What happens?
    options:
      - It reads clearly
      - Every stage after the second is a stub, and the stages that matter most become invisible
      - The chart errors
      - The percentages are wrong
    answer: 1
    topic: data-visualization
  - id: data-visualization-funnels-and-waterfalls-2
    q: "A waterfall chart is for:"
    options:
      - Ranking categories
      - Showing how a series of additions and subtractions gets from one total to another
      - Comparing two measures
      - Geographic data
    answer: 1
    topic: data-visualization
  - id: data-visualization-funnels-and-waterfalls-3
    q: "Funnel stages should be ordered:"
    options:
      - By size
      - In process order
      - Alphabetically
      - By conversion rate
    answer: 1
    topic: data-visualization
  - id: data-visualization-chart-honesty-1
    q: Which is the reliable test for whether a chart is honest?
    options:
      - Every number on it is correct
      - What a reader concludes in four seconds is true
      - It uses the brand palette
      - It has a legend
    answer: 1
    topic: data-visualization
  - id: data-visualization-chart-honesty-2
    q: Truncating the y-axis is defensible on a line chart of retention but not on a bar chart. Why?
    options:
      - Bars are older technology
      - Bar length IS the encoding, so truncation misstates the ratio between bars; a line encodes slope
      - Lines cannot show small values
      - It is never defensible
    answer: 1
    topic: data-visualization
  - id: data-visualization-chart-honesty-3
    q: "The most common dishonest chart in business reporting is:"
    options:
      - A 3D pie
      - A raw total that needed a denominator — counts where a rate was the question
      - A log scale
      - A dual axis
    answer: 1
    topic: data-visualization
  - id: data-visualization-graded-quiz-1
    q: "The first question before choosing a chart type is:"
    options:
      - How many rows are there
      - What comparison must the reader make
      - Which colours are available
      - Which types CRM Analytics supports
    answer: 1
    topic: data-visualization
  - id: data-visualization-graded-quiz-2
    q: "A categorical bar chart should normally be sorted:"
    options:
      - Alphabetically
      - Descending by the measure
      - By the dimension's id
      - Randomly
    answer: 1
    topic: data-visualization
  - id: data-visualization-graded-quiz-3
    q: "Grouped rather than stacked bars, when the reader must compare sub-categories across groups, because:"
    options:
      - Stacks are harder to colour
      - Only the bottom segment of a stack shares a baseline, so the rest cannot be compared by eye
      - Grouped bars are narrower
      - Stacks cannot show totals
    answer: 1
    topic: data-visualization
  - id: data-visualization-graded-quiz-4
    q: "A donut stops working at roughly:"
    options:
      - Two slices
      - Four slices
      - Ten slices
      - Twenty slices
    answer: 1
    topic: data-visualization
  - id: data-visualization-graded-quiz-5
    q: Which question can ONLY a scatter plot answer?
    options:
      - Which category is biggest
      - Whether two measures move together across many entities
      - How a value changed over time
      - What share each part contributes
    answer: 1
    topic: data-visualization
  - id: data-visualization-graded-quiz-6
    q: "A KPI number becomes actionable when it carries:"
    options:
      - A larger font
      - A comparison and a direction
      - A currency symbol
      - A coloured background
    answer: 1
    topic: data-visualization
  - id: data-visualization-graded-quiz-7
    q: "CAC payback falling should be shown as:"
    options:
      - A red downward arrow
      - A green downward arrow — goodness belongs to the metric, not the direction
      - No arrow
      - An upward arrow
    answer: 1
    topic: data-visualization
  - id: data-visualization-graded-quiz-8
    q: "A funnel spanning 2.1 million sessions to 506 opportunities on a linear scale:"
    options:
      - Reads fine
      - Renders the later stages as stubs, hiding the stages that matter most
      - Errors
      - Inverts
    answer: 1
    topic: data-visualization
  - id: data-visualization-graded-quiz-9
    q: "A choropleth of raw revenue by country mostly shows:"
    options:
      - Product-market fit
      - Where the largest populations and economies are
      - Growth
      - Margin
    answer: 1
    topic: data-visualization
  - id: data-visualization-graded-quiz-10
    q: "The most common dishonest chart in business reporting is:"
    options:
      - A 3D pie chart
      - A raw total that needed a denominator
      - A log scale
      - A stacked area
    answer: 1
    topic: data-visualization
  - id: lenses-and-explorations-index-1
    q: What is a lens best understood as?
    options:
      - A finished report
      - A disposable workspace for one exploration of one dataset
      - A dashboard template
      - A saved query only administrators can create
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-index-2
    q: Why switch to SAQL mode after making a change by clicking?
    options:
      - It runs faster
      - You already know what the answer should be, so reading the generated query is the cheapest way to learn the language
      - Charts are unavailable in SAQL mode
      - It is required before saving
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-explorer-basics-1
    q: CRM Analytics sorts a grouped chart by the grouping by default. Why change it?
    options:
      - Alphabetical order is invalid
      - The point of a grouped chart is usually the ranking, which alphabetical order hides
      - Sorting by measure is faster
      - It is required for faceting
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-explorer-basics-2
    q: "Adding a second grouping to a bar chart usually:"
    options:
      - Doubles the insight
      - Makes it substantially harder to read, and is worth resisting unless the comparison is the point
      - Breaks faceting
      - Changes the measure
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-explorer-basics-3
    q: "At line-item grain, 'count of rows' means:"
    options:
      - Number of deals
      - Number of line items — use a distinct count on the deal key for deals
      - Number of accounts
      - Number of products
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-the-three-modes-1
    q: A chart shows a segment with impossibly high revenue. What is the fastest next step?
    options:
      - Change the chart type
      - Switch to table mode and look at the rows behind it
      - Rebuild the lens
      - Check the dashboard filters
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-the-three-modes-2
    q: "SAQL mode is most valuable to a learner because:"
    options:
      - It runs faster than clicking
      - It shows the query your clicks produced, against an answer you already know
      - It is the only way to filter
      - Charts cannot group by date
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-conversational-analytics-1
    q: What most determines whether natural-language queries work well?
    options:
      - The chart type chosen
      - The quality of the dataset's field metadata — labels, formats and hidden plumbing
      - The number of users
      - The refresh schedule
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-conversational-analytics-2
    q: "The important failure mode of a natural-language answer is that it:"
    options:
      - Runs slowly
      - Answers a subtly different question than the one asked, fluently and with no indication of the difference
      - Cannot produce charts
      - Requires SAQL knowledge
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-graded-quiz-1
    q: "A lens is best described as:"
    options:
      - A finished report
      - A disposable workspace for one exploration of one dataset
      - A dashboard template
      - A saved SAQL script
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-graded-quiz-2
    q: "Default sorting on a grouped chart is by the grouping. You usually change it because:"
    options:
      - Alphabetical is invalid
      - The ranking is normally the point, and alphabetical order hides it
      - It renders faster
      - Faceting requires it
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-graded-quiz-3
    q: "At line-item grain, to count deals you should use:"
    options:
      - Count of rows
      - A distinct count on the opportunity key
      - Sum of Amount
      - Average
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-graded-quiz-4
    q: "Adding a second grouping to a bar chart usually:"
    options:
      - Doubles the insight
      - Makes it substantially harder to read, and is worth resisting unless the comparison is the point
      - Breaks faceting
      - Changes the measure
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-graded-quiz-5
    q: "A chart looks wrong. The fastest diagnostic is:"
    options:
      - Change the chart type
      - Switch to table mode and read the rows
      - Rebuild the lens
      - Check sharing
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-graded-quiz-6
    q: "The best way to learn the query language from the explorer is:"
    options:
      - Reading the function reference end to end
      - Clicking, then reading the SAQL your clicks produced against an answer you already know
      - Writing queries from scratch
      - Copying examples from forums
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-graded-quiz-7
    q: "A filter written as 'Stage != Closed Lost' also removes:"
    options:
      - Nothing else
      - Rows where Stage is null
      - Closed Won rows
      - Rows from other datasets
    answer: 1
    topic: lenses-and-explorations
  - id: lenses-and-explorations-graded-quiz-8
    q: "Natural-language query results should be treated as:"
    options:
      - Final answers to quote
      - A starting point to verify in table mode, because it answers fluently even when it answered a different question
      - Unusable
      - Equivalent to a saved lens
    answer: 1
    topic: lenses-and-explorations
  - id: designing-dashboards-index-1
    q: What makes a dashboard finished?
    options:
      - Every requested widget is present
      - A viewer can make the decision it exists for, quickly and without you
      - It uses the company colours
      - It has no blank space
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-index-2
    q: "A stakeholder asks for a ninth widget. The best first question is:"
    options:
      - Which chart type do you want?
      - What would you do differently depending on what it showed?
      - Can it wait until next sprint?
      - Do you have the data?
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-layout-and-hierarchy-1
    q: Where does the most important number belong?
    options:
      - Centre, largest
      - Top left, where reading order starts
      - Bottom, as a conclusion
      - Anywhere; people scan randomly
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-layout-and-hierarchy-2
    q: Why group related widgets together with space between groups?
    options:
      - It looks tidier
      - Proximity implies relationship — widgets placed together are read as belonging together, whether or not they do
      - It improves performance
      - It is required by faceting
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-conditional-formatting-1
    q: Why should a coloured delta also carry a direction arrow or label?
    options:
      - It looks more professional
      - Because colour alone excludes colour-blind readers and does not survive printing or a greyscale screenshot
      - Arrows are faster to render
      - It is required by Salesforce
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-conditional-formatting-2
    q: Where should a red/amber/green threshold come from?
    options:
      - Even thirds of the range
      - The business — the number at which somebody actually does something differently
      - The palette's default
      - The average
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-conditional-formatting-3
    q: "A dashboard where most cells are coloured has:"
    options:
      - Maximum information density
      - No signal left — if everything is highlighted, nothing is
      - Better accessibility
      - Faster load times
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-tables-kpis-and-micro-charts-1
    q: When does a table beat a chart?
    options:
      - Never
      - When the identity of each row matters — which specific account, which specific deal
      - When there are many rows
      - When the data is numeric
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-tables-kpis-and-micro-charts-2
    q: What turns a KPI number into an actionable one?
    options:
      - A larger font
      - A comparison — against plan, against last period — and a direction
      - A currency symbol
      - A border
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-tables-kpis-and-micro-charts-3
    q: "A values table showing all 140 accounts is usually:"
    options:
      - Thorough
      - A data export wearing a dashboard's clothes
      - Required for accuracy
      - Faster than a chart
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-performance-1
    q: "The biggest single lever on dashboard load time is usually:"
    options:
      - Chart type
      - The number of distinct queries — widgets that could share one query but each run their own
      - Browser choice
      - Colour depth
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-performance-2
    q: "A dataset at a very fine grain makes dashboards slow because:"
    options:
      - Fine grains are stored inefficiently
      - Every widget aggregates millions of rows at query time, on every load, for every viewer
      - Faceting is disabled
      - It cannot be indexed
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-hands-on-pipeline-dashboard-1
    q: Why is the funnel sorted in stage order rather than by size?
    options:
      - It renders faster
      - The sequence is the argument — the drop between adjacent stages is the finding
      - Salesforce requires it
      - To match the table
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-hands-on-pipeline-dashboard-2
    q: Why does the coverage widget have faceting switched off?
    options:
      - Performance
      - It is a reference against the full quarter — if it filters with everything else, the comparison disappears
      - It uses a different dataset
      - Faceting breaks ratios
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-hands-on-pipeline-dashboard-3
    q: "The pipeline trend is grouped by created month rather than close month because:"
    options:
      - Close dates are unreliable
      - Cohorting on the wrong date distorts recent and old periods in opposite directions while both numbers stay individually correct
      - Created month renders faster
      - There is no difference
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-graded-quiz-1
    q: "A dashboard is finished when:"
    options:
      - Every requested widget is present
      - Its audience can make the decision it exists for, quickly and without you
      - It matches the brand palette
      - There is no blank space
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-graded-quiz-2
    q: "The headline number belongs:"
    options:
      - Centre
      - Top left, where reading order starts
      - Bottom
      - Beside the filters
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-graded-quiz-3
    q: "Filters in the top-left corner are a mistake because:"
    options:
      - They are slow
      - They spend the most valuable space on the screen on controls nobody needs until their second visit
      - They cannot be resized
      - They cannot be bound
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-graded-quiz-4
    q: "A widget title should carry:"
    options:
      - The measure only
      - The measure, the period, the filter and any limit — it will be screenshotted without context
      - The author's name
      - The dataset name
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-graded-quiz-5
    q: "A funnel chart should be sorted:"
    options:
      - By size descending
      - In process order
      - Alphabetically
      - By date
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-graded-quiz-6
    q: Why must a coloured delta also carry an arrow or label?
    options:
      - Aesthetics
      - Colour alone excludes colour-blind readers and dies in greyscale
      - Arrows render faster
      - It is mandatory in Salesforce
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-graded-quiz-7
    q: "A KPI number becomes actionable when it has:"
    options:
      - A bigger font
      - A comparison and a direction
      - A border
      - A currency symbol
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-graded-quiz-8
    q: "The biggest lever on a slow dashboard is usually:"
    options:
      - Chart types
      - Consolidating widgets that could share one query
      - Fewer colours
      - A faster browser
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-graded-quiz-9
    q: "A table on a dashboard that needs scrolling has:"
    options:
      - Good information density
      - Stopped being a dashboard widget and become a data export
      - Too large a font
      - The wrong sort order
    answer: 1
    topic: designing-dashboards
  - id: designing-dashboards-graded-quiz-10
    q: "The last check before sharing a dashboard is:"
    options:
      - Spell-check the titles
      - Open it as a restricted user, and reconcile the headline against something independently true
      - Export it to PDF
      - Add more widgets
    answer: 1
    topic: designing-dashboards
---

Practice questions for the Analytics Dashboard Design domain of the CRM Analytics and Einstein Discovery Consultant exam.
