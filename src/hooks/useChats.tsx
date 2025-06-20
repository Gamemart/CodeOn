
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Chat {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: {
    user_id: string;
    profiles: {
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
    };
  }[];
  last_message?: {
    content: string | null;
    created_at: string;
    sender_id: string;
    message_type: string;
  };
}

export const useChats = () => {
  const { user, session } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    if (!user || !session) {
      console.log('No user or session, skipping chat fetch');
      setChats([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching chats for user:', user.id);

      // Use the edge function to fetch chats safely
      const { data, error } = await supabase.functions.invoke('get_user_chats', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Chats fetched successfully:', data);
      setChats(data.data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load chats';
      if (error.message?.includes('not authenticated')) {
        errorMessage = 'Please log in to view your chats';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Set empty chats array on error to prevent UI issues
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const createDirectChat = async (otherUserId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a chat",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('Creating direct chat with user:', otherUserId);
      
      const { data, error } = await supabase.rpc('get_or_create_direct_chat', {
        other_user_id: otherUserId
      });

      if (error) {
        console.error('Error creating direct chat:', error);
        throw error;
      }
      
      console.log('Direct chat created/found:', data);
      await fetchChats();
      return data;
    } catch (error) {
      console.error('Error creating direct chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const createGroupChat = async (name: string, participantIds: string[]) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a group chat",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('Creating group chat:', name, participantIds);
      
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          name,
          type: 'group',
          created_by: user.id
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add all participants including the creator
      const participants = [user.id, ...participantIds].map(userId => ({
        chat_id: chat.id,
        user_id: userId
      }));

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      console.log('Group chat created successfully:', chat.id);
      await fetchChats();
      return chat.id;
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast({
        title: "Error",
        description: "Failed to create group chat. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    // Only fetch chats if user is authenticated
    if (user && session) {
      console.log('User authenticated, fetching chats');
      fetchChats();
    } else {
      console.log('User not authenticated, clearing chats');
      setChats([]);
      setLoading(false);
    }
  }, [user, session]);

  return {
    chats,
    loading,
    createDirectChat,
    createGroupChat,
    refetch: fetchChats
  };
};
