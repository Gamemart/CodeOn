import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface EditDiscussionModalProps {
  discussion: {
    id: string;
    title: string;
    body: string;
    tags: string[];
  };
  onSave: (updates: { title: string; body: string; tags: string[] }) => void;
  onCancel: () => void;
}

const EditDiscussionModal = ({ discussion, onSave, onCancel }: EditDiscussionModalProps) => {
  const [title, setTitle] = useState(discussion.title);
  const [body, setBody] = useState(discussion.body);
  const [tags, setTags] = useState(discussion.tags);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    onSave({ title, body, tags });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="bg-white w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Edit Discussion</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full text-sm sm:text-base"
              />
            </div>

            {/* Content Input */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <Textarea
                id="content"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full min-h-[120px] sm:min-h-[150px] lg:min-h-[200px] resize-none text-sm sm:text-base"
              />
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              
              {/* Existing Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="text-sm sm:text-base"
                    disabled={tags.length >= 5}
                  />
                </div>
                <Button
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 5}
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0 px-3 sm:px-4"
                >
                  <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Add up to 5 tags to help others find your discussion
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-end sm:space-x-3 pt-4 sm:pt-6">
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim() || !body.trim()}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditDiscussionModal;
