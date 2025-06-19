
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, TrendingUp, User, LogOut, Shield, Home, Settings, HelpCircle, Search, Bell, Phone, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DiscussionCard from '@/components/DiscussionCard';
import CreateDiscussion from '@/components/CreateDiscussion';
import SearchAndFilter from '@/components/SearchAndFilter';
import { useAuth } from '@/hooks/useAuth';
import { useDiscussions } from '@/hooks/useDiscussions';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { discussions, loading: discussionsLoading, createDiscussion, editDiscussion, deleteDiscussion, toggleLike } = useDiscussions();
  const { userRole } = useUserRoles();
  const { profile } = useProfile();
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

    if (searchQuery) {
      filtered = filtered.filter(discussion =>
        discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.discussion_tags.some(tag => 
          tag.tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (activeFilters.length > 0) {
      filtered = filtered.filter(discussion =>
        discussion.discussion_tags.some(tag => activeFilters.includes(tag.tag))
      );
    }

    setFilteredDiscussions(filtered);
  }, [discussions, searchQuery, activeFilters]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/50 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DiscussHub</span>
            </div>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50/50 border-gray-200/50"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-blue-600 bg-blue-50">
                <Home className="h-4 w-4 mr-3" />
                Home
                <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {discussions.length}
                </span>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Users className="h-4 w-4 mr-3" />
                Users
                <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  2
                </span>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-3" />
                Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-3" />
                Help & Support
              </Button>
            </div>
          </nav>

          {/* User Profile in Sidebar */}
          <div className="p-4 border-t border-gray-200/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium text-sm">{userDisplayName}</div>
                    <div className="text-xs text-gray-500">Basic Member</div>
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

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Center Feed */}
          <div className="flex-1 max-w-2xl mx-auto p-6 overflow-y-auto">
            {/* Header Tabs */}
            <div className="flex gap-8 mb-6 border-b border-gray-200/50">
              <button className="pb-3 border-b-2 border-blue-500 text-blue-600 font-medium">
                For You
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-700">
                Following
              </button>
            </div>

            {/* Create Discussion */}
            <div className="mb-6">
              <CreateDiscussion onSubmit={createDiscussion} />
            </div>

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
                        authorId: discussion.author_id,
                        authorInitials,
                        createdAt: timeAgo,
                        tags,
                        repliesCount: discussion.replies_count,
                        likesCount: discussion.likes_count,
                        isLiked: discussion.user_liked || false
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
              )}
            </div>
          </div>

          {/* Right Sidebar - User Profile */}
          <div className="w-80 bg-white/80 backdrop-blur-md border-l border-gray-200/50 p-6 overflow-y-auto">
            {/* User Profile Card */}
            <Card className="mb-6 overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardContent className="p-0">
                {/* Profile Header */}
                <div className="relative">
                  <div className="h-20 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                  <div className="absolute -bottom-8 left-6">
                    <Avatar className="h-16 w-16 border-4 border-white">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="pt-10 px-6 pb-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{userDisplayName}</h3>
                    <p className="text-gray-500">@{profile?.username || 'user'}</p>
                    <p className="text-sm text-gray-600 mt-1">Osaka, Japan 🎌</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{discussions.filter(d => d.author_id === user.id).length}</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">12.7K</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">221</div>
                      <div className="text-xs text-gray-500">Following</div>
                    </div>
                  </div>

                  {/* About Me */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">About Me</h4>
                    <p className="text-sm text-gray-600">
                      Hi there! 🔥 I'm X_AE_A-19, an AI enthusiast and fitness aficionado. When I'm not crunching numbers or optimizing algorithms, you can find me hitting the gym.
                    </p>
                    <button className="text-blue-600 text-sm mt-1 hover:underline">Read More</button>
                  </div>

                  {/* Story Highlights */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">My Story Highlights</h4>
                    <div className="flex gap-2">
                      {['France', 'Korea', 'USA', 'India', 'Sweden'].map((country, index) => (
                        <div key={country} className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mb-1"></div>
                          <span className="text-xs text-gray-600">{country}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">+123 456 789 000</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">hello@slothui.com</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">www.slothui.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
