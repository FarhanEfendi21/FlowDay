// ============================================================
// FlowDay – Subject Service
// CRUD mata kuliah per-user via Supabase
// RLS di DB menjamin isolasi — user hanya bisa akses data sendiri
// ============================================================

import { createBrowserClient } from '@supabase/ssr'
import { type Subject, mapSubjectRow } from '@/features/subjects/types'

// ─── Client ──────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

class ServiceError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'ServiceError'
  }
}

// ─── getCurrentUserId ─────────────────────────────────────────
async function getCurrentUserId(): Promise<string> {
  const supabase = getClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user)
    throw new ServiceError('[subjects] User not authenticated')
  return user.id
}

// ─── getSubjects ──────────────────────────────────────────────
/**
 * Ambil semua mata kuliah milik user yang sedang login.
 * Diurutkan berdasarkan waktu dibuat (ascending).
 */
export async function getSubjects(): Promise<Subject[]> {
  const supabase = getClient()
  const userId   = await getCurrentUserId()

  // Try with has_practicum column first
  let { data, error } = await supabase
    .from('user_subjects')
    .select('id, user_id, name, has_practicum, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  // If column doesn't exist yet, fallback to query without it
  if (error && error.message.includes('has_practicum')) {
    console.warn('[getSubjects] Column has_practicum not found, using fallback')
    const fallback = await supabase
      .from('user_subjects')
      .select('id, user_id, name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    
    data = fallback.data
    error = fallback.error
  }

  if (error) throw new ServiceError(`[getSubjects] ${error.message}`, error)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any[]) ?? []).map(mapSubjectRow)
}

// ─── addSubject ───────────────────────────────────────────────
/**
 * Tambah mata kuliah baru untuk user yang sedang login.
 * Constraint UNIQUE (user_id, name) di DB mencegah duplikasi.
 */
export async function addSubject(name: string, hasPracticum: boolean = false): Promise<Subject> {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > 100)
    throw new ServiceError('[addSubject] Nama mata kuliah tidak valid')

  const supabase = getClient()
  const userId   = await getCurrentUserId()

  // Try with has_practicum column first
  let { data, error } = await supabase
    .from('user_subjects')
    .insert({ user_id: userId, name: trimmed, has_practicum: hasPracticum })
    .select('id, user_id, name, has_practicum, created_at')
    .single()

  // If column doesn't exist yet, fallback to insert without it
  if (error && (error.message.includes('has_practicum') || error.code === '42703')) {
    console.warn('[addSubject] Column has_practicum not found, using fallback')
    const fallback = await supabase
      .from('user_subjects')
      .insert({ user_id: userId, name: trimmed })
      .select('id, user_id, name, created_at')
      .single()
    
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    // Kode 23505 = unique_violation (nama sudah ada)
    if (error.code === '23505')
      throw new ServiceError(`[addSubject] Mata kuliah "${trimmed}" sudah ada`)
    throw new ServiceError(`[addSubject] ${error.message}`, error)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mapSubjectRow(data as any)
}

// ─── removeSubject ────────────────────────────────────────────
/**
 * Hapus mata kuliah berdasarkan ID.
 * RLS memastikan hanya pemilik yang bisa menghapus.
 */
export async function removeSubject(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('user_subjects')
    .delete()
    .eq('id', id)

  if (error) throw new ServiceError(`[removeSubject] ${error.message}`, error)
}

// ─── getSubjectNames ──────────────────────────────────────────
/**
 * Helper: kembalikan hanya array nama (string[]) mata kuliah user.
 * Digunakan di dropdown task form.
 */
export async function getSubjectNames(): Promise<string[]> {
  const subjects = await getSubjects()
  return subjects.map((s) => s.name)
}
