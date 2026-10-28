---
title: How do you compute LTV for a prepaid pool, like classroom seat-days?
description: Carefully, and I'd show two numbers. The textbook formula divides ARPA times gross margin by a churn rate, and it assumes revenue per account is stable…
type: conceptual
topic: demand-analytics
level: mid
source: academy
---

Carefully, and I'd show two numbers. The textbook formula divides ARPA times gross margin by a churn rate, and it assumes revenue per account is stable and that churn is an event — neither is true for a prepaid pool, where an account renews for whatever it actually used and can shrink 40% without ever cancelling. So I'd publish that figure for the seat plans where it's genuinely valid, and label it an estimate elsewhere. The honest version is cohort-realised value: group accounts by signup month, sum each cohort's revenue indexed by months since signup, and plot cumulative revenue per cohort. Lines that keep climbing mean expansion is outrunning contraction, which is the single most important fact about a business that sells into teams and completely invisible in a churn rate. The caveat to state is truncation — a three-month-old cohort has three months of revenue against a full CAC, so recent cohorts always look bad and should be greyed out rather than compared.
