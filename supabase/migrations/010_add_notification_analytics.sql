-- supabase/migrations/010_add_notification_analytics.sql

-- Add analytics columns to notifications table
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ;

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_notifications_delivered_at 
  ON public.notifications(delivered_at) WHERE delivered_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_opened_at 
  ON public.notifications(opened_at) WHERE opened_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_type 
  ON public.notifications(type);

-- Function untuk notification analytics
CREATE OR REPLACE FUNCTION get_notification_analytics(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_sent INTEGER,
  total_delivered INTEGER,
  total_opened INTEGER,
  total_clicked INTEGER,
  delivery_rate NUMERIC,
  open_rate NUMERIC,
  click_rate NUMERIC,
  by_type JSONB
) AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  v_start_date := NOW() - (p_days || ' days')::INTERVAL;
  
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*)::INTEGER as sent,
      COUNT(delivered_at)::INTEGER as delivered,
      COUNT(opened_at)::INTEGER as opened,
      COUNT(clicked_at)::INTEGER as clicked,
      type
    FROM public.notifications
    WHERE user_id = p_user_id
      AND created_at >= v_start_date
    GROUP BY type
  ),
  totals AS (
    SELECT
      SUM(sent)::INTEGER as total_sent,
      SUM(delivered)::INTEGER as total_delivered,
      SUM(opened)::INTEGER as total_opened,
      SUM(clicked)::INTEGER as total_clicked
    FROM stats
  )
  SELECT
    t.total_sent,
    t.total_delivered,
    t.total_opened,
    t.total_clicked,
    CASE WHEN t.total_sent > 0 
      THEN ROUND((t.total_delivered::NUMERIC / t.total_sent) * 100, 2)
      ELSE 0 
    END as delivery_rate,
    CASE WHEN t.total_delivered > 0 
      THEN ROUND((t.total_opened::NUMERIC / t.total_delivered) * 100, 2)
      ELSE 0 
    END as open_rate,
    CASE WHEN t.total_opened > 0 
      THEN ROUND((t.total_clicked::NUMERIC / t.total_opened) * 100, 2)
      ELSE 0 
    END as click_rate,
    (SELECT jsonb_object_agg(type, jsonb_build_object(
      'sent', sent,
      'delivered', delivered,
      'opened', opened,
      'clicked', clicked
    )) FROM stats) as by_type
  FROM totals t;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
