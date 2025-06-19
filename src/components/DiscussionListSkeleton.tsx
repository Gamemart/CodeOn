
import React from 'react';
import CreateDiscussionSkeleton from './CreateDiscussionSkeleton';
import DiscussionCardSkeleton from './DiscussionCardSkeleton';

const DiscussionListSkeleton = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 space-y-4">
      <CreateDiscussionSkeleton />
      {Array.from({ length: 3 }, (_, index) => (
        <DiscussionCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default DiscussionListSkeleton;
