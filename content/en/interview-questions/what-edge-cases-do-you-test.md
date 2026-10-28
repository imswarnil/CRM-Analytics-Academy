---
title: What edge cases do you test?
description: Nothing selected, one thing selected, several things selected — three clicks, and it catches nearly every binding bug. For dependent filters I also test…
type: conceptual
topic: bindings
level: junior
source: academy
---

Nothing selected, one thing selected, several things selected — three clicks, and it catches nearly every binding bug. For dependent filters I also test the stale selection: pick a rep, change the region so that rep is out of scope, and check the dashboard clears it rather than silently filtering to somebody invisible. And for results bindings, the empty source, because a query that legitimately returns nothing is often the interesting case.
