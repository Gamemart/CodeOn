import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, TrendingUp, User, LogOut, Shield, Home, Bell, Phone, Mail, Globe, Edit, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DiscussionCard from '@/components/DiscussionCard';
import CreateDiscussion from '@/components/CreateDiscussion';
import SearchResults from '@/components/SearchResults';
import BountyCard from '@/components/BountyCard';
import CreateBounty from '@/components/CreateBounty';
import { useAuth } from '@/hooks/useAuth';
import { useDiscussions } from '@/hooks/useDiscussions';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useProfile } from '@/hooks/useProfile';
import { useSearch } from '@/hooks/useSearch';
import { useBounties } from '@/hooks/useBounties';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import FloatingChatHead from '@/components/chat/FloatingChatHead';
import ChatWindow from '@/components/chat/ChatWindow';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { discussions, loading: discussionsLoading, createDiscussion, editDiscussion, deleteDiscussion, toggleLike } = useDiscussions();
  const { bounties, loading: bountiesLoading, createBounty } = useBounties();
  const { userRole } = useUserRoles();
  const { profile } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { searchResults, loading: searchLoading, performSearch } = useSearch();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        performSearch(searchQuery);
        setShowSearchResults(true);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery, performSearch]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out."
    });
    navigate('/auth');
  };

  const handleEditProfile = () => {
    navigate(`/profile/${user?.id}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userDisplayName = profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User';
  const userInitials = userDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 pb-20">
        {/* Mobile Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                    <div className="w-4 h-0.5 bg-gray-600"></div>
                    <div className="w-4 h-0.5 bg-gray-600"></div>
                    <div className="w-4 h-0.5 bg-gray-600"></div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEditProfile}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                {(userRole === 'admin' || userRole === 'moderator') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Bar */}
            <div className="flex-1 mx-4">
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-50/50 border-gray-200/50 rounded-full"
              />
            </div>

            {/* Profile Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center space-x-8">
            <button 
              onClick={() => setActiveTab('home')}
              className={`pb-2 border-b-2 font-medium ${
                activeTab === 'home' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('bounty')}
              className={`pb-2 border-b-2 font-medium ${
                activeTab === 'bounty' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Bounty
            </button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-4">
          {/* Search Results */}
          {showSearchResults && (
            <div className="mb-4">
              <SearchResults 
                results={searchResults} 
                loading={searchLoading}
                onClose={() => setShowSearchResults(false)}
              />
            </div>
          )}

          {/* Create Section */}
          {!showSearchResults && (
            <div className="mb-4">
              {activeTab === 'home' ? (
                <CreateDiscussion onSubmit={createDiscussion} />
              ) : (
                <CreateBounty onSubmit={createBounty} />
              )}
            </div>
          )}

          {/* Feed */}
          {!showSearchResults && (
            <div className="space-y-4">
              {activeTab === 'home' ? (
                // Discussion Feed
                discussionsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading discussions...</p>
                  </div>
                ) : discussions.length > 0 ? (
                  discussions.map((discussion) => {
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
                          authorId: discussion.author_id,
                          authorInitials,
                          createdAt: timeAgo,
                          tags,
                          repliesCount: discussion.replies_count,
                          likesCount: discussion.likes_count,
                          isLiked: discussion.user_liked || false,
                          statusMessage: discussion.profiles?.status_message || undefined,
                          authorAvatarUrl: discussion.profiles?.avatar_url || undefined
                        }}
                        onLike={toggleLike}
                        onAuthorClick={() => navigate(`/profile/${discussion.author_id}`)}
                        onEdit={editDiscussion}
                        onDelete={deleteDiscussion}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                    <p className="text-gray-500">Try adjusting your search or create the first discussion!</p>
                  </div>
                )
              ) : (
                // Bounty Feed
                bountiesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading bounties...</p>
                  </div>
                ) : bounties.length > 0 ? (
                  bounties.map((bounty) => {
                    const authorName = bounty.profiles?.full_name || 
                                     bounty.profiles?.username || 
                                     'Anonymous User';
                    const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase();
                    const tags = bounty.bounty_tags.map(tag => tag.tag);
                    const timeAgo = new Date(bounty.created_at).toLocaleDateString();

                    return (
                      <BountyCard
                        key={bounty.id}
                        bounty={{
                          id: bounty.id,
                          title: bounty.title,
                          description: bounty.description,
                          price: bounty.price,
                          currency: bounty.currency,
                          author: authorName,
                          authorId: bounty.author_id,
                          authorInitials,
                          authorAvatarUrl: bounty.profiles?.avatar_url || undefined,
                          createdAt: timeAgo,
                          status: bounty.status,
                          tags
                        }}
                        onAuthorClick={() => navigate(`/profile/${bounty.author_id}`)}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bounties found</h3>
                    <p className="text-gray-500">Create the first bounty and start earning!</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200/50 p-4 z-50">
          <div className="flex justify-around items-center">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex flex-col items-center space-y-1"
            >
              <Home className={`h-5 w-5 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-xs ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-600'}`}>Home</span>
            </button>
            <button 
              onClick={() => setShowMobileChat(true)}
              className="flex flex-col items-center space-y-1"
            >
              <MessageCircle className="h-5 w-5 text-gray-600" />
              <span className="text-xs text-gray-600">Chats</span>
            </button>
            <button className="flex flex-col items-center space-y-1">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <span className="text-xs text-gray-600">Post</span>
            </button>
            <button 
              onClick={() => setActiveTab('bounty')}
              className="flex flex-col items-center space-y-1"
            >
              <DollarSign className={`h-5 w-5 ${activeTab === 'bounty' ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-xs ${activeTab === 'bounty' ? 'text-blue-600' : 'text-gray-600'}`}>Bounty</span>
            </button>
          </div>
        </div>

        {/* Mobile Chat Window */}
        {showMobileChat && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm h-96">
              <ChatWindow onClose={() => setShowMobileChat(false)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/50 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/7afeeb37-7c54-4797-96a2-394387235bdd.png" 
                  alt="ESTRANGHERO Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">ESTRANGHERO</span>
            </div>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Input
                placeholder="Search discussions and users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-50/50 border-gray-200/50"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  activeTab === 'home' ? 'text-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => setActiveTab('home')}
              >
                <Home className="h-4 w-4 mr-3" />
                Home
                {activeTab === 'home' && (
                  <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                    {discussions.length}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  activeTab === 'bounty' ? 'text-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => setActiveTab('bounty')}
              >
                <DollarSign className="h-4 w-4 mr-3" />
                Bounty
                {activeTab === 'bounty' && (
                  <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                    {bounties.length}
                  </span>
                )}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-3" />
                Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleEditProfile}>
                <Edit className="h-4 w-4 mr-3" />
                Edit Profile
              </Button>
            </div>
          </nav>

          {/* User Profile in Sidebar */}
          <div className="p-4 border-t border-gray-200/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium text-sm">{userDisplayName}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                {(userRole === 'admin' || userRole === 'moderator') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header Tabs */}
            <div className="flex gap-8 mb-6 border-b border-gray-200/50">
              <button 
                onClick={() => setActiveTab('home')}
                className={`pb-3 border-b-2 font-medium ${
                  activeTab === 'home' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => setActiveTab('bounty')}
                className={`pb-3 border-b-2 font-medium ${
                  activeTab === 'bounty' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Bounty
              </button>
            </div>

            {/* Search Results */}
            {showSearchResults && (
              <div className="mb-6">
                <SearchResults 
                  results={searchResults} 
                  loading={searchLoading}
                  onClose={() => setShowSearchResults(false)}
                />
              </div>
            )}

            {/* Create Section */}
            {!showSearchResults && (
              <div className="mb-6">
                {activeTab === 'home' ? (
                  <CreateDiscussion onSubmit={createDiscussion} />
                ) : (
                  <CreateBounty onSubmit={createBounty} />
                )}
              </div>
            )}

            {/* Feed */}
            {!showSearchResults && (
              <div className="space-y-4">
                {activeTab === 'home' ? (
                  // Discussion Feed
                  discussionsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading discussions...</p>
                    </div>
                  ) : discussions.length > 0 ? (
                    discussions.map((discussion) => {
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
                            authorId: discussion.author_id,
                            authorInitials,
                            createdAt: timeAgo,
                            tags,
                            repliesCount: discussion.replies_count,
                            likesCount: discussion.likes_count,
                            isLiked: discussion.user_liked || false,
                            statusMessage: discussion.profiles?.status_message || undefined,
                            authorAvatarUrl: discussion.profiles?.avatar_url || undefined
                          }}
                          onLike={toggleLike}
                          onAuthorClick={() => navigate(`/profile/${discussion.author_id}`)}
                          onEdit={editDiscussion}
                          onDelete={deleteDiscussion}
                        />
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                      <p className="text-gray-500">Try adjusting your search or create the first discussion!</p>
                    </div>
                  )
                ) : (
                  // Bounty Feed
                  bountiesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading bounties...</p>
                    </div>
                  ) : bounties.length > 0 ? (
                    bounties.map((bounty) => {
                      const authorName = bounty.profiles?.full_name || 
                                       bounty.profiles?.username || 
                                       'Anonymous User';
                      const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase();
                      const tags = bounty.bounty_tags.map(tag => tag.tag);
                      const timeAgo = new Date(bounty.created_at).toLocaleDateString();

                      return (
                        <BountyCard
                          key={bounty.id}
                          bounty={{
                            id: bounty.id,
                            title: bounty.title,
                            description: bounty.description,
                            price: bounty.price,
                            currency: bounty.currency,
                            author: authorName,
                            authorId: bounty.author_id,
                            authorInitials,
                            authorAvatarUrl: bounty.profiles?.avatar_url || undefined,
                            createdAt: timeAgo,
                            status: bounty.status,
                            tags
                          }}
                          onAuthorClick={() => navigate(`/profile/${bounty.author_id}`)}
                        />
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bounties found</h3>
                      <p className="text-gray-500">Create the first bounty and start earning!</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Chat Head for Desktop */}
      <FloatingChatHead />
    </div>
  );
};

export default Index;
