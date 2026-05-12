# Audio Files untuk Pomodoro Timer

## File yang Digunakan

### ✅ completion.mp3
File audio yang diputar saat timer Pomodoro selesai.

**Status**: ✅ Sudah ditambahkan
**Volume**: 60%
**Loop**: Tidak
**Fungsi**: Memberikan notifikasi audio saat sesi Pomodoro selesai

### ✅ timer.mp3
File audio yang diputar saat timer Pomodoro sedang berjalan.

**Status**: ✅ Sudah ditambahkan
**Volume**: 30% (lebih rendah untuk background)
**Loop**: Ya (berulang terus)
**Fungsi**: Memberikan feedback audio bahwa timer sedang aktif (ticking sound)

## Cara Kerja

### Saat Timer Berjalan
1. File `timer.mp3` diputar secara loop
2. Volume lebih rendah (30%) agar tidak mengganggu
3. Memberikan feedback bahwa timer sedang aktif

### Saat Timer Selesai
1. File `timer.mp3` dihentikan
2. File `completion.mp3` diputar sekali
3. Toast notification muncul

### Saat Timer Dijeda
1. File `timer.mp3` dihentikan
2. Timer countdown berhenti
3. Bisa dilanjutkan dengan tombol Play

## Kontrol Audio

Pengguna dapat mengontrol suara melalui:
- **Settings → Pomodoro → Toggle "Suara Notifikasi"**

Jika dinonaktifkan:
- Tidak ada ticking sound
- Tidak ada completion sound
- Toast notification tetap muncul

## Mengganti File Audio

Jika ingin mengganti dengan file audio lain:

### Untuk Completion Sound
1. Siapkan file MP3 baru (bell, chime, atau ding)
2. Rename menjadi: `completion.mp3`
3. Letakkan di folder ini (ganti file yang ada)
4. Refresh browser (Ctrl+F5)

**Rekomendasi:**
- ✅ Durasi: 1-3 detik
- ✅ Ukuran: < 100KB
- ✅ Nada: Jelas, menyenangkan
- ✅ Volume: Cukup keras untuk didengar

### Untuk Ticking Sound
1. Siapkan file MP3 baru (tick-tock, clock, metronome)
2. Rename menjadi: `timer.mp3`
3. Letakkan di folder ini (ganti file yang ada)
4. Refresh browser (Ctrl+F5)

**Rekomendasi:**
- ✅ Durasi: 1-2 detik (akan di-loop)
- ✅ Ukuran: < 50KB
- ✅ Nada: Lembut, tidak mengganggu
- ✅ Loop: Harus seamless (tidak ada jeda)

## Sumber Audio Gratis

Jika ingin mencari file audio alternatif:

### Pixabay (Recommended)
- Timer sounds: https://pixabay.com/sound-effects/search/timer/
- Clock sounds: https://pixabay.com/sound-effects/search/clock/
- Bell/Chime: https://pixabay.com/sound-effects/search/clock-chime/
- Gratis, tidak perlu login

### ElevenLabs
- Timer sounds: https://elevenlabs.io/sound-effects/timer
- Bisa generate custom sound

### Freesound
- https://freesound.org/
- Perlu registrasi gratis
- Banyak pilihan

## Testing

### Test Ticking Sound
1. Buka Pomodoro Timer
2. Pastikan "Suara Notifikasi" aktif
3. Klik "Mulai"
4. Dengarkan suara ticking yang berulang
5. Klik "Jeda" - suara harus berhenti

### Test Completion Sound
1. Set timer ke 1 menit
2. Klik "Mulai"
3. Tunggu hingga selesai
4. Dengarkan suara completion
5. Ticking sound harus berhenti

### Test dengan Tool
Buka: `http://localhost:3000/sounds/test-audio.html`
(setelah aplikasi running)

## Troubleshooting

**Ticking sound tidak terdengar?**
- Periksa apakah file `timer.mp3` ada
- Periksa Settings → "Suara Notifikasi" aktif
- Pastikan timer sedang berjalan (tidak pause)
- Periksa volume browser dan sistem

**Completion sound tidak terdengar?**
- Periksa apakah file `completion.mp3` ada
- Periksa Settings → "Suara Notifikasi" aktif
- Tunggu hingga timer benar-benar selesai (00:00)
- Periksa volume browser dan sistem

**Ticking sound tidak berhenti?**
- Tutup dan buka kembali dialog
- Refresh halaman
- Periksa Console (F12) untuk error

**File tidak valid?**
- Pastikan file adalah MP3 yang valid
- Test dengan media player
- Convert ulang jika perlu

## Console Logs

**Saat berhasil:**
```
✅ Completion sound loaded successfully
✅ Ticking sound loaded successfully
✅ Played timer completion sound from completion.mp3
```

**Jika ada masalah:**
```
⚠️ Completion sound file not found or invalid
⚠️ Ticking sound file not found or invalid
⚠️ Failed to play completion audio file, using fallback beep
```

## Informasi Teknis

**Path:**
- Completion: `/sounds/completion.mp3`
- Ticking: `/sounds/timer.mp3`

**Volume:**
- Completion: 60% (0.6)
- Ticking: 30% (0.3)

**Loop:**
- Completion: Tidak
- Ticking: Ya

**Format:** MP3
**Browser Support:** Semua browser modern

---

**Status:** ✅ Kedua file audio sudah ditambahkan dan berfungsi dengan baik!
