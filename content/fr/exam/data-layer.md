---
title: "Couche de données — questions pratiques"
domain: "data-layer"
quiz:
  - id: "foundations-index-1"
    q: "Quel est l'argument le plus fort pour CRM Analytics sur un outil de BI à usage général?"
    options:
      - "Ses graphiques semblent mieux"
      - "Elle hérite SalesforceLe modèle de partage et de sécurité, donc qui voit ce qui est déjà résolu"
      - "C'est moins cher"
      - "C'est le seul outil qui peut lire Salesforce données"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-2"
    q: "Un ensemble de données CRM Analytics est mieux décrit comme:"
    options:
      - "Une vue en direct sur Salesforce objets"
      - "Un instantané matérialisé et colonnelaire reconstruit sur un calendrier"
      - "Un rapport enregistré"
      - "A SQL vous pouvez écrire à"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-3"
    q: "Votre VP veut un écran montrant la profondeur de la file d'attente du centre d'appels toutes les quelques secondes. Est CRM Analytics Le bon outil ?"
    options:
      - "Oui, avec un calendrier de recettes assez rapide"
      - "Non — il se rafraîchit sur un calendrier, pas un flux; c'est un besoin opérationnel, pas un besoin analytique"
      - "Oui, si vous utilisez Einstein Discovery"
      - "Seulement avec une licence Plus"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-1"
    q: "Quelle couche possède la définition de « pipeline qualifié »?"
    options:
      - "La couche de conception, parce que c'est là que le nombre est affiché"
      - "La couche de données, parce qu'un tableau de bord métrique défini est un tableau de bord métrique deux"
      - "La couche de renseignement"
      - "Quelle que soit l'équipe qui demande en premier"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-2"
    q: "Un tableau de bord est lent. Quelle couche devriez-vous soupçonner d'abord ?"
    options:
      - "La couche de conception — trop de widgets"
      - "La couche de données — un ensemble de données au mauvais grain forçant chaque widget à agréger des millions de lignes"
      - "La couche de renseignement"
      - "Le réseau"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-3"
    q: "Einstein Discovery produit un modèle qui est 78% précis. Que doit la couche d'intelligence à la couche de conception?"
    options:
      - "La prédiction seulement"
      - "La prédiction, la confiance et les principaux facteurs — un score sans raison ne peut être appliqué"
      - "Données sur la formation"
      - "Rien; la précision est suffisante"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-1"
    q: "Que signifie \"le grain\" d'un ensemble de données?"
    options:
      - "Combien de données il détient"
      - "Que représente exactement une ligne"
      - "Combien de fois elle rafraîchit"
      - "Quels domaines sont les mesures"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-2"
    q: "Vous rejoignez les opportunités (608 lignes) vers opportunity products (1 192 lignes) et la somme Montant. Qu'est-ce qui se passe ?"
    options:
      - "Rien — la somme est correcte"
      - "Le montant est compté une fois par ligne de produits, de sorte que les recettes totales sont gonflées — ici il est presque triple"
      - "La jointure échoue"
      - "Seules les lignes correspondantes sont résumées, de sorte que les recettes diminuent"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-3"
    q: "Pourquoi un ensemble de données tient historique que le Salesforce objet n'est pas?"
    options:
      - "Salesforce supprime les anciens enregistrements"
      - "Chaque exécution peut ajouter un instantané d'état à ce moment, alors que l'objet ne détient que ses valeurs actuelles"
      - "Les ensembles de données sont sauvegardés"
      - "Ce n'est pas le cas."
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-1"
    q: "À quoi sert la synchronisation des données (réplication)?"
    options:
      - "Retour à l'écriture des données Salesforce"
      - "Garder une copie locale des objets et des champs sélectionnés à jour, de sorte que les recettes lisent à partir de lui au lieu de frapper la source chaque exécution"
      - "Calendrier des tableaux de bord"
      - "Chiffrement des ensembles de données"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-2"
    q: "Une recette échoue. Où regardez-vous ?"
    options:
      - "L'inspecteur du tableau de bord"
      - "Data Manager → Surveiller"
      - "Configuration → Analytique → Paramètres"
      - "Les attributs de champ de l'ensemble de données"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-3"
    q: "Pourquoi l'utilisateur d'intégration est-il si important ?"
    options:
      - "Il possède les tableaux de bord"
      - "Sync fonctionne en tant qu'utilisateur, de sorte qu'aucun objet ou champ qu'il ne peut voir n'arrive simplement jamais — sans erreur sur le tableau de bord"
      - "Il paie la licence"
      - "Il planifie les recettes"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-1"
    q: "Une application CRM Analytics est:"
    options:
      - "Une application installée"
      - "Un conteneur pour ensembles de données, lentilles et tableaux de bord, portant les paramètres de partage"
      - "Une expérience mobile"
      - "Un paquet géré"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-2"
    q: "Quelle est la différence pratique entre un objectif et un tableau de bord?"
    options:
      - "Lenses ne peut pas être sauvé"
      - "Un objectif explore un ensemble de données et est un espace de travail jetable; un tableau de bord assemble de nombreuses requêtes, les recouvre ensemble, et est construit pour d'autres personnes"
      - "Les tableaux de bord ne peuvent pas utiliser SAQL"
      - "Aucune"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-3"
    q: "Dans Einstein Discovery, une \"histoire\" est:"
    options:
      - "Un modèle déployé"
      - "L'analyse de ce qui est corrélé avec un résultat, qui peut alors être déployé comme modèle"
      - "Un modèle de tableau de bord"
      - "Un widget texte narratif"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-1"
    q: "Un intervenant demande un tableau de bord qui met à jour « en temps réel ». Quel est le bon premier pas ?"
    options:
      - "Programmer la recette en temps réel"
      - "Demandez quelle décision en est prise et dans quelle mesure elle peut être invalidée avant qu'elle ne soit inutile — la réponse est habituellement mesurée en heures"
      - "Refuser la demande"
      - "Utilisation Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-2"
    q: "La plupart des données de l'entreprise se trouvent dans un entrepôt; Salesforce ne détient que des comptes et des opportunités. Qu'est-ce que ça suggère ?"
    options:
      - "Utilisation CRM Analytics et synchronisez l'entrepôt"
      - "Vous construisez un projet d'entrepôt avec un CRM attaché — un outil BI sur l'entrepôt sera probablement mieux servir"
      - "Utilisation Salesforce Rapports"
      - "Utilisation Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-1"
    q: "Pourquoi ce tableau de bord s'ouvre-t-il avec un seul numéro ARR total ?"
    options:
      - "Pour remplir l'espace en haut"
      - "Donc un spectateur qui ne lit rien d'autre laisse encore avec le titre de l'écran est à propos"
      - "Parce que les widgets nombre chargent plus vite"
      - "Il est requis par Salesforce"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-2"
    q: "Cliquez sur une barre de segment pour filtrer les deux autres widgets. Pourquoi ?"
    options:
      - "Une liaison a été configurée"
      - "Widgets construits sur le même ensemble de données facet par défaut"
      - "Le tableau est un enfant du graphique"
      - "Le revêtement doit toujours être activé manuellement"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-3"
    q: "Le tableau des comptes supérieurs montre 10 lignes plutôt que les 140. La meilleure raison est:"
    options:
      - "Rendement"
      - "La question est de la concentration, et une table que personne ne peut prendre en un coup d'oeil est une exportation de données plutôt qu'un tableau de bord"
      - "Les tableaux sont limités à 10 lignes"
      - "Pour cacher les comptes plus petits"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-1"
    q: "Un ensemble de données CRM Analytics est:"
    options:
      - "Une vue en direct sur Salesforce objets"
      - "Un instantané matérialisé et colonnelaire reconstruit sur un calendrier"
      - "Un sauvé Salesforce rapport"
      - "Une écriture SQL Tableau"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-2"
    q: "L'argument le plus fort pour CRM Analytics sur un outil de BI à usage général est:"
    options:
      - "De meilleurs types de cartes"
      - "Il hérite du modèle de partage et de sécurité de l'org plutôt que de vous faire reconstruire"
      - "Réduction du coût des licences"
      - "C'est la seule façon de lire Salesforce données"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-3"
    q: "Le total des revenus de votre tableau de bord est exactement le double de ce que rapporte la finance. Cause la plus probable:"
    options:
      - "Le prédicat de sécurité"
      - "Une jointure qui s'évanouissait — une mesure parentale répétée sur les rangées d'enfants"
      - "L'ensemble de données n'a pas été actualisé"
      - "Formatage des monnaies"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-4"
    q: "Les utilisateurs signalent des enregistrements manquants qu'ils savent exister. Où regardez-vous ?"
    options:
      - "Les requêtes du widget du tableau de bord"
      - "L'accès de l'utilisateur d'intégration, puis le prédicat de sécurité"
      - "Le type de graphique"
      - "Le thème couleur de l'application"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-5"
    q: "Quelle couche possède la définition d'un métrique comme « pipeline qualifié »?"
    options:
      - "Conception — elle y est affichée"
      - "Données — une métrique définie par tableau de bord est un deux tableaux de bord seront en désaccord sur"
      - "Renseignements"
      - "Quelle que soit l'équipe qui demande en premier"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-6"
    q: "À quoi sert la synchronisation des données?"
    options:
      - "Rédiger les résultats analytiques Salesforce"
      - "Garder une copie locale des objets et des champs sélectionnés à jour afin que les recettes ne frappent pas la source chaque exécution"
      - "Calendrier des courriels du tableau de bord"
      - "Chiffrer les ensembles de données au repos"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-7"
    q: "Une application CRM Analytics est:"
    options:
      - "Un paquet installé"
      - "Un conteneur pour ensembles de données, lentilles et tableaux de bord qui porte les paramètres de partage"
      - "Un client mobile"
      - "Un modèle de tableau de bord"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-8"
    q: "Une recette fonctionne avec succès tous les soirs, mais les données datent toujours d'un jour. La cause la plus probable est :"
    options:
      - "L'ensemble de données est corrompu"
      - "La recette est programmée avant la synchronisation des données elle dépend des finitions"
      - "Le visage est désactivé"
      - "L'utilisateur d'intégration manque d'accès"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-9"
    q: "Votre intervenant a besoin d'une mise à jour d'écran toutes les quelques secondes pour une file d'attente en direct. Vous devriez :"
    options:
      - "Planifier la recette le plus souvent possible"
      - "Dire qu'il s'agit d'une exigence opérationnelle, et non d'une exigence analytique, Salesforce page ou outillage spécialement conçu"
      - "Utilisation Einstein Discovery"
      - "Construisez-le et ajoutez un bouton rafraîchissant"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-10"
    q: "Einstein Discovery déploie un modèle qui note les opportunités. Qu'est-ce qui doit être envoyé avec le score ?"
    options:
      - "Ensemble de données sur la formation"
      - "Les principaux facteurs qui la sous-tendent — une probabilité nue ne donne rien à un représentant pour agir sur"
      - "Les SAQL requête"
      - "Rien d'autre"
    answer: 1
    topic: "foundations"
  - id: "data-preparation-index-1"
    q: "Laquelle de ces données n'est PAS une façon de CRM Analytics Ensemble de données ?"
    options:
      - "A CSV Téléchargement"
      - "Synchronisation des données depuis Salesforce objets transformés par une recette"
      - "Une requête en direct émise par un widget de tableau de bord"
      - "Une connexion externe à un entrepôt, synchronisée et transformée"
    answer: 2
    topic: "data-preparation"
  - id: "data-preparation-index-2"
    q: "Avant de construire une recette, vous devriez être en mesure d'indiquer:"
    options:
      - "Les types de cartes que vous utiliserez"
      - "Que représente exactement une ligne de l'ensemble de données de sortie"
      - "Le thème couleur du tableau de bord"
      - "Combien d'utilisateurs la verront"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-1"
    q: "Pourquoi les recettes sont-elles lues à partir de données synchronisées plutôt qu'à partir de la source de chaque exécution ?"
    options:
      - "Les recettes ne peuvent pas lire Salesforce directement"
      - "Une copie locale est plus rapide et ne met pas le système d'enregistrement sur chaque course"
      - "Les données synchronisées sont plus précises"
      - "C'est une exigence de licence"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-2"
    q: "Une recette réussit la nuit mais montre toujours les données d'hier. La cause la plus probable est:"
    options:
      - "Un ensemble de données corrompu"
      - "La recette est programmée avant la synchronisation elle dépend des finitions"
      - "Les caches du tableau de bord"
      - "L'utilisateur d'intégration manque d'accès"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-3"
    q: "Vous aurez besoin d'un historique mois par mois d'un champ à partir du trimestre prochain. Quand devriez-vous commencer à synchroniser ?"
    options:
      - "Prochain trimestre, quand il est nécessaire"
      - "Maintenant — un instantané ne peut se rappeler que ce qui a été synchronisé à l'époque, et l'historique ne peut pas être rempli à partir d'un objet tenant l'état courant"
      - "Peu importe."
      - "Seulement après l'existence de la recette"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-1"
    q: "Un champ CloseDate chargé en texte. Quelles pauses ?"
    options:
      - "Rien; les dates de texte fonctionnent normalement"
      - "Filtres de date, regroupements de mois et lignes de tendance — et la correction nécessite un rechargement"
      - "Seulement la page d'enregistrement"
      - "L'ensemble de données ne sera pas enregistré"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-2"
    q: "Pourquoi forcer les ID numériques aux dimensions?"
    options:
      - "Pour économiser de l'espace"
      - "Parce que dactylographié comme mesure le produit offrira de les résumer, et finalement quelqu'un accepte"
      - "Il est nécessaire"
      - "Pour les rendre filtrables"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-3"
    q: "Votre jeu de données téléchargé affiche 607 lignes au lieu de 608. Très probablement :"
    options:
      - "Un problème d'autorisation"
      - "Un problème de ligne d'en-tête dans le CSV parse"
      - "Un prédicat de sécurité"
      - "Arrondissement normal"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-1"
    q: "D'où devraient venir les limites du seau?"
    options:
      - "Même les tiers de la gamme"
      - "L'entreprise — le point où quelqu'un fait quelque chose de différent"
      - "Les quartiles du jeu de données, toujours"
      - "L'échelle de couleur du tableau"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-2"
    q: "Le seautage dans chaque tableau de bord plutôt que dans la recette conduit à:"
    options:
      - "Une meilleure flexibilité"
      - "\"Grand\" signifiant différentes choses sur différents écrans, avec les deux défendables"
      - "Demandes plus rapides"
      - "Petits ensembles de données"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-3"
    q: "Une valeur exactement sur une limite — l'utilisation de 55% exactement — devrait être:"
    options:
      - "Gauche au hasard"
      - "Attribué par une règle explicite et écrite, parce que quelqu'un finira par la demander"
      - "Exclusion"
      - "Découpés"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-1"
    q: "Quel type de noeud change le grain des données qui le traversent?"
    options:
      - "Filtre"
      - "Adhésion et agrégat"
      - "Formule"
      - "Produit"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-2"
    q: "Vous avez besoin d'un nombre d'opportunités par compte joint à chaque ligne de compte. Quel nœud ?"
    options:
      - "Formule"
      - "Agrément sur les opportunités groupées par compte, puis rejoindre les comptes"
      - "Filtre"
      - "Transformer"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-3"
    q: "Pourquoi diviser une grande recette en plusieurs petites?"
    options:
      - "Les recettes ont une limite de nœud dur"
      - "Une recette de cinquante nœuds est illisible par quiconque ne l'a pas écrite, et l'échec cesse de localiser"
      - "Des recettes plus petites fonctionnent plus vite"
      - "Il est nécessaire pour l'horaire"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-1"
    q: "Pourquoi la moyenne des taux d'actualisation par épreuve est-elle habituellement erronée?"
    options:
      - "Arrimage"
      - "Il pèse 5 000 $ sur un marché égal à 2 M$ — le chiffre exact divise l'escompte total par la valeur de liste totale"
      - "Les réductions ne peuvent être moyennes"
      - "Le champ est texte"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-2"
    q: "Un rapport nécessaire sur dix tableaux de bord doit être calculé:"
    options:
      - "Dans chaque widget, pour que chaque équipe puisse l'ajuster"
      - "Une fois dans la recette, donc tous les dix sont d'accord par construction"
      - "Dans une feuille de calcul"
      - "Par Einstein Discovery"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-3"
    q: "Quel calcul appartient réellement au tableau de bord plutôt qu'à la recette?"
    options:
      - "Une définition métrique à l'échelle de l'entreprise"
      - "Une qui dépend de la sélection du filtre actuel du spectateur"
      - "Une conversion monétaire"
      - "Un segment seauté"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-1"
    q: "Remplir un montant blanc avec zéro est:"
    options:
      - "Toujours correct"
      - "Une revendication — elle affirme que l'accord ne vaut rien, ce qui change chaque moyenne construite sur elle"
      - "Requis avant agrégation"
      - "Un choix d'affichage seulement"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-2"
    q: "Seulement 44 % des cas clôturés font l'objet d'une enquête CSAT. Le CSAT moyen est :"
    options:
      - "Faux"
      - "Correct, mais il décrit les répondants plutôt que les clients — donc il expédie avec le taux de réponse à côté de lui"
      - "Inutilisable"
      - "Amélioration en imputant les scores manquants"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-3"
    q: "« Le champ acheteur économique est vide » prévoit perdre. L'explication la plus probable est :"
    options:
      - "Les champs vides causent des pertes"
      - "Un représentant désengagé ne remplit pas les champs — le blanc est un symptôme, pas une cause"
      - "Le champ est brisé"
      - "Coincidence"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-1"
    q: "Les revenus ont doublé après avoir ajouté une adhésion. Les duplicatas sont:"
    options:
      - "Vrai duplicata à supprimer"
      - "Un artefact de jointure — le fix est le joint, pas un pas de déduplication"
      - "Un problème de saisie des données"
      - "Cause de nuls"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-2"
    q: "Un compte apparaît 18 fois dans arr snapshots. Voici :"
    options:
      - "Une duplication à supprimer"
      - "Le grain prévu — une rangée par compte par mois"
      - "Une défaillance de charge"
      - "Erreur de synchronisation"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-3"
    q: "En s'écroulant de véritables duplicatas, quelle rangée devrait survivre?"
    options:
      - "Quelle que soit la première fois"
      - "Un choisi par une règle explicite — dernièrement modifiée, la plus complète, ou à partir de la source préférée"
      - "Une ligne aléatoire"
      - "Celui avec le plus bas id"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-1"
    q: "Un tableau de bord montre un mauvais total. Où êtes-vous en premier ?"
    options:
      - "Configuration du graphique du widget"
      - "Data Manager → Moniteur : a-t-il exécuté, quand et combien de lignes"
      - "Les paramètres de partage de l'application"
      - "La console du navigateur"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-2"
    q: "Le nombre de lignes est passé de 2 800 à 2 100 après un changement que vous n'avez pas effectué. Très probablement :"
    options:
      - "Variation normale"
      - "Un filtre en amont, une jointure interne, ou un changement d'autorisation des enregistrements"
      - "Une limite de graphique"
      - "Arrimage"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-3"
    q: "La façon la plus rapide de localiser un problème de grain dans une recette est:"
    options:
      - "Relire SAQL"
      - "Cliquer sur les prévisualisations des nœuds et regarder où le nombre de lignes change"
      - "Reconstruire la recette"
      - "Exportation vers CSV"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-1"
    q: "À quoi sert la synchronisation des données?"
    options:
      - "Rédiger les résultats analytiques Salesforce"
      - "Garder une copie locale des objets et des champs sélectionnés à jour, de sorte que les recettes ne frappent pas la source à chaque exécution"
      - "Calendrier des courriels du tableau de bord"
      - "Chiffrement des ensembles de données"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-2"
    q: "Une recette est verte la nuit, mais les données datent toujours d'un jour. Cause:"
    options:
      - "Un ensemble de données corrompu"
      - "La recette est programmée avant la synchronisation elle dépend des produits complets"
      - "Tableau de bord en cache"
      - "Un prédicat inexistant"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-3"
    q: "Une date de fermeture chargée comme le texte empêche:"
    options:
      - "Rien"
      - "Filtres de date, regroupements de mois et lignes de tendance"
      - "Tri"
      - "Rejoindre"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-4"
    q: "Pourquoi forcer les ID numériques aux dimensions à la charge?"
    options:
      - "Pour économiser de l'espace"
      - "Parce que dactylographié comme mesure le produit offrira de les résumer, et finalement quelqu'un accepte"
      - "Il est nécessaire"
      - "Pour les rendre filtrables"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-5"
    q: "Les limites du seau devraient provenir :"
    options:
      - "Même les tiers de la gamme"
      - "L'entreprise — le point où quelqu'un fait quelque chose de différent"
      - "Les quartiles du jeu de données, toujours"
      - "La palette des graphiques"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-6"
    q: "Le seautage dans chaque tableau de bord plutôt que dans la recette conduit à:"
    options:
      - "Plus de flexibilité"
      - "\"Grand\" signifiant différentes choses sur différents écrans, les deux défendables"
      - "Demandes plus rapides"
      - "Petits ensembles de données"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-7"
    q: "La «réduction moyenne» calculée comme la moyenne des taux par opération est erronée parce que:"
    options:
      - "Les rabais ne sont pas numériques"
      - "Il pèse toutes les transactions également indépendamment de la taille"
      - "Les nulls sont exclus"
      - "Il a besoin d'un compte distinct"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-8"
    q: "Remplir un montant blanc avec zéro est:"
    options:
      - "Toujours correct"
      - "Une revendication — il affirme que l'accord ne vaut rien, et il traîne chaque moyenne construite sur elle"
      - "Requis avant agrégation"
      - "Un choix d'affichage seulement"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-9"
    q: "Les revenus ont doublé après avoir ajouté une adhésion. Les « duplicata » sont:"
    options:
      - "Vrai duplicata à supprimer"
      - "Un artefact de jointure — le fix est le joint, pas un pas de déduplication"
      - "Un problème d'entrée de données"
      - "Cause de nuls"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-10"
    q: "Le moyen le plus rapide de localiser un mauvais nombre à l'intérieur d'une recette est:"
    options:
      - "Lire SAQL"
      - "Marcher les prévisualisations du noeud et regarder où le nombre de lignes change"
      - "Reconstruire l'ensemble de données"
      - "Vérification du partage d'applications"
    answer: 1
    topic: "data-preparation"
  - id: "datasets-and-modelling-index-1"
    q: "Qu'est-ce qui détermine le plus quelles questions un ensemble de données peut répondre?"
    options:
      - "Son nombre de rangées"
      - "Son grain — ce qu'une rangée représente"
      - "Les types de cartes utilisés"
      - "Son programme de rafraîchissement"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-index-2"
    q: "Un ensemble de données pré-agrégé en totaux mensuels est:"
    options:
      - "Strictement mieux — c'est plus rapide"
      - "Plus vite et de façon permanente incapable de répondre aux questions ci-dessous"
      - "Équivalent à un grain fin"
      - "Seulement utile pour les exportations"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-1"
    q: "L'intégration de 608 possibilités à 1 192 lignes de produits donne 1 192 lignes. C'est un bug ?"
    options:
      - "Oui, la jointure est mal configurée"
      - "Non — c'est ce que fait une jointure un à plusieurs. Le bogue résume ensuite le montant du parent"
      - "Oui, les lignes ne devraient jamais augmenter"
      - "Seulement si les clés sont texte"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-2"
    q: "Quelle solution permet d'obtenir des détails au niveau du produit?"
    options:
      - "Agrégation des éléments de ligne avant la jointure"
      - "Garder le grain de ligne et ne pas porter le montant du parent vers le bas, additionner le montant de la ligne"
      - "Filtrage à un produit par offre"
      - "Utilisation d'une jointure intérieure"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-3"
    q: "Un total est exactement 3× ce que vous attendez. Qu'est-ce que vous suspectez ?"
    options:
      - "Un prédicat de sécurité"
      - "Un fan-out — une mesure parentale répétée sur environ trois rangées d'enfants chacune"
      - "Un ensemble de données statiques"
      - "Conversion des devises"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-4"
    q: "La meilleure façon d'enquêter sur un total suspect est :"
    options:
      - "Revérifier la configuration du graphique"
      - "Filtrer jusqu'à une seule entité et compter les lignes à la main"
      - "Reconstruire le tableau de bord"
      - "Augmenter la limite de ligne"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-1"
    q: "Le bon point de départ pour concevoir un ensemble de données est:"
    options:
      - "Les tableaux sources disponibles"
      - "Les questions qu'il doit répondre, écrites"
      - "Les types de cartes prévus"
      - "Le programme de rafraîchissement"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-2"
    q: "Un ensemble de données servant deux publics à grains différents devrait habituellement :"
    options:
      - "Compromis à un grain moyen"
      - "Être deux ensembles de données, souvent d'une recette avec deux sorties"
      - "Utilisez le meilleur grain"
      - "Être filtré par visionneur"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-3"
    q: "Un filtre appliqué à l'intérieur de l'ensemble de données plutôt que sur le tableau de bord est juste lorsque:"
    options:
      - "C'est plus rapide"
      - "Les lignes exclues ne devraient jamais apparaître dans aucune question cette série de données répond"
      - "Les téléspectateurs pourraient vouloir le changer"
      - "Toujours"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-1"
    q: "Un tableau de référence comme Accounts.csv se caractérise par:"
    options:
      - "Avoir le plus de lignes"
      - "Se joindre à TO plutôt qu'agréger — résumer n'importe quoi en elle est généralement une erreur"
      - "Changement le plus souvent"
      - "Pas de clés"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-2"
    q: "Un format long (une ligne par entité par métrique) est préférable lorsque :"
    options:
      - "Il y a peu de mesures qui ne changent jamais"
      - "Les métriques sont souvent ajoutées, ou vous voulez les tracer avec un seul widget"
      - "Le stockage est limité"
      - "Jamais"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-3"
    q: "Un ensemble de données dérivé basé sur les risques de sortie d'un autre ensemble de données:"
    options:
      - "Rien"
      - "Une chaîne de planification où une défaillance trois liens arrière est invisible à la fin"
      - "Perte de sécurité"
      - "Colonnes dupliquées"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-1"
    q: "Pourquoi ne pouvez-vous pas construire un tableau de bord du mouvement de pipeline à partir de l'objet Opportunity seul ?"
    options:
      - "L'objet est trop grand"
      - "Il ne contient que des valeurs actuelles — il n'y a pas de données sur l'étape ou le montant du mois dernier"
      - "Les opportunités ne peuvent pas être synchronisées"
      - "Vous pouvez, il est construit en"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-2"
    q: "Cohorter les pistes par date de conversion plutôt que par date de création produit:"
    options:
      - "Une image plus précise"
      - "Une cohorte déformée — les cohortes récentes semblent impossibles et les anciennes semblent terribles, tandis que les deux nombres sont individuellement corrects"
      - "Pas de différence"
      - "Une erreur dans la recette"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-3"
    q: "Un snapshot dataset ajoute l'état courant à chaque exécution. Qu'est-ce que cela signifie pour un champ que vous commencez à synchroniser aujourd'hui ?"
    options:
      - "Son histoire est remplie automatiquement"
      - "Il n'a pas d'histoire avant aujourd'hui, et jamais"
      - "Il ne peut pas être instantané"
      - "L'historique provient du journal de vérification"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-1"
    q: "Où doit être placé l'étiquette d'affichage d'un champ?"
    options:
      - "Dans chaque widget"
      - "Sur les métadonnées de champ de l'ensemble de données, donc chaque objectif et widget hérite"
      - "Dans la formule de la recette"
      - "Dans les paramètres de l'application"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-2"
    q: "Une mesure monétaire indique six décimales sur chaque tableau de bord. La solution efficace est :"
    options:
      - "Formater chaque widget"
      - "Définir le format une fois sur le champ dataset"
      - "Tourne-le. SAQL"
      - "Modifier le type de graphique"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-1"
    q: "Rejoindre 608 opportunités à 1 192 lignes de produits donne 1 192 lignes. Le bug est :"
    options:
      - "La jointure elle-même"
      - "Somme du montant du parent par la suite, qui se répète maintenant par ligne"
      - "Utiliser une recherche plutôt que intérieure"
      - "Il n'y a pas de bug"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-2"
    q: "La solution qui maintient les détails de niveau produit est:"
    options:
      - "Éléments de ligne agrégés avant la jointure"
      - "Conserver le grain de ligne et le montant total de la ligne au lieu du montant du parent"
      - "Filtre à un produit par offre"
      - "Utiliser une jointure intérieure"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-3"
    q: "Le grain d'un ensemble de données devrait être dérivé de :"
    options:
      - "Les tableaux sources"
      - "La meilleure question qu'il doit répondre"
      - "Les types de cartes"
      - "La limite de ligne"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-4"
    q: "Summit ARR sur toutes les lignes d'un instantané de 18 mois donne:"
    options:
      - "Société ARR"
      - "Environ dix-huit ans de recettes"
      - "ARR par compte"
      - "Une erreur"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-5"
    q: "Un champ que vous commencez à synchroniser aujourd'hui a :"
    options:
      - "Historique"
      - "Pas d'histoire avant aujourd'hui, en permanence"
      - "Historique de la piste de vérification"
      - "Histoire après la prochaine reconstruction"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-6"
    q: "La somme d'une colonne sur un tableau de référence comme les comptes est:"
    options:
      - "Pratique standard"
      - "Habituellement une erreur — les tableaux de référence sont joints à, non agrégés"
      - "Requis pour ARR"
      - "Plus rapide qu'une table de faits"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-7"
    q: "La défaillance caractéristique du format long est :"
    options:
      - "Demandes lentes"
      - "Une requête qui oublie de filtrer à un métrique, en somme silencieusement sur des métriques non liées"
      - "Clés manquantes"
      - "Entités dupliquées"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-8"
    q: "Un champ de pourcentage d'utilisation avec une agrégation par défaut de la somme produit:"
    options:
      - "Total correct"
      - "960% sur un an, rendu propre"
      - "Une erreur"
      - "Nulls"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-9"
    q: "Un filtre appliqué à l'intérieur de l'ensemble de données doit être documenté car:"
    options:
      - "Il est nécessaire"
      - "Il est invisible en aval, donc un rapprochement par rapport à la source sera différent sans cause visible"
      - "Il affecte les performances"
      - "Les téléspectateurs peuvent vouloir le changer"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-10"
    q: "La phrase la plus utile dans la description d'un ensemble de données est :"
    options:
      - "Qui l'a construit"
      - "Ce qu'une ligne représente"
      - "Quand il rafraîchit"
      - "Dans quelle application il est"
    answer: 1
    topic: "datasets-and-modelling"
---

Questions pratiques concernant le domaine de la couche de données CRM Analytics et Einstein Discovery Examen de consultant.
