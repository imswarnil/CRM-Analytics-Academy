---
title: "Alguém disse que o conjunto de dados tem duplicatas. O que fazes?"
description: "Descobre quais das três coisas significam. Normalmente é um artefato de junção — linhas multiplicadas por uma junta de um a muitos, onde os registros estão bem e a consulta..."
type: "conceptual"
topic: "data-preparation"
level: "junior"
source: "academy"
---

Descobre quais das três coisas significam. Geralmente é um artefato de junção — linhas multiplicadas por uma junta de um a muitos, onde os registros são bons e a consulta está errada, e a correção é a junta em vez de uma etapa de desduplicação. Às vezes é o grão pretendido, como uma conta aparecendo uma vez por mês em um instantâneo. Apenas ocasionalmente são registros duplicados genuínos. Excluindo linhas para corrigir um fã-out diminui o total para que pareça que funcionou, enquanto removendo dados reais e deixando a má junção no lugar para a próxima medida para bater.
