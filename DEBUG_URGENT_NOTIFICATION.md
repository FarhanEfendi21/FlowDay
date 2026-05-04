# 🔍 Debug Guide: Urgent Deadline Notification

## Status Saat Ini
✅ Task terdeteksi di logs: "Task '🚨 TEST - 2 Hours': 1.99 hours until deadline"  
✅ Cron job berjalan: "Found 1 urgent tasks out of 1 total"  
❌ Notifikasi tidak muncul di HP

## Langkah Debugging

### 1. Cek Logs Vercel Lengkap
Setelah deploy versi baru dengan logging detail, jalankan cron job lagi dan cek logs untuk:

**Yang harus muncul:**
```
📤 Sending notifications for 1 urgent tasks...
📤 Sending notification for task "🚨 TEST - 2 Hours" to user [USER_ID]
   API URL: https://your-app.vercel.app/api/notifications/send
   Payload: {...}
🔍 Fetching FCM tokens for user: [USER_ID]
📱 Found X FCM token(s) for user [USER_ID]
💾 Saving notification to database...
✅ Notification saved to database
📤 Sending FCM notifications to X device(s)...
🔧 Checking Firebase credentials...
📡 Using Firebase Legacy API (atau HTTP v1 API)
✅ FCM send 1 successful
📊 FCM Results: 1 success, 0 failed
✅ Notification sent successfully for task [TASK_ID]
✅ Success: 1, ❌ Failed: 0
```

**Kemungkinan Error:**

#### A. No FCM Tokens Found
```
⚠️ No FCM tokens found for user [USER_ID]
```
**Solusi:**
1. Buka app di HP
2. Login
3. Klik bell icon (🔔)
4. Klik "Aktifkan Notifikasi"
5. Allow permission
6. Jalankan query SQL:
```sql
SELECT * FROM fcm_tokens WHERE user_id = 'YOUR_USER_ID';
```

#### B. Firebase Credentials Missing
```
❌ No Firebase credentials configured!
```
**Solusi:**
1. Cek Vercel Environment Variables:
   - `FIREBASE_SERVER_KEY` (Legacy API) ATAU
   - `FIREBASE_SERVICE_ACCOUNT` (HTTP v1 API)
2. Pastikan salah satu ada dan valid
3. Redeploy jika baru ditambahkan

#### C. FCM Send Failed
```
❌ FCM send 1 failed: [error message]
```
**Solusi:**
- Cek error message detail
- Kemungkinan: token expired, invalid credentials, atau network issue

### 2. Cek Database

Jalankan query di `debug_urgent_notification.sql`:

```bash
# Buka Supabase Dashboard → SQL Editor
# Copy paste query dari debug_urgent_notification.sql
```

**Query 1: Cek task dalam window 2 jam**
- Harus ada minimal 1 task
- `hours_until_due` harus antara 1.5 - 2.5

**Query 2: Cek FCM tokens**
- Harus ada minimal 1 token untuk user
- Token harus valid (tidak expired)

**Query 3: Cek notifications yang dikirim**
- Cek apakah ada record dengan `type = 'urgent_deadline'`
- Jika ada → notifikasi berhasil disimpan ke DB
- Jika tidak ada → error sebelum save ke DB

### 3. Test Manual

#### Test 1: Kirim Test Notification
```
1. Buka app di HP
2. Login
3. Klik bell icon (🔔)
4. Scroll ke bawah
5. Klik "Kirim Test Notifikasi"
```
✅ Jika berhasil → FCM setup OK, masalah di cron logic  
❌ Jika gagal → FCM setup bermasalah

#### Test 2: Trigger Cron Manual
```
1. Buka Vercel Dashboard
2. Cron Jobs → check-urgent-deadlines
3. Klik "Run"
4. Tunggu selesai
5. Cek Logs
```

#### Test 3: Hit API Langsung
```bash
# Ganti dengan URL production Anda
curl -X POST https://your-app.vercel.app/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "title": "🚨 Test Urgent",
    "body": "Test notifikasi urgent deadline",
    "type": "urgent_deadline",
    "data": {
      "taskId": "test-123",
      "url": "/dashboard/tasks"
    }
  }'
```

### 4. Cek Timezone Issue

Task dibuat dengan timezone yang salah bisa menyebabkan masalah:

```sql
-- Cek timezone task
SELECT 
  title,
  due_date,
  due_date AT TIME ZONE 'Asia/Jakarta' AS due_date_wib,
  NOW() AS now_utc,
  NOW() AT TIME ZONE 'Asia/Jakarta' AS now_wib,
  EXTRACT(EPOCH FROM (due_date - NOW())) / 3600 AS hours_until_due
FROM tasks
WHERE id = 'YOUR_TASK_ID';
```

**Expected:**
- `hours_until_due` harus sekitar 2.0 (antara 1.5 - 2.5)
- Jika jauh berbeda → timezone issue

**Fix:**
Buat task baru dengan SQL:
```sql
INSERT INTO tasks (user_id, title, subject, due_date, status)
VALUES (
  'YOUR_USER_ID',
  '🚨 TEST - 2 Hours',
  'Testing',
  NOW() + INTERVAL '2 hours',
  'todo'
);
```

### 5. Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Token Expired** | FCM send failed | User harus re-enable notifikasi di app |
| **Wrong Timezone** | Task tidak terdeteksi | Gunakan `NOW() + INTERVAL '2 hours'` |
| **Cron Not Running** | Tidak ada logs | Cek Vercel cron schedule |
| **Firebase Creds Missing** | "No credentials" error | Add env vars di Vercel |
| **Task Filtered Out** | Detected tapi tidak masuk urgentTasks | Cek filter 1.5-2.5 hours |

## Next Steps

1. **Deploy** kode baru dengan logging detail
2. **Run** cron job manual di Vercel
3. **Check** logs lengkap untuk error
4. **Run** SQL queries untuk cek database state
5. **Report** hasil ke sini dengan:
   - Full logs dari Vercel
   - Hasil SQL queries
   - Screenshot notifikasi (jika ada)

## Expected Timeline

- **Deploy**: 1-2 menit
- **Cron Run**: 30 detik
- **Notification Delivery**: 1-5 detik
- **Total**: < 5 menit dari deploy sampai notifikasi muncul

## Success Criteria

✅ Logs menunjukkan "✅ Success: 1, ❌ Failed: 0"  
✅ Database ada record di `notifications` table  
✅ Notifikasi muncul di HP dalam 5 detik  
✅ Notifikasi bisa diklik dan redirect ke `/dashboard/tasks`
