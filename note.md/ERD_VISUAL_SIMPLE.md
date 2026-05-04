# 📊 ERD VISUAL SEDERHANA - FlowDay Project

## Diagram ERD untuk Presentasi

```
                    ┌─────────────────────┐
                    │    auth.users       │
                    │  ┌───────────────┐  │
                    │  │ id (PK)       │  │
                    │  │ email         │  │
                    │  └───────────────┘  │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                │ 1:1          │ 1:N          │ 1:N
                ▼              ▼              ▼
    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │   profiles       │  │     tasks        │  │    habits        │
    │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │
    │ │ id (PK,FK)   │ │  │ │ id (PK)      │ │  │ │ id (PK)      │ │
    │ │ name         │ │  │ │ user_id (FK) │ │  │ │ user_id (FK) │ │
    │ │ avatar_url   │ │  │ │ title        │ │  │ │ title        │ │
    │ └──────────────┘ │  │ │ description  │ │  │ │ current_     │ │
    └──────────────────┘  │ │ subject      │ │  │ │   streak     │ │
                          │ │ priority     │ │  │ │ deleted_at   │ │
                          │ │ status       │ │  │ └──────────────┘ │
                          │ │ due_date     │ │  └────────┬─────────┘
                          │ │ deleted_at   │ │           │
                          │ └──────────────┘ │           │ 1:N
                          └──────────────────┘           ▼
                                              ┌──────────────────┐
                                              │   habit_logs     │
                                              │ ┌──────────────┐ │
                                              │ │ id (PK)      │ │
                                              │ │ habit_id(FK) │ │
                                              │ │ user_id (FK) │ │
                                              │ │ log_date     │ │
                                              │ │ completed    │ │
                                              │ └──────────────┘ │
                                              │ UNIQUE:          │
                                              │ (habit_id,       │
                                              │  log_date)       │
                                              └──────────────────┘

                ┌──────────────┴──────────────┐
                │                             │
                │ 1:N                         │ 1:N
                ▼                             ▼
    ┌──────────────────┐          ┌──────────────────┐
    │  user_subjects   │          │   fcm_tokens     │
    │ ┌──────────────┐ │          │ ┌──────────────┐ │
    │ │ id (PK)      │ │          │ │ id (PK)      │ │
    │ │ user_id (FK) │ │          │ │ user_id (FK) │ │
    │ │ name         │ │          │ │ token        │ │
    │ └──────────────┘ │          │ │ device_info  │ │
    │ UNIQUE:          │          │ │ last_used_at │ │
    │ (user_id, name)  │          │ └──────────────┘ │
    └──────────────────┘          │ UNIQUE: token    │
                                  └──────────────────┘

                ┌──────────────┴──────────────┐
                │                             │
                │ 1:N                         │ 1:1
                ▼                             ▼
    ┌──────────────────┐          ┌──────────────────────┐
    │  notifications   │          │  notification_       │
    │ ┌──────────────┐ │          │  preferences         │
    │ │ id (PK)      │ │          │ ┌──────────────────┐ │
    │ │ user_id (FK) │ │          │ │ id (PK)          │ │
    │ │ title        │ │          │ │ user_id (FK)     │ │
    │ │ body         │ │          │ │ deadline_        │ │
    │ │ type         │ │          │ │   reminders      │ │
    │ │ data         │ │          │ │ habit_reminders  │ │
    │ │ read         │ │          │ │ streak_          │ │
    │ └──────────────┘ │          │ │   milestones     │ │
    │                  │          │ │ task_complete    │ │
    │ Types:           │          │ │ reminder_time    │ │
    │ • deadline       │          │ └──────────────────┘ │
    │ • habit_reminder │          │ UNIQUE: user_id      │
    │ • streak_        │          └──────────────────────┘
    │   milestone      │
    │ • task_complete  │
    └──────────────────┘
```

---

## 🔗 Ringkasan Relasi

| Parent Table | Child Table | Relasi | Constraint |
|--------------|-------------|--------|------------|
| auth.users | profiles | 1:1 | ON DELETE CASCADE |
| auth.users | tasks | 1:N | ON DELETE CASCADE |
| auth.users | habits | 1:N | ON DELETE CASCADE |
| habits | habit_logs | 1:N | ON DELETE CASCADE |
| auth.users | habit_logs | 1:N | ON DELETE CASCADE |
| auth.users | user_subjects | 1:N | ON DELETE CASCADE |
| auth.users | fcm_tokens | 1:N | ON DELETE CASCADE |
| auth.users | notifications | 1:N | ON DELETE CASCADE |
| auth.users | notification_preferences | 1:1 | ON DELETE CASCADE |

**Total: 9 Foreign Key Relations**

---

## 📋 Tabel Summary

| No | Tabel | Jumlah Kolom | Primary Key | Foreign Keys | Unique Constraints |
|----|-------|--------------|-------------|--------------|-------------------|
| 1 | auth.users | 4+ | id | - | email |
| 2 | profiles | 5 | id | 1 (users) | - |
| 3 | tasks | 11 | id | 1 (users) | - |
| 4 | habits | 7 | id | 1 (users) | - |
| 5 | habit_logs | 6 | id | 2 (habits, users) | (habit_id, log_date) |
| 6 | user_subjects | 4 | id | 1 (users) | (user_id, name) |
| 7 | fcm_tokens | 7 | id | 1 (users) | token |
| 8 | notifications | 8 | id | 1 (users) | - |
| 9 | notification_preferences | 9 | id | 1 (users) | user_id |

**Total: 9 Tabel**

---

## 🎯 Constraint Summary

### ✅ Primary Keys
- **9 tabel** dengan UUID sebagai PK

### ✅ Foreign Keys
- **11 relasi** dengan ON DELETE CASCADE

### ✅ Unique Constraints
- `habit_logs`: (habit_id, log_date)
- `user_subjects`: (user_id, name)
- `fcm_tokens`: token
- `notification_preferences`: user_id

### ✅ Check Constraints
- `tasks.title`: char_length BETWEEN 1 AND 255
- `habits.title`: char_length BETWEEN 1 AND 100
- `user_subjects.name`: char_length BETWEEN 1 AND 100

### ✅ Indexes
- 10+ indexes untuk optimasi query

---

## 🎭 2 Aktor

### Aktor 1: MAHASISWA (User)
- Login/Register
- CRUD Tasks & Habits
- View Notifications
- Configure Preferences

### Aktor 2: SYSTEM (Automated)
- Auto-create profile (trigger)
- Auto-calculate streak (trigger)
- Send notifications (cron jobs)
- Enforce RLS policies
- Execute analytics (RPC functions)

---

**Dibuat pada**: 4 Mei 2026  
**Project**: FlowDay  
**Versi**: 2.0 (dengan Notification System)
