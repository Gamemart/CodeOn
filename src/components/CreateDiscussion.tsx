
import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface CreateDiscussionProps {
  onSubmit: (discussion: {
    title: string;
    body: string;
    tags: string[];
  }) => void;
}

const CreateDiscussion = ({ onSubmit }: CreateDiscussionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Title and body are required to create a discussion.",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      title: title.trim(),
      body: body.trim(),
      tags
    });

    // Reset form
    setTitle('');
    setBody('');
    setTags([]);
    setTagInput('');
    setIsOpen(false);
    
    toast({
      title: "Discussion created!",
      description: "Your discussion has been posted successfully."
    });
  };

  if (!isOpen) {
    return (
      <Card className="border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setIsOpen(true)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Start a Discussion</h3>
            <p className="text-gray-500 text-sm">Share your thoughts with the community</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">Create New Discussion</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Discussion title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          
          <div>
            <Textarea
              placeholder="What's on your mind? Share your thoughts, ask questions, or start a conversation..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[120px] border-gray-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
            />
          </div>
          
          <div>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Add tags (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5}
              >
                Add
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    #{tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            >
              Post Discussion
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateDiscussion;
