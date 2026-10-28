---
title: How is it different from a Salesforce report?
description: A report queries the live database, is limited in how many objects it can span, and slows on large volumes. A dataset is a pre-built snapshot that can…
type: conceptual
topic: foundations
level: junior
source: academy
---

A report queries the live database, is limited in how many objects it can span, and slows on large volumes. A dataset is a pre-built snapshot that can join many objects and external sources at a chosen grain, aggregates tens of millions of rows quickly, and can hold history the object itself no longer has. The trade is currency: a report is always now, a dataset is as current as its last run.
