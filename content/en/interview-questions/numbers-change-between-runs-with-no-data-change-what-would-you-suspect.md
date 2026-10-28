---
title: Numbers change between runs with no data change. What would you suspect?
description: A relative date range, which genuinely moves and is correct for a live dashboard, or a window with no explicit ordering, which is a bug — running totals,…
type: scenario
topic: saql
level: junior
source: academy
---

A relative date range, which genuinely moves and is correct for a live dashboard, or a window with no explicit ordering, which is a bug — running totals, rank and period-over-period all depend on row order, and without one specified the engine uses whatever it produced. It is stable until the next refresh, then quietly different.
