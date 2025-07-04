import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import ReplySection from '@/components/ReplySection';
import { useAuth } from '@/hooks/useAuth';

interface Discussion {
  id: string;
  title: string;
  body: string;
  author: string;
  authorId?: string;
  authorInitials: string;
  authorAvatarUrl?: string;
  createdAt: string;
  tags: string[];
  repliesCount: number;
  likesCount: number;
  isLiked: boolean;
  statusMessage?: string;
  image_urls?: string[];
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
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(discussion.body);
  const [editTags, setEditTags] = useState(discussion.tags.join(', '));
  const [showReplies, setShowReplies] = useState(false);
  
  const isAuthor = user?.id === discussion.authorId;

  // Extract image URLs from body content - improved regex to handle Supabase URLs
  const extractImageUrls = (content: string): string[] => {
    const markdownImageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
    const matches = [];
    let match;
    while ((match = markdownImageRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  };

  // Remove image markdown from body for display
  const cleanBodyText = (content: string): string => {
    return content.replace(/!\[.*?\]\(https?:\/\/[^\s)]+\)/g, '').trim();
  };

  const imageUrls = discussion.image_urls || extractImageUrls(discussion.body);
  const cleanBody = cleanBodyText(discussion.body);

  const handleEdit = () => {
    setIsEditing(true);
    setEditBody(discussion.body);
    setEditTags(discussion.tags.join(', '));
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      const tagsArray = editTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      onEdit(discussion.id, {
        title: discussion.title,
        body: editBody,
        tags: tagsArray
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditBody(discussion.body);
    setEditTags(discussion.tags.join(', '));
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(discussion.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleShowReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleCloseReplies = () => {
    setShowReplies(false);
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 dark:border-gray-700 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 w-full">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        {/* Header with author info */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 flex-shrink-0">
              <AvatarImage src={discussion.authorAvatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-medium">
                {discussion.authorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <span 
                  className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-sm sm:text-base lg:text-lg truncate" 
                  onClick={onAuthorClick}
                >
                  {discussion.author}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm whitespace-nowrap">• {discussion.createdAt}</span>
              </div>
              {discussion.statusMessage && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 sm:mt-1 truncate">"{discussion.statusMessage}"</p>
              )}
            </div>
          </div>
          
          {/* Actions Menu */}
          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
                  <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {isAuthor && (
                  <>
                    <DropdownMenuItem onClick={handleEdit} className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={handleSaveEdit}
                size="sm"
                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                disabled={!editBody.trim()}
              >
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                size="sm"
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 border-gray-300 dark:border-gray-600"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="mb-3 sm:mb-4">
          {isEditing ? (
            <div className="space-y-3">
              {/* Body Edit */}
              <Textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Edit your thoughts..."
                className="text-sm sm:text-base lg:text-lg min-h-[80px] resize-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              
              {/* Tags Edit */}
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Edit tags (comma separated)..."
                className="text-xs sm:text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
          ) : (
            <div>
              {/* Display Body */}
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-sm sm:text-base lg:text-lg">
                {cleanBody}
              </p>
              
              {/* Display Images */}
              {imageUrls.length > 0 && (
                <div className={`mt-3 grid gap-2 ${
                  imageUrls.length === 1 ? 'grid-cols-1' :
                  imageUrls.length === 2 ? 'grid-cols-2' :
                  imageUrls.length === 3 ? 'grid-cols-3' :
                  'grid-cols-2 sm:grid-cols-3'
                }`}>
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Discussion image ${index + 1}`} 
                        className="w-full max-h-96 object-contain rounded-lg bg-gray-50 dark:bg-gray-700"
                        onError={(e) => {
                          console.error('Failed to load image:', url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Tags */}
        {!isEditing && discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
            {discussion.tags.map((tag, index) => (
              <span 
                key={index} 
                className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm lg:text-base hover:underline cursor-pointer bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Actions Row */}
        {!isEditing && (
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
              <button
                onClick={() => onLike(discussion.id)}
                className={`flex items-center gap-1 sm:gap-2 hover:text-red-500 transition-colors text-xs sm:text-sm lg:text-base ${
                  discussion.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Heart className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${discussion.isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{discussion.likesCount}</span>
              </button>
              
              <button
                onClick={handleShowReplies}
                className="flex items-center gap-1 sm:gap-2 hover:text-blue-500 transition-colors text-xs sm:text-sm lg:text-base text-gray-500 dark:text-gray-400"
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                <span className="font-medium">{discussion.repliesCount}</span>
              </button>

            </div>
          </div>
        )}

        {/* Reply Section */}
        {showReplies && !isEditing && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
            <ReplySection discussionId={discussion.id} onClose={handleCloseReplies} />
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="w-[90vw] max-w-md mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">Delete Discussion</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this discussion? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default DiscussionCard;