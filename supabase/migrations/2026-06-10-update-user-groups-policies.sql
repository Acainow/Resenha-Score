-- Migration: 2026-06-10
-- Purpose: Allow group members (and the owner) to SELECT and UPDATE their copies
-- of a group stored in `user_groups` by checking membership inside the
-- `group_data->'members'` JSONB array (matching either member `id` or `email`).

BEGIN;

-- Ensure RLS is enabled on user_groups
ALTER TABLE IF EXISTS public.user_groups ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies we intend to replace
DROP POLICY IF EXISTS allow_owner_or_members_select ON public.user_groups;
DROP POLICY IF EXISTS allow_owner_or_members_update ON public.user_groups;

-- Policy: allow owner or any listed member to SELECT
CREATE POLICY allow_owner_or_members_select
	ON public.user_groups
	FOR SELECT
	USING (
		-- owner always allowed
		user_id = auth.uid()
		OR (
			-- any member listed in group_data->'members' whose id equals auth.uid()
			EXISTS (
				SELECT 1
				FROM jsonb_array_elements(user_groups.group_data->'members') AS m
				WHERE (m->>'id') = auth.uid()::text
			)
		)
		OR (
			-- or any member listed by email matching the JWT email claim
			EXISTS (
				SELECT 1
				FROM jsonb_array_elements(user_groups.group_data->'members') AS m
				WHERE (m->>'email') = current_setting('jwt.claims.email', true)
			)
		)
	);

-- Policy: allow owner or any listed member to UPDATE
CREATE POLICY allow_owner_or_members_update
	ON public.user_groups
	FOR UPDATE
	USING (
		user_id = auth.uid()
		OR (
			EXISTS (
				SELECT 1
				FROM jsonb_array_elements(user_groups.group_data->'members') AS m
				WHERE (m->>'id') = auth.uid()::text
			)
		)
		OR (
			EXISTS (
				SELECT 1
				FROM jsonb_array_elements(user_groups.group_data->'members') AS m
				WHERE (m->>'email') = current_setting('jwt.claims.email', true)
			)
		)
	);

COMMIT;

-- Notes:
-- 1) This policy checks membership by comparing either a member's `id` to
--    `auth.uid()` or the member `email` to the JWT claim `email` (via
--    `current_setting('jwt.claims.email', true)`). Ensure your JWT includes
--    `email` in the claims (Supabase does this by default).
-- 2) After applying this migration in Supabase, existing client flows that
--    accept/reject invites should be able to UPDATE the `group_invites`
--    / `user_groups` rows when the authenticated user is recognized as a
--    member.
