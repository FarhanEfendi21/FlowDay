// ============================================================
// FlowDay – Supabase Database Types
// Generated from the schema, manually typed for type safety
// ============================================================

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus   = 'todo' | 'done'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:         string
          name:       string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id:          string
          name?:       string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?:       string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id:          string
          user_id:     string
          title:       string
          description: string | null
          subject:     string
          priority:    TaskPriority
          status:      TaskStatus
          due_date:    string
          created_at:  string
          updated_at:  string
          deleted_at:  string | null
        }
        Insert: {
          id?:          string
          user_id:      string
          title:        string
          description?: string | null
          subject?:     string
          priority?:    TaskPriority
          status?:      TaskStatus
          due_date:     string
          created_at?:  string
          updated_at?:  string
          deleted_at?:  string | null
        }
        Update: {
          title?:       string
          description?: string | null
          subject?:     string
          priority?:    TaskPriority
          status?:      TaskStatus
          due_date?:    string
          updated_at?:  string
          deleted_at?:  string | null
        }
      }
      habits: {
        Row: {
          id:             string
          user_id:        string
          title:          string
          current_streak: number
          created_at:     string
          updated_at:     string
          deleted_at:     string | null
        }
        Insert: {
          id?:             string
          user_id:         string
          title:           string
          current_streak?: number
          created_at?:     string
          updated_at?:     string
          deleted_at?:     string | null
        }
        Update: {
          title?:          string
          current_streak?: number
          updated_at?:     string
          deleted_at?:     string | null
        }
      }
      habit_logs: {
        Row: {
          id:         string
          habit_id:   string
          user_id:    string
          log_date:   string
          completed:  boolean
          created_at: string
        }
        Insert: {
          id?:        string
          habit_id:   string
          user_id:    string
          log_date:   string
          completed?: boolean
          created_at?: string
        }
        Update: {
          completed?: boolean
        }
      }
    }
    Enums: {
      task_priority: TaskPriority
      task_status:   TaskStatus
    }
  }
}
