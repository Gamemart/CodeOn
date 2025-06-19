

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">User not found</h3>
          <Button onClick={() => navigate('/')} variant="outline" className="border-slate-700 text-slate-300">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-300 hover:text-purple-400 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discussions
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header - Discord Gaming Style */}
        <Card className="mb-8 overflow-hidden bg-slate-800/50 border-slate-700 shadow-2xl">
          {/* Profile Banner */}
          <ProfileBanner 
            bannerType={profile.banner_type}
            bannerValue={profile.banner_value}
            className="h-40 md:h-56"
          />
          
          <CardContent className="p-0 relative">
            {/* Avatar positioned over banner */}
            <div className="relative px-8 pb-8">
              <div className="flex items-end -mt-16 mb-6">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-8 border-slate-800 bg-slate-800 shadow-2xl">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-3xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Edit Profile Icon - Bottom Left of Avatar */}
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsEditModalOpen(true)}
                      className="absolute -bottom-2 -left-2 h-10 w-10 rounded-full bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300 hover:text-white shadow-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* User Info Section */}
              <div className="space-y-4">
                {/* Name and Status */}
                <div>
                  <h1 className="text-4xl font-bold text-white mb-1">{displayName}</h1>
                  {profile.username && (
                    <p className="text-slate-400 text-lg">@{profile.username}</p>
                  )}
                  {profile.status_message && (
                    <div className="mt-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <p className="text-slate-300 italic">"{profile.status_message}"</p>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge 
                    variant={userRoleData === 'admin' ? 'destructive' : userRoleData === 'moderator' ? 'default' : 'secondary'}
                    className="text-sm font-semibold"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {userRoleData.toUpperCase()}
                  </Badge>
                  {userId && <CustomRoleBadge userId={userId} />}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="text-2xl font-bold text-white">{followers.length}</div>
                    <div className="text-sm text-slate-400">Followers</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="text-2xl font-bold text-white">{following.length}</div>
                    <div className="text-sm text-slate-400">Following</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="text-2xl font-bold text-white">{discussions.length}</div>
                    <div className="text-sm text-slate-400">Posts</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="text-sm text-slate-400">Joined</div>
                    <div className="text-sm font-medium text-white">{new Date(profile.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && currentUser && (
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button
                      onClick={toggleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={isFollowing 
                        ? "border-slate-600 text-slate-300 hover:bg-slate-700" 
                        : "bg-purple-600 hover:bg-purple-700 text-white"
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
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moderateUser(userId!, 'mute')}
                          className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
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
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="discussions" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Discussions
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
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
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No discussions yet</h3>
                  <p className="text-slate-400">
                    {isOwnProfile ? "Start a discussion to see it here!" : "This user hasn't created any discussions yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Activity Feed</h3>
                <p className="text-slate-400">Activity tracking coming soon!</p>
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

