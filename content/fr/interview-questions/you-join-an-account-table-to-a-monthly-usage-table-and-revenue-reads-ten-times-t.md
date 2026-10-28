---
title: "Vous rejoignez une table de compte à une table d'utilisation mensuelle et les revenus sont dix fois trop élevés. Que s'est-il passé ?"
description: "Débarrassez-vous. La table de compte est une ligne par compte et la table d'utilisation est une ligne par compte par produit par mois, donc après l'adhésion chaque compte apparaît..."
type: "scenario"
topic: "gtm-engineering"
level: "mid"
source: "academy"
---

Débarrassez-vous. La table de compte est d'une ligne par compte et la table d'utilisation est d'une ligne par compte par produit par mois, de sorte qu'après l'adhésion chaque compte apparaît une fois par ligne d'utilisation — jusqu'à 54 fois pour un compte de trois produits sur dix-huit mois. La colonne ARR n'est pas erronée sur une ligne individuelle, elle est répétée, et la somme multiplie. La correction consiste à agréger le côté usage pour d'abord comptabiliser le grain — les revenus facturés en somme, l'utilisation moyenne, prendre le dernier état de commit — et ensuite se joindre, ce qui maintient la production à une ligne par compte. L'habitude qui l'attrape est d'affirmer le nombre de lignes après chaque jointure: si l'ensemble de données de compte ne sort pas au nombre de comptes que j'ai commencé avec, j'ai aspiré. Je garde aussi quelques totaux d'ancrage mémorisés, de sorte qu'un nombre absurde est évident en un coup d'oeil.
