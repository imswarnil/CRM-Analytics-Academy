---
title: "Einstein Discovery Story Design – Übungsfragen"
domain: "einstein-discovery"
quiz:
  - id: "einstein-discovery-index-1"
    q: "Eine Geschichte und ein Modell unterscheiden sich darin:"
    options:
      - "Eine Geschichte ist ein Chart"
      - "Eine Geschichte ist die Analyse dessen, was mit einem Ergebnis korreliert; ein Modell ist eine eingesetzte Geschichte, die Datensätze erzielt."
      - "Ein Modell ist weniger genau"
      - "Sie sind die gleiche Sache"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-index-2"
    q: "Warum muss eine eingesetzte Vorhersage ihre wichtigsten Faktoren tragen?"
    options:
      - "Compliance erfordert es"
      - "Eine bloße Wahrscheinlichkeit gibt einer Wiederholung nichts zu tun und wird innerhalb eines Monats ignoriert"
      - "Es verbessert die Genauigkeit"
      - "Es reduziert die Rechenkosten"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-what-a-story-is-1"
    q: "Eine Geschichte berichtet, dass \"Rabatt über 30%\" mit Verlust verbunden ist. Dies bedeutet:"
    options:
      - "Diskontierung verursacht Verluste"
      - "Deals mit schweren Rabatten, die häufiger verloren gehen - die Richtung der Ursache wird nicht durch die Geschichte festgelegt"
      - "Rabatte sollten verboten werden"
      - "Das Modell ist kaputt"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-what-a-story-is-2"
    q: "Ein Faktor, der an der Spitze einer Geschichte erscheint, ist:"
    options:
      - "Notwendigerweise das umsetzbarste"
      - "Die am stärksten mit dem Ergebnis verbunden ist, die nicht das gleiche wie die nützlichste zu handeln"
      - "Garantiert kausal"
      - "Ein Datenfehler"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-preparing-data-1"
    q: "Training auf \"Closed Won\" einschließlich Erneuerungen lehrt das Modell, dass:"
    options:
      - "Erneuerungen sind wertvoll"
      - "Der beste Prädiktor für den Gewinn ist bereits ein Kunde - was wahr und nutzlos ist"
      - "Nichts; Erneuerungen sind neutral"
      - "New Business ist riskanter"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-preparing-data-2"
    q: "Leckage bedeutet:"
    options:
      - "Datenverlust während der Synchronisierung"
      - "Ein Feld, das bei oder nach dem Ergebnis aufgezeichnet wurde und es fast perfekt vorhersagt und nicht verfügbar ist, wenn Sie die Vorhersage benötigen"
      - "Eine Sicherheitsverletzung"
      - "Doppelte Zeilen"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-preparing-data-3"
    q: "Der Schwerpunkt des Trainingsdatensatzes sollte sein:"
    options:
      - "So fein wie möglich"
      - "Eine Zeile pro Sache, die Sie punkten möchten - eine Chance, ein Konto, ein Lead"
      - "Aggregiert monatlich"
      - "Was auch immer das Rezept bereits produziert"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-reading-a-story-honestly-1"
    q: "3% der Leads konvertieren. Ein Modell, das \"Nein\" für alles vorhersagt, ist:"
    options:
      - "Nutzlos und 3% genau"
      - "97% genau und nutzlos - weshalb Genauigkeit allein das falsche Maß für ein seltenes Ergebnis ist"
      - "Unmöglich"
      - "Die richtige Baseline zum Deployment"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-reading-a-story-honestly-2"
    q: "Die erste Frage, die man sich von einer beeindruckenden Genauigkeitszahl stellen muss, ist:"
    options:
      - "Wie groß war der Datensatz?"
      - "Was würde ein trivialer Baseline-Score - immer die Mehrheitsklasse vorhersagen?"
      - "Welcher Algorithmus wurde verwendet?"
      - "Wie lange hat es gedauert zu trainieren?"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-reading-a-story-honestly-3"
    q: "Die Genauigkeit eines Modells driftet über ein Jahr nach unten. Die wahrscheinlichste Ursache ist:"
    options:
      - "Ein Software Bug"
      - "Das Geschäft hat sich verändert - neue Produkte, neue Segmente, eine andere Verkaufsbewegung - und die Trainingsdaten beschreiben es nicht mehr"
      - "Der Datensatz schrumpfte"
      - "Zu viele Nutzer"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-deploying-and-write-back-1"
    q: "Wo sollte eine eingesetzte Vorhersage erscheinen?"
    options:
      - "Nur auf einem Analytics-Dashboard"
      - "Wo die Arbeit stattfindet - die Datensatzseite, die die Person bereits öffnet"
      - "In einer wöchentlichen E-Mail"
      - "Nur im Datensatz"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-deploying-and-write-back-2"
    q: "Was muss mit dem Score reisen?"
    options:
      - "Die Ausbildungsdaten"
      - "Die wichtigsten Faktoren dahinter, also gibt es eine nächste Aktion"
      - "Der Name des Algorithmus"
      - "Nichts anderes"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-deploying-and-write-back-3"
    q: "Nach dem Einsatz ist die wesentliche laufende Aufgabe:"
    options:
      - "Umschulung wöchentlich unabhängig"
      - "Überwachung, ob das Modell noch Vorhersagen macht und ob jemand danach handelt"
      - "Die Genauigkeit der Punktzahl erhöhen"
      - "Hinzufügen weiterer Faktoren"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-auditing-a-score-1"
    q: "Die Conversion Rate nach Scoreband ist flach. Die Punktzahl lautet:"
    options:
      - "Arbeiten wie vorgesehen"
      - "Keine Konversion vorhersagen - es ist eine Zahl ohne Anspruch dahinter"
      - "Fehlkalibriert, aber nützlich"
      - "Zu granuliert"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-auditing-a-score-2"
    q: "Der wesentliche Vergleich in einem Score Audit ist gegen:"
    options:
      - "Ein komplexeres Modell"
      - "Eine triviale Baseline - ein Feld, das Sie bereits hatten, wie Lead Source"
      - "Ergebnis des letzten Jahres"
      - "Die vom Verkäufer veröffentlichte Genauigkeit"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-auditing-a-score-3"
    q: "Eine Scoreband mit neun Leads zeigt 60% Conversion. Dies ist:"
    options:
      - "Starke Beweise dafür, dass die Punktzahl funktioniert"
      - "Fast sicher Lärm - Preise brauchen ihre Volumina neben ihnen"
      - "Nachweis eines Schwellenwerteffekts"
      - "Ein Datenfehler"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-1"
    q: "Eine Geschichte ist:"
    options:
      - "Ein eingesetztes Modell"
      - "Die Analyse, was mit einem Ergebnis korreliert"
      - "Eine Dashboard-Vorlage"
      - "Ein narratives Widget"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-2"
    q: "Training auf Closed Won einschließlich Erneuerungen lehrt das Modell, dass:"
    options:
      - "Erneuerungen sind wertvoll"
      - "Der beste Prädiktor für den Gewinn ist bereits ein Kunde - wahr und nutzlos"
      - "New Business ist riskanter"
      - "Nichts Nützliches kann gelernt werden"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-3"
    q: "Leckage ist:"
    options:
      - "Datenverlust im Sync"
      - "Ein Feld, das bei oder nach dem Ergebnis aufgezeichnet wurde und nicht verfügbar ist, wenn eine Vorhersage erforderlich ist"
      - "Doppelte Zeilen"
      - "Ein Sicherheitsproblem"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-4"
    q: "3% der Leads konvertieren. Ein Modell, das \"Nein\" für alle voraussagt, ist:"
    options:
      - "3% genau"
      - "97% genau und nutzlos"
      - "Ungültig"
      - "Die richtige Baseline für das Schiff"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-5"
    q: "Das Getreide des Trainingsdatensatzes sollte:"
    options:
      - "So fein wie möglich"
      - "Eine Reihe pro Sache, die Sie punkten möchten"
      - "Monatliche Aggregate"
      - "Was auch immer das Rezept produziert"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-6"
    q: "Der bereitgestellten Vorhersage sind Folgendes beizufügen:"
    options:
      - "Die Ausbildungsdaten"
      - "Seine Top-Faktoren"
      - "Der Name des Algorithmus"
      - "Nichts"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-7"
    q: "Die Conversion-Rate nach Scoreband steigt dann über 70 ab. Dies bedeutet die Punktzahl:"
    options:
      - "Funktioniert perfekt"
      - "Trennt schlecht vom Durchschnitt und sagt nichts über die Spitze - wo das Team seine Zeit verbringt"
      - "Invertiert"
      - "Braucht mehr Bands"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-8"
    q: "Der wesentliche Vergleich beim Auditing einer Punktzahl ist gegen:"
    options:
      - "Ein komplexeres Modell"
      - "Eine triviale Baseline wie ein Feld, das Sie bereits hatten"
      - "Antrag des Verkäufers"
      - "Ergebnis des letzten Quartals"
    answer: 1
    topic: "einstein-discovery"
---

Übungsfragen für die Einstein Discovery Story Design Domain des CRM Analytics und Einstein Discovery Beraterprüfung.
