---
title: Why would you build a snapshot dataset?
description: Because Salesforce objects hold only current state. An opportunity knows today's amount and stage and nothing about March, so pipeline movement, slipped…
type: conceptual
topic: datasets-and-modelling
level: junior
source: academy
---

Because Salesforce objects hold only current state. An opportunity knows today's amount and stage and nothing about March, so pipeline movement, slipped deals, forecast accuracy and an ARR waterfall are all unanswerable from the object. A snapshot appends current state each run and accumulates history that cannot be reconstructed afterwards — which is also why I set it up early and sync dates, owners, stages and amounts generously from the start. A field added in March has no February values, permanently.
