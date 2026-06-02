import apiClient from "../lib/axios"
import type { Document, GeneratePayload } from "../types"

export const notesService = {
  getAll: async () => {
    const { data } = await apiClient.get<Document[]>("/notesservice/posts")
    return data
  },

  getPost: async (id: string) => {
    const { data } = await apiClient.get<Document>(`/notesservice/posts/${id}`)
    return data
  },

  upload: async (payload: FormData) => {
    const { data } = await apiClient.post<Document>("/notesservice/posts", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<Document>(`/notesservice/posts/${id}`)
    return data
  },

  generate: async (payload: GeneratePayload) => {
    const { data } = await apiClient.post<Document>("/notesservice/posts/generate", payload)
    return data
  },

  update: async (id: string, payload: { title?: string; tags?: string[]; university?: string | null; course?: string | null; semester?: string | null }) => {
    const { data } = await apiClient.patch<Document>(`/notesservice/posts/${id}`, payload)
    return data
  },
}
