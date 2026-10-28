---
title: "Alguien dice que el conjunto de datos tiene duplicados. ¿Qué haces?"
description: "Averigua qué de tres cosas significan. Por lo general es un artefacto de unión — filas multiplicadas por una unión de uno a muchos, donde los registros están bien y la consulta ..."
type: "conceptual"
topic: "data-preparation"
level: "junior"
source: "academy"
---

Averigua qué de tres cosas significan. Por lo general es un artefacto de unión — filas multiplicadas por una unión de uno a muchos, donde los registros están bien y la consulta está equivocada, y la solución es la unión en lugar de un paso de duplicación. A veces es el grano previsto, como una cuenta que aparece una vez al mes en una instantánea. Sólo ocasionalmente es un verdadero duplicado de registros. Eliminar filas para arreglar un fan-out baja el total por lo que parece que funcionó, mientras que la eliminación de datos reales y dejar la mala unión en lugar para la siguiente medida para golpear.
