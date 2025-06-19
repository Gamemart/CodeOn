
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { toast } from '@/hooks/use-toast';
import UserManagementTab from '@/components/admin/UserManagementTab';
import CustomRolesTab from '@/components/admin/CustomRolesTab';
import ModerationTab from '@/components/admin/ModerationTab';

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading } = useUserRoles();
  const [users, setUsers] = useState<User[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth and role loading to complete
    if (authLoading || roleLoading) return;

    // Redirect if not authenticated
    if (!user) {
      navigate('/auth');
      return;
    }

    // Redirect if not admin
    if (userRole !== 'admin') {
      navigate('/forbidden');
      return;
    }

    fetchData();
  }, [user, userRole, authLoading, roleLoading, navigate]);

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

  const updateUserRole = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole,
          assigned_by: user!.id
        });

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "User role has been updated successfully"
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const moderateUser = async (userId: string, action: 'ban' | 'mute', reason?: string) => {
    try {
      const { error } = await supabase
        .from('user_moderation')
        .insert({
          user_id: userId,
          moderator_id: user!.id,
          action_type: action,
          reason: reason || null
        });

      if (error) throw error;

      toast({
        title: `User ${action}ned`,
        description: `User has been ${action}ned successfully`
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error moderating user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const createCustomRole = async (name: string, description: string, color: string) => {
    if (!name.trim()) return;

    try {
      const { error } = await supabase
        .from('custom_roles')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          color: color,
          created_by: user!.id
        });

      if (error) throw error;

      toast({
        title: "Role created",
        description: `Custom role "${name}" has been created`
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error creating role",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deactivateModerationAction = async (actionId: string) => {
    try {
      const { error } = await supabase
        .from('user_moderation')
        .update({ is_active: false })
        .eq('id', actionId);

      if (error) throw error;

      toast({
        title: "Action deactivated",
        description: "Moderation action has been deactivated"
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error deactivating action",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Show loading while checking auth and role
  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-600 to-purple-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500 hidden sm:block">Manage users and system settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="users" className="text-sm">User Management</TabsTrigger>
            <TabsTrigger value="roles" className="text-sm">Custom Roles</TabsTrigger>
            <TabsTrigger value="moderation" className="text-sm">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagementTab 
              users={users}
              onUpdateUserRole={updateUserRole}
              onModerateUser={moderateUser}
            />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <CustomRolesTab 
              customRoles={customRoles}
              onCreateRole={createCustomRole}
            />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <ModerationTab 
              moderationActions={moderationActions}
              onDeactivateAction={deactivateModerationAction}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
