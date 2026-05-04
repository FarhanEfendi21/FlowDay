# Test: Timezone Fix for Urgent Notification

## Problem Fixed
**Before:** Notification showed "jatuh tempo jam 17.00" (UTC time)  
**After:** Notification will show "jatuh tempo jam 00.00" (WIB time) ✅

## What Changed
Added `timeZone: 'Asia/Jakarta'` to `toLocaleTimeString()` options in:
- `app/api/notifications/check-urgent-deadlines/route.ts`

## Code Change
```typescript
// BEFORE (Wrong - shows UTC time)
const dueTime = dueDateTime.toLocaleTimeString('id-ID', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false 
})

// AFTER (Correct - shows WIB time)
const dueTime = dueDateTime.toLocaleTimeString('id-ID', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Jakarta' // ← Added this!
})
```

## Test Case

### Input:
- **Task:** Lecture 8
- **Due Date (DB):** 2026-05-04 17:00:00+00 (UTC)
- **Due Date (WIB):** 2026-05-05 00:00:00 (WIB)

### Expected Output:
**Notification body:** "Tugas 'Lecture 8' (Data Mining) jatuh tempo jam **00.00**"

### How to Test:

#### Option 1: Wait for Next Urgent Task
1. Create a new task with deadline exactly 2 hours from now
2. Wait for cron to run (next hour at :00)
3. Check notification text

#### Option 2: Manual Trigger (Immediate)
1. Delete the old "Lecture 8" task
2. Create new task with same deadline (2 hours from now)
3. Go to Vercel → Cron Jobs → check-urgent-deadlines → Run
4. Check notification - should show correct WIB time!

#### Option 3: Create Test Task via SQL
```sql
-- Delete old test task
DELETE FROM tasks 
WHERE id = '5144b057-b208-4d5c-85dd-6fb5c65142c4';

-- Create new test task (2 hours from now)
INSERT INTO tasks (user_id, title, subject, due_date, status)
VALUES (
  'bdb0ad43-7e65-4a42-adfe-26816b8d4520',
  '🧪 Timezone Test',
  'Testing',
  NOW() + INTERVAL '2 hours',
  'todo'
)
RETURNING 
  id,
  title,
  due_date,
  due_date AT TIME ZONE 'Asia/Jakarta' AS due_date_wib;
```

Then trigger cron manually in Vercel.

## Verification

### Check notification text format:
- ✅ Time should be in WIB (GMT+7)
- ✅ Format: "jatuh tempo jam HH.MM" (24-hour format)
- ✅ Should match the time shown in app UI

### Example:
If task due at:
- **UTC:** 17:00
- **WIB:** 00:00 (next day)

Notification should say: "jatuh tempo jam **00.00**" ✅

## Other Notification Types

### Daily Deadline (Tomorrow)
- Uses: `check-deadlines/route.ts`
- No time shown in notification (only "jatuh tempo besok")
- ✅ No fix needed

### Habit Reminder
- Uses: `check-habits/route.ts`
- No time shown in notification
- ✅ No fix needed

## Success Criteria

✅ Notification shows correct WIB time (not UTC)  
✅ Time matches what user sees in app  
✅ Format is HH.MM (24-hour, Indonesian locale)  
✅ No TypeScript errors  

## Deploy

```bash
git add app/api/notifications/check-urgent-deadlines/route.ts
git commit -m "fix: show WIB timezone in urgent deadline notification"
git push
```

After deploy, test with a new task to verify the fix! 🚀
