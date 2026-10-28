---
title: Why would you store an ARR snapshot rather than compute ARR on the fly?
description: Because the moment someone asks what ARR was as at March, a table that only knows today's state cannot answer, and reconstructing it means guessing at…
type: conceptual
topic: gtm-engineering
level: mid
source: academy
---

Because the moment someone asks what ARR was as at March, a table that only knows today's state cannot answer, and reconstructing it means guessing at which contracts had started and which had lapsed. A monthly snapshot per account, with the movement type that explains the change — new, expansion, contraction, churn — makes the revenue waterfall and net revenue retention straightforward, and it makes historical numbers stable so a chart you showed the board last quarter still says the same thing. The cost is a scheduled job and the discipline not to backfill it. That's a good trade: history that moves is worse than no history, because people notice and stop trusting everything else you publish.
