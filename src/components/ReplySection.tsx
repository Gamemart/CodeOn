
import React, { useState, useEffect } from 'react';
import { Send, User, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface Reply {
  id: string;
  content: string;
  author_id: string;
  discussion_id: string;
  created_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReplySectionProps {
  discussionId: string;
  onClose?: () => void;
}

const ReplySection = ({ discussionId, onClose }: ReplySectionProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const REPLIES_LIMIT = 5;

  const userDisplayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User';
  const userInitials = userDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

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
          profiles:author_id(username, full_name, avatar_url)
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
    <div className="space-y-4">
      {/* Reply Form */}
      <form onSubmit={handleSubmitReply} className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !newReply.trim()}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Posting...' : 'Post Reply'}
          </Button>
        </div>
      </form>

      {/* Replies List */}
      <div className="space-y-3">
        {displayedReplies.map((reply) => {
          const authorName = reply.profiles?.full_name || 
                           reply.profiles?.username || 
                           'Anonymous User';
          const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase();

          return (
            <Card key={reply.id} className="bg-gray-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={reply.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-xs">
                      {authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <span className="font-medium text-gray-700">{authorName}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(reply.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{reply.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* View All Replies Toggle Button */}
        {hasMoreReplies && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowAllReplies(!showAllReplies)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              {showAllReplies ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show Recent Replies
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  View All {replies.length} Replies
                </>
              )}
            </Button>
          </div>
        )}

        {/* Close Replies Button */}
        {onClose && (
          <div className="flex justify-center pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
              Close Replies
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplySection;
