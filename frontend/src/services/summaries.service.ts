import apiClient from "../lib/axios"
import type { Summary, QueryResponse } from "../types"

export const summariesService = {
  generate: async (docId: string, prompt: string): Promise<Summary> => {
    const { data } = await apiClient.post<Summary>("/workspace/summaries/generate", { docId, prompt })
    return data
  },

  list: async (docId: string): Promise<Summary[]> => {
    const { data } = await apiClient.get<Summary[]>(`/workspace/summaries/${docId}`)
    return data
  },

  get: async (docId: string, summaryId: string): Promise<Summary> => {
    const { data } = await apiClient.get<Summary>(`/workspace/summaries/${docId}/${summaryId}`)
    return data
  },

  chat: async (summaryId: string, query: string, docIds?: string[]): Promise<QueryResponse> => {
    const { data } = await apiClient.post<QueryResponse>(`/workspace/summaries/${summaryId}/chat`, { query, docIds })
    return data
  },

  remove: async (summaryId: string): Promise<void> => {
    await apiClient.delete(`/workspace/summaries/${summaryId}`)
  },

  update: async (summaryId: string, payload: { prompt?: string; content?: string }): Promise<Summary> => {
    const { data } = await apiClient.patch<Summary>(`/workspace/summaries/${summaryId}`, payload)
    return data
  },

  getCount: async (): Promise<{ count: number }> => {
    const { data } = await apiClient.get<{ count: number }>("/workspace/summaries/count")
    return data
  },
}