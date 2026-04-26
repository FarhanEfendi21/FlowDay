-- ============================================================
-- FlowDay – Add Soft Delete to Habits
-- Menambahkan kolom deleted_at untuk soft delete functionality
-- ============================================================

-- Tambah kolom deleted_at ke tabel habits
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index untuk query habits yang tidak dihapus (deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_habits_deleted_at ON public.habits (user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Index untuk query trash (deleted_at IS NOT NULL)
CREATE INDEX IF NOT EXISTS idx_habits_trash ON public.habits (user_id, deleted_at DESC) 
WHERE deleted_at IS NOT NULL;

-- Function untuk soft delete
CREATE OR REPLACE FUNCTION public.soft_delete_habit(p_habit_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.habits
  SET deleted_at = NOW()
  WHERE id = p_habit_id AND user_id = auth.uid();
END;
$$;

-- Function untuk restore habit dari trash
CREATE OR REPLACE FUNCTION public.restore_habit(p_habit_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.habits
  SET deleted_at = NULL
  WHERE id = p_habit_id AND user_id = auth.uid();
END;
$$;

-- Function untuk permanent delete
CREATE OR REPLACE FUNCTION public.permanent_delete_habit(p_habit_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.habits
  WHERE id = p_habit_id AND user_id = auth.uid();
END;
$$;
