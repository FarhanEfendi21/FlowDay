# 📊 PENJELASAN ERD & 2 AKTOR - FlowDay Project

## ❓ Pertanyaan: "ERD hanya menjelaskan 1 aktor saja?"

**Jawaban**: Tidak! FlowDay memiliki **2 aktor yang jelas**. Mari saya jelaskan dengan detail.

---

## 🎭 DEFINISI 2 AKTOR

### **Aktor 1: MAHASISWA (User)**
**Tipe**: Human Actor / External Entity  
**Role**: End User yang menggunakan aplikasi

**Aktivitas:**
- ✅ Register dan Login ke sistem
- ✅ Membuat tugas baru (CREATE tasks)
- ✅ Melihat daftar tugas (READ tasks)
- ✅ Mengubah tugas (UPDATE tasks)
- ✅ Menghapus tugas (DELETE tasks - soft & hard)
- ✅ Membuat habit baru (CREATE habits)
- ✅ Toggle habit harian (UPDATE habit_logs)
- ✅ Melihat analytics dan statistik
- ✅ Mengelola mata kuliah
- ✅ Mengatur profil

**Cara Interaksi**: Via Web Browser (UI)

---

### **Aktor 2: SYSTEM (Database/Backend)**
**Tipe**: System Actor / Internal Entity  
**Role**: Automated processes yang berjalan di background

**Aktivitas:**
- ✅ **Auto-create profile** saat user registrasi (Database Trigger)
- ✅ **Auto-calculate streak** saat habit di-toggle (Database Trigger)
- ✅ **Auto-update timestamp** saat data berubah (Database Trigger)
- ✅ **Enforce security** via Row Level Security (RLS Policies)
- ✅ **Execute analytics** via server-side functions (RPC)
- ✅ **Cascade delete** related records (Foreign Key Constraints)
- ✅ **Validate data** via CHECK constraints

**Cara Interaksi**: Otomatis via Database Layer

---

## 📋 BUKTI IMPLEMENTASI 2 AKTOR

### Bukti Aktor 1 (Mahasiswa):

#### 1. **Login & Register**
```typescript
// File: app/login/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  await signIn({ email, password })  // User action
  router.push("/dashboard")
}
```

#### 2. **CRUD Tasks**
```typescript
// File: app/dashboard/tasks/page.tsx
// User creates task
const handleCreate = (data: CreateTaskInput) => {
  createTask.mutate(data)  // User action
}

// User updates task
const handleUpdate = (data: UpdateTaskInput) => {
  updateTask.mutate({ id, input: data })  // User action
}

// User deletes task
const handleDelete = (id: string) => {
  deleteTask.mutate(id)  // User action
}
```

#### 3. **Toggle Habit**
```typescript
// File: app/dashboard/habits/page.tsx
const handleToggle = (habitId: string, date: string) => {
  toggleHabit.mutate({ habitId, date })  // User action
}
```

---

### Bukti Aktor 2 (System):

#### 1. **Auto-Create Profile (Database Trigger)**
```sql
-- File: supabase/migrations/001_initial_schema.sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $
BEGIN
  -- SYSTEM automatically creates profile
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$;

-- Trigger: SYSTEM action
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Penjelasan**: Ketika **Mahasiswa** (Aktor 1) melakukan registrasi, **System** (Aktor 2) otomatis membuat profile tanpa intervensi user.

#### 2. **Auto-Calculate Streak (Database Trigger)**
```sql
-- File: supabase/migrations/001_initial_schema.sql
CREATE OR REPLACE FUNCTION public.recalculate_habit_streak(p_habit_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $
DECLARE
  v_streak INT := 0;
  v_check  DATE := CURRENT_DATE;
BEGIN
  -- SYSTEM automatically calculates streak
  FOR v_log IN
    SELECT log_date FROM public.habit_logs
    WHERE habit_id = p_habit_id AND completed = TRUE
    ORDER BY log_date DESC
  LOOP
    IF v_log.log_date = v_check THEN
      v_streak := v_streak + 1;
      v_check  := v_check - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;

  UPDATE public.habits
  SET current_streak = v_streak
  WHERE id = p_habit_id;
END;
$;

-- Trigger: SYSTEM action
CREATE TRIGGER trg_habit_log_streak
  AFTER INSERT OR UPDATE OR DELETE ON public.habit_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_habit_log_change();
```

**Penjelasan**: Ketika **Mahasiswa** (Aktor 1) toggle habit, **System** (Aktor 2) otomatis menghitung streak tanpa user perlu klik tombol "hitung streak".

#### 3. **Auto-Update Timestamp (Database Trigger)**
```sql
-- File: supabase/migrations/001_initial_schema.sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $
BEGIN
  -- SYSTEM automatically updates timestamp
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$;

-- Trigger: SYSTEM action
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

**Penjelasan**: Setiap kali **Mahasiswa** (Aktor 1) update task, **System** (Aktor 2) otomatis set `updated_at` timestamp.

#### 4. **Row Level Security (RLS)**
```sql
-- File: supabase/migrations/001_initial_schema.sql
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- SYSTEM enforces security policy
CREATE POLICY "Users can view own tasks" 
  ON public.tasks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" 
  ON public.tasks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

**Penjelasan**: **System** (Aktor 2) otomatis memfilter data sehingga **Mahasiswa** (Aktor 1) hanya bisa lihat data miliknya sendiri.

---

## 🎨 ERD DIAGRAM dengan 2 AKTOR

```
┌─────────────────────────────────────────────────────────────┐
│                    AKTOR 1: MAHASISWA                       │
│                   (Human Actor / User)                      │
│                                                             │
│  Actions:                                                   │
│  • Login/Register                                           │
│  • CRUD Tasks                                               │
│  • CRUD Habits                                              │
│  • Toggle Habit Logs                                        │
│  • View Analytics                                           │
│  • Manage Subjects                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Interacts via Web UI
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ auth.users   │  │  profiles    │  │user_subjects │     │
│  │ (id, email)  │──│ (id, name)   │  │(id, name)    │     │
│  └──────┬───────┘  └──────────────┘  └──────────────┘     │
│         │                                                   │
│         ├────────────────┬──────────────────┐              │
│         │                │                  │              │
│  ┌──────▼───────┐ ┌──────▼───────┐  ┌──────▼───────┐     │
│  │    tasks     │ │   habits     │  │ habit_logs   │     │
│  │ (id, title,  │ │ (id, title,  │  │(id, date,    │     │
│  │  user_id,    │ │  user_id,    │  │ habit_id,    │     │
│  │  deleted_at) │ │  streak,     │  │ completed)   │     │
│  └──────────────┘ │  deleted_at) │  └──────────────┘     │
│                   └──────────────┘                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Automated Actions
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 AKTOR 2: SYSTEM                             │
│              (System Actor / Automated)                     │
│                                                             │
│  Automated Actions:                                         │
│  • Trigger: handle_new_user() → Auto-create profile        │
│  • Trigger: recalculate_habit_streak() → Auto-calc streak  │
│  • Trigger: handle_updated_at() → Auto-update timestamp    │
│  • RLS Policies → Enforce data isolation                   │
│  • RPC Functions → Execute analytics queries               │
│  • Foreign Keys → Cascade delete related records           │
│  • CHECK Constraints → Validate data integrity             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 PENJELASAN UNTUK DOSEN

### Mengapa System dianggap sebagai Aktor?

Dalam **modern database design** dan **ERD best practices**, **System** dianggap sebagai aktor karena:

1. **Memiliki Behavior Sendiri**: System melakukan actions tanpa trigger dari user
2. **Autonomous**: Triggers dan functions berjalan otomatis
3. **Business Logic**: System mengimplementasikan business rules (streak calculation, RLS)
4. **Interacts with Data**: System membaca dan menulis data ke database

### Contoh Analogi:

**Sistem Perpustakaan:**
- **Aktor 1**: Mahasiswa (pinjam buku, kembalikan buku)
- **Aktor 2**: System (auto-calculate denda, auto-send reminder email)

**Sistem FlowDay:**
- **Aktor 1**: Mahasiswa (create task, toggle habit)
- **Aktor 2**: System (auto-calculate streak, auto-enforce security)

---

## 🎯 KESIMPULAN

### ✅ FlowDay MEMILIKI 2 AKTOR yang JELAS:

| Aktor | Tipe | Jumlah Actions | Bukti Implementasi |
|-------|------|----------------|-------------------|
| **Mahasiswa** | Human Actor | 10+ actions | Login, CRUD Tasks, CRUD Habits, View Analytics |
| **System** | System Actor | 7+ automated actions | Triggers, RLS, RPC Functions, Constraints |

### 📝 Untuk Presentasi:

**Slide 1: Pengenalan 2 Aktor**
- Aktor 1: Mahasiswa (User yang menggunakan aplikasi)
- Aktor 2: System (Automated processes di background)

**Slide 2: Contoh Interaksi**
- Mahasiswa register → System auto-create profile
- Mahasiswa toggle habit → System auto-calculate streak
- Mahasiswa query data → System enforce RLS

**Slide 3: Bukti Kode**
- Tunjukkan trigger `handle_new_user()`
- Tunjukkan trigger `recalculate_habit_streak()`
- Tunjukkan RLS policies

---

## 💡 TIPS MENJAWAB PERTANYAAN DOSEN

**Q: "Kok System bisa jadi aktor?"**

**A**: "Pak/Bu, dalam sistem modern, System dianggap sebagai aktor karena memiliki behavior autonomous. Contohnya, saat mahasiswa toggle habit, System otomatis menghitung streak tanpa user perlu klik tombol lagi. Ini diimplementasikan via database triggers yang berjalan otomatis."

**Q: "Bisa tunjukkan bukti 2 aktor di kode?"**

**A**: "Bisa Pak/Bu. Ini contohnya:
1. **Aktor Mahasiswa**: File `app/dashboard/habits/page.tsx` line XX - user klik toggle
2. **Aktor System**: File `supabase/migrations/001_initial_schema.sql` line XX - trigger auto-calculate streak"

**Q: "Kenapa tidak pakai Admin sebagai aktor kedua?"**

**A**: "Untuk scope Tugas Akhir ini, kami fokus ke single-user application dengan automated system. Tapi untuk future enhancement, kami bisa tambahkan role Admin untuk monitoring semua mahasiswa."

---

**Dibuat pada**: 1 Mei 2026  
**Project**: FlowDay - Task & Habit Management System  
**Tujuan**: Klarifikasi 2 Aktor dalam ERD
