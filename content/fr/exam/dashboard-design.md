---
title: "Analytics Dashboard Design — questions pratiques"
domain: "dashboard-design"
quiz:
  - id: "data-visualization-index-1"
    q: "Quelle est la première question à poser avant de choisir un type de graphique?"
    options:
      - "Quel type ressemble le mieux aux couleurs de la marque?"
      - "Quelle comparaison le lecteur est-il censé faire?"
      - "Combien de lignes sont dans l'ensemble de données?"
      - "Quels sont les types CRM Analytics Le soutien ?"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-index-2"
    q: "Un diagramme à barres trié alphabétiquement au lieu de par valeur principalement :"
    options:
      - "Plus vite"
      - "Cache le classement, ce qui est généralement la raison pour laquelle quelqu'un a dessiné un diagramme à barres"
      - "Est plus précis"
      - "Ne fait aucune différence"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-1"
    q: "Vous avez une dimension avec 40 catégories et une mesure. Le meilleur premier choix est :"
    options:
      - "Un diagramme circulaire"
      - "Tableau à barres horizontales du haut de la ligne N, avec la limite dans le titre"
      - "Un graphique linéaire"
      - "Un diagramme de dispersion"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-2"
    q: "Deux mesures, et vous voulez savoir si elles se déplacent ensemble. Le graphique est :"
    options:
      - "Un graphique linéaire à double axe"
      - "Un diagramme de dispersion, une mesure par axe"
      - "Deux diagrammes à barres séparés"
      - "Une colonne empilée"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-3"
    q: "Pourquoi l'horizontale est-il généralement meilleur que la verticale pour les barres catégoriques?"
    options:
      - "Il rend plus rapide"
      - "Les noms de catégorie sont des mots et les mots lus le long d'un axe horizontal plutôt que tournés sous une colonne"
      - "Les barres verticales sont dépréciées"
      - "Il utilise moins d'espace"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-1"
    q: "Quand une colonne (verticale) doit-elle battre une barre (horizontale)?"
    options:
      - "Toujours — verticale est standard"
      - "Quand les catégories sont ordonnées des périodes, comme des mois, que les lecteurs attendent de courir de gauche à droite"
      - "Quand il y a de nombreuses catégories"
      - "Lorsque les étiquettes sont longues"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-2"
    q: "Groupe ou empilé, lorsque le lecteur doit comparer chaque sous-catégorie entre les groupes?"
    options:
      - "Empilé — il montre les totaux"
      - "Grouped — seul le segment inférieur d'une pile partage une base, de sorte que les autres ne peuvent pas être comparés par oeil"
      - "L'un ou l'autre fonctionne également"
      - "Ni l'un ni l'autre; utiliser une tarte"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-3"
    q: "L'axe d'une carte à barres commence à 40 au lieu de 0. Voici :"
    options:
      - "Fine et standard"
      - "La longueur de la barre est l'encodage, donc un axe tronqué fausse le rapport entre les barres"
      - "Requis pour la lisibilité"
      - "Seulement un problème dans l'impression"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-1"
    q: "Un graphique biaxial montre les revenus et le nombre de passages à niveau en juin. Que signifie la traversée ?"
    options:
      - "Chiffre d'affaires dépassé"
      - "Rien — le point de passage est déterminé par l'endroit où vous définissez les deux axes, pas par les données"
      - "Ils sont corrélés"
      - "Juin était le mois de la pause"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-2"
    q: "Votre jeu de données n'a pas de lignes pendant un mois sans activité. Le graphique linéaire devrait :"
    options:
      - "Joignez-vous tout droit à l'écart"
      - "Afficher zéro si zéro est vrai, et une pause si la valeur est réellement inconnue — ils signifient différentes choses"
      - "Cacher le mois"
      - "Interpoler la moyenne"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-3"
    q: "Combien de séries un graphique peut-il porter avant qu'il ne cesse de fonctionner?"
    options:
      - "Une"
      - "Environ quatre, et seulement s'ils sont séparables par la couleur et la forme"
      - "Dix"
      - "Illimitée avec une légende"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-1"
    q: "Combien de tranches un donut peut-il transporter avant que les lecteurs cessent de pouvoir les comparer?"
    options:
      - "Environ trois ou quatre"
      - "Environ dix"
      - "Vingt avec étiquettes"
      - "Il n'y a aucune limite"
    answer: 0
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-2"
    q: "Une barre empilée à 100% au fil du temps est la meilleure pour montrer :"
    options:
      - "Croissance absolue"
      - "Si le MIX a changé — au prix de cacher la taille entièrement"
      - "Valeurs individuelles"
      - "Amortisseurs"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-3"
    q: "Les données sur la composition où les pourcentages exacts de matière sont habituellement mieux montrés comme suit:"
    options:
      - "Un donut"
      - "Une table triée avec une colonne de partage"
      - "Une carte arborescente"
      - "Une jauge"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-1"
    q: "L'utilisation de l'entreprise est de 88 %. Pourquoi est-ce potentiellement inutile ?"
    options:
      - "C'est trop précis"
      - "Il peut être la moyenne des comptes à 30% et à 140%, qui ont besoin d'actions opposées et sont à la fois invisibles en elle"
      - "Les pourcentages ne peuvent pas être moyens du tout"
      - "Ce devrait être une médiane"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-2"
    q: "Un graphique scatter répond à la question qu'aucun graphique à barres ne peut ?"
    options:
      - "Quelle catégorie est la plus importante"
      - "Si deux mesures vont ensemble, dans de nombreuses entités à la fois"
      - "Comment quelque chose a changé au fil du temps"
      - "Ce qui partage chaque partie est"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-3"
    q: "La troisième mesure d'un graphique à bulles est codée comme suit:"
    options:
      - "Couleur"
      - "Zone de bulles"
      - "Position sur un troisième axe"
      - "Taille de l'étiquette"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-1"
    q: "Ce qui fait KPI nombre actionnable ?"
    options:
      - "Une police plus grande"
      - "Une comparaison et une direction — contre le plan ou la dernière période, avec une flèche"
      - "Un symbole de monnaie"
      - "Un fond coloré"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-2"
    q: "Une jauge est un bon choix lorsque:"
    options:
      - "Tout numéro est affiché"
      - "Il y a une véritable cible fixe et la question est de savoir si nous sommes proches."
      - "Le nombre est un pourcentage"
      - "L'espace est limité"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-3"
    q: "La récupération de CVC est passée de 15,3 à 14,2 mois. La flèche doit être:"
    options:
      - "Duvet et rouge"
      - "En bas et en vert — la bonté est une propriété du métrique, pas de la direction"
      - "Haut et vert"
      - "Pas de flèche"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-1"
    q: "Quand une table bat-elle un tableau ?"
    options:
      - "Jamais"
      - "Lorsque l'identité de chaque ligne est importante — quel compte, qui traite — ou les valeurs exactes font"
      - "Quand il y a plus de 20 lignes"
      - "Lorsque les données sont texte"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-2"
    q: "Une table avec une barre de défilement sur un tableau de bord signifie généralement:"
    options:
      - "Bonne densité d'information"
      - "Il est devenu une exportation de données plutôt qu'un widget de tableau de bord"
      - "Les lignes doivent être triées"
      - "La police est trop grande"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-3"
    q: "Les numéros dans un tableau doivent être:"
    options:
      - "Alignement à gauche sur le texte"
      - "Alignement droit avec des décimales cohérentes, de sorte que les grandeurs sont comparables en un coup d'oeil"
      - "Centred"
      - "Couleur par valeur"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-1"
    q: "Vous avez des revenus pour six régions de vente. Une carte est-elle la bonne carte ?"
    options:
      - "Oui — les régions sont géographiques"
      - "Habituellement non — avec six catégories une barre triée les classe précisément, où une carte fait l'estimation des couleurs du lecteur"
      - "Oui, si les couleurs sont accessibles"
      - "Seulement avec une légende"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-2"
    q: "Une choropleth des recettes brutes par pays montre principalement:"
    options:
      - "Où votre produit fonctionne le mieux"
      - "Où se trouvent le plus grand nombre de personnes et les plus grandes économies"
      - "Part de marché"
      - "Croissance"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-3"
    q: "La solution habituelle est la suivante :"
    options:
      - "Une échelle de couleur différente"
      - "Normalisation — recettes par compte, par habitant ou par rapport à la taille du marché"
      - "Suppression des petits pays"
      - "Utiliser une carte à bulles"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-1"
    q: "Un entonnoir couvre 2,1 millions de sessions jusqu'à 506 opportunités à l'échelle linéaire. Qu'est-ce qui se passe ?"
    options:
      - "C'est clair."
      - "Chaque étape après la seconde est un talon, et les étapes qui comptent le plus deviennent invisibles"
      - "Erreurs du graphique"
      - "Les pourcentages sont faux"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-2"
    q: "Un graphique de chute d'eau est pour:"
    options:
      - "Catégories de classement"
      - "Afficher comment une série d'ajouts et de soustractions obtient d'un total à l'autre"
      - "Comparaison de deux mesures"
      - "Données géographiques"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-3"
    q: "Les entonnoirs doivent être commandés :"
    options:
      - "Par taille"
      - "En ordre de marche"
      - "Alphabétiquement"
      - "Par taux de conversion"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-1"
    q: "Quel est le test fiable pour savoir si un graphique est honnête?"
    options:
      - "Chaque nombre est correct"
      - "Ce qu'un lecteur conclut en quatre secondes est vrai"
      - "Il utilise la palette de la marque"
      - "Il a une légende"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-2"
    q: "La tronquage de l'axe des y est défendable sur une carte linéaire de rétention, mais pas sur une carte à barres. Pourquoi ?"
    options:
      - "Les bars sont une technologie ancienne"
      - "Longueur de la barre IS l'encodage, donc la troncation fausse le rapport entre les barres; une ligne code la pente"
      - "Les lignes ne peuvent pas afficher de petites valeurs"
      - "Il n'est jamais défendable"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-3"
    q: "Le tableau le plus malhonnête dans les rapports d'affaires est :"
    options:
      - "Une tarte 3D"
      - "Un total brut qui a besoin d'un dénominateur — compte où un taux était la question"
      - "Une échelle de log"
      - "Un double axe"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-1"
    q: "La première question avant de choisir un type de graphique est :"
    options:
      - "Combien de lignes y a-t-il"
      - "Quelle comparaison le lecteur doit-il faire?"
      - "Quelles couleurs sont disponibles"
      - "Quels types CRM Analytics soutien"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-2"
    q: "Un diagramme à barres catégorique devrait normalement être trié :"
    options:
      - "Alphabétiquement"
      - "Décroissant par la mesure"
      - "Par l'identité de la dimension"
      - "Au hasard"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-3"
    q: "Groupes plutôt que barres empilées, lorsque le lecteur doit comparer les sous-catégories entre les groupes, parce que :"
    options:
      - "Les piles sont plus difficiles à colorier"
      - "Seul le segment inférieur d'une pile partage une base de référence, de sorte que le reste ne peut pas être comparé par oeil"
      - "Les barres groupées sont plus étroites"
      - "Les piles ne peuvent pas afficher les totaux"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-4"
    q: "Un donut arrête de travailler à peu près à:"
    options:
      - "Deux tranches"
      - "Quatre tranches"
      - "Dix tranches"
      - "Vingt tranches"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-5"
    q: "Quelle question peut SEULEMENT une réponse d'intrigue ?"
    options:
      - "Quelle catégorie est la plus importante"
      - "Si deux mesures vont ensemble dans de nombreuses entités"
      - "Comment une valeur a changé au fil du temps"
      - "Ce qu'apporte chaque partie"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-6"
    q: "A KPI nombre devient actionnable quand il porte:"
    options:
      - "Une police plus grande"
      - "Une comparaison et une direction"
      - "Un symbole de monnaie"
      - "Un fond coloré"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-7"
    q: "La baisse du rendement des PCA devrait être indiquée comme suit :"
    options:
      - "Une flèche rouge vers le bas"
      - "Une flèche verte vers le bas — la bonté appartient à la métrique, pas à la direction"
      - "Pas de flèche"
      - "Une flèche vers le haut"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-8"
    q: "Un entonnoir couvrant 2,1 millions de sessions à 506 opportunités à échelle linéaire:"
    options:
      - "Lis bien"
      - "Rend les étapes ultérieures comme des talons, cachant les étapes qui comptent le plus"
      - "Erreurs"
      - "Retournes"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-9"
    q: "Une choropleth des recettes brutes par pays montre principalement:"
    options:
      - "Ajustement du marché des produits"
      - "Là où les plus grandes populations et économies sont"
      - "Croissance"
      - "Marge"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-10"
    q: "Le tableau le plus malhonnête dans les rapports d'affaires est :"
    options:
      - "Un diagramme circulaire 3D"
      - "Un total brut qui nécessite un dénominateur"
      - "Une échelle de log"
      - "Une surface empilée"
    answer: 1
    topic: "data-visualization"
  - id: "lenses-and-explorations-index-1"
    q: "Qu'est-ce qu'un objectif mieux compris?"
    options:
      - "Un rapport terminé"
      - "Un espace de travail jetable pour une exploration d'un ensemble de données"
      - "Un modèle de tableau de bord"
      - "Une requête enregistrée que les administrateurs peuvent créer"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-index-2"
    q: "Pourquoi passer à SAQL mode après avoir fait un changement en cliquant ?"
    options:
      - "Il fonctionne plus vite"
      - "Vous savez déjà quelle devrait être la réponse, donc lire la requête générée est le moyen le moins cher d'apprendre la langue"
      - "Les graphiques ne sont pas disponibles SAQL mode"
      - "Il est nécessaire avant d'enregistrer"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-1"
    q: "CRM Analytics trie un graphique groupé par le regroupement par défaut. Pourquoi le changer ?"
    options:
      - "Ordre alphabétique est invalide"
      - "Le point d'un graphique groupé est généralement le classement, que l'ordre alphabétique cache"
      - "Le tri par mesure est plus rapide"
      - "Il est nécessaire pour le visage"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-2"
    q: "Ajout d'un deuxième groupe à un diagramme à barres en général :"
    options:
      - "Double la vue"
      - "Cela rend la lecture beaucoup plus difficile, et vaut la peine de résister, sauf si la comparaison est le point"
      - "Coups de visage"
      - "Modification de la mesure"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-3"
    q: "Au point de ligne, on entend par «nombre de rangées»:"
    options:
      - "Nombre d'offres"
      - "Nombre d'éléments de ligne — utilisez un compte distinct sur la clé de transaction pour les transactions"
      - "Nombre de comptes"
      - "Nombre de produits"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-1"
    q: "Un graphique montre un segment dont les revenus sont incroyablement élevés. Quelle est la prochaine étape la plus rapide?"
    options:
      - "Modifier le type de graphique"
      - "Passez en mode table et regardez les lignes derrière"
      - "Reconstruire l'objectif"
      - "Vérifiez les filtres du tableau de bord"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-2"
    q: "SAQL mode est le plus précieux pour un apprenant parce que:"
    options:
      - "Il fonctionne plus vite que le clic"
      - "Il montre la requête vos clics produits, contre une réponse que vous connaissez déjà"
      - "C'est la seule façon de filtrer"
      - "Les graphiques ne peuvent pas regrouper par date"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-1"
    q: "Qu'est-ce qui détermine le plus si les requêtes en langues naturelles fonctionnent bien?"
    options:
      - "Le type de graphique choisi"
      - "Qualité des métadonnées de champ de l'ensemble de données — étiquettes, formats et plomberie cachée"
      - "Nombre d'utilisateurs"
      - "Le programme de rafraîchissement"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-2"
    q: "L'important mode d'échec d'une réponse en langue naturelle est qu'elle :"
    options:
      - "Coure lentement"
      - "Réponses à une question subtilement différente de celle posée, couramment et sans indication de la différence"
      - "Impossible de produire des graphiques"
      - "Nécessaire SAQL connaissance"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-1"
    q: "Un objectif est mieux décrit comme suit:"
    options:
      - "Un rapport terminé"
      - "Un espace de travail jetable pour une exploration d'un ensemble de données"
      - "Un modèle de tableau de bord"
      - "Un sauvé SAQL script"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-2"
    q: "Le tri par défaut sur un graphique groupé est effectué par regroupement. Vous le changez habituellement parce que :"
    options:
      - "Alphabétique est invalide"
      - "Le classement est normalement le point, et l'ordre alphabétique le cache"
      - "Il rend plus rapide"
      - "La facette l'exige"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-3"
    q: "Au point de ligne grain, pour compter les offres que vous devriez utiliser:"
    options:
      - "Nombre de lignes"
      - "Un compte distinct sur la clé des opportunités"
      - "Montant total"
      - "Moyenne"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-4"
    q: "Ajout d'un deuxième groupe à un diagramme à barres en général :"
    options:
      - "Double la vue"
      - "Cela rend la lecture beaucoup plus difficile, et vaut la peine de résister, sauf si la comparaison est le point"
      - "Coups de visage"
      - "Modification de la mesure"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-5"
    q: "Une carte semble fausse. Le diagnostic le plus rapide est:"
    options:
      - "Modifier le type de graphique"
      - "Passez en mode table et lisez les lignes"
      - "Reconstruire l'objectif"
      - "Vérifier le partage"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-6"
    q: "La meilleure façon d'apprendre le langage de requête de l'explorateur est :"
    options:
      - "Lecture de la référence de fonction à la fin"
      - "Cliquer, puis lire SAQL vos clics produits contre une réponse que vous connaissez déjà"
      - "Écriture des requêtes à partir de zéro"
      - "Copie d'exemples depuis des forums"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-7"
    q: "Un filtre écrit comme 'Stage != Fermé Lost' supprime également:"
    options:
      - "Rien d'autre"
      - "Lignes où l'étape est nulle"
      - "Lignes won fermées"
      - "Lignes d'autres ensembles de données"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-8"
    q: "Les résultats des requêtes en langage naturel doivent être traités comme suit :"
    options:
      - "Réponses finales à la citation"
      - "Un point de départ pour vérifier en mode table, car il répond couramment même lorsqu'il répond à une autre question"
      - "Inutilisable"
      - "Équivalent à une lentille enregistrée"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "designing-dashboards-index-1"
    q: "Qu'est-ce qui fait un tableau de bord fini ?"
    options:
      - "Chaque widget demandé est présent"
      - "Un spectateur peut prendre la décision pour, rapidement et sans vous"
      - "Il utilise les couleurs de l'entreprise"
      - "Il n'a pas d'espace vide"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-index-2"
    q: "Un intervenant demande un neuvième widget. La meilleure première question est la suivante :"
    options:
      - "Quel type de graphique voulez-vous ?"
      - "Que feriez-vous différemment selon ce qu'il a montré ?"
      - "Ça peut attendre le prochain sprint ?"
      - "Vous avez les données ?"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-1"
    q: "Où appartient le numéro le plus important?"
    options:
      - "Centre, plus grand"
      - "En haut à gauche, où commence l'ordre de lecture"
      - "En bas, comme conclusion"
      - "N'importe où; les gens scannent au hasard"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-2"
    q: "Pourquoi les widgets liés au groupe avec l'espace entre les groupes?"
    options:
      - "Ça a l'air plus léger."
      - "La proximité implique une relation — les widgets placés ensemble sont lus comme appartenant ensemble, qu'ils le fassent ou non"
      - "Il améliore les performances"
      - "Il est exigé par la facette"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-1"
    q: "Pourquoi un delta coloré devrait-il aussi porter une flèche de direction ou une étiquette?"
    options:
      - "C'est plus professionnel."
      - "Parce que la couleur seule exclut les lecteurs aveugles de couleur et ne survit pas à l'impression ou à une capture d'écran à échelle grise"
      - "Les flèches sont plus rapides à rendre"
      - "Il est requis par Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-2"
    q: "D'où devrait venir un seuil rouge/ambre/vert?"
    options:
      - "Même les tiers de la gamme"
      - "L'entreprise — le nombre auquel quelqu'un fait quelque chose de différent"
      - "Par défaut de la palette"
      - "Moyenne"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-3"
    q: "Un tableau de bord où la plupart des cellules sont colorées a:"
    options:
      - "Densité d'information maximale"
      - "Il ne reste aucun signal — si tout est mis en évidence, rien n'est"
      - "Meilleure accessibilité"
      - "Temps de chargement plus rapide"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-1"
    q: "Quand une table bat-elle un graphique ?"
    options:
      - "Jamais"
      - "Lorsque l'identité de chaque ligne est importante — quel compte spécifique, quel compte spécifique"
      - "Quand il y a beaucoup de lignes"
      - "Lorsque les données sont numériques"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-2"
    q: "Ce qui devient un KPI Numéro dans une actionnable?"
    options:
      - "Une police plus grande"
      - "Une comparaison — par rapport au plan, par rapport à la dernière période — et une orientation"
      - "Un symbole de monnaie"
      - "Une frontière"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-3"
    q: "Un tableau des valeurs indiquant les 140 comptes est habituellement :"
    options:
      - "Gros"
      - "Une exportation de données portant des vêtements de tableau de bord"
      - "Exigence de précision"
      - "Plus rapide qu'un graphique"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-1"
    q: "Le plus grand levier sur le temps de charge du tableau de bord est habituellement :"
    options:
      - "Type de graphique"
      - "Le nombre de requêtes distinctes — widgets qui pourraient partager une requête mais chacun exécute sa propre requête"
      - "Choix du navigateur"
      - "Profondeur de couleur"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-2"
    q: "Un jeu de données sur un grain très fin ralentit les tableaux de bord parce que :"
    options:
      - "Les grains fins sont stockés de façon inefficace"
      - "Chaque widget regroupe des millions de lignes au moment de la requête, sur chaque charge, pour chaque visionneur"
      - "Le visage est désactivé"
      - "Il ne peut pas être indexé"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-1"
    q: "Pourquoi l'entonnoir est-il trié par étape plutôt que par taille ?"
    options:
      - "Il rend plus rapide"
      - "La séquence est l'argument — la chute entre les étapes adjacentes est la conclusion"
      - "Salesforce l'exige"
      - "Pour correspondre au tableau"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-2"
    q: "Pourquoi le widget de couverture est-il désactivé ?"
    options:
      - "Rendement"
      - "C'est une référence par rapport au trimestre complet — si elle filtre avec tout le reste, la comparaison disparaît"
      - "Il utilise un ensemble de données différent"
      - "Taux de rupture de la face"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-3"
    q: "La tendance du pipeline est groupée par mois créé plutôt que par mois proche parce que :"
    options:
      - "Les dates de fermeture ne sont pas fiables"
      - "Cohorter à la mauvaise date déforme les périodes récentes et anciennes dans des directions opposées alors que les deux nombres restent individuellement correct"
      - "Le mois créé rend plus rapide"
      - "Aucune différence"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-1"
    q: "Un tableau de bord est terminé lorsque:"
    options:
      - "Chaque widget demandé est présent"
      - "Son public peut prendre la décision pour, rapidement et sans vous"
      - "Il correspond à la palette de la marque"
      - "Il n'y a pas d'espace vide"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-2"
    q: "Le numéro d'ordre appartient:"
    options:
      - "Centre"
      - "En haut à gauche, où commence l'ordre de lecture"
      - "Bas"
      - "A côté des filtres"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-3"
    q: "Les filtres dans le coin supérieur gauche sont une erreur parce que :"
    options:
      - "Ils sont lents"
      - "Ils dépensent l'espace le plus précieux sur l'écran sur les contrôles que personne n'a besoin jusqu'à leur deuxième visite"
      - "Ils ne peuvent pas être redimensionnés"
      - "Ils ne peuvent être liés"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-4"
    q: "Un titre de widget doit porter :"
    options:
      - "La mesure seulement"
      - "La mesure, la période, le filtre et toute limite — elle sera visualisée sans contexte"
      - "Nom de l'auteur"
      - "Nom de l'ensemble de données"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-5"
    q: "Un diagramme d'entonnoir doit être trié :"
    options:
      - "Par taille descendante"
      - "En ordre de marche"
      - "Alphabétiquement"
      - "Par date"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-6"
    q: "Pourquoi un delta coloré doit-il aussi porter une flèche ou une étiquette?"
    options:
      - "Esthétique"
      - "La couleur à elle seule exclut les lecteurs en aveugle et meurt en gris"
      - "Les flèches accélèrent"
      - "Il est obligatoire en Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-7"
    q: "A KPI nombre devient actionnable quand il a:"
    options:
      - "Une police plus grande"
      - "Une comparaison et une direction"
      - "Une frontière"
      - "Un symbole de monnaie"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-8"
    q: "Le plus grand levier d'un tableau de bord lent est habituellement :"
    options:
      - "Types de graphiques"
      - "Consolider les widgets qui pourraient partager une requête"
      - "Moins de couleurs"
      - "Un navigateur plus rapide"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-9"
    q: "Une table sur un tableau de bord qui doit défiler a:"
    options:
      - "Bonne densité d'information"
      - "Arrête d'être un widget de tableau de bord et de devenir une exportation de données"
      - "Trop grande une police"
      - "Le mauvais ordre"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-10"
    q: "La dernière vérification avant de partager un tableau de bord est :"
    options:
      - "Vérifier les titres"
      - "Ouvrez-le en tant qu'utilisateur restreint, et réconciliez le titre avec quelque chose de vrai indépendant"
      - "Exporter vers le PDF"
      - "Ajouter d'autres widgets"
    answer: 1
    topic: "designing-dashboards"
---

Questions pratiques pour le domaine de la conception du tableau de bord CRM Analytics et Einstein Discovery Examen de consultant.
