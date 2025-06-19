
import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Reply {
  id: string;
  content: string;
  author_id: string;
  discussion_id: string;
  created_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
  } | null;
}

interface ReplySectionProps {
  discussionId: string;
}

const ReplySection = ({ discussionId }: ReplySectionProps) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const REPLIES_LIMIT = 3;

  useEffect(() => {
    fetchReplies();

    // Set up real-time subscription for replies
    const channel = supabase
      .channel(`replies-${discussionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'replies',
          filter: `discussion_id=eq.${discussionId}`
        },
        () => {
          fetchReplies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [discussionId]);

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('replies')
        .select(`
          *,
          profiles:author_id(username, full_name)
        `)
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error: any) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('replies')
        .insert({
          content: newReply.trim(),
          discussion_id: discussionId,
          author_id: user.id
        });

      if (error) throw error;

      setNewReply('');
      toast({
        title: "Reply posted!",
        description: "Your reply has been added successfully."
      });
    } catch (error: any) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error posting reply",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  // Get replies to display based on showAllReplies state
  const displayedReplies = showAllReplies ? replies : replies.slice(-REPLIES_LIMIT);
  const hasMoreReplies = replies.length > REPLIES_LIMIT;

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 h-auto p-1 text-sm font-normal"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{replies.length}</span>
      </Button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Replies List */}
          {displayedReplies.length > 0 && (
            <div className="space-y-2">
              {/* View More Replies Button */}
              {hasMoreReplies && !showAllReplies && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllReplies(true)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-normal h-auto p-1 mb-2"
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  View {replies.length - REPLIES_LIMIT} more replies
                </Button>
              )}

              {displayedReplies.map((reply) => {
                const authorName = reply.profiles?.full_name || 
                                 reply.profiles?.username || 
                                 'Anonymous User';
                const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase();

                return (
                  <div key={reply.id} className="flex gap-2 sm:gap-3">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-xs">
                        {authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                        <div className="font-medium text-sm text-gray-900 mb-0.5">{authorName}</div>
                        <p className="text-gray-800 text-sm leading-relaxed break-words">{reply.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 ml-3">
                        <span className="text-xs text-gray-500">{formatTimeAgo(reply.created_at)}</span>
                        <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                          Like
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Show Less Button */}
              {showAllReplies && hasMoreReplies && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllReplies(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-normal h-auto p-1 mt-2"
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show recent replies
                </Button>
              )}
            </div>
          )}

          {/* Reply Form */}
          <div className="flex gap-2 sm:gap-3 mt-3">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                U
              </AvatarFallback>
            </Avatar>
            <form onSubmit={handleSubmitReply} className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[36px] max-h-[120px] resize-none rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm py-2 px-3 pr-10"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
                {newReply.trim() && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplySection;
