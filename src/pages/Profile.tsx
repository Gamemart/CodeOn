
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <Button onClick={() => navigate('/')} variant="outline" className="border-gray-300 text-gray-700">
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discussions
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden bg-white border-gray-200 shadow-lg">
          {/* Profile Banner */}
          <ProfileBanner 
            bannerType={profile.banner_type}
            bannerValue={profile.banner_value}
            className="h-40 md:h-56"
          />
          
          <CardContent className="p-0 relative">
            {/* Avatar positioned over banner */}
            <div className="relative px-8 pb-8">
              <div className={`flex ${getFlexAlignment()} -mt-16 mb-6`}>
                <div className="relative">
                  <Avatar className="h-32 w-32 border-8 border-white bg-white shadow-xl">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Edit Profile Icon - Bottom Left of Avatar */}
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsEditModalOpen(true)}
                      className="absolute -bottom-2 -left-2 h-10 w-10 rounded-full bg-white border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-900 shadow-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* User Info Section */}
              <div className={`space-y-4 ${getAlignmentClasses()}`}>
                {/* Name and Username */}
                <div>
                  <div className={`flex ${getFlexAlignment()} items-center gap-3 mb-1`}>
                    <h1 className="text-4xl font-bold text-gray-900">{displayName}</h1>
                    {/* Only show custom role badge, not admin/moderator badges */}
                    {userId && <CustomRoleBadge userId={userId} />}
                  </div>
                  {profile.username && (
                    <p className="text-gray-600 text-lg">@{profile.username}</p>
                  )}
                  {profile.status_message && (
                    <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
                      <p className="text-gray-700">{profile.status_message}</p>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 py-4 ${getFlexAlignment()}`}>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-xl font-bold text-gray-900">{followers.length}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-xl font-bold text-gray-900">{following.length}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-xl font-bold text-gray-900">{discussions.length}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-600">Joined</div>
                    <div className="text-sm font-medium text-gray-900">{new Date(profile.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && currentUser && (
                  <div className={`flex flex-wrap gap-3 pt-4 ${getFlexAlignment()}`}>
                    <Button
                      onClick={toggleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={isFollowing 
                        ? "border-gray-300 text-gray-700 hover:bg-gray-100" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"
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
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moderateUser(userId!, 'mute')}
                          className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
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

        {/* Content Tabs */}
        <Tabs defaultValue="discussions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 border border-gray-200">
            <TabsTrigger value="discussions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Discussions
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-4">
            {discussions.length > 0 ? (
              discussions.map((discussion) => {
                const tags = discussion.discussion_tags.map(dt => dt.tag);
                return (
                  <DiscussionCard
                    key={discussion.id}
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
                );
              })
            ) : (
              <Card className="bg-white border-gray-200">
                <CardContent className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? "Start a discussion to see it here!" : "This user hasn't created any discussions yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-white border-gray-200">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Feed</h3>
                <p className="text-gray-600">Activity tracking coming soon!</p>
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
