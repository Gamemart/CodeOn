
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface CustomRoleBadgeProps {
  userId: string;
  className?: string;
}

interface CustomRole {
  name: string;
  color: string;
}

const CustomRoleBadge = ({ userId, className = "" }: CustomRoleBadgeProps) => {
  const [customRole, setCustomRole] = useState<CustomRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomRole();
  }, [userId]);

  const fetchCustomRole = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_custom_role', {
        user_uuid: userId
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setCustomRole(data[0]);
      }
    } catch (error) {
      console.error('Error fetching custom role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !customRole) {
    return null;
  }

  return (
    <Badge 
      className={`text-xs px-2 py-1 ${className}`}
      style={{ 
        backgroundColor: customRole.color,
        color: '#ffffff',
        border: `1px solid ${customRole.color}`
      }}
    >
      {customRole.name}
    </Badge>
  );
};

export default CustomRoleBadge;
