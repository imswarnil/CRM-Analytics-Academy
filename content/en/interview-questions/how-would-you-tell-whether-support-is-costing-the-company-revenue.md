---
title: How would you tell whether support is costing the company revenue?
description: I'd join cases to accounts and then to the ARR snapshot, which is possible because both carry the account key, and look at whether accounts with SLA…
type: conceptual
topic: gtm-engineering
level: mid
source: academy
---

I'd join cases to accounts and then to the ARR snapshot, which is possible because both carry the account key, and look at whether accounts with SLA breaches or repeated escalations show contraction or churn in the following months rather than immediately. Then I'd bring in platform health, because I need to separate 'we had a real incident' from 'we got slower at answering' — a spike in cases with a matching error-rate spike is an engineering problem, and the same spike with flat platform metrics is a staffing or documentation problem, and those have different owners. I'd also treat CSAT carefully: only about 44% of closed cases get a response, and unhappy customers answer more often, so the average overstates dissatisfaction and I'd show the response rate beside it.
