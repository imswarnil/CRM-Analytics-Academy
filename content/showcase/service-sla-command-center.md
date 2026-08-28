---
title: "Service SLA Command Center"
description: "First response, backlog age and breach risk for a support org — built to be read on a wall screen from three metres away."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Service"
difficulty: "Advanced"
publishedAt: "2026-08-28"
datasets:
  - "Case"
  - "CaseHistory"
  - "User"
kpis:
  - name: "First Response SLA %"
    formula: "count() [FirstResponseMinutes <= SLATarget] / count()"
    note: "SLATarget varies by priority, so it has to be a field on the row — not a hard-coded number in the SAQL."
  - name: "Open Backlog Age (p90)"
    formula: "percentile(90, daysBetween(CreatedDate, now())) [IsClosed = false]"
    note: "The 90th percentile, not the average. Averages hide the handful of ancient cases that generate every escalation."
  - name: "At-Risk Cases"
    formula: "count() [IsClosed = false AND minutesUntilBreach < 60]"
    note: "The only widget on the dashboard that is meant to be acted on within the hour."
  - name: "Reopen Rate"
    formula: "count() [ReopenCount > 0] / count() [IsClosed]"
    note: "A rising reopen rate usually means the first response SLA is being hit by closing cases too early."
recipe:
  - step: "Flatten CaseHistory into first-response minutes"
    detail: "A recipe that finds the first outbound interaction per case and writes the elapsed minutes back onto the case row. Doing this at query time in SAQL is far too slow for a wall display."
  - step: "Join the SLA target by priority"
    detail: "A small lookup dataset mapping priority to target minutes, so changing an SLA is a data edit rather than a dashboard rebuild."
  - step: "Compute breach countdown in the dataflow"
    detail: "minutesUntilBreach has to be recomputed on every run. Deriving it in a binding means it is only correct at page load."
  - step: "Design for distance"
    detail: "Four large number widgets, one table, no legends. If it can't be read from three metres it doesn't belong on a command centre screen."
techniques:
  - "Data Prep"
  - "Recipe"
  - "SAQL"
  - "Bindings"
  - "Conditional Formatting"
  - "Compare Table"
---

# Service SLA Command Center

::note
A **worked example** showing what a harder, history-dependent build looks like. Use it as a
template for your own entry rather than as a dashboard to copy verbatim.
::

## What it measures

Support leaders watch two things continuously: *are we responding fast enough*, and *what
is about to breach*. Everything else — reopen rate, backlog age — is diagnostic, there to
explain the first two when they move.

## Why this one is Advanced

Three of the four KPIs cannot be answered from the `Case` object as it stands:

- **First response** lives in `CaseHistory`, one row per change, and has to be flattened to
  one number per case before it is usable.
- **Breach countdown** depends on a target that varies by priority, so it needs a lookup
  rather than a constant.
- **Reopen rate** needs a count of status transitions, which again is history, not state.

That is the real lesson of this build: *the dashboard was the easy part.* Nearly all the
work is in Data Prep, reshaping history into one honest row per case.

## The mistake worth avoiding

The first version computed `minutesUntilBreach` in a binding, which meant it was accurate at
the moment the page loaded and progressively wrong after that — on a screen that nobody ever
refreshes. Move anything time-sensitive into the recipe and let the scheduled run be the
thing that keeps it current.
