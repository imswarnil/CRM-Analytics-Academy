---
title: How do you give dashboards a change history?
description: "Export the metadata on a schedule and commit it to a repository, one file per dashboard. The diff is the product: 'the pipeline dashboard changed on the…"
type: conceptual
topic: apis-and-automation
level: junior
source: academy
---

Export the metadata on a schedule and commit it to a repository, one file per dashboard. The diff is the product: 'the pipeline dashboard changed on the 14th and here are the four lines that moved' answers the question people actually ask, which is why a number is different from last week. It is a record rather than a deployment pipeline — restoring from it should be a deliberate act, because conflating backup with deployment is how an automation overwrites somebody's afternoon.
