# 🎓 Tutorial Lengkap - Mermaid Live ERD

## 📝 Langkah demi Langkah

---

## STEP 1: Buka Mermaid Live

### 🔗 URL: https://mermaid.live/

1. Buka browser (Chrome, Firefox, Edge, Safari)
2. Ketik atau paste URL: `https://mermaid.live/`
3. Tekan Enter

---

## STEP 2: Hapus Code Default

Saat pertama kali buka, Mermaid Live akan menampilkan contoh diagram.

**Lakukan:**
1. Klik di area editor (sebelah kiri)
2. Tekan `Ctrl+A` (Windows) atau `Cmd+A` (Mac) untuk select all
3. Tekan `Delete` atau `Backspace`
4. Editor sekarang kosong

---

## STEP 3: Copy Code ERD

### ⚠️ PENTING: Jangan Copy Backticks!

**❌ SALAH - Jangan copy ini:**
```
```mermaid
erDiagram
    ...
\```
```

**✅ BENAR - Copy ini:**
```
erDiagram
    auth_users ||--|| profiles : "has profile"
    auth_users ||--o{ tasks : "creates tasks"
    ...
```

### 📋 Code untuk Di-Copy:

**Copy dari baris ini sampai bawah:**

---

erDiagram
    auth_users ||--|| profiles : "has profile"
    auth_users ||--o{ tasks : "creates tasks"
    auth_users ||--o{ habits : "tracks habits"
    habits ||--o{ habit_logs : "records daily"
    auth_users ||--o{ user_subjects : "enrolls in"
    auth_users ||--o{ fcm_tokens : "registers device"
    auth_users ||--o{ notifications : "receives notification"
    auth_users ||--|| notification_preferences : "configures settings"
    
    auth_users {
        uuid id PK
        text email UK
        timestamptz created_at
    }
    
    profiles {
        uuid id PK_FK
        text name
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }
    
    tasks {
        uuid id PK
        uuid user_id FK
        text title
        text description
        text subject
        text priority
        text status
        date due_date
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    habits {
        uuid id PK
        uuid user_id FK
        text title
        int current_streak
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    habit_logs {
        uuid id PK
        uuid habit_id FK
        uuid user_id FK
        date log_date UK
        boolean completed
        timestamptz created_at
    }
    
    user_subjects {
        uuid id PK
        uuid user_id FK
        text name UK
        timestamptz created_at
    }
    
    fcm_tokens {
        uuid id PK
        uuid user_id FK
        text token UK
        jsonb device_info
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_used_at
    }
    
    notifications {
        uuid id PK
        uuid user_id FK
        text title
        text body
        text type
        jsonb data
        boolean read
        timestamptz created_at
    }
    
    notification_preferences {
        uuid id PK
        uuid user_id FK_UK
        boolean deadline_reminders
        boolean habit_reminders
        boolean streak_milestones
        boolean task_complete
        time reminder_time
        timestamptz created_at
        timestamptz updated_at
    }

---

**Cara Copy:**
1. Klik 3x pada baris pertama "erDiagram" untuk select
2. Tekan `Shift+End` untuk select sampai akhir baris
3. Tekan `Shift+Ctrl+End` untuk select sampai akhir document
4. Atau: Drag mouse dari "erDiagram" sampai baris terakhir
5. Tekan `Ctrl+C` untuk copy

---

## STEP 4: Paste ke Mermaid Live

1. Klik di area editor Mermaid Live (sebelah kiri)
2. Pastikan editor kosong (sudah dihapus di Step 2)
3. Tekan `Ctrl+V` (Windows) atau `Cmd+V` (Mac)
4. Code akan muncul di editor

**Hasil:**
- Diagram ERD akan muncul otomatis di sebelah kanan
- Jika tidak muncul, tunggu 2-3 detik
- Jika masih error, cek apakah ada backticks ``` di awal/akhir

---

## STEP 5: Cek Diagram

### ✅ Diagram Berhasil Muncul:
- Anda akan melihat kotak-kotak tabel
- Ada garis yang menghubungkan antar tabel
- Ada label di garis (seperti "has profile", "creates tasks")

### ❌ Jika Ada Error:
**Error: "No diagram type detected"**
- **Penyebab**: Anda copy dengan backticks ```mermaid
- **Solusi**: Hapus backticks, copy ulang dari "erDiagram"

**Error: "Syntax error"**
- **Penyebab**: Ada karakter aneh atau spasi di awal
- **Solusi**: Pastikan baris pertama adalah "erDiagram" tanpa spasi

**Diagram tidak muncul**
- **Penyebab**: Browser cache
- **Solusi**: Refresh halaman (Ctrl+F5), paste ulang

---

## STEP 6: Customize (Opsional)

### Ubah Label Relasi ke Bahasa Indonesia:

**Sebelum:**
```
auth_users ||--|| profiles : "has profile"
```

**Sesudah:**
```
auth_users ||--|| profiles : "memiliki profil"
```

### Ubah Cardinality:

```
||--||  : One to One (1:1)
||--o{  : One to Many (1:N)
}o--o{  : Many to Many (N:M)
```

### Tambah/Hapus Kolom:

**Tambah kolom:**
```
auth_users {
    uuid id PK
    text email UK
    text phone "Nomor Telepon"  ← Tambah ini
}
```

**Hapus kolom:**
Hapus baris yang tidak perlu

---

## STEP 7: Export Diagram

### 1. Klik Tombol "Actions"
- Ada di pojok kanan atas
- Atau klik icon "⋮" (3 titik vertikal)

### 2. Pilih Format Export:

**PNG (Recommended untuk PowerPoint):**
- Klik "PNG"
- Pilih resolusi (2x atau 4x untuk kualitas tinggi)
- File akan otomatis download

**SVG (Recommended untuk Print):**
- Klik "SVG"
- File vector, bisa di-zoom tanpa blur
- Cocok untuk poster atau print

**PDF:**
- Klik "PDF"
- Cocok untuk dokumentasi

### 3. Simpan File
- File akan tersimpan di folder Downloads
- Rename file sesuai kebutuhan
- Contoh: `FlowDay_ERD_v2.png`

---

## STEP 8: Gunakan di Presentasi

### PowerPoint:
1. Buka PowerPoint
2. Insert → Picture
3. Pilih file PNG yang sudah di-download
4. Resize sesuai kebutuhan

### Google Slides:
1. Buka Google Slides
2. Insert → Image → Upload from computer
3. Pilih file PNG
4. Resize dan posisikan

### Word/Google Docs:
1. Insert → Image
2. Pilih file PNG
3. Set text wrapping: "In line with text" atau "Square"

---

## 🎯 Tips & Tricks

### 1. Zoom Diagram
- Gunakan scroll mouse di area preview (kanan)
- Atau klik tombol zoom (+/-)

### 2. Dark Mode
- Klik icon bulan di pojok kanan atas
- Diagram akan berubah ke dark theme

### 3. Share Link
- Klik "Share" atau icon link
- Copy URL untuk share ke teman
- URL berisi code diagram

### 4. Save to File
- Klik "Actions" → "Download as Markdown"
- File .md akan tersimpan dengan code diagram

### 5. Edit Lagi Nanti
- Bookmark URL setelah edit
- Atau save code di file .txt
- Copy-paste lagi ke Mermaid Live saat perlu edit

---

## 🔧 Troubleshooting

### Problem 1: Diagram Terlalu Besar
**Solusi:**
- Gunakan versi Simplified (lebih sedikit kolom)
- Atau export dengan zoom out terlebih dahulu

### Problem 2: Label Relasi Terpotong
**Solusi:**
- Perpendek label (contoh: "has profile" → "has")
- Atau export dengan resolusi lebih tinggi

### Problem 3: Garis Relasi Overlap
**Solusi:**
- Mermaid otomatis arrange layout
- Coba ubah urutan tabel di code
- Atau gunakan Class Diagram sebagai alternatif

### Problem 4: Font Terlalu Kecil
**Solusi:**
- Zoom in sebelum export
- Atau export dengan resolusi 4x

---

## 📚 Resources

- **Mermaid Live**: https://mermaid.live/
- **Mermaid Docs**: https://mermaid.js.org/
- **ERD Syntax**: https://mermaid.js.org/syntax/entityRelationshipDiagram.html
- **Community**: https://github.com/mermaid-js/mermaid/discussions

---

## ✅ Checklist

- [ ] Buka https://mermaid.live/
- [ ] Hapus code default
- [ ] Copy code ERD (tanpa backticks)
- [ ] Paste ke editor
- [ ] Cek diagram muncul
- [ ] (Optional) Customize label/kolom
- [ ] Export sebagai PNG/SVG
- [ ] Simpan file
- [ ] Insert ke presentasi
- [ ] ✨ Done!

---

## 🎓 Untuk Presentasi Tugas Akhir

### Slide 1: ERD Overview
- Gunakan versi Simplified
- Fokus ke relasi utama

### Slide 2: Detail Tabel
- Screenshot tabel tertentu
- Zoom in untuk detail

### Slide 3: Notification System
- Highlight 3 tabel baru
- Jelaskan relasi

### Slide 4: Constraints
- Tunjukkan PK, FK, UK
- Jelaskan ON DELETE CASCADE

---

**Status**: ✅ TUTORIAL LENGKAP  
**Difficulty**: ⭐⭐☆☆☆ (Easy)  
**Time**: ~5 menit  
**Result**: Professional ERD Diagram
