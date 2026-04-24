-- ============================================================
-- FlowDay – Initial Database Schema
-- Clean architecture: profiles, tasks, habits, habit_logs
-- ============================================================

-- ─────────────────────────────────────────────
-- ENUMS (Gunakan DO block agar tidak error jika sudah ada)
-- ─────────────────────────────────────────────
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status   AS ENUM ('todo', 'done');
    END IF;
END $$;

-- ─────────────────────────────────────────────
-- TABLE: profiles
-- Auto-populated when a new auth.user is created
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: tasks
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 255),
  description TEXT,
  subject     TEXT NOT NULL DEFAULT '',
  priority    task_priority NOT NULL DEFAULT 'medium',
  status      task_status   NOT NULL DEFAULT 'todo',
  due_date    DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Efficient query: list by deadline + filter by subject
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON public.tasks (user_id, due_date ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_subject  ON public.tasks (user_id, subject);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status   ON public.tasks (user_id, status);

-- ─────────────────────────────────────────────
-- TABLE: habits
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.habits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  current_streak  INT  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits (user_id);

-- ─────────────────────────────────────────────
-- TABLE: habit_logs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id   UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  log_date   DATE NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One log per habit per day
  UNIQUE (habit_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs (habit_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date  ON public.habit_logs (user_id, log_date DESC);

-- ─────────────────────────────────────────────
-- FUNCTION: auto-update updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Gunakan DROP TRIGGER IF EXISTS + CREATE TRIGGER agar idempotent
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_habits_updated_at ON public.habits;
CREATE TRIGGER trg_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- FUNCTION: auto-create profile on signup
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- FUNCTION: recalculate habit streak
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.recalculate_habit_streak(p_habit_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_streak INT := 0;
  v_check  DATE := CURRENT_DATE;
  v_log    RECORD;
BEGIN
  -- Iterasi mundur dari hari ini untuk cek streak
  FOR v_log IN
    SELECT log_date
    FROM public.habit_logs
    WHERE habit_id = p_habit_id AND completed = TRUE
    ORDER BY log_date DESC
  LOOP
    IF v_log.log_date = v_check THEN
      v_streak := v_streak + 1;
      v_check  := v_check - INTERVAL '1 day';
    ELSIF v_log.log_date < v_check THEN
      -- Jika ada bolong, streak putus
      EXIT;
    END IF;
  END LOOP;

  UPDATE public.habits
  SET current_streak = v_streak
  WHERE id = p_habit_id;
END;
$$;

-- Trigger: recalculate streak after each log insert/update
CREATE OR REPLACE FUNCTION public.handle_habit_log_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.recalculate_habit_streak(COALESCE(NEW.habit_id, OLD.habit_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_habit_log_streak ON public.habit_logs;
CREATE TRIGGER trg_habit_log_streak
  AFTER INSERT OR UPDATE OR DELETE ON public.habit_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_habit_log_change();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: View/Update own
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tasks: CRUD own
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Habits: CRUD own
DROP POLICY IF EXISTS "Users can view own habits" ON public.habits;
CREATE POLICY "Users can view own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own habits" ON public.habits;
CREATE POLICY "Users can insert own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own habits" ON public.habits;
CREATE POLICY "Users can update own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habits" ON public.habits;
CREATE POLICY "Users can delete own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Habit Logs: CRUD own
DROP POLICY IF EXISTS "Users can view own habit logs" ON public.habit_logs;
CREATE POLICY "Users can view own habit logs" ON public.habit_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own habit logs" ON public.habit_logs;
CREATE POLICY "Users can insert own habit logs" ON public.habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own habit logs" ON public.habit_logs;
CREATE POLICY "Users can update own habit logs" ON public.habit_logs FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habit logs" ON public.habit_logs;
CREATE POLICY "Users can delete own habit logs" ON public.habit_logs FOR DELETE USING (auth.uid() = user_id);
