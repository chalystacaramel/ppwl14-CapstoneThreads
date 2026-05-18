<<<<<<< HEAD
// apps/frontend/src/stores/auth.store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AuthUser = {
=======
import { create } from "zustand"
import { persist } from "zustand/middleware"

type User = {
>>>>>>> 7397ce46e8b8638c965fbbf288adb3afa417592f
  id: string
  name: string
  email: string
  avatarUrl?: string
<<<<<<< HEAD
  isGoogle?: boolean
}

type AuthStore = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
=======
}

type AuthStore = {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean

  setAuth: (user: User, token: string) => void
>>>>>>> 7397ce46e8b8638c965fbbf288adb3afa417592f
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
<<<<<<< HEAD
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: "auth-storage" }
=======
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
>>>>>>> 7397ce46e8b8638c965fbbf288adb3afa417592f
  )
)