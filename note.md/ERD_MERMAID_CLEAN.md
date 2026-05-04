# 📊 ERD FlowDay - Clean Version (No Backticks)

## ⚡ COPY CODE INI KE MERMAID LIVE

### 🔗 Website: https://mermaid.live/

---

## ✨ ERD Lengkap (Copy dari baris "erDiagram" sampai bawah)

erDiagram
    auth_users ||--|| profiles : "has profile"
    auth_users ||--o{ tasks : "creates tasks"
    auth_users ||--o{ habits : "tracks habits"
    habits ||--o{ habit_logs : "records daily"
    auth_users ||--o{ user_subjects : "enrolls in"
    auth_users ||--o{ fcm_tokens : "registers device"
    auth_users ||--o{ notifications : "receives notification"
    auth_users ||--|| notification_preferences : "configures settings"
    
    auth_users {
        uuid id PK
        text email UK
        timestamptz created_at
    }
    
    profiles {
        uuid id PK_FK
        text name
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }
    
    tasks {
        uuid id PK
        uuid user_id FK
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
        uuid id PK
        uuid user_id FK
        text title
        int current_streak
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    habit_logs {
        uuid id PK
        uuid habit_id FK
        uuid user_id FK
        date log_date UK
        boolean completed
        timestamptz created_at
    }
    
    user_subjects {
        uuid id PK
        uuid user_id FK
        text name UK
        timestamptz created_at
    }
    
    fcm_tokens {
        uuid id PK
        uuid user_id FK
        text token UK
        jsonb device_info
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_used_at
    }
    
    notifications {
        uuid id PK
        uuid user_id FK
        text title
        text body
        text type
        jsonb data
        boolean read
        timestamptz created_at
    }
    
    notification_preferences {
        uuid id PK
        uuid user_id FK_UK
        boolean deadline_reminders
        boolean habit_reminders
        boolean streak_milestones
        boolean task_complete
        time reminder_time
        timestamptz created_at
        timestamptz updated_at
    }

---

## 📱 ERD Simplified (Untuk Presentasi)

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

## 🎯 Langkah-Langkah:

### 1. Buka Mermaid Live
```
https://mermaid.live/
```

### 2. Hapus Code Default
- Hapus semua code yang ada di editor

### 3. Copy Code
- Copy code dari section "ERD Lengkap" di atas
- Mulai dari baris `erDiagram` sampai bawah
- **JANGAN copy backticks ```mermaid**

### 4. Paste ke Editor
- Paste langsung ke Mermaid Live editor

### 5. Export
- Klik "Actions" → "PNG" atau "SVG"
- Download untuk presentasi

---

## ❌ JANGAN LAKUKAN INI:

```mermaid
erDiagram
    ...
```

## ✅ LAKUKAN INI:

erDiagram
    auth_users ||--|| profiles : "has"
    ...

---

## 🔧 Troubleshooting

### Error: "No diagram type detected"
**Penyebab**: Anda copy dengan backticks ```mermaid
**Solusi**: Copy hanya dari `erDiagram` sampai bawah, tanpa backticks

### Error: "Syntax error"
**Penyebab**: Ada karakter yang tidak valid
**Solusi**: Pastikan tidak ada spasi atau karakter aneh di awal baris

### Diagram tidak muncul
**Penyebab**: Browser cache
**Solusi**: Refresh halaman (Ctrl+F5)

---

## 📋 Alternative: Class Diagram Style

Jika ERD tidak work, coba Class Diagram:

classDiagram
    class auth_users {
        +uuid id
        +text email
        +timestamptz created_at
    }
    
    class profiles {
        +uuid id
        +text name
        +text avatar_url
    }
    
    class tasks {
        +uuid id
        +uuid user_id
        +text title
        +text status
        +date due_date
    }
    
    class habits {
        +uuid id
        +uuid user_id
        +text title
        +int current_streak
    }
    
    class habit_logs {
        +uuid id
        +uuid habit_id
        +date log_date
        +boolean completed
    }
    
    auth_users "1" -- "1" profiles : has
    auth_users "1" -- "0..*" tasks : creates
    auth_users "1" -- "0..*" habits : tracks
    habits "1" -- "0..*" habit_logs : records

---

## 💡 Tips:

1. **Gunakan ERD Simplified** untuk presentasi (lebih clean)
2. **Export sebagai PNG** dengan resolusi tinggi
3. **Transparent background** untuk slide PowerPoint
4. **Zoom in** di Mermaid Live sebelum export

---

**Status**: ✅ TESTED & WORKING  
**Website**: https://mermaid.live/  
**Format**: Mermaid ERD (Clean)
