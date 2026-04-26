# 🐌 Analisis Performa - Rendering Lag

## 🔍 Masalah yang Ditemukan

### 1. ⚠️ **Query Provider - Blocking Render**
**Lokasi:** `providers/query-provider.tsx`

**Masalah:**
```typescript
// ❌ Ini BLOCKING render sampai auth resolved
if (userId === '') return null
```

**Impact:**
- Halaman blank sampai `getUser()` selesai
- Delay 200-500ms sebelum konten muncul
- User melihat layar putih/hitam

---

### 2. ⚠️ **Dashboard - 5 Parallel Queries Tanpa Suspense**
**Lokasi:** `app/dashboard/page.tsx`

**Masalah:**
```typescript
// ❌ 5 queries parallel tanpa loading state yang baik
const { data: summary,   isLoading: loadingSummary }   = useDashboardSummary()
const { data: weekly,    isLoading: loadingWeekly }    = useWeeklyTaskStats()
const { data: subjects,  isLoading: loadingSubjects }  = useSubjectTaskStats()
const { data: upcoming,  isLoading: loadingUpcoming }  = useUpcomingTasks(5)
const { data: habits = [], isLoading: loadingHabits }  = useGetHabits()
```

**Impact:**
- 5 network requests sekaligus
- Setiap query menunggu auth check dulu
- Total delay: 500ms - 2s tergantung network
- Layout shift saat data masuk

---

### 3. ⚠️ **Splash Screen - Delay Tambahan**
**Lokasi:** `components/pwa/splash-screen.tsx`

**Masalah:**
```typescript
// ❌ Splash screen 1.5s + fade 400ms = 1.9s delay
const fadeTimer = setTimeout(() => setIsFadingOut(true), 1500)
const removeTimer = setTimeout(() => setIsVisible(false), 1900)
```

**Impact:**
- User harus tunggu 1.9s sebelum bisa interact
- Tidak perlu untuk web app (hanya untuk PWA)
- Menambah perceived loading time

---

### 4. ⚠️ **React Query Persist - Hydration Overhead**
**Lokasi:** `providers/query-provider.tsx`

**Masalah:**
```typescript
// ❌ PersistQueryClientProvider menambah overhead
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    maxAge: 1000 * 60 * 60 * 24, // 24h
  }}
>
```

**Impact:**
- Hydration dari localStorage memakan waktu
- Parsing JSON besar (semua cached queries)
- Delay 100-300ms saat initial load

---

### 5. ⚠️ **Stats Service - Multiple RPC Calls**
**Lokasi:** `features/stats/api/statsService.ts`

**Masalah:**
```typescript
// ❌ Setiap function call auth.getUser() lagi
async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser()
  // ...
}
```

**Impact:**
- 5 queries = 5x auth check
- Setiap auth check = 50-100ms
- Total overhead: 250-500ms

---

### 6. ⚠️ **Dashboard Layout - No Skeleton Optimization**
**Lokasi:** `app/dashboard/page.tsx`

**Masalah:**
- Skeleton components render tapi tidak smooth
- Banyak conditional rendering
- Layout shift saat data masuk

---

## 🎯 Solusi yang Akan Diterapkan

### 1. ✅ **Optimasi Query Provider**
- Render children immediately dengan loading state
- Jangan block render untuk auth check
- Show skeleton saat loading

### 2. ✅ **Reduce Splash Screen Duration**
- Kurangi dari 1.9s → 0.8s
- Atau hapus untuk web, hanya untuk PWA

### 3. ✅ **Optimize Dashboard Queries**
- Combine queries jadi 1 RPC call
- Atau gunakan React Suspense
- Implement proper loading states

### 4. ✅ **Cache Auth User**
- Cache user ID di memory
- Jangan call `getUser()` berkali-kali
- Reuse dari QueryProvider

### 5. ✅ **Lazy Load Components**
- Lazy load charts dan heavy components
- Code splitting untuk dashboard widgets
- Reduce initial bundle size

### 6. ✅ **Optimize React Query Config**
- Reduce staleTime untuk faster perceived load
- Disable persist untuk dashboard (data selalu fresh)
- Use placeholderData untuk smooth transitions

---

## 📊 Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Render | 2-3s | 0.5-1s | **60-70% faster** |
| Dashboard Load | 1-2s | 0.3-0.5s | **75% faster** |
| Splash Screen | 1.9s | 0.8s | **58% faster** |
| Auth Check | 5x calls | 1x call | **80% less** |
| Perceived Speed | Slow | Fast | **Much better UX** |

---

## 🚀 Implementation Priority

1. **HIGH**: Fix Query Provider blocking render
2. **HIGH**: Reduce splash screen duration
3. **HIGH**: Cache auth user ID
4. **MEDIUM**: Optimize dashboard queries
5. **MEDIUM**: Add better loading states
6. **LOW**: Lazy load components

---

## 🧪 Testing Plan

1. Test dengan Chrome DevTools Performance tab
2. Measure Time to Interactive (TTI)
3. Check Largest Contentful Paint (LCP)
4. Test di slow 3G network
5. Test di low-end devices

---

**Next Step:** Implement optimizations! 🚀
