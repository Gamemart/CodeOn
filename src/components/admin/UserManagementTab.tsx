
import React from 'react';
import { Users, Ban, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  username: string | null;
  full_name: string | null;
  role: string | null;
}

interface UserManagementTabProps {
  users: User[];
  onUpdateUserRole: (userId: string, newRole: 'user' | 'moderator' | 'admin') => void;
  onModerateUser: (userId: string, action: 'ban' | 'mute', reason?: string) => void;
}

const UserManagementTab = ({ users, onUpdateUserRole, onModerateUser }: UserManagementTabProps) => {
  return (
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
            const displayName = user.full_name || user.username || 'Anonymous User';
            const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
            const currentRole = user.role || 'user';

            return (
              <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{displayName}</p>
                    <p className="text-sm text-gray-500 truncate">{user.username && `@${user.username}`}</p>
                  </div>
                  <Badge variant={currentRole === 'admin' ? 'destructive' : currentRole === 'moderator' ? 'default' : 'secondary'}>
                    {currentRole}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={currentRole} onValueChange={(value: 'user' | 'moderator' | 'admin') => onUpdateUserRole(user.id, value)}>
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
                    onClick={() => onModerateUser(user.id, 'ban')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onModerateUser(user.id, 'mute')}
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
  );
};

export default UserManagementTab;
