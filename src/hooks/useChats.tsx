
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
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_participants!inner(
            user_id,
            profiles(username, full_name, avatar_url)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get last message for each chat
      const chatsWithLastMessage = await Promise.all(
        (data || []).map(async (chat) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id, message_type')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...chat,
            participants: chat.chat_participants,
            last_message: lastMessage || undefined
          };
        })
      );

      setChats(chatsWithLastMessage);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDirectChat = async (otherUserId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_or_create_direct_chat', {
        other_user_id: otherUserId
      });

      if (error) throw error;
      
      await fetchChats();
      return data;
    } catch (error) {
      console.error('Error creating direct chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive"
      });
      return null;
    }
  };

  const createGroupChat = async (name: string, participantIds: string[]) => {
    if (!user) return null;

    try {
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

      await fetchChats();
      return chat.id;
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchChats();

    // Set up real-time subscriptions
    const chatsChannel = supabase
      .channel('chats-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats'
      }, () => {
        fetchChats();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_participants'
      }, () => {
        fetchChats();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatsChannel);
    };
  }, [user]);

  return {
    chats,
    loading,
    createDirectChat,
    createGroupChat,
    refetch: fetchChats
  };
};
