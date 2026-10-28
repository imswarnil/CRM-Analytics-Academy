---
title: "Por que um predicado de hierarquia precisa de um nó achatado?"
description: "Porque um predicado é uma comparação e uma hierarquia é uma árvore, e uma comparação não pode andar uma árvore no momento da consulta. O nó achatado pré-computa cada papel..."
type: "conceptual"
topic: "setup"
level: "senior"
source: "academy"
---

Porque um predicado é uma comparação e uma hierarquia é uma árvore, e uma comparação não pode andar uma árvore no momento da consulta. O nó achatado pré-computa a ancestralidade de cada papel em uma coluna de caminho na hora da receita, e o predicado pergunta se o papel do espectador aparece nesse caminho. É também o motivo concreto de segurança tem que ser projetado antes do modelo de dados: a regra precisa de uma coluna, a coluna precisa de um nó de receita, e o nó precisa de campos que devem ser sincronizados.
