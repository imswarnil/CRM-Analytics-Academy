---
title: "Welche Edge Cases testen Sie?"
description: "Nichts ausgewählt, eine Sache ausgewählt, mehrere Dinge ausgewählt — drei Klicks, und es fängt fast jeden Binding Bug. Für abhängige Filter teste ich auch..."
type: "conceptual"
topic: "bindings"
level: "junior"
source: "academy"
---

Nichts ausgewählt, eine Sache ausgewählt, mehrere Dinge ausgewählt — drei Klicks, und es fängt fast jeden Binding Bug. Bei abhängigen Filtern teste ich auch die veraltete Auswahl: Wählen Sie einen Vertreter, ändern Sie die Region, so dass der Vertreter außerhalb des Anwendungsbereichs liegt, und überprüfen Sie, ob das Dashboard ihn löscht, anstatt stillschweigend zu jemandem zu filtern, der unsichtbar ist. Und für Ergebnisbindungen die leere Quelle, denn eine Abfrage, die rechtmäßig nichts zurückgibt, ist oft der interessante Fall.
