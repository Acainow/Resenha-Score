-- Migration: Garante colunas mínimas na tabela profiles para salvar perfil e avatar
BEGIN;

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

COMMIT;
