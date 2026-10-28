---
title: "Selecção vinculativa ou resultados vinculativos — qual é a diferença prática?"
description: "Uma ligação de seleção lê o que alguém clicou, de modo que a entrada é visível na tela e é depurada olhando. Uma ligação de resultados lê um valor..."
type: "technical"
topic: "bindings"
level: "junior"
source: "academy"
---

Uma ligação de seleção lê o que alguém clicou, de modo que a entrada é visível na tela e é depurada olhando. Uma vinculação de resultados lê um valor outra consulta retornada — uma média da empresa, um máximo, uma categoria de topo — que é mais poderosa e muito mais difícil de depurar, porque a entrada é invisível. Ele também cria uma ordem de execução: o widget dependente não pode começar até que a fonte retorne, então duas consultas paralelas se tornam duas sequenciais.
