-- supabase/migrations/011_add_urgent_deadline_type.sql

-- Add comment to document notification types
COMMENT ON COLUMN public.notifications.type IS 
'Notification types: deadline (H-1), urgent_deadline (2 hours before), habit_reminder, streak_milestone, task_complete';

-- No schema changes needed, just documenting the new type
-- The type column already accepts TEXT, so 'urgent_deadline' will work

-- Optional: Add index for better performance on type queries
CREATE INDEX IF NOT EXISTS idx_notifications_type_created 
  ON public.notifications(type, created_at DESC);
