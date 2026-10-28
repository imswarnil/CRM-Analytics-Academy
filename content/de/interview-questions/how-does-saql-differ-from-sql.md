---
title: "Wie funktioniert SAQL unterscheiden sich von SQL?"
description: "Es ist eine Stream-Transformation und keine deklarative Abfrage. Jede Aussage nimmt das vorherige Ergebnis und transformiert es, indem sie dieselbe Variable,..."
type: "technical"
topic: "saql"
level: "junior"
source: "academy"
---

Es ist eine Stream-Transformation und keine deklarative Abfrage. Jede Anweisung nimmt das vorherige Ergebnis und transformiert es, indem sie die gleiche Variable neu zuweist, so dass die Anweisungsreihenfolge buchstäblich der Plan ist, der ausgeführt wird - es gibt keinen Optimierer, der sie neu ordnet. Praktisch bedeutet das Filtern eher früh als spät, weil Filtern nach einer Gruppe bedeutet, Zeilen zu aggregieren, die ich verwerfen wollte. Der andere Unterschied, den Bisse zitieren: einzelne Anführungszeichen für Feldnamen, doppelte Anführungszeichen für Zeichenkettenwerte.
