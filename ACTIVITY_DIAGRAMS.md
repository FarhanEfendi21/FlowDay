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
flowchart TB
    Start([Start]) --> A[Isi Form Registrasi]
    A --> B[Klik Daftar]
    B --> C{Data Valid?}
    C -->|Tidak| D[Tampilkan Error]
    D --> A
    C -->|Ya| E[Buat Akun & Profile]
    E --> F[Redirect ke Login]
    F --> End([End])

    style Start fill:#90EE90
    style End fill:#90EE90
    style D fill:#FFB6C1
    style E fill:#E6F3FF
```

**Penjelasan:**
- User isi form (nama, email, password) → klik daftar
- Sistem validasi → jika valid: buat akun & profile
- Redirect ke login

---

## 2. User Login

```mermaid
flowchart TB
    Start([Start]) --> A[Input Email & Password]
    A --> B[Klik Masuk]
    B --> C{Kredensial Valid?}
    C -->|Tidak| D[Tampilkan Error]
    D --> A
    C -->|Ya| E[Buat Session]
    E --> F[Masuk ke Dashboard]
    F --> End([End])

    style Start fill:#90EE90
    style End fill:#90EE90
    style D fill:#FFB6C1
    style E fill:#E6F3FF
```

**Penjelasan:**
- User input email & password → klik masuk
- Sistem validasi → jika valid: buat session
- Masuk ke dashboard

---

## 3. Manage Tasks

```mermaid
flowchart TB
    Start([Start]) --> Menu{Pilih Aksi}
    
    Menu -->|Tambah| A1[Isi Form Task]
    A1 --> A2[Klik Simpan]
    A2 --> V1{Valid?}
    V1 -->|Tidak| E1[Tampilkan Error]
    E1 --> Menu
    V1 -->|Ya| S1[Simpan ke Database]
    S1 --> R[Refresh List]
    
    Menu -->|Edit| B1[Ubah Data Task]
    B1 --> B2[Klik Simpan]
    B2 --> V2{Valid?}
    V2 -->|Tidak| E2[Tampilkan Error]
    E2 --> Menu
    V2 -->|Ya| S2[Update Database]
    S2 --> R
    
    Menu -->|Hapus| C1[Klik Hapus]
    C1 --> C2[Soft Delete]
    C2 --> R
    
    Menu -->|Toggle| D1[Klik Checkbox]
    D1 --> D2[Toggle Status]
    D2 --> R
    
    R --> Menu
    Menu -->|Selesai| End([End])

    style Start fill:#90EE90
    style End fill:#90EE90
    style E1 fill:#FFB6C1
    style E2 fill:#FFB6C1
    style S1 fill:#E6F3FF
    style S2 fill:#E6F3FF
    style C2 fill:#E6F3FF
    style D2 fill:#E6F3FF
```

**Penjelasan:**
- **Tambah/Edit**: Isi form → validasi → simpan
- **Hapus**: Soft delete (pindah ke trash)
- **Toggle**: Ubah status todo ↔ done

---

## 4. Manage Habits

```mermaid
flowchart TB
    Start([Start]) --> Menu{Pilih Aksi}
    
    Menu -->|Tambah| A1[Input Nama Habit]
    A1 --> A2[Klik Simpan]
    A2 --> A3[Buat Habit Baru]
    A3 --> R[Refresh List]
    
    Menu -->|Toggle| B1[Klik Tanggal]
    B1 --> B2[Toggle & Hitung Streak]
    B2 --> R
    
    Menu -->|Lihat Stats| C1[Tampilkan Stats]
    C1 --> Menu
    
    Menu -->|Hapus| D1[Klik Hapus]
    D1 --> D2[Soft Delete]
    D2 --> R
    
    R --> Menu
    Menu -->|Selesai| End([End])

    style Start fill:#90EE90
    style End fill:#90EE90
    style A3 fill:#E6F3FF
    style B2 fill:#E6F3FF
    style C1 fill:#E6F3FF
    style D2 fill:#E6F3FF
```

**Penjelasan:**
- **Tambah**: Input nama → buat habit (streak = 0)
- **Toggle**: Klik tanggal → toggle & hitung streak
- **Stats**: Tampilkan completion rate & streak
- **Hapus**: Soft delete ke trash

---

## 5. Soft Delete & Restore

```mermaid
flowchart TB
    Start([Start]) --> A[Klik Hapus Item]
    A --> B[SET deleted_at = NOW]
    B --> C[Item di Trash]
    C --> Menu{Pilih Aksi}
    
    Menu -->|Restore| D1[Klik Kembalikan]
    D1 --> D2[SET deleted_at = NULL]
    D2 --> D3[Item Kembali]
    D3 --> End([End])
    
    Menu -->|Hapus Permanen| E1[Klik Hapus Permanen]
    E1 --> E2{Konfirmasi?}
    E2 -->|Tidak| C
    E2 -->|Ya| E3[DELETE FROM database]
    E3 --> E4[Item Terhapus]
    E4 --> End

    style Start fill:#90EE90
    style End fill:#90EE90
    style E2 fill:#FFF8DC
    style E3 fill:#FFB6C1
    style B fill:#E6F3FF
    style D2 fill:#E6F3FF
```

**Penjelasan:**
- **Soft Delete**: Item pindah ke trash (bisa di-restore)
- **Restore**: Item kembali ke halaman utama
- **Hard Delete**: Hapus permanen (tidak bisa dikembalikan)

---

## 6. Search & Filter

```mermaid
flowchart TB
    Start([Start]) --> A[Lihat Tasks]
    A --> B[Load Tasks dengan RLS]
    B --> C[Tampilkan Semua]
    C --> Menu{Pilih Filter}
    
    Menu -->|Search| D1[Ketik Query]
    D1 --> D2[Filter Real-time]
    D2 --> D3{Ada Hasil?}
    D3 -->|Ya| D4[Tampilkan Hasil]
    D3 -->|Tidak| D5[Tampilkan Empty State]
    D4 --> Menu
    D5 --> Menu
    
    Menu -->|Subject| E1[Pilih Mata Kuliah]
    E1 --> E2[Filter Real-time]
    E2 --> E3{Ada Hasil?}
    E3 -->|Ya| E4[Tampilkan Hasil]
    E3 -->|Tidak| E5[Tampilkan Empty State]
    E4 --> Menu
    E5 --> Menu
    
    Menu -->|Status| F1[Pilih Status]
    F1 --> F2[Filter Real-time]
    F2 --> F3{Ada Hasil?}
    F3 -->|Ya| F4[Tampilkan Hasil]
    F3 -->|Tidak| F5[Tampilkan Empty State]
    F4 --> Menu
    F5 --> Menu
    
    Menu -->|Clear| G1[Clear Filter]
    G1 --> B
    
    Menu -->|Selesai| End([End])

    style Start fill:#90EE90
    style End fill:#90EE90
    style B fill:#E6F3FF
    style D2 fill:#E6F3FF
    style E2 fill:#E6F3FF
    style F2 fill:#E6F3FF
```

**Penjelasan:**
- Load tasks dengan RLS filter
- User bisa search atau filter (subject/status)
- Filter real-time di client-side
- Tampilkan empty state jika tidak ada hasil

---

## 7. View Analytics

```mermaid
flowchart TB
    Start([Start]) --> A[Klik Menu Analytics]
    A --> B[Fetch 5 Stats Paralel]
    B --> C[Render Charts & Cards]
    C --> D[Tampilkan Dashboard]
    D --> Menu{Interaksi}
    
    Menu -->|Hover| E1[Lihat Tooltip]
    E1 --> Menu
    
    Menu -->|Refresh| A
    
    Menu -->|Selesai| End([End])

    style Start fill:#90EE90
    style End fill:#90EE90
    style B fill:#E6F3FF
    style C fill:#E6F3FF
```

**Penjelasan:**
- User klik menu analytics
- Sistem fetch 5 query paralel
- Render charts & stats cards
- User bisa hover untuk tooltip detail

---

## 8. Notification System

```mermaid
flowchart TB
    Start([Cron Active]) --> Jobs{4 Cron Jobs}
    
    Jobs -->|Daily 8AM| A1[Check Deadline Besok]
    A1 --> A2{Ada Tasks?}
    A2 -->|Ya| A3[Send Notification]
    A2 -->|Tidak| A4([End])
    A3 --> A5[User Terima Notif]
    A5 --> A4
    
    Jobs -->|Every 6H| B1[Check Urgent 6 Jam]
    B1 --> B2{Ada Tasks?}
    B2 -->|Ya| B3[Send Notification]
    B2 -->|Tidak| B4([End])
    B3 --> B5[User Terima Notif]
    B5 --> B4
    
    Jobs -->|Daily Custom| C1[Check Habits Belum Done]
    C1 --> C2{Ada Habits?}
    C2 -->|Ya| C3[Send Notification]
    C2 -->|Tidak| C4([End])
    C3 --> C5[User Terima Notif]
    C5 --> C4
    
    Jobs -->|Weekly| D1[Cleanup Old Tokens]
    D1 --> D2([End])

    style Start fill:#87CEEB
    style A4 fill:#90EE90
    style B4 fill:#90EE90
    style C4 fill:#90EE90
    style D2 fill:#90EE90
    style A3 fill:#E6F3FF
    style B3 fill:#E6F3FF
    style C3 fill:#E6F3FF
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
flowchart TB
    Start([Start]) --> A[Buka Aplikasi]
    A --> B{Browser Support?}
    B -->|Tidak| C[Tampilkan Error]
    C --> End([End])
    B -->|Ya| D{Token Ada?}
    D -->|Ya| End
    D -->|Tidak| E[Tampilkan Prompt]
    E --> F{Klik Aktifkan?}
    F -->|Tidak| End
    F -->|Ya| G[Izinkan Permission]
    G --> H{Permission?}
    H -->|Denied| I[Tampilkan Error]
    I --> End
    H -->|Granted| J[Get FCM Token]
    J --> K[Save ke Database]
    K --> L[Send Test Notif]
    L --> M[User Terima Test Notif]
    M --> End

    style Start fill:#90EE90
    style End fill:#90EE90
    style C fill:#FFB6C1
    style I fill:#FFB6C1
    style J fill:#E6F3FF
    style K fill:#E6F3FF
    style L fill:#E6F3FF
```

**Penjelasan:**
- Cek browser support push notification
- Jika support: tampilkan prompt
- User izinkan permission → sistem get FCM token
- Save token ke database → send test notification

---

## 10. Configure Notification Settings

```mermaid
flowchart TB
    Start([Start]) --> A[Buka Settings]
    A --> B[Klik Tab Notifications]
    B --> C[Load Preferences]
    C --> D{Exists?}
    D -->|Tidak| E[Create Default]
    D -->|Ya| F[Tampilkan Form]
    E --> F
    F --> Menu{User Action}
    
    Menu -->|Toggle| G1[Toggle Switch]
    G1 --> Menu
    
    Menu -->|Change Time| H1[Pilih Waktu]
    H1 --> Menu
    
    Menu -->|Simpan| I1[Klik Simpan]
    I1 --> I2{Valid?}
    I2 -->|Tidak| I3[Tampilkan Error]
    I3 --> Menu
    I2 -->|Ya| I4[Save to Database]
    I4 --> I5[Tampilkan Success]
    I5 --> End([End])
    
    Menu -->|Batal| J1[Klik Batal]
    J1 --> End

    style Start fill:#90EE90
    style End fill:#90EE90
    style I3 fill:#FFB6C1
    style I5 fill:#90EE90
    style C fill:#E6F3FF
    style E fill:#E6F3FF
    style I4 fill:#E6F3FF
```

**Penjelasan:**
- Load preferences (create default jika belum ada)
- User bisa toggle switches & ubah waktu
- Simpan → validasi → save to database
- Batal → kembali tanpa save

---

## 11. Complete System Flow

```mermaid
flowchart TB
    Start([Start]) --> A[Buka Aplikasi]
    A --> B{Authenticated?}
    
    B -->|Tidak| C[Landing Page]
    C --> D{Pilih}
    D -->|Login| E1[Input Login]
    E1 --> E2{Login Valid?}
    E2 -->|Tidak| C
    E2 -->|Ya| E3[Create Session]
    
    D -->|Register| F1[Input Register]
    F1 --> F2{Register Valid?}
    F2 -->|Tidak| C
    F2 -->|Ya| F3[Create User]
    F3 --> E3
    
    B -->|Ya| G1[Validate Session]
    G1 --> G2{Valid?}
    G2 -->|Tidak| C
    G2 -->|Ya| G3[Load Data dengan RLS]
    
    E3 --> G1
    G3 --> H[Dashboard]
    H --> Menu{Menu}
    
    Menu -->|Tasks| I1[Kelola Tasks]
    I1 --> Menu
    
    Menu -->|Habits| J1[Kelola Habits]
    J1 --> Menu
    
    Menu -->|Analytics| K1[Lihat Analytics]
    K1 --> Menu
    
    Menu -->|Trash| L1[Kelola Trash]
    L1 --> Menu
    
    Menu -->|Settings| M1[Atur Settings]
    M1 --> Menu
    
    Menu -->|Logout| N1[Logout]
    N1 --> C
    
    Menu -->|Close| End([End])

    style Start fill:#90EE90
    style End fill:#90EE90
    style H fill:#90EE90
    style E3 fill:#E6F3FF
    style F3 fill:#E6F3FF
    style G1 fill:#E6F3FF
    style G3 fill:#E6F3FF
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
