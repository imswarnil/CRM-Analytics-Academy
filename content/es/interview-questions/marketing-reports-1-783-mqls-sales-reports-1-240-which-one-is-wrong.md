---
title: "Informes de comercialización 1.783 MQL, informes de ventas 1.240. ¿Cuál es el problema?"
description: "Probablemente tampoco. Esa brecha es casi siempre una diferencia de definición más que un error de cálculo, y la causa más común es el campo de la fecha:..."
type: "conceptual"
topic: "gtm-engineering"
level: "mid"
source: "academy"
---

Probablemente tampoco. Esa brecha es casi siempre una diferencia de definición en lugar de un error de cálculo, y la causa más común es el campo de fecha: el marketing cuenta para la fecha en que se creó el plomo, las ventas cuentan para la fecha en que estaba calificado, y con un retraso de hasta tres semanas los cubos mensuales nunca están de acuerdo. Otros candidatos son si se excluyen las pistas descalificadas, si las firmas de autoservicio cuentan, y si una parte es deduplicada por la empresa. Mi movimiento no es encontrar el error sino poner ambas definiciones lado a lado, indicar qué campo de fecha y qué filtra cada uso, y preguntar el negocio que uno va en la cubierta de la tabla. Eso lo convierte de un problema de datos en una decisión de negocio, que es donde pertenece, y luego escribo la definición elegida en la cara del panel de control para que no se repita.
