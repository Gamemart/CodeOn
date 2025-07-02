
import React, { useState } from 'react';
import { X, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChats } from '@/hooks/useChats';
import { useSearch } from '@/hooks/useSearch';
import ChatList from './ChatList';
import ChatConversation from './ChatConversation';
import UserList from './UserList';

interface ChatWindowProps {
  onClose: () => void;
  isMobile?: boolean;
}

const ChatWindow = ({ onClose, isMobile = false }: ChatWindowProps) => {
  const { chats, loading, createDirectChat } = useChats();
  const { searchResults, performSearch } = useSearch();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showUserList, setShowUserList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSelectChat = (chatId: string) => {
    console.log('Selecting chat:', chatId);
    setSelectedChatId(chatId);
    setShowUserList(false);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleSelectUser = async (userId: string) => {
    console.log('Creating chat with user:', userId);
    try {
      const chatId = await createDirectChat(userId);
      if (chatId) {
        setSelectedChatId(chatId);
        setShowUserList(false);
        setShowSearchResults(false);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleSelectSearchUser = async (userId: string) => {
    await handleSelectUser(userId);
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    setShowUserList(false);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleNewChat = () => {
    setShowUserList(true);
    setSelectedChatId(null);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await performSearch(query);
      setShowSearchResults(true);
      setShowUserList(false);
    } else {
      setShowSearchResults(false);
    }
  };

  const getTitle = () => {
    if (selectedChatId) return 'Chat';
    if (showUserList) return 'New Chat';
    if (showSearchResults) return 'Search Users';
    return 'Messages';
  };

  const getBackAction = () => {
    if (selectedChatId) return handleBackToList;
    if (showUserList) return handleBackToList;
    if (showSearchResults) return handleBackToList;
    return onClose;
  };

  const userSearchResults = searchResults.filter(result => result.type === 'user');

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Mobile Header */}
        <div className="flex items-center justify-between py-3 px-4 border-b bg-white">
          <h1 className="text-lg font-semibold">
            {getTitle()}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={getBackAction()}
              className="h-8 w-8 p-0"
            >
              {selectedChatId || showUserList || showSearchResults ? <ArrowLeft className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {!selectedChatId && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users to message..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-gray-50/50 border-gray-200/50"
              />
            </div>
          </div>
        )}
        
        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {selectedChatId ? (
            <ChatConversation
              chatId={selectedChatId}
              onBack={handleBackToList}
            />
          ) : showSearchResults ? (
            <div className="h-full overflow-y-auto">
              {userSearchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <Search className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="p-2">
                  {userSearchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectSearchUser(user.id)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {user.fullName || user.username || 'Unknown User'}
                        </p>
                        {user.username && (
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
        </div>
      </div>
    );
  }

  return (
    <Card className="w-80 h-96 bg-white shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
        <CardTitle className="text-lg font-semibold">
          {getTitle()}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={getBackAction()}
            className="h-8 w-8 p-0"
          >
            {selectedChatId || showUserList || showSearchResults ? <ArrowLeft className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-80 overflow-hidden">
        {/* Search Bar for Desktop */}
        {!selectedChatId && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users to message..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-gray-50/50 border-gray-200/50"
              />
            </div>
          </div>
        )}

        {/* Desktop Content */}
        <div className="h-full overflow-hidden">
          {selectedChatId ? (
            <ChatConversation
              chatId={selectedChatId}
              onBack={handleBackToList}
            />
          ) : showSearchResults ? (
            <div className="h-full overflow-y-auto">
              {userSearchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <Search className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="p-2">
                  {userSearchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectSearchUser(user.id)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {user.fullName || user.username || 'Unknown User'}
                        </p>
                        {user.username && (
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
