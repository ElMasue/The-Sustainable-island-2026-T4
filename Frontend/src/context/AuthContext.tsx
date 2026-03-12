import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Session, User, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  fullName: string | null;
  avatarUrl: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthResponse>;
  /** OAuth login with Google or Apple – redirects the browser */
  signInWithSocial: (provider: 'google' | 'apple') => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  /** Update display name in Auth and public.users */
  updateProfile: (displayName: string) => Promise<void>;
  /** Upload a new avatar image (email users only). Returns the public URL. */
  uploadAvatar: (file: File) => Promise<string>;
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

  const signInWithSocial = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // After OAuth the browser is redirected back to the app root
        redirectTo: window.location.origin + '/',
      },
    });
    if (error) throw error;
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

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    // Unique path per user so overwrites are clean
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) throw uploadError;

    // getPublicUrl is synchronous and never throws
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);
    // Append a cache-busting timestamp so re-uploads always show the new image
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Save the URL into auth metadata so avatarUrl updates immediately
    const { error: metaError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });
    if (metaError) throw metaError;

    // Also sync to public.users if the table has an avatar_url column
    if (user) {
      await supabase
        .from('users')
        .upsert({ id: user.id, email: user.email, avatar_url: publicUrl })
        .then(({ error: e }) => {
          if (e) console.warn('avatar upsert to users table skipped:', e.message);
        });
    }

    return publicUrl;
  };

  const isLoggedIn = !!user;
  // Prefer display_name (Auth dashboard field) → full_name → email as fallback
  const fullName =
    user?.user_metadata?.display_name ??
    user?.user_metadata?.full_name ??
    user?.email ??
    null;
  // Google stores it as avatar_url; some providers use picture
  const avatarUrl: string | null =
    user?.user_metadata?.avatar_url ??
    user?.user_metadata?.picture ??
    null;

  return (
    <AuthContext.Provider value={{ user, session, isLoggedIn, fullName, avatarUrl, signIn, signUp, signInWithSocial, signOut, logout: signOut, updateProfile, uploadAvatar }}>
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
