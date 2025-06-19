
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

export interface DiscussionWithProfile extends Discussion {
  profiles: {
    id: string;
    username: string | null;
    full_name: string | null;
    status_message: string | null;
    avatar_url: string | null;
  };
}

export const useDiscussions = () => {
  const [discussions, setDiscussions] = useState<DiscussionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDiscussions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles!inner(id, username, full_name, status_message, avatar_url),
          discussion_tags(tag),
          replies_count:replies(count),
          likes_count:likes(count),
          user_liked:likes!left(user_id)
        `)
        .eq('likes.user_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedDiscussions = data?.map(discussion => ({
        ...discussion,
        user_liked: discussion.user_liked && discussion.user_liked.length > 0
      })) || [];

      setDiscussions(processedDiscussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error",
        description: "Failed to load discussions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

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

  const editDiscussion = async (discussionId: string, updates: {
    title?: string;
    body?: string;
    tags?: string[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update discussion
      const { error: discussionError } = await supabase
        .from('discussions')
        .update({
          title: updates.title,
          body: updates.body,
          updated_at: new Date().toISOString()
        })
        .eq('id', discussionId)
        .eq('author_id', user.id); // Ensure only author can edit

      if (discussionError) throw discussionError;

      // Update tags if provided
      if (updates.tags) {
        // Delete existing tags
        const { error: deleteTagsError } = await supabase
          .from('discussion_tags')
          .delete()
          .eq('discussion_id', discussionId);

        if (deleteTagsError) throw deleteTagsError;

        // Add new tags
        if (updates.tags.length > 0) {
          const { error: tagsError } = await supabase
            .from('discussion_tags')
            .insert(
              updates.tags.map(tag => ({
                discussion_id: discussionId,
                tag: tag
              }))
            );

          if (tagsError) throw tagsError;
        }
      }

      toast({
        title: "Discussion updated!",
        description: "Your discussion has been updated successfully."
      });

      fetchDiscussions(); // Refresh discussions
    } catch (error: any) {
      console.error('Error updating discussion:', error);
      toast({
        title: "Error updating discussion",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteDiscussion = async (discussionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete discussion (cascading deletes will handle tags, replies, etc.)
      const { error } = await supabase
        .from('discussions')
        .delete()
        .eq('id', discussionId)
        .eq('author_id', user.id); // Ensure only author can delete

      if (error) throw error;

      toast({
        title: "Discussion deleted!",
        description: "Your discussion has been deleted successfully."
      });

      fetchDiscussions(); // Refresh discussions
    } catch (error: any) {
      console.error('Error deleting discussion:', error);
      toast({
        title: "Error deleting discussion",
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
    editDiscussion,
    deleteDiscussion,
    toggleLike
  };
};
