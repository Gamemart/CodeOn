
import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CustomRoleBadge from '@/components/CustomRoleBadge';

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
  onReply: (discussionId: string) => void;
  onLike: (discussionId: string) => void;
}

const DiscussionCard = ({ discussion, onReply, onLike }: DiscussionCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm border border-white/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {discussion.authorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{discussion.author}</span>
            {discussion.authorId && (
              <CustomRoleBadge userId={discussion.authorId} />
            )}
            <span className="text-sm text-gray-500">• {discussion.createdAt}</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {discussion.title}
        </h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-700 mb-4 leading-relaxed">{discussion.body}</p>
        
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
          <div className="flex items-center gap-4">
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
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(discussion.id)}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{discussion.repliesCount}</span>
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
      </CardContent>
    </Card>
  );
};

export default DiscussionCard;
