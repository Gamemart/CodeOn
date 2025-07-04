import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EditBountyModal from '@/components/EditBountyModal';
import { formatCurrency } from '@/utils/currencyUtils';

interface Bounty {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  author: string;
  authorId?: string;
  authorInitials: string;
  authorAvatarUrl?: string;
  createdAt: string;
  status: string;
  tags: string[];
}

interface BountyCardProps {
  bounty: Bounty;
  onAuthorClick?: () => void;
  onEdit?: (bountyId: string, updates: any) => Promise<void>;
  onDelete?: (bountyId: string) => Promise<void>;
}

const BountyCard = ({ bounty, onAuthorClick, onEdit, onDelete }: BountyCardProps) => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isOwner = user && bounty.authorId === user.id;

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(bounty.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleEdit = async (bountyId: string, updates: any) => {
    if (onEdit) {
      await onEdit(bountyId, updates);
    }
  };

  return (
    <>
      <Card className="bg-card border-border rounded-xl overflow-hidden mb-4 w-full shadow-lg">
        <CardContent className="p-4 sm:p-6">
          {/* Header with price, status, and actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {formatCurrency(bounty.price, bounty.currency)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                {bounty.status}
              </Badge>
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => setIsEditModalOpen(true)}
                      className="cursor-pointer"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-foreground">
            {bounty.title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 line-clamp-3">
            {bounty.description}
          </p>

          {/* Tags */}
          {bounty.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {bounty.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-primary text-xs sm:text-sm hover:underline cursor-pointer bg-primary/10 px-2 py-1 rounded-full border border-primary/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src={bounty.authorAvatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                  {bounty.authorInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span 
                  className="font-medium text-foreground cursor-pointer hover:text-primary text-sm sm:text-base"
                  onClick={onAuthorClick}
                >
                  {bounty.author}
                </span>
                <span className="text-muted-foreground text-xs sm:text-sm">
                  {bounty.createdAt}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditModalOpen && (
        <EditBountyModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          bounty={bounty}
          onUpdate={handleEdit}
        />
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Delete Bounty</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this bounty? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BountyCard;