import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { summariesService } from "../services/summaries.service"

export function useSummaries(docId: string) {
  return useQuery({
    queryKey: ["summaries", docId],
    queryFn: () => summariesService.list(docId),
    enabled: !!docId,
  })
}

export function useSummary(docId: string, summaryId: string) {
  return useQuery({
    queryKey: ["summary", docId, summaryId],
    queryFn: () => summariesService.get(docId, summaryId),
    enabled: !!docId && !!summaryId,
  })
}

export function useGenerateSummary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ docId, prompt }: { docId: string; prompt: string }) =>
      summariesService.generate(docId, prompt),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["summaries", variables.docId] })
    },
  })
}

export function useDeleteSummary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (summaryId: string) => summariesService.remove(summaryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summaries"] })
    },
  })
}

export function useChatWithSummary() {
  return useMutation({
    mutationFn: ({
      summaryId,
      query,
      docIds,
    }: {
      summaryId: string
      query: string
      docIds?: string[]
    }) => summariesService.chat(summaryId, query, docIds),
  })
}

export function useUpdateSummary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ summaryId, payload }: { summaryId: string; payload: { prompt?: string; content?: string } }) =>
      summariesService.update(summaryId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["summary"] })
      queryClient.invalidateQueries({ queryKey: ["summaries"] })
    },
  })
}

export function useSummaryCount() {
  return useQuery({
    queryKey: ["summary-count"],
    queryFn: () => summariesService.getCount(),
  })
}