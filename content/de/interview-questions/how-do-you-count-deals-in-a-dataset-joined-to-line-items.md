---
title: "Wie zählen Sie Deals in einem Datensatz, der mit Zeilenelementen verbunden ist?"
description: "Einmalig auf dem Opportunity Key, nicht zählen. Zählt die Reihen beim aktuellen Korn, so zählt das Linienkorn die Linien - 1.192 statt 608 in unserem..."
type: "conceptual"
topic: "saql"
level: "junior"
source: "academy"
---

unique() auf dem Opportunity Key, not count(). count() zählt Zeilen beim aktuellen Korn, also beim Zeilenkorn zählt es Linien - 1.192 statt 608 in unseren Daten. Es ist das Kornproblem, das die Kleidung einer Funktion trägt, und ich überprüfe das Ergebnis mit einer Zahl, die ich bereits kenne.
