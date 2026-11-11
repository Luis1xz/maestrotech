export type MaTechDocumentStatus =
  | 'pending'
  | 'processing'
  | 'published'
  | 'error'
  | 'archived'

export interface MaTechDocument {
  id: string
  course_id: string
  title: string
  file_url: string
  file_name: string
  file_type: string
  file_size: number
  status: MaTechDocumentStatus
  error_message?: string | null
  total_chunks: number
  total_tokens: number
  uploaded_by?: string | null
  uploaded_by_name?: string | null
  course_title?: string | null
  created_at: string
  updated_at: string
}

export interface MaTechSourceCitation {
  chunk_id?: string
  document_id: string
  document_title: string
  page_number?: number
  excerpt: string
  similarity?: number
}

export interface MaTechChunk {
  id: string
  document_id: string
  course_id: string
  chunk_index: number
  content: string
  page_number?: number
  metadata?: Record<string, unknown>
  similarity?: number
  created_at: string
}

export interface MaTechTeacherPermission {
  id: string
  teacher_id: string
  course_id: string
  can_upload: boolean
  can_publish: boolean
  can_delete: boolean
  granted_by?: string | null
  teacher_name?: string
  teacher_email?: string
  course_title?: string
  created_at: string
  updated_at: string
}

export interface MaTechConversation {
  id: string
  user_id: string
  course_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface MaTechMessage {
  id: string
  conversation_id: string
  sender_role: 'user' | 'assistant' | 'system'
  content: string
  sources: MaTechSourceCitation[]
  tokens_used: number
  created_at: string
}

export interface MaTechSettings {
  id: string
  daily_limit_per_student: number
  monthly_limit_per_student: number
  cooldown_seconds: number
  max_concurrent_requests: number
  max_question_chars: number
  max_context_chunks: number
  gemini_model: string
  embedding_model: string
  global_budget_tokens: number
  updated_at: string
}

export interface MaTechAuditLog {
  id: string
  actor_id?: string | null
  actor_name?: string | null
  action: string
  target_type: 'document' | 'permission' | 'setting' | 'system'
  target_id?: string | null
  target_title?: string | null
  course_id?: string | null
  course_title?: string | null
  details: Record<string, unknown>
  created_at: string
}

export interface MaTechUsageStats {
  totalQuestions: number
  activeUsers: number
  totalTokens: number
  dailyQuestions: number
  monthlyQuestions: number
  quotaPercentage: number
  errorCount: number
  byCourse: { course_id: string; course_title: string; count: number; tokens: number }[]
}
