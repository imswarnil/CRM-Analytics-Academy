---
title: "Por que você construiria um conjunto de dados instantâneo?"
description: "Porque... Salesforce os objetos possuem apenas o estado atual. Uma oportunidade sabe a quantidade e o palco de hoje e nada sobre Março, então o movimento do oleoduto, escorregou..."
type: "conceptual"
topic: "datasets-and-modelling"
level: "junior"
source: "academy"
---

Porque... Salesforce os objetos possuem apenas o estado atual. Uma oportunidade sabe a quantidade e o palco de hoje e nada sobre março, então o movimento do oleoduto, negócios deslizados, precisão de previsão e uma cachoeira de ARR não podem ser respondidos a partir do objeto. Um instantâneo adiciona o estado atual cada execução e acumula o histórico que não pode ser reconstruído depois — e é também por isso que eu configurei as datas de início e sincronização, proprietários, estágios e quantidades generosamente desde o início. Um campo adicionado em março não tem valores de fevereiro, permanentemente.
