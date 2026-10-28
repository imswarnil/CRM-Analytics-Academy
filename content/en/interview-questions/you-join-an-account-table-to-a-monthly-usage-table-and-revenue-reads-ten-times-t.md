---
title: You join an account table to a monthly usage table and revenue reads ten times too high. What happened?
description: Fan-out. The account table is one row per account and the usage table is one row per account per product per month, so after the join each account appears…
type: scenario
topic: gtm-engineering
level: mid
source: academy
---

Fan-out. The account table is one row per account and the usage table is one row per account per product per month, so after the join each account appears once per usage row — up to 54 times for an account with three products across eighteen months. The ARR column isn't wrong on any individual row, it's repeated, and summing it multiplies. The fix is to aggregate the usage side to account grain first — sum billed revenue, average utilisation, take the latest commit state — and then join, which keeps the output at one row per account. The habit that catches it is asserting the row count after every join: if the account dataset doesn't come out at the number of accounts I started with, I fanned out. I also keep a couple of anchor totals memorised so an absurd number is obvious at a glance.
