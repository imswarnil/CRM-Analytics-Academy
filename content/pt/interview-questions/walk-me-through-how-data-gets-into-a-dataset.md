---
title: "Explique-me como os dados entram num conjunto de dados."
description: "Cinco etapas. Uma conexão define a fonte. A sincronização de dados puxa os objetos selecionados e os campos selecionados para CRM Analytics' própria loja em um horário. Uma receita..."
type: "conceptual"
topic: "foundations"
level: "junior"
source: "academy"
---

Cinco etapas. Uma conexão define a fonte. A sincronização de dados puxa os objetos selecionados e os campos selecionados para CRM Analytics' própria loja em um horário. Uma receita as transforma — juntas, filtros, fórmulas, agregações — e escreve um conjunto de dados. O conjunto de dados é materializado e colunar, e as lentes e painéis lê-lo. Um agendamento movimenta sincronização e receitas. A falha sutil é agendar uma receita antes da sincronização que depende ter terminado: ela tem sucesso todas as noites usando os dados de ontem, e nunca erros.
