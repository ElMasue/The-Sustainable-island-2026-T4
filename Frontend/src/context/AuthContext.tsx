import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  fullName: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  /** Update display name in Auth and public.users */
  updateProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // listen for auth state changes
    supabase.auth.getSession().then(({ data }) => {
      console.log('[Auth] initial session', data.session);
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, sess) => {
        console.log('[Auth] state change', event, sess);
        setSession(sess);
        setUser(sess?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ensure we have a row in our "users" table for every auth user
  useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          provider: user.app_metadata?.provider ??
            (user.identities?.[0]?.provider ?? 'email'),
          full_name: user.user_metadata?.full_name ?? null,
        })
        .then(({ error }) => {
          if (error) console.error('upsert profile error', error);
        });
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // return the raw response so callers can inspect session/data
  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Save as both keys: full_name is used by our app,
        // display_name is the canonical field shown in the Supabase Auth dashboard.
        data: { full_name: fullName, display_name: fullName },
      },
    });
    if (response.error) throw response.error;
    return response;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (displayName: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName, display_name: displayName },
    });
    if (error) throw error;
    // Also sync to public.users table
    if (user) {
      await supabase
        .from('users')
        .upsert({ id: user.id, email: user.email, full_name: displayName })
        .then(({ error: e }) => {
          if (e) console.error('upsert profile error', e);
        });
    }
  };

  const isLoggedIn = !!user;
  // Prefer display_name (Auth dashboard field) → full_name → email as fallback
  const fullName =
    user?.user_metadata?.display_name ??
    user?.user_metadata?.full_name ??
    user?.email ??
    null;

  return (
    <AuthContext.Provider value={{ user, session, isLoggedIn, fullName, signIn, signUp, signOut, logout: signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
