---
title: What do you check when loading a file?
description: Three things, in order of expense. Dates typed as dates, because a text date renders perfectly in a table and cannot be trended, filtered by range or…
type: conceptual
topic: data-preparation
level: senior
source: academy
---

Three things, in order of expense. Dates typed as dates, because a text date renders perfectly in a table and cannot be trended, filtered by range or grouped by month — and fixing it means a reload. Identifiers forced to dimensions, because a numeric-looking ID typed as a measure means the product will offer to sum it and eventually somebody accepts. And currency scale, compared against one raw row by eye, because a value in cents read as whole units is out by a hundred consistently enough that nothing looks anomalous. Then the row count against a known total.
