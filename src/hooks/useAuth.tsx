import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          console.log('Initial session loaded:', session?.user?.id);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.id);
          
          // Verify profile exists after sign in
          if (session?.user?.id) {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('id, username, full_name')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Profile not found after sign in:', error);
                // Profile will be created by the trigger, so this is expected for new users
              } else {
                console.log('Profile verified:', profile);
              }
            } catch (error) {
              console.error('Error verifying profile:', error);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for user:', session?.user?.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        throw error;
      }
      console.log('Session refreshed successfully');
      return data;
    } catch (error) {
      console.error('Error in refreshSession:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signOut,
    refreshSession
  };
};