---
title: Someone says the dataset has duplicates. What do you do?
description: Work out which of three things they mean. Usually it is a join artefact — rows multiplied by a one-to-many join, where the records are fine and the query…
type: conceptual
topic: data-preparation
level: junior
source: academy
---

Work out which of three things they mean. Usually it is a join artefact — rows multiplied by a one-to-many join, where the records are fine and the query is wrong, and the fix is the join rather than a de-duplication step. Sometimes it is the intended grain, like an account appearing once per month in a snapshot. Only occasionally is it genuine duplicate records. Deleting rows to fix a fan-out lowers the total so it looks like it worked, while removing real data and leaving the bad join in place for the next measure to hit.
