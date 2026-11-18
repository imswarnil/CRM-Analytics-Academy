---
title: "Quel est le piège avec la requête d'un instantané?"
description: "La même entité apparaît plusieurs fois par conception — une ligne par compte par mois. Summing ARR sur toutes les lignes d'un instantané de 18 mois donne dix-huit..."
type: "technical"
topic: "datasets-and-modelling"
level: "senior"
source: "academy"
---

La même entité apparaît plusieurs fois par conception — une ligne par compte par mois. Le cumul de l'ARR sur toutes les lignes d'un instantané de dix-huit mois donne dix-huit ans de revenus. Chaque requête contre une doit choisir un mois ou un groupe par une, et 'current' est un filtre plutôt qu'une propriété.
