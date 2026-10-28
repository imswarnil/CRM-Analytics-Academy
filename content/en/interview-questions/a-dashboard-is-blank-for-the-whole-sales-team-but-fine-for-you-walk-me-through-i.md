---
title: A dashboard is blank for the whole sales team but fine for you. Walk me through it.
description: Blank for everyone but the admin points at row-level security, so I start there rather than at the dashboard. Is there a predicate, and does the team…
type: scenario
topic: setup
level: junior
source: academy
---

Blank for everyone but the admin points at row-level security, so I start there rather than at the dashboard. Is there a predicate, and does the team satisfy it — is the field it compares populated on their user records, and do the strings match exactly, including case and trailing spaces? Nulls fail closed, which is the right behaviour and the most common cause. Then sharing inheritance and its fallback. Then whether the app is shared with them at all, because no-access and no-rows look identical. My own account tells me nothing here, which is why I check as a restricted user before shipping rather than after.
