
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, TrendingUp, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DiscussionCard from '@/components/DiscussionCard';
import CreateDiscussion from '@/components/CreateDiscussion';
import SearchAndFilter from '@/components/SearchAndFilter';
import { useAuth } from '@/hooks/useAuth';
import { useDiscussions } from '@/hooks/useDiscussions';
import { toast } from '@/hooks/use-toast';

const popularTags = ['react', 'typescript', 'webdev', 'frontend', 'javascript', 'state-management', 'nextjs', 'tailwind'];

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { discussions, loading: discussionsLoading, createDiscussion, toggleLike } = useDiscussions();
  const [filteredDiscussions, setFilteredDiscussions] = useState(discussions);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Filter discussions based on search and tags
  useEffect(() => {
    let filtered = discussions;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(discussion =>
        discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.discussion_tags.some(tag => 
          tag.tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by active tags
    if (activeFilters.length > 0) {
      filtered = filtered.filter(discussion =>
        discussion.discussion_tags.some(tag => activeFilters.includes(tag.tag))
      );
    }

    setFilteredDiscussions(filtered);
  }, [discussions, searchQuery, activeFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterByTag = (tag: string) => {
    if (!activeFilters.includes(tag)) {
      setActiveFilters([...activeFilters, tag]);
    }
  };

  const handleRemoveFilter = (tag: string) => {
    setActiveFilters(activeFilters.filter(filter => filter !== tag));
  };

  const handleCreateDiscussion = (newDiscussion: {
    title: string;
    body: string;
    tags: string[];
  }) => {
    createDiscussion(newDiscussion);
  };

  const handleReply = (discussionId: string) => {
    toast({
      title: "Reply feature coming soon!",
      description: "This will open a reply dialog in the next update."
    });
  };

  const handleLike = (discussionId: string) => {
    toggleLike(discussionId);
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out."
    });
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const userDisplayName = user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User';
  const userInitials = userDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DiscussHub</h1>
                <p className="text-sm text-gray-500">Real-time discussions</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-700">{userDisplayName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{discussions.length}</p>
                    <p className="text-sm text-gray-500">Discussions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {discussions.reduce((sum, d) => sum + d.replies_count, 0)}
                    </p>
                    <p className="text-sm text-gray-500">Total Replies</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Community Guidelines</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Be respectful and constructive</li>
                <li>• Stay on topic</li>
                <li>• No spam or self-promotion</li>
                <li>• Use relevant tags</li>
              </ul>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <SearchAndFilter
              onSearch={handleSearch}
              onFilterByTag={handleFilterByTag}
              activeFilters={activeFilters}
              onRemoveFilter={handleRemoveFilter}
              popularTags={popularTags}
            />

            {/* Create Discussion */}
            <CreateDiscussion onSubmit={handleCreateDiscussion} />

            {/* Discussion Feed */}
            <div className="space-y-4">
              {discussionsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading discussions...</p>
                </div>
              ) : filteredDiscussions.length > 0 ? (
                filteredDiscussions.map((discussion) => {
                  const authorName = discussion.profiles?.full_name || 
                                   discussion.profiles?.username || 
                                   'Anonymous User';
                  const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase();
                  const tags = discussion.discussion_tags.map(dt => dt.tag);
                  const timeAgo = new Date(discussion.created_at).toLocaleDateString();

                  return (
                    <DiscussionCard
                      key={discussion.id}
                      discussion={{
                        id: discussion.id,
                        title: discussion.title,
                        body: discussion.body,
                        author: authorName,
                        authorInitials,
                        createdAt: timeAgo,
                        tags,
                        repliesCount: discussion.replies_count,
                        likesCount: discussion.likes_count,
                        isLiked: discussion.user_liked || false
                      }}
                      onReply={handleReply}
                      onLike={handleLike}
                    />
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters, or create the first discussion!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
