import { create } from "zustand"
import { persist } from "zustand/middleware"

type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

type AuthStore = {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean

  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false })
    }),
    {
      name: "auth-storage"
    }
  )
)