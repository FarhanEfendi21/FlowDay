# 📊 ERD DIAGRAM LENGKAP - FlowDay Project
## (Termasuk Fitur Notifikasi)

---

## 🎨 VISUAL ERD DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AKTOR 1: MAHASISWA (USER)                          │
│                         (Human Actor / End User)                            │
│                                                                             │
│  Actions:                                                                   │
│  • Login/Register                    • View Analytics                       │
│  • CRUD Tasks                        • Manage Subjects                      │
│  • CRUD Habits                       • Configure Notification Preferences   │
│  • Toggle Habit Logs                 • View Notifications                   │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               │ Interacts via Web UI
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE LAYER                                   │
│                                                                             │
│  ┌──────────────────┐                                                       │
│  │   auth.users     │ (Supabase Auth - Managed by System)                  │
│  │   ┌──────────┐   │                                                       │
│  │   │ id (PK)  │◄──┼───────────────────────────────────┐                  │
│  │   │ email    │   │                                   │                  │
│  │   │ metadata │   │                                   │                  │
│  │   └──────────┘   │                                   │                  │
│  └────────┬─────────┘                                   │                  │
│           │                                             │                  │
│           │ 1:1                                         │                  │
│           ▼                                             │                  │
│  ┌──────────────────┐                                   │                  │
│  │   profiles       │                                   │                  │
│  │   ┌──────────┐   │                                   │                  │
│  │   │ id (PK,FK)   │ ──► REFERENCES auth.users(id)    │                  │
│  │   │ name         │     ON DELETE CASCADE             │                  │
│  │   │ avatar_url   │                                   │                  │
│  │   │ created_at   │                                   │                  │
│  │   │ updated_at   │                                   │                  │
│  │   └──────────┘   │                                   │                  │
│  └──────────────────┘                                   │                  │
│           │                                             │                  │
│           │ 1:N                                         │ 1:N              │
│           ├─────────────────────┬───────────────────────┼──────────┐       │
│           │                     │                       │          │       │
│           ▼                     ▼                       ▼          ▼       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │     tasks        │  │    habits        │  │  user_subjects   │        │
│  │  ┌───────────┐   │  │  ┌───────────┐   │  │  ┌───────────┐   │        │
│  │  │ id (PK)   │   │  │  │ id (PK)   │   │  │  │ id (PK)   │   │        │
│  │  │ user_id(FK)   │  │  │ user_id(FK)   │  │  │ user_id(FK)   │        │
│  │  │ title     │   │  │  │ title     │   │  │  │ name      │   │        │
│  │  │ description   │  │  │ current_  │   │  │  │ created_at│   │        │
│  │  │ subject   │   │  │  │   streak  │   │  │  └───────────┘   │        │
│  │  │ priority  │   │  │  │ deleted_at│   │  │                  │        │
│  │  │ status    │   │  │  │ created_at│   │  │  UNIQUE:         │        │
│  │  │ due_date  │   │  │  │ updated_at│   │  │  (user_id, name) │        │
│  │  │ deleted_at│   │  │  └───────────┘   │  └──────────────────┘        │
│  │  │ created_at│   │  └────────┬─────────┘                               │
│  │  │ updated_at│   │           │                                         │
│  │  └───────────┘   │           │ 1:N                                     │
│  │                  │           ▼                                         │
│  │  CHECK:          │  ┌──────────────────┐                               │
│  │  title 1-255 chr │  │   habit_logs     │                               │
│  └──────────────────┘  │  ┌───────────┐   │                               │
│                        │  │ id (PK)   │   │                               │
│                        │  │ habit_id(FK)  │ ──► REFERENCES habits(id)     │
│                        │  │ user_id(FK)   │     ON DELETE CASCADE         │
│                        │  │ log_date  │   │                               │
│                        │  │ completed │   │                               │
│                        │  │ created_at│   │                               │
│                        │  └───────────┘   │                               │
│                        │                  │                               │
│                        │  UNIQUE:         │                               │
│                        │  (habit_id,      │                               │
│                        │   log_date)      │                               │
│                        └──────────────────┘                               │
│                                                                            │
│  ┌─────────────────── NOTIFICATION SYSTEM ──────────────────────┐         │
│  │                                                               │         │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  │   fcm_tokens     │  │  notifications   │  │  notification_   │    │
│  │  │  ┌───────────┐   │  │  ┌───────────┐   │  │  preferences     │    │
│  │  │  │ id (PK)   │   │  │  │ id (PK)   │   │  │  ┌───────────┐   │    │
│  │  │  │ user_id(FK)───┼──┼──│ user_id(FK)───┼──┼──│ id (PK)   │   │    │
│  │  │  │ token     │   │  │  │ title     │   │  │  │ user_id(FK)   │    │
│  │  │  │ device_   │   │  │  │ body      │   │  │  │ deadline_ │   │    │
│  │  │  │   info    │   │  │  │ type      │   │  │  │   reminders   │    │
│  │  │  │ created_at│   │  │  │ data      │   │  │  │ habit_    │   │    │
│  │  │  │ updated_at│   │  │  │ read      │   │  │  │   reminders   │    │
│  │  │  │ last_used │   │  │  │ created_at│   │  │  │ streak_   │   │    │
│  │  │  │   _at     │   │  │  └───────────┘   │  │  │   milestones  │    │
│  │  │  └───────────┘   │  │                  │  │  │ task_     │   │    │
│  │  │                  │  │  Types:          │  │  │   complete│   │    │
│  │  │  UNIQUE: token   │  │  • deadline      │  │  │ reminder_ │   │    │
│  │  └──────────────────┘  │  • habit_reminder│  │  │   time    │   │    │
│  │           ▲             │  • streak_       │  │  │ created_at│   │    │
│  │           │             │    milestone     │  │  │ updated_at│   │    │
│  │           │             │  • task_complete │  │  └───────────┘   │    │
│  │           │             └──────────────────┘  │                  │    │
│  │           │                                   │  UNIQUE:         │    │
│  │           └───────────────────────────────────│  user_id         │    │
│  │                                               └──────────────────┘    │
│  │                                                                       │
│  └───────────────────────────────────────────────────────────────────────┘
│                                                                            │
└────────────────────────────────┬───────────────────────────────────────────┘
                                 │
                                 │ Automated Actions
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AKTOR 2: SYSTEM (AUTOMATED)                           │
│                    (System Actor / Background Processes)                    │
│                                                                             │
│  Automated Actions:                                                         │
│  ✓ Trigger: handle_new_user()                                               │
│    → Auto-create profile saat user register                                 │
│                                                                             │
│  ✓ Trigger: recalculate_habit_streak()                                      │
│    → Auto-calculate streak saat habit di-toggle                             │
│                                                                             │
│  ✓ Trigger: handle_updated_at()                                             │
│    → Auto-update timestamp saat data berubah                                │
│                                                                             │
│  ✓ RLS Policies                                                             │
│    → Enforce data isolation per user                                        │
│                                                                             │
│  ✓ RPC Functions                                                            │
│    → get_weekly_task_stats()                                                │
│    → get_habit_stats()                                                      │
│    → get_dashboard_summary()                                                │
│    → get_unread_notification_count()                                        │
│    → get_notification_preferences()                                         │
│                                                                             │
│  ✓ Cron Jobs (via Vercel/API Routes)                                        │
│    → /api/notifications/check-deadlines (daily at 8 AM)                     │
│    → /api/notifications/check-urgent-deadlines (every 6 hours)              │
│    → /api/notifications/check-habits (daily at user's reminder_time)        │
│    → /api/notifications/cleanup-tokens (weekly)                             │
│                                                                             │
│  ✓ Foreign Key Constraints                                                  │
│    → Cascade delete related records                                         │
│                                                                             │
│  ✓ CHECK Constraints                                                        │
│    → Validate data integrity (title length, etc.)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 DETAIL TABEL & RELASI

### **1. auth.users** (Supabase Auth - Managed)
```sql
-- Tabel bawaan Supabase Auth
id UUID PRIMARY KEY
email TEXT UNIQUE
raw_user_meta_data JSONB
created_at TIMESTAMPTZ
```

---

### **2. public.profiles**
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

**Relasi:**
- 1:1 dengan `auth.users`
- Auto-created via trigger `handle_new_user()`

---

### **3. public.tasks**
```sql
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL DEFAULT '',
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'todo',
  due_date DATE NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CHECK (char_length(title) BETWEEN 1 AND 255)
);
```

**Relasi:**
- Many:1 dengan `auth.users` (user_id)

**Enums:**
- `task_priority`: 'low', 'medium', 'high'
- `task_status`: 'todo', 'in_progress', 'done'

---

### **4. public.habits**
```sql
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  current_streak INT NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CHECK (char_length(title) BETWEEN 1 AND 100)
);
```

**Relasi:**
- Many:1 dengan `auth.users` (user_id)
- 1:Many dengan `habit_logs` (id)

---

### **5. public.habit_logs**
```sql
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  FOREIGN KEY (habit_id) REFERENCES public.habits(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE (habit_id, log_date)
);
```

**Relasi:**
- Many:1 dengan `habits` (habit_id)
- Many:1 dengan `auth.users` (user_id)

**Unique Constraint:**
- Satu habit hanya bisa punya 1 log per tanggal

---

### **6. public.user_subjects**
```sql
CREATE TABLE public.user_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CHECK (char_length(name) BETWEEN 1 AND 100),
  UNIQUE (user_id, name)
);
```

**Relasi:**
- Many:1 dengan `auth.users` (user_id)

**Unique Constraint:**
- Satu user tidak bisa punya mata kuliah dengan nama sama

---

### **7. public.fcm_tokens** ⭐ NEW
```sql
CREATE TABLE public.fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE (token)
);
```

**Relasi:**
- Many:1 dengan `auth.users` (user_id)
- Satu user bisa punya multiple tokens (multiple devices)

**Purpose:**
- Menyimpan Firebase Cloud Messaging (FCM) tokens
- Untuk push notifications ke device user

---

### **8. public.notifications** ⭐ NEW
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

**Relasi:**
- Many:1 dengan `auth.users` (user_id)

**Notification Types:**
- `deadline` - Reminder untuk task deadline
- `habit_reminder` - Reminder untuk complete habit
- `streak_milestone` - Notifikasi saat mencapai streak milestone
- `task_complete` - Notifikasi saat task selesai

**Purpose:**
- Menyimpan history notifikasi yang dikirim
- User bisa lihat notifikasi di UI

---

### **9. public.notification_preferences** ⭐ NEW
```sql
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  deadline_reminders BOOLEAN DEFAULT TRUE,
  habit_reminders BOOLEAN DEFAULT TRUE,
  streak_milestones BOOLEAN DEFAULT TRUE,
  task_complete BOOLEAN DEFAULT TRUE,
  reminder_time TIME DEFAULT '20:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE (user_id)
);
```

**Relasi:**
- 1:1 dengan `auth.users` (user_id)

**Purpose:**
- User bisa customize notification preferences
- Set waktu reminder untuk habit (default 8 PM)
- Enable/disable per notification type

---

## 🔗 RINGKASAN RELASI

```
auth.users (1) ──────────── (1) profiles
           │
           ├─── (1:N) ──────── tasks
           │
           ├─── (1:N) ──────── habits ──── (1:N) ──── habit_logs
           │
           ├─── (1:N) ──────── user_subjects
           │
           ├─── (1:N) ──────── fcm_tokens
           │
           ├─── (1:N) ──────── notifications
           │
           └─── (1:1) ──────── notification_preferences
```

---

## 🔐 CONSTRAINTS SUMMARY

### Primary Keys: 9 tabel
- Semua tabel menggunakan UUID sebagai PK

### Foreign Keys: 11 relasi
1. `profiles.id` → `auth.users.id`
2. `tasks.user_id` → `auth.users.id`
3. `habits.user_id` → `auth.users.id`
4. `habit_logs.habit_id` → `habits.id`
5. `habit_logs.user_id` → `auth.users.id`
6. `user_subjects.user_id` → `auth.users.id`
7. `fcm_tokens.user_id` → `auth.users.id` ⭐
8. `notifications.user_id` → `auth.users.id` ⭐
9. `notification_preferences.user_id` → `auth.users.id` ⭐

### Unique Constraints: 4
1. `habit_logs` (habit_id, log_date)
2. `user_subjects` (user_id, name)
3. `fcm_tokens` (token) ⭐
4. `notification_preferences` (user_id) ⭐

### Check Constraints: 3
1. `tasks.title` - char_length BETWEEN 1 AND 255
2. `habits.title` - char_length BETWEEN 1 AND 100
3. `user_subjects.name` - char_length BETWEEN 1 AND 100

### Cascade Delete: 9 relasi
- Semua FK menggunakan `ON DELETE CASCADE`

---

## 🎯 2 AKTOR DALAM SISTEM

### **Aktor 1: MAHASISWA (User)**
**Interaksi:**
- Login/Register
- CRUD Tasks & Habits
- View Notifications
- Configure Notification Preferences
- View Analytics

### **Aktor 2: SYSTEM (Automated)**
**Automated Actions:**
- Database Triggers (auto-create profile, calculate streak, update timestamp)
- RLS Policies (enforce data isolation)
- RPC Functions (analytics, notification count)
- **Cron Jobs (send notifications)** ⭐
- Foreign Key Constraints (cascade delete)

---

## 📊 STATISTIK DATABASE

| Metric | Count |
|--------|-------|
| **Total Tabel** | 9 tabel (6 core + 3 notification) |
| **Total Foreign Keys** | 11 relasi |
| **Total Unique Constraints** | 4 |
| **Total Check Constraints** | 3 |
| **Total Indexes** | 10+ indexes |
| **Total RPC Functions** | 7+ functions |
| **Total Triggers** | 5+ triggers |
| **Total RLS Policies** | 20+ policies |

---

## 🚀 FITUR NOTIFIKASI (NEW)

### **Notification Flow:**

```
1. User enables notifications
   ↓
2. FCM token saved to fcm_tokens table
   ↓
3. Cron job runs (check-deadlines, check-habits)
   ↓
4. System checks notification_preferences
   ↓
5. If enabled, send notification via FCM
   ↓
6. Save to notifications table (history)
   ↓
7. User receives push notification
   ↓
8. User views notification in UI
   ↓
9. Mark as read
```

### **Notification Types:**

| Type | Trigger | Frequency |
|------|---------|-----------|
| **deadline** | Task due in 1 day | Daily at 8 AM |
| **urgent_deadline** | Task due in 6 hours | Every 6 hours |
| **habit_reminder** | Daily habit reminder | User's reminder_time |
| **streak_milestone** | Reach 7, 30, 100 days | Real-time |
| **task_complete** | Task marked as done | Real-time |

---

**Dibuat pada**: 4 Mei 2026  
**Project**: FlowDay - Task & Habit Management System  
**Versi**: 2.0 (dengan Notification System)
