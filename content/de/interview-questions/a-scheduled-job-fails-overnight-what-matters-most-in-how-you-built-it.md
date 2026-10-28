---
title: "Ein geplanter Job scheitert über Nacht. Was ist am wichtigsten, wie Sie es gebaut haben?"
description: "Ob es jemand sieht. Ein Job, der in einem Logbuch fehlschlägt, das niemand öffnet, ist ein Job, der nicht läuft, und Sie erfahren es Wochen später aus einem Dashboard."
type: "scenario"
topic: "apis-and-automation"
level: "junior"
source: "academy"
---

Ob es jemand sieht. Ein Job, der in einem Protokollverzeichnis fehlschlägt, das niemand öffnet, ist ein Job, der nicht ausgeführt wird, und Sie erfahren es Wochen später aus einem Dashboard. Also: Nicht-Null-Ausgang, damit der Scheduler weiß, eine Warnung in einen Kanal, den das Team bereits beobachtet, Wiederholung mit Backoff für vorübergehende Fehler und Wiederaufnahme für lange Lasten, so dass ein Ausfall bei Teil 40 von 60 Minuten kostet, anstatt den gesamten Lauf.
