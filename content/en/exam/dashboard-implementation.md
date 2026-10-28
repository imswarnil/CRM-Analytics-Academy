---
title: Analytics Dashboard Implementation — practice questions
domain: dashboard-implementation
quiz:
  - id: saql-index-1
    q: "SAQL's defining difference from SQL is that:"
    options:
      - It has no aggregate functions
      - It is a stream transformation — each statement transforms the previous result, so statement order IS the query plan
      - It cannot filter
      - It only reads one dataset
    answer: 1
    topic: saql
  - id: saql-index-2
    q: "The cheapest way to learn SAQL is:"
    options:
      - Reading the function reference end to end
      - Building a chart by clicking, then reading the query it generated against an answer you already know
      - Writing queries from scratch
      - Copying examples from forums
    answer: 1
    topic: saql
  - id: saql-saql-when-clicks-run-out-1
    q: How does SAQL differ most importantly from SQL?
    options:
      - It cannot filter
      - It is a stream transformation — each statement transforms the result of the previous one, so statement ORDER is the query plan
      - It has no aggregate functions
      - It only works on one dataset
    answer: 1
    topic: saql
  - id: saql-saql-when-clicks-run-out-2
    q: You want each segment's share of total revenue. Why is this awkward with clicks alone?
    options:
      - Percentages are unsupported
      - It needs each row compared against an aggregate of all rows — two levels of aggregation in one query
      - Segments cannot be grouped
      - It is not awkward
    answer: 1
    topic: saql
  - id: saql-saql-when-clicks-run-out-3
    q: Where does a filter belong in a SAQL query for best performance?
    options:
      - At the end, after grouping
      - As early as possible, so less data flows through the following statements
      - It does not matter
      - Inside the foreach
    answer: 1
    topic: saql
  - id: saql-functions-1
    q: "To count deals in a dataset at line-item grain you use:"
    options:
      - count()
      - unique('OpportunityId')
      - sum('Amount')
      - avg()
    answer: 1
    topic: saql
  - id: saql-functions-2
    q: "sum() over a column that is 40% null returns:"
    options:
      - "Null"
      - The sum of the non-null rows, with no indication that the rest were skipped
      - Zero
      - An error
    answer: 1
    topic: saql
  - id: saql-functions-3
    q: Which is the safe way to divide two aggregates?
    options:
      - avg of the per-row ratio
      - sum(numerator) / sum(denominator), guarded against a zero denominator
      - Either is equivalent
      - Division is not supported
    answer: 1
    topic: saql
  - id: saql-filters-and-nulls-1
    q: Where should a filter go for best performance?
    options:
      - After the group, so less is filtered
      - As early as possible, so fewer rows flow through everything after it
      - At the end
      - Order makes no difference
    answer: 1
    topic: saql
  - id: saql-filters-and-nulls-2
    q: "`filter q by 'Stage' != \"Closed Lost\"` also removes:"
    options:
      - Nothing else
      - Every row where Stage is null
      - Closed Won rows
      - Rows from other datasets
    answer: 1
    topic: saql
  - id: saql-filters-and-nulls-3
    q: "Replacing a null with zero using coalesce is:"
    options:
      - Always safe
      - A claim — it turns 'unknown' into 'none', which changes averages and can be wrong
      - Required before aggregation
      - Only a display choice
    answer: 1
    topic: saql
  - id: saql-grouping-and-windowing-1
    q: "To compute each segment's share of company revenue you need:"
    options:
      - One group by segment
      - Each group's value compared against an aggregate of ALL rows — two levels of aggregation
      - A separate dashboard
      - A dual axis
    answer: 1
    topic: saql
  - id: saql-grouping-and-windowing-2
    q: "A windowed running total differs from a plain sum because:"
    options:
      - It is faster
      - It accumulates across the ordered rows rather than collapsing them to one value
      - It ignores nulls
      - It requires two datasets
    answer: 1
    topic: saql
  - id: saql-grouping-and-windowing-3
    q: "Ranking reps within each region requires the window to be:"
    options:
      - Over all rows
      - Partitioned by region, so each region ranks from 1 independently
      - Sorted only
      - Grouped by rep
    answer: 1
    topic: saql
  - id: saql-working-across-datasets-1
    q: You need a metric combining two datasets on ten dashboards. Where does the combination belong?
    options:
      - In each widget's SAQL
      - In a recipe, so all ten agree by construction and it is computed once
      - In a spreadsheet
      - In the dashboard JSON
    answer: 1
    topic: saql
  - id: saql-working-across-datasets-2
    q: "Combining two streams at different grains in a query produces:"
    options:
      - An error
      - The same fan-out you would get in a recipe — a measure repeated across matching rows
      - A correct result automatically
      - Nulls only
    answer: 1
    topic: saql
  - id: saql-working-across-datasets-3
    q: "A good use of a two-stream query is:"
    options:
      - Defining company revenue
      - An ad-hoc comparison — actuals against a small target table — on a single dashboard
      - Any join at all
      - Replacing the recipe layer
    answer: 1
    topic: saql
  - id: saql-debugging-a-query-1
    q: "A query returns a number that is too high by a clean multiple. The suspect is:"
    options:
      - A filter
      - A combination that multiplied rows, with a measure summed after it
      - The order statement
      - A null
    answer: 1
    topic: saql
  - id: saql-debugging-a-query-2
    q: "The fastest way to understand a query that returns the wrong thing is:"
    options:
      - Rewrite it from scratch
      - Cut it back to the load and add one statement at a time, checking the row count after each
      - Add more filters
      - Switch to a different chart type
    answer: 1
    topic: saql
  - id: saql-debugging-a-query-3
    q: "Numbers that change between runs with no data change usually mean:"
    options:
      - A caching bug
      - A relative date range, or a window with no explicit ordering
      - A permissions issue
      - A rendering problem
    answer: 1
    topic: saql
  - id: saql-graded-quiz-1
    q: "SAQL statements execute:"
    options:
      - In an order chosen by an optimiser
      - In the order written — each transforms the previous result
      - In parallel
      - Alphabetically
    answer: 1
    topic: saql
  - id: saql-graded-quiz-2
    q: "A filter belongs:"
    options:
      - After the group
      - As early as possible
      - Inside foreach
      - At the end
    answer: 1
    topic: saql
  - id: saql-graded-quiz-3
    q: "At line-item grain, deals are counted with:"
    options:
      - count()
      - unique('OpportunityId')
      - sum('Amount')
      - median()
    answer: 1
    topic: saql
  - id: saql-graded-quiz-4
    q: "sum() over a column that is 40% null returns:"
    options:
      - "Null"
      - The total of the non-null rows, with no indication the rest were skipped
      - Zero
      - An error
    answer: 1
    topic: saql
  - id: saql-graded-quiz-5
    q: "The weighted discount rate is:"
    options:
      - avg('DiscountPct')
      - sum('Discount') / sum('ListTotal'), guarded against zero
      - median('DiscountPct')
      - max('DiscountPct')
    answer: 1
    topic: saql
  - id: saql-graded-quiz-6
    q: "`'Stage' != \"Closed Lost\"` also removes:"
    options:
      - Nothing else
      - Rows where Stage is null
      - Closed Won rows
      - Rows from other datasets
    answer: 1
    topic: saql
  - id: saql-graded-quiz-7
    q: "Ranking reps within each region needs the window:"
    options:
      - Over all rows
      - Partitioned by region
      - Ordered only
      - Grouped by rep
    answer: 1
    topic: saql
  - id: saql-graded-quiz-8
    q: "A running total with no explicit ordering is:"
    options:
      - Fine — order is inferred
      - A bug that is stable until the next refresh and then quietly different
      - Impossible to write
      - Automatically sorted by date
    answer: 1
    topic: saql
  - id: saql-graded-quiz-9
    q: "Two datasets need combining for ten dashboards. That belongs:"
    options:
      - In each widget's SAQL
      - In a recipe
      - In the dashboard JSON
      - In a spreadsheet
    answer: 1
    topic: saql
  - id: saql-graded-quiz-10
    q: "A total that is high by a clean multiple suggests:"
    options:
      - A null problem
      - Row multiplication, with a parent measure summed after it
      - A filter
      - A rendering issue
    answer: 1
    topic: saql
  - id: interactions-index-1
    q: "Two widgets built on the same dataset. By default, clicking one:"
    options:
      - Does nothing to the other
      - Filters the other — same-dataset widgets facet each other automatically
      - Requires a binding
      - Opens a new lens
    answer: 1
    topic: interactions
  - id: interactions-index-2
    q: "The main reason interaction matters is:"
    options:
      - It looks impressive
      - Most people will never build a lens, but nearly everyone clicks a bar — interaction is how a dashboard answers questions you did not anticipate
      - It improves performance
      - It is required for sharing
    answer: 1
    topic: interactions
  - id: interactions-faceting-and-filters-1
    q: "Two widgets are built on the same dataset. By default, clicking one:"
    options:
      - Does nothing to the other
      - Filters the other — they facet each other automatically
      - Opens a new lens
      - Requires a binding to interact
    answer: 1
    topic: interactions
  - id: interactions-faceting-and-filters-2
    q: Why would you deliberately turn faceting OFF for one widget?
    options:
      - To improve performance
      - Because it is a reference — a company total that must stay fixed while everything else filters, so the reader can see the part against the whole
      - Faceting is always wrong
      - To hide data
    answer: 1
    topic: interactions
  - id: interactions-faceting-and-filters-3
    q: "A viewer filters to one region and a widget goes blank. The likeliest cause is:"
    options:
      - A broken query
      - That widget's dataset has no rows for that region — an honest empty state that needs a label rather than a fix
      - Faceting is disabled
      - A security predicate
    answer: 1
    topic: interactions
  - id: interactions-selection-and-initial-state-1
    q: "A dashboard opens showing all regions and all time. For a regional director this means:"
    options:
      - Maximum flexibility
      - The same three clicks every morning before the screen says anything relevant
      - Faster loading
      - Better security
    answer: 1
    topic: interactions
  - id: interactions-selection-and-initial-state-2
    q: "After a viewer clicks a segment, the screen is filtered. The most important thing to provide is:"
    options:
      - An animation
      - A visible indication of the current selection, and an obvious way to clear it
      - A tooltip
      - A second chart
    answer: 1
    topic: interactions
  - id: interactions-selection-and-initial-state-3
    q: "A saved view is:"
    options:
      - A copy of the dashboard
      - A remembered state — filters and selections — so someone returns to their slice without re-clicking
      - A scheduled email
      - A permission setting
    answer: 1
    topic: interactions
  - id: interactions-drill-down-and-navigation-1
    q: "A link from a summary dashboard to a detail one lets you:"
    options:
      - Avoid building the summary
      - Keep the summary small, because the detail is one click away rather than crammed on
      - Skip security
      - Improve query performance
    answer: 1
    topic: interactions
  - id: interactions-drill-down-and-navigation-2
    q: "The most useful destination for a drill from an exception table is usually:"
    options:
      - A different dashboard's home state
      - The Salesforce record for that row, where the work actually happens
      - A PDF export
      - The dataset
    answer: 1
    topic: interactions
  - id: interactions-drill-down-and-navigation-3
    q: "A drill that lands on an unfiltered detail dashboard is:"
    options:
      - Fine
      - A broken drill — the whole point is that the destination inherits the context you clicked from
      - More flexible
      - Faster
    answer: 1
    topic: interactions
  - id: interactions-graded-quiz-1
    q: "Two widgets on the same dataset. Clicking one:"
    options:
      - Does nothing
      - Filters the other by default
      - Needs a binding
      - Opens a lens
    answer: 1
    topic: interactions
  - id: interactions-graded-quiz-2
    q: "You switch faceting off on a widget mainly when:"
    options:
      - It is slow
      - It is a reference that must stay fixed while everything else filters
      - It is a table
      - It has no title
    answer: 1
    topic: interactions
  - id: interactions-graded-quiz-3
    q: "Half of the widgets respond to a filter and half do not. This is:"
    options:
      - Normal
      - The dangerous state — the screen is false while every widget is individually correct
      - A caching issue
      - A licensing limit
    answer: 1
    topic: interactions
  - id: interactions-graded-quiz-4
    q: "A dashboard should open:"
    options:
      - Unfiltered, showing everything
      - On the common case — current period, the viewer's scope, sorted and limited
      - On a blank state
      - On last year
    answer: 1
    topic: interactions
  - id: interactions-graded-quiz-5
    q: "Showing the partial current month beside complete months:"
    options:
      - Is the most current view
      - Manufactures an apparent decline every month unless it is excluded or marked
      - Improves accuracy
      - Has no effect
    answer: 1
    topic: interactions
  - id: interactions-graded-quiz-6
    q: "A filtered dashboard must indicate its selection because:"
    options:
      - It looks tidier
      - It will be screenshotted, and the filter is invisible in the image
      - It is required for faceting
      - It speeds up queries
    answer: 1
    topic: interactions
  - id: interactions-graded-quiz-7
    q: "A saved view is most valuable for:"
    options:
      - Administrators
      - Anyone whose slice is always the same, who would otherwise re-click it daily
      - Mobile users only
      - Exporting
    answer: 1
    topic: interactions
  - id: interactions-graded-quiz-8
    q: "A drill-down that lands on an unfiltered destination:"
    options:
      - Gives more flexibility
      - Is broken in practice — it gets clicked once and then abandoned
      - Loads faster
      - Is the standard pattern
    answer: 1
    topic: interactions
  - id: bindings-index-1
    q: "The difference between faceting and a binding is:"
    options:
      - There is none
      - Faceting is automatic between same-dataset widgets; a binding is explicit wiring you configure
      - Bindings are faster
      - Faceting requires SAQL
    answer: 1
    topic: bindings
  - id: bindings-index-2
    q: "The best first binding to add to any dashboard is:"
    options:
      - Conditional widget visibility
      - A dynamic title that states the current selection
      - A nested filter chain
      - A cross-dataset facet
    answer: 1
    topic: bindings
  - id: bindings-bindings-basics-1
    q: What is a binding?
    options:
      - A join between datasets
      - One widget's state feeding another widget's query or display
      - A security setting
      - A chart type
    answer: 1
    topic: bindings
  - id: bindings-bindings-basics-2
    q: "The best first use of a binding is usually:"
    options:
      - Conditional widget visibility
      - A dynamic title that states the current selection
      - Nested dependent filters
      - Cross-dataset faceting
    answer: 1
    topic: bindings
  - id: bindings-bindings-basics-3
    q: "A heavily bound dashboard's main long-term cost is:"
    options:
      - Query performance
      - Nobody can safely change it — the logic lives in widget configuration that is hard to read and impossible to diff
      - Licence consumption
      - Browser memory
    answer: 1
    topic: bindings
  - id: bindings-selection-bindings-1
    q: "A selection binding's most important edge case is:"
    options:
      - Multiple selections
      - Nothing selected — what the bound widget does when the source is empty
      - Slow queries
      - Colour contrast
    answer: 1
    topic: bindings
  - id: bindings-selection-bindings-2
    q: "A dependent filter (region narrows the rep list) is worth building when:"
    options:
      - Always
      - The dependent list is long enough that scanning it is a real cost — forty reps, not four
      - Never
      - Only for administrators
    answer: 1
    topic: bindings
  - id: bindings-selection-bindings-3
    q: "A dynamic title binding is valuable mainly because:"
    options:
      - It looks dynamic
      - The dashboard's filter state survives being screenshotted into a message with no context
      - It improves performance
      - It is required for faceting
    answer: 1
    topic: bindings
  - id: bindings-results-bindings-1
    q: "A results binding reads:"
    options:
      - What the viewer selected
      - A value returned by another widget's query
      - The dataset's metadata
      - The URL
    answer: 1
    topic: bindings
  - id: bindings-results-bindings-2
    q: "The performance cost of a results binding is that:"
    options:
      - It doubles the data volume
      - It creates an execution order — the dependent widget cannot start until the source has returned
      - It disables caching
      - There is none
    answer: 1
    topic: bindings
  - id: bindings-results-bindings-3
    q: "Debugging a results binding is harder than a selection binding because:"
    options:
      - The syntax is different
      - The input is invisible on screen — you have to trace a query rather than look at a selection
      - It cannot be tested
      - It requires admin rights
    answer: 1
    topic: bindings
  - id: bindings-nesting-and-limits-1
    q: "The main risk of chaining bindings A → B → C is:"
    options:
      - Data accuracy
      - Sequential execution and a dependency nobody can see, so a change to A breaks C for reasons that are invisible
      - Licence cost
      - Browser compatibility
    answer: 1
    topic: bindings
  - id: bindings-nesting-and-limits-2
    q: "The practical signal that a dashboard has too many bindings is:"
    options:
      - The file size
      - Somebody other than its author cannot change it safely, so they build a new dashboard instead
      - The number of widgets
      - Slow rendering alone
    answer: 1
    topic: bindings
  - id: bindings-nesting-and-limits-3
    q: "The cheapest thing that keeps a bound dashboard maintainable is:"
    options:
      - Fewer widgets
      - One line in the description per binding — what feeds what, and why
      - More colours
      - A naming convention for queries
    answer: 1
    topic: bindings
  - id: bindings-graded-quiz-1
    q: "A binding differs from faceting because:"
    options:
      - It is faster
      - It is explicit wiring you configure, where faceting is automatic between same-dataset widgets
      - It requires SAQL
      - It works across orgs
    answer: 1
    topic: bindings
  - id: bindings-graded-quiz-2
    q: "The best first binding on any dashboard is:"
    options:
      - Conditional visibility
      - A dynamic title carrying the selection
      - A nested filter chain
      - A measure toggle
    answer: 1
    topic: bindings
  - id: bindings-graded-quiz-3
    q: "A results binding reads:"
    options:
      - The viewer's selection
      - A value another query returned
      - Dataset metadata
      - The page URL
    answer: 1
    topic: bindings
  - id: bindings-graded-quiz-4
    q: "Results bindings make dashboards slow because they:"
    options:
      - Increase data volume
      - Serialise execution — the dependent widget waits for the source
      - Disable caching
      - Force a full refresh
    answer: 1
    topic: bindings
  - id: bindings-graded-quiz-5
    q: "The edge case that must always be defined is:"
    options:
      - Too many rows
      - Nothing selected
      - A slow network
      - A small screen
    answer: 1
    topic: bindings
  - id: bindings-graded-quiz-6
    q: "A dependent filter where the previously chosen rep is no longer in scope should:"
    options:
      - Keep filtering to that rep
      - Clear the stale selection
      - Show an error
      - Reload the page
    answer: 1
    topic: bindings
  - id: bindings-graded-quiz-7
    q: Five widgets bound to one filter, versus three bound in a chain. Which is more maintainable?
    options:
      - The chain — fewer bindings
      - The five — breadth is predictable, depth is not
      - They are equivalent
      - Neither is maintainable
    answer: 1
    topic: bindings
  - id: bindings-graded-quiz-8
    q: "A company metric computed by a results binding on every load should instead:"
    options:
      - Be cached in the browser
      - Be computed once in the recipe and stored as a field
      - Be typed as a constant
      - Be removed
    answer: 1
    topic: bindings
  - id: dashboard-json-index-1
    q: "The best reason to edit dashboard JSON directly is:"
    options:
      - It is faster than the builder for everyday work
      - Bulk and repetitive changes the builder makes you do one widget at a time
      - It unlocks hidden chart types
      - It bypasses security
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-index-2
    q: "A dashboard's JSON is useful in review because:"
    options:
      - It renders in the browser
      - It is text — it diffs, so a change is reviewable rather than described in a meeting
      - It is smaller than the dashboard
      - It contains the data
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-anatomy-1
    q: "In a dashboard document, a 'step' is:"
    options:
      - A wizard page
      - A query definition — the data a widget draws from
      - A layout breakpoint
      - A permission
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-anatomy-2
    q: "Several widgets show the same measure sliced differently. Ideally they:"
    options:
      - Each define their own step
      - Share one step, because the number of distinct queries is the main lever on load time
      - Use separate datasets
      - Are merged into one widget
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-anatomy-3
    q: "Widgets and layouts are separate because:"
    options:
      - Historical accident
      - A widget is what is drawn; a layout is where it sits — so one widget can be placed differently at different screen sizes
      - Layouts store the data
      - Widgets cannot be positioned
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-steps-and-queries-1
    q: "A step with hand-written SAQL rather than a clicked definition is:"
    options:
      - Invalid
      - Fine, and harder for the builder to round-trip — the interface may not be able to re-edit it visually
      - Faster
      - Automatically shared
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-steps-and-queries-2
    q: "A static step is used for:"
    options:
      - Caching query results
      - A fixed list of values — toggle options, thresholds — that is not queried from a dataset
      - Security rules
      - Layout definitions
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-steps-and-queries-3
    q: "The main lever on dashboard load time, visible in the JSON, is:"
    options:
      - The number of widgets
      - The number of distinct steps — widgets that could share a query but each define their own
      - The file size
      - The number of layouts
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-widgets-and-layouts-1
    q: "A widget looks right on desktop and wrong on a phone. The problem is in:"
    options:
      - The step
      - A layout — position and size are defined per breakpoint, separately from the widget
      - The dataset
      - The security predicate
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-widgets-and-layouts-2
    q: "Editing widget properties as text is most useful for:"
    options:
      - Building a new dashboard
      - Applying the same formatting change across many widgets at once
      - Changing the dataset
      - Adding security
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-editing-safely-1
    q: "Before hand-editing a dashboard you should:"
    options:
      - Clear the cache
      - Export a copy — the undo story is whatever you saved beforehand
      - Notify all viewers
      - Disable the schedule
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-editing-safely-2
    q: "The main governance benefit of keeping dashboard JSON in a repository is:"
    options:
      - Faster loading
      - A change becomes a reviewable diff instead of a sentence in a meeting
      - Better security
      - Smaller file size
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-editing-safely-3
    q: "After a hand edit, the round-trip test is:"
    options:
      - Checking the data is correct
      - Reloading in the builder to confirm it still opens and still edits visually
      - Running the recipe
      - Clearing selections
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-graded-quiz-1
    q: "A step in a dashboard document is:"
    options:
      - A wizard page
      - A named query definition
      - A layout breakpoint
      - A sharing rule
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-graded-quiz-2
    q: "Widgets reference their data by:"
    options:
      - Containing the SAQL inline
      - Naming a step
      - Pointing at a dataset id
      - Inheriting from the layout
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-graded-quiz-3
    q: "A dashboard looks wrong only on phones. Look in:"
    options:
      - The step
      - The layouts
      - The dataset
      - The predicate
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-graded-quiz-4
    q: "Eleven steps for twelve widgets suggests:"
    options:
      - Good separation
      - Almost nothing is shared, and the screen is making eleven round trips
      - A corrupt file
      - Too few widgets
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-graded-quiz-5
    q: "The fastest way to find every binding on an inherited dashboard is:"
    options:
      - Open each widget's panel
      - Search the JSON for the binding syntax
      - Ask the author
      - Check the dataset
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-graded-quiz-6
    q: "Before hand-editing, you should always:"
    options:
      - Clear selections
      - Export a copy
      - Pause the schedule
      - Notify viewers
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-graded-quiz-7
    q: "The round-trip test checks that:"
    options:
      - The data is accurate
      - The builder can still open and visually edit the dashboard after your edit
      - The file is small
      - Security still applies
    answer: 1
    topic: dashboard-json
  - id: dashboard-json-graded-quiz-8
    q: Which change is best left to the builder rather than done as text?
    options:
      - Renaming a field across widgets
      - Adding or removing a widget, because it must be consistent across every layout
      - Changing a number format
      - Editing a title
    answer: 1
    topic: dashboard-json
---

Practice questions for the Analytics Dashboard Implementation domain of the CRM Analytics and Einstein Discovery Consultant exam.
