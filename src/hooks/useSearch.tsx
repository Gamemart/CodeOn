
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  type: 'discussion' | 'user';
  id: string;
  title?: string;
  body?: string;
  author?: string;
  authorId?: string;
  username?: string;
  fullName?: string;
  createdAt?: string;
}

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Search discussions
      const { data: discussions, error: discussionError } = await supabase
        .from('discussions')
        .select(`
          id,
          title,
          body,
          created_at,
          profiles!inner(username, full_name)
        `)
        .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (discussionError) throw discussionError;

      // Search users
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);

      if (userError) throw userError;

      // Combine results
      const discussionResults: SearchResult[] = (discussions || []).map(discussion => ({
        type: 'discussion' as const,
        id: discussion.id,
        title: discussion.title,
        body: discussion.body,
        author: discussion.profiles?.full_name || discussion.profiles?.username || 'Anonymous',
        authorId: discussion.profiles?.id,
        createdAt: new Date(discussion.created_at).toLocaleDateString()
      }));

      const userResults: SearchResult[] = (users || []).map(user => ({
        type: 'user' as const,
        id: user.id,
        username: user.username,
        fullName: user.full_name
      }));

      setSearchResults([...discussionResults, ...userResults]);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchResults,
    loading,
    performSearch
  };
};
