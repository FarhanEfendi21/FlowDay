-- ============================================================
-- FlowDay – Migration 003: User Subjects
-- Tabel mata kuliah per-user (tidak hardcoded, fully isolated)
-- ============================================================

-- ─────────────────────────────────────────────
-- TABLE: user_subjects
-- Setiap user punya daftar mata kuliah sendiri
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_subjects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Satu user tidak bisa punya nama mapel yang sama dua kali
  UNIQUE (user_id, name)
);

-- Index untuk query cepat per user
CREATE INDEX idx_user_subjects_user_id ON public.user_subjects (user_id, created_at ASC);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subjects"
  ON public.user_subjects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subjects"
  ON public.user_subjects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjects"
  ON public.user_subjects FOR DELETE
  USING (auth.uid() = user_id);
