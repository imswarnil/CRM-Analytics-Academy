---
title: "Pourquoi un prédicat de la hiérarchie a besoin d'un noeud aplati ?"
description: "Parce qu'un prédicat est une comparaison et une hiérarchie est un arbre, et une comparaison ne peut pas marcher un arbre au moment de la requête. Le nœud aplati précompte chaque rôle..."
type: "conceptual"
topic: "setup"
level: "senior"
source: "academy"
---

Parce qu'un prédicat est une comparaison et une hiérarchie est un arbre, et une comparaison ne peut pas marcher un arbre au moment de la requête. Le nœud aplati précompte l'ascendance de chaque rôle dans une colonne de chemin au moment de la recette, et le prédicat demande si le rôle du spectateur apparaît dans ce chemin. C'est aussi la raison concrète pour laquelle la sécurité doit être conçue avant le modèle de données : la règle a besoin d'une colonne, la colonne a besoin d'un nœud de recette, et le noeud a besoin de champs qui doivent être synchronisés.
