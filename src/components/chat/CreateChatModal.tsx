
import React, { useState, useEffect } from 'react';
import { X, Search, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDirect: (userId: string) => Promise<string | null>;
  onCreateGroup: (name: string, participantIds: string[]) => Promise<string | null>;
}

const CreateChatModal = ({ isOpen, onClose, onCreateDirect, onCreateGroup }: CreateChatModalProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, searchQuery]);

  const fetchUsers = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id)
        .limit(20);

      if (searchQuery.trim()) {
        query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateDirectChat = async (userId: string) => {
    setLoading(true);
    const chatId = await onCreateDirect(userId);
    if (chatId) {
      onClose();
    }
    setLoading(false);
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    setLoading(true);
    const chatId = await onCreateGroup(groupName, selectedUsers);
    if (chatId) {
      onClose();
      setGroupName('');
      setSelectedUsers([]);
      setIsCreatingGroup(false);
    }
    setLoading(false);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getUserDisplayName = (profile: Profile) => {
    return profile.full_name || profile.username || 'Unknown User';
  };

  const getUserInitials = (profile: Profile) => {
    const name = getUserDisplayName(profile);
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isCreatingGroup ? 'Create Group Chat' : 'New Chat'}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreatingGroup(!isCreatingGroup)}
              className="h-8 px-2"
            >
              {isCreatingGroup ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isCreatingGroup && (
            <Input
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {users.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => 
                  isCreatingGroup 
                    ? toggleUserSelection(profile.id)
                    : handleCreateDirectChat(profile.id)
                }
              >
                {isCreatingGroup && (
                  <Checkbox
                    checked={selectedUsers.includes(profile.id)}
                    onChange={() => toggleUserSelection(profile.id)}
                  />
                )}
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {getUserInitials(profile)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <p className="text-sm font-medium">{getUserDisplayName(profile)}</p>
                  {profile.username && (
                    <p className="text-xs text-gray-500">@{profile.username}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isCreatingGroup && (
            <Button
              onClick={handleCreateGroupChat}
              disabled={!groupName.trim() || selectedUsers.length === 0 || loading}
              className="w-full"
            >
              {loading ? 'Creating...' : `Create Group (${selectedUsers.length} members)`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatModal;
