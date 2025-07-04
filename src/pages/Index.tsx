import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, TrendingUp, User, LogOut, Shield, Home, Bell, Phone, Mail, Globe, Edit, DollarSign, Menu, ChevronLeft } from 'lucide-react';
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
import ThemeToggle from '@/components/ThemeToggle';
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
  const { bounties, loading: bountiesLoading, createBounty, updateBounty, deleteBounty } = useBounties();
  const { userRole } = useUserRoles();
  const { profile } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { searchResults, loading: searchLoading, performSearch } = useSearch();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
    // Full screen chat view
    if (showMobileChat) {
      return (
        <div className="h-screen bg-background">
          <ChatWindow onClose={() => setShowMobileChat(false)} isMobile={true} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
        {/* Mobile Header */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                    <div className="w-4 h-0.5 bg-foreground"></div>
                    <div className="w-4 h-0.5 bg-foreground"></div>
                    <div className="w-4 h-0.5 bg-foreground"></div>
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
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
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
                className="bg-muted/50 border-border rounded-full"
              />
            </div>

            {/* Theme Toggle and Profile Avatar */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center space-x-8">
            <button 
              onClick={() => setActiveTab('home')}
              className={`pb-2 border-b-2 font-medium ${
                activeTab === 'home' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('bounty')}
              className={`pb-2 border-b-2 font-medium ${
                activeTab === 'bounty' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading discussions...</p>
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
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No discussions found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or create the first discussion!</p>
                  </div>
                )
              ) : (
                // Bounty Feed
                bountiesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading bounties...</p>
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
                        onEdit={updateBounty}
                        onDelete={deleteBounty}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No bounties found</h3>
                    <p className="text-muted-foreground">Create the first bounty and start earning!</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border p-4 z-50">
          <div className="flex justify-around items-center">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex flex-col items-center space-y-1"
            >
              <Home className={`h-5 w-5 ${activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs ${activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'}`}>Home</span>
            </button>
            <button 
              onClick={() => setShowMobileChat(true)}
              className="flex flex-col items-center space-y-1"
            >
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Chats</span>
            </button>
            <button className="flex flex-col items-center space-y-1">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-primary-foreground rounded-sm flex items-center justify-center">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Post</span>
            </button>
            <button 
              onClick={() => setActiveTab('bounty')}
              className="flex flex-col items-center space-y-1"
            >
              <DollarSign className={`h-5 w-5 ${activeTab === 'bounty' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs ${activeTab === 'bounty' ? 'text-primary' : 'text-muted-foreground'}`}>Bounty</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-card/80 backdrop-blur-md border-r border-border flex flex-col transition-all duration-300`}>
          {/* Logo and Toggle */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/7afeeb37-7c54-4797-96a2-394387235bdd.png" 
                  alt="ESTRANGHERO Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              {!sidebarCollapsed && (
                <span className="text-xl font-bold text-foreground">ESTRANGHERO</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2"
            >
              {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Search */}
          {!sidebarCollapsed && (
            <div className="p-4">
              <div className="relative">
                <Input
                  placeholder="Search discussions and users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-muted/50 border-border"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'} ${
                  activeTab === 'home' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                onClick={() => setActiveTab('home')}
              >
                <Home className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">Home</span>}
                {activeTab === 'home' && !sidebarCollapsed && (
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                )}
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'} ${
                  activeTab === 'bounty' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                onClick={() => setActiveTab('bounty')}
              >
                <DollarSign className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">Bounty Board</span>}
                {activeTab === 'bounty' && !sidebarCollapsed && (
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                )}
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'} text-muted-foreground hover:text-foreground hover:bg-muted/50`}
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <User className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">My Profile</span>}
              </Button>
              {(userRole === 'admin' || userRole === 'moderator') && (
                <Button 
                  variant="ghost" 
                  className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'} text-muted-foreground hover:text-foreground hover:bg-muted/50`}
                  onClick={() => navigate('/admin')}
                >
                  <Shield className="h-4 w-4" />
                  {!sidebarCollapsed && <span className="ml-3">Admin</span>}
                </Button>
              )}
            </div>
          </nav>

          {/* Profile Section */}
          <div className="border-t border-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'} h-12`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {!sidebarCollapsed && (
                    <div className="ml-3 text-left">
                      <p className="text-sm font-medium text-foreground">{userDisplayName}</p>
                    </div>
                  )}
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
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <div className="bg-card/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-foreground">
                {activeTab === 'home' ? 'Home Feed' : 'Bounty Board'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>

          {/* Main Feed Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-muted/20">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {/* Search Results */}
              {showSearchResults && (
                <SearchResults 
                  results={searchResults} 
                  loading={searchLoading}
                  onClose={() => setShowSearchResults(false)}
                />
              )}

              {/* Create Section */}
              {!showSearchResults && (
                <>
                  {activeTab === 'home' ? (
                    <CreateDiscussion onSubmit={createDiscussion} />
                  ) : (
                    <CreateBounty onSubmit={createBounty} />
                  )}
                </>
              )}

              {/* Feed */}
              {!showSearchResults && (
                <div className="space-y-6">
                  {activeTab === 'home' ? (
                    // Discussion Feed
                    discussionsLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading discussions...</p>
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
                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No discussions found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or create the first discussion!</p>
                      </div>
                    )
                  ) : (
                    // Bounty Feed
                    bountiesLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading bounties...</p>
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
                            onEdit={updateBounty}
                            onDelete={deleteBounty}
                          />
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No bounties found</h3>
                        <p className="text-muted-foreground">Create the first bounty and start earning!</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Head for Desktop */}
      <FloatingChatHead />
    </div>
  );
};

export default Index;