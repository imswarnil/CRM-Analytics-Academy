---
title: "Aplicación de paneles de análisis — preguntas de práctica"
domain: "dashboard-implementation"
quiz:
  - id: "saql-index-1"
    q: "SAQL's define la diferencia de SQL es que:"
    options:
      - "No tiene funciones agregadas"
      - "Es una transformación de corriente — cada declaración transforma el resultado anterior, así que orden de declaración ES el plan de consulta"
      - "No se puede filtrar"
      - "Sólo lee un conjunto de datos"
    answer: 1
    topic: "saql"
  - id: "saql-index-2"
    q: "La forma más barata de aprender SAQL es:"
    options:
      - "Leer el final de referencia de la función"
      - "Construyendo un gráfico haciendo clic, luego leyendo la consulta que generó contra una respuesta que ya sabes"
      - "Escribir consultas desde cero"
      - "Copiar ejemplos de foros"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-1"
    q: "¿Cómo? SAQL difieren lo más importante SQL?"
    options:
      - "No se puede filtrar"
      - "Es una transformación de corriente — cada declaración transforma el resultado del anterior, por lo que la declaración ORDER es el plan de consulta"
      - "No tiene funciones agregadas"
      - "Sólo funciona en un conjunto de datos"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-2"
    q: "Quieres la parte de cada segmento de los ingresos totales. ¿Por qué es esto incómodo con clics solos?"
    options:
      - "Los porcentajes no reciben apoyo"
      - "Necesita cada fila en comparación con un agregado de todas las filas - dos niveles de agregación en una consulta"
      - "Los segmentos no pueden agruparse"
      - "No es incómodo"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-3"
    q: "¿Dónde pertenece un filtro en un SAQL ¿query para el mejor rendimiento?"
    options:
      - "Al final, después de agruparse"
      - "Tan pronto como sea posible, menos datos fluyen a través de las siguientes declaraciones"
      - "No importa."
      - "Dentro de la predicación"
    answer: 1
    topic: "saql"
  - id: "saql-functions-1"
    q: "Para contar las ofertas en un conjunto de datos en el grano line-item que utiliza:"
    options:
      - "Conteo()"
      - "único('Opportunity Id')"
      - "sum('Amount')"
      - "avg()"
    answer: 1
    topic: "saql"
  - id: "saql-functions-2"
    q: "suma() sobre una columna que es 40% null regresa:"
    options:
      - "Null"
      - "La suma de las filas no nulas, sin indicación de que el resto fueron saltadas"
      - "Cero"
      - "Un error"
    answer: 1
    topic: "saql"
  - id: "saql-functions-3"
    q: "¿Cuál es la manera segura de dividir dos agregados?"
    options:
      - "avg of the per-row ratio"
      - "sum(numerator) / sum(denominator), guarded against a cero denominator"
      - "O es equivalente"
      - "La División no recibe apoyo"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-1"
    q: "¿Dónde debe ir un filtro para el mejor rendimiento?"
    options:
      - "Después del grupo, así que menos se filtra"
      - "Tan pronto como sea posible, por lo que menos filas fluyen a través de todo después de ella"
      - "Al final"
      - "La orden no importa."
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-2"
    q: "`filter q by 'Stage' != \"Closed Lost\"` también elimina:"
    options:
      - "Nada más"
      - "Cada fila donde Stage está null"
      - "Cerradas hileras Won"
      - "Filas de otros conjuntos de datos"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-3"
    q: "Reemplazar un nulo con cero usando coalesce es:"
    options:
      - "Siempre seguro"
      - "Un reclamo — se convierte en 'no conocido' en 'ninguno', que cambia las medias y puede ser equivocado"
      - "Se requiere antes de la agregación"
      - "Sólo una opción de visualización"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-1"
    q: "Para calcular la participación de cada segmento de los ingresos de la empresa que necesita:"
    options:
      - "Un grupo por segmento"
      - "El valor de cada grupo comparado con un agregado de TODAS filas - dos niveles de agregación"
      - "Un panel separado"
      - "Un eje dual"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-2"
    q: "Un total de funcionamiento con ventana difiere de una suma simple porque:"
    options:
      - "Es más rápido."
      - "Se acumula a través de las filas ordenadas en lugar de colapsar a un valor"
      - "Ignora las nulas"
      - "Requiere dos conjuntos de datos"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-3"
    q: "Repeticiones de clasificación dentro de cada región requiere que la ventana sea:"
    options:
      - "Sobre todas las filas"
      - "Partitioned by region, so each region ranks from 1 independently"
      - "Ordenar sólo"
      - "Grouped by rep"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-1"
    q: "Necesitas una métrica que combina dos conjuntos de datos en diez paneles. ¿Dónde pertenece la combinación?"
    options:
      - "En cada widget SAQL"
      - "En una receta, así que los diez están de acuerdo por la construcción y se computa una vez"
      - "En una hoja de cálculo"
      - "En el tablero JSON"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-2"
    q: "Combinando dos corrientes en diferentes granos en una consulta produce:"
    options:
      - "Un error"
      - "El mismo fan-out que conseguiría en una receta — una medida repetida en filas iguales"
      - "Un resultado correcto automáticamente"
      - "Nulls only"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-3"
    q: "Un buen uso de una consulta de dos aguas es:"
    options:
      - "Definir los ingresos de la empresa"
      - "Una comparación ad-hoc —actúa contra una pequeña tabla de objetivos — en un único panel"
      - "Cualquier unión en absoluto"
      - "Reemplazar la capa de receta"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-1"
    q: "Una consulta devuelve un número demasiado alto por un múltiple limpio. El sospechoso es:"
    options:
      - "Un filtro"
      - "Una combinación que multiplicó filas, con una medida resumida después de ella"
      - "Declaración de la orden"
      - "Un nulo."
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-2"
    q: "La manera más rápida de entender una consulta que devuelve la cosa equivocada es:"
    options:
      - "Reescribirlo desde cero"
      - "Cortar de nuevo a la carga y añadir una declaración a la vez, comprobando el recuento después de cada uno"
      - "Añadir más filtros"
      - "Cambiar a otro tipo de gráfico"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-3"
    q: "Los números que cambian entre carreras sin cambios de datos generalmente significan:"
    options:
      - "Un error de caché"
      - "Una fecha relativa o una ventana sin orden explícito"
      - "Una emisión de permisos"
      - "Un problema de renderización"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-1"
    q: "SAQL Declaraciones ejecutadas:"
    options:
      - "En un orden elegido por un optimista"
      - "En el orden escrito — cada uno transforma el resultado anterior"
      - "En paralelo"
      - "Alfabéticamente"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-2"
    q: "Un filtro pertenece a:"
    options:
      - "Después del grupo"
      - "Lo antes posible"
      - "En primer lugar"
      - "Al final"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-3"
    q: "En el grano lineal, las ofertas se cuentan con:"
    options:
      - "Conteo()"
      - "único('Opportunity Id')"
      - "sum('Amount')"
      - "median()"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-4"
    q: "suma() sobre una columna que es 40% null regresa:"
    options:
      - "Null"
      - "El total de las filas no nulas, sin indicación del resto fueron saltadas"
      - "Cero"
      - "Un error"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-5"
    q: "La tasa de descuento ponderada es:"
    options:
      - "avg('DiscountPct')"
      - "sum('Discount') / sum('ListTotal'), custodiado contra cero"
      - "median('DiscountPct')"
      - "max('DiscountPct')"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-6"
    q: "`'Stage' != \"Closed Lost\"` también elimina:"
    options:
      - "Nada más"
      - "Filas donde Stage está nulo"
      - "Cerradas hileras Won"
      - "Filas de otros conjuntos de datos"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-7"
    q: "Repeticiones de clasificación dentro de cada región necesita la ventana:"
    options:
      - "Sobre todas las filas"
      - "Partitioned by region"
      - "Pedidos solamente"
      - "Grouped by rep"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-8"
    q: "Un total de funcionamiento sin orden explícito es:"
    options:
      - "Fine - el orden se infiere"
      - "Un bug que está estable hasta el siguiente refresco y luego silenciosamente diferente"
      - "Imposible escribir"
      - "ordenados automáticamente por fecha"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-9"
    q: "Dos conjuntos de datos necesitan combinar para diez paneles. Eso pertenece:"
    options:
      - "En cada widget SAQL"
      - "En una receta"
      - "En el tablero JSON"
      - "En una hoja de cálculo"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-10"
    q: "Un total que es alto por un múltiple limpio sugiere:"
    options:
      - "Un problema nulo"
      - "Multiplicación de fila, con una medida de padre resumida después de ella"
      - "Un filtro"
      - "Una cuestión de representación"
    answer: 1
    topic: "saql"
  - id: "interactions-index-1"
    q: "Dos widgets construidos en el mismo conjunto de datos. Por defecto, haga clic en uno:"
    options:
      - "No hace nada al otro"
      - "Filtra el otro — los widgets del mismo data se enfrentan automáticamente"
      - "Requiere una unión"
      - "Abre una nueva lente"
    answer: 1
    topic: "interactions"
  - id: "interactions-index-2"
    q: "El principal motivo de la interacción es:"
    options:
      - "Se ve impresionante"
      - "La mayoría de la gente nunca construirá una lente, pero casi todo el mundo hace clic en un bar — la interacción es cómo un panel responde preguntas que no anticipaste"
      - "Mejora el rendimiento"
      - "Es necesario para compartir"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-1"
    q: "Dos widgets se construyen en el mismo conjunto de datos. Por defecto, haga clic en uno:"
    options:
      - "No hace nada al otro"
      - "Filtra el otro - se enfrentan automáticamente"
      - "Abre una nueva lente"
      - "Requiere una unión para interactuar"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-2"
    q: "¿Por qué ibas a enfrentarte a OFF por un widget?"
    options:
      - "Para mejorar el rendimiento"
      - "Porque es una referencia — un total de la compañía que debe permanecer fijo mientras todo lo demás filtra, por lo que el lector puede ver la parte contra todo el"
      - "El rostro siempre está mal."
      - "Para ocultar datos"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-3"
    q: "Un visor filtra a una región y un widget va en blanco. La causa más parecida es:"
    options:
      - "Una consulta rota"
      - "El conjunto de datos de ese widget no tiene filas para esa región — un estado vacío honesto que necesita una etiqueta en lugar de una solución"
      - "El rostro es deshabilitado"
      - "Un problema de seguridad"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-1"
    q: "Un dashboard se abre mostrando todas las regiones y todo el tiempo. Para un director regional esto significa:"
    options:
      - "Flexibilidad máxima"
      - "Los mismos tres clics cada mañana antes de la pantalla dice algo relevante"
      - "Carga más rápida"
      - "Mejor seguridad"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-2"
    q: "Después de que un espectador haga clic en un segmento, la pantalla se filtra. Lo más importante para proporcionar es:"
    options:
      - "Una animación"
      - "Una indicación visible de la selección actual, y una manera obvia de aclararla"
      - "A tooltip"
      - "Un segundo gráfico"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-3"
    q: "Una vista salva es:"
    options:
      - "Una copia del dashboard"
      - "Un estado recordado — filtros y selecciones— para que alguien regrese a su rebanada sin volver a hacer clic"
      - "Un email programado"
      - "Una configuración de permiso"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-1"
    q: "Un enlace de un panel de resumen a un detalle te permite:"
    options:
      - "Evite construir el resumen"
      - "Mantenga el resumen pequeño, porque el detalle está a un clic en lugar de enganchar en"
      - "Saltear la seguridad"
      - "Mejorar el rendimiento de las consultas"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-2"
    q: "El destino más útil para un simulacro de una tabla de excepción es generalmente:"
    options:
      - "Un estado hogareño diferente del tablero"
      - "El Salesforce registro para esa fila, donde el trabajo realmente sucede"
      - "A PDF export"
      - "El conjunto de datos"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-3"
    q: "Un taladro que aterriza en un panel de detalle sin filtrar es:"
    options:
      - "Bien."
      - "Un simulacro roto — todo el punto es que el destino hereda el contexto que hizo clic desde"
      - "Más flexible"
      - "Más rápido."
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-1"
    q: "Dos widgets en el mismo conjunto de datos. Haciendo clic en uno:"
    options:
      - "No hay nada"
      - "Filtra el otro por defecto"
      - "Necesita una unión"
      - "Abre una lente"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-2"
    q: "Usted apaga la cara en un widget principalmente cuando:"
    options:
      - "Es lento."
      - "Es una referencia que debe permanecer fija mientras todo lo demás filtra"
      - "Es una mesa"
      - "No tiene título"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-3"
    q: "La mitad de los widgets responden a un filtro y la mitad no. Esto es:"
    options:
      - "Normal"
      - "El estado peligroso — la pantalla es falsa mientras cada widget es individualmente correcto"
      - "Un problema de caché"
      - "Un límite de licencias"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-4"
    q: "Un dashboard debe abrir:"
    options:
      - "Sin manchas, mostrando todo"
      - "En el caso común - período actual, el alcance del espectador, clasificado y limitado"
      - "En un estado en blanco"
      - "El año pasado"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-5"
    q: "Mostrando el mes parcial actual al lado de meses completos:"
    options:
      - "Es la vista más actual"
      - "Fabrica una disminución aparente cada mes a menos que sea excluida o marcada"
      - "Mejora la precisión"
      - "No tiene efecto"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-6"
    q: "Un panel filtrado debe indicar su selección porque:"
    options:
      - "Parece tidierno."
      - "Será fotografiado, y el filtro es invisible en la imagen"
      - "Es necesario para enfrentarse"
      - "Acelera las consultas"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-7"
    q: "Una vista salvada es muy valiosa para:"
    options:
      - "Administradores"
      - "Cualquiera cuya rebanada es siempre la misma, que de otro modo volvería a hacer clic diariamente"
      - "Solo usuarios móviles"
      - "Exportación"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-8"
    q: "Un taladro que aterriza en un destino sin filtrar:"
    options:
      - "Da más flexibilidad"
      - "Se rompe en la práctica — se hace clic una vez y luego se abandona"
      - "Carga más rápido"
      - "Es el patrón estándar"
    answer: 1
    topic: "interactions"
  - id: "bindings-index-1"
    q: "La diferencia entre la cara y la unión es:"
    options:
      - "No hay ninguno."
      - "Faceting es automático entre los widgets del mismo data; un enlace es explícito que configura"
      - "Los enlaces son más rápidos"
      - "La cara requiere SAQL"
    answer: 1
    topic: "bindings"
  - id: "bindings-index-2"
    q: "El mejor primer enlace para añadir a cualquier dashboard es:"
    options:
      - "Visión del widget condicional"
      - "Un título dinámico que establece la selección actual"
      - "Una cadena de filtro anidada"
      - "Una faceta cruzada"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-1"
    q: "¿Qué es una unión?"
    options:
      - "Una unión entre conjuntos de datos"
      - "El estado de un widget alimentando la consulta o exhibición de otro widget"
      - "Un entorno de seguridad"
      - "Tipo de gráfico"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-2"
    q: "El mejor primer uso de una unión es generalmente:"
    options:
      - "Visión del widget condicional"
      - "Un título dinámico que establece la selección actual"
      - "Filtros dependientes anidados"
      - "Cross-dataset faceting"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-3"
    q: "El principal costo a largo plazo de un dashboard es:"
    options:
      - "Query performance"
      - "Nadie puede cambiarlo de forma segura: la lógica vive en la configuración de widget que es difícil de leer e imposible diff"
      - "Consumo de licencias"
      - "Memoria del navegador"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-1"
    q: "El caso de borde más importante de una selección es:"
    options:
      - "Múltiples selecciones"
      - "Nada seleccionado — lo que el widget atado hace cuando la fuente está vacía"
      - "Consultas lentas"
      - "Color de contraste"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-2"
    q: "Un filtro dependiente (región estrecha la lista de repeticiones) vale la pena construir cuando:"
    options:
      - "Siempre"
      - "La lista dependiente es lo suficientemente larga que escanear es un costo real — cuarenta representantes, no cuatro"
      - "Nunca"
      - "Sólo para los administradores"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-3"
    q: "Un título dinámico es valioso principalmente porque:"
    options:
      - "Parece dinámico."
      - "El estado filtrante del dashboard sobrevive siendo filmado en un mensaje sin contexto"
      - "Mejora el rendimiento"
      - "Es necesario para enfrentarse"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-1"
    q: "Un resultado vinculante dice:"
    options:
      - "Lo que el espectador ha seleccionado"
      - "Un valor devuelto por la consulta de otro widget"
      - "Los metadatos del conjunto de datos"
      - "El URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-2"
    q: "El costo de rendimiento de una unión de resultados es que:"
    options:
      - "Duplica el volumen de datos"
      - "Crea una orden de ejecución - el widget dependiente no puede comenzar hasta que la fuente haya regresado"
      - "Deshabilita la caché"
      - "No hay ninguno."
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-3"
    q: "Debugging a results binding es más difícil que una selección vinculante porque:"
    options:
      - "La sintaxis es diferente"
      - "La entrada es invisible en la pantalla - tienes que rastrear una consulta en lugar de mirar una selección"
      - "No se puede probar"
      - "Requiere derechos de administración"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-1"
    q: "El principal riesgo de encadenamiento de unión A → B → C es:"
    options:
      - "Precisión de los datos"
      - "Ejecución secuencial y dependencia nadie puede ver, así que un cambio a A rupturas C por razones que son invisibles"
      - "Costo de licencia"
      - "Compatibilidad con el navegador"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-2"
    q: "La señal práctica de que un dashboard tiene demasiados enlaces es:"
    options:
      - "El tamaño del archivo"
      - "Alguien que no sea su autor no puede cambiarlo con seguridad, así que construyen un nuevo dashboard en su lugar"
      - "El número de widgets"
      - "Rendimiento lento solo"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-3"
    q: "Lo más barato que mantiene un panel de control fijo es:"
    options:
      - "Menos widgets"
      - "Una línea en la descripción por unión - qué alimenta qué y por qué"
      - "Más colores"
      - "Una convención de nombres para consultas"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-1"
    q: "Una unión difiere de la cara porque:"
    options:
      - "Es más rápido."
      - "Es el cableado explícito que configura, donde la cara es automática entre widgets de la misma dosis"
      - "Requiere SAQL"
      - "Funciona a través de orgs"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-2"
    q: "La mejor primera unión en cualquier tablero es:"
    options:
      - "Visión condicional"
      - "Un título dinámico que lleva la selección"
      - "Una cadena de filtro anidada"
      - "Una medida de lucha"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-3"
    q: "Un resultado vinculante dice:"
    options:
      - "La selección del espectador"
      - "Un valor de otra consulta devuelto"
      - "Metadatos de conjunto de datos"
      - "La página URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-4"
    q: "Los acoplamientos de resultados hacen que los paneles sean lentos porque:"
    options:
      - "Aumento del volumen de datos"
      - "Ejecución de serie — el widget dependiente espera a la fuente"
      - "Caché deshabilitado"
      - "Forzar un refresco completo"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-5"
    q: "El caso de borde que debe definirse siempre es:"
    options:
      - "Demasiadas filas"
      - "Nada seleccionado"
      - "Una red lenta"
      - "Una pantalla pequeña"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-6"
    q: "Un filtro dependiente donde el representante previamente elegido ya no está en alcance debería:"
    options:
      - "Sigue filtrando a ese representante."
      - "Limpiar la selección de los puestos"
      - "Mostrar un error"
      - "Recargar la página"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-7"
    q: "Cinco widgets atados a un filtro, frente a tres atados en una cadena. ¿Qué es más sostenible?"
    options:
      - "La cadena — menos vinculantes"
      - "Las cinco — la anchura es predecible, la profundidad no"
      - "Son equivalentes"
      - "Tampoco es mantenible"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-8"
    q: "Una empresa métrica computada por un resultado vinculante para cada carga debe en su lugar:"
    options:
      - "Encaje en el navegador"
      - "Se computa una vez en la receta y se almacena como un campo"
      - "Se escribe como una constante"
      - "Retirada"
    answer: 1
    topic: "bindings"
  - id: "dashboard-json-index-1"
    q: "La mejor razón para editar dashboard JSON directamente es:"
    options:
      - "Es más rápido que el constructor para el trabajo cotidiano"
      - "Bulk y cambios repetitivos el constructor te hace hacer un widget a la vez"
      - "Desbloquea tipos de gráficos ocultos"
      - "Evita la seguridad"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-index-2"
    q: "Un dashboard JSON es útil en examen porque:"
    options:
      - "Representa en el navegador"
      - "Se trata de texto —difis, por lo que un cambio es revisible en lugar de describir en una reunión"
      - "Es más pequeño que el tablero"
      - "Contiene los datos"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-1"
    q: "En un documento de panel, un 'paso' es:"
    options:
      - "Una página mago"
      - "Una definición de consulta — los datos que un widget obtiene de"
      - "Un punto de ruptura de diseño"
      - "Un permiso"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-2"
    q: "Varios widgets muestran la misma medida rebanada de forma diferente. Idealmente:"
    options:
      - "Cada uno define su propio paso"
      - "Compartir un paso, porque el número de consultas distintas es la palanca principal en el tiempo de carga"
      - "Use conjuntos de datos separados"
      - "Están fusionados en un widget"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-3"
    q: "Widgets y diseños son separados porque:"
    options:
      - "Accidente histórico"
      - "Un widget es lo que se dibuja; un diseño es donde se sienta, por lo que un widget se puede colocar de forma diferente en diferentes tamaños de pantalla"
      - "Los diseños almacenan los datos"
      - "Widgets no se pueden posicionar"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-1"
    q: "Un paso con manuscrito SAQL en lugar de una definición clicada es:"
    options:
      - "Inválidos"
      - "Muy bien, y más difícil para el constructor para ida y vuelta – la interfaz puede no ser capaz de reeditar visualmente"
      - "Más rápido."
      - "Compartida automática"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-2"
    q: "Se utiliza un paso estático para:"
    options:
      - "Resultados de la consulta caché"
      - "Una lista fija de valores — opciones de rebote, umbrales— que no se pregunta desde un conjunto de datos"
      - "Normas de seguridad"
      - "Definiciones de diseño"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-3"
    q: "La palanca principal en el tiempo de carga de panel, visible en JSON, es:"
    options:
      - "El número de widgets"
      - "El número de pasos distintos - widgets que podrían compartir una consulta pero cada uno define su propio"
      - "El tamaño del archivo"
      - "El número de diseños"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-1"
    q: "Un widget se ve bien en el escritorio y mal en un teléfono. El problema es en:"
    options:
      - "El paso"
      - "Un diseño — posición y tamaño se definen por punto de ruptura, por separado del widget"
      - "El conjunto de datos"
      - "La situación de seguridad"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-2"
    q: "Editar propiedades widget como texto es muy útil para:"
    options:
      - "Construyendo un nuevo dashboard"
      - "Aplicando el mismo cambio de formato en muchos widgets a la vez"
      - "Cambiar el conjunto de datos"
      - "Añadiendo seguridad"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-1"
    q: "Antes de hacer un dashboard debe:"
    options:
      - "Limpia el caché"
      - "Exportar una copia — la historia de deshacer es lo que haya guardado antes"
      - "Notificar a todos los espectadores"
      - "Desactivar el horario"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-2"
    q: "El principal beneficio de la gobernanza de mantener dashboard JSON en un repositorio es:"
    options:
      - "Carga más rápida"
      - "Un cambio se convierte en un problema revisor en lugar de una oración en una reunión"
      - "Mejor seguridad"
      - "Tamaño del archivo más pequeño"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-3"
    q: "Después de una edición manual, la prueba de ida y vuelta es:"
    options:
      - "Revisar los datos es correcto"
      - "Recargar en el constructor para confirmar que todavía se abre y todavía edita visualmente"
      - "Correr la receta"
      - "Selección de limpieza"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-1"
    q: "Un paso en un documento de panel es:"
    options:
      - "Una página mago"
      - "Una definición de consulta"
      - "Un punto de ruptura de diseño"
      - "Una regla compartida"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-2"
    q: "Widgets referencia sus datos por:"
    options:
      - "Contienen SAQL inline"
      - "Nombrando un paso"
      - "Puntos en un conjunto de datos id"
      - "Herencia desde el diseño"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-3"
    q: "Un dashboard se ve mal sólo en los teléfonos. Mira en:"
    options:
      - "El paso"
      - "Los diseños"
      - "El conjunto de datos"
      - "El predicado"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-4"
    q: "Once pasos para doce widgets sugieren:"
    options:
      - "Buena separación"
      - "Casi nada es compartido, y la pantalla está haciendo once viajes redondos"
      - "Un archivo corrupto"
      - "Demasiados widgets"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-5"
    q: "La manera más rápida de encontrar cada unión en un tablero heredado es:"
    options:
      - "Abra el panel de cada widget"
      - "Buscar en JSON para la sintaxis vinculante"
      - "Preguntar al autor"
      - "Compruebe el conjunto de datos"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-6"
    q: "Antes de hacer manualidades, siempre debes:"
    options:
      - "Selecciones claras"
      - "Exportar una copia"
      - "Pausa el horario"
      - "Notificar a los espectadores"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-7"
    q: "La prueba de ida y vuelta comprueba que:"
    options:
      - "Los datos son exactos"
      - "El constructor todavía puede abrir y editar visualmente el panel después de su edición"
      - "El archivo es pequeño"
      - "La seguridad sigue siendo aplicable"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-8"
    q: "¿Qué cambio es mejor dejar al constructor en lugar de hacer como texto?"
    options:
      - "Renombrar un campo a través de widgets"
      - "Agregar o quitar un widget, porque debe ser consistente en cada diseño"
      - "Cambiar un formato número"
      - "Edición de un título"
    answer: 1
    topic: "dashboard-json"
---

Preguntas de práctica para el dominio de Implementación de Dashboard Analytics CRM Analytics y Einstein Discovery Examen de consultoría.
