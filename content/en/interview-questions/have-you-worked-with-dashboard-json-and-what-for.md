---
title: Have you worked with dashboard JSON, and what for?
description: Mostly for bulk edits and for review. Renaming a field across thirty widgets or re-pointing every step after a dataset rename is one find-and-replace in…
type: technical
topic: dashboard-json
level: junior
source: academy
---

Mostly for bulk edits and for review. Renaming a field across thirty widgets or re-pointing every step after a dataset rename is one find-and-replace in text and thirty configuration panels in the builder, with a decent chance of missing one. And because JSON is text it diffs, which turns 'I updated the dashboard' into a reviewable list of exactly what changed. What I avoid is using it to do ordinary work the builder does perfectly well, because hand-written structures may not round-trip and then only I can maintain the dashboard.
