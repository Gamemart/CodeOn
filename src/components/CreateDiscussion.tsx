
import React, { useState } from 'react';
import { Plus, X, Tag, Send } from 'lucide-react';
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
  };

  if (!isOpen) {
    return (
      <Card 
        className="border-2 border-dashed border-purple-200 hover:border-purple-300 transition-colors cursor-pointer bg-transparent shadow-none" 
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-4 shadow-lg">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-xl">Start a Discussion</h3>
            <p className="text-gray-600">Share your thoughts with the community</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">Create New Discussion</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 p-0 bg-white/50 hover:bg-white/70 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              placeholder="What's on your mind? Enter a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-0 bg-white/50 focus:bg-white/70 rounded-2xl h-12 text-lg font-medium placeholder:text-gray-500"
            />
          </div>
          
          <div>
            <Textarea
              placeholder="Share your thoughts, ask questions, or start a conversation..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[120px] border-0 bg-white/50 focus:bg-white/70 rounded-2xl text-lg resize-none placeholder:text-gray-500"
            />
          </div>
          
          <div>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Add tags (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="pl-12 border-0 bg-white/50 focus:bg-white/70 rounded-2xl h-12"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                className="bg-white/50 hover:bg-white/70 border-0 rounded-2xl px-6"
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
                    className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 cursor-pointer hover:from-purple-200 hover:to-pink-200 border-0 rounded-full px-3 py-1"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    #{tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-2xl px-8 py-3 shadow-lg"
            >
              <Send className="h-4 w-4 mr-2" />
              Post Discussion
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="bg-white/50 hover:bg-white/70 border-0 rounded-2xl px-6"
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
