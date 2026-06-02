import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notesService } from "../services/notes.service"
import type { GeneratePayload } from "../types"

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: notesService.getAll,
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => notesService.getPost(id),
    enabled: !!id,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => notesService.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    },
  })
}

export function useGenerateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: GeneratePayload) => notesService.generate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; tags?: string[]; university?: string | null; course?: string | null; semester?: string | null } }) =>
      notesService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["document", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
  })
}
