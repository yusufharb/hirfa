import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  loadInitialState: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setTokens: (token, refreshToken) => {
    SecureStore.setItemAsync('token', token);
    SecureStore.setItemAsync('refreshToken', refreshToken);
    set({ token, refreshToken });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },
  updateProfile: (data) =>
    set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
  loadInitialState: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      // In a real app, you would also fetch the user profile here using the token
      if (token) {
        set({ token, refreshToken, isAuthenticated: true }); // Assume true for now
      }
    } catch (e) {
      console.error('Failed to load auth state', e);
    } finally {
      set({ isLoading: false });
    }
  },
}));