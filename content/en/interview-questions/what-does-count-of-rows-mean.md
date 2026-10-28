---
title: What does 'count of rows' mean?
description: Exactly what it says, which is the trap. At line-item grain the Academy's 1,192 rows are 608 opportunities, so counting rows counts lines. If the…
type: conceptual
topic: lenses-and-explorations
level: junior
source: academy
---

Exactly what it says, which is the trap. At line-item grain the Academy's 1,192 rows are 608 opportunities, so counting rows counts lines. If the dataset's grain is finer than the entity I am counting, I use a distinct count on that entity's key — and I check it against a number I already know.
