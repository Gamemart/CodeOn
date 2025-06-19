
import React from 'react';
import { Shield, Ban, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ModerationAction {
  id: string;
  user_id: string;
  action_type: string;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
  username: string | null;
  full_name: string | null;
}

interface ModerationTabProps {
  moderationActions: ModerationAction[];
  onDeactivateAction: (actionId: string) => void;
}

const ModerationTab = ({ moderationActions, onDeactivateAction }: ModerationTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Active Moderation Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {moderationActions.map((action) => {
            const displayName = action.full_name || action.username || 'Anonymous User';
            
            return (
              <div key={action.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Badge variant={action.action_type === 'ban' ? 'destructive' : 'default'}>
                    {action.action_type === 'ban' ? (
                      <Ban className="h-3 w-3 mr-1" />
                    ) : (
                      <VolumeX className="h-3 w-3 mr-1" />
                    )}
                    {action.action_type}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{displayName}</p>
                    {action.reason && (
                      <p className="text-sm text-gray-500 truncate">Reason: {action.reason}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(action.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeactivateAction(action.id)}
                  className="sm:w-auto w-full"
                >
                  Deactivate
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModerationTab;
