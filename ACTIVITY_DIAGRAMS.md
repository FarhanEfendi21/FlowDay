# ACTIVITY DIAGRAMS - FlowDay Project
# Task & Habit Management System

> **Format**: Activity Diagrams menggunakan **Role-Based (Swimlanes)** untuk memisahkan aktivitas antara **User/Pengunjung/Pelanggan** dan **Sistem**.

---

## 📋 DAFTAR ISI

1. [Activity Diagram: User Registration](#1-activity-diagram-user-registration)
2. [Activity Diagram: User Login](#2-activity-diagram-user-login)
3. [Activity Diagram: Manage Tasks (CRUD)](#3-activity-diagram-manage-tasks-crud)
4. [Activity Diagram: Manage Habits](#4-activity-diagram-manage-habits)
5. [Activity Diagram: Soft Delete & Hard Delete](#5-activity-diagram-soft-delete--hard-delete)
6. [Activity Diagram: Search & Filter Tasks](#6-activity-diagram-search--filter-tasks)
7. [Activity Diagram: View Analytics](#7-activity-diagram-view-analytics)
8. [Activity Diagram: Notification System](#8-activity-diagram-notification-system) 
9. [Activity Diagram: Enable Push Notifications](#9-activity-diagram-enable-push-notifications) 
10. [Activity Diagram: Send Deadline Notification (Cron)](#10-activity-diagram-send-deadline-notification-cron) 
11. [Activity Diagram: Configure Notification Preferences](#11-activity-diagram-configure-notification-preferences) 
12. [Activity Diagram: Complete System Flow](#12-activity-diagram-complete-system-flow)

---

## 1. Activity Diagram: User Registration

```mermaid
graph TD
    subgraph User["👤 Pengunjung (Guest)"]
        Start([Start]) --> AccessPage[Akses Halaman<br/>Register]
        AccessPage --> FillForm[Isi Form Registrasi:<br/>- Nama<br/>- Email<br/>- Password<br/>- Konfirmasi Password]
        FillForm --> SubmitBtn[Klik Tombol Daftar]
        ErrorMatch[Tampilkan Error:<br/>Password Tidak Cocok] --> FillForm
        ErrorServer[Tampilkan Error<br/>dari Server] --> FillForm
        ShowSuccess[Tampilkan Pesan Sukses] --> RedirectLogin[Redirect ke<br/>Halaman Login]
        RedirectLogin --> End([End])
    end
    
    subgraph System["⚙️ Sistem"]
        ValidateClient{Validasi Client-Side:<br/>Password Match?}
        ValidateClient -->|Tidak| ErrorMatch
        ValidateClient -->|Ya| SendRequest[Kirim Request ke<br/>Supabase Auth API]
        SendRequest --> ValidateServer{Validasi Server:<br/>Email Valid?<br/>Password Min 6 Char?}
        ValidateServer -->|Tidak| ErrorServer
        ValidateServer -->|Ya| CreateUser[Create User<br/>di auth.users]
        CreateUser --> TriggerDB[Database Trigger:<br/>handle_new_user]
        TriggerDB --> CreateProfile[Auto-Create Profile<br/>di public.profiles]
        CreateProfile --> SendEmail[Kirim Email<br/>Konfirmasi]
        SendEmail --> ShowSuccess
    end
    
    SubmitBtn --> ValidateClient

    style Start fill:#90EE90
    style End fill:#90EE90
    style ErrorMatch fill:#FFB6C1
    style ErrorServer fill:#FFB6C1
    style ShowSuccess fill:#90EE90
```

**Penjelasan:**
- **Role User (Pengunjung/Guest)**: Mengakses halaman register, mengisi form, menerima feedback
- **Role Sistem**: Melakukan validasi client-side dan server-side, membuat user di database, trigger auto-create profile, mengirim email konfirmasi
- User mengisi form registrasi dengan nama, email, password, dan konfirmasi password
- Validasi client-side memastikan password dan konfirmasi password cocok
- Request dikirim ke Supabase Auth API
- Server memvalidasi email dan password (min 6 karakter)
- Jika valid, user dibuat di tabel `auth.users`
- Database trigger `handle_new_user` otomatis membuat profile di `public.profiles`
- User diarahkan ke halaman login

---

## 2. Activity Diagram: User Login

```mermaid
graph TD
    subgraph User["👤 Pengunjung (Guest)"]
        Start([Start]) --> AccessLogin[Akses Halaman Login]
        AccessLogin --> InputCred[Input Kredensial:<br/>- Email<br/>- Password]
        InputCred --> ClickLogin[Klik Tombol Masuk]
        ErrorAuth[Tampilkan Pesan<br/>Kesalahan Login] --> InputCred
        DisplayDash[Masuk ke Beranda<br/>Pelanggan] --> End([End])
    end
    
    subgraph System["⚙️ Sistem"]
        SendAuth[Kirim Request ke<br/>Supabase Auth]
        SendAuth --> ValidateAuth{Autentikasi OAuth:<br/>Verifikasi Kredensial}
        ValidateAuth -->|Tidak| ErrorAuth
        ValidateAuth -->|Ya| CreateSession[Generate Session<br/>Token]
        CreateSession --> SetCookie[Set Cookie &<br/>Kembali ke Beranda<br/>Pelanggan]
        SetCookie --> Middleware[Middleware:<br/>Validasi Session]
        Middleware --> CheckSession{Session Valid?}
        CheckSession -->|Tidak| ErrorAuth
        CheckSession -->|Ya| LoadDash[Load Dashboard Page]
        LoadDash --> FetchData[Fetch User Data<br/>dengan RLS Filter:<br/>- Tasks<br/>- Habits<br/>- Stats]
        FetchData --> DisplayDash
    end
    
    ClickLogin --> SendAuth

    style Start fill:#90EE90
    style End fill:#90EE90
    style ErrorAuth fill:#FFB6C1
    style DisplayDash fill:#90EE90
```

**Penjelasan:**
- **Role User (Pengunjung/Guest)**: Mengakses halaman login, input kredensial, menerima feedback
- **Role Sistem**: Autentikasi OAuth, generate session token, validasi session, fetch data dengan RLS
- User memasukkan email dan password
- Kredensial divalidasi oleh Supabase Auth
- Jika valid, session dibuat dan cookie di-set
- Middleware memvalidasi session sebelum akses dashboard
- Row Level Security (RLS) memastikan user hanya melihat data miliknya
- Dashboard ditampilkan dengan data user yang sudah terfilter

---

## 3. Activity Diagram: Manage Tasks (CRUD)

```mermaid
graph TD
    subgraph User["👤 Pelanggan (Customer)"]
        Start([Start]) --> ViewTasks[Lihat Halaman Tasks]
        ViewTasks --> Choice{Pilih Aksi}
        
        %% CREATE
        Choice -->|Create| ClickAdd[Klik Tombol<br/>Tambah Tugas]
        ClickAdd --> FillForm[Isi Form:<br/>- Judul<br/>- Deskripsi<br/>- Mata Kuliah<br/>- Prioritas<br/>- Deadline]
        FillForm --> SubmitCreate[Klik Simpan]
        ErrorCreate[Tampilkan Error<br/>Validasi] --> FillForm
        
        %% UPDATE
        Choice -->|Update| SelectTask[Pilih Task]
        SelectTask --> ClickEdit[Klik Edit]
        ClickEdit --> ModifyForm[Ubah Data Form]
        ModifyForm --> SubmitUpdate[Klik Simpan<br/>Perubahan]
        ErrorUpdate[Tampilkan Error<br/>Validasi] --> ModifyForm
        
        %% DELETE
        Choice -->|Delete| SelectTaskDel[Pilih Task]
        SelectTaskDel --> ClickDelete[Klik Hapus]
        
        %% TOGGLE
        Choice -->|Toggle Status| SelectTaskToggle[Pilih Task]
        SelectTaskToggle --> ClickCheckbox[Klik Checkbox]
        
        ShowSuccess[Tampilkan Toast:<br/>Operasi Berhasil] --> RefreshView[Refresh Task List]
        RefreshView --> ViewTasks
        Choice -->|Selesai| End([End])
    end
    
    subgraph System["⚙️ Sistem"]
        %% CREATE SYSTEM
        ValidateCreate{Form Valid?}
        ValidateCreate -->|Tidak| ErrorCreate
        ValidateCreate -->|Ya| InsertDB[INSERT INTO tasks<br/>dengan RLS Filter]
        InsertDB --> ShowSuccess
        
        %% UPDATE SYSTEM
        ValidateUpdate{Form Valid?}
        ValidateUpdate -->|Tidak| ErrorUpdate
        ValidateUpdate -->|Ya| UpdateDB[UPDATE tasks<br/>SET ... WHERE id = ?<br/>AND user_id = auth.uid]
        UpdateDB --> TriggerUpdate[Trigger: Update<br/>updated_at timestamp]
        TriggerUpdate --> ShowSuccess
        
        %% DELETE SYSTEM
        SoftDelete[Soft Delete:<br/>UPDATE tasks<br/>SET deleted_at = NOW<br/>WHERE id = ? AND user_id = auth.uid]
        SoftDelete --> MoveTrash[Task Pindah ke Trash]
        MoveTrash --> ShowSuccess
        
        %% TOGGLE SYSTEM
        ToggleDB[UPDATE tasks<br/>SET status = CASE<br/>WHEN status = 'todo'<br/>THEN 'done'<br/>ELSE 'todo'<br/>WHERE id = ? AND user_id = auth.uid]
        ToggleDB --> ShowSuccess
    end
    
    SubmitCreate --> ValidateCreate
    SubmitUpdate --> ValidateUpdate
    ClickDelete --> SoftDelete
    ClickCheckbox --> ToggleDB

    style Start fill:#90EE90
    style End fill:#90EE90
    style ErrorCreate fill:#FFB6C1
    style ErrorUpdate fill:#FFB6C1
    style ShowSuccess fill:#90EE90
```

**Penjelasan:**
- **Role User (Pelanggan/Customer)**: Melihat tasks, memilih aksi (create/update/delete/toggle), menerima feedback
- **Role Sistem**: Validasi form, operasi database (INSERT/UPDATE/DELETE), trigger update timestamp, apply RLS
- **CREATE**: User mengisi form dan sistem insert data ke database dengan RLS filter
- **UPDATE**: User edit task, sistem update data dengan trigger auto-update timestamp
- **DELETE**: Soft delete dengan set `deleted_at`, task pindah ke trash
- **TOGGLE**: Checkbox untuk toggle status todo/done

---

## 4. Activity Diagram: Manage Habits

```mermaid
graph TD
    subgraph User["👤 Pelanggan (Customer)"]
        Start([Start]) --> ViewHabits[Lihat Halaman Habits]
        ViewHabits --> Choice{Pilih Aksi}
        
        %% CREATE
        Choice -->|Tambah Habit| ClickAdd[Klik Tambah Habit]
        ClickAdd --> InputTitle[Input Nama Habit]
        InputTitle --> SubmitHabit[Klik Tambah]
        
        %% TOGGLE
        Choice -->|Toggle Habit| SelectDate[Pilih Tanggal<br/>di Tracker Grid]
        
        %% VIEW STATS
        Choice -->|Lihat Stats| ViewStats[Lihat Statistik]
        DisplayStats[Tampilkan Stats<br/>per Habit] --> ViewHabits
        
        %% DELETE
        Choice -->|Hapus Habit| SelectHabit[Pilih Habit]
        SelectHabit --> ClickDelete[Klik Hapus]
        
        RefreshView[Refresh Habit List] --> ViewHabits
        Choice -->|Selesai| End([End])
    end
    
    subgraph System["⚙️ Sistem"]
        %% CREATE SYSTEM
        InsertHabit[INSERT INTO habits<br/>current_streak = 0<br/>user_id = auth.uid]
        InsertHabit --> RefreshView
        
        %% TOGGLE SYSTEM
        CheckLog{Log Exists<br/>untuk Tanggal?}
        CheckLog -->|Ya| UpdateLog[UPDATE habit_logs<br/>SET completed = NOT completed]
        CheckLog -->|Tidak| InsertLog[INSERT INTO habit_logs<br/>completed = TRUE]
        UpdateLog --> TriggerStreak[Trigger:<br/>recalculate_habit_streak]
        InsertLog --> TriggerStreak
        TriggerStreak --> CalcStreak[Hitung Streak:<br/>Loop mundur dari hari ini<br/>cek consecutive days]
        CalcStreak --> UpdateStreak[UPDATE habits<br/>SET current_streak = ?]
        UpdateStreak --> RefreshView
        
        %% STATS SYSTEM
        CallRPC[Call RPC:<br/>get_habit_stats]
        CallRPC --> JoinTables[JOIN habits<br/>LEFT JOIN habit_logs<br/>untuk completion rate]
        JoinTables --> CalcStats[Hitung:<br/>- Completion Rate<br/>- Longest Streak<br/>- Total Days]
        CalcStats --> DisplayStats
        
        %% DELETE SYSTEM
        SoftDeleteHabit[Soft Delete:<br/>UPDATE habits<br/>SET deleted_at = NOW<br/>WHERE id = ? AND user_id = auth.uid]
        SoftDeleteHabit --> MoveTrash[Habit Pindah ke Trash]
        MoveTrash --> RefreshView
    end
    
    SubmitHabit --> InsertHabit
    SelectDate --> CheckLog
    ViewStats --> CallRPC
    ClickDelete --> SoftDeleteHabit

    style Start fill:#90EE90
    style End fill:#90EE90
    style DisplayStats fill:#90EE90
```

**Penjelasan:**
- **Role User (Pelanggan/Customer)**: Melihat habits, memilih aksi (create/toggle/view stats/delete)
- **Role Sistem**: Insert/update database, recalculate streak dengan trigger, join tables untuk stats
- **CREATE**: User membuat habit baru dengan nama, sistem set initial streak = 0
- **TOGGLE**: User centang/uncentang habit di tracker grid
  - Jika log belum ada, sistem insert baru
  - Jika sudah ada, sistem toggle completed status
  - Trigger otomatis recalculate streak
- **STATS**: RPC function join habits dengan habit_logs untuk hitung completion rate
- **DELETE**: Soft delete habit ke trash

---

## 5. Activity Diagram: Soft Delete & Hard Delete

```mermaid
graph TD
    subgraph User["👤 Pelanggan (Customer)"]
        Start([Start]) --> ViewItem[Lihat Item<br/>Task/Habit]
        ViewItem --> ClickDelete[Klik Tombol Hapus]
        ShowInTrash[Item Muncul di<br/>Halaman Trash] --> TrashChoice{User di Trash<br/>Pilih Aksi}
        
        %% RESTORE
        TrashChoice -->|Restore| ClickRestore[Klik Kembalikan]
        BackToMain[Item Kembali ke<br/>Halaman Utama] --> End([End])
        
        %% PERMANENT DELETE
        TrashChoice -->|Hapus Permanen| ClickPermanent[Klik Hapus Permanen]
        ShowConfirm[Tampilkan Dialog<br/>Konfirmasi:<br/>Tindakan tidak dapat<br/>dibatalkan] --> UserConfirm{User Konfirmasi?}
        UserConfirm -->|Tidak| ShowInTrash
        ShowSuccess[Tampilkan Toast:<br/>Berhasil Dihapus Permanen] --> End
    end
    
    subgraph System["⚙️ Sistem"]
        %% SOFT DELETE
        CallSoftDelete[Call Function:<br/>soft_delete_task atau<br/>soft_delete_habit]
        CallSoftDelete --> UpdateDeleted[UPDATE table<br/>SET deleted_at = NOW<br/>WHERE id = ? AND user_id = auth.uid]
        UpdateDeleted --> HideFromMain[Item Hilang dari<br/>Halaman Utama]
        HideFromMain --> ShowInTrash
        
        %% RESTORE
        CallRestore[Call Function:<br/>restore_task atau<br/>restore_habit]
        CallRestore --> UpdateRestore[UPDATE table<br/>SET deleted_at = NULL<br/>WHERE id = ? AND user_id = auth.uid]
        UpdateRestore --> BackToMain
        
        %% PERMANENT DELETE
        ShowConfirm
        UserConfirm -->|Ya| CallPermanent[Call Function:<br/>permanent_delete_task atau<br/>permanent_delete_habit]
        CallPermanent --> DeleteDB[DELETE FROM table<br/>WHERE id = ? AND user_id = auth.uid]
        DeleteDB --> CascadeDelete[Cascade Delete:<br/>Related Records<br/>Terhapus Otomatis]
        CascadeDelete --> RemoveFromTrash[Item Hilang dari Trash]
        RemoveFromTrash --> ShowSuccess
    end
    
    ClickDelete --> CallSoftDelete
    ClickRestore --> CallRestore
    ClickPermanent --> ShowConfirm

    style Start fill:#90EE90
    style End fill:#90EE90
    style ShowConfirm fill:#FFF8DC
    style DeleteDB fill:#FFB6C1
    style ShowSuccess fill:#90EE90
```

**Penjelasan:**
- **Role User (Pelanggan/Customer)**: Klik hapus, lihat item di trash, pilih restore atau hapus permanen, konfirmasi
- **Role Sistem**: Soft delete (UPDATE deleted_at), restore (SET deleted_at = NULL), hard delete (DELETE FROM), cascade delete
- **SOFT DELETE**: 
  - Sistem set `deleted_at = NOW()`
  - Item hilang dari halaman utama
  - Item muncul di trash
  - Data masih ada di database
  
- **RESTORE**:
  - Sistem set `deleted_at = NULL`
  - Item kembali ke halaman utama
  - Reversible action
  
- **HARD DELETE**:
  - Sistem tampilkan konfirmasi dialog
  - DELETE FROM database
  - Cascade delete untuk related records (habit_logs)
  - Irreversible action

---

## 6. Activity Diagram: Search & Filter Tasks

```mermaid
graph TD
    subgraph User["👤 Pelanggan (Customer)"]
        Start([Start]) --> ViewTasks[Lihat Halaman Tasks]
        DisplayInitial[Tampilkan Semua Tasks] --> UserAction{User Action}
        
        %% SEARCH
        UserAction -->|Ketik di Search Box| InputSearch[User Mengetik Query]
        
        %% FILTER SUBJECT
        UserAction -->|Pilih Subject| SelectSubject[User Pilih<br/>Mata Kuliah dari Dropdown]
        
        %% FILTER STATUS
        UserAction -->|Pilih Status| SelectStatus[User Pilih Status:<br/>- All<br/>- Todo<br/>- Done]
        
        %% CLEAR
        UserAction -->|Clear| ClearAll[Clear Semua Filter]
        
        ShowResults[Tampilkan Tasks<br/>yang Match] --> UserAction
        ShowEmpty[Tampilkan Empty State:<br/>Tidak ada hasil<br/>untuk query] --> UserAction
        ClearAll --> DisplayInitial
        UserAction -->|Selesai| End([End])
    end
    
    subgraph System["⚙️ Sistem"]
        LoadAll[Load Semua Tasks<br/>dari Database]
        LoadAll --> ApplyRLS[Apply RLS Filter:<br/>WHERE user_id = auth.uid<br/>AND deleted_at IS NULL]
        ApplyRLS --> DisplayInitial
        
        %% SEARCH SYSTEM
        SearchFilter[Filter Client-Side:<br/>WHERE LOWER title LIKE %query%<br/>OR LOWER description LIKE %query%]
        SearchFilter --> UpdateDisplay[Update Display<br/>Real-time]
        
        %% FILTER SUBJECT SYSTEM
        SubjectFilter[Filter Client-Side:<br/>WHERE subject = selected]
        SubjectFilter --> UpdateDisplay
        
        %% FILTER STATUS SYSTEM
        StatusFilter[Filter Client-Side:<br/>WHERE status = selected]
        StatusFilter --> UpdateDisplay
        
        UpdateDisplay --> CheckResults{Ada Hasil?}
        CheckResults -->|Ya| ShowResults
        CheckResults -->|Tidak| ShowEmpty
    end
    
    ViewTasks --> LoadAll
    InputSearch --> SearchFilter
    SelectSubject --> SubjectFilter
    SelectStatus --> StatusFilter

    style Start fill:#90EE90
    style End fill:#90EE90
    style ShowEmpty fill:#FFF8DC
    style ShowResults fill:#90EE90
```

**Penjelasan:**
- **Role User (Pelanggan/Customer)**: Melihat tasks, mengetik search query, memilih filter subject/status, clear filter
- **Role Sistem**: Load tasks dengan RLS, apply filter client-side, update display real-time, cek hasil
- Tasks di-load dari database dengan RLS filter
- **Search**: Real-time filter berdasarkan title atau description (case-insensitive)
- **Filter Subject**: Filter berdasarkan mata kuliah yang dipilih
- **Filter Status**: Filter berdasarkan status (todo/done)
- **Combined**: Semua filter bisa dikombinasikan
- Filter dilakukan di client-side menggunakan `useMemo` untuk performa optimal
- Empty state ditampilkan jika tidak ada hasil

---

## 7. Activity Diagram: View Analytics

```mermaid
graph TD
    subgraph User["👤 Pelanggan (Customer)"]
        Start([Start]) --> ClickMenu[Klik Menu Analytics]
        RenderComplete[Tampilkan Complete<br/>Analytics Dashboard] --> UserInteract{User Interaksi}
        UserInteract -->|Hover Chart| ShowTooltip[Tampilkan Tooltip<br/>Detail Data]
        ShowTooltip --> UserInteract
        UserInteract -->|Refresh| ClickMenu
        UserInteract -->|Selesai| End([End])
    end
    
    subgraph System["⚙️ Sistem"]
        LoadPage[Load Analytics Page]
        LoadPage --> ParallelFetch{Fetch Data Paralel}
        
        %% DASHBOARD SUMMARY
        ParallelFetch -->|Query 1| CallSummary[Call RPC:<br/>get_dashboard_summary]
        CallSummary --> CalcSummary[Hitung:<br/>- Total Tasks<br/>- Completed Tasks<br/>- Pending Tasks<br/>- Overdue Tasks<br/>- Total Habits<br/>- Total Streak]
        CalcSummary --> DisplayCards[Render Stats Cards]
        
        %% WEEKLY STATS
        ParallelFetch -->|Query 2| CallWeekly[Call RPC:<br/>get_weekly_task_stats]
        CallWeekly --> JoinWeekly[LEFT JOIN tasks<br/>dengan generate_series<br/>7 hari terakhir]
        JoinWeekly --> GroupByDate[GROUP BY date<br/>COUNT completed tasks]
        GroupByDate --> DisplayChart[Render Bar Chart:<br/>Progress Tugas Mingguan]
        
        %% SUBJECT STATS
        ParallelFetch -->|Query 3| CallSubject[Call RPC:<br/>get_subject_task_stats]
        CallSubject --> GroupBySubject[GROUP BY subject<br/>Hitung total, completed,<br/>pending, overdue]
        GroupBySubject --> CalcCompletion[Hitung Completion Rate<br/>per Subject]
        CalcCompletion --> DisplayProgress[Render Progress Bars<br/>per Mata Kuliah]
        
        %% HABIT STATS
        ParallelFetch -->|Query 4| CallHabit[Call RPC:<br/>get_habit_stats]
        CallHabit --> JoinHabitLogs[JOIN habits<br/>LEFT JOIN habit_logs<br/>30 hari terakhir]
        JoinHabitLogs --> CalcHabitStats[Hitung:<br/>- Current Streak<br/>- Longest Streak<br/>- Completion Rate<br/>- Total Days]
        CalcHabitStats --> DisplayHabitChart[Render:<br/>- Avg Completion Rate<br/>- Per-Habit Progress]
        
        %% PRIORITY BREAKDOWN
        ParallelFetch -->|Query 5| LoadTasks[Load All Tasks<br/>dengan RLS Filter]
        LoadTasks --> GroupByPriority[Group by Priority:<br/>- High<br/>- Medium<br/>- Low]
        GroupByPriority --> DisplayPriority[Render Priority Cards<br/>dengan Count]
        
        %% COMBINE ALL
        DisplayCards --> WaitAll[Wait All Queries]
        DisplayChart --> WaitAll
        DisplayProgress --> WaitAll
        DisplayHabitChart --> WaitAll
        DisplayPriority --> WaitAll
        WaitAll --> RenderComplete
    end
    
    ClickMenu --> LoadPage

    style Start fill:#90EE90
    style End fill:#90EE90
    style RenderComplete fill:#90EE90
```

**Penjelasan:**
- **Role User (Pelanggan/Customer)**: Klik menu analytics, lihat dashboard, hover chart untuk tooltip, refresh
- **Role Sistem**: Load page, fetch 5 query paralel (RPC), render charts dan stats cards
- Analytics page melakukan **5 query paralel** untuk performa optimal
- **Dashboard Summary**: Agregasi total tasks, habits, streak
- **Weekly Stats**: JOIN tasks dengan generate_series untuk 7 hari terakhir, tampil di bar chart
- **Subject Stats**: GROUP BY subject untuk breakdown per mata kuliah
- **Habit Stats**: JOIN habits dengan habit_logs untuk hitung completion rate 30 hari
- **Priority Breakdown**: Group tasks by priority (high/medium/low)
- Semua query menggunakan RLS untuk filter user_id
- React Query melakukan caching untuk performa

---

## 8. Activity Diagram: Notification System

```mermaid
graph TD
    subgraph System["⚙️ Sistem - Cron Jobs"]
        Start([Sistem Notifikasi Aktif]) --> ParallelCron{Cron Jobs Berjalan Paralel}
        
        %% DEADLINE NOTIFICATION
        ParallelCron -->|Daily 8 AM| CronDeadline[Cron: check-deadlines<br/>Berjalan Setiap Hari<br/>Pukul 08:00 WIB]
        CronDeadline --> QueryDeadline[Query Tasks:<br/>WHERE due_date = CURRENT_DATE + 1<br/>AND status != 'done'<br/>AND deleted_at IS NULL]
        QueryDeadline --> CheckDeadlineTasks{Ada Tasks<br/>Deadline Besok?}
        CheckDeadlineTasks -->|Tidak| EndDeadline([Selesai - Deadline])
        CheckDeadlineTasks -->|Ya| LoopDeadlineTasks[Loop Setiap Task]
        LoopDeadlineTasks --> GetUserPrefs[Get User Preferences:<br/>deadline_reminders enabled?]
        GetUserPrefs --> CheckDeadlineEnabled{Enabled?}
        CheckDeadlineEnabled -->|Tidak| NextDeadlineTask[Next Task]
        CheckDeadlineEnabled -->|Ya| GetFCMTokens[Get FCM Tokens<br/>untuk User]
        GetFCMTokens --> CheckTokens{Ada Token?}
        CheckTokens -->|Tidak| NextDeadlineTask
        CheckTokens -->|Ya| SendDeadlineNotif[Send Push Notification:<br/>Deadline besok untuk task X]
        SendDeadlineNotif --> SaveNotifHistory[INSERT INTO notifications<br/>type = 'deadline']
        SaveNotifHistory --> UpdateTokenUsage[UPDATE fcm_tokens<br/>SET last_used_at = NOW]
        UpdateTokenUsage --> NextDeadlineTask
        NextDeadlineTask --> CheckMoreDeadline{Ada Task Lagi?}
        CheckMoreDeadline -->|Ya| LoopDeadlineTasks
        CheckMoreDeadline -->|Tidak| EndDeadline
        
        %% URGENT DEADLINE
        ParallelCron -->|Every 6 Hours| CronUrgent[Cron: check-urgent-deadlines<br/>Berjalan Setiap 6 Jam]
        CronUrgent --> QueryUrgent[Query Tasks:<br/>WHERE due_date <= NOW + 6 hours<br/>AND status != 'done']
        QueryUrgent --> CheckUrgentTasks{Ada Tasks<br/>Urgent?}
        CheckUrgentTasks -->|Tidak| EndUrgent([Selesai - Urgent])
        CheckUrgentTasks -->|Ya| SendUrgentNotif[Send Push Notification:<br/>URGENT Deadline 6 jam lagi]
        SendUrgentNotif --> SaveUrgentHistory[INSERT INTO notifications<br/>type = 'deadline']
        SaveUrgentHistory --> EndUrgent
        
        %% HABIT REMINDER
        ParallelCron -->|Daily at User Time| CronHabit[Cron: check-habits<br/>Berjalan Sesuai<br/>User reminder_time]
        CronHabit --> QueryHabits[Query Habits:<br/>WHERE deleted_at IS NULL<br/>AND user active]
        QueryHabits --> CheckHabits{Ada Habits?}
        CheckHabits -->|Tidak| EndHabit([Selesai - Habit])
        CheckHabits -->|Ya| CheckHabitLog[Check habit_logs:<br/>Sudah complete hari ini?]
        CheckHabitLog --> IsCompleted{Completed?}
        IsCompleted -->|Ya| EndHabit
        IsCompleted -->|Tidak| SendHabitNotif[Send Push Notification:<br/>Jangan lupa habit X hari ini]
        SendHabitNotif --> SaveHabitHistory[INSERT INTO notifications<br/>type = 'habit_reminder']
        SaveHabitHistory --> EndHabit
        
        %% TOKEN CLEANUP
        ParallelCron -->|Weekly| CronCleanup[Cron: cleanup-tokens<br/>Berjalan Setiap Minggu]
        CronCleanup --> QueryOldTokens[Query FCM Tokens:<br/>WHERE last_used_at < NOW - 30 days]
        QueryOldTokens --> CheckOldTokens{Ada Token Lama?}
        CheckOldTokens -->|Tidak| EndCleanup([Selesai - Cleanup])
        CheckOldTokens -->|Ya| DeleteOldTokens[DELETE FROM fcm_tokens<br/>WHERE last_used_at < NOW - 30 days]
        DeleteOldTokens --> LogCleanup[Log: X tokens dihapus]
        LogCleanup --> EndCleanup
    end
    
    subgraph User["👤 Pelanggan (Customer)"]
        ReceiveNotif[Terima Push Notification<br/>di Device]
        ReceiveNotif --> UserSeeNotif[Lihat Notifikasi]
        UserSeeNotif --> EndUser([End])
    end
    
    SendDeadlineNotif -.->|Push| ReceiveNotif
    SendUrgentNotif -.->|Push| ReceiveNotif
    SendHabitNotif -.->|Push| ReceiveNotif

    style Start fill:#87CEEB
    style EndDeadline fill:#90EE90
    style EndUrgent fill:#90EE90
    style EndHabit fill:#90EE90
    style EndCleanup fill:#90EE90
    style EndUser fill:#90EE90
    style CronDeadline fill:#B0E0E6
    style CronUrgent fill:#FFF8DC
    style CronHabit fill:#98FB98
    style CronCleanup fill:#FFB6C1
```

**Penjelasan:**
- **Role Sistem (Cron Jobs)**: 4 cron jobs berjalan paralel untuk automated notifications
- **Role User (Pelanggan)**: Menerima push notification di device
- **Deadline Notification**: Cek tasks yang deadline besok, kirim notif pukul 8 pagi
- **Urgent Deadline**: Cek tasks yang deadline dalam 6 jam, kirim notif setiap 6 jam
- **Habit Reminder**: Cek habits yang belum complete hari ini, kirim sesuai user's reminder_time
- **Token Cleanup**: Hapus FCM tokens yang tidak digunakan >30 hari (weekly)
- Semua notifikasi cek user preferences terlebih dahulu
- History disimpan di tabel `notifications`

---

## 9. Activity Diagram: Enable Push Notifications

```mermaid
graph TD
    subgraph User["👤 Pelanggan (Customer)"]
        Start([Start]) --> OpenApp[Buka Aplikasi]
        ShowPrompt[Tampilkan Prompt:<br/>Aktifkan Notifikasi?] --> UserChoice{User Klik<br/>Aktifkan?}
        UserChoice -->|Tidak| Dismiss[User Dismiss Prompt]
        Dismiss --> End([End])
        UserChoice -->|Ya| ClickAllow[Klik Aktifkan]
        BrowserPrompt[Browser Tampilkan<br/>Native Permission Dialog] --> PermissionResult{User Response}
        PermissionResult -->|Denied| ShowDenied[Tampilkan Pesan:<br/>Notifikasi diblokir<br/>Cara enable di settings]
        ShowDenied --> End
        PermissionResult -->|Granted| WaitProcess[Tunggu Proses...]
        ShowSuccess[Tampilkan Toast:<br/>Notifikasi berhasil diaktifkan] --> ReceiveTest[Terima Test Notification:<br/>Selamat datang di FlowDay]
        ReceiveTest --> End
    end
    
    subgraph System["⚙️ Sistem"]
        CheckPermission{Browser Support<br/>Push Notifications?}
        CheckPermission -->|Tidak| ShowUnsupported[Tampilkan Pesan:<br/>Browser tidak support<br/>push notifications]
        ShowUnsupported --> End
        CheckPermission -->|Ya| CheckExisting{FCM Token<br/>Sudah Ada?}
        CheckExisting -->|Ya| TokenValid[Token Valid<br/>Notifikasi Aktif]
        TokenValid --> End
        CheckExisting -->|Tidak| ShowPrompt
        
        RequestPermission[Request Browser Permission:<br/>Notification.requestPermission]
        RequestPermission --> BrowserPrompt
        
        InitFirebase[Initialize Firebase<br/>Cloud Messaging]
        InitFirebase --> GetToken[Request FCM Token:<br/>getToken dari Firebase]
        GetToken --> TokenReceived{Token<br/>Berhasil?}
        TokenReceived -->|Tidak| ShowError[Tampilkan Error:<br/>Gagal mendapatkan token]
        ShowError --> End
        TokenReceived -->|Ya| GetDeviceInfo[Collect Device Info:<br/>- Browser<br/>- OS<br/>- Device Type]
        GetDeviceInfo --> SaveToken[POST /api/notifications/register<br/>Save Token ke Database]
        SaveToken --> InsertDB[INSERT INTO fcm_tokens<br/>user_id, token, device_info]
        InsertDB --> CheckDuplicate{Token Sudah<br/>Ada?}
        CheckDuplicate -->|Ya| UpdateExisting[UPDATE fcm_tokens<br/>SET updated_at = NOW<br/>WHERE token = ?]
        CheckDuplicate -->|Tidak| InsertNew[INSERT new token]
        UpdateExisting --> ShowSuccess
        InsertNew --> ShowSuccess
        ShowSuccess --> SendTestNotif[Kirim Test Notification:<br/>Selamat datang di FlowDay]
        SendTestNotif -.->|Push| ReceiveTest
    end
    
    OpenApp --> CheckPermission
    ClickAllow --> RequestPermission
    WaitProcess --> InitFirebase

    style Start fill:#90EE90
    style End fill:#90EE90
    style ShowSuccess fill:#90EE90
    style ShowDenied fill:#FFB6C1
    style ShowError fill:#FFB6C1
    style ShowUnsupported fill:#FFF8DC
```

**Penjelasan:**
- **Role User (Pelanggan/Customer)**: Buka app, klik aktifkan notifikasi, izinkan permission browser, terima test notification
- **Role Sistem**: Cek browser support, cek existing token, request permission, init Firebase, get FCM token, save to database
1. **Check Browser Support**: Validasi browser support push notifications
2. **Check Existing Token**: Cek apakah user sudah punya FCM token aktif
3. **Request Permission**: Tampilkan prompt untuk aktifkan notifikasi
4. **Browser Permission**: Native browser dialog untuk izin notifikasi
5. **Get FCM Token**: Request token dari Firebase Cloud Messaging
6. **Save to Database**: Simpan token ke tabel `fcm_tokens` dengan device info
7. **Handle Duplicate**: Update jika token sudah ada, insert jika baru
8. **Test Notification**: Kirim welcome notification untuk konfirmasi

---

## 10. Activity Diagram: Send Deadline Notification (Cron)

```mermaid
graph TD
    subgraph System["⚙️ Sistem - Cron Job"]
        Start([Cron Job Triggered<br/>Daily at 8:00 AM WIB]) --> LogStart[Log: Cron job started]
        LogStart --> QueryTasks[Query Database:<br/>SELECT * FROM tasks<br/>WHERE due_date = CURRENT_DATE + INTERVAL '1 day'<br/>AND status != 'done'<br/>AND deleted_at IS NULL]
        QueryTasks --> CheckResults{Ada Tasks<br/>yang Deadline<br/>Besok?}
        
        CheckResults -->|Tidak| LogNoTasks[Log: No tasks found]
        LogNoTasks --> EndSuccess([Cron Selesai - Success])
        
        CheckResults -->|Ya| GroupByUser[GROUP BY user_id<br/>untuk Batch Processing]
        GroupByUser --> LoopUsers[Loop Setiap User]
        
        LoopUsers --> GetPreferences[Query Preferences:<br/>SELECT * FROM notification_preferences<br/>WHERE user_id = ?]
        GetPreferences --> CheckEnabled{deadline_reminders<br/>= TRUE?}
        
        CheckEnabled -->|Tidak| LogDisabled[Log: User disabled deadline reminders]
        LogDisabled --> NextUser[Next User]
        
        CheckEnabled -->|Ya| GetTokens[Query FCM Tokens:<br/>SELECT * FROM fcm_tokens<br/>WHERE user_id = ?<br/>AND last_used_at > NOW - 30 days]
        GetTokens --> CheckTokens{Ada Token<br/>Aktif?}
        
        CheckTokens -->|Tidak| LogNoToken[Log: No active tokens for user]
        LogNoToken --> NextUser
        
        CheckTokens -->|Ya| PrepareNotif[Prepare Notification Payload:<br/>title: Pengingat Deadline<br/>body: X tugas deadline besok<br/>data: task_ids, user_id]
        PrepareNotif --> LoopTokens[Loop Setiap Token]
        
        LoopTokens --> SendFCM[Send via Firebase Admin SDK:<br/>admin.messaging.send]
        SendFCM --> FCMResponse{FCM Response}
        
        FCMResponse -->|Success| LogSuccess[Log: Notification sent successfully]
        LogSuccess --> SaveHistory[INSERT INTO notifications<br/>user_id, title, body, type='deadline']
        SaveHistory --> UpdateToken[UPDATE fcm_tokens<br/>SET last_used_at = NOW<br/>WHERE token = ?]
        UpdateToken --> NextToken[Next Token]
        
        FCMResponse -->|Error: Invalid Token| LogInvalidToken[Log: Invalid token]
        LogInvalidToken --> DeleteToken[DELETE FROM fcm_tokens<br/>WHERE token = ?]
        DeleteToken --> NextToken
        
        FCMResponse -->|Error: Other| LogError[Log: FCM error]
        LogError --> NextToken
        
        NextToken --> CheckMoreTokens{Ada Token<br/>Lagi?}
        CheckMoreTokens -->|Ya| LoopTokens
        CheckMoreTokens -->|Tidak| NextUser
        
        NextUser --> CheckMoreUsers{Ada User<br/>Lagi?}
        CheckMoreUsers -->|Ya| LoopUsers
        CheckMoreUsers -->|Tidak| LogComplete[Log: Cron job completed<br/>X notifications sent]
        LogComplete --> EndSuccess
    end
    
    subgraph User["👤 Pelanggan (Customer)"]
        ReceiveNotif[Terima Push Notification<br/>di Device]
        ReceiveNotif --> ViewNotif[Lihat Notifikasi<br/>Deadline]
        ViewNotif --> EndUser([End])
    end
    
    SendFCM -.->|Push| ReceiveNotif

    style Start fill:#87CEEB
    style EndSuccess fill:#90EE90
    style EndUser fill:#90EE90
    style LogSuccess fill:#90EE90
    style LogError fill:#FFB6C1
    style LogInvalidToken fill:#FFF8DC
``` detected]
    LogInvalidToken --> DeleteToken[DELETE FROM fcm_tokens<br/>WHERE token = ?]
    DeleteToken --> NextToken
    
    FCMResponse -->|Error: Other| LogError[Log: FCM error]
    LogError --> NextToken
    
    NextToken --> CheckMoreTokens{Ada Token<br/>Lagi?}
    CheckMoreTokens -->|Ya| LoopTokens
    CheckMoreTokens -->|Tidak| NextUser
    
    NextUser --> CheckMoreUsers{Ada User<br/>Lagi?}
    CheckMoreUsers -->|Ya| LoopUsers
    CheckMoreUsers -->|Tidak| LogComplete[Log: Cron job completed<br/>X notifications sent]
    LogComplete --> EndSuccess

    style Start fill:#e1f5e1
    style EndSuccess fill:#e1f5e1
    style LogSuccess fill:#e1f5e1
    style LogError fill:#ffe1e1
    style LogInvalidToken fill:#fff3cd
```

**Penjelasan Cron Job Flow:**
- **Role Sistem (Cron Job)**: Triggered daily 8 AM, query tasks, loop users, cek preferences, send FCM, handle response
- **Role User (Pelanggan)**: Terima push notification di device
1. **Trigger**: Cron job berjalan setiap hari pukul 8 pagi (via Vercel Cron)
2. **Query Tasks**: Ambil semua tasks yang deadline besok dan belum selesai
3. **Group by User**: Batch processing per user untuk efisiensi
4. **Check Preferences**: Validasi user enable deadline reminders
5. **Get Tokens**: Ambil FCM tokens yang aktif (digunakan <30 hari terakhir)
6. **Send Notification**: Kirim via Firebase Admin SDK
7. **Handle Response**:
   - Success: Save history, update last_used_at
   - Invalid Token: Delete token dari database
   - Other Error: Log error untuk debugging
8. **Logging**: Comprehensive logging untuk monitoring

---

## 11. Activity Diagram: Configure Notification Preferences

```mermaid
graph TD
    subgraph User["👤 Pelanggan (Customer)"]
        Start([Start]) --> OpenSettings[Buka Settings]
        OpenSettings --> ClickNotif[Klik Tab<br/>Notification Settings]
        DisplayForm[Tampilkan Form dengan<br/>Current Values] --> UserModify{User Modifikasi<br/>Settings}
        
        %% TOGGLES
        UserModify -->|Toggle Deadline| ToggleDeadline[Toggle Switch:<br/>deadline_reminders]
        ToggleDeadline --> UserModify
        
        UserModify -->|Toggle Habit| ToggleHabit[Toggle Switch:<br/>habit_reminders]
        ToggleHabit --> UserModify
        
        UserModify -->|Toggle Streak| ToggleStreak[Toggle Switch:<br/>streak_milestones]
        ToggleStreak --> UserModify
        
        UserModify -->|Toggle Task Complete| ToggleTask[Toggle Switch:<br/>task_complete]
        ToggleTask --> UserModify
        
        UserModify -->|Change Time| SelectTime[Select Time Picker:<br/>Pilih Waktu Pengingat]
        SelectTime --> UserModify
        
        %% SAVE
        UserModify -->|Klik Simpan| ClickSave[Klik Simpan]
        ShowValidationError[Tampilkan Error:<br/>Waktu harus valid] --> UserModify
        ShowSuccess[Tampilkan Toast:<br/>Pengaturan berhasil disimpan] --> UpdateUI[Update UI dengan<br/>New Preferences]
        UpdateUI --> End([End])
        
        %% CANCEL
        UserModify -->|Klik Batal| ClickCancel[Klik Batal]
        ShowConfirm[Tampilkan Dialog:<br/>Buang perubahan?] --> UserConfirm{User Konfirmasi?}
        UserConfirm -->|Tidak| UserModify
        UserConfirm -->|Ya| End
    end
    
    subgraph System["⚙️ Sistem"]
        LoadPrefs[Load Current Preferences:<br/>SELECT * FROM notification_preferences<br/>WHERE user_id = auth.uid]
        LoadPrefs --> CheckExists{Preferences<br/>Exists?}
        CheckExists -->|Tidak| CreateDefault[Create Default Preferences:<br/>INSERT INTO notification_preferences<br/>All enabled, reminder_time = 20:00]
        CheckExists -->|Ya| DisplayForm
        CreateDefault --> DisplayForm
        
        %% UPDATE STATE
        UpdateDeadline[Update State:<br/>deadline_reminders = !current]
        UpdateDeadline --> UserModify
        UpdateHabit[Update State:<br/>habit_reminders = !current]
        UpdateHabit --> UserModify
        UpdateStreak[Update State:<br/>streak_milestones = !current]
        UpdateStreak --> UserModify
        UpdateTask[Update State:<br/>task_complete = !current]
        UpdateTask --> UserModify
        UpdateTime[Update State:<br/>reminder_time = selected]
        UpdateTime --> UserModify
        
        %% SAVE SYSTEM
        ValidateForm{Form Valid?}
        ValidateForm -->|Tidak| ShowValidationError
        ValidateForm -->|Ya| SaveToDB[UPDATE notification_preferences<br/>SET deadline_reminders = ?<br/>habit_reminders = ?<br/>streak_milestones = ?<br/>task_complete = ?<br/>reminder_time = ?<br/>updated_at = NOW<br/>WHERE user_id = auth.uid]
        SaveToDB --> TriggerUpdate[Database Trigger:<br/>Update updated_at timestamp]
        TriggerUpdate --> InvalidateCache[Invalidate React Query Cache:<br/>Refetch preferences]
        InvalidateCache --> ShowSuccess
        
        %% CANCEL SYSTEM
        ConfirmCancel{Ada Perubahan<br/>Belum Disimpan?}
        ConfirmCancel -->|Tidak| End
        ConfirmCancel -->|Ya| ShowConfirm
        ResetForm[Reset Form ke<br/>Original Values]
        ResetForm --> End
    end
    
    ClickNotif --> LoadPrefs
    ToggleDeadline --> UpdateDeadline
    ToggleHabit --> UpdateHabit
    ToggleStreak --> UpdateStreak
    ToggleTask --> UpdateTask
    SelectTime --> UpdateTime
    ClickSave --> ValidateForm
    ClickCancel --> ConfirmCancel
    UserConfirm -->|Ya| ResetForm

    style Start fill:#90EE90
    style End fill:#90EE90
    style ShowSuccess fill:#90EE90
    style ShowValidationError fill:#FFB6C1
    style ShowConfirm fill:#FFF8DC
```

**Penjelasan:**
- **Role User (Pelanggan/Customer)**: Buka settings, klik notification tab, toggle switches, ubah waktu, simpan atau batal
- **Role Sistem**: Load preferences, create default jika belum ada, update state, validasi form, save to database, invalidate cache
1. **Load Preferences**: Ambil current preferences dari database
2. **Create Default**: Jika belum ada, create dengan default values (all enabled, 8 PM)
3. **Toggle Switches**: User bisa enable/disable per notification type:
   - Deadline Reminders
   - Habit Reminders
   - Streak Milestones
   - Task Complete
4. **Change Time**: User bisa set custom reminder time untuk habit reminders
5. **Save to Database**: Update preferences dengan RLS filter
6. **Invalidate Cache**: React Query refetch untuk update UI
7. **Cancel Handling**: Konfirmasi jika ada unsaved changes

---

## 12. Activity Diagram: Complete System Flow

```mermaid
graph TD
    subgraph User["👤 Pengunjung/Pelanggan"]
        Start([Start]) --> OpenApp[Buka Aplikasi]
        
        %% NOT AUTHENTICATED
        Landing[Tampilkan Landing Page] --> AuthChoice{Pilih Aksi}
        AuthChoice -->|Login| InputLogin[Input Kredensial Login]
        AuthChoice -->|Register| InputRegister[Input Data Registrasi]
        InputLogin --> SubmitLogin[Submit Login]
        InputRegister --> SubmitRegister[Submit Register]
        
        %% AUTHENTICATED - DASHBOARD
        DisplayDash[Tampilkan Dashboard] --> MainMenu{User Pilih Menu}
        
        %% DASHBOARD
        MainMenu -->|Dashboard| ViewOverview[Lihat Overview:<br/>- Stats Cards<br/>- Recent Tasks<br/>- Habit Summary]
        ViewOverview --> MainMenu
        
        %% TASKS
        MainMenu -->|Tasks| ViewTasks[Lihat Halaman Tasks]
        ViewTasks --> TaskAction{Pilih Aksi}
        TaskAction -->|CRUD| DoTaskCRUD[Create/Read/<br/>Update/Delete Task]
        TaskAction -->|Search| DoTaskSearch[Search & Filter Tasks]
        TaskAction -->|Soft Delete| DoTaskTrash[Pindah ke Trash]
        DoTaskCRUD --> ViewTasks
        DoTaskSearch --> ViewTasks
        DoTaskTrash --> ViewTasks
        TaskAction -->|Back| MainMenu
        
        %% HABITS
        MainMenu -->|Habits| ViewHabits[Lihat Halaman Habits]
        ViewHabits --> HabitAction{Pilih Aksi}
        HabitAction -->|Create| DoCreateHabit[Tambah Habit Baru]
        HabitAction -->|Toggle| DoToggleHabit[Toggle Habit Log]
        HabitAction -->|View Stats| DoHabitStats[Lihat Habit Stats]
        HabitAction -->|Delete| DoHabitTrash[Pindah ke Trash]
        DoCreateHabit --> ViewHabits
        DoToggleHabit --> ViewHabits
        DoHabitStats --> ViewHabits
        DoHabitTrash --> ViewHabits
        HabitAction -->|Back| MainMenu
        
        %% ANALYTICS
        MainMenu -->|Analytics| ViewAnalytics[Lihat Halaman Analytics]
        ViewAnalytics --> MainMenu
        
        %% TRASH
        MainMenu -->|Trash| ViewTrash[Lihat Halaman Trash]
        ViewTrash --> TrashAction{Pilih Aksi}
        TrashAction -->|Restore| DoRestore[Restore Item]
        TrashAction -->|Hard Delete| DoHardDelete[Permanent Delete]
        DoRestore --> ViewTrash
        DoHardDelete --> ViewTrash
        TrashAction -->|Back| MainMenu
        
        %% SETTINGS
        MainMenu -->|Settings| ViewSettings[Lihat Halaman Settings]
        ViewSettings --> SettingsAction{Pilih Aksi}
        SettingsAction -->|Profile| DoEditProfile[Edit Profile]
        SettingsAction -->|Subjects| DoManageSubjects[Kelola Mata Kuliah]
        SettingsAction -->|Theme| DoToggleTheme[Toggle Dark/Light Mode]
        SettingsAction -->|Notifications| DoNotifSettings[Atur Notifikasi]
        DoEditProfile --> ViewSettings
        DoManageSubjects --> ViewSettings
        DoToggleTheme --> ViewSettings
        DoNotifSettings --> ViewSettings
        SettingsAction -->|Back| MainMenu
        
        %% LOGOUT
        MainMenu -->|Logout| ClickLogout[Klik Logout]
        ConfirmLogout[Konfirmasi Logout?] --> UserConfirmLogout{Konfirmasi?}
        UserConfirmLogout -->|Tidak| MainMenu
        UserConfirmLogout -->|Ya| RedirectLogin[Redirect ke Login]
        RedirectLogin --> Landing
        
        MainMenu -->|Close App| End([End])
    end
    
    subgraph System["⚙️ Sistem"]
        CheckAuth{User<br/>Authenticated?}
        CheckAuth -->|Tidak| Landing
        
        %% LOGIN SYSTEM
        ValidateLogin{Login Valid?}
        ValidateLogin -->|Tidak| Landing
        ValidateLogin -->|Ya| CreateSession[Create Session<br/>& Set Cookie]
        
        %% REGISTER SYSTEM
        ValidateRegister{Register Valid?}
        ValidateRegister -->|Tidak| Landing
        ValidateRegister -->|Ya| CreateUser[Create User<br/>& Profile]
        CreateUser --> CreateSession
        
        %% MIDDLEWARE
        Middleware[Middleware:<br/>Validate Session]
        Middleware --> CheckSession{Session Valid?}
        CheckSession -->|Tidak| Logout[Clear Session]
        Logout --> Landing
        CheckSession -->|Ya| LoadDashboard[Load Dashboard]
        LoadDashboard --> FetchUserData[Fetch User Data<br/>dengan RLS Filter]
        FetchUserData --> DisplayDash
        
        %% ANALYTICS SYSTEM
        FetchAnalytics[Fetch Multiple Stats<br/>Paralel via RPC]
        FetchAnalytics --> RenderCharts[Render Charts:<br/>- Weekly Progress<br/>- Subject Breakdown<br/>- Habit Stats<br/>- Priority Distribution]
        RenderCharts --> ViewAnalytics
        
        %% TRASH SYSTEM
        RestoreItem[Restore Item<br/>SET deleted_at = NULL]
        RestoreItem --> ViewTrash
        PermanentDelete[Permanent Delete<br/>dengan Konfirmasi]
        PermanentDelete --> ViewTrash
        
        %% LOGOUT SYSTEM
        ConfirmLogout
        ClearSession[Clear Session<br/>& Cache]
        ClearSession --> RedirectLogin
    end
    
    OpenApp --> CheckAuth
    SubmitLogin --> ValidateLogin
    SubmitRegister --> ValidateRegister
    CreateSession --> Middleware
    ViewAnalytics --> FetchAnalytics
    DoRestore --> RestoreItem
    DoHardDelete --> PermanentDelete
    ClickLogout --> ConfirmLogout
    UserConfirmLogout -->|Ya| ClearSession

    style Start fill:#90EE90
    style End fill:#90EE90
    style DisplayDash fill:#90EE90
    style RenderCharts fill:#90EE90
```

**Penjelasan Complete Flow:**
- **Role User (Pengunjung/Pelanggan)**: Buka app, login/register, navigasi menu, pilih aksi di setiap halaman, logout
- **Role Sistem**: Cek authentication, validasi login/register, middleware session, fetch data dengan RLS, operasi database
1. **Authentication Check**: Middleware validasi session
2. **Landing/Auth**: Login atau register untuk user baru
3. **Dashboard**: Overview stats dan recent activities
4. **Tasks Management**: CRUD, search, filter, soft delete
5. **Habits Management**: Create, toggle, view stats, soft delete
6. **Analytics**: Multiple RPC queries untuk charts dan stats
7. **Trash**: Restore atau permanent delete items
8. **Settings**: Edit profile, manage subjects, toggle theme, notification preferences
9. **Logout**: Clear session dan redirect ke login

---

## 📝 CATATAN FORMAT DIAGRAM

### Role-Based Activity Diagrams (Swimlanes)

Semua activity diagram dalam dokumen ini menggunakan format **role-based** dengan **swimlanes** untuk memisahkan tanggung jawab antara:

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
- 🔵 **Biru Muda (#87CEEB, #B0E0E6)**: System processes, Cron jobs

### Simbol Koneksi:

- **→ (Solid Arrow)**: Alur normal/synchronous
- **-.-> (Dashed Arrow)**: Alur asynchronous (contoh: push notification)

---

**Last Updated**: 2026-05-06  
**Version**: 2.0 (Role-Based Format)  
**Author**: FlowDay Development Team
