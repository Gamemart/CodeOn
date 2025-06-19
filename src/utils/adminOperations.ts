
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const updateUserRole = async (userId: string, newRole: 'user' | 'moderator' | 'admin', currentUserId: string) => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: newRole,
        assigned_by: currentUserId
      });

    if (error) throw error;

    toast({
      title: "Role updated",
      description: "User role has been updated successfully"
    });

    return true;
  } catch (error: any) {
    toast({
      title: "Error updating role",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

export const moderateUser = async (userId: string, action: 'ban' | 'mute', currentUserId: string, reason?: string) => {
  try {
    const { error } = await supabase
      .from('user_moderation')
      .insert({
        user_id: userId,
        moderator_id: currentUserId,
        action_type: action,
        reason: reason || null
      });

    if (error) throw error;

    toast({
      title: `User ${action}ned`,
      description: `User has been ${action}ned successfully`
    });

    return true;
  } catch (error: any) {
    toast({
      title: "Error moderating user",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

export const createCustomRole = async (name: string, description: string, color: string, currentUserId: string) => {
  if (!name.trim()) return false;

  try {
    const { error } = await supabase
      .from('custom_roles')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        color: color,
        created_by: currentUserId
      });

    if (error) throw error;

    toast({
      title: "Role created",
      description: `Custom role "${name}" has been created`
    });

    return true;
  } catch (error: any) {
    toast({
      title: "Error creating role",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

export const deactivateModerationAction = async (actionId: string) => {
  try {
    const { error } = await supabase
      .from('user_moderation')
      .update({ is_active: false })
      .eq('id', actionId);

    if (error) throw error;

    toast({
      title: "Action deactivated",
      description: "Moderation action has been deactivated"
    });

    return true;
  } catch (error: any) {
    toast({
      title: "Error deactivating action",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};
