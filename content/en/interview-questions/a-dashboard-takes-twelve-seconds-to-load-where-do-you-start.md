---
title: A dashboard takes twelve seconds to load. Where do you start?
description: Count the distinct queries rather than the widgets. A screen with twelve widgets that could share four queries is usually the whole problem, and…
type: conceptual
topic: designing-dashboards
level: junior
source: academy
---

Count the distinct queries rather than the widgets. A screen with twelve widgets that could share four queries is usually the whole problem, and consolidating changes nothing about how it looks. Then whether it is aggregating a very fine grain at query time, which is a case for pre-aggregating in the recipe if many people open it daily. Then wide tables, which are slow and unreadable at the same time. And I measure as a normal user, because my admin account may skip security evaluation that a real viewer pays for on every query.
