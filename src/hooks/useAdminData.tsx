
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string | null;
  full_name: string | null;
  role: string | null;
}

interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
}

interface ModerationAction {
  id: string;
  user_id: string;
  action_type: string;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
  username: string | null;
  full_name: string | null;
}

export const useAdminData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch users with their roles using separate queries
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, full_name');

      if (usersError) throw usersError;

      // Fetch user roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine users with their roles
      const usersWithRoles = (usersData || []).map(user => ({
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: rolesData?.find(role => role.user_id === user.id)?.role || 'user'
      }));

      // Fetch custom roles
      const { data: customRolesData, error: customRolesError } = await supabase
        .from('custom_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (customRolesError) throw customRolesError;

      // Fetch moderation actions
      const { data: moderationData, error: moderationError } = await supabase
        .from('user_moderation')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (moderationError) throw moderationError;

      // Get profile data for moderated users
      const moderationWithProfiles = await Promise.all(
        (moderationData || []).map(async (action) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', action.user_id)
            .single();

          return {
            ...action,
            username: profile?.username || null,
            full_name: profile?.full_name || null
          };
        })
      );

      setUsers(usersWithRoles);
      setCustomRoles(customRolesData || []);
      setModerationActions(moderationWithProfiles);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    users,
    customRoles,
    moderationActions,
    loading,
    refetchData: fetchData
  };
};
