---
title: "Ein Dashboard ist in einer Weise langsam, die seine Widgetzahl nicht erklärt. Was überprüfen Sie?"
description: "Verkettete Ergebnisbindungen. Jeder serialisiert, was sonst parallel laufen würde, so dass drei in einer Kette bedeutet, dass das letzte Widget auf zwei Rundreisen wartet."
type: "scenario"
topic: "bindings"
level: "junior"
source: "academy"
---

Verkettete Ergebnisbindungen. Jeder serialisiert, was sonst parallel laufen würde, so dass drei in einer Kette bedeutet, dass das letzte Widget auf zwei Rundreisen wartet. Nichts auf dem Bildschirm deutet darauf hin, dass die Abhängigkeit existiert. Danach überprüfe ich, ob Widgets, die eine Abfrage teilen könnten, jeweils ihre eigenen haben und ob irgendetwas bei jeder Ladung ein sehr feines Korn aggregiert.
