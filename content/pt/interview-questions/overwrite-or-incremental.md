---
title: "Sobrescrever ou incremental?"
description: "Sobrescrever até que o volume o torne errado. É autocorreção — uma corrida ruim é fixada pela próxima boa — não precisa de chave e não pode derivar. Incremental..."
type: "conceptual"
topic: "apis-and-automation"
level: "senior"
source: "academy"
---

Sobrescrever até que o volume o torne errado. É autocorreção — uma corrida ruim é fixada pela próxima boa — não precisa de chave e não pode derivar. Incremental upsert é necessário em escala e deriva silenciosamente quando uma mudança é perdida: nada erros, o conjunto de dados está apenas ligeiramente errado indefinidamente. Então se eu for incremental eu adiciono uma reconciliação completa periódica, caso contrário eu troquei um custo visível por um invisível.
