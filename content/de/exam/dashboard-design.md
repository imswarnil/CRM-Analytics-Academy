---
title: "Analytics Dashboard Design – Praxisfragen"
domain: "dashboard-design"
quiz:
  - id: "data-visualization-index-1"
    q: "Was ist die erste Frage, die Sie sich stellen müssen, bevor Sie einen Charttyp auswählen?"
    options:
      - "Welcher Typ sieht in den Markenfarben am besten aus?"
      - "Welchen Vergleich soll der Leser anstellen?"
      - "Wie viele Zeilen sind im Dataset?"
      - "Welche Typen tun CRM Analytics Unterstützung?"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-index-2"
    q: "Ein Balkendiagramm, das alphabetisch statt nach Wert sortiert ist:"
    options:
      - "Rendern schneller"
      - "Versteckt das Ranking, was normalerweise der Grund ist, warum jemand ein Balkendiagramm gezeichnet hat"
      - "Ist genauer"
      - "Macht keinen Unterschied"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-1"
    q: "Sie haben eine Dimension mit 40 Kategorien und einem Maß. Die beste erste Wahl ist:"
    options:
      - "Ein Tortendiagramm"
      - "Ein horizontales Balkendiagramm des oberen N, mit dem Limit im Titel"
      - "Ein Streckendiagramm"
      - "Ein Streuplot"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-2"
    q: "Zwei Maßnahmen, und Sie möchten wissen, ob sie sich zusammen bewegen. Die Tabelle lautet:"
    options:
      - "Ein zweiachsiges Streckendiagramm"
      - "Ein Streudiagramm, ein Maß pro Achse"
      - "Zwei separate Balkendiagramme"
      - "Eine Stapelsäule"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-3"
    q: "Warum ist horizontal normalerweise besser als vertikal für kategorische Balken?"
    options:
      - "Es macht schneller"
      - "Kategorienamen sind Wörter und Wörter, die entlang einer horizontalen Achse gelesen und nicht unter einer Spalte gedreht werden."
      - "Vertikale Balken sind veraltet"
      - "Es verbraucht weniger Platz"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-1"
    q: "Wann sollte ein Spaltendiagramm (vertikal) einen Balken (horizontal) schlagen?"
    options:
      - "Immer - vertikal ist Standard"
      - "Wenn die Kategorien geordnet sind, Perioden, wie Monate, die Leser erwarten, nach links nach rechts zu laufen"
      - "Wenn es viele Kategorien gibt"
      - "Wenn die Etiketten lang sind"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-2"
    q: "Gruppiert oder gestapelt, wenn der Leser jede Unterkategorie gruppenübergreifend vergleichen muss?"
    options:
      - "Gestapelt — es zeigt Summen"
      - "Gruppiert - nur das untere Segment eines Stapels teilt eine Baseline, so dass die anderen nicht mit dem Auge verglichen werden können"
      - "Beides funktioniert gleichermaßen"
      - "Weder; verwenden Sie einen Kuchen"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-3"
    q: "Die Achse eines Balkendiagramms beginnt bei 40 statt bei 0. Dies ist:"
    options:
      - "Fein und Standard"
      - "Irreführend für Balken - Balkenlänge ist die Kodierung, so dass eine verkürzte Achse das Verhältnis zwischen Balken falsch angibt"
      - "Erforderlich für die Lesbarkeit"
      - "Nur ein Problem im Druck"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-1"
    q: "Ein zweiachsiges Diagramm zeigt die Umsatz- und Mitarbeiterzahl im Juni. Was bedeutet die Kreuzung?"
    options:
      - "Umsatz überholte Headcount"
      - "Nichts - der Kreuzungspunkt wird dadurch bestimmt, wo Sie die beiden Achsen einstellen, nicht durch die Daten"
      - "Sie sind korreliert"
      - "Juni war der Break-even-Monat"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-2"
    q: "Ihr Datensatz hat keine Zeilen für einen Monat ohne Aktivität. Das Liniendiagramm sollte:"
    options:
      - "Verbinden Sie gerade über die Lücke"
      - "Zeigen Sie Null, wenn Null wahr ist, und eine Pause, wenn der Wert wirklich unbekannt ist - sie bedeuten verschiedene Dinge"
      - "Verstecke den Monat"
      - "Interpolieren Sie den Durchschnitt"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-3"
    q: "Wie viele Serien kann ein Liniendiagramm tragen, bevor es nicht mehr funktioniert?"
    options:
      - "1"
      - "Etwa vier, und nur, wenn sie durch Farbe und Form trennbar sind"
      - "Zehn"
      - "Unbegrenzt mit einer Legende"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-1"
    q: "Wie viele Scheiben kann ein Donut tragen, bevor die Leser aufhören, sie zu vergleichen?"
    options:
      - "Etwa drei oder vier"
      - "Etwa zehn"
      - "Zwanzig mit Labels"
      - "Es gibt kein Limit"
    answer: 0
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-2"
    q: "Ein 100% gestapelter Balken im Laufe der Zeit zeigt am besten:"
    options:
      - "Absolutes Wachstum"
      - "Ob sich der MIX verschoben hat - auf Kosten der versteckten Größe"
      - "Einzelwerte"
      - "Ausreißer"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-3"
    q: "Zusammensetzungsdaten, bei denen die genauen Prozentsätze wichtig sind, werden normalerweise am besten dargestellt als:"
    options:
      - "Ein Donut"
      - "Eine sortierte Tabelle mit einer Aktienspalte"
      - "Eine Baumkarte"
      - "Ein Lichtraum"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-1"
    q: "Die Auslastung des Unternehmens beträgt 88 %. Warum ist das potenziell nutzlos?"
    options:
      - "Es ist zu präzise"
      - "Es kann der Durchschnitt der Konten bei 30% und bei 140% sein, die gegensätzliche Aktionen erfordern und beide darin unsichtbar sind."
      - "Prozentsätze können überhaupt nicht gemittelt werden"
      - "Es sollte ein Median sein"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-2"
    q: "Ein Scatter-Plot beantwortet, welche Frage kein Balkendiagramm beantworten kann."
    options:
      - "Welche Kategorie ist die größte"
      - "Ob sich zwei Maßnahmen gleichzeitig bewegen, über viele Einheiten hinweg"
      - "Wie sich etwas im Laufe der Zeit verändert hat"
      - "Was teilen jeden Teil ist"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-3"
    q: "Die dritte Maßnahme eines Blasendiagramms ist codiert als:"
    options:
      - "Farbe"
      - "Blasenbereich"
      - "Position auf einer dritten Achse"
      - "Etikettengröße"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-1"
    q: "Was macht ein KPI Nummer verwertbar?"
    options:
      - "Eine größere Schrift"
      - "Ein Vergleich und eine Richtung - gegen Plan oder letzte Periode, mit einem Pfeil"
      - "Währungssymbol"
      - "Ein farbiger Hintergrund"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-2"
    q: "Ein Messgerät ist eine gute Wahl, wenn:"
    options:
      - "Jede einzelne Zahl wird angezeigt"
      - "Es gibt ein echtes festes Ziel und die Frage ist: Wie nah sind wir?"
      - "Die Zahl ist ein Prozentsatz"
      - "Der Raum ist begrenzt"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-3"
    q: "CAC Amortisation fiel von 15,3 auf 14,2 Monate. Der Pfeil sollte lauten:"
    options:
      - "Daunen und Rot"
      - "Unten und grün - Güte ist eine Eigenschaft der Metrik, nicht die Richtung"
      - "Up und Green"
      - "Kein Pfeil"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-1"
    q: "Wann schlägt ein Tisch einen Chart?"
    options:
      - "nie"
      - "Wenn die Identität jeder Zeile wichtig ist - welches Konto, welches Geschäft - oder die genauen Werte"
      - "Wenn es mehr als 20 Reihen gibt"
      - "Wenn Daten Text sind"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-2"
    q: "Eine Tabelle mit einer Scrollleiste auf einem Dashboard bedeutet normalerweise:"
    options:
      - "Gute Informationsdichte"
      - "Es ist eher ein Datenexport als ein Dashboard-Widget geworden"
      - "Die Zeilen müssen sortiert werden"
      - "Die Schrift ist zu groß"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-3"
    q: "Zahlen in einer Tabelle sollten sein:"
    options:
      - "Linksbündig mit dem Text"
      - "Rechts ausgerichtet mit konsistenten Dezimalstellen, so dass Größen auf einen Blick vergleichbar sind"
      - "zentriert"
      - "Nach Wert gefärbt"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-1"
    q: "Sie haben Einnahmen für sechs Verkaufsregionen. Ist eine Karte das richtige Diagramm?"
    options:
      - "Ja — Regionen sind geografisch"
      - "Normalerweise nicht — mit sechs Kategorien eine sortierte Leiste ordnet sie genau, wo eine Karte macht der Leser schätzen Farben"
      - "Ja, wenn die Farben zugänglich sind"
      - "Nur mit einer Legende"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-2"
    q: "Ein Choropleth der Roheinnahmen nach Ländern zeigt hauptsächlich:"
    options:
      - "Wo Ihr Produkt am besten funktioniert"
      - "Wo die meisten Menschen und die größten Volkswirtschaften sind"
      - "Marktanteil"
      - "Wachstum"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-3"
    q: "Die übliche Lösung dafür ist:"
    options:
      - "Eine andere Farbskala"
      - "Normalisierung — Einnahmen pro Konto, pro Kopf oder gegen Marktgröße"
      - "Entfernen kleiner Länder"
      - "Verwendung einer Bubble Map"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-1"
    q: "Ein Funnel umfasst 2,1 Millionen Sitzungen bis zu 506 Möglichkeiten auf einer linearen Skala. Was passiert?"
    options:
      - "Es liest sich klar"
      - "Jede Stufe nach der zweiten ist ein Stub, und die Stufen, die am wichtigsten sind, werden unsichtbar"
      - "Die Chartfehler"
      - "Die Prozentsätze sind falsch"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-2"
    q: "Eine Wasserfallkarte ist für:"
    options:
      - "Rangfolgekategorien"
      - "Zeigen, wie eine Reihe von Additionen und Subtraktionen von einer Gesamtsumme zur anderen kommt"
      - "Vergleich zweier Maßnahmen"
      - "Geografische Daten"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-3"
    q: "Trichterstufen sollten bestellt werden:"
    options:
      - "nach Größe"
      - "In Prozessreihenfolge"
      - "Alphabetisch"
      - "Umrechnungskurs"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-1"
    q: "Was ist der zuverlässige Test dafür, ob ein Chart ehrlich ist?"
    options:
      - "Jede Zahl darauf ist korrekt"
      - "Was ein Leser in vier Sekunden schlussfolgert, ist wahr"
      - "Es verwendet die Markenpalette"
      - "Es hat eine Legende"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-2"
    q: "Das Truncating der y-Achse ist auf einem Liniendiagramm der Retention, aber nicht auf einem Balkendiagramm vertretbar. Warum?"
    options:
      - "Bars sind ältere Technologie"
      - "Balkenlänge ist die Kodierung, so dass die Verkürzung das Verhältnis zwischen Balken falsch angibt; eine Linie kodiert die Steigung"
      - "Zeilen können keine kleinen Werte anzeigen"
      - "Es ist niemals vertretbar"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-3"
    q: "Das häufigste unehrliche Diagramm in der Geschäftsberichterstattung ist:"
    options:
      - "A 3D Piece"
      - "Eine Rohsumme, die einen Nenner benötigte - zählt, wo eine Rate die Frage war"
      - "Logarithmus"
      - "Eine Doppelachse"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-1"
    q: "Die erste Frage vor der Auswahl eines Diagrammtyps lautet:"
    options:
      - "Wie viele Zeilen gibt es"
      - "Welchen Vergleich muss der Leser machen"
      - "Welche Farben verfügbar sind"
      - "Welche Typen CRM Analytics Stützen"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-2"
    q: "Ein kategorisches Balkendiagramm sollte normalerweise sortiert werden:"
    options:
      - "Alphabetisch"
      - "Abstieg nach der Maßnahme"
      - "Durch die Dimension ID"
      - "Zufällig"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-3"
    q: "Gruppiert statt gestapelte Balken, wenn der Leser Unterkategorien zwischen Gruppen vergleichen muss, weil:"
    options:
      - "Stapel sind schwerer zu färben"
      - "Nur das untere Segment eines Stapels teilt eine Baseline, so dass der Rest nicht mit dem Auge verglichen werden kann"
      - "Gruppierte Balken sind schmaler"
      - "Stacks können keine Summen anzeigen"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-4"
    q: "Ein Donut hört auf, ungefähr zu arbeiten:"
    options:
      - "Zwei Scheiben"
      - "Vier Scheiben"
      - "10 Scheiben"
      - "20 Scheiben"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-5"
    q: "Welche Frage kann NUR ein Scatter Plot beantworten?"
    options:
      - "Welche Kategorie ist die größte"
      - "Ob sich zwei Maßnahmen über viele Entitäten hinweg bewegen"
      - "Wie sich ein Wert im Laufe der Zeit verändert hat"
      - "Welcher Anteil jeder Teil beiträgt"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-6"
    q: "A KPI Nummer wird verwertbar, wenn sie trägt:"
    options:
      - "Eine größere Schrift"
      - "Ein Vergleich und eine Richtung"
      - "Währungssymbol"
      - "Ein farbiger Hintergrund"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-7"
    q: "CAC Payback fallen sollte als gezeigt werden:"
    options:
      - "Ein roter Pfeil nach unten"
      - "Ein grüner Pfeil nach unten - Güte gehört zur Metrik, nicht zur Richtung"
      - "Kein Pfeil"
      - "Ein Pfeil nach oben"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-8"
    q: "Ein Funnel mit 2,1 Millionen Sitzungen zu 506 Gelegenheiten auf linearer Skala:"
    options:
      - "Lesen fein"
      - "Rendert die späteren Phasen als Stubs und versteckt die Phasen, die am wichtigsten sind"
      - "Fehler"
      - "Inverts"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-9"
    q: "Ein Choropleth der Roheinnahmen nach Ländern zeigt hauptsächlich:"
    options:
      - "Produktmarkttauglichkeit"
      - "Wo die größten Bevölkerungen und Volkswirtschaften sind"
      - "Wachstum"
      - "Marge"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-10"
    q: "Das häufigste unehrliche Diagramm in der Geschäftsberichterstattung ist:"
    options:
      - "Ein 3D-Kuchendiagramm"
      - "Eine Rohsumme, die einen Nenner benötigt"
      - "Logarithmus"
      - "Ein gestapelter Bereich"
    answer: 1
    topic: "data-visualization"
  - id: "lenses-and-explorations-index-1"
    q: "Wie versteht man eine Linse am besten?"
    options:
      - "Ein abgeschlossener Bericht"
      - "Ein Einweg-Arbeitsplatz für eine Erkundung eines Datensatzes"
      - "Eine Dashboard-Vorlage"
      - "Eine gespeicherte Abfrage, die nur Administratoren erstellen können"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-index-2"
    q: "Warum wechseln zu SAQL Modus nach einer Änderung durch Klicken?"
    options:
      - "Es läuft schneller"
      - "Sie wissen bereits, was die Antwort sein sollte, also ist das Lesen der generierten Abfrage der billigste Weg, um die Sprache zu lernen"
      - "Charts sind nicht verfügbar in SAQL Modus"
      - "Es ist erforderlich, bevor Sie sparen"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-1"
    q: "CRM Analytics sortiert ein gruppiertes Diagramm nach der Gruppierung standardmäßig. Warum es ändern?"
    options:
      - "Alphabetische Reihenfolge ist ungültig"
      - "Der Punkt eines gruppierten Diagramms ist normalerweise das Ranking, das sich in alphabetischer Reihenfolge verbirgt"
      - "Sortieren nach Maß ist schneller"
      - "Es ist für Facetten erforderlich"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-2"
    q: "Hinzufügen einer zweiten Gruppierung zu einem Balkendiagramm in der Regel:"
    options:
      - "Verdoppelt die Einsicht"
      - "Macht es wesentlich schwieriger zu lesen und lohnt sich zu widerstehen, es sei denn, der Vergleich ist der Punkt"
      - "Gesichtsschnitte"
      - "Änderung der Maßnahme"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-3"
    q: "Bei Zeilenkorn bedeutet \"Zeilenzahl\":"
    options:
      - "Anzahl der Deals"
      - "Anzahl der Posten — für Geschäfte eine eindeutige Zählung auf dem Transaktionsschlüssel verwenden"
      - "Anzahl der Konten"
      - "Anzahl der Erzeugnisse"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-1"
    q: "Ein Chart zeigt ein Segment mit unglaublich hohen Einnahmen. Was ist der schnellste nächste Schritt?"
    options:
      - "Ändern Sie den Chart-Typ"
      - "Wechseln Sie in den Tischmodus und schauen Sie sich die Zeilen dahinter an"
      - "Die Linse wieder aufbauen"
      - "Überprüfen Sie die Dashboard-Filter"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-2"
    q: "SAQL Der Modus ist für einen Lernenden am wertvollsten, weil:"
    options:
      - "Es läuft schneller als klicken"
      - "Es zeigt die Abfrage Ihrer Klicks, gegen eine Antwort, die Sie bereits kennen"
      - "Es ist die einzige Möglichkeit zu filtern"
      - "Charts können nicht nach Datum gruppiert werden"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-1"
    q: "Was bestimmt am meisten, ob natürlichsprachige Abfragen gut funktionieren?"
    options:
      - "Der gewählte Charttyp"
      - "Die Qualität der Feldmetadaten des Datensatzes — Etiketten, Formate und versteckte Sanitärinstallation"
      - "Anzahl der Nutzer"
      - "Der Aktualisierungsplan"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-2"
    q: "Der wichtige Fehlermodus einer natürlichsprachigen Antwort ist, dass es:"
    options:
      - "Läuft langsam"
      - "Beantwortet eine subtil andere Frage als die gestellte, fließend und ohne Hinweis auf den Unterschied"
      - "Kann keine Charts erstellen"
      - "Erforderlich SAQL Kenntnisse"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-1"
    q: "Eine Linse wird am besten beschrieben als:"
    options:
      - "Ein abgeschlossener Bericht"
      - "Ein Einweg-Arbeitsplatz für eine Erkundung eines Datensatzes"
      - "Eine Dashboard-Vorlage"
      - "A gerettet SAQL Skript"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-2"
    q: "Die Standardsortierung in einem gruppierten Diagramm erfolgt durch die Gruppierung. Normalerweise ändern Sie es, weil:"
    options:
      - "Alphabetisch ist ungültig"
      - "Das Ranking ist normalerweise der Punkt, und die alphabetische Reihenfolge verbirgt es"
      - "Es macht schneller"
      - "Facetten erfordern es"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-3"
    q: "Bei line-item grain, um deals zu zählen, die sie verwenden sollten:."
    options:
      - "Anzahl der Zeilen"
      - "Eine deutliche Zählung auf dem Opportunity Key"
      - "Summe des Betrags"
      - "Durchschnitt"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-4"
    q: "Hinzufügen einer zweiten Gruppierung zu einem Balkendiagramm in der Regel:"
    options:
      - "Verdoppelt die Einsicht"
      - "Macht es wesentlich schwieriger zu lesen und lohnt sich zu widerstehen, es sei denn, der Vergleich ist der Punkt"
      - "Gesichtsschnitte"
      - "Änderung der Maßnahme"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-5"
    q: "Ein Chart sieht falsch aus. Die schnellste Diagnose ist:"
    options:
      - "Ändern Sie den Chart-Typ"
      - "Wechseln Sie in den Tabellenmodus und lesen Sie die Zeilen"
      - "Die Linse wieder aufbauen"
      - "Check-Sharing"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-6"
    q: "Der beste Weg, um die Abfragesprache vom Explorer zu lernen, ist:"
    options:
      - "Lesen der Funktion Referenz Ende zu Ende"
      - "Klicken, dann lesen Sie die SAQL Ihre Klicks gegen eine Antwort, die Sie bereits kennen"
      - "Schreiben von Queries from scratch"
      - "Beispiele aus Foren kopieren"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-7"
    q: "Ein Filter mit der Aufschrift 'Stage != Closed Lost' entfernt ebenfalls:"
    options:
      - "Nichts anderes"
      - "Reihen, in denen Stage null ist"
      - "Geschlossene gewonnene Reihen"
      - "Zeilen aus anderen Datensätzen"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-8"
    q: "Natürliche Sprachabfrageergebnisse sollten wie folgt behandelt werden:"
    options:
      - "Endgültige Antworten zum Zitat"
      - "Ein Ausgangspunkt zum Verifizieren im Tabellenmodus, da er auch dann fließend antwortet, wenn er eine andere Frage beantwortet"
      - "Unbrauchbar"
      - "Entspricht einer gespeicherten Linse"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "designing-dashboards-index-1"
    q: "Was macht ein Dashboard fertig?"
    options:
      - "Jedes angeforderte Widget ist vorhanden"
      - "Ein Betrachter kann die Entscheidung, für die er existiert, schnell und ohne Sie treffen"
      - "Es verwendet die Firmenfarben"
      - "Es gibt keinen Leerraum"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-index-2"
    q: "Ein Stakeholder fragt nach einem neunten Widget. Die beste erste Frage ist:"
    options:
      - "Welchen Charttyp möchten Sie?"
      - "Was würden Sie anders machen, je nachdem, was es zeigte?"
      - "Kann er bis zum nächsten Sprint warten?"
      - "Haben Sie die Daten?"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-1"
    q: "Wohin gehört die wichtigste Zahl?"
    options:
      - "Zentrum, größtes"
      - "Oben links, wo die Lesereihenfolge beginnt"
      - "Bottom, als Schlussfolgerung"
      - "Überall; Menschen scannen zufällig"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-2"
    q: "Warum gruppenbezogene Widgets zusammen mit dem Raum zwischen Gruppen?"
    options:
      - "Es sieht ordentlicher aus"
      - "Nähe impliziert Beziehung - Widgets, die zusammengelegt werden, werden als zusammengehörig gelesen, unabhängig davon, ob sie es tun oder nicht"
      - "Es verbessert die Leistung"
      - "Es wird durch Facettieren benötigt"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-1"
    q: "Warum sollte ein farbiges Delta auch einen Richtungspfeil oder ein Etikett tragen?"
    options:
      - "Es sieht professioneller aus"
      - "Weil Farbe allein farbenblinde Leser ausschließt und den Druck oder einen Graustufen-Screenshot nicht überlebt"
      - "Pfeile sind schneller zu rendern"
      - "Es ist erforderlich durch Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-2"
    q: "Woher sollte eine rote / gelbe / grüne Schwelle kommen?"
    options:
      - "Sogar Drittel des Bereichs"
      - "Das Geschäft - die Zahl, bei der jemand tatsächlich etwas anders macht"
      - "Standard der Palette"
      - "Der Durchschnitt"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-3"
    q: "Ein Armaturenbrett, bei dem die meisten Zellen gefärbt sind, hat:"
    options:
      - "Maximale Informationsdichte"
      - "Kein Signal bleibt übrig - wenn alles hervorgehoben ist, ist nichts"
      - "Bessere Zugänglichkeit"
      - "Schnellere Ladezeiten"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-1"
    q: "Wann schlägt ein Tisch einen Chart?"
    options:
      - "nie"
      - "Wenn die Identität jeder Zeile wichtig ist - welches spezifische Konto, welches spezifische Geschäft"
      - "Wenn es viele Zeilen gibt"
      - "Wenn die Daten numerisch sind"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-2"
    q: "Was macht a KPI Zahl in eine umsetzbare?"
    options:
      - "Eine größere Schrift"
      - "Ein Vergleich - gegen Plan, gegen letzte Periode - und eine Richtung"
      - "Währungssymbol"
      - "Eine Grenze"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-3"
    q: "Eine Wertetabelle, die alle 140 Konten zeigt, ist normalerweise:"
    options:
      - "Gründlich"
      - "Ein Datenexport, der Kleidung eines Dashboards trägt"
      - "Für die Genauigkeit erforderlich"
      - "Schneller als ein Chart"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-1"
    q: "Der größte Einzelhebel bei der Ladezeit des Armaturenbretts ist normalerweise:"
    options:
      - "Kartentyp"
      - "Die Anzahl der verschiedenen Abfragen - Widgets, die eine Abfrage teilen können, aber jede ihre eigenen ausführen"
      - "Browserwahl"
      - "Farbtiefe"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-2"
    q: "Ein Datensatz bei sehr feinem Korn macht Dashboards langsam, weil:"
    options:
      - "Feinkörner werden ineffizient gelagert"
      - "Jedes Widget aggregiert Millionen von Zeilen zur Abfragezeit, bei jeder Ladung, für jeden Betrachter"
      - "Faceting ist behindert"
      - "Es kann nicht indexiert werden"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-1"
    q: "Warum wird der Funnel in Bühnenreihenfolge und nicht nach Größe sortiert?"
    options:
      - "Es macht schneller"
      - "Die Sequenz ist das Argument - der Tropfen zwischen benachbarten Stufen ist der Befund"
      - "Salesforce erfordert es"
      - "Passend zum Tisch"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-2"
    q: "Warum hat das Coverage Widget Faceting ausgeschaltet?"
    options:
      - "Leistung"
      - "Es ist eine Referenz gegen das volle Quartal - wenn es mit allem anderen filtert, verschwindet der Vergleich"
      - "Es verwendet einen anderen Datensatz"
      - "Verhältnis von Faceting Breaks"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-3"
    q: "Der Pipeline-Trend wird nach erstelltem Monat und nicht nach engem Monat gruppiert, weil:"
    options:
      - "Close Dates sind unzuverlässig"
      - "Kohortierung am falschen Datum verzerrt die letzten und alten Perioden in entgegengesetzte Richtungen, während beide Zahlen einzeln korrekt bleiben"
      - "Erstellter Monat macht schneller"
      - "Es gibt keinen Unterschied"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-1"
    q: "Ein Dashboard ist fertig, wenn:"
    options:
      - "Jedes angeforderte Widget ist vorhanden"
      - "Sein Publikum kann die Entscheidung treffen, für die es existiert, schnell und ohne Sie"
      - "Es passt zur Markenpalette"
      - "Es gibt keinen leeren Raum"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-2"
    q: "Die Überschrift Nummer gehört:"
    options:
      - "Zentrum"
      - "Oben links, wo die Lesereihenfolge beginnt"
      - "Boden"
      - "Neben den Filtern"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-3"
    q: "Filter in der oberen linken Ecke sind ein Fehler, weil:"
    options:
      - "Sie sind langsam"
      - "Sie verbringen den wertvollsten Platz auf dem Bildschirm auf Kontrollen, die niemand bis zu ihrem zweiten Besuch braucht"
      - "Sie können nicht verkleinert werden"
      - "Sie können nicht gebunden werden"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-4"
    q: "Ein Widget-Titel sollte tragen:"
    options:
      - "Nur die Maßnahme"
      - "Das maß, der zeitraum, der filter und jedes limit — es wird ohne kontext gescreent."
      - "Name des Autors"
      - "Name des Datensatzes"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-5"
    q: "Ein Trichterdiagramm sollte sortiert werden:"
    options:
      - "Nach absteigender Größe"
      - "In Prozessreihenfolge"
      - "Alphabetisch"
      - "Datum"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-6"
    q: "Warum muss ein farbiges Delta auch einen Pfeil oder ein Etikett tragen?"
    options:
      - "Ästhetik"
      - "Farbe allein schließt farbenblinde Leser aus und stirbt in Graustufen"
      - "Pfeile machen schneller"
      - "Es ist obligatorisch in Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-7"
    q: "A KPI Nummer wird handlungsfähig, wenn sie:"
    options:
      - "Eine größere Schrift"
      - "Ein Vergleich und eine Richtung"
      - "Eine Grenze"
      - "Währungssymbol"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-8"
    q: "Der größte Hebel auf einem langsamen Armaturenbrett ist normalerweise:"
    options:
      - "Kartentypen"
      - "Konsolidierung von Widgets, die eine Abfrage teilen können"
      - "Weniger Farben"
      - "Ein schneller Browser"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-9"
    q: "Eine Tabelle auf einem Dashboard, die scrollen muss, hat:"
    options:
      - "Gute Informationsdichte"
      - "Aufgehört, ein Dashboard-Widget zu sein und ein Datenexport zu werden"
      - "Zu große Schrift"
      - "Die falsche Sortierung"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-10"
    q: "Die letzte Überprüfung vor dem Teilen eines Dashboards ist:"
    options:
      - "Rechtschreibprüfung der Titel"
      - "Öffnen Sie es als eingeschränkter Benutzer und versöhnen Sie die Überschrift mit etwas, das unabhängig wahr ist"
      - "Exportieren Sie es in PDF"
      - "Mehr Widgets hinzufügen"
    answer: 1
    topic: "designing-dashboards"
---

Praxisfragen für die Analytics Dashboard Design-Domäne der CRM Analytics und Einstein Discovery Beraterprüfung.
