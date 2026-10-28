---
title: A user says the dashboard is missing records they know exist. Where do you look?
description: "Missing rather than duplicated points upstream, and to permissions rather than to the dashboard. First the integration user: sync runs as that user, so an…"
type: scenario
topic: foundations
level: junior
source: academy
---

Missing rather than duplicated points upstream, and to permissions rather than to the dashboard. First the integration user: sync runs as that user, so an object or field it cannot see never arrives, silently. Then the security predicate and sharing inheritance, which filter what each viewer sees. Then the recipe, for an inner join that dropped unmatched records or a filter that is narrower than intended. The dashboard is last — it usually reports faithfully what it was given.
