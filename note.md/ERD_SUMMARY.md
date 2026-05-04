# 📊 ERD SUMMARY - FlowDay Project v2.0

## 🎯 Quick Overview

**Total Tabel**: 9 tabel (6 core + 3 notification)  
**Total Foreign Keys**: 11 relasi  
**Total Constraints**: 25+ constraints  
**Status**: ✅ MEMENUHI SEMUA KRITERIA TUGAS AKHIR

---

## 📋 Daftar Tabel

### Core Tables (6)
1. **auth.users** - Supabase Auth (managed)
2. **profiles** - User profile data
3. **tasks** - Task management dengan soft delete
4. **habits** - Habit tracking dengan streak
5. **habit_logs** - Daily habit completion logs
6. **user_subjects** - User's mata kuliah

### Notification Tables (3) ⭐ NEW
7. **fcm_tokens** - Device tokens untuk push notifications
8. **notifications** - Notification history
9. **notification_preferences** - User notification settings

---

## 🔗 Relasi Antar Tabel

```
auth.users (1) ──── (1) profiles
           │
           ├─── (1:N) ──── tasks
           │
           ├─── (1:N) ──── habits ──── (1:N) ──── habit_logs
           │
           ├─── (1:N) ──── user_subjects
           │
           ├─── (1:N) ──── fcm_tokens ⭐
           │
           ├─── (1:N) ──── notifications ⭐
           │
           └─── (1:1) ──── notification_preferences ⭐
```

---

## 🎭 2 Aktor

### Aktor 1: MAHASISWA (User)
- Login/Register
- CRUD Tasks & Habits
- View Notifications
- Configure Preferences
- View Analytics

### Aktor 2: SYSTEM (Automated)
- Auto-create profile (trigger)
- Auto-calculate streak (trigger)
- Send notifications (cron jobs) ⭐
- Enforce RLS policies
- Execute analytics (RPC functions)

---

## ✅ Kriteria Tugas Akhir

| No | Kriteria | Status | Implementasi |
|----|----------|--------|--------------|
| 1 | Website + Database + CRUD | ✅ | 9 tabel dengan CRUD lengkap |
| 2 | ERD dengan min 2 aktor | ✅ | User & System |
| 3 | Min 3 tabel + 1 constraint | ✅ | 9 tabel + 25+ constraints |
| 4 | Soft Delete & Hard Delete | ✅ | Tasks & Habits |
| 5 | Query JOIN (>2 tabel) | ✅ | Stats functions |
| 6 | Fitur Pencarian | ✅ | Tasks, Habits, Trash |
| 7 | Sistem Autentikasi | ✅ | Login, Register, RLS |
| 8 | Navbar | ✅ | Sidebar + Top bar |

---

## 🆕 Fitur Notifikasi (NEW)

### Notification Types
1. **Deadline Reminders** - Task due in 1 day (daily 8 AM)
2. **Urgent Deadline** - Task due in 6 hours (every 6 hours)
3. **Habit Reminders** - Daily habit reminder (custom time)
4. **Streak Milestones** - Reach 7, 30, 100 days (real-time)
5. **Task Complete** - Task marked as done (real-time)

### Features
- ✅ Push notifications via FCM
- ✅ Multiple device support
- ✅ Customizable preferences
- ✅ Notification history
- ✅ Read/unread status
- ✅ Auto-cleanup inactive tokens

---

## 📁 File Dokumentasi

1. **ERD_DIAGRAM_LENGKAP.md** - ERD lengkap dengan detail
2. **ERD_VISUAL_SIMPLE.md** - ERD sederhana untuk presentasi
3. **ERD_CHANGELOG.md** - Perubahan dari v1.0 ke v2.0
4. **ERD_SUMMARY.md** - Summary singkat (file ini)
5. **ANALISIS_TUGAS_AKHIR.md** - Analisis kelengkapan (updated)
6. **ERD_PENJELASAN_2_AKTOR.md** - Penjelasan 2 aktor

---

## 🎓 Tips Presentasi

### Slide 1: Overview
- Tunjukkan ERD_VISUAL_SIMPLE.md
- Jelaskan 9 tabel dan relasinya

### Slide 2: Core Features
- CRUD Tasks & Habits
- Soft/Hard Delete
- Analytics dengan JOIN queries

### Slide 3: Notification System ⭐
- 3 tabel baru untuk notifikasi
- 5 tipe notifikasi
- Cron jobs untuk automated reminders

### Slide 4: 2 Aktor
- Aktor 1: Mahasiswa (user actions)
- Aktor 2: System (automated processes)
- Tunjukkan contoh trigger dan cron jobs

### Slide 5: Constraints & Security
- 25+ constraints (PK, FK, UNIQUE, CHECK)
- RLS policies untuk data isolation
- ON DELETE CASCADE

---

## 📊 Statistik

| Metric | Count |
|--------|-------|
| Tabel | 9 |
| Foreign Keys | 11 |
| Unique Constraints | 4 |
| Check Constraints | 3 |
| Indexes | 15+ |
| RPC Functions | 9+ |
| Triggers | 5+ |
| RLS Policies | 29+ |
| API Routes | 5 notification endpoints |
| Cron Jobs | 4 |

---

**Dibuat pada**: 4 Mei 2026  
**Project**: FlowDay  
**Status**: ✅ SIAP PRESENTASI
