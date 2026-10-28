---
title: "¿Cómo calcula LTV para una piscina prepagada, como los días de asiento del aula?"
description: "Cuidado, y mostraría dos números. La fórmula del libro de texto divide los tiempos de ARPA margen bruto por una tasa de churn, y supone ingresos por cuenta es estable..."
type: "conceptual"
topic: "demand-analytics"
level: "mid"
source: "academy"
---

Cuidado, y mostraría dos números. La fórmula del libro de texto divide el margen bruto de los tiempos de ARPA por una tasa de churn, y supone que los ingresos por cuenta son estables y que el churn es un evento, ni es cierto para una piscina prepagada, donde una cuenta renueva por lo que realmente usó y puede reducir el 40% sin nunca cancelar. Así que publicaría esa figura para los planes de asiento donde es genuinamente válida, y etiquetaría una estimación en otro lugar. La versión honesta es valor cohorte-realizado: cuentas de grupo por mes de registro, resumir los ingresos de cada cohorte indexados por meses desde el registro, y trazar ingresos acumulativos por cohorte. Líneas que siguen escalando significa expansión está superando la contracción, que es el hecho más importante sobre un negocio que vende en equipos y completamente invisible en una tasa de churn. La caveat to state es truncation — una cohorte de tres meses tiene tres meses de ingresos contra un CAC completo, por lo que las cohortes recientes siempre se ven mal y deben ser grisados en lugar de comparar.
