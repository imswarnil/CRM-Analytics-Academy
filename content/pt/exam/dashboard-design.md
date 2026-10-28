---
title: "Desenho do Painel de Análise — perguntas práticas"
domain: "dashboard-design"
quiz:
  - id: "data-visualization-index-1"
    q: "Qual é a primeira pergunta a fazer antes de escolher um tipo de gráfico?"
    options:
      - "Que tipo fica melhor nas cores da marca?"
      - "Que comparação é suposto o leitor fazer?"
      - "Quantas linhas estão no conjunto de dados?"
      - "Que tipos fazem CRM Analytics Apoio?"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-index-2"
    q: "Um gráfico de barras ordenado alfabeticamente em vez de pelo valor principalmente:"
    options:
      - "Declive mais rápido"
      - "Esconde a classificação, que é normalmente a razão pela qual alguém desenhou um gráfico de barras"
      - "É mais preciso"
      - "Não faz diferença."
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-1"
    q: "Você tem uma dimensão com 40 categorias e uma medida. A melhor escolha é:"
    options:
      - "Um gráfico de tartes"
      - "Um gráfico de barras horizontal do topo N, com o limite no título"
      - "Um gráfico de linhas"
      - "Um gráfico de dispersão"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-2"
    q: "Duas medidas, e você quer saber se eles se movem juntos. O gráfico é:"
    options:
      - "Um gráfico de linha de eixo duplo"
      - "Um gráfico de dispersão, uma medida por eixo"
      - "Dois gráficos de barras separados"
      - "Uma coluna empilhada"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-3"
    q: "Por que a horizontal geralmente é melhor do que a vertical para as barras categóricas?"
    options:
      - "Torna-se mais rápido"
      - "Os nomes das categorias são palavras, e as palavras lidas ao longo de um eixo horizontal em vez de giradas sob uma coluna"
      - "Barras verticais estão desactualizadas"
      - "Usa menos espaço"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-1"
    q: "Quando um gráfico de coluna (vertical) deve bater uma barra (horizontal) uma?"
    options:
      - "Sempre — vertical é padrão"
      - "Quando as categorias são ordenadas períodos, como meses, que os leitores esperam correr da esquerda para a direita"
      - "Quando existem muitas categorias"
      - "Quando os rótulos são longos"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-2"
    q: "Agrupado ou empilhado, quando o leitor precisa comparar cada subcategoria entre grupos?"
    options:
      - "Empilhado — mostra totais"
      - "Agrupado — apenas o segmento inferior de uma pilha compartilha uma linha de base, então as outras não podem ser comparadas por olho"
      - "Ambos funcionam igualmente"
      - "Nenhum dos dois; use uma torta"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-3"
    q: "O eixo de um gráfico de barras começa em 40 ao invés de 0. Isto é:"
    options:
      - "Bons e normais"
      - "Desencaminhar para barras — comprimento da barra É a codificação, então um eixo truncado equivoca a relação entre barras"
      - "Necessário para leitura"
      - "Apenas um problema na impressão"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-1"
    q: "Um gráfico de dois eixos mostra receita e cruzamento de cabeça em junho. O que significa a travessia?"
    options:
      - "Receitas ultrapassadas"
      - "Nada — o ponto de passagem é decidido por onde você definir os dois eixos, não pelos dados"
      - "Eles estão correlacionados"
      - "Junho foi o mês de intervalo"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-2"
    q: "O seu conjunto de dados não tem linhas durante um mês sem actividade. O gráfico de linhas deve:"
    options:
      - "Junte-se diretamente ao longo da lacuna"
      - "Mostrar zero se zero é verdadeiro, e uma quebra se o valor é genuinamente desconhecido — significam coisas diferentes"
      - "Esconder o mês"
      - "Interpolar a média"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-3"
    q: "Quantas séries um gráfico de linhas pode carregar antes de parar de funcionar?"
    options:
      - "Uma"
      - "Cerca de quatro, e só se forem separáveis por cor e forma"
      - "Dez"
      - "Ilimitado com uma lenda"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-1"
    q: "Quantas fatias pode um donut carregar antes que os leitores deixem de ser capazes de compará-los?"
    options:
      - "Cerca de três ou quatro."
      - "Cerca de dez."
      - "Vinte com rótulos"
      - "Não há limite"
    answer: 0
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-2"
    q: "Uma barra 100% empilhada ao longo do tempo é melhor em mostrar:"
    options:
      - "Crescimento absoluto"
      - "Se o MIX mudou — ao custo de esconder o tamanho inteiramente"
      - "Valores individuais"
      - "Outros"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-3"
    q: "Dados de composição em que as percentagens exactas de matéria são normalmente mais indicadas como:"
    options:
      - "Um donut"
      - "Uma tabela ordenada com uma coluna de partilha"
      - "Um mapa em árvore"
      - "Um medidor"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-1"
    q: "A utilização da empresa é de 88%. Porque é que isso é potencialmente inútil?"
    options:
      - "É muito preciso."
      - "Pode ser a média das contas em 30% e em 140%, que necessitam de ações opostas e são ambas invisíveis nele"
      - "Percentagens não podem ser médias"
      - "Deve ser uma mediana"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-2"
    q: "Um gráfico de dispersão responde à pergunta que nenhum gráfico de barras pode?"
    options:
      - "Qual é a categoria maior"
      - "Se duas medidas se movem juntas, em muitas entidades ao mesmo tempo"
      - "Como algo mudou com o tempo"
      - "O que partilha cada parte é"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-3"
    q: "A terceira medida de um gráfico de bolhas é codificada como:"
    options:
      - "Cor"
      - "Área da bolha"
      - "Posição num terceiro eixo"
      - "Tamanho da etiqueta"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-1"
    q: "O que faz um KPI Número acionável?"
    options:
      - "Uma fonte maior"
      - "Uma comparação e uma direcção — contra plano ou último período, com uma seta"
      - "Um símbolo de moeda"
      - "Um fundo colorido"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-2"
    q: "Um medidor é uma boa escolha quando:"
    options:
      - "Qualquer número único é mostrado"
      - "Existe um verdadeiro objectivo fixo e a questão é: \"Quão perto estamos?\""
      - "O número é uma percentagem"
      - "O espaço é limitado"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-3"
    q: "A vingança da CAC caiu de 15,3 para 14,2 meses. A seta deve ser:"
    options:
      - "Para baixo e vermelho"
      - "Para baixo e verde — a bondade é uma propriedade da métrica, não a direção"
      - "Para cima e verde"
      - "Sem seta"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-1"
    q: "Quando é que uma mesa bate um gráfico?"
    options:
      - "Nunca"
      - "Quando a identidade de cada linha importa — que conta, que negocia — ou os valores exatos"
      - "Quando há mais de 20 linhas"
      - "Quando os dados são texto"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-2"
    q: "Uma tabela com uma barra de rolagem em um painel geralmente significa:"
    options:
      - "Boa densidade de informação"
      - "Tornou-se uma exportação de dados em vez de um widget de painel"
      - "As linhas precisam ser ordenadas"
      - "A fonte é muito grande"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-3"
    q: "Os números de uma tabela devem ser:"
    options:
      - "Alinhado à esquerda com o texto"
      - "Alinhado à direita com decimais consistentes, por isso as magnitudes são comparáveis num relance"
      - "Centrado"
      - "Corado pelo valor"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-1"
    q: "Você tem receitas para seis regiões de vendas. Um mapa é o mapa certo?"
    options:
      - "Sim — as regiões são geográficas"
      - "Normalmente não — com seis categorias uma barra ordenada classifica-os precisamente, onde um mapa faz o leitor estimar cores"
      - "Sim, se as cores estiverem acessíveis"
      - "Só com uma lenda"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-2"
    q: "Um choro de receita bruta por país mostra principalmente:"
    options:
      - "Onde seu produto funciona melhor"
      - "Onde estão a maioria das pessoas e as maiores economias"
      - "Parte de mercado"
      - "Crescimento"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-3"
    q: "A solução habitual para isso é:"
    options:
      - "Uma escala de cores diferente"
      - "Normalização — Receitas por conta, per capita ou contra a dimensão do mercado"
      - "Remoção de pequenos países"
      - "Usando um mapa de bolhas"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-1"
    q: "Um funil abrange 2,1 milhões de sessões até 506 oportunidades em escala linear. O que acontece?"
    options:
      - "Ele lê claramente"
      - "Cada etapa após a segunda é um canhoto, e os estágios que mais importam tornam-se invisíveis"
      - "Erros nos gráficos"
      - "As percentagens estão erradas"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-2"
    q: "Um gráfico em cascata é para:"
    options:
      - "Categorias de classificação"
      - "Mostrando como uma série de adições e subtrações fica de um total para outro"
      - "Comparação de duas medidas"
      - "Dados geográficos"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-3"
    q: "As etapas do funil devem ser ordenadas:"
    options:
      - "Por tamanho"
      - "Em ordem de processo"
      - "Alfabeticamente"
      - "Por taxa de conversão"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-1"
    q: "Qual é o teste confiável para se um gráfico é honesto?"
    options:
      - "Cada número está correto."
      - "O que um leitor conclui em quatro segundos é verdade"
      - "Usa a paleta da marca"
      - "Tem uma lenda"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-2"
    q: "Truncando o eixo y é defensável em um gráfico de linha de retenção, mas não em um gráfico de barras. Porquê?"
    options:
      - "Bares são tecnologia mais antiga"
      - "Comprimento da barra É a codificação, então truncamento equivoca a relação entre barras; uma linha codifica inclinação"
      - "As linhas não podem mostrar valores pequenos"
      - "Nunca é defensável"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-3"
    q: "O gráfico desonesto mais comum em relatórios de negócios é:"
    options:
      - "Uma torta 3D"
      - "Um total bruto que precisava de um denominador — conta onde uma taxa era a questão"
      - "Uma escala de log"
      - "Um eixo duplo"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-1"
    q: "A primeira questão antes de escolher um tipo de gráfico é:"
    options:
      - "Quantas filas há?"
      - "Que comparação deve o leitor fazer"
      - "Quais cores estão disponíveis"
      - "Que tipos CRM Analytics suportes"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-2"
    q: "Um gráfico categórico de barras deve normalmente ser classificado:"
    options:
      - "Alfabeticamente"
      - "Descendo pela medida"
      - "Pelo ID da dimensão"
      - "Aleatoriamente"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-3"
    q: "Agrupado em vez de barras empilhadas, quando o leitor deve comparar subcategorias entre grupos, porque:"
    options:
      - "As pilhas são mais difíceis de colorir"
      - "Somente o segmento inferior de uma pilha compartilha uma linha de base, de modo que o resto não pode ser comparado por olho"
      - "As barras agrupadas são mais estreitas"
      - "As pilhas não podem mostrar os totais"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-4"
    q: "Um donut deixa de funcionar com:"
    options:
      - "Duas fatias"
      - "Quatro fatias"
      - "Dez fatias"
      - "Vinte fatias"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-5"
    q: "Que pergunta pode apenas um gráfico de dispersão responder?"
    options:
      - "Qual é a categoria maior"
      - "Se duas medidas se movem juntas em muitas entidades"
      - "Como um valor mudou ao longo do tempo"
      - "O que cada parte contribui"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-6"
    q: "A KPI número torna-se acionável quando carrega:"
    options:
      - "Uma fonte maior"
      - "Uma comparação e uma direcção"
      - "Um símbolo de moeda"
      - "Um fundo colorido"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-7"
    q: "A queda da vingança do CAC deve ser demonstrada como:"
    options:
      - "Uma seta para baixo vermelha"
      - "Uma seta verde para baixo — a bondade pertence à métrica, não à direção"
      - "Sem seta"
      - "Uma seta para cima"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-8"
    q: "Um funil de 2,1 milhões de sessões a 506 oportunidades em escala linear:"
    options:
      - "Lê bem"
      - "Muda os estágios posteriores como talos, escondendo os estágios que mais importam"
      - "Erros"
      - "Inverter"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-9"
    q: "Um choro de receita bruta por país mostra principalmente:"
    options:
      - "Ajuste do mercado do produto"
      - "Onde estão as maiores populações e economias"
      - "Crescimento"
      - "Margem"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-10"
    q: "O gráfico desonesto mais comum em relatórios de negócios é:"
    options:
      - "Um gráfico de tartes 3D"
      - "Um total bruto que precisava de um denominador"
      - "Uma escala de log"
      - "Uma área empilhada"
    answer: 1
    topic: "data-visualization"
  - id: "lenses-and-explorations-index-1"
    q: "O que é uma lente melhor entendida como?"
    options:
      - "Um relatório finalizado"
      - "Um espaço de trabalho descartável para uma exploração de um conjunto de dados"
      - "Um modelo de painel"
      - "Uma consulta salva só os administradores podem criar"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-index-2"
    q: "Porquê mudar para SAQL modo depois de fazer uma alteração clicando?"
    options:
      - "É mais rápido."
      - "Você já sabe qual deve ser a resposta, então ler a consulta gerada é a maneira mais barata de aprender o idioma"
      - "Os gráficos não estão disponíveis em SAQL modo"
      - "É necessário antes de salvar"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-1"
    q: "CRM Analytics classifica um gráfico agrupado pelo agrupamento por padrão. Porquê mudá-lo?"
    options:
      - "Ordem alfabética é inválida"
      - "O ponto de um gráfico agrupado é geralmente o ranking, que ordem alfabética esconde"
      - "Ordenar por medida é mais rápido"
      - "É necessário para enfrentar"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-2"
    q: "Adicionar um segundo agrupamento a um gráfico de barras normalmente:"
    options:
      - "Dobra a visão"
      - "Torna substancialmente mais difícil de ler, e vale a pena resistir a menos que a comparação é o ponto"
      - "Faceamento das quebras"
      - "Alterações da medida"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-3"
    q: "No grão de linha, entende-se por «contagem de linhas»:"
    options:
      - "Número de ofertas"
      - "Número de itens de linha — use uma contagem distinta na chave de negócio para negócios"
      - "Número de contas"
      - "Número de produtos"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-1"
    q: "Um gráfico mostra um segmento com receita incrivelmente alta. Qual é o próximo passo mais rápido?"
    options:
      - "Alterar o tipo de gráfico"
      - "Mudar para o modo tabela e olhar para as linhas atrás dele"
      - "Reconstruir a lente"
      - "Verificar os filtros do painel"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-2"
    q: "SAQL O modo é mais valioso para um aluno porque:"
    options:
      - "Ele corre mais rápido do que clicar"
      - "Mostra a consulta que seus cliques produziram, contra uma resposta que você já conhece"
      - "É a única maneira de filtrar"
      - "Os gráficos não podem agrupar pela data"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-1"
    q: "O que mais determina se as consultas de linguagem natural funcionam bem?"
    options:
      - "O tipo de gráfico escolhido"
      - "A qualidade dos metadados de campo do conjunto de dados — etiquetas, formatos e canalização escondida"
      - "Número de utilizadores"
      - "A programação de atualização"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-2"
    q: "O modo de falha importante de uma resposta em linguagem natural é que:"
    options:
      - "Corre lentamente"
      - "Responde a uma pergunta sutilmente diferente da pergunta feita, fluentemente e sem indicação da diferença"
      - "Não é possível produzir gráficos"
      - "Requer SAQL conhecimento"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-1"
    q: "Uma lente é melhor descrita como:"
    options:
      - "Um relatório finalizado"
      - "Um espaço de trabalho descartável para uma exploração de um conjunto de dados"
      - "Um modelo de painel"
      - "Um salvo SAQL script"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-2"
    q: "A ordenação padrão em um gráfico agrupado é pelo agrupamento. Normalmente mudas porque:"
    options:
      - "Alfabético é inválido"
      - "O ranking é normalmente o ponto, e ordem alfabética esconde-lo"
      - "Torna-se mais rápido"
      - "O rosto exige isso."
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-3"
    q: "No grão linha-item, para contar ofertas que você deve usar:"
    options:
      - "Número de linhas"
      - "Uma conta distinta com a chave da oportunidade"
      - "Soma dos montantes"
      - "Média"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-4"
    q: "Adicionar um segundo agrupamento a um gráfico de barras normalmente:"
    options:
      - "Dobra a visão"
      - "Torna substancialmente mais difícil de ler, e vale a pena resistir a menos que a comparação é o ponto"
      - "Faceamento das quebras"
      - "Alterações da medida"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-5"
    q: "Um gráfico parece errado. O diagnóstico mais rápido é:"
    options:
      - "Alterar o tipo de gráfico"
      - "Mudar para o modo de tabela e ler as linhas"
      - "Reconstruir a lente"
      - "Verificar a partilha"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-6"
    q: "A melhor maneira de aprender a língua de consulta do explorador é:"
    options:
      - "Ler a referência da função fim a fim"
      - "Clicando, então lendo o SAQL seus cliques produzidos contra uma resposta que você já sabe"
      - "A gravar as consultas a partir do zero"
      - "Copiar exemplos de fóruns"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-7"
    q: "Um filtro escrito como 'Stage != Fechado Perdido' também remove:"
    options:
      - "Nada mais."
      - "Linhas onde o Estágio é nulo"
      - "Linhas ganhas fechadas"
      - "Linhas de outros conjuntos de dados"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-8"
    q: "Os resultados da consulta em línguas naturais devem ser tratados como:"
    options:
      - "Respostas finais à citação"
      - "Um ponto de partida para verificar no modo tabela, porque responde fluentemente mesmo quando respondeu a uma pergunta diferente"
      - "Inutilizável"
      - "Equivalente a uma lente gravada"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "designing-dashboards-index-1"
    q: "O que faz um painel terminar?"
    options:
      - "Cada elemento solicitado está presente"
      - "Um espectador pode tomar a decisão para, rapidamente e sem você"
      - "Usa as cores da empresa"
      - "Não tem espaço em branco"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-index-2"
    q: "Um stakeholder pede um nono elemento. A melhor primeira pergunta é:"
    options:
      - "Que tipo de gráfico deseja?"
      - "O que você faria diferente dependendo do que mostrou?"
      - "Pode esperar até à próxima corrida?"
      - "Tem os dados?"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-1"
    q: "Onde pertence o número mais importante?"
    options:
      - "Centro, maior"
      - "Acima à esquerda, onde começa a ordem de leitura"
      - "Fundo, como conclusão"
      - "Em qualquer lugar; as pessoas verificam aleatoriamente"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-2"
    q: "Por que grupos de widgets relacionados com o espaço entre grupos?"
    options:
      - "Parece mais arrumado."
      - "Proximidade implica relacionamento — widgets colocados juntos são lidos como pertencentes juntos, quer eles façam ou não"
      - "Melhora o desempenho"
      - "É exigido pela facetação"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-1"
    q: "Por que um delta colorido também deve carregar uma seta de direção ou etiqueta?"
    options:
      - "Parece mais profissional."
      - "Porque só a cor exclui os leitores cegos e não sobrevive à impressão ou a uma imagem em tons de cinza"
      - "As setas são mais rápidas de renderizar"
      - "É exigido por: Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-2"
    q: "De onde deve vir um limiar vermelho/âmbar/verde?"
    options:
      - "Mesmo os terços da gama"
      - "O negócio — o número em que alguém realmente faz algo diferente"
      - "O padrão da paleta"
      - "A média"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-3"
    q: "Um painel onde a maioria das células são coloridas tem:"
    options:
      - "Densidade máxima da informação"
      - "Nenhum sinal deixado — se tudo é realçado, nada é"
      - "Melhor acessibilidade"
      - "Tempos de carga mais rápidos"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-1"
    q: "Quando é que uma mesa bate um gráfico?"
    options:
      - "Nunca"
      - "Quando a identidade de cada linha importa — que conta específica, que negócio específico"
      - "Quando há muitas filas"
      - "Quando os dados são numéricos"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-2"
    q: "O que torna um KPI número em um acionável?"
    options:
      - "Uma fonte maior"
      - "Comparação — contra plano, contra período anterior — e orientação"
      - "Um símbolo de moeda"
      - "Uma fronteira"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-3"
    q: "Uma tabela de valores mostrando todas as 140 contas é geralmente:"
    options:
      - "Total"
      - "Uma exportação de dados usando roupas de painel"
      - "Requerendo precisão"
      - "Mais rápido do que um gráfico"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-1"
    q: "A maior alavanca no tempo de carga do painel é geralmente:"
    options:
      - "Tipo de gráfico"
      - "O número de consultas distintas — widgets que podem partilhar uma consulta, mas cada uma executa a sua própria"
      - "Escolha do navegador"
      - "Profundidade de cor"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-2"
    q: "Um conjunto de dados num grão muito fino torna os painéis lentos porque:"
    options:
      - "Grãos finos são armazenados de forma ineficiente"
      - "Cada elemento agrega milhões de linhas no momento da consulta, em cada carga, para cada visualizador"
      - "A facetação está desactivada"
      - "Não pode ser indexado"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-1"
    q: "Por que o funil é classificado em ordem de estágio em vez de pelo tamanho?"
    options:
      - "Torna-se mais rápido"
      - "A sequência é o argumento — a queda entre os estágios adjacentes é o achado"
      - "Salesforce requer"
      - "Para igualar a tabela"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-2"
    q: "Por que o widget de cobertura tem a facetação desligada?"
    options:
      - "Desempenho"
      - "É uma referência contra o trimestre inteiro — se filtra com tudo o mais, a comparação desaparece"
      - "Ele usa um conjunto de dados diferente"
      - "Razões de quebras facetadas"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-3"
    q: "A tendência do gasoduto é agrupada por mês criado em vez de mês fechado porque:"
    options:
      - "Datas próximas não são confiáveis"
      - "Coorte na data errada distorce períodos recentes e antigos em direções opostas, enquanto ambos os números permanecem individualmente corretos"
      - "O mês criado torna mais rápido"
      - "Não há diferença"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-1"
    q: "Um painel é terminado quando:"
    options:
      - "Cada elemento solicitado está presente"
      - "Seu público pode tomar a decisão para, rapidamente e sem você"
      - "Combina com a paleta da marca"
      - "Não há espaço em branco"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-2"
    q: "O número do título pertence:"
    options:
      - "Centro"
      - "Acima à esquerda, onde começa a ordem de leitura"
      - "Fundo"
      - "Além dos filtros"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-3"
    q: "Os filtros no canto superior esquerdo são um erro porque:"
    options:
      - "Eles são lentos."
      - "Eles gastam o espaço mais valioso na tela em controles que ninguém precisa até sua segunda visita"
      - "Eles não podem ser redimensionados"
      - "Eles não podem ser ligados"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-4"
    q: "Um título de widget deve carregar:"
    options:
      - "Apenas a medida"
      - "A medida, o período, o filtro e qualquer limite — será fotografado sem contexto"
      - "Nome do autor"
      - "O nome do conjunto de dados"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-5"
    q: "Um gráfico de funil deve ser ordenado:"
    options:
      - "Por tamanho descendente"
      - "Em ordem de processo"
      - "Alfabeticamente"
      - "Por data"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-6"
    q: "Porque é que um delta colorido também deve ter uma seta ou rótulo?"
    options:
      - "Estética"
      - "Só a cor exclui os leitores de cor e morre em tons de cinza"
      - "Setas renderizar mais rápido"
      - "É obrigatório em Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-7"
    q: "A KPI número torna-se acionável quando tem:"
    options:
      - "Uma fonte maior"
      - "Uma comparação e uma direcção"
      - "Uma fronteira"
      - "Um símbolo de moeda"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-8"
    q: "A maior alavanca de um painel lento é geralmente:"
    options:
      - "Tipos de gráficos"
      - "Consolidando widgets que poderiam compartilhar uma consulta"
      - "Menos cores"
      - "Um navegador mais rápido"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-9"
    q: "Uma tabela em um painel que precisa de rolagem tem:"
    options:
      - "Boa densidade de informação"
      - "Deixou de ser um elemento do painel e tornou- se uma exportação de dados"
      - "Um tipo de letra muito grande"
      - "A ordem do tipo errado"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-10"
    q: "A última verificação antes de compartilhar um painel é:"
    options:
      - "Verificação ortográfica dos títulos"
      - "Abra-o como um usuário restrito e concilie o título com algo independentemente verdadeiro"
      - "Exportar para PDF"
      - "Adicionar mais elementos"
    answer: 1
    topic: "designing-dashboards"
---

Perguntas práticas para o domínio Desenho do Painel de Análise do CRM Analytics e Einstein Discovery Exame de consulta.
