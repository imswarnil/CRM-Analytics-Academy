---
title: "Sie verbinden eine Kontotabelle mit einer monatlichen Nutzungstabelle und der Umsatz liest sich zehnmal zu hoch. Was ist passiert?"
description: "Fan-out. Die Kontotabelle ist eine Zeile pro Konto und die Nutzungstabelle ist eine Zeile pro Konto pro Produkt pro Monat, so dass nach dem Beitritt jedes Konto erscheint ..."
type: "scenario"
topic: "gtm-engineering"
level: "mid"
source: "academy"
---

Fan-out. Die Kontotabelle ist eine Zeile pro Konto und die Nutzungstabelle ist eine Zeile pro Konto pro Produkt und Monat, so dass nach dem Beitritt jedes Konto einmal pro Nutzungszeile erscheint - bis zu 54 Mal für ein Konto mit drei Produkten über achtzehn Monate. Die ARR-Spalte ist in keiner einzelnen Zeile falsch, sie wird wiederholt und die Addition multipliziert. Der Fix besteht darin, die Nutzungsseite zu aggregieren, um zuerst Getreide zu berücksichtigen - den abgerechneten Umsatz, die durchschnittliche Nutzung, den letzten Commit-Status zu nehmen - und dann beizutreten, was die Ausgabe in einer Zeile pro Konto hält. Die Gewohnheit, die es fängt, behauptet die Zeilenzahl nach jedem Beitritt: Wenn der Kontodatensatz nicht bei der Anzahl der Konten herauskommt, mit denen ich angefangen habe, habe ich aufgefächert. Ich habe auch ein paar Ankersummen auswendig gelernt, so dass eine absurde Zahl auf einen Blick offensichtlich ist.
