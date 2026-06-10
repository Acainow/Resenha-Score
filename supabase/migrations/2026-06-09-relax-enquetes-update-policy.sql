-- Migration: Relax update policy on public.enquetes to allow group members (or owners) to update rows

-- Drop existing update policy (if any)
DROP POLICY IF EXISTS "Users can update their own enquetes" ON public.enquetes;

-- Create a policy that allows the owner or any member of the enquete's group to update the row.
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
