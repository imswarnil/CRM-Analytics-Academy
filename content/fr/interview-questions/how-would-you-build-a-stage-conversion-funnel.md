---
title: "Comment construireiez-vous un entonnoir de conversion ?"
description: "En tant que cohorte, pas un instantané. Un instantané compte ce qui se passe à chaque étape en ce moment, ce qui n'est pas un taux de conversion du tout — dans un pipeline en pleine croissance..."
type: "conceptual"
topic: "pipeline-analytics"
level: "mid"
source: "academy"
---

En tant que cohorte, pas un instantané. Un instantané compte ce qui se passe dans chaque étape en ce moment, ce qui n'est pas du tout un taux de conversion — dans un pipeline en croissance, il rend la conversion en fin de phase horrible simplement parce que les accords n'y sont pas encore arrivés. Donc, je prendrais des occasions créées dans une période et les suivrais, en comptant combien jamais atteint chaque étape plutôt que où ils sont maintenant, parce qu'un accord actuellement en négociation a passé par la découverte et en comptant seulement l'étape actuelle sous-estime chaque étape tôt. Ensuite, j'exclus les cohortes de moins d'un cycle de vente, et je le fais par segment, puisque 28 jours pour SMB et 186 pour stratégique sont des fenêtres complètement différentes. Et je la construisais deux fois — en nombre et en valeur — parce que l'étape qui perd le plus d'affaires n'est généralement pas l'étape qui perd le plus d'argent, et seul l'entonnoir de valeur montre où les revenus réellement fuit.
