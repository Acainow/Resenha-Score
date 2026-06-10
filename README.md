# Resenha Score 🎉

Um app Expo/React Native para gerenciar resenhas em grupo com enquetes em tempo real, integrado com **Supabase** para autenticação e sincronização de dados.

## 📋 Features

- ✅ **Autenticação com Email/Senha** (via Supabase)
- ✅ **Banco de Dados em Nuvem** (Supabase PostgreSQL)
- ✅ **Sincronização em Tempo Real** (Supabase Realtime)
- ✅ **Múltiplos Usuários** (cada um com suas enquetes)
- ✅ **Votação em Enquetes** (sim, não, talvez)
- ✅ **Histórico de Resenhas** (persistência completa)
- ✅ **Álbum de Fotos** (estrutura pronta)

## 🚀 Quick Start

### 1. Clonar e Instalar
```bash
npm install
```

### 2. Configurar Supabase
Veja [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para instruções completas.

Resumo rápido:
1. Criar conta em [supabase.com](https://supabase.com)
2. Copiar URL e ANON_KEY
3. Preencher `.env` com as variáveis
4. Executar SQL em `supabase/schema.sql`

### 3. Iniciar o App
```bash
npm start
```

Abrir em:
- iOS Simulator: tecle `i`
- Android Emulator: tecle `a`
- Expo Go: escanear QR code

### 4. Testar Login
- Email: qualquer email válido
- Senha: qualquer senha
- Signup: criar nova conta
- App sincroniza automaticamente com Supabase

## 📁 Estrutura

```
app/
  ├── _layout.tsx              # Roteamento protegido
  ├── auth-layout.tsx          # Proteção de rotas
  ├── login.tsx                # Tela de Login/Signup
  ├── GlobalContext.tsx        # Context com Supabase integration
  ├── (tabs)/                  # Abas principais (Index, Album, History, Create)
  │   ├── _layout.tsx
  │   ├── index.tsx            # Tela inicial
  │   ├── album.tsx            
  │   ├── create.tsx           # Criar enquete
  │   ├── history.tsx
  │   └── details.tsx
  └── modal.tsx

config/
  └── supabase.ts             # Configuração Supabase

supabase/
  └── schema.sql              # DDL das tabelas + RLS

.env.example                  # Template de variáveis
SUPABASE_SETUP.md            # Guia de setup completo
```

## 🔐 Autenticação

### Fluxo
1. Usuário abre app → verifica sessão
2. Se não autenticado → redireciona para `/login`
3. Signup/Login via Supabase Auth
4. App carrega enquetes do usuário
5. Listeners em tempo real sincronizam mudanças

### Código
```typescript
const { signIn, signUp, signOut, user, session } = useAppContext();

// Login
await signIn(email, password);

// Registrar
await signUp(email, password, name);

// Logout
await signOut();
```

## 🔄 Sincronização em Tempo Real

Quando **outro usuário** modifica uma enquete:
- `enquetes` table: novos eventos são emitidos
- Listeners no `GlobalContext` capturam mudanças
- React state atualiza automaticamente
- UI renderiza em tempo real

Tabelas com Realtime ativado:
- `enquetes`
- `members`
- `votos`

## 📊 Tabelas Supabase

### `enquetes`
```sql
id, userId, titulo, status, presentes, fotos, locais[], datas[], ...
```

### `members`
```sql
id, enqueteId, name, points
```

### `votos`
```sql
id, enqueteId, memberId, tipo ('sim'|'nao'|'talvez'), timestamp
```

## 🛡️ Segurança (RLS)

Cada usuário:
- ✅ Vê apenas suas enquetes
- ✅ Não pode editar enquetes de outro usuário
- ✅ RLS ativa em todas as tabelas
- ✅ Autenticação via Supabase Sessions

## 📝 Próximos Passos

- [ ] Testar com múltiplos devices
- [ ] Compartilhamento de enquetes (código/link convite)
- [ ] Upload de fotos (Supabase Storage)
- [ ] Notificações em tempo real
- [ ] Build para produção (EAS)
- [ ] Monetização

## 📚 Documentação

- [Supabase Docs](https://supabase.com/docs)
- [Expo Router](https://expo.dev/router)
- [React Native](https://reactnative.dev)

## 🤝 Suporte

Problemas? Veja [SUPABASE_SETUP.md](SUPABASE_SETUP.md) → Troubleshooting
