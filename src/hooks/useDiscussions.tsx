
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Discussion {
  id: string;
  title: string;
  body: string;
  author_id: string;
  created_at: string;
  likes_count: number;
  replies_count: number;
  profiles: {
    username: string | null;
    full_name: string | null;
  } | null;
  discussion_tags: {
    tag: string;
  }[];
  user_liked?: boolean;
}

export const useDiscussions = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles:author_id (username, full_name),
          discussion_tags (tag)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which discussions the current user has liked
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const { data: likes } = await supabase
          .from('likes')
          .select('discussion_id')
          .eq('user_id', user.id);

        const likedDiscussionIds = new Set(likes?.map(like => like.discussion_id) || []);
        
        const discussionsWithLikes = data.map(discussion => ({
          ...discussion,
          user_liked: likedDiscussionIds.has(discussion.id)
        }));

        setDiscussions(discussionsWithLikes);
      } else {
        setDiscussions(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error loading discussions",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDiscussion = async (newDiscussion: {
    title: string;
    body: string;
    tags: string[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create discussion
      const { data: discussion, error: discussionError } = await supabase
        .from('discussions')
        .insert({
          title: newDiscussion.title,
          body: newDiscussion.body,
          author_id: user.id
        })
        .select()
        .single();

      if (discussionError) throw discussionError;

      // Add tags
      if (newDiscussion.tags.length > 0) {
        const { error: tagsError } = await supabase
          .from('discussion_tags')
          .insert(
            newDiscussion.tags.map(tag => ({
              discussion_id: discussion.id,
              tag: tag
            }))
          );

        if (tagsError) throw tagsError;
      }

      toast({
        title: "Discussion created!",
        description: "Your discussion has been posted successfully."
      });

      fetchDiscussions(); // Refresh discussions
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error creating discussion",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (discussionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const discussion = discussions.find(d => d.id === discussionId);
      if (!discussion) return;

      if (discussion.user_liked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('discussion_id', discussionId);

        if (error) throw error;

        // Update discussions state
        setDiscussions(prev => prev.map(d => 
          d.id === discussionId 
            ? { ...d, user_liked: false, likes_count: d.likes_count - 1 }
            : d
        ));
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            discussion_id: discussionId
          });

        if (error) throw error;

        // Update discussions state
        setDiscussions(prev => prev.map(d => 
          d.id === discussionId 
            ? { ...d, user_liked: true, likes_count: d.likes_count + 1 }
            : d
        ));
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error updating like",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDiscussions();

    // Set up real-time subscription
    const channel = supabase
      .channel('discussions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussions'
        },
        () => {
          fetchDiscussions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    discussions,
    loading,
    createDiscussion,
    toggleLike,
    refetch: fetchDiscussions
  };
};
