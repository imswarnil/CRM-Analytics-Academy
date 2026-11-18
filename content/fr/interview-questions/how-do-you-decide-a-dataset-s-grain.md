---
title: "Comment décidez-vous le grain d'un jeu de données ?"
description: "Des questions qu'il doit répondre, écrit d'abord. La meilleure question pose le grain — si quelque chose concerne des transactions individuelles, c'est une rangée par..."
type: "conceptual"
topic: "datasets-and-modelling"
level: "junior"
source: "academy"
---

Des questions qu'il doit répondre, écrit d'abord. La meilleure question pose le problème — si quelque chose concerne des transactions individuelles, c'est une ligne par transaction. Si chaque question est des totaux mensuels par segment, il peut être pré-agrégé, ce qui est beaucoup plus rapide et en permanence incapable de répondre à quelque chose en dessous de cela. Et quand deux publics ont vraiment besoin de grains différents, c'est-à-dire deux ensembles de données, généralement d'une recette avec deux sorties, la logique est encore définie une fois.
