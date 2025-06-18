
import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Clock } from 'lucide-react';
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
          profiles!inner(username, full_name)
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

  return (
    <div className="mt-4 space-y-4">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
      </Button>

      {isExpanded && (
        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
          {/* Reply Form */}
          <form onSubmit={handleSubmitReply} className="space-y-3">
            <Textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[80px] resize-none"
            />
            <Button
              type="submit"
              disabled={isSubmitting || !newReply.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </Button>
          </form>

          {/* Replies List */}
          <div className="space-y-3">
            {replies.map((reply) => {
              const authorName = reply.profiles?.full_name || 
                               reply.profiles?.username || 
                               'Anonymous User';
              const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase();

              return (
                <Card key={reply.id} className="bg-gray-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplySection;
