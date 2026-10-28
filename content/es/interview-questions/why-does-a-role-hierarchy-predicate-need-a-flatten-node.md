---
title: "¿Por qué un predicado de la Jerarquía necesita un nodo aplanado?"
description: "Porque un predicado es una comparación y una jerarquía es un árbol, y una comparación no puede caminar un árbol a la hora de la consulta. El nodo aplanado precompute cada papel..."
type: "conceptual"
topic: "setup"
level: "senior"
source: "academy"
---

Porque un predicado es una comparación y una jerarquía es un árbol, y una comparación no puede caminar un árbol a la hora de la consulta. El nodo aplanado precompute la ascendencia de cada papel en una columna de ruta en el tiempo de la receta, y el predicado pregunta si el papel del espectador aparece en ese camino. También es la razón concreta por la que la seguridad debe diseñarse antes del modelo de datos: la regla necesita una columna, la columna necesita un nodo de receta, y el nodo necesita campos que deben ser sincronizados.
