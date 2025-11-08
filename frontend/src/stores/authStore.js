import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      isLoading: false,
      user: null,
      authMethod: null,
      
      // Actions
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Check if user is authenticated
          const userData = await window.electronAPI?.checkAuth();
          if (userData) {
            set({ isAuthenticated: true, user: userData, isLoading: false });
          } else {
            set({ isAuthenticated: false, user: null, isLoading: false });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ isAuthenticated: false, user: null, isLoading: false });
        }
      },
      
      loginWithWallet: async (walletType) => {
        set({ isLoading: true });
        try {
          const userData = await window.electronAPI?.loginWithWallet(walletType);
          set({ 
            isAuthenticated: true, 
            user: userData, 
            authMethod: 'wallet',
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      loginWithSocial: async (provider) => {
        set({ isLoading: true });
        try {
          const userData = await window.electronAPI?.loginWithSocial(provider);
          set({ 
            isAuthenticated: true, 
            user: userData, 
            authMethod: 'social',
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      loginWithEmail: async (email, password) => {
        set({ isLoading: true });
        try {
          const userData = await window.electronAPI?.loginWithEmail(email, password);
          set({ 
            isAuthenticated: true, 
            user: userData, 
            authMethod: 'email',
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          await window.electronAPI?.logout();
          set({ 
            isAuthenticated: false, 
            user: null, 
            authMethod: null,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        authMethod: state.authMethod
      })
    }
  )
);
