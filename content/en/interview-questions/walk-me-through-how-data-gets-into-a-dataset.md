---
title: Walk me through how data gets into a dataset.
description: Five stages. A connection defines the source. Data sync pulls selected objects and selected fields into CRM Analytics' own store on a schedule. A recipe…
type: conceptual
topic: foundations
level: junior
source: academy
---

Five stages. A connection defines the source. Data sync pulls selected objects and selected fields into CRM Analytics' own store on a schedule. A recipe transforms them — joins, filters, formulas, aggregations — and writes a dataset. The dataset is materialised and columnar, and lenses and dashboards read it. A schedule drives sync and recipes. The subtle failure is scheduling a recipe before the sync it depends on has finished: it succeeds every night using yesterday's data, and never errors.
