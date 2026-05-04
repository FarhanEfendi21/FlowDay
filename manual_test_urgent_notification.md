# Manual Test: Urgent Notification for Lecture 8

## Task Details
- **Task ID:** `5144b057-b208-4d5c-85dd-6fb5c65142c4`
- **Title:** Lecture 8
- **Subject:** Data Mining
- **Due Date:** 2026-05-04 17:00:00+00 (UTC) = 2026-05-05 00:00:00 (WIB)
- **Hours Until Due:** 2.1 hours ✅ (dalam window 1.5-2.5)
- **Status:** 🚨 URGENT

## Current Time
- **Your time:** 21:54 WIB (2026-05-04)
- **UTC time:** 14:54 UTC (2026-05-04)

## Cron Schedule
- **check-urgent-deadlines:** Runs every hour at :00 (e.g., 15:00, 16:00, 17:00)
- **Next run:** 15:00 UTC = **22:00 WIB** (6 minutes from now!)

## Expected Behavior

### At 22:00 WIB (15:00 UTC):
1. Cron job runs automatically
2. Queries tasks due between NOW and NOW+2h
3. Finds "Lecture 8" task (due in 2 hours)
4. Filters: 2.0 hours is between 1.5 and 2.5 ✅
5. Sends notification to all your FCM tokens (14 devices)
6. Notification appears on your phone! 🎉

### Expected Notification:
- **Title:** 🚨 Deadline 2 Jam Lagi!
- **Body:** Tugas "Lecture 8" (Data Mining) jatuh tempo jam 00:00
- **Click action:** Opens /dashboard/tasks

---

## Option 1: Wait for Automatic Cron (Recommended)

**Just wait 6 minutes until 22:00 WIB!**

The cron will run automatically and send the notification.

---

## Option 2: Manual Trigger (Immediate Test)

If you want to test NOW without waiting:

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your project
3. Go to **Cron Jobs** tab
4. Find **check-urgent-deadlines**
5. Click **"Run"** button
6. Wait 5-10 seconds

### Step 2: Check Logs
1. Go to **Logs** tab
2. Filter by `/api/notifications/check-urgent-deadlines`
3. Look for:
```
Found 1 urgent tasks out of X total
📤 Sending notification for task "Lecture 8" to user bdb0ad43...
✅ Notification sent successfully
```

### Step 3: Check Phone
Notification should appear within 1-5 seconds!

---

## Option 3: Direct API Call (Advanced)

Use this curl command or Postman:

```bash
curl -X POST https://your-app-url.vercel.app/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "bdb0ad43-7e65-4a42-adfe-26816b8d4520",
    "title": "🚨 Deadline 2 Jam Lagi!",
    "body": "Tugas \"Lecture 8\" (Data Mining) jatuh tempo jam 00:00",
    "type": "urgent_deadline",
    "data": {
      "taskId": "5144b057-b208-4d5c-85dd-6fb5c65142c4",
      "url": "/dashboard/tasks",
      "tag": "urgent-deadline-5144b057-b208-4d5c-85dd-6fb5c65142c4"
    }
  }'
```

Replace `your-app-url.vercel.app` with your actual Vercel URL.

---

## Troubleshooting

### If notification doesn't appear at 22:00 WIB:

1. **Check Vercel Logs:**
   - Did cron run? Look for timestamp around 15:00 UTC
   - Any errors in logs?

2. **Check if notification was sent:**
   - Run SQL query from `check_lecture8_notification.sql`
   - Query 2 should show notification record

3. **Check FCM tokens:**
   - Make sure tokens are still valid
   - Try sending test notification from bell icon

4. **Check browser/phone:**
   - Is notification permission still granted?
   - Check notification settings in phone
   - Try refreshing the app

### Common Issues:

| Issue | Solution |
|-------|----------|
| Cron didn't run | Check Vercel cron configuration |
| Notification sent but not received | Check FCM token validity |
| Task filtered out | Check hours_until_due is between 1.5-2.5 |
| Duplicate prevention | Check if notification already sent before |

---

## Success Criteria

✅ Cron runs at 22:00 WIB (15:00 UTC)  
✅ Logs show "Found 1 urgent tasks"  
✅ Logs show "Notification sent successfully"  
✅ Notification appears on phone within 5 seconds  
✅ Clicking notification opens /dashboard/tasks  

---

## Timeline

- **21:54 WIB (now):** Task created, 2.1 hours until due
- **22:00 WIB:** Cron runs, notification sent ← **WAIT FOR THIS!**
- **00:00 WIB:** Task deadline (May 5)

**Recommendation:** Just wait 6 minutes and check your phone at 22:00 WIB! 📱⏰
