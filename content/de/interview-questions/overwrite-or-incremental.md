---
title: "Überschreiben oder inkrementell?"
description: "Überschreiben, bis das Volumen es falsch macht. Es ist selbstkorrigierend - ein schlechter Lauf wird durch den nächsten guten behoben - braucht keinen Schlüssel und kann nicht driften. Inkrementelles Upsert..."
type: "conceptual"
topic: "apis-and-automation"
level: "senior"
source: "academy"
---

Überschreiben, bis das Volumen es falsch macht. Es ist selbstkorrigierend - ein schlechter Lauf wird durch den nächsten guten behoben - braucht keinen Schlüssel und kann nicht driften. Inkrementelles Upsert ist in großem Maßstab notwendig und driftet leise, wenn eine Änderung verpasst wird: nichts Fehler, der Datensatz ist nur auf unbestimmte Zeit etwas falsch. Also, wenn ich inkrementell gehe, füge ich eine periodische vollständige Abstimmung hinzu, sonst habe ich einen sichtbaren Preis für einen unsichtbaren gehandelt.
