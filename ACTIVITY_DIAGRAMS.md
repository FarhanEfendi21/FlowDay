# ACTIVITY DIAGRAMS - FlowDay Project
# Task & Habit Management System

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
    Start([User Membuka Halaman Register]) --> InputData[User Mengisi Form:<br/>- Nama<br/>- Email<br/>- Password<br/>- Konfirmasi Password]
    InputData --> Submit[User Klik Tombol Daftar]
    Submit --> ValidateClient{Validasi Client-Side:<br/>Password Match?}
    
    ValidateClient -->|Tidak| ErrorMatch[Tampilkan Error:<br/>Password Tidak Cocok]
    ErrorMatch --> InputData
    
    ValidateClient -->|Ya| CallAPI[Kirim Request ke<br/>Supabase Auth API]
    CallAPI --> ValidateServer{Validasi Server:<br/>Email Valid?<br/>Password Min 6 Char?}
    
    ValidateServer -->|Tidak| ErrorServer[Tampilkan Error<br/>dari Server]
    ErrorServer --> InputData
    
    ValidateServer -->|Ya| CreateUser[Supabase: Create User<br/>di auth.users]
    CreateUser --> Trigger[Database Trigger:<br/>handle_new_user]
    Trigger --> CreateProfile[Auto-Create Profile<br/>di public.profiles]
    CreateProfile --> Success[Tampilkan Pesan Sukses]
    Success --> Redirect[Redirect ke<br/>Halaman Login]
    Redirect --> End([Selesai])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style ErrorMatch fill:#ffe1e1
    style ErrorServer fill:#ffe1e1
    style Success fill:#e1f5e1
```

**Penjelasan:**
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
    Start([User Membuka Halaman Login]) --> InputCred[User Mengisi:<br/>- Email<br/>- Password]
    InputCred --> Submit[User Klik Tombol Masuk]
    Submit --> CallAuth[Kirim Request ke<br/>Supabase Auth]
    CallAuth --> ValidateAuth{Kredensial Valid?}
    
    ValidateAuth -->|Tidak| ErrorAuth[Tampilkan Error:<br/>Email/Password Salah]
    ErrorAuth --> InputCred
    
    ValidateAuth -->|Ya| CreateSession[Supabase: Create Session<br/>& Set Cookie]
    CreateSession --> RedirectDash[Redirect ke /dashboard]
    RedirectDash --> Middleware[Middleware: Validasi Session]
    Middleware --> CheckSession{Session Valid?}
    
    CheckSession -->|Tidak| RedirectLogin[Redirect ke /login]
    RedirectLogin --> InputCred
    
    CheckSession -->|Ya| LoadDash[Load Dashboard Page]
    LoadDash --> FetchData[Fetch User Data:<br/>- Tasks<br/>- Habits<br/>- Stats]
    FetchData --> RLS[Database: Apply RLS<br/>Filter by user_id]
    RLS --> DisplayDash[Tampilkan Dashboard<br/>dengan Data User]
    DisplayDash --> End([User Berhasil Login])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style ErrorAuth fill:#ffe1e1
    style DisplayDash fill:#e1f5e1
```

**Penjelasan:**
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
    Start([User di Halaman Tasks]) --> Choice{Pilih Aksi}
    
    %% CREATE FLOW
    Choice -->|Create| ClickAdd[Klik Tombol<br/>Tambah Tugas]
    ClickAdd --> OpenDialog[Buka Dialog Form]
    OpenDialog --> FillForm[Isi Form:<br/>- Judul<br/>- Deskripsi<br/>- Mata Kuliah<br/>- Prioritas<br/>- Deadline]
    FillForm --> SubmitCreate[Klik Simpan]
    SubmitCreate --> ValidateCreate{Form Valid?}
    ValidateCreate -->|Tidak| ErrorCreate[Tampilkan Error]
    ErrorCreate --> FillForm
    ValidateCreate -->|Ya| InsertDB[INSERT INTO tasks]
    InsertDB --> RefreshList[Refresh Task List]
    RefreshList --> ShowSuccess[Tampilkan Toast:<br/>Tugas Berhasil Ditambahkan]
    ShowSuccess --> End([Selesai])
    
    %% READ FLOW
    Choice -->|Read| LoadTasks[Load Tasks dari Database]
    LoadTasks --> ApplyRLS[Apply RLS:<br/>WHERE user_id = auth.uid]
    ApplyRLS --> ApplyFilters{Ada Filter?}
    ApplyFilters -->|Ya| FilterData[Filter by:<br/>- Subject<br/>- Status<br/>- Search Query]
    ApplyFilters -->|Tidak| DisplayAll[Tampilkan Semua Tasks]
    FilterData --> DisplayFiltered[Tampilkan Tasks<br/>yang Terfilter]
    DisplayAll --> End
    DisplayFiltered --> End
    
    %% UPDATE FLOW
    Choice -->|Update| SelectTask[Pilih Task]
    SelectTask --> ClickEdit[Klik Edit]
    ClickEdit --> OpenEditDialog[Buka Dialog Edit]
    OpenEditDialog --> ModifyForm[Ubah Data Form]
    ModifyForm --> SubmitUpdate[Klik Simpan Perubahan]
    SubmitUpdate --> ValidateUpdate{Form Valid?}
    ValidateUpdate -->|Tidak| ErrorUpdate[Tampilkan Error]
    ErrorUpdate --> ModifyForm
    ValidateUpdate -->|Ya| UpdateDB[UPDATE tasks<br/>SET ... WHERE id = ?]
    UpdateDB --> TriggerUpdate[Trigger: Update<br/>updated_at timestamp]
    TriggerUpdate --> RefreshList
    
    %% DELETE FLOW
    Choice -->|Delete| SelectTaskDel[Pilih Task]
    SelectTaskDel --> ClickDelete[Klik Hapus]
    ClickDelete --> SoftDelete[Soft Delete:<br/>UPDATE tasks<br/>SET deleted_at = NOW]
    SoftDelete --> MoveTrash[Task Pindah ke Trash]
    MoveTrash --> RefreshList
    
    %% TOGGLE STATUS
    Choice -->|Toggle Status| SelectTaskToggle[Pilih Task]
    SelectTaskToggle --> ClickCheckbox[Klik Checkbox]
    ClickCheckbox --> ToggleDB[UPDATE tasks<br/>SET status = CASE<br/>WHEN status = 'todo'<br/>THEN 'done'<br/>ELSE 'todo']
    ToggleDB --> RefreshList

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style ErrorCreate fill:#ffe1e1
    style ErrorUpdate fill:#ffe1e1
    style ShowSuccess fill:#e1f5e1
```

**Penjelasan:**
- **CREATE**: User mengisi form dan data di-insert ke database
- **READ**: Tasks di-load dengan RLS filter, bisa ditambah filter subject/status/search
- **UPDATE**: User edit task, data di-update dengan trigger auto-update timestamp
- **DELETE**: Soft delete dengan set `deleted_at`, task pindah ke trash
- **TOGGLE**: Checkbox untuk toggle status todo/done

---

## 4. Activity Diagram: Manage Habits

```mermaid
graph TD
    Start([User di Halaman Habits]) --> Choice{Pilih Aksi}
    
    %% CREATE HABIT
    Choice -->|Tambah Habit| ClickAdd[Klik Tambah Habit]
    ClickAdd --> OpenDialog[Buka Dialog Form]
    OpenDialog --> InputTitle[Input Nama Habit]
    InputTitle --> SubmitHabit[Klik Tambah]
    SubmitHabit --> InsertHabit[INSERT INTO habits<br/>current_streak = 0]
    InsertHabit --> RefreshHabits[Refresh Habit List]
    RefreshHabits --> End([Selesai])
    
    %% TOGGLE HABIT LOG
    Choice -->|Toggle Habit| SelectDate[Pilih Tanggal<br/>di Tracker Grid]
    SelectDate --> CheckLog{Log Exists?}
    CheckLog -->|Ya| UpdateLog[UPDATE habit_logs<br/>SET completed = NOT completed]
    CheckLog -->|Tidak| InsertLog[INSERT INTO habit_logs<br/>completed = TRUE]
    UpdateLog --> TriggerStreak[Trigger:<br/>recalculate_habit_streak]
    InsertLog --> TriggerStreak
    TriggerStreak --> CalcStreak[Hitung Streak:<br/>Loop mundur dari hari ini<br/>cek consecutive days]
    CalcStreak --> UpdateStreak[UPDATE habits<br/>SET current_streak = ?]
    UpdateStreak --> RefreshHabits
    
    %% VIEW STATS
    Choice -->|Lihat Stats| CallRPC[Call RPC:<br/>get_habit_stats]
    CallRPC --> JoinTables[JOIN habits<br/>LEFT JOIN habit_logs<br/>untuk completion rate]
    JoinTables --> CalcStats[Hitung:<br/>- Completion Rate<br/>- Longest Streak<br/>- Total Days]
    CalcStats --> DisplayStats[Tampilkan Stats<br/>per Habit]
    DisplayStats --> End
    
    %% DELETE HABIT
    Choice -->|Hapus Habit| SelectHabit[Pilih Habit]
    SelectHabit --> ClickDelete[Klik Hapus]
    ClickDelete --> SoftDeleteHabit[Soft Delete:<br/>UPDATE habits<br/>SET deleted_at = NOW]
    SoftDeleteHabit --> MoveTrash[Habit Pindah ke Trash]
    MoveTrash --> RefreshHabits

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style DisplayStats fill:#e1f5e1
```

**Penjelasan:**
- **CREATE**: User membuat habit baru dengan nama, initial streak = 0
- **TOGGLE**: User centang/uncentang habit di tracker grid
  - Jika log belum ada, insert baru
  - Jika sudah ada, toggle completed status
  - Trigger otomatis recalculate streak
- **STATS**: RPC function join habits dengan habit_logs untuk hitung completion rate
- **DELETE**: Soft delete habit ke trash

---

## 5. Activity Diagram: Soft Delete & Hard Delete

```mermaid
graph TD
    Start([User Ingin Hapus Item]) --> TypeChoice{Tipe Item?}
    
    %% SOFT DELETE FLOW
    TypeChoice -->|Task/Habit| ClickDelete[Klik Tombol Hapus]
    ClickDelete --> CallSoftDelete[Call Function:<br/>soft_delete_task atau<br/>soft_delete_habit]
    CallSoftDelete --> UpdateDeleted[UPDATE table<br/>SET deleted_at = NOW<br/>WHERE id = ? AND user_id = auth.uid]
    UpdateDeleted --> HideFromMain[Item Hilang dari<br/>Halaman Utama]
    HideFromMain --> ShowInTrash[Item Muncul di<br/>Halaman Trash]
    ShowInTrash --> TrashChoice{User di Trash<br/>Pilih Aksi}
    
    %% RESTORE FLOW
    TrashChoice -->|Restore| ClickRestore[Klik Kembalikan]
    ClickRestore --> CallRestore[Call Function:<br/>restore_task atau<br/>restore_habit]
    CallRestore --> UpdateRestore[UPDATE table<br/>SET deleted_at = NULL<br/>WHERE id = ? AND user_id = auth.uid]
    UpdateRestore --> BackToMain[Item Kembali ke<br/>Halaman Utama]
    BackToMain --> End([Selesai])
    
    %% PERMANENT DELETE FLOW
    TrashChoice -->|Hapus Permanen| ClickPermanent[Klik Hapus Permanen]
    ClickPermanent --> ShowConfirm[Tampilkan Dialog<br/>Konfirmasi:<br/>Tindakan tidak dapat<br/>dibatalkan]
    ShowConfirm --> UserConfirm{User Konfirmasi?}
    UserConfirm -->|Tidak| CancelDelete[Batal Hapus]
    CancelDelete --> ShowInTrash
    UserConfirm -->|Ya| CallPermanent[Call Function:<br/>permanent_delete_task atau<br/>permanent_delete_habit]
    CallPermanent --> DeleteDB[DELETE FROM table<br/>WHERE id = ? AND user_id = auth.uid]
    DeleteDB --> CascadeDelete[Cascade Delete:<br/>Related Records<br/>Terhapus Otomatis]
    CascadeDelete --> RemoveFromTrash[Item Hilang dari Trash]
    RemoveFromTrash --> ShowSuccess[Tampilkan Toast:<br/>Berhasil Dihapus Permanen]
    ShowSuccess --> End

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style ShowConfirm fill:#fff3cd
    style DeleteDB fill:#ffe1e1
    style ShowSuccess fill:#e1f5e1
```

**Penjelasan:**
- **SOFT DELETE**: 
  - Set `deleted_at = NOW()`
  - Item hilang dari halaman utama
  - Item muncul di trash
  - Data masih ada di database
  
- **RESTORE**:
  - Set `deleted_at = NULL`
  - Item kembali ke halaman utama
  - Reversible action
  
- **HARD DELETE**:
  - Tampilkan konfirmasi dialog
  - DELETE FROM database
  - Cascade delete untuk related records (habit_logs)
  - Irreversible action

---

## 6. Activity Diagram: Search & Filter Tasks

```mermaid
graph TD
    Start([User di Halaman Tasks]) --> LoadAll[Load Semua Tasks<br/>dari Database]
    LoadAll --> ApplyRLS[Apply RLS Filter:<br/>WHERE user_id = auth.uid<br/>AND deleted_at IS NULL]
    ApplyRLS --> DisplayInitial[Tampilkan Semua Tasks]
    DisplayInitial --> UserAction{User Action}
    
    %% SEARCH FLOW
    UserAction -->|Ketik di Search Box| InputSearch[User Mengetik Query]
    InputSearch --> SearchFilter[Filter Client-Side:<br/>WHERE LOWER title LIKE %query%<br/>OR LOWER description LIKE %query%]
    SearchFilter --> UpdateDisplay[Update Display<br/>Real-time]
    UpdateDisplay --> CheckResults{Ada Hasil?}
    CheckResults -->|Ya| ShowResults[Tampilkan Tasks<br/>yang Match]
    CheckResults -->|Tidak| ShowEmpty[Tampilkan Empty State:<br/>Tidak ada hasil<br/>untuk query]
    ShowResults --> UserAction
    ShowEmpty --> UserAction
    
    %% FILTER BY SUBJECT
    UserAction -->|Pilih Subject| SelectSubject[User Pilih<br/>Mata Kuliah dari Dropdown]
    SelectSubject --> SubjectFilter[Filter Client-Side:<br/>WHERE subject = selected]
    SubjectFilter --> UpdateDisplay
    
    %% FILTER BY STATUS
    UserAction -->|Pilih Status| SelectStatus[User Pilih Status:<br/>- All<br/>- Todo<br/>- Done]
    SelectStatus --> StatusFilter[Filter Client-Side:<br/>WHERE status = selected]
    StatusFilter --> UpdateDisplay
    
    %% COMBINED FILTERS
    UserAction -->|Multiple Filters| CombineFilters[Kombinasi Filters:<br/>Search AND Subject AND Status]
    CombineFilters --> ApplyAll[Apply Semua Filter<br/>Secara Bersamaan]
    ApplyAll --> UpdateDisplay
    
    %% CLEAR FILTERS
    UserAction -->|Clear| ClearAll[Clear Semua Filter]
    ClearAll --> DisplayInitial
    
    UserAction -->|Selesai| End([Selesai])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style ShowEmpty fill:#fff3cd
    style ShowResults fill:#e1f5e1
```

**Penjelasan:**
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
    Start([User Klik Menu Analytics]) --> LoadPage[Load Analytics Page]
    LoadPage --> ParallelFetch{Fetch Data Paralel}
    
    %% DASHBOARD SUMMARY
    ParallelFetch -->|Query 1| CallSummary[Call RPC:<br/>get_dashboard_summary]
    CallSummary --> CalcSummary[Hitung:<br/>- Total Tasks<br/>- Completed Tasks<br/>- Pending Tasks<br/>- Overdue Tasks<br/>- Total Habits<br/>- Total Streak]
    CalcSummary --> DisplayCards[Tampilkan Stats Cards]
    
    %% WEEKLY STATS
    ParallelFetch -->|Query 2| CallWeekly[Call RPC:<br/>get_weekly_task_stats]
    CallWeekly --> JoinWeekly[LEFT JOIN tasks<br/>dengan generate_series<br/>7 hari terakhir]
    JoinWeekly --> GroupByDate[GROUP BY date<br/>COUNT completed tasks]
    GroupByDate --> DisplayChart[Tampilkan Bar Chart:<br/>Progress Tugas Mingguan]
    
    %% SUBJECT STATS
    ParallelFetch -->|Query 3| CallSubject[Call RPC:<br/>get_subject_task_stats]
    CallSubject --> GroupBySubject[GROUP BY subject<br/>Hitung total, completed,<br/>pending, overdue]
    GroupBySubject --> CalcCompletion[Hitung Completion Rate<br/>per Subject]
    CalcCompletion --> DisplayProgress[Tampilkan Progress Bars<br/>per Mata Kuliah]
    
    %% HABIT STATS
    ParallelFetch -->|Query 4| CallHabit[Call RPC:<br/>get_habit_stats]
    CallHabit --> JoinHabitLogs[JOIN habits<br/>LEFT JOIN habit_logs<br/>30 hari terakhir]
    JoinHabitLogs --> CalcHabitStats[Hitung:<br/>- Current Streak<br/>- Longest Streak<br/>- Completion Rate<br/>- Total Days]
    CalcHabitStats --> DisplayHabitChart[Tampilkan:<br/>- Avg Completion Rate<br/>- Per-Habit Progress]
    
    %% PRIORITY BREAKDOWN
    ParallelFetch -->|Query 5| LoadTasks[Load All Tasks]
    LoadTasks --> GroupByPriority[Group by Priority:<br/>- High<br/>- Medium<br/>- Low]
    GroupByPriority --> DisplayPriority[Tampilkan Priority Cards<br/>dengan Count]
    
    %% COMBINE ALL
    DisplayCards --> WaitAll[Wait All Queries]
    DisplayChart --> WaitAll
    DisplayProgress --> WaitAll
    DisplayHabitChart --> WaitAll
    DisplayPriority --> WaitAll
    
    WaitAll --> RenderComplete[Render Complete<br/>Analytics Dashboard]
    RenderComplete --> UserInteract{User Interaksi}
    
    UserInteract -->|Hover Chart| ShowTooltip[Tampilkan Tooltip<br/>Detail Data]
    ShowTooltip --> UserInteract
    
    UserInteract -->|Refresh| LoadPage
    
    UserInteract -->|Selesai| End([Selesai])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style RenderComplete fill:#e1f5e1
```

**Penjelasan:**
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
    Start([Sistem Notifikasi Aktif]) --> ParallelCron{Cron Jobs Berjalan Paralel}
    
    %% DEADLINE NOTIFICATION CRON
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
    
    %% URGENT DEADLINE CRON
    ParallelCron -->|Every 6 Hours| CronUrgent[Cron: check-urgent-deadlines<br/>Berjalan Setiap 6 Jam]
    CronUrgent --> QueryUrgent[Query Tasks:<br/>WHERE due_date <= NOW + 6 hours<br/>AND status != 'done'<br/>AND deleted_at IS NULL]
    QueryUrgent --> CheckUrgentTasks{Ada Tasks<br/>Urgent?}
    CheckUrgentTasks -->|Tidak| EndUrgent([Selesai - Urgent])
    CheckUrgentTasks -->|Ya| LoopUrgentTasks[Loop Setiap Task]
    LoopUrgentTasks --> GetUrgentPrefs[Get User Preferences:<br/>deadline_reminders enabled?]
    GetUrgentPrefs --> CheckUrgentEnabled{Enabled?}
    CheckUrgentEnabled -->|Tidak| NextUrgentTask[Next Task]
    CheckUrgentEnabled -->|Ya| GetUrgentTokens[Get FCM Tokens]
    GetUrgentTokens --> CheckUrgentTokens{Ada Token?}
    CheckUrgentTokens -->|Tidak| NextUrgentTask
    CheckUrgentTokens -->|Ya| SendUrgentNotif[Send Push Notification:<br/>URGENT Deadline 6 jam lagi]
    SendUrgentNotif --> SaveUrgentHistory[INSERT INTO notifications<br/>type = 'deadline']
    SaveUrgentHistory --> UpdateUrgentToken[UPDATE last_used_at]
    UpdateUrgentToken --> NextUrgentTask
    NextUrgentTask --> CheckMoreUrgent{Ada Task Lagi?}
    CheckMoreUrgent -->|Ya| LoopUrgentTasks
    CheckMoreUrgent -->|Tidak| EndUrgent
    
    %% HABIT REMINDER CRON
    ParallelCron -->|Daily at User Time| CronHabit[Cron: check-habits<br/>Berjalan Sesuai<br/>User reminder_time]
    CronHabit --> QueryHabits[Query Habits:<br/>WHERE deleted_at IS NULL<br/>AND user active]
    QueryHabits --> CheckHabits{Ada Habits?}
    CheckHabits -->|Tidak| EndHabit([Selesai - Habit])
    CheckHabits -->|Ya| LoopHabits[Loop Setiap Habit]
    LoopHabits --> CheckHabitLog[Check habit_logs:<br/>Sudah complete hari ini?]
    CheckHabitLog --> IsCompleted{Completed?}
    IsCompleted -->|Ya| NextHabit[Next Habit]
    IsCompleted -->|Tidak| GetHabitPrefs[Get User Preferences:<br/>habit_reminders enabled?]
    GetHabitPrefs --> CheckHabitEnabled{Enabled?}
    CheckHabitEnabled -->|Tidak| NextHabit
    CheckHabitEnabled -->|Ya| GetHabitTokens[Get FCM Tokens]
    GetHabitTokens --> CheckHabitTokens{Ada Token?}
    CheckHabitTokens -->|Tidak| NextHabit
    CheckHabitTokens -->|Ya| SendHabitNotif[Send Push Notification:<br/>Jangan lupa habit X hari ini]
    SendHabitNotif --> SaveHabitHistory[INSERT INTO notifications<br/>type = 'habit_reminder']
    SaveHabitHistory --> UpdateHabitToken[UPDATE last_used_at]
    UpdateHabitToken --> NextHabit
    NextHabit --> CheckMoreHabits{Ada Habit Lagi?}
    CheckMoreHabits -->|Ya| LoopHabits
    CheckMoreHabits -->|Tidak| EndHabit
    
    %% TOKEN CLEANUP CRON
    ParallelCron -->|Weekly| CronCleanup[Cron: cleanup-tokens<br/>Berjalan Setiap Minggu]
    CronCleanup --> QueryOldTokens[Query FCM Tokens:<br/>WHERE last_used_at < NOW - 30 days]
    QueryOldTokens --> CheckOldTokens{Ada Token Lama?}
    CheckOldTokens -->|Tidak| EndCleanup([Selesai - Cleanup])
    CheckOldTokens -->|Ya| DeleteOldTokens[DELETE FROM fcm_tokens<br/>WHERE last_used_at < NOW - 30 days]
    DeleteOldTokens --> LogCleanup[Log: X tokens dihapus]
    LogCleanup --> EndCleanup
    
    %% REAL-TIME NOTIFICATIONS
    ParallelCron -->|Real-time| RealTimeEvents[Event-Driven Notifications]
    RealTimeEvents --> EventChoice{Event Type}
    
    EventChoice -->|Task Complete| TaskDone[User Mark Task as Done]
    TaskDone --> CheckTaskNotif[Check Preferences:<br/>task_complete enabled?]
    CheckTaskNotif --> TaskNotifEnabled{Enabled?}
    TaskNotifEnabled -->|Ya| SendTaskNotif[Send Notification:<br/>Selamat task X selesai]
    TaskNotifEnabled -->|Tidak| EndRealTime([Selesai - Real-time])
    SendTaskNotif --> SaveTaskNotif[INSERT INTO notifications<br/>type = 'task_complete']
    SaveTaskNotif --> EndRealTime
    
    EventChoice -->|Streak Milestone| StreakAchieved[User Reach Streak Milestone<br/>7, 30, 100 days]
    StreakAchieved --> CheckStreakNotif[Check Preferences:<br/>streak_milestones enabled?]
    CheckStreakNotif --> StreakNotifEnabled{Enabled?}
    StreakNotifEnabled -->|Ya| SendStreakNotif[Send Notification:<br/>Streak X hari tercapai]
    StreakNotifEnabled -->|Tidak| EndRealTime
    SendStreakNotif --> SaveStreakNotif[INSERT INTO notifications<br/>type = 'streak_milestone']
    SaveStreakNotif --> EndRealTime

    style Start fill:#e1f5e1
    style EndDeadline fill:#e1f5e1
    style EndUrgent fill:#e1f5e1
    style EndHabit fill:#e1f5e1
    style EndCleanup fill:#e1f5e1
    style EndRealTime fill:#e1f5e1
    style CronDeadline fill:#d1ecf1
    style CronUrgent fill:#fff3cd
    style CronHabit fill:#d4edda
    style CronCleanup fill:#f8d7da
```

**Penjelasan:**
- **4 Cron Jobs** berjalan paralel untuk automated notifications
- **Deadline Notification**: Cek tasks yang deadline besok, kirim notif pukul 8 pagi
- **Urgent Deadline**: Cek tasks yang deadline dalam 6 jam, kirim notif setiap 6 jam
- **Habit Reminder**: Cek habits yang belum complete hari ini, kirim sesuai user's reminder_time
- **Token Cleanup**: Hapus FCM tokens yang tidak digunakan >30 hari (weekly)
- **Real-time Notifications**: Event-driven untuk task complete dan streak milestone
- Semua notifikasi cek user preferences terlebih dahulu
- History disimpan di tabel `notifications`

---

## 9. Activity Diagram: Enable Push Notifications

```mermaid
graph TD
    Start([User Buka Aplikasi]) --> CheckPermission{Browser Support<br/>Push Notifications?}
    CheckPermission -->|Tidak| ShowUnsupported[Tampilkan Pesan:<br/>Browser tidak support<br/>push notifications]
    ShowUnsupported --> End([Selesai])
    
    CheckPermission -->|Ya| CheckExisting{FCM Token<br/>Sudah Ada?}
    CheckExisting -->|Ya| TokenValid[Token Valid<br/>Notifikasi Aktif]
    TokenValid --> End
    
    CheckExisting -->|Tidak| ShowPrompt[Tampilkan Prompt:<br/>Aktifkan Notifikasi?]
    ShowPrompt --> UserChoice{User Klik<br/>Aktifkan?}
    UserChoice -->|Tidak| Dismiss[User Dismiss Prompt]
    Dismiss --> End
    
    UserChoice -->|Ya| RequestPermission[Request Browser Permission:<br/>Notification.requestPermission]
    RequestPermission --> BrowserPrompt[Browser Tampilkan<br/>Native Permission Dialog]
    BrowserPrompt --> PermissionResult{User Response}
    
    PermissionResult -->|Denied| ShowDenied[Tampilkan Pesan:<br/>Notifikasi diblokir<br/>Cara enable di settings]
    ShowDenied --> End
    
    PermissionResult -->|Granted| InitFirebase[Initialize Firebase<br/>Cloud Messaging]
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
    
    UpdateExisting --> ShowSuccess[Tampilkan Toast:<br/>Notifikasi berhasil diaktifkan]
    InsertNew --> ShowSuccess
    ShowSuccess --> SendTestNotif[Kirim Test Notification:<br/>Selamat datang di FlowDay]
    SendTestNotif --> End

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style ShowSuccess fill:#e1f5e1
    style ShowDenied fill:#ffe1e1
    style ShowError fill:#ffe1e1
    style ShowUnsupported fill:#fff3cd
```

**Penjelasan:**
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
    
    FCMResponse -->|Error: Invalid Token| LogInvalidToken[Log: Invalid token detected]
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
    Start([User Buka Settings]) --> ClickNotif[Klik Tab<br/>Notification Settings]
    ClickNotif --> LoadPrefs[Load Current Preferences:<br/>SELECT * FROM notification_preferences<br/>WHERE user_id = auth.uid]
    LoadPrefs --> CheckExists{Preferences<br/>Exists?}
    
    CheckExists -->|Tidak| CreateDefault[Create Default Preferences:<br/>INSERT INTO notification_preferences<br/>All enabled, reminder_time = 20:00]
    CheckExists -->|Ya| DisplayForm[Tampilkan Form dengan<br/>Current Values]
    CreateDefault --> DisplayForm
    
    DisplayForm --> UserModify{User Modifikasi<br/>Settings}
    
    %% TOGGLE DEADLINE REMINDERS
    UserModify -->|Toggle Deadline| ToggleDeadline[Toggle Switch:<br/>deadline_reminders]
    ToggleDeadline --> UpdateDeadline[Update State:<br/>deadline_reminders = !current]
    UpdateDeadline --> UserModify
    
    %% TOGGLE HABIT REMINDERS
    UserModify -->|Toggle Habit| ToggleHabit[Toggle Switch:<br/>habit_reminders]
    ToggleHabit --> UpdateHabit[Update State:<br/>habit_reminders = !current]
    UpdateHabit --> UserModify
    
    %% TOGGLE STREAK MILESTONES
    UserModify -->|Toggle Streak| ToggleStreak[Toggle Switch:<br/>streak_milestones]
    ToggleStreak --> UpdateStreak[Update State:<br/>streak_milestones = !current]
    UpdateStreak --> UserModify
    
    %% TOGGLE TASK COMPLETE
    UserModify -->|Toggle Task Complete| ToggleTask[Toggle Switch:<br/>task_complete]
    ToggleTask --> UpdateTask[Update State:<br/>task_complete = !current]
    UpdateTask --> UserModify
    
    %% CHANGE REMINDER TIME
    UserModify -->|Change Time| SelectTime[Select Time Picker:<br/>Pilih Waktu Pengingat]
    SelectTime --> UpdateTime[Update State:<br/>reminder_time = selected]
    UpdateTime --> UserModify
    
    %% SAVE CHANGES
    UserModify -->|Klik Simpan| ValidateForm{Form Valid?}
    ValidateForm -->|Tidak| ShowValidationError[Tampilkan Error:<br/>Waktu harus valid]
    ShowValidationError --> UserModify
    
    ValidateForm -->|Ya| SaveToDB[UPDATE notification_preferences<br/>SET deadline_reminders = ?<br/>habit_reminders = ?<br/>streak_milestones = ?<br/>task_complete = ?<br/>reminder_time = ?<br/>updated_at = NOW<br/>WHERE user_id = auth.uid]
    SaveToDB --> TriggerUpdate[Database Trigger:<br/>Update updated_at timestamp]
    TriggerUpdate --> InvalidateCache[Invalidate React Query Cache:<br/>Refetch preferences]
    InvalidateCache --> ShowSuccess[Tampilkan Toast:<br/>Pengaturan berhasil disimpan]
    ShowSuccess --> UpdateUI[Update UI dengan<br/>New Preferences]
    UpdateUI --> End([Selesai])
    
    %% CANCEL
    UserModify -->|Klik Batal| ConfirmCancel{Ada Perubahan<br/>Belum Disimpan?}
    ConfirmCancel -->|Tidak| End
    ConfirmCancel -->|Ya| ShowConfirm[Tampilkan Dialog:<br/>Buang perubahan?]
    ShowConfirm --> UserConfirm{User Konfirmasi?}
    UserConfirm -->|Tidak| UserModify
    UserConfirm -->|Ya| ResetForm[Reset Form ke<br/>Original Values]
    ResetForm --> End

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style ShowSuccess fill:#e1f5e1
    style ShowValidationError fill:#ffe1e1
    style ShowConfirm fill:#fff3cd
```

**Penjelasan:**
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
    Start([User Buka Aplikasi]) --> CheckAuth{User<br/>Authenticated?}
    
    %% NOT AUTHENTICATED
    CheckAuth -->|Tidak| Landing[Tampilkan Landing Page]
    Landing --> AuthChoice{Pilih Aksi}
    AuthChoice -->|Login| LoginFlow[Proses Login]
    AuthChoice -->|Register| RegisterFlow[Proses Register]
    
    LoginFlow --> ValidateLogin{Login Valid?}
    ValidateLogin -->|Tidak| Landing
    ValidateLogin -->|Ya| CreateSession[Create Session<br/>& Set Cookie]
    
    RegisterFlow --> ValidateRegister{Register Valid?}
    ValidateRegister -->|Tidak| Landing
    ValidateRegister -->|Ya| CreateUser[Create User<br/>& Profile]
    CreateUser --> LoginFlow
    
    %% AUTHENTICATED
    CheckAuth -->|Ya| Middleware[Middleware:<br/>Validate Session]
    CreateSession --> Middleware
    Middleware --> CheckSession{Session Valid?}
    CheckSession -->|Tidak| Logout[Clear Session]
    Logout --> Landing
    
    CheckSession -->|Ya| LoadDashboard[Load Dashboard]
    LoadDashboard --> FetchUserData[Fetch User Data<br/>dengan RLS Filter]
    FetchUserData --> DisplayDash[Tampilkan Dashboard]
    
    DisplayDash --> MainMenu{User Pilih Menu}
    
    %% DASHBOARD
    MainMenu -->|Dashboard| ShowOverview[Tampilkan Overview:<br/>- Stats Cards<br/>- Recent Tasks<br/>- Habit Summary]
    ShowOverview --> MainMenu
    
    %% TASKS
    MainMenu -->|Tasks| TasksPage[Halaman Tasks]
    TasksPage --> TaskAction{Pilih Aksi}
    TaskAction -->|CRUD| TaskCRUD[Create/Read/<br/>Update/Delete Task]
    TaskAction -->|Search| TaskSearch[Search & Filter Tasks]
    TaskAction -->|Soft Delete| TaskTrash[Pindah ke Trash]
    TaskCRUD --> TasksPage
    TaskSearch --> TasksPage
    TaskTrash --> TasksPage
    TaskAction -->|Back| MainMenu
    
    %% HABITS
    MainMenu -->|Habits| HabitsPage[Halaman Habits]
    HabitsPage --> HabitAction{Pilih Aksi}
    HabitAction -->|Create| CreateHabit[Tambah Habit Baru]
    HabitAction -->|Toggle| ToggleHabit[Toggle Habit Log<br/>& Recalc Streak]
    HabitAction -->|View Stats| HabitStats[Lihat Habit Stats]
    HabitAction -->|Delete| HabitTrash[Pindah ke Trash]
    CreateHabit --> HabitsPage
    ToggleHabit --> HabitsPage
    HabitStats --> HabitsPage
    HabitTrash --> HabitsPage
    HabitAction -->|Back| MainMenu
    
    %% ANALYTICS
    MainMenu -->|Analytics| AnalyticsPage[Halaman Analytics]
    AnalyticsPage --> FetchAnalytics[Fetch Multiple Stats<br/>Paralel via RPC]
    FetchAnalytics --> RenderCharts[Render Charts:<br/>- Weekly Progress<br/>- Subject Breakdown<br/>- Habit Stats<br/>- Priority Distribution]
    RenderCharts --> AnalyticsPage
    AnalyticsPage -->|Back| MainMenu
    
    %% TRASH
    MainMenu -->|Trash| TrashPage[Halaman Trash]
    TrashPage --> TrashAction{Pilih Aksi}
    TrashAction -->|Restore| RestoreItem[Restore Item<br/>SET deleted_at = NULL]
    TrashAction -->|Hard Delete| PermanentDelete[Permanent Delete<br/>dengan Konfirmasi]
    RestoreItem --> TrashPage
    PermanentDelete --> TrashPage
    TrashAction -->|Back| MainMenu
    
    %% SETTINGS
    MainMenu -->|Settings| SettingsPage[Halaman Settings]
    SettingsPage --> SettingsAction{Pilih Aksi}
    SettingsAction -->|Profile| EditProfile[Edit Profile]
    SettingsAction -->|Subjects| ManageSubjects[Kelola Mata Kuliah]
    SettingsAction -->|Theme| ToggleTheme[Toggle Dark/Light Mode]
    EditProfile --> SettingsPage
    ManageSubjects --> SettingsPage
    ToggleTheme --> SettingsPage
    SettingsAction -->|Back| MainMenu
    
    %% LOGOUT
    MainMenu -->|Logout| ConfirmLogout{Konfirmasi<br/>Logout?}
    ConfirmLogout -->|Tidak| MainMenu
    ConfirmLogout -->|Ya| ClearSession[Clear Session<br/>& Cache]
    ClearSession --> RedirectLogin[Redirect ke Login]
    RedirectLogin --> Landing
    
    MainMenu -->|Close App| End([Selesai])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style DisplayDash fill:#e1f5e1
    style RenderCharts fill:#e1f5e1
```

**Penjelasan Complete Flow:**
1. **Authentication Check**: Middleware validasi session
2. **Landing/Auth**: Login atau register untuk user baru
3. **Dashboard**: Overview stats dan recent activities
4. **Tasks Management**: CRUD, search, filter, soft delete
5. **Habits Management**: Create, toggle, view stats, soft delete
6. **Analytics**: Multiple RPC queries untuk charts dan stats
7. **Trash**: Restore atau permanent delete items
8. **Settings**: Edit profile, manage subjects, toggle theme
9. **Logout**: Clear session dan redirect ke login

---
