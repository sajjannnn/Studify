import { create } from "zustand"
import type { User } from "../types"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("studify-user") ?? "null"),
  token: localStorage.getItem("studify-token"),
  isAuthenticated: !!localStorage.getItem("studify-token"),

  setAuth: (user: User, token: string) => {
    localStorage.setItem("studify-token", token)
    localStorage.setItem("studify-user", JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  setUser: (user: User) => {
    localStorage.setItem("studify-user", JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    localStorage.removeItem("studify-token")
    localStorage.removeItem("studify-user")
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
