---
title: "Datenebene — praktische Fragen"
domain: "data-layer"
quiz:
  - id: "foundations-index-1"
    q: "Was ist das stärkste Argument für CRM Analytics Über ein Allzweck-BI-Tool?"
    options:
      - "Die Charts sehen besser aus"
      - "Er erbt Salesforce's Sharing und Sicherheitsmodell, also wer sieht, was bereits gelöst ist"
      - "Es ist billiger"
      - "Es ist das einzige Werkzeug, das lesen kann Salesforce Daten"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-2"
    q: "Ein Datensatz in CRM Analytics am besten beschrieben als:"
    options:
      - "Ein Live View über Salesforce Objekte"
      - "Eine materialisierte, säulenförmige Momentaufnahme, die nach Zeitplan wieder aufgebaut wurde"
      - "Ein gespeicherter Bericht"
      - "A SQL Tabelle, auf die Sie schreiben können"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-3"
    q: "Ihr VP möchte einen Bildschirm, auf dem die Tiefe der Call-Center-Warteschlangen alle paar Sekunden aktualisiert wird. Ist CRM Analytics Das richtige Tool?"
    options:
      - "Ja, mit einem schnell genug Rezept Zeitplan"
      - "Nein - es aktualisiert sich nach einem Zeitplan, nicht nach einem Stream; dies ist ein operatives Bedürfnis, kein analytisches"
      - "Ja, wenn Sie Einstein Discovery"
      - "Nur mit einer Plus-Lizenz"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-1"
    q: "Welche Schicht besitzt die Definition von \"qualifizierter Pipeline\"?"
    options:
      - "Die Designebene, denn dort wird die Nummer angezeigt"
      - "Die Datenschicht, da eine Metrik, die pro-Dashboard definiert ist, eine Metrik ist, werden zwei Dashboards nicht zustimmen"
      - "Die Intelligence Layer"
      - "Welches Team zuerst fragt"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-2"
    q: "Ein Dashboard ist langsam. Welche Schicht sollten Sie zuerst vermuten?"
    options:
      - "Die Designschicht - zu viele Widgets"
      - "Die Datenschicht - ein Datensatz am falschen Korn, der jedes Widget zwingt, Millionen von Zeilen zu aggregieren"
      - "Die Intelligence Layer"
      - "Das Netz"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-3"
    q: "Einstein Discovery produziert ein Modell, das 78% genau ist. Was schuldet die Intelligenzschicht der Designschicht?"
    options:
      - "Nur die Vorhersage"
      - "Die Vorhersage, das Vertrauen und die wichtigsten Faktoren - eine Punktzahl ohne Grund kann nicht berücksichtigt werden"
      - "Die Ausbildungsdaten"
      - "Nichts; Genauigkeit ist genug"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-1"
    q: "Was bedeutet \"das Korn\" eines Datensatzes?"
    options:
      - "Wie viele Daten es enthält"
      - "Was genau eine Zeile darstellt"
      - "Wie oft erfrischt es sich"
      - "Welche Bereiche sind Maßnahmen"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-2"
    q: "Sie verbinden Opportunities (608 Zeilen) zu Opportunity products (1,192 Zeilen) und summieren den Betrag. Was passiert?"
    options:
      - "Nichts – die Summe ist richtig"
      - "Der Betrag wird einmal pro Produktlinie gezählt, so dass der Gesamtumsatz aufgeblasen ist - hier verdreifacht er sich fast"
      - "Der Join scheitert"
      - "Nur übereinstimmende Zeilen werden summiert, so dass die Einnahmen sinken"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-3"
    q: "Warum enthält ein Datensatz eine Geschichte, die Salesforce Objekt nicht?"
    options:
      - "Salesforce Alte Datensätze löschen"
      - "Jeder Durchlauf kann zu diesem Zeitpunkt eine Momentaufnahme des Zustands anhängen, während das Objekt immer nur seine aktuellen Werte behält."
      - "Datasets werden gesichert"
      - "Es ist nicht"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-1"
    q: "Was ist Data Sync (Replikation)?"
    options:
      - "Daten zurückschreiben an Salesforce"
      - "Halten Sie eine lokale Kopie ausgewählter Objekte und Felder aktuell, so dass Rezepte daraus gelesen werden, anstatt bei jedem Durchlauf auf die Quelle zu treffen"
      - "Planungs-Dashboards"
      - "Verschlüsselung von Datensätzen"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-2"
    q: "Ein Rezeptlauf scheitert. Wo schauen Sie hin?"
    options:
      - "Der Armaturenbrett-Inspektor"
      - "Data Manager → Monitor"
      - "Setup → Analytics → Einstellungen"
      - "Feldattribute des Datasets"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-3"
    q: "Warum ist der Integrationsbenutzer so wichtig?"
    options:
      - "Es besitzt die Dashboards"
      - "Sync läuft als dieser Benutzer, so dass jedes Objekt oder Feld, das es nicht sehen kann, einfach nie ankommt - ohne Fehler auf dem Dashboard"
      - "Es zahlt für die Lizenz"
      - "Es plant die Rezepte"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-1"
    q: "Eine \"App\" in CRM Analytics ist:"
    options:
      - "Eine installierte Anwendung"
      - "Ein Container für Datasets, Objektive und Dashboards mit den Sharing-Einstellungen"
      - "Eine mobile Erfahrung"
      - "Ein Managed Package"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-2"
    q: "Was ist der praktische Unterschied zwischen einem Objektiv und einem Armaturenbrett?"
    options:
      - "Lenses kann nicht gerettet werden"
      - "Ein Objektiv erforscht einen Datensatz und ist ein Einweg-Arbeitsraum; ein Dashboard stellt viele Abfragen zusammen, stellt sie zusammen und ist für andere Menschen gebaut"
      - "Dashboards können nicht verwendet werden SAQL"
      - "Keine"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-3"
    q: "In Einstein DiscoveryEine \"Geschichte\" ist:"
    options:
      - "Ein eingesetztes Modell"
      - "Die Analyse dessen, was mit einem Ergebnis korreliert, das dann als Modell eingesetzt werden kann"
      - "Eine Dashboard-Vorlage"
      - "Ein narratives Text-Widget"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-1"
    q: "Ein Stakeholder fragt nach einem Dashboard, das \"in Echtzeit\" aktualisiert wird. Was ist der richtige erste Schritt?"
    options:
      - "Planen Sie das Rezept stündlich und nennen Sie es Echtzeit"
      - "Fragen Sie, welche Entscheidung daraus getroffen wird und wie abgestanden es sein kann, bevor es nutzlos ist - die Antwort wird normalerweise in Stunden gemessen"
      - "Ablehnung des Antrags"
      - "Verwendung Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-2"
    q: "Die meisten Daten des Unternehmens befinden sich in einem Lager; Salesforce hält nur Konten und Möglichkeiten. Was spricht dafür?"
    options:
      - "Verwendung CRM Analytics und synchronisieren das Lager in"
      - "Sie bauen ein Lagerprojekt mit einem CRM-Anhang - ein BI-Tool auf dem Lager wird wahrscheinlich besser dienen"
      - "Verwendung Salesforce Berichte"
      - "Verwendung Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-1"
    q: "Warum öffnet sich dieses Dashboard mit einer einzigen ARR-Gesamtnummer?"
    options:
      - "Um den Raum oben zu füllen"
      - "Ein Zuschauer, der nichts anderes liest, geht immer noch mit der Überschrift, um die es auf dem Bildschirm geht."
      - "Weil Zahl Widgets am schnellsten laden"
      - "Es ist erforderlich durch Salesforce"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-2"
    q: "Ein Klick auf eine Segmentleiste filtert die beiden anderen Widgets. Warum?"
    options:
      - "Eine Bindung wurde konfiguriert"
      - "Widgets, die auf demselben Datensatz aufgebaut sind, facetten sich standardmäßig gegenseitig"
      - "Die Tabelle ist ein Kind des Charts"
      - "Facettierung muss immer manuell eingeschaltet werden"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-3"
    q: "Die Top-Accounts-Tabelle zeigt 10 Zeilen anstatt alle 140. Der beste Grund ist:"
    options:
      - "Leistung"
      - "Die Frage ist Konzentration, und eine Tabelle, die niemand auf einen Blick aufnehmen kann, ist eher ein Datenexport als ein Dashboard."
      - "Tabellen sind auf 10 Zeilen begrenzt"
      - "Um die kleineren Konten zu verstecken"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-1"
    q: "Ein Datensatz in CRM Analytics ist:"
    options:
      - "Ein Live View über Salesforce Objekte"
      - "Eine materialisierte, säulenförmige Momentaufnahme, die nach Zeitplan wieder aufgebaut wurde"
      - "A gerettet Salesforce Bericht"
      - "Eine beschreibbare SQL Tisch"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-2"
    q: "Das stärkste Argument für CRM Analytics über ein Allzweck-BI-Tool ist:"
    options:
      - "Bessere Charts"
      - "Es erbt das Sharing- und Sicherheitsmodell der Organisation, anstatt Sie dazu zu bringen, es wieder aufzubauen."
      - "Geringere Lizenzkosten"
      - "Es ist die einzige Möglichkeit zu lesen Salesforce Daten"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-3"
    q: "Der Gesamtumsatz auf Ihrem Dashboard ist genau doppelt so hoch wie die Finanzberichte. Wahrscheinlichste Ursache:"
    options:
      - "Das Sicherheitsprädikat"
      - "Ein Join, der aufgefächert wurde - eine Elternmaßnahme, die sich über Kinderreihen hinweg wiederholte"
      - "Der Datensatz wurde nicht aktualisiert"
      - "Währungsformatierung"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-4"
    q: "Benutzer melden Datensätze, von denen sie wissen, dass sie existieren. Wo siehst du zuerst aus?"
    options:
      - "Die Widget-Abfragen des Dashboards"
      - "Der Zugriff des Integrationsbenutzers, dann das Sicherheitsprädikat"
      - "Der Charttyp"
      - "Das Farbthema der App"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-5"
    q: "Welche Schicht besitzt die Definition einer Metrik wie \"qualifizierte Pipeline\"?"
    options:
      - "Design — es wird dort angezeigt"
      - "Daten - eine Metrik, die pro Dashboard definiert ist, ist eins, zwei Dashboards werden sich nicht einig sein"
      - "Intelligenz"
      - "Welches Team zuerst fragt"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-6"
    q: "Wofür ist Data Sync?"
    options:
      - "Writing Analytics Ergebnisse zurück zu Salesforce"
      - "Halten Sie eine lokale Kopie ausgewählter Objekte und Felder aktuell, damit Rezepte nicht bei jedem Durchlauf die Quelle treffen"
      - "Dashboard-E-Mails planen"
      - "Verschlüsselung von Datensätzen im Ruhezustand"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-7"
    q: "Eine \"App\" in CRM Analytics ist:"
    options:
      - "Ein installiertes Paket"
      - "Ein Container für Datensätze, Objektive und Dashboards, der die Freigabeeinstellungen trägt"
      - "Ein mobiler Client"
      - "Eine Dashboard-Vorlage"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-8"
    q: "Ein Rezept läuft jede Nacht erfolgreich, aber die Daten sind immer einen Tag alt. Die wahrscheinlichste Ursache ist:"
    options:
      - "Der Datensatz ist korrupt"
      - "Das Rezept ist geplant, bevor die Daten synchronisieren, es hängt von Oberflächen ab"
      - "Faceting ist behindert"
      - "Dem Integrationsbenutzer fehlt der Zugriff"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-9"
    q: "Ihr Stakeholder benötigt alle paar Sekunden einen Bildschirm, der für eine Live-Call-Warteschlange aktualisiert wird. Sie sollten:"
    options:
      - "Planen Sie das Rezept so oft wie möglich"
      - "Sagen Sie, dies ist eine operative Anforderung, keine analytische und zeigen Sie auf eine Salesforce Seite oder zweckgerichtetes Tooling"
      - "Verwendung Einstein Discovery"
      - "Erstellen Sie es und fügen Sie einen Refresh-Button hinzu"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-10"
    q: "Einstein Discovery ein Modell einsetzt, das Chancen bewertet. Was muss mit dem Score ausgeliefert werden?"
    options:
      - "Der Ausbildungsdatensatz"
      - "Die Top-Faktoren dahinter - eine bloße Wahrscheinlichkeit gibt einer Wiederholung nichts zu tun"
      - "Die SAQL Abfrage"
      - "Nichts anderes"
    answer: 1
    topic: "foundations"
  - id: "data-preparation-index-1"
    q: "Welches davon ist KEIN Weg, Daten zu einem CRM Analytics Datensatz?"
    options:
      - "A CSV Upload"
      - "Datensync von Salesforce Objekte, transformiert durch ein Rezept"
      - "Eine Live-Abfrage, die von einem Dashboard-Widget ausgegeben wird"
      - "Eine externe Verbindung zu einem Lager, synchronisiert und transformiert"
    answer: 2
    topic: "data-preparation"
  - id: "data-preparation-index-2"
    q: "Bevor Sie ein Rezept erstellen, sollten Sie Folgendes angeben können:"
    options:
      - "Die Charttypen, die Sie verwenden werden"
      - "Was genau eine Zeile des Ausgabedatensatzes darstellt"
      - "Farbthema des Dashboards"
      - "Wie viele Benutzer werden es sehen"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-1"
    q: "Warum lesen Rezepte von synchronisierten Daten statt von der Quelle in jedem Lauf?"
    options:
      - "Rezepte können nicht lesen Salesforce direkt"
      - "Eine lokale Kopie ist schneller und hämmert das Aufzeichnungssystem nicht bei jedem Durchlauf"
      - "Synchronisierte Daten sind genauer"
      - "Es ist eine Lizenzpflicht"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-2"
    q: "Ein Rezept gelingt nächtlich, zeigt aber immer die Daten von gestern. Die wahrscheinlichste Ursache ist:"
    options:
      - "Ein korrupter Datensatz"
      - "Das Rezept ist vor der Synchronisierung geplant, es hängt von Oberflächen ab"
      - "Dashboard-Cache"
      - "Dem Integrationsbenutzer fehlt der Zugriff"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-3"
    q: "Sie benötigen Monat für Monat Geschichte eines Feldes ab dem nächsten Quartal. Wann sollten Sie anfangen, es zu synchronisieren?"
    options:
      - "Nächstes Quartal, wenn es gebraucht wird"
      - "Jetzt kann sich ein Snapshot nur daran erinnern, was zu der Zeit synchronisiert wurde, und die Historie kann nicht von einem Objekt mit aktuellem Zustand aufgefüllt werden"
      - "Es spielt keine Rolle"
      - "Erst wenn das Rezept existiert"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-1"
    q: "Ein CloseDate-Feld wird als Text geladen. Was bricht?"
    options:
      - "Nichts; Textdaten funktionieren normal"
      - "Datumsfilter, Monatsgruppierungen und Trendlinien - und der Fix erfordert ein Reload"
      - "Nur die Rekordseite"
      - "Der Datensatz speichert nicht"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-2"
    q: "Warum numerisch aussehende IDs auf Dimensionen zwingen?"
    options:
      - "Platz sparen"
      - "Weil das Produkt als Maßnahmen getippt wird, um sie zu summieren, und schließlich akzeptiert jemand"
      - "Es ist erforderlich"
      - "Um sie filterbar zu machen"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-3"
    q: "Ihr hochgeladener Datensatz zeigt 607 Zeilen anstelle von 608. Höchstwahrscheinlich:"
    options:
      - "Ein Erlaubnisproblem"
      - "Ein Header-Row-Problem im CSV Parse"
      - "Ein Sicherheitsprädikat"
      - "Normale Rundung"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-1"
    q: "Woher sollten Bucket-Grenzen kommen?"
    options:
      - "Sogar Drittel des Bereichs"
      - "Das Geschäft - der Punkt, an dem jemand etwas anders macht"
      - "Die Quartile des Datensatzes, immer"
      - "Die Farbskala des Charts"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-2"
    q: "Bucketing in jedem Dashboard statt im Rezept führt zu:"
    options:
      - "Bessere Flexibilität"
      - "\"Groß\" bedeutet verschiedene Dinge auf verschiedenen Bildschirmen, wobei beide vertretbar sind"
      - "Schnellere Abfragen"
      - "Kleinere Datensätze"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-3"
    q: "Ein Wert genau auf einer Grenze – Nutzung von genau 55% – sollte sein:"
    options:
      - "Links zum Zufall"
      - "Durch eine explizite, schriftliche Regel zugewiesen, weil jemand es schließlich abfragen wird"
      - "Ausgenommen"
      - "Abgerundet"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-1"
    q: "Welcher Knotentyp verändert das Korn der Daten, die durch ihn fließen?"
    options:
      - "Filter"
      - "Joint und Aggregat"
      - "Formel"
      - "Output"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-2"
    q: "Sie benötigen eine Anzahl von Möglichkeiten pro Konto, das jeder Kontozeile beigefügt ist. Welcher Node?"
    options:
      - "Formel"
      - "Aggregieren auf Chancen nach Konto gruppiert, dann wieder auf Konten beitreten"
      - "Filter"
      - "Transform"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-3"
    q: "Warum ein großes Rezept in mehrere kleinere aufteilen?"
    options:
      - "Rezepte haben ein Hard Node Limit"
      - "Ein Fünfzig-Knoten-Rezept ist für jeden, der es nicht geschrieben hat, unlesbar, und das Scheitern stoppt die Lokalisierung"
      - "Kleinere Rezepte laufen schneller"
      - "Erforderlich für die Planung"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-1"
    q: "Warum ist der Durchschnitt der pro-Deal Diskontsätze in der Regel falsch?"
    options:
      - "Rundung"
      - "Es gewichtet einen $ 5.000 Deal genauso wie ein $ 2 Millionen - die richtige Zahl teilt den Gesamtrabatt durch den Gesamtlistenwert"
      - "Rabatte können nicht gemittelt werden"
      - "Das Feld ist Text"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-2"
    q: "Ein Verhältnis, das für zehn Dashboards benötigt wird, sollte berechnet werden:"
    options:
      - "In jedem Widget, damit jedes Team es anpassen kann"
      - "Einmal im Rezept, so dass alle zehn durch die Konstruktion übereinstimmen"
      - "In einer Tabelle"
      - "durch Einstein Discovery"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-3"
    q: "Welche Berechnung gehört wirklich in das Dashboard und nicht in das Rezept?"
    options:
      - "Eine unternehmensweite metrische Definition"
      - "Eine, die von der aktuellen Filterauswahl des Betrachters abhängt"
      - "Währungsumrechnung"
      - "Ein Bucketed Segment"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-1"
    q: "Füllen einer leeren Menge mit Null ist:"
    options:
      - "Immer richtig"
      - "Ein Anspruch - es behauptet, dass der Deal nichts wert ist, was sich jeden darauf aufbauenden Durchschnitt ändert"
      - "Vor der Aggregation erforderlich"
      - "Eine reine Display-Option"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-2"
    q: "Nur 44% der geschlossenen Fälle haben eine CSAT-Umfrage. Der durchschnittliche CSAT ist:"
    options:
      - "Falsch"
      - "Richtig, aber es beschreibt die Befragten und nicht die Kunden - so wird es mit der Antwortrate daneben ausgeliefert"
      - "Unbrauchbar"
      - "Verbessert durch Zurechnung der fehlenden Scores"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-3"
    q: "\"Ökonomisches Käuferfeld ist leer\" prognostiziert Verlust. Die wahrscheinlichste Erklärung ist:"
    options:
      - "Leere Felder verursachen Verluste"
      - "Ein ausgerückter Vertreter füllt keine Felder aus - der Leerwert ist ein Symptom, keine Ursache"
      - "Das Feld ist gebrochen"
      - "Zufall"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-1"
    q: "Der Umsatz hat sich verdoppelt, nachdem Sie einen Join hinzugefügt haben. Die Duplikate sind:"
    options:
      - "Echte doppelte Datensätze zu löschen"
      - "Ein Join-Artefakt - der Fix ist der Join, kein Deduplizierungsschritt"
      - "Ein Dateneingabeproblem"
      - "Verursacht durch Nullen"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-2"
    q: "Ein Account erscheint 18 Mal in arr snapshots. Dies ist:"
    options:
      - "Ein Duplikat zum Entfernen"
      - "Das beabsichtigte Getreide — eine Zeile pro Konto und Monat"
      - "Ein Lastausfall"
      - "Ein Sync-Fehler"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-3"
    q: "Wenn echte Duplikate zusammenbrechen, welche Zeile sollte überleben?"
    options:
      - "Was zuerst erscheint"
      - "Eine, die durch eine explizite Regel ausgewählt wurde - zuletzt geändert, vollständig oder aus der bevorzugten Quelle"
      - "Eine zufällige Zeile"
      - "Der mit der niedrigsten ID"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-1"
    q: "Ein Dashboard zeigt eine falsche Gesamtsumme an. Wo schaust du zuerst hin?"
    options:
      - "Die Diagrammkonfiguration des Widgets"
      - "Data Manager → Monitor: Ist es gelaufen, wann und wie viele Zeilen"
      - "Die App Sharing Einstellungen"
      - "Die Browserkonsole"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-2"
    q: "Die Anzahl der Zeilen fiel von 2.800 auf 2.100 nach einer Änderung, die Sie nicht vorgenommen haben. Höchstwahrscheinlich:"
    options:
      - "Normale Variation"
      - "Ein Upstream-Filter, eine innere Verknüpfung oder eine Berechtigungsänderung, die Datensätze abgibt"
      - "Ein Chartlimit"
      - "Rundung"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-3"
    q: "Der schnellste Weg, ein Getreideproblem in einem Rezept zu lokalisieren, ist:"
    options:
      - "Wiederlesen des SAQL"
      - "Klicken Sie durch Node Previews und beobachten Sie, wo sich die Zeilenzahl ändert"
      - "Rekonstruktion des Rezepts"
      - "Ausfuhr nach CSV"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-1"
    q: "Wofür ist Data Sync?"
    options:
      - "Writing Analytics Ergebnisse zurück zu Salesforce"
      - "Halten Sie eine lokale Kopie ausgewählter Objekte und Felder aktuell, so dass Rezepte nicht bei jedem Durchlauf die Quelle treffen"
      - "Dashboard-E-Mails planen"
      - "Verschlüsselung von Datensätzen"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-2"
    q: "Ein Rezept läuft nachts grün, aber die Daten sind immer einen Tag alt. Ursache:"
    options:
      - "Ein korrupter Datensatz"
      - "Das Rezept wird vor der Synchronisierung geplant, von der es abhängt"
      - "Dashboard Caching"
      - "Ein abgestandenes Prädikat"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-3"
    q: "Ein als Text geladenes CloseDate verhindert:"
    options:
      - "Nichts"
      - "Datumsfilter, Monatsgruppierungen und Trendlinien"
      - "Sortierung"
      - "Beitritt"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-4"
    q: "Warum numerisch aussehende IDs auf Dimensionen beim Laden zwingen?"
    options:
      - "Platz sparen"
      - "Weil das Produkt als Maßnahmen getippt wird, um sie zu summieren, und schließlich akzeptiert jemand"
      - "Es ist erforderlich"
      - "Um sie filterbar zu machen"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-5"
    q: "Bucket Grenzen sollten kommen aus:"
    options:
      - "Sogar Drittel des Bereichs"
      - "Das Geschäft - der Punkt, an dem jemand etwas anders macht"
      - "Die Quartile des Datensatzes, immer"
      - "Die Chartpalette"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-6"
    q: "Bucketing in jedem Dashboard statt im Rezept führt zu:"
    options:
      - "Mehr Flexibilität"
      - "\"Groß\" bedeutet verschiedene Dinge auf verschiedenen Bildschirmen, beide vertretbar"
      - "Schnellere Abfragen"
      - "Kleinere Datensätze"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-7"
    q: "\"Durchschnittsrabatt\", berechnet als Mittelwert der Per-Deal-Raten, ist falsch, weil:"
    options:
      - "Rabatte sind nicht numerisch"
      - "Es gewichtet jeden Deal unabhängig von der Größe gleich"
      - "Nullen sind ausgeschlossen"
      - "Es braucht eine bestimmte Zählung"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-8"
    q: "Füllen einer leeren Menge mit Null ist:"
    options:
      - "Immer richtig"
      - "Ein Anspruch - es behauptet, dass der Deal nichts wert ist, und es zieht jeden darauf aufgebauten Durchschnitt"
      - "Vor der Aggregation erforderlich"
      - "Eine reine Display-Option"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-9"
    q: "Der Umsatz verdoppelte sich nach dem Hinzufügen eines Joins. Die \"Duplikate\" sind:"
    options:
      - "Echte doppelte Datensätze zu löschen"
      - "Ein Join-Artefakt - der Fix ist der Join, kein Deduplizierungsschritt"
      - "Ein Dateneingabeproblem"
      - "Verursacht durch Nullen"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-10"
    q: "Der schnellste Weg, eine falsche Nummer in einem Rezept zu lokalisieren, ist:"
    options:
      - "Lesen der SAQL"
      - "Gehen Sie die Knotenvorschau und beobachten Sie, wo sich die Zeilenzahl ändert"
      - "Rebuilding des Datasets"
      - "App-Sharing überprüfen"
    answer: 1
    topic: "data-preparation"
  - id: "datasets-and-modelling-index-1"
    q: "Was bestimmt am meisten, welche Fragen ein Datensatz beantworten kann?"
    options:
      - "Seine Zeilenzahl"
      - "Sein Korn - was eine Reihe darstellt"
      - "Die Charttypen, die darauf verwendet werden"
      - "Der Aktualisierungsplan"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-index-2"
    q: "Ein voraggregierter Datensatz zu monatlichen Gesamtwerten ist:"
    options:
      - "Streng besser - es ist schneller"
      - "Schneller und dauerhaft nicht in der Lage, Fragen unter diesem Getreide zu beantworten"
      - "Entspricht einem feinkörnigen"
      - "Nur für Exporte nützlich"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-1"
    q: "Die Verbindung von 608 Möglichkeiten zu 1.192 Produktlinien ergibt 1.192 Zeilen. Ist das ein Bug?"
    options:
      - "Ja, der Join ist falsch konfiguriert"
      - "Nein - das ist es, was ein one-to-many join tut. Der Bug summiert den Betrag des Elternteils danach"
      - "Ja, Zeilen sollten niemals erhöht werden"
      - "Nur wenn die Schlüssel Text sind"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-2"
    q: "Welcher Fix hält die Details auf Produktebene verfügbar?"
    options:
      - "Aggregieren der Posten vor der Verknüpfung"
      - "Halten Sie die Linie Korn und nicht tragen die Eltern Menge nach unten, summieren Sie stattdessen LineAmount"
      - "Filtern auf ein Produkt pro Deal"
      - "Verwendung einer inneren Verbindung"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-3"
    q: "Eine Summe ist genau 3x, was Sie erwarten. Was vermuten Sie?"
    options:
      - "Ein Sicherheitsprädikat"
      - "Ein Fan-out - eine Elternmaßnahme, die sich über jeweils etwa drei Kinderreihen wiederholt"
      - "Ein veralteter Datensatz"
      - "Währungsumrechnung"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-4"
    q: "Der beste Weg, um eine verdächtige Summe zu untersuchen, ist:"
    options:
      - "Überprüfen Sie die Diagrammkonfiguration"
      - "Filtern Sie nach unten zu einer einzigen Entität und zählen Sie die Zeilen von Hand"
      - "Bauen Sie das Dashboard neu auf"
      - "Erhöhen Sie das Zeilenlimit"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-1"
    q: "Der richtige Ausgangspunkt für das Entwerfen eines Datensatzes ist:"
    options:
      - "Die Quellentabellen verfügbar"
      - "Die Fragen, die es beantworten muss, aufgeschrieben"
      - "Die geplanten Charttypen"
      - "Der Aktualisierungsplan"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-2"
    q: "Ein Datensatz, der zwei Zielgruppen mit unterschiedlichen Körnern bedient, sollte normalerweise:"
    options:
      - "Kompromiss bei einem mittleren Korn"
      - "Seien Sie zwei Datensätze, oft aus einem Rezept mit zwei Ausgängen"
      - "Verwenden Sie das feinste Korn"
      - "Gefiltert werden pro Viewer"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-3"
    q: "Ein Filter, der im Dataset und nicht im Dashboard angewendet wird, ist richtig, wenn:"
    options:
      - "Es ist schneller"
      - "Die ausgeschlossenen Zeilen sollten niemals in irgendeiner Frage erscheinen, die dieser Datensatz beantwortet"
      - "Zuschauer möchten es vielleicht ändern"
      - "Immer"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-1"
    q: "Eine Referenztabelle wie accounts.csv ist gekennzeichnet durch:"
    options:
      - "Die meisten Zeilen haben"
      - "Angeschlossen zu sein, anstatt aggregiert zu werden - alles darin zusammenzufassen, ist normalerweise ein Fehler"
      - "Ändern am häufigsten"
      - "Keine Schlüssel haben"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-2"
    q: "Langformat (eine Zeile pro Entität pro Metrik) ist vorzuziehen, wenn:"
    options:
      - "Es gibt nur wenige Metriken, die sich nie ändern"
      - "Metriken werden oft hinzugefügt, oder Sie möchten viele von ihnen mit einem Widget kartieren"
      - "Speicherplatz ist begrenzt"
      - "nie"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-3"
    q: "Ein abgeleiteter Datensatz, der auf den Outputrisiken eines anderen Datensatzes aufbaut:"
    options:
      - "Nichts"
      - "Eine Planungskette, bei der ein Fehler drei Links zurück am Ende unsichtbar ist"
      - "Verlust von Sicherheit"
      - "Doppelte Spalten"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-1"
    q: "Warum können Sie ein Pipeline-Bewegungs-Dashboard nicht allein aus dem Opportunity-Objekt erstellen?"
    options:
      - "Das Objekt ist zu groß"
      - "Es hält nur aktuelle Werte - es gibt keine Aufzeichnungen darüber, was die Stufe oder der Betrag im letzten Monat war"
      - "Chancen können nicht synchronisiert werden"
      - "Sie können; es ist eingebaut in"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-2"
    q: "Cohorting führt nach Conversion-Datum statt Erstellungsdatum produziert:"
    options:
      - "Ein genaueres Bild"
      - "Eine verzerrte - die jüngsten Kohorten sehen unmöglich aus und die alten sehen schrecklich aus, während beide Zahlen einzeln korrekt sind"
      - "Kein Unterschied"
      - "Ein Fehler im Rezept"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-3"
    q: "Ein Snapshot-Datensatz fügt den aktuellen Zustand jedes Laufs hinzu. Was bedeutet das für ein Feld, das Sie heute synchronisieren?"
    options:
      - "Seine Geschichte wird automatisch hinterfüllt"
      - "Es hat keine Geschichte vor heute und wird niemals"
      - "Es kann nicht snapshotted werden"
      - "Die Geschichte stammt aus dem Audit-Log"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-1"
    q: "Wo sollte das Display-Label eines Feldes eingestellt werden?"
    options:
      - "In jedem Widget"
      - "Auf den Feldmetadaten des Datensatzes, so dass jedes Objektiv und Widget es erbt"
      - "In der Rezeptformel"
      - "In den App-Einstellungen"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-2"
    q: "Ein Währungsmaß zeigt sechs Dezimalstellen auf jedem Dashboard an. Die effiziente Lösung ist:"
    options:
      - "Formatieren Sie jedes Widget"
      - "Legen Sie das Format einmal im Dataset-Feld fest"
      - "Round it in SAQL"
      - "Ändern Sie den Chart-Typ"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-1"
    q: "Die Verbindung von 608 Möglichkeiten zu 1.192 Produktlinien ergibt 1.192 Zeilen. Der Bug ist:"
    options:
      - "Der Join selbst"
      - "Summieren des Elternbetrags danach, der sich nun pro Zeile wiederholt"
      - "Mit einem Lookup statt inner"
      - "Es gibt keinen Bug"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-2"
    q: "Der Fix, der die Details auf Produktebene speichert, ist:"
    options:
      - "Aggregierte Posten vor dem Zusammenschluss"
      - "Halten Sie die Linie Korn und Summe LineAmount statt der Elternmenge"
      - "Filtern Sie auf ein Produkt pro Deal"
      - "Verwenden Sie einen inneren Join"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-3"
    q: "Das Getreide eines Datensatzes sollte abgeleitet werden aus:"
    options:
      - "Die Quellentabellen"
      - "Die beste Frage, die es beantworten muss"
      - "Die Charttypen"
      - "Das Zeilenlimit"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-4"
    q: "Die Zusammenfassung der ARR über alle Zeilen eines 18-monatigen Snapshots ergibt:"
    options:
      - "Unternehmen ARR"
      - "Rund achtzehn Jahre Umsatz"
      - "ARR pro Konto"
      - "Ein Fehler"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-5"
    q: "Ein Feld, das Sie heute synchronisieren, hat:"
    options:
      - "Hinterfüllte Geschichte"
      - "Keine Geschichte vor heute, dauerhaft"
      - "Historie aus dem Prüfpfad"
      - "Geschichte nach dem nächsten Wiederaufbau"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-6"
    q: "Summieren einer Spalte in einer Referenztabelle wie Konten ist:"
    options:
      - "Standardpraxis"
      - "Normalerweise ein Fehler - Referenztabellen sind verbunden, nicht aggregiert"
      - "Erforderlich für ARR"
      - "Schneller als ein Faktentisch"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-7"
    q: "Der charakteristische Fehler des Long-Formats ist:"
    options:
      - "Langsame Abfragen"
      - "Eine Abfrage, die vergisst, zu einer Metrik zu filtern, indem sie stillschweigend über nicht verwandte Metriken summiert"
      - "Fehlende Schlüssel"
      - "Doppelte Einheiten"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-8"
    q: "Ein Feld Auslastungsprozentsatz mit einer Standardaggregation der Summe ergibt:"
    options:
      - "Korrekte Summen"
      - "960% über ein Jahr, sauber gemacht"
      - "Ein Fehler"
      - "Nullen"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-9"
    q: "Ein Filter, der innerhalb des Datensatzes angewendet wird, sollte dokumentiert werden, weil:"
    options:
      - "Es ist erforderlich"
      - "Es ist unsichtbar stromabwärts, so dass eine Versöhnung mit der Quelle ohne sichtbare Ursache abweichen wird"
      - "Es beeinflusst die Leistung"
      - "Zuschauer möchten es vielleicht ändern"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-10"
    q: "Der nützlichste einzelne Satz in der Beschreibung eines Datensatzes ist:"
    options:
      - "Wer hat es gebaut"
      - "Was eine Zeile repräsentiert"
      - "Wenn es sich erfrischt"
      - "In welcher App ist es"
    answer: 1
    topic: "datasets-and-modelling"
---

Übungsfragen für die Data Layer Domain des CRM Analytics und Einstein Discovery Beraterprüfung.
