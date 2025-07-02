
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, Smile, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';

interface ChatConversationProps {
  chatId: string;
  onBack: () => void;
}

const ChatConversation = ({ chatId, onBack }: ChatConversationProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, sendFileMessage } = useMessages(chatId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For demo purposes, we'll create a mock URL
    // In a real app, you'd upload to Supabase Storage
    const mockUrl = URL.createObjectURL(file);
    await sendFileMessage(file, mockUrl);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message: any) => {
    const isOwnMessage = message.sender_id === user?.id;
    const senderName = message.profiles?.full_name || 
                      message.profiles?.username || 
                      'Unknown User';
    const senderInitials = senderName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

    return (
      <div key={message.id} className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwnMessage && (
          <Avatar className="h-6 w-6 mt-1">
            <AvatarImage src={message.profiles?.avatar_url || undefined} />
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
              {senderInitials}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
          <div className={`rounded-lg px-3 py-2 ${
            isOwnMessage 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}>
            {message.message_type === 'text' ? (
              <p className="text-sm">{message.content}</p>
            ) : message.message_type === 'image' ? (
              <div>
                <img 
                  src={message.file_url} 
                  alt={message.file_name} 
                  className="max-w-full h-auto rounded"
                />
                {message.content && <p className="text-sm mt-1">{message.content}</p>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm">{message.file_name}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white dark:bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-8 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          
          <Button 
            type="submit" 
            size="sm" 
            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        />
      </form>
    </div>
  );
};

export default ChatConversation;
