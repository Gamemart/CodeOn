
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'moderator' | 'admin';
  assigned_by: string | null;
  assigned_at: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_by: string;
  created_at: string;
}

export interface UserModeration {
  id: string;
  user_id: string;
  moderator_id: string;
  action_type: 'ban' | 'mute';
  reason: string | null;
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
}

export const useUserRoles = () => {
  const [userRole, setUserRole] = useState<'user' | 'moderator' | 'admin'>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
    
    // Set up real-time subscription for role changes
    const subscription = supabase
      .channel('user-roles-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_roles' 
        }, 
        () => {
          fetchUserRole();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserRole('user');
        setLoading(false);
        return;
      }

      // Use the database function to get user role
      const { data, error } = await supabase.rpc('get_user_role', { 
        user_uuid: user.id 
      });

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
      } else {
        setUserRole(data || 'user');
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole,
          assigned_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Role updated",
        description: `User role has been changed to ${newRole}`
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const moderateUser = async (userId: string, action: 'ban' | 'mute', reason?: string, expiresAt?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_moderation')
        .insert({
          user_id: userId,
          moderator_id: user.id,
          action_type: action,
          reason: reason || null,
          expires_at: expiresAt || null
        });

      if (error) throw error;

      toast({
        title: `User ${action}ned`,
        description: `User has been ${action}ned successfully`
      });
    } catch (error: any) {
      console.error('Error moderating user:', error);
      toast({
        title: "Error moderating user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    userRole,
    loading,
    updateUserRole,
    moderateUser,
    refetchRole: fetchUserRole
  };
};
