
import React, { useState } from 'react';
import { DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

interface CreateBountyProps {
  onSubmit: (bountyData: {
    title: string;
    description: string;
    price: number;
    currency: string;
    tags: string[];
  }) => void;
}

const CreateBounty = ({ onSubmit }: CreateBountyProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userDisplayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User';
  const userInitials = userDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !price.trim()) {
      toast({
        title: "Please fill in all required fields",
        description: "Title, description, and price are required.",
        variant: "destructive"
      });
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        price: priceNumber,
        currency,
        tags: tagsArray
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setCurrency('USD');
      setTags('');
      setIsExpanded(false);

    } catch (error) {
      console.error('Error creating bounty:', error);
      toast({
        title: "Error creating bounty",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCurrency('USD');
    setTags('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden mb-4 w-full">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 flex-shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsExpanded(true)}
              className="flex-1 text-left bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 sm:px-4 py-2 sm:py-3 text-gray-500 text-sm sm:text-base"
            >
              Post a bounty with reward...
            </button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white p-2 sm:p-3 rounded-full"
              onClick={() => setIsExpanded(true)}
            >
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden mb-4 w-full">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 flex-shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Create a Bounty</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Offer a reward for help with your problem</p>
            </div>
          </div>

          {/* Title */}
          <Input
            placeholder="What do you need help with?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm sm:text-base lg:text-lg font-medium"
            required
          />

          {/* Price and Currency */}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-sm sm:text-base"
                min="0"
                step="0.01"
                required
              />
            </div>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24 sm:w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <Textarea
            placeholder="Describe your problem in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-sm sm:text-base lg:text-lg min-h-[80px] sm:min-h-[100px] resize-none"
            required
          />

          {/* Tags */}
          <Input
            placeholder="Add tags (comma separated)..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="text-xs sm:text-sm"
          />

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 text-xs sm:text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
              disabled={isSubmitting || !title.trim() || !description.trim() || !price.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Bounty'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateBounty;
