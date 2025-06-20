
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

interface Chat {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
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
    message_type: string;
  };
}

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  onSelectChat: (chatId: string) => void;
}

const ChatList = ({ chats, loading, onSelectChat }: ChatListProps) => {
  const { user } = useAuth();

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    }
    
    // For direct chats, show the other participant's name
    const otherParticipant = chat.participants.find(p => p.user_id !== user?.id);
    return otherParticipant?.profiles?.full_name || 
           otherParticipant?.profiles?.username || 
           'Unknown User';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') {
      return null; // We'll show initials for group chats
    }
    
    const otherParticipant = chat.participants.find(p => p.user_id !== user?.id);
    return otherParticipant?.profiles?.avatar_url || null;
  };

  const getChatInitials = (chat: Chat) => {
    const name = getChatName(chat);
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastMessage = (lastMessage: Chat['last_message']) => {
    if (!lastMessage) return 'No messages yet';
    
    if (lastMessage.message_type === 'text') {
      return lastMessage.content || 'Message';
    }
    
    return `📎 ${lastMessage.message_type}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="text-gray-400 mb-2">💬</div>
        <p className="text-sm text-gray-500">No chats yet</p>
        <p className="text-xs text-gray-400">Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={getChatAvatar(chat) || undefined} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {getChatInitials(chat)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getChatName(chat)}
              </p>
              {chat.last_message && (
                <span className="text-xs text-gray-500">
                  {new Date(chat.last_message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              {formatLastMessage(chat.last_message)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
