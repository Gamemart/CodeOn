
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Bounty {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  author: string;
  authorId?: string;
  authorInitials: string;
  authorAvatarUrl?: string;
  createdAt: string;
  status: string;
  tags: string[];
}

interface BountyCardProps {
  bounty: Bounty;
  onAuthorClick?: () => void;
}

const BountyCard = ({ bounty, onAuthorClick }: BountyCardProps) => {
  return (
    <Card className="bg-slate-800 text-white border-slate-700 rounded-xl overflow-hidden mb-4 w-full">
      <CardContent className="p-4 sm:p-6">
        {/* Header with price and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-bold">
              ${bounty.price}
            </span>
            {bounty.currency !== 'USD' && (
              <span className="text-sm text-gray-400 uppercase">
                {bounty.currency}
              </span>
            )}
          </div>
          <Badge 
            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
          >
            {bounty.status}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-white">
          {bounty.title}
        </h3>

        {/* Description */}
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 line-clamp-3">
          {bounty.description}
        </p>

        {/* Tags */}
        {bounty.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {bounty.tags.map((tag, index) => (
              <span 
                key={index}
                className="text-blue-400 text-xs sm:text-sm hover:underline cursor-pointer bg-blue-900/20 px-2 py-1 rounded-full border border-blue-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage src={bounty.authorAvatarUrl} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
              {bounty.authorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span 
              className="font-medium text-white cursor-pointer hover:text-blue-400 text-sm sm:text-base"
              onClick={onAuthorClick}
            >
              {bounty.author}
            </span>
            <span className="text-gray-400 text-xs sm:text-sm">
              {bounty.createdAt}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BountyCard;
