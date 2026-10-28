---
title: What is the trap with `!=` in a filter?
description: It drops nulls as well. Filtering stage not equal to Closed Lost also removes every row where stage is blank — often the rows with a data-quality problem…
type: conceptual
topic: saql
level: junior
source: academy
---

It drops nulls as well. Filtering stage not equal to Closed Lost also removes every row where stage is blank — often the rows with a data-quality problem worth seeing. Nothing errors, the total just falls. If I mean 'everything except X including unknowns' I write that explicitly.
