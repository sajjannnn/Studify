import { useMutation } from "@tanstack/react-query"
import { workspaceService } from "../services/workspace.service"
import type { QueryRequest } from "../types"

export function useQueryAI() {
  return useMutation({
    mutationFn: (payload: QueryRequest) => workspaceService.query(payload),
  })
}
