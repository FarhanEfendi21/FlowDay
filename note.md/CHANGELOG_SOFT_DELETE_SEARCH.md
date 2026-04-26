# Changelog - Soft Delete & Search Feature

## Fitur Baru

### 1. Soft Delete dengan Trash/Arsip
- ✅ Menambahkan kolom `deleted_at` ke tabel `tasks`
- ✅ Tasks yang dihapus tidak langsung hilang, tapi dipindahkan ke Trash
- ✅ Halaman Trash baru di `/dashboard/trash`
- ✅ Fitur restore task dari Trash
- ✅ Fitur permanent delete (hard delete) dengan konfirmasi

### 2. Search Functionality
- ✅ Input search di halaman Tasks
- ✅ Search berdasarkan title atau description
- ✅ Real-time search dengan debounce otomatis dari React Query

## File yang Diubah/Ditambahkan

### Database Migration
- `supabase/migrations/004_add_soft_delete.sql` - Migration untuk menambahkan kolom `deleted_at`

### Types & Database
- `lib/types/database.types.ts` - Update type untuk kolom `deleted_at`
- `features/tasks/types/index.ts` - Update interface Task dan GetTasksFilter

### API Service
- `features/tasks/api/taskService.ts` - Update dengan:
  - Search filter di `getTasks()`
  - Soft delete di `deleteTask()`
  - `restoreTask()` - Restore dari trash
  - `permanentDeleteTask()` - Hard delete
  - `getDeletedTasks()` - Fetch deleted tasks

### Hooks
- `features/tasks/hooks/useTasks.ts` - Tambah hooks:
  - `useRestoreTask()`
  - `usePermanentDeleteTask()`
  - `useDeletedTasks()`

### UI Pages
- `app/dashboard/tasks/page.tsx` - Tambah search input
- `app/dashboard/trash/page.tsx` - **NEW** Halaman Trash
- `app/dashboard/layout.tsx` - Tambah link ke Trash di sidebar

## Cara Menggunakan

### 1. Jalankan Migration
```bash
# Jika menggunakan Supabase CLI
supabase db push

# Atau jalankan manual di Supabase Dashboard > SQL Editor
```

### 2. Search Tasks
- Buka halaman Tasks
- Ketik keyword di search box
- Search akan otomatis filter tasks berdasarkan title atau description

### 3. Soft Delete & Restore
- Hapus task dari halaman Tasks (akan masuk ke Trash)
- Buka halaman Trash dari sidebar
- Pilih "Kembalikan" untuk restore task
- Pilih "Hapus Permanen" untuk hard delete (tidak bisa dikembalikan)

## Technical Details

### Soft Delete Implementation
- `deleted_at IS NULL` = Task aktif (tampil di halaman Tasks)
- `deleted_at IS NOT NULL` = Task di Trash (tampil di halaman Trash)
- Index dibuat untuk performa query yang optimal

### Search Implementation
- Menggunakan PostgreSQL `ILIKE` untuk case-insensitive search
- Search di kolom `title` dan `description`
- Format: `title.ilike.%keyword%,description.ilike.%keyword%`

### RLS (Row Level Security)
- Semua policies tetap berlaku
- User hanya bisa melihat/restore/delete tasks milik sendiri

## Testing Checklist

- [ ] Migration berhasil dijalankan
- [ ] Search berfungsi dengan baik
- [ ] Soft delete memindahkan task ke Trash
- [ ] Restore mengembalikan task ke Tasks
- [ ] Permanent delete menghapus task dari database
- [ ] UI responsive di mobile dan desktop
- [ ] Loading states tampil dengan baik
- [ ] Error handling berfungsi (toast notifications)
