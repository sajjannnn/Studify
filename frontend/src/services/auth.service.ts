import apiClient from "../lib/axios"
import type { AuthResponse, LoginRequest, RegisterRequest, UpdateProfilePayload, User, BookmarkResponse } from "../types"

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", data)
  return response.data
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/signup", data)
  return response.data
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout")
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me")
  return response.data
}

export async function updateProfile(data: UpdateProfilePayload): Promise<User> {
  const response = await apiClient.patch<{ message: string; user: User }>("/auth/me", data)
  return response.data.user
}

export async function toggleBookmark(docId: string): Promise<BookmarkResponse> {
  const response = await apiClient.post<BookmarkResponse>(`/auth/bookmarks/${docId}`)
  return response.data
}

export async function getBookmarks(): Promise<string[]> {
  const response = await apiClient.get<{ bookmarkNoteIds: string[] }>("/auth/bookmarks")
  return response.data.bookmarkNoteIds
}
