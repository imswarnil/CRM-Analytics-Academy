---
title: "Quelqu'un dit que l'ensemble de données a des doublons. Tu fais quoi ?"
description: "Faites ce qu'ils veulent dire. Habituellement c'est un artefact de jointure — des lignes multipliées par une jointure d'un à plusieurs, où les enregistrements sont bons et la requête..."
type: "conceptual"
topic: "data-preparation"
level: "junior"
source: "academy"
---

Faites ce qu'ils veulent dire. Habituellement, c'est un artefact de jointure — des lignes multipliées par une jointure d'un à plusieurs, où les enregistrements sont bons et la requête est erronée, et la correction est la jointure plutôt qu'une étape de déduplication. Parfois c'est le grain prévu, comme un compte apparaissant une fois par mois dans un instantané. Ce n'est que de temps à autre que des copies authentiques. Supprimer les lignes pour fixer un fan-out réduit le total donc il semble qu'il ait fonctionné, tout en supprimant les données réelles et en laissant la mauvaise jointure en place pour la prochaine mesure à frapper.
