# 🏆 ResenhaScore

**ResenhaScore** é um aplicativo mobile focado na organização de eventos sociais, trazendo gamificação de encontros (as famosas "resenhas") e aumentando o engajamento para grupos de amigos. 

O projeto resolve o problema crônico da indecisão e da falta de compromisso em grupos sociais. Ele entrega valor através de um sistema inteligente de enquetes com cálculo dinâmico de probabilidade do evento acontecer, sendo ideal para jovens e adultos que costumam organizar resenhas, esportes ou churrascos.

O grande diferencial do aplicativo é a sua **gamificação**: os usuários ganham ou perdem pontos de "score" dependendo da sua presença confirmada. Esse score afeta diretamente o peso dos seus votos nas próximas enquetes do grupo.

## 📋 Funcionalidades Principais

* **Criação de Enquetes:** Permite sugerir múltiplos locais e datas utilizando um calendário interativo.
* **Confirmação de Presença:** Votação intuitiva com as opções "Sim", "Não" e "Talvez".
* **Termômetro da Resenha:** Calcula automaticamente a porcentagem de chance do evento acontecer com base nas confirmações (limite padrão de 10 convidados).
* **Sistema de Score (Ranking):** Mantém e atualiza a participação do usuário, somando +10 pontos para "Sim" e subtraindo -5 pontos para "Não".
* **Votação Ponderada:** O peso do voto na enquete é influenciado diretamente pelo score atual do membro.
* **Álbum da Comunidade:** Permite selecionar fotos de eventos passados e armazená-las localmente no app.
* **Histórico:** Arquiva todas as enquetes finalizadas para consulta posterior.

## 📱 Estrutura de Telas (UI)

A navegação do aplicativo é gerenciada via **Expo Router** e divide-se nas seguintes interfaces:

* **Tela Inicial (Index):** Exibe o card de pontuação do usuário, a enquete ativa no momento, a barra animada de probabilidade e atalhos rápidos.
* **Criar Enquete (Create):** Formulário de cadastro de eventos integrado ao componente *React Native Calendars* e toggle de configuração.
* **Votação (Details):** Tela focada em conversão contendo os botões de interação e a visualização do impacto do voto em tempo real.
* **Histórico (History):** Exibição do pódio de membros (gamificação) e lista em formato *read-only* das resenhas já encerradas.
* **Álbum (Album):** Visualização em *Grid view* de imagens (em formato base64) selecionadas através do *Expo Image Picker*.

## 🛠️ Requisitos Técnicos e Stack

O aplicativo foi construído com foco em uma arquitetura *Offline-first* (sem backend em nuvem).

* **Linguagem:** TypeScript (~19.1.0).
* **Framework / Plataforma:** React Native (0.81.5) integrado à plataforma Expo (~54.0.33).
* **Roteamento:** Expo Router (~6.0.23).
* **Armazenamento de Dados:** AsyncStorage (^3.0.2) e Expo Secure Store (^55.0.11).
* **Controle de Versão:** Git / GitHub.
* **Dependências / Terceiros:**
  * *React Native Calendars* (seleção de datas).
  * *Expo Image Picker* (manipulação da galeria).
  * *Expo File System* e *Expo Haptics* (feedback físico).
  * *@expo/vector-icons* (iconografia).

## 🎓 Contexto Acadêmico

Este documento de especificação e projeto foi desenvolvido para a disciplina de **Linguagens e Técnica de Programação IV**, ministrada pelo Prof. **Marcos Raimundo Mendes Ramos**. Faz parte do curso de **Bacharelado em Sistemas de Informação** no **Instituto Federal de Educação, Ciência e Tecnologia do Tocantins (IFTO) - Campus Paraíso do Tocantins**.

**Equipe de Desenvolvimento:** * Gabriel Aquino Carvalho Rodrigues
