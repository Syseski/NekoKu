import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phoneNumber?: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('nekoku_auth_token'),
  isLoading: true,

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data.data;
    localStorage.setItem('nekoku_auth_token', token);
    set({ user, token, isLoading: false });
  },

  register: async (fullName, email, password, phoneNumber) => {
    const res = await api.post('/auth/register', { fullName, email, password, phoneNumber });
    const { user, token } = res.data.data;
    localStorage.setItem('nekoku_auth_token', token);
    set({ user, token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('nekoku_auth_token');
    set({ user: null, token: null, isLoading: false });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('nekoku_auth_token');
    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data, isLoading: false });
    } catch {
      localStorage.removeItem('nekoku_auth_token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
