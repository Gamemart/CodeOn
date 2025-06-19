
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const DiscussionCardSkeleton = () => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 w-full">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        {/* Header with author info */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full flex-shrink-0" />
            <div className="flex flex-col min-w-0 flex-1 gap-1">
              <div className="flex items-center gap-1 sm:gap-2">
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                <Skeleton className="h-3 w-12 sm:w-16" />
                <Skeleton className="h-3 w-16 sm:w-20" />
              </div>
              <Skeleton className="h-3 w-32 sm:w-40" />
            </div>
          </div>
          <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded flex-shrink-0" />
        </div>
        
        {/* Content */}
        <div className="mb-3 sm:mb-4">
          <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        
        {/* Actions Row */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionCardSkeleton;
