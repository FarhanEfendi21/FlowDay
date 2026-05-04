-- Check if notification for "Lecture 8" task was already sent
-- Task ID: 5144b057-b208-4d5c-85dd-6fb5c65142c4

-- 1. Check the task details
SELECT 
  id,
  title,
  subject,
  due_date,
  due_date AT TIME ZONE 'Asia/Jakarta' AS due_date_wib,
  status,
  created_at,
  NOW() AS current_time_utc,
  NOW() AT TIME ZONE 'Asia/Jakarta' AS current_time_wib,
  EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 AS hours_until_due
FROM tasks
WHERE id = '5144b057-b208-4d5c-85dd-6fb5c65142c4';

-- 2. Check if notification was sent for this task
SELECT 
  id,
  title,
  body,
  type,
  data,
  created_at,
  created_at AT TIME ZONE 'Asia/Jakarta' AS created_at_wib
FROM notifications
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520'
  AND (
    data->>'taskId' = '5144b057-b208-4d5c-85dd-6fb5c65142c4'
    OR body LIKE '%Lecture 8%'
  )
ORDER BY created_at DESC;

-- 3. Check ALL notifications sent today
SELECT 
  id,
  title,
  body,
  type,
  created_at AT TIME ZONE 'Asia/Jakarta' AS created_at_wib
FROM notifications
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520'
  AND created_at >= CURRENT_DATE
ORDER BY created_at DESC;

-- 4. Manually trigger notification for this task (for testing)
-- You can call this API endpoint directly:
-- POST https://your-app.vercel.app/api/notifications/send
-- Body:
/*
{
  "userId": "bdb0ad43-7e65-4a42-adfe-26816b8d4520",
  "title": "🚨 Deadline 2 Jam Lagi!",
  "body": "Tugas \"Lecture 8\" (Data Mining) jatuh tempo jam 00:00",
  "type": "urgent_deadline",
  "data": {
    "taskId": "5144b057-b208-4d5c-85dd-6fb5c65142c4",
    "url": "/dashboard/tasks",
    "tag": "urgent-deadline-5144b057-b208-4d5c-85dd-6fb5c65142c4"
  }
}
*/
