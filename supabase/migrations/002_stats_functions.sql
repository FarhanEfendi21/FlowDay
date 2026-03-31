-- ============================================================
-- FlowDay – Migration 002: Stats RPC Functions
-- Server-side aggregations untuk performa optimal
-- Jalankan setelah 001_initial_schema.sql
-- ============================================================

-- ─────────────────────────────────────────────
-- RPC: get_weekly_task_stats
-- Mengembalikan jumlah task selesai per hari
-- selama 7 hari terakhir (group by date)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_weekly_task_stats(p_user_id UUID)
RETURNS TABLE (
  stat_date  DATE,
  completed  BIGINT,
  created    BIGINT
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    gs::DATE                                             AS stat_date,
    COUNT(t.id) FILTER (
      WHERE t.status = 'done'
        AND t.updated_at::DATE = gs::DATE
    )                                                    AS completed,
    COUNT(t.id) FILTER (
      WHERE t.created_at::DATE = gs::DATE
    )                                                    AS created
  FROM generate_series(
    (CURRENT_DATE - INTERVAL '6 days'),
    CURRENT_DATE,
    INTERVAL '1 day'
  ) AS gs
  LEFT JOIN public.tasks t
    ON  t.user_id = p_user_id
    AND (t.updated_at::DATE = gs::DATE OR t.created_at::DATE = gs::DATE)
  GROUP BY gs
  ORDER BY gs ASC;
END;
$$;

-- ─────────────────────────────────────────────
-- RPC: get_subject_task_stats
-- Mengembalikan ringkasan per mata kuliah:
-- total task, selesai, pending, overdue
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_subject_task_stats(p_user_id UUID)
RETURNS TABLE (
  subject   TEXT,
  total     BIGINT,
  completed BIGINT,
  pending   BIGINT,
  overdue   BIGINT
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.subject,
    COUNT(*)                                              AS total,
    COUNT(*) FILTER (WHERE t.status = 'done')             AS completed,
    COUNT(*) FILTER (WHERE t.status = 'todo')             AS pending,
    COUNT(*) FILTER (
      WHERE t.status = 'todo'
        AND t.due_date < CURRENT_DATE
    )                                                     AS overdue
  FROM public.tasks t
  WHERE t.user_id = p_user_id
    AND t.subject != ''
  GROUP BY t.subject
  ORDER BY total DESC;
END;
$$;

-- ─────────────────────────────────────────────
-- RPC: get_habit_stats
-- Mengembalikan habit + streak + completion rate
-- 30 hari terakhir per habit
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_habit_stats(p_user_id UUID)
RETURNS TABLE (
  habit_id        UUID,
  title           TEXT,
  current_streak  INT,
  longest_streak  INT,
  completion_rate NUMERIC,
  total_days      BIGINT,
  completed_days  BIGINT
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH log_stats AS (
    SELECT
      hl.habit_id,
      COUNT(*)                                   AS total_days,
      COUNT(*) FILTER (WHERE hl.completed = TRUE) AS completed_days
    FROM public.habit_logs hl
    WHERE hl.user_id = p_user_id
      AND hl.log_date >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY hl.habit_id
  ),
  streak_data AS (
    SELECT
      hl.habit_id,
      MAX(hl.log_date) AS last_log,
      -- Longest streak approximation via window function
      MAX(streak_len) AS longest_streak
    FROM (
      SELECT
        hl.habit_id,
        hl.log_date,
        COUNT(*) OVER (
          PARTITION BY hl.habit_id, (
            hl.log_date - ROW_NUMBER() OVER (
              PARTITION BY hl.habit_id ORDER BY hl.log_date
            ) * INTERVAL '1 day'
          )
        ) AS streak_len
      FROM public.habit_logs hl
      WHERE hl.user_id = p_user_id AND hl.completed = TRUE
    ) sub
    GROUP BY sub.habit_id
  )
  SELECT
    h.id                                         AS habit_id,
    h.title,
    h.current_streak,
    COALESCE(sd.longest_streak, 0)::INT          AS longest_streak,
    CASE
      WHEN ls.total_days = 0 THEN 0
      ELSE ROUND((ls.completed_days::NUMERIC / ls.total_days::NUMERIC) * 100, 1)
    END                                          AS completion_rate,
    COALESCE(ls.total_days, 0)                   AS total_days,
    COALESCE(ls.completed_days, 0)               AS completed_days
  FROM public.habits h
  LEFT JOIN log_stats ls ON ls.habit_id = h.id
  LEFT JOIN streak_data sd ON sd.habit_id = h.id
  WHERE h.user_id = p_user_id
  ORDER BY h.current_streak DESC, h.created_at ASC;
END;
$$;

-- ─────────────────────────────────────────────
-- RPC: get_dashboard_summary
-- Satu query untuk semua stats dashboard
-- ─────────────────────────────────────────────
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
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Task stats
    COUNT(t.id)                                               AS total_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'done')              AS completed_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'todo')              AS pending_tasks,
    COUNT(t.id) FILTER (
      WHERE t.status = 'todo' AND t.due_date < CURRENT_DATE
    )                                                         AS overdue_tasks,
    COUNT(t.id) FILTER (
      WHERE t.status = 'todo' AND t.due_date = CURRENT_DATE
    )                                                         AS tasks_due_today,
    COUNT(t.id) FILTER (
      WHERE t.status = 'todo'
        AND t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    )                                                         AS tasks_due_week,
    -- Habit stats (subquery)
    (SELECT COUNT(*) FROM public.habits h WHERE h.user_id = p_user_id)
                                                              AS total_habits,
    (SELECT COALESCE(SUM(h.current_streak), 0)
     FROM   public.habits h WHERE h.user_id = p_user_id)     AS total_streak,
    (SELECT COUNT(DISTINCT hl.habit_id)
     FROM   public.habit_logs hl
     WHERE  hl.user_id  = p_user_id
       AND  hl.log_date = CURRENT_DATE
       AND  hl.completed = TRUE)                              AS habits_done_today
  FROM public.tasks t
  WHERE t.user_id = p_user_id;
END;
$$;

-- Grant execute ke anon/authenticated roles
GRANT EXECUTE ON FUNCTION public.get_weekly_task_stats(UUID)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subject_task_stats(UUID)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_habit_stats(UUID)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary(UUID)    TO authenticated;
