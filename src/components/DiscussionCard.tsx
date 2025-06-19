import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Pencil, Share, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import ReplySection from '@/components/ReplySection';
import EditDiscussionModal from '@/components/EditDiscussionModal';

export interface DiscussionCardProps {
  discussion: {
    id: string;
    title: string;
    body: string;
    author: string;
    authorId: string;
    authorInitials: string;
    createdAt: string;
    tags: string[];
    repliesCount: number;
    likesCount: number;
    isLiked: boolean;
    statusMessage?: string;
    authorAvatarUrl?: string;
    images?: string[];
  };
  onLike: (discussionId: string) => void;
  onAuthorClick: () => void;
  onEdit: (discussionId: string, updates: { title?: string; body?: string; tags?: string[] }) => void;
  onDelete: (discussionId: string) => void;
}

const DiscussionCard = ({ discussion, onLike, onAuthorClick, onEdit, onDelete }: DiscussionCardProps) => {
  const [showReplySection, setShowReplySection] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user } = useAuth();
  
  const handleLike = () => {
    onLike(discussion.id);
  };

  const canEdit = user?.id === discussion.authorId;

  const handleEdit = (updates: { title?: string; body?: string; tags?: string[] }) => {
    onEdit(discussion.id, updates);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    onDelete(discussion.id);
  };

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar 
              className="h-10 w-10 sm:h-12 sm:w-12 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all" 
              onClick={onAuthorClick}
            >
              <AvatarImage src={discussion.authorAvatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm sm:text-base">
                {discussion.authorInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              {/* User Info */}
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 
                      className="font-semibold text-gray-900 text-sm sm:text-base hover:text-blue-600 cursor-pointer transition-colors truncate"
                      onClick={onAuthorClick}
                    >
                      {discussion.author}
                    </h3>
                    <span className="text-gray-400 text-xs sm:text-sm">•</span>
                    <span className="text-gray-500 text-xs sm:text-sm">{discussion.createdAt}</span>
                  </div>
                  {/* Tags below username */}
                  {discussion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {discussion.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Actions Menu */}
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Discussion Content */}
              <div className="space-y-3">
                {discussion.title && discussion.title !== 'Untitled Discussion' && (
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
                    {discussion.title}
                  </h2>
                )}
                
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {discussion.body}
                </p>

                {/* Images Grid */}
                {discussion.images && discussion.images.length > 0 && (
                  <div className={`grid gap-2 rounded-lg overflow-hidden ${
                    discussion.images.length === 1 ? 'grid-cols-1' :
                    discussion.images.length === 2 ? 'grid-cols-2' :
                    discussion.images.length === 3 ? 'grid-cols-3' :
                    discussion.images.length === 4 ? 'grid-cols-2' :
                    'grid-cols-2 sm:grid-cols-3'
                  }`}>
                    {discussion.images.map((imageUrl, index) => (
                      <div 
                        key={index} 
                        className={`relative overflow-hidden rounded-lg ${
                          discussion.images!.length === 1 ? 'aspect-[4/3]' :
                          discussion.images!.length <= 4 ? 'aspect-square' :
                          'aspect-square'
                        }`}
                      >
                        <img 
                          src={imageUrl} 
                          alt={`Discussion image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-gray-100 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm transition-colors ${
                    discussion.isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${discussion.isLiked ? 'fill-current' : ''}`} />
                  <span>{discussion.likesCount}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplySection(!showReplySection)}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{discussion.repliesCount} {discussion.repliesCount === 1 ? 'Reply' : 'Replies'}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-green-600 transition-colors"
                >
                  <Share className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Section */}
      {showReplySection && (
        <div className="mt-2">
          <ReplySection discussionId={discussion.id} />
        </div>
      )}

      {/* Edit Modal */}
      <EditDiscussionModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        discussion={discussion}
        onSave={handleEdit}
      />
    </>
  );
};

export default DiscussionCard;
