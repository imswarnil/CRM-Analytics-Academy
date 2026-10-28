---
title: "Admin — praktische Fragen"
domain: "admin"
quiz:
  - id: "collaboration-index-1"
    q: "Was geteilt wird in CRM Analytics Dashboards oder Apps?"
    options:
      - "Einzelne Dashboards, eins nach dem anderen"
      - "Apps, die das Teilen tragen und die Datensätze, Objektive und Dashboards darin halten"
      - "Nur Datensätze"
      - "Nichts wird geteilt; der Zugriff erfolgt nach Profil"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-index-2"
    q: "Der häufigste Grund, warum ein gutes Dashboard ausfällt, ist:"
    options:
      - "Langsame Abfragen"
      - "Niemand öffnet es, weil es nie dort platziert wurde, wo die Arbeit stattfindet, und niemand besitzt es"
      - "Falsche Charts"
      - "Zu wenige Widgets"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-apps-and-sharing-1"
    q: "Das Teilen einer App mit Viewer-Zugriff ermöglicht es jemandem:"
    options:
      - "Bearbeiten Sie Ihre Dashboards"
      - "Sehen Sie den Inhalt, vorbehaltlich der Sicherheit auf Zeilenebene in den zugrunde liegenden Datensätzen"
      - "Sehen Sie alle Daten unabhängig von Prädikaten"
      - "Verwalten des Teilens"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-apps-and-sharing-2"
    q: "Warum ist \"eine App pro Dashboard\" ein schlechtes Muster?"
    options:
      - "Es ist langsamer"
      - "Das Teilen wird pro App verwaltet, so dass Dutzende von Apps Dutzende von Freigabelisten bedeuten, um konsistent zu bleiben"
      - "Apps haben ein hartes Limit"
      - "Dashboards können nicht bewegt werden"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-apps-and-sharing-3"
    q: "Ein Benutzer hat eine App mit ihnen geteilt, sieht aber ein leeres Dashboard. Höchstwahrscheinlich:"
    options:
      - "Sharing gescheitert"
      - "Row-Level-Sicherheit - das Prädikat oder die Vererbung filtert ihre Zeilen weg"
      - "Sie benötigen Editor-Zugriff"
      - "Das Dashboard ist kaputt"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-subscriptions-and-notifications-1"
    q: "Der Hauptvorteil eines Abonnements gegenüber einem Dashboard ist:"
    options:
      - "Es ist genauer"
      - "Es erreicht Menschen, die das Werkzeug nie öffnen werden, an einem Ort, an dem sie bereits hinschauen"
      - "Es umgeht die Sicherheit auf Zeilenebene"
      - "Erfrischt sich schneller"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-subscriptions-and-notifications-2"
    q: "Eine Schwellenmeldung, dass Brände die meisten Tage geworden ist:"
    options:
      - "Sehr informativ"
      - "Lärm - Leute bauen eine Filterregel dafür und hören auf zu lesen, auch an dem Tag, an dem es darauf ankommt"
      - "Ein Performance Problem"
      - "Ein Sicherheitsrisiko"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-annotations-1"
    q: "Der Hauptwert des Annotierens eines Widgets ist:"
    options:
      - "Dekorieren des Armaturenbretts"
      - "Die Erklärung lebt neben der Zahl, so dass die nächste Person, die die gleiche Frage stellt, die Antwort bereits dort findet"
      - "Es verbessert die Genauigkeit"
      - "Ersetzt die Dokumentation"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-annotations-2"
    q: "Ein Anstieg in einem Monat wird durch eine einmalige Migration erklärt. Wo sollte diese Erklärung leben?"
    options:
      - "In einem Chat-Thread"
      - "Als Anmerkung auf dem Widget, wo jeder, der die Spitze sieht, es sehen wird"
      - "In einer E-Mail an das Team"
      - "Nirgendwo – die Daten sprechen für sich"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-embedding-1"
    q: "Warum ein Dashboard auf einem Salesforce Rekordseite?"
    options:
      - "Es lädt schneller dort"
      - "Es entfernt die Entscheidung, zu gehen und zu schauen - die Analysen sind neben der Aufzeichnung, an der die Person bereits arbeitet"
      - "Es umgeht die Sicherheit auf Zeilenebene"
      - "Standalone-Dashboards können nicht geteilt werden"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-embedding-2"
    q: "Ein Embedded Dashboard sollte normalerweise sein:"
    options:
      - "Das gleiche wie der Standalone"
      - "Kleiner und gefiltert auf den Kontext des Datensatzes - zwei oder drei Widgets, nicht zwölf"
      - "Größer, da mehr Platz vorhanden ist"
      - "Statisch, ohne Filter"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-self-service-and-views-1"
    q: "Was bestimmt am meisten, ob Self-Service funktioniert?"
    options:
      - "Die Anzahl der veröffentlichten Dashboards"
      - "Metadaten aus dem Datensatzfeld — Geschäftsetiketten, sinnvolle Standardwerte und versteckte Sanitäranlagen"
      - "Wie viele Benutzer haben Editor Zugriff"
      - "Kartensorte"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-self-service-and-views-2"
    q: "Eine gespeicherte Ansicht ist:"
    options:
      - "Eine Kopie des Dashboards"
      - "Ein erinnerter Zustand - Filter und Auswahl - so dass jemand zu seiner Scheibe zurückkehrt, ohne erneut zu klicken"
      - "Eine geplante E-Mail"
      - "Eine Sicherheitseinstellung"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-downloading-and-governance-1"
    q: "Jemand exportiert jede Woche ein Widget in eine Tabelle. Was ist das wirkliche Risiko?"
    options:
      - "Lagerhaltungskosten"
      - "Die Tabellenkalkulation wird zu einer konkurrierenden Quelle der Wahrheit, die altert und divergiert, und sie wird gegen das Dashboard zitiert"
      - "Langsame Abfragen"
      - "Nichts"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-downloading-and-governance-2"
    q: "Der häufigste Grund, warum einem Dashboard nicht mehr vertraut wird, ist:"
    options:
      - "Ein visuelles Redesign"
      - "Niemand besitzt es - der Zeitplan driftet, ein Feld ändert die Bedeutung und die Definitionen werden nicht beibehalten"
      - "Zu wenige Widgets"
      - "Browser-Inkompatibilität"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-graded-quiz-1"
    q: "Die Einheit des Teilens in CRM Analytics ist:"
    options:
      - "Das Armaturenbrett"
      - "Die App"
      - "Der Datensatz"
      - "Die Abschlussscheibe"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-graded-quiz-2"
    q: "Jemandem Viewer Zugriff auf eine App geben:"
    options:
      - "Umgehen von Sicherheit auf Zeilenebene"
      - "Lassen Sie sie ihren Inhalt sehen, immer noch der Sicherheit auf Zeilenebene unterliegen"
      - "Ermöglicht es ihnen, Dashboards zu bearbeiten"
      - "Lasst sie das Teilen ändern"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-graded-quiz-3"
    q: "Eine App pro Dashboard ist ein schlechtes Muster, weil:"
    options:
      - "Apps sind begrenzt"
      - "Das Teilen wird pro App verwaltet, so dass viele Apps viele Listen bedeuten, die auseinander driften"
      - "Dashboards laden langsamer"
      - "Datensätze können nicht geteilt werden"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-graded-quiz-4"
    q: "Ein Schwellenalarm, der die meisten Tage feuert, ist geworden:"
    options:
      - "Sehr nützlich"
      - "Lärm, den Menschen wegfiltern, auch wenn es darauf ankommt"
      - "Ein Sicherheitsproblem"
      - "Ein Performance Problem"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-graded-quiz-5"
    q: "Ein eingebettetes Dashboard auf einer Datensatzseite sollte sein:"
    options:
      - "Das vollständige Standalone-Dashboard"
      - "Zwei oder drei Widgets, auf diesen Datensatz ausgerichtet"
      - "Statisch ohne Filter"
      - "Größer als die Standalone-Version"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-graded-quiz-6"
    q: "Self-Service gelingt oder scheitert hauptsächlich an:"
    options:
      - "Anzahl der Dashboards"
      - "Metadaten zum Datensatzfeld — Etiketten, Standardwerte, versteckte Sanitäranlagen, dokumentiertes Getreide"
      - "Wie viele Editoren gibt es"
      - "Kartensorte"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-graded-quiz-7"
    q: "Das eigentliche Risiko des routinemäßigen Exports ist:"
    options:
      - "Lagerung"
      - "Die Tabellenkalkulation wird zu einer konkurrierenden Wahrheit, die altert, divergiert und zurück zitiert wird"
      - "Querlast"
      - "Lizenznutzung"
    answer: 1
    topic: "collaboration"
  - id: "collaboration-graded-quiz-8"
    q: "Die höchste Leverage Governance Gewohnheit ist:"
    options:
      - "Ein Genehmigungsverfahren für neue Dashboards"
      - "Löschen oder Archivieren, was niemand öffnet"
      - "Monatliche Design Reviews"
      - "Eine Namenskonvention"
    answer: 1
    topic: "collaboration"
  - id: "apis-and-automation-index-1"
    q: "Der stärkste Grund, nach dem API ist:"
    options:
      - "Es ist schneller als die UI für einmalige Arbeit"
      - "Arbeit, die sich wiederholt, geplant ist oder viele Male identisch sein muss"
      - "Es umgeht die Sicherheit auf Zeilenebene"
      - "Es entsperrt zusätzliche Charttypen"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-index-2"
    q: "API Zugang zu CRM Analytics Daten unterliegen:"
    options:
      - "Nichts – APIs umgehen das Sicherheitsmodell"
      - "Die gleichen Berechtigungen und Sicherheit auf Zeilenebene wie die Benutzeroberfläche, bewertet für den authentifizierten Benutzer"
      - "Nur ein separates Berechtigungsset"
      - "Nur org-weite Ausfälle"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-the-rest-api-1"
    q: "Die richtige Identität für eine geplante Integration ist:"
    options:
      - "Persönliches Konto eines Entwicklers"
      - "Ein dedizierter Integrationsbenutzer mit engen Berechtigungen und Anmeldeinformationen in einem Secret Store"
      - "Systemadministrator der Org"
      - "Ein anonymes Token"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-the-rest-api-2"
    q: "API Versionsnummern im URL weil:"
    options:
      - "Sie sind kosmetische"
      - "Durch das Anheften einer Version funktioniert ein Skript, wenn die Plattform aktualisiert wird, und Sie können absichtlich upgraden"
      - "Sie kontrollieren Tarifgrenzen"
      - "Sie bestimmen die Sicherheit"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-running-saql-from-code-1"
    q: "Ein Skript gibt eine andere Zahl aus dem Dashboard mit \"der gleichen\" Metrik zurück. Das erste, was zu überprüfen ist:"
    options:
      - "Die API Version"
      - "Ob beide als derselbe Benutzer ausgeführt werden, da die Sicherheit auf Zeilenebene für beide gilt"
      - "Das Netz"
      - "Der Charttyp"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-running-saql-from-code-2"
    q: "Eine Abfrage mit einem relativen Datumsbereich (\"letzte 90 Tage\"), die von einem Skript ausgeführt wird, ist:"
    options:
      - "Deterministisch"
      - "Nicht-deterministisch - es gibt morgen verschiedene Reihen zurück, was für ein Armaturenbrett und eine Falle für die Versöhnung richtig ist"
      - "Ungültig"
      - "Zwischenspeicher"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-loading-data-1"
    q: "Das externe Daten-Upload-Muster ist:"
    options:
      - "Eine Anfrage mit der gesamten Datei"
      - "Deklarieren Sie einen Job mit Metadaten, laden Sie die Daten in Teilen hoch und signalisieren Sie dann die Fertigstellung"
      - "Upload dann erklären"
      - "Schreibe Zeilen nacheinander"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-loading-data-2"
    q: "Die mit dem Job gesendeten Metadaten entscheiden:"
    options:
      - "Das Dashboard Layout"
      - "Feldnamen und Typen — einschließlich, ob ein Datum ein Datum und eine ID eine Dimension ist"
      - "Wer kann die Daten sehen"
      - "Der Aktualisierungsplan"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-loading-data-3"
    q: "Ein Upload-Job, der niemals vollständige Ergebnisse signalisiert:"
    options:
      - "Automatisches Laden nach einem Timeout"
      - "Teile sitzen in einem unvollständigen Job und kein Datensatz erscheint, ohne offensichtlichen Fehler"
      - "Teildatensatz"
      - "Ein sofortiges Versagen"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-python-end-to-end-1"
    q: "Wo sollten die Anmeldeinformationen des Integrationsbenutzers in einem Python-Job leben?"
    options:
      - "Ganz oben im Drehbuch"
      - "In Umgebungsvariablen aus einem geheimen Speicher"
      - "In einer Config-Datei im Repository"
      - "In einer Notebookzelle"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-python-end-to-end-2"
    q: "Nachdem eine Ladung abgeschlossen ist, sollte der Job:"
    options:
      - "Sofortige Ausfahrt"
      - "Überprüfen Sie die Zeilenzählung des Datasets gegen das, was gesendet wurde"
      - "Löschen der Quelldatei"
      - "Aktualisieren Sie jedes Dashboard"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-python-end-to-end-3"
    q: "Warum den Upload hacken, anstatt eine Nutzlast zu senden?"
    options:
      - "Es wird vom teilbasierten Upload-Flow benötigt und hält individuelle Anfragen innerhalb der Größengrenzen"
      - "Es ist schneller zu schreiben"
      - "Es verbessert die Kompression"
      - "Authentifizierung vermeiden"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-automation-and-deployment-1"
    q: "Ein geplanter Job scheitert um 02:00 Uhr. Die wichtigste Designentscheidung ist:"
    options:
      - "Wie schnell es versucht"
      - "Ob jemand den Fehler sieht - ein Job, der in ein ungelesenes Protokoll scheitert, ist ein Job, der nicht ausgeführt wird"
      - "In welcher Sprache es geschrieben ist"
      - "Wie es formatiert ist"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-automation-and-deployment-2"
    q: "Der Export von Dashboard-Metadaten nach einem Zeitplan gibt Ihnen:"
    options:
      - "Schnellere Dashboards"
      - "Eine Change History - diffable Aufzeichnungen darüber, was sich bewegt hat und wann"
      - "Bessere Sicherheit"
      - "Mehr API Zulage"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-graded-quiz-1"
    q: "API Anträge CRM Analytics unterliegen:"
    options:
      - "Keine Sicherheitskontrollen"
      - "Die authentifizierten Benutzerberechtigungen und Sicherheit auf Zeilenebene"
      - "Nur org-weite Ausfälle"
      - "Eine separate Analytics-only-Richtlinie"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-graded-quiz-2"
    q: "Die externe Daten-Upload-Sequenz ist:"
    options:
      - "Upload, dann deklarieren"
      - "Deklarieren, Upload in Teilen, Signalvervollständigung"
      - "Eine Anfrage mit der gesamten Datei"
      - "Zeile für Zeile"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-graded-quiz-3"
    q: "Ein Upload-Job signalisierte nie vollständige Ergebnisse in:"
    options:
      - "Automatisches Laden nach einem Timeout"
      - "Kein Datensatz, kein Fehler - die Teile sitzen einfach da"
      - "Teildatensatz"
      - "Ein sofortiges Versagen"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-graded-quiz-4"
    q: "Die mit einem Load gesendeten Metadaten entscheiden:"
    options:
      - "Teilen"
      - "Feldnamen und Typen"
      - "Zeitplan"
      - "Kartenformatierung"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-graded-quiz-5"
    q: "Das Hauptrisiko des Inkremental Upserts ist:"
    options:
      - "Es ist langsamer"
      - "Stille Drift, wenn eine Änderung verpasst wird - nichts Fehler, die Daten sind nur leicht falsch"
      - "Es kann nicht mit Löschungen umgehen"
      - "Es braucht mehr API Anrufe"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-graded-quiz-6"
    q: "Die Nummer eines Skripts unterscheidet sich von der des Dashboards. Überprüfen Sie zuerst:"
    options:
      - "Die API Version"
      - "Ob beide als derselbe Benutzer laufen"
      - "Der Charttyp"
      - "Der Browser"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-graded-quiz-7"
    q: "Ein Versöhnungsjob sollte Folgendes verwenden:"
    options:
      - "Relative Datumsbereiche, um aktuell zu bleiben"
      - "Angeheftete absolute Daten auf beiden Seiten"
      - "Kein Datumsfilter"
      - "Aktuelle Auswahl des Dashboards"
    answer: 1
    topic: "apis-and-automation"
  - id: "apis-and-automation-graded-quiz-8"
    q: "Der Export von Dashboard-Metadaten nach einem Zeitplan bietet Ihnen in erster Linie:"
    options:
      - "Leistung"
      - "Eine diffable Change History"
      - "Extra API Zulage"
      - "Automatische Inbetriebnahme"
    answer: 1
    topic: "apis-and-automation"
---

Übungsfragen für die Admin-Domain des CRM Analytics und Einstein Discovery Beraterprüfung.
