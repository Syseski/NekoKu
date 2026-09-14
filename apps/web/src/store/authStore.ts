import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phoneNumber?: string) => Promise<void>;
  setUser: (user: User | null) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('nekoku_auth_token'),
  isLoading: true,
  isAuthModalOpen: false,

  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  setUser: (user) => set({ user }),

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

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success && res.data.data) {
      set({ user: res.data.data });
    }
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
