---
title: "Uma consulta retorna um número que é muito alto. Explica-me."
description: "Recorte para trás para a carga e verifique a contagem da linha contra o que o conjunto de dados deve segurar, em seguida, adicione uma instrução de cada vez, verificando a contagem após cada..."
type: "technical"
topic: "saql"
level: "junior"
source: "academy"
---

Recorte para a carga e verifique a contagem da linha de acordo com o que o conjunto de dados deve conter e, em seguida, adicione uma instrução de cada vez, verificando a contagem após cada uma — a instrução onde ela deixa de fazer sentido é aquela com o bug. Em seguida, estreitar para uma única conta onde eu posso contar à mão, porque um agregado não pode me dizer qual lado multiplicou. Um múltiplo limpo é multiplicação de linhas com uma medida pai somada após ele; ligeiramente alto é um fã-out parcial; muito baixo é geralmente um filtro que também exclui nulos.
