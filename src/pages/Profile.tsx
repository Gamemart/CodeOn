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
  font_family?: string | null;
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
  const fontFamily = profile.font_family || 'Inter';

  // Get font style for the profile
  const getFontStyle = () => {
    return { fontFamily };
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
        {/* Profile Card - New Design */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative">
          {/* Edit button positioned absolutely */}
          {isOwnProfile && (
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white/20 shadow-xl flex-shrink-0">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                {/* Name and Username */}
                <div className="mb-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1" style={getFontStyle()}>
                    {displayName}
                  </h1>
                  {profile.username && (
                    <p className="text-white/70 text-lg" style={getFontStyle()}>
                      @{profile.username}
                    </p>
                  )}
                  {userId && (
                    <div className="mt-2">
                      <CustomRoleBadge userId={userId} />
                    </div>
                  )}
                </div>
                
                {/* Bio */}
                {profile.status_message && (
                  <p className="text-white/90 mb-6 text-base leading-relaxed" style={getFontStyle()}>
                    {profile.status_message}
                  </p>
                )}
                
                {/* Stats Row */}
                <div className="flex flex-wrap gap-6 text-sm text-white/70 mb-6" style={getFontStyle()}>
                  <span><strong className="text-white">{followers.length}</strong> Followers</span>
                  <span><strong className="text-white">{following.length}</strong> Following</span>
                  <span><strong className="text-white">{discussions.length}</strong> Discussion</span>
                  <span><strong className="text-white">1</strong> Bounty</span>
                </div>
                
                {/* Action Buttons */}
                {!isOwnProfile && currentUser && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={toggleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      className={`text-sm ${
                        isFollowing 
                          ? 'border-white/30 text-white hover:bg-white/10' 
                          : 'bg-white text-gray-900 hover:bg-white/90'
                      }`}
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
                    
                    {canModerate && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moderateUser(userId!, 'ban')}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 p-2"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moderateUser(userId!, 'mute')}
                          className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 p-2"
                        >
                          <VolumeX className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discussions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground" style={getFontStyle()}>Discussions</h2>
          
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
                <h3 className="text-xl font-semibold text-foreground mb-2" style={getFontStyle()}>No discussions yet</h3>
                <p className="text-muted-foreground" style={getFontStyle()}>
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