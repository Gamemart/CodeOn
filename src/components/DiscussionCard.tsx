
import React from 'react';
import { Heart, MessageCircle, Calendar, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ReplySection from './ReplySection';

interface DiscussionCardProps {
  discussion: {
    id: string;
    title: string;
    body: string;
    author: string;
    authorInitials: string;
    createdAt: string;
    tags: string[];
    repliesCount: number;
    likesCount: number;
    isLiked: boolean;
  };
  onReply: () => void;
  onLike: (discussionId: string) => void;
  onAuthorClick?: () => void;
}

const DiscussionCard = ({ discussion, onReply, onLike, onAuthorClick }: DiscussionCardProps) => {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar 
            className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
            onClick={onAuthorClick}
          >
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {discussion.authorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button 
                onClick={onAuthorClick}
                className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                {discussion.author}
              </button>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{discussion.createdAt}</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {discussion.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {discussion.body}
          </p>
        </div>

        {/* Tags */}
        {discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {discussion.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                <Hash className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(discussion.id)}
              className={`flex items-center gap-2 ${
                discussion.isLiked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`h-4 w-4 ${discussion.isLiked ? 'fill-current' : ''}`} />
              <span>{discussion.likesCount}</span>
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            {discussion.repliesCount} {discussion.repliesCount === 1 ? 'reply' : 'replies'}
          </div>
        </div>

        {/* Reply Section */}
        <ReplySection discussionId={discussion.id} />
      </CardContent>
    </Card>
  );
};

export default DiscussionCard;
