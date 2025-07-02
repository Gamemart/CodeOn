import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface BountyTag {
  id: string;
  tag: string;
}

interface BountyProfile {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface BountyData {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  author_id: string;
  status: string;
  created_at: string;
  bounty_tags: BountyTag[];
  profiles: BountyProfile | null;
}

export const useBounties = () => {
  const [bounties, setBounties] = useState<BountyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBounties = async () => {
    try {
      const { data, error } = await supabase
        .from('bounties')
        .select(`
          *,
          bounty_tags (
            id,
            tag
          ),
          profiles (
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBounties(data || []);
    } catch (error) {
      console.error('Error fetching bounties:', error);
      toast({
        title: "Error loading bounties",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createBounty = async (bountyData: {
    title: string;
    description: string;
    price: number;
    currency: string;
    tags: string[];
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a bounty.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: bounty, error: bountyError } = await supabase
        .from('bounties')
        .insert({
          title: bountyData.title,
          description: bountyData.description,
          price: bountyData.price,
          currency: bountyData.currency,
          author_id: user.id
        })
        .select()
        .single();

      if (bountyError) throw bountyError;

      // Insert tags if any
      if (bountyData.tags.length > 0) {
        const tagInserts = bountyData.tags.map(tag => ({
          bounty_id: bounty.id,
          tag: tag
        }));

        const { error: tagsError } = await supabase
          .from('bounty_tags')
          .insert(tagInserts);

        if (tagsError) throw tagsError;
      }

      toast({
        title: "Bounty created",
        description: "Your bounty has been posted successfully."
      });

      // Refresh bounties to show the new one
      await fetchBounties();
    } catch (error) {
      console.error('Error creating bounty:', error);
      toast({
        title: "Error creating bounty",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateBounty = async (bountyId: string, updates: {
    title?: string;
    description?: string;
    price?: number;
    currency?: string;
    tags?: string[];
    status?: string;
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update a bounty.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: bountyError } = await supabase
        .from('bounties')
        .update({
          title: updates.title,
          description: updates.description,
          price: updates.price,
          currency: updates.currency,
          status: updates.status
        })
        .eq('id', bountyId)
        .eq('author_id', user.id);

      if (bountyError) throw bountyError;

      // Update tags if provided
      if (updates.tags !== undefined) {
        // Delete existing tags
        await supabase
          .from('bounty_tags')
          .delete()
          .eq('bounty_id', bountyId);

        // Insert new tags if any
        if (updates.tags.length > 0) {
          const tagInserts = updates.tags.map(tag => ({
            bounty_id: bountyId,
            tag: tag
          }));

          const { error: tagsError } = await supabase
            .from('bounty_tags')
            .insert(tagInserts);

          if (tagsError) throw tagsError;
        }
      }

      toast({
        title: "Bounty updated",
        description: "Your bounty has been updated successfully."
      });

      // Refresh bounties to show the updated one
      await fetchBounties();
    } catch (error) {
      console.error('Error updating bounty:', error);
      toast({
        title: "Error updating bounty",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteBounty = async (bountyId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete a bounty.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bounties')
        .delete()
        .eq('id', bountyId)
        .eq('author_id', user.id);

      if (error) throw error;

      toast({
        title: "Bounty deleted",
        description: "Your bounty has been deleted successfully."
      });

      // Refresh bounties to remove the deleted one
      await fetchBounties();
    } catch (error) {
      console.error('Error deleting bounty:', error);
      toast({
        title: "Error deleting bounty",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchBounties();

    // Set up real-time subscription
    const channel = supabase
      .channel('bounties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bounties'
        },
        () => {
          fetchBounties();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bounty_tags'
        },
        () => {
          fetchBounties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    bounties,
    loading,
    createBounty,
    updateBounty,
    deleteBounty,
    refetch: fetchBounties
  };
};
