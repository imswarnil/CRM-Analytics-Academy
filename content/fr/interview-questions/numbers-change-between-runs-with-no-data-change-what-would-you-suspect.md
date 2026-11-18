---
title: "Les nombres changent entre les parcours sans changement de données. Qu'est-ce que tu soupçonnes ?"
description: "Une plage relative de dates, qui se déplace réellement et qui est correcte pour un tableau de bord en direct, ou une fenêtre sans commande explicite, qui est un bug — exécutant des totaux,..."
type: "scenario"
topic: "saql"
level: "junior"
source: "academy"
---

Une plage de dates relative, qui se déplace réellement et qui est correcte pour un tableau de bord en direct, ou une fenêtre sans ordre explicite, qui est un bogue — les totaux d'exécution, le rang et la période sur-période dépendent tous de l'ordre de ligne, et sans un spécifié le moteur utilise tout ce qu'il produit. Il est stable jusqu'au prochain rafraîchissement, puis tranquillement différent.
