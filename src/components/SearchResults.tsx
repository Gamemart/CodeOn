
import React from 'react';
import { X, User, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  type: 'discussion' | 'user';
  id: string;
  title?: string;
  body?: string;
  author?: string;
  authorId?: string;
  username?: string;
  fullName?: string;
  createdAt?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  onClose: () => void;
}

const SearchResults = ({ results, loading, onClose }: SearchResultsProps) => {
  const navigate = useNavigate();

  const handleDiscussionClick = (discussionId: string) => {
    // For now, just close search. In the future, you could navigate to individual discussion
    onClose();
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                className="p-3 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors cursor-pointer"
                onClick={() => 
                  result.type === 'discussion' 
                    ? handleDiscussionClick(result.id)
                    : handleUserClick(result.id)
                }
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {result.type === 'discussion' ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
                          {(result.fullName || result.username || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {result.type === 'discussion' ? (
                      <>
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {result.title}
                        </h4>
                        <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                          {result.body}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          by {result.author} • {result.createdAt}
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {result.fullName || result.username}
                        </h4>
                        {result.username && result.fullName && (
                          <p className="text-gray-500 text-xs">@{result.username}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">Profile</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No results found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchResults;
