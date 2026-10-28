---
title: "Marketingberichte 1.783 MQLs, Verkaufsberichte 1.240. Welches ist falsch?"
description: "Wahrscheinlich auch nicht. Diese Lücke ist fast immer ein Definitionsunterschied und kein Berechnungsfehler, und die häufigste Ursache ist das Datumsfeld: ..."
type: "conceptual"
topic: "gtm-engineering"
level: "mid"
source: "academy"
---

Wahrscheinlich auch nicht. Diese Lücke ist fast immer ein Definitionsunterschied und kein Berechnungsfehler, und die häufigste Ursache ist das Datumsfeld: Marketing zählt bis zum Datum, an dem der Lead erstellt wurde, Verkäufe zählen bis zum Datum, an dem er qualifiziert wurde, und mit einer Verzögerung von bis zu drei Wochen stimmen die monatlichen Buckets nie überein. Andere Kandidaten sind, ob disqualifizierte Leads ausgeschlossen sind, ob Self-Service-Anmeldungen zählen und ob eine Seite von Unternehmen dedupliziert wird. Mein Schritt ist nicht, den Fehler zu finden, sondern beide Definitionen nebeneinander zu stellen, anzugeben, welches Datumsfeld und welche Filter jeder verwendet, und das Geschäft zu fragen, welches auf dem Boarddeck geht. Das verwandelt es von einem Datenproblem in eine Geschäftsentscheidung, wo es hingehört - und dann schreibe ich die gewählte Definition auf die Vorderseite des Dashboards, damit es nicht wiederkehrt.
