---
title: "Quand est-ce que tu modéliserais longtemps plutôt que largement ?"
description: "Quand les métriques sont souvent ajoutées, ou quand je veux qu'un widget trace l'un d'eux via un filtre — de nouvelles métriques deviennent de nouvelles lignes plutôt qu'un changement de schéma et un..."
type: "conceptual"
topic: "datasets-and-modelling"
level: "junior"
source: "academy"
---

Quand les métriques sont souvent ajoutées, ou quand je veux qu'un widget trace n'importe lequel d'eux via un filtre, de nouvelles métriques deviennent de nouvelles lignes plutôt qu'un changement de schéma et une reconstruction. Le coût est que chaque requête doit filtrer à une métrique, et une requête qui oublie ajoute des revenus pour traiter le compte au taux de conversion et retourne un nombre sans erreur. Donc si je modélise longtemps, le filtre métrique va dans la requête de base plutôt que d'être laissé à chaque constructeur pour se souvenir.
