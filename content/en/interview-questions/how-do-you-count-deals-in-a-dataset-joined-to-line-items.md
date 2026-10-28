---
title: How do you count deals in a dataset joined to line items?
description: unique on the opportunity key, not count. count counts rows at the current grain, so at line-item grain it counts lines — 1,192 rather than 608 in our…
type: conceptual
topic: saql
level: junior
source: academy
---

unique() on the opportunity key, not count(). count() counts rows at the current grain, so at line-item grain it counts lines — 1,192 rather than 608 in our data. It is the grain problem wearing a function's clothes, and I check the result against a number I already know.
