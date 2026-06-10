-- Migração: vincula enquetes a grupos para que a tela do grupo possa filtrá-las corretamente
BEGIN;

ALTER TABLE public.enquetes
  ADD COLUMN IF NOT EXISTS groupId text;

CREATE INDEX IF NOT EXISTS idx_enquetes_groupId
  ON public.enquetes (groupId);

COMMIT;