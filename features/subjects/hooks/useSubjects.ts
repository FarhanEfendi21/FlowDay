// ============================================================
// FlowDay – Subject Hooks (React Query)
// CRUD mata kuliah per-user dengan optimistic updates
// ============================================================

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  getSubjects,
  getSubjectNames,
  addSubject,
  removeSubject,
} from '@/features/subjects/api/subjectService'
import type { Subject } from '@/features/subjects/types'
import { toast } from 'sonner'

// ─── Query Key Factory ────────────────────────────────────────
export const subjectKeys = {
  all:   () => ['subjects']              as const,
  list:  () => ['subjects', 'list']      as const,
  names: () => ['subjects', 'names']     as const,
} as const

// ─── useGetSubjects ───────────────────────────────────────────
/**
 * Ambil semua mata kuliah user sebagai objek Subject[].
 * Digunakan di Settings page.
 */
export function useGetSubjects() {
  return useQuery<Subject[], Error>({
    queryKey: subjectKeys.list(),
    queryFn:  getSubjects,
    staleTime: 5 * 60 * 1000, // 5 menit — jarang berubah
  })
}

// ─── useGetSubjectNames ───────────────────────────────────────
/**
 * Ambil mata kuliah user sebagai string[].
 * Digunakan di dropdown Task form.
 */
export function useGetSubjectNames() {
  return useQuery<string[], Error>({
    queryKey: subjectKeys.names(),
    queryFn:  getSubjectNames,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── useAddSubject ────────────────────────────────────────────
export function useAddSubject() {
  const queryClient = useQueryClient()

  return useMutation<Subject, Error, { name: string; hasPracticum: boolean }>({
    mutationFn: ({ name, hasPracticum }) => addSubject(name, hasPracticum),
    onSuccess: (newSubject) => {
      // Update cache list langsung tanpa refetch
      queryClient.setQueryData<Subject[]>(
        subjectKeys.list(),
        (old) => [...(old ?? []), newSubject]
      )
      // Invalidate names cache supaya dropdown ikut update
      queryClient.invalidateQueries({ queryKey: subjectKeys.names() })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })
}

// ─── useRemoveSubject ─────────────────────────────────────────
export function useRemoveSubject() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: removeSubject,
    // Optimistic update: hapus dari cache langsung
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: subjectKeys.all() })

      const previous = queryClient.getQueryData<Subject[]>(subjectKeys.list())

      queryClient.setQueryData<Subject[]>(
        subjectKeys.list(),
        (old) => old?.filter((s) => s.id !== id) ?? []
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      const ctx = context as { previous?: Subject[] }
      if (ctx?.previous) {
        queryClient.setQueryData(subjectKeys.list(), ctx.previous)
      }
      toast.error('Gagal menghapus mata kuliah')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all() })
    },
  })
}
