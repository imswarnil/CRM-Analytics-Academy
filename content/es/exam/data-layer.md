---
title: "Capa de datos — preguntas de práctica"
domain: "data-layer"
quiz:
  - id: "foundations-index-1"
    q: "¿Cuál es el argumento más fuerte para CRM Analytics sobre una herramienta de IB de uso general?"
    options:
      - "Sus gráficos se ven mejor"
      - "hereda. Salesforce's modelo de compartir y seguridad, así que quien-mira-lo que ya está resuelto"
      - "Es más barato."
      - "Es la única herramienta que puede leer Salesforce datos"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-2"
    q: "Un conjunto de datos CRM Analytics se describe mejor como:"
    options:
      - "Una vista en vivo Salesforce objetos"
      - "Una instantánea materializada y columnar reconstruida en un horario"
      - "Un informe guardado"
      - "A SQL mesa que puedes escribir"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-3"
    q: "Su VP quiere una pantalla que muestra la profundidad de cola de centro de llamadas actualizando cada pocos segundos. I CRM Analytics la herramienta correcta?"
    options:
      - "Sí, con un horario de receta lo suficientemente rápido"
      - "No — se refresca en un horario, no en un flujo; esta es una necesidad operacional, no una analítica"
      - "Sí, si usas Einstein Discovery"
      - "Sólo con licencia Plus"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-1"
    q: "¿Qué capa posee la definición de 'conductor calificado'?"
    options:
      - "La capa de diseño, porque ahí es donde se muestra el número"
      - "La capa de datos, porque una métrica definida per-dashboard es una métrica dos tableros de mando no estarán de acuerdo"
      - "La capa de inteligencia"
      - "Cualquier equipo pregunta primero"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-2"
    q: "Un tablero es lento. ¿Qué capa debería sospechar primero?"
    options:
      - "La capa de diseño — demasiados widgets"
      - "La capa de datos — un conjunto de datos en el grano equivocado que obliga a cada widget a agregar millones de filas"
      - "La capa de inteligencia"
      - "La red"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-3"
    q: "Einstein Discovery produce un modelo que es 78% exacto. ¿Qué le debe la capa de inteligencia a la capa de diseño?"
    options:
      - "La predicción sólo"
      - "La predicción, la confianza y los principales factores - una puntuación sin razón adjunta no se puede actuar en"
      - "Datos de capacitación"
      - "Nada; la precisión es suficiente"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-1"
    q: "¿Qué significa \"el grano\" de un conjunto de datos?"
    options:
      - "Cuántos datos contiene"
      - "Lo que representa exactamente una fila"
      - "Con qué frecuencia se refresca"
      - "Que campos son medidas"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-2"
    q: "Te unes a oportunidades (608 hileras) a opportunity products (1,192 hileras) y suma Cantidad. ¿Qué pasa?"
    options:
      - "Nada — la suma es correcta"
      - "La cantidad se cuenta una vez por línea de producto, por lo que el ingreso total se infla — aquí casi se triplica"
      - "La unión falla"
      - "Sólo las filas coincidentes son resumidas, así que las caídas de ingresos"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-3"
    q: "¿Por qué un conjunto de datos tiene historia Salesforce el objeto no?"
    options:
      - "Salesforce borra registros antiguos"
      - "Cada carrera puede anexar una instantánea de estado en ese momento, mientras que el objeto sólo tiene sus valores actuales"
      - "Datasets are backed up"
      - "No lo hace"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-1"
    q: "¿Para qué es la sincronización de datos (replicación)?"
    options:
      - "Escribir datos de nuevo a Salesforce"
      - "Mantener una copia local de objetos seleccionados y campos actuales, así que las recetas leen de ella en lugar de golpear la fuente cada carrera"
      - "Cuadros de programación"
      - "Encrypting datasets"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-2"
    q: "Una receta falla. ¿Dónde estás?"
    options:
      - "El inspector del panel"
      - "Data Manager → Monitor"
      - "Configuración → Análisis → Configuración"
      - "Los atributos de campo del conjunto de datos"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-3"
    q: "¿Por qué el usuario de integración importa tanto?"
    options:
      - "Es dueño de los tableros."
      - "Sincronía funciona como ese usuario, por lo que cualquier objeto o campo no puede ver simplemente nunca llega — sin error en el panel de control"
      - "Paga por la licencia"
      - "Programa las recetas"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-1"
    q: "Una \"app\" en CRM Analytics es:"
    options:
      - "Una aplicación instalada"
      - "Un contenedor para conjuntos de datos, lentes y paneles, que lleva la configuración de compartir"
      - "Una experiencia móvil"
      - "Un paquete gestionado"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-2"
    q: "¿Cuál es la diferencia práctica entre una lente y un panel de control?"
    options:
      - "Lenses no se puede salvar"
      - "Un objetivo explora un conjunto de datos y es un espacio de trabajo desechable; un panel reúne muchas consultas, las enfrenta juntas, y se construye para otras personas"
      - "Los paneles no pueden usar SAQL"
      - "Ninguno"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-3"
    q: "In Einstein Discovery, una historia es:"
    options:
      - "Un modelo desplegado"
      - "El análisis de lo que correlaciona con un resultado, que puede ser desplegado como modelo"
      - "Una plantilla de panel"
      - "Un widget de texto narrativo"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-1"
    q: "Un interesado pide un dashboard que actualiza 'en tiempo real'. ¿Cuál es el primer movimiento correcto?"
    options:
      - "Programa la receta por hora y llámalo en tiempo real"
      - "Pregunte qué decisión se toma de ella y qué tan firme puede ser antes de que sea inútil — la respuesta se mide generalmente en horas"
      - "Rechazar la solicitud"
      - "Uso Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-2"
    q: "La mayor parte de los datos de la empresa está en un almacén; Salesforce sólo tiene cuentas y oportunidades. ¿Qué sugiere eso?"
    options:
      - "Uso CRM Analytics y sincronizar el almacén en"
      - "Usted está construyendo un proyecto de almacén con un CRM adjunto - una herramienta BI en el almacén probablemente servirá mejor"
      - "Uso Salesforce informes"
      - "Uso Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-1"
    q: "¿Por qué este dashboard abre con un solo número total de ARR?"
    options:
      - "Para llenar el espacio en la parte superior"
      - "Así que un espectador que no lee nada más todavía deja con el titular de la pantalla es sobre"
      - "Porque los widgets del número cargan más rápido"
      - "Es requerido por Salesforce"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-2"
    q: "Hacer clic en una barra de segmento filtra los otros dos widgets. ¿Por qué?"
    options:
      - "Se configura un enlace"
      - "Widgets construidos en el mismo dataset facet uno al otro por defecto"
      - "La tabla es un niño del cuadro"
      - "La cara siempre debe ser activada manualmente"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-3"
    q: "La tabla de top-cuentas muestra 10 filas en lugar de las 140. La mejor razón es:"
    options:
      - "Ejecución"
      - "La pregunta es sobre la concentración, y una tabla que nadie puede tomar de un vistazo es una exportación de datos en lugar de un panel de control"
      - "Las tablas se limitan a 10 filas"
      - "Para ocultar las cuentas más pequeñas"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-1"
    q: "Un conjunto de datos CRM Analytics es:"
    options:
      - "Una vista en vivo Salesforce objetos"
      - "Una instantánea materializada y columnar reconstruida en un horario"
      - "A salvo Salesforce informe"
      - "Un escrito SQL cuadro"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-2"
    q: "El argumento más fuerte para CRM Analytics sobre una herramienta de IB para fines generales es:"
    options:
      - "Mejores tipos de gráficos"
      - "hereda el modelo de compartimiento y seguridad de la org en lugar de hacerlo reconstruirlo"
      - "Costo de licencia inferior"
      - "Es la única manera de leer Salesforce datos"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-3"
    q: "Los ingresos totales en su panel de control son exactamente el doble de los informes financieros. Causa más probable:"
    options:
      - "La situación de seguridad"
      - "Una unión que se fusionó – una medida padre repetida en las filas de los niños"
      - "El conjunto de datos no ha actualizado"
      - "Formato de la moneda"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-4"
    q: "Los usuarios reportan registros que no saben que existen. ¿Dónde estás primero?"
    options:
      - "Las consultas del widget del panel"
      - "El acceso del usuario de integración, luego el predicado de seguridad"
      - "Tipo de gráfico"
      - "El tema del color de la aplicación"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-5"
    q: "¿Qué capa posee la definición de una métrica como \"oleoducto calificado\"?"
    options:
      - "Diseño — se muestra allí"
      - "Datos - una métrica definida por dashboard es uno de los dos tableros de control no estará de acuerdo"
      - "Inteligencia"
      - "Cualquier equipo pregunta primero"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-6"
    q: "¿Para qué es la sincronización de datos?"
    options:
      - "Escribir análisis resultados de vuelta a Salesforce"
      - "Mantener una copia local de objetos seleccionados y campos de corriente para que las recetas no golpeen la fuente cada carrera"
      - "Programación de correos electrónicos"
      - "Configuración de datos en reposo"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-7"
    q: "Una \"app\" en CRM Analytics es:"
    options:
      - "Un paquete instalado"
      - "Un contenedor para conjuntos de datos, lentes y tableros de control que lleva la configuración de distribución"
      - "Un cliente móvil"
      - "Una plantilla de panel"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-8"
    q: "Una receta funciona con éxito cada noche, pero los datos siempre tienen un día. La causa más probable es:"
    options:
      - "El conjunto de datos es corrupto"
      - "La receta está programada antes de la sincronización de datos que depende de los acabados"
      - "El rostro es deshabilitado"
      - "El usuario de integración carece de acceso"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-9"
    q: "Su interesado necesita una pantalla actualizando cada pocos segundos para una cola de llamada en vivo. Deberías:"
    options:
      - "Programar la receta tan a menudo como sea posible"
      - "Digamos que esto es un requisito operativo, no un análisis, y apuntar a un Salesforce página o herramienta diseñada con propósito"
      - "Uso Einstein Discovery"
      - "Construirlo y añadir un botón de actualización"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-10"
    q: "Einstein Discovery implementa un modelo que marca oportunidades. ¿Qué debe enviar con la puntuación?"
    options:
      - "El conjunto de datos de capacitación"
      - "Los principales factores detrás de ella - una probabilidad desnuda da a un representante nada para actuar en"
      - "El SAQL query"
      - "Nada más"
    answer: 1
    topic: "foundations"
  - id: "data-preparation-index-1"
    q: "Cuál de estos NO es una forma de que los datos se conviertan en CRM Analytics Dataset?"
    options:
      - "A CSV subida"
      - "Sincronización de datos Salesforce objetos, transformados por una receta"
      - "Una consulta en vivo emitida por un widget de dashboard"
      - "Una conexión externa a un almacén, sincronizado y transformado"
    answer: 2
    topic: "data-preparation"
  - id: "data-preparation-index-2"
    q: "Antes de construir cualquier receta usted debe ser capaz de indicar:"
    options:
      - "Los tipos de gráficos que utilizará"
      - "Lo que representa exactamente una fila del conjunto de datos de salida"
      - "El tema del color del panel"
      - "¿Cuántos usuarios lo verán?"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-1"
    q: "¿Por qué las recetas se leen de los datos sincronizados en lugar de de la fuente cada carrera?"
    options:
      - "Las recetas no pueden leer Salesforce directamente"
      - "Una copia local es más rápida y no martilla el sistema de registro en cada carrera"
      - "Los datos sincronizados son más precisos"
      - "Es un requisito de licencia"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-2"
    q: "Una receta tiene éxito nocturno pero siempre muestra los datos de ayer. La causa más parecida es:"
    options:
      - "Un conjunto de datos corruptos"
      - "La receta está programada antes de la sincronización que depende de los acabados"
      - "Las cachés del tablero"
      - "El usuario de integración carece de acceso"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-3"
    q: "Necesitarás historia mes a mes de un campo a partir del próximo trimestre. ¿Cuándo deberías empezar a sincronizarlo?"
    options:
      - "El próximo trimestre, cuando sea necesario"
      - "Ahora — una instantánea sólo puede recordar lo que fue sincronizado en ese momento, y la historia no puede ser llenada de un objeto que sostiene el estado actual"
      - "No importa."
      - "Sólo después de la receta existe"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-1"
    q: "Un campo CloseDate cargado como texto. ¿Qué descansos?"
    options:
      - "Nada; las fechas de texto funcionan normalmente"
      - "Filtros de fecha, agrupaciones de mes y líneas de tendencia - y la fijación requiere una recarga"
      - "Sólo la página de registro"
      - "El conjunto de datos no guardará"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-2"
    q: "¿Por qué forzar IDs de aspecto numérico a dimensiones?"
    options:
      - "Para ahorrar espacio"
      - "Porque se escribe como medidas que el producto ofrecerá para resumirlos, y eventualmente alguien acepta"
      - "Es necesario"
      - "Para hacerlos filtrables"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-3"
    q: "Su conjunto de datos cargado muestra 607 filas en lugar de 608. Lo más probable:"
    options:
      - "Una cuestión de permiso"
      - "Un problema de cabeza en la cabeza CSV parse"
      - "Un problema de seguridad"
      - "Redondeo normal"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-1"
    q: "¿De dónde vienen los límites del balde?"
    options:
      - "Incluso terceras partes del rango"
      - "El negocio - el punto en que alguien hace algo diferente"
      - "Los cuartiles del conjunto de datos, siempre"
      - "La escala de color de la gráfica"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-2"
    q: "El bloqueo en cada dashboard en lugar de en la receta conduce a:"
    options:
      - "Mejor flexibilidad"
      - "'Large' significa cosas diferentes en diferentes pantallas, con ambas defensibles"
      - "Consultas más rápidas"
      - "Conjuntos de datos más pequeños"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-3"
    q: "Un valor exactamente en un límite —utilización de exactamente 55%— debe ser:"
    options:
      - "Izquierda al azar"
      - "Assigned by an explicit, written rule, because someone will eventually query it"
      - "Excluido"
      - "Redondeado"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-1"
    q: "¿Qué tipo de nodo cambia el grano de los datos que fluyen a través de él?"
    options:
      - "Filtro"
      - "Únase y agregado"
      - "Formula"
      - "Producto"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-2"
    q: "Necesitas un recuento de oportunidades por cuenta adjunta a cada renglón de cuenta. ¿Qué nodo?"
    options:
      - "Formula"
      - "Aggregate on opportunities grouped by account, then join back to accounts"
      - "Filtro"
      - "Transformación"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-3"
    q: "¿Por qué dividir una receta grande en varias más pequeñas?"
    options:
      - "Las recetas tienen un límite de nodo difícil"
      - "Una receta de cincuenta nodos es ilegible por cualquiera que no la escribió, y el fracaso deja de localizar"
      - "Las recetas más pequeñas funcionan más rápido"
      - "Es necesario para la programación"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-1"
    q: "¿Por qué el promedio de las tasas de descuento per-deal generalmente es incorrecto?"
    options:
      - "Ronda"
      - "Cuesta un acuerdo de $5,000 igual que un $2M uno - la cifra correcta divide el descuento total por valor total de la lista"
      - "Los descuentos no pueden promediarse"
      - "El campo es texto"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-2"
    q: "Se debe calcular una relación necesaria en diez tableros de mando:"
    options:
      - "En cada widget, así cada equipo puede ajustarlo"
      - "Una vez en la receta, todos los diez están de acuerdo en la construcción"
      - "En una hoja de cálculo"
      - "Por Einstein Discovery"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-3"
    q: "¿Qué cálculo pertenece genuinamente en el tablero en lugar de la receta?"
    options:
      - "Una definición métrica de toda la empresa"
      - "Una que depende de la selección actual de filtros del espectador"
      - "Conversión de divisas"
      - "Un segmento en cubo"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-1"
    q: "Llenar una Cantidad en blanco con cero es:"
    options:
      - "Siempre correcto"
      - "Una reclamación - afirma que el acuerdo no vale nada, lo que cambia cada promedio construido sobre él"
      - "Se requiere antes de la agregación"
      - "Una opción de sólo pantalla"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-2"
    q: "Sólo el 44% de los casos cerrados tienen una encuesta CSAT. El CSAT promedio es:"
    options:
      - "Wrong"
      - "Correcto, pero describe a los encuestados en lugar de a los clientes, por lo que se envía con la tasa de respuesta a su lado"
      - "Inutilizable"
      - "Mejorado por la imputación de los puntajes perdidos"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-3"
    q: "\"El campo del comprador económico está en blanco\" predice perder. La explicación más probable es:"
    options:
      - "Los campos blancos causan pérdidas"
      - "Un repudio desenganchado no llena los campos – el blanco es un síntoma, no una causa"
      - "El campo está roto"
      - "Coincidencia"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-1"
    q: "Los ingresos se doblaron después de agregar una unión. Los duplicados son:"
    options:
      - "Registros duplicados reales para eliminar"
      - "Un artefacto de unión - la solución es la unión, no un paso de la duplicación"
      - "Un problema de entrada de datos"
      - "Caused by nulls"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-2"
    q: "Una cuenta aparece 18 veces en arr snapshots. Esto es:"
    options:
      - "Un duplicado para eliminar"
      - "El grano previsto: una fila por cuenta por mes"
      - "Un fallo de carga"
      - "Un error de sincronización"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-3"
    q: "Al colapsar duplicados genuinos, ¿qué fila debe sobrevivir?"
    options:
      - "Cualquier cosa aparece primero"
      - "Uno elegido por una regla explícita — más recientemente modificada, más completa, o de la fuente preferida"
      - "Una fila al azar"
      - "El que tiene el id más bajo"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-1"
    q: "Un dashboard muestra un total equivocado. ¿Dónde estás primero?"
    options:
      - "Configuración del gráfico del widget"
      - "Data Manager → Monitor: corrió, cuándo, y cuántas filas"
      - "La configuración de compartir aplicaciones"
      - "La consola del navegador"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-2"
    q: "La cuenta de fila cayó de 2.800 a 2.100 después de un cambio que no hizo. Lo más probable:"
    options:
      - "Variación normal"
      - "Un filtro aguas arriba, una unión interna, o un permiso cambiar los registros de caída"
      - "Un límite de gráficos"
      - "Ronda"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-3"
    q: "La manera más rápida de localizar un problema de grano en una receta es:"
    options:
      - "Releer el SAQL"
      - "Haciendo clic a través de las previsualizaciones del nodo y mirando donde la fila cuenta cambios"
      - "Reconstruir la receta"
      - "Exportación a CSV"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-1"
    q: "¿Para qué es la sincronización de datos?"
    options:
      - "Escribir análisis resultados de vuelta a Salesforce"
      - "Mantener una copia local de objetos seleccionados y campos actuales, por lo que las recetas no llegan a la fuente en cada carrera"
      - "Programación de correos electrónicos"
      - "Encrypting datasets"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-2"
    q: "Una receta funciona verde noche, pero los datos siempre tienen un día de antigüedad. Causa:"
    options:
      - "Un conjunto de datos corruptos"
      - "La receta está programada antes de la sincronización que depende de las completas"
      - "Caché de pizarra"
      - "Un predicado de estatura"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-3"
    q: "Un CloseDate cargado como texto previene:"
    options:
      - "Nada."
      - "Filtros de fecha, agrupaciones de mes y líneas de tendencia"
      - "Clasificación"
      - "Unirse"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-4"
    q: "¿Por qué forzar IDs de aspecto numérico a dimensiones cargadas?"
    options:
      - "Para ahorrar espacio"
      - "Porque se escribe como medidas que el producto ofrecerá para resumirlos, y eventualmente alguien acepta"
      - "Es necesario"
      - "Para hacerlos filtrables"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-5"
    q: "Los límites del cubo deben venir de:"
    options:
      - "Incluso terceras partes del rango"
      - "El negocio - el punto en que alguien hace algo diferente"
      - "Los cuartiles del conjunto de datos, siempre"
      - "La paleta de gráficos"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-6"
    q: "El bloqueo en cada dashboard en lugar de en la receta conduce a:"
    options:
      - "Más flexibilidad"
      - "'Large' significa cosas diferentes en diferentes pantallas, ambas defensibles"
      - "Consultas más rápidas"
      - "Conjuntos de datos más pequeños"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-7"
    q: "\"Descuento de promedio\" computado como la media de las tasas per-deal es incorrecta porque:"
    options:
      - "Los descuentos no son numéricos"
      - "Pesa cada acuerdo por igual independientemente del tamaño"
      - "Las nulas están excluidas"
      - "Necesita una cuenta distinta"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-8"
    q: "Llenar una Cantidad en blanco con cero es:"
    options:
      - "Siempre correcto"
      - "Un reclamo - afirma que el acuerdo no vale nada, y arrastra cada promedio construido sobre él"
      - "Se requiere antes de la agregación"
      - "Una opción de sólo pantalla"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-9"
    q: "Los ingresos se duplicaron después de añadir una unión. Los 'duplicados' son:"
    options:
      - "Registros duplicados reales para eliminar"
      - "Un artefacto de unión - la solución es la unión, no un paso de la duplicación"
      - "Un problema de entrada de datos"
      - "Caused by nulls"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-10"
    q: "La manera más rápida de localizar un número equivocado dentro de una receta es:"
    options:
      - "Leyendo la SAQL"
      - "Caminando el nodo preve y mirando donde la fila cuenta cambios"
      - "Reconstrucción del conjunto de datos"
      - "Comprobación de aplicaciones compartiendo"
    answer: 1
    topic: "data-preparation"
  - id: "datasets-and-modelling-index-1"
    q: "¿Qué más determina qué preguntas puede responder un conjunto de datos?"
    options:
      - "Su cuenta de fila"
      - "Su grano - lo que una fila representa"
      - "Los tipos de gráficos utilizados en él"
      - "Su horario de actualización"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-index-2"
    q: "Un conjunto de datos pre-agregado a los totales mensuales es:"
    options:
      - "Es estrictamente mejor — es más rápido"
      - "Más rápido y permanentemente incapaz de responder a las preguntas a continuación que el grano"
      - "Equivalente a uno fino"
      - "Sólo útil para las exportaciones"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-1"
    q: "Uniendo 608 oportunidades a 1.192 líneas de productos da 1.192 filas. ¿Es un bicho?"
    options:
      - "Sí, la unión está mal configurada"
      - "No, eso es lo que hace una unión de uno a otro. El bicho está resumiendo la cantidad del padre después"
      - "Sí, las filas nunca deberían aumentar"
      - "Sólo si las llaves son texto"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-2"
    q: "¿Qué solución mantiene disponible el detalle de nivel de producto?"
    options:
      - "Aggregating the line items before the join"
      - "Mantener el grano de la línea y no llevar la Cantidad de los padres, resumiendo LineAmount en su lugar"
      - "Filtrar a un producto por acuerdo"
      - "Usando una unión interna"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-3"
    q: "Un total es exactamente 3× lo que esperas. ¿Qué sospecha?"
    options:
      - "Un problema de seguridad"
      - "Un fan-out — una medida padre repetida en aproximadamente tres filas de niños cada uno"
      - "A stale dataset"
      - "Conversión de moneda"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-4"
    q: "La mejor manera de investigar un total sospechoso es:"
    options:
      - "Revise la configuración del gráfico"
      - "Filtrar a una sola entidad y contar las filas a mano"
      - "Reconstruir el tablero"
      - "Aumentar el límite de fila"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-1"
    q: "El punto de partida adecuado para diseñar un conjunto de datos es:"
    options:
      - "Los cuadros de fuentes disponibles"
      - "Las preguntas que tiene que contestar, escritas"
      - "Los tipos de gráfico previstos"
      - "El horario de actualización"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-2"
    q: "Un conjunto de datos que sirve a dos audiencias con diferentes granos generalmente debe:"
    options:
      - "Compromiso en un grano medio"
      - "Sea dos conjuntos de datos, a menudo de una receta con dos salidas"
      - "Use el mejor grano"
      - "Ser filtrado por espectador"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-3"
    q: "Un filtro aplicado dentro del conjunto de datos en lugar de en el panel es correcto cuando:"
    options:
      - "Es más rápido."
      - "Las filas excluidas nunca deben aparecer en ninguna pregunta este conjunto de datos respuestas"
      - "Los espectadores podrían querer cambiarlo"
      - "Siempre"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-1"
    q: "Una tabla de referencia como accounts.csv se caracteriza por:"
    options:
      - "Tener más filas"
      - "Ser unido a TO en lugar de agregado — resumiendo cualquier cosa en él es generalmente un error"
      - "Cambiar con frecuencia"
      - "Sin llaves"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-2"
    q: "El formato largo (una fila por entidad por métrica) es preferible cuando:"
    options:
      - "Hay pocas métricas que nunca cambian"
      - "Las métricas se añaden a menudo, o usted quiere trazar muchos de ellos con un widget"
      - "Almacenamiento limitado"
      - "Nunca"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-3"
    q: "Un conjunto de datos derivado basado en los riesgos de salida de otro conjunto de datos:"
    options:
      - "Nada."
      - "Una cadena de programación donde un fracaso de tres enlaces es invisible al final"
      - "Perder la seguridad"
      - "Columnas duplicadas"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-1"
    q: "¿Por qué no puedes construir un dashboard de movimiento de oleoductos del objeto de oportunidad solo?"
    options:
      - "El objeto es demasiado grande"
      - "Sólo tiene valores actuales - no hay registro de lo que el escenario o la cantidad fue el mes pasado"
      - "No se pueden sincronizar las oportunidades"
      - "Usted puede; se construye en"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-2"
    q: "Cohorting leads by conversion date rather than creation date produces:"
    options:
      - "Una imagen más precisa"
      - "Una distorsionada: las recientes cohortes parecen imposibles y las viejas parecen terribles, mientras que ambas cifras son individualmente correctas"
      - "No hay diferencia"
      - "Un error en la receta"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-3"
    q: "Un conjunto de datos de instantáneas anexa el estado actual cada ejecución. ¿Qué significa eso para un campo que empiezas a sincronizar hoy?"
    options:
      - "Su historia se llena automáticamente"
      - "No tiene historia antes de hoy, y nunca lo hará"
      - "No puede ser instantánea"
      - "La historia viene del registro de auditoría"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-1"
    q: "¿Dónde debería establecerse una etiqueta de pantalla de campo?"
    options:
      - "En cada widget"
      - "En los metadatos de campo del conjunto de datos, así que cada lente y widget lo hereda"
      - "En la fórmula de la receta"
      - "En la configuración de la aplicación"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-2"
    q: "Una medida monetaria muestra seis lugares decimales en cada tablero. La solución eficiente es:"
    options:
      - "Formato cada widget"
      - "Establecer el formato una vez en el campo de conjunto de datos"
      - "Redondearlo SAQL"
      - "Cambiar el tipo de gráfico"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-1"
    q: "Uniendo 608 oportunidades a 1.192 líneas de productos produce 1.192 filas. El error es:"
    options:
      - "La unión en sí misma"
      - "Resumiendo la cantidad del padre después, que ahora repite por línea"
      - "Usando un lookup en lugar de interior"
      - "No hay error."
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-2"
    q: "La solución que mantiene el detalle del producto es:"
    options:
      - "Temas de línea Aggregate antes de la unión"
      - "Mantenga la línea de grano y suma LineAmount en lugar de la cantidad del padre"
      - "Filtrar a un producto por acuerdo"
      - "Use una unión interna"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-3"
    q: "El grano de un conjunto de datos debe derivarse de:"
    options:
      - "Las tablas de fuentes"
      - "La mejor pregunta que debe responder"
      - "Tipos de gráfico"
      - "El límite de fila"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-4"
    q: "Summing ARR en todas las filas de una instantánea de 18 meses da:"
    options:
      - "Company ARR"
      - "Alrededor de dieciocho años de ingresos"
      - "ARR por cuenta"
      - "Un error"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-5"
    q: "Un campo que empiezas a sincronizar hoy tiene:"
    options:
      - "Historia llena de historia"
      - "No hay historia antes de hoy, permanentemente"
      - "Historia de la ruta de auditoría"
      - "Historia después de la próxima reconstrucción"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-6"
    q: "Summing a column on a reference table like accounts is:"
    options:
      - "Prácticas estándar"
      - "Por lo general un error: se unen tablas de referencia, no se agregan"
      - "Requerido para ARR"
      - "Más rápido que una tabla de hechos"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-7"
    q: "El fallo característico del formato largo es:"
    options:
      - "Consultas lentas"
      - "Una consulta que olvida filtrar a una métrica, silenciosamente resumiendo a través de métricas no relacionadas"
      - "Falta de llaves"
      - "Entidades duplicadas"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-8"
    q: "Un campo porcentual de utilización con una agregación por defecto de la suma produce:"
    options:
      - "Totales correctos"
      - "960% a lo largo de un año, hecho limpio"
      - "Un error"
      - "Nulls"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-9"
    q: "Un filtro aplicado dentro del conjunto de datos debe ser documentado porque:"
    options:
      - "Es necesario"
      - "Es invisible aguas abajo, por lo que una reconciliación contra la fuente difiere sin causa visible"
      - "Afecta el rendimiento"
      - "Los espectadores pueden querer cambiarlo"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-10"
    q: "La frase más útil en la descripción de un conjunto de datos es:"
    options:
      - "Quien lo construyó"
      - "Lo que una fila representa"
      - "Cuando se refresca"
      - "Que aplicación está en"
    answer: 1
    topic: "datasets-and-modelling"
---

Preguntas de práctica para el dominio de la capa de datos CRM Analytics y Einstein Discovery Examen de consultoría.
