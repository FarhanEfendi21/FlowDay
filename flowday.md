#

---

# 1. PROJECT OVERVIEW

## Nama

**FlowDay — Student Task & Habit Planner with Analytics**

### Typography

- Gunakan **Plus Jakarta Sans** sebagai font utama di seluruh aplikasi
- Gunakan hierarchy yang jelas (heading, subheading, body)
- Kesan yang ingin dicapai: clean, modern, akademis, dan profesional

## Tujuan

Membantu **mahasiswa** mengatur tugas kuliah, deadline, dan kebiasaan produktif agar lebih terstruktur, konsisten, dan tidak kewalahan.

## Nilai Portofolio

Project ini menunjukkan:

- Fullstack capability (Next.js + Supabase)
- Clean architecture (feature-based)
- Server state management (React Query)
- UX yang relevan dengan real user (mahasiswa)

---

# 2. PRODUCT REQUIREMENT DOCUMENT (PRD)

## Target User

- Mahasiswa aktif
- Mahasiswa dengan banyak tugas & deadline
- Mahasiswa yang ingin membangun habit produktif

## Problem Statement

Mahasiswa sering:

- Lupa deadline tugas
- Tidak punya sistem tracking yang rapi
- Sulit menjaga konsistensi habit belajar

## Solution

FlowDay menyediakan:

- Task planner khusus tugas kuliah
- Habit tracker untuk rutinitas belajar
- Dashboard visual untuk monitoring progress

## Core Features (MVP)

### 1. Task Management (Kuliah)

- Tambah tugas
- Deadline
- Prioritas (Low / Medium / High)
- Status (Todo / Done)
- Kategori (Mata Kuliah)

### 2. Habit Tracker

- Habit harian (belajar, olahraga, dll)
- Tracking checklist harian
- Streak

### 3. Dashboard

- Jumlah tugas selesai
- Deadline terdekat
- Habit streak
- Progress mingguan

### 4. UX Features

- Dark / Light mode
- Responsive
- Empty state
- Loading state

## Design Principle (UPDATED)

- Typography menjadi fokus utama desain
- Gunakan **Plus Jakarta Sans** secara konsisten di seluruh halaman
- Gunakan ukuran font yang terstruktur (heading besar, body nyaman dibaca)
- Prioritaskan readability untuk mahasiswa (tidak terlalu kecil, tidak terlalu padat)
- Gunakan spacing yang lega untuk meningkatkan fokus saat membaca tugas

## Success Metrics

- User bisa melihat deadline dengan jelas
- User lebih konsisten menyelesaikan tugas
- UI terasa ringan dan cepat

---


# 3. TECH STACK

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Auth + DB)
- React Query
- React Hook Form + Zod

---

# 4. CLEAN ARCHITECTURE (FINAL)

## Struktur Folder

```
/src
  /app
    /login
    /register
    /dashboard
      /tasks
      /habits
      /analytics
      /settings

  /components
    /ui
    /layout

  /features
    /tasks
      /api
      /hooks
      /types
      /components

    /habits
      /api
      /hooks
      /types
      /components

  /lib
    supabaseClient.ts

  /providers
    query-provider.tsx
```

## Konsep

- Feature-based
- API terpisah dari UI
- Hooks sebagai abstraction layer
- UI hanya consume data

---

# 5. DATABASE (SIMPLIFIED)

### profiles

- id
- name
- avatar\_url

### tasks

- id
- user\_id
- title
- description
- priority
- status
- due\_date
- subject (mata kuliah)

### habits

- id
- user\_id
- title
- current\_streak

### habit\_logs

- id
- habit\_id
- date
- completed

---

# 6. UI BREAKDOWN

## Landing Page

- Hero ("Kelola Tugas Kuliah Lebih Mudah")
- Feature section (deadline, habit, analytics)
- CTA

## Auth Page

- Centered login/register form

## Dashboard

- Stats (task selesai, deadline, streak)
- Chart progress
- Recent tasks

## Tasks Page

- Add task
- Filter (mata kuliah, status)
- Task list

## Habits Page

- Habit list
- Daily tracker

## Analytics

- Weekly progress
- Habit consistency

## Settings

- Profile
- Theme toggle
- Logout

## Layout

- Sidebar (menu utama)
- Topbar (search, theme, avatar)

---

# 7. DAFTAR KOMPONEN FINAL

## Core Layout

- Sidebar
- Topbar
- LayoutWrapper

## Dashboard

- StatsCard
- ProgressChart
- RecentTaskList

## Task

- TaskCard
- TaskList
- TaskDialog
- TaskFilter

## Habit

- HabitCard
- HabitDialog
- HabitTracker

## Shared UI (shadcn)

- Button
- Input
- Textarea
- Select
- Dialog
- Dropdown
- Badge
- Checkbox
- Tabs
- Toast

---

