import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { getApiErrorMessage } from '../lib/utils';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  isActive: boolean;
  doctorProfile?: {
    id: string;
    specialty: string;
    bio?: string;
    basePrice: number;
    schedules: unknown[];
    services: unknown[];
  } | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (userEmail: string, userPass: string) => Promise<void>;
  register: (regData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setAccessToken: (newToken: string) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = res.data.data;
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false, error: getApiErrorMessage(err) });
          throw err;
        }
      },

      register: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', data);
          const { user, accessToken, refreshToken } = res.data.data;
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false, error: getApiErrorMessage(err) });
          throw err;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.data, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setAccessToken: (token: string) => set({ accessToken: token }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'cardiocenter-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
