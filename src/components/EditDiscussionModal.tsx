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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <Card className="bg-white w-full max-w-md max-h-[85vh] overflow-y-auto">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Edit Discussion</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full"
              />
            </div>

            {/* Content Input */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <Textarea
                id="content"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full min-h-[100px] resize-none"
              />
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (Optional)
              </label>
              
              {/* Existing Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1"
                  disabled={tags.length >= 5}
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 5}
                  size="sm"
                  variant="outline"
                  className="px-3"
                >
                  <Tag className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                Add up to 5 tags to help others find your discussion
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim() || !body.trim()}
                className="flex-1"
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
