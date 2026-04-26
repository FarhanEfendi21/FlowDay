-- ============================================================
-- FlowDay – Add Soft Delete to Tasks
-- Menambahkan kolom deleted_at untuk soft delete functionality
-- ============================================================

-- Tambah kolom deleted_at ke tabel tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index untuk query tasks yang tidak dihapus (deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON public.tasks (user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Index untuk query trash (deleted_at IS NOT NULL)
CREATE INDEX IF NOT EXISTS idx_tasks_trash ON public.tasks (user_id, deleted_at DESC) 
WHERE deleted_at IS NOT NULL;

-- Function untuk soft delete
CREATE OR REPLACE FUNCTION public.soft_delete_task(p_task_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.tasks
  SET deleted_at = NOW()
  WHERE id = p_task_id AND user_id = auth.uid();
END;
$$;

-- Function untuk restore task dari trash
CREATE OR REPLACE FUNCTION public.restore_task(p_task_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.tasks
  SET deleted_at = NULL
  WHERE id = p_task_id AND user_id = auth.uid();
END;
$$;

-- Function untuk permanent delete
CREATE OR REPLACE FUNCTION public.permanent_delete_task(p_task_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.tasks
  WHERE id = p_task_id AND user_id = auth.uid();
END;
$$;
