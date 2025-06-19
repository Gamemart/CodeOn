
import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
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
              <span className="text-sm text-gray-500">• {discussion.createdAt}</span>
            </div>
          </div>
          
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
        
        <h3 className="text-lg font-semibold text-gray-900 mt-2">
          {discussion.title}
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">
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
        
        <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(discussion.id)}
            className={`flex items-center gap-2 p-0 h-auto ${
              discussion.isLiked ? 'text-red-500' : 'text-gray-500'
            } hover:text-red-500`}
          >
            <Heart className={`h-4 w-4 ${discussion.isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{discussion.likesCount}</span>
          </Button>
          
          <div className="flex items-center gap-2 text-gray-500">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{discussion.repliesCount} replies</span>
          </div>
        </div>

        <ReplySection discussionId={discussion.id} />
      </CardContent>

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
