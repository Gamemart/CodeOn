
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import CreateDiscussion from '@/components/CreateDiscussion';
import DiscussionCard from '@/components/DiscussionCard';
import SearchAndFilter from '@/components/SearchAndFilter';
import { useDiscussions } from '@/hooks/useDiscussions';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, TrendingUp, Users, User } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { discussions, loading, createDiscussion, editDiscussion, deleteDiscussion, toggleLike } = useDiscussions();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter by tag
  const handleFilterByTag = (tag: string) => {
    if (!activeFilters.includes(tag)) {
      setActiveFilters(prev => [...prev, tag]);
    }
  };

  // Handle remove filter
  const handleRemoveFilter = (tag: string) => {
    setActiveFilters(prev => prev.filter(filter => filter !== tag));
  };

  // Get popular tags from all discussions
  const popularTags = Array.from(
    new Set(discussions.flatMap(d => d.discussion_tags.map(dt => dt.tag)))
  ).slice(0, 10);

  // Filter discussions based on search query and selected tags
  const filteredDiscussions = discussions.filter(discussion => {
    const authorName = discussion.profiles?.full_name || discussion.profiles?.username || 'Anonymous';
    const tags = discussion.discussion_tags.map(dt => dt.tag);

    const matchesSearch = searchQuery.trim() === '' || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      authorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters = activeFilters.length === 0 || 
      activeFilters.some(filter => tags.includes(filter));

    return matchesSearch && matchesFilters;
  });

  // Handle author click
  const handleAuthorClick = (authorId: string) => {
    navigate(`/profile/${authorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Community</h1>
            </div>
            
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  onClick={() => navigate('/profile')}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-medium">
                    {profile?.full_name || profile?.username || 'Profile'}
                  </span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 sm:px-6"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Search and Filter */}
        <SearchAndFilter
          onSearch={handleSearch}
          onFilterByTag={handleFilterByTag}
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          popularTags={popularTags}
        />

        {/* Create Discussion */}
        {user && (
          <CreateDiscussion onSubmit={createDiscussion} />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{discussions.length}</p>
              <p className="text-xs sm:text-sm text-gray-600">Discussions</p>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <MessageCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 mx-auto mb-1 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {discussions.reduce((sum, d) => sum + d.replies_count, 0)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Replies</p>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm col-span-2 sm:col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <Users className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {new Set(discussions.map(d => d.author_id)).size}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Contributors</p>
            </CardContent>
          </Card>
        </div>

        {/* Discussions List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredDiscussions.length === 0 ? (
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-6 sm:p-8 text-center">
                <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No discussions found</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  {searchQuery || activeFilters.length > 0
                    ? "Try adjusting your search criteria or clearing filters."
                    : "Be the first to start a discussion!"
                  }
                </p>
                {!user && (
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Sign in to start discussing
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredDiscussions.map((discussion) => (
              <DiscussionCard
                key={discussion.id}
                discussion={{
                  id: discussion.id,
                  title: discussion.title,
                  body: discussion.body,
                  author: discussion.profiles?.full_name || discussion.profiles?.username || 'Anonymous',
                  authorId: discussion.author_id,
                  authorInitials: (discussion.profiles?.full_name || discussion.profiles?.username || 'A')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase(),
                  authorAvatarUrl: discussion.profiles?.avatar_url || undefined,
                  createdAt: format(new Date(discussion.created_at), 'MMM d, yyyy'),
                  tags: discussion.discussion_tags?.map(tag => tag.tag) || [],
                  repliesCount: discussion.replies_count || 0,
                  likesCount: discussion.likes_count || 0,
                  isLiked: discussion.user_liked || false,
                  statusMessage: discussion.profiles?.status_message || undefined,
                  images: discussion.images || []
                }}
                onLike={toggleLike}
                onAuthorClick={() => handleAuthorClick(discussion.author_id)}
                onEdit={user?.id === discussion.author_id ? editDiscussion : undefined}
                onDelete={user?.id === discussion.author_id ? deleteDiscussion : undefined}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
