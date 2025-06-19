
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <Button onClick={() => navigate('/')}>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discussions
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          {/* Profile Banner */}
          <ProfileBanner 
            bannerType={profile.banner_type}
            bannerValue={profile.banner_value}
            className="h-32 md:h-48"
          />
          
          <CardContent className="p-8 relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-16 md:-mt-12">
              <Avatar className="h-24 w-24 border-4 border-white bg-white">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                      {displayName}
                      {isOwnProfile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditModalOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      )}
                    </h1>
                    {profile.username && (
                      <p className="text-gray-500">@{profile.username}</p>
                    )}
                    {profile.status_message && (
                      <p className="text-gray-700 mt-2 italic">"{profile.status_message}"</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                    <Badge variant={userRoleData === 'admin' ? 'destructive' : userRoleData === 'moderator' ? 'default' : 'secondary'}>
                      <Shield className="h-3 w-3 mr-1" />
                      {userRoleData}
                    </Badge>
                    {userId && <CustomRoleBadge userId={userId} />}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{followers.length} followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{following.length} following</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{discussions.length} discussions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {!isOwnProfile && currentUser && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={toggleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className="flex items-center gap-2"
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
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
                          className="text-red-600 hover:text-red-700"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moderateUser(userId!, 'mute')}
                          className="text-orange-600 hover:text-orange-700"
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
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
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                  <p className="text-gray-500">
                    {isOwnProfile ? "Start a discussion to see it here!" : "This user hasn't created any discussions yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Feed</h3>
                <p className="text-gray-500">Activity tracking coming soon!</p>
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
