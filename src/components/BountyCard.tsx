
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
      <Card className="bg-slate-800 text-white border-slate-700 rounded-xl overflow-hidden mb-4 w-full">
        <CardContent className="p-4 sm:p-6">
          {/* Header with price, status, and actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold">
                ${bounty.price}
              </span>
              {bounty.currency !== 'USD' && (
                <span className="text-sm text-gray-400 uppercase">
                  {bounty.currency}
                </span>
              )}
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-red-600 focus:text-red-600"
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
          <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-white">
            {bounty.title}
          </h3>

          {/* Description */}
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 line-clamp-3">
            {bounty.description}
          </p>

          {/* Tags */}
          {bounty.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {bounty.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-blue-400 text-xs sm:text-sm hover:underline cursor-pointer bg-blue-900/20 px-2 py-1 rounded-full border border-blue-800"
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
                  className="font-medium text-white cursor-pointer hover:text-blue-400 text-sm sm:text-base"
                  onClick={onAuthorClick}
                >
                  {bounty.author}
                </span>
                <span className="text-gray-400 text-xs sm:text-sm">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bounty</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bounty? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BountyCard;
