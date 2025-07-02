
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
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsExpanded(true)}
              className="flex-1 text-left bg-gray-50 hover:bg-gray-100 transition-colors rounded-full px-4 py-3 text-gray-500 border border-gray-200"
            >
              What do you need help with?
            </button>
            <Button
              onClick={() => setIsExpanded(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Create Bounty
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">Create a Bounty</h3>
              <p className="text-sm text-gray-500">Offer a reward for help with your problem</p>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Input
              placeholder="What do you need help with?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Price and Currency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Reward Amount</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-8 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-24 border-gray-300 focus:border-green-500 focus:ring-green-500">
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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your problem in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Input
              placeholder="Add tags (comma separated)..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
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
