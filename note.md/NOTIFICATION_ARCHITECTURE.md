# 🏗️ Notification System Architecture

## 📐 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FLOWDAY NOTIFICATION SYSTEM                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENT SIDE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐      ┌──────────────────┐                    │
│  │  User Browser    │      │  Service Worker  │                    │
│  │                  │      │                  │                    │
│  │  - React App     │◄────►│  - FCM Handler   │                    │
│  │  - useFCM Hook   │      │  - Background    │                    │
│  │  - Notification  │      │  - Click Handler │                    │
│  │    Bell          │      │                  │                    │
│  └────────┬─────────┘      └────────┬─────────┘                    │
│           │                         │                               │
│           │ Request Permission      │ Receive Push                 │
│           │ Get FCM Token           │ Show Notification            │
│           │                         │                               │
└───────────┼─────────────────────────┼───────────────────────────────┘
            │                         │
            │                         │
            ▼                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FIREBASE CLOUD MESSAGING                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  FCM Service                                                  │  │
│  │  - Token Management                                           │  │
│  │  - Message Routing                                            │  │
│  │  - Delivery Tracking                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                │ Push Notification
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            SERVER SIDE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  API Routes                                                   │  │
│  │                                                               │  │
│  │  /api/notifications/send          ◄─── Manual Trigger       │  │
│  │  /api/notifications/check-deadlines ◄─── Cron (9 AM)        │  │
│  │  /api/notifications/check-habits   ◄─── Cron (8 PM)         │  │
│  │  /api/notifications/cleanup-tokens ◄─── Cron (Weekly)       │  │
│  │  /api/firebase-config             ◄─── Service Worker       │  │
│  │                                                               │  │
│  └───────────────────────┬──────────────────────────────────────┘  │
│                          │                                           │
│                          │ Query/Insert                              │
│                          │                                           │
│  ┌───────────────────────▼──────────────────────────────────────┐  │
│  │  Supabase Database                                            │  │
│  │                                                               │  │
│  │  Tables:                                                      │  │
│  │  - fcm_tokens (device tokens)                                │  │
│  │  - notifications (history)                                   │  │
│  │  - notification_preferences (user settings)                  │  │
│  │  - tasks (for deadline check)                                │  │
│  │  - habits (for habit check)                                  │  │
│  │                                                               │  │
│  │  RPC Functions:                                               │  │
│  │  - get_unread_notification_count()                           │  │
│  │  - get_notification_preferences()                            │  │
│  │  - get_notification_analytics()                              │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Notification Flow Diagram

### **1. Permission & Token Registration**

```
User Opens App
     │
     ▼
Auto-prompt after 5s
     │
     ▼
User Grants Permission
     │
     ▼
Request FCM Token
     │
     ▼
Save Token to Database
     │
     ▼
Listen for Messages
```

### **2. Deadline Notification Flow**

```
Vercel Cron (9 AM Daily)
     │
     ▼
GET /api/notifications/check-deadlines
     │
     ▼
Query tasks due tomorrow
     │
     ▼
For each task:
  │
  ├─► Get user's FCM tokens
  │
  ├─► Check user preferences
  │
  ├─► Send to FCM
  │
  └─► Save to notifications table
     │
     ▼
FCM delivers to devices
     │
     ▼
User receives notification
     │
     ├─► Foreground: Toast + Badge update
     │
     └─► Background: System notification
```

### **3. Habit Reminder Flow**

```
Vercel Cron (8 PM Daily)
     │
     ▼
GET /api/notifications/check-habits
     │
     ▼
Query incomplete habits today
     │
     ▼
Group by user
     │
     ▼
For each user:
  │
  ├─► Get user's FCM tokens
  │
  ├─► Check user preferences
  │
  ├─► Send grouped notification
  │
  └─► Save to notifications table
     │
     ▼
FCM delivers to devices
     │
     ▼
User receives notification
```

### **4. Token Cleanup Flow**

```
Vercel Cron (Weekly Sunday 2 AM)
     │
     ▼
GET /api/notifications/cleanup-tokens
     │
     ▼
Query tokens not used in 30+ days
     │
     ▼
Delete stale tokens
     │
     ▼
Return cleanup stats
```

---

## 🗂️ Database Schema

### **fcm_tokens**
```sql
┌──────────────┬──────────┬─────────────────────────────┐
│ Column       │ Type     │ Description                 │
├──────────────┼──────────┼─────────────────────────────┤
│ id           │ UUID     │ Primary key                 │
│ user_id      │ UUID     │ FK to auth.users            │
│ token        │ TEXT     │ FCM token (unique)          │
│ device_info  │ JSONB    │ Device metadata             │
│ created_at   │ TIMESTAMP│ Token creation time         │
│ updated_at   │ TIMESTAMP│ Last update time            │
│ last_used_at │ TIMESTAMP│ Last notification sent      │
└──────────────┴──────────┴─────────────────────────────┘

Indexes:
- idx_fcm_tokens_user_id (user_id)
- unique constraint on token

RLS Policies:
- Users can only view/manage own tokens
```

### **notifications**
```sql
┌──────────────┬──────────┬─────────────────────────────┐
│ Column       │ Type     │ Description                 │
├──────────────┼──────────┼─────────────────────────────┤
│ id           │ UUID     │ Primary key                 │
│ user_id      │ UUID     │ FK to auth.users            │
│ title        │ TEXT     │ Notification title          │
│ body         │ TEXT     │ Notification body           │
│ type         │ TEXT     │ Type (deadline, habit, etc) │
│ data         │ JSONB    │ Additional data             │
│ read         │ BOOLEAN  │ Read status                 │
│ created_at   │ TIMESTAMP│ Creation time               │
│ delivered_at │ TIMESTAMP│ Delivery time (analytics)   │
│ opened_at    │ TIMESTAMP│ Open time (analytics)       │
│ clicked_at   │ TIMESTAMP│ Click time (analytics)      │
└──────────────┴──────────┴─────────────────────────────┘

Indexes:
- idx_notifications_user_id (user_id)
- idx_notifications_read (read)
- idx_notifications_created_at (created_at DESC)
- idx_notifications_type (type)

RLS Policies:
- Users can only view/update own notifications
```

### **notification_preferences**
```sql
┌───────────────────┬──────────┬─────────────────────────────┐
│ Column            │ Type     │ Description                 │
├───────────────────┼──────────┼─────────────────────────────┤
│ id                │ UUID     │ Primary key                 │
│ user_id           │ UUID     │ FK to auth.users (unique)   │
│ deadline_reminders│ BOOLEAN  │ Enable deadline notifs      │
│ habit_reminders   │ BOOLEAN  │ Enable habit notifs         │
│ streak_milestones │ BOOLEAN  │ Enable streak notifs        │
│ task_complete     │ BOOLEAN  │ Enable task complete notifs │
│ reminder_time     │ TIME     │ Preferred reminder time     │
│ created_at        │ TIMESTAMP│ Creation time               │
│ updated_at        │ TIMESTAMP│ Last update time            │
└───────────────────┴──────────┴─────────────────────────────┘

Indexes:
- idx_notification_preferences_user_id (user_id)
- unique constraint on user_id

RLS Policies:
- Users can only view/manage own preferences
```

---

## 📊 Data Flow Diagram

### **Notification Creation & Delivery**

```
┌─────────────┐
│   Trigger   │
│  (Cron/API) │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Check Conditions   │
│  - Due date         │
│  - Incomplete habit │
│  - User preferences │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Get FCM Tokens     │
│  - Query by user_id │
│  - Active tokens    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Send to FCM        │
│  - HTTP request     │
│  - With payload     │
└──────┬──────────────┘
       │
       ├─► Success ──┐
       │             │
       └─► Failure ──┤
                     │
                     ▼
              ┌──────────────┐
              │ Save to DB   │
              │ - notification│
              │ - analytics  │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │ Deliver to   │
              │ User Device  │
              └──────────────┘
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Authentication                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  - Supabase Auth (JWT)                             │    │
│  │  - User session validation                         │    │
│  │  - Token expiration                                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Layer 2: Authorization                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  - Row Level Security (RLS)                        │    │
│  │  - User can only access own data                   │    │
│  │  - Service role for cron jobs                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Layer 3: API Protection                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  - Cron secret for scheduled jobs                  │    │
│  │  - Rate limiting (recommended)                     │    │
│  │  - Input validation                                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Layer 4: Data Protection                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  - Environment variables for secrets               │    │
│  │  - HTTPS only                                      │    │
│  │  - No sensitive data in logs                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                    REACT COMPONENTS                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  NotificationBell                                             │
│  ├─► useUnreadCount() ──► Query unread count                │
│  ├─► Badge display                                           │
│  └─► Popover trigger                                         │
│       │                                                       │
│       └─► NotificationList                                   │
│            ├─► useNotifications() ──► Query notifications    │
│            ├─► useMarkAsRead() ──► Mutation                  │
│            ├─► useDeleteNotification() ──► Mutation          │
│            └─► Group by date                                 │
│                                                               │
│  NotificationPermissionPrompt                                 │
│  ├─► useFCM() ──► Request permission                        │
│  ├─► Auto-show after 5s                                      │
│  └─► Dismissible                                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    CUSTOM HOOKS                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  useFCM()                                                     │
│  ├─► requestNotificationPermission()                         │
│  ├─► onForegroundMessage()                                   │
│  ├─► saveFCMToken()                                          │
│  └─► Return: { token, permission, requestPermission }        │
│                                                               │
│  useNotifications()                                           │
│  ├─► useQuery(['notifications'])                             │
│  ├─► getNotifications()                                      │
│  ├─► Auto-refetch every 30s                                  │
│  └─► Return: { data, isLoading, error }                      │
│                                                               │
│  useUnreadCount()                                             │
│  ├─► useQuery(['unread-count'])                              │
│  ├─► getUnreadCount()                                        │
│  ├─► Auto-refetch every 30s                                  │
│  └─► Return: { data, isLoading }                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Next.js App                                       │    │
│  │  - SSR/SSG pages                                   │    │
│  │  - API routes                                      │    │
│  │  - Static assets                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Vercel Cron Jobs                                  │    │
│  │  - check-deadlines (daily 9 AM)                    │    │
│  │  - check-habits (daily 8 PM)                       │    │
│  │  - cleanup-tokens (weekly Sunday 2 AM)             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Environment Variables                             │    │
│  │  - NEXT_PUBLIC_* (client-side)                     │    │
│  │  - SUPABASE_SERVICE_ROLE_KEY (server-side)         │    │
│  │  - FIREBASE_SERVICE_ACCOUNT (server-side)          │    │
│  │  - CRON_SECRET (server-side)                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Supabase                    Firebase                       │
│  ├─ PostgreSQL Database      ├─ Cloud Messaging (FCM)      │
│  ├─ Authentication           ├─ Token Management           │
│  ├─ Row Level Security       └─ Push Delivery              │
│  └─ Real-time subscriptions                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Monitoring & Analytics

```
┌─────────────────────────────────────────────────────────────┐
│                    MONITORING STACK                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Firebase Console                                            │
│  ├─► Delivery stats                                         │
│  ├─► Error tracking                                         │
│  └─► Token management                                       │
│                                                              │
│  Supabase Dashboard                                          │
│  ├─► Database queries                                       │
│  ├─► RPC function calls                                     │
│  └─► Table statistics                                       │
│                                                              │
│  Vercel Logs                                                 │
│  ├─► Cron execution logs                                    │
│  ├─► API route logs                                         │
│  └─► Error logs                                             │
│                                                              │
│  Custom Analytics (NEW)                                      │
│  ├─► Delivery rate                                          │
│  ├─► Open rate                                              │
│  ├─► Click rate                                             │
│  └─► By notification type                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI/UX Flow

```
User Journey: Receiving a Notification

1. Permission Request
   ┌─────────────────────────┐
   │  Auto-prompt after 5s   │
   │  "Enable notifications?"│
   │  [Allow] [Not Now]      │
   └─────────────────────────┘
            │
            ▼
2. Notification Received
   ┌─────────────────────────┐
   │  Bell icon with badge   │
   │  🔔 (3)                 │
   │  Ping animation         │
   └─────────────────────────┘
            │
            ▼
3. Click Bell
   ┌─────────────────────────┐
   │  Notification List      │
   │  ┌───────────────────┐  │
   │  │ Today             │  │
   │  │ ⏰ Deadline Besok │  │
   │  │ 🔥 Habit Reminder │  │
   │  ├───────────────────┤  │
   │  │ Yesterday         │  │
   │  │ ✅ Task Complete  │  │
   │  └───────────────────┘  │
   └─────────────────────────┘
            │
            ▼
4. Click Notification
   ┌─────────────────────────┐
   │  Navigate to page       │
   │  Mark as read           │
   │  Update badge count     │
   └─────────────────────────┘
            │
            ▼
5. Confetti Animation (if milestone)
   ┌─────────────────────────┐
   │  🎉 Celebration!        │
   │  Confetti animation     │
   │  Toast message          │
   └─────────────────────────┘
```

---

This architecture document provides a comprehensive visual overview of the notification system. Use it as a reference for understanding how all components work together.

