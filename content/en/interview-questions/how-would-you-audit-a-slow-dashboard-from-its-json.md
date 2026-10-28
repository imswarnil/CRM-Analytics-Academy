---
title: How would you audit a slow dashboard from its JSON?
description: Count steps against widgets. Eleven steps for twelve widgets means nothing is shared and the screen is making eleven round trips; four steps for twelve…
type: technical
topic: dashboard-json
level: junior
source: academy
---

Count steps against widgets. Eleven steps for twelve widgets means nothing is shared and the screen is making eleven round trips; four steps for twelve widgets is a screen somebody thought about. Then I look for steps that differ only in presentation — a headline number, a bar chart and a table over the same measure can usually be one query. That audit takes about thirty seconds in a text editor and is awkward to do in the builder at all.
