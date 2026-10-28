---
title: When would you model long rather than wide?
description: When metrics get added often, or when I want one widget to chart any of them via a filter — new metrics become new rows rather than a schema change and a…
type: conceptual
topic: datasets-and-modelling
level: junior
source: academy
---

When metrics get added often, or when I want one widget to chart any of them via a filter — new metrics become new rows rather than a schema change and a rebuild. The cost is that every query must filter to a metric, and a query that forgets adds revenue to deal count to conversion rate and returns a number with no error. So if I model long, the metric filter goes into the base query rather than being left to each builder to remember.
