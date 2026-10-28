---
title: "Relatórios de marketing 1.783 MQLs, relatórios de vendas 1.240. Qual deles está errado?"
description: "Provavelmente nenhum dos dois. Essa lacuna é quase sempre uma diferença de definição em vez de um erro de cálculo, e a causa mais comum é o campo de data:..."
type: "conceptual"
topic: "gtm-engineering"
level: "mid"
source: "academy"
---

Provavelmente nenhum dos dois. Essa lacuna é quase sempre uma diferença de definição em vez de um erro de computação, e a causa mais comum é o campo de data: marketing conta até a data em que o lead foi criado, vendas conta até a data em que foi qualificado, e com um atraso de até três semanas os baldes mensais nunca concordam. Outros candidatos são se os leads desqualificados são excluídos, se os auto-servidores contam, e se um lado está deduplicando pela empresa. Meu movimento não é encontrar o erro, mas colocar ambas as definições lado a lado, indicar qual campo de data e que filtros cada usa, e perguntar ao negócio qual vai no baralho de tabuleiro. Isso o converte de um problema de dados em uma decisão de negócios, que é onde ele pertence — e então eu escrevo a definição escolhida na face do painel para que ele não volte.
