---
title: "Reliure de sélection ou reliure de résultats — quelle est la différence pratique?"
description: "Une reliure de sélection lit ce que quelqu'un a cliqué, donc l'entrée est visible à l'écran et elle est débogable en regardant. Une liaison de résultats lit une valeur..."
type: "technical"
topic: "bindings"
level: "junior"
source: "academy"
---

Une reliure de sélection lit ce que quelqu'un a cliqué, donc l'entrée est visible à l'écran et elle est débogable en regardant. Une liaison de résultats lit une valeur une autre requête retournée — une moyenne de l'entreprise, un max, une catégorie supérieure — qui est plus puissante et beaucoup plus difficile à déboguer, parce que l'entrée est invisible. Il crée également un ordre d'exécution : le widget dépendant ne peut pas démarrer jusqu'à ce que la source retourne, donc deux requêtes parallèles deviennent deux requêtes séquentielles.
