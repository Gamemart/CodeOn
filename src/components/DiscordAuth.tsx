import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const DiscordAuth = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      console.log('User already authenticated, redirecting...');
      navigate('/');
    }
  }, [user, loading, navigate]);

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Background Image */}
      <div className="lg:flex-1 relative overflow-hidden order-2 lg:order-1 min-h-[300px] lg:min-h-screen">
        <div 
          className="w-full h-full bg-gradient-to-br from-gray-900 to-black dark:from-gray-800 dark:to-gray-900"
          style={{
            backgroundImage: `url('/lovable-uploads/f3f9feb6-dc01-4bc1-abca-c5a830e9626f.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 bg-background text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8 order-1 lg:order-2">
        <div className="w-full max-w-md space-y-8">
          {/* Brand */}
          <div className="text-center lg:text-left">
            <div className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-lg inline-block mb-6">
              ESTRANGHERO
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {authMode === 'login' ? 'Welcome Back' : 'Join ESTRANGHERO'}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              {authMode === 'login' 
                ? 'Sign in to continue your journey with our community.'
                : 'Create an account to join our community and start engaging in discussions.'
              }
            </p>
          </div>

          {/* Auth Form */}
          <AuthForm mode={authMode} onToggleMode={toggleAuthMode} />

          {/* Features */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Why join ESTRANGHERO?</h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Engage in meaningful discussions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Post and earn bounties</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Connect with like-minded people</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Real-time chat and messaging</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordAuth;