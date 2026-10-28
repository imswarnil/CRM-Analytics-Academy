---
title: "Um painel é lento de uma forma que sua contagem de widgets não explica. O que verificas?"
description: "Encadernação dos resultados. Cada um serializa o que de outra forma seria executado em paralelo, então três em uma cadeia significa que o último widget espera em duas viagens redondas...."
type: "scenario"
topic: "bindings"
level: "junior"
source: "academy"
---

Encadernação dos resultados. Cada um serializa o que seria executado em paralelo, então três em uma cadeia significa que o último widget espera em duas viagens redondas. Nada no ecrã sugere que a dependência exista. Depois disso, eu verifico se widgets que poderiam compartilhar uma consulta cada um tem o seu próprio, e se alguma coisa está agregando um grão muito fino em cada carga.
