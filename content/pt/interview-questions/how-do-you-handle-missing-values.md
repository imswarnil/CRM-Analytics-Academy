---
title: "Como lida com valores em falta?"
description: "Primeiro, decidindo se o em branco significa \"nenhum\" ou \"desconhecido\", porque cada preenchimento é uma reivindicação – zero afirma nenhuma, a média afirma típico. Se eu preencher..."
type: "behavioral"
topic: "data-preparation"
level: "junior"
source: "academy"
---

Primeiro, decidindo se o em branco significa "nenhum" ou "desconhecido", porque cada preenchimento é uma reivindicação – zero afirma nenhuma, a média afirma típico. Se eu preencher, eu mantenho uma coluna bandeira dizendo que eu fiz, para que qualquer um pode excluir linhas imputadas mais tarde e pode dizer que números eram reais. E eu nunca analiso um valor imputado contra o que foi imputado, porque eu encontraria o padrão que eu coloquei lá. Às vezes, a falta é o sinal: nosso campo econômico-comprador em branco prediz perder, não porque causa qualquer coisa, mas porque um representante desengatado não preenche campos — genuinamente preditivo e completamente inacionável.
