
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAdminData } from '@/hooks/useAdminData';
import { updateUserRole, moderateUser, createCustomRole, deactivateModerationAction } from '@/utils/adminOperations';
import UserManagementTab from '@/components/admin/UserManagementTab';
import CustomRolesTab from '@/components/admin/CustomRolesTab';
import ModerationTab from '@/components/admin/ModerationTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading } = useUserRoles();
  const { users, customRoles, moderationActions, loading, refetchData } = useAdminData();

  // Handle auth and role checks
  React.useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (userRole !== 'admin') {
      navigate('/forbidden');
      return;
    }
  }, [user, userRole, authLoading, roleLoading, navigate]);

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
    if (!user) return;
    const success = await updateUserRole(userId, newRole, user.id);
    if (success) refetchData();
  };

  const handleModerateUser = async (userId: string, action: 'ban' | 'mute', reason?: string) => {
    if (!user) return;
    const success = await moderateUser(userId, action, user.id, reason);
    if (success) refetchData();
  };

  const handleCreateRole = async (name: string, description: string, color: string) => {
    if (!user) return;
    const success = await createCustomRole(name, description, color, user.id);
    if (success) refetchData();
  };

  const handleDeactivateAction = async (actionId: string) => {
    const success = await deactivateModerationAction(actionId);
    if (success) refetchData();
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
              onUpdateUserRole={handleUpdateUserRole}
              onModerateUser={handleModerateUser}
            />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <CustomRolesTab 
              customRoles={customRoles}
              onCreateRole={handleCreateRole}
            />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <ModerationTab 
              moderationActions={moderationActions}
              onDeactivateAction={handleDeactivateAction}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
