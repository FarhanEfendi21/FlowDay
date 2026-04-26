# 🎉 Fitur Baru: Soft Delete & Search

## 📋 Ringkasan

Dua fitur baru telah ditambahkan ke aplikasi FlowDay:

1. **Soft Delete dengan Trash/Arsip** - Tugas yang dihapus tidak langsung hilang, tapi masuk ke Trash dan bisa dikembalikan
2. **Search Functionality** - Cari tugas berdasarkan judul atau deskripsi

---

## 🗑️ 1. Soft Delete & Trash

### Cara Kerja
- Ketika menghapus tugas dari halaman Tasks, tugas tidak langsung dihapus dari database
- Tugas dipindahkan ke **Trash** (kolom `deleted_at` diisi dengan timestamp)
- Dari halaman Trash, Anda bisa:
  - **Kembalikan** tugas ke Tasks
  - **Hapus Permanen** (hard delete) - tidak bisa dikembalikan lagi

### Langkah Penggunaan

#### Menghapus Tugas (Soft Delete)
1. Buka halaman **Tasks**
2. Klik menu ⋮ pada tugas yang ingin dihapus
3. Pilih **Hapus**
4. Tugas akan masuk ke **Trash**

#### Melihat Trash
1. Klik **Trash** di sidebar kiri
2. Semua tugas yang dihapus akan tampil di sini
3. Informasi yang ditampilkan:
   - Judul tugas (dengan garis coret)
   - Mata kuliah
   - Prioritas
   - Deadline
   - Tanggal dihapus

#### Mengembalikan Tugas
1. Buka halaman **Trash**
2. Klik menu ⋮ pada tugas yang ingin dikembalikan
3. Pilih **Kembalikan**
4. Tugas akan kembali ke halaman Tasks

#### Menghapus Permanen
1. Buka halaman **Trash**
2. Klik menu ⋮ pada tugas yang ingin dihapus permanen
3. Pilih **Hapus Permanen**
4. Konfirmasi dengan klik **Hapus Permanen** di dialog
5. ⚠️ **Perhatian**: Tindakan ini tidak bisa dibatalkan!

---

## 🔍 2. Search Functionality

### Cara Kerja
- Search box tersedia di halaman **Tasks**
- Mencari tugas berdasarkan:
  - **Judul** tugas
  - **Deskripsi** tugas
- Search bersifat **case-insensitive** (tidak peduli huruf besar/kecil)
- Real-time search (hasil langsung muncul saat mengetik)

### Langkah Penggunaan

1. Buka halaman **Tasks**
2. Lihat search box di bagian atas (ikon 🔍)
3. Ketik keyword yang ingin dicari
4. Hasil akan otomatis difilter
5. Hapus keyword untuk melihat semua tugas lagi

### Contoh Penggunaan
- Ketik "matematika" → Tampil semua tugas yang mengandung kata "matematika"
- Ketik "ujian" → Tampil tugas dengan judul/deskripsi yang mengandung "ujian"
- Ketik "bab 5" → Tampil tugas terkait bab 5

### Kombinasi dengan Filter Lain
Search bisa dikombinasikan dengan filter lain:
- **Mata Kuliah** - Filter berdasarkan mata kuliah tertentu
- **Status** - Filter To Do atau Selesai
- **Search** - Cari keyword dalam hasil filter

Contoh: Pilih mata kuliah "Kalkulus" + ketik "tugas" → Tampil semua tugas Kalkulus yang mengandung kata "tugas"

---

## 🛠️ Setup untuk Developer

### 1. Jalankan Migration Database

```bash
# Jika menggunakan Supabase CLI
supabase db push

# Atau copy-paste isi file ini ke Supabase Dashboard > SQL Editor:
# supabase/migrations/004_add_soft_delete.sql
```

### 2. Restart Development Server

```bash
npm run dev
```

### 3. Test Fitur

#### Test Soft Delete:
1. Buat tugas baru
2. Hapus tugas tersebut
3. Cek halaman Trash - tugas harus muncul
4. Restore tugas
5. Cek halaman Tasks - tugas harus kembali

#### Test Search:
1. Buat beberapa tugas dengan judul berbeda
2. Ketik keyword di search box
3. Verifikasi hasil filter sesuai keyword

---

## 📊 Database Schema Changes

### Kolom Baru di Tabel `tasks`

```sql
deleted_at TIMESTAMPTZ DEFAULT NULL
```

- `NULL` = Tugas aktif (tampil di Tasks)
- `NOT NULL` = Tugas dihapus (tampil di Trash)

### Index Baru untuk Performa

```sql
-- Index untuk query tasks aktif
CREATE INDEX idx_tasks_deleted_at ON tasks (user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Index untuk query trash
CREATE INDEX idx_tasks_trash ON tasks (user_id, deleted_at DESC) 
WHERE deleted_at IS NOT NULL;
```

---

## 🎨 UI/UX Improvements

### Halaman Tasks
- ✅ Search box dengan icon 🔍
- ✅ Responsive design (mobile & desktop)
- ✅ Real-time search

### Halaman Trash (Baru)
- ✅ List tugas yang dihapus
- ✅ Tampilan dengan opacity rendah (visual cue)
- ✅ Icon trash di setiap card
- ✅ Tanggal dihapus ditampilkan
- ✅ Dropdown menu untuk Restore/Delete Permanen
- ✅ Konfirmasi dialog untuk permanent delete
- ✅ Empty state ketika trash kosong

### Sidebar Navigation
- ✅ Link baru ke halaman Trash
- ✅ Icon Trash2 dari Lucide

---

## 🔒 Security & RLS

- ✅ Row Level Security (RLS) tetap aktif
- ✅ User hanya bisa melihat/restore/delete tugas milik sendiri
- ✅ Soft delete tidak mengubah RLS policies
- ✅ Search query aman dari SQL injection (menggunakan Supabase client)

---

## 🐛 Troubleshooting

### Migration Gagal
**Problem**: Error saat menjalankan migration

**Solution**:
1. Pastikan koneksi ke Supabase aktif
2. Cek apakah kolom `deleted_at` sudah ada (jika ya, skip migration)
3. Jalankan manual di Supabase Dashboard > SQL Editor

### Search Tidak Berfungsi
**Problem**: Ketik keyword tapi tidak ada hasil

**Solution**:
1. Cek apakah ada tugas yang sesuai keyword
2. Pastikan tidak ada filter lain yang konflik (mata kuliah/status)
3. Coba hapus keyword dan ketik ulang
4. Refresh halaman

### Tugas Tidak Muncul di Trash
**Problem**: Hapus tugas tapi tidak muncul di Trash

**Solution**:
1. Refresh halaman Trash
2. Cek apakah tugas benar-benar dihapus (cek di Tasks)
3. Cek console browser untuk error
4. Verifikasi migration sudah dijalankan

---

## 📝 API Changes

### New Functions

```typescript
// Soft delete
deleteTask(id: string): Promise<void>

// Restore dari trash
restoreTask(id: string): Promise<void>

// Hard delete
permanentDeleteTask(id: string): Promise<void>

// Get deleted tasks
getDeletedTasks(): Promise<Task[]>

// Get tasks dengan search
getTasks({ search: "keyword" }): Promise<Task[]>
```

### New Hooks

```typescript
// Restore task
const restoreTask = useRestoreTask()
restoreTask.mutate(taskId)

// Permanent delete
const permanentDelete = usePermanentDeleteTask()
permanentDelete.mutate(taskId)

// Get deleted tasks
const { data: deletedTasks } = useDeletedTasks()
```

---

## ✅ Testing Checklist

- [x] Migration berhasil dijalankan
- [x] Build berhasil tanpa error TypeScript
- [x] Halaman Trash dapat diakses
- [ ] Soft delete berfungsi (tugas masuk ke Trash)
- [ ] Restore berfungsi (tugas kembali ke Tasks)
- [ ] Permanent delete berfungsi (tugas hilang dari database)
- [ ] Search berfungsi (filter berdasarkan keyword)
- [ ] Search + filter lain berfungsi bersamaan
- [ ] UI responsive di mobile
- [ ] Loading states tampil dengan baik
- [ ] Toast notifications muncul
- [ ] Empty states tampil dengan baik

---

## 🚀 Next Steps (Optional Improvements)

1. **Auto-delete dari Trash** - Hapus otomatis tugas yang sudah 30 hari di Trash
2. **Bulk Actions** - Select multiple tasks untuk restore/delete sekaligus
3. **Search History** - Simpan keyword yang sering dicari
4. **Advanced Search** - Filter by date range, priority, dll
5. **Trash Statistics** - Tampilkan jumlah tugas di Trash di sidebar

---

## 📞 Support

Jika ada pertanyaan atau menemukan bug, silakan buat issue di repository atau hubungi tim developer.

**Happy Coding! 🎉**
