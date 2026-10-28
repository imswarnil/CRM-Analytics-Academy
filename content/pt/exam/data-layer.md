---
title: "Camada de dados — questões práticas"
domain: "data-layer"
quiz:
  - id: "foundations-index-1"
    q: "Qual é o argumento mais forte para CRM Analytics sobre uma ferramenta BI de uso geral?"
    options:
      - "Os seus gráficos parecem melhores"
      - "Herda Salesforce's compartilhamento e modelo de segurança, então quem vê o que já está resolvido"
      - "É mais barato"
      - "É a única ferramenta que pode ler Salesforce dados"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-2"
    q: "Um conjunto de dados CRM Analytics é melhor descrito como:"
    options:
      - "Uma visão ao vivo Salesforce objetos"
      - "Um instantâneo materializado e colunar reconstruído num calendário"
      - "Um relatório salvo"
      - "A SQL tabela para a qual você pode escrever"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-3"
    q: "Seu VP quer uma tela mostrando a atualização da profundidade da fila no centro de chamadas a cada poucos segundos. É CRM Analytics a ferramenta certa?"
    options:
      - "Sim, com uma receita suficientemente rápida"
      - "Não — actualiza-se num calendário, não num fluxo; trata-se de uma necessidade operacional, não de uma necessidade analítica"
      - "Sim, se utilizar Einstein Discovery"
      - "Apenas com uma licença Plus"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-1"
    q: "Que camada possui a definição de \"oleoduto qualificado\"?"
    options:
      - "A camada de design, porque é onde o número é exibido"
      - "A camada de dados, porque uma métrica definida per-dashboard é uma métrica dois painéis discordarão sobre"
      - "A camada de inteligência"
      - "A equipa que pedir primeiro."
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-2"
    q: "Um painel é lento. Qual camada você deve suspeitar primeiro?"
    options:
      - "A camada de design — muitos widgets"
      - "A camada de dados — um conjunto de dados no grão errado forçando cada widget a agregar milhões de linhas"
      - "A camada de inteligência"
      - "A rede"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-3"
    q: "Einstein Discovery produz um modelo com 78% de precisão. O que a camada de inteligência deve à camada de design?"
    options:
      - "Apenas a predição"
      - "A predição, a confiança e os principais fatores — uma pontuação sem razão anexada não pode ser acionada"
      - "Dados de formação"
      - "Nada; precisão é suficiente"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-1"
    q: "O que significa \"o grão\" de um conjunto de dados?"
    options:
      - "Quantos dados contém"
      - "O que exatamente uma linha representa"
      - "Quantas vezes é que ele refresca"
      - "Que domínios são medidas"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-2"
    q: "Você junta oportunidades (608 linhas) aos produtos opportunity  (1,192 linhas) e soma Quantidade. O que acontece?"
    options:
      - "Nada — a soma está correcta"
      - "O montante é contado uma vez por linha de produto, então a receita total é inflacionada — aqui quase triplos"
      - "A junção falhou"
      - "Apenas as linhas correspondentes são somadas, então a receita cai"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-3"
    q: "Por que um conjunto de dados mantém o histórico que o Salesforce O objeto não?"
    options:
      - "Salesforce apaga os registos antigos"
      - "Cada execução pode adicionar um instantâneo do estado naquele momento, enquanto o objeto só mantém seus valores atuais"
      - "Os conjuntos de dados são copiados"
      - "Não faz"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-1"
    q: "Para que é a sincronização de dados (replicação)?"
    options:
      - "A gravar os dados de volta para Salesforce"
      - "Mantendo uma cópia local dos objetos e campos selecionados atual, então as receitas são lidas a partir dele em vez de bater na fonte de cada execução"
      - "Painel de programação"
      - "Criptografar conjuntos de dados"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-2"
    q: "Falha na execução da receita. Para onde procuras?"
    options:
      - "O inspetor do painel"
      - "Data Manager → Monitor"
      - "Configuração → Analytics → Configurações"
      - "Os atributos do campo do conjunto de dados"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-3"
    q: "Por que o usuário de integração importa tanto?"
    options:
      - "É dono dos painéis"
      - "Sincronizar roda como esse usuário, então qualquer objeto ou campo que ele não possa ver simplesmente nunca chega — sem nenhum erro no painel"
      - "Paga a licença"
      - "Ele agenda as receitas"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-1"
    q: "Um 'app' em CRM Analytics é:"
    options:
      - "Uma aplicação instalada"
      - "Um recipiente para conjuntos de dados, lentes e painéis, carregando as configurações de compartilhamento"
      - "Uma experiência móvel"
      - "Um pacote gerido"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-2"
    q: "Qual é a diferença prática entre uma lente e um painel?"
    options:
      - "Lenses não pode ser salvo"
      - "Uma lente explora um conjunto de dados e é um espaço de trabalho descartável; um painel reúne muitas consultas, as enfrenta e é construído para outras pessoas"
      - "Os painéis não podem usar SAQL"
      - "Nenhum"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-3"
    q: "In Einstein Discovery, uma \"história\" é:"
    options:
      - "Um modelo implantado"
      - "A análise do que correlaciona com um resultado, que pode então ser implantado como modelo"
      - "Um modelo de painel"
      - "Um elemento de texto narrativo"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-1"
    q: "Um stakeholder pede um painel que atualiza 'em tempo real'. Qual é o primeiro passo certo?"
    options:
      - "Agende a receita por hora e chame-a em tempo real"
      - "Pergunte que decisão é tomada dela e quão velha pode ser antes de ser inútil — a resposta geralmente é medida em horas"
      - "Recusar o pedido"
      - "Utilização Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-2"
    q: "A maioria dos dados da empresa está em um armazém; Salesforce detém apenas contas e oportunidades. O que é que isso sugere?"
    options:
      - "Utilização CRM Analytics e sincronizar o armazém em"
      - "Você está construindo um projeto de armazém com um CRM anexado — uma ferramenta BI no armazém provavelmente servirá melhor"
      - "Utilização Salesforce relatórios"
      - "Utilização Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-1"
    q: "Por que este painel abre com um único número total de ARR?"
    options:
      - "Para preencher o espaço no topo"
      - "Então, um visualizador que não lê mais nada ainda sai com o título a tela é sobre"
      - "Porque os widgets de números carregam mais rápido"
      - "É exigido por: Salesforce"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-2"
    q: "Clicar em uma barra de segmento filtra os outros dois widgets. Porquê?"
    options:
      - "Foi configurada uma ligação"
      - "Widgets construídos na mesma faceta do conjunto de dados por padrão"
      - "A tabela é uma criança do gráfico"
      - "O rosto deve ser sempre ligado manualmente"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-3"
    q: "A tabela de contas superiores mostra 10 linhas em vez de todas as 140. A melhor razão é:"
    options:
      - "Desempenho"
      - "A questão é sobre concentração, e uma tabela que ninguém pode tomar em um relance é uma exportação de dados em vez de um painel"
      - "As tabelas são limitadas a 10 linhas"
      - "Para esconder as contas menores"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-1"
    q: "Um conjunto de dados CRM Analytics é:"
    options:
      - "Uma visão ao vivo Salesforce objetos"
      - "Um instantâneo materializado e colunar reconstruído num calendário"
      - "Um salvo Salesforce relatório"
      - "Uma escrita SQL tabela"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-2"
    q: "O argumento mais forte para CRM Analytics sobre uma ferramenta BI de finalidade geral é:"
    options:
      - "Melhores tipos de gráficos"
      - "Herda o modelo de partilha e segurança da org em vez de o obrigar a reconstruí-lo."
      - "Custo da licença mais baixo"
      - "É a única maneira de ler Salesforce dados"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-3"
    q: "A receita total no painel é exatamente o dobro dos relatórios financeiros. Causa mais provável:"
    options:
      - "Predicação da segurança"
      - "Uma junta que se espalhou — uma medida dos pais repetida nas fileiras dos filhos"
      - "O conjunto de dados não foi actualizado"
      - "Formatação da moeda"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-4"
    q: "Os usuários relatam registros ausentes que sabem que existem. Onde procuras primeiro?"
    options:
      - "Consultas de elementos do painel"
      - "O acesso do usuário de integração, em seguida, o predicado de segurança"
      - "O tipo de gráfico"
      - "O tema de cores da aplicação"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-5"
    q: "Qual camada possui a definição de uma métrica como \"oleoduto qualificado\"?"
    options:
      - "Design — é exibido lá"
      - "Dados — uma métrica definida por painel é um dois painéis discordarão"
      - "Inteligência"
      - "A equipa que pedir primeiro."
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-6"
    q: "Para que é a sincronização de dados?"
    options:
      - "A gravação dos resultados analíticos Salesforce"
      - "A manter uma cópia local dos objectos e campos seleccionados para que as receitas não atinjam a origem de cada execução"
      - "E-mails do painel de programação"
      - "Criptografar conjuntos de dados em repouso"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-7"
    q: "Um 'app' em CRM Analytics é:"
    options:
      - "Um pacote instalado"
      - "Um recipiente para conjuntos de dados, lentes e painéis que carrega as configurações de compartilhamento"
      - "Um cliente móvel"
      - "Um modelo de painel"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-8"
    q: "Uma receita é executada com sucesso todas as noites, mas os dados são sempre um dia de idade. A causa mais provável é:"
    options:
      - "O conjunto de dados está corrompido"
      - "A receita é agendada antes da sincronização de dados que depende dos acabamentos"
      - "A facetação está desactivada"
      - "O usuário de integração não tem acesso"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-9"
    q: "Seu stakeholder precisa de uma atualização de tela a cada poucos segundos para uma fila de chamadas ao vivo. Devias:"
    options:
      - "Agendar a receita o mais frequentemente possível"
      - "Digamos que este é um requisito operacional, não um requisito analítico, e ponto em Salesforce ferramenta de página ou de propósito"
      - "Utilização Einstein Discovery"
      - "Compilar e adicionar um botão de atualização"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-10"
    q: "Einstein Discovery implementa um modelo que pontua oportunidades. O que deve enviar com a pontuação?"
    options:
      - "O conjunto de dados de formação"
      - "Os principais fatores por trás disso — uma simples probabilidade não dá a um representante nada para agir sobre"
      - "A SAQL consulta"
      - "Nada mais."
    answer: 1
    topic: "foundations"
  - id: "data-preparation-index-1"
    q: "Qual destes não é uma maneira que os dados se tornam um CRM Analytics Conjunto de dados?"
    options:
      - "A CSV enviar"
      - "Sincronização de dados de Salesforce objetos, transformados por uma receita"
      - "Uma consulta ao vivo emitida por um elemento do painel"
      - "Ligação externa a um armazém, sincronizado e transformado"
    answer: 2
    topic: "data-preparation"
  - id: "data-preparation-index-2"
    q: "Antes de construir qualquer receita você deve ser capaz de afirmar:"
    options:
      - "Os tipos de gráficos que irá usar"
      - "O que representa exatamente uma linha do conjunto de dados de saída"
      - "O tema de cor do painel"
      - "Quantos usuários irão vê-lo"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-1"
    q: "Por que as receitas lêem de dados sincronizados ao invés de da fonte de cada execução?"
    options:
      - "As receitas não podem ser lidas Salesforce diretamente"
      - "Uma cópia local é mais rápida e não martela o sistema de registro em cada execução"
      - "Os dados sincronizados são mais precisos"
      - "É uma exigência de licenciamento"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-2"
    q: "Uma receita tem sucesso todas as noites, mas mostra sempre os dados de ontem. A causa mais provável é:"
    options:
      - "Um conjunto de dados corrompido"
      - "A receita é agendada antes da sincronização depende dos acabamentos"
      - "As caches do painel"
      - "O usuário de integração não tem acesso"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-3"
    q: "Você precisará de história mensal de um campo começando no próximo trimestre. Quando deves começar a sincronizar?"
    options:
      - "Próximo trimestre, quando for necessário"
      - "Agora — um instantâneo só pode lembrar o que foi sincronizado na época, e o histórico não pode ser preenchido de um objeto que mantém o estado atual"
      - "Não importa."
      - "Só depois da receita existir"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-1"
    q: "Um campo CloseDate carregado como texto. Que pausas?"
    options:
      - "Nada; datas de texto funcionam normalmente"
      - "Filtros de data, agrupamentos mensais e linhas de tendência — e a correção requer uma recarga"
      - "Apenas a página de registro"
      - "O conjunto de dados não irá gravar"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-2"
    q: "Por que forçar IDs numéricos para dimensões?"
    options:
      - "Para salvar espaço"
      - "Porque datilografado como medidas o produto vai oferecer para resumi-los, e eventualmente alguém aceita"
      - "É necessário"
      - "Para torná-los filtráveis"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-3"
    q: "Seu conjunto de dados carregados mostra 607 linhas em vez de 608. Muito provavelmente:"
    options:
      - "Um problema de permissão"
      - "Um problema de linha de cabeçalho no CSV parse"
      - "Um predicado de segurança"
      - "Arredondamento normal"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-1"
    q: "De onde devem vir os limites do balde?"
    options:
      - "Mesmo os terços da gama"
      - "O negócio — o ponto em que alguém faz algo diferente"
      - "Os quartis do conjunto de dados, sempre"
      - "Escala de cores do gráfico"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-2"
    q: "Baldeamento em cada painel em vez de na receita leva a:"
    options:
      - "Melhor flexibilidade"
      - "'Grande' significa coisas diferentes em telas diferentes, com ambas defensáveis"
      - "Consultas mais rápidas"
      - "Conjuntos de dados mais pequenos"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-3"
    q: "Um valor exatamente em uma fronteira — utilização de exatamente 55% — deve ser:"
    options:
      - "Deixado ao acaso"
      - "Atribuído por uma regra explícita, escrita, porque alguém irá eventualmente questioná- la"
      - "Excluido"
      - "Arredondado"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-1"
    q: "Que tipo de nó altera o grão dos dados que fluim através dele?"
    options:
      - "Filtro"
      - "Juntar e agregar"
      - "Fórmula"
      - "Saída"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-2"
    q: "Você precisa de uma contagem de oportunidades por conta anexada a cada linha de conta. Qual é o nó?"
    options:
      - "Fórmula"
      - "Agregar as oportunidades agrupadas por conta e, em seguida, juntar de volta às contas"
      - "Filtro"
      - "Transformar"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-3"
    q: "Por que dividir uma receita grande em vários menores?"
    options:
      - "As receitas têm um limite de nó duro"
      - "Uma receita de cinquenta nós é ilegível por qualquer pessoa que não a tenha escrito, e o fracasso pára de localizar"
      - "Receitas menores são mais rápidas"
      - "É necessário para agendar"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-1"
    q: "Por que a média das taxas de desconto per-deal geralmente está errada?"
    options:
      - "Arredondamento"
      - "Ele pesa um negócio de 5.000 dólares o mesmo que um US $ 2M um — o valor correto divide o desconto total pelo valor total da lista"
      - "Os descontos não podem ser médios"
      - "O campo é texto"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-2"
    q: "Uma proporção necessária em dez painéis deve ser calculada:"
    options:
      - "Em cada widget, para que cada equipe possa ajustá-lo"
      - "Uma vez na receita, então todos os dez concordam com a construção"
      - "Em uma planilha"
      - "Por Einstein Discovery"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-3"
    q: "Que cálculo realmente pertence ao painel em vez da receita?"
    options:
      - "Uma definição métrica em toda a empresa"
      - "Um que depende da seleção atual do filtro do visualizador"
      - "Uma conversão monetária"
      - "Um segmento de baldes"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-1"
    q: "Preencher uma Quantidade em branco com zero é:"
    options:
      - "Sempre correcto"
      - "Uma alegação — afirma que o acordo não vale nada, o que muda cada média construída sobre ele"
      - "Requerente antes da agregação"
      - "Uma escolha somente de exibição"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-2"
    q: "Apenas 44% dos casos encerrados têm um inquérito CSAT. A média da CSAT é:"
    options:
      - "Errado"
      - "Correcto, mas descreve os inquiridos em vez de os clientes — por isso envia com a taxa de resposta ao lado"
      - "Inutilizável"
      - "Melhorado ao imputar as pontuações em falta"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-3"
    q: "\"Campo de comprador económico está em branco\" prevê perder. A explicação mais provável é:"
    options:
      - "Campos em branco causam perdas"
      - "Um representante desengatado não preenche campos — o branco é um sintoma, não uma causa"
      - "O campo está quebrado"
      - "Coincidência"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-1"
    q: "A receita dobrou depois de ter adicionado uma entrada. As duplicatas são:"
    options:
      - "Registros duplicados reais para excluir"
      - "Um artefato de junção — a correção é a junção, não uma etapa de desduplicação"
      - "Um problema de entrada de dados"
      - "Causado por nulos"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-2"
    q: "Uma conta aparece 18 vezes em arr snapshots. Isto é:"
    options:
      - "Um duplicado para remover"
      - "O grão previsto — uma linha por conta por mês"
      - "Uma falha de carga"
      - "Um erro de sincronização"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-3"
    q: "Ao desmoronar genuínos duplicados, que fileira deve sobreviver?"
    options:
      - "O que aparecer primeiro"
      - "Um escolhido por uma regra explícita — mais recentemente modificado, mais completo, ou da fonte preferida"
      - "Uma linha aleatória"
      - "Aquele com o ID mais baixo"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-1"
    q: "Um painel mostra um total errado. Onde procuras primeiro?"
    options:
      - "Configuração do gráfico do elemento"
      - "Data Manager → Monitor: foi executado, quando, e quantas linhas"
      - "As configurações de compartilhamento de aplicativos"
      - "A consola do navegador"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-2"
    q: "A contagem de filas caiu de 2.800 para 2.100 depois de uma mudança que você não fez. Muito provavelmente:"
    options:
      - "Variação normal"
      - "Um filtro a montante, uma junção interna ou uma alteração de permissões a largar registos"
      - "Um limite de gráficos"
      - "Arredondamento"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-3"
    q: "A maneira mais rápida de localizar um problema de grãos em uma receita é:"
    options:
      - "Reler SAQL"
      - "Clicando através de antevisão de nó e observando onde a contagem da linha muda"
      - "Reconstruindo a receita"
      - "Exportar para CSV"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-1"
    q: "Para que é a sincronização de dados?"
    options:
      - "A gravação dos resultados analíticos Salesforce"
      - "Mantendo uma cópia local dos objetos e campos selecionados atual, para que as receitas não atinjam a fonte em cada execução"
      - "E-mails do painel de programação"
      - "Criptografar conjuntos de dados"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-2"
    q: "Uma receita corre verde noite mas os dados são sempre um dia de idade. Causa:"
    options:
      - "Um conjunto de dados corrompido"
      - "A receita está agendada antes da sincronização que depende da conclusão"
      - "Cache de painel"
      - "Predicado obsoleto"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-3"
    q: "Um CloseDate carregado como o texto impede:"
    options:
      - "Nada."
      - "Filtros de data, agrupamentos mensais e linhas de tendência"
      - "Ordenação"
      - "Juntar"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-4"
    q: "Por que forçar IDs numéricos para dimensões em carga?"
    options:
      - "Para salvar espaço"
      - "Porque datilografado como medidas o produto vai oferecer para resumi-los, e eventualmente alguém aceita"
      - "É necessário"
      - "Para torná-los filtráveis"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-5"
    q: "Os limites do balde devem vir de:"
    options:
      - "Mesmo os terços da gama"
      - "O negócio — o ponto em que alguém faz algo diferente"
      - "Os quartis do conjunto de dados, sempre"
      - "A paleta de gráficos"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-6"
    q: "Baldeamento em cada painel em vez de na receita leva a:"
    options:
      - "Mais flexibilidade"
      - "'Grande' significa coisas diferentes em telas diferentes, ambas defensáveis"
      - "Consultas mais rápidas"
      - "Conjuntos de dados mais pequenos"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-7"
    q: "«Desconto médio» calculado como a média das taxas por cada acordo está errada porque:"
    options:
      - "Os descontos não são numéricos"
      - "Ele pesa cada negócio igualmente, independentemente do tamanho"
      - "São excluídas as nulas"
      - "Precisa de uma contagem distinta."
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-8"
    q: "Preencher uma Quantidade em branco com zero é:"
    options:
      - "Sempre correcto"
      - "Uma reivindicação — afirma que o acordo não vale nada, e arrasta cada média construída sobre ele"
      - "Requerente antes da agregação"
      - "Uma escolha somente de exibição"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-9"
    q: "A receita dobrou após adicionar uma adesão. Os «duplicados» são:"
    options:
      - "Registros duplicados reais para excluir"
      - "Um artefato de junção — a correção é a junção, não uma etapa de desduplicação"
      - "Um problema de entrada de dados"
      - "Causado por nulos"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-10"
    q: "A maneira mais rápida de localizar um número errado dentro de uma receita é:"
    options:
      - "Ler o SAQL"
      - "Caminhar as antevisões do nó e observar onde a contagem da linha muda"
      - "Reconstruir o conjunto de dados"
      - "Verificando compartilhamento de aplicativos"
    answer: 1
    topic: "data-preparation"
  - id: "datasets-and-modelling-index-1"
    q: "O que mais determina que perguntas um conjunto de dados pode responder?"
    options:
      - "Sua contagem de linhas"
      - "Seu grão — o que uma fileira representa"
      - "Os tipos de gráficos usados nele"
      - "Sua agenda de atualização"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-index-2"
    q: "Um conjunto de dados pré-agregados aos totais mensais é:"
    options:
      - "Estritamente melhor — é mais rápido"
      - "Mais rápido, e permanentemente incapaz de responder a perguntas abaixo desse grão"
      - "Equivalente a um de grãos finos"
      - "Apenas útil para exportações"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-1"
    q: "Juntando 608 oportunidades para 1.192 linhas de produtos dá 1.192 linhas. Isso é um insecto?"
    options:
      - "Sim, a junção está mal configurada"
      - "Não — é isso que faz uma associação de um a muitos. O erro está somando a Quantidade do pai depois"
      - "Sim, as linhas nunca devem aumentar"
      - "Só se as chaves forem texto"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-2"
    q: "Que correção mantém o detalhe de nível de produto disponível?"
    options:
      - "Agregando os itens de linha antes da junção"
      - "Mantendo a linha de grãos e não carregando a quantidade do pai para baixo, somando LinhaAmount"
      - "Filtragem para um produto por negócio"
      - "Usar uma ligação interna"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-3"
    q: "Um total é exatamente 3× o que você espera. Do que suspeita?"
    options:
      - "Um predicado de segurança"
      - "Um fan-out — uma medida pai repetida em aproximadamente três fileiras de crianças cada"
      - "Um conjunto de dados obsoleto"
      - "Conversão de moeda"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-4"
    q: "A melhor maneira de investigar um total suspeito é:"
    options:
      - "Verificar novamente a configuração do gráfico"
      - "Filtrar para uma única entidade e contar as linhas à mão"
      - "Reconstruir o painel"
      - "Aumentar o limite da linha"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-1"
    q: "O ponto de partida certo para projetar um conjunto de dados é:"
    options:
      - "As tabelas de origem disponíveis"
      - "As perguntas que ele tem que responder, anotado"
      - "Os tipos de gráficos planeados"
      - "A programação de atualização"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-2"
    q: "Um conjunto de dados que sirva dois públicos com grãos diferentes deve normalmente:"
    options:
      - "Compromisso a um grão médio"
      - "Seja dois conjuntos de dados, muitas vezes de uma receita com duas saídas"
      - "Use o melhor grão"
      - "Ser filtrado por visualizador"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-3"
    q: "Um filtro aplicado dentro do conjunto de dados em vez de no painel está certo quando:"
    options:
      - "É mais rápido."
      - "As linhas excluídas nunca devem aparecer em nenhuma questão este conjunto de respostas"
      - "Os visualizadores podem querer alterá- lo"
      - "Sempre"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-1"
    q: "Um quadro de referência como o accounts.csv caracteriza-se por:"
    options:
      - "Ter mais linhas"
      - "Ser unido ao TO em vez de agregado — somar qualquer coisa nele é geralmente um erro"
      - "Mudar mais frequentemente"
      - "Sem chaves"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-2"
    q: "Formato longo (uma linha por entidade por métrica) é preferível quando:"
    options:
      - "Existem poucas métricas que nunca mudam"
      - "Métricas são adicionadas frequentemente, ou você deseja mapear muitos deles com um widget"
      - "O armazenamento é limitado"
      - "Nunca"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-3"
    q: "Um conjunto de dados derivado baseado nos riscos de saída de outro conjunto de dados:"
    options:
      - "Nada."
      - "Uma cadeia de programação onde uma falha três links para trás é invisível no final"
      - "Perder a segurança"
      - "Duplicar colunas"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-1"
    q: "Por que você não pode construir um painel de movimento de oleoduto do objeto Opportunity sozinho?"
    options:
      - "O objeto é muito grande"
      - "Ele contém apenas valores atuais — não há registro do que o estágio ou montante foi no mês passado"
      - "Oportunidades não podem ser sincronizadas"
      - "Você pode; é construído em"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-2"
    q: "Coortação leva por data de conversão em vez de data de criação produz:"
    options:
      - "Uma imagem mais precisa"
      - "Uma distorcida — coortes recentes parecem impossíveis e as antigas parecem terríveis, ao passo que ambos os números são individualmente corretos"
      - "Nenhuma diferença"
      - "Um erro na receita"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-3"
    q: "Um conjunto de dados de instantâneo adiciona o estado atual de cada execução. O que significa isso para um campo que começas a sincronizar hoje?"
    options:
      - "Seu histórico é preenchido automaticamente"
      - "Não tem história até hoje, e nunca terá."
      - "Não pode ser fotografado"
      - "O histórico vem do registo de auditoria"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-1"
    q: "Onde deve ser definida uma etiqueta de exibição de campo?"
    options:
      - "Em cada elemento"
      - "Nos metadados do campo do conjunto de dados, por isso cada lente e elemento herda- o"
      - "Na fórmula da receita"
      - "Nas configurações do aplicativo"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-2"
    q: "Uma medida monetária mostra seis casas decimais em cada painel. A correção eficiente é:"
    options:
      - "Formatar cada elemento"
      - "Definir o formato uma vez no campo de conjunto de dados"
      - "Enrole-o. SAQL"
      - "Alterar o tipo de gráfico"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-1"
    q: "Juntando-se a 608 oportunidades para 1.192 linhas de produto produz 1.192 linhas. O erro é:"
    options:
      - "A própria união"
      - "Somando a Quantidade do pai depois, que agora repete por linha"
      - "Usando uma pesquisa em vez de interior"
      - "Não existe nenhum erro"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-2"
    q: "A correção que mantém o detalhe do nível do produto é:"
    options:
      - "Agregar itens de linha antes da junção"
      - "Manter a linha de grãos e somar LineAmount em vez da quantidade pai"
      - "Filtrar para um produto por oferta"
      - "Usar uma ligação interna"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-3"
    q: "Os grãos de um conjunto de dados devem ser derivados de:"
    options:
      - "As tabelas de origem"
      - "A melhor pergunta que deve responder"
      - "Os tipos de gráficos"
      - "O limite da linha"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-4"
    q: "Somar ARR em todas as linhas de um instantâneo de 18 meses dá:"
    options:
      - "Empresa ARR"
      - "Cerca de dezoito anos de receita"
      - "ARR por conta"
      - "Um erro"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-5"
    q: "Um campo que você começa a sincronizar hoje tem:"
    options:
      - "Histórico cheio"
      - "Nenhuma história antes de hoje, permanentemente"
      - "Histórico da pista de auditoria"
      - "Histórico após a próxima reconstrução"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-6"
    q: "A soma de uma coluna numa tabela de referência como contas é:"
    options:
      - "Prática normal"
      - "Normalmente um erro — tabelas de referência são unidas a, não agregadas"
      - "Necessário para ARR"
      - "Mais rápido do que uma tabela de factos"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-7"
    q: "A falha característica do formato longo é:"
    options:
      - "Consultas lentas"
      - "Uma consulta que esquece de filtrar para uma métrica, silenciosamente somando métricas não relacionadas"
      - "Chaves em falta"
      - "Entidades duplicadas"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-8"
    q: "Um campo percentual de utilização com uma agregação por defeito da soma produz:"
    options:
      - "Total correto"
      - "960% em um ano, renderizado de forma limpa"
      - "Um erro"
      - "Nulas"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-9"
    q: "Um filtro aplicado dentro do conjunto de dados deve ser documentado porque:"
    options:
      - "É necessário"
      - "É invisível a jusante, por isso uma reconciliação contra a fonte vai diferir sem causa visível"
      - "Afecta o desempenho"
      - "Os espectadores podem querer alterá- lo"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-10"
    q: "A frase única mais útil na descrição de um conjunto de dados é:"
    options:
      - "Quem a construiu?"
      - "O que uma linha representa"
      - "Quando refresca"
      - "Em que aplicativo está"
    answer: 1
    topic: "datasets-and-modelling"
---

Perguntas práticas para o domínio da Camada de Dados do CRM Analytics e Einstein Discovery Exame de consulta.
