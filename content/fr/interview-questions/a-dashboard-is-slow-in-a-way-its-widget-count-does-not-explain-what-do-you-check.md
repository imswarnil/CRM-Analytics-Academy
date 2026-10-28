---
title: "Un tableau de bord est lent d'une certaine manière son compte de widget n'explique pas. Qu'est-ce que tu vérifies ?"
description: "Reliure des résultats enchaînés. Chacun sérialise ce qui autrement fonctionnerait en parallèle, donc trois dans une chaîne signifie que le dernier widget attend sur deux tours..."
type: "scenario"
topic: "bindings"
level: "junior"
source: "academy"
---

Reliure des résultats enchaînés. Chacun sérialise ce qui autrement fonctionnerait en parallèle, donc trois dans une chaîne signifie le dernier widget attend sur deux voyages ronds. Rien à l'écran ne suggère que la dépendance existe. Après cela, je vérifie si les widgets qui pourraient partager une requête ont chacun leur propre, et si quelque chose regroupe un grain très fin sur chaque charge.
