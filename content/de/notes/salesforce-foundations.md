---
title: "Salesforce Stiftungen — Schuldverschreibungen"
description: "Objekte, Felder, Beziehungen und Lead-Konvertierung auf einer Seite: das Datenmodell CRM Analytics Das Dashboard ist aufgebaut."
section: "foundations"
lessons: 1
---

## 1 · Objekte sind Tabellen

**Objekt** = Tabelle · **Aufzeichnung** = eine Zeile · **Feld** = eine Spalte.

- Standardobjekte Schiff mit Salesforce: Lead, Account, Contact, Opportunity, Campaign, Case
- Benutzerdefinierte Objekte enden in `__c` (z.B. `Subscription__c`)

| Objekt | Ein Rekord ist... |
|---|---|
| Blei | eine Person, noch nicht qualifiziert |
| Konto | ein Unternehmen |
| Kontakt | eine Person auf einem Konto |
| Gelegenheit | a Deal, mit Betrag + Stufe |

## 2 · Feldtypen entscheiden, was ein Diagramm tun kann

- **Abmessungen** — Text, Picklisten → Gruppe und Filter
- **Maßnahmen** — Zahlen, Währung → Summe, Durchschnitt, Zählung
- **Daten** — auf eine Zeitachse setzen, Perioden vergleichen

> Achtung: Ein als Text gespeichertes "Umsatz"-Feld kann nicht summiert werden. Überprüfen Sie zuerst den Typ!

## 3 · Beziehungen

- **Lookup** — lose. Das Kind kann alleine leben, hat sein eigenes Teilen. *Chance → Kampagne*
- **Master-Detail** — eng. Kind stirbt mit dem Elternteil, erbt Teilen, Elternteil erhält Roll-up-Zusammenfassungen
- **Viele bis viele** - benötigt ein Verbindungsobjekt. *Gelegenheit ↔ Kontakt* durch **Opportunitätskontaktrolle**

## 4 · Lead Conversion

::hand-chart{type="flow" title="One Lead, three records"}
---
labels:
  - "Blei"
  - "Konto"
  - "Kontakt"
  - "Gelegenheit"
---
::

Der konvertierte Lead behält `ConvertedAccountId`, `ConvertedContactId`, `ConvertedOpportunityId` Das ist es, was macht **Trichteranalyse** möglich.

## 5 · Ids, niemals Namen

- 15 Zeichen (case-sensitive) oder **18** (fallunempfindlich)
- Erste 3 = das Objekt: `001` Konto · `003` Kontakt · `006` Gelegenheit · `00Q` Blei
- Jedes Rezept passt zu einem **Id** Namen wiederholen und ändern

## 6 · Wie CRM Analytics liest es

::hand-chart{type="flow" title="Objects to dashboard"}
---
labels:
  - "Objekte"
  - "Datensynchronisierung"
  - "Rezeptur"
  - "Datensatz"
  - "Dashboard"
---
::

Dashboard-Abfrage **Datensätze**Niemals Objekte direkt. Wählen Sie **Körner** Erstens: eine Zeile pro Chance, pro Konto oder pro Lead.
