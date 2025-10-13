import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          const { data } = await authAPI.login(email, password);
          localStorage.setItem('auth_token', data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true
          });
        } catch (error) {
          throw error;
        }
      },
      
      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },
      
      checkAuth: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            set({ user: null, token: null, isAuthenticated: false });
            return;
          }
          
          const { data } = await authAPI.getCurrentUser();
          set({
            user: data.user,
            token,
            isAuthenticated: true
          });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);


