---
title: "Was ist die Falle beim Abfragen eines Snapshots?"
description: "Die gleiche Entität erscheint viele Male durch Design - eine Zeile pro Konto pro Monat. Die Zusammenfassung von ARR über alle Zeilen eines achtzehnmonatigen Snapshots gibt achtzehn..."
type: "technical"
topic: "datasets-and-modelling"
level: "senior"
source: "academy"
---

Die gleiche Entität erscheint viele Male durch Design - eine Zeile pro Konto pro Monat. Die Zusammenfassung der ARR über alle Zeilen eines achtzehnmonatigen Snapshots ergibt achtzehn Jahre Umsatz. Jede Abfrage gegen einen muss entweder einen Monat auswählen oder nach einem gruppieren, und 'current' ist eher ein Filter als eine Eigenschaft.
