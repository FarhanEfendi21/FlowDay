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
8. [Activity Diagram: Complete System Flow](#8-activity-diagram-complete-system-flow)

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

## 8. Activity Diagram: Complete System Flow

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

## 📊 SUMMARY

### Total Activity Diagrams: 8 Diagrams

1. ✅ **User Registration** - Proses pendaftaran user baru
2. ✅ **User Login** - Proses autentikasi dan session management
3. ✅ **Manage Tasks (CRUD)** - Create, Read, Update, Delete, Toggle tasks
4. ✅ **Manage Habits** - Create, toggle, view stats, delete habits
5. ✅ **Soft Delete & Hard Delete** - Trash management dengan restore
6. ✅ **Search & Filter Tasks** - Real-time search dan multiple filters
7. ✅ **View Analytics** - Parallel queries untuk dashboard analytics
8. ✅ **Complete System Flow** - End-to-end user journey

### Key Features Covered:
- ✅ Authentication & Authorization
- ✅ CRUD Operations
- ✅ Soft Delete & Hard Delete
- ✅ Search & Filter
- ✅ JOIN Queries (via RPC)
- ✅ Row Level Security (RLS)
- ✅ Database Triggers
- ✅ Real-time Updates
- ✅ Error Handling
- ✅ User Experience Flow

---

## 🎨 Diagram Format

Semua diagram menggunakan **Mermaid syntax** yang bisa di-render di:
- GitHub
- GitLab
- VS Code (dengan extension)
- Online tools: mermaid.live, mermaid-js.github.io

### Color Legend:
- 🟢 **Hijau** (#e1f5e1): Start, End, Success states
- 🔴 **Merah** (#ffe1e1): Error states, Delete operations
- 🟡 **Kuning** (#fff3cd): Warning, Confirmation dialogs

---

**Dibuat pada**: 1 Mei 2026  
**Project**: FlowDay - Task & Habit Management System  
**Format**: Mermaid Flowchart Diagrams
