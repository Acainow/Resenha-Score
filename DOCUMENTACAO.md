# ResenhaScore - Documentação Completa

## 📚 Sobre o Projeto

**ResenhaScore** é um aplicativo mobile desenvolvido com o objetivo de ajudar grupos de amigos a organizarem encontros, atividades e resenhas de forma mais prática e inteligente.

O aplicativo permite a criação de enquetes onde os participantes podem escolher opções de locais, esportes ou atividades e informar se irão comparecer ou não. A partir dessas respostas, o sistema calcula automaticamente a porcentagem de chance da resenha acontecer.

Cada participante possui um score de participação, que aumenta quando ele comparece aos encontros e diminui quando ele falta. Esse score influencia no peso do voto de cada usuário no cálculo final da probabilidade da resenha.

Além disso, o aplicativo permite registrar fotos das resenhas realizadas, criando um histórico social do grupo.

---

## ✅ Requisitos do Projeto

### Funcionalidades (O que o app faz)

1. **Criação de Enquetes**
   - Organizar detalhes da resenha (data, local e tema)
   - Suporte para múltiplos locais sugeridos
   - Suporte para múltiplas datas preferidas
   - Sistema de calendário interativo
   - Opção de votação ponderada (usando score dos membros)

2. **Confirmação de Presença**
   - Votação com três opções: Sim (confirmado), Não (não vai), Talvez (em dúvida)
   - Cada opção tem um peso diferente no cálculo final
   - Possibilidade de mudar voto e recalcular em tempo real

3. **Cálculo de Viabilidade**
   - Exibir a porcentagem de chance da resenha acontecer com base nos confirmados
   - Animação visual da barra de probabilidade
   - Total de 10 convidados padrão por enquete
   - Votação ponderada: peso baseado no score do usuário

4. **Sistema de Score**
   - Ranking de participação para incentivar a presença dos amigos
   - 4 níveis de ranking:
     - 🌱 Iniciante: 0-19 pontos
     - 🎯 Participante: 20-49 pontos
     - ⚡ Entusiasta: 50-79 pontos
     - 👑 Rei da Resenha: 80+ pontos
   - Pontos aumentam com votos "Sim" (+10 pontos)
   - Pontos diminuem com votos "Não" (-5 pontos)
   - Votos "Talvez" não alteram score

5. **Histórico e Álbum**
   - Lista de eventos passados com galeria de fotos de cada encontro
   - Visualização de enquetes ativas e finalizadas
   - Registro de fotos em base64 para persistência local
   - Tela de histórico com estatísticas por resenha

---

## 🔥 Tecnologias Utilizadas

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| **React Native** | 0.81.5 | Framework mobile |
| **Expo** | ~54.0.33 | Plataforma de desenvolvimento |
| **TypeScript** | ~19.1.0 | Tipagem e segurança |
| **Expo Router** | ~6.0.23 | Navegação entre telas |
| **AsyncStorage** | ^3.0.2 | Armazenamento local de dados |
| **Expo Secure Store** | ^55.0.11 | Armazenamento seguro de dados |
| **React Native Calendars** | ^1.1314.0 | Componente de calendário |
| **Expo Image Picker** | ~17.0.10 | Seleção de fotos |
| **Expo File System** | ^55.0.14 | Gerenciamento de arquivos |
| **Expo Haptics** | ~15.0.8 | Feedback tátil |

---

## 📱 Estrutura do Projeto

```
resenha-score/
├── app/
│   ├── _layout.tsx              # Layout raiz da aplicação
│   ├── modal.tsx                # Modal de exemplo
│   ├── GlobalContext.tsx        # Context de estado global
│   └── (tabs)/
│       ├── _layout.tsx          # Layout das abas
│       ├── index.tsx            # Tela inicial (Home)
│       ├── create.tsx           # Criação de enquetes
│       ├── details.tsx          # Votação e detalhes
│       ├── history.tsx          # Histórico de resenhas
│       └── album.tsx            # Álbum de fotos
├── components/
│   ├── ui/
│   │   └── loading-overlay.tsx  # Overlay de carregamento
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── (outros componentes)
├── constants/
│   └── theme.ts                 # Temas e cores
├── hooks/
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
├── assets/
│   └── images/
│       └── olholoading.gif      # GIF de carregamento
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎨 Interface e Fluxo de Telas

### 1. **Tela Inicial (Home)**
- **Arquivo**: `app/(tabs)/index.tsx`
- **Componentes principais**:
  - Card de pontuação com ranking dinâmico
  - Botão "Criar Nova Enquete"
  - Card de enquete em destaque (se houver ativa)
  - Barra de probabilidade animada
  - Seção de grupos
  - Botões de ação: "Votar Agora", "Encerrar Resenha"
- **Estado gerenciado**: score, tituloEnquete, confirmados, totalConvidados

### 2. **Criar Enquete**
- **Arquivo**: `app/(tabs)/create.tsx`
- **Componentes principais**:
  - Progress bar (1/2)
  - Campo de nome do evento
  - Seção de locais sugeridos (dinâmica)
  - Sistema de calendário para datas
  - Toggle de votação ponderada
  - Botão "Lançar Enquete 🚀"
  - Overlay de loading com animação
- **Funcionalidades**:
  - Adicionar/remover múltiplos locais
  - Adicionar múltiplas datas via calendário
  - Fade-in animation na entrada
  - Loading overlay por 2 segundos

### 3. **Votação (Details)**
- **Arquivo**: `app/(tabs)/details.tsx`
- **Componentes principais**:
  - Círculo de probabilidade animado
  - Título da enquete
  - Texto dinâmico de status
  - Três botões de voto: Sim, Não, Talvez
  - Botão de finalização com efeito de pressão
  - Barra de probabilidade com animação de preenchimento
- **Funcionalidades**:
  - Voto com peso baseado em pontuação
  - Recuperação de voto anterior persistido
  - Animação de barra ao mudar votos
  - Press animation nos botões

### 4. **Histórico**
- **Arquivo**: `app/(tabs)/history.tsx`
- **Componentes principais**:
  - Card de pontuação do usuário
  - Pódio visual (1º lugar)
  - Lista de enquetes ativas e finalizadas
  - Detalhes de cada enquete (data, locais, datas sugeridas)
  - Barra de porcentagem visual
- **Dados exibidos**:
  - Todas as enquetes criadas
  - Status (ativa/finalizada)
  - Data de criação/encerramento
  - Número de confirmados

### 5. **Álbum de Fotos**
- **Arquivo**: `app/(tabs)/album.tsx`
- **Componentes principais**:
  - Header com badge "COMMUNITY ALBUM"
  - Contador de fotos compartilhadas
  - Grid de fotos (2 colunas)
  - Botão "+ ADICIONAR FOTOS"
  - Modal de visualização em tela cheia
- **Funcionalidades**:
  - Seleção de imagens da galeria
  - Conversão para base64 para persistência
  - Visualização ampliada de fotos
  - Contador atualizado dinamicamente

---

## 🔄 Estado Global (GlobalContext.tsx)

### Estados Gerenciados

```typescript
// Resenha Atual
score: number                     // Pontuação do usuário
tituloEnquete: string            // Título da enquete ativa
confirmados: number              // Total de confirmações
totalConvidados: number          // Total de convidados (10)
locais: string[]                 // Locais sugeridos
datas: string[]                  // Datas sugeridas
ponderada: boolean               // Se usa votação ponderada

// Álbum
albumPosts: any[]                // Array de fotos (base64)

// Votação
votosRegistrados: Voto[]         // Histórico de votos
  - enqueteId: string
  - memberId: string
  - tipo: 'sim' | 'nao' | 'talvez'
  - timestamp: number

// Histórico
enquetes: Enquete[]              // Todas as enquetes criadas
  - id: string
  - dataCriacao: string
  - dataEncerramento?: string
  - titulo: string
  - presentes: number
  - fotos: number
  - cor: string
  - locais: string[]
  - datas: string[]
  - status: 'ativa' | 'encerrada'
  - ponderada: boolean

members: Member[]                // Membros do grupo
  - id: string
  - name: string
  - points: number
```

### Funções de Ação

- **getTotalPoints()**: Calcula a soma de pontos de todos os membros
- **criarEnquete()**: Cria nova enquete com dados persistidos
- **encerrarResenha()**: Finaliza enquete ativa e move para histórico

### Persistência

- Uso de **expo-secure-store** para armazenamento seguro
- Todos os estados são salvos automaticamente em JSON
- Carregamento ao inicializar a aplicação
- Sincronização em tempo real de mudanças

---

## 🎯 Fluxo de Votação e Cálculo

### Sistema de Votação Ponderada

**Quando ativada (ponderada = true):**
- Peso do voto = score do usuário (mínimo 1)
- Voto "Sim": adiciona `weight` ao confirmados
- Voto "Talvez": adiciona `weight * 0.5` ao confirmados
- Voto "Não": não adiciona nada

**Quando desativada (ponderada = false):**
- Peso fixo = 1 para todos
- Mesma lógica de adição

### Cálculo da Probabilidade

```
probabilidade = (confirmados / totalConvidados) * 100
total = 10 convidados fixos
```

### Efeito no Score

- ✅ Voto "Sim": +10 pontos
- ❌ Voto "Não": -5 pontos
- ❓ Voto "Talvez": sem alteração

### Animação e Persistência

- Barra de probabilidade anima com Easing.out(Easing.cubic) por 500ms
- Voto é persistido em `votosRegistrados`
- Ao retornar à tela de votação, voto anterior é restaurado
- Mudança de voto desfaz a contribuição anterior antes de aplicar a nova

---

## 🎬 Animações Implementadas

1. **Tela Create**
   - Fade-in de entrada (550ms)

2. **Tela Details**
   - Barra de probabilidade animada (500ms)
   - Press animation nos botões (scale: 0.97, opacity: 0.9)

3. **Tela Index**
   - Fade-in ao entrar

4. **Loading Overlay**
   - Modal com GIF animado (olholoading.gif)
   - Exibido por 2 segundos ao lançar enquete

---

## 🎨 Sistema de Ranking

| Level | Emoji | Nome | Pontos |
|-------|-------|------|--------|
| 1 | 🌱 | Iniciante | 0-19 |
| 2 | 🎯 | Participante | 20-49 |
| 3 | ⚡ | Entusiasta | 50-79 |
| 4 | 👑 | Rei da Resenha | 80+ |

O ranking é atualizado dinamicamente no card de pontuação da tela inicial.

---

## 🔐 Dados de Exemplo

### Membros do Grupo (Padrão)
- Fernanda S. - 3400 pontos
- Ricardo M. - 2800 pontos
- Marcos L. - 2100 pontos
- João D. - 1500 pontos (Você!)

### Enquetes de Exemplo
1. **Resenha das Quartas**
   - Data: 24 OUT, 2023
   - Presentes: 14
   - Fotos: 24
   - Status: Encerrada

2. **Churrasco Pós-Jogo**
   - Data: 17 OUT, 2023
   - Presentes: 18
   - Fotos: 12
   - Status: Encerrada

---

## 🚀 Como Usar

### Criar Enquete
1. Clique em "Criar Nova Enquete" na tela inicial
2. Preencha o nome do evento
3. Adicione locais sugeridos
4. Adicione datas via calendário
5. Ative/desative votação ponderada
6. Clique em "Lançar Enquete 🚀"

### Votar
1. Na tela inicial, clique em "Votar Agora"
2. Escolha uma das três opções: Sim, Não ou Talvez
3. Veja a probabilidade atualizar em tempo real
4. Retorne para continuar

### Finalizar Resenha
1. Clique em "FINALIZAR" na tela de votação
2. A enquete é movida para o histórico
3. Local fica disponível para nova enquete

### Visualizar Histórico
1. Acesse a aba "Histórico"
2. Veja todas as enquetes criadas
3. Consulte estatísticas e fotos

### Adicionar Fotos
1. Acesse a aba "Álbum"
2. Clique em "+ ADICIONAR FOTOS"
3. Selecione imagens da galeria
4. Fotos aparecem no grid

---

## 📋 Requisitos do Sistema

- **iOS**: 12.0 ou superior
- **Android**: 6.0 ou superior
- **Memória**: Mínimo 100MB disponível
- **Armazenamento**: Suporta até 1000 fotos em base64

---

## 🐛 Tratamento de Erros

- Validação de campos vazios
- Proteção contra valores NaN na probabilidade
- Sincronização automática de estado global
- Persistência automática de dados
- Recuperação de voto anterior ao retornar à tela

---

## 🎯 Objetivo Final

Facilitar a organização de encontros entre amigos e aumentar o engajamento do grupo através de metas e histórico visual, criando uma experiência gamificada que incentiva a participação ativa.

---

**Versão**: 1.0.0  
**Data**: Abril de 2026  
**Status**: Em Produção
