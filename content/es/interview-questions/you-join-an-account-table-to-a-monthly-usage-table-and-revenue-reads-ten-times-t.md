---
title: "Se une a una tabla de cuentas a una tabla de uso mensual y los ingresos leen diez veces demasiado alto. ¿Qué pasó?"
description: "Fan-out. La tabla de la cuenta es una fila por cuenta y la tabla de uso es una fila por cuenta por producto por mes, así que después de la unión de cada cuenta aparece..."
type: "scenario"
topic: "gtm-engineering"
level: "mid"
source: "academy"
---

Fan-out. La tabla de cuenta es una fila por cuenta y la tabla de uso es una fila por cuenta por producto por mes, por lo que después de la unión cada cuenta aparece una vez por renglón de uso, hasta 54 veces para una cuenta con tres productos a través de dieciocho meses. La columna ARR no está mal en ninguna fila individual, se repite, y summing se multiplica. La solución es agregar el lado del uso para contabilizar primero el grano — suma de los ingresos facturados, la utilización promedio, tomar el último estado de compromiso — y luego unirse, que mantiene la salida en una fila por cuenta. El hábito que atrapa es afirmar el recuento de filas después de cada una de las uniones: si el conjunto de datos de la cuenta no sale en el número de cuentas con las que empecé, me fijé. También mantengo un par de anclas totales memorizados así que un número absurdo es obvio a un vistazo.
