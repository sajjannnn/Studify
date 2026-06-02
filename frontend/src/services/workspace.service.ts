import apiClient from "../lib/axios"
import type { QueryRequest, QueryResponse } from "../types"

export const workspaceService = {
  query: async (payload: QueryRequest) => {
    const { data } = await apiClient.post<QueryResponse>("/workspace/query", payload)
    return data
  },
}
