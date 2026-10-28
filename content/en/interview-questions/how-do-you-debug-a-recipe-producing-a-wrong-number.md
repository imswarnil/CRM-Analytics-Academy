---
title: How do you debug a recipe producing a wrong number?
description: Monitor first — did it run, when, how many rows — because roughly a third of these end there. Then compare the row count against what the dataset normally…
type: conceptual
topic: data-preparation
level: junior
source: academy
---

Monitor first — did it run, when, how many rows — because roughly a third of these end there. Then compare the row count against what the dataset normally holds. Then walk the node previews and find where the count changes unexpectedly, which localises a grain problem in about a minute. Then filter to a single entity and count by hand. The dashboard is last; it usually reports faithfully what it was given.
