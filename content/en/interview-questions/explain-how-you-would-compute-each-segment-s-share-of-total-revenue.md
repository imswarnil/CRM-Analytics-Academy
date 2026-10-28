---
title: Explain how you would compute each segment's share of total revenue.
description: Two levels of aggregation. Group by all to get the company total as one stream, group by segment for the per-segment revenue as another, then combine so…
type: conceptual
topic: saql
level: junior
source: academy
---

Two levels of aggregation. Group by all to get the company total as one stream, group by segment for the per-segment revenue as another, then combine so each segment row can see the total and divide. It is the canonical two-level query and it is the most common reason anyone opens the editor — once you can write it, index-against-average and contribution-to-growth are the same manoeuvre.
