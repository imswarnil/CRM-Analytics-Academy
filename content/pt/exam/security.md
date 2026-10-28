---
title: "Segurança — questões práticas"
domain: "security"
quiz:
  - id: "setup-index-1"
    q: "Por que CRM Analytics o acesso vem através de conjuntos de permissão em vez de perfis?"
    options:
      - "Os perfis estão obsoletos"
      - "Permissões de análise enviam como licenças de conjunto de permissão que são concedidas aditivamente, então o acesso é composto em vez de cozido em um perfil"
      - "Os perfis não podem conceder acesso aos objectos"
      - "É um erro de licenciamento"
    answer: 1
    topic: "setup"
  - id: "setup-index-2"
    q: "Um painel está correto para você e vazio para a equipe de vendas. A causa mais provável é:"
    options:
      - "Uma pesquisa de elementos quebrados"
      - "Segurança de nível de linha — o predicado ou herança de compartilhamento está filtrando suas linhas de distância"
      - "O conjunto de dados falhou ao actualizar"
      - "Eles precisam de um navegador diferente"
    answer: 1
    topic: "setup"
  - id: "setup-index-3"
    q: "Quando a segurança deve ser projetada?"
    options:
      - "Após a aprovação dos painéis"
      - "Antes que o primeiro conjunto de dados seja construído, porque o predicado depende de campos que devem ser sincronizados e às vezes de um nó de receita que achata a hierarquia de funções"
      - "Apenas se os dados forem sensíveis"
      - "É automático"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-1"
    q: "Um administrador de sistema não pode ver o Analytics Studio azulejo. O que se passa?"
    options:
      - "O seu perfil está mal configurado"
      - "Não há nada de errado — CRM Analytics acesso vem por conjunto de permissão, e os direitos de administração não incluem"
      - "A org não tem dados"
      - "Eles precisam ser um Salesforce Usuário da plataforma"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-2"
    q: "Que capacidade está na camada superior (Plus) em vez da base?"
    options:
      - "Painéis de construção"
      - "Einstein Discovery — histórias de formação e implantação de modelos preditivos"
      - "Criar conjuntos de dados"
      - "Partilhar uma aplicação"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-3"
    q: "A maneira mais rápida de descobrir o que um usuário está faltando é:"
    options:
      - "Compare seu perfil com o seu"
      - "Abra seu registro de usuário e leia o conjunto de atribuições de permissão e, em seguida, verifique os direitos de licença da org"
      - "Reconstruir o painel"
      - "Pede-lhes para sair e entrar."
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-1"
    q: "O usuário de integração não tem acesso a nível de campo para Discount  c. O que acontece?"
    options:
      - "A sincronização falhou com um erro"
      - "O campo nunca chega; a receita e painel construir de forma limpa e silenciosa calcular figuras sem descontos"
      - "O campo chega vazio e está marcado"
      - "Salesforce concede acesso automaticamente"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-2"
    q: "Por que este fracasso é especialmente perigoso?"
    options:
      - "Corrompe o conjunto de dados"
      - "É silencioso e produz números plausíveis, por isso sobrevive à revisão"
      - "Ele apaga registros"
      - "Só afecta os administradores"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-3"
    q: "Um novo campo personalizado foi adicionado no mês passado, mas não está no conjunto de dados. É a primeira coisa a verificar?"
    options:
      - "A consulta do widget do painel"
      - "Se o campo foi adicionado à seleção de sincronização de dados E é visível para o usuário de integração"
      - "Predicação da segurança"
      - "As configurações de compartilhamento de aplicativos"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-1"
    q: "Onde é aplicado um predicado de segurança?"
    options:
      - "Em cada elemento, no momento do design"
      - "No conjunto de dados, na hora da consulta, por visualizador"
      - "Na receita, em tempo de construção"
      - "Nas configurações de compartilhamento do aplicativo"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-2"
    q: "Por que um predicado de hierarquia de papéis geralmente precisa de um nó 'flatten' na receita?"
    options:
      - "Para reduzir a contagem de linhas"
      - "Porque um predicado não pode andar na hierarquia no momento da consulta — a ancestralidade tem que ser pré-computada em uma coluna que pode comparar com"
      - "Para ordenar os dados"
      - "Não; achatar é estilo opcional"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-3"
    q: "Você adiciona um predicado e seus próprios painéis ficam vazios. A explicação mais provável é:"
    options:
      - "O conjunto de dados está corrompido"
      - "O predicado é avaliado para você também, e seu usuário não satisfaz"
      - "A receita falhou"
      - "Predica apenas trabalho para administradores"
    answer: 1
    topic: "setup"
  - id: "setup-sharing-inheritance-1"
    q: "Qual é a principal vantagem de compartilhar herança sobre um predicado escrito à mão?"
    options:
      - "É mais rápido consultar"
      - "Ele reutiliza o compartilhamento existente da org, então a análise não pode sair do CRM à medida que o negócio se reorganiza"
      - "Ele suporta mais objetos"
      - "Ele remove a necessidade do usuário de integração"
    answer: 1
    topic: "setup"
  - id: "setup-sharing-inheritance-2"
    q: "Por que a partilha de herança precisa de um predicado de retrocesso?"
    options:
      - "Apenas para dados não-vendas"
      - "Porque a herança tem limites — quando o compartilhamento de um usuário é muito complexo para avaliar, o backback decide o que ele vê"
      - "Para acelerar o painel"
      - "Não precisa de um"
    answer: 1
    topic: "setup"
  - id: "setup-org-settings-and-rollout-1"
    q: "Uma nova CRM Analytics a opção do recurso aparece após uma versão. Onde você deve habilitá-lo primeiro?"
    options:
      - "Produção, assim todos beneficiam imediatamente"
      - "Uma caixa de areia ou uma org do desenvolvedor, onde uma mudança de comportamento não pode afetar um painel ao vivo"
      - "Em nenhum lugar — nunca habilite novas funcionalidades"
      - "Não faz diferença."
    answer: 1
    topic: "setup"
  - id: "setup-org-settings-and-rollout-2"
    q: "Qual é a primeira audiência certa para um novo painel?"
    options:
      - "Toda a empresa, para maximizar o feedback"
      - "Duas ou três pessoas que irão realmente tomar a decisão que apoia"
      - "Apenas executivos"
      - "Ninguém — publicar silenciosamente"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-1"
    q: "Onde está configurado o predicado de segurança?"
    options:
      - "No painel"
      - "No conjunto de dados"
      - "Na aplicação"
      - "No perfil do utilizador"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-2"
    q: "Seu próprio painel fica vazio após adicionar um predicado. O que aconteceu?"
    options:
      - "O conjunto de dados quebrou"
      - "O predicado aplica-se a você também e seu usuário não satisfaz"
      - "Predica desactivar os painéis"
      - "A receita precisa ser executada novamente"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-3"
    q: "O campo de região de um usuário está em branco. O que é que eles vêem?"
    options:
      - "Tudo"
      - "Nada — uma falha nula encerrada"
      - "Apenas os seus próprios registos"
      - "Uma mensagem de erro"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-1"
    q: "Um administrador de sistema não tem Analytics Studio azulejo. Porquê?"
    options:
      - "O perfil deles está quebrado"
      - "CRM Analytics o acesso vem com o conjunto de permissões; os direitos de administração não incluem"
      - "A org não tem dados"
      - "Devem ser um utilizador da Plataforma"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-2"
    q: "Einstein Discovery requer:"
    options:
      - "Nível de crescimento de base"
      - "O nível mais elevado do Plus"
      - "Nenhuma licença"
      - "Uma licença do Tableau separada"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-3"
    q: "O usuário de integração não pode ver um campo personalizado. O que acontece?"
    options:
      - "A sincronização falha alto"
      - "O campo nunca chega, tudo a jusante se constrói de forma limpa, e os números estão silenciosamente incompletos."
      - "O campo chega como nulo e é sinalizado"
      - "O acesso é concedido automaticamente"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-4"
    q: "Onde é aplicado um predicado de segurança?"
    options:
      - "No painel no momento do projeto"
      - "No conjunto de dados, por visualizador, no momento da consulta"
      - "Na receita na hora de compilação"
      - "No compartilhamento do aplicativo"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-5"
    q: "Você adiciona um predicado e seus próprios painéis ficam vazios. Porquê?"
    options:
      - "O conjunto de dados está corrompido"
      - "O predicado é avaliado para você também e seu usuário não satisfaz"
      - "Predica desactivar permanentemente o acesso ao administrador"
      - "A receita deve ser re- executada"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-6"
    q: "O campo predicado de um usuário está em branco. O que é que eles vêem?"
    options:
      - "Tudo"
      - "Nada — nulls fail closed"
      - "Os seus próprios registos"
      - "Um erro"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-7"
    q: "Por que um predicado de hierarquia precisa de um nó achatado?"
    options:
      - "Para reduzir o tamanho do conjunto de dados"
      - "Um predicado não pode andar uma hierarquia no momento da consulta, então a ancestralidade é pré-computada em uma coluna comparável"
      - "Para ordenar papéis alfabeticamente"
      - "Não faz"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-8"
    q: "A principal vantagem de compartilhar herança sobre um predicado escrito à mão é:"
    options:
      - "Consultas mais rápidas"
      - "Ele reutiliza o compartilhamento existente da org, então a análise não pode derivar à medida que o negócio se reorganiza"
      - "Funciona em todos os dados externos"
      - "Ele remove a necessidade de um usuário de integração"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-9"
    q: "Por que a partilha de herança precisa de um predicado de retrocesso?"
    options:
      - "De desempenho"
      - "Porque a herança tem limites, e algo deve decidir o que um espectador vê quando não pode ser avaliado."
      - "Para suportar painéis"
      - "Não faz"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-10"
    q: "Antes de liberar um painel seguro você deve:"
    options:
      - "Analise-o como administrador"
      - "Verifique como um usuário restrito, um gerente e alguém que não deve ver nada"
      - "Exportar para uma planilha"
      - "Activar todas as opções de funcionalidades"
    answer: 1
    topic: "setup"
---

Perguntas práticas para o domínio Segurança do CRM Analytics e Einstein Discovery Exame de consulta.
