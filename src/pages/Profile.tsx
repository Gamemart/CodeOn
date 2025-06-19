import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Users, MessageCircle, Calendar, ArrowLeft, UserPlus, UserMinus, Shield, Ban, Volume, VolumeX, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DiscussionCard from '@/components/DiscussionCard';
import CustomRoleBadge from '@/components/CustomRoleBadge';
import ProfileBanner from '@/components/ProfileBanner';
import EditProfileModal from '@/components/EditProfileModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFollows } from '@/hooks/useFollows';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

interface Discussion {
  id: string;
  title: string;
  body: string;
  created_at: string;
  likes_count: number;
  replies_count: number;
  discussion_tags: { tag: string }[];
}

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  banner_type: string | null;
  banner_value: string | null;
  status_message: string | null;
  profile_alignment?: string | null;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { followers, following, isFollowing, toggleFollow } = useFollows(userId);
  const { userRole, updateUserRole, moderateUser } = useUserRoles();
  const { profile, loading: profileLoading, updateProfile } = useProfile(userId);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [userRoleData, setUserRoleData] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDiscussions();
      fetchUserRole();
    }
  }, [userId]);

  const fetchUserDiscussions = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          discussion_tags(tag)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error) {
      console.error('Error fetching user discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserRoleData(data?.role || 'user');
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">User not found</h3>
          <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || 'Anonymous User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
  const isOwnProfile = currentUser?.id === userId;
  const canModerate = userRole === 'admin' || userRole === 'moderator';
  const profileAlignment = profile.profile_alignment || 'left';

  // Get alignment classes
  const getAlignmentClasses = () => {
    switch (profileAlignment) {
      case 'center':
        return 'text-center items-center';
      case 'right':
        return 'text-right items-end';
      default:
        return 'text-left items-start';
    }
  };

  const getFlexAlignment = () => {
    switch (profileAlignment) {
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-start';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Modern Header with Glass Effect */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg px-3 py-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discussions
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Modern Profile Header */}
        <Card className="mb-8 overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          {/* Enhanced Profile Banner */}
          <div className="relative">
            <ProfileBanner 
              bannerType={profile.banner_type}
              bannerValue={profile.banner_value}
              className="h-48 md:h-64"
            />
            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          <CardContent className="p-0 relative">
            {/* Modern Avatar Section */}
            <div className="relative px-8 pb-8">
              <div className={`flex ${getFlexAlignment()} -mt-20 mb-8`}>
                <div className="relative">
                  <Avatar className="h-36 w-36 border-6 border-white bg-white shadow-2xl ring-4 ring-blue-100">
                    <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-4xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Modern Edit Profile Button */}
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsEditModalOpen(true)}
                      className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Enhanced User Info Section */}
              <div className={`space-y-6 ${getAlignmentClasses()}`}>
                {/* Name and Username */}
                <div>
                  <div className={`flex ${getFlexAlignment()} items-center gap-4 mb-2`}>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {displayName}
                    </h1>
                    {/* Only show custom role badge, not admin/moderator badges */}
                    {userId && <CustomRoleBadge userId={userId} />}
                  </div>
                  {profile.username && (
                    <p className="text-gray-500 text-xl font-medium">@{profile.username}</p>
                  )}
                  {profile.status_message && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <p className="text-gray-700 text-lg leading-relaxed">{profile.status_message}</p>
                    </div>
                  )}
                </div>

                {/* Modern Stats Grid */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 py-6 ${getFlexAlignment()}`}>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
                    <div className="text-2xl font-bold text-blue-600">{followers.length}</div>
                    <div className="text-sm text-blue-600/80 font-medium">Followers</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
                    <div className="text-2xl font-bold text-purple-600">{following.length}</div>
                    <div className="text-sm text-purple-600/80 font-medium">Following</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
                    <div className="text-2xl font-bold text-green-600">{discussions.length}</div>
                    <div className="text-sm text-green-600/80 font-medium">Posts</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-200">
                    <div className="text-sm text-orange-600/80 font-medium">Joined</div>
                    <div className="text-sm font-bold text-orange-600">{new Date(profile.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Modern Action Buttons */}
                {!isOwnProfile && currentUser && (
                  <div className={`flex flex-wrap gap-3 pt-6 ${getFlexAlignment()}`}>
                    <Button
                      onClick={toggleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={isFollowing 
                        ? "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-semibold transition-all duration-200" 
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      }
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>

                    {canModerate && !isOwnProfile && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moderateUser(userId!, 'ban')}
                          className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-200"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moderateUser(userId!, 'mute')}
                          className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl transition-all duration-200"
                        >
                          <VolumeX className="h-4 w-4 mr-1" />
                          Mute
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modern Content Tabs */}
        <Tabs defaultValue="discussions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1 shadow-sm">
            <TabsTrigger 
              value="discussions" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Discussions
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200"
            >
              <Users className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-6 mt-6">
            {discussions.length > 0 ? (
              discussions.map((discussion) => {
                const tags = discussion.discussion_tags.map(dt => dt.tag);
                return (
                  <div key={discussion.id} className="transform hover:scale-[1.01] transition-all duration-200">
                    <DiscussionCard
                      discussion={{
                        id: discussion.id,
                        title: discussion.title,
                        body: discussion.body,
                        author: displayName,
                        authorId: userId,
                        authorInitials: initials,
                        authorAvatarUrl: profile.avatar_url,
                        createdAt: new Date(discussion.created_at).toLocaleDateString(),
                        tags,
                        repliesCount: discussion.replies_count,
                        likesCount: discussion.likes_count,
                        isLiked: false,
                        statusMessage: profile.status_message
                      }}
                      onLike={() => {}}
                    />
                  </div>
                );
              })
            ) : (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No discussions yet</h3>
                  <p className="text-gray-600 text-lg">
                    {isOwnProfile ? "Start a discussion to see it here!" : "This user hasn't created any discussions yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Activity Feed</h3>
                <p className="text-gray-600 text-lg">Activity tracking coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onProfileUpdate={updateProfile}
        />
      </main>
    </div>
  );
};

export default Profile;
