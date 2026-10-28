---
title: "Beschreiben Sie den externen Daten-Upload-Flow."
description: "Drei Schritte. Deklarieren Sie einen Job mit dem Datensatznamen, der Operation und den Feldmetadaten; laden Sie die Zeilen als nummerierte Teile hoch; signalisieren Sie dann den Abschluss, der..."
type: "conceptual"
topic: "apis-and-automation"
level: "junior"
source: "academy"
---

Drei Schritte. Deklarieren Sie einen Job mit dem Datensatznamen, der Operation und den Feldmetadaten; laden Sie die Zeilen als nummerierte Teile hoch; signalisieren Sie dann den Abschluss, wenn die Verarbeitung tatsächlich beginnt. Der Fehler, den jeder einmal trifft, vergisst den dritten Schritt - jeder Teil wird erfolgreich hochgeladen, nichts Fehler und kein Datensatz erscheint, weil ein unsignalisierter Job nicht von einem noch im Gange ist.
