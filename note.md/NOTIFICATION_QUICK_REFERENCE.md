# ⚡ Notification System - Quick Reference Guide

## 🎯 TL;DR

**Status:** ✅ Production-ready dengan improvements  
**Rating:** ⭐⭐⭐⭐⭐ (5/5)  
**Action:** Deploy sekarang, iterate nanti

---

## 📦 What's Included

### **Core Features** ✅
- Push notifications (FCM)
- In-app notification center
- Real-time badge count
- Confetti animations
- Automated cron jobs
- Multi-device support

### **New Improvements** ✅
- Dynamic Firebase config
- Token cleanup cron
- User preferences table
- Analytics tracking
- Better error logging

---

## 🚀 Quick Deploy Checklist

```bash
# 1. Run migrations
supabase db push

# 2. Deploy to Vercel
vercel --prod

# 3. Verify crons in Vercel Dashboard
# Should see 3 cron jobs

# 4. Test notification
curl -X POST https://your-app.vercel.app/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"userId":"xxx","title":"Test","body":"Test","type":"task_complete"}'

# Done! ✅
```

---

## 📁 File Structure

```
app/
├── api/
│   └── notifications/
│       ├── send/route.ts              # Send notification
│       ├── check-deadlines/route.ts   # Cron: deadlines
│       ├── check-habits/route.ts      # Cron: habits
│       └── cleanup-tokens/route.ts    # Cron: cleanup (NEW)
│   └── firebase-config/route.ts       # Dynamic config (NEW)
│
components/
└── notifications/
    ├── notification-bell.tsx          # Bell with badge
    ├── notification-list.tsx          # Dropdown list
    └── notification-permission-prompt.tsx
│
features/
└── notifications/
    ├── api/notificationService.ts     # Supabase queries
    ├── hooks/
    │   ├── useFCM.ts                  # FCM hook
    │   └── useNotifications.ts        # React Query hooks
    └── index.ts
│
lib/
├── firebase/
│   ├── config.ts                      # Firebase init
│   └── messaging.ts                   # FCM functions
└── confetti.ts                        # Confetti animations
│
supabase/migrations/
├── 008_add_notifications.sql          # Core tables
├── 009_add_notification_preferences.sql (NEW)
└── 010_add_notification_analytics.sql (NEW)
│
public/
└── firebase-messaging-sw.js           # Service worker (UPDATED)
│
vercel.json                            # Cron config (UPDATED)
```

---

## 🔑 Key Functions

### **Client-Side**

```typescript
// Request permission & get token
import { useFCM } from '@/features/notifications'

const { token, permission, requestPermission } = useFCM()

// Get notifications
import { useNotifications } from '@/features/notifications'

const { data: notifications } = useNotifications(50)

// Get unread count
import { useUnreadCount } from '@/features/notifications'

const { data: unreadCount } = useUnreadCount()

// Mark as read
import { useMarkAsRead } from '@/features/notifications'

const markAsRead = useMarkAsRead()
markAsRead.mutate(notificationId)

// Trigger confetti
import { triggerTaskCompleteConfetti } from '@/lib/confetti'

triggerTaskCompleteConfetti()
```

### **Server-Side**

```typescript
// Send notification
await fetch('/api/notifications/send', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'xxx',
    title: 'Title',
    body: 'Body',
    type: 'task_complete',
    data: { url: '/dashboard' }
  })
})

// Get user preferences (NEW)
const { data } = await supabase.rpc('get_notification_preferences', {
  p_user_id: userId
})

// Get analytics (NEW)
const { data } = await supabase.rpc('get_notification_analytics', {
  p_user_id: userId,
  p_days: 30
})
```

---

## 🗄️ Database Tables

### **fcm_tokens**
```sql
user_id, token, device_info, last_used_at
```

### **notifications**
```sql
user_id, title, body, type, data, read, created_at
delivered_at, opened_at, clicked_at (NEW - analytics)
```

### **notification_preferences** (NEW)
```sql
user_id, deadline_reminders, habit_reminders, 
streak_milestones, task_complete, reminder_time
```

---

## ⏰ Cron Jobs

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/notifications/check-deadlines` | Daily 9 AM | Check tasks due tomorrow |
| `/api/notifications/check-habits` | Daily 8 PM | Check incomplete habits |
| `/api/notifications/cleanup-tokens` | Weekly Sun 2 AM | Remove stale tokens (NEW) |

---

## 🔐 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_VAPID_KEY=xxx
# ... other Firebase vars

# Firebase (Server)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Cron
CRON_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 🐛 Common Issues

### **Notifications not received**
```bash
# Check:
1. FCM token generated? (console.log in useFCM)
2. Permission granted? (check Notification.permission)
3. Service worker registered? (check DevTools → Application)
4. Firebase config correct? (check /api/firebase-config)
5. Cron secret correct? (check Vercel env vars)
```

### **Badge count not updating**
```bash
# Check:
1. RPC function exists? (get_unread_notification_count)
2. Query invalidation working? (React Query devtools)
3. Auto-refetch enabled? (should refetch every 30s)
```

### **Cron jobs not running**
```bash
# Check:
1. vercel.json deployed? (check Vercel dashboard)
2. Cron secret set? (check Vercel env vars)
3. API routes working? (test manually with curl)
```

---

## 🧪 Testing Commands

```bash
# Test send notification
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "xxx",
    "title": "Test",
    "body": "Test notification",
    "type": "task_complete"
  }'

# Test deadline cron
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/notifications/check-deadlines

# Test habit cron
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/notifications/check-habits

# Test cleanup cron (NEW)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/notifications/cleanup-tokens

# Test Firebase config (NEW)
curl http://localhost:3000/api/firebase-config
```

---

## 📊 Monitoring

### **Firebase Console**
- Delivery stats
- Error tracking
- Token management

### **Supabase Dashboard**
- Query notifications table
- Check RPC function calls
- Monitor RLS policy hits

### **Vercel Logs**
- Cron execution logs
- API route logs
- Error logs

### **Browser DevTools**
- Service worker status
- FCM token
- Console logs

---

## 🎯 Next Steps (Priority Order)

### **1. Deploy Current System** 🔴 CRITICAL
```bash
supabase db push
vercel --prod
```

### **2. Build Preferences UI** 🟡 HIGH VALUE
```tsx
// app/dashboard/settings/notifications/page.tsx
// Add toggles for each notification type
// Use notification_preferences table
```

### **3. Build Analytics Dashboard** 🟢 NICE TO HAVE
```tsx
// app/dashboard/analytics/notifications/page.tsx
// Show delivery/open/click rates
// Use get_notification_analytics RPC
```

### **4. Add Notification Grouping** 🟢 IMPROVES UX
```typescript
// Update cron jobs to group notifications
// "5 tasks due tomorrow" instead of 5 separate
```

---

## 💡 Pro Tips

1. **Test locally first**
   ```bash
   npm run dev
   # Open http://localhost:3000
   # Check console for FCM token
   ```

2. **Use test notification button**
   - Click bell icon
   - Click "Kirim Test Notifikasi"
   - Should receive notification immediately

3. **Monitor delivery rates**
   - Check Firebase Console daily
   - Target: >95% delivery rate
   - If low, check for stale tokens

4. **Respect user preferences**
   - Always check preferences before sending
   - Provide easy opt-out
   - Don't spam users

5. **Group notifications**
   - Reduce notification fatigue
   - Better user experience
   - Higher engagement

---

## 📚 Documentation

- `NOTIFICATION_SYSTEM_COMPLETE.md` - Full implementation guide
- `NOTIFICATION_BEST_PRACTICES.md` - Best practices & optimization
- `NOTIFICATION_ANALYSIS_SUMMARY.md` - Executive summary
- `NOTIFICATION_ARCHITECTURE.md` - Architecture diagrams
- `NOTIFICATION_QUICK_REFERENCE.md` - This file

---

## 🆘 Need Help?

### **Check Documentation**
1. Read `NOTIFICATION_BEST_PRACTICES.md` for detailed guide
2. Check `NOTIFICATION_ARCHITECTURE.md` for diagrams
3. Review `NOTIFICATION_SYSTEM_COMPLETE.md` for setup

### **Debug Steps**
1. Check browser console for errors
2. Check Vercel logs for API errors
3. Check Supabase logs for database errors
4. Check Firebase Console for FCM errors

### **Common Solutions**
- Clear browser cache & reload
- Re-register service worker
- Re-request notification permission
- Check environment variables
- Verify cron secret

---

## ✅ Success Criteria

### **Deployment Success**
- ✅ All migrations run successfully
- ✅ Vercel deployment successful
- ✅ 3 cron jobs visible in dashboard
- ✅ Test notification received

### **User Experience Success**
- ✅ Permission prompt shows after 5s
- ✅ Badge count updates in real-time
- ✅ Notifications grouped by date
- ✅ Mark as read works
- ✅ Confetti shows on completion

### **Performance Success**
- ✅ Delivery rate >95%
- ✅ Open rate >30%
- ✅ Click rate >10%
- ✅ No stale tokens accumulating

---

## 🎉 You're Ready!

Sistem notifikasi sudah **production-ready** dan sangat solid. Deploy dengan confidence!

**Remember:**
- Start simple, iterate based on feedback
- Monitor metrics regularly
- Respect user preferences
- Don't spam users
- Keep improving

**Good luck!** 🚀

