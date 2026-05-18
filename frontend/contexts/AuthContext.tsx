'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import api, { registerAuthTokenGetter, syncSessionFromFirebase } from '@/lib/api';
import { useAuthStore, type AuthUser } from '@/lib/store';

interface AuthContextValue {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, login, logout: clearStore } = useAuthStore();

  const refreshIdToken = useCallback(async (): Promise<string | null> => {
    const auth = getFirebaseAuth();
    const current = auth.currentUser;
    if (!current) return null;
    return current.getIdToken();
  }, []);

  useEffect(() => {
    registerAuthTokenGetter(refreshIdToken);
  }, [refreshIdToken]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setFirebaseUser(nextUser);
      try {
        if (nextUser) {
          const idToken = await nextUser.getIdToken();
          const profile = await syncSessionFromFirebase();
          login(idToken, profile);
        } else {
          clearStore();
        }
      } catch {
        clearStore();
        if (nextUser) {
          await signOut(auth);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [login, clearStore]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
    clearStore();
    delete api.defaults.headers.common.Authorization;
  }, [clearStore]);

  const value = useMemo(
    () => ({
      user,
      firebaseUser,
      loading,
      loginWithEmail,
      signUpWithEmail,
      loginWithGoogle,
      logout,
    }),
    [user, firebaseUser, loading, loginWithEmail, signUpWithEmail, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
