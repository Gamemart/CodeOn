
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CreateDiscussionSkeleton = () => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-start gap-2 sm:gap-4">
          <Skeleton className="h-8 w-8 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-10 sm:h-12 w-full rounded-lg sm:rounded-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateDiscussionSkeleton;
