-- supabase/migrations/009_add_notification_preferences.sql

-- Table untuk notification preferences per user
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  deadline_reminders BOOLEAN DEFAULT true,
  habit_reminders BOOLEAN DEFAULT true,
  streak_milestones BOOLEAN DEFAULT true,
  task_complete BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '20:00:00', -- Default 8 PM for habit reminders
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
  ON public.notification_preferences(user_id);

-- RLS Policies
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger untuk update updated_at
CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_fcm_token_updated_at();

-- Function untuk get user preferences dengan default values
CREATE OR REPLACE FUNCTION get_notification_preferences(p_user_id UUID)
RETURNS TABLE (
  deadline_reminders BOOLEAN,
  habit_reminders BOOLEAN,
  streak_milestones BOOLEAN,
  task_complete BOOLEAN,
  reminder_time TIME
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(np.deadline_reminders, true),
    COALESCE(np.habit_reminders, true),
    COALESCE(np.streak_milestones, true),
    COALESCE(np.task_complete, true),
    COALESCE(np.reminder_time, '20:00:00'::TIME)
  FROM public.notification_preferences np
  WHERE np.user_id = p_user_id
  UNION ALL
  SELECT true, true, true, true, '20:00:00'::TIME
  WHERE NOT EXISTS (
    SELECT 1 FROM public.notification_preferences WHERE user_id = p_user_id
  )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default preferences for existing users
INSERT INTO public.notification_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
