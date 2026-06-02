import apiClient from "../lib/axios"
import type { Document, SearchParams } from "../types"

export const searchService = {
  feed: async (params?: { university?: string; course?: string; semester?: string }) => {
    const { data } = await apiClient.get<Document[]>("/searchservie/feed", { params })
    return data
  },

  search: async (params: SearchParams) => {
    const { data } = await apiClient.get<Document[]>("/searchservie/search", { params })
    return data
  },
}
