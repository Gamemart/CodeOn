
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
                <div className="flex items-center gap-2">
                  <div 
                    className="flex-1 cursor-text"
                    onClick={() => setIsExpanded(true)}
                  >
                    <div className="bg-gray-50/50 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-gray-500 hover:bg-gray-100/50 transition-colors text-sm sm:text-base">
                      What do you need help with?
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsExpanded(true)}
                    className="bg-green-500 hover:bg-green-600 text-white h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full flex-shrink-0"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              ) : (
                <>
                  {/* Title */}
                  <div className="space-y-2">
                    <Input
                      placeholder="What do you need help with?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-base sm:text-lg font-medium border-0 bg-transparent placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base focus:ring-0 focus:outline-none p-0"
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
                        <SelectTrigger className="w-20 sm:w-24 border-gray-300 focus:border-green-500 focus:ring-green-500">
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
                      className="min-h-[120px] sm:min-h-[140px] resize-none border-0 bg-transparent text-base sm:text-lg placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base focus:ring-0 focus:outline-none p-0"
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Add tags (comma separated)..."
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="text-xs sm:text-sm border-0 bg-gray-50 focus:bg-gray-100 transition-colors"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 sm:pt-3 border-t border-gray-100 gap-3 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="text-gray-500 text-sm sm:text-base px-3 sm:px-4"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        size="sm"
                        disabled={isSubmitting || !title.trim() || !description.trim() || !price.trim()}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 rounded-full text-sm sm:text-base"
                      >
                        {isSubmitting ? 'Posting...' : 'Post Bounty'}
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

export default CreateBounty;
