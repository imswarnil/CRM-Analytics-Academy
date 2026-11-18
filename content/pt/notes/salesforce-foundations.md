---
title: "Salesforce Fundações — notas"
description: "Objetos, campos, relacionamentos e conversão de lead em uma página: o modelo de dados a cada CRM Analytics O painel foi construído."
section: "salesforce-foundations"
lessons: 1
---

## 1 · Objetos são tabelas

**Objecto** = um quadro · **registro** = uma linha · **campo** = uma coluna.

- Objetos padrão navio com Salesforce: Liderar, Conta, Contato, Oportunidade, Campanha, Caso
- Os objectos personalizados terminam em `__c` (p. ex. `Subscription__c`)

| Objecto | Um disco é... |
|---|---|
| Chumbo | uma pessoa, ainda não qualificada |
| Conta | uma empresa |
| Contacto | uma pessoa numa conta |
| Oportunidade | um acordo, com quantidade + fase |

## 2 · Os tipos de campo decidem o que um gráfico pode fazer

- **Dimensões** — texto, listas de selecção → grupo e filtro
- **Medidas** — números, moeda → soma, média, contagem
- **Tâmaras** — colocar um eixo temporal, comparar períodos

> Cuidado: um campo "receita" armazenado como texto não pode ser somado. Verifique o tipo primeiro!

## 3 · Relações

- **Procurar** — solto. A criança pode viver sozinha, tem a sua própria partilha. *Oportunidade → Campanha*
- **Master-detail** - apertado. A criança morre com o pai, herda a partilha, o pai recebe resumos
- **Muitos para muitos** — necessita de um objecto de junção. *Oportunidade ↔ Contato* através **Papel de contato da oportunidade**

## 4 · Conversão de chumbo

::hand-chart{type="flow" title="One Lead, three records"}
---
labels:
  - "Chumbo"
  - "Conta"
  - "Contacto"
  - "Oportunidade"
---
::

O Lead convertido mantém `ConvertedAccountId`, `ConvertedContactId`, `ConvertedOpportunityId` → isto é o que faz **análise de funil** possível.

## 5 · IDs, nunca nomes

- 15 caracteres (sensíveis a casos) ou **18** (sensível ao caso)
- Primeiro 3 = o objeto: `001` Conta · `003` Contacto · `006` Oportunidade · `00Q` Chumbo
- Cada receita junta-se a uma **ID** — repetir e alterar os nomes

## 6 · Como CRM Analytics lê- o

::hand-chart{type="flow" title="Objects to dashboard"}
---
labels:
  - "Objectos"
  - "Sincronização de Dados"
  - "Receitas"
  - "Conjunto de dados"
  - "Painel"
---
::

Consulta de painéis **conjuntos de dados**, nunca se opõe diretamente. Escolha o **grãos** primeira: uma linha por oportunidade, por conta ou por lead.
