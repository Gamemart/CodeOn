
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
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-2xl overflow-hidden mb-6 w-full hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-blue-100">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsExpanded(true)}
              className="flex-1 text-left bg-gray-50 hover:bg-gray-100 transition-all duration-200 rounded-xl px-5 py-4 text-gray-500 font-medium border border-gray-200/50 hover:border-gray-300"
            >
              What do you need help with?
            </button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={() => setIsExpanded(true)}
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Create Bounty
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-2xl overflow-hidden mb-6 w-full">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-blue-100">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-xl">Create a Bounty</h3>
              <p className="text-gray-500">Offer a reward for help with your problem</p>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">What do you need help with?</label>
            <Input
              placeholder="Describe your problem briefly..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl py-3 px-4"
              required
            />
          </div>

          {/* Price and Currency */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Reward Amount</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-8 text-lg font-semibold border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-xl py-3"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-32 border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-xl py-3">
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
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <Textarea
              placeholder="Describe your problem in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-base min-h-32 resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl p-4"
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Tags</label>
            <Input
              placeholder="Add tags (comma separated)..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl py-3 px-4"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-3 font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
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
