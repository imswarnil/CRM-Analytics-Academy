---
title: Fan-out — two fixes. When do you use each?
description: Aggregate the many side before the join, which keeps the output at one row per deal — right when the dataset is about deals. Or keep the finer grain…
type: conceptual
topic: datasets-and-modelling
level: junior
source: academy
---

Aggregate the many side before the join, which keeps the output at one row per deal — right when the dataset is about deals. Or keep the finer grain deliberately and do not carry the parent's measure down, summing the line-level amounts instead — right when the dataset is about products. Which one depends on what the dataset is for, not on which is easier.
