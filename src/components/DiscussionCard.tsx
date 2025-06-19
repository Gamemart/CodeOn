
import React, { useState } from 'react';
import { Heart, MessageCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import CustomRoleBadge from '@/components/CustomRoleBadge';
import ReplySection from '@/components/ReplySection';
import EditDiscussionModal from '@/components/EditDiscussionModal';
import { useAuth } from '@/hooks/useAuth';

interface Discussion {
  id: string;
  title: string;
  body: string;
  author: string;
  authorId?: string;
  authorInitials: string;
  createdAt: string;
  tags: string[];
  repliesCount: number;
  likesCount: number;
  isLiked: boolean;
}

interface DiscussionCardProps {
  discussion: Discussion;
  onLike: (discussionId: string) => void;
  onAuthorClick?: () => void;
  onEdit?: (discussionId: string, updates: { title: string; body: string; tags: string[] }) => void;
  onDelete?: (discussionId: string) => void;
}

const DiscussionCard = ({ discussion, onLike, onAuthorClick, onEdit, onDelete }: DiscussionCardProps) => {
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  
  const isAuthor = user?.id === discussion.authorId;

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSave = (updates: { title: string; body: string; tags: string[] }) => {
    if (onEdit) {
      onEdit(discussion.id, updates);
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(discussion.id);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="p-4">
        {/* Header with author info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                {discussion.authorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <span 
                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600" 
                onClick={onAuthorClick}
              >
                {discussion.author}
              </span>
              {discussion.authorId && (
                <CustomRoleBadge userId={discussion.authorId} />
              )}
              <span className="text-gray-500 text-sm">• {discussion.createdAt}</span>
            </div>
          </div>
          
          {/* Actions Menu for Author */}
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Content */}
        <div className="mb-4">
          {discussion.title && (
            <h3 className="font-medium text-gray-900 mb-2">
              {discussion.title}
            </h3>
          )}
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {discussion.body}
          </p>
        </div>
        
        {/* Tags */}
        {discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {discussion.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Actions Row */}
        <div className="flex items-center gap-6 text-gray-500">
          <button
            onClick={() => onLike(discussion.id)}
            className={`flex items-center gap-2 hover:text-red-500 transition-colors ${
              discussion.isLiked ? 'text-red-500' : ''
            }`}
          >
            <Heart className={`h-5 w-5 ${discussion.isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{discussion.likesCount}</span>
          </button>
          
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{discussion.repliesCount}</span>
          </button>
        </div>

        {/* Reply Section */}
        {showReplies && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <ReplySection discussionId={discussion.id} />
          </div>
        )}
      </CardContent>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditDiscussionModal
          discussion={{
            id: discussion.id,
            title: discussion.title,
            body: discussion.body,
            tags: discussion.tags
          }}
          onSave={handleEditSave}
          onCancel={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discussion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this discussion? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogFooter>
      </AlertDialog>
    </Card>
  );
};

export default DiscussionCard;
