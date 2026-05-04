# 📅 Automatic Notification Schedule

## ✅ Cron Jobs Configuration

All cron jobs run **automatically** on Vercel. You don't need to do anything - just wait!

### 1. 🚨 Urgent Deadline Notifications (2 Hours Before)
- **Endpoint:** `/api/notifications/check-urgent-deadlines`
- **Schedule:** `0 * * * *` (Every hour at :00)
- **Runs:** 24 times per day
- **Example times (WIB):**
  - 00:00, 01:00, 02:00, 03:00, ..., 23:00
- **Checks:** Tasks due in 1.5-2.5 hours
- **Notification:** "🚨 Deadline 2 Jam Lagi!"

**Example:**
- Task due: 14:30 WIB
- Notification sent: 12:00 WIB (2.5h before)
- Or: 13:00 WIB (1.5h before)

### 2. ⏰ Daily Deadline Notifications (Tomorrow)
- **Endpoint:** `/api/notifications/check-deadlines`
- **Schedule:** `0 2 * * *` (Daily at 02:00 UTC = 09:00 WIB)
- **Runs:** Once per day at 09:00 WIB
- **Checks:** Tasks due tomorrow (H-1)
- **Notification:** "⏰ Deadline Besok!"

**Example:**
- Task due: May 6, 2026 (any time)
- Notification sent: May 5, 2026 at 09:00 WIB

### 3. 🔥 Habit Reminders (Evening)
- **Endpoint:** `/api/notifications/check-habits`
- **Schedule:** `0 13 * * *` (Daily at 13:00 UTC = 20:00 WIB)
- **Runs:** Once per day at 20:00 WIB
- **Checks:** Habits not completed today
- **Notification:** "🔥 Jangan Putus Streak!"

**Example:**
- Habit: "Belajar 30 menit"
- Not completed by 20:00 WIB
- Notification sent: 20:00 WIB

### 4. 🧹 Token Cleanup (Weekly)
- **Endpoint:** `/api/notifications/cleanup-tokens`
- **Schedule:** `0 19 * * 6` (Every Saturday at 19:00 UTC = 02:00 WIB Sunday)
- **Runs:** Once per week
- **Action:** Removes expired/invalid FCM tokens

---

## 📊 Cron Schedule Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Examples:
- `0 * * * *` = Every hour at minute 0 (00:00, 01:00, 02:00, ...)
- `0 2 * * *` = Every day at 02:00 UTC
- `0 13 * * *` = Every day at 13:00 UTC
- `0 19 * * 6` = Every Saturday at 19:00 UTC
- `*/15 * * * *` = Every 15 minutes
- `0 */2 * * *` = Every 2 hours

---

## 🕐 Timeline Example (May 5, 2026)

### Your Current Time: 22:02 WIB

| Time (WIB) | Cron Job | Action |
|------------|----------|--------|
| 23:00 | Urgent Check | Check tasks due at 01:00-01:30 |
| 00:00 | Urgent Check | Check tasks due at 02:00-02:30 |
| 01:00 | Urgent Check | Check tasks due at 03:00-03:30 |
| ... | ... | ... |
| 09:00 | Daily Check | Check tasks due tomorrow (May 6) |
| ... | ... | ... |
| 20:00 | Habit Check | Check incomplete habits |
| ... | ... | ... |

---

## ✅ How It Works Automatically

### Step 1: You Create a Task
```
Title: "Submit Assignment"
Due Date: May 6, 2026 at 14:00 WIB
```

### Step 2: Vercel Cron Runs Automatically

**May 5, 09:00 WIB:**
- Daily cron runs
- Finds task due tomorrow
- Sends: "⏰ Deadline Besok! Tugas 'Submit Assignment' jatuh tempo besok"

**May 6, 12:00 WIB:**
- Urgent cron runs (every hour)
- Finds task due in 2 hours
- Sends: "🚨 Deadline 2 Jam Lagi! Tugas 'Submit Assignment' jatuh tempo jam 14.00"

### Step 3: You Receive Notifications
- Notification appears on your phone automatically
- Click to open app
- Complete the task!

---

## 🔍 How to Verify Cron is Running

### Option 1: Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **"Cron Jobs"** tab
4. You'll see:
   - ✅ All 4 cron jobs listed
   - Last run time
   - Next scheduled run
   - Success/failure status

### Option 2: Check Logs
1. Go to Vercel Dashboard → **Logs**
2. Filter by:
   - `/api/notifications/check-urgent-deadlines`
   - `/api/notifications/check-deadlines`
   - `/api/notifications/check-habits`
3. You'll see logs every time cron runs

### Option 3: Check Notifications Table
```sql
-- See recent notifications sent
SELECT 
  title,
  body,
  type,
  created_at AT TIME ZONE 'Asia/Jakarta' AS sent_at_wib
FROM notifications
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚀 After Deploy

Once you deploy the updated `vercel.json`:

```bash
git add vercel.json
git commit -m "fix: urgent deadline cron to run every hour"
git push
```

**Vercel will automatically:**
1. Deploy the new configuration
2. Update cron schedules
3. Start running crons at scheduled times

**You don't need to:**
- ❌ Manually trigger crons
- ❌ Keep your computer on
- ❌ Keep the app open
- ❌ Do anything!

**Just:**
- ✅ Create tasks with deadlines
- ✅ Wait for notifications
- ✅ Enjoy! 🎉

---

## 📱 Expected Notification Flow

### Scenario: Task due May 6 at 14:00 WIB

| Time | Notification | Type |
|------|--------------|------|
| **May 5, 09:00** | ⏰ Deadline Besok! | Daily reminder |
| **May 6, 12:00** | 🚨 Deadline 2 Jam Lagi! | Urgent (2h before) |
| **May 6, 14:00** | ⏰ Task deadline reached | (No notification) |

### Scenario: Habit not completed

| Time | Notification | Type |
|------|--------------|------|
| **Every day, 20:00** | 🔥 Jangan Putus Streak! | Habit reminder |

---

## 🐛 Troubleshooting

### Cron not running?

**Check 1: Vercel Plan**
- Free plan: ✅ Crons supported
- Hobby plan: ✅ Crons supported
- Pro plan: ✅ Crons supported

**Check 2: Deployment**
- Make sure latest code is deployed
- Check Vercel Dashboard → Deployments
- Latest deployment should be "Ready"

**Check 3: Cron Configuration**
- Go to Vercel → Cron Jobs
- All 4 crons should be listed
- Status should be "Active"

**Check 4: Logs**
- Check for errors in logs
- Look for authentication errors
- Check Firebase credentials

### Notifications not appearing?

**Check 1: FCM Tokens**
```sql
SELECT COUNT(*) FROM fcm_tokens 
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520';
```
Should return > 0

**Check 2: Browser Permissions**
- Check notification permission is granted
- Try sending test notification

**Check 3: Task Timing**
- Make sure task is in the right time window
- Urgent: 1.5-2.5 hours before
- Daily: Tomorrow (any time)

---

## 🎯 Summary

**You don't need to do anything!** 

Cron jobs run automatically on Vercel:
- ✅ Every hour for urgent deadlines
- ✅ Every day at 09:00 for tomorrow's tasks
- ✅ Every day at 20:00 for habits

Just create tasks and wait for notifications! 🚀
