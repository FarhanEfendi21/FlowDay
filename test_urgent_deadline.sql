-- Test Urgent Deadline Notification (2 hours before)
-- Jalankan di Supabase SQL Editor

-- Insert task dengan deadline 2 jam dari sekarang
INSERT INTO tasks (user_id, title, subject, due_date, status, deleted)
VALUES (
  (SELECT id FROM auth.users LIMIT 1), -- Ambil user pertama
  'Test Urgent Deadline - 2 Jam Lagi',
  'Testing',
  NOW() + INTERVAL '2 hours', -- 2 jam dari sekarang (TIMESTAMPTZ)
  'todo',
  false
);

-- Cek task yang baru dibuat
SELECT 
  id, 
  title, 
  due_date,
  user_id 
FROM tasks 
WHERE title LIKE 'Test Urgent Deadline%'
ORDER BY created_at DESC
LIMIT 1;

-- Cek berapa jam lagi deadline
SELECT 
  title,
  due_date,
  EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 as hours_until_deadline
FROM tasks 
WHERE title LIKE 'Test Urgent Deadline%'
ORDER BY created_at DESC
LIMIT 1;
