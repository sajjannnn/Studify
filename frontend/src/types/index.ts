export type University = "DU" | "IPU"

export type Semester = "SEM1" | "SEM2" | "SEM3" | "SEM4" | "SEM5" | "SEM6" | "SEM7" | "SEM8"

export interface User {
  id: string
  name: string
  email: string
  university: University
  course: string
  semester: Semester
  documentIds: string[]
  noteIds: string[]
  bookmarkNoteIds: string[]
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  university?: string
  course?: string
  semester?: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface ApiError {
  message: string
  error?: string
}

export type DocType = "UPLOADED" | "GENERATED"
export type EmbeddingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

export interface Document {
  id: string
  userId: string
  title: string
  docId: string
  type: DocType
  tags: string[]
  embeddingStatus: EmbeddingStatus
  university: University | null
  course: string | null
  semester: Semester | null
  pdfUrl?: string
  createdAt: string
  updatedAt: string
}

export interface QueryRequest {
  query: string
  docIds?: string[]
}

export interface QueryResponse {
  answer: string
  sources: Array<{
    pageContent: string
    metadata: Record<string, unknown>
  }>
}

export interface SearchParams {
  q?: string
  tag?: string
  university?: string
  course?: string
  semester?: string
}

export interface UploadPayload {
  pdf: File
  title?: string
  tags?: string[]
  university?: string
  course?: string
  semester?: string
}

export interface BookmarkResponse {
  bookmarked: boolean
  bookmarkNoteIds: string[]
}

export interface UpdateProfilePayload {
  name?: string
  university?: string
  course?: string
  semester?: string
}

export interface Summary {
  id: string
  documentId: string
  userId: string
  userName: string
  prompt: string
  content: string
  viewCount: number
  createdAt: string
}

export interface GeneratePayload {
  text: string
  title?: string
  tags?: string[]
  university?: string
  course?: string
  semester?: string
}
