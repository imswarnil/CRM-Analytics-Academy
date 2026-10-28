---
title: What is the trap with querying a snapshot?
description: The same entity appears many times by design — one row per account per month. Summing ARR across all rows of an eighteen-month snapshot gives eighteen…
type: technical
topic: datasets-and-modelling
level: senior
source: academy
---

The same entity appears many times by design — one row per account per month. Summing ARR across all rows of an eighteen-month snapshot gives eighteen years of revenue. Every query against one must either pick a month or group by one, and 'current' is a filter rather than a property.
