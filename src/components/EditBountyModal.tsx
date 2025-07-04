import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrencySymbol } from '@/utils/currencyUtils';

interface EditBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  bounty: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    status: string;
    tags: string[];
  };
  onUpdate: (bountyId: string, updates: {
    title?: string;
    description?: string;
    price?: number;
    currency?: string;
    tags?: string[];
    status?: string;
  }) => Promise<void>;
}

const EditBountyModal = ({ isOpen, onClose, bounty, onUpdate }: EditBountyModalProps) => {
  const [title, setTitle] = useState(bounty.title);
  const [description, setDescription] = useState(bounty.description);
  const [price, setPrice] = useState(bounty.price.toString());
  const [currency, setCurrency] = useState(bounty.currency);
  const [status, setStatus] = useState(bounty.status);
  const [tags, setTags] = useState(bounty.tags.join(', '));
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      await onUpdate(bounty.id, {
        title,
        description,
        price: parseFloat(price),
        currency,
        status,
        tags: tagsArray
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating bounty:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Bounty</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-gray-700 dark:text-gray-300">
                Price ({getCurrencySymbol(currency)})
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency" className="text-gray-700 dark:text-gray-300">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectItem value="USD" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">USD</SelectItem>
                  <SelectItem value="EUR" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">EUR</SelectItem>
                  <SelectItem value="GBP" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">GBP</SelectItem>
                  <SelectItem value="CAD" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">CAD</SelectItem>
                  <SelectItem value="JPY" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">JPY</SelectItem>
                  <SelectItem value="AUD" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">AUD</SelectItem>
                  <SelectItem value="CHF" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">CHF</SelectItem>
                  <SelectItem value="BTC" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">BTC</SelectItem>
                  <SelectItem value="ETH" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <SelectItem value="open" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Open</SelectItem>
                <SelectItem value="in_progress" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">In Progress</SelectItem>
                <SelectItem value="completed" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Completed</SelectItem>
                <SelectItem value="cancelled" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="tags" className="text-gray-700 dark:text-gray-300">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, javascript, web development"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? 'Updating...' : 'Update Bounty'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBountyModal;