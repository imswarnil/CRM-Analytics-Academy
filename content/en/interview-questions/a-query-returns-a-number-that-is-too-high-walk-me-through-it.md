---
title: A query returns a number that is too high. Walk me through it.
description: Cut back to the load and check the row count against what the dataset should hold, then add one statement at a time checking the count after each — the…
type: technical
topic: saql
level: junior
source: academy
---

Cut back to the load and check the row count against what the dataset should hold, then add one statement at a time checking the count after each — the statement where it stops making sense is the one with the bug. Then narrow to a single account where I can count by hand, because an aggregate cannot tell me which side multiplied. A clean multiple is row multiplication with a parent measure summed after it; slightly high is a partial fan-out; too low is usually a filter that also excluded nulls.
