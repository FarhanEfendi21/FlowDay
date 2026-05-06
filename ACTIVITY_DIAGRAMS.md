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
- User mengisi form registrasi (nama, email, password)
- Sistem melakukan validasi data
- Jika valid: sistem membuat akun dan profile otomatis
- User diarahkan ke halaman login

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
- User memasukkan email dan password
- Sistem memvalidasi kredensial
- Jika valid: sistem membuat session dan user masuk ke dashboard
- Jika tidak valid: tampilkan pesan error

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
- **Tambah/Edit**: User mengisi form → sistem validasi → simpan ke database
- **Hapus**: Soft delete (item pindah ke trash, masih bisa di-restore)
- **Toggle**: Ubah status task antara todo dan done
- Semua operasi akan refresh list secara otomatis

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
- **Tambah**: User input nama habit → sistem buat habit baru (streak dimulai dari 0)
- **Toggle**: User klik tanggal di tracker → sistem toggle status complete dan hitung ulang streak
- **Stats**: Sistem menampilkan completion rate dan current streak
- **Hapus**: Soft delete habit ke trash

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
- **Soft Delete**: Item pindah ke trash (data masih ada di database, bisa di-restore)
- **Restore**: Item dikembalikan ke halaman utama
- **Hard Delete**: Hapus permanen dari database dengan konfirmasi (tidak bisa dikembalikan)

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
- Sistem load tasks dengan Row Level Security (RLS) filter
- User bisa melakukan search berdasarkan title/description
- User bisa filter berdasarkan subject (mata kuliah) atau status (todo/done)
- Filter dilakukan real-time di client-side untuk performa optimal
- Tampilkan empty state jika tidak ada hasil yang cocok

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
- User mengklik menu analytics
- Sistem melakukan 5 query paralel untuk performa optimal:
  - Dashboard Summary (total tasks, habits, streak)
  - Weekly Stats (progress 7 hari terakhir)
  - Subject Stats (breakdown per mata kuliah)
  - Habit Stats (completion rate 30 hari)
  - Priority Breakdown (high/medium/low)
- Sistem render charts dan stats cards
- User bisa hover untuk melihat tooltip detail

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
- **4 Cron Jobs** berjalan otomatis di background:
  1. **Daily 8AM**: Cek tasks yang deadline besok → kirim notifikasi pengingat
  2. **Every 6H**: Cek tasks urgent (deadline <6 jam) → kirim notifikasi urgent
  3. **Daily Custom**: Cek habits yang belum done hari ini → kirim reminder sesuai waktu user
  4. **Weekly**: Cleanup FCM tokens yang sudah tidak aktif >30 hari
- User menerima push notification di device mereka
- Semua notifikasi mengecek user preferences terlebih dahulu

---

## 📝 CATATAN FORMAT DIAGRAM

### Role-Based Activity Diagrams (Swimlanes)

Semua activity diagram menggunakan format **role-based** dengan **swimlanes** untuk memisahkan tanggung jawab:

1. **👤 Pengunjung (Guest)** - User yang belum login
2. **👤 Pelanggan (Customer)** - User yang sudah login  
3. **⚙️ Sistem** - Backend system, database, API, cron jobs

### Keuntungan Format Role-Based:

- ✅ **Pemisahan Tanggung Jawab yang Jelas**: Mudah melihat siapa yang melakukan apa
- ✅ **Identifikasi Interaksi**: Jelas terlihat komunikasi antara user dan sistem
- ✅ **Debugging Lebih Mudah**: Cepat menemukan di mana masalah terjadi (client-side vs server-side)
- ✅ **Dokumentasi Lebih Baik**: Memudahkan developer baru memahami flow aplikasi
- ✅ **Sesuai Standar UML**: Mengikuti best practice activity diagram dengan swimlanes

### Konvensi Warna:

- 🟢 **Hijau (#90EE90)**: Start, End, Success states
- 🔴 **Merah Muda (#FFB6C1)**: Error states, Failed operations
- 🟡 **Kuning Muda (#FFF8DC)**: Warning, Confirmation dialogs
- 🔵 **Biru Muda (#87CEEB, #E6F3FF)**: System processes, Cron jobs

### Simbol Koneksi:

- **→ (Solid Arrow)**: Alur normal/synchronous
- **-.-> (Dashed Arrow)**: Alur asynchronous (contoh: push notification)

---

**Version**: 3.0 (Simple & Clean)  
**Last Updated**: 2026-05-06  
**Author**: FlowDay Development Team
