"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "@firebase/auth";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error";
import {
  getFirebaseAuth,
  getFirebaseConfigError,
} from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  initializationError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configurationError = getFirebaseConfigError();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!configurationError);
  const [listenerError, setListenerError] = useState<string | null>(null);

  useEffect(() => {
    if (configurationError) {
      return;
    }

    return onAuthStateChanged(
      getFirebaseAuth(),
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      },
      (error: Error) => {
        setListenerError(getAuthErrorMessage(error));
        setLoading(false);
      },
    );
  }, [configurationError]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      initializationError: listenerError || configurationError,
      signInWithGoogle: async () => {
        await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      },
      signOut: async () => {
        await firebaseSignOut(getFirebaseAuth());
      },
    }),
    [configurationError, listenerError, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
