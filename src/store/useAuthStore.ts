import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  adminToken: string;
  adminProfileName: string;
  
  // Actions
  login: (token: string, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      adminToken: '',
      adminProfileName: 'Admin Premium',
      
      login: (token, name) => set({ adminToken: token, adminProfileName: name }),
      logout: () => set({ adminToken: '', adminProfileName: 'Admin Premium' }),
    }),
    {
      name: 'piloneko-auth-storage', // name of item in storage (must be unique)
      // Defaults to localStorage which is fine for UI state, but actual API calls should use cookies if refactored fully.
      // For now, we persist token in localStorage just so the UI remembers login state on refresh.
      // A more secure implementation would use HTTP-Only cookies, but we keep this for UI transitions.
    }
  )
);
