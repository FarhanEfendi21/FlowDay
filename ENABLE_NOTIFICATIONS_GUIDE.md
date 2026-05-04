# 📱 Panduan Aktifkan Notifikasi Push

## Your User ID
```
bdb0ad43-7e65-4a42-adfe-26816b8d4520
```

---

## 🔍 Step 1: Check Current Status

Buka **Supabase Dashboard** → **SQL Editor** → Copy paste query dari file `check_user_fcm_token.sql`

**Query 1 result:**
- ❌ **0 rows** = Notifikasi belum diaktifkan (perlu aktifkan!)
- ✅ **1+ rows** = Notifikasi sudah aktif (skip ke Step 3)

---

## 📲 Step 2: Aktifkan Notifikasi di HP

### Cara 1: Via Bell Icon (Paling Mudah)

1. **Buka app** di HP (Chrome/Safari)
2. **Login** dengan user ID: `bdb0ad43-7e65-4a42-adfe-26816b8d4520`
3. **Klik bell icon** (🔔) di navbar kanan atas
4. **Lihat banner biru** dengan tulisan "Aktifkan Notifikasi Push"
5. **Klik tombol "Aktifkan Sekarang"**
6. **Browser akan minta permission** → Klik **"Allow"** / **"Izinkan"**
7. **Toast muncul**: "Notifikasi berhasih diaktifkan! 🎉"

### Cara 2: Via Auto Popup (Tunggu 5 detik)

1. **Buka app** di HP
2. **Login**
3. **Tunggu 5 detik**
4. **Popup muncul** di kanan bawah: "Aktifkan Notifikasi"
5. **Klik "Aktifkan"**
6. **Browser minta permission** → Klik **"Allow"**

---

## ✅ Step 3: Verify Token Tersimpan

Jalankan **Query 1** lagi di Supabase:

```sql
SELECT * FROM fcm_tokens 
WHERE user_id = 'bdb0ad43-7e65-4a42-adfe-26816b8d4520';
```

**Expected result:**
```
id | user_id | token | device_info | created_at
---|---------|-------|-------------|------------
1  | bdb0... | eyJ... | {"userAgent": "Mozilla..."} | 2024-05-04...
```

✅ **Ada 1 row** = Token berhasil tersimpan!

---

## 🧪 Step 4: Test Notifikasi

### Test 1: Manual Test Notification

1. **Klik bell icon** (🔔)
2. **Scroll ke bawah**
3. **Klik "Kirim Test Notifikasi"**
4. **Tunggu 1-5 detik**
5. **Notifikasi harus muncul** di HP! 🎉

**Expected:**
- Notifikasi muncul dengan title: "Test Notifikasi!"
- Body: "Ini adalah notifikasi percobaan dari Flowday."
- Bisa diklik → redirect ke dashboard

### Test 2: Test Urgent Deadline (2 Hours)

1. **Buka Supabase SQL Editor**
2. **Uncomment dan run Query 4** dari `check_user_fcm_token.sql`:
```sql
INSERT INTO tasks (user_id, title, subject, due_date, status)
VALUES (
  'bdb0ad43-7e65-4a42-adfe-26816b8d4520',
  '🚨 TEST URGENT - 2 Hours',
  'Testing',
  NOW() + INTERVAL '2 hours',
  'todo'
);
```
3. **Tunggu cron job jalan** (setiap jam di menit ke-0)
   - Atau **trigger manual** di Vercel Dashboard → Cron Jobs → `check-urgent-deadlines` → Run
4. **Notifikasi harus muncul** dalam 30 detik!

**Expected notification:**
- Title: "🚨 Deadline 2 Jam Lagi!"
- Body: "Tugas 'TEST URGENT - 2 Hours' (Testing) jatuh tempo jam XX:XX"

### Test 3: Test Daily Deadline (Tomorrow)

1. **Uncomment dan run Query 5** dari `check_user_fcm_token.sql`:
```sql
INSERT INTO tasks (user_id, title, subject, due_date, status)
VALUES (
  'bdb0ad43-7e65-4a42-adfe-26816b8d4520',
  '⏰ TEST DEADLINE - Tomorrow',
  'Testing',
  (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00'),
  'todo'
);
```
2. **Tunggu cron job jalan** (setiap hari jam 02:00 UTC = 09:00 WIB)
   - Atau **trigger manual** di Vercel → `check-deadlines` → Run
3. **Notifikasi harus muncul!**

**Expected notification:**
- Title: "⏰ Deadline Besok!"
- Body: "Tugas 'TEST DEADLINE - Tomorrow' (Testing) jatuh tempo besok"

---

## 🐛 Troubleshooting

### Problem 1: Button "Aktifkan Notifikasi" tidak muncul

**Possible causes:**
- Browser tidak support notifications (coba Chrome/Safari)
- Sudah granted tapi token gagal save

**Solution:**
1. Cek browser console (F12) untuk error
2. Coba logout → login lagi
3. Clear cache & cookies

### Problem 2: Permission popup tidak muncul

**Possible causes:**
- Permission sudah di-block sebelumnya
- Browser settings block notifications

**Solution:**
1. **Chrome Android:**
   - Settings → Site settings → Notifications
   - Cari domain app kamu
   - Change to "Allow"
   - Refresh app → klik "Aktifkan Notifikasi" lagi

2. **Safari iOS:**
   - Settings → Safari → Notifications
   - Allow notifications
   - Refresh app

### Problem 3: Test notification tidak muncul

**Check logs:**
1. Buka Vercel Dashboard
2. Logs → Filter by `/api/notifications/send`
3. Cari error message

**Common errors:**
- `No FCM tokens found` → Token belum tersimpan (ulangi Step 2)
- `Firebase credentials missing` → Env vars belum di-set
- `FCM send failed` → Token expired (hapus token lama, re-enable)

---

## 📊 Success Criteria

✅ Query 1 return 1+ rows (token tersimpan)  
✅ Test notification muncul di HP  
✅ Urgent deadline notification muncul (2 hours)  
✅ Daily deadline notification muncul (tomorrow)  
✅ Notification bisa diklik → redirect ke tasks page  

---

## 🎯 Next Steps After Success

1. **Delete test tasks** (yang dibuat untuk testing)
2. **Create real tasks** dengan deadline
3. **Wait for notifications** sesuai schedule:
   - Urgent (2 hours before): Cron runs every hour at :00
   - Daily (tomorrow): Cron runs daily at 02:00 UTC (09:00 WIB)
   - Habits: Cron runs daily at 13:00 UTC (20:00 WIB)

4. **Monitor Vercel logs** untuk memastikan cron jobs jalan tanpa error

---

## 📞 Need Help?

If still not working after following all steps:

1. **Share these info:**
   - Result of Query 1 (FCM tokens)
   - Browser console errors (F12)
   - Vercel logs for `/api/notifications/send`
   - Screenshot of notification bell popup

2. **Check:**
   - Firebase credentials di Vercel env vars
   - Service worker registered (`/firebase-messaging-sw.js`)
   - Network tab untuk FCM requests

Good luck! 🚀
