-- Migration: Atualiza policies de group_invites para usar email do JWT
-- Objetivo: evitar SELECT em auth.users e eliminar erro de permissão
BEGIN;

DROP POLICY IF EXISTS "Users can select invites addressed to them" ON public.group_invites;
CREATE POLICY "Users can select invites addressed to them"
  ON public.group_invites
  FOR SELECT
  USING (
    lower(to_email) = lower((current_setting('request.jwt.claims', true))::json ->> 'email')
  );

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

COMMIT;

-- Nota: se preferir conceder SELECT em auth.users (menos recomendado), rode:
-- GRANT SELECT ON auth.users TO anon;
