import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getDiscordOAuthConfig } from '@/lib/supabase-config';
import AuthForm from '@/components/AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: { name: string; email: string }) => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  const handleGoToAuth = () => {
    onClose();
    navigate('/auth');
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <AuthForm mode={authMode} onToggleMode={toggleAuthMode} />
        
        <div className="text-center mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;