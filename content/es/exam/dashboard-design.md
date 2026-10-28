---
title: "Diseño de panel de análisis — preguntas de práctica"
domain: "dashboard-design"
quiz:
  - id: "data-visualization-index-1"
    q: "¿Cuál es la primera pregunta que debes hacer antes de elegir un tipo de gráfico?"
    options:
      - "¿Qué tipo se ve mejor en los colores de la marca?"
      - "¿Qué comparación se supone que haga el lector?"
      - "¿Cuántas filas hay en el conjunto de datos?"
      - "¿Qué tipos hace? CRM Analytics ¿Apoyo?"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-index-2"
    q: "Un gráfico de barras ordenados alfabéticamente en lugar de por valor mayor:"
    options:
      - "Renders más rápido"
      - "Oculta el ranking, que es generalmente la razón por la que alguien dibujó un gráfico de barras"
      - "Es más preciso"
      - "No importa."
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-1"
    q: "Usted tiene una dimensión con 40 categorías y una medida. La mejor opción es:"
    options:
      - "Un gráfico de pasteles"
      - "Una barra horizontal de la parte superior N, con el límite en el título"
      - "Un gráfico de línea"
      - "Una trama dispersa"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-2"
    q: "Dos medidas, y quieres saber si se mueven juntos. El gráfico es:"
    options:
      - "Un gráfico de línea de eje dual"
      - "Una trama dispersa, una medida por eje"
      - "Dos gráficos de barras separados"
      - "Una columna apilada"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-3"
    q: "¿Por qué es horizontal generalmente mejor que vertical para barras categóricas?"
    options:
      - "Hace más rápido"
      - "Los nombres de la categoría son palabras, y las palabras leen a lo largo de un eje horizontal en lugar de rotar bajo una columna"
      - "Las barras verticales son deprecatadas"
      - "Utiliza menos espacio"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-1"
    q: "¿Cuándo debería un gráfico de columna (vertical) golpear una barra (horizontal)?"
    options:
      - "Siempre - vertical es estándar"
      - "Cuando las categorías se ordenan períodos, como meses, que los lectores esperan correr de izquierda a derecha"
      - "Cuando hay muchas categorías"
      - "Cuando las etiquetas son largas"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-2"
    q: "Grupo o apilado, cuando el lector necesita comparar cada subcategoría entre grupos?"
    options:
      - "Apilado — muestra totales"
      - "Se agrupa — sólo el segmento inferior de una pila comparte una línea de referencia, por lo que los otros no pueden compararse por ojo"
      - "O funciona igual"
      - "Tampoco; utilizar un pastel"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-3"
    q: "El eje de un gráfico de barras comienza a 40 en lugar de 0. Esto es:"
    options:
      - "Fine y estándar"
      - "Misleading para barras - longitud de barras ES la codificación, por lo que un eje truncado maldice la relación entre barras"
      - "Necesario para legibilidad"
      - "Sólo un problema en la impresión"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-1"
    q: "Un gráfico de doble eje muestra ingresos y cruce de cuentas en junio. ¿Qué significa el cruce?"
    options:
      - "Revenue overtook headcount"
      - "Nada: el punto de cruce es decidido por donde se fijan los dos ejes, no por los datos"
      - "Están correlacionados"
      - "Junio fue el mes de descanso."
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-2"
    q: "Su conjunto de datos no tiene filas durante un mes sin actividad. El gráfico de línea debe:"
    options:
      - "Únete directamente a través de la brecha"
      - "Mostrar cero si cero es verdad, y un descanso si el valor es genuinamente desconocido — significan cosas diferentes"
      - "Ocultar el mes"
      - "Interpolar el promedio"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-3"
    q: "¿Cuántas series puede llevar un gráfico de línea antes de que deje de funcionar?"
    options:
      - "Uno"
      - "Alrededor de cuatro, y sólo si son separables por color y forma"
      - "Diez"
      - "Unlimitado con una leyenda"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-1"
    q: "¿Cuántas rebanadas puede llevar un donut antes de que los lectores dejen de poder compararlas?"
    options:
      - "Unos tres o cuatro"
      - "Unos diez."
      - "Veinte con etiquetas"
      - "No hay límite"
    answer: 0
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-2"
    q: "Una barra 100% apilada con el tiempo es mejor en mostrar:"
    options:
      - "Crecimiento absoluto"
      - "Si el MIX ha cambiado - al costo del tamaño de la ocultación por completo"
      - "Valores individuales"
      - "Aparatos"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-3"
    q: "Datos de composición donde los porcentajes exactos importan generalmente se muestra mejor como:"
    options:
      - "Un donut"
      - "Una tabla ordenada con una columna de acción"
      - "Un árbol"
      - "Un calibre"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-1"
    q: "La utilización de la empresa es del 88%. ¿Por qué es potencialmente inútil?"
    options:
      - "Es demasiado preciso."
      - "Puede ser el promedio de cuentas en el 30% y en el 140%, que necesitan acciones opuestas y son ambos invisibles en él"
      - "Los porcentajes no pueden promediarse en absoluto"
      - "Debe ser una mediana"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-2"
    q: "¿Una trama dispersa responde qué pregunta que ningún gráfico de barras puede?"
    options:
      - "Que categoría es más grande"
      - "Si dos medidas se reúnen, a través de muchas entidades a la vez"
      - "Cómo cambió algo con el tiempo"
      - "Lo que comparte cada parte es"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-3"
    q: "La tercera medida de un gráfico de burbujas está codificada como:"
    options:
      - "Color"
      - "Zona de burbujas"
      - "Posición sobre un tercer eje"
      - "Tamaño de la etiqueta"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-1"
    q: "¿Qué hace un KPI número accionable?"
    options:
      - "Una fuente más grande"
      - "Una comparación y una dirección - contra el plan o el último período, con una flecha"
      - "Un símbolo de la moneda"
      - "Un fondo de color"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-2"
    q: "Un calibre es una buena opción cuando:"
    options:
      - "Cualquier número se muestra"
      - "Hay un verdadero objetivo fijo y la pregunta es 'cuán cerca estamos'"
      - "El número es un porcentaje"
      - "El espacio es limitado"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-3"
    q: "El pago del CAC disminuyó de 15,3 a 14,2 meses. La flecha debe ser:"
    options:
      - "Abajo y rojo"
      - "Abajo y verde — la bondad es una propiedad de la métrica, no la dirección"
      - "Arriba y verde"
      - "Sin flecha"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-1"
    q: "¿Cuándo una tabla supera a un gráfico?"
    options:
      - "Nunca"
      - "Cuando la identidad de cada fila importa —que cuenta, que trata— o los valores exactos sí"
      - "Cuando hay más de 20 filas"
      - "Cuando los datos son texto"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-2"
    q: "Una tabla con una barra de desplazamiento en un panel normalmente significa:"
    options:
      - "Buena densidad de información"
      - "Se ha convertido en una exportación de datos en lugar de un widget dashboard"
      - "Las filas necesitan ordenar"
      - "La fuente es demasiado grande"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-3"
    q: "Los números en una tabla deben ser:"
    options:
      - "Izquierda alineada con el texto"
      - "Alineados con decimales consistentes, por lo que las magnitudes son comparables a un vistazo"
      - "Centred"
      - "Coloreado por valor"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-1"
    q: "Usted tiene ingresos para seis regiones de ventas. ¿Es un mapa el gráfico correcto?"
    options:
      - "Sí, las regiones son geográficas"
      - "Normalmente no — con seis categorías una barra ordenada las clasifica precisamente, donde un mapa hace que el lector estima los colores"
      - "Sí, si los colores son accesibles"
      - "Sólo con una leyenda"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-2"
    q: "La mayor parte de los ingresos brutos por país muestran:"
    options:
      - "Donde su producto realiza lo mejor"
      - "Donde la mayoría de las personas y las mayores economías son"
      - "Parte del mercado"
      - "Crecimiento"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-3"
    q: "La solución habitual es:"
    options:
      - "Una escala de color diferente"
      - "Normalización: ingresos por cuenta, per cápita o contra tamaño del mercado"
      - "Remoción de países pequeños"
      - "Usando un mapa de burbujas"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-1"
    q: "Un embudo abarca 2,1 millones de sesiones hasta 506 oportunidades a escala lineal. ¿Qué pasa?"
    options:
      - "Lee claramente"
      - "Cada etapa después de la segunda es un problema, y las etapas que más importan se vuelven invisibles"
      - "Errores del gráfico"
      - "Los porcentajes están equivocados"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-2"
    q: "Un diagrama de cascada es para:"
    options:
      - "Categorías de clasificación"
      - "Mostrando cómo una serie de adiciones y restas obtiene de un total a otro"
      - "Comparación de dos medidas"
      - "Datos geográficos"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-3"
    q: "Las etapas del embudo deben ordenarse:"
    options:
      - "Por tamaño"
      - "En orden de proceso"
      - "Alfabéticamente"
      - "Tasa de conversión"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-1"
    q: "¿Cuál es la prueba confiable para si un gráfico es honesto?"
    options:
      - "Cada número en él es correcto"
      - "Lo que un lector concluye en cuatro segundos es verdad"
      - "Utiliza la paleta de marca"
      - "Tiene una leyenda."
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-2"
    q: "Truncar el eje y es defensible en una línea de retención, pero no en un gráfico de barras. ¿Por qué?"
    options:
      - "Las barras son tecnología más antigua"
      - "La longitud de la barra es la codificación, por lo que la truncación maldice la relación entre barras; una línea codifica la pendiente"
      - "Las líneas no pueden mostrar valores pequeños"
      - "Nunca es defensible"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-3"
    q: "El gráfico deshonesto más común en los informes de negocios es:"
    options:
      - "Un pastel 3D"
      - "Un total bruto que necesitaba un denominador — cuenta donde una tasa era la cuestión"
      - "Una escala de registro"
      - "Un eje dual"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-1"
    q: "La primera pregunta antes de elegir un tipo de gráfico es:"
    options:
      - "Cuantas filas hay"
      - "Qué comparación debe hacer el lector"
      - "Que colores están disponibles"
      - "Que tipos CRM Analytics soportes"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-2"
    q: "Un gráfico de barras categóricamente debe ser clasificado:"
    options:
      - "Alfabéticamente"
      - "Descendiendo por la medida"
      - "Por la dimensión id"
      - "Aleatoriamente"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-3"
    q: "Grupo en lugar de barras apiladas, cuando el lector debe comparar subcategorías a través de grupos, porque:"
    options:
      - "Las estacas son más difíciles de color"
      - "Sólo el segmento inferior de una pila comparte una base de referencia, por lo que el resto no se puede comparar por ojo"
      - "Las barras agrupadas son más estrechas"
      - "Las estacas no pueden mostrar totales"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-4"
    q: "Un donut deja de trabajar aproximadamente:"
    options:
      - "Dos rebanadas"
      - "Cuatro rebanadas"
      - "Diez rebanadas"
      - "Veinte rebanadas"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-5"
    q: "¿Qué pregunta puede SOLO una respuesta de trama dispersa?"
    options:
      - "Que categoría es más grande"
      - "Si dos medidas se reúnen en muchas entidades"
      - "Cómo un valor cambió con el tiempo"
      - "Qué parte aporta cada parte"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-6"
    q: "A KPI el número se vuelve factible cuando lleva:"
    options:
      - "Una fuente más grande"
      - "Una comparación y una dirección"
      - "Un símbolo de la moneda"
      - "Un fondo de color"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-7"
    q: "La caída del pago del CAC debe mostrarse como:"
    options:
      - "Una flecha roja hacia abajo"
      - "Una flecha verde hacia abajo — la bondad pertenece a la métrica, no a la dirección"
      - "Sin flecha"
      - "Una flecha ascendente"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-8"
    q: "Un embudo que abarca 2.1 millones de sesiones a 506 oportunidades a escala lineal:"
    options:
      - "Lee bien"
      - "Renders las etapas posteriores como obstáculos, ocultando las etapas que más importan"
      - "Errores"
      - "Invertidos"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-9"
    q: "La mayor parte de los ingresos brutos por país muestran:"
    options:
      - "Apto para el mercado de productos"
      - "Donde las poblaciones y economías más grandes son"
      - "Crecimiento"
      - "Margin"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-10"
    q: "El gráfico deshonesto más común en los informes de negocios es:"
    options:
      - "Un gráfico de pastel 3D"
      - "Un total bruto que necesitaba un denominador"
      - "Una escala de registro"
      - "Un área apilada"
    answer: 1
    topic: "data-visualization"
  - id: "lenses-and-explorations-index-1"
    q: "¿Qué es un lente mejor entendido?"
    options:
      - "Un informe terminado"
      - "Un espacio de trabajo desechable para una exploración de un conjunto de datos"
      - "Una plantilla de panel"
      - "Una consulta guardada sólo los administradores pueden crear"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-index-2"
    q: "¿Por qué cambiar a SAQL modo después de hacer un cambio haciendo clic?"
    options:
      - "Corre más rápido"
      - "Ya sabes cuál debe ser la respuesta, así que leer la consulta generada es la forma más barata de aprender el idioma"
      - "Los gráficos no están disponibles en SAQL modo"
      - "Es necesario antes de guardar"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-1"
    q: "CRM Analytics clasifica un gráfico agrupado por el agrupamiento por defecto. ¿Por qué cambiarlo?"
    options:
      - "Orden alfabético es inválido"
      - "El punto de un gráfico agrupado es generalmente el ranking, que orden alfabético oculta"
      - "La clasificación por medida es más rápida"
      - "Es necesario para enfrentarse"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-2"
    q: "Añadiendo un segundo grupo a un gráfico de barras generalmente:"
    options:
      - "Doble la visión"
      - "Hace que sea sustancialmente más difícil leer, y vale la pena resistir a menos que la comparación sea el punto"
      - "Breaks faceting"
      - "Cambia la medida"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-3"
    q: "En el grano line-item, 'cuenta de filas' significa:"
    options:
      - "Número de ofertas"
      - "Número de artículos de línea: utilizar un recuento distinto con la clave del trato para las ofertas"
      - "Número de cuentas"
      - "Número de productos"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-1"
    q: "Un gráfico muestra un segmento con ingresos imposiblemente altos. ¿Cuál es el siguiente paso más rápido?"
    options:
      - "Cambiar el tipo de gráfico"
      - "Cambiar al modo de mesa y mirar las filas detrás de él"
      - "Reconstruir la lente"
      - "Compruebe los filtros de panel"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-2"
    q: "SAQL el modo es más valioso para un estudiante porque:"
    options:
      - "Funciona más rápido que hacer clic"
      - "Muestra la consulta de tus clics producidos, contra una respuesta que ya sabes"
      - "Es la única manera de filtrar"
      - "Los gráficos no pueden agruparse por fecha"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-1"
    q: "¿Qué más determina si las consultas en lengua natural funcionan bien?"
    options:
      - "El tipo de gráfico elegido"
      - "La calidad de los metadatos de campo del conjunto de datos — etiquetas, formatos y plomería oculta"
      - "El número de usuarios"
      - "El horario de actualización"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-2"
    q: "El importante modo de fracaso de una respuesta en lengua natural es que:"
    options:
      - "Corre lentamente"
      - "Responde a una pregunta subtly diferente a la que se hizo, fluidamente y sin indicación de la diferencia"
      - "No puede producir gráficos"
      - "Requisitos SAQL conocimiento"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-1"
    q: "Una lente se describe mejor como:"
    options:
      - "Un informe terminado"
      - "Un espacio de trabajo desechable para una exploración de un conjunto de datos"
      - "Una plantilla de panel"
      - "A salvo SAQL script"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-2"
    q: "La clasificación por defecto en un gráfico agrupado es por la agrupación. Normalmente lo cambias porque:"
    options:
      - "El alfabético es nulo"
      - "El ranking es normalmente el punto, y el orden alfabético lo oculta"
      - "Hace más rápido"
      - "La cara requiere"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-3"
    q: "En el grano line-item, para contar las ofertas que debe utilizar:"
    options:
      - "Cuenta de filas"
      - "Una cuenta distinta con la clave de oportunidad"
      - "Sum of Amount"
      - "Promedio"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-4"
    q: "Añadiendo un segundo grupo a un gráfico de barras generalmente:"
    options:
      - "Doble la visión"
      - "Hace que sea sustancialmente más difícil leer, y vale la pena resistir a menos que la comparación sea el punto"
      - "Breaks faceting"
      - "Cambia la medida"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-5"
    q: "Un gráfico se ve mal. El diagnóstico más rápido es:"
    options:
      - "Cambiar el tipo de gráfico"
      - "Cambiar al modo de mesa y leer las filas"
      - "Reconstruir la lente"
      - "Comprobación"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-6"
    q: "La mejor manera de aprender el lenguaje de la consulta del explorador es:"
    options:
      - "Leer el final de referencia de la función"
      - "Hacer clic, luego leer el SAQL tus clics producidos contra una respuesta que ya sabes"
      - "Escribir consultas desde cero"
      - "Copiar ejemplos de foros"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-7"
    q: "Un filtro escrito como 'Stage != Cerrado Perdido' también elimina:"
    options:
      - "Nada más"
      - "Filas donde Stage está nulo"
      - "Cerradas hileras Won"
      - "Filas de otros conjuntos de datos"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-8"
    q: "Los resultados de la consulta en lengua natural deben tratarse como:"
    options:
      - "Respuestas finales a la cita"
      - "Un punto de partida para verificar en modo de mesa, porque responde con fluidez incluso cuando contestó una pregunta diferente"
      - "Inutilizable"
      - "Equivalente a una lente salvada"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "designing-dashboards-index-1"
    q: "¿Qué hace que un tablero termine?"
    options:
      - "Cada widget solicitado está presente"
      - "Un espectador puede tomar la decisión que existe para, rápido y sin usted"
      - "Utiliza los colores de la empresa"
      - "No tiene espacio en blanco"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-index-2"
    q: "Un interesado pide un noveno widget. La mejor primera pregunta es:"
    options:
      - "¿Qué tipo de gráfico quieres?"
      - "¿Qué harías diferente dependiendo de lo que mostrara?"
      - "¿Puede esperar hasta el próximo sprint?"
      - "¿Tiene los datos?"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-1"
    q: "¿Dónde pertenece el número más importante?"
    options:
      - "Centre, largest"
      - "Parte superior izquierda, donde comienza el orden de lectura"
      - "Como conclusión"
      - "En cualquier lugar; la gente escanea aleatoriamente"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-2"
    q: "¿Por qué los widgets relacionados con el grupo junto con el espacio entre grupos?"
    options:
      - "Parece tidierno."
      - "Proximidad implica relación — los widgets colocados juntos se leen como pertenecientes juntos, ya sea o no lo hacen"
      - "Mejora el rendimiento"
      - "Es requerido por faceting"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-1"
    q: "¿Por qué un delta de colores también debe llevar una flecha de dirección o etiqueta?"
    options:
      - "Se ve más profesional"
      - "Debido a que el color por sí solo excluye a los lectores de color ciego y no sobrevive a la impresión o una captura de pantalla a escala gris"
      - "Las flechas son más rápidas para renderizar"
      - "Es requerido por Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-2"
    q: "¿De dónde viene un umbral rojo/ambar/verde?"
    options:
      - "Incluso terceras partes del rango"
      - "El negocio - el número en el que alguien realmente hace algo diferente"
      - "La paleta por defecto"
      - "El promedio"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-3"
    q: "Un dashboard donde la mayoría de las células están coloreadas tiene:"
    options:
      - "Densidad máxima de la información"
      - "No queda señal, si todo se pone de relieve, nada es"
      - "Mejor accesibilidad"
      - "Tiempos de carga más rápidos"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-1"
    q: "¿Cuándo gana una tabla un gráfico?"
    options:
      - "Nunca"
      - "Cuando la identidad de cada fila importa — qué cuenta específica, qué acuerdo específico"
      - "Cuando hay muchas filas"
      - "Cuando los datos son numéricos"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-2"
    q: "Lo que se convierte en KPI ¿Número en uno accionable?"
    options:
      - "Una fuente más grande"
      - "Una comparación — contra el plan, contra el último período— y una dirección"
      - "Un símbolo de la moneda"
      - "Una frontera"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-3"
    q: "Una tabla de valores que muestra las 140 cuentas es generalmente:"
    options:
      - "Thorough"
      - "Una exportación de datos con ropa de dashboard"
      - "Necesario para la precisión"
      - "Más rápido que un gráfico"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-1"
    q: "La palanca más grande en el tiempo de carga de panel es generalmente:"
    options:
      - "Tipo de carga"
      - "El número de consultas distintas — widgets que podrían compartir una consulta, pero cada una ejecuta su propia"
      - "Elección del navegador"
      - "Profundidad de color"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-2"
    q: "Un conjunto de datos en un grano muy fino hace que los tableros de control lento porque:"
    options:
      - "Los granos finos se almacenan ineficientemente"
      - "Cada widget agrega millones de filas en tiempo de consulta, en cada carga, para cada espectador"
      - "El rostro es deshabilitado"
      - "No puede ser indexado"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-1"
    q: "¿Por qué el embudo está clasificado en orden de escenario en lugar de por tamaño?"
    options:
      - "Hace más rápido"
      - "La secuencia es el argumento — la caída entre etapas adyacentes es el hallazgo"
      - "Salesforce requiere"
      - "Para igualar la mesa"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-2"
    q: "¿Por qué se apaga el widget de cobertura?"
    options:
      - "Ejecución"
      - "Es una referencia contra el trimestre completo — si se filtra con todo lo demás, la comparación desaparece"
      - "Utiliza un conjunto de datos diferente"
      - "Coeficientes de rupturas"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-3"
    q: "La tendencia del oleoducto se agrupa por mes creado en lugar de mes cercano porque:"
    options:
      - "Las fechas cercanas no son fiables"
      - "Cohorte en la fecha equivocada distorsiona los períodos recientes y antiguos en direcciones opuestas mientras ambos números permanecen individualmente correcto"
      - "Mes creado representa más rápido"
      - "No hay diferencia"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-1"
    q: "Un dashboard está terminado cuando:"
    options:
      - "Cada widget solicitado está presente"
      - "Su audiencia puede tomar la decisión que existe para, rápido y sin usted"
      - "Concuerda con la paleta de marca"
      - "No hay espacio en blanco"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-2"
    q: "El número de titulares pertenece a:"
    options:
      - "Centre"
      - "Parte superior izquierda, donde comienza el orden de lectura"
      - "Bottom"
      - "Aparte de los filtros"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-3"
    q: "Los filtros en la esquina superior izquierda son un error porque:"
    options:
      - "Son lentos."
      - "Pasan el espacio más valioso de la pantalla en los controles que nadie necesita hasta su segunda visita"
      - "No se pueden cambiar"
      - "No pueden ser obligados"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-4"
    q: "Un título de widget debe llevar:"
    options:
      - "La medida sólo"
      - "La medida, el período, el filtro y cualquier límite - será capturada sin contexto"
      - "El nombre del autor"
      - "El nombre del conjunto de datos"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-5"
    q: "Un gráfico de embudo debe ser clasificado:"
    options:
      - "Por tamaño descendiendo"
      - "En orden de proceso"
      - "Alfabéticamente"
      - "Fecha"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-6"
    q: "¿Por qué un delta de colores también debe llevar una flecha o una etiqueta?"
    options:
      - "Estética"
      - "El color por sí solo excluye a los lectores de color ciego y muere en grises"
      - "Las flechas se vuelven más rápido"
      - "Es obligatorio en Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-7"
    q: "A KPI el número se vuelve factible cuando tiene:"
    options:
      - "Una fuente más grande"
      - "Una comparación y una dirección"
      - "Una frontera"
      - "Un símbolo de la moneda"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-8"
    q: "La palanca más grande en un panel lento es generalmente:"
    options:
      - "Tipos de carga"
      - "Consolidar widgets que podrían compartir una consulta"
      - "Menos colores"
      - "Un navegador más rápido"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-9"
    q: "Una tabla en un panel que necesita desplazarse tiene:"
    options:
      - "Buena densidad de información"
      - "Dejó de ser un widget de dashboard y convertirse en una exportación de datos"
      - "Demasiado grande una fuente"
      - "La orden equivocada"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-10"
    q: "El último cheque antes de compartir un panel es:"
    options:
      - "Revise los títulos"
      - "Ábrelo como usuario restringido y reconcilia el titular contra algo independiente verdadero"
      - "Exportarlo a PDF"
      - "Añadir más widgets"
    answer: 1
    topic: "designing-dashboards"
---

Preguntas de práctica para el dominio de diseño de panel de análisis CRM Analytics y Einstein Discovery Examen de consultoría.
