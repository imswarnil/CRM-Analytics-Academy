---
title: "¿Sobreescritura o incremental?"
description: "Sobreescribir hasta que el volumen lo hace mal. Es auto-corrección — una mala carrera es fijada por el próximo bueno — no necesita clave y no puede derivar. Incremental upsert..."
type: "conceptual"
topic: "apis-and-automation"
level: "senior"
source: "academy"
---

Sobreescribir hasta que el volumen lo hace mal. Es auto-corrección — una mala carrera es fijada por el próximo bueno — no necesita clave y no puede derivar. Es necesario aumentar a escala y se deriva silenciosamente cuando se pierde un cambio: nada errores, el conjunto de datos es simplemente un poco incorrecto indefinidamente. Así que si voy incremental añadir una reconciliación completa periódica, de lo contrario he intercambiado un costo visible para uno invisible.
