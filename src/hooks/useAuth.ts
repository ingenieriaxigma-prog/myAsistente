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
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check if user is already logged in
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session exists:', !!session);
      setSession(session);
      
      // Only handle sign out events here
      // Sign in is handled by the signIn() function to avoid race conditions
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Refresh user profile when token is refreshed
        try {
          const { profile } = await authApi.getProfile();
          setUser(profile);
          console.log('Profile refreshed after token refresh:', profile);
        } catch (error) {
          console.error('Error refreshing profile after token refresh:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const session = await authApi.getSession();
      setSession(session);
      
      if (session?.user) {
        try {
          const { profile } = await authApi.getProfile();
          setUser(profile);
        } catch (error: any) {
          console.error('Error fetching profile:', error);
          
          // If JWT error, clear everything
          if (error.message?.includes('JWT') || error.message?.includes('does not exist')) {
            console.warn('🔴 Invalid JWT detected in checkUser - clearing session...');
            await supabase.auth.signOut();
            localStorage.clear();
            setUser(null);
            setSession(null);
          }
        }
      }
    } catch (error) {
      console.error('Error checking user session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, name: string, specialty?: string) {
    try {
      console.log('Step 1: Calling backend signup API...');
      const result = await authApi.signup(email, password, name, specialty);
      console.log('Step 2: Backend signup completed:', result);
      
      // After signup, sign in the user
      console.log('Step 3: Attempting automatic sign in...');
      await signIn(email, password);
      console.log('Step 4: Sign up process completed successfully');
      
      return result;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      console.log('[useAuth.signIn] Step 1: Calling Supabase signIn...');
      const result = await authApi.signIn(email, password);
      console.log('[useAuth.signIn] Step 2: SignIn successful, session:', result.session ? 'exists' : 'null');
      
      // Wait a bit for the session to be fully established
      console.log('[useAuth.signIn] Step 3: Waiting for session to be established...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to fetch profile with retries
      console.log('[useAuth.signIn] Step 4: Fetching user profile...');
      let retries = 3;
      let profile = null;
      
      while (retries > 0 && !profile) {
        try {
          const profileData = await authApi.getProfile();
          profile = profileData.profile;
          console.log('[useAuth.signIn] Profile fetched successfully:', profile);
          setUser(profile);
          setSession(result.session);
          
          // Save email to localStorage for super admin verification
          if (profile.email) {
            localStorage.setItem('user_email', profile.email);
            console.log('[useAuth.signIn] User email saved to localStorage:', profile.email);
          }
        } catch (error: any) {
          console.log(`[useAuth.signIn] Profile fetch attempt failed (${4 - retries}/3):`, error.message);
          retries--;
          if (retries > 0) {
            console.log(`[useAuth.signIn] Waiting 1s before retry ${4 - retries}...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.error('[useAuth.signIn] Failed to fetch profile after 3 attempts:', error);
            throw new Error('No se pudo cargar el perfil de usuario. Por favor intenta nuevamente.');
          }
        }
      }
      
      console.log('[useAuth.signIn] Sign in process completed successfully');
      return result;
    } catch (error: any) {
      console.error('[useAuth.signIn] Sign in error:', error);
      throw error;
    }
  }

  async function signInWithOAuth(provider: 'google' | 'apple' | 'github' | 'facebook') {
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
      setUser(null);
      setSession(null);
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
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    updateProfile,
  };
}