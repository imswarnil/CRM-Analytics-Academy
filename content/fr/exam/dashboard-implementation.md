---
title: "Analytics Dashboard Implementation — questions pratiques"
domain: "dashboard-implementation"
quiz:
  - id: "saql-index-1"
    q: "SAQL'la définition de la différence SQL est que:"
    options:
      - "Il n'a pas de fonctions agrégées"
      - "C'est une transformation de flux — chaque instruction transforme le résultat précédent, donc ordre de l'instruction EST le plan de requête"
      - "Il ne peut pas filtrer"
      - "Il ne lit qu'un seul ensemble de données"
    answer: 1
    topic: "saql"
  - id: "saql-index-2"
    q: "Le moyen le moins cher d'apprendre SAQL est:"
    options:
      - "Lecture de la référence de fonction à la fin"
      - "Construire un graphique en cliquant, puis en lisant la requête qu'il a générée contre une réponse que vous connaissez déjà"
      - "Écriture des requêtes à partir de zéro"
      - "Copie d'exemples depuis des forums"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-1"
    q: "Comment faire SAQL diffèrent le plus important de SQL?"
    options:
      - "Il ne peut pas filtrer"
      - "C'est une transformation de flux — chaque instruction transforme le résultat de la précédente, donc l'instruction ORDER est le plan de requête"
      - "Il n'a pas de fonctions agrégées"
      - "Il ne fonctionne que sur un seul ensemble de données"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-2"
    q: "Vous voulez la part de chaque segment du revenu total. Pourquoi est-ce gênant avec des clics seuls ?"
    options:
      - "Pourcentages non pris en charge"
      - "Il a besoin de chaque ligne par rapport à un agrégat de toutes les lignes — deux niveaux d'agrégation en une seule requête"
      - "Les segments ne peuvent pas être groupés"
      - "Ce n'est pas gênant."
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-3"
    q: "Où un filtre appartient dans un SAQL requête pour la meilleure performance?"
    options:
      - "À la fin, après le regroupement"
      - "Dès que possible, moins de données transitent par les déclarations suivantes :"
      - "Peu importe."
      - "Dans la foreach"
    answer: 1
    topic: "saql"
  - id: "saql-functions-1"
    q: "Pour compter les offres dans un ensemble de données à la ligne de grain que vous utilisez:"
    options:
      - "nombre()"
      - "unique('Opportunité Id')"
      - "Montant"
      - "avg()"
    answer: 1
    topic: "saql"
  - id: "saql-functions-2"
    q: "sum() au-dessus d'une colonne qui est de 40% null retourne:"
    options:
      - "Null"
      - "La somme des rangées non-nulles, sans indication que les autres ont été sautées"
      - "Zéro"
      - "Une erreur"
    answer: 1
    topic: "saql"
  - id: "saql-functions-3"
    q: "Quel est le moyen sûr de diviser deux agrégats?"
    options:
      - "avg du rapport par ligne"
      - "somme(numérateur) / somme(dénominateur), gardée contre un dénominateur zéro"
      - "Soit est équivalent"
      - "La division n'est pas soutenue"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-1"
    q: "Où un filtre devrait-il aller pour obtenir les meilleures performances?"
    options:
      - "Après le groupe, donc moins est filtré"
      - "Aussi tôt que possible, moins de lignes passent à travers tout après elle"
      - "À la fin"
      - "L'ordre ne fait aucune différence"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-2"
    q: "`filter q by 'Stage' != \"Closed Lost\"` supprime également:"
    options:
      - "Rien d'autre"
      - "Chaque ligne où Stage est nulle"
      - "Lignes won fermées"
      - "Lignes d'autres ensembles de données"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-3"
    q: "Remplacer un zéro par un zéro à l'aide de la fusion est:"
    options:
      - "Toujours en sécurité"
      - "Une revendication — elle devient «inconnue» en «none», ce qui change les moyennes et peut être faux"
      - "Requis avant agrégation"
      - "Un seul choix d'affichage"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-1"
    q: "Pour calculer la part de chaque segment des revenus de l'entreprise dont vous avez besoin :"
    options:
      - "Un groupe par segment"
      - "La valeur de chaque groupe comparée à un agrégat de toutes les lignes — deux niveaux d'agrégation"
      - "Un tableau de bord séparé"
      - "Un double axe"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-2"
    q: "Un total de fonctionnement fenêtré diffère d'une somme simple parce que :"
    options:
      - "C'est plus rapide"
      - "Il s'accumule à travers les lignes ordonnées plutôt que de s'effondrer à une valeur"
      - "Il ignore les nuls"
      - "Elle nécessite deux ensembles de données"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-3"
    q: "Le classement des représentants dans chaque région exige que la fenêtre soit :"
    options:
      - "Sur toutes les lignes"
      - "Répartition par région, de sorte que chaque région se classe à partir de 1 indépendamment"
      - "Trié seulement"
      - "Groupe par représentant"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-1"
    q: "Vous avez besoin d'une métrique combinant deux ensembles de données sur dix tableaux de bord. Où appartient la combinaison ?"
    options:
      - "Dans chaque widget SAQL"
      - "Dans une recette, donc tous les dix sont d'accord par construction et il est calculé une fois"
      - "Dans une feuille de calcul"
      - "Dans le tableau de bord JSON"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-2"
    q: "La combinaison de deux flux à différents grains dans une requête produit:"
    options:
      - "Une erreur"
      - "Le même fan-out que vous pourriez obtenir dans une recette — une mesure répétée à travers les lignes correspondantes"
      - "Un résultat correct automatiquement"
      - "Nulls seulement"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-3"
    q: "Une bonne utilisation d'une requête en deux flux est :"
    options:
      - "Définition des revenus de l'entreprise"
      - "Une comparaison ad hoc — réelle par rapport à une petite table cible — sur un tableau de bord unique"
      - "Toute adhésion"
      - "Remplacer la couche de la recette"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-1"
    q: "Une requête renvoie un nombre trop élevé par un multiple propre. Le suspect est :"
    options:
      - "Un filtre"
      - "Une combinaison qui multiplie les lignes, avec une mesure résumée après elle"
      - "Déclaration d'ordre"
      - "Un nul"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-2"
    q: "La façon la plus rapide de comprendre une requête qui retourne la mauvaise chose est:"
    options:
      - "Réécrire à partir de zéro"
      - "Coupez-le à la charge et ajoutez une déclaration à la fois, en vérifiant le nombre de lignes après chaque"
      - "Ajouter d'autres filtres"
      - "Passez à un autre type de graphique"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-3"
    q: "Les nombres qui changent entre les parcours sans changement de données signifient habituellement:"
    options:
      - "Un bug de cache"
      - "Une plage de date relative, ou une fenêtre sans ordre explicite"
      - "Un problème de permissions"
      - "Un problème de rendu"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-1"
    q: "SAQL les instructions s'exécutent :"
    options:
      - "Dans un ordre choisi par un optimisation"
      - "Dans l'ordre écrit — chacun transforme le résultat précédent"
      - "En parallèle"
      - "Alphabétiquement"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-2"
    q: "Un filtre appartient à:"
    options:
      - "Après le groupe"
      - "Dès que possible"
      - "Dans chaque cas"
      - "À la fin"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-3"
    q: "À la ligne, les transactions sont comptées avec :"
    options:
      - "nombre()"
      - "unique('Opportunité Id')"
      - "Montant"
      - "médiane()"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-4"
    q: "sum() au-dessus d'une colonne qui est de 40% null retourne:"
    options:
      - "Null"
      - "Le total des rangs non null, sans indication, les autres ont été ignorés"
      - "Zéro"
      - "Une erreur"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-5"
    q: "Le taux d'actualisation pondéré est:"
    options:
      - "avg('DiscountPct')"
      - "somme('Réduction') / somme('ListTotal'), gardée contre zéro"
      - "médiane('DiscountPct')"
      - "max('DiscountPct')"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-6"
    q: "`'Stage' != \"Closed Lost\"` supprime également:"
    options:
      - "Rien d'autre"
      - "Lignes où l'étape est nulle"
      - "Lignes won fermées"
      - "Lignes d'autres ensembles de données"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-7"
    q: "Le classement des représentants dans chaque région a besoin de la fenêtre :"
    options:
      - "Sur toutes les lignes"
      - "Répartition par région"
      - "Commande seulement"
      - "Groupe par représentant"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-8"
    q: "Un total courant sans commande explicite est :"
    options:
      - "L'amende — l'ordre est déduit"
      - "Un bug stable jusqu'au prochain rafraîchissement puis tranquillement différent"
      - "Impossible d'écrire"
      - "Classement automatique par date"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-9"
    q: "Deux ensembles de données doivent être combinés pour dix tableaux de bord. C'est à ça :"
    options:
      - "Dans chaque widget SAQL"
      - "Dans une recette"
      - "Dans le tableau de bord JSON"
      - "Dans une feuille de calcul"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-10"
    q: "Un total élevé par un multiple propre suggère:"
    options:
      - "Un problème nul"
      - "Multiplication de lignes, avec une mesure parentale résumée après elle"
      - "Un filtre"
      - "Un problème de rendu"
    answer: 1
    topic: "saql"
  - id: "interactions-index-1"
    q: "Deux widgets construits sur le même ensemble de données. Par défaut, cliquez sur un :"
    options:
      - "Ne fait rien à l'autre"
      - "Filtre l'autre — les widgets du même ensemble se facent automatiquement"
      - "Nécessite une liaison"
      - "Ouvre une nouvelle lentille"
    answer: 1
    topic: "interactions"
  - id: "interactions-index-2"
    q: "La raison principale de l'interaction est:"
    options:
      - "C'est impressionnant."
      - "La plupart des gens ne construiront jamais un objectif, mais presque tout le monde clique sur une barre — l'interaction est comment un tableau de bord répond aux questions que vous n'avez pas prévues"
      - "Il améliore les performances"
      - "Il est nécessaire pour le partage"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-1"
    q: "Deux widgets sont construits sur le même ensemble de données. Par défaut, cliquez sur un :"
    options:
      - "Ne fait rien à l'autre"
      - "Filtre l'autre — ils se font face automatiquement"
      - "Ouvre une nouvelle lentille"
      - "Nécessite une liaison pour interagir"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-2"
    q: "Pourquoi tourner délibérément face à face pour un widget ?"
    options:
      - "Améliorer les performances"
      - "Parce que c'est une référence — un total d'entreprise qui doit rester fixe pendant que tout le reste filtre, afin que le lecteur puisse voir la partie contre l'ensemble"
      - "Le visage est toujours mauvais"
      - "Pour cacher les données"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-3"
    q: "Un écran filtre une région et un widget est vide. La cause la plus probable est:"
    options:
      - "Une requête cassée"
      - "L'ensemble de données de ce widget n'a pas de lignes pour cette région — un état vide honnête qui a besoin d'une étiquette plutôt qu'une correction"
      - "Le visage est désactivé"
      - "Un prédicat de sécurité"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-1"
    q: "Un tableau de bord s'ouvre montrant toutes les régions et tout le temps. Pour un directeur régional, cela signifie:"
    options:
      - "Flexibilité maximale"
      - "Les mêmes trois clics chaque matin avant l'écran dit tout ce qui est pertinent"
      - "Chargement plus rapide"
      - "Meilleure sécurité"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-2"
    q: "Après avoir cliqué sur un segment, l'écran est filtré. La chose la plus importante à fournir est:"
    options:
      - "Une animation"
      - "Une indication visible de la sélection actuelle et une façon évidente de la effacer"
      - "Une infobulle"
      - "Un deuxième graphique"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-3"
    q: "Une vue sauvegardée est :"
    options:
      - "Une copie du tableau de bord"
      - "Un état mémorisé — filtres et sélections — donc quelqu'un retourne à sa tranche sans re-clic"
      - "Un courriel programmé"
      - "Un paramètre d'autorisation"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-1"
    q: "Un lien d'un tableau de bord sommaire à un détail vous permet:"
    options:
      - "Évitez de construire le résumé"
      - "Gardez le résumé petit, parce que le détail est à un clic de loin plutôt qu'entaché sur"
      - "Sauter la sécurité"
      - "Améliorer les performances de la requête"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-2"
    q: "La destination la plus utile pour un exercice à partir d'un tableau d'exception est habituellement:"
    options:
      - "Un autre état du tableau de bord"
      - "Les Salesforce enregistrement pour cette ligne, où le travail se produit réellement"
      - "Une exportation PDF"
      - "L'ensemble de données"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-3"
    q: "Un exercice qui atterrit sur un tableau de bord de détail non filtré est :"
    options:
      - "Très bien."
      - "Un exercice cassé — tout le point est que la destination hérite du contexte que vous avez cliqué"
      - "Plus souple"
      - "Plus vite"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-1"
    q: "Deux widgets sur le même ensemble de données. Cliquez sur un :"
    options:
      - "Ne fait rien"
      - "Filtre l'autre par défaut"
      - "Besoin d'une obligation"
      - "Ouvre une lentille"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-2"
    q: "Vous éteignez le visage sur un widget principalement lorsque:"
    options:
      - "C'est lent"
      - "C'est une référence qui doit rester fixe pendant que tout le reste filtre"
      - "C'est une table"
      - "Elle n'a pas de titre"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-3"
    q: "La moitié des widgets répondent à un filtre et la moitié ne le font pas. Voici :"
    options:
      - "Normal"
      - "L'état dangereux — l'écran est faux tandis que chaque widget est individuellement correct"
      - "Un problème de cache"
      - "Une limite de licence"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-4"
    q: "Un tableau de bord devrait ouvrir :"
    options:
      - "Sans filtre, montrant tout"
      - "Sur le cas commun — période actuelle, la portée du spectateur, triée et limitée"
      - "Sur un état vide"
      - "L'année dernière"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-5"
    q: "Affichage du mois en cours partiel à côté des mois complets:"
    options:
      - "Est la vue la plus actuelle"
      - "Fabrication d'une baisse apparente tous les mois sauf si elle est exclue ou marquée"
      - "Améliore la précision"
      - "N'a aucun effet"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-6"
    q: "Un tableau de bord filtré doit indiquer sa sélection car :"
    options:
      - "Ça a l'air plus léger."
      - "Il sera screenshotté, et le filtre est invisible dans l'image"
      - "Il est nécessaire pour le visage"
      - "Il accélère les requêtes"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-7"
    q: "Une vue sauvegardée est la plus précieuse pour:"
    options:
      - "Administrateurs"
      - "Toute personne dont la tranche est toujours la même, qui autrement le re-clic quotidiennement"
      - "Utilisateurs mobiles seulement"
      - "Exportations"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-8"
    q: "Un forage qui atterrit sur une destination non filtrée :"
    options:
      - "Donne plus de flexibilité"
      - "Il est cassé dans la pratique — il est cliqué une fois puis abandonné"
      - "Charge plus vite"
      - "Est le modèle standard"
    answer: 1
    topic: "interactions"
  - id: "bindings-index-1"
    q: "La différence entre la facette et une fixation est :"
    options:
      - "Aucune"
      - "Facetage est automatique entre les mêmes widgets de données; une liaison est le câblage explicite que vous configurez"
      - "Les liaisons sont plus rapides"
      - "Visage nécessaire SAQL"
    answer: 1
    topic: "bindings"
  - id: "bindings-index-2"
    q: "La meilleure première liaison à ajouter à n'importe quel tableau de bord est :"
    options:
      - "Visibilité des widgets conditionnels"
      - "Un titre dynamique qui indique la sélection actuelle"
      - "Une chaîne de filtres imbriquée"
      - "Une facette de données croisées"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-1"
    q: "Qu'est-ce qu'une liaison ?"
    options:
      - "Une jonction entre les ensembles de données"
      - "État d'un widget alimentant la requête ou l'affichage d'un autre widget"
      - "Un cadre de sécurité"
      - "Un type de graphique"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-2"
    q: "La meilleure première utilisation d'une liaison est généralement:"
    options:
      - "Visibilité des widgets conditionnels"
      - "Un titre dynamique qui indique la sélection actuelle"
      - "Filtres imbriqués dépendants"
      - "Facettes croisées de données"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-3"
    q: "Le principal coût à long terme d'un tableau de bord fortement lié est :"
    options:
      - "Demande de renseignements"
      - "Personne ne peut le changer en toute sécurité — la logique vit dans une configuration widget difficile à lire et impossible à diff"
      - "Consommation de permis"
      - "Mémoire du navigateur"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-1"
    q: "Le cas de bord le plus important d'une sélection est :"
    options:
      - "Sélections multiples"
      - "Rien sélectionné — ce que fait le widget lié lorsque la source est vide"
      - "Demandes lentes"
      - "Contraste de couleur"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-2"
    q: "Un filtre dépendant (la région rétrécit la liste des représentants) vaut la peine d'être construit lorsque:"
    options:
      - "Toujours"
      - "La liste des personnes à charge est assez longue pour qu'il en coûte cher — quarante représentants, pas quatre"
      - "Jamais"
      - "Seulement pour les administrateurs"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-3"
    q: "Une reliure de titre dynamique est utile principalement parce que :"
    options:
      - "Ça a l'air dynamique."
      - "L'état du filtre du tableau de bord survit à être screenshoté dans un message sans contexte"
      - "Il améliore les performances"
      - "Il est nécessaire pour le visage"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-1"
    q: "Une liaison de résultats se lit comme suit :"
    options:
      - "Ce que le spectateur a sélectionné"
      - "Une valeur retournée par la requête d'un autre widget"
      - "Les métadonnées de l'ensemble de données"
      - "Les URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-2"
    q: "Le coût de rendement d'une obligation de résultats est le suivant :"
    options:
      - "Il double le volume de données"
      - "Il crée un ordre d'exécution — le widget dépendant ne peut pas démarrer jusqu'à ce que la source soit retournée"
      - "Il désactive la mise en cache"
      - "Aucune"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-3"
    q: "Le débogage d'une liaison de résultats est plus difficile qu'une liaison de sélection parce que :"
    options:
      - "La syntaxe est différente"
      - "L'entrée est invisible à l'écran — vous devez tracer une requête plutôt que de regarder une sélection"
      - "Il ne peut pas être testé"
      - "Elle exige des droits d'administration"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-1"
    q: "Le risque principal des attaches à chaîne A → B → C est :"
    options:
      - "Précision des données"
      - "Exécution séquentielle et dépendance que personne ne peut voir, donc un changement à A casse C pour des raisons invisibles"
      - "Coût de la licence"
      - "Compatibilité du navigateur"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-2"
    q: "Le signal pratique qu'un tableau de bord a trop de fixations est:"
    options:
      - "La taille du fichier"
      - "Quelqu'un d'autre que son auteur ne peut pas le changer en toute sécurité, donc ils construisent un nouveau tableau de bord à la place"
      - "Le nombre de widgets"
      - "Lent rendu seul"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-3"
    q: "La chose la moins chère qui maintient un tableau de bord relié est :"
    options:
      - "Moins de composants graphiques"
      - "Une ligne dans la description par liaison — ce qui alimente quoi, et pourquoi"
      - "Plus de couleurs"
      - "Une convention de nommage pour les requêtes"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-1"
    q: "Une liaison diffère de la facette car:"
    options:
      - "C'est plus rapide"
      - "C'est le câblage explicite que vous configurez, où le revêtement est automatique entre des widgets même-dataset"
      - "Il faut SAQL"
      - "Il fonctionne à travers les orgnes"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-2"
    q: "La meilleure première liaison sur n'importe quel tableau de bord est:"
    options:
      - "Visibilité sous condition"
      - "Un titre dynamique avec la sélection"
      - "Une chaîne de filtres imbriquée"
      - "Une mesure bascule"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-3"
    q: "Une liaison de résultats se lit comme suit :"
    options:
      - "La sélection du spectateur"
      - "Une valeur une autre requête renvoyée"
      - "Métadonnées des ensembles de données"
      - "La page URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-4"
    q: "Les fixations des résultats ralentissent les tableaux de bord parce qu'ils :"
    options:
      - "Augmentation du volume de données"
      - "Exécution en série — le widget dépendant attend la source"
      - "Désactiver la mise en cache"
      - "Forcez un rafraîchissement complet"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-5"
    q: "Le cas de bord qui doit toujours être défini est:"
    options:
      - "Trop de lignes"
      - "Rien sélectionné"
      - "Un réseau lent"
      - "Un petit écran"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-6"
    q: "Un filtre dépendant où la représentation précédemment choisie n'a plus de portée devrait:"
    options:
      - "Continuer à filtrer cette rep"
      - "Effacer la sélection de l'impasse"
      - "Afficher une erreur"
      - "Recharger la page"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-7"
    q: "Cinq widgets liés à un filtre, contre trois liés dans une chaîne. Lequel est le plus durable?"
    options:
      - "La chaîne — moins de fixations"
      - "Les cinq - largeurs sont prévisibles, la profondeur n'est pas"
      - "Ils sont équivalents"
      - "Ni l'un ni l'autre ne peut être maintenu"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-8"
    q: "Une métrique de l'entreprise calculée par une liaison de résultats sur chaque charge devrait plutôt:"
    options:
      - "Être mis en cache dans le navigateur"
      - "Être calculé une fois dans la recette et stocké comme un champ"
      - "Être tapé comme une constante"
      - "Être enlevé"
    answer: 1
    topic: "bindings"
  - id: "dashboard-json-index-1"
    q: "La meilleure raison de modifier le tableau de bord JSON est directement:"
    options:
      - "Il est plus rapide que le constructeur pour le travail quotidien"
      - "Modifications en vrac et répétitives du constructeur vous fait faire un widget à la fois"
      - "Il débloque les types de graphiques cachés"
      - "Il contourne la sécurité"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-index-2"
    q: "Un tableau de bord JSON est utile dans l'examen parce que:"
    options:
      - "Il rend dans le navigateur"
      - "C'est un texte — il diffère, donc un changement est revisible plutôt que décrit dans une réunion"
      - "Il est plus petit que le tableau de bord"
      - "Il contient les données"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-1"
    q: "Dans un document de tableau de bord, une 'étape' est:"
    options:
      - "Une page d'assistant"
      - "Une définition de requête — les données d'un widget"
      - "Un point d'arrêt de la disposition"
      - "Une autorisation"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-2"
    q: "Plusieurs widgets montrent la même mesure tranchée différemment. Idéalement, ils:"
    options:
      - "Chacun définit sa propre étape"
      - "Partagez une étape, car le nombre de requêtes distinctes est le levier principal sur le temps de charge"
      - "Utiliser des ensembles de données séparés"
      - "Sont fusionnés en un seul widget"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-3"
    q: "Les widgets et les mises en page sont séparés car:"
    options:
      - "Accident historique"
      - "Un widget est ce qui est dessiné; une mise en page est là où il se trouve — de sorte qu'un widget peut être placé différemment à différentes tailles d'écran"
      - "Les mises en page stockent les données"
      - "Les widgets ne peuvent pas être positionnés"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-1"
    q: "Une étape avec écrit à la main SAQL plutôt qu'une définition cliquée est :"
    options:
      - "Invalide"
      - "Bien, et plus difficile pour le constructeur à aller-retour — l'interface peut ne pas être en mesure de le rééditer visuellement"
      - "Plus vite"
      - "Partage automatique"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-2"
    q: "Une étape statique est utilisée pour:"
    options:
      - "Cacher les résultats de la requête"
      - "Une liste fixe de valeurs — options de basculement, seuils — qui n'est pas posée à partir d'un ensemble de données"
      - "Règles de sécurité"
      - "Définition de la disposition"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-3"
    q: "Le levier principal sur le temps de charge du tableau de bord, visible dans le JSON, est:"
    options:
      - "Le nombre de widgets"
      - "Le nombre d'étapes distinctes — widgets qui pourraient partager une requête mais qui définissent chacun leur propre"
      - "La taille du fichier"
      - "Nombre de mises en page"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-1"
    q: "Un widget semble bien sur le bureau et mal sur un téléphone. Le problème est dans:"
    options:
      - "L'étape"
      - "Une disposition — la position et la taille sont définies par point d'arrêt, séparément du widget"
      - "L'ensemble de données"
      - "Le prédicat de sécurité"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-2"
    q: "Modifier les propriétés du widget comme texte est le plus utile pour :"
    options:
      - "Construction d'un nouveau tableau de bord"
      - "Appliquer le même changement de formatage sur de nombreux widgets à la fois"
      - "Modification de l'ensemble de données"
      - "Ajout de la sécurité"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-1"
    q: "Avant d'éditer un tableau de bord, vous devez :"
    options:
      - "Effacer le cache"
      - "Exporter une copie — l'histoire est ce que vous avez enregistré à l'avance"
      - "Prévenez tous les téléspectateurs"
      - "Désactiver le calendrier"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-2"
    q: "Le principal avantage de la gouvernance de garder le tableau de bord JSON dans un dépôt est:"
    options:
      - "Chargement plus rapide"
      - "Un changement devient un diff susceptible d'examen au lieu d'une phrase dans une réunion"
      - "Meilleure sécurité"
      - "Taille du fichier plus petite"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-3"
    q: "Après une modification manuelle, le test aller-retour est :"
    options:
      - "La vérification des données est correcte"
      - "Rechargement dans le constructeur pour confirmer qu'il s'ouvre et modifie encore visuellement"
      - "Exécution de la recette"
      - "Effacement des sélections"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-1"
    q: "Une étape dans un document de tableau de bord est :"
    options:
      - "Une page d'assistant"
      - "Une définition de requête nommée"
      - "Un point d'arrêt de la disposition"
      - "Une règle de partage"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-2"
    q: "Les widgets renvoient leurs données par:"
    options:
      - "contenant SAQL en ligne"
      - "Nommer une étape"
      - "Pointage à un id de jeu de données"
      - "Héritage de la mise en page"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-3"
    q: "Un tableau de bord ne semble pas bon que sur les téléphones. Regardez :"
    options:
      - "L'étape"
      - "Les plans"
      - "L'ensemble de données"
      - "Le prédicat"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-4"
    q: "Onze étapes pour douze widgets suggèrent:"
    options:
      - "Bonne séparation"
      - "Presque rien n'est partagé, et l'écran fait onze tours"
      - "Un fichier corrompu"
      - "Trop de widgets"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-5"
    q: "La façon la plus rapide de trouver chaque liaison sur un tableau de bord hérité est:"
    options:
      - "Ouvrir le panneau de chaque widget"
      - "Rechercher JSON pour la syntaxe de liaison"
      - "Demandez à l'auteur"
      - "Vérifiez l'ensemble de données"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-6"
    q: "Avant d'éditer la main, vous devez toujours :"
    options:
      - "Effacer les sélections"
      - "Exporter une copie"
      - "Pause l'horaire"
      - "Prévenez les téléspectateurs"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-7"
    q: "L'essai aller-retour vérifie que:"
    options:
      - "Les données sont exactes"
      - "Le constructeur peut encore ouvrir et modifier visuellement le tableau de bord après votre modification"
      - "Le fichier est petit"
      - "La sécurité s'applique toujours"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-8"
    q: "Quel changement est le mieux laissé au constructeur plutôt qu'au texte?"
    options:
      - "Renaming un champ à travers les widgets"
      - "Ajout ou suppression d'un widget, car il doit être cohérent dans chaque mise en page"
      - "Modifier un format de nombre"
      - "Modifier un titre"
    answer: 1
    topic: "dashboard-json"
---

Questions pratiques pour le domaine de la mise en œuvre du tableau de bord CRM Analytics et Einstein Discovery Examen de consultant.
