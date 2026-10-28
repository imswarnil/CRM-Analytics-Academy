---
title: "Como você conta ofertas em um conjunto de dados unidos a itens de linha?"
description: "único na chave da oportunidade, não contar. Contagem de linhas no grão atual, por isso no grão linha-item conta linhas — 1.192 em vez de 608 em nossa..."
type: "conceptual"
topic: "saql"
level: "junior"
source: "academy"
---

unique() na chave de oportunidade, não count(). count() conta linhas no grão atual, então no grão linha-item conta linhas — 1.192 ao invés de 608 em nossos dados. É o problema do grão usando roupas de uma função, e eu verifico o resultado com um número que eu já conheço.
