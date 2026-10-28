---
title: "Implementierung des Analytics Dashboards – praktische Fragen"
domain: "dashboard-implementation"
quiz:
  - id: "saql-index-1"
    q: "SAQL's definierende Differenz von SQL ist:"
    options:
      - "Es hat keine Aggregatfunktionen"
      - "Es ist eine Stream-Transformation - jede Anweisung transformiert das vorherige Ergebnis, also ist die Anweisungsreihenfolge der Abfrageplan"
      - "Es kann nicht filtern"
      - "Es liest nur einen Datensatz"
    answer: 1
    topic: "saql"
  - id: "saql-index-2"
    q: "Der billigste Weg zu lernen SAQL ist:"
    options:
      - "Lesen der Funktion Referenz Ende zu Ende"
      - "Erstellen eines Diagramms durch Klicken und Lesen der Abfrage, die es gegen eine Antwort generiert hat, die Sie bereits kennen"
      - "Schreiben von Queries from scratch"
      - "Beispiele aus Foren kopieren"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-1"
    q: "Wie funktioniert SAQL unterscheiden sich vor allem von SQL?"
    options:
      - "Es kann nicht filtern"
      - "Es ist eine Stream-Transformation - jede Anweisung transformiert das Ergebnis der vorherigen, also ist Anweisung ORDER der Abfrageplan"
      - "Es hat keine Aggregatfunktionen"
      - "Es funktioniert nur mit einem Datensatz"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-2"
    q: "Sie wollen den Anteil jedes Segments am Gesamtumsatz. Warum ist das mit Klicks allein unangenehm?"
    options:
      - "Prozentsätze werden nicht unterstützt"
      - "Jede Zeile muss mit einem Aggregat aller Zeilen verglichen werden - zwei Aggregationsebenen in einer Abfrage"
      - "Segmente können nicht gruppiert werden"
      - "Es ist nicht peinlich"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-3"
    q: "Wohin gehört ein Filter in eine SAQL Suche nach bester Performance?"
    options:
      - "Am Ende, nach der Gruppierung"
      - "So früh wie möglich, damit weniger Daten durch die folgenden Aussagen fließen"
      - "Es spielt keine Rolle"
      - "Innerhalb des Foreach"
    answer: 1
    topic: "saql"
  - id: "saql-functions-1"
    q: "Um Deals in einem Dataset bei Line Item Grain zu zählen, verwenden Sie:"
    options:
      - "count()"
      - "unique('Chance) Id'"
      - "Summe(\"Betrag\")"
      - "avg()"
    answer: 1
    topic: "saql"
  - id: "saql-functions-2"
    q: "sum() über eine Spalte, die 40% null zurückgibt:"
    options:
      - "Null"
      - "Die Summe der nicht nullen Zeilen, ohne Hinweis darauf, dass der Rest übersprungen wurde"
      - "Null"
      - "Ein Fehler"
    answer: 1
    topic: "saql"
  - id: "saql-functions-3"
    q: "Was ist der sichere Weg, um zwei Aggregate zu teilen?"
    options:
      - "avg des Verhältnisses pro Zeile"
      - "sum(Nenner) / sum(Nenner), geschützt gegen einen Nullnenner"
      - "Entweder ist gleichwertig"
      - "Division wird nicht unterstützt"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-1"
    q: "Wohin sollte ein Filter für die beste Leistung gehen?"
    options:
      - "Nach der Gruppe wird also weniger gefiltert"
      - "So früh wie möglich, so weniger Zeilen fließen durch alles danach"
      - "Am Ende"
      - "Ordnung macht keinen Unterschied"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-2"
    q: "`filter q by 'Stage' != \"Closed Lost\"` auch entfernt:"
    options:
      - "Nichts anderes"
      - "Jede Zeile, in der Stage null ist"
      - "Geschlossene gewonnene Reihen"
      - "Zeilen aus anderen Datensätzen"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-3"
    q: "Ersetzen einer Null mit Null unter Verwendung von coalesce ist:"
    options:
      - "Immer sicher"
      - "Eine Behauptung - sie verwandelt \"unbekannt\" in \"keine\", was Durchschnittswerte ändert und falsch sein kann"
      - "Vor der Aggregation erforderlich"
      - "Nur Display-Auswahl"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-1"
    q: "Um den Anteil jedes Segments am Unternehmensumsatz zu berechnen, benötigen Sie:"
    options:
      - "Eine Gruppe nach Segment"
      - "Der Wert jeder Gruppe wird mit einem Aggregat aus ALLEN Zeilen verglichen - zwei Aggregationsebenen"
      - "Ein separates Dashboard"
      - "Eine Doppelachse"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-2"
    q: "Eine fensterförmige laufende Summe unterscheidet sich von einer einfachen Summe, weil:"
    options:
      - "Es ist schneller"
      - "Es sammelt sich über die geordneten Zeilen, anstatt sie auf einen Wert zu kollabieren"
      - "Es ignoriert Nullen"
      - "Es werden zwei Datensätze benötigt"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-3"
    q: "Ranking Reps innerhalb jeder Region erfordert das Fenster zu sein:"
    options:
      - "Über alle Zeilen"
      - "Partitioniert nach Region, so dass jede Region unabhängig von 1 rangiert"
      - "Nur sortiert"
      - "Gruppiert nach Rep"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-1"
    q: "Sie benötigen eine Metrik, die zwei Datensätze auf zehn Dashboards kombiniert. Wohin gehört die Kombination?"
    options:
      - "In jedem Widget SAQL"
      - "In einem Rezept, so dass alle zehn durch die Konstruktion übereinstimmen und es wird einmal berechnet"
      - "In einer Tabelle"
      - "Im Armaturenbrett JSON"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-2"
    q: "Die Kombination von zwei Strömen bei verschiedenen Körnern in einer Abfrage ergibt:"
    options:
      - "Ein Fehler"
      - "Das gleiche Fan-Out, das Sie in einem Rezept erhalten würden - eine Maßnahme, die über übereinstimmende Zeilen wiederholt wird"
      - "Ein korrektes Ergebnis automatisch"
      - "Nur Nullen"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-3"
    q: "Eine gute Verwendung einer Zwei-Stream-Abfrage ist:"
    options:
      - "Festlegung der Unternehmenseinnahmen"
      - "Ein Ad-hoc-Vergleich - Istwerte mit einer kleinen Zieltabelle - auf einem einzelnen Dashboard"
      - "Jeder Beitritt überhaupt"
      - "Ersetzen der Rezeptschicht"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-1"
    q: "Eine Abfrage gibt eine Zahl zurück, die durch ein sauberes Vielfaches zu hoch ist. Der Verdächtige ist:"
    options:
      - "Ein Filter"
      - "Eine Kombination, die Zeilen multipliziert, mit einem Maß, das danach summiert wird"
      - "Auftragserklärung"
      - "A null"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-2"
    q: "Der schnellste Weg, eine Abfrage zu verstehen, die das Falsche zurückgibt, ist:"
    options:
      - "Schreiben Sie es von Grund auf neu"
      - "Schneiden Sie es zurück zum Laden und fügen Sie eine Aussage nach der anderen hinzu, wobei Sie die Zeilenzahl nach jeder Überprüfung überprüfen"
      - "Fügen Sie weitere Filter hinzu"
      - "Wechsel zu einem anderen Charttyp"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-3"
    q: "Zahlen, die sich zwischen Läufen ohne Datenänderung ändern, bedeuten normalerweise:"
    options:
      - "Ein Caching Bug"
      - "Ein relativer Datumsbereich oder ein Fenster ohne explizite Anordnung"
      - "Ein Berechtigungsproblem"
      - "Ein Rendering Problem"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-1"
    q: "SAQL Erklärungen ausführen:"
    options:
      - "In der von einem Optimierer gewählten Reihenfolge"
      - "In der Reihenfolge geschrieben — jeder transformiert das vorherige Ergebnis"
      - "Parallel"
      - "Alphabetisch"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-2"
    q: "Ein Filter gehört dazu:"
    options:
      - "Nach der Gruppe"
      - "So früh wie möglich"
      - "Inside Foreach"
      - "Am Ende"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-3"
    q: "Bei Line-Item-Korn werden Deals gezählt mit:"
    options:
      - "count()"
      - "unique('Chance) Id'"
      - "Summe(\"Betrag\")"
      - "Median()"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-4"
    q: "sum() über eine Spalte, die 40% null zurückgibt:"
    options:
      - "Null"
      - "Die Summe der nicht null Zeilen, ohne Angabe der Rest übersprungen wurden"
      - "Null"
      - "Ein Fehler"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-5"
    q: "Der gewichtete Abzinsungssatz beträgt:"
    options:
      - "avg('DiscountPct')"
      - "sum('Discount') / sum('ListTotal'), geschützt gegen Null"
      - "Median('DiscountPct')"
      - "max('DiscountPct')"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-6"
    q: "`'Stage' != \"Closed Lost\"` auch entfernt:"
    options:
      - "Nichts anderes"
      - "Reihen, in denen Stage null ist"
      - "Geschlossene gewonnene Reihen"
      - "Zeilen aus anderen Datensätzen"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-7"
    q: "Ranking Reps innerhalb jeder Region benötigt das Fenster:"
    options:
      - "Über alle Zeilen"
      - "Teilung nach Regionen"
      - "Nur bestellt"
      - "Gruppiert nach Rep"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-8"
    q: "Eine laufende Summe ohne explizite Bestellung ist:"
    options:
      - "Geldbuße — Reihenfolge wird abgeleitet"
      - "Ein Bug, der bis zum nächsten Refresh stabil und dann leise anders ist"
      - "Unmöglich zu schreiben"
      - "Automatisch nach Datum sortiert"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-9"
    q: "Zwei Datensätze müssen für zehn Dashboards kombiniert werden. Dazu gehört:"
    options:
      - "In jedem Widget SAQL"
      - "In einem Rezept"
      - "Im Armaturenbrett JSON"
      - "In einer Tabelle"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-10"
    q: "Eine Summe, die durch ein sauberes Vielfaches hoch ist, schlägt vor:"
    options:
      - "Ein Null-Problem"
      - "Zeilenmultiplikation, mit einem übergeordneten Maß, das danach summiert wird"
      - "Ein Filter"
      - "Ein Tierkörperbeseitigungsproblem"
    answer: 1
    topic: "saql"
  - id: "interactions-index-1"
    q: "Zwei Widgets, die auf dem gleichen Datensatz aufgebaut sind. Standardmäßig klicken Sie auf eins:"
    options:
      - "Tut dem anderen nichts"
      - "Filtert die andere — gleiche Datensatz Widgets Facetten einander automatisch"
      - "Erfordert eine Bindung"
      - "Öffnet ein neues Objektiv"
    answer: 1
    topic: "interactions"
  - id: "interactions-index-2"
    q: "Der Hauptgrund, warum Interaktion wichtig ist, ist:"
    options:
      - "Es sieht beeindruckend aus"
      - "Die meisten Leute werden nie ein Objektiv bauen, aber fast jeder klickt auf eine Leiste - Interaktion ist, wie ein Dashboard Fragen beantwortet, die Sie nicht erwartet haben"
      - "Es verbessert die Leistung"
      - "Erforderlich für das Teilen"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-1"
    q: "Zwei Widgets basieren auf demselben Datensatz. Standardmäßig klicken Sie auf eins:"
    options:
      - "Tut dem anderen nichts"
      - "Filtern Sie den anderen - sie facettieren sich automatisch"
      - "Öffnet ein neues Objektiv"
      - "Erfordert eine Bindung zur Interaktion"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-2"
    q: "Warum würden Sie absichtlich Faceting Off für ein Widget drehen?"
    options:
      - "um die Leistung zu verbessern"
      - "Weil es eine Referenz ist - eine Unternehmenssumme, die fixiert bleiben muss, während alles andere filtert, so dass der Leser den Teil gegen das Ganze sehen kann"
      - "Facetten sind immer falsch"
      - "Daten verbergen"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-3"
    q: "Ein Viewer filtert zu einer Region und ein Widget wird leer. Die wahrscheinlichste Ursache ist:"
    options:
      - "Eine gebrochene Abfrage"
      - "Der datensatz dieses widgets hat keine zeilen für diese region - ein ehrlicher leerer zustand, der ein label anstelle eines fix benötigt."
      - "Faceting ist behindert"
      - "Ein Sicherheitsprädikat"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-1"
    q: "Es öffnet sich ein Dashboard, das alle Regionen und alle Zeiten anzeigt. Für einen Regionaldirektor bedeutet dies:"
    options:
      - "Maximale Flexibilität"
      - "Die gleichen drei Klicks jeden Morgen, bevor der Bildschirm etwas Wichtiges sagt"
      - "Schnellere Beladung"
      - "Bessere Sicherheit"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-2"
    q: "Nachdem ein Betrachter auf ein Segment klickt, wird der Bildschirm gefiltert. Das Wichtigste ist:"
    options:
      - "Eine Animation"
      - "Ein sichtbarer Hinweis auf die aktuelle Auswahl und ein offensichtlicher Weg, sie zu löschen"
      - "Ein Tooltip"
      - "Ein zweites Chart"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-3"
    q: "Eine gespeicherte Ansicht ist:"
    options:
      - "Eine Kopie des Dashboards"
      - "Ein erinnerter Zustand - Filter und Selektionen - so dass jemand zu seiner Scheibe zurückkehrt, ohne erneut zu klicken"
      - "Eine geplante E-Mail"
      - "Eine Erlaubniseinstellung"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-1"
    q: "Ein Link von einem Zusammenfassungs-Dashboard zu einem Detail, mit dem Sie:"
    options:
      - "Vermeiden Sie die Erstellung der Zusammenfassung"
      - "Halten Sie die Zusammenfassung klein, denn das Detail ist einen Klick entfernt und nicht angefüllt"
      - "Skip Sicherheit"
      - "Verbesserung der Abfrageleistung"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-2"
    q: "Das nützlichste Ziel für einen Bohrer aus einer Ausnahmetabelle ist normalerweise:"
    options:
      - "Heimatstaat eines anderen Dashboards"
      - "Die Salesforce Datensatz für diese Zeile, in der die Arbeit tatsächlich stattfindet"
      - "PDF Export"
      - "Der Datensatz"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-3"
    q: "Ein Bohrer, der auf einem ungefilterten Detail-Dashboard landet, ist:"
    options:
      - "fein"
      - "Ein defekter Bohrer - der ganze Punkt ist, dass das Ziel den Kontext erbt, aus dem Sie geklickt haben"
      - "Mehr Flexibilität"
      - "Schneller"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-1"
    q: "Zwei Widgets im selben Datensatz. Klicken Sie auf einen:"
    options:
      - "Tut nichts"
      - "Filtern des anderen standardmäßig"
      - "Benötigt eine Bindung"
      - "Öffnen einer Linse"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-2"
    q: "Sie schalten Facetten auf einem Widget aus, hauptsächlich wenn:"
    options:
      - "Es ist langsam"
      - "Es ist eine Referenz, die fixiert bleiben muss, während alles andere filtert"
      - "Es ist ein Tisch"
      - "Es hat keinen Titel"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-3"
    q: "Die Hälfte der Widgets reagiert auf einen Filter und die Hälfte nicht. Dies ist:"
    options:
      - "Normal"
      - "Der gefährliche Zustand - der Bildschirm ist falsch, während jedes Widget individuell korrekt ist"
      - "Ein Caching-Problem"
      - "Lizenzlimit"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-4"
    q: "Ein Dashboard sollte geöffnet werden:"
    options:
      - "Ungefiltert, zeigt alles"
      - "Auf dem gemeinsamen Fall — aktuelle Periode, Umfang des Betrachters, sortiert und begrenzt"
      - "Im leeren Zustand"
      - "Im letzten Jahr"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-5"
    q: "Anzeige des Teilstrommonats neben vollständigen Monaten:"
    options:
      - "Ist die aktuellste Ansicht"
      - "Produziert jeden Monat einen offensichtlichen Rückgang, es sei denn, er wird ausgeschlossen oder markiert"
      - "Verbessert die Genauigkeit"
      - "Keine Wirkung"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-6"
    q: "Ein gefiltertes Dashboard muss seine Auswahl angeben, weil:"
    options:
      - "Es sieht ordentlicher aus"
      - "Es wird gescreent und der Filter ist im Bild unsichtbar"
      - "Es ist für Facetten erforderlich"
      - "Es beschleunigt Anfragen"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-7"
    q: "Eine gespeicherte Ansicht ist am wertvollsten für:"
    options:
      - "Verwalter"
      - "Jeder, dessen Scheibe immer gleich ist, der sonst täglich erneut darauf klicken würde"
      - "Mobile Nutzer nur"
      - "Ausfuhr"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-8"
    q: "Ein Drilldown, der auf einem ungefilterten Ziel landet:"
    options:
      - "Bietet mehr Flexibilität"
      - "Ist in der Praxis gebrochen - es wird einmal angeklickt und dann aufgegeben"
      - "Schneller laden"
      - "Ist das Standardmuster"
    answer: 1
    topic: "interactions"
  - id: "bindings-index-1"
    q: "Der Unterschied zwischen Facetten und einer Bindung ist:"
    options:
      - "Es gibt keine"
      - "Das Faceting erfolgt automatisch zwischen den gleichen Dataset-Widgets; eine Bindung ist eine explizite Verdrahtung, die Sie konfigurieren"
      - "Bindungen sind schneller"
      - "Facettieren erfordert SAQL"
    answer: 1
    topic: "bindings"
  - id: "bindings-index-2"
    q: "Die beste erste Bindung, die zu einem Dashboard hinzugefügt werden kann, ist:"
    options:
      - "Bedingte Widget-Sichtbarkeit"
      - "Ein dynamischer Titel, der die aktuelle Auswahl angibt"
      - "Eine verschachtelte Filterkette"
      - "Eine cross-dataset Facette"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-1"
    q: "Was ist verbindlich?"
    options:
      - "Eine Verknüpfung zwischen Datasets"
      - "Zustand eines Widgets, der die Abfrage oder Anzeige eines anderen Widgets füttert"
      - "Eine Sicherheitseinstellung"
      - "Ein Charttyp"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-2"
    q: "Die beste erste Verwendung einer Bindung ist in der Regel:"
    options:
      - "Bedingte Widget-Sichtbarkeit"
      - "Ein dynamischer Titel, der die aktuelle Auswahl angibt"
      - "Verschachtelte abhängige Filter"
      - "Datensatzübergreifende Facettierung"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-3"
    q: "Die wichtigsten langfristigen Kosten eines stark gebundenen Dashboards sind:"
    options:
      - "Abfrageleistung"
      - "Niemand kann es sicher ändern - die Logik lebt in einer Widget-Konfiguration, die schwer zu lesen und unmöglich zu diff"
      - "Lizenzverbrauch"
      - "Browserspeicher"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-1"
    q: "Der wichtigste Randfall einer Auswahlbindung ist:"
    options:
      - "Mehrfachauswahl"
      - "Nichts ausgewählt - was das gebundene Widget tut, wenn die Quelle leer ist"
      - "Langsame Abfragen"
      - "Farbkontrast"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-2"
    q: "Ein abhängiger Filter (Region verengt die Rep-Liste) lohnt sich zu bauen, wenn:"
    options:
      - "Immer"
      - "Die abhängige Liste ist lang genug, dass das Scannen eine echte Kosten ist - vierzig Wiederholungen, nicht vier"
      - "nie"
      - "Nur für Administratoren"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-3"
    q: "Eine dynamische Titelbindung ist vor allem deshalb wertvoll, weil:"
    options:
      - "Es sieht dynamisch aus"
      - "Der Filterzustand des Dashboards überlebt es, in eine Nachricht ohne Kontext gescreent zu werden"
      - "Es verbessert die Leistung"
      - "Es ist für Facetten erforderlich"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-1"
    q: "Eine Ergebnisbindung lautet:"
    options:
      - "Was der Betrachter ausgewählt hat"
      - "Ein Wert, der von einer anderen Widget-Abfrage zurückgegeben wird"
      - "Metadaten des Datensatzes"
      - "Die URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-2"
    q: "Die Leistungskosten einer Ergebnisbindung sind:"
    options:
      - "Es verdoppelt das Datenvolumen"
      - "Es erstellt eine Ausführungsreihenfolge - das abhängige Widget kann nicht starten, bis die Quelle zurückgekehrt ist"
      - "Es deaktiviert Caching"
      - "Es gibt keine"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-3"
    q: "Debuggen einer Ergebnisbindung ist schwieriger als eine Auswahlbindung, weil:"
    options:
      - "Die Syntax ist anders"
      - "Die Eingabe ist auf dem Bildschirm unsichtbar - Sie müssen eine Abfrage verfolgen, anstatt sich eine Auswahl anzusehen"
      - "Es kann nicht getestet werden"
      - "Es erfordert Admin-Rechte"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-1"
    q: "Das Hauptrisiko der Verkettung von Bindungen A → B → C ist:"
    options:
      - "Datengenauigkeit"
      - "Sequenzielle Ausführung und eine Abhängigkeit, die niemand sehen kann, so dass ein Wechsel zu A C aus Gründen bricht, die unsichtbar sind"
      - "Lizenzkosten"
      - "Browser Kompatibilität"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-2"
    q: "Das praktische Signal, dass ein Dashboard zu viele Bindungen hat, ist:"
    options:
      - "Die Dateigröße"
      - "Jemand anderes als sein Autor kann es nicht sicher ändern, also bauen sie stattdessen ein neues Dashboard."
      - "Die Anzahl der Widgets"
      - "Langsames Rendern allein"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-3"
    q: "Die billigste Sache, die ein gebundenes Dashboard warten kann, ist:"
    options:
      - "Weniger Widgets"
      - "Eine Zeile in der Beschreibung pro Bindung - was was füttert und warum"
      - "Mehr Farben"
      - "Eine Namenskonvention für Abfragen"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-1"
    q: "Eine Bindung unterscheidet sich von Faceting, weil:"
    options:
      - "Es ist schneller"
      - "Es ist eine explizite Verdrahtung, die Sie konfigurieren, wobei das Facettieren automatisch zwischen den Widgets des gleichen Datensatzes erfolgt"
      - "Es erfordert SAQL"
      - "Es funktioniert über Orgs hinweg"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-2"
    q: "Die beste erste Bindung auf jedem Dashboard ist:"
    options:
      - "Bedingte Sicht"
      - "Ein dynamischer Titel, der die Auswahl trägt"
      - "Eine verschachtelte Filterkette"
      - "Eine Maßnahme toggle"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-3"
    q: "Eine Ergebnisbindung lautet:"
    options:
      - "Die Auswahl des Betrachters"
      - "Ein Wert eine andere Abfrage zurückgegeben"
      - "Metadaten des Datensatzes"
      - "Die Seite URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-4"
    q: "Ergebnisbindungen machen Dashboards langsam, weil sie:"
    options:
      - "Datenvolumen erhöhen"
      - "Ausführung serialisieren – das abhängige Widget wartet auf die Quelle"
      - "Caching deaktivieren"
      - "Erzwingen Sie eine vollständige Aktualisierung"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-5"
    q: "Der Kantenfall, der immer definiert werden muss, ist:"
    options:
      - "Zu viele Zeilen"
      - "Nichts ausgewählt"
      - "Ein langsames Netzwerk"
      - "Ein kleiner Bildschirm"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-6"
    q: "Ein abhängiger Filter, bei dem der zuvor gewählte rep nicht mehr in Reichweite ist, sollte:"
    options:
      - "Filtern Sie zu diesem Rep"
      - "Löschen Sie die veraltete Auswahl"
      - "Fehler anzeigen"
      - "Laden Sie die Seite neu"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-7"
    q: "Fünf Widgets, die an einen Filter gebunden sind, gegenüber drei in einer Kette. Was ist haltbarer?"
    options:
      - "Die Kette - weniger Bindungen"
      - "Die Fünf — Breite ist vorhersehbar, Tiefe ist nicht"
      - "Sie sind gleichwertig"
      - "Weder ist haltbar"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-8"
    q: "Eine Unternehmensmetrik, die durch Ergebnisse berechnet wird, die für jede Last bindend sind, sollte stattdessen:"
    options:
      - "Im Browser zwischengespeichert werden"
      - "Werden Sie einmal im Rezept berechnet und als Feld gespeichert"
      - "Als Konstante einzugeben"
      - "Entfernt"
    answer: 1
    topic: "bindings"
  - id: "dashboard-json-index-1"
    q: "Der beste Grund, das Dashboard zu bearbeiten JSON unmittelbar ist:"
    options:
      - "Es ist schneller als der Bauherr für den Arbeitsalltag"
      - "Bulk und sich wiederholende Änderungen der Builder macht Sie ein Widget auf einmal"
      - "Es entsperrt versteckte Diagrammtypen"
      - "Es umgeht die Sicherheit"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-index-2"
    q: "Ein Armaturenbrett JSON ist nützlich bei der Überprüfung, weil:"
    options:
      - "Es rendert im Browser"
      - "Es ist Text - es diffs, so dass eine Änderung ist überprüfbar, anstatt in einem Meeting beschrieben"
      - "Es ist kleiner als das Dashboard"
      - "Es enthält die Daten"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-1"
    q: "In einem Dashboard-Dokument ist ein \"Schritt\":"
    options:
      - "Eine Wizard Page"
      - "Eine Abfragedefinition - die Daten, aus denen ein Widget zieht"
      - "Ein Layout-Breakpoint"
      - "Erlaubnis"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-2"
    q: "Mehrere Widgets zeigen das gleiche Maß unterschiedlich geschnitten. Idealerweise:"
    options:
      - "Jeder definiert seinen eigenen Schritt"
      - "Teilen Sie einen Schritt, da die Anzahl der verschiedenen Abfragen der Haupthebel für die Ladezeit ist"
      - "Verwenden Sie separate Datensätze"
      - "werden zu einem Widget zusammengeführt"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-3"
    q: "Widgets und Layouts sind getrennt, weil:"
    options:
      - "Historischer Unfall"
      - "Ein Widget ist, was gezeichnet wird; ein Layout ist, wo es sitzt - so kann ein Widget bei verschiedenen Bildschirmgrößen unterschiedlich platziert werden"
      - "Layouts speichern die Daten"
      - "Widgets können nicht positioniert werden"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-1"
    q: "Ein Schritt mit Handschrift SAQL Anstelle einer angeklickten Definition lautet:"
    options:
      - "Ungültig"
      - "Fein und schwieriger für den Builder zu Round-Trip - die Oberfläche kann es möglicherweise nicht visuell neu bearbeiten"
      - "Schneller"
      - "Automatisch geteilt"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-2"
    q: "Ein statischer Schritt wird verwendet für:"
    options:
      - "Caching-Abfrageergebnisse"
      - "Eine feste Liste von Werten - Umschaltoptionen, Schwellenwerte -, die nicht aus einem Datensatz abgefragt werden"
      - "Sicherheitsvorschriften"
      - "Layoutdefinitionen"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-3"
    q: "Der Haupthebel auf Armaturenbrett Ladezeit, sichtbar in der JSON,"
    options:
      - "Die Anzahl der Widgets"
      - "Die Anzahl der verschiedenen Schritte - Widgets, die eine Abfrage teilen können, aber jede ihre eigenen definieren"
      - "Die Dateigröße"
      - "Anzahl der Layouts"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-1"
    q: "Ein Widget sieht direkt auf dem Desktop und falsch auf einem Telefon aus. Das Problem liegt in:"
    options:
      - "Der Schritt"
      - "Ein Layout — Position und Größe werden pro Haltepunkt getrennt vom Widget definiert"
      - "Der Datensatz"
      - "Das Sicherheitsprädikat"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-2"
    q: "Bearbeiten von Widget-Eigenschaften als Text ist am nützlichsten für:"
    options:
      - "Aufbau eines neuen Dashboards"
      - "Anwenden der gleichen Formatierungsänderung auf viele Widgets gleichzeitig"
      - "Änderung des Datensatzes"
      - "Hinzufügen von Sicherheit"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-1"
    q: "Bevor Sie ein Dashboard von Hand bearbeiten, sollten Sie:"
    options:
      - "Löschen Sie den Cache"
      - "Exportieren Sie eine Kopie - die Undo-Geschichte ist das, was Sie vorher gespeichert haben"
      - "Alle Zuschauer benachrichtigen"
      - "Deaktivieren Sie den Zeitplan"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-2"
    q: "Der wichtigste Governance-Vorteil des Dashboards JSON in einem Repository:"
    options:
      - "Schnellere Beladung"
      - "Eine Änderung wird zu einem überprüfbaren Diff anstelle eines Satzes in einer Besprechung"
      - "Bessere Sicherheit"
      - "Kleinere Dateigröße"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-3"
    q: "Nach einer Handbearbeitung ist der Round-Trip-Test:"
    options:
      - "Die Überprüfung der Daten ist korrekt"
      - "Neuladen im Builder, um zu bestätigen, dass es immer noch geöffnet und immer noch visuell bearbeitet wird"
      - "Ausführen des Rezepts"
      - "Clearingauswahl"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-1"
    q: "Ein Schritt in einem Dashboard-Dokument ist:"
    options:
      - "Eine Wizard Page"
      - "Eine benannte Abfragedefinition"
      - "Ein Layout-Breakpoint"
      - "Eine Sharing-Regel"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-2"
    q: "Widgets verweisen ihre Daten durch:"
    options:
      - "Enthält die SAQL Inline"
      - "Einen Schritt benennen"
      - "Hinweis auf eine Datensatz-ID"
      - "Vererbung durch das Layout"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-3"
    q: "Ein Dashboard sieht nur auf Telefonen falsch aus. Siehe:"
    options:
      - "Der Schritt"
      - "Die Layouts"
      - "Der Datensatz"
      - "Das Prädikat"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-4"
    q: "Elf Schritte für zwölf Widgets schlagen vor:"
    options:
      - "Gute Trennung"
      - "Fast nichts wird geteilt, und der Bildschirm macht elf Rundreisen"
      - "Eine korrupte Datei"
      - "Zu wenige Widgets"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-5"
    q: "Der schnellste Weg, um jede Bindung auf einem geerbten Dashboard zu finden, ist:"
    options:
      - "Öffnen Sie das Panel jedes Widgets"
      - "Durchsuchen der JSON für die verbindliche Syntax"
      - "Fragen Sie den Autor"
      - "Überprüfen Sie den Datensatz"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-6"
    q: "Vor dem Hand-Editing sollten Sie immer:"
    options:
      - "Klare Auswahl"
      - "Ausfuhr einer Kopie"
      - "Pausieren Sie den Zeitplan"
      - "Benachrichtigung der Zuschauer"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-7"
    q: "Bei der Rundfahrtprüfung wird geprüft, ob"
    options:
      - "Die Daten sind korrekt"
      - "Der Builder kann das Dashboard nach dem Bearbeiten weiterhin öffnen und visuell bearbeiten"
      - "Die Datei ist klein"
      - "Sicherheit bleibt bestehen"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-8"
    q: "Welche Änderung wird am besten dem Builder überlassen und nicht als Text?"
    options:
      - "Umbenennung eines Feldes über Widgets hinweg"
      - "Hinzufügen oder Entfernen eines Widgets, da es in jedem Layout konsistent sein muss"
      - "Ändern eines Zahlenformats"
      - "Bearbeiten eines Titels"
    answer: 1
    topic: "dashboard-json"
---

Praxisfragen für die Analytics Dashboard Implementierungsdomäne des CRM Analytics und Einstein Discovery Beraterprüfung.
