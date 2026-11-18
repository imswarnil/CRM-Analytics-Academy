---
title: "Comment faire SAQL différent de SQL?"
description: "C'est une transformation de flux plutôt qu'une requête déclarative. Chaque instruction prend le résultat précédent et le transforme, réassignant la même variable,..."
type: "technical"
topic: "saql"
level: "junior"
source: "academy"
---

C'est une transformation de flux plutôt qu'une requête déclarative. Chaque instruction prend le résultat précédent et le transforme en réassignant la même variable, de sorte que l'ordre de l'instruction est littéralement le plan qui tourne — il n'y a pas d'optimisation de la réorganisation. Pratiquement cela signifie filtrer tôt plutôt que tard, parce que filtrer après un groupe signifie agréger les lignes que j'étais sur le point de jeter. L'autre différence qui mord est de citer: guillemets simples pour les noms de champs, guillemets doubles pour les valeurs de chaînes.
