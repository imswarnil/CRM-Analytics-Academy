---
title: "Como se calcula o LTV para uma piscina pré-paga, como os dias de assento na sala de aula?"
description: "Com cuidado, e eu mostraria dois números. A fórmula do livro didático divide ARPA vezes margem bruta por uma taxa churn, e assume que a receita por conta é estável..."
type: "conceptual"
topic: "demand-analytics"
level: "mid"
source: "academy"
---

Com cuidado, e eu mostraria dois números. A fórmula do livro didático divide a margem do ARPA vezes a margem bruta por uma taxa de churn, e assume que a receita por conta é estável e que o churn é um evento — nem é verdade para um pool pré-pago, onde uma conta renova para o que realmente usou e pode diminuir 40% sem nunca cancelar. Então eu publicaria esse número para os planos de assento onde é realmente válido, e rotularia-o como uma estimativa em outro lugar. A versão honesta é valor realizado pela coorte: contas de grupo por mês de inscrição, soma das receitas de cada coorte indexadas por meses desde a inscrição e parcela de receita cumulativa por coorte. Linhas que continuam escalando expansão média está superando a contração, que é o único fato mais importante sobre um negócio que vende em equipes e completamente invisível em uma taxa churn. A ressalva ao Estado é truncamento – uma coorte de três meses de idade tem três meses de receita contra um CAC completo, então coortes recentes sempre parecem ruins e devem ser apagadas em vez de comparadas.
