---
title: "¿Cómo? SAQL diferido SQL?"
description: "Es una transformación de corriente en lugar de una consulta declarativa. Cada declaración toma el resultado anterior y lo transforma, reasignando la misma variable,..."
type: "technical"
topic: "saql"
level: "junior"
source: "academy"
---

Es una transformación de corriente en lugar de una consulta declarativa. Cada declaración toma el resultado anterior y lo transforma, reasignando la misma variable, por lo que el orden de declaración es literalmente el plan que funciona — no hay optimista reordenandolo. Prácticamente eso significa filtrar temprano en vez de tarde, porque filtrar después de un grupo significa agrupar filas que estaba a punto de descartar. La otra diferencia que las mordeduras es citar: citas individuales para nombres de campo, citas dobles para valores de cadena.
