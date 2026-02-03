import { useState, useEffect } from 'react';
import { authApi, supabase } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  specialty?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔔 Listener ÚNICO de Supabase
  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, 'Session exists:', !!session);

        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser(session.user as User);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  // ─────────────────────────────────────────────
  // AUTH ACTIONS
  // ─────────────────────────────────────────────

  async function signUp(email: string, password: string, name: string, specialty?: string) {
    try {
      await authApi.signup(email, password, name, specialty);
      return await signIn(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const result = await authApi.signIn(email, password);

      if (result.session) {
        setSession(result.session);
        const { profile } = await authApi.getProfile(result.session.access_token);
        setUser(profile);
      }

      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async function signInWithOAuth(
    provider: 'google' | 'apple' | 'github' | 'facebook'
  ) {
    try {
      return await authApi.signInWithOAuth(provider);
    } catch (error) {
      console.error('OAuth sign in error:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await authApi.signOut();
      localStorage.removeItem('user_email');
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async function updateProfile(updates: Partial<User>) {
    try {
      const { profile } = await authApi.updateProfile(updates);
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    updateProfile,
  };
}
