---
title: "Como está? SAQL diferir de SQL?"
description: "É uma transformação de fluxo em vez de uma consulta declarativa. Cada instrução pega o resultado anterior e transforma-o, reatribuindo a mesma variável,..."
type: "technical"
topic: "saql"
level: "junior"
source: "academy"
---

É uma transformação de fluxo em vez de uma consulta declarativa. Cada instrução pega o resultado anterior e o transforma, reatribuindo a mesma variável, então ordem de instrução é literalmente o plano que corre — não há um otimizador reordenando-o. Praticamente isso significa filtrar mais cedo do que tarde, porque filtrar depois de um grupo significa agregar linhas que eu estava prestes a descartar. A outra diferença que morde é citar: aspas simples para nomes de campos, aspas duplas para valores de string.
