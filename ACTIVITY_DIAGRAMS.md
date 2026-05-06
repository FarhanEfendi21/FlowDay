# ACTIVITY DIAGRAMS - FlowDay Project
# Task & Habit Management System

> **Format**: Activity Diagrams menggunakan **Role-Based (Swimlanes)** - Simple & Clean

---

## 📋 DAFTAR ISI

1. [User Registration](#1-user-registration)
2. [User Login](#2-user-login)
3. [Manage Tasks](#3-manage-tasks)
4. [Manage Habits](#4-manage-habits)
5. [Soft Delete & Restore](#5-soft-delete--restore)
6. [Search & Filter](#6-search--filter)
7. [View Analytics](#7-view-analytics)
8. [Notification System](#8-notification-system)
9. [Enable Push Notifications](#9-enable-push-notifications)
10. [Configure Notification Settings](#10-configure-notification-settings)
11. [Complete System Flow](#11-complete-system-flow)

---

## 1. User Registration

```mermaid
graph TD
    subgraph Guest["👤 Pengunjung"]
        A([Start]) --> B[Isi Form Registrasi]
        B --> C[Klik Daftar]
        E[Tampilkan Error] --> B
        G[Redirect ke Login] --> H([End])
    end
    
    subgraph System["⚙️ Sistem"]
        D{Data Valid?}
        D -->|Tidak| E
        D -->|Ya| F[Buat Akun & Profile]
        F --> G
    end
    
    C --> D

    style A fill:#90EE90
    style H fill:#90EE90
    style E fill:#FFB6C1
    style F fill:#E6F3FF
```

**Penjelasan:**
- User isi form (nama, email, password) → klik daftar
- Sistem validasi → jika valid: buat akun & profile
- Redirect ke login

---

## 2. User Login

```mermaid
graph TD
    subgraph Guest["👤 Pengunjung"]
        A([Start]) --> B[Input Email & Password]
        B --> C[Klik Masuk]
        E[Tampilkan Error] --> B
        G[Masuk ke Dashboard] --> H([End])
    end
    
    subgraph System["⚙️ Sistem"]
        D{Kredensial Valid?}
        D -->|Tidak| E
        D -->|Ya| F[Buat Session]
        F --> G
    end
    
    C --> D

    style A fill:#90EE90
    style H fill:#90EE90
    style E fill:#FFB6C1
    style F fill:#E6F3FF
```

**Penjelasan:**
- User input email & password → klik masuk
- Sistem validasi → jika valid: buat session
- Masuk ke dashboard

---

## 3. Manage Tasks

```mermaid
graph TD
    subgraph User["👤 Pelanggan"]
        A([Start]) --> B{Pilih Aksi}
        B -->|Tambah| C[Isi Form Task]
        B -->|Edit| D[Ubah Data Task]
        B -->|Hapus| E[Klik Hapus]
        B -->|Toggle| F[Klik Checkbox]
        C --> G[Simpan]
        D --> G
        H[Tampilkan Error] --> B
        I[Refresh List] --> B
        B -->|Selesai| J([End])
    end
    
    subgraph System["⚙️ Sistem"]
        K{Valid?}
        K -->|Tidak| H
        K -->|Ya| L[Simpan ke Database]
        L --> I
        M[Soft Delete] --> I
        N[Toggle Status] --> I
    end
    
    G --> K
    E --> M
    F --> N

    style A fill:#90EE90
    style J fill:#90EE90
    style H fill:#FFB6C1
    style L fill:#E6F3FF
    style M fill:#E6F3FF
    style N fill:#E6F3FF
```

**Penjelasan:**
- **Tambah/Edit**: Isi form → validasi → simpan
- **Hapus**: Soft delete (pindah ke trash)
- **Toggle**: Ubah status todo ↔ done

---

## 4. Manage Habits

```mermaid
graph TD
    subgraph User["👤 Pelanggan"]
        A([Start]) --> B{Pilih Aksi}
        B -->|Tambah| C[Input Nama Habit]
        B -->|Toggle| D[Klik Tanggal]
        B -->|Lihat Stats| E[Lihat Statistik]
        B -->|Hapus| F[Klik Hapus]
        C --> G[Simpan]
        H[Refresh List] --> B
        B -->|Selesai| I([End])
    end
    
    subgraph System["⚙️ Sistem"]
        J[Buat Habit Baru] --> H
        K[Toggle & Hitung Streak] --> H
        L[Tampilkan Stats] --> E
        M[Soft Delete] --> H
    end
    
    G --> J
    D --> K
    E --> L
    F --> M

    style A fill:#90EE90
    style I fill:#90EE90
    style J fill:#E6F3FF
    style K fill:#E6F3FF
    style L fill:#E6F3FF
    style M fill:#E6F3FF
```

**Penjelasan:**
- **Tambah**: Input nama → buat habit (streak = 0)
- **Toggle**: Klik tanggal → toggle & hitung streak
- **Stats**: Tampilkan completion rate & streak
- **Hapus**: Soft delete ke trash

---

## 5. Soft Delete & Restore

```mermaid
graph TD
    subgraph User["👤 Pelanggan"]
        A([Start]) --> B[Klik Hapus Item]
        C[Item di Trash] --> D{Pilih Aksi}
        D -->|Restore| E[Klik Kembalikan]
        D -->|Hapus Permanen| F[Klik Hapus Permanen]
        F --> G{Konfirmasi?}
        G -->|Tidak| C
        G -->|Ya| H[Item Terhapus]
        I[Item Kembali] --> J([End])
        H --> J
    end
    
    subgraph System["⚙️ Sistem"]
        K[SET deleted_at = NOW]
        K --> C
        L[SET deleted_at = NULL]
        L --> I
        M[DELETE FROM database]
        M --> H
    end
    
    B --> K
    E --> L
    G -->|Ya| M

    style A fill:#90EE90
    style J fill:#90EE90
    style G fill:#FFF8DC
    style M fill:#FFB6C1
    style K fill:#E6F3FF
    style L fill:#E6F3FF
```

**Penjelasan:**
- **Soft Delete**: Item pindah ke trash (bisa di-restore)
- **Restore**: Item kembali ke halaman utama
- **Hard Delete**: Hapus permanen (tidak bisa dikembalikan)

---

## 6. Search & Filter

```mermaid
graph TD
    subgraph User["👤 Pelanggan"]
        A([Start]) --> B[Lihat Tasks]
        B --> C{Pilih Filter}
        C -->|Search| D[Ketik Query]
        C -->|Subject| E[Pilih Mata Kuliah]
        C -->|Status| F[Pilih Status]
        C -->|Clear| G[Clear Filter]
        H[Tampilkan Hasil] --> C
        I[Tampilkan Semua] --> C
        C -->|Selesai| J([End])
    end
    
    subgraph System["⚙️ Sistem"]
        K[Load Tasks dengan RLS]
        K --> I
        L[Filter Real-time]
        L --> M{Ada Hasil?}
        M -->|Ya| H
        M -->|Tidak| N[Tampilkan Empty State]
        N --> C
    end
    
    B --> K
    D --> L
    E --> L
    F --> L
    G --> K

    style A fill:#90EE90
    style J fill:#90EE90
    style L fill:#E6F3FF
    style K fill:#E6F3FF
```

**Penjelasan:**
- Load tasks dengan RLS filter
- User bisa search atau filter (subject/status)
- Filter real-time di client-side
- Tampilkan empty state jika tidak ada hasil

---

## 7. View Analytics

```mermaid
graph TD
    subgraph User["👤 Pelanggan"]
        A([Start]) --> B[Klik Menu Analytics]
        C[Tampilkan Dashboard] --> D{Interaksi}
        D -->|Hover| E[Lihat Tooltip]
        E --> D
        D -->|Refresh| B
        D -->|Selesai| F([End])
    end
    
    subgraph System["⚙️ Sistem"]
        G[Fetch 5 Stats Paralel:<br/>Summary, Weekly,<br/>Subject, Habit, Priority]
        G --> H[Render Charts & Cards]
        H --> C
    end
    
    B --> G

    style A fill:#90EE90
    style F fill:#90EE90
    style G fill:#E6F3FF
    style H fill:#E6F3FF
```

**Penjelasan:**
- User klik menu analytics
- Sistem fetch 5 query paralel
- Render charts & stats cards
- User bisa hover untuk tooltip detail

---

## 8. Notification System

```mermaid
graph TD
    subgraph System["⚙️ Sistem - Cron Jobs"]
        A([Cron Active]) --> B{4 Cron Jobs}
        
        B -->|Daily 8AM| C[Check Deadline Besok]
        C --> D{Ada Tasks?}
        D -->|Ya| E[Send Notification]
        D -->|Tidak| F([End])
        E --> F
        
        B -->|Every 6H| G[Check Urgent 6 Jam]
        G --> H{Ada Tasks?}
        H -->|Ya| I[Send Notification]
        H -->|Tidak| J([End])
        I --> J
        
        B -->|Daily Custom| K[Check Habits Belum Done]
        K --> L{Ada Habits?}
        L -->|Ya| M[Send Notification]
        L -->|Tidak| N([End])
        M --> N
        
        B -->|Weekly| O[Cleanup Old Tokens]
        O --> P([End])
    end
    
    subgraph User["👤 Pelanggan"]
        Q[Terima Push Notification]
        Q --> R([End])
    end
    
    E -.->|Push| Q
    I -.->|Push| Q
    M -.->|Push| Q

    style A fill:#87CEEB
    style F fill:#90EE90
    style J fill:#90EE90
    style N fill:#90EE90
    style P fill:#90EE90
    style R fill:#90EE90
    style E fill:#E6F3FF
    style I fill:#E6F3FF
    style M fill:#E6F3FF
```

**Penjelasan:**
- **4 Cron Jobs** berjalan otomatis:
  - Daily 8AM: Notif deadline besok
  - Every 6H: Notif urgent (deadline <6 jam)
  - Daily custom: Notif habit reminder
  - Weekly: Cleanup token lama
- User terima push notification di device

---

## 9. Enable Push Notifications

```mermaid
graph TD
    subgraph User["👤 Pelanggan"]
        A([Start]) --> B[Buka Aplikasi]
        C[Tampilkan Prompt] --> D{Klik Aktifkan?}
        D -->|Tidak| E([End])
        D -->|Ya| F[Izinkan Permission]
        F --> G{Permission?}
        G -->|Denied| H[Tampilkan Error]
        H --> E
        G -->|Granted| I[Tunggu...]
        J[Terima Test Notif] --> E
    end
    
    subgraph System["⚙️ Sistem"]
        K{Browser Support?}
        K -->|Tidak| L[Tampilkan Error]
        L --> E
        K -->|Ya| M{Token Ada?}
        M -->|Ya| E
        M -->|Tidak| C
        N[Get FCM Token]
        N --> O[Save ke Database]
        O --> P[Send Test Notif]
        P -.->|Push| J
    end
    
    B --> K
    I --> N

    style A fill:#90EE90
    style E fill:#90EE90
    style H fill:#FFB6C1
    style L fill:#FFB6C1
    style N fill:#E6F3FF
    style O fill:#E6F3FF
    style P fill:#E6F3FF
```

**Penjelasan:**
- Cek browser support push notification
- Jika support: tampilkan prompt
- User izinkan permission → sistem get FCM token
- Save token ke database → send test notification

---

## 10. Configure Notification Settings

```mermaid
graph TD
    subgraph User["👤 Pelanggan"]
        A([Start]) --> B[Buka Settings]
        B --> C[Klik Tab Notifications]
        D[Tampilkan Form] --> E{User Action}
        E -->|Toggle| F[Toggle Switch]
        E -->|Change Time| G[Pilih Waktu]
        E -->|Simpan| H[Klik Simpan]
        E -->|Batal| I[Klik Batal]
        F --> E
        G --> E
        J[Tampilkan Error] --> E
        K[Tampilkan Success] --> L([End])
        I --> L
    end
    
    subgraph System["⚙️ Sistem"]
        M[Load Preferences]
        M --> N{Exists?}
        N -->|Tidak| O[Create Default]
        N -->|Ya| D
        O --> D
        P{Valid?}
        P -->|Tidak| J
        P -->|Ya| Q[Save to Database]
        Q --> K
    end
    
    C --> M
    H --> P

    style A fill:#90EE90
    style L fill:#90EE90
    style J fill:#FFB6C1
    style K fill:#90EE90
    style M fill:#E6F3FF
    style O fill:#E6F3FF
    style Q fill:#E6F3FF
```

**Penjelasan:**
- Load preferences (create default jika belum ada)
- User bisa toggle switches & ubah waktu
- Simpan → validasi → save to database
- Batal → kembali tanpa save

---

## 11. Complete System Flow

```mermaid
graph TD
    subgraph User["👤 Pengunjung/Pelanggan"]
        A([Start]) --> B[Buka Aplikasi]
        C[Landing Page] --> D{Pilih}
        D -->|Login| E[Input Login]
        D -->|Register| F[Input Register]
        G[Dashboard] --> H{Menu}
        H -->|Tasks| I[Kelola Tasks]
        H -->|Habits| J[Kelola Habits]
        H -->|Analytics| K[Lihat Analytics]
        H -->|Trash| L[Kelola Trash]
        H -->|Settings| M[Atur Settings]
        H -->|Logout| N[Logout]
        I --> H
        J --> H
        K --> H
        L --> H
        M --> H
        N --> C
        H -->|Close| O([End])
    end
    
    subgraph System["⚙️ Sistem"]
        P{Authenticated?}
        P -->|Tidak| C
        P -->|Ya| Q[Validate Session]
        Q --> R{Valid?}
        R -->|Tidak| C
        R -->|Ya| S[Load Data dengan RLS]
        S --> G
        T{Login Valid?}
        T -->|Ya| U[Create Session]
        U --> Q
        T -->|Tidak| C
        V{Register Valid?}
        V -->|Ya| W[Create User]
        W --> U
        V -->|Tidak| C
    end
    
    B --> P
    E --> T
    F --> V

    style A fill:#90EE90
    style O fill:#90EE90
    style G fill:#90EE90
    style P fill:#E6F3FF
    style Q fill:#E6F3FF
    style S fill:#E6F3FF
    style U fill:#E6F3FF
    style W fill:#E6F3FF
```

**Penjelasan:**
- **Authentication**: Cek session → jika tidak valid: landing page
- **Login/Register**: Validasi → create session → dashboard
- **Dashboard**: Menu utama (tasks, habits, analytics, trash, settings)
- **Logout**: Clear session → kembali ke landing

---

## 📝 CATATAN

### Format Diagram

Semua diagram menggunakan **role-based swimlanes**:
- 👤 **Pengunjung/Pelanggan**: User actions
- ⚙️ **Sistem**: Backend processes

### Konvensi Warna

- 🟢 **Hijau (#90EE90)**: Start, End, Success
- 🔴 **Merah Muda (#FFB6C1)**: Error
- 🟡 **Kuning (#FFF8DC)**: Warning/Confirmation
- 🔵 **Biru Muda (#E6F3FF)**: System processes

### Simbol

- **→** (Solid): Alur synchronous
- **-.->** (Dashed): Alur asynchronous (push notification)

---

**Version**: 3.0 (Simple & Clean)  
**Last Updated**: 2026-05-06  
**Author**: FlowDay Development Team
