"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import type {
  User,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getError } from "@/utils/error.hrlper";

type AuthError = {
  message: string;
  status?: number;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<void>;
  signUp: (
    credentials: SignUpWithPasswordCredentials & { displayName: string }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (credentials: { email: string }) => Promise<void>;
  resetPassword: (credentials: { password: string }) => Promise<void>;
  error: AuthError | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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
        setUser(currentUser);
      } else {
        // No active session
        setUser(null);
      }
    } catch (err) {
      console.error("Error in fetchUser:", err);
      setError(getError(err));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth]);

  useEffect(() => {
    // Initial fetch
    fetchUser();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
            setUser(currentUser);
          } else {
            setUser(null);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
        setError(null);
      } catch (err) {
        console.error("Auth state change error:", err);
        setError(getError(err));
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUser, supabase.auth]);

  const signIn = useCallback(
    async (credentials: SignInWithPasswordCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword(
          credentials
        );
        if (signInError) throw signInError;
      } catch (err) {
        console.error("Sign in error:", err);
        setError(getError(err));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase.auth]
  );

  const signUp = useCallback(
    async (
      credentials: SignUpWithPasswordCredentials & { displayName: string }
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { displayName, ...signupCredentials } = credentials;
        const { error: signUpError } = await supabase.auth.signUp(
          signupCredentials
        );
        if (signUpError) throw signUpError;
      } catch (err) {
        console.error("Sign up error:", err);
        setError(getError(err));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase.auth]
  );

  const forgotPassword = useCallback(
    async (credentials: { email: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error: resetPasswordError } =
          await supabase.auth.resetPasswordForEmail(credentials.email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
          });

        if (resetPasswordError) throw resetPasswordError;
      } catch (err) {
        console.error("Reset password error:", err);
        setError(getError(err));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase.auth]
  );

  const resetPassword = useCallback(
    async (credentials: { password: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error: resetPasswordError } = await supabase.auth.updateUser({
          password: credentials.password,
        });

        if (resetPasswordError) throw resetPasswordError;
      } catch (err) {
        console.error("Reset password error:", err);
        setError(getError(err));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase.auth]
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
      setError(getError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      forgotPassword,
      resetPassword,
      error,
    }),
    [
      user,
      isLoading,
      error,
      signIn,
      signUp,
      signOut,
      forgotPassword,
      resetPassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
