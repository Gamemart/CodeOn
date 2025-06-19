
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export const useFollows = (userId?: string) => {
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchFollows();
      checkIfFollowing();
    }
  }, [userId]);

  const fetchFollows = async () => {
    if (!userId) return;

    try {
      const [followersResult, followingResult] = await Promise.all([
        supabase.from('follows').select('*').eq('following_id', userId),
        supabase.from('follows').select('*').eq('follower_id', userId)
      ]);

      if (followersResult.error) throw followersResult.error;
      if (followingResult.error) throw followingResult.error;

      setFollowers(followersResult.data || []);
      setFollowing(followingResult.data || []);
    } catch (error) {
      console.error('Error fetching follows:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFollowing = async () => {
    if (!userId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === userId) return;

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const toggleFollow = async () => {
    if (!userId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this user"
        });
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) throw error;
        setIsFollowing(true);
        toast({
          title: "Following",
          description: "You are now following this user"
        });
      }

      fetchFollows();
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    followers,
    following,
    isFollowing,
    loading,
    toggleFollow,
    refetch: fetchFollows
  };
};
