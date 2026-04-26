# 🛠️ Cara Setup Soft Delete Feature

## ⚠️ PENTING: Jalankan Migration Dulu!

Sebelum menggunakan fitur soft delete, Anda **HARUS** menjalankan migration database terlebih dahulu.

---

## 📝 Langkah Setup

### Opsi 1: Menggunakan Supabase CLI (Recommended)

```bash
# Pastikan Supabase CLI sudah terinstall
supabase db push
```

### Opsi 2: Manual via Supabase Dashboard

1. Buka **Supabase Dashboard** → Pilih project Anda
2. Klik **SQL Editor** di sidebar kiri
3. Klik **New Query**
4. Copy-paste isi file `supabase/migrations/004_add_soft_delete.sql`
5. Klik **Run** atau tekan `Ctrl+Enter`

**Isi SQL yang harus dijalankan:**

```sql
-- Tambah kolom deleted_at ke tabel tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index untuk query tasks yang tidak dihapus (deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON public.tasks (user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Index untuk query trash (deleted_at IS NOT NULL)
CREATE INDEX IF NOT EXISTS idx_tasks_trash ON public.tasks (user_id, deleted_at DESC) 
WHERE deleted_at IS NOT NULL;

-- Function untuk soft delete
CREATE OR REPLACE FUNCTION public.soft_delete_task(p_task_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.tasks
  SET deleted_at = NOW()
  WHERE id = p_task_id AND user_id = auth.uid();
END;
$$;

-- Function untuk restore task dari trash
CREATE OR REPLACE FUNCTION public.restore_task(p_task_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.tasks
  SET deleted_at = NULL
  WHERE id = p_task_id AND user_id = auth.uid();
END;
$$;

-- Function untuk permanent delete
CREATE OR REPLACE FUNCTION public.permanent_delete_task(p_task_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.tasks
  WHERE id = p_task_id AND user_id = auth.uid();
END;
$$;
```

---

## ✅ Verifikasi Migration Berhasil

Setelah menjalankan migration, verifikasi dengan query ini di SQL Editor:

```sql
-- Cek apakah kolom deleted_at sudah ada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'deleted_at';
```

**Expected Result:**
```
column_name | data_type                   | is_nullable | column_default
deleted_at  | timestamp with time zone    | YES         | NULL
```

---

## 🐛 Troubleshooting

### Error: "column deleted_at does not exist"

**Penyebab:** Migration belum dijalankan

**Solusi:**
1. Jalankan migration sesuai langkah di atas
2. Restart development server: `npm run dev`
3. Refresh browser

---

### Error: "Cannot add task" atau "Insert failed"

**Penyebab:** Kolom `deleted_at` belum ada di database

**Solusi:**
1. Pastikan migration sudah dijalankan (cek dengan query verifikasi di atas)
2. Jika kolom sudah ada tapi masih error, coba restart Supabase connection:
   - Stop dev server (`Ctrl+C`)
   - Clear browser cache
   - Start dev server lagi (`npm run dev`)

---

### Error: "Function soft_delete_task does not exist"

**Penyebab:** Function belum dibuat

**Solusi:**
1. Jalankan bagian function dari migration (copy-paste ke SQL Editor)
2. Atau jalankan ulang seluruh migration

---

### Tasks tidak muncul setelah migration

**Penyebab:** Mungkin ada tasks dengan `deleted_at` yang tidak NULL

**Solusi:**
```sql
-- Reset semua tasks yang mungkin ter-mark sebagai deleted
UPDATE public.tasks 
SET deleted_at = NULL 
WHERE deleted_at IS NOT NULL;
```

---

## 🧪 Test Fitur Setelah Setup

1. **Test Create Task:**
   - Buka halaman Tasks
   - Klik "Tambah Tugas"
   - Isi form dan submit
   - ✅ Task harus muncul di list

2. **Test Soft Delete:**
   - Klik menu ⋮ pada task
   - Pilih "Hapus"
   - ✅ Task hilang dari Tasks
   - Buka halaman Trash
   - ✅ Task muncul di Trash

3. **Test Restore:**
   - Di halaman Trash, klik menu ⋮
   - Pilih "Kembalikan"
   - ✅ Task kembali ke Tasks

4. **Test Permanent Delete:**
   - Di halaman Trash, klik menu ⋮
   - Pilih "Hapus Permanen"
   - Konfirmasi
   - ✅ Task hilang dari Trash dan database

---

## 📊 Struktur Database Setelah Migration

```
tasks table:
├── id (UUID)
├── user_id (UUID)
├── title (TEXT)
├── description (TEXT)
├── subject (TEXT)
├── priority (task_priority)
├── status (task_status)
├── due_date (DATE)
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)
└── deleted_at (TIMESTAMPTZ) ← BARU!

Indexes:
├── idx_tasks_user_due_date
├── idx_tasks_user_subject
├── idx_tasks_user_status
├── idx_tasks_deleted_at ← BARU!
└── idx_tasks_trash ← BARU!

Functions:
├── soft_delete_task(UUID) ← BARU!
├── restore_task(UUID) ← BARU!
└── permanent_delete_task(UUID) ← BARU!
```

---

## 🔄 Rollback (Jika Perlu)

Jika ingin menghapus fitur soft delete:

```sql
-- Hapus functions
DROP FUNCTION IF EXISTS public.soft_delete_task(UUID);
DROP FUNCTION IF EXISTS public.restore_task(UUID);
DROP FUNCTION IF EXISTS public.permanent_delete_task(UUID);

-- Hapus indexes
DROP INDEX IF EXISTS public.idx_tasks_deleted_at;
DROP INDEX IF EXISTS public.idx_tasks_trash;

-- Hapus kolom (HATI-HATI: Data di kolom akan hilang!)
ALTER TABLE public.tasks DROP COLUMN IF EXISTS deleted_at;
```

---

## 📞 Support

Jika masih ada masalah setelah mengikuti langkah di atas:

1. Cek console browser untuk error message
2. Cek Supabase logs di Dashboard
3. Pastikan RLS policies aktif
4. Pastikan user sudah login

**Happy Coding! 🎉**
