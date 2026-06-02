import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { login as loginApi, register as registerApi, logout as logoutApi, updateProfile as updateProfileApi, getBookmarks as getBookmarksApi, toggleBookmark as toggleBookmarkApi } from "../services/auth.service"
import { useAuthStore } from "../store/auth.store"
import type { LoginRequest, RegisterRequest, UpdateProfilePayload } from "../types"

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (response) => {
      setAuth(response.user, response.token)
      navigate("/dashboard")
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerApi(data),
    onSuccess: (response) => {
      setAuth(response.user, response.token)
    },
  })
}

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateProfileApi(data),
    onSuccess: (user) => {
      setUser(user)
    },
  })
}

export function useBookmarks() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarksApi,
    staleTime: 1000 * 30,
  })
}

export function useToggleBookmark() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: (docId: string) => toggleBookmarkApi(docId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
      if (user) {
        setUser({ ...user, bookmarkNoteIds: data.bookmarkNoteIds })
      }
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      logout()
      navigate("/")
    },
  })
}
