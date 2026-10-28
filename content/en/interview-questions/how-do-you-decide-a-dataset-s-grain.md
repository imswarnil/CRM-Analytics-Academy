---
title: How do you decide a dataset's grain?
description: From the questions it has to answer, written down first. The finest question sets the grain — if anything is about individual deals, it is one row per…
type: conceptual
topic: datasets-and-modelling
level: junior
source: academy
---

From the questions it has to answer, written down first. The finest question sets the grain — if anything is about individual deals, it is one row per deal. If every question is monthly totals by segment, it can be pre-aggregated, which is much faster and permanently unable to answer anything below that. And when two audiences genuinely need different grains, that is two datasets, usually from one recipe with two outputs so the logic is still defined once.
