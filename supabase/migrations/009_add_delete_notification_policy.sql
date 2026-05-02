-- supabase/migrations/009_add_delete_notification_policy.sql
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
