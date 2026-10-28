---
title: "¿Cuándo modelarás mucho más que ancho?"
description: "Cuando las métricas se añaden a menudo, o cuando quiero un widget para trazar cualquiera de ellos a través de un filtro, nuevas métricas se convierten en nuevas filas en lugar de un cambio de esquema y..."
type: "conceptual"
topic: "datasets-and-modelling"
level: "junior"
source: "academy"
---

Cuando las métricas se añaden a menudo, o cuando quiero un widget para trazar cualquiera de ellos a través de un filtro, nuevas métricas se convierten en nuevas filas en lugar de un cambio de esquema y una reconstrucción. El costo es que cada consulta debe filtrar a una métrica, y una consulta que olvida añade ingresos para tratar con la tasa de conversión y devuelve un número sin error. Así que si modelo largo, el filtro métrico entra en la consulta base en lugar de ser dejado a cada constructor para recordar.
