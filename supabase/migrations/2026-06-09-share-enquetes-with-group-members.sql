-- Migração: permite que membros do mesmo grupo leiam enquetes compartilhadas pelo groupId
BEGIN;

DROP POLICY IF EXISTS "Users can view enquetes in their groups" ON public.enquetes;
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

COMMIT;