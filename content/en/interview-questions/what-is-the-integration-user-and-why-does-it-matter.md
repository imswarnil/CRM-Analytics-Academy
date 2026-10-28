---
title: What is the integration user and why does it matter?
description: It is the account data sync runs as, so its visibility is the ceiling on everything downstream. If it cannot see a field, that field never arrives — the…
type: conceptual
topic: setup
level: junior
source: academy
---

It is the account data sync runs as, so its visibility is the ceiling on everything downstream. If it cannot see a field, that field never arrives — the sync succeeds, the recipe runs, the dataset builds, and the dashboard shows a number computed without it. It is the quietest failure in the platform because nothing errors and the result looks plausible. So whenever I add a field to a recipe I check three things: the integration user can see it, it is selected in sync, and sync has run since.
