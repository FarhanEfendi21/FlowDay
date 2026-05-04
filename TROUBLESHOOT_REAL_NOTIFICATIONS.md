# 🔧 Troubleshooting: Real Deadline Notifications

## ✅ Current Status
- User ID: `bdb0ad43-7e65-4a42-adfe-26816b8d4520`
- FCM Tokens: **14 tokens** (registered ✅)
- Test Notification: **Working ✅**
- Real Deadline Notifications: **Not working ❌**

---

## 🔍 Step 1: Check Active Tasks

Run **Query 1** from `debug_real_deadline_notifications.sql`:

```sql
SELECT 
  id, title, subject, due_date,
  EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 AS hours_until_due,
  CASE 
    WHEN EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 BETWEEN 1.5 AND 2.5 THEN '🚨 URGENT'
    WHEN due_date::date = (CURRENT_DATE + INTERVAL '1 day')::date THEN '⏰ TOMORROW'
    WHEN due_date > NOW() THEN '⏳ FUTURE'
    ELSE '❌ PAST'
  END AS notification_status
FROM tasks
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520'
  AND status = 'todo'
  AND deleted_at IS NULL
ORDER BY due_date ASC;
```

### Possible Results:

#### Result A: No rows (0 tasks)
**Problem:** Tidak ada task aktif dengan deadline!

**Solution:** Create task dengan deadline:
```sql
-- For urgent notification (2 hours)
INSERT INTO tasks (user_id, title, subject, due_date, status)
VALUES (
  'bdb0ad43-7e65-4a42-adfe-26816b8d4520',
  '🚨 Test Urgent Deadline',
  'Testing',
  NOW() + INTERVAL '2 hours',
  'todo'
);

-- For tomorrow notification
INSERT INTO tasks (user_id, title, subject, due_date, status)
VALUES (
  'bdb0ad43-7e65-4a42-adfe-26816b8d4520',
  '⏰ Test Tomorrow Deadline',
  'Testing',
  (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00'),
  'todo'
);
```

#### Result B: Has tasks but status = '⏳ FUTURE'
**Problem:** Tasks ada tapi belum masuk notification window!

**Explanation:**
- **Urgent notification** hanya trigger untuk tasks yang deadline-nya **1.5 - 2.5 jam** dari sekarang
- **Tomorrow notification** hanya trigger untuk tasks yang deadline-nya **besok** (H-1)

**Solution:** 
- Wait until task masuk window, OR
- Create new test task dengan deadline yang tepat (use Query 4 & 5)

#### Result C: Has tasks with '🚨 URGENT' or '⏰ TOMORROW'
**Problem:** Task sudah di window tapi notifikasi tidak terkirim!

**Next step:** Check cron job logs (Step 2)

---

## 🕐 Step 2: Check Cron Job Schedule

### Vercel Dashboard Check:

1. **Go to:** Vercel Dashboard → Your Project → Cron Jobs
2. **Verify these exist:**

| Cron Job | Schedule | Description | Next Run |
|----------|----------|-------------|----------|
| `/api/notifications/check-urgent-deadlines` | `0 * * * *` | Every hour at :00 | Check dashboard |
| `/api/notifications/check-deadlines` | `0 2 * * *` | Daily at 02:00 UTC (09:00 WIB) | Check dashboard |
| `/api/notifications/check-habits` | `0 13 * * *` | Daily at 13:00 UTC (20:00 WIB) | Check dashboard |

### Schedule Explanation:

**Urgent Deadline Cron:**
- Runs: **Every hour** (e.g., 08:00, 09:00, 10:00, ...)
- Checks: Tasks due in **2 hours** (with 1.5-2.5 hour window to avoid duplicates)
- Example: If cron runs at 10:00, it checks tasks due at ~12:00

**Tomorrow Deadline Cron:**
- Runs: **Daily at 02:00 UTC** = **09:00 WIB**
- Checks: Tasks due **tomorrow** (H-1)
- Example: If today is May 4, it checks tasks due on May 5

### Current Time Check:

Run **Query 8** to see server time:
```sql
SELECT 
  NOW() AS server_time_utc,
  NOW() AT TIME ZONE 'Asia/Jakarta' AS server_time_wib,
  CURRENT_DATE AS current_date;
```

---

## 📊 Step 3: Check Cron Job Logs

### Vercel Logs:

1. **Go to:** Vercel Dashboard → Logs
2. **Filter by:** `/api/notifications/check-urgent-deadlines`
3. **Look for recent runs**

### Expected Logs (Success):

```
🔍 Checking urgent deadlines between: 2026-05-04T14:00:00Z and 2026-05-04T16:00:00Z
Found 1 tasks in 2-hour window
Found 1 urgent tasks out of 1 total
Sending notifications for 1 urgent tasks...
📤 Sending notification for task "Test Task" to user bdb0ad43-...
🔍 Fetching FCM tokens for user: bdb0ad43-...
📱 Found 14 FCM token(s) for user bdb0ad43-...
💾 Saving notification to database...
✅ Notification saved to database
📤 Sending FCM notifications to 14 device(s)...
✅ FCM send 1 successful
✅ FCM send 2 successful
... (14 times)
📊 FCM Results: 14 success, 0 failed
✅ Notification sent successfully for task [TASK_ID]
✅ Success: 1, ❌ Failed: 0
```

### Expected Logs (No Tasks):

```
🔍 Checking urgent deadlines between: 2026-05-04T14:00:00Z and 2026-05-04T16:00:00Z
Found 0 tasks in 2-hour window
No urgent deadlines found
```

### Error Logs (If Any):

Look for:
- `❌ Error fetching tasks`
- `❌ Failed to send notification`
- `❌ FCM send failed`
- `ECONNREFUSED` (should be fixed now!)

---

## 🧪 Step 4: Manual Test

### Test A: Create Task + Manual Trigger

1. **Create urgent task** (Query 4):
```sql
INSERT INTO tasks (user_id, title, subject, due_date, status)
VALUES (
  'bdb0ad43-7e65-4a42-adfe-26816b8d4520',
  '🚨 MANUAL TEST - 2 Hours',
  'Testing',
  NOW() + INTERVAL '2 hours',
  'todo'
);
```

2. **Verify task created:**
```sql
SELECT id, title, due_date, 
  EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 AS hours_until_due
FROM tasks
WHERE title LIKE '%MANUAL TEST%'
  AND user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520';
```

3. **Manual trigger cron:**
   - Vercel Dashboard → Cron Jobs
   - Find: `check-urgent-deadlines`
   - Click: **"Run"** button
   - Wait: 10-30 seconds

4. **Check logs immediately:**
   - Should see: "Found 1 urgent tasks"
   - Should see: "✅ Success: 1"

5. **Check notification:**
   - Notification should appear on your phone within 5 seconds!
   - Title: "🚨 Deadline 2 Jam Lagi!"
   - Body: "Tugas 'MANUAL TEST - 2 Hours' (Testing) jatuh tempo jam XX:XX"

### Test B: Check Notification in Database

```sql
SELECT 
  id, title, body, type, created_at,
  created_at AT TIME ZONE 'Asia/Jakarta' AS created_at_wib
FROM notifications
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520'
  AND type = 'urgent_deadline'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** Should see new row with title "🚨 Deadline 2 Jam Lagi!"

---

## 🐛 Common Issues & Solutions

### Issue 1: Cron Not Running

**Symptoms:**
- No logs in Vercel
- "Next run" time keeps changing but never executes

**Solutions:**
1. Check Vercel plan (Hobby plan has cron limits)
2. Verify `vercel.json` is committed and deployed
3. Check deployment logs for errors
4. Try manual trigger first

### Issue 2: Tasks Not Detected

**Symptoms:**
- Logs show "Found 0 tasks"
- But Query 1 shows tasks exist

**Possible causes:**
- **Timezone mismatch:** Task due_date in wrong timezone
- **Status not 'todo':** Task is 'done' or 'in_progress'
- **Soft deleted:** deleted_at is not null
- **Window timing:** Task not in 1.5-2.5 hour window

**Solutions:**
```sql
-- Check task details
SELECT 
  id, title, status, deleted_at,
  due_date,
  due_date AT TIME ZONE 'Asia/Jakarta' AS due_date_wib,
  NOW() AS now_utc,
  EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 AS hours_until_due
FROM tasks
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520'
  AND title LIKE '%TEST%'
ORDER BY due_date DESC;
```

### Issue 3: Notification Saved but Not Received

**Symptoms:**
- Logs show "✅ Success: 14"
- Database has notification record
- But phone doesn't receive notification

**Possible causes:**
- **Token expired:** FCM token no longer valid
- **Firebase credentials wrong:** Check env vars
- **Phone settings:** Notifications blocked in browser/OS
- **Network issue:** Phone offline when sent

**Solutions:**

1. **Re-enable notifications:**
   - Open app on phone
   - Click bell icon
   - Click "Aktifkan Notifikasi" again
   - This will refresh token

2. **Check Firebase credentials:**
   - Vercel → Settings → Environment Variables
   - Verify `FIREBASE_SERVER_KEY` or `FIREBASE_SERVICE_ACCOUNT` exists
   - Redeploy if just added

3. **Check phone settings:**
   - Android: Settings → Apps → Chrome → Notifications → Allow
   - iOS: Settings → Safari → Notifications → Allow

4. **Test with fresh token:**
```sql
-- Delete old tokens
DELETE FROM fcm_tokens 
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520';

-- Re-enable in app (will create new token)
-- Then test again
```

---

## ✅ Success Checklist

After following all steps, verify:

- [ ] Query 1 shows tasks with '🚨 URGENT' or '⏰ TOMORROW' status
- [ ] Vercel cron jobs are configured and running
- [ ] Cron logs show "✅ Success: X, ❌ Failed: 0"
- [ ] Database has notification records (Query 3)
- [ ] Phone receives notification within 5 seconds
- [ ] Notification can be clicked → redirects to tasks page

---

## 📞 Still Not Working?

If after all steps notifications still don't work, provide:

1. **Query 1 result** (active tasks)
2. **Vercel cron logs** (last 3 runs)
3. **Query 3 result** (notifications in DB)
4. **Screenshot** of notification bell popup
5. **Browser console errors** (F12 → Console tab)

This will help identify the exact issue! 🔍
