
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">User not found</h3>
          <p className="text-muted-foreground mb-6">The profile you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="px-6 py-3 rounded-lg">
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
  const alignment = profile.profile_alignment || 'left';

  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'center':
        return 'text-center items-center';
      case 'right':
        return 'text-right items-end';
      default:
        return 'text-left items-start';
    }
  };

  const getFlexDirection = () => {
    return alignment === 'center' ? 'flex-col' : 'flex-row';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Simple Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="border-0 shadow-lg rounded-xl overflow-hidden relative">
          {/* Profile Banner Background */}
          <ProfileBanner 
            bannerType={profile.banner_type}
            bannerValue={profile.banner_value}
            className={`absolute inset-0 ${profile.banner_type === 'image' ? 'opacity-40' : 'opacity-20'}`}
          />
          <div className={`absolute inset-0 ${profile.banner_type === 'image' ? 'bg-card/80 backdrop-blur-md' : 'bg-card/90 backdrop-blur-sm'}`}></div>
          <CardContent className="relative z-10 p-4 sm:p-6">
            <div className={`flex ${getFlexDirection()} ${alignment === 'center' ? 'gap-6' : 'gap-4'} ${getAlignmentClasses()}`}>
              {/* Avatar - positioned first in center alignment for pyramid structure */}
              {alignment === 'center' && (
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              {/* Avatar for left/right alignment */}
              {alignment !== 'center' && (
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
              
              {/* Profile Info */}
              <div className={`flex-1 min-w-0 ${alignment === 'center' ? 'w-full' : ''}`}>
                {/* Name and Role */}
                <div className={`flex ${alignment === 'center' ? 'flex-col' : 'flex-row'} ${alignment === 'center' ? 'items-center' : 'items-start'} gap-2 mb-2`}>
                  <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-foreground ${alignment === 'center' ? 'text-center' : 'truncate'}`}>
                    {displayName}
                  </h1>
                  {userId && (
                    <div className={alignment === 'center' ? 'flex justify-center' : ''}>
                      <CustomRoleBadge userId={userId} />
                    </div>
                  )}
                </div>
                
                {/* Username */}
                {profile.username && (
                  <p className={`text-muted-foreground text-base sm:text-lg mb-2 ${alignment === 'center' ? 'text-center' : ''}`}>
                    @{profile.username}
                  </p>
                )}
                
                {/* Status Message */}
                {profile.status_message && (
                  <p className={`text-foreground mb-4 text-sm sm:text-base ${alignment === 'center' ? 'text-center max-w-md mx-auto' : ''}`}>
                    {profile.status_message}
                  </p>
                )}
                
                {/* Stats */}
                <div className={`flex ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'} flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground mb-4`}>
                  <span><strong>{followers.length}</strong> Followers</span>
                  <span><strong>{following.length}</strong> Following</span>
                  <span><strong>{discussions.length}</strong> Posts</span>
                  <span className="hidden sm:inline">Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
                
                {/* Action Buttons */}
                <div className={`flex ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'} flex-wrap gap-2`}>
                  {isOwnProfile ? (
                    <Button
                      onClick={() => setIsEditModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Edit Profile
                    </Button>
                  ) : currentUser ? (
                    <>
                      <Button
                        onClick={toggleFollow}
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                      
                      {canModerate && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moderateUser(userId!, 'ban')}
                            className="text-destructive border-destructive/20 hover:bg-destructive/10 p-2"
                          >
                            <Ban className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moderateUser(userId!, 'mute')}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 p-2"
                          >
                            <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discussions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Discussions</h2>
          
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
            <Card className="bg-card/90 backdrop-blur-sm border-0 shadow-lg rounded-xl">
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No discussions yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Start a discussion to see it here!" : "This user hasn't created any discussions yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

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
