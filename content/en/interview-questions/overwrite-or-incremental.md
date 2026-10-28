---
title: Overwrite or incremental?
description: Overwrite until volume makes it wrong. It is self-correcting — a bad run is fixed by the next good one — needs no key and cannot drift. Incremental upsert…
type: conceptual
topic: apis-and-automation
level: senior
source: academy
---

Overwrite until volume makes it wrong. It is self-correcting — a bad run is fixed by the next good one — needs no key and cannot drift. Incremental upsert is necessary at scale and it drifts silently when a change is missed: nothing errors, the dataset is just slightly wrong indefinitely. So if I go incremental I add a periodic full reconciliation, otherwise I have traded a visible cost for an invisible one.
