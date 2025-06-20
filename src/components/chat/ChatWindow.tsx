
import React, { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChats } from '@/hooks/useChats';
import ChatList from './ChatList';
import ChatConversation from './ChatConversation';
import UserList from './UserList';

interface ChatWindowProps {
  onClose: () => void;
}

const ChatWindow = ({ onClose }: ChatWindowProps) => {
  const { chats, loading, createDirectChat } = useChats();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showUserList, setShowUserList] = useState(false);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowUserList(false);
  };

  const handleSelectUser = async (userId: string) => {
    const chatId = await createDirectChat(userId);
    if (chatId) {
      setSelectedChatId(chatId);
      setShowUserList(false);
    }
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    setShowUserList(false);
  };

  const handleNewChat = () => {
    setShowUserList(true);
    setSelectedChatId(null);
  };

  const getTitle = () => {
    if (selectedChatId) return 'Chat';
    if (showUserList) return 'New Chat';
    return 'Messages';
  };

  const getBackAction = () => {
    if (selectedChatId) return handleBackToList;
    if (showUserList) return handleBackToList;
    return onClose;
  };

  return (
    <Card className="w-80 h-96 bg-white shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
        <CardTitle className="text-lg font-semibold">
          {getTitle()}
        </CardTitle>
        <div className="flex items-center gap-2">
          {!selectedChatId && !showUserList && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="h-8 px-2 text-blue-600 hover:text-blue-700"
            >
              New
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={getBackAction()}
            className="h-8 w-8 p-0"
          >
            {selectedChatId || showUserList ? <ArrowLeft className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-80 overflow-hidden">
        {selectedChatId ? (
          <ChatConversation
            chatId={selectedChatId}
            onBack={handleBackToList}
          />
        ) : showUserList ? (
          <UserList
            onSelectUser={handleSelectUser}
            onBack={handleBackToList}
          />
        ) : (
          <ChatList
            chats={chats}
            loading={loading}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
