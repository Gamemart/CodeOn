
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilterByTag: (tag: string) => void;
  activeFilters: string[];
  onRemoveFilter: (tag: string) => void;
  popularTags: string[];
}

const SearchAndFilter = ({ 
  onSearch, 
  onFilterByTag, 
  activeFilters, 
  onRemoveFilter, 
  popularTags 
}: SearchAndFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            {activeFilters.length > 0 && (
              <span className="text-sm text-gray-500">
                {activeFilters.length} filter{activeFilters.length > 1 ? 's' : ''} active
              </span>
            )}
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge 
                  key={filter}
                  variant="default"
                  className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                  onClick={() => onRemoveFilter(filter)}
                >
                  #{filter}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          {/* Filter Options */}
          {showFilters && (
            <div className="space-y-3 pt-2 border-t border-blue-200">
              <h4 className="font-medium text-gray-700">Popular Tags</h4>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge 
                    key={tag}
                    variant="secondary"
                    className={`cursor-pointer transition-colors ${
                      activeFilters.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-50'
                    }`}
                    onClick={() => {
                      if (activeFilters.includes(tag)) {
                        onRemoveFilter(tag);
                      } else {
                        onFilterByTag(tag);
                      }
                    }}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchAndFilter;
