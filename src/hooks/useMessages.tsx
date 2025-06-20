
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  message_type: 'text' | 'image' | 'file' | 'video';
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useMessages = (chatId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    if (!chatId) return;

    setLoading(true);
    try {
      // First get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Get unique sender IDs
      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];

      // Get profiles for all senders
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', senderIds);

      // Create profiles map
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );

      // Combine messages with profiles
      const typedMessages: Message[] = (messagesData || []).map(msg => ({
        ...msg,
        message_type: (msg.message_type as 'text' | 'image' | 'file' | 'video') || 'text',
        profiles: profilesMap.get(msg.sender_id) || {
          username: null,
          full_name: null,
          avatar_url: null
        }
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!chatId || !user || !content.trim()) return;

    try {
      console.log('Sending message to chat:', chatId);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text'
        });

      if (error) {
        console.error('Error inserting message:', error);
        throw error;
      }

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const sendFileMessage = async (file: File, fileUrl: string) => {
    if (!chatId || !user) return;

    try {
      let messageType: 'image' | 'file' | 'video' = 'file';
      
      if (file.type.startsWith('image/')) {
        messageType = 'image';
      } else if (file.type.startsWith('video/')) {
        messageType = 'video';
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          message_type: messageType,
          file_url: fileUrl,
          file_name: file.name,
          file_size: file.size
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending file message:', error);
      toast({
        title: "Error",
        description: "Failed to send file",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchMessages();

    if (!chatId) return;

    // Set up real-time subscription for new messages
    const messagesChannel = supabase
      .channel(`messages-${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [chatId]);

  return {
    messages,
    loading,
    sendMessage,
    sendFileMessage,
    refetch: fetchMessages
  };
};
