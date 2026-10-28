---
title: How does SAQL differ from SQL?
description: It is a stream transformation rather than a declarative query. Each statement takes the previous result and transforms it, reassigning the same variable,…
type: technical
topic: saql
level: junior
source: academy
---

It is a stream transformation rather than a declarative query. Each statement takes the previous result and transforms it, reassigning the same variable, so statement order is literally the plan that runs — there is no optimiser reordering it. Practically that means filtering early rather than late, because filtering after a group means aggregating rows I was about to discard. The other difference that bites is quoting: single quotes for field names, double quotes for string values.
