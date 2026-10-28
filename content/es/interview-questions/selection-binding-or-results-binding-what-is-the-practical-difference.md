---
title: "Selection binding or results binding — ¿Cuál es la diferencia práctica?"
description: "Una unión de selección lee lo que alguien hizo clic, por lo que la entrada es visible en la pantalla y es debuggable mirando. Una unión de resultados lee un valor..."
type: "technical"
topic: "bindings"
level: "junior"
source: "academy"
---

Una unión de selección lee lo que alguien hizo clic, por lo que la entrada es visible en la pantalla y es debuggable mirando. Una unión de resultados lee un valor otra consulta devuelta — un promedio de empresa, un max, una categoría superior— que es más potente y mucho más difícil de depurar, porque la entrada es invisible. También crea una orden de ejecución: el widget dependiente no puede comenzar hasta que la fuente regrese, por lo que dos consultas paralelas se convierten en dos secuenciales.
