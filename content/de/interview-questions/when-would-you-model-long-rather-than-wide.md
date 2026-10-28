---
title: "Wann würden Sie lange anstatt breit modellieren?"
description: "Wenn Metriken oft hinzugefügt werden oder wenn ich möchte, dass ein Widget sie über einen Filter kartographiert - neue Metriken werden zu neuen Zeilen und nicht zu einer Schemaänderung und..."
type: "conceptual"
topic: "datasets-and-modelling"
level: "junior"
source: "academy"
---

Wenn Metriken oft hinzugefügt werden oder wenn ich möchte, dass ein Widget sie über einen Filter kartiert - neue Metriken werden zu neuen Zeilen und nicht zu einer Schemaänderung und einem Umbau. Die Kosten sind, dass jede Abfrage zu einer Metrik filtern muss, und eine Abfrage, die vergisst, fügt Einnahmen hinzu, um die Conversion-Rate zu zählen, und gibt eine Zahl ohne Fehler zurück. Wenn ich also lange modelliere, geht der metrische Filter in die Basisabfrage, anstatt jedem Builder überlassen zu werden, um sich zu erinnern.
