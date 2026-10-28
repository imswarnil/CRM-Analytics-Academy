---
title: "Un tableau de bord prend douze secondes pour charger. Par où tu commences ?"
description: "Comptez les requêtes distinctes plutôt que les widgets. Un écran avec douze widgets qui pourrait partager quatre requêtes est généralement tout le problème, et..."
type: "conceptual"
topic: "designing-dashboards"
level: "junior"
source: "academy"
---

Comptez les requêtes distinctes plutôt que les widgets. Un écran avec douze widgets qui pourraient partager quatre requêtes est généralement tout le problème, et la consolidation ne change rien à son apparence. Puis s'il regroupe un grain très fin au moment de la requête, ce qui est un cas pour pré-agrégation dans la recette si beaucoup de gens l'ouvrent chaque jour. Puis de larges tables, qui sont lentes et illisibles en même temps. Et je mesure comme un utilisateur normal, parce que mon compte admin peut sauter l'évaluation de sécurité qu'un vrai spectateur paie pour chaque requête.
