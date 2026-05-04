-- Debug script untuk urgent deadline notification
-- Jalankan query ini di Supabase SQL Editor untuk debugging

-- 1. Cek task yang ada dalam window 2 jam
SELECT 
  id,
  title,
  subject,
  due_date,
  status,
  user_id,
  deleted_at,
  EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 AS hours_until_due
FROM tasks
WHERE 
  status = 'todo'
  AND deleted_at IS NULL
  AND due_date >= NOW()
  AND due_date <= NOW() + INTERVAL '2 hours'
ORDER BY due_date;

-- 2. Cek FCM tokens untuk user
-- Ganti 'USER_ID_HERE' dengan user_id dari query di atas
SELECT 
  user_id,
  token,
  created_at,
  updated_at
FROM fcm_tokens
WHERE user_id = 'USER_ID_HERE';

-- 3. Cek notifications yang sudah dikirim (urgent_deadline)
SELECT 
  id,
  user_id,
  title,
  body,
  type,
  read,
  created_at,
  data
FROM notifications
WHERE type = 'urgent_deadline'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Cek semua notifications untuk user tertentu
-- Ganti 'USER_ID_HERE' dengan user_id Anda
SELECT 
  id,
  title,
  body,
  type,
  read,
  created_at
FROM notifications
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC
LIMIT 20;

-- 5. Cek task yang baru dibuat (untuk verifikasi timezone)
SELECT 
  id,
  title,
  due_date,
  due_date AT TIME ZONE 'Asia/Jakarta' AS due_date_wib,
  NOW() AS current_time_utc,
  NOW() AT TIME ZONE 'Asia/Jakarta' AS current_time_wib,
  EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 AS hours_until_due
FROM tasks
WHERE 
  deleted_at IS NULL
  AND status = 'todo'
ORDER BY created_at DESC
LIMIT 5;
