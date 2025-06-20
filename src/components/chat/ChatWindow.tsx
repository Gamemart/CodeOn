
import React, { useState } from 'react';
import { X, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChats } from '@/hooks/useChats';
import ChatList from './ChatList';
import ChatConversation from './ChatConversation';
import CreateChatModal from './CreateChatModal';

interface ChatWindowProps {
  onClose: () => void;
}

const ChatWindow = ({ onClose }: ChatWindowProps) => {
  const { chats, loading, createDirectChat, createGroupChat } = useChats();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
  };

  return (
    <Card className="w-80 h-96 bg-white shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
        <CardTitle className="text-lg font-semibold">
          {selectedChatId ? 'Chat' : 'Messages'}
        </CardTitle>
        <div className="flex items-center gap-2">
          {!selectedChatId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={selectedChatId ? handleBackToList : onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-80 overflow-hidden">
        {selectedChatId ? (
          <ChatConversation
            chatId={selectedChatId}
            onBack={handleBackToList}
          />
        ) : (
          <ChatList
            chats={chats}
            loading={loading}
            onSelectChat={handleSelectChat}
          />
        )}
      </CardContent>

      {showCreateModal && (
        <CreateChatModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateDirect={createDirectChat}
          onCreateGroup={createGroupChat}
        />
      )}
    </Card>
  );
};

export default ChatWindow;
