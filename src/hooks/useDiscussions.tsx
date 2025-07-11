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
  image_urls?: string[];
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

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `discussions/${fileName}`;

    const { data, error } = await supabase.storage
      .from('profile-media')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const fetchDiscussions = useCallback(async () => {
    try {
      // First, get the discussions with basic data
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles!inner(id, username, full_name, status_message, avatar_url),
          discussion_tags(tag)
        `)
        .order('created_at', { ascending: false });

      if (discussionsError) throw discussionsError;

      if (!discussionsData) {
        setDiscussions([]);
        return;
      }

      // Process discussions to get counts and user likes
      const processedDiscussions = await Promise.all(
        discussionsData.map(async (discussion: any) => {
          // Get replies count
          const { count: repliesCount } = await supabase
            .from('replies')
            .select('*', { count: 'exact', head: true })
            .eq('discussion_id', discussion.id);

          // Get likes count
          const { count: likesCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('discussion_id', discussion.id);

          // Check if user liked this discussion (only if authenticated)
          let userLiked = false;
          if (user?.id) {
            const { data: userLikeData } = await supabase
              .from('likes')
              .select('id')
              .eq('discussion_id', discussion.id)
              .eq('user_id', user.id)
              .single();
            
            userLiked = !!userLikeData;
          }

          // Extract image URLs from body if they exist
          let imageUrls: string[] = [];
          if (discussion.body) {
            // Look for markdown image syntax or direct URLs
            const markdownImageMatches = discussion.body.match(/!\[.*?\]\((.*?)\)/g);
            const urlMatches = discussion.body.match(/https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp)/gi);
            
            if (markdownImageMatches) {
              markdownImageMatches.forEach((match: string) => {
                const urlMatch = match.match(/\((.*?)\)/);
                if (urlMatch && urlMatch[1]) {
                  imageUrls.push(urlMatch[1]);
                }
              });
            }
            
            if (urlMatches) {
              imageUrls = [...imageUrls, ...urlMatches];
            }
          }

          return {
            ...discussion,
            replies_count: repliesCount || 0,
            likes_count: likesCount || 0,
            user_liked: userLiked,
            image_urls: imageUrls
          };
        })
      );

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
    images?: File[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let finalBody = newDiscussion.body;

      // Handle image uploads
      if (newDiscussion.images && newDiscussion.images.length > 0) {
        const uploadPromises = newDiscussion.images.map(image => uploadImage(image));
        const imageUrls = await Promise.all(uploadPromises);
        
        // Add images to body as markdown
        const imageSection = imageUrls.map(url => `![Image](${url})`).join('\n');
        finalBody = `${newDiscussion.body}\n\n${imageSection}`;
      }

      // Create discussion
      const { data: discussion, error: discussionError } = await supabase
        .from('discussions')
        .insert({
          title: newDiscussion.title,
          body: finalBody,
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

    // Set up real-time subscription for discussions and replies
    const discussionsChannel = supabase
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'replies'
        },
        () => {
          fetchDiscussions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(discussionsChannel);
    };
  }, [fetchDiscussions]);

  return {
    discussions,
    loading,
    createDiscussion,
    editDiscussion,
    deleteDiscussion,
    toggleLike
  };
};
