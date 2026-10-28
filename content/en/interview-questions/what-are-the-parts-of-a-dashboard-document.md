---
title: What are the parts of a dashboard document?
description: "State wrapping three collections: steps, widgets and layouts. Steps are the query definitions — dataset, groupings, measures, filters, sometimes raw SAQL…"
type: conceptual
topic: dashboard-json
level: junior
source: academy
---

State wrapping three collections: steps, widgets and layouts. Steps are the query definitions — dataset, groupings, measures, filters, sometimes raw SAQL — each with a name. Widgets are what is drawn, and they reference a step by name rather than containing a query. Layouts are position and size, separately and usually per breakpoint, which is why a widget that looks wrong on a phone is a layout problem and never a widget problem.
