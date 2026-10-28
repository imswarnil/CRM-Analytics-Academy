---
title: "¿Cómo manejas los valores perdidos?"
description: "Primero decidiendo si el blanco significa 'ninguno' o 'no conocido', porque cada relleno es una reclamación — cero afirma ninguno, el promedio afirma típico. Si me llena,..."
type: "behavioral"
topic: "data-preparation"
level: "junior"
source: "academy"
---

Primero decidiendo si el blanco significa 'ninguno' o 'no conocido', porque cada relleno es una reclamación — cero afirma ninguno, el promedio afirma típico. Si lleno, guardo una columna de bandera diciendo que lo hice, así que cualquiera puede excluir filas imputadas más tarde y puede decir qué números eran reales. Y nunca analizo un valor imputed contra lo que se imputó, porque encontraría el patrón que puse allí. A veces la falta es la señal: nuestro campo de compra económica en blanco predice la pérdida, no porque causa nada sino porque un repudio desenganchado no llena los campos — realmente predictivo y completamente inaccesible.
