---
title: "Implementação do Painel de Análise — questões práticas"
domain: "dashboard-implementation"
quiz:
  - id: "saql-index-1"
    q: "SAQL's define a diferença de SQL é que:"
    options:
      - "Não tem funções agregadas"
      - "É uma transformação de fluxo — cada instrução transforma o resultado anterior, então ordem de instrução é o plano de consulta"
      - "Não é possível filtrar"
      - "Ele só lê um conjunto de dados"
    answer: 1
    topic: "saql"
  - id: "saql-index-2"
    q: "A maneira mais barata de aprender SAQL é:"
    options:
      - "Ler a referência da função fim a fim"
      - "Construindo um gráfico clicando e lendo a consulta gerada contra uma resposta que você já conhece"
      - "A gravar as consultas a partir do zero"
      - "Copiar exemplos de fóruns"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-1"
    q: "Como está? SAQL diferem mais importante de SQL?"
    options:
      - "Não é possível filtrar"
      - "É uma transformação de fluxo – cada instrução transforma o resultado do anterior, então a instrução ORDEM é o plano de consulta"
      - "Não tem funções agregadas"
      - "Só funciona num conjunto de dados"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-2"
    q: "Você quer a parte de cada segmento da receita total. Por que isso é estranho com cliques sozinho?"
    options:
      - "Percentagens não suportadas"
      - "Ele precisa de cada linha em comparação com um agregado de todas as linhas — dois níveis de agregação em uma consulta"
      - "Segmentos não podem ser agrupados"
      - "Não é estranho."
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-3"
    q: "Onde é que um filtro pertence a uma SAQL Questionar por melhor desempenho?"
    options:
      - "No final, após o agrupamento"
      - "O mais cedo possível, então menos dados flui através das seguintes declarações"
      - "Não importa."
      - "Dentro do foreach"
    answer: 1
    topic: "saql"
  - id: "saql-functions-1"
    q: "Para contar ofertas em um conjunto de dados em linha-item grão você usa:"
    options:
      - "count()"
      - "única('Oportunidade Id')"
      - "soma('Montante')"
      - "avg ()"
    answer: 1
    topic: "saql"
  - id: "saql-functions-2"
    q: "sum () sobre uma coluna que é 40% null retorna:"
    options:
      - "Nulo"
      - "A soma das linhas não nulas, sem indicação de que as demais foram ignoradas"
      - "Zero"
      - "Um erro"
    answer: 1
    topic: "saql"
  - id: "saql-functions-3"
    q: "Qual é a maneira segura de dividir dois agregados?"
    options:
      - "avg da relação por linha"
      - "soma( numerador) / soma(denominador), guardada contra um denominador zero"
      - "Qualquer um é equivalente"
      - "Divisão não é suportada"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-1"
    q: "Onde deve um filtro ir para o melhor desempenho?"
    options:
      - "Depois do grupo, então menos é filtrado"
      - "O mais cedo possível, então menos linhas fluim através de tudo depois dele"
      - "No fim"
      - "Ordem não faz diferença"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-2"
    q: "`filter q by 'Stage' != \"Closed Lost\"` também remove:"
    options:
      - "Nada mais."
      - "Cada linha onde o Estágio é nulo"
      - "Linhas ganhas fechadas"
      - "Linhas de outros conjuntos de dados"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-3"
    q: "Substituir um nulo por zero usando coalesce é:"
    options:
      - "Sempre seguro."
      - "Uma reivindicação — transforma 'desconhecido' em 'nenhum', que muda as médias e pode estar errada"
      - "Requerente antes da agregação"
      - "Apenas uma opção de exibição"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-1"
    q: "Para calcular a parte de cada segmento da receita da empresa que você precisa:"
    options:
      - "Um grupo por segmento"
      - "Valor de cada grupo em comparação com um agregado de TODAS as linhas — dois níveis de agregação"
      - "Um painel separado"
      - "Um eixo duplo"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-2"
    q: "Um total de execução em janela difere de uma soma simples porque:"
    options:
      - "É mais rápido."
      - "Ele se acumula através das linhas ordenadas em vez de colapsá-las para um valor"
      - "Ignora nulos"
      - "Requer dois conjuntos de dados"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-3"
    q: "Ranking reps dentro de cada região requer que a janela seja:"
    options:
      - "Por todas as linhas"
      - "Divididos por região, cada região classifica-se de 1 independentemente"
      - "Ordenado somente"
      - "Agrupado por representante"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-1"
    q: "Você precisa de uma métrica combinando dois conjuntos de dados em dez painéis. Onde pertence a combinação?"
    options:
      - "Em cada elemento SAQL"
      - "Em uma receita, então todos os dez concordam por construção e é calculado uma vez"
      - "Em uma planilha"
      - "No painel JSON"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-2"
    q: "Combinando dois fluxos em grãos diferentes em uma consulta produz:"
    options:
      - "Um erro"
      - "O mesmo fan-out que você obteria em uma receita — uma medida repetida em linhas correspondentes"
      - "Um resultado correto automaticamente"
      - "Apenas nulas"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-3"
    q: "Um bom uso de uma consulta de dois fluxos é:"
    options:
      - "Definição da receita da empresa"
      - "Uma comparação ad-hoc — reals contra uma pequena tabela-alvo — num único painel"
      - "Qualquer associação"
      - "Substituindo a camada de receita"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-1"
    q: "Uma consulta retorna um número que é muito alto por um múltiplo limpo. O suspeito é:"
    options:
      - "Um filtro"
      - "Uma combinação que multiplicou linhas, com uma medida somada após"
      - "A declaração da ordem"
      - "Um nulo"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-2"
    q: "A maneira mais rápida de entender uma consulta que retorna a coisa errada é:"
    options:
      - "Reescrever do zero"
      - "Corte-o de volta para a carga e adicione uma instrução de cada vez, verificando a contagem da linha após cada"
      - "Adicionar mais filtros"
      - "Mudar para um tipo de gráfico diferente"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-3"
    q: "Números que mudam entre corridas sem alteração de dados geralmente significam:"
    options:
      - "Um erro de cache"
      - "Um intervalo de datas relativo, ou uma janela sem ordenação explícita"
      - "Um problema de permissões"
      - "Um problema de renderização"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-1"
    q: "SAQL instruções executadas:"
    options:
      - "Numa ordem escolhida por um optimizador"
      - "Na ordem escrita — cada um transforma o resultado anterior"
      - "Em paralelo"
      - "Alfabeticamente"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-2"
    q: "Um filtro pertence:"
    options:
      - "Após o grupo"
      - "O mais cedo possível"
      - "Dentro de cada um deles"
      - "No fim"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-3"
    q: "No grão linha-item, os negócios são contados com:"
    options:
      - "count()"
      - "única('Oportunidade Id')"
      - "soma('Montante')"
      - "mediana ()"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-4"
    q: "sum () sobre uma coluna que é 40% null retorna:"
    options:
      - "Nulo"
      - "O total das linhas não nulas, sem indicação do restante foram ignorados"
      - "Zero"
      - "Um erro"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-5"
    q: "A taxa de desconto ponderada é:"
    options:
      - "avg( 'DiscountPct')"
      - "soma('Discount') / soma('ListTotal'), guardada contra zero"
      - "mediana('DescontaPct')"
      - "max('DescontaPct')"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-6"
    q: "`'Stage' != \"Closed Lost\"` também remove:"
    options:
      - "Nada mais."
      - "Linhas onde o Estágio é nulo"
      - "Linhas ganhas fechadas"
      - "Linhas de outros conjuntos de dados"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-7"
    q: "Os representantes de classificação dentro de cada região precisam da janela:"
    options:
      - "Por todas as linhas"
      - "Parte por região"
      - "Apenas ordenado"
      - "Agrupado por representante"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-8"
    q: "Um total em execução sem ordem explícita é:"
    options:
      - "Fine — indeniza-se a ordem"
      - "Um erro que está estável até à próxima actualização e depois discretamente diferente"
      - "Impossível de escrever"
      - "Ordenado automaticamente por data"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-9"
    q: "Dois conjuntos de dados precisam ser combinados para dez painéis. Isso pertence a:"
    options:
      - "Em cada elemento SAQL"
      - "Em uma receita"
      - "No painel JSON"
      - "Em uma planilha"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-10"
    q: "Um total elevado por um múltiplo limpo sugere:"
    options:
      - "Um problema nulo"
      - "Multiplicação de linha, com uma medida pai somada após ele"
      - "Um filtro"
      - "Um problema de renderização"
    answer: 1
    topic: "saql"
  - id: "interactions-index-1"
    q: "Dois widgets construídos no mesmo conjunto de dados. Por padrão, clicando em um:"
    options:
      - "Não faz nada ao outro"
      - "Filtra o outro — os widgets do mesmo conjunto de dados facetam-se automaticamente"
      - "Requer uma vinculação"
      - "Abre uma nova lente"
    answer: 1
    topic: "interactions"
  - id: "interactions-index-2"
    q: "A principal razão da interação é:"
    options:
      - "Parece impressionante."
      - "A maioria das pessoas nunca construirá uma lente, mas quase todos clicam em uma barra — a interação é como um painel responde a perguntas que você não previu"
      - "Melhora o desempenho"
      - "É necessário para compartilhar"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-1"
    q: "Dois widgets são construídos no mesmo conjunto de dados. Por padrão, clicando em um:"
    options:
      - "Não faz nada ao outro"
      - "Filtra o outro — eles se enfrentam automaticamente"
      - "Abre uma nova lente"
      - "Requer uma ligação para interagir"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-2"
    q: "Por que você deliberadamente viraria a faceta para um widget?"
    options:
      - "Melhorar o desempenho"
      - "Porque é uma referência — um total da empresa que deve ficar fixo enquanto tudo o resto filtra, para que o leitor possa ver a parte contra o todo"
      - "O rosto está sempre errado."
      - "Para ocultar dados"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-3"
    q: "Um visualizador filtra para uma região e um elemento fica em branco. A causa mais provável é:"
    options:
      - "Uma pesquisa quebrada"
      - "O conjunto de dados desse widget não tem linhas para essa região — um estado vazio honesto que precisa de uma etiqueta em vez de uma correção"
      - "A facetação está desactivada"
      - "Um predicado de segurança"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-1"
    q: "Um painel abre mostrando todas as regiões e todo o tempo. Para um director regional, isto significa:"
    options:
      - "Máxima flexibilidade"
      - "Os mesmos três cliques todas as manhãs antes da tela dizer qualquer coisa relevante"
      - "Carregamento mais rápido"
      - "Melhor segurança"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-2"
    q: "Depois de um visualizador clicar em um segmento, a tela é filtrada. A coisa mais importante a fornecer é:"
    options:
      - "Uma animação"
      - "Uma indicação visível da selecção actual e uma forma óbvia de a limpar"
      - "Uma dica"
      - "Um segundo gráfico"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-3"
    q: "Uma visão salva é:"
    options:
      - "Uma cópia do painel"
      - "Um estado lembrado — filtros e seleções — então alguém retorna à sua fatia sem clicar novamente"
      - "Um e- mail agendado"
      - "Uma configuração de permissão"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-1"
    q: "Um link de um painel de resumo para um detalhe permite que você:"
    options:
      - "Evite construir o resumo"
      - "Mantenha o resumo pequeno, porque o detalhe está a um clique de distância em vez de"
      - "Ignorar a segurança"
      - "Melhorar o desempenho da pesquisa"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-2"
    q: "O destino mais útil para uma broca de uma tabela de exceção é geralmente:"
    options:
      - "Estado de casa de um painel diferente"
      - "A Salesforce gravar para essa linha, onde o trabalho realmente acontece"
      - "Uma exportação de PDF"
      - "O conjunto de dados"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-3"
    q: "Um exercício que pousa num painel de detalhes não filtrado é:"
    options:
      - "Está bem."
      - "Uma broca quebrada — o ponto todo é que o destino herda o contexto de onde você clicou"
      - "Mais flexível"
      - "Mais rápido."
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-1"
    q: "Dois widgets no mesmo conjunto de dados. Clicando em um:"
    options:
      - "Não faz nada."
      - "Filtra o outro por padrão"
      - "Precisa de uma ligação"
      - "Abre uma lente"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-2"
    q: "Você desliga a facetação em um widget principalmente quando:"
    options:
      - "É lento."
      - "É uma referência que deve permanecer fixa enquanto tudo o resto filtra"
      - "É uma mesa"
      - "Não tem título"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-3"
    q: "Metade dos widgets respondem a um filtro e metade não. Isto é:"
    options:
      - "Normal"
      - "O estado perigoso — o ecrã é falso enquanto cada elemento está individualmente correcto"
      - "Um problema de cache"
      - "Um limite de licenciamento"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-4"
    q: "Um painel deve abrir:"
    options:
      - "Sem filtro, mostrando tudo"
      - "Quanto ao caso comum — período em curso, âmbito do espectador, ordenado e limitado"
      - "Num estado em branco"
      - "No ano passado"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-5"
    q: "Mostrando o mês atual parcial ao lado de meses completos:"
    options:
      - "É a visão mais atual"
      - "Fabrica um declínio aparente todos os meses, a menos que seja excluído ou marcado"
      - "Melhora a precisão"
      - "Não tem efeito"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-6"
    q: "Um painel filtrado deve indicar sua seleção porque:"
    options:
      - "Parece mais arrumado."
      - "Será fotografado, e o filtro é invisível na imagem"
      - "É necessário para enfrentar"
      - "Acelera as consultas"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-7"
    q: "Uma visão salva é mais valiosa para:"
    options:
      - "Administradores"
      - "Qualquer um cuja fatia é sempre a mesma, que de outra forma re-clique diariamente"
      - "Apenas utilizadores móveis"
      - "Exportar"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-8"
    q: "Uma perfuração que pousa num destino não filtrado:"
    options:
      - "Dá mais flexibilidade"
      - "É quebrado na prática — ele é clicado uma vez e então abandonado"
      - "Carrega mais rápido"
      - "É o padrão padrão"
    answer: 1
    topic: "interactions"
  - id: "bindings-index-1"
    q: "A diferença entre facetação e ligação é:"
    options:
      - "Não há nenhum"
      - "A facetação é automática entre widgets do mesmo conjunto de dados; uma ligação é uma fiação explícita que você configura"
      - "As ligações são mais rápidas"
      - "O rosto requer SAQL"
    answer: 1
    topic: "bindings"
  - id: "bindings-index-2"
    q: "A melhor primeira ligação a adicionar a qualquer painel é:"
    options:
      - "Visibilidade condicional do elemento"
      - "Um título dinâmico que indica a seleção atual"
      - "Uma corrente de filtro aninhada"
      - "Uma faceta entre dados"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-1"
    q: "O que é uma ligação?"
    options:
      - "Uma junção entre conjuntos de dados"
      - "Um elemento está a alimentar a consulta ou a exibição de outro elemento"
      - "Uma configuração de segurança"
      - "Um tipo de gráfico"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-2"
    q: "A melhor primeira utilização de uma ligação é geralmente:"
    options:
      - "Visibilidade condicional do elemento"
      - "Um título dinâmico que indica a seleção atual"
      - "Filtros dependentes aninhados"
      - "Faceamento entre dados"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-3"
    q: "O principal custo a longo prazo de um painel fortemente ligado é:"
    options:
      - "Desempenho da consulta"
      - "Ninguém pode mudá-lo com segurança — a lógica vive na configuração do widget que é difícil de ler e impossível de diff"
      - "Consumo de licenças"
      - "Memória do navegador"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-1"
    q: "O caso mais importante de uma ligação de selecção é:"
    options:
      - "Seleções múltiplas"
      - "Nada seleccionado — o que o elemento ligado faz quando a fonte está vazia"
      - "Consultas lentas"
      - "Contraste de cor"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-2"
    q: "Um filtro dependente (região estreita a lista de rep) vale a pena construir quando:"
    options:
      - "Sempre"
      - "A lista dependente é longa o suficiente para que a digitalização seja um custo real — quarenta representantes, não quatro"
      - "Nunca"
      - "Apenas para administradores"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-3"
    q: "Uma ligação dinâmica de título é valiosa principalmente porque:"
    options:
      - "Parece dinâmico"
      - "O estado do filtro do painel sobrevive a ser fotografado numa mensagem sem contexto"
      - "Melhora o desempenho"
      - "É necessário para enfrentar"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-1"
    q: "Uma vinculação de resultados diz:"
    options:
      - "O que o visualizador selecionou"
      - "Um valor retornado pela consulta de outro elemento"
      - "Os metadados do conjunto de dados"
      - "A URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-2"
    q: "O custo de desempenho de um resultado vinculativo é que:"
    options:
      - "Duplica o volume de dados"
      - "Ele cria uma ordem de execução — o widget dependente não pode começar até que a fonte tenha retornado"
      - "Desativa o cache"
      - "Não há nenhum"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-3"
    q: "Depurar uma ligação de resultados é mais difícil do que uma ligação de selecção porque:"
    options:
      - "A sintaxe é diferente"
      - "A entrada é invisível na tela — você tem que rastrear uma consulta ao invés de olhar para uma seleção"
      - "Não pode ser testado"
      - "Requer direitos de administração"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-1"
    q: "O principal risco de ligações de encadeamento A → B → C é:"
    options:
      - "Precisão dos dados"
      - "Execução sequencial e uma dependência que ninguém pode ver, então uma mudança para A quebra C por razões que são invisíveis"
      - "Custo da licença"
      - "Compatibilidade do navegador"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-2"
    q: "O sinal prático de que um painel tem muitas ligações é:"
    options:
      - "O tamanho do ficheiro"
      - "Alguém que não seja o seu autor não pode alterá-lo com segurança, então eles constroem um novo painel."
      - "O número de elementos"
      - "A renderização lenta sozinha"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-3"
    q: "A coisa mais barata que mantém um painel ligado é:"
    options:
      - "Menos elementos"
      - "Uma linha na descrição por ligação — o que alimenta o quê e por quê"
      - "Mais cores"
      - "Uma convenção de nomes para consultas"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-1"
    q: "Uma ligação difere da facetação porque:"
    options:
      - "É mais rápido."
      - "É uma fiação explícita que você configura, onde a facetação é automática entre widgets do mesmo conjunto de dados"
      - "Exige SAQL"
      - "Funciona através de orgs"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-2"
    q: "A melhor primeira ligação em qualquer painel é:"
    options:
      - "Visibilidade condicional"
      - "Um título dinâmico que carrega a seleção"
      - "Uma corrente de filtro aninhada"
      - "Alternar uma medida"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-3"
    q: "Uma vinculação de resultados diz:"
    options:
      - "A seleção do visualizador"
      - "Um valor retornado outra consulta"
      - "Metadados do conjunto de dados"
      - "A página URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-4"
    q: "A vinculação de resultados torna os painéis lentos porque eles:"
    options:
      - "Aumentar o volume de dados"
      - "Serialise execução — o widget dependente espera pela fonte"
      - "Desabilitar cache"
      - "Forçar uma atualização completa"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-5"
    q: "A caixa de borda que deve ser sempre definida é:"
    options:
      - "Muitas filas"
      - "Nada selecionado"
      - "Uma rede lenta"
      - "Uma tela pequena"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-6"
    q: "Um filtro dependente em que o representante previamente escolhido deixe de estar no âmbito de aplicação deve:"
    options:
      - "Continuar a filtrar para esse representante"
      - "Limpar a seleção antiga"
      - "Mostrar um erro"
      - "Reler a página"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-7"
    q: "Cinco widgets ligados a um filtro, versus três ligados em uma cadeia. O que é mais sustentável?"
    options:
      - "A cadeia — menos ligações"
      - "Os cinco — largura é previsível, profundidade não é"
      - "Eles são equivalentes"
      - "Nem é mantendível"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-8"
    q: "Uma métrica da empresa calculada por uma vinculação de resultados em cada carga deve em vez disso:"
    options:
      - "Esteja em cache no navegador"
      - "Ser calculado uma vez na receita e armazenado como um campo"
      - "Ser digitado como uma constante"
      - "Ser removido"
    answer: 1
    topic: "bindings"
  - id: "dashboard-json-index-1"
    q: "A melhor razão para editar o painel JSON directamente é:"
    options:
      - "É mais rápido do que o construtor para o trabalho diário"
      - "Mudanças em massa e repetitivas o construtor faz você fazer um widget de cada vez"
      - "Ele desbloqueia tipos de gráficos ocultos"
      - "Ele ignora a segurança"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-index-2"
    q: "Um painel JSON é útil na revisão porque:"
    options:
      - "Ele renderiza no navegador"
      - "É texto — diffs, então uma mudança é reviewable em vez de descrito em uma reunião"
      - "É menor que o painel"
      - "Contém os dados"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-1"
    q: "Em um documento de painel, um 'passo' é:"
    options:
      - "Uma página de assistentes"
      - "Uma definição de pesquisa — os dados de que um widget tira"
      - "Um ponto de interrupção da disposição"
      - "Uma permissão"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-2"
    q: "Vários widgets mostram a mesma medida cortada de forma diferente. Idealmente eles:"
    options:
      - "Cada um define o seu próprio passo"
      - "Compartilhe um passo, porque o número de consultas distintas é a principal alavanca no tempo de carga"
      - "Usar conjuntos de dados separados"
      - "São mesclados em um único elemento"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-3"
    q: "Widgets e layouts são separados porque:"
    options:
      - "Acidente histórico"
      - "Um widget é o que é desenhado; um layout é onde ele fica - para que um widget possa ser colocado de forma diferente em diferentes tamanhos de tela"
      - "As disposições armazenam os dados"
      - "Os elementos não podem ser posicionados"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-1"
    q: "Um passo com escrita à mão SAQL em vez de uma definição clicada é:"
    options:
      - "Inválido"
      - "Fine, e mais difícil para o construtor de ida e volta - a interface pode não ser capaz de re-editar visualmente"
      - "Mais rápido."
      - "Compartilhado automaticamente"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-2"
    q: "Um passo estático é usado para:"
    options:
      - "Caching resultados da pesquisa"
      - "Uma lista fixa de valores — opções comutadoras, limiares — que não é consultada a partir de um conjunto de dados"
      - "Regras de segurança"
      - "Definições de disposição"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-3"
    q: "A alavanca principal no tempo de carga do painel, visível no JSON, é:"
    options:
      - "O número de elementos"
      - "O número de passos distintos — widgets que poderiam compartilhar uma consulta, mas cada um define o seu próprio"
      - "O tamanho do ficheiro"
      - "O número de layouts"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-1"
    q: "Um widget parece certo no desktop e errado em um telefone. O problema está em:"
    options:
      - "O passo"
      - "Um layout — posição e tamanho são definidos por ponto de interrupção, separadamente do widget"
      - "O conjunto de dados"
      - "Predicação da segurança"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-2"
    q: "Editar as propriedades do elemento como texto é mais útil para:"
    options:
      - "Construindo um novo painel"
      - "Aplicando a mesma mudança de formatação em muitos widgets ao mesmo tempo"
      - "Alterar o conjunto de dados"
      - "Adicionando segurança"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-1"
    q: "Antes de editar manualmente um painel você deve:"
    options:
      - "Limpar a 'cache'"
      - "Exportar uma cópia — a história de desfazer é qualquer coisa que tenha gravado antes"
      - "Notificar todos os espectadores"
      - "Desactivar o calendário"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-2"
    q: "O principal benefício da governança de manter o painel JSON num repositório é:"
    options:
      - "Carregamento mais rápido"
      - "Uma mudança torna-se um diff reviewable em vez de uma frase em uma reunião"
      - "Melhor segurança"
      - "Tamanho do arquivo menor"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-3"
    q: "Após uma edição manual, o teste de ida e volta é:"
    options:
      - "A verificação dos dados está correcta"
      - "Recarregando no construtor para confirmar ainda abre e ainda edita visualmente"
      - "A executar a receita"
      - "Limpando seleções"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-1"
    q: "Um passo em um documento de painel é:"
    options:
      - "Uma página de assistentes"
      - "Uma definição de pesquisa nomeada"
      - "Um ponto de interrupção da disposição"
      - "Uma regra de partilha"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-2"
    q: "Widgets referenciam seus dados por:"
    options:
      - "Contendo o SAQL em linha"
      - "Nomeando um passo"
      - "Apontando para um id de conjunto de dados"
      - "Herdando da disposição"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-3"
    q: "Um painel só parece errado nos telefones. Veja em:"
    options:
      - "O passo"
      - "As disposições"
      - "O conjunto de dados"
      - "O predicado"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-4"
    q: "Onze passos para doze widgets sugerem:"
    options:
      - "Boa separação"
      - "Quase nada é compartilhado, e a tela está fazendo onze viagens redondas"
      - "Um arquivo corrompido"
      - "Poucos elementos"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-5"
    q: "A maneira mais rápida de encontrar cada ligação em um painel herdado é:"
    options:
      - "Abrir o painel de cada elemento"
      - "Pesquisar o JSON para a sintaxe de ligação"
      - "Perguntar ao autor"
      - "Verificar o conjunto de dados"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-6"
    q: "Antes de editar à mão, deve sempre:"
    options:
      - "Limpar as seleções"
      - "Exportar uma cópia"
      - "Pausar a programação"
      - "Notificar os visualizadores"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-7"
    q: "O ensaio de ida e volta verifica se:"
    options:
      - "Os dados são precisos"
      - "O construtor ainda pode abrir e editar visualmente o painel após sua edição"
      - "O arquivo é pequeno"
      - "A segurança ainda se aplica"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-8"
    q: "Que mudança é melhor deixada para o construtor em vez de feito como texto?"
    options:
      - "Renomeando um campo entre widgets"
      - "Adicionando ou removendo um widget, porque ele deve ser consistente em cada layout"
      - "Mudando um formato de número"
      - "Editar um título"
    answer: 1
    topic: "dashboard-json"
---

Perguntas práticas para o domínio de Implementação do Painel de Análise CRM Analytics e Einstein Discovery Exame de consulta.
