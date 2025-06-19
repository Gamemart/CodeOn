
import React, { useState } from 'react';
import { Heart, Share2, Edit, Trash2, MoreHorizontal } from 'lucide-react';
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
    <Card className="hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm border border-white/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {discussion.authorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
              <span 
                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 truncate" 
                onClick={onAuthorClick}
              >
                {discussion.author}
              </span>
              {discussion.authorId && (
                <CustomRoleBadge userId={discussion.authorId} />
              )}
              <span className="text-sm text-gray-500 whitespace-nowrap">• {discussion.createdAt}</span>
            </div>
          </div>
          
          {/* Actions Menu for Author */}
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
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
        
        <h3 className="text-lg font-semibold text-gray-900 leading-tight break-words">
          {discussion.title}
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap break-words">
          {discussion.body}
        </p>
        
        {discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {discussion.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(discussion.id)}
              className={`flex items-center gap-1 ${
                discussion.isLiked ? 'text-red-500' : 'text-gray-500'
              } hover:text-red-500`}
            >
              <Heart className={`h-4 w-4 ${discussion.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{discussion.likesCount}</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Reply Section */}
        <ReplySection discussionId={discussion.id} />
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
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default DiscussionCard;
