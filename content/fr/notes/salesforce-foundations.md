---
title: "Salesforce Fondations — Notes"
description: "Objets, champs, relations et conversion de plomb sur une page : le modèle de données chaque CRM Analytics tableau de bord est construit sur."
section: "foundations"
lessons: 1
---

## 1 · Les objets sont des tableaux

**Objet** = un tableau **enregistrement** = une ligne **champ** = une colonne.

- Objets standard Salesforce: Responsable, Compte, Contact, Opportunité, Campagne, Cas
- Les objets personnalisés finissent par `__c` (par exemple : `Subscription__c`)

| Objet | Un disque est... |
|---|---|
| Plomb | une personne non encore qualifiée |
| Compte | une société |
| Coordonnées | une personne sur un compte |
| Possibilités | un marché, avec montant + étape |

## 2 · Les types de champs décident de ce qu'un graphique peut faire

- **Dimensions** — texte, sélection → groupe et filtre
- **Mesures** — nombres, monnaie → somme, moyenne, nombre
- **Dates** — mettre sur un axe temporel, comparer les périodes

> Attention : un champ « recettes » stocké comme texte ne peut pas être résumé. Vérifiez d'abord le type !

## 3 · Relations

- **Recherche** — lâche. L'enfant peut vivre seul, a son propre partage. *Opportunité → Campagne*
- **Master-detail** — serré. L'enfant meurt avec le parent, hérite du partage, le parent obtient des résumés
- **Beaucoup à beaucoup** — a besoin d'un objet de jonction. *Opportunité de contact* par **Opportunité Rôle de contact**

## 4 · Conversion du plomb

::hand-chart{type="flow" title="One Lead, three records"}
---
labels:
  - "Plomb"
  - "Compte"
  - "Coordonnées"
  - "Possibilités"
---
::

Le plomb converti garde `ConvertedAccountId`, `ConvertedContactId`, `ConvertedOpportunityId` → voilà ce qui fait **analyse entonnoir** possible.

## 5 · Ids, jamais noms

- 15 caractères (sensible au cas par cas) ou **18** (insensible au cas par cas)
- Première 3 = objet: `001` Compte · `003` Personne à contacter `006` Possibilité · `00Q` Plomb
- Chaque recette rejoint des matches sur un **Idée** — les noms répètent et changent

## 6 · Comment CRM Analytics le lit

::hand-chart{type="flow" title="Objects to dashboard"}
---
labels:
  - "Objets"
  - "Synchronisation des données"
  - "Recette"
  - "Ensemble de données"
  - "Tableau de bord"
---
::

Demande de tableaux de bord **ensembles de données**, ne jamais objecter directement. Choisissez la **grains** d'abord: une ligne par opportunité, par compte, ou par plomb.
