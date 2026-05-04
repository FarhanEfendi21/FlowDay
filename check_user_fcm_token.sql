-- Check FCM tokens for your user ID
-- Run this in Supabase SQL Editor

-- 1. Check if FCM token exists for your user
SELECT 
  id,
  user_id,
  token,
  device_info,
  created_at,
  updated_at
FROM fcm_tokens
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520';

-- Expected result:
-- If EMPTY (0 rows) → You need to enable notifications in the app!
-- If HAS ROWS → Token is registered, notifications should work

-- 2. Check recent notifications sent to your user
SELECT 
  id,
  title,
  body,
  type,
  read,
  created_at
FROM notifications
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check tasks with upcoming deadlines for your user
SELECT 
  id,
  title,
  subject,
  due_date,
  status,
  EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 AS hours_until_due
FROM tasks
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520'
  AND status = 'todo'
  AND deleted_at IS NULL
  AND due_date > NOW()
ORDER BY due_date ASC
LIMIT 10;

-- 4. Create a test task with 2-hour deadline (for testing urgent notification)
-- UNCOMMENT AND RUN THIS IF YOU WANT TO TEST:
/*
INSERT INTO tasks (user_id, title, subject, due_date, status)
VALUES (
  'bdb0ad43-7e65-4a42-adfe-26816b8d4520',
  '🚨 TEST URGENT - 2 Hours',
  'Testing',
  NOW() + INTERVAL '2 hours',
  'todo'
)
RETURNING id, title, due_date;
*/

-- 5. Create a test task with tomorrow deadline (for testing daily notification)
-- UNCOMMENT AND RUN THIS IF YOU WANT TO TEST:
/*
INSERT INTO tasks (user_id, title, subject, due_date, status)
VALUES (
  'bdb0ad43-7e65-4a42-adfe-26816b8d4520',
  '⏰ TEST DEADLINE - Tomorrow',
  'Testing',
  (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00'),
  'todo'
)
RETURNING id, title, due_date;
*/
