# Debug: Why Task Not Passing Urgent Filter

## Current Situation
- **Task:** Summary Chapter 4 & 5
- **Due date:** 2026-05-04 17:30:00+00 (UTC) = 00:30 WIB
- **Hours until due:** 2.04 hours ✅
- **SQL Query:** Found 1 task ✅
- **Filter Result:** 0 tasks ❌

## Problem Analysis

### Hypothesis 1: Old Code Still Running ⚠️
**Most likely!** You may not have deployed the latest code changes.

**Check:**
1. Go to Vercel Dashboard → Deployments
2. Check latest deployment time
3. If it's before our fixes → Need to deploy!

**Solution:**
```bash
git add .
git commit -m "fix: improve urgent notification filtering and logging"
git push
```

### Hypothesis 2: Filter Logic Issue
The filter checks: `hoursUntilDue > 1.5 && hoursUntilDue <= 2.5`

**2.04 should PASS this check!**

But maybe there's a precision issue or the `now` variable changed between query and filter.

**Solution:** Already added better logging to show exact filter result.

### Hypothesis 3: Timing Issue
Cron runs every hour at :00, but task might fall outside window by the time filter runs.

**Example:**
- Cron starts: 22:00:00
- SQL query: 22:00:01 (finds task due at 00:02:30 = 2.04h)
- Filter runs: 22:00:02 (calculates 2.039h)
- Still should pass!

### Hypothesis 4: Task Already Got Notification
Maybe notification was sent earlier and there's duplicate prevention we're not seeing.

**Check:**
```sql
SELECT * FROM notifications
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520'
  AND (
    body LIKE '%Summary Chapter 4 & 5%'
    OR data->>'taskId' = 'f2136479-c955-4526-a52e-1cc4b2b58087'
  )
ORDER BY created_at DESC;
```

## Immediate Actions

### 1. Deploy Latest Code
```bash
# Make sure all changes are committed
git status

# If there are uncommitted changes:
git add .
git commit -m "fix: urgent notification filter and timezone"
git push

# Wait for Vercel to deploy (1-2 minutes)
```

### 2. Check Vercel Logs After Deploy
1. Go to Vercel Dashboard → Logs
2. Trigger cron manually: Cron Jobs → check-urgent-deadlines → Run
3. Look for new log format:
```
Task "Summary Chapter 4 & 5": 2.04 hours until deadline - Filter: PASS ✅ (range: 1.5-2.5)
```

### 3. If Still Failing
The new logs will show:
- Exact hours calculation
- Whether it passes or fails the filter
- Why it fails (if it does)

## Code Changes Made

### 1. Better Logging
```typescript
const passesFilter = hoursUntilDue >= 1.5 && hoursUntilDue <= 2.5

console.log(`Task "${task.title}": ${hoursUntilDue.toFixed(2)} hours until deadline - Filter: ${passesFilter ? 'PASS ✅' : 'FAIL ❌'} (range: 1.5-2.5)`)
```

### 2. Changed > to >=
```typescript
// OLD: hoursUntilDue > 1.5
// NEW: hoursUntilDue >= 1.5
```

This includes tasks at exactly 1.5 hours (edge case).

### 3. Timezone Fix
```typescript
timeZone: 'Asia/Jakarta' // Shows correct WIB time in notification
```

## Expected Result After Deploy

### Logs should show:
```
Checking urgent deadlines between: 2026-05-04T15:00:00.000Z and 2026-05-04T17:00:00.000Z
Found 1 tasks in 2-hour window
Task "Summary Chapter 4 & 5": 2.04 hours until deadline - Filter: PASS ✅ (range: 1.5-2.5)
Found 1 urgent tasks out of 1 total
📤 Sending notification for task "Summary Chapter 4 & 5" to user bdb0ad43...
✅ Notification sent successfully
```

### Notification should appear:
- **Title:** 🚨 Deadline 2 Jam Lagi!
- **Body:** Tugas "Summary Chapter 4 & 5" (Data Mining) jatuh tempo jam **00.30** ✅ (WIB time!)

## Test Plan

1. **Deploy** latest code
2. **Wait** for deployment to complete
3. **Trigger** cron manually in Vercel
4. **Check** logs for new format
5. **Verify** notification appears on phone
6. **Confirm** time shows 00.30 (not 17.30)

## If Problem Persists

Share these from Vercel logs:
1. Full log output from check-urgent-deadlines
2. The exact filter result line
3. Any errors or warnings

This will help us identify the exact issue!
