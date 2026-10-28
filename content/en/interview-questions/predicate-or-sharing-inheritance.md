---
title: Predicate or sharing inheritance?
description: Inheritance where it fits, because it reuses the org's existing sharing and therefore cannot drift when the business reorganises — a hand-written…
type: conceptual
topic: setup
level: junior
source: academy
---

Inheritance where it fits, because it reuses the org's existing sharing and therefore cannot drift when the business reorganises — a hand-written predicate keeps enforcing last year's structure, correctly and invisibly. But inheritance only covers rows that correspond to supported Salesforce records, so external data, uploaded data and aggregated datasets need a predicate. In practice it is both: inheritance where it applies with a restrictive fallback predicate behind it, and a note saying which is doing the work.
