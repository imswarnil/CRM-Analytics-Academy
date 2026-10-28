---
title: "Einstein Discovery Diseño de historia - preguntas de práctica"
domain: "einstein-discovery"
quiz:
  - id: "einstein-discovery-index-1"
    q: "Una historia y un modelo difieren en eso:"
    options:
      - "Una historia es un gráfico"
      - "Una historia es el análisis de lo que correlaciona con un resultado; un modelo es una historia desplegada que marca registros"
      - "Un modelo es menos preciso"
      - "Son lo mismo."
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-index-2"
    q: "¿Por qué una predicción desplegada tiene sus principales factores?"
    options:
      - "El cumplimiento lo requiere"
      - "Una probabilidad desnuda da a un representante nada que hacer, y se ignora dentro de un mes"
      - "Mejora la precisión"
      - "Reduce el costo de cálculo"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-what-a-story-is-1"
    q: "Una historia reporta que \"descuento por encima del 30%\" se asocia con la pérdida. Esto significa:"
    options:
      - "El descuento causa pérdidas"
      - "Los acuerdos con descuentos pesados perdieron más a menudo — la dirección de causación no se establece por la historia"
      - "Deben prohibirse los descuentos"
      - "El modelo está roto"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-what-a-story-is-2"
    q: "Un factor que aparece en la parte superior de una historia es:"
    options:
      - "Necesariamente el más accionable"
      - "El más fuertemente asociado con el resultado, que no es el mismo que el más útil para actuar en"
      - "Causal garantizado"
      - "Un error de datos"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-preparing-data-1"
    q: "Entrenamiento en 'Closed Won' incluyendo las renovaciones enseña el modelo que:"
    options:
      - "Las renovaciones son valiosas"
      - "El mejor predictor de ganar ya es ser un cliente, que es verdadero e inútil"
      - "Nada; las renovaciones son neutrales"
      - "Nuevo negocio es más arriesgado"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-preparing-data-2"
    q: "Leakage significa:"
    options:
      - "Pérdida de datos durante la sincronización"
      - "Un campo registrado en o después del resultado, que lo predice casi perfectamente y no está disponible cuando usted necesita la predicción"
      - "Violación de la seguridad"
      - "Ruedas duplicadas"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-preparing-data-3"
    q: "El grano del conjunto de datos de capacitación debe ser:"
    options:
      - "Tan bien como sea posible"
      - "Una fila por cosa que quieres marcar — una oportunidad, una cuenta, una pista"
      - "Aggregated monthly"
      - "Lo que la receta ya produce"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-reading-a-story-honestly-1"
    q: "3% de los leads convertido. Un modelo que predice 'no' para todo es:"
    options:
      - "Inútil y 3% preciso"
      - "97% exacto e inútil, por lo que la precisión por sí sola es la medida incorrecta en un resultado raro"
      - "Imposible"
      - "La base de referencia correcta para desplegar"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-reading-a-story-honestly-2"
    q: "La primera pregunta a hacer de cualquier figura de precisión impresionante es:"
    options:
      - "¿Cuán grande era el conjunto de datos?"
      - "¿Qué sería un puntaje de referencia trivial – siempre prediciendo la clase mayoritaria?"
      - "¿Qué algoritmo se utilizó?"
      - "¿Cuánto tardaron en entrenar?"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-reading-a-story-honestly-3"
    q: "La precisión de un modelo va hacia abajo durante un año. La causa más probable es:"
    options:
      - "Un error de software"
      - "El negocio cambió — nuevos productos, nuevos segmentos, un movimiento de ventas diferente— y los datos de capacitación ya no lo describen."
      - "El conjunto de datos shrank"
      - "Demasiados usuarios"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-deploying-and-write-back-1"
    q: "¿Dónde debería aparecer una predicción desplegada?"
    options:
      - "En un panel de análisis sólo"
      - "Donde sucede el trabajo - la página de registro la persona ya abre"
      - "En un correo electrónico semanal"
      - "Sólo en el conjunto de datos"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-deploying-and-write-back-2"
    q: "¿Qué debe viajar con la puntuación?"
    options:
      - "Datos de capacitación"
      - "Los principales factores detrás de ella, así que hay una siguiente acción"
      - "El nombre del algoritmo"
      - "Nada más"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-deploying-and-write-back-3"
    q: "Después del despliegue, la tarea esencial en curso es:"
    options:
      - "Reentrenamiento semanal independientemente"
      - "Monitorear si el modelo todavía predice, y si alguien actúa en él"
      - "Aumentar la precisión de la puntuación"
      - "Añadiendo más factores"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-auditing-a-score-1"
    q: "La tasa de conversión por banda de puntuación es plana. La puntuación es:"
    options:
      - "Funcionamiento previsto"
      - "No predecir la conversión — es un número sin una reclamación detrás de ella"
      - "Miscalibrado pero útil"
      - "Demasiado granular"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-auditing-a-score-2"
    q: "La comparación esencial en una auditoría de puntuación es contra:"
    options:
      - "Un modelo más complejo"
      - "Una base de referencia trivial — un campo que ya tenía, como fuente de plomo"
      - "La puntuación del año pasado"
      - "La exactitud publicada del vendedor"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-auditing-a-score-3"
    q: "Una banda de puntuación con nueve pistas muestra un 60% de conversión. Esto es:"
    options:
      - "Fuerte evidencia de que la puntuación funciona"
      - "Casi ciertamente ruido — las tarifas necesitan sus volúmenes a su lado"
      - "Prueba de un efecto umbral"
      - "Un error de datos"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-1"
    q: "Una historia es:"
    options:
      - "Un modelo desplegado"
      - "El análisis de lo que correlaciona con un resultado"
      - "Una plantilla de panel"
      - "Un widget narrativo"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-2"
    q: "Formación en Cerrada Won incluyendo renovaciones enseña el modelo que:"
    options:
      - "Las renovaciones son valiosas"
      - "El mejor predictor de ganar ya es ser un cliente - verdadero e inútil"
      - "Nuevo negocio es más arriesgado"
      - "Nada útil puede ser aprendido"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-3"
    q: "Leakage es:"
    options:
      - "Pérdida de datos en sincronización"
      - "Un campo registrado en o después del resultado, no disponible cuando se necesita una predicción"
      - "Ruedas duplicadas"
      - "Una cuestión de seguridad"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-4"
    q: "3% de los leads convertido. Un modelo que predice 'no' para todos es:"
    options:
      - "3% exacto"
      - "97% precisa e inútil"
      - "Inválidos"
      - "La base de referencia correcta para el buque"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-5"
    q: "El grano del conjunto de datos de entrenamiento debe ser:"
    options:
      - "Tan bien como sea posible"
      - "Una fila por cosa que pretendes marcar"
      - "agregados mensuales"
      - "Lo que la receta produce"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-6"
    q: "Una predicción desplegada debe ir acompañada de:"
    options:
      - "Datos de capacitación"
      - "Sus principales factores"
      - "El nombre del algoritmo"
      - "Nada."
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-7"
    q: "Tasa de conversión por puntaje de banda escalada y luego planos por encima de 70. Esto significa la puntuación:"
    options:
      - "Funciona perfectamente."
      - "Separa mal de media y no dice nada sobre la parte superior, donde el equipo pasa su tiempo"
      - "Está invertido"
      - "Necesita más bandas"
    answer: 1
    topic: "einstein-discovery"
  - id: "einstein-discovery-graded-quiz-8"
    q: "La comparación esencial al auditar una puntuación es contra:"
    options:
      - "Un modelo más complejo"
      - "Una base de referencia trivial como un campo que ya tenía"
      - "Reclamación del vendedor"
      - "La puntuación del último trimestre"
    answer: 1
    topic: "einstein-discovery"
---

Cuestiones de práctica para Einstein Discovery Historia Diseño dominio del CRM Analytics y Einstein Discovery Examen de consultoría.
