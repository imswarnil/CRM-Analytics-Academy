---
title: "Jemand sagt, dass der Datensatz Duplikate hat. Was machst du?"
description: "Finden Sie heraus, welche von drei Dingen sie bedeuten. Normalerweise ist es ein Join-Artefakt - Zeilen, die mit einem One-to-Many-Join multipliziert werden, wobei die Datensätze in Ordnung sind und die Abfrage ..."
type: "conceptual"
topic: "data-preparation"
level: "junior"
source: "academy"
---

Finden Sie heraus, welche von drei Dingen sie bedeuten. Normalerweise handelt es sich um ein Join-Artefakt - Zeilen, die mit einem One-to-Many-Join multipliziert werden, wobei die Datensätze in Ordnung sind und die Abfrage falsch ist und der Fix eher der Join als ein Deduplizierungsschritt ist. Manchmal ist es das beabsichtigte Getreide, wie ein Konto, das einmal im Monat in einer Momentaufnahme erscheint. Nur gelegentlich sind es echte doppelte Aufzeichnungen. Das Löschen von Zeilen, um ein Fan-Out zu beheben, senkt die Gesamtsumme, so dass es aussieht, als ob es funktioniert hätte, während echte Daten entfernt und die schlechte Verbindung für die nächste Maßnahme an Ort und Stelle gelassen werden.
