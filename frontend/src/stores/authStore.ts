import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { 
  signUpWithEmailAndPassword,
  signInEmailPassword,
  signOutUser,
  onAuthStateChange,
  getAuthErrorMessage
} from '../lib/auth';
import type { AuthError } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => (() => void) | undefined;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        error: null
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      signUp: async (email, password, name) => {
        const { setUser, setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          const user = await signUpWithEmailAndPassword(email, password, name);
          setUser(user);
        } catch (error) {
          const errorMessage = getAuthErrorMessage(error as AuthError);
          setError(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      signIn: async (email, password) => {
        const { setUser, setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          const user = await signInEmailPassword(email, password);
          setUser(user);
        } catch (error) {
          const errorMessage = getAuthErrorMessage(error as AuthError);
          setError(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      signOut: async () => {
        const { setUser, setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          await signOutUser();
          setUser(null);
        } catch (error) {
          const errorMessage = getAuthErrorMessage(error as AuthError);
          setError(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      initializeAuth: () => {
        const { setUser, setLoading } = get();
        
        setLoading(true);
        
        // Listen for auth state changes
        const unsubscribe = onAuthStateChange((user) => {
          setUser(user);
          setLoading(false);
        });

        // Return cleanup function
        return unsubscribe;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
); 
