---
title: "Un utilisateur dit que le tableau de bord manque des enregistrements qu'il sait exister. Où regardez-vous ?"
description: "Points manquants plutôt que dupliqués en amont, et aux permissions plutôt qu'au tableau de bord. D'abord l'utilisateur d'intégration: sync fonctionne comme cet utilisateur, donc un..."
type: "scenario"
topic: "foundations"
level: "junior"
source: "academy"
---

Points manquants plutôt que dupliqués en amont, et aux permissions plutôt qu'au tableau de bord. D'abord l'utilisateur d'intégration : sync fonctionne en tant qu'utilisateur, de sorte qu'un objet ou un champ qu'il ne peut voir n'arrive jamais, silencieusement. Ensuite, la sécurité prédicat et partage l'héritage, qui filtre ce que chaque spectateur voit. Ensuite, la recette, pour une jointure intérieure qui a laissé tomber des enregistrements inégalés ou un filtre plus étroit que prévu. Le tableau de bord est le dernier — il rapporte habituellement fidèlement ce qu'il a été donné.
