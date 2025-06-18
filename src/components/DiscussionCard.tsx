
import React, { useState } from 'react';
import { MessageCircle, Heart, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ReplySection from './ReplySection';

interface Discussion {
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
}

interface DiscussionCardProps {
  discussion: Discussion;
  onReply: (discussionId: string) => void;
  onLike: (discussionId: string) => void;
}

const DiscussionCard = ({ discussion, onReply, onLike }: DiscussionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const handleReplyClick = () => {
    setShowReplies(!showReplies);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-blue-100">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {discussion.authorInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {discussion.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{discussion.author}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{discussion.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className={`text-gray-700 leading-relaxed ${!isExpanded && discussion.body.length > 200 ? 'line-clamp-3' : ''}`}>
          {discussion.body}
        </p>
        
        {discussion.body.length > 200 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 transition-colors"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          {discussion.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              #{tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(discussion.id)}
              className={`flex items-center gap-2 hover:bg-red-50 ${discussion.isLiked ? 'text-red-600' : 'text-gray-600'}`}
            >
              <Heart className={`h-4 w-4 ${discussion.isLiked ? 'fill-current' : ''}`} />
              <span>{discussion.likesCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReplyClick}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{discussion.repliesCount} replies</span>
            </Button>
          </div>
        </div>

        {showReplies && (
          <ReplySection discussionId={discussion.id} />
        )}
      </CardContent>
    </Card>
  );
};

export default DiscussionCard;
