---
title: A dashboard is slow in a way its widget count does not explain. What do you check?
description: Chained results bindings. Each one serialises what would otherwise run in parallel, so three in a chain means the last widget waits on two round trips.…
type: scenario
topic: bindings
level: junior
source: academy
---

Chained results bindings. Each one serialises what would otherwise run in parallel, so three in a chain means the last widget waits on two round trips. Nothing on screen suggests the dependency exists. After that I check whether widgets that could share a query each have their own, and whether anything is aggregating a very fine grain on every load.
