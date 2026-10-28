---
title: "Suppression ou augmentation progressive ?"
description: "Récupérer jusqu'à ce que le volume le rend mal. Il s'agit d'une auto-corrigation — une mauvaise course est fixée par la prochaine bonne — n'a pas besoin de clé et ne peut dériver. Incrémental upsert..."
type: "conceptual"
topic: "apis-and-automation"
level: "senior"
source: "academy"
---

Récupérer jusqu'à ce que le volume le rend mal. Il s'agit d'une auto-corrigation — une mauvaise course est fixée par la prochaine bonne — n'a pas besoin de clé et ne peut dériver. La mise à niveau progressive est nécessaire à l'échelle et elle dérive silencieusement lorsqu'un changement est manqué : rien d'erreur, l'ensemble de données est juste légèrement erroné indéfiniment. Donc si je vais incrémental, j'ajoute un rapprochement périodique complet, sinon j'ai échangé un coût visible contre un coût invisible.
