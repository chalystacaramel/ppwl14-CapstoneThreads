// apps/frontend/src/stores/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  isGoogle?: boolean;
};

type AuthStore = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  // FIX issue #2: tambah updateUser untuk update partial user data
  updateUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
  getToken: () => string | null;
  setHasHydrated: (state: boolean) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      // FIX issue #2: update user di store tanpa logout
      updateUser: (updates) =>
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

      getToken: () => get().accessToken,

      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);