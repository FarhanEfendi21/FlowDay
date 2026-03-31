// ============================================================
// FlowDay – Subject Types
// ============================================================

export interface Subject {
  id:        string
  userId:    string
  name:      string
  createdAt: string
}

export interface CreateSubjectInput {
  name: string
}

// ─── Mapper ──────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSubjectRow(row: any): Subject {
  return {
    id:        row.id,
    userId:    row.user_id,
    name:      row.name,
    createdAt: row.created_at,
  }
}
