---
title: "Quando serias modelo longo em vez de largo?"
description: "Quando as métricas são adicionadas frequentemente, ou quando eu quero um widget para mapear qualquer um deles através de um filtro — novas métricas se tornam novas linhas em vez de uma mudança de esquema e um..."
type: "conceptual"
topic: "datasets-and-modelling"
level: "junior"
source: "academy"
---

Quando métricas são adicionadas frequentemente, ou quando eu quero um widget para mapear qualquer um deles através de um filtro — novas métricas se tornam novas linhas em vez de uma mudança de esquema e uma reconstrução. O custo é que cada consulta deve filtrar para uma métrica, e uma consulta que se esquece adiciona receita para lidar contagem à taxa de conversão e retorna um número sem erro. Então se eu modelar longo, o filtro métrico vai para a consulta base em vez de ser deixado para cada construtor para lembrar.
