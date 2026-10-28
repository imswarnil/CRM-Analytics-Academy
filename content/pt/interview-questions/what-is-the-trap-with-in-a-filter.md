---
title: "Qual é a armadilha com `!=` Num filtro?"
description: "Também deixa nulas. O estágio de filtragem não igual ao Lost Fechado também remove todas as linhas onde o estágio está em branco — muitas vezes as linhas com um problema de qualidade de dados..."
type: "conceptual"
topic: "saql"
level: "junior"
source: "academy"
---

Também deixa nulas. O estágio de filtragem não é igual ao Lost Fechado também remove todas as linhas onde o estágio está em branco — muitas vezes as linhas com um problema de qualidade de dados que vale a pena ver. Nada de erros, o total cai. Se eu quero dizer 'tudo, exceto X, incluindo desconhecidos' eu escrevo isso explicitamente.
