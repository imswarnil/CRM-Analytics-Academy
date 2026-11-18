---
title: "Sécurité — questions pratiques"
domain: "security"
quiz:
  - id: "setup-index-1"
    q: "Pourquoi? CRM Analytics l'accès passe par des ensembles de permissions plutôt que des profils?"
    options:
      - "Les profils sont dépréciés"
      - "Les permissions d'analytique sont délivrées comme autorisation fixant des licences qui sont accordées additivement, de sorte que l'accès est composé plutôt que cuit dans un seul profil"
      - "Profils ne peuvent pas accorder l'accès aux objets"
      - "C'est un bug de licence"
    answer: 1
    topic: "setup"
  - id: "setup-index-2"
    q: "Un tableau de bord est correct pour vous et vide pour l'équipe de vente. La cause la plus probable est :"
    options:
      - "Une requête de widget cassée"
      - "Sécurité de niveau de ligne — le prédicat ou le partage d'héritage filtre leurs lignes loin"
      - "L'ensemble de données n'a pas été actualisé"
      - "Ils ont besoin d'un navigateur différent"
    answer: 1
    topic: "setup"
  - id: "setup-index-3"
    q: "Quand la sécurité devrait-elle être conçue?"
    options:
      - "Après l'approbation des tableaux de bord"
      - "Avant la création du premier ensemble de données, car le prédicat dépend de champs qui doivent être synchronisés et parfois d'un nœud de recette qui aplatit la hiérarchie des rôles"
      - "Seulement si les données sont sensibles"
      - "Il est automatique"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-1"
    q: "Un administrateur système ne peut pas voir le Analytics Studio Tuile. Qu'est-ce qui ne va pas ?"
    options:
      - "Leur profil est mal configuré"
      - "Rien n'est mal... CRM Analytics accès vient par permission définie, et les droits d'administration ne l'incluent pas"
      - "L'org n'a pas de données"
      - "Ils doivent être Salesforce Utilisateur de la plateforme"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-2"
    q: "Quelle est la capacité du niveau supérieur (plus) plutôt que celle de la base?"
    options:
      - "Construction de tableaux de bord"
      - "Einstein Discovery — la formation et le déploiement de modèles prédictifs"
      - "Création de ensembles de données"
      - "Partage d'une application"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-3"
    q: "Le moyen le plus rapide pour savoir ce qu'un utilisateur manque est :"
    options:
      - "Comparez leur profil au vôtre"
      - "Ouvrez l'enregistrement de l'utilisateur et lisez l'ensemble des autorisations assignées, puis vérifiez les droits de licence de l'org"
      - "Reconstruire le tableau de bord"
      - "Demandez-leur de se déconnecter."
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-1"
    q: "L'utilisateur d'intégration n'a pas accès au champ Discount c. Qu'est-ce qui se passe ?"
    options:
      - "La synchronisation échoue avec une erreur"
      - "Le champ n'arrive jamais ; la recette et le tableau de bord construisent des chiffres correctement et tranquillement sans rabais"
      - "Le champ arrive vide et est signalé"
      - "Salesforce donne accès automatiquement"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-2"
    q: "Pourquoi cet échec est-il particulièrement dangereux?"
    options:
      - "Il corrompt l'ensemble de données"
      - "Il est silencieux et produit des nombres plausibles, donc il survit examen"
      - "Il supprime les enregistrements"
      - "Il n'affecte que les administrateurs"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-3"
    q: "Un nouveau champ personnalisé a été ajouté le mois dernier mais n'est pas dans l'ensemble de données. Première chose à vérifier ?"
    options:
      - "La requête du widget du tableau de bord"
      - "Indique si le champ a été ajouté à la sélection de synchronisation des données ET est visible pour l'utilisateur d'intégration"
      - "Le prédicat de sécurité"
      - "Les paramètres de partage de l'application"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-1"
    q: "Où est appliqué un prédicat de sécurité?"
    options:
      - "Sur chaque widget, au moment du design"
      - "Sur l'ensemble de données, au moment de la requête, par visionneur"
      - "Dans la recette, au moment de construire"
      - "Sur les paramètres de partage de l'application"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-2"
    q: "Pourquoi un prédicat-hiérarchie a-t-il généralement besoin d'un noeud « plat » dans la recette?"
    options:
      - "Pour réduire le nombre de lignes"
      - "Parce qu'un prédicat ne peut pas marcher la hiérarchie au moment de la requête — l'ascendance doit être précomptée dans une colonne qu'il peut comparer avec"
      - "Pour trier les données"
      - "Il ne le fait pas; aplati est en option style"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-3"
    q: "Vous ajoutez un prédicat et vos propres tableaux de bord sont vides. L'explication la plus probable est:"
    options:
      - "L'ensemble de données est corrompu"
      - "Le prédicat est évalué pour vous aussi, et votre utilisateur ne le satisfait pas"
      - "La recette a échoué"
      - "Prédicat fonctionne uniquement pour les administrateurs"
    answer: 1
    topic: "setup"
  - id: "setup-sharing-inheritance-1"
    q: "Quel est le principal avantage de partager l'héritage sur un prédicat écrit à la main?"
    options:
      - "Il est plus rapide de demander"
      - "Il réutilise le partage existant de l'org, de sorte que l'analyse ne peut dériver du CRM que l'entreprise réorganise"
      - "Il supporte plus d'objets"
      - "Il supprime le besoin de l'utilisateur d'intégration"
    answer: 1
    topic: "setup"
  - id: "setup-sharing-inheritance-2"
    q: "Pourquoi le partage de l'héritage nécessite - t - il un prédicat?"
    options:
      - "Pour les données non relatives à la force de vente seulement"
      - "Parce que l'héritage a des limites — quand le partage d'un utilisateur est trop complexe pour être évalué, le revers décide ce qu'il voit"
      - "Pour accélérer le tableau de bord"
      - "Il n'en a pas besoin"
    answer: 1
    topic: "setup"
  - id: "setup-org-settings-and-rollout-1"
    q: "Un nouveau CRM Analytics fonction bascule apparaît après une sortie. Où devriez-vous l'activer en premier ?"
    options:
      - "La production, donc tout le monde profite immédiatement"
      - "Un bac à sable ou un org développeur, où un changement de comportement ne peut affecter un tableau de bord en direct"
      - "Nulle part — ne jamais activer de nouvelles fonctionnalités"
      - "Ça ne change rien."
    answer: 1
    topic: "setup"
  - id: "setup-org-settings-and-rollout-2"
    q: "Quel est le premier public approprié pour un nouveau tableau de bord?"
    options:
      - "Toute l'entreprise, pour maximiser les retours d'information"
      - "Deux ou trois personnes qui prendront réellement la décision qu'elle soutient"
      - "Exécutifs seulement"
      - "Personne — publier silencieusement"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-1"
    q: "Où est configuré le prédicat de sécurité ?"
    options:
      - "Sur le tableau de bord"
      - "Sur l'ensemble de données"
      - "Sur l'application"
      - "Sur le profil utilisateur"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-2"
    q: "Votre propre tableau de bord est vide après avoir ajouté un prédicat. Que s'est-il passé ?"
    options:
      - "L'ensemble de données s'est rompu"
      - "Le prédicat s'applique aussi à vous et votre utilisateur ne le satisfait pas"
      - "Prédices désactiver les tableaux de bord"
      - "La recette doit être ré-exécutée"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-3"
    q: "Le champ régional d'un utilisateur est vide. Que voient-ils ?"
    options:
      - "Tout"
      - "Rien — un nul échoue fermé"
      - "Seulement leurs propres dossiers"
      - "Un message d'erreur"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-1"
    q: "Un administrateur système n'a pas Analytics Studio Tuile. Pourquoi ?"
    options:
      - "Leur profil est brisé"
      - "CRM Analytics accès vient par permission définie; droits d'administration ne l'incluent pas"
      - "L'org n'a pas de données"
      - "Ils doivent être un utilisateur de la Plateforme"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-2"
    q: "Einstein Discovery nécessite:"
    options:
      - "Niveau de croissance de base"
      - "Niveau supérieur Plus"
      - "Aucune licence"
      - "Une licence distincte de Tableau"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-3"
    q: "L'utilisateur d'intégration ne peut pas voir un champ personnalisé. Qu'est-ce qui se passe ?"
    options:
      - "La synchronisation échoue fort"
      - "Le champ n'arrive jamais, tout en aval se construit proprement, et les chiffres sont tranquillement incomplets"
      - "Le champ arrive comme nul et est signalé"
      - "L'accès est accordé automatiquement"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-4"
    q: "Où est appliqué un prédicat de sécurité?"
    options:
      - "Sur le tableau de bord au moment de la conception"
      - "Sur l'ensemble de données, par visionneur, au moment de la requête"
      - "Dans la recette au moment de la construction"
      - "Sur le partage de l'application"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-5"
    q: "Vous ajoutez un prédicat et vos propres tableaux de bord sont vides. Pourquoi ?"
    options:
      - "L'ensemble de données est corrompu"
      - "Le prédicat est évalué pour vous aussi et votre utilisateur ne le satisfait pas"
      - "Prédices désactiver définitivement l'accès admin"
      - "La recette doit être réutilisée"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-6"
    q: "Le champ de prédicat d'un utilisateur est vide. Que voient-ils ?"
    options:
      - "Tout"
      - "Rien — les nuls échouent fermé"
      - "Leurs propres dossiers"
      - "Une erreur"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-7"
    q: "Pourquoi un prédicat de la hiérarchie a besoin d'un noeud aplati ?"
    options:
      - "Pour réduire la taille des ensembles de données"
      - "Un prédicat ne peut pas marcher une hiérarchie au moment de la requête, de sorte que l'ascendance est précalculée dans une colonne comparable"
      - "Pour trier les rôles par ordre alphabétique"
      - "Ce n'est pas le cas."
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-8"
    q: "Le principal avantage du partage de l'héritage sur un prédicat écrit à la main est :"
    options:
      - "Demandes plus rapides"
      - "Il réutilise le partage existant de l'org, de sorte que l'analyse ne peut pas dériver à mesure que l'entreprise se réorganise"
      - "Il fonctionne sur toutes les données externes"
      - "Il supprime le besoin d'un utilisateur d'intégration"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-9"
    q: "Pourquoi le partage de l'héritage nécessite - t - il un prédicat?"
    options:
      - "Pour la performance"
      - "Parce que l'héritage a des limites, et quelque chose doit décider ce qu'un spectateur voit quand il ne peut pas être évalué"
      - "Pour soutenir les tableaux de bord"
      - "Ce n'est pas le cas."
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-10"
    q: "Avant de publier un tableau de bord sécurisé, vous devez :"
    options:
      - "Revoir en tant qu'administrateur"
      - "Vérifiez-le en tant qu'utilisateur restreint, gestionnaire et quelqu'un qui ne devrait rien voir"
      - "Exportez-le vers un tableur"
      - "Activer chaque fonction basculer"
    answer: 1
    topic: "setup"
---

Questions pratiques pour le domaine de la sécurité CRM Analytics et Einstein Discovery Examen de consultant.
