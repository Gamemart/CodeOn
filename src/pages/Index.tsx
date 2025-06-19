
import React, { useState, useEffect } from 'react';
import { User, Plus, Search, Filter, MessageCircle, Heart, Tag, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import CreateDiscussion from '@/components/CreateDiscussion';
import DiscussionCard from '@/components/DiscussionCard';
import SearchAndFilter from '@/components/SearchAndFilter';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useDiscussions } from '@/hooks/useDiscussions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  const {
    discussions,
    loading,
    createDiscussion,
    likeDiscussion,
    editDiscussion,
    deleteDiscussion,
    userLikes
  } = useDiscussions();

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || discussion.discussion_tags.some(tag => tag.tag === selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(
    new Set(
      discussions.flatMap(d => d.discussion_tags.map(tag => tag.tag))
    )
  );

  const handleCreateDiscussion = async (discussionData: { title: string; body: string; tags: string[] }) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    await createDiscussion(discussionData);
  };

  const handleLikeDiscussion = async (discussionId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    await likeDiscussion(discussionId);
  };

  const handleUserClick = (authorId?: string) => {
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-yellow-200 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg font-medium">Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-yellow-200">
      {/* Mobile-First Header */}
      <header className="bg-white/20 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Discussions</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Share your thoughts with the community</p>
              </div>
            </div>
            
            {user ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 rounded-xl px-3 py-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                      {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-gray-900 font-medium">Profile</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 rounded-xl p-2"
                >
                  <LogOut className="h-5 w-5 text-gray-900" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl px-6 py-2 shadow-lg"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Search and Filter Card */}
        <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-gray-50/50 border-0 rounded-2xl h-12 text-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTag === '' ? "default" : "outline"}
                    onClick={() => setSelectedTag('')}
                    className={`rounded-full text-sm ${
                      selectedTag === '' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                        : 'bg-white/50 text-gray-700 hover:bg-white/70'
                    }`}
                  >
                    All
                  </Button>
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                      className={`rounded-full text-sm ${
                        selectedTag === tag
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white/50 text-gray-700 hover:bg-white/70'
                      }`}
                    >
                      #{tag}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Discussion Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl border-0 shadow-xl overflow-hidden">
          <CreateDiscussion onSubmit={handleCreateDiscussion} />
        </div>

        {/* Discussions List */}
        <div className="space-y-4">
          {filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((discussion) => {
              const author = discussion.profiles?.full_name || 
                           discussion.profiles?.username || 
                           'Anonymous User';
              const authorInitials = author.split(' ').map(n => n[0]).join('').toUpperCase();
              const tags = discussion.discussion_tags.map(dt => dt.tag);
              const isLiked = userLikes.includes(discussion.id);

              return (
                <div key={discussion.id} className="bg-white/90 backdrop-blur-lg rounded-3xl border-0 shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-200">
                  <DiscussionCard
                    discussion={{
                      id: discussion.id,
                      title: discussion.title,
                      body: discussion.body,
                      author,
                      authorId: discussion.author_id,
                      authorInitials,
                      authorAvatarUrl: discussion.profiles?.avatar_url,
                      createdAt: new Date(discussion.created_at).toLocaleDateString(),
                      tags,
                      repliesCount: discussion.replies_count || 0,
                      likesCount: discussion.likes_count || 0,
                      isLiked,
                      statusMessage: discussion.profiles?.status_message
                    }}
                    onLike={handleLikeDiscussion}
                    onAuthorClick={() => handleUserClick(discussion.author_id)}
                    onEdit={editDiscussion}
                    onDelete={deleteDiscussion}
                  />
                </div>
              );
            })
          ) : (
            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-3xl">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No discussions found</h3>
                <p className="text-gray-600 text-lg">
                  {searchTerm || selectedTag
                    ? "Try adjusting your search or filter criteria."
                    : "Be the first to start a discussion!"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={login}
        />
      </main>
    </div>
  );
};

export default Index;
