"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect } from "react";
import type {
  User,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getError } from "@/utils/error.helper";

/**
 * Custom error type for authentication errors
 */
export type CustomAuthError = {
  message: string;
  status?: number;
};

/**
 * Auth store state and actions interface
 */
interface AuthStore {
  // State
  user: User | null;
  isLoading: boolean;
  error: CustomAuthError | null;

  // Actions
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: CustomAuthError | null) => void;

  // Auth operations
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<void>;
  signUp: (
    credentials: SignUpWithPasswordCredentials & { displayName: string }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (credentials: { email: string }) => Promise<void>;
  resetPassword: (credentials: { password: string }) => Promise<void>;
  
  // Initialize auth state
  initAuth: () => Promise<void>;
}

/**
 * Create the auth store with Zustand
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => {
      // Create Supabase client
      const supabase = createClient();
      
      return {
        // Initial state
        user: null,
        isLoading: true,
        error: null,

        // State setters
        setUser: (user) => set({ user }),
        setIsLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        // Initialize auth state and set up listeners
        initAuth: async () => {
          try {
            set({ isLoading: true, error: null });

            // First, try to get the session
            const {
              data: { session },
              error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) throw sessionError;

            if (session) {
              // If we have a session, get the user
              const {
                data: { user: currentUser },
                error: userError,
              } = await supabase.auth.getUser();
              if (userError) throw userError;
              set({ user: currentUser });
            } else {
              // No active session
              set({ user: null });
            }

            // Set up auth state change listener
            // Set up auth state change listener
            supabase.auth.onAuthStateChange(async (event, session) => {
              try {
                if (
                  event === "SIGNED_IN" ||
                  event === "TOKEN_REFRESHED" ||
                  event === "USER_UPDATED"
                ) {
                  // Only update user if we have a valid session
                  if (session) {
                    const {
                      data: { user: currentUser },
                      error: userError,
                    } = await supabase.auth.getUser();
                    if (userError) throw userError;
                    set({ user: currentUser });
                  } else {
                    set({ user: null });
                  }
                } else if (event === "SIGNED_OUT") {
                  set({ user: null });
                }
                set({ error: null });
              } catch (err) {
                console.error("Auth state change error:", err);
                set({ error: getError(err), user: null });
              } finally {
                set({ isLoading: false });
              }
            });

            // We can't unsubscribe in a clean way with Zustand like we could with useEffect
            // But the subscription will be garbage collected when the page refreshes
            // or the user navigates away
          } catch (err) {
            console.error("Error in initAuth:", err);
            set({ error: getError(err), user: null });
          } finally {
            set({ isLoading: false });
          }
        },

        // Auth operations
        signIn: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            const { error: signInError } = await supabase.auth.signInWithPassword(
              credentials
            );
            if (signInError) throw signInError;
          } catch (err) {
            console.error("Sign in error:", err);
            set({ error: getError(err) });
            throw err;
          } finally {
            set({ isLoading: false });
          }
        },

        signUp: async (
          credentials: SignUpWithPasswordCredentials & { displayName: string }
        ) => {
          set({ isLoading: true, error: null });
          try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { displayName, ...signupCredentials } = credentials;
            const { error: signUpError } = await supabase.auth.signUp(
              signupCredentials
            );
            if (signUpError) throw signUpError;
          } catch (err) {
            console.error("Sign up error:", err);
            set({ error: getError(err) });
            throw err;
          } finally {
            set({ isLoading: false });
          }
        },

        forgotPassword: async (credentials: { email: string }) => {
          set({ isLoading: true, error: null });
          try {
            const { error: resetPasswordError } =
              await supabase.auth.resetPasswordForEmail(credentials.email, {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
              });

            if (resetPasswordError) throw resetPasswordError;
          } catch (err) {
            console.error("Reset password error:", err);
            set({ error: getError(err) });
            throw err;
          } finally {
            set({ isLoading: false });
          }
        },

        resetPassword: async (credentials: { password: string }) => {
          set({ isLoading: true, error: null });
          try {
            const { error: resetPasswordError } = await supabase.auth.updateUser({
              password: credentials.password,
            });

            if (resetPasswordError) throw resetPasswordError;
          } catch (err) {
            console.error("Reset password error:", err);
            set({ error: getError(err) });
            throw err;
          } finally {
            set({ isLoading: false });
          }
        },

        signOut: async () => {
          set({ isLoading: true, error: null });
          try {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) throw signOutError;
            set({ user: null });
          } catch (err) {
            console.error("Sign out error:", err);
            set({ error: getError(err) });
            throw err;
          } finally {
            set({ isLoading: false });
          }
        },
      };
    },
    {
      name: "auth-storage", // Name for the localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({ user: state.user }), // Only persist the user object
    }
  )
);

/**
 * Helper hook to initialize auth on app load
 * This should be called in a layout or top-level component
 */
export function useInitAuth() {
  const initAuth = useAuthStore((state) => state.initAuth);
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);
}
