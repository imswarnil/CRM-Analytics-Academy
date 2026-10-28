---
title: "Você junta uma tabela de conta a uma tabela de uso mensal e a receita lê dez vezes mais alto. O que aconteceu?"
description: "Espalhem-se. A tabela de contas é uma linha por conta e a tabela de uso é uma linha por conta por produto por mês, então, após a junção cada conta aparece..."
type: "scenario"
topic: "gtm-engineering"
level: "mid"
source: "academy"
---

Espalhem-se. A tabela de contas é uma linha por conta e a tabela de uso é uma linha por conta por produto por mês, então após a entrada cada conta aparece uma vez por linha de uso — até 54 vezes para uma conta com três produtos ao longo de dezoito meses. A coluna ARR não está errada em nenhuma linha individual, é repetida, e somando-a multiplica. A fixação consiste em agregar o lado de utilização para contabilizar primeiro o grão — receita facturada soma, utilização média, tomar o último estado de autorização — e, em seguida, juntar-se, o que mantém a produção em uma linha por conta. O hábito que o pega é afirmar a contagem da linha depois de cada junção: se o conjunto de dados da conta não sair com o número de contas que eu comecei, eu divulguei. Também mantenho alguns totais de âncora memorizados para que um número absurdo seja óbvio num relance.
