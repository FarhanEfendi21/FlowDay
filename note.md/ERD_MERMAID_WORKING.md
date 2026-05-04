# 📊 ERD FlowDay - Working Version (Tested)

## ✅ TESTED & WORKING - Copy Code Ini

### 🔗 Paste ke: https://mermaid.live/

---

## 🎯 ERD Simplified (RECOMMENDED - Paling Stabil)

erDiagram
    auth_users ||--|| profiles : "has"
    auth_users ||--o{ tasks : "creates"
    auth_users ||--o{ habits : "tracks"
    habits ||--o{ habit_logs : "records"
    auth_users ||--o{ user_subjects : "enrolls"
    auth_users ||--o{ fcm_tokens : "registers"
    auth_users ||--o{ notifications : "receives"
    auth_users ||--|| notification_preferences : "configures"
    
    auth_users {
        uuid id
        text email
        timestamptz created_at
    }
    
    profiles {
        uuid id
        text name
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }
    
    tasks {
        uuid id
        uuid user_id
        text title
        text description
        text subject
        text priority
        text status
        date due_date
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    habits {
        uuid id
        uuid user_id
        text title
        int current_streak
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    habit_logs {
        uuid id
        uuid habit_id
        uuid user_id
        date log_date
        boolean completed
        timestamptz created_at
    }
    
    user_subjects {
        uuid id
        uuid user_id
        text name
        timestamptz created_at
    }
    
    fcm_tokens {
        uuid id
        uuid user_id
        text token
        jsonb device_info
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_used_at
    }
    
    notifications {
        uuid id
        uuid user_id
        text title
        text body
        text type
        jsonb data
        boolean read
        timestamptz created_at
    }
    
    notification_preferences {
        uuid id
        uuid user_id
        boolean deadline_reminders
        boolean habit_reminders
        boolean streak_milestones
        boolean task_complete
        time reminder_time
        timestamptz created_at
        timestamptz updated_at
    }

---

## 🎨 ERD Compact (Untuk Presentasi)

erDiagram
    auth_users ||--|| profiles : "has"
    auth_users ||--o{ tasks : "creates"
    auth_users ||--o{ habits : "tracks"
    habits ||--o{ habit_logs : "records"
    auth_users ||--o{ user_subjects : "enrolls"
    auth_users ||--o{ fcm_tokens : "registers"
    auth_users ||--o{ notifications : "receives"
    auth_users ||--|| notification_preferences : "configures"
    
    auth_users {
        uuid id
        text email
    }
    
    profiles {
        uuid id
        text name
    }
    
    tasks {
        uuid id
        text title
        text status
        date due_date
    }
    
    habits {
        uuid id
        text title
        int current_streak
    }
    
    habit_logs {
        uuid id
        date log_date
        boolean completed
    }
    
    user_subjects {
        uuid id
        text name
    }
    
    fcm_tokens {
        uuid id
        text token
    }
    
    notifications {
        uuid id
        text title
        boolean read
    }
    
    notification_preferences {
        uuid id
        time reminder_time
    }

---

## 📝 ERD dengan Komentar (Untuk Dokumentasi)

erDiagram
    auth_users ||--|| profiles : "has"
    auth_users ||--o{ tasks : "creates"
    auth_users ||--o{ habits : "tracks"
    habits ||--o{ habit_logs : "records"
    auth_users ||--o{ user_subjects : "enrolls"
    auth_users ||--o{ fcm_tokens : "registers"
    auth_users ||--o{ notifications : "receives"
    auth_users ||--|| notification_preferences : "configures"
    
    auth_users {
        uuid id "Primary Key"
        text email "Unique Email"
        timestamptz created_at "Registration Date"
    }
    
    profiles {
        uuid id "PK and FK to auth_users"
        text name "Display Name"
        text avatar_url "Profile Picture URL"
        timestamptz created_at
        timestamptz updated_at
    }
    
    tasks {
        uuid id "Primary Key"
        uuid user_id "FK to auth_users"
        text title "Task Title"
        text description "Task Description"
        text subject "Mata Kuliah"
        text priority "low medium high"
        text status "todo in_progress done"
        date due_date "Deadline Date"
        timestamptz deleted_at "Soft Delete"
        timestamptz created_at
        timestamptz updated_at
    }
    
    habits {
        uuid id "Primary Key"
        uuid user_id "FK to auth_users"
        text title "Habit Title"
        int current_streak "Current Streak Count"
        timestamptz deleted_at "Soft Delete"
        timestamptz created_at
        timestamptz updated_at
    }
    
    habit_logs {
        uuid id "Primary Key"
        uuid habit_id "FK to habits"
        uuid user_id "FK to auth_users"
        date log_date "Unique per habit"
        boolean completed "Completion Status"
        timestamptz created_at
    }
    
    user_subjects {
        uuid id "Primary Key"
        uuid user_id "FK to auth_users"
        text name "Subject Name"
        timestamptz created_at
    }
    
    fcm_tokens {
        uuid id "Primary Key"
        uuid user_id "FK to auth_users"
        text token "Unique FCM Token"
        jsonb device_info "Device Metadata"
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_used_at "Last Notification Sent"
    }
    
    notifications {
        uuid id "Primary Key"
        uuid user_id "FK to auth_users"
        text title "Notification Title"
        text body "Notification Body"
        text type "deadline habit_reminder etc"
        jsonb data "Additional Data"
        boolean read "Read Status"
        timestamptz created_at
    }
    
    notification_preferences {
        uuid id "Primary Key"
        uuid user_id "FK to auth_users Unique"
        boolean deadline_reminders "Enable Deadline Reminders"
        boolean habit_reminders "Enable Habit Reminders"
        boolean streak_milestones "Enable Streak Notifications"
        boolean task_complete "Enable Task Complete"
        time reminder_time "Daily Reminder Time"
        timestamptz created_at
        timestamptz updated_at
    }

---

## 🎯 Langkah Penggunaan:

### 1. Pilih Versi
- **ERD Simplified**: Paling stabil, recommended untuk presentasi
- **ERD Compact**: Lebih ringkas, hanya kolom penting
- **ERD dengan Komentar**: Untuk dokumentasi lengkap

### 2. Copy Code
- Copy dari "erDiagram" sampai bawah
- Jangan copy backticks atau markdown formatting

### 3. Paste ke Mermaid Live
- Buka: https://mermaid.live/
- Hapus code default
- Paste code yang sudah di-copy
- Diagram akan muncul otomatis

### 4. Export
- Klik "Actions" → "PNG" atau "SVG"
- Download untuk presentasi

---

## ⚠️ Catatan Penting:

### Yang Dihapus dari Versi Sebelumnya:
- ❌ `PK_FK` → Diganti jadi komentar "PK and FK to auth_users"
- ❌ `FK_UK` → Diganti jadi komentar "FK to auth_users Unique"
- ❌ `PK`, `FK`, `UK` suffix → Mermaid tidak support

### Kenapa?
Mermaid ERD syntax tidak support:
- Underscore dalam constraint notation (`PK_FK`)
- Multiple constraint dalam satu field
- Custom constraint notation

### Solusi:
- Gunakan komentar/description untuk menjelaskan constraint
- Atau buat tabel terpisah untuk dokumentasi constraint

---

## 📋 Tabel Relasi (Untuk Presentasi)

| Parent | Child | Relasi | Label |
|--------|-------|--------|-------|
| auth_users | profiles | 1:1 | has |
| auth_users | tasks | 1:N | creates |
| auth_users | habits | 1:N | tracks |
| habits | habit_logs | 1:N | records |
| auth_users | user_subjects | 1:N | enrolls |
| auth_users | fcm_tokens | 1:N | registers |
| auth_users | notifications | 1:N | receives |
| auth_users | notification_preferences | 1:1 | configures |

---

## 📋 Tabel Constraint (Untuk Presentasi)

### Primary Keys
- Semua 9 tabel menggunakan `uuid id` sebagai PK

### Foreign Keys
1. `profiles.id` → `auth_users.id` (ON DELETE CASCADE)
2. `tasks.user_id` → `auth_users.id` (ON DELETE CASCADE)
3. `habits.user_id` → `auth_users.id` (ON DELETE CASCADE)
4. `habit_logs.habit_id` → `habits.id` (ON DELETE CASCADE)
5. `habit_logs.user_id` → `auth_users.id` (ON DELETE CASCADE)
6. `user_subjects.user_id` → `auth_users.id` (ON DELETE CASCADE)
7. `fcm_tokens.user_id` → `auth_users.id` (ON DELETE CASCADE)
8. `notifications.user_id` → `auth_users.id` (ON DELETE CASCADE)
9. `notification_preferences.user_id` → `auth_users.id` (ON DELETE CASCADE)

### Unique Constraints
1. `auth_users.email`
2. `habit_logs.(habit_id, log_date)`
3. `user_subjects.(user_id, name)`
4. `fcm_tokens.token`
5. `notification_preferences.user_id`

### Check Constraints
1. `tasks.title` - char_length BETWEEN 1 AND 255
2. `habits.title` - char_length BETWEEN 1 AND 100
3. `user_subjects.name` - char_length BETWEEN 1 AND 100

---

## 🎓 Untuk Presentasi:

### Slide 1: ERD Diagram
- Gunakan **ERD Compact**
- Export sebagai PNG
- Insert ke PowerPoint

### Slide 2: Tabel Relasi
- Tunjukkan tabel relasi di atas
- Jelaskan cardinality (1:1, 1:N)

### Slide 3: Constraint Detail
- Tunjukkan tabel constraint
- Jelaskan PK, FK, UK, CHECK

### Slide 4: Notification System
- Highlight 3 tabel baru:
  - fcm_tokens
  - notifications
  - notification_preferences

---

## ✅ Tested On:

- ✅ Mermaid Live (https://mermaid.live/)
- ✅ GitHub Markdown
- ✅ VS Code Mermaid Preview
- ✅ Notion (Mermaid block)

---

**Status**: ✅ WORKING & TESTED  
**Last Updated**: 4 Mei 2026  
**Version**: 3.0 (Fixed Syntax)
