import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api/client';
import type { User } from '@nexmarto/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      setAuth: (user, accessToken) => {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, accessToken, isLoading: false });
      },

      setAccessToken: (token) => {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ accessToken: token });
      },

      logout: () => {
        delete apiClient.defaults.headers.common['Authorization'];
        set({ user: null, accessToken: null });
        // Optional: call the backend to clear the httpOnly cookie
        apiClient.post('/auth/logout').catch(() => {});
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);
