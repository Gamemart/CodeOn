
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Settings, ArrowLeft, Plus, Edit, Trash2, UserCheck, UserX, Ban, Volume, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  profiles: {
    username: string | null;
    full_name: string | null;
  } | null;
  user_roles: {
    role: string;
  } | null;
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
  profiles: {
    username: string | null;
    full_name: string | null;
  } | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole } = useUserRoles();
  const [users, setUsers] = useState<User[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#6B7280');

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'moderator') {
      navigate('/');
      return;
    }
    fetchData();
  }, [userRole, navigate]);

  const fetchData = async () => {
    try {
      const [usersResult, rolesResult, moderationResult] = await Promise.all([
        supabase
          .from('profiles')
          .select(`
            id,
            username,
            full_name,
            user_roles(role)
          `),
        supabase.from('custom_roles').select('*').order('created_at', { ascending: false }),
        supabase
          .from('user_moderation')
          .select(`
            *,
            profiles(username, full_name)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
      ]);

      if (usersResult.error) throw usersResult.error;
      if (rolesResult.error) throw rolesResult.error;
      if (moderationResult.error) throw moderationResult.error;

      setUsers(usersResult.data || []);
      setCustomRoles(rolesResult.data || []);
      setModerationActions(moderationResult.data || []);
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

  const createCustomRole = async () => {
    if (!newRoleName.trim()) return;

    try {
      const { error } = await supabase
        .from('custom_roles')
        .insert({
          name: newRoleName.trim(),
          description: newRoleDescription.trim() || null,
          color: newRoleColor,
          created_by: user!.id
        });

      if (error) throw error;

      toast({
        title: "Role created",
        description: `Custom role "${newRoleName}" has been created`
      });

      setNewRoleName('');
      setNewRoleDescription('');
      setNewRoleColor('#6B7280');
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error creating role",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
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

  if (loading) {
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
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
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
                  <p className="text-sm text-gray-500">Manage users and system settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="roles">Custom Roles</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => {
                    const displayName = user.profiles?.full_name || user.profiles?.username || 'Anonymous User';
                    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
                    const currentRole = user.user_roles?.role || 'user';

                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{displayName}</p>
                            <p className="text-sm text-gray-500">{user.profiles?.username && `@${user.profiles.username}`}</p>
                          </div>
                          <Badge variant={currentRole === 'admin' ? 'destructive' : currentRole === 'moderator' ? 'default' : 'secondary'}>
                            {currentRole}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={currentRole} onValueChange={(value) => updateUserRole(user.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moderateUser(user.id, 'ban')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moderateUser(user.id, 'mute')}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <VolumeX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Custom Roles
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Custom Role</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Role Name</label>
                          <Input
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            placeholder="Enter role name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={newRoleDescription}
                            onChange={(e) => setNewRoleDescription(e.target.value)}
                            placeholder="Enter role description"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Color</label>
                          <Input
                            type="color"
                            value={newRoleColor}
                            onChange={(e) => setNewRoleColor(e.target.value)}
                          />
                        </div>
                        <Button onClick={createCustomRole} className="w-full">
                          Create Role
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {customRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <div>
                          <p className="font-medium">{role.name}</p>
                          {role.description && (
                            <p className="text-sm text-gray-500">{role.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Active Moderation Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderationActions.map((action) => {
                    const displayName = action.profiles?.full_name || action.profiles?.username || 'Anonymous User';
                    
                    return (
                      <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={action.action_type === 'ban' ? 'destructive' : 'default'}>
                            {action.action_type === 'ban' ? (
                              <Ban className="h-3 w-3 mr-1" />
                            ) : (
                              <VolumeX className="h-3 w-3 mr-1" />
                            )}
                            {action.action_type}
                          </Badge>
                          <div>
                            <p className="font-medium">{displayName}</p>
                            {action.reason && (
                              <p className="text-sm text-gray-500">Reason: {action.reason}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              {new Date(action.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deactivateModerationAction(action.id)}
                        >
                          Deactivate
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
