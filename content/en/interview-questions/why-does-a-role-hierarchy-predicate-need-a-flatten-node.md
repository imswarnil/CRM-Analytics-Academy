---
title: Why does a role-hierarchy predicate need a flatten node?
description: Because a predicate is a comparison and a hierarchy is a tree, and a comparison cannot walk a tree at query time. The flatten node precomputes each role's…
type: conceptual
topic: setup
level: senior
source: academy
---

Because a predicate is a comparison and a hierarchy is a tree, and a comparison cannot walk a tree at query time. The flatten node precomputes each role's ancestry into a path column at recipe time, and the predicate asks whether the viewer's role appears in that path. It is also the concrete reason security has to be designed before the data model: the rule needs a column, the column needs a recipe node, and the node needs fields that must be synced.
