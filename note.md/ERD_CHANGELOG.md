# 📝 ERD CHANGELOG - FlowDay Project

## Perubahan dari Versi 1.0 ke 2.0

---

## 🆕 TABEL BARU (3 Tabel)

### 1. **fcm_tokens** - Firebase Cloud Messaging Tokens

**Tujuan**: Menyimpan device tokens untuk push notifications

**Kolom:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `token` (TEXT, UNIQUE) - FCM token dari device
- `device_info` (JSONB) - Info device (browser, OS, dll)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `last_used_at` (TIMESTAMPTZ)

**Relasi:**
- Many:1 dengan `auth.users`
- Satu user bisa punya multiple tokens (multiple devices)

**Use Case:**
- User enable notifications di browser/device
- Token disimpan untuk kirim push notifications
- Support multiple devices per user

---

### 2. **notifications** - Notification History

**Tujuan**: Menyimpan history semua notifikasi yang dikirim

**Kolom:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `title` (TEXT, NOT NULL)
- `body` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL) - deadline, habit_reminder, streak_milestone, task_complete
- `data` (JSONB) - Additional data (task_id, habit_id, dll)
- `read` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMPTZ)

**Relasi:**
- Many:1 dengan `auth.users`

**Use Case:**
- User bisa lihat history notifikasi di UI
- Mark notification as read
- Filter by type
- Track notification engagement

---

### 3. **notification_preferences** - User Notification Settings

**Tujuan**: Menyimpan preferensi notifikasi per user

**Kolom:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users, UNIQUE)
- `deadline_reminders` (BOOLEAN, DEFAULT TRUE)
- `habit_reminders` (BOOLEAN, DEFAULT TRUE)
- `streak_milestones` (BOOLEAN, DEFAULT TRUE)
- `task_complete` (BOOLEAN, DEFAULT TRUE)
- `reminder_time` (TIME, DEFAULT '20:00:00')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Relasi:**
- 1:1 dengan `auth.users`

**Use Case:**
- User bisa customize notification preferences
- Enable/disable per notification type
- Set custom reminder time untuk habit reminders
- Default values untuk new users

---

## 📊 PERBANDINGAN VERSI

| Aspek | Versi 1.0 | Versi 2.0 |
|-------|-----------|-----------|
| **Total Tabel** | 6 tabel | 9 tabel (+3) |
| **Foreign Keys** | 8 relasi | 11 relasi (+3) |
| **Unique Constraints** | 2 | 4 (+2) |
| **RPC Functions** | 7 functions | 9 functions (+2) |
| **API Routes** | 0 notification | 5 notification endpoints |
| **Cron Jobs** | 0 | 4 cron jobs |

---

## 🔗 RELASI BARU

### 1. auth.users → fcm_tokens (1:N)
```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
```
- Satu user bisa punya banyak FCM tokens (multiple devices)
- Cascade delete: hapus user → hapus semua tokens

### 2. auth.users → notifications (1:N)
```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
```
- Satu user bisa punya banyak notifications
- Cascade delete: hapus user → hapus semua notifications

### 3. auth.users → notification_preferences (1:1)
```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
UNIQUE (user_id)
```
- Satu user hanya punya 1 preference record
- Cascade delete: hapus user → hapus preferences

---

## 🆕 FITUR BARU

### 1. **Push Notifications**
- Firebase Cloud Messaging (FCM) integration
- Browser push notifications
- Support multiple devices per user

### 2. **Notification Types**

#### a) Deadline Reminders
- **Trigger**: Task due in 1 day
- **Schedule**: Daily at 8:00 AM (WIB)
- **Cron**: `/api/notifications/check-deadlines`

#### b) Urgent Deadline Reminders
- **Trigger**: Task due in 6 hours
- **Schedule**: Every 6 hours
- **Cron**: `/api/notifications/check-urgent-deadlines`

#### c) Habit Reminders
- **Trigger**: Daily reminder untuk complete habit
- **Schedule**: User's custom `reminder_time` (default 8:00 PM)
- **Cron**: `/api/notifications/check-habits`

#### d) Streak Milestones
- **Trigger**: Reach 7, 30, 100 days streak
- **Schedule**: Real-time (saat toggle habit)

#### e) Task Complete
- **Trigger**: Task marked as done
- **Schedule**: Real-time (saat update task status)

### 3. **Notification Preferences**
- User bisa enable/disable per notification type
- Custom reminder time untuk habit reminders
- Settings page untuk manage preferences

### 4. **Notification History**
- View all notifications di UI
- Mark as read/unread
- Filter by type
- Unread count badge

### 5. **Token Management**
- Auto-cleanup inactive tokens (weekly)
- Update `last_used_at` saat send notification
- Support multiple devices per user

---

## 🔧 RPC FUNCTIONS BARU

### 1. `get_unread_notification_count(p_user_id UUID)`
```sql
RETURNS INTEGER
```
**Purpose**: Get jumlah unread notifications untuk badge

### 2. `get_notification_preferences(p_user_id UUID)`
```sql
RETURNS TABLE (
  deadline_reminders BOOLEAN,
  habit_reminders BOOLEAN,
  streak_milestones BOOLEAN,
  task_complete BOOLEAN,
  reminder_time TIME
)
```
**Purpose**: Get user preferences dengan default values

---

## 🚀 API ROUTES BARU

### 1. `/api/notifications/check-deadlines`
- **Method**: GET
- **Schedule**: Daily at 8:00 AM (WIB)
- **Purpose**: Check tasks due in 1 day, send reminders

### 2. `/api/notifications/check-urgent-deadlines`
- **Method**: GET
- **Schedule**: Every 6 hours
- **Purpose**: Check tasks due in 6 hours, send urgent reminders

### 3. `/api/notifications/check-habits`
- **Method**: GET
- **Schedule**: Daily at user's reminder_time
- **Purpose**: Check incomplete habits, send reminders

### 4. `/api/notifications/cleanup-tokens`
- **Method**: GET
- **Schedule**: Weekly
- **Purpose**: Delete inactive tokens (not used in 30 days)

### 5. `/api/notifications/send`
- **Method**: POST
- **Purpose**: Send notification to specific user (internal use)

---

## 📈 INDEXES BARU

```sql
-- fcm_tokens
CREATE INDEX idx_fcm_tokens_user_id ON public.fcm_tokens(user_id);

-- notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- notification_preferences
CREATE INDEX idx_notification_preferences_user_id 
  ON public.notification_preferences(user_id);
```

**Total**: 5 indexes baru untuk optimasi query

---

## 🔐 RLS POLICIES BARU

### fcm_tokens (4 policies)
- Users can view own FCM tokens
- Users can insert own FCM tokens
- Users can update own FCM tokens
- Users can delete own FCM tokens

### notifications (2 policies)
- Users can view own notifications
- Users can update own notifications (mark as read)

### notification_preferences (3 policies)
- Users can view own preferences
- Users can insert own preferences
- Users can update own preferences

**Total**: 9 RLS policies baru

---

## 🎯 MIGRATION FILES

### Migration 008: Add Notifications
**File**: `supabase/migrations/008_add_notifications.sql`

**Changes:**
- Create `fcm_tokens` table
- Create `notifications` table
- Add indexes
- Add RLS policies
- Add `update_fcm_token_updated_at()` function
- Add `get_unread_notification_count()` function

### Migration 009: Add Notification Preferences
**File**: `supabase/migrations/009_add_notification_preferences.sql`

**Changes:**
- Create `notification_preferences` table
- Add indexes
- Add RLS policies
- Add `get_notification_preferences()` function
- Insert default preferences for existing users

---

## 📝 DOKUMENTASI TERKAIT

1. **ERD_DIAGRAM_LENGKAP.md** - ERD lengkap dengan notifikasi
2. **ERD_VISUAL_SIMPLE.md** - ERD sederhana untuk presentasi
3. **NOTIFICATION_SYSTEM_COMPLETE.md** - Dokumentasi sistem notifikasi
4. **NOTIFICATION_BEST_PRACTICES.md** - Best practices
5. **NOTIFICATION_ANALYSIS_SUMMARY.md** - Analisis sistem

---

## ✅ CHECKLIST IMPLEMENTASI

- [x] Create `fcm_tokens` table
- [x] Create `notifications` table
- [x] Create `notification_preferences` table
- [x] Add foreign key constraints
- [x] Add unique constraints
- [x] Add indexes
- [x] Add RLS policies
- [x] Add RPC functions
- [x] Create API routes
- [x] Setup cron jobs (vercel.json)
- [x] Implement FCM service
- [x] Add notification UI components
- [x] Add settings page for preferences
- [x] Update ERD documentation
- [x] Update ANALISIS_TUGAS_AKHIR.md

---

## 🎓 UNTUK PRESENTASI TUGAS AKHIR

### Poin Penting yang Harus Dijelaskan:

1. **Penambahan 3 Tabel Baru**
   - fcm_tokens (untuk device management)
   - notifications (untuk history)
   - notification_preferences (untuk user settings)

2. **Relasi Baru**
   - 3 foreign keys baru ke auth.users
   - 2 unique constraints baru
   - Semua dengan ON DELETE CASCADE

3. **Fitur Notifikasi**
   - 5 tipe notifikasi berbeda
   - Customizable preferences
   - Multiple device support
   - Cron jobs untuk automated reminders

4. **Security**
   - RLS policies untuk semua tabel baru
   - User hanya bisa akses data sendiri
   - Token management dengan cleanup

5. **Performance**
   - 5 indexes baru untuk optimasi
   - Efficient queries dengan RPC functions
   - Pagination ready

---

**Dibuat pada**: 4 Mei 2026  
**Project**: FlowDay - Task & Habit Management System  
**Versi**: 2.0 (dengan Notification System)  
**Status**: ✅ COMPLETE
