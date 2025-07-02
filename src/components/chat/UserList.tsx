
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface UserListProps {
  onSelectUser: (userId: string) => void;
  onBack?: () => void;
}

const UserList = ({ onSelectUser, onBack }: UserListProps) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const fetchUsers = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id)
        .limit(50);

      if (searchQuery.trim()) {
        query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (profile: Profile) => {
    return profile.full_name || profile.username || 'Unknown User';
  };

  const getUserInitials = (profile: Profile) => {
    const name = getUserDisplayName(profile);
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Start a conversation</h3>
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Back
            </Button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="p-2">
            {users.map((profile) => (
              <div
                key={profile.id}
                onClick={() => onSelectUser(profile.id)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                    {getUserInitials(profile)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {getUserDisplayName(profile)}
                  </p>
                  {profile.username && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
                  )}
                </div>
                
                <MessageCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
