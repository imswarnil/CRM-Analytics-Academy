---
title: "Sicherheit — praktische Fragen"
domain: "security"
quiz:
  - id: "setup-index-1"
    q: "Warum CRM Analytics Zugriff durch Berechtigungssätze statt Profile?"
    options:
      - "Profile sind veraltet"
      - "Analytics-Berechtigungen werden als Berechtigungssatzlizenzen ausgeliefert, die additiv gewährt werden, so dass der Zugriff in einem Profil erstellt und nicht gebacken wird"
      - "Profile können keinen Objektzugriff gewähren"
      - "Es ist ein Lizenz-Bug"
    answer: 1
    topic: "setup"
  - id: "setup-index-2"
    q: "Ein Dashboard ist für Sie korrekt und für das Verkaufsteam leer. Die wahrscheinlichste Ursache ist:"
    options:
      - "Eine defekte Widget-Abfrage"
      - "Row-Level-Sicherheit - das Prädikat oder die gemeinsame Vererbung filtert ihre Zeilen weg"
      - "Der Datensatz konnte nicht aktualisiert werden"
      - "Sie brauchen einen anderen Browser"
    answer: 1
    topic: "setup"
  - id: "setup-index-3"
    q: "Wann sollte Sicherheit entworfen werden?"
    options:
      - "Nachdem die Dashboards genehmigt wurden"
      - "Bevor der erste Datensatz erstellt wird, hängt das Prädikat von Feldern ab, die synchronisiert werden müssen, und manchmal von einem Rezeptknoten, der die Rollenhierarchie flacher macht."
      - "Nur wenn die Daten sensibel sind"
      - "Es ist automatisch"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-1"
    q: "Ein Systemadministrator kann die Analytics Studio Fliesen. Was ist falsch?"
    options:
      - "Ihr Profil ist falsch konfiguriert"
      - "Nichts ist falsch - CRM Analytics Der Zugriff erfolgt über die Berechtigungseinstellung, und die Administratorrechte enthalten sie nicht"
      - "Die Org hat keine Daten"
      - "Sie müssen ein Salesforce Plattformnutzer"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-2"
    q: "Welche Fähigkeit sitzt in der höheren (Plus) Ebene statt der Basis?"
    options:
      - "Gebäude-Dashboards"
      - "Einstein Discovery — Trainingsgeschichten und Einsatz prädiktiver Modelle"
      - "Erstellung von Datasets"
      - "Teilen einer App"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-3"
    q: "Der schnellste Weg, um herauszufinden, was einem Benutzer fehlt, ist:"
    options:
      - "Vergleichen Sie ihr Profil mit Ihrem"
      - "Öffnen Sie ihre Benutzeraufzeichnung und lesen Sie die Berechtigungszuweisungen, dann überprüfen Sie die Lizenzberechtigungen der Organisation"
      - "Bauen Sie das Dashboard neu auf"
      - "Bitten Sie sie, sich anzumelden und einzuloggen"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-1"
    q: "Dem Integrationsbenutzer fehlt der Zugriff auf Feldebene auf Discount  c. Was passiert?"
    options:
      - "Die Synchronisierung scheitert mit einem Fehler"
      - "Das Feld kommt nie an; das Rezept und Dashboard bauen sauber und leise Zahlen ohne Rabatte berechnet"
      - "Das Feld kommt leer an und wird markiert"
      - "Salesforce gewährt automatisch Zugriff"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-2"
    q: "Warum ist dieses Versagen besonders gefährlich?"
    options:
      - "Es korrumpiert den Datensatz"
      - "Es ist still und produziert plausible Zahlen, also überlebt es die Überprüfung"
      - "Es löscht Aufzeichnungen"
      - "Es betrifft nur Administratoren"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-3"
    q: "Ein neues benutzerdefiniertes Feld wurde letzten Monat hinzugefügt, ist aber nicht im Datensatz. Das erste, was zu überprüfen?"
    options:
      - "Die Widgetabfrage des Dashboards"
      - "Ob das Feld zur Datensynchronisierungsauswahl hinzugefügt wurde UND für den Integrationsbenutzer sichtbar ist"
      - "Das Sicherheitsprädikat"
      - "Die App Sharing Einstellungen"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-1"
    q: "Wo wird ein Sicherheitsprädikat angewandt?"
    options:
      - "Auf jedem Widget zum Designzeitpunkt"
      - "Auf dem Datensatz, zur Abfragezeit, pro Viewer"
      - "Im Rezept, zur Bauzeit"
      - "In den Sharing-Einstellungen der App"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-2"
    q: "Warum braucht ein Rollenhierarchieprädikat normalerweise einen \"flachen\" Knoten im Rezept?"
    options:
      - "Verringern der Zeilenzahl"
      - "Da ein Prädikat die Hierarchie zur Abfragezeit nicht durchlaufen kann - die Abstammung muss in einer Spalte vorberechnet werden, mit der es vergleichen kann"
      - "Um die Daten zu sortieren"
      - "Es tut nicht; Flatten ist optional Styling"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-3"
    q: "Sie fügen ein Prädikat hinzu und Ihre eigenen Dashboards werden leer. Die wahrscheinlichste Erklärung ist:"
    options:
      - "Der Datensatz ist korrupt"
      - "Das Prädikat wird auch für Sie bewertet, und Ihr Benutzer erfüllt es nicht"
      - "Das Rezept ist gescheitert"
      - "Predicates funktionieren nur für Admins"
    answer: 1
    topic: "setup"
  - id: "setup-sharing-inheritance-1"
    q: "Was ist der Hauptvorteil der gemeinsamen Vererbung gegenüber einem handgeschriebenen Prädikat?"
    options:
      - "Schneller abfragen"
      - "Es verwendet die bestehende Freigabe der Organisation wieder, so dass Analysen nicht aus dem CRM driften können, wenn sich das Unternehmen neu organisiert"
      - "Unterstützt mehr Objekte"
      - "Es beseitigt die Notwendigkeit für den Integrationsbenutzer"
    answer: 1
    topic: "setup"
  - id: "setup-sharing-inheritance-2"
    q: "Warum braucht das Teilen von Vererbung ein Fallback-Prädikat?"
    options:
      - "Nur für Nicht-Salesforce-Daten"
      - "Da die Vererbung Grenzen hat - wenn das Teilen eines Benutzers zu komplex ist, um es zu bewerten, entscheidet der Fallback, was er sieht"
      - "Um das Dashboard zu beschleunigen"
      - "Es braucht keinen"
    answer: 1
    topic: "setup"
  - id: "setup-org-settings-and-rollout-1"
    q: "Eine neue CRM Analytics Feature Toggle erscheint nach einem Release. Wo sollten Sie es zuerst aktivieren?"
    options:
      - "Produktion, so profitieren sofort alle"
      - "Eine Sandbox oder eine Entwicklerorganisation, bei der eine Verhaltensänderung kein Live-Dashboard beeinflussen kann"
      - "Nirgendwo – niemals neue Features aktivieren"
      - "Es macht keinen Unterschied"
    answer: 1
    topic: "setup"
  - id: "setup-org-settings-and-rollout-2"
    q: "Was ist die richtige erste Zielgruppe für ein neues Dashboard?"
    options:
      - "Das gesamte Unternehmen, um das Feedback zu maximieren"
      - "Zwei oder drei Personen, die tatsächlich die Entscheidung treffen, die sie unterstützt"
      - "Nur Führungskräfte"
      - "Niemand – schweigend veröffentlichen"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-1"
    q: "Wo ist das Sicherheitsprädikat konfiguriert?"
    options:
      - "Auf dem Armaturenbrett"
      - "Zum Datensatz"
      - "In der App"
      - "Zum Benutzerprofil"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-2"
    q: "Ihr eigenes Dashboard wird leer, nachdem Sie ein Prädikat hinzugefügt haben. Was ist passiert?"
    options:
      - "Der Datensatz brach"
      - "Das Prädikat gilt auch für Sie und Ihr Benutzer erfüllt es nicht"
      - "Vorhersagen Deaktivieren Dashboards"
      - "Das Rezept muss wiederholt werden"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-3"
    q: "Das Regionsfeld eines Benutzers ist leer. Was sehen sie?"
    options:
      - "Alles"
      - "Nichts - eine Null scheitert geschlossen"
      - "Nur eigene Aufzeichnungen"
      - "Eine Fehlermeldung"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-1"
    q: "Ein Systemadministrator hat keine Analytics Studio Fliesen. Warum?"
    options:
      - "Ihr Profil ist gebrochen"
      - "CRM Analytics Zugriff erfolgt durch Berechtigungseinstellung; Admin-Rechte enthalten es nicht"
      - "Die Org hat keine Daten"
      - "Sie müssen ein Plattformbenutzer sein"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-2"
    q: "Einstein Discovery erfordert:"
    options:
      - "Das Basiswachstums-Tier"
      - "Das höhere Plus Tier"
      - "Keine Lizenz überhaupt"
      - "Eine separate Tableau-Lizenz"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-3"
    q: "Der Integrationsbenutzer kann ein benutzerdefiniertes Feld nicht sehen. Was passiert?"
    options:
      - "Die Sync schlägt laut aus"
      - "Das Feld kommt nie an, alles flussabwärts baut sauber, und die Zahlen sind leise unvollständig"
      - "Das Feld kommt als Null an und wird gekennzeichnet"
      - "Der Zugang wird automatisch gewährt"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-4"
    q: "Wo wird ein Sicherheitsprädikat angewandt?"
    options:
      - "Auf dem Dashboard zur Designzeit"
      - "Auf dem Datensatz, pro Viewer, zur Abfragezeit"
      - "Im Rezept zur Bauzeit"
      - "Über das Teilen der App"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-5"
    q: "Sie fügen ein Prädikat hinzu und Ihre eigenen Dashboards werden leer. Warum?"
    options:
      - "Der Datensatz ist korrupt"
      - "Das Prädikat wird auch für Sie bewertet und Ihr Benutzer erfüllt es nicht"
      - "Vorhersagen Deaktivieren Admin-Zugriff dauerhaft"
      - "Das Rezept muss wiederholt werden"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-6"
    q: "Das Prädikatfeld eines Benutzers ist leer. Was sehen sie?"
    options:
      - "Alles"
      - "Nichts — Nullen scheitern geschlossen"
      - "Ihre eigenen Aufzeichnungen"
      - "Ein Fehler"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-7"
    q: "Warum braucht ein Rollenhierarchieprädikat einen flachen Knoten?"
    options:
      - "Verringern der Datensatzgröße"
      - "Ein Prädikat kann zur Abfragezeit keine Hierarchie durchlaufen, daher wird die Abstammung in eine vergleichbare Spalte vorberechnet"
      - "Rollen alphabetisch sortieren"
      - "Es ist nicht"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-8"
    q: "Der Hauptvorteil der gemeinsamen Vererbung gegenüber einem handgeschriebenen Prädikat ist:"
    options:
      - "Schnellere Abfragen"
      - "Es verwendet die bestehende Freigabe der Org wieder, so dass Analysen nicht driften können, wenn sich das Unternehmen neu organisiert"
      - "Es funktioniert mit allen externen Daten"
      - "Es beseitigt die Notwendigkeit eines Integrationsbenutzers"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-9"
    q: "Warum braucht das Teilen von Vererbung ein Fallback-Prädikat?"
    options:
      - "für Leistung"
      - "Weil Vererbung Grenzen hat und etwas entscheiden muss, was ein Betrachter sieht, wenn es nicht bewertet werden kann"
      - "Zur Unterstützung von Dashboards"
      - "Es ist nicht"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-10"
    q: "Bevor Sie ein gesichertes Dashboard freigeben, sollten Sie:"
    options:
      - "Überprüfen Sie es als Administrator"
      - "Überprüfen Sie es als eingeschränkten Benutzer, einen Manager und jemanden, der nichts sehen sollte"
      - "Exportieren Sie es in eine Tabelle"
      - "Aktivieren Sie jeden Feature Toggle"
    answer: 1
    topic: "setup"
---

Praxisfragen für die Sicherheitsdomäne des CRM Analytics und Einstein Discovery Beraterprüfung.
