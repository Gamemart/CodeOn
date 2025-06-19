
import React, { useState } from 'react';
import { Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
}

interface CustomRolesTabProps {
  customRoles: CustomRole[];
  onCreateRole: (name: string, description: string, color: string) => void;
  onUpdateRole?: (id: string, name: string, description: string, color: string) => void;
  onDeleteRole?: (id: string) => void;
}

const CustomRolesTab = ({ customRoles, onCreateRole, onUpdateRole, onDeleteRole }: CustomRolesTabProps) => {
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#6B7280');
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#6B7280');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCreateRole = () => {
    if (!newRoleName.trim()) return;
    onCreateRole(newRoleName, newRoleDescription, newRoleColor);
    setNewRoleName('');
    setNewRoleDescription('');
    setNewRoleColor('#6B7280');
    setIsCreateDialogOpen(false);
  };

  const handleEditRole = (role: CustomRole) => {
    setEditingRole(role);
    setEditName(role.name);
    setEditDescription(role.description || '');
    setEditColor(role.color);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = () => {
    if (!editingRole || !editName.trim() || !onUpdateRole) return;
    onUpdateRole(editingRole.id, editName, editDescription, editColor);
    setIsEditDialogOpen(false);
    setEditingRole(null);
  };

  const handleDeleteRole = (roleId: string) => {
    if (onDeleteRole) {
      onDeleteRole(roleId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Roles
          </span>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
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
                <Button onClick={handleCreateRole} className="w-full" disabled={!newRoleName.trim()}>
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
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: role.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{role.name}</p>
                  {role.description && (
                    <p className="text-sm text-gray-500 truncate">{role.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Custom Role</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the "{role.name}" role? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteRole(role.id)} className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Custom Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Role Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter role name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter role description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <Input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateRole} className="flex-1" disabled={!editName.trim()}>
                Update Role
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CustomRolesTab;
