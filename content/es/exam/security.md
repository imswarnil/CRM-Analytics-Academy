---
title: "Cuestiones de seguridad y práctica"
domain: "security"
quiz:
  - id: "setup-index-1"
    q: "¿Por qué? CRM Analytics acceso a través de conjuntos de permiso en lugar de perfiles?"
    options:
      - "Los perfiles están deprecatados"
      - "Autores analíticos envían como permisos establecidos licencias que se otorgan aditivamente, por lo que el acceso se compone en lugar de horneado en un perfil"
      - "Los perfiles no pueden conceder acceso a objetos"
      - "Es un error de licencia"
    answer: 1
    topic: "setup"
  - id: "setup-index-2"
    q: "Un dashboard es correcto para usted y vacío para el equipo de ventas. La causa más probable es:"
    options:
      - "Una consulta de widget roto"
      - "Seguridad de nivel de fila — el predicado o la herencia compartida está filtrando sus filas lejos"
      - "El conjunto de datos no refrescó"
      - "Necesitan un navegador diferente"
    answer: 1
    topic: "setup"
  - id: "setup-index-3"
    q: "¿Cuándo se debe diseñar la seguridad?"
    options:
      - "Después de que los paneles sean aprobados"
      - "Antes de que se construya el primer conjunto de datos, porque el predicado depende de campos que deben ser sincronizados y a veces en un nodo de receta que aplana la jerarquía de roles"
      - "Sólo si los datos son sensibles"
      - "Es automático"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-1"
    q: "Un Administrador del Sistema no puede ver Analytics Studio Azulejos. ¿Qué pasa?"
    options:
      - "Su perfil está mal configurado"
      - "Nada está mal: CRM Analytics acceso viene por el sistema de permisos, y los derechos de administración no lo incluyen"
      - "La org no tiene datos"
      - "Necesitan ser un Salesforce Usuario de la plataforma"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-2"
    q: "¿Qué capacidad se encuentra en el nivel más alto (Plus) en lugar de la base?"
    options:
      - "Paneles de construcción"
      - "Einstein Discovery — historias de capacitación e implementación de modelos predictivos"
      - "Creación de conjuntos de datos"
      - "Compartir una aplicación"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-3"
    q: "La manera más rápida de averiguar qué es un usuario que falta es:"
    options:
      - "Compare su perfil con el suyo"
      - "Abra su registro de usuario y lea las asignaciones de permisos, y luego revise los derechos de licencia del org"
      - "Reconstruir el tablero"
      - "Pídeles que entren."
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-1"
    q: "El usuario de integración carece de acceso a nivel de campo a Discount  c. ¿Qué pasa?"
    options:
      - "La sincronización falla con un error"
      - "El campo nunca llega; la receta y dashboard construyen figuras limpias y tranquilamente computar sin descuentos"
      - "El campo llega vacío y está marcado"
      - "Salesforce Acceso automático"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-2"
    q: "¿Por qué este fracaso es especialmente peligroso?"
    options:
      - "corrompe el conjunto de datos"
      - "Es silencioso y produce números plausibles, por lo que sobrevive la revisión"
      - "Elimina los registros"
      - "Sólo afecta a los administradores"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-3"
    q: "Un nuevo campo personalizado fue añadido el mes pasado, pero no está en el conjunto de datos. ¿Lo primero que hay que comprobar?"
    options:
      - "La consulta de widget del panel"
      - "Si el campo fue añadido a la selección de sincronización de datos Y es visible para el usuario de integración"
      - "La situación de seguridad"
      - "La configuración de compartir aplicaciones"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-1"
    q: "¿Dónde se aplica un predicado de seguridad?"
    options:
      - "En cada widget, en tiempo de diseño"
      - "En el conjunto de datos, en tiempo de consulta, por espectador"
      - "En la receta, a tiempo de construcción"
      - "En la configuración de compartir la aplicación"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-2"
    q: "¿Por qué un predicado de la Jerarquía de papel generalmente necesita un nodo 'flatten' en la receta?"
    options:
      - "Para reducir el recuento de filas"
      - "Debido a que un predicado no puede caminar la jerarquía en el tiempo de la consulta - la ascendencia tiene que ser precomputada en una columna que puede comparar contra"
      - "Para ordenar los datos"
      - "No lo hace; aplanado es estilo opcional"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-3"
    q: "Añades un predicado y tus propios tableros vacíos. La explicación más parecida es:"
    options:
      - "El conjunto de datos es corrupto"
      - "El predicado es evaluado para usted también, y su usuario no lo satisface"
      - "La receta falló"
      - "Los médicos sólo trabajan para los administradores"
    answer: 1
    topic: "setup"
  - id: "setup-sharing-inheritance-1"
    q: "¿Cuál es la principal ventaja de compartir la herencia sobre un predicado escrito a mano?"
    options:
      - "Es más rápido para la consulta"
      - "Reutiliza el intercambio existente de la org, por lo que la analítica no puede derivarse de la CRM como reorganiza el negocio"
      - "Soporta más objetos"
      - "Elimina la necesidad del usuario de integración"
    answer: 1
    topic: "setup"
  - id: "setup-sharing-inheritance-2"
    q: "¿Por qué compartir la herencia necesita un problema?"
    options:
      - "Para los datos no relacionados con las ventas solamente"
      - "Debido a que la herencia tiene límites — cuando el compartir de un usuario es demasiado complejo para evaluar, el inconveniente decide lo que ven"
      - "Para acelerar el tablero"
      - "No necesita uno"
    answer: 1
    topic: "setup"
  - id: "setup-org-settings-and-rollout-1"
    q: "Una nueva CRM Analytics función toggle aparece después de una liberación. ¿Dónde debe habilitarlo primero?"
    options:
      - "Producción, así que todos se benefician inmediatamente"
      - "Una caja de arena o una org de desarrollador, donde un cambio de comportamiento no puede afectar a un dashboard en vivo"
      - "En ninguna parte - nunca habilitar nuevas características"
      - "No importa."
    answer: 1
    topic: "setup"
  - id: "setup-org-settings-and-rollout-2"
    q: "¿Cuál es el primer público adecuado para un nuevo panel?"
    options:
      - "Toda la compañía, para maximizar los comentarios"
      - "Dos o tres personas que realmente tomarán la decisión que apoya"
      - "Ejecutivos solamente"
      - "Nadie publica silenciosamente"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-1"
    q: "¿Dónde está configurado el predicado de seguridad?"
    options:
      - "En el tablero"
      - "En el conjunto de datos"
      - "En la aplicación"
      - "En el perfil de usuario"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-2"
    q: "Su propio tablero va vacío después de añadir un predicado. ¿Qué pasó?"
    options:
      - "El conjunto de datos se rompió"
      - "El predicado se aplica a usted también y su usuario no lo satisface"
      - "Predicados deshboards deshabilitados"
      - "La receta necesita volver a funcionar"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-3"
    q: "El campo de la región del usuario está en blanco. ¿Qué ven?"
    options:
      - "Todo"
      - "Nada — un nulo falla cerrado"
      - "Sólo sus propios registros"
      - "Un mensaje de error"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-1"
    q: "A System Administrator has no Analytics Studio Azulejos. ¿Por qué?"
    options:
      - "Su perfil está roto"
      - "CRM Analytics acceso viene por el sistema de permiso; los derechos de administración no incluyen"
      - "La org no tiene datos"
      - "Deben ser un usuario de la Plataforma"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-2"
    q: "Einstein Discovery requiere:"
    options:
      - "El nivel de crecimiento base"
      - "El nivel más alto"
      - "Ninguna licencia en absoluto"
      - "Una licencia de Tableau separada"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-3"
    q: "El usuario de integración no puede ver un campo personalizado. ¿Qué pasa?"
    options:
      - "La sincronización falla en voz alta"
      - "El campo nunca llega, todo lo río abajo se construye limpiamente, y los números son silenciosamente incompletos"
      - "El campo llega como nulo y está marcado"
      - "El acceso se otorga automáticamente"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-4"
    q: "¿Dónde se aplica un predicado de seguridad?"
    options:
      - "En el panel en tiempo de diseño"
      - "En el conjunto de datos, por espectador, a tiempo de consulta"
      - "En la receta a tiempo de construcción"
      - "En la aplicación compartir"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-5"
    q: "Añades un predicado y tus propios tableros vacíos. ¿Por qué?"
    options:
      - "El conjunto de datos es corrupto"
      - "El predicado es evaluado para usted también y su usuario no lo satisface"
      - "Predica el acceso de administración deshabilitado permanentemente"
      - "La receta debe volver a funcionar"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-6"
    q: "El campo predicado de un usuario está en blanco. ¿Qué ven?"
    options:
      - "Todo"
      - "Nada — nulls fail closed"
      - "Sus propios registros"
      - "Un error"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-7"
    q: "¿Por qué un predicado de la Jerarquía necesita un nodo aplanado?"
    options:
      - "Para reducir el tamaño del conjunto de datos"
      - "Un predicado no puede caminar una jerarquía en el tiempo de la consulta, por lo que la ascendencia es precomputada en una columna comparable"
      - "Para clasificar las funciones alfabéticamente"
      - "No lo hace"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-8"
    q: "La principal ventaja de compartir la herencia sobre un predicado escrito a mano es:"
    options:
      - "Consultas más rápidas"
      - "Reutiliza el intercambio existente de la org, por lo que la analítica no puede derivar como reorganiza el negocio"
      - "Funciona en todos los datos externos"
      - "Elimina la necesidad de un usuario de integración"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-9"
    q: "¿Por qué compartir la herencia necesita un problema?"
    options:
      - "Para el rendimiento"
      - "Porque la herencia tiene límites, y algo debe decidir lo que un espectador ve cuando no se puede evaluar"
      - "Para soportar los tableros de mando"
      - "No lo hace"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-10"
    q: "Antes de liberar un tablero seguro debe:"
    options:
      - "Reviselo como administrador"
      - "Compruébalo como un usuario restringido, un gerente, y alguien que no debe ver nada"
      - "Exportarla a una hoja de cálculo"
      - "Activar todas las características para cambiar"
    answer: 1
    topic: "setup"
---

Cuestiones de práctica para el dominio de seguridad del CRM Analytics y Einstein Discovery Examen de consultoría.
