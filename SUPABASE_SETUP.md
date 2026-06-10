# Integração com Supabase

## ⚙️ Setup Final

Agora vou resumir o que foi feito e o que falta configurar:

### 1. **Criar Conta no Supabase**
   - Acesse [supabase.com](https://supabase.com) e crie uma nova conta
   - Crie um novo projeto (escolha a região mais próxima)
   - Copie `PROJECT_URL` e `ANON_KEY` de Settings → API

### 2. **Variáveis de Ambiente**
   - Copie `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   - Preencha as variáveis com seus dados do Supabase:
     ```env
     EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
     ```

### 3. **Executar SQL Schema**
   - Abra o **SQL Editor** do Supabase
   - Cole o conteúdo de `supabase/schema.sql`
   - Execute os comandos para criar tabelas e RLS

### 4. **Habilitar Realtime** (opcional)
   - No Supabase: Database → Replication
   - Ative para as tabelas `enquetes`, `members`, `votos`

### 5. **Instalar Dependências**
   ```bash
   npm install
   ```

### 6. **Migrar Dados Locais Existentes** (opcional)
   - Se você tem dados locais em `SecureStore`, implemente uma função de migração em `GlobalContext.tsx`
   - Examplos: `migrateLocalDataToSupabase()`

---

## 🔐 Autenticação

- **Login/Signup**: Use `signIn()` e `signUp()` do contexto
- **Sessão**: Automaticamente sincronizada com `supabase.auth.onAuthStateChange()`
- **Logout**: Use `signOut()`

---

## 🔄 Sincronização em Tempo Real

3 listeners (canais Realtime) escutam mudanças:
- `enquetes`: CREATE, UPDATE, DELETE
- `members`: CREATE, UPDATE, DELETE
- `votos`: CREATE, UPDATE, DELETE

Todos os eventos atualizam o estado React imediatamente.

---

## 📱 Múltiplos Usuários

Agora diferentes usuários podem:
1. **Criar contas** e fazer login
2. **Criar enquetes** privadas
3. **Ver dados em tempo real** quando membros votam
4. **Compartilhar** via código ou link (implemente depois)

---

## 🚀 Próximos Passos

1. [ ] Testar login/signup
2. [ ] Criar uma enquete e verificar no Supabase
3. [ ] Abrir em dois devices/simuladores → observe sincronização em tempo real
4. [ ] Implementar compartilhamento de enquetes (convite de código)
5. [ ] Build para iOS/Android

---

## ⚠️ Troubleshooting

**Erro: "Supabase URL e Anon Key são obrigatórios"**
- Verifique se `.env` existe e tem as variáveis corretas
- Reconstrua o app: `npm start -- -c`

**Autenticação não funciona**
- Verifique email confirmation no Supabase → Auth → Users
- Valide as regras de RLS

**Realtime não sincroniza**
- Verifique que Replication está ativado para as tabelas
- Confirme que RLS está habilitado

---

## 📚 Docs Úteis

- [Supabase Docs](https://supabase.com/docs)
- [Expo + Supabase](https://supabase.com/docs/guides/getting-started/libraries/expo)
- [Realtime](https://supabase.com/docs/guides/realtime)
