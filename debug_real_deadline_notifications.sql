-- Debug: Why real deadline notifications are not being sent
-- User ID: bdb0ad43-7e65-4a42-adfe-26816b8d4520

-- 1. Check all active tasks with deadlines
SELECT 
  id,
  title,
  subject,
  due_date,
  due_date AT TIME ZONE 'UTC' AS due_date_utc,
  due_date AT TIME ZONE 'Asia/Jakarta' AS due_date_wib,
  status,
  deleted_at,
  EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 AS hours_until_due,
  CASE 
    WHEN EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 BETWEEN 1.5 AND 2.5 THEN '🚨 URGENT (2h window)'
    WHEN due_date::date = (CURRENT_DATE + INTERVAL '1 day')::date THEN '⏰ TOMORROW'
    WHEN due_date > NOW() THEN '⏳ FUTURE'
    ELSE '❌ PAST'
  END AS notification_status
FROM tasks
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520'
  AND status = 'todo'
  AND deleted_at IS NULL
ORDER BY due_date ASC;

-- Expected:
-- If no rows → No active tasks with deadlines!
-- If has rows but notification_status = 'FUTURE' → Wait for the time window
-- If has rows with 'URGENT' or 'TOMORROW' → Should trigger notification

-- 2. Check when cron jobs last ran (from Vercel logs)
-- You need to check Vercel Dashboard → Logs
-- Look for:
-- - /api/notifications/check-urgent-deadlines (runs every hour)
-- - /api/notifications/check-deadlines (runs daily at 02:00 UTC = 09:00 WIB)

-- 3. Check notifications that were actually sent
SELECT 
  id,
  title,
  body,
  type,
  read,
  created_at,
  created_at AT TIME ZONE 'Asia/Jakarta' AS created_at_wib
FROM notifications
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520'
ORDER BY created_at DESC
LIMIT 20;

-- 4. Create test task with EXACT 2-hour deadline for urgent notification
-- This will trigger on next cron run (every hour at :00)
INSERT INTO tasks (user_id, title, subject, due_date, status)
VALUES (
  'bdb0ad43-7e65-4a42-adfe-26816b8d4520',
  '🚨 URGENT TEST - Exactly 2 Hours',
  'Testing Urgent',
  NOW() + INTERVAL '2 hours',
  'todo'
)
RETURNING 
  id, 
  title, 
  due_date,
  due_date AT TIME ZONE 'Asia/Jakarta' AS due_date_wib,
  EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 AS hours_until_due;

-- 5. Create test task for TOMORROW notification
-- This will trigger on next daily cron (02:00 UTC = 09:00 WIB)
INSERT INTO tasks (user_id, title, subject, due_date, status)
VALUES (
  'bdb0ad43-7e65-4a42-adfe-26816b8d4520',
  '⏰ TOMORROW TEST - Daily Notification',
  'Testing Tomorrow',
  (CURRENT_DATE + INTERVAL '1 day' + TIME '14:00:00'),
  'todo'
)
RETURNING 
  id, 
  title, 
  due_date,
  due_date AT TIME ZONE 'Asia/Jakarta' AS due_date_wib;

-- 6. Check Vercel Cron Schedule
-- Go to Vercel Dashboard → Your Project → Cron Jobs
-- Verify these are configured:
-- ✅ /api/notifications/check-urgent-deadlines - "0 * * * *" (every hour)
-- ✅ /api/notifications/check-deadlines - "0 2 * * *" (daily at 02:00 UTC)
-- ✅ /api/notifications/check-habits - "0 13 * * *" (daily at 13:00 UTC)

-- 7. Manual trigger test (after creating tasks above)
-- Go to Vercel Dashboard → Cron Jobs → check-urgent-deadlines → Click "Run"
-- Check logs immediately after
-- Should see:
-- "Found 1 urgent tasks out of X total"
-- "📤 Sending notification for task..."
-- "✅ Notification sent successfully"

-- 8. Check timezone consistency
SELECT 
  NOW() AS server_time_utc,
  NOW() AT TIME ZONE 'Asia/Jakarta' AS server_time_wib,
  CURRENT_DATE AS current_date,
  (CURRENT_DATE + INTERVAL '1 day') AS tomorrow_date;

-- 9. Verify cron job logic matches database
-- Urgent deadline: due_date between NOW() and NOW() + 2 hours
-- Daily deadline: due_date between tomorrow 00:00 and tomorrow 23:59
SELECT 
  'Urgent Window' AS check_type,
  NOW() AS window_start,
  NOW() + INTERVAL '2 hours' AS window_end
UNION ALL
SELECT 
  'Tomorrow Window' AS check_type,
  (CURRENT_DATE + INTERVAL '1 day')::timestamp AS window_start,
  (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '23 hours 59 minutes')::timestamp AS window_end;
