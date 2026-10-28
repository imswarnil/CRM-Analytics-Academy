---
title: "Selection Binding oder Results Binding – Was ist der praktische Unterschied?"
description: "Eine Auswahlbindung liest, was jemand geklickt hat, so dass die Eingabe auf dem Bildschirm sichtbar ist und durch Schauen debuggbar ist. Eine Ergebnisbindung liest einen Wert..."
type: "technical"
topic: "bindings"
level: "junior"
source: "academy"
---

Eine Auswahlbindung liest, was jemand geklickt hat, so dass die Eingabe auf dem Bildschirm sichtbar ist und durch Schauen debuggbar ist. Eine Ergebnisbindung liest einen Wert, den eine andere Abfrage zurückgegeben hat - einen Unternehmensdurchschnitt, ein Maximum, eine Top-Kategorie - die leistungsfähiger und viel schwieriger zu debuggen ist, da die Eingabe unsichtbar ist. Es erstellt auch eine Ausführungsreihenfolge: Das abhängige Widget kann nicht starten, bis die Quelle zurückkehrt, so dass zwei parallele Abfragen zu zwei sequentiellen Abfragen werden.
