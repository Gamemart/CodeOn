import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MessageCircle, DollarSign, User, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useProfile } from '@/hooks/useProfile';
import { useDiscussions } from '@/hooks/useDiscussions';
import { useBounties } from '@/hooks/useBounties';
import { useSearch } from '@/hooks/useSearch';
import { toast } from '@/hooks/use-toast';
import CreateDiscussion from '@/components/CreateDiscussion';
import CreateBounty from '@/components/CreateBounty';
import DiscussionCard from '@/components/DiscussionCard';
import BountyCard from '@/components/BountyCard';
import FloatingChatHead from '@/components/chat/FloatingChatHead';
import AuthModal from '@/components/AuthModal';
import SearchResults from '@/components/SearchResults';
import SearchAndFilter from '@/components/SearchAndFilter';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { userRole } = useUserRoles();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState('discussions');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterTag, setFilterTag] = useState('');

  const {
    discussions,
    loading: discussionsLoading,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion,
    toggleLike: toggleDiscussionLike,
    refetch: refetchDiscussions
  } = useDiscussions();

  const {
    bounties,
    loading: bountiesLoading,
    createBounty,
    updateBounty,
    deleteBounty,
    refetch: refetchBounties
  } = useBounties();

  const { searchResults, isSearching, performSearch } = useSearch();

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User';
  const userInitials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  const uniqueTags = useMemo(() => {
    const allTags = new Set<string>();
    discussions.forEach(discussion => {
      discussion.tags.forEach(tag => allTags.add(tag));
    });
    bounties.forEach(bounty => {
      bounty.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  }, [discussions, bounties]);

  const filteredAndSortedDiscussions = useMemo(() => {
    let filtered = discussions.filter(discussion => {
      const matchesSearch = !searchQuery || 
        discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = !filterTag || discussion.tags.includes(filterTag);
      
      return matchesSearch && matchesTag;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-liked':
          return b.likesCount - a.likesCount;
        case 'most-replies':
          return b.repliesCount - a.repliesCount;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [discussions, searchQuery, filterTag, sortBy]);

  const filteredAndSortedBounties = useMemo(() => {
    let filtered = bounties.filter(bounty => {
      const matchesSearch = !searchQuery || 
        bounty.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bounty.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bounty.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = !filterTag || bounty.tags.includes(filterTag);
      
      return matchesSearch && matchesTag;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest-price':
          return b.price - a.price;
        case 'lowest-price':
          return a.price - b.price;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [bounties, searchQuery, filterTag, sortBy]);

  const handleCreateDiscussion = async (discussionData: any) => {
    try {
      await createDiscussion(discussionData);
      refetchDiscussions();
      toast({
        title: "Discussion posted!",
        description: "Your discussion has been shared with the community."
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to post discussion. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateBounty = async (bountyData: any) => {
    try {
      await createBounty(bountyData);
      refetchBounties();
      toast({
        title: "Bounty posted!",
        description: "Your bounty has been posted successfully."
      });
    } catch (error) {
      console.error('Error creating bounty:', error);
      toast({
        title: "Error",
        description: "Failed to post bounty. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateDiscussion = async (discussionId: string, updates: any) => {
    try {
      await updateDiscussion(discussionId, updates);
      refetchDiscussions();
      toast({
        title: "Discussion updated",
        description: "Your discussion has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to update discussion. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    try {
      await deleteDiscussion(discussionId);
      refetchDiscussions();
      toast({
        title: "Discussion deleted",
        description: "The discussion has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting discussion:', error);
      toast({
        title: "Error",
        description: "Failed to delete discussion. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateBounty = async (bountyId: string, updates: any) => {
    try {
      await updateBounty(bountyId, updates);
      refetchBounties();
      toast({
        title: "Bounty updated",
        description: "Your bounty has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating bounty:', error);
      toast({
        title: "Error",
        description: "Failed to update bounty. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBounty = async (bountyId: string) => {
    try {
      await deleteBounty(bountyId);
      refetchBounties();
      toast({
        title: "Bounty deleted",
        description: "The bounty has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting bounty:', error);
      toast({
        title: "Error",
        description: "Failed to delete bounty. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out."
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">DevConnect</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100/50">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-medium">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline font-medium text-gray-700">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    {(userRole === 'admin' || userRole === 'moderator') && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="h-4 w-4 mr-2" />
                        {userRole === 'admin' ? 'Admin Dashboard' : 'Moderation'}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Search Section */}
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterTag={filterTag}
          onFilterTagChange={setFilterTag}
          availableTags={uniqueTags}
          activeTab={activeTab}
        />

        {/* Search Results */}
        {searchQuery.trim() && (
          <SearchResults 
            results={searchResults}
            loading={isSearching}
            onDiscussionLike={toggleDiscussionLike}
            onDiscussionEdit={handleUpdateDiscussion}
            onDiscussionDelete={handleDeleteDiscussion}
            onBountyEdit={handleUpdateBounty}
            onBountyDelete={handleDeleteBounty}
          />
        )}

        {/* Main Content Tabs */}
        {!searchQuery.trim() && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8">
              <TabsTrigger value="discussions" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Discussions</span>
                <span className="sm:hidden">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="bounties" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Bounties
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussions" className="space-y-4 sm:space-y-6">
              {user && (
                <CreateDiscussion onSubmit={handleCreateDiscussion} />
              )}

              <div className="space-y-3 sm:space-y-4">
                {discussionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading discussions...</p>
                  </div>
                ) : filteredAndSortedDiscussions.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                      <p className="text-gray-500">
                        {searchQuery || filterTag ? 'Try adjusting your search or filter.' : 'Be the first to start a discussion!'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredAndSortedDiscussions.map((discussion) => (
                    <DiscussionCard
                      key={discussion.id}
                      discussion={discussion}
                      onLike={toggleDiscussionLike}
                      onAuthorClick={() => navigate(`/profile/${discussion.authorId}`)}
                      onEdit={handleUpdateDiscussion}
                      onDelete={handleDeleteDiscussion}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="bounties" className="space-y-4 sm:space-y-6">
              {user && (
                <CreateBounty onSubmit={handleCreateBounty} />
              )}

              <div className="space-y-3 sm:space-y-4">
                {bountiesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading bounties...</p>
                  </div>
                ) : filteredAndSortedBounties.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bounties found</h3>
                      <p className="text-gray-500">
                        {searchQuery || filterTag ? 'Try adjusting your search or filter.' : 'Be the first to post a bounty!'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredAndSortedBounties.map((bounty) => (
                    <BountyCard
                      key={bounty.id}
                      bounty={bounty}
                      onAuthorClick={() => navigate(`/profile/${bounty.authorId}`)}
                      onEdit={handleUpdateBounty}
                      onDelete={handleDeleteBounty}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Floating Components */}
      {user && <FloatingChatHead />}
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
