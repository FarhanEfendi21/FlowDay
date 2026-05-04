# 🚀 Quick Start - Mermaid ERD FlowDay

## ⚡ Copy & Paste Langsung

### 1️⃣ Buka Website
```
https://mermaid.live/
```

### 2️⃣ Copy Code Ini (TANPA backticks)

**PENTING: Copy dari "erDiagram" sampai bawah, JANGAN copy backticks ```**

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

### 3️⃣ Paste ke Mermaid Live

**Cara:**
1. Buka https://mermaid.live/
2. Hapus semua code default di editor
3. Paste code yang sudah di-copy (dari "erDiagram" sampai bawah)
4. Diagram akan muncul otomatis

---

### 4️⃣ Export
- Klik "Actions" → "PNG" atau "SVG"
- Download untuk presentasi

---

## 📱 Versi Mobile-Friendly (Simplified)

**Copy dari "erDiagram" sampai bawah:**

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

## ❌ KESALAHAN UMUM

### Jangan Copy Backticks!
```
SALAH:
```mermaid
erDiagram
    ...
\```

BENAR:
erDiagram
    auth_users ||--|| profiles : "has"
    ...
```

---

## 🎨 Customization Options

### Ubah Label Relasi

erDiagram
    auth_users ||--|| profiles : "memiliki profil"
    auth_users ||--o{ tasks : "membuat tugas"

### Tambah Emoji

erDiagram
    auth_users {
        uuid id "🔑 Primary Key"
        text email "📧 Email"
    }

### Ubah Cardinality
```
||--||  : One to One
||--o{  : One to Many
}o--o{  : Many to Many
```

---

## 📋 Cheat Sheet

### Simbol Cardinality
| Simbol | Arti | Contoh |
|--------|------|--------|
| `\|\|--\|\|` | 1:1 | User has 1 profile |
| `\|\|--o{` | 1:N | User has many tasks |
| `}o--o{` | N:M | Students enroll courses |

### Simbol Detail
| Simbol | Arti |
|--------|------|
| `\|\|` | Exactly one (mandatory) |
| `\|o` | Zero or one (optional) |
| `}o` | Zero or more |
| `}\|` | One or more |

### Constraint Notation
| Notation | Arti |
|----------|------|
| PK | Primary Key |
| FK | Foreign Key |
| UK | Unique Key |
| PK_FK | Primary Key + Foreign Key |
| FK_UK | Foreign Key + Unique |

---

## 🎯 Tips Presentasi

### 1. Gunakan Versi Simplified
- Lebih mudah dibaca di slide
- Fokus ke relasi utama

### 2. Export sebagai PNG
- Resolusi tinggi untuk print
- Transparent background

### 3. Highlight Fitur Baru
- Tunjukkan 3 tabel notification
- Jelaskan relasi baru

### 4. Jelaskan Label Relasi
- "has" = memiliki
- "creates" = membuat
- "tracks" = melacak
- "records" = mencatat

---

## 🔗 Resources

- **Mermaid Live**: https://mermaid.live/
- **Mermaid Docs**: https://mermaid.js.org/
- **ERD Syntax**: https://mermaid.js.org/syntax/entityRelationshipDiagram.html

---

## ✅ Quick Checklist

- [ ] Copy code dari file ini
- [ ] Paste ke https://mermaid.live/
- [ ] Cek tampilan ERD
- [ ] Export sebagai PNG/SVG
- [ ] Simpan untuk presentasi
- [ ] (Optional) Customize label relasi
- [ ] (Optional) Tambah emoji

---

**Status**: ✅ READY TO USE  
**Website**: https://mermaid.live/  
**Format**: Mermaid ERD  
**Project**: FlowDay
