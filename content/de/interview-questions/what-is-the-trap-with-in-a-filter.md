---
title: "Was ist die Falle mit `!=` In einem Filter?"
description: "Es lässt auch Nullen fallen. Die Filterstufe, die nicht gleich Closed Lost ist, entfernt auch jede Zeile, in der die Stufe leer ist - oft die Zeilen mit einem Datenqualitätsproblem."
type: "conceptual"
topic: "saql"
level: "junior"
source: "academy"
---

Es lässt auch Nullen fallen. Die Filterstufe, die nicht gleich Closed Lost ist, entfernt auch jede Zeile, in der die Stufe leer ist - oft die Zeilen mit einem sehenswerten Datenqualitätsproblem. Nichts ist falsch, die Summe fällt einfach. Wenn ich "alles außer x einschließlich unbekannte" meine, schreibe ich das explizit.
