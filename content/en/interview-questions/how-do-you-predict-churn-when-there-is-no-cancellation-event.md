---
title: How do you predict churn when there is no cancellation event?
description: Usage trend. In a business selling seats and prepaid pools, churn is a four-month fade — no cancellation record, no closed-lost, no alert — so contract…
type: conceptual
topic: revops-analytics
level: junior
source: academy
---

Usage trend. In a business selling seats and prepaid pools, churn is a four-month fade — no cancellation record, no closed-lost, no alert — so contract status finds out at the renewal date. I flag accounts whose trailing utilisation is under the business's threshold AND falling, because level alone produces a list full of accounts that bought too much once and are not leaving. Then I join ARR to it, because eleven accounts is a number and $2.1M of ARR is a decision, and it is also what makes the list sortable in the order that matters.
