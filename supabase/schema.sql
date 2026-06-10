-- Tabela de Enquetes
CREATE TABLE public.enquetes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  userId uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  groupId text,
  dataCriacao TEXT NOT NULL,
  dataEncerramento TEXT,
  titulo TEXT NOT NULL,
  presentes INTEGER DEFAULT 0,
  fotos INTEGER DEFAULT 0,
  cor TEXT DEFAULT '#004643',
  locais TEXT[] DEFAULT '{}',
  datas TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'encerrada')),
  ponderada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW ()
);

CREATE INDEX idx_enquetes_userId ON public.enquetes (userId);
CREATE INDEX idx_enquetes_groupId ON public.enquetes (groupId);
CREATE INDEX idx_enquetes_status ON public.enquetes (status);

-- Tabela de Membros
CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  enqueteId uuid NOT NULL REFERENCES public.enquetes (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW ()
);

CREATE INDEX idx_members_enqueteId ON public.members (enqueteId);

-- Tabela de Votos
CREATE TABLE public.votos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  enqueteId uuid NOT NULL REFERENCES public.enquetes (id) ON DELETE CASCADE,
  memberId uuid NOT NULL REFERENCES public.members (id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('sim', 'nao', 'talvez')),
  timestamp INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW ()
);

CREATE INDEX idx_votos_enqueteId ON public.votos (enqueteId);
CREATE INDEX idx_votos_memberId ON public.votos (memberId);

-- Tabela de Grupos do usuário
CREATE TABLE IF NOT EXISTS public.user_groups (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  group_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_groups_user_id ON public.user_groups (user_id);

ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own groups"
  ON public.user_groups
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view accepted group copies"
  ON public.user_groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_invites
      WHERE public.group_invites.group_id = (public.user_groups.group_data ->> 'id')
        AND public.group_invites.status = 'accepted'
        AND lower(public.group_invites.to_email) = lower((current_setting('request.jwt.claims', true))::json ->> 'email')
    )
  );

CREATE POLICY "Users can insert their own groups"
  ON public.user_groups
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own groups"
  ON public.user_groups
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update accepted group copies"
  ON public.user_groups
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.group_invites
      WHERE public.group_invites.group_id = (public.user_groups.group_data ->> 'id')
        AND public.group_invites.status = 'accepted'
        AND lower(public.group_invites.to_email) = lower((current_setting('request.jwt.claims', true))::json ->> 'email')
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.group_invites
      WHERE public.group_invites.group_id = (public.user_groups.group_data ->> 'id')
        AND public.group_invites.status = 'accepted'
        AND lower(public.group_invites.to_email) = lower((current_setting('request.jwt.claims', true))::json ->> 'email')
    )
  );

CREATE POLICY "Users can delete their own groups"
  ON public.user_groups
  FOR DELETE
  USING (user_id = auth.uid());

-- Tabela de convites de grupo
CREATE TABLE IF NOT EXISTS public.group_invites (
  id text PRIMARY KEY,
  group_id text NOT NULL,
  group_name text NOT NULL,
  group_snapshot jsonb NOT NULL,
  from_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  from_user_name text NOT NULL,
  to_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_invites_to_email ON public.group_invites (to_email);

ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select invites addressed to them" ON public.group_invites;
CREATE POLICY "Users can select invites addressed to them"
  ON public.group_invites
  FOR SELECT
  USING (
    lower(to_email) = lower((current_setting('request.jwt.claims', true))::json ->> 'email')
  );

DROP POLICY IF EXISTS "Users can insert their own invites" ON public.group_invites;
CREATE POLICY "Users can insert their own invites"
  ON public.group_invites
  FOR INSERT
  WITH CHECK (from_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own sent invites" ON public.group_invites;
CREATE POLICY "Users can update their own sent invites"
  ON public.group_invites
  FOR UPDATE
  USING (from_user_id = auth.uid())
  WITH CHECK (from_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can accept or reject invites sent to them" ON public.group_invites;
CREATE POLICY "Users can accept or reject invites sent to them"
  ON public.group_invites
  FOR UPDATE
  USING (
    lower(to_email) = lower((current_setting('request.jwt.claims', true))::json ->> 'email')
  )
  WITH CHECK (
    status IN ('accepted','rejected')
  );

DROP POLICY IF EXISTS "Users can delete their own sent invites" ON public.group_invites;
CREATE POLICY "Users can delete their own sent invites"
  ON public.group_invites
  FOR DELETE
  USING (from_user_id = auth.uid());

-- Perfil do usuário (avatar)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  name text,
  avatar_uri text,
  avatar_color text,
  push_token text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS avatar_uri text,
  ADD COLUMN IF NOT EXISTS avatar_color text,
  ADD COLUMN IF NOT EXISTS push_token text;

-- RLS (Row Level Security) - Permitir que cada usuário veja apenas suas próprias enquetes
ALTER TABLE public.enquetes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enquetes"
  ON public.enquetes
  FOR SELECT
  USING (auth.uid () = userId);

CREATE POLICY "Users can view enquetes in their groups"
  ON public.enquetes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_groups
      WHERE public.user_groups.user_id = auth.uid()
        AND (public.user_groups.group_data ->> 'id') = public.enquetes.groupId
    )
  );

CREATE POLICY "Users can insert their own enquetes"
  ON public.enquetes
  FOR INSERT
  WITH CHECK (auth.uid () = userId);

-- Allow updates by the owner or by users who belong to the enquete's group.
-- This permits group members to finalize a poll even if they are not the creator.
DROP POLICY IF EXISTS "Users can update their own enquetes" ON public.enquetes;
CREATE POLICY "Users can update enquetes for owner or group members"
  ON public.enquetes
  FOR UPDATE
  USING (
    auth.uid() = userId
    OR (
      EXISTS (
        SELECT 1 FROM public.user_groups
        WHERE public.user_groups.user_id = auth.uid()
          AND (public.user_groups.group_data ->> 'id') = public.enquetes.groupId
      )
    )
  )
  WITH CHECK (
    auth.uid() = userId
    OR (
      EXISTS (
        SELECT 1 FROM public.user_groups
        WHERE public.user_groups.user_id = auth.uid()
          AND (public.user_groups.group_data ->> 'id') = public.enquetes.groupId
      )
    )
  );

CREATE POLICY "Users can delete their own enquetes"
  ON public.enquetes
  FOR DELETE
  USING (auth.uid () = userId);

-- RLS para Members (acesso via enquetes do usuário)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members in their enquetes"
  ON public.members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.enquetes
      WHERE public.enquetes.id = public.members.enqueteId
        AND public.enquetes.userId = auth.uid ()
    )
  );

CREATE POLICY "Users can insert members in their enquetes"
  ON public.members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.enquetes
      WHERE public.enquetes.id = public.members.enqueteId
        AND public.enquetes.userId = auth.uid ()
    )
  );

CREATE POLICY "Users can update members in their enquetes"
  ON public.members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.enquetes
      WHERE public.enquetes.id = public.members.enqueteId
        AND public.enquetes.userId = auth.uid ()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.enquetes
      WHERE public.enquetes.id = public.members.enqueteId
        AND public.enquetes.userId = auth.uid ()
    )
  );

-- RLS para Votos
ALTER TABLE public.votos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votos in their enquetes"
  ON public.votos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.enquetes
      WHERE public.enquetes.id = public.votos.enqueteId
        AND public.enquetes.userId = auth.uid ()
    )
  );

CREATE POLICY "Users can insert votos in their enquetes"
  ON public.votos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.enquetes
      WHERE public.enquetes.id = public.votos.enqueteId
        AND public.enquetes.userId = auth.uid ()
    )
  );

CREATE POLICY "Users can update votos in their enquetes"
  ON public.votos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.enquetes
      WHERE public.enquetes.id = public.votos.enqueteId
        AND public.enquetes.userId = auth.uid ()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.enquetes
      WHERE public.enquetes.id = public.votos.enqueteId
        AND public.enquetes.userId = auth.uid ()
    )
  );
