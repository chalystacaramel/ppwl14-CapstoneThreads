import type { User } from '@/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    // Actions
    setUser: (user: User) => void;
    setAuth: (user: User, token?: string) => void;
    logout: () => void;
    updateProfile: (updatedFields: Partial<Pick<User, 'name' | 'avatar_url' | 'bio'>>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            hasHydrated: false,

            setUser: (user) => set({ user }),
            setAuth: (user, token) =>
                set({ user, token, isAuthenticated: true }),

            logout: () =>
                set({ user: null, token: null, isAuthenticated: false }),

            updateProfile: (updatedFields) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedFields } : null,
                }))
        }),
        {
            name: 'auth-storage', // Nama key di localStorage
            storage: createJSONStorage(() => localStorage), // Menyimpan state agar tidak hilang saat di-refresh
        }
    )
);