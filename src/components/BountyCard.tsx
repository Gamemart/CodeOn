
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
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
  const { userRole } = useUserRoles();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const isOwner = user && bounty.authorId === user.id;
  const canEdit = isOwner;
  const canDelete = isOwner || userRole === 'admin' || userRole === 'moderator';

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
      <Card className="bg-slate-800 text-white border-slate-700 rounded-xl overflow-hidden mb-3 sm:mb-4 w-full">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          {/* Header with price, status, and actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold">
                ${bounty.price}
              </span>
              {bounty.currency !== 'USD' && (
                <span className="text-xs sm:text-sm text-gray-400 uppercase">
                  {bounty.currency}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2 justify-between sm:justify-end">
              <Badge 
                className="bg-green-600 hover:bg-green-700 text-white border-green-600 text-xs sm:text-sm"
              >
                {bounty.status}
              </Badge>
              {(canEdit || canDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-slate-700/50 rounded-full transition-colors"
                    >
                      <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                    {canEdit && (
                      <DropdownMenuItem 
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-gray-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem 
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-red-400 hover:bg-red-900/20 hover:text-red-300 focus:bg-red-900/20 focus:text-red-300 cursor-pointer"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 text-white break-words">
            {bounty.title}
          </h3>

          {/* Description */}
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 line-clamp-3 break-words">
            {bounty.description}
          </p>

          {/* Tags */}
          {bounty.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
              {bounty.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-blue-400 text-xs sm:text-sm hover:underline cursor-pointer bg-blue-900/20 px-2 py-1 rounded-full border border-blue-800 break-all"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 flex-shrink-0">
                <AvatarImage src={bounty.authorAvatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-medium">
                  {bounty.authorInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span 
                  className="font-medium text-white cursor-pointer hover:text-blue-400 text-xs sm:text-sm lg:text-base truncate"
                  onClick={onAuthorClick}
                >
                  {bounty.author}
                </span>
                <span className="text-gray-400 text-xs sm:text-sm truncate">
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
        <AlertDialogContent className="w-[90vw] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Delete Bounty</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              Are you sure you want to delete this bounty? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BountyCard;
