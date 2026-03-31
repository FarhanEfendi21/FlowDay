// ============================================================
// FlowDay – Subjects Feature — Public API
// ============================================================

export {
  useGetSubjects,
  useGetSubjectNames,
  useAddSubject,
  useRemoveSubject,
  subjectKeys,
} from '@/features/subjects/hooks/useSubjects'

export type { Subject, CreateSubjectInput } from '@/features/subjects/types'
