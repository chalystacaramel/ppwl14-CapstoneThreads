import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isGoogle?: boolean;
};

type AuthStore = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
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