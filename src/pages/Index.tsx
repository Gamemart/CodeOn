
import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, TrendingUp, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DiscussionCard from '@/components/DiscussionCard';
import CreateDiscussion from '@/components/CreateDiscussion';
import SearchAndFilter from '@/components/SearchAndFilter';
import AuthModal from '@/components/AuthModal';
import { toast } from '@/hooks/use-toast';

// Mock data
const mockDiscussions = [
  {
    id: '1',
    title: 'Welcome to our community! Let\'s discuss the future of web development',
    body: 'I\'m excited to see how React Server Components and other modern technologies are shaping the way we build applications. What are your thoughts on the current state of frontend development? Are we moving in the right direction with all these new frameworks and paradigms?',
    author: 'Alex Chen',
    authorInitials: 'AC',
    createdAt: '2 hours ago',
    tags: ['react', 'webdev', 'frontend'],
    repliesCount: 12,
    likesCount: 24,
    isLiked: false
  },
  {
    id: '2',
    title: 'Best practices for state management in 2024',
    body: 'I\'ve been working with various state management solutions lately - from Redux Toolkit to Zustand, and even the new use() hook in React. Each has its place, but I\'m curious about what the community prefers for different use cases.',
    author: 'Sarah Johnson',
    authorInitials: 'SJ',
    createdAt: '4 hours ago',
    tags: ['react', 'state-management', 'redux'],
    repliesCount: 8,
    likesCount: 15,
    isLiked: true
  },
  {
    id: '3',
    title: 'TypeScript vs JavaScript: Still relevant in 2024?',
    body: 'With all the tooling improvements and IDE support, is the TypeScript vs JavaScript debate still relevant? I\'ve been a TypeScript advocate for years, but I\'m seeing some interesting arguments for staying with vanilla JS in certain contexts.',
    author: 'Mike Rodriguez',
    authorInitials: 'MR',
    createdAt: '6 hours ago',
    tags: ['typescript', 'javascript', 'debate'],
    repliesCount: 20,
    likesCount: 32,
    isLiked: false
  }
];

const popularTags = ['react', 'typescript', 'webdev', 'frontend', 'javascript', 'state-management', 'nextjs', 'tailwind'];

const Index = () => {
  const [discussions, setDiscussions] = useState(mockDiscussions);
  const [filteredDiscussions, setFilteredDiscussions] = useState(mockDiscussions);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Filter discussions based on search and tags
  useEffect(() => {
    let filtered = discussions;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(discussion =>
        discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by active tags
    if (activeFilters.length > 0) {
      filtered = filtered.filter(discussion =>
        discussion.tags.some(tag => activeFilters.includes(tag))
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
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const discussion = {
      id: Date.now().toString(),
      ...newDiscussion,
      author: user.name,
      authorInitials: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      createdAt: 'Just now',
      repliesCount: 0,
      likesCount: 0,
      isLiked: false
    };

    setDiscussions([discussion, ...discussions]);
  };

  const handleReply = (discussionId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    toast({
      title: "Reply feature coming soon!",
      description: "This will open a reply dialog when Supabase is connected."
    });
  };

  const handleLike = (discussionId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setDiscussions(discussions.map(discussion =>
      discussion.id === discussionId
        ? {
            ...discussion,
            isLiked: !discussion.isLiked,
            likesCount: discussion.isLiked 
              ? discussion.likesCount - 1 
              : discussion.likesCount + 1
          }
        : discussion
    ));
  };

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    toast({
      title: "Signed out",
      description: "You've been successfully signed out."
    });
  };

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
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-700">{user.name}</span>
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
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  Join Discussion
                </Button>
              )}
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
                    <p className="text-2xl font-bold text-gray-900">1.2k</p>
                    <p className="text-sm text-gray-500">Members</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">89</p>
                    <p className="text-sm text-gray-500">Active Today</p>
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
              {filteredDiscussions.length > 0 ? (
                filteredDiscussions.map((discussion) => (
                  <DiscussionCard
                    key={discussion.id}
                    discussion={discussion}
                    onReply={handleReply}
                    onLike={handleLike}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;
