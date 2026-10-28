---
title: Marketing reports 1,783 MQLs, sales reports 1,240. Which one is wrong?
description: Probably neither. That gap is almost always a definition difference rather than a computation error, and the most common cause is the date field:…
type: conceptual
topic: gtm-engineering
level: mid
source: academy
---

Probably neither. That gap is almost always a definition difference rather than a computation error, and the most common cause is the date field: marketing counts by the date the lead was created, sales counts by the date it was qualified, and with a lag of up to three weeks the monthly buckets never agree. Other candidates are whether disqualified leads are excluded, whether self-serve signups count, and whether one side is deduplicating by company. My move is not to find the error but to put both definitions side by side, state which date field and which filters each uses, and ask the business which one goes on the board deck. That converts it from a data problem into a business decision, which is where it belongs — and then I write the chosen definition onto the face of the dashboard so it doesn't recur.
