---
title: "Pourquoi stocker un instantané ARR plutôt que de calculer ARR à la volée ?"
description: "Parce que le moment où quelqu'un demande ce qu'était ARR en mars, une table qui ne sait que l'état d'aujourd'hui ne peut pas répondre, et la reconstruire signifie deviner à..."
type: "conceptual"
topic: "gtm-engineering"
level: "mid"
source: "academy"
---

Parce que le moment où quelqu'un demande ce qu'était ARR en mars, une table qui sait seulement l'état d'aujourd'hui ne peut pas répondre, et la reconstruire signifie deviner à quel contrat avait commencé et qui avait expiré. Un instantané mensuel par compte, avec le type de mouvement qui explique le changement — nouveau, expansion, contraction, churn — rend la chute des revenus et la rétention des revenus nets simple, et il rend les chiffres historiques stables ainsi un graphique que vous avez montré le conseil le trimestre dernier dit toujours la même chose. Le coût est un travail programmé et la discipline de ne pas le remplacer. C'est un bon métier : l'histoire qui bouge est pire qu'aucune histoire, parce que les gens remarquent et cessent de faire confiance à tout ce que vous publiez.
