---
title: "Quel est le piège avec `!=` dans un filtre ?"
description: "C'est nul aussi. L'étape de filtrage non égale à Close Lost supprime également chaque ligne où l'étape est vide — souvent les lignes avec un problème de qualité des données..."
type: "conceptual"
topic: "saql"
level: "junior"
source: "academy"
---

C'est nul aussi. L'étape de filtrage non égale à Close Lost supprime également chaque ligne où l'étape est vide — souvent les lignes avec un problème de qualité des données à voir. Rien d'erreur, le total tombe. Si je veux dire "tout sauf X, y compris les inconnus", je l'écris explicitement.
