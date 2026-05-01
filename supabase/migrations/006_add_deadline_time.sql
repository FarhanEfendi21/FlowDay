-- ============================================================
-- FlowDay – Migration 006: Add Deadline Time Support (FINAL)
-- Mengubah due_date dari DATE menjadi TIMESTAMPTZ
-- untuk support waktu realtime dalam deadline
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. Backup data existing (convert DATE to TIMESTAMPTZ)
-- ─────────────────────────────────────────────

-- Tambah kolom temporary untuk due_datetime
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS due_datetime TIMESTAMPTZ;

-- Copy data dari due_date ke due_datetime
-- Set default time ke 23:59:59 untuk backward compatibility
UPDATE public.tasks
SET due_datetime = CAST(due_date AS DATE) + TIME '23:59:59'
WHERE due_datetime IS NULL;

-- ─────────────────────────────────────────────
-- 2. Drop kolom lama dan rename kolom baru
-- ─────────────────────────────────────────────

-- Drop kolom due_date lama
ALTER TABLE public.tasks 
DROP COLUMN IF EXISTS due_date;

-- Rename due_datetime menjadi due_date
ALTER TABLE public.tasks 
RENAME COLUMN due_datetime TO due_date;

-- Set NOT NULL constraint
ALTER TABLE public.tasks 
ALTER COLUMN due_date SET NOT NULL;

-- Set default untuk new records (end of day)
ALTER TABLE public.tasks 
ALTER COLUMN due_date SET DEFAULT (CURRENT_DATE + TIME '23:59:59');

-- ─────────────────────────────────────────────
-- 3. Update indexes untuk performa
-- ─────────────────────────────────────────────

-- Drop index lama jika ada
DROP INDEX IF EXISTS idx_tasks_user_due_date;
DROP INDEX IF EXISTS idx_tasks_overdue;

-- Create index baru dengan TIMESTAMPTZ
-- Index untuk query tasks by user dan due_date
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_datetime 
ON public.tasks (user_id, due_date ASC) 
WHERE deleted_at IS NULL;

-- Index untuk todo tasks (untuk query overdue)
CREATE INDEX IF NOT EXISTS idx_tasks_todo_due_date 
ON public.tasks (user_id, due_date ASC) 
WHERE deleted_at IS NULL AND status = 'todo';

-- Index untuk status filtering
CREATE INDEX IF NOT EXISTS idx_tasks_user_status_due 
ON public.tasks (user_id, status, due_date ASC) 
WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────
-- 4. Update RPC Functions untuk support datetime
-- ─────────────────────────────────────────────

-- Update get_dashboard_summary untuk datetime comparison
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_user_id UUID)
RETURNS TABLE (
  total_tasks       BIGINT,
  completed_tasks   BIGINT,
  pending_tasks     BIGINT,
  overdue_tasks     BIGINT,
  tasks_due_today   BIGINT,
  tasks_due_week    BIGINT,
  total_habits      BIGINT,
  total_streak      BIGINT,
  habits_done_today BIGINT
) 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER 
AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Task stats
    (SELECT COUNT(*) FROM public.tasks t WHERE t.user_id = p_user_id AND t.deleted_at IS NULL)::BIGINT AS total_tasks,
    (SELECT COUNT(*) FROM public.tasks t WHERE t.user_id = p_user_id AND t.deleted_at IS NULL AND t.status = 'done')::BIGINT AS completed_tasks,
    (SELECT COUNT(*) FROM public.tasks t WHERE t.user_id = p_user_id AND t.deleted_at IS NULL AND t.status = 'todo')::BIGINT AS pending_tasks,
    (SELECT COUNT(*) FROM public.tasks t WHERE t.user_id = p_user_id AND t.deleted_at IS NULL AND t.status = 'todo' AND t.due_date < NOW())::BIGINT AS overdue_tasks,
    (SELECT COUNT(*) FROM public.tasks t WHERE t.user_id = p_user_id AND t.deleted_at IS NULL AND t.status = 'todo' AND t.due_date::DATE = CURRENT_DATE)::BIGINT AS tasks_due_today,
    (SELECT COUNT(*) FROM public.tasks t WHERE t.user_id = p_user_id AND t.deleted_at IS NULL AND t.status = 'todo' AND t.due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days')::BIGINT AS tasks_due_week,
    -- Habit stats
    (SELECT COUNT(*) FROM public.habits h WHERE h.user_id = p_user_id AND h.deleted_at IS NULL)::BIGINT AS total_habits,
    (SELECT COALESCE(SUM(h.current_streak), 0) FROM public.habits h WHERE h.user_id = p_user_id AND h.deleted_at IS NULL)::BIGINT AS total_streak,
    (SELECT COUNT(DISTINCT hl.habit_id) FROM public.habit_logs hl WHERE hl.user_id = p_user_id AND hl.log_date = CURRENT_DATE AND hl.completed = TRUE)::BIGINT AS habits_done_today;
END;
$$;

-- Update get_subject_task_stats untuk datetime comparison
CREATE OR REPLACE FUNCTION public.get_subject_task_stats(p_user_id UUID)
RETURNS TABLE (
  subject   TEXT,
  total     BIGINT,
  completed BIGINT,
  pending   BIGINT,
  overdue   BIGINT
) 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER 
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.subject,
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE t.status = 'done')::BIGINT AS completed,
    COUNT(*) FILTER (WHERE t.status = 'todo')::BIGINT AS pending,
    COUNT(*) FILTER (WHERE t.status = 'todo' AND t.due_date < NOW())::BIGINT AS overdue
  FROM public.tasks t
  WHERE t.user_id = p_user_id
    AND t.deleted_at IS NULL
    AND t.subject != ''
  GROUP BY t.subject
  ORDER BY total DESC;
END;
$$;

-- ─────────────────────────────────────────────
-- 5. Add helper function untuk countdown
-- ─────────────────────────────────────────────

-- Function untuk mendapatkan tasks dengan countdown info
CREATE OR REPLACE FUNCTION public.get_tasks_with_countdown(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  subject TEXT,
  priority task_priority,
  status task_status,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_overdue BOOLEAN,
  hours_remaining NUMERIC,
  minutes_remaining NUMERIC,
  days_remaining NUMERIC
) 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER 
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.description,
    t.subject,
    t.priority,
    t.status,
    t.due_date,
    t.created_at,
    t.updated_at,
    (t.due_date < NOW()) AS is_overdue,
    EXTRACT(EPOCH FROM (t.due_date - NOW())) / 3600 AS hours_remaining,
    EXTRACT(EPOCH FROM (t.due_date - NOW())) / 60 AS minutes_remaining,
    EXTRACT(EPOCH FROM (t.due_date - NOW())) / 86400 AS days_remaining
  FROM public.tasks t
  WHERE t.user_id = p_user_id
    AND t.deleted_at IS NULL
  ORDER BY t.due_date ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subject_task_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tasks_with_countdown(UUID) TO authenticated;

-- ─────────────────────────────────────────────
-- 6. Add comment untuk dokumentasi
-- ─────────────────────────────────────────────

COMMENT ON COLUMN public.tasks.due_date IS 'Deadline dengan waktu realtime (TIMESTAMPTZ). Format: 2024-12-31 23:59:59+00';
COMMENT ON FUNCTION public.get_tasks_with_countdown IS 'Mendapatkan tasks dengan informasi countdown realtime (hours, minutes, days remaining)';
