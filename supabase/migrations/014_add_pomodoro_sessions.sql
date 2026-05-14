-- Migration: Add Pomodoro Sessions
-- Description: Track pomodoro timer sessions for productivity analytics

-- ─── Create pomodoro_sessions table ────────────────────────────
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  
  -- Session details
  type TEXT NOT NULL CHECK (type IN ('work', 'short_break', 'long_break')),
  duration_minutes INTEGER NOT NULL, -- Planned duration
  completed_minutes INTEGER DEFAULT 0, -- Actual completed time
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  
  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Create indexes ─────────────────────────────────────────────
CREATE INDEX idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_task_id ON public.pomodoro_sessions(task_id);
CREATE INDEX idx_pomodoro_sessions_started_at ON public.pomodoro_sessions(started_at DESC);
CREATE INDEX idx_pomodoro_sessions_user_status ON public.pomodoro_sessions(user_id, status);

-- ─── Enable RLS ─────────────────────────────────────────────────
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies ───────────────────────────────────────────────
CREATE POLICY "Users can view own pomodoro sessions"
  ON public.pomodoro_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pomodoro sessions"
  ON public.pomodoro_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pomodoro sessions"
  ON public.pomodoro_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pomodoro sessions"
  ON public.pomodoro_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Trigger: Update updated_at ────────────────────────────────
DROP TRIGGER IF EXISTS trg_pomodoro_sessions_updated_at ON public.pomodoro_sessions;
CREATE TRIGGER trg_pomodoro_sessions_updated_at
  BEFORE UPDATE ON public.pomodoro_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ─── RPC: Get Pomodoro Stats ───────────────────────────────────
CREATE OR REPLACE FUNCTION get_pomodoro_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sessions', COUNT(*),
    'completed_sessions', COUNT(*) FILTER (WHERE status = 'completed'),
    'total_work_minutes', COALESCE(SUM(completed_minutes) FILTER (WHERE type = 'work'), 0),
    'total_break_minutes', COALESCE(SUM(completed_minutes) FILTER (WHERE type IN ('short_break', 'long_break')), 0),
    'daily_breakdown', (
      SELECT json_agg(
        json_build_object(
          'date', date_trunc('day', started_at)::date,
          'work_minutes', COALESCE(SUM(completed_minutes) FILTER (WHERE type = 'work'), 0),
          'sessions', COUNT(*)
        )
        ORDER BY date_trunc('day', started_at) DESC
      )
      FROM public.pomodoro_sessions
      WHERE user_id = p_user_id
        AND started_at >= NOW() - (p_days || ' days')::INTERVAL
        AND status = 'completed'
      GROUP BY date_trunc('day', started_at)
    )
  )
  INTO result
  FROM public.pomodoro_sessions
  WHERE user_id = p_user_id
    AND started_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  RETURN result;
END;
$$;

-- ─── Add pomodoro_settings to user preferences ─────────────────
-- Store user's pomodoro preferences in notification_preferences table
-- (reusing existing table to avoid another migration)
ALTER TABLE public.notification_preferences
ADD COLUMN IF NOT EXISTS pomodoro_work_duration INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS pomodoro_short_break INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS pomodoro_long_break INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS pomodoro_sessions_until_long_break INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS pomodoro_auto_start_breaks BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pomodoro_auto_start_work BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pomodoro_sound_enabled BOOLEAN DEFAULT true;
