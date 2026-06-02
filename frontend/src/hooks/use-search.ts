import { useQuery } from "@tanstack/react-query"
import { searchService } from "../services/search.service"
import type { SearchParams } from "../types"

export function useFeed(params?: { university?: string; course?: string; semester?: string }) {
  return useQuery({
    queryKey: ["feed", params],
    queryFn: () => searchService.feed(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ["search", params],
    queryFn: () => searchService.search(params),
    enabled: !!params.q || !!params.tag,
    staleTime: 1000 * 30,
  })
}
