---
title: "Warum braucht ein Rollenhierarchieprädikat einen flachen Knoten?"
description: "Denn ein Prädikat ist ein Vergleich und eine Hierarchie ist ein Baum, und ein Vergleich kann einen Baum nicht zur Abfragezeit laufen. Der flache Knoten berechnet die..."
type: "conceptual"
topic: "setup"
level: "senior"
source: "academy"
---

Denn ein Prädikat ist ein Vergleich und eine Hierarchie ist ein Baum, und ein Vergleich kann einen Baum nicht zur Abfragezeit laufen. Der flache Knoten berechnet die Abstammung jeder Rolle zum Zeitpunkt des Rezepts in eine Pfadspalte, und das Prädikat fragt, ob die Rolle des Betrachters in diesem Pfad erscheint. Es ist auch der konkrete Grund, warum Sicherheit vor dem Datenmodell entworfen werden muss: Die Regel benötigt eine Spalte, die Spalte einen Rezeptknoten und der Knoten benötigt Felder, die synchronisiert werden müssen.
