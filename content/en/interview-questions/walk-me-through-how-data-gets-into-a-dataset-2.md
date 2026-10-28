---
title: Walk me through how data gets into a dataset.
description: A connection defines the source. Data sync pulls selected objects and selected fields into CRM Analytics' own store on a schedule, so recipes read a local…
type: conceptual
topic: data-preparation
level: junior
source: academy
---

A connection defines the source. Data sync pulls selected objects and selected fields into CRM Analytics' own store on a schedule, so recipes read a local copy rather than hitting the system of record on every run. A recipe transforms that — joins, filters, formulas, aggregations — and writes a dataset. The dataset is materialised and columnar, and lenses and dashboards read it. Two clocks, sync and recipes, and the data is as old as the earlier of them.
