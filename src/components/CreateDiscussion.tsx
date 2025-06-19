
import React, { useState, useRef } from 'react';
import { Plus, X, Tag, Smile, Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface CreateDiscussionProps {
  onSubmit: (discussion: {
    title: string;
    body: string;
    tags: string[];
    images?: File[];
  }) => void;
}

const CreateDiscussion = ({ onSubmit }: CreateDiscussionProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDisplayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User';
  const userInitials = userDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (selectedImages.length + files.length > 10) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 10 images per post.",
        variant: "destructive"
      });
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach(file => {
      // Check file type
      const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format.`,
          variant: "destructive"
        });
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB.`,
          variant: "destructive"
        });
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      toast({
        title: "Please write something",
        description: "Your post needs some content.",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      title: title.trim() || 'Untitled Discussion',
      body: body.trim(),
      tags,
      images: selectedImages.length > 0 ? selectedImages : undefined
    });

    // Reset form
    setTitle('');
    setBody('');
    setTags([]);
    setTagInput('');
    setSelectedImages([]);
    setImagePreviews([]);
    setIsExpanded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-start gap-2 sm:gap-4">
          <Avatar className="h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {!isExpanded ? (
                <div 
                  className="cursor-text"
                  onClick={() => setIsExpanded(true)}
                >
                  <div className="bg-gray-50/50 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-gray-500 hover:bg-gray-100/50 transition-colors text-sm sm:text-base">
                    What's on your mind right now?
                  </div>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Add a title for your discussion..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-base sm:text-lg font-medium border-0 bg-transparent focus:ring-0 focus:outline-none p-0 placeholder:text-gray-400"
                  />

                  <Textarea
                    placeholder="Share your thoughts..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-[120px] sm:min-h-[140px] resize-none border-0 bg-transparent text-base sm:text-lg placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base focus:ring-0 focus:outline-none p-0"
                    autoFocus
                  />

                  {/* Image Grid Display */}
                  {imagePreviews.length > 0 && (
                    <div className={`grid gap-2 ${
                      imagePreviews.length === 1 ? 'grid-cols-1' :
                      imagePreviews.length === 2 ? 'grid-cols-2' :
                      imagePreviews.length === 3 ? 'grid-cols-3' :
                      'grid-cols-2 sm:grid-cols-3'
                    }`}>
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-32 sm:h-40 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 h-6 w-6 p-0 bg-black/50 text-white hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="bg-blue-50 text-blue-700 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm cursor-pointer hover:bg-blue-100 flex items-center"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          #{tag}
                          <X className="h-3 w-3 ml-1 inline" />
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 sm:pt-3 border-t border-gray-100 gap-3 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <Button type="button" variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2">
                        <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
                        multiple
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 hover:text-blue-600 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                        disabled={selectedImages.length >= 10}
                      >
                        <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <div className="flex-1 sm:flex-initial">
                        <Input
                          placeholder="Add tags..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          className="text-xs sm:text-sm border-0 bg-gray-50 focus:bg-gray-100 transition-colors w-full sm:w-32 h-8 sm:h-9"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsExpanded(false)}
                        className="text-gray-500 text-sm sm:text-base px-3 sm:px-4"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        size="sm"
                        disabled={!body.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 rounded-full text-sm sm:text-base"
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateDiscussion;
